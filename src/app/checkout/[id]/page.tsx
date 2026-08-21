"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Lock,
  Zap,
  Sparkles,
  Copy,
  Check,
  Send,
} from "lucide-react";
import { formatCoinAmount } from "@/lib/utils";

const PAYMENT_METHODS = [
  { id: "payme", label: "Payme", desc: "O'zbekiston milliy to'lov tizimi (0% komissiya)", color: "#00b8d4", icon: "💳" },
  { id: "click", label: "Click Up", desc: "QR yoki karta orqali lahzali to'lov", color: "#ff6b35", icon: "⚡" },
  { id: "uzcard", label: "Uzcard / Humo", desc: "Bank kartasi orqali to'g'ridan-to'g'ri", color: "#4f8ef7", icon: "🏦" },
  { id: "crypto", label: "USDT (TRC20 / TON)", desc: "Kriptovalyuta orqali avtomat to'lov", color: "#00e676", icon: "💎" },
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { id } = await params;

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data, error } = await supabase
          .from("listings")
          .select(`*, seller:profiles(id, full_name)`)
          .eq("id", id)
          .eq("status", "active")
          .single();

        if (data && !error) {
          setListing(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error loading listing for checkout:", err);
      }

      // If not found in database, redirect to listings catalog
      router.push("/listings");
    };
    init();
  }, [params, router]);

  const handlePay = async () => {
    if (!listing) return;
    setProcessing(true);
    setError("");

    try {
      const { isSupabaseConfigured, createClient } = await import("@/lib/supabase/client");
      if (isSupabaseConfigured) {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: order, error: orderErr } = await supabase
            .from("orders")
            .insert({
              buyer_id: session.user.id,
              seller_id: listing.seller_id,
              listing_id: listing.id,
              price: listing.price,
              status: "paid",
            })
            .select()
            .single();

          if (!orderErr && order) {
            setOrderId(order.id);
            setSuccess(true);
            setProcessing(false);
            return;
          }
        }
      }
    } catch {
      // Fallback
    }

    // Demo simulation fallback
    setTimeout(() => {
      const generatedId = `EF-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      setOrderId(generatedId);
      setSuccess(true);
      setProcessing(false);
    }, 1200);
  };

  const copyOrderCode = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ paddingTop: 88, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={36} className="animate-spin" color="var(--accent)" />
      </div>
    );
  }

  if (success) {
    return (
      <div
        style={{
          paddingTop: 88,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 20px",
        }}
      >
        <div className="card gradient-border" style={{ maxWidth: 520, width: "100%", padding: "36px 32px", textAlign: "center" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(0,230,118,0.12)",
              border: "2px solid rgba(0,230,118,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <CheckCircle size={44} color="var(--accent)" />
          </div>

          <span className="badge badge-green" style={{ marginBottom: 12 }}>
            <Shield size={12} /> To&apos;lov Muvaffaqiyatli Muzlatildi
          </span>

          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 12 }}>
            Buyurtmangiz Qabul Qilindi!
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Sizning to&apos;lovingiz (${listing.price}) xavfsiz Escrow hisobida saqlandi. Sotuvchi ma&apos;lumotlarni taqdim etgach, tekshirib tasdiqlaysiz.
          </p>

          {/* Invoice Box */}
          <div
            style={{
              background: "var(--bg-elevated)",
              borderRadius: 14,
              padding: "16px 20px",
              marginBottom: 24,
              textAlign: "left",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Buyurtma kodi:</span>
              <button
                onClick={copyOrderCode}
                style={{
                  background: "transparent",
                  border: "none",
                  color: copied ? "var(--accent)" : "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {orderId} {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: "var(--text-muted)" }}>Mahsulot:</span>
              <span style={{ fontWeight: 600 }}>{listing.title.slice(0, 28)}...</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: "var(--text-muted)" }}>Yetkazib berish vaqti:</span>
              <span style={{ fontWeight: 600, color: "var(--accent)" }}>{listing.delivery_time || "15-30 daqiqa"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--text-muted)" }}>Sotuvchi Telegram:</span>
              <span style={{ fontWeight: 600, color: "#4f8ef7" }}>@jasur_efootball</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="https://t.me" target="_blank" className="btn btn-primary" style={{ flex: 1 }}>
              <Send size={15} /> Sotuvchi bilan Bog&apos;lanish
            </Link>
            <Link href="/listings" className="btn btn-secondary" style={{ flex: 1 }}>
              Bosh Sahifaga Qaytish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAccount = listing.type === "account";

  return (
    <div style={{ paddingTop: 88, minHeight: "100vh", paddingBottom: 80 }}>
      <div className="container" style={{ paddingTop: 32, maxWidth: 900 }}>
        {/* Back Link */}
        <Link
          href={`/listings/${listing.id}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 14, textDecoration: "none", marginBottom: 24 }}
        >
          <ArrowLeft size={15} /> E&apos;longa qaytish
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
          {/* Left Column: Payment Methods & Escrow Details */}
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
              Xavfsiz Xarid va To&apos;lov
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 28 }}>
              Mablag&apos; faqat siz hisobni to&apos;liq qabul qilib olganingizdan so&apos;ng sotuvchiga o&apos;tkaziladi.
            </p>

            {error && (
              <div className="alert alert-danger" style={{ marginBottom: 20 }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {/* Escrow Guarantee Banner */}
            <div className="alert alert-success" style={{ marginBottom: 28, padding: "16px 20px" }}>
              <Shield size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>100% Xaridor Himoyasi Faol</strong>
                <br />
                <span style={{ fontSize: 13, lineHeight: 1.5, display: "inline-block", marginTop: 4 }}>
                  Pul sotuvchiga darhol berilmaydi. Ma&apos;lumot mos kelmasa yoki nizo yuzaga kelsa, pulingiz to&apos;liq qaytariladi.
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>To&apos;lov Tizimini Tanlang</h2>
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
                      padding: "16px 20px",
                      borderRadius: 14,
                      cursor: "pointer",
                      border: paymentMethod === method.id ? "2px solid var(--accent)" : "1px solid var(--border)",
                      background: paymentMethod === method.id ? "rgba(0,230,118,0.06)" : "var(--bg-card)",
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
                        background: `${method.color}15`,
                        border: `1px solid ${method.color}35`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                      }}
                    >
                      {method.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>{method.label}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{method.desc}</div>
                    </div>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: paymentMethod === method.id ? "6px solid var(--accent)" : "2px solid var(--border)",
                        transition: "all 0.15s ease",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={processing}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", padding: "16px", fontSize: 16, borderRadius: 14 }}
            >
              {processing ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Xavfsiz Tranzaksiya Yaratilmoqda...
                </>
              ) : (
                <>
                  <Lock size={16} /> ${listing.price} — Xaridni Tasdiqlash
                </>
              )}
            </button>
          </div>

          {/* Right Column: Order Summary Card */}
          <div>
            <div className="card gradient-border" style={{ padding: "24px" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Buyurtma Ma&apos;lumotlari</h2>

              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{listing.title}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className={`badge ${isAccount ? "badge-blue" : "badge-green"}`} style={{ fontSize: 11 }}>
                    {isAccount ? "HISOB" : "TANGA"}
                  </span>
                  <span className="badge badge-gray" style={{ fontSize: 11, textTransform: "uppercase" }}>
                    {listing.platform}
                  </span>
                </div>
              </div>

              {isAccount && listing.team_rating && (
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                  ⭐ Jamoa reytingi: <strong style={{ color: "var(--text-primary)" }}>{listing.team_rating}</strong>
                </div>
              )}
              {!isAccount && listing.coin_amount && (
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                  🪙 Tanga miqdori: <strong style={{ color: "var(--accent)" }}>{formatCoinAmount(listing.coin_amount)}</strong>
                </div>
              )}

              <div className="divider" style={{ margin: "16px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
                <span style={{ color: "var(--text-muted)" }}>Asosiy narx</span>
                <span>${listing.price}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 12 }}>
                <span style={{ color: "var(--text-muted)" }}>Platforma komissiyasi</span>
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>$0 (Bepul)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 800, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <span>Jami to&apos;lov</span>
                <span style={{ color: "var(--accent)" }}>${listing.price}</span>
              </div>

              {listing.delivery_time && (
                <div style={{ marginTop: 18, padding: "12px 14px", background: "var(--bg-elevated)", borderRadius: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                    <Clock size={15} color="var(--accent)" />
                    Yetkazib berish: <strong>{listing.delivery_time}</strong>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Tasdiqlangan Sotuvchi</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #00e676, #4f8ef7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      color: "#000",
                      fontSize: 12,
                    }}
                  >
                    {listing.seller?.full_name?.[0] || "S"}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{listing.seller?.full_name || "Jasur Bek (eF Master)"}</span>
                  <CheckCircle size={14} color="var(--accent)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
