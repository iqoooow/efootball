"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Sparkles,
  Flame,
  Star,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Bell,
  CheckCircle2,
  Calendar,
  DollarSign,
  Gamepad2,
  Medal,
  Crown,
  Swords,
  Layers,
  Send,
} from "lucide-react";
import Link from "next/link";
import type { Listing } from "@/lib/types";

/* ─── Custom Clean Coin Icon Component ───────────────────────────── */
export function CoinIcon({
  size = 16,
  color = "#FBBF24",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v12M15 9.5a2.5 2.5 0 0 0-5 0c0 2.5 5 2.5 5 5a2.5 2.5 0 0 1-5 0" />
    </svg>
  );
}

/* ─── TournamentsTeaser (Ultra-Premium "Tez Kunda" Cybersport Arena) ─ */
export function TournamentsTeaser() {
  const [selectedFormat, setSelectedFormat] = useState<number>(0);
  const [contactInput, setContactInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const tournaments = [
    {
      id: "weekend-pro",
      title: "Weekend Pro Cup (1v1)",
      tag: "🔥 Eng Kutilayotgan",
      badgeColor: "#FBBF24",
      prize: "$300 + 3,900,000 so'm",
      format: "Play-off (Olympic System), Best of 3",
      slots: "64 ishtirokchi",
      platform: "📱 Mobile (iOS / Android)",
      duration: "Har shanba va yakshanba",
      desc: "Haftaning eng kuchli eFootball ustalari o'rtasidagi shiddatli to'qnashuv. 1-o'rin uchun to'g'ridan-to'g'ri naqd pul mukofoti.",
      rules: ["100% Escrow kafolatlangan fond", "Avtomatlashgan hisob-kitob", "Jonli translatsiya"],
    },
    {
      id: "champions-league",
      title: "eFootball National League",
      tag: "👑 Katta Chempionat",
      badgeColor: "#60A5FA",
      prize: "$1,000+ Grand Prize",
      format: "Guruh bosqichi + Grand Final",
      slots: "128 ishtirokchi",
      platform: "🎮 Barcha platformalar",
      duration: "Mavsumiy (1 oy)",
      desc: "O'zbekistonning eng nufuzli kiberfutbol chempionati. Rasmiy kubok va reyting ochkolari jamg'armasi.",
      rules: ["Rasmiy Cybersport reytingi", "Eksklyuziv chempionlik kubogi", "Cyber Rating oshishi"],
    },
    {
      id: "daily-blitz",
      title: "Fast Blitz Cup (Kunlik)",
      tag: "⚡ Tezkor Turnir",
      badgeColor: "#34D399",
      prize: "$50 (Kunlik tezkor yutuq)",
      format: "16 kishilik Single Elimination",
      slots: "16 ishtirokchi",
      platform: "📱 Mobile & 🎮 PS5",
      duration: "Har kuni 20:00 da",
      desc: "Vaqtingiz kammi? 1 soat ichida g'olib bo'ling va sovrinni bir zumda Payme yoki Click orqali qabul qiling.",
      rules: ["15 daqiqada yakun", "Tezkor to'lov kafolati", "Barcha darajadagi o'yinchilar"],
    },
  ];

  const currentT = tournaments[selectedFormat];

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
    }, 600);
  };

  return (
    <div className="tournaments-teaser-root" id="turnirlar">
      {/* Ambient Glows */}
      <div className="teaser-glow-amber" />
      <div className="teaser-glow-blue" />

      {/* Header */}
      <div className="teaser-header">
        <div className="teaser-badge-row">
          <span className="teaser-badge">
            <Trophy size={13} className="text-amber" />
            <span>eFootball™ 2026 Cybersport Arena</span>
            <span className="soon-pill">TEZ KUNDA</span>
          </span>
        </div>

        <h2 className="teaser-title">
          Sovrinli Turnirlar va Professional Chempionatlar
        </h2>
        <p className="teaser-subtitle">
          eFootball Zone platformasida yaqin kunlarda O&apos;zbekistonning eng katta mukofot jamg&apos;armasiga ega haftalik va kunlik kiberfutbol ligalari start oladi.
        </p>
      </div>

      {/* Interactive Showcase Grid */}
      <div className="teaser-main-card">
        {/* Left: Tournament Format Selector Tabs */}
        <div className="teaser-tabs-column">
          <div className="column-title">Rejalashtirilgan Turnir Formatlari</div>

          <div className="tabs-list">
            {tournaments.map((t, idx) => {
              const isActive = idx === selectedFormat;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedFormat(idx)}
                  className={`tournament-tab-btn ${isActive ? "active" : ""}`}
                >
                  <div className="tab-btn-header">
                    <span className="tab-tag" style={{ color: t.badgeColor }}>
                      {t.tag}
                    </span>
                    <span className="tab-status-chip">Tez kunda</span>
                  </div>
                  <div className="tab-name">{t.title}</div>
                  <div className="tab-prize-row">
                    <Medal size={13} className="text-amber" />
                    <span>{t.prize}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Format Showcase & Early Access Form */}
        <div className="teaser-detail-column">
          <div className="detail-top-card">
            <div className="detail-header-flex">
              <div>
                <span className="detail-category-tag">{currentT.tag}</span>
                <h3 className="detail-title">{currentT.title}</h3>
              </div>

              <div className="detail-prize-box">
                <div className="prize-label">Sovrin Jamg&apos;armasi</div>
                <div className="prize-amount">{currentT.prize}</div>
              </div>
            </div>

            <p className="detail-description">{currentT.desc}</p>

            {/* Spec grid */}
            <div className="detail-specs-grid">
              <div className="spec-card">
                <div className="spec-icon-box">
                  <Swords size={16} className="text-blue" />
                </div>
                <div className="spec-info">
                  <span className="spec-label">Format:</span>
                  <span className="spec-val">{currentT.format}</span>
                </div>
              </div>

              <div className="spec-card">
                <div className="spec-icon-box">
                  <Users size={16} className="text-emerald" />
                </div>
                <div className="spec-info">
                  <span className="spec-label">Ishtirokchilar:</span>
                  <span className="spec-val">{currentT.slots}</span>
                </div>
              </div>

              <div className="spec-card">
                <div className="spec-icon-box">
                  <Gamepad2 size={16} className="text-amber" />
                </div>
                <div className="spec-info">
                  <span className="spec-label">Platforma:</span>
                  <span className="spec-val">{currentT.platform}</span>
                </div>
              </div>

              <div className="spec-card">
                <div className="spec-icon-box">
                  <Calendar size={16} className="text-purple" />
                </div>
                <div className="spec-info">
                  <span className="spec-label">Vaqti:</span>
                  <span className="spec-val">{currentT.duration}</span>
                </div>
              </div>
            </div>

            {/* Feature Checkpoints */}
            <div className="rules-check-list">
              {currentT.rules.map((rule, i) => (
                <div key={i} className="rule-item">
                  <CheckCircle2 size={14} className="text-emerald" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Early Access Notification Form */}
          <div className="early-access-box">
            <div className="access-info-row">
              <div className="access-title-wrapper">
                <div className="access-title-header">
                  <div className="access-icon-bubble">
                    <Bell size={16} className="text-amber" />
                  </div>
                  <span className="access-title">Turnirlar ochilishidan xabardor bo&apos;ling</span>
                </div>
                <p className="access-sub">
                  Telegram username yoki emailingizni qoldiring va ilk turnirga eksklyuziv taklifnoma oling.
                </p>
              </div>
            </div>

            {subscribed ? (
              <div className="access-success-box animate-fade-in">
                <CheckCircle2 size={20} className="text-emerald" />
                <div>
                  <strong>Arizangiz qabul qilindi!</strong> Turnir ro&apos;yxatdan o&apos;tishi ochilgach, sizga birinchi bo&apos;lib xabar yuboriladi.
                </div>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="access-form">
                <input
                  type="text"
                  required
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  placeholder="@username yoki emailingiz..."
                  className="access-input"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="access-submit-btn"
                >
                  {loading ? (
                    "Yuborilmoqda..."
                  ) : (
                    <>
                      <span>Taklifnoma Olish</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Feature Guarantee Row */}
      <div className="teaser-features-row">
        <div className="teaser-feature-pill">
          <ShieldCheck size={16} className="text-emerald" />
          <span>100% Escrow Kafolatlangan Sovrin Jamg&apos;armasi</span>
        </div>
        <div className="teaser-feature-pill">
          <Zap size={16} className="text-amber" />
          <span>Avtomatlashgan To&apos;lov (Payme / Click / Uzcard)</span>
        </div>
        <div className="teaser-feature-pill">
          <Trophy size={16} className="text-blue" />
          <span>Milliy Cybersport Reyting Jadvali</span>
        </div>
      </div>

      {/* Embedded CSS */}
      <style>{`
        .tournaments-teaser-root {
          position: relative;
          background: rgba(8, 14, 32, 0.78);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          padding: 40px 36px;
          box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.75);
          overflow: hidden;
        }

        .teaser-glow-amber {
          position: absolute;
          top: -120px;
          right: -80px;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .teaser-glow-blue {
          position: absolute;
          bottom: -100px;
          left: -80px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .teaser-header {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 34px auto;
        }
        .teaser-badge-row {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }
        .teaser-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 14px;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 999px;
          font-size: 12.5px;
          font-weight: 700;
          color: #FFF;
        }
        .soon-pill {
          background: #F59E0B;
          color: #000;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 6px;
          letter-spacing: 0.04em;
        }
        .teaser-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(24px, 3.2vw, 34px);
          font-weight: 800;
          color: #FFF;
          line-height: 1.2;
          margin: 0 0 10px 0;
          letter-spacing: -0.02em;
        }
        .teaser-subtitle {
          font-size: 14.5px;
          color: rgba(209, 213, 219, 0.85);
          line-height: 1.55;
          margin: 0;
        }

        .teaser-main-card {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          margin-bottom: 30px;
        }

        /* Tabs Column */
        .teaser-tabs-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .column-title {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(156, 163, 175, 0.7);
          padding-left: 4px;
        }
        .tabs-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tournament-tab-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 16px 18px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tournament-tab-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
        }
        .tournament-tab-btn.active {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.18) 0%, rgba(245, 158, 11, 0.1) 100%);
          border-color: rgba(245, 158, 11, 0.4);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        .tab-btn-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tab-tag {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }
        .tab-status-chip {
          font-size: 10px;
          color: rgba(156, 163, 175, 0.8);
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
        .tab-name {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #FFF;
        }
        .tab-prize-row {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          font-weight: 700;
          color: #FBBF24;
        }

        /* Detail Column */
        .teaser-detail-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .detail-top-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 24px 26px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .detail-header-flex {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .detail-category-tag {
          font-size: 11px;
          font-weight: 800;
          color: #FBBF24;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .detail-title {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #FFF;
          margin: 4px 0 0 0;
        }
        .detail-prize-box {
          text-align: right;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: 12px;
          padding: 8px 14px;
        }
        .prize-label {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          color: rgba(245, 158, 11, 0.85);
        }
        .prize-amount {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #FBBF24;
        }
        .detail-description {
          font-size: 13.5px;
          color: rgba(209, 213, 219, 0.9);
          line-height: 1.55;
          margin: 0;
        }

        .detail-specs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .spec-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .spec-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .spec-info {
          display: flex;
          flex-direction: column;
        }
        .spec-label {
          font-size: 10.5px;
          color: rgba(156, 163, 175, 0.7);
        }
        .spec-val {
          font-size: 12.5px;
          font-weight: 700;
          color: #FFF;
        }

        .rules-check-list {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .rule-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: rgba(229, 231, 235, 0.9);
        }

        /* Early Access Box */
        .early-access-box {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%);
          border: 1px solid rgba(37, 99, 235, 0.3);
          border-radius: 18px;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .access-info-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .access-title-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .access-icon-bubble {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .access-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #FFF;
          line-height: 1.3;
        }
        .access-sub {
          font-size: 12px;
          color: rgba(209, 213, 219, 0.85);
          margin: 0;
          line-height: 1.45;
        }
        .access-form {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .access-input {
          flex: 1;
          background: rgba(6, 11, 26, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 11px 16px;
          font-size: 13.5px;
          color: #FFF;
          outline: none;
          transition: border-color 0.2s;
        }
        .access-input:focus {
          border-color: #60A5FA;
        }
        .access-submit-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 11px 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          border: none;
          color: #FFF;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(37, 99, 235, 0.35);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .access-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(37, 99, 235, 0.5);
        }
        .access-success-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          font-size: 13px;
          color: #FFF;
        }

        /* Bottom Feature Pills */
        .teaser-features-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          padding-top: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .teaser-feature-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(209, 213, 219, 0.85);
          background: rgba(255, 255, 255, 0.03);
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* Color classes */
        .text-amber { color: #FBBF24; }
        .text-blue { color: #60A5FA; }
        .text-emerald { color: #34D399; }
        .text-purple { color: #C084FC; }

        @media (max-width: 900px) {
          .tournaments-teaser-root {
            padding: 20px 14px;
            border-radius: 20px;
          }
          .teaser-title {
            font-size: 22px;
          }
          .teaser-subtitle {
            font-size: 13px;
          }
          .teaser-main-card {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .teaser-tabs-column {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
          }
          .column-title {
            padding-left: 0;
            margin-bottom: 2px;
          }
          .tabs-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
          }
          .tournament-tab-btn {
            width: 100%;
            padding: 12px 14px;
            border-radius: 14px;
            box-sizing: border-box;
          }
          .tab-name {
            font-size: 14px;
          }
          .tab-prize-row {
            font-size: 12px;
          }
          .detail-top-card {
            padding: 16px 14px;
            border-radius: 16px;
          }
          .detail-header-flex {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .detail-title {
            font-size: 18px;
          }
          .detail-prize-box {
            text-align: left;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .detail-specs-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .rules-check-list {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .early-access-box {
            padding: 16px 14px;
            border-radius: 16px;
          }
          .access-info-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .access-icon-bubble {
            width: 30px;
            height: 30px;
          }
          .access-title {
            font-size: 14px;
            line-height: 1.35;
          }
          .access-sub {
            font-size: 11.5px;
            line-height: 1.45;
          }
          .access-form {
            flex-direction: column;
            width: 100%;
            gap: 8px;
          }
          .access-input {
            width: 100%;
            box-sizing: border-box;
            font-size: 13px;
            padding: 10px 14px;
          }
          .access-submit-btn {
            width: 100%;
            justify-content: center;
            font-size: 13px;
            padding: 10px 16px;
          }
          .teaser-features-row {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          .teaser-feature-pill {
            width: 100%;
            justify-content: center;
            font-size: 11.5px;
            padding: 8px 12px;
            text-align: center;
            box-sizing: border-box;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── HeroFeaturedGlassCard (100% Dynamic Multi-Item Carousel) ─── */
interface HeroFeaturedProps {
  listings?: Listing[];
}

export function HeroFeaturedGlassCard({ listings = [] }: HeroFeaturedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const UZS_EXCHANGE_RATE = 13000;

  // Filter to active listings or fallback
  const items = listings.length > 0 ? listings.slice(0, 5) : [];

  // Auto cycle every 5 seconds if multiple items
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  // Fallback if database has 0 active listings
  if (items.length === 0) {
    return (
      <div
        className="animate-float"
        style={{
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "var(--radius-xl)",
          padding: "24px",
          boxShadow: "0 25px 50px -15px rgba(0, 0, 0, 0.6)",
          width: "100%",
          maxWidth: 400,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span className="badge badge-emerald" style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6 }}>
            <Sparkles size={12} /> TOP TAKLIF #1
          </span>
          <span style={{ fontSize: 12, color: "#FBBF24", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
            <Star size={13} fill="#FBBF24" color="#FBBF24" /> 5.0 (Kafolatlangan)
          </span>
        </div>

        <div
          style={{
            height: 140,
            borderRadius: 12,
            overflow: "hidden",
            position: "relative",
            marginBottom: 16,
            backgroundImage: "url('/hero-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "rgba(11, 15, 23, 0.6)" }} />
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: 12 }}>
            <span className="badge badge-blue" style={{ fontSize: 10, marginBottom: 4 }}>
              📱 Mobile (iOS / Android)
            </span>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "#FFF" }}>
              106 BigTime Messi
            </div>
            <div style={{ fontSize: 12, color: "var(--accent-emerald)", fontWeight: 700, marginTop: 2 }}>
              + 105 Booster CR7 (3250 Rating)
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
          <span>🔥 3250 Team Strength</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <CoinIcon size={13} color="#FBBF24" /> 14.5M GP Balans
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--border-light)" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>E&apos;lon Narxi</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#FFF", fontFamily: "'Outfit', sans-serif" }}>
              $65 <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 400 }}>≈ 845,000 so&apos;m</span>
            </div>
          </div>
          <Link href="/listings" className="btn btn-primary btn-sm" style={{ borderRadius: 10 }}>
            Ko&apos;rish <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  // Active item from real Supabase listings
  const currentListing = items[currentIndex] || items[0];
  const priceUzs = Math.round(currentListing.price * UZS_EXCHANGE_RATE)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const platformLabel =
    currentListing.platform === "mobile"
      ? "📱 Mobile (iOS / Android)"
      : currentListing.platform === "ps"
      ? "🎮 PlayStation"
      : currentListing.platform === "pc"
      ? "💻 PC / Steam"
      : "🎮 Xbox";

  return (
    <div
      className="animate-float"
      style={{
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "var(--radius-xl)",
        padding: "24px",
        boxShadow: "0 25px 50px -15px rgba(0, 0, 0, 0.6)",
        width: "100%",
        maxWidth: 400,
        position: "relative",
      }}
    >
      {/* Top Header: Badge + Star Rating + Carousel Nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span className="badge badge-emerald" style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6 }}>
          <Sparkles size={12} /> TOP TAKLIF #{currentIndex + 1}
        </span>

        {items.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              onClick={handlePrev}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label="Oldingi e'lon"
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>
              {currentIndex + 1}/{items.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label="Keyingi e'lon"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Main Image Visual Card */}
      <div
        style={{
          height: 140,
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
          marginBottom: 14,
          backgroundImage: `url('${currentListing.images?.[0] || "/hero-bg.jpg"}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(11, 15, 23, 0.65)" }} />
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "10px 16px" }}>
          <span className="badge badge-blue" style={{ fontSize: 10, marginBottom: 4 }}>
            {platformLabel}
          </span>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 18,
              fontWeight: 900,
              color: "#FFF",
              lineHeight: 1.2,
            }}
          >
            {currentListing.title}
          </div>
          {currentListing.key_players && currentListing.key_players.length > 0 && (
            <div style={{ fontSize: 12, color: "var(--accent-emerald)", fontWeight: 700, marginTop: 3 }}>
              ⭐ {currentListing.key_players.slice(0, 2).join(" • ")}
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "var(--text-secondary)",
          marginBottom: 14,
        }}
      >
        <span>
          🔥 {currentListing.team_rating ? `${currentListing.team_rating} OVR Rating` : "eFootball Hisob"}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <CoinIcon size={13} color="#FBBF24" />
          {currentListing.gp_balance
            ? `${(currentListing.gp_balance / 1000000).toFixed(1)}M GP`
            : "100% Kafolat"}
        </span>
      </div>

      {/* Price and CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 14,
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>
            E&apos;lon Narxi
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#FFF",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            ${currentListing.price}{" "}
            <span style={{ fontSize: 11.5, color: "var(--text-secondary)", fontWeight: 400 }}>
              ≈ {priceUzs} so&apos;m
            </span>
          </div>
        </div>

        <Link
          href={`/listings/${currentListing.id}`}
          className="btn btn-primary btn-sm"
          style={{ borderRadius: 10, padding: "8px 16px" }}
        >
          Ko&apos;rish <ArrowRight size={14} />
        </Link>
      </div>

      {/* Pagination Indicator Dots */}
      {items.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 12 }}>
          {items.map((_, idx) => (
            <span
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: idx === currentIndex ? 16 : 6,
                height: 6,
                borderRadius: 999,
                background: idx === currentIndex ? "var(--accent-primary)" : "rgba(255, 255, 255, 0.2)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
