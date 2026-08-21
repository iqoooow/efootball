"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Monitor,
  Gamepad2,
  Smartphone,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle,
  ThumbsUp,
  Info,
  Layers,
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
  const props = { size: 12 };
  switch (platform) {
    case "ps":
    case "xbox":
      return <Gamepad2 {...props} />;
    case "pc":
      return <Monitor {...props} />;
    case "mobile":
    default:
      return <Smartphone {...props} />;
  }
};

export function ListingCard({ listing }: ListingCardProps) {
  const UZS_EXCHANGE_RATE = 13000;
  const priceUzs = Math.round(listing.price * UZS_EXCHANGE_RATE)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const sellerName =
    listing.seller?.full_name ||
    listing.seller_id?.slice(0, 8) ||
    "eFootballSeller";

  const sellerInitial = sellerName.charAt(0).toUpperCase();

  const photoCount = listing.images ? listing.images.length : 0;

  return (
    <Link href={`/listings/${listing.id}`} className="g2g-card-link">
      <article className="g2g-card">
        {/* Background EFB Watermark like G2G */}
        <div className="g2g-watermark">EFB</div>

        {/* 1. Header Title */}
        <div className="g2g-card-header">
          <h3 className="g2g-title" title={listing.title}>
            {listing.title}
          </h3>
        </div>

        {/* 2. Trust & Sales Line (100% + Sales count) */}
        <div className="g2g-trust-row">
          <span className="g2g-trust-badge">
            <ThumbsUp size={11} />
            <span>100%</span>
          </span>
          <span className="g2g-sales-text">
            {(listing as any).sold_count ? `${(listing as any).sold_count} Sotilgan` : "Kafolatlangan"}
          </span>
          {photoCount > 0 && (
            <span className="g2g-photos-tag">
              <Layers size={10} />
              <span>{photoCount} rasm</span>
            </span>
          )}
        </div>

        {/* 3. Specs Bar (Min. 1, Delivery Time, Platform) */}
        <div className="g2g-specs-bar">
          <span className="spec-label">Min. 1</span>
          <span className="spec-dot">•</span>
          <span className="spec-delivery">
            <Zap size={11} className="text-amber" />
            <span>{listing.delivery_time || "10-15 min"}</span>
          </span>
          <span className="spec-dot">•</span>
          <span className="spec-platform">
            <PlatformIcon platform={listing.platform} />
            <span>{getPlatformLabel(listing.platform)}</span>
          </span>
          {listing.team_rating ? (
            <>
              <span className="spec-dot">•</span>
              <span className="spec-ovr">🔥 {listing.team_rating} OVR</span>
            </>
          ) : null}
        </div>

        {/* 4. Seller Row (Avatar, Name, Verified Level) */}
        <div className="g2g-seller-row">
          <div className="seller-avatar-bubble">
            <span>{sellerInitial}</span>
            <span className="seller-online-dot" />
          </div>
          <div className="seller-meta">
            <div className="seller-name-line">
              <span className="seller-name">{sellerName}</span>
              <CheckCircle size={12} className="seller-verified-icon" />
            </div>
            <span className="seller-level">
              Lvl. {listing.seller?.seller_status === "approved" ? "99 Pro" : "45"}
            </span>
          </div>
        </div>

        {/* 5. Footer: Price & Action Button */}
        <div className="g2g-card-footer">
          <div className="g2g-price-cluster">
            <span className="price-label">Narxi</span>
            <div className="price-row">
              <span className="price-amount">{listing.price.toFixed(2)}</span>
              <span className="price-currency">USD</span>
            </div>
            <span className="price-sub-uzs">≈ {priceUzs} so&apos;m</span>
          </div>

          <div className="g2g-action-btn">
            <span>Ko&apos;rish</span>
            <ArrowRight size={13} className="action-arrow" />
          </div>
        </div>
      </article>

      <style jsx>{`
        .g2g-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
          outline: none;
          height: 100%;
        }

        .g2g-card {
          background: rgba(14, 22, 42, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 14px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          height: 100%;
          min-height: 250px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .g2g-card-link:hover .g2g-card {
          transform: translateY(-3px);
          border-color: rgba(59, 130, 246, 0.45);
          background: rgba(18, 28, 54, 0.95);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(37, 99, 235, 0.15);
        }

        /* G2G Watermark */
        .g2g-watermark {
          position: absolute;
          top: 10px;
          right: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 34px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.03);
          letter-spacing: 0.08em;
          pointer-events: none;
          user-select: none;
          transition: color 0.2s ease;
        }

        .g2g-card-link:hover .g2g-watermark {
          color: rgba(59, 130, 246, 0.08);
        }

        /* 1. Header Title */
        .g2g-card-header {
          position: relative;
          z-index: 2;
          margin-bottom: 8px;
        }

        .g2g-title {
          font-family: 'Outfit', sans-serif;
          font-size: 14.5px;
          font-weight: 700;
          color: #FFF;
          margin: 0;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 39px;
          transition: color 0.15s ease;
        }

        .g2g-card-link:hover .g2g-title {
          color: #60A5FA;
        }

        /* 2. Trust Row */
        .g2g-trust-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 11.5px;
        }

        .g2g-trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 3.5px;
          color: #34D399;
          font-weight: 700;
          background: rgba(16, 185, 129, 0.12);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .g2g-sales-text {
          color: rgba(156, 163, 175, 0.75);
          font-weight: 500;
        }

        .g2g-photos-tag {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: rgba(209, 213, 219, 0.7);
          font-size: 10.5px;
        }

        /* 3. Specs Bar */
        .g2g-specs-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 11px;
          color: rgba(156, 163, 175, 0.85);
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .spec-dot {
          color: rgba(255, 255, 255, 0.2);
        }

        .spec-delivery {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: #FBBF24;
          font-weight: 600;
        }

        .spec-platform {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: rgba(229, 231, 235, 0.9);
          font-weight: 600;
        }

        .spec-ovr {
          color: #F59E0B;
          font-weight: 700;
        }

        /* 4. Seller Row */
        .g2g-seller-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }

        .seller-avatar-bubble {
          position: relative;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          color: #FFF;
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .seller-online-dot {
          position: absolute;
          bottom: -1px;
          right: -1px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10B981;
          border: 1.5px solid #0E162B;
        }

        .seller-meta {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }

        .seller-name-line {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .seller-name {
          font-size: 12.5px;
          font-weight: 600;
          color: #FFF;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .seller-verified-icon {
          color: #38BDF8;
          flex-shrink: 0;
        }

        .seller-level {
          font-size: 10.5px;
          color: rgba(156, 163, 175, 0.7);
        }

        /* 5. Footer: Price & Button */
        .g2g-card-footer {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .g2g-price-cluster {
          display: flex;
          flex-direction: column;
        }

        .price-label {
          font-size: 10px;
          color: rgba(156, 163, 175, 0.65);
          text-transform: capitalize;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .price-amount {
          font-family: 'Outfit', sans-serif;
          font-size: 19px;
          font-weight: 800;
          color: #FFF;
          line-height: 1.1;
        }

        .price-currency {
          font-size: 11px;
          font-weight: 700;
          color: rgba(156, 163, 175, 0.85);
        }

        .price-sub-uzs {
          font-size: 10px;
          color: rgba(156, 163, 175, 0.6);
          margin-top: 2px;
        }

        /* Action Button */
        .g2g-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 14px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #FFF;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .g2g-card-link:hover .g2g-action-btn {
          background: #2563EB;
          border-color: #2563EB;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        .g2g-card-link:hover .action-arrow {
          transform: translateX(2px);
        }
        .action-arrow {
          transition: transform 0.15s ease;
        }

        .text-amber { color: #FBBF24; }
      `}</style>
    </Link>
  );
}
