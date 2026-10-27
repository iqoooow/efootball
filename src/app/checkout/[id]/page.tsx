"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Clock,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Lock,
  Zap,
  Sparkles,
  Copy,
  Check,
  Send,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Phone,
  ArrowRight,
  X,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { formatCoinAmount, formatOrderNumber } from "@/lib/utils";

const PAYMENT_METHODS = [
  {
    id: "payme",
    label: "Payme",
    desc: "O'zbekiston milliy to'lov tizimi (Sandbox Test rejimi)",
    color: "#00b8d4",
    icon: "💳",
    badge: "0% komissiya",
  },
  {
    id: "click",
    label: "Click Up",
    desc: "QR yoki telefon raqam orqali lahzali to'lov (Sandbox Test)",
    color: "#ff6b35",
    icon: "⚡",
    badge: "Lahzali",
  },
  {
    id: "uzcard",
    label: "Uzcard / Humo",
    desc: "To'g'ridan-to'g'ri bank kartasi orqali xavfsiz to'lov",
    color: "#3B82F6",
    icon: "🏦",
    badge: "Karta orqali",
  },
];

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("payme");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [copied, setCopied] = useState(false);

  // Sandbox Modal State
  const [sandboxModalOpen, setSandboxModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("+998 90 123 45 67");
  const [cardNumber, setCardNumber] = useState("8600 1234 5678 9012");
  const [smsCode, setSmsCode] = useState("12345");
  const [paymentStep, setPaymentStep] = useState<"input" | "processing" | "done">("input");

  useEffect(() => {
    const init = async () => {
      const { id } = await params;

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // Escrow buyurtma faqat tizimga kirgan xaridor uchun
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/auth/login?next=${encodeURIComponent(`/checkout/${id}`)}`);
          return;
        }

        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("id", id)
          .eq("status", "active")
          .single();

        if (data && !error) {
          // Sotuvchi profili ommaviy view'dan (email/telefonsiz)
          const { data: seller } = await supabase
            .from("public_profiles")
            .select("id, full_name, telegram_username")
            .eq("id", data.seller_id)
            .maybeSingle();
          setListing({ ...data, seller });
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error loading listing for checkout:", err);
      }

      // E'lon topilmadi yoki endi sotuvda emas
      router.push("/listings");
    };
    init();
  }, [params, router]);

  const UZS_EXCHANGE_RATE = 13000;
  const priceUzs = listing ? Math.round(listing.price * UZS_EXCHANGE_RATE).toLocaleString("uz-UZ") : "0";
  const platformFee = listing ? Math.round(listing.price * 0.05 * 100) / 100 : 0;

  // Open Sandbox Payment Modal
  const handleInitiatePayment = () => {
    setError("");
    setPaymentStep("input");
    setSandboxModalOpen(true);
  };

  // Complete Sandbox Payment and create order in Escrow
  const handleExecuteSandboxPayment = async () => {
    if (!listing) return;
    setPaymentStep("processing");

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // Buyurtma bazada atomik yaratiladi: e'lon qulflanadi va band qilinadi
      const { data: newOrderId, error: orderErr } = await supabase.rpc("create_order", {
        p_listing_id: listing.id,
        p_payment_method: paymentMethod,
      });

      if (orderErr || !newOrderId) {
        throw new Error(orderErr?.message || "Buyurtma yaratilmadi");
      }

      setOrderId(newOrderId as string);
      setOrderNumber(formatOrderNumber(newOrderId as string));
      setPaymentStep("done");
      setSuccess(true);
      setSandboxModalOpen(false);
    } catch (err) {
      console.error("Create order error:", err);
      setError(err instanceof Error ? err.message : "Buyurtma yaratishda xatolik yuz berdi");
      setPaymentStep("input");
      setSandboxModalOpen(false);
    }
  };

  const copyOrderCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(orderNumber || orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: 100, minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={36} className="animate-spin text-blue-500" />
      </div>
    );
  }

  // Success / Escrow Hold Invoice View
  if (success) {
    return (
      <div
        style={{
          paddingTop: 100,
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 20px",
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: 600,
            width: "100%",
            padding: "40px 32px",
            textAlign: "center",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7)",
          }}
        >
          {/* Animated Success Checkmark */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.15)",
              border: "2px solid rgba(16, 185, 129, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <CheckCircle size={44} className="text-emerald-400" />
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              borderRadius: 999,
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34D399",
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            <ShieldCheck size={15} />
            <span>Mablag&apos; Escrow Xavfsiz Hisobida Muzlatildi</span>
          </div>

          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 26,
              fontWeight: 800,
              marginBottom: 10,
              color: "#FFF",
            }}
          >
            To&apos;lov Muvaffaqiyatli Amalga Oshirildi!
          </h1>

          <p style={{ color: "rgba(156, 163, 175, 0.95)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Siz to&apos;lagan <strong>${listing.price} (≈ {priceUzs} so&apos;m)</strong> mablag&apos; xavfsiz Escrow hisobida ushlab turilibdi.
            Akkauntni qabul qilib, to&apos;liq tekshirib tasdiqlamaguningizcha pul sotuvchiga berilmaydi.
          </p>

          {/* Telegram Alert Simulated Banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(34, 158, 217, 0.12)",
              border: "1px solid rgba(34, 158, 217, 0.3)",
              borderRadius: 14,
              padding: "12px 16px",
              textAlign: "left",
              marginBottom: 20,
            }}
          >
            <Send size={20} className="text-[#229ED9] shrink-0" />
            <div style={{ fontSize: 13, color: "#E0F2FE", lineHeight: 1.4 }}>
              <strong>Sotuvchiga Telegram xabar yuborildi:</strong>
              <div style={{ color: "#BAE6FD", fontSize: 12 }}>
                «⚡️ Akkauntingiz sotildi! Xaridor Deal Room chatida kutmoqda.»
              </div>
            </div>
          </div>

          {/* Invoice Summary Box */}
          <div
            style={{
              background: "rgba(10, 16, 34, 0.85)",
              borderRadius: 16,
              padding: "20px",
              marginBottom: 26,
              textAlign: "left",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Buyurtma Raqami:</span>
              <button
                type="button"
                onClick={copyOrderCode}
                style={{
                  background: "transparent",
                  border: "none",
                  color: copied ? "#34D399" : "#60A5FA",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13.5,
                  fontWeight: 800,
                  fontFamily: "monospace",
                }}
              >
                {orderNumber || orderId} {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: "var(--text-muted)" }}>Mahsulot:</span>
              <span style={{ fontWeight: 600, color: "#FFF" }}>{listing.title.slice(0, 36)}...</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: "var(--text-muted)" }}>To&apos;lov tizimi:</span>
              <span style={{ fontWeight: 700, color: "#38BDF8", textTransform: "capitalize" }}>{paymentMethod}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: "var(--text-muted)" }}>Platforma Kafolati:</span>
              <span style={{ fontWeight: 600, color: "#34D399" }}>100% Himoyalangan Escrow</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--text-muted)" }}>Sotuvchi:</span>
              <span style={{ fontWeight: 600, color: "#60A5FA" }}>{listing.seller?.full_name || "Jasur (eF Pro)"}</span>
            </div>
          </div>

          {/* Primary Action Button: Enter Deal Room */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link
              href={`/orders/${orderId}`}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "16px",
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 14,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: "0 10px 30px rgba(37, 99, 235, 0.4)",
              }}
            >
              <MessageSquare size={18} />
              <span>Xarid Xonasi va Chatga O&apos;tish (Deal Room)</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/listings"
              style={{
                color: "var(--text-secondary)",
                fontSize: 13,
                textDecoration: "none",
                padding: "8px",
              }}
            >
              Boshqa e&apos;lonlarni ko&apos;rish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAccount = listing.type === "account";

  return (
    <div style={{ paddingTop: 80, minHeight: "100vh", paddingBottom: 80 }}>
      <div className="container" style={{ paddingTop: 24, maxWidth: 980 }}>
        {/* Back Link */}
        <Link
          href={`/listings/${listing.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-secondary)",
            fontSize: 13.5,
            textDecoration: "none",
            marginBottom: 24,
          }}
        >
          <ArrowLeft size={15} /> E&apos;longa qaytish
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }} className="checkout-responsive-grid">
          {/* Left Column: Payment Methods & Escrow Details */}
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 8, color: "#FFF" }}>
              Xavfsiz Xarid va To&apos;lov
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Mablag&apos; faqat siz akkauntni to&apos;liq tekshirib qabul qilib olganingizdan so&apos;ng sotuvchiga o&apos;tkaziladi.
            </p>

            {error && (
              <div className="alert alert-danger" style={{ marginBottom: 20 }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {/* Escrow Guarantee Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "16px 20px",
                borderRadius: 16,
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                marginBottom: 28,
              }}
            >
              <ShieldCheck size={26} className="text-emerald-400" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: "#34D399", fontSize: 14 }}>100% Escrow Himoyasi Faol</strong>
                <p style={{ fontSize: 13, color: "rgba(209, 213, 219, 0.9)", lineHeight: 1.5, margin: "4px 0 0" }}>
                  Pul sotuvchiga to&apos;g&apos;ridan-to&apos;g&apos;ri berilmaydi. Agar ma&apos;lumotlar to&apos;g&apos;ri kelmasa yoki sotuvchi 1-2 soatda chiqmasa,
                  to&apos;lov to&apos;liq sizga qaytariladi (Auto-Refund).
                </p>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: "#FFF", fontFamily: "'Outfit', sans-serif" }}>
                To&apos;lov Tizimini Tanlang
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "16px 18px",
                      borderRadius: 14,
                      cursor: "pointer",
                      border: paymentMethod === method.id ? "2px solid #3B82F6" : "1px solid rgba(255, 255, 255, 0.08)",
                      background: paymentMethod === method.id ? "rgba(37, 99, 235, 0.12)" : "rgba(15, 23, 42, 0.6)",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        flexShrink: 0,
                        background: `${method.color}20`,
                        border: `1px solid ${method.color}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                      }}
                    >
                      {method.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 14.5, color: "#FFF" }}>{method.label}</span>
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: "rgba(59, 130, 246, 0.15)",
                            color: "#60A5FA",
                            fontWeight: 700,
                          }}
                        >
                          {method.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{method.desc}</div>
                    </div>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: paymentMethod === method.id ? "5px solid #3B82F6" : "2px solid rgba(255, 255, 255, 0.2)",
                        transition: "all 0.15s ease",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleInitiatePayment}
              disabled={processing}
              className="btn btn-primary btn-lg"
              style={{
                width: "100%",
                padding: "16px",
                fontSize: 15,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Lock size={16} />
              <span>${listing.price} (≈ {priceUzs} so&apos;m) — Xaridni Tasdiqlash</span>
            </button>
          </div>

          {/* Right Column: Order Summary Card */}
          <div>
            <div className="card" style={{ padding: "24px" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#FFF", fontFamily: "'Outfit', sans-serif" }}>
                Buyurtma Tafsilotlari
              </h2>

              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 8, lineHeight: 1.4, color: "#FFF" }}>{listing.title}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className={`badge ${isAccount ? "badge-blue" : "badge-emerald"}`} style={{ fontSize: 11 }}>
                    {isAccount ? "AKKAUNT" : "COIN"}
                  </span>
                  <span className="badge badge-gray" style={{ fontSize: 11, textTransform: "uppercase" }}>
                    {listing.platform}
                  </span>
                </div>
              </div>

              {isAccount && listing.team_rating && (
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
                  ⭐ Jamoa OVR: <strong style={{ color: "#FBBF24" }}>{listing.team_rating}</strong>
                </div>
              )}
              {!isAccount && listing.coin_amount && (
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
                  🪙 Tanga miqdori: <strong style={{ color: "#60A5FA" }}>{formatCoinAmount(listing.coin_amount)}</strong>
                </div>
              )}

              <div className="divider" style={{ margin: "16px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 8 }}>
                <span style={{ color: "var(--text-secondary)" }}>Asosiy narx</span>
                <span style={{ color: "#FFF" }}>
                  ${listing.price} (≈ {priceUzs} so&apos;m)
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 8 }}>
                <span style={{ color: "var(--text-secondary)" }}>Kafolatli Escrow Himoyasi</span>
                <span style={{ color: "#34D399", fontWeight: 600 }}>Faollashtirilgan</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 12 }}>
                <span style={{ color: "var(--text-secondary)" }}>Platforma komissiyasi (5%)</span>
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Sotuvchi tushumidan ($ {platformFee})</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 18,
                  fontWeight: 800,
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingTop: 12,
                }}
              >
                <span style={{ color: "#FFF" }}>Jami to&apos;lov</span>
                <span style={{ color: "#60A5FA" }}>${listing.price}</span>
              </div>

              {listing.delivery_time && (
                <div
                  style={{
                    marginTop: 18,
                    padding: "12px 14px",
                    background: "rgba(255, 255, 255, 0.03)",
                    borderRadius: 12,
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                    <Clock size={15} className="text-amber-400" />
                    <span>
                      Yetkazib berish: <strong style={{ color: "#FFF" }}>{listing.delivery_time}</strong>
                    </span>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>Tasdiqlangan Sotuvchi</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      color: "#FFF",
                      fontSize: 12,
                    }}
                  >
                    {listing.seller?.full_name?.[0] || "S"}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 13.5, color: "#FFF" }}>
                    {listing.seller?.full_name || "Jasur (eF Pro)"}
                  </span>
                  <CheckCircle size={14} className="text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ===== SANDBOX INTERACTIVE PAYMENT MODAL (PAYME / CLICK / UZCARD) ===== */}
      {/* ========================================================================= */}
      {sandboxModalOpen && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[1000] flex items-center justify-center p-4"
          onClick={() => setSandboxModalOpen(false)}
        >
          <div
            className="w-full max-w-[460px] bg-[#0c142c] border border-blue-500/40 rounded-[24px] p-6 text-white shadow-[0_0_80px_rgba(37,99,235,0.4)] flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                  style={{
                    background: paymentMethod === "payme" ? "#00b8d420" : paymentMethod === "click" ? "#ff6b3520" : "#3b82f620",
                    border: `1px solid ${
                      paymentMethod === "payme" ? "#00b8d4" : paymentMethod === "click" ? "#ff6b35" : "#3b82f6"
                    }`,
                  }}
                >
                  {paymentMethod === "payme" ? "💳" : paymentMethod === "click" ? "⚡" : "🏦"}
                </div>
                <div>
                  <h3 className="m-0 text-base font-bold text-white capitalize font-display">
                    {paymentMethod === "payme" ? "Payme Test Sandbox" : paymentMethod === "click" ? "Click Up Test Sandbox" : "Uzcard / Humo Sandbox"}
                  </h3>
                  <span className="text-[11px] text-emerald-400 font-semibold">● 100% Xavfsiz Escrow Simulyatori</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSandboxModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border-none text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Payment Amount Callout */}
            <div className="bg-[#121c40] rounded-xl p-3.5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400">To&apos;lov summasi:</div>
                <div className="text-xl font-black text-white font-display">${listing.price}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-400">So&apos;mda:</div>
                <div className="text-sm font-bold text-emerald-400">≈ {priceUzs} so&apos;m</div>
              </div>
            </div>

            {/* Inputs based on payment method */}
            {paymentStep === "input" && (
              <div className="flex flex-col gap-3">
                {paymentMethod === "payme" || paymentMethod === "click" ? (
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1.5 flex items-center gap-1.5">
                      <Phone size={13} className="text-sky-400" />
                      Telefon raqamingiz:
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-[#080d1e] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-400 font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1.5 flex items-center gap-1.5">
                      <CreditCard size={13} className="text-sky-400" />
                      Karta raqami:
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-[#080d1e] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-400 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                    SMS Tasdiq kodi (Test uchun ixtiyoriy 5 ta raqam):
                  </label>
                  <input
                    type="text"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    maxLength={6}
                    className="w-full bg-[#080d1e] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-400 font-mono tracking-widest text-center"
                  />
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="m-0 text-[11.5px] text-amber-200/90 leading-relaxed">
                    Bu Sandbox test rejimi. Haqiqiy kartangizdan pul yechilmaydi, lekin buyurtma va Escrow kafolati tizimda to&apos;liq shakllanadi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteSandboxPayment}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all border-none cursor-pointer shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 mt-1"
                >
                  <Lock size={15} />
                  <span>Test To&apos;lovini Tasdiqlash</span>
                </button>
              </div>
            )}

            {paymentStep === "processing" && (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <Loader2 size={36} className="animate-spin text-blue-400" />
                <div className="text-sm font-bold text-white">To&apos;lov tekshirilmoqda...</div>
                <div className="text-xs text-slate-400 text-center">
                  Mablag&apos; platformaning Escrow xavfsiz hisobida muzlatilmoqda
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
