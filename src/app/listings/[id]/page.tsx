import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle,
  Star,
  Smartphone,
  Zap,
  Sparkles,
  Award,
  Lock,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  Coins,
  KeyRound,
  Trophy,
  Check,
} from "lucide-react";
import { fetchListingById } from "@/lib/dataService";
import { getPlatformLabel, formatDate } from "@/lib/utils";
import { ListingGallery } from "@/components/listings/ListingGallery";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await fetchListingById(id);
  if (!listing) return { title: "E'lon topilmadi | EFZone" };
  return {
    title: `${listing.title} | eFootball Akkaunt Bozori`,
    description: listing.description || `eFootball 2026 hisobi — $${listing.price}`,
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await fetchListingById(id);

  if (!listing) notFound();

  const UZS_EXCHANGE_RATE = 13000;
  const priceUzs = Math.round(listing.price * UZS_EXCHANGE_RATE).toLocaleString("uz-UZ");

  return (
    <div className="g2g-detail-root">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div className="g2g-breadcrumbs">
          <Link href="/">Bosh sahifa</Link>
          <span className="crumb-sep">›</span>
          <Link href="/listings">eFootball Akkauntlari</Link>
          <span className="crumb-sep">›</span>
          <span className="crumb-active">#{listing.id.slice(0, 8)}</span>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="detail-layout-grid">
          {/* Left Column: Visual Showcase, Specs & Escrow Steps */}
          <div className="detail-left-pane">
            {/* 1. Gallery Showcase */}
            <ListingGallery
              images={listing.images}
              title={listing.title}
              platform={listing.platform}
              teamRating={listing.team_rating}
            />

            {/* 2. Main Title & Key Specs Header */}
            <div className="account-overview-card">
              <div className="overview-top-badge-row">
                <span className="platform-tag">
                  <Smartphone size={13} /> Android & iOS (Universal)
                </span>
                <span className="escrow-safe-tag">
                  <ShieldCheck size={13} className="text-emerald" /> 100% Escrow Himoyalangan
                </span>
              </div>

              <h1 className="account-main-title">{listing.title}</h1>

              {/* 6-Grid Account Specifications */}
              <div className="specs-stats-6grid">
                <div className="stat-box-card">
                  <span className="stat-lbl">Jamoa OVR</span>
                  <span className="stat-num text-amber">
                    🔥 {listing.team_rating || "3200+"} OVR
                  </span>
                </div>

                <div className="stat-box-card">
                  <span className="stat-lbl">Coin Balansi</span>
                  <span className="stat-num text-blue">
                    🪙 {listing.coin_balance ? `${listing.coin_balance.toLocaleString()} Coins` : "0 Coin"}
                  </span>
                </div>

                <div className="stat-box-card">
                  <span className="stat-lbl">GP Balans</span>
                  <span className="stat-num text-emerald">
                    ⚽ {listing.gp_balance ? `${(listing.gp_balance / 1000000).toFixed(1)}M GP` : "Mavjud"}
                  </span>
                </div>

                <div className="stat-box-card">
                  <span className="stat-lbl">Bog&apos;lanish</span>
                  <span className="stat-num">
                    🔑 Konami ID (To&apos;liq beriladi)
                  </span>
                </div>

                <div className="stat-box-card">
                  <span className="stat-lbl">Divizion</span>
                  <span className="stat-num">
                    🏆 1-Divizion Pro
                  </span>
                </div>

                <div className="stat-box-card">
                  <span className="stat-lbl">Yetkazish Tezligi</span>
                  <span className="stat-num text-emerald">
                    ⚡ {listing.delivery_time || "10-15 daqiqa"}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Featured Star Players (if present) */}
            {listing.key_players && listing.key_players.length > 0 && (
              <div className="star-players-card">
                <div className="card-section-head">
                  <Award size={18} className="text-amber" />
                  <span className="head-title">Tarkibdagi Sara Yulduzlar & Afsonalar</span>
                </div>
                <div className="players-chips-wrap">
                  {listing.key_players.map((player) => (
                    <div key={player} className="player-gold-chip">
                      <Sparkles size={14} className="text-amber" />
                      <span>{player}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Full Description & Seller Transfer Notes */}
            <div className="account-desc-card">
              <div className="card-section-head">
                <span className="head-title">E&apos;lon Tavsifi va Qoidalar</span>
              </div>
              <div className="desc-body-text">
                {listing.description || "Ushbu akkount to'liq tekshirilgan va xarid qilishga tayyor. Xariddan so'ng Konami ID pochta va paroli darhol topshiriladi."}
              </div>
            </div>

            {/* 5. 4-Step Escrow Process Timeline */}
            <div className="escrow-process-card">
              <div className="card-section-head">
                <ShieldCheck size={18} className="text-emerald" />
                <span className="head-title">Xavfsiz Xarid Qanday Amalga Oshiriladi?</span>
              </div>

              <div className="escrow-timeline-steps">
                <div className="step-item">
                  <div className="step-num">1</div>
                  <div className="step-content">
                    <h4>To&apos;lov qilasiz</h4>
                    <p>Mablag&apos;ingiz sotuvchiga o&apos;tmaydi, xavfsiz admin depozitida muzlatiladi.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-num">2</div>
                  <div className="step-content">
                    <h4>Sotuvchi ma&apos;lumotlarni beradi</h4>
                    <p>Sotuvchi sizga Konami ID login va parolini chat orqali taqdim etadi.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-num">3</div>
                  <div className="step-content">
                    <h4>Akkauntni tekshirasiz</h4>
                    <p>O&apos;yinga kirib tarkibni tekshirasiz va barcha parollarni o&apos;zingizga o&apos;zgartirasiz.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-num">4</div>
                  <div className="step-content">
                    <h4>Tasdiqlaysiz va yakunlanadi</h4>
                    <p>Siz tasdiqlaganingizdan so&apos;nggina pul sotuvchiga o&apos;tkaziladi.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky G2G Buy Box & Seller Profile */}
          <div className="detail-right-pane">
            <div className="sticky-buy-box">
              {/* Price Header */}
              <div className="buy-price-block">
                <span className="price-lbl">Xarid narxi (Escrow Kafolati bilan)</span>
                <div className="price-row-main">
                  <span className="price-usd">${listing.price}</span>
                  <span className="price-cur">USD</span>
                </div>
                <span className="price-uzs">≈ {priceUzs} so&apos;m</span>
              </div>

              {/* Trust Checkpoints */}
              <div className="buy-trust-checklist">
                <div className="trust-item">
                  <Check size={14} className="text-emerald" />
                  <span>100% Escrow xavfsiz to&apos;lov tizimi</span>
                </div>
                <div className="trust-item">
                  <Check size={14} className="text-emerald" />
                  <span>24 soatlik to&apos;liq pul qaytarish kafolati</span>
                </div>
                <div className="trust-item">
                  <Check size={14} className="text-emerald" />
                  <span>Tezkor yetkazish ({listing.delivery_time || "10-15 daqiqa"})</span>
                </div>
              </div>

              {/* Primary Buy CTA Button */}
              <Link href={`/checkout/${listing.id}`} className="btn-g2g-buy-cta">
                <Lock size={17} />
                <span>Hoziroq Xarid Qilish</span>
                <ArrowRight size={17} />
              </Link>

              {/* Seller Profile Block */}
              <div className="buy-seller-section">
                <div className="seller-label-muted">Sotuvchi Ma&apos;lumotlari</div>
                <div className="seller-card-row">
                  <div className="seller-avatar-initial">
                    {(listing.seller?.full_name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div className="seller-details-stack">
                    <div className="seller-name-row">
                      <span className="seller-name">{listing.seller?.full_name || "Pro Seller"}</span>
                      <ShieldCheck size={14} className="text-blue" />
                    </div>
                    <span className="seller-rating-pill">⭐ 5.0 · 100% Ishonchli Sotuvchi</span>
                  </div>
                </div>

                {listing.seller?.telegram_username && (
                  <a
                    href={`https://t.me/${listing.seller.telegram_username.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-seller-tg-chat"
                  >
                    <MessageCircle size={15} />
                    <span>Telegramda bog&apos;lanish (@{listing.seller.telegram_username.replace("@", "")})</span>
                  </a>
                )}
              </div>

              {/* Buyer Guarantee Box */}
              <div className="buyer-protection-note">
                <Shield size={16} className="text-emerald" />
                <p>
                  Sizning pulingiz xavfsiz. Akkauntni qabul qilib olib, to&apos;liq tasdiqlamaguningizcha mablag&apos; admin depozitida saqlanadi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .g2g-detail-root {
          padding: 104px 0 80px 0;
          min-height: 100vh;
        }

        /* Breadcrumbs */
        .g2g-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: rgba(156, 163, 175, 0.75);
          margin-bottom: 24px;
        }
        .g2g-breadcrumbs a {
          color: rgba(156, 163, 175, 0.75);
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .g2g-breadcrumbs a:hover {
          color: #FFF;
        }
        .crumb-sep {
          color: rgba(255, 255, 255, 0.2);
        }
        .crumb-active {
          color: #60A5FA;
          font-weight: 600;
        }

        /* Main 2-Column Layout */
        .detail-layout-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 28px;
          align-items: start;
        }

        .detail-left-pane {
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 0;
        }

        /* Account Overview Card */
        .account-overview-card {
          background: rgba(14, 22, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .overview-top-badge-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .platform-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 12px;
          font-weight: 600;
          color: #FFF;
        }

        .escrow-safe-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          font-size: 12px;
          font-weight: 700;
          color: #34D399;
        }

        .account-main-title {
          font-family: 'Outfit', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #FFF;
          margin: 0;
          line-height: 1.3;
        }

        /* 6-Grid Stats */
        .specs-stats-6grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .stat-box-card {
          background: rgba(6, 11, 24, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-lbl {
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 600;
          color: rgba(156, 163, 175, 0.75);
          letter-spacing: 0.04em;
        }

        .stat-num {
          font-family: 'Outfit', sans-serif;
          font-size: 14.5px;
          font-weight: 700;
          color: #FFF;
        }

        /* Star Players Card */
        .star-players-card, .account-desc-card, .escrow-process-card {
          background: rgba(14, 22, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 22px 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .card-section-head {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .head-title {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #FFF;
        }

        .players-chips-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .player-gold-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #FCD34D;
          font-size: 13px;
          font-weight: 700;
        }

        .desc-body-text {
          font-size: 14px;
          color: rgba(209, 213, 219, 0.9);
          line-height: 1.6;
          white-space: pre-line;
        }

        /* 4-Step Escrow Timeline */
        .escrow-timeline-steps {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .step-item {
          display: flex;
          gap: 12px;
          background: rgba(6, 11, 24, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 14px;
        }

        .step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #2563EB;
          color: #FFF;
          font-size: 12px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .step-content h4 {
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px;
          font-weight: 700;
          color: #FFF;
          margin: 0 0 3px 0;
        }

        .step-content p {
          font-size: 12px;
          color: rgba(156, 163, 175, 0.85);
          margin: 0;
          line-height: 1.4;
        }

        /* Right Sticky Buy Box */
        .detail-right-pane {
          position: sticky;
          top: 104px;
          align-self: start;
        }

        .sticky-buy-box {
          background: rgba(14, 22, 42, 0.9);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
        }

        .buy-price-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .price-lbl {
          font-size: 11.5px;
          color: rgba(156, 163, 175, 0.8);
          font-weight: 500;
        }

        .price-row-main {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .price-usd {
          font-family: 'Outfit', sans-serif;
          font-size: 36px;
          font-weight: 900;
          color: #34D399;
          line-height: 1;
        }

        .price-cur {
          font-size: 15px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.7);
        }

        .price-uzs {
          font-size: 13px;
          color: rgba(156, 163, 175, 0.85);
          font-weight: 500;
        }

        .buy-trust-checklist {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: rgba(209, 213, 219, 0.9);
        }

        .btn-g2g-buy-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          color: #FFF;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.45);
          transition: all 0.2s ease;
        }
        .btn-g2g-buy-cta:hover {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(37, 99, 235, 0.6);
        }

        .buy-seller-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .seller-label-muted {
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 600;
          color: rgba(156, 163, 175, 0.7);
        }

        .seller-card-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .seller-avatar-initial {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
          color: #FFF;
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .seller-name-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .seller-name {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #FFF;
        }

        .seller-rating-pill {
          font-size: 11.5px;
          color: rgba(156, 163, 175, 0.85);
        }

        .btn-seller-tg-chat {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #60A5FA;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .btn-seller-tg-chat:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #FFF;
        }

        .buyer-protection-note {
          display: flex;
          gap: 10px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 12px;
          padding: 12px;
        }

        .buyer-protection-note p {
          font-size: 11.5px;
          color: rgba(209, 213, 219, 0.85);
          margin: 0;
          line-height: 1.4;
        }

        .text-emerald { color: #34D399; }
        .text-amber { color: #FBBF24; }
        .text-blue { color: #60A5FA; }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .detail-layout-grid {
            grid-template-columns: 1fr;
          }
          .detail-right-pane {
            position: static;
          }
          .specs-stats-6grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .specs-stats-6grid {
            grid-template-columns: 1fr;
          }
          .escrow-timeline-steps {
            grid-template-columns: 1fr;
          }
          .account-main-title {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
