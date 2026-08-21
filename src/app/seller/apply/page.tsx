"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Gamepad2,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  User,
  Phone,
  Send,
  Image as ImageIcon,
} from "lucide-react";

const PLATFORMS = [
  { value: "android", label: "🤖 Android (Google Play)" },
  { value: "ios", label: "🍏 iOS (Apple App Store)" },
  { value: "mobile", label: "📱 Android / iOS (Universal)" },
  { value: "konami", label: "🔑 Konami ID Bog'langan" },
];

export default function SellerApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    platform: "mobile",
    price: "",
    team_rating: "",
    coin_balance: "",
    key_players: "",
    description: "",
    telegram_username: "",
    phone: "",
    image_url: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login");
          return;
        }

        setUserId(user.id);
        if (user.user_metadata?.full_name) {
          setForm((f) => ({
            ...f,
            telegram_username: user.user_metadata?.telegram_username || "",
          }));
        }
      } catch {
        // Fallback for offline/mock
        setUserId("demo-user-id");
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Iltimos, e'lon sarlavhasini kiriting");
      return;
    }
    const parsedPrice = parseFloat(form.price);
    if (!form.price || isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Iltimos, to'g'ri narx kiriting (masalan: 35)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("E'lon joylash uchun tizimga kirishingiz kerak.");
        setLoading(false);
        router.push("/auth/login");
        return;
      }

      // 1. Ensure user profile exists and update contact info
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Foydalanuvchi",
          email: user.email || null,
          telegram_username: form.telegram_username.trim() || null,
          phone: form.phone.trim() || null,
          seller_status: "pending",
        },
        { onConflict: "id" }
      );

      // 2. Insert into listings table with status 'pending_review'
      const listingData = {
        seller_id: user.id,
        type: "account",
        title: form.title.trim(),
        platform: form.platform,
        price: parsedPrice,
        team_rating: form.team_rating ? parseInt(form.team_rating) : null,
        gp_balance: form.coin_balance ? parseInt(form.coin_balance) : null,
        key_players: form.key_players
          ? form.key_players.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
        description: form.description.trim() || null,
        delivery_time: "15-30 daqiqa",
        images: form.image_url.trim()
          ? [form.image_url.trim()]
          : ["/hero-bg.jpg"],
        status: "pending_review",
        created_at: new Date().toISOString(),
      };

      const { error: listingErr } = await supabase
        .from("listings")
        .insert(listingData);

      if (listingErr) {
        console.error("Listing insert error:", listingErr);
        setError(
          `E'lonni saqlashda xatolik yuz berdi: ${
            listingErr.message || "Supabase RLS yoki tarmoq xatosi"
          }`
        );
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err?.message || "E'lon yuborishda kutilmagan xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="apply-loading-screen">
        <Loader2 size={36} className="animate-spin text-blue" />
        <span>Tizim tekshirilmoqda...</span>
      </div>
    );
  }

  return (
    <div className="apply-page-root">
      <div className="container" style={{ maxWidth: 740 }}>
        {/* Back Link */}
        <Link href="/" className="back-link">
          <ArrowLeft size={16} /> Bosh sahifaga qaytish
        </Link>

        {success ? (
          /* Success Screen */
          <div className="apply-success-card animate-fade-in">
            <div className="success-icon-wrap">
              <CheckCircle2 size={42} className="text-emerald" />
            </div>

            <h2 className="success-title">
              Arizangiz muvaffaqiyatli qabul qilindi!
            </h2>

            <p className="success-desc">
              Akkaunt sotish e&apos;loningiz tekshirish uchun platforma
              adminiga yuborildi. Admin e&apos;lonni ko&apos;rib chiqib{" "}
              <strong>Approve (tasdiqlash)</strong> qilishi bilan:
            </p>

            <div className="success-benefits-list">
              <div className="benefit-item">
                <div className="benefit-dot" />
                <span>
                  E&apos;loningiz darhol marketplace katalogida faol
                  ko&apos;rinadi
                </span>
              </div>
              <div className="benefit-item">
                <div className="benefit-dot" />
                <span>
                  Sizning hisobingizga avtomatik tarzda{" "}
                  <strong>Tasdiqlangan Sotuvchi</strong> maqomi biriktiriladi
                </span>
              </div>
              <div className="benefit-item">
                <div className="benefit-dot" />
                <span>
                  Sotuvchi Kabineti ochilib, savdolar va tushgan mablag&apos;larni
                  boshqarishingiz mumkin bo&apos;ladi
                </span>
              </div>
            </div>

            <div className="success-actions-row">
              <Link href="/profile" className="btn-primary-action">
                Mening Profilim va Arizalar Holati <ArrowRight size={15} />
              </Link>
              <Link href="/listings" className="btn-secondary-action">
                Marketplace Katalogiga O&apos;tish
              </Link>
            </div>
          </div>
        ) : (
          /* Form Card */
          <div className="apply-form-card">
            {/* Header */}
            <div className="form-header-area">
              <div className="header-icon-badge">
                <Gamepad2 size={24} className="text-blue" />
              </div>
              <h1 className="form-title">Akkaunt Sotish Uchun E&apos;lon Joylash</h1>
              <p className="form-subtitle">
                eFootball akkauntingiz ma&apos;lumotlarini kiriting. Admin tasdiqlashi bilan e&apos;loningiz ommaviy marketplacega chiqadi va sizga sotuvchi maqomi beriladi.
              </p>
            </div>

            {error && (
              <div className="form-error-banner">
                <AlertCircle size={16} className="text-rose" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="apply-form">
              {/* Sarlavha */}
              <div className="form-group">
                <label className="form-label" htmlFor="f-title">
                  E&apos;lon Sarlavhasi <span className="req">*</span>
                </label>
                <input
                  id="f-title"
                  type="text"
                  required
                  placeholder="masalan: 106 Epic Messi + 105 CR7 Booster + 3250 Team Strength"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              {/* Platform & Price Grid */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="f-platform">
                    Platforma <span className="req">*</span>
                  </label>
                  <select
                    id="f-platform"
                    value={form.platform}
                    onChange={(e) =>
                      setForm({ ...form, platform: e.target.value })
                    }
                    className="form-select"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="f-price">
                    Narx ($ USD) <span className="req">*</span>
                  </label>
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">$</span>
                    <input
                      id="f-price"
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      placeholder="masalan: 45"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      className="form-input has-prefix"
                    />
                  </div>
                </div>
              </div>

              {/* Team Rating (OVR) & GP Coins */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="f-ovr">
                    Jamoa Kuchliligi (Team OVR)
                  </label>
                  <input
                    id="f-ovr"
                    type="number"
                    placeholder="masalan: 3220"
                    value={form.team_rating}
                    onChange={(e) =>
                      setForm({ ...form, team_rating: e.target.value })
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="f-coins">
                    Mavjud Coin / GP Balans
                  </label>
                  <input
                    id="f-coins"
                    type="number"
                    placeholder="masalan: 2500000"
                    value={form.coin_balance}
                    onChange={(e) =>
                      setForm({ ...form, coin_balance: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
              </div>

              {/* Key Players */}
              <div className="form-group">
                <label className="form-label" htmlFor="f-players">
                  Asosiy Yulduz O&apos;yinchilar (vergul bilan ajrating)
                </label>
                <input
                  id="f-players"
                  type="text"
                  placeholder="masalan: 106 Messi, 105 CR7, 104 Ronaldinho, 103 Vieira"
                  value={form.key_players}
                  onChange={(e) =>
                    setForm({ ...form, key_players: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="f-desc">
                  Akkaunt Haqida Qo&apos;shimcha Tavsif
                </label>
                <textarea
                  id="f-desc"
                  rows={3}
                  placeholder="Konami ID toza, email to'liq topshiriladi, barcha linkinglar bo'sh..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="form-textarea"
                />
              </div>

              {/* Image URL / Skrinshot */}
              <div className="form-group">
                <label className="form-label" htmlFor="f-img">
                  Akkaunt Skrinshoti (Rasm Havolasi yoki Unsplash)
                </label>
                <div className="input-icon-wrap">
                  <ImageIcon size={16} className="input-icon" />
                  <input
                    id="f-img"
                    type="url"
                    placeholder="https://... (ixtiyoriy, kiritilmasa standart fon o'rnatiladi)"
                    value={form.image_url}
                    onChange={(e) =>
                      setForm({ ...form, image_url: e.target.value })
                    }
                    className="form-input has-icon"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="f-tg">
                    Telegram Foydalanuvchi Nomi
                  </label>
                  <div className="input-icon-wrap">
                    <Send size={15} className="input-icon" />
                    <input
                      id="f-tg"
                      type="text"
                      placeholder="@username"
                      value={form.telegram_username}
                      onChange={(e) =>
                        setForm({ ...form, telegram_username: e.target.value })
                      }
                      className="form-input has-icon"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="f-phone">
                    Telefon Raqam (Aloqa uchun)
                  </label>
                  <div className="input-icon-wrap">
                    <Phone size={15} className="input-icon" />
                    <input
                      id="f-phone"
                      type="text"
                      placeholder="+998 90 123 45 67"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="form-input has-icon"
                    />
                  </div>
                </div>
              </div>

              {/* Escrow note */}
              <div className="escrow-guarantee-note">
                <ShieldCheck size={16} className="text-emerald" />
                <span>
                  Barcha savdolar 100% Escrow kafolati ostida amalga oshiriladi.
                  Mablag&apos; xaridor akkauntni to&apos;liq qabul qilib
                  tasdiqlagandan keyingina sizning hisobingizga o&apos;tkaziladi.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="submit-listing-btn"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" /> E&apos;lon
                    yuborilmoqda...
                  </>
                ) : (
                  <>
                    E&apos;lonni Yuborish (Moderatsiyaga) <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        .apply-page-root {
          padding-top: 104px;
          padding-bottom: 80px;
          min-height: 100vh;
        }
        .apply-loading-screen {
          padding-top: 140px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: rgba(156, 163, 175, 0.85);
          font-size: 14px;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: rgba(156, 163, 175, 0.85);
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 20px;
          transition: color 0.15s ease;
        }
        .back-link:hover {
          color: #FFF;
        }

        /* Form Card */
        .apply-form-card {
          background: rgba(10, 16, 32, 0.72);
          backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 22px;
          padding: 36px 40px;
        }
        .form-header-area {
          margin-bottom: 28px;
        }
        .header-icon-badge {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(37, 99, 235, 0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }
        .form-title {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #FFF;
          margin: 0 0 6px 0;
          letter-spacing: -0.025em;
        }
        .form-subtitle {
          font-size: 13.5px;
          color: rgba(156, 163, 175, 0.85);
          line-height: 1.55;
          margin: 0;
        }

        .form-error-banner {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 16px;
          border-radius: 10px;
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.25);
          color: #FB7185;
          font-size: 13.5px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .apply-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .form-label {
          font-size: 13px;
          font-weight: 600;
          color: rgba(229, 231, 235, 0.9);
        }
        .req {
          color: #FB7185;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 11px;
          padding: 11px 14px;
          font-size: 14px;
          color: #FFF;
          font-family: 'Inter', sans-serif;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: rgba(37, 99, 235, 0.6);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
          background: rgba(37, 99, 235, 0.04);
        }
        .form-select {
          cursor: pointer;
        }
        .form-select option {
          background: #0B1020;
          color: #FFF;
        }
        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .input-prefix-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-prefix {
          position: absolute;
          left: 14px;
          color: rgba(156, 163, 175, 0.8);
          font-weight: 700;
          font-size: 14px;
        }
        .form-input.has-prefix {
          padding-left: 30px;
        }

        .input-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: rgba(156, 163, 175, 0.7);
        }
        .form-input.has-icon {
          padding-left: 40px;
        }

        .escrow-guarantee-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(16, 185, 129, 0.08);
          color: rgba(209, 213, 219, 0.9);
          font-size: 12.5px;
          line-height: 1.55;
          margin-top: 4px;
        }

        .submit-listing-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px 20px;
          margin-top: 8px;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          color: #FFF;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(37, 99, 235, 0.38);
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .submit-listing-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(37, 99, 235, 0.55);
        }
        .submit-listing-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Success Card */
        .apply-success-card {
          background: rgba(10, 16, 32, 0.72);
          backdrop-filter: blur(28px);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 22px;
          padding: 40px 36px;
          text-align: center;
        }
        .success-icon-wrap {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        .success-title {
          font-family: 'Outfit', sans-serif;
          font-size: 23px;
          font-weight: 800;
          color: #FFF;
          margin: 0 0 10px 0;
        }
        .success-desc {
          font-size: 14px;
          color: rgba(209, 213, 219, 0.85);
          line-height: 1.6;
          max-width: 540px;
          margin: 0 auto 24px;
        }
        .success-benefits-list {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 14px;
          padding: 18px 22px;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 540px;
          margin: 0 auto 30px;
        }
        .benefit-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          color: rgba(229, 231, 235, 0.95);
        }
        .benefit-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34D399;
          flex-shrink: 0;
        }
        .success-actions-row {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 14px;
        }
        .btn-primary-action {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 12px 22px;
          border-radius: 10px;
          background: #2563EB;
          color: #FFF;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.18s ease;
        }
        .btn-primary-action:hover {
          background: #1D4ED8;
          transform: translateY(-1px);
        }
        .btn-secondary-action {
          display: inline-flex;
          align-items: center;
          padding: 12px 20px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          color: #FFF;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.18s ease;
        }
        .btn-secondary-action:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .text-blue { color: #60A5FA; }
        .text-emerald { color: #34D399; }
        .text-rose { color: #FB7185; }

        @media (max-width: 640px) {
          .apply-form-card { padding: 26px 20px; }
          .form-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
