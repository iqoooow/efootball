"use client";

import Link from "next/link";
import { Monitor, Gamepad2, Smartphone, Star, Clock, CheckCircle2, Zap, Coins } from "lucide-react";
import type { Listing } from "@/lib/types";
import { getPlatformLabel, formatCoinAmount } from "@/lib/utils";

interface ListingCardProps {
  listing: Listing & {
    seller?: {
      full_name: string | null;
      seller_status: string | null;
    };
    _reviewStats?: {
      avg: number;
      count: number;
    };
  };
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  const props = { size: 13 };
  switch (platform) {
    case "ps": return <Gamepad2 {...props} />;
    case "xbox": return <Gamepad2 {...props} />;
    case "pc": return <Monitor {...props} />;
    case "mobile": return <Smartphone {...props} />;
    default: return <Gamepad2 {...props} />;
  }
};

export function ListingCard({ listing }: ListingCardProps) {
  const isAccount = listing.type === "account";
  const avgRating = listing._reviewStats?.avg ?? 5.0;
  const reviewCount = listing._reviewStats?.count ?? 12;

  // Calculate approximate UZS price for user convenience
  const uzsNum = Math.round(listing.price * 12800);
  const estimatedPriceUZS = uzsNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <Link
      href={`/listings/${listing.id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <div
        style={{
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "rgba(59, 130, 246, 0.35)";
          el.style.transform = "translateY(-5px)";
          el.style.boxShadow = "0 20px 45px -10px rgba(0, 0, 0, 0.6), 0 0 25px rgba(37, 99, 235, 0.15)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "rgba(255, 255, 255, 0.08)";
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "none";
        }}
      >
        {/* Thumbnail Graphic with Scrim Gradient */}
        <div
          style={{
            height: 160,
            overflow: "hidden",
            position: "relative",
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          }}
        >
          {listing.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.images[0]}
              alt={listing.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "brightness(0.85) contrast(1.1)",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: isAccount ? "rgba(37, 99, 235, 0.2)" : "rgba(245, 158, 11, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isAccount ? <Gamepad2 size={22} color="var(--accent-primary)" /> : <Coins size={22} color="var(--accent-amber)" />}
              </div>
            </div>
          )}

          {/* Bottom Dark Scrim Fade for seamless transition */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)",
            }}
          />

          {/* Frosted Type Badge */}
          <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                background: isAccount ? "rgba(37, 99, 235, 0.35)" : "rgba(16, 185, 129, 0.35)",
                backdropFilter: "blur(12px)",
                color: "#FFF",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                letterSpacing: "0.04em",
              }}
            >
              {isAccount ? "HISOB" : "COIN"}
            </span>
          </div>

          {/* Frosted Platform Badge */}
          <div style={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 9px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 600,
                background: "rgba(15, 23, 42, 0.75)",
                backdropFilter: "blur(12px)",
                color: "#FFF",
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              <PlatformIcon platform={listing.platform} />
              {getPlatformLabel(listing.platform)}
            </span>
          </div>
        </div>

        {/* Card Body Content */}
        <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            {/* Title */}
            <h3
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 15,
                fontWeight: 700,
                lineHeight: 1.4,
                marginBottom: 12,
                color: "#FFF",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                minHeight: 42,
              }}
            >
              {listing.title}
            </h3>

            {/* Clean Metrics (No nested boxes) */}
            <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap", fontSize: 12 }}>
              {isAccount && listing.team_rating && (
                <span style={{ color: "#FBBF24", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  ⭐ {listing.team_rating} Reyting
                </span>
              )}
              {isAccount && listing.coin_balance && (
                <span style={{ color: "#34D399", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  💰 {formatCoinAmount(listing.coin_balance)}
                </span>
              )}
              {!isAccount && listing.coin_amount && (
                <span style={{ color: "#FBBF24", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  🪙 {formatCoinAmount(listing.coin_amount)}
                </span>
              )}
            </div>

            {/* Key Players Minimal Tags */}
            {isAccount && listing.key_players && listing.key_players.length > 0 && (
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {listing.key_players.slice(0, 3).map((player) => (
                  <span
                    key={player}
                    style={{
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 500,
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "rgba(255, 255, 255, 0.85)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    {player}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Card Footer: Executive Price & Seller Info */}
          <div
            style={{
              paddingTop: 14,
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            {/* Price */}
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Narxi
              </div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 900, color: "#FFF" }}>
                ${listing.price.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 1 }}>
                ≈ {estimatedPriceUZS} so&apos;m
              </div>
            </div>

            {/* Seller & Rating Info */}
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginBottom: 3 }}>
                <CheckCircle2 size={13} color="var(--accent-emerald)" />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#FFF" }}>
                  {listing.seller?.full_name?.split(" ")[0] || "Jasur"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", fontSize: 11 }}>
                <span style={{ color: "#FBBF24", fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
                  <Star size={11} fill="#FBBF24" color="#FBBF24" /> {avgRating.toFixed(1)}
                </span>
                <span style={{ color: "var(--text-muted)" }}>({reviewCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
