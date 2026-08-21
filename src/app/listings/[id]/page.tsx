import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle,
  Star,
  Gamepad2,
  Monitor,
  Smartphone,
  Zap,
  Sparkles,
  Award,
  Lock,
  MessageCircle,
  HelpCircle,
  Share2,
  ShieldCheck,
  ArrowRight,
  Coins,
} from "lucide-react";
import { fetchListingById } from "@/lib/dataService";
import { getPlatformLabel, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await fetchListingById(id);
  if (!listing) return { title: "E'lon topilmadi | EFZone" };
  return {
    title: `${listing.title} | EFZone Marketplace`,
    description: listing.description || `eFootball hisob — $${listing.price}`,
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await fetchListingById(id);

  if (!listing) notFound();

  const isAccount = listing.type === "account";
  const UZS_EXCHANGE_RATE = 13000;
  const priceUzs = Math.round(listing.price * UZS_EXCHANGE_RATE).toLocaleString("uz-UZ");

  const platformIcons: Record<string, any> = {
    ps: Gamepad2,
    xbox: Gamepad2,
    pc: Monitor,
    mobile: Smartphone,
  };
  const PlatformIcon = platformIcons[listing.platform] || Gamepad2;

  const hasImage =
    listing.images &&
    listing.images.length > 0 &&
    typeof listing.images[0] === "string" &&
    listing.images[0].trim() !== "";

  return (
    <div className="listing-detail-root">
      <div className="container detail-container">
        {/* Breadcrumb Navigation */}
        <div className="detail-breadcrumb">
          <Link href="/listings" className="breadcrumb-back-link">
            <ArrowLeft size={14} /> E&apos;lonlar
          </Link>
          <span className="sep">/</span>
          <Link
            href={`/listings?platform=${listing.platform}`}
            className="breadcrumb-platform-link"
          >
            {getPlatformLabel(listing.platform)}
          </Link>
          <span className="sep">/</span>
          <span className="breadcrumb-current-title">{listing.title}</span>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="detail-main-grid">
          {/* Left Column: Image Gallery, Specs, Details */}
          <div className="detail-content-left">
            {/* Hero Image Showcase */}
            <div className="detail-hero-image-box">
              {hasImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.images![0]}
                  alt={listing.title}
                  className="detail-main-img"
                />
              ) : (
                <div className="detail-fallback-banner">
                  <div className="fallback-bg-art" />
                  <div className="fallback-meta">
                    <span className="fallback-pill">
                      <PlatformIcon size={14} /> {getPlatformLabel(listing.platform)}
                    </span>
                    <span className="fallback-ovr-text">
                      {listing.team_rating ? `${listing.team_rating} OVR Rating` : "eFootball Hisob"}
                    </span>
                  </div>
                </div>
              )}

              {/* Floating Badges */}
              <div className="hero-top-badges">
                <span className="badge-platform-tag">
                  <PlatformIcon size={13} /> {getPlatformLabel(listing.platform)}
                </span>
                {listing.team_rating && (
                  <span className="badge-ovr-tag">
                    🔥 {listing.team_rating} OVR
                  </span>
                )}
              </div>

              <div className="hero-bottom-guarantee">
                <ShieldCheck size={14} className="text-emerald" />
                <span>100% Escrow Himoyalangan</span>
              </div>
            </div>

            {/* Title & Key Specs Header */}
            <div className="detail-title-card">
              <h1 className="detail-main-heading">{listing.title}</h1>

              {/* Specs Grid */}
              <div className="detail-specs-grid">
                {listing.team_rating && (
                  <div className="spec-stat-card">
                    <span className="stat-label">Jamoa Reytingi</span>
                    <span className="stat-value text-blue">
                      ⭐ {listing.team_rating}
                    </span>
                  </div>
                )}
                {listing.coin_balance && (
                  <div className="spec-stat-card">
                    <span className="stat-label">Coin Balansi</span>
                    <span className="stat-value text-amber">
                      🪙 {listing.coin_balance.toLocaleString()}
                    </span>
                  </div>
                )}
                {listing.gp_balance && (
                  <div className="spec-stat-card">
                    <span className="stat-label">GP Balans</span>
                    <span className="stat-value">
                      ⚽ {(listing.gp_balance / 1000000).toFixed(1)}M GP
                    </span>
                  </div>
                )}
                <div className="spec-stat-card">
                  <span className="stat-label">Yetkazib Berish</span>
                  <span className="stat-value text-emerald">
                    <Clock size={15} /> {listing.delivery_time || "15-30 daqiqa"}
                  </span>
                </div>
              </div>

              {/* Key Featured Players */}
              {listing.key_players && listing.key_players.length > 0 && (
                <div className="featured-players-box">
                  <div className="box-title-row">
                    <Award size={17} className="text-amber" />
                    <span>Tarkibdagi Sara Yulduzlar</span>
                  </div>
                  <div className="players-chip-grid">
                    {listing.key_players.map((player) => (
                      <div key={player} className="player-badge-chip">
                        <Sparkles size={14} className="text-blue" />
                        <span>{player}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Box */}
              <div className="detail-desc-box">
                <h3 className="desc-heading">E&apos;lon Haqida Batafsil</h3>
                <div className="desc-content">
                  {listing.description || "Ushbu akkount to'liq tekshirilgan va xarid qilishga tayyor."}
                </div>
              </div>

              {/* Guarantee Card */}
              <div className="escrow-guarantee-card">
                <div className="guarantee-head">
                  <ShieldCheck size={20} className="text-emerald" />
                  <span className="guarantee-title">
                    Xaridor Xavfsizlik Kafolati (Escrow)
                  </span>
                </div>
                <div className="guarantee-items-grid">
                  <div className="guarantee-point">
                    <CheckCircle size={15} className="text-emerald" />
                    <span>Konami ID to&apos;liq topshiriladi</span>
                  </div>
                  <div className="guarantee-point">
                    <CheckCircle size={15} className="text-emerald" />
                    <span>Pochta o&apos;zgartirish imkoniyati</span>
                  </div>
                  <div className="guarantee-point">
                    <CheckCircle size={15} className="text-emerald" />
                    <span>24 soat nizo ochish huquqi</span>
                  </div>
                  <div className="guarantee-point">
                    <CheckCircle size={15} className="text-emerald" />
                    <span>100% pul qaytarish kafolati</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Purchase Box */}
          <div className="detail-checkout-sidebar">
            <div className="checkout-action-card">
              <div className="price-summary-row">
                <div className="price-meta-label">Xarid Narxi</div>
                <div className="price-hero-stack">
                  <span className="price-big-usd">${listing.price}</span>
                  <span className="price-sub-uzs">≈ {priceUzs} so&apos;m</span>
                </div>
              </div>

              <div className="checkout-checklist">
                <div className="check-row">
                  <span className="label">Platforma</span>
                  <span className="val">{getPlatformLabel(listing.platform)}</span>
                </div>
                <div className="check-row">
                  <span className="label">Yetkazib berish</span>
                  <span className="val text-emerald">
                    {listing.delivery_time || "15-30 daqiqa"}
                  </span>
                </div>
                <div className="check-row">
                  <span className="label">Kafolat muddati</span>
                  <span className="val">24 soat to&apos;liq himoya</span>
                </div>
              </div>

              {/* Buy Button */}
              <Link
                href={`/checkout/${listing.id}`}
                className="btn-instant-buy"
              >
                <Lock size={17} />
                <span>Hoziroq Xarid Qilish</span>
                <ArrowRight size={16} />
              </Link>

              {/* Seller Information */}
              <div className="seller-summary-block">
                <div className="seller-block-label">Sotuvchi Ma&apos;lumotlari</div>
                <div className="seller-profile-row">
                  <div className="seller-bubble-av">
                    {(listing.seller?.full_name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div className="seller-info-stack">
                    <div className="seller-verified-name">
                      <span>{listing.seller?.full_name || "Tasdiqlangan Sotuvchi"}</span>
                      <ShieldCheck size={14} className="text-emerald" />
                    </div>
                    <div className="seller-sub-stats">
                      5.0 ⭐ · 100% Ishonchli Sotuvchi
                    </div>
                  </div>
                </div>

                {listing.seller?.telegram_username && (
                  <a
                    href={`https://t.me/${listing.seller.telegram_username.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="seller-tg-btn"
                  >
                    <MessageCircle size={14} />
                    <span>Sotuvchiga Savol Berish (@{listing.seller.telegram_username.replace("@", "")})</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .listing-detail-root {
          padding-top: 88px;
          min-height: 100vh;
          background: #030712;
          color: #FFF;
          font-family: 'Inter', sans-serif;
        }

        .detail-container {
          padding-top: 24px;
          padding-bottom: 80px;
        }

        .detail-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          font-size: 13.5px;
          color: rgba(156, 163, 175, 0.8);
          flex-wrap: wrap;
        }
        .breadcrumb-back-link, .breadcrumb-platform-link {
          color: rgba(209, 213, 219, 0.85);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.15s;
        }
        .breadcrumb-back-link:hover, .breadcrumb-platform-link:hover {
          color: #60A5FA;
        }
        .breadcrumb-current-title {
          color: #FFF;
          font-weight: 600;
        }
        .sep { color: rgba(156, 163, 175, 0.4); }

        .detail-main-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
          align-items: start;
        }

        .detail-hero-image-box {
          width: 100%;
          height: 360px;
          border-radius: 24px;
          overflow: hidden;
          background: rgba(10, 16, 32, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .detail-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .detail-fallback-banner {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #091228 0%, #152244 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .fallback-bg-art {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .fallback-meta {
          position: relative;
          z-index: 2;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .fallback-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(37, 99, 235, 0.25);
          border: 1px solid rgba(59, 130, 246, 0.4);
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          color: #93C5FD;
          font-weight: 700;
        }
        .fallback-ovr-text {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #FFF;
        }

        .hero-top-badges {
          position: absolute;
          top: 14px;
          left: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 3;
        }
        .badge-platform-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(8, 14, 30, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #FFF;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 8px;
        }
        .badge-ovr-tag {
          background: #F59E0B;
          color: #000;
          font-size: 12px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 8px;
        }

        .hero-bottom-guarantee {
          position: absolute;
          bottom: 14px;
          right: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(8, 14, 30, 0.88);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #34D399;
          font-size: 12px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 8px;
          z-index: 3;
        }

        .detail-title-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .detail-main-heading {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(22px, 3vw, 30px);
          font-weight: 800;
          color: #FFF;
          line-height: 1.25;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .detail-specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 12px;
        }
        .spec-stat-card {
          background: rgba(10, 16, 32, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .stat-label {
          font-size: 11px;
          color: rgba(156, 163, 175, 0.8);
          font-weight: 600;
        }
        .stat-value {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #FFF;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .featured-players-box {
          background: rgba(10, 16, 32, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 18px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .box-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #FFF;
        }
        .players-chip-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .player-badge-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(37, 99, 235, 0.12);
          border: 1px solid rgba(37, 99, 235, 0.25);
          color: #93C5FD;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
        }

        .detail-desc-box {
          background: rgba(10, 16, 32, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 18px;
          padding: 20px 22px;
        }
        .desc-heading {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #FFF;
          margin: 0 0 10px 0;
        }
        .desc-content {
          font-size: 14px;
          color: rgba(209, 213, 219, 0.9);
          line-height: 1.65;
          white-space: pre-line;
        }

        .escrow-guarantee-card {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(37, 99, 235, 0.06) 100%);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 18px;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .guarantee-head {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .guarantee-title {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #FFF;
        }
        .guarantee-items-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          font-size: 12.5px;
          color: rgba(209, 213, 219, 0.85);
        }
        .guarantee-point {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        /* Sidebar Checkout Card */
        .detail-checkout-sidebar {
          position: sticky;
          top: 100px;
        }
        .checkout-action-card {
          background: rgba(10, 16, 32, 0.9);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 24px 50px -10px rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .price-summary-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .price-meta-label {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(156, 163, 175, 0.7);
        }
        .price-hero-stack {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .price-big-usd {
          font-family: 'Outfit', sans-serif;
          font-size: 36px;
          font-weight: 900;
          color: #34D399;
          line-height: 1;
        }
        .price-sub-uzs {
          font-size: 13px;
          color: rgba(156, 163, 175, 0.8);
        }

        .checkout-checklist {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 14px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .check-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
        }
        .check-row .label { color: rgba(156, 163, 175, 0.8); }
        .check-row .val { font-weight: 600; color: #FFF; }

        .btn-instant-buy {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          border-radius: 14px;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          color: #FFF;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.45);
          transition: transform 0.2s;
        }
        .btn-instant-buy:hover {
          transform: translateY(-1.5px);
        }

        .seller-summary-block {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 8px;
        }
        .seller-block-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(156, 163, 175, 0.6);
        }
        .seller-profile-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .seller-bubble-av {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #10B981;
          color: #FFF;
          font-weight: 800;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .seller-info-stack {
          display: flex;
          flex-direction: column;
        }
        .seller-verified-name {
          font-size: 14px;
          font-weight: 700;
          color: #FFF;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .seller-sub-stats {
          font-size: 11.5px;
          color: rgba(156, 163, 175, 0.7);
        }
        .seller-tg-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(37, 99, 235, 0.1);
          color: #60A5FA;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
        }

        /* Responsive Breakpoint */
        @media (max-width: 900px) {
          .detail-main-grid {
            grid-template-columns: 1fr;
          }
          .detail-hero-image-box {
            height: 240px;
          }
          .guarantee-items-grid {
            grid-template-columns: 1fr;
          }
          .detail-checkout-sidebar {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}
