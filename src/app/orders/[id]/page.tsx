"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Send,
  Lock,
  MessageSquare,
  RefreshCw,
  User,
  Zap,
  AlertCircle,
  RotateCcw,
  CheckCheck,
  Copy,
  Check,
  ChevronDown,
  Unlock,
  X,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatOrderNumber } from "@/lib/utils";

// ===================================================================
// DEAL RECORD (Supabase'dagi orders qatoridan hosil qilinadi)
// ===================================================================
type ViewerSide = "buyer" | "seller" | "admin";

interface DealRecord {
  id: string;
  order_number: string;
  listing_id: string;
  listing_title: string;
  listing_platform: string;
  listing_rating?: number;
  price: number;
  platform_fee: number;
  seller_earnings: number;
  payment_method: string;
  status:
    | "paid"
    | "seller_joined"
    | "delivered"
    | "completed"
    | "disputed"
    | "refunded";
  buyer_id: string;
  buyer_name: string;
  seller_id: string;
  seller_name: string;
  seller_telegram: string;
  seller_joined: boolean;
  created_at: string;
  expires_at: string; // tasdiqlash uchun 3 soatlik muddat
  auto_refund_at: string; // sotuvchi kirishi uchun 1.5 soatlik muddat
}

interface ChatMessage {
  id: string;
  sender: "buyer" | "seller" | "system";
  senderName: string;
  content: string;
  type: "text" | "system" | "credentials";
  timestamp: string;
  isRead?: boolean;
}

interface OrderMessageRow {
  id: string;
  order_id: string;
  sender_id: string | null;
  kind: "text" | "system";
  content: string;
  created_at: string;
}

const UZS_RATE = 13000;
const AUTO_REFUND_MS = 90 * 60 * 1000;
const CONFIRM_WINDOW_MS = 3 * 3600 * 1000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDeal(row: any): DealRecord {
  const price = Number(row.price);
  const sellerJoined = !!row.seller_joined_at || row.status !== "paid";
  const confirmFrom = row.delivered_at ?? row.created_at;
  return {
    id: row.id,
    order_number: formatOrderNumber(row.id),
    listing_id: row.listing_id,
    listing_title: row.listing?.title ?? "eFootball Akkaunt",
    listing_platform: row.listing?.platform ?? "mobile",
    listing_rating: row.listing?.team_rating ?? undefined,
    price,
    platform_fee: Math.round(price * 0.05 * 100) / 100,
    seller_earnings: Math.round(price * 0.95 * 100) / 100,
    payment_method: row.payment_method ?? "payme",
    status: row.status === "paid" && row.seller_joined_at ? "seller_joined" : row.status,
    buyer_id: row.buyer_id,
    buyer_name: row.buyer?.full_name ?? "Xaridor",
    seller_id: row.seller_id,
    seller_name: row.seller?.full_name ?? "Sotuvchi",
    seller_telegram: row.seller?.telegram_username ?? "",
    seller_joined: sellerJoined,
    created_at: row.created_at,
    expires_at: new Date(new Date(confirmFrom).getTime() + CONFIRM_WINDOW_MS).toISOString(),
    auto_refund_at: new Date(new Date(row.created_at).getTime() + AUTO_REFUND_MS).toISOString(),
  };
}

function formatTime(ms: number) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "Hozir";
  if (s < 3600) return `${Math.floor(s / 60)} daqiqa oldin`;
  if (s < 86400) return `${Math.floor(s / 3600)} soat oldin`;
  return `${Math.floor(s / 86400)} kun oldin`;
}

