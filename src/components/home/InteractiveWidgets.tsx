"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  ChevronDown,
  Zap,
  ShieldCheck,
  CircleDollarSign,
  ArrowRight,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight,
  Flame,
  Coins,
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

/* ─── Real eFootball Coin Pricing Constants (2026 Market Rates) ──── */
// 1 USD = 13,000 UZS
const UZS_EXCHANGE_RATE = 13000;

export const REAL_COIN_PACKS = [
  { label: "520", coins: 520, priceUsd: 4.20, discount: null },
  { label: "1,050", coins: 1050, priceUsd: 7.90, discount: "🔥 Ommabop" },
  { label: "2,130", coins: 2130, priceUsd: 14.90, discount: "-5%" },
  { label: "3,250", coins: 3250, priceUsd: 21.90, discount: "-8%" },
  { label: "5,700", coins: 5700, priceUsd: 36.90, discount: "-12%" },
  { label: "12,800", coins: 12800, priceUsd: 78.90, discount: "-18%" },
];

/**
 * Calculates price for any coin amount based on market tiered rates.
 */
function calculateUsdFromCoinCount(coins: number): number {
  if (coins <= 0) return 0;
  // Base tier: $0.0076 per coin
  let rate = 0.0076;
  if (coins >= 12000) rate = 0.00616; // ~18% discount
  else if (coins >= 5000) rate = 0.00647; // ~12% discount
  else if (coins >= 3000) rate = 0.00674; // ~8% discount
  else if (coins >= 2000) rate = 0.0070; // ~5% discount
  else if (coins >= 1000) rate = 0.00752;

  return Math.max(0.99, Number((coins * rate).toFixed(2)));
}

function calculateCoinsFromUsdAmount(usd: number): number {
  if (usd <= 0) return 0;
  let rate = 0.0075;
  if (usd >= 70) rate = 0.00616;
  else if (usd >= 35) rate = 0.00647;
  else if (usd >= 20) rate = 0.00674;
  else if (usd >= 14) rate = 0.0070;

  return Math.round(usd / rate);
}

