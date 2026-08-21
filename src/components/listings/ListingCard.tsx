"use client";

import Link from "next/link";
import {
  Monitor,
  Gamepad2,
  Smartphone,
  Star,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { Listing } from "@/lib/types";
import { getPlatformLabel } from "@/lib/utils";

interface ListingCardProps {
  listing: Listing & {
    seller?: {
      full_name: string | null;
      seller_status: string | null;
    };
  };
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  const props = { size: 13 };
  switch (platform) {
    case "ps":
      return <Gamepad2 {...props} />;
    case "xbox":
      return <Gamepad2 {...props} />;
    case "pc":
      return <Monitor {...props} />;
    case "mobile":
      return <Smartphone {...props} />;
    default:
      return <Gamepad2 {...props} />;
  }
};

export function ListingCard({ listing }: ListingCardProps) {
  const UZS_EXCHANGE_RATE = 13000;
  const priceUzs = Math.round(listing.price * UZS_EXCHANGE_RATE).toLocaleString("uz-UZ");

  const hasImage =
    listing.images &&
    listing.images.length > 0 &&
    typeof listing.images[0] === "string" &&
    listing.images[0].trim() !== "";

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="listing-card-link-wrapper"
    >
      <div className="listing-card-root">
        {/* Thumbnail Showcase */}
        <div className="card-thumb-container">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.images![0]}
              alt={listing.title}
              className="card-thumb-img"
              loading="lazy"
            />
          ) : (
            <div className="card-thumb-fallback">
              <div className="fallback-grid-pattern" />
              <div className="fallback-content">
                <span className="fallback-badge">
                  <PlatformIcon platform={listing.platform} />
                  <span>{getPlatformLabel(listing.platform)}</span>
                </span>
                <span className="fallback-ovr">
                  {listing.team_rating ? `${listing.team_rating} OVR` : "eFootball Hisob"}
                </span>
              </div>
            </div>
          )}

          {/* Badges Over Image */}
          <div className="card-floating-badges">
            <span className="card-platform-pill">
              <PlatformIcon platform={listing.platform} />
              <span>{getPlatformLabel(listing.platform)}</span>
            </span>

            {listing.team_rating && (
              <span className="card-ovr-pill">
                🔥 {listing.team_rating} OVR
              </span>
            )}
          </div>
        </div>

        {/* Card Details Body */}
        <div className="card-body-content">
          <div className="card-title-row">
            <h3 className="card-main-title" title={listing.title}>
              {listing.title}
            </h3>
          </div>

          {/* Key Players or Stats Chips */}
          {listing.key_players && listing.key_players.length > 0 ? (
            <div className="card-stars-row">
              <span className="stars-label">⭐ Yulduzlar:</span>
              <span className="stars-names">
                {listing.key_players.slice(0, 2).join(" • ")}
              </span>
            </div>
          ) : (
            <div className="card-seller-row">
              <span className="seller-name-text">
                Sotuvchi: <strong>{listing.seller?.full_name || "Tasdiqlangan Sotuvchi"}</strong>
              </span>
            </div>
          )}

          {/* Price & Action Row */}
          <div className="card-footer-pricing">
            <div className="pricing-stack">
              <div className="price-primary">
                ${listing.price}
              </div>
              <div className="price-secondary">
                ≈ {priceUzs} so&apos;m
              </div>
            </div>

            <div className="card-view-cta">
              <span>Xarid</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .listing-card-link-wrapper {
          text-decoration: none;
          color: inherit;
          display: block;
          height: 100%;
        }

        .listing-card-root {
          background: rgba(10, 17, 36, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
        }

        .listing-card-root:hover {
          border-color: rgba(59, 130, 246, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(37, 99, 235, 0.2);
        }

        .card-thumb-container {
          height: 170px;
          position: relative;
          background: #070D1E;
          overflow: hidden;
        }

        .card-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.88) contrast(1.08);
          transition: transform 0.3s ease;
        }

        .listing-card-root:hover .card-thumb-img {
          transform: scale(1.04);
        }

        .card-thumb-fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #091228 0%, #152244 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 16px;
        }

        .fallback-grid-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
          background-size: 16px 16px;
          opacity: 0.6;
        }

        .fallback-content {
          position: relative;
          z-index: 2;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .fallback-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(37, 99, 235, 0.25);
          border: 1px solid rgba(59, 130, 246, 0.4);
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 11px;
          color: #93C5FD;
          font-weight: 700;
        }

        .fallback-ovr {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #FFF;
        }

        .card-floating-badges {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 3;
        }

        .card-platform-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(8, 14, 30, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #FFF;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .card-ovr-pill {
          background: rgba(245, 158, 11, 0.9);
          color: #000;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          box-shadow: 0 2px 10px rgba(245, 158, 11, 0.4);
        }

        .card-body-content {
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: space-between;
          gap: 12px;
        }

        .card-title-row {
          min-height: 42px;
        }

        .card-main-title {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #FFF;
          line-height: 1.35;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-stars-row {
          font-size: 12px;
          color: #93C5FD;
          background: rgba(37, 99, 235, 0.08);
          border: 1px solid rgba(37, 99, 235, 0.18);
          padding: 5px 8px;
          border-radius: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .stars-label {
          font-weight: 700;
          color: #60A5FA;
          margin-right: 4px;
        }

        .card-seller-row {
          font-size: 12px;
          color: rgba(156, 163, 175, 0.85);
        }

        .card-footer-pricing {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .pricing-stack {
          display: flex;
          flex-direction: column;
        }

        .price-primary {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #34D399;
          line-height: 1.1;
        }

        .price-secondary {
          font-size: 11px;
          color: rgba(156, 163, 175, 0.7);
          margin-top: 2px;
        }

        .card-view-cta {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(37, 99, 235, 0.15);
          border: 1px solid rgba(37, 99, 235, 0.35);
          color: #60A5FA;
          font-size: 12.5px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .listing-card-root:hover .card-view-cta {
          background: #2563EB;
          color: #FFF;
          border-color: #2563EB;
        }
      `}</style>
    </Link>
  );
}