export default function DealRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sbRef = useRef<ReturnType<typeof createClient> | null>(null);

  const [orderId, setOrderId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [viewerSide, setViewerSide] = useState<ViewerSide>("buyer");
  const [deal, setDeal] = useState<DealRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Timers
  const [confirmMsLeft, setConfirmMsLeft] = useState(0); // 3h confirm timer
  const [refundMsLeft, setRefundMsLeft] = useState(0); // 1.5h auto-refund timer

  // Modals & Actions
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewSent, setReviewSent] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [actionError, setActionError] = useState("");

  // Copied
  const [copied, setCopied] = useState(false);

  const sellerJoined = deal?.seller_joined ?? false;

  // ─── Xabar qatorini UI formatiga o'tkazish ──────────────────────
  const toChatMessage = useCallback(
    (row: OrderMessageRow, d: DealRecord, me: string): ChatMessage => {
      if (row.kind === "system" || !row.sender_id) {
        return {
          id: row.id,
          sender: "system",
          senderName: "EFZone Tizimi",
          content: row.content,
          type: "system",
          timestamp: row.created_at,
        };
      }
      const side = row.sender_id === d.buyer_id ? "buyer" : "seller";
      const name = side === "buyer" ? d.buyer_name : d.seller_name;
      return {
        id: row.id,
        sender: side,
        senderName: row.sender_id === me ? "Siz" : name,
        content: row.content,
        type: "text",
        timestamp: row.created_at,
      };
    },
    []
  );

  // ─── Buyurtmani bazadan yuklash ──────────────────────────────────
  const loadOrder = useCallback(async (id: string) => {
    const sb = sbRef.current;
    if (!sb) return null;
    const { data, error } = await sb
      .from("orders")
      .select(
        "*, listing:listings(title, platform, team_rating), seller:profiles!seller_id(full_name, telegram_username), buyer:profiles!buyer_id(full_name)"
      )
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const mapped = toDeal(data);
    setDeal(mapped);
    return { deal: mapped, raw: data };
  }, []);

  const loadMessages = useCallback(
    async (d: DealRecord, me: string) => {
      const sb = sbRef.current;
      if (!sb) return;
      const { data } = await sb
        .from("order_messages")
        .select("*")
        .eq("order_id", d.id)
        .order("created_at", { ascending: true });
      setMessages(((data ?? []) as OrderMessageRow[]).map((r) => toChatMessage(r, d, me)));
    },
    [toChatMessage]
  );

  // ─── Init: sessiya, buyurtma, xabarlar ──────────────────────────
  useEffect(() => {
    const init = async () => {
      const { id } = await params;
      setOrderId(id);

      try {
        const sb = createClient();
        sbRef.current = sb;

        const {
          data: { user },
        } = await sb.auth.getUser();
        if (!user) {
          router.push(`/auth/login?next=${encodeURIComponent(`/orders/${id}`)}`);
          return;
        }
        setUserId(user.id);

        const loaded = await loadOrder(id);
        if (!loaded) {
          // Topilmadi yoki bu buyurtmani ko'rishga ruxsat yo'q (RLS)
          router.push("/profile");
          return;
        }

        const side: ViewerSide =
          loaded.raw.buyer_id === user.id ? "buyer" : loaded.raw.seller_id === user.id ? "seller" : "admin";
        setViewerSide(side);

        // Sotuvchi xonani birinchi marta ochganda "qo'shildi" deb belgilanadi
        if (side === "seller" && loaded.raw.status === "paid" && !loaded.raw.seller_joined_at) {
          await sb.rpc("order_seller_join", { p_order_id: id });
          const refreshed = await loadOrder(id);
          await loadMessages(refreshed?.deal ?? loaded.deal, user.id);
        } else {
          await loadMessages(loaded.deal, user.id);
        }
      } catch (err) {
        console.error("Deal room init error:", err);
        router.push("/listings");
        return;
      }
      setLoading(false);
    };
    init();
  }, [params, router, loadOrder, loadMessages]);

  // ─── Realtime: yangi xabarlar va status o'zgarishlari ──────────
  const dealRef = useRef<DealRecord | null>(null);
  useEffect(() => {
    dealRef.current = deal;
  }, [deal]);

  useEffect(() => {
    const sb = sbRef.current;
    if (!sb || !orderId || !userId) return;

    const channel = sb
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_messages", filter: `order_id=eq.${orderId}` },
        (payload) => {
          const d = dealRef.current;
          if (!d) return;
          const msg = toChatMessage(payload.new as OrderMessageRow, d, userId);
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        () => {
          loadOrder(orderId);
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [orderId, userId, loadOrder, toChatMessage]);

  // ─── Countdown timers ───────────────────────────────────────────
  useEffect(() => {
    if (!deal) return;
    const tick = setInterval(() => {
      const now = Date.now();
      const confirmLeft = new Date(deal.expires_at).getTime() - now;
      const refundLeft = new Date(deal.auto_refund_at).getTime() - now;
      setConfirmMsLeft(Math.max(0, confirmLeft));
      setRefundMsLeft(Math.max(0, refundLeft));
    }, 1000);
    return () => clearInterval(tick);
  }, [deal]);

  // ─── Auto-scroll chat ────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Send message ────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const content = newMessage.trim();
    const sb = sbRef.current;
    if (!content || sending || !sb || !deal) return;
    setSending(true);
    setActionError("");

    const { data, error } = await sb
      .from("order_messages")
      .insert({ order_id: deal.id, sender_id: userId, kind: "text", content: content.slice(0, 2000) })
      .select()
      .single();

    if (error || !data) {
      setActionError("Xabar yuborilmadi. Bitim yopilgan bo'lishi mumkin.");
    } else {
      const msg = toChatMessage(data as OrderMessageRow, deal, userId);
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      setNewMessage("");
    }
    setSending(false);
    inputRef.current?.focus();
  }, [newMessage, sending, deal, userId, toChatMessage]);

  // ─── Copy helper ─────────────────────────────────────────────────
  const copyText = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Escrow harakatlari (bazadagi RPC'lar orqali) ───────────────
  const runOrderAction = async (fn: string, args: Record<string, unknown>) => {
    const sb = sbRef.current;
    if (!deal || !sb) return false;
    setActionProcessing(true);
    setActionError("");
    const { error } = await sb.rpc(fn, { p_order_id: deal.id, ...args });
    if (error) {
      setActionError(error.message || "Amalni bajarib bo'lmadi");
      setActionProcessing(false);
      return false;
    }
    const refreshed = await loadOrder(deal.id);
    await loadMessages(refreshed?.deal ?? deal, userId);
    setActionProcessing(false);
    return true;
  };

  // Modallar natijadan qat'i nazar yopiladi, xato bo'lsa yon paneldagi ogohlantirishda ko'rinadi

  // CONFIRM: Release escrow to seller
  const handleConfirm = async () => {
    await runOrderAction("order_confirm", {});
    setShowConfirmModal(false);
  };

  // DISPUTE: Freeze escrow, notify admin
  const handleDispute = async () => {
    if (!disputeReason.trim()) return;
    if (await runOrderAction("order_dispute", { p_reason: disputeReason.trim() })) {
      setDisputeReason("");
    }
    setShowDisputeModal(false);
  };

  // AUTO-REFUND: Sotuvchi 90 daqiqada kirmagan bo'lsa
  const handleAutoRefund = async () => {
    await runOrderAction("order_request_refund", {});
    setShowRefundModal(false);
  };

  // SELLER: Akkaunt topshirildi
  const handleMarkDelivered = async () => {
    await runOrderAction("order_mark_delivered", {});
  };

  // REVIEW: Yakunlangan bitimdan keyin sotuvchini baholash
  const handleSubmitReview = async () => {
    const sb = sbRef.current;
    if (!deal || !sb || reviewSent) return;
    setActionProcessing(true);
    const { error } = await sb.from("reviews").insert({
      order_id: deal.id,
      reviewer_id: userId,
      seller_id: deal.seller_id,
      rating,
    });
    // 23505 = bu buyurtma uchun baho allaqachon qoldirilgan
    if (!error || error.code === "23505") setReviewSent(true);
    else setActionError("Bahoni saqlab bo'lmadi");
    setActionProcessing(false);
  };

  // ─── Status badge ────────────────────────────────────────────────
  const statusMeta: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    paid: { label: "Escrow'da Muzlatilgan", color: "#38BDF8", icon: <Lock size={13} /> },
    seller_joined: { label: "Sotuvchi Ulanmoqda", color: "#FBBF24", icon: <User size={13} /> },
    delivered: { label: "Ma'lumotlar Topshirildi", color: "#A78BFA", icon: <Send size={13} /> },
    completed: { label: "Bitim Yakunlandi", color: "#34D399", icon: <CheckCheck size={13} /> },
    disputed: { label: "Nizo Ko'rilmoqda", color: "#F87171", icon: <ShieldAlert size={13} /> },
    refunded: { label: "To'lov Qaytarildi", color: "#94A3B8", icon: <RotateCcw size={13} /> },
  };

  // ─── Loading ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={36} className="animate-spin text-blue-400" />
      </div>
    );
  }

  if (!deal) return null;

  const priceUzs = Math.round(deal.price * UZS_RATE).toLocaleString("uz-UZ");
  const s = statusMeta[deal.status] ?? statusMeta.paid;
  const isActive = !["completed", "disputed", "refunded"].includes(deal.status);
  const isBuyerView = viewerSide === "buyer";
  const isSellerView = viewerSide === "seller";
  // Nizo paytida ham tomonlar yozishda davom etadi; admin faqat kuzatadi
  const canChat = viewerSide !== "admin" && (isActive || deal.status === "disputed");
  const showAutoRefund = isBuyerView && refundMsLeft <= 0 && !sellerJoined && isActive;
  const counterpartName = isSellerView ? deal.buyer_name : deal.seller_name;

  // ─── COMPLETED STATE ─────────────────────────────────────────────
  if (deal.status === "completed") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-10 text-center border-emerald-500/30" style={{ border: "1px solid rgba(52,211,153,0.35)" }}>
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={44} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Bitim Muvaffaqiyatli Yakunlandi!
          </h1>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            ${deal.price} mablag&apos; sotuvchi <strong className="text-white">{deal.seller_name}</strong> hisobiga o&apos;tkazildi.
            {isBuyerView ? " Kafolatli xarid uchun rahmat!" : ""}
          </p>
          {/* Star rating (faqat xaridor) */}
          {isBuyerView && (
            <div className="mb-6">
              <p className="text-xs text-slate-400 mb-2">
                {reviewSent ? "Bahoingiz uchun rahmat!" : "Sotuvchini baholang:"}
              </p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    disabled={reviewSent}
                    className="bg-transparent border-none cursor-pointer p-0"
                  >
                    <Star
                      size={28}
                      className={n <= rating ? "text-amber-400" : "text-slate-700"}
                      fill={n <= rating ? "#FBBF24" : "none"}
                    />
                  </button>
                ))}
              </div>
              {!reviewSent && (
                <button
                  onClick={handleSubmitReview}
                  disabled={actionProcessing}
                  className="btn btn-secondary"
                  style={{ marginTop: 12, display: "inline-flex", gap: 8 }}
                >
                  {actionProcessing ? "Saqlanmoqda..." : "Bahoni yuborish"}
                </button>
              )}
              {actionError && <p className="text-xs text-red-400 mt-2">{actionError}</p>}
            </div>
          )}
          <Link href="/listings" className="btn btn-primary" style={{ display: "inline-flex", gap: 8, textDecoration: "none" }}>
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 72, minHeight: "100vh", paddingBottom: 24 }}>
      <div className="container" style={{ maxWidth: 1080 }}>
        {/* ─── Back ─────────────────────────────────────────────── */}
        <Link
          href="/listings"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 13.5, textDecoration: "none", marginBottom: 16 }}
        >
          <ArrowLeft size={15} /> Bosh sahifaga qaytish
        </Link>

        {/* ─── Status Header Bar ────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            padding: "14px 20px",
            borderRadius: 16,
            background: "rgba(15, 23, 42, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                borderRadius: 999,
                background: `${s.color}18`,
                border: `1px solid ${s.color}40`,
                color: s.color,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {s.icon}
              {s.label}
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#FFF", fontFamily: "monospace" }}>
              {deal.order_number}
            </span>
            <button
              onClick={() => copyText(deal.order_number)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: copied ? "#34D399" : "rgba(255,255,255,0.4)", padding: 0 }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#60A5FA" }}>
              ${deal.price}
            </span>
            {/* Confirm Timer */}
            {isActive && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: confirmMsLeft < 3600000 ? "#F87171" : "#FBBF24",
                  fontFamily: "monospace",
                }}
              >
                <Clock size={14} />
                {formatTime(confirmMsLeft)}
              </div>
            )}
          </div>
        </div>

        {/* ─── Main 2-column grid ───────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }} className="deal-room-grid">
          {/* ═══════════════════════════════════════════════════════
               CHAT COLUMN
          ═══════════════════════════════════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Chat Box */}
            <div
              style={{
                borderRadius: 20,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(10, 14, 30, 0.85)",
                overflow: "hidden",
              }}
            >
              {/* Chat Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 20px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
                  background: "rgba(255, 255, 255, 0.03)",
                }}
              >
                <MessageSquare size={18} className="text-blue-400" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#FFF" }}>Xarid Xonasi — Deal Room</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {isSellerView
                      ? `Xaridor: ${deal.buyer_name}`
                      : sellerJoined
                      ? `${deal.seller_name} chatda`
                      : "Sotuvchi kutilmoqda..."}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: sellerJoined ? "#34D399" : "#FBBF24" }} />
                  <span style={{ fontSize: 11, color: sellerJoined ? "#34D399" : "#FBBF24" }}>
                    {sellerJoined ? "Faol" : "Kutilmoqda"}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div
                style={{
                  height: 420,
                  overflowY: "auto",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
                className="custom-scrollbar"
              >
                {messages.map((msg) => {
                  if (msg.type === "system") {
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "85%",
                            padding: "8px 16px",
                            borderRadius: 12,
                            background: "rgba(59, 130, 246, 0.1)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                            fontSize: 12,
                            color: "#93C5FD",
                            textAlign: "center",
                            lineHeight: 1.5,
                          }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  const isMine = msg.sender === viewerSide;
                  const isCreds = msg.type === "credentials";

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        flexDirection: isMine ? "row-reverse" : "row",
                        alignItems: "flex-end",
                        gap: 8,
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 800,
                          color: "#FFF",
                          background: isMine
                            ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
                            : "linear-gradient(135deg, #059669, #047857)",
                        }}
                      >
                        {isMine ? "S" : msg.senderName[0]}
                      </div>

                      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 3, alignItems: isMine ? "flex-end" : "flex-start" }}>
                        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                          {msg.senderName} · {relativeTime(msg.timestamp)}
                        </span>
                        <div
                          style={{
                            padding: isCreds ? "12px 16px" : "10px 14px",
                            borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            background: isMine
                              ? "rgba(37, 99, 235, 0.3)"
                              : isCreds
                              ? "rgba(5, 150, 105, 0.15)"
                              : "rgba(255, 255, 255, 0.07)",
                            border: isCreds ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid rgba(255, 255, 255, 0.05)",
                            fontSize: 13,
                            color: "#E5E7EB",
                            lineHeight: 1.55,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {isCreds && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: "#34D399", fontWeight: 700, fontSize: 12 }}>
                              <Lock size={12} />
                              <span>AKKAUNT MA&apos;LUMOTLARI (Shifrlangan)</span>
                            </div>
                          )}
                          {msg.content}
                          {isCreds && (
                            <button
                              onClick={() => copyText(msg.content)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                marginTop: 8,
                                background: "rgba(52, 211, 153, 0.1)",
                                border: "1px solid rgba(52, 211, 153, 0.25)",
                                borderRadius: 8,
                                padding: "4px 10px",
                                color: "#34D399",
                                fontSize: 11,
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              <Copy size={11} />
                              Nusxalash
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input Row */}
              {canChat && (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "12px 16px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.07)",
                    background: "rgba(255, 255, 255, 0.02)",
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Xabar yozing... (Enter bosing yoki ▶ tugmani)"
                    style={{
                      flex: 1,
                      background: "rgba(15, 23, 42, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: 12,
                      padding: "10px 14px",
                      fontSize: 13,
                      color: "#FFF",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                      border: "none",
                      color: "#FFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                      opacity: !newMessage.trim() ? 0.5 : 1,
                    }}
                  >
                    <Send size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Auto-Refund Alert */}
            {showAutoRefund && (
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: 16,
                  background: "rgba(248, 113, 113, 0.08)",
                  border: "1px solid rgba(248, 113, 113, 0.3)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#F87171", fontSize: 14, marginBottom: 4 }}>
                    Sotuvchi Kelmadi — Auto-Refund Faol!
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(209, 213, 219, 0.85)", lineHeight: 1.5, margin: 0 }}>
                    Sotuvchi belgilangan 1 soat 30 daqiqa ichida xarid xonasiga kirmadi. To&apos;lovingizni to&apos;liq qaytarib olishingiz mumkin.
                  </p>
                  <button
                    onClick={() => setShowRefundModal(true)}
                    style={{
                      marginTop: 10,
                      padding: "8px 18px",
                      borderRadius: 10,
                      background: "#F87171",
                      border: "none",
                      color: "#FFF",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <RotateCcw size={14} />
                    To&apos;lovni Qaytarish (Auto-Refund)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════
               RIGHT SIDEBAR: Order Info + Actions
          ═══════════════════════════════════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Order Summary Card */}
            <div className="card" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#FFF", fontFamily: "'Outfit', sans-serif" }}>
                Buyurtma Tafsilotlari
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-muted)" }}>Mahsulot</span>
                  <span style={{ color: "#FFF", fontWeight: 600, textAlign: "right", maxWidth: 160, lineHeight: 1.3 }}>
                    {deal.listing_title.slice(0, 40)}
                  </span>
                </div>
                {deal.listing_rating && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--text-muted)" }}>Jamoa OVR</span>
                    <span style={{ color: "#FBBF24", fontWeight: 700 }}>{deal.listing_rating}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-muted)" }}>Platform</span>
                  <span style={{ color: "#FFF", textTransform: "uppercase" }}>{deal.listing_platform}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-muted)" }}>To&apos;lov tizimi</span>
                  <span style={{ color: "#FFF", textTransform: "capitalize" }}>{deal.payment_method}</span>
                </div>
              </div>

              <div style={{ margin: "14px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                  <span style={{ color: "var(--text-muted)" }}>Asosiy narx</span>
                  <span style={{ color: "#FFF" }}>${deal.price}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                  <span style={{ color: "var(--text-muted)" }}>Platforma (5%)</span>
                  <span style={{ color: "var(--text-muted)" }}>-${deal.platform_fee}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                  <span style={{ color: "var(--text-muted)" }}>Sotuvchi oladi</span>
                  <span style={{ color: "#34D399", fontWeight: 700 }}>${deal.seller_earnings}</span>
                </div>
              </div>

              <div style={{ margin: "14px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }} />

              {/* Timers */}
              {isActive && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-muted)" }}>
                      <Clock size={13} className="text-amber-400" />
                      <span>Tasdiq taymeri</span>
                    </div>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: confirmMsLeft < 3600000 ? "#F87171" : "#FBBF24" }}>
                      {formatTime(confirmMsLeft)}
                    </span>
                  </div>
                  {!sellerJoined && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-muted)" }}>
                        <RefreshCw size={13} className="text-red-400" />
                        <span>Auto-Refund taymeri</span>
                      </div>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#F87171" }}>
                        {formatTime(refundMsLeft)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Seller Card */}
            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #059669, #047857)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    color: "#FFF",
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {counterpartName[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#FFF" }}>{counterpartName}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {isSellerView ? "Xaridor" : "Tasdiqlangan Sotuvchi"}
                    {!isSellerView && deal.seller_telegram ? ` · @${deal.seller_telegram}` : ""}
                  </div>
                </div>
                <ShieldCheck size={16} className="text-emerald-400 ml-auto" />
              </div>
            </div>

            {/* Escrow Protection Info */}
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 16,
                background: "rgba(16, 185, 129, 0.07)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <ShieldCheck size={16} className="text-emerald-400" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#34D399" }}>Escrow Himoyasi Faol</span>
              </div>
              <p style={{ fontSize: 11.5, color: "rgba(209, 213, 219, 0.8)", lineHeight: 1.55, margin: 0 }}>
                Pul sotuvchiga faqat xaridor «Tasdiqlash» tugmasini bosganda o&apos;tkaziladi.
                Muammo chiqsa — nizo oching va admin hal qiladi.
              </p>
            </div>

            {actionError && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "rgba(248, 113, 113, 0.08)",
                  border: "1px solid rgba(248, 113, 113, 0.3)",
                  color: "#F87171",
                  fontSize: 12.5,
                }}
              >
                <AlertCircle size={15} /> {actionError}
              </div>
            )}

            {/* ─── Seller Action ─── */}
            {isSellerView && deal.status === "seller_joined" && (
              <button
                onClick={handleMarkDelivered}
                disabled={actionProcessing}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                  border: "none",
                  color: "#FFF",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: actionProcessing ? 0.6 : 1,
                }}
              >
                <Send size={16} />
                {actionProcessing ? "Saqlanmoqda..." : "Akkaunt Topshirildi — Xaridorga Xabar Berish"}
              </button>
            )}

            {/* ─── Action Buttons ─── */}
            {isActive && viewerSide !== "admin" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* CONFIRM Button (faqat xaridor) */}
                {isBuyerView && (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #059669, #047857)",
                    border: "none",
                    color: "#FFF",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 8px 24px rgba(5, 150, 105, 0.3)",
                  }}
                >
                  <CheckCheck size={17} />
                  Akkauntni Qabul Qildim — Pulni O&apos;tkazish
                </button>
                )}

                {/* DISPUTE Button */}
                <button
                  onClick={() => setShowDisputeModal(true)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 14,
                    background: "rgba(248, 113, 113, 0.1)",
                    border: "1px solid rgba(248, 113, 113, 0.3)",
                    color: "#F87171",
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <ShieldAlert size={16} />
                  Muammo Bor — Nizo Ochish (Dispute)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           CONFIRM MODAL
      ═══════════════════════════════════════════════════════════ */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[1000] flex items-center justify-center p-4"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="w-full max-w-[440px] bg-[#0c142c] border border-emerald-500/40 rounded-[24px] p-6 text-white shadow-[0_0_80px_rgba(5,150,105,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
                <Unlock size={20} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="m-0 text-base font-bold text-white">Escrow'dan Pul Chiqarish</h3>
                <p className="text-[11px] text-slate-400 m-0">Tasdiqlashdan oldin akkauntni tekshiring</p>
              </div>
            </div>

            <div className="bg-[#0a1428] rounded-xl p-4 mb-5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Jami to&apos;lov:</span>
                <span className="font-bold text-white">${deal.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Platforma (5%):</span>
                <span className="text-slate-500">-${deal.platform_fee}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-slate-400">Sotuvchi oladi:</span>
                <span className="font-bold text-emerald-400">${deal.seller_earnings}</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-5 flex items-start gap-2.5 text-[12px] text-amber-200/90 leading-relaxed">
              <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <span>Tasdiqlaganingizdan so&apos;ng pul sotuvchiga o&apos;tadi va bitim qaytarib bo&apos;lmaydi. Akkaunt parolini avval o&apos;zgartirib olgansizmi?</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/8 border border-white/12 text-slate-300 font-semibold text-sm cursor-pointer hover:bg-white/12 transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirm}
                disabled={actionProcessing}
                className="flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all text-white flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #059669, #047857)", border: "none" }}
              >
                {actionProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCheck size={16} />}
                {actionProcessing ? "Amalga oshirilmoqda..." : "Ha, Tasdiqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
           DISPUTE MODAL
      ═══════════════════════════════════════════════════════════ */}
      {showDisputeModal && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[1000] flex items-center justify-center p-4"
          onClick={() => setShowDisputeModal(false)}
        >
          <div
            className="w-full max-w-[480px] bg-[#0c142c] border border-red-500/40 rounded-[24px] p-6 text-white shadow-[0_0_80px_rgba(248,113,113,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/40 flex items-center justify-center">
                <ShieldAlert size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="m-0 text-base font-bold text-white">Nizo Ochish (Dispute)</h3>
                <p className="text-[11px] text-slate-400 m-0">Mablag&apos; muzlatiladi, admin ko&apos;rib chiqadi</p>
              </div>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="ml-auto w-8 h-8 rounded-lg bg-white/8 border-none text-white flex items-center justify-center cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <X size={15} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-slate-300 font-semibold mb-2">Muammo sababini kiriting:</label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Masalan: Parol noto&apos;g&apos;ri, akkaunt bog&apos;liq emas, yoki boshqa muammo..."
                rows={4}
                style={{
                  width: "100%",
                  background: "rgba(10, 20, 40, 0.9)",
                  border: "1px solid rgba(248, 113, 113, 0.3)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#FFF",
                  outline: "none",
                  resize: "vertical",
                  lineHeight: 1.5,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 mb-5 text-[11.5px] text-red-200/85 leading-relaxed">
              <strong className="text-red-300">Diqqat:</strong> Nizo ochilganda pul muzlatiladi va admin jamoasi 24 soat ichida xabardor bo&apos;lib muammoni ko&apos;rib chiqadi.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer text-slate-300"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDispute}
                disabled={actionProcessing || !disputeReason.trim()}
                className="flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #DC2626, #B91C1C)", border: "none" }}
              >
                {actionProcessing ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
                {actionProcessing ? "Yuborilmoqda..." : "Nizo Ochish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
           AUTO-REFUND MODAL
      ═══════════════════════════════════════════════════════════ */}
      {showRefundModal && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[1000] flex items-center justify-center p-4"
          onClick={() => setShowRefundModal(false)}
        >
          <div
            className="w-full max-w-[440px] bg-[#0c142c] border border-slate-500/40 rounded-[24px] p-6 text-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-slate-500/15 border border-slate-500/40 flex items-center justify-center">
                <RotateCcw size={20} className="text-slate-300" />
              </div>
              <div>
                <h3 className="m-0 text-base font-bold text-white">To&apos;lovni Qaytarish</h3>
                <p className="text-[11px] text-slate-400 m-0">Escrow'dan to&apos;liq mablag&apos; qaytariladi</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              Sotuvchi belgilangan 1 soat 30 daqiqa ichida xarid xonasiga kirmadi.{" "}
              <strong className="text-white">${deal.price}</strong> mablag&apos; (≈ {priceUzs} so&apos;m) to&apos;liq sizning hisobingizga qaytariladi.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRefundModal(false)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer text-slate-300"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Bekor qilish
              </button>
              <button
                onClick={handleAutoRefund}
                disabled={actionProcessing}
                className="flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer text-white flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #475569, #334155)", border: "none" }}
              >
                {actionProcessing ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                {actionProcessing ? "Qaytarilmoqda..." : `$${deal.price} — Pulni Qaytarish`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