/* ─── CoinCalculator Component (100% Real eFootball Rates) ──────── */
export function CoinCalculator() {
  const router = useRouter();

  // Selected coin pack or custom amount
  const [selectedCoins, setSelectedCoins] = useState<number>(1050);
  const [usdAmount, setUsdAmount] = useState<number>(7.90);

  const [isUsdFocused, setIsUsdFocused] = useState(false);
  const [isCoinFocused, setIsCoinFocused] = useState(false);

  const [usdEditText, setUsdEditText] = useState("");
  const [coinEditText, setCoinEditText] = useState("");

  const handleCoinChange = (valStr: string) => {
    setCoinEditText(valStr);
    const n = parseInt(valStr.replace(/[^0-9]/g, ""), 10) || 0;
    setSelectedCoins(n);
    const matchedPack = REAL_COIN_PACKS.find((p) => p.coins === n);
    if (matchedPack) {
      setUsdAmount(matchedPack.priceUsd);
    } else {
      setUsdAmount(calculateUsdFromCoinCount(n));
    }
  };

  const handleUsdChange = (valStr: string) => {
    setUsdEditText(valStr);
    const usd = parseFloat(valStr.replace(/[^0-9.]/g, "")) || 0;
    setUsdAmount(usd);
    const calcCoins = calculateCoinsFromUsdAmount(usd);
    setSelectedCoins(calcCoins);
  };

  const handleSelectPack = (pack: typeof REAL_COIN_PACKS[0]) => {
    setSelectedCoins(pack.coins);
    setUsdAmount(pack.priceUsd);
    setCoinEditText(pack.coins.toString());
    setUsdEditText(pack.priceUsd.toFixed(2));
  };

  const uzsTotal = Math.round(usdAmount * UZS_EXCHANGE_RATE);
  const uzsFormatted = uzsTotal.toLocaleString("uz-UZ");

  const displayedUsd = isUsdFocused
    ? usdEditText
    : usdAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const displayedCoins = isCoinFocused
    ? coinEditText
    : selectedCoins.toLocaleString("en-US");

  return (
    <div
      style={{
        background: "rgba(10, 16, 32, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 28px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "rgba(37, 99, 235, 0.15)",
              border: "1px solid rgba(37, 99, 235, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Coins size={20} color="var(--accent-primary)" />
          </div>
          <div>
            <h3
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 17,
                fontWeight: 800,
                color: "#FFF",
                margin: 0,
              }}
            >
              eFootball™ Coins Kalkulyatori
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
              Konami ID orqali lahzali va 100% xavfsiz to&apos;lov
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--accent-emerald)",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            padding: "4px 10px",
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
          1 USD ≈ 13,000 so&apos;m
        </span>
      </div>

      {/* Inputs Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 48px 1fr",
          alignItems: "stretch",
        }}
        className="calc-grid"
      >
        {/* Left: To'laysiz (USD) */}
        <div style={{ padding: "24px 28px", minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 10,
            }}
          >
            To&apos;laysiz (Narx)
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: isUsdFocused
                ? "rgba(37, 99, 235, 0.12)"
                : "rgba(255, 255, 255, 0.04)",
              border: isUsdFocused
                ? "1px solid var(--accent-primary)"
                : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius-md)",
              padding: "10px 16px",
              gap: 10,
              transition: "all 0.15s ease",
            }}
          >
            <input
              type="text"
              inputMode="decimal"
              value={displayedUsd}
              onChange={(e) => handleUsdChange(e.target.value)}
              onFocus={() => {
                setIsUsdFocused(true);
                setUsdEditText(usdAmount > 0 ? usdAmount.toFixed(2) : "");
              }}
              onBlur={() => setIsUsdFocused(false)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 24,
                fontWeight: 800,
                color: "#FFF",
                width: "100%",
                minWidth: 0,
              }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--accent-primary)",
                background: "rgba(37, 99, 235, 0.15)",
                border: "1px solid rgba(37, 99, 235, 0.3)",
                padding: "4px 10px",
                borderRadius: 8,
              }}
            >
              USD ($)
            </span>
          </div>

          <div style={{ marginTop: 8, fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 500 }}>
            ≈ <strong>{uzsFormatted}</strong> so&apos;m
          </div>
        </div>

        {/* Center Swap Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 1,
              height: "100%",
              background: "rgba(255, 255, 255, 0.06)",
              position: "absolute",
            }}
          />
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(10, 16, 32, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              zIndex: 2,
            }}
          >
            <ArrowLeftRight size={15} color="var(--text-secondary)" />
          </div>
        </div>

        {/* Right: Olasiz (eFootball Coins) */}
        <div style={{ padding: "24px 28px", minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 10,
            }}
          >
            Olasiz (Coins)
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: isCoinFocused
                ? "rgba(245, 158, 11, 0.12)"
                : "rgba(255, 255, 255, 0.04)",
              border: isCoinFocused
                ? "1px solid var(--accent-amber)"
                : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius-md)",
              padding: "10px 16px",
              gap: 10,
              transition: "all 0.15s ease",
            }}
          >
            <input
              type="text"
              inputMode="numeric"
              value={displayedCoins}
              onChange={(e) => handleCoinChange(e.target.value)}
              onFocus={() => {
                setIsCoinFocused(true);
                setCoinEditText(selectedCoins > 0 ? selectedCoins.toString() : "");
              }}
              onBlur={() => setIsCoinFocused(false)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 24,
                fontWeight: 800,
                color: "#FFF",
                width: "100%",
                minWidth: 0,
              }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--accent-amber)",
                background: "rgba(245, 158, 11, 0.15)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                padding: "4px 10px",
                borderRadius: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <CoinIcon size={14} /> Coins
            </span>
          </div>

          <div style={{ marginTop: 8, fontSize: 12.5, color: "var(--text-muted)" }}>
            eFootball™ 2026 Balans
          </div>
        </div>
      </div>

      {/* Quick Select Preset Packs */}
      <div
        style={{
          padding: "16px 28px",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginRight: 4,
          }}
        >
          Paketlar:
        </span>
        {REAL_COIN_PACKS.map((pack) => {
          const isSelected = selectedCoins === pack.coins;
          return (
            <button
              key={pack.coins}
              type="button"
              onClick={() => handleSelectPack(pack)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 999,
                border: isSelected
                  ? "1.5px solid var(--accent-primary)"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                background: isSelected
                  ? "rgba(37, 99, 235, 0.25)"
                  : "rgba(255, 255, 255, 0.03)",
                color: isSelected ? "#FFF" : "var(--text-secondary)",
                fontSize: 13,
                fontWeight: isSelected ? 800 : 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              <CoinIcon size={13} color={isSelected ? "#FFF" : "#FBBF24"} />
              <span>{pack.label}</span>
              {pack.discount && (
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    color: isSelected ? "#FFF" : "var(--accent-emerald)",
                    background: isSelected
                      ? "var(--accent-emerald)"
                      : "rgba(16, 185, 129, 0.15)",
                    padding: "1px 5px",
                    borderRadius: 4,
                  }}
                >
                  {pack.discount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Trust & Action CTA */}
      <div style={{ padding: "20px 28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-secondary)" }}>
            <Zap size={14} className="text-amber" />
            <span>Yetkazib berish: <strong>15-30 daqiqa</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-secondary)" }}>
            <ShieldCheck size={14} className="text-emerald" />
            <span>Escrow Kafolati: <strong>100% Himoyalangan</strong></span>
          </div>
        </div>

        <a
          href={`https://t.me/efzone_admin?text=${encodeURIComponent(
            `Assalomu alaykum! Men eFootball 2026 uchun ${selectedCoins.toLocaleString()} Coin ($${usdAmount.toFixed(2)} / ${uzsFormatted} so'm) xarid qilmoqchiman.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{
            width: "100%",
            padding: "14px",
            fontSize: 15,
            fontWeight: 700,
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <Send size={16} />
          <span>Coin Xarid Qilish ({selectedCoins.toLocaleString()} Coins — ${usdAmount.toFixed(2)})</span>
          <ArrowRight size={16} />
        </a>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .calc-grid {
            grid-template-columns: 1fr !important;
            gap: 12px;
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
  const priceUzs = Math.round(currentListing.price * UZS_EXCHANGE_RATE).toLocaleString("uz-UZ");
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
