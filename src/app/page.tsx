import Link from "next/link";
import {
  Shield,
  Zap,
  ArrowRight,
  Star,
  CheckCircle2,
  TrendingUp,
  Users,
  Package,
  Clock,
  Sparkles,
  Lock,
  Gamepad2,
  Coins,
  DollarSign,
  ThumbsUp,
} from "lucide-react";
import { fetchListings, fetchStats } from "@/lib/dataService";
import { ListingCard } from "@/components/listings/ListingCard";
import { HeroFeaturedGlassCard, TournamentsTeaser } from "@/components/home/InteractiveWidgets";

export default async function HomePage() {
  const [{ listings }, stats] = await Promise.all([
    fetchListings({ perPage: 8 }),
    fetchStats(),
  ]);

  return (
    <div style={{ overflowX: "hidden", background: "transparent" }}>
      {/* Cinematic Custom Video Background Hero Section */}
      <section
      style={{
          position: "relative",
          paddingTop: 180,
          paddingBottom: 25,
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-start",
          background: "transparent",
        }}
        className="hero-section"
      >
        {/* User's Custom MP4 Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-bg.jpg"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 35%",
            filter: "brightness(0.85) contrast(1.1)",
            transform: "scale(1.02)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
            zIndex: 1,
          }}
        >
          <source src="/try_what_you_can.mp4" type="video/mp4" />
        </video>

        {/* Crisp Gradient Overlay (Video clearly visible) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(4, 7, 17, 0.25) 0%, rgba(4, 7, 17, 0.6) 70%, #040711 100%), linear-gradient(90deg, rgba(4, 7, 17, 0.75) 0%, rgba(4, 7, 17, 0.3) 60%, rgba(4, 7, 17, 0.6) 100%)",
            zIndex: 2,
          }}
        />

        {/* Hero Content Container */}
        <div className="container hero-inner-container" style={{ position: "relative", zIndex: 10 }}>
          {/* Main 2-Column Grid */}
          <div className="hero-grid">
            {/* Left Column: Natural Headline & Action Buttons */}
            <div className="hero-left-content">
              {/* Badge */}
              <div className="hero-market-badge">
                <Zap size={14} color="#60A5FA" fill="#60A5FA" />
                <span>eFootball™ 2026 Rasmiy Marketplace</span>
              </div>

              {/* Natural Refined Title */}
              <h1 className="hero-main-title">
                eFootball Akauntlari & Turnirlar{" "}
                <span className="hero-accent-text">Kafolatlangan</span> Narxda
              </h1>

              <p className="hero-sub-text">
                Saralangan o&apos;yinchilarga ega tayyor hisoblar hamda sovrinli chempionatlarni 100% Escrow himoyasi bilan xavfsiz va qulay kashf qiling.
              </p>

              {/* Action CTAs */}
              <div className="hero-cta-buttons">
                <Link href="/listings" className="hero-btn-primary">
                  <Gamepad2 size={16} />
                  <span>Akauntlarni Ko&apos;rish</span>
                  <ArrowRight size={15} />
                </Link>
                <a href="#turnirlar" className="hero-btn-secondary">
                  <Sparkles size={16} color="#FBBF24" />
                  <span>🏆 Turnirlar (Tez Kunda)</span>
                </a>
              </div>
            </div>

            {/* Right Column: Live Featured Hot Deal Glass Card */}
            <div className="hero-right-card">
              <HeroFeaturedGlassCard listings={listings} />
            </div>
          </div>

          {/* Full-Width Stats Row with Count-Up Animation */}
          <div className="stats-grid">
            {[
              {
                label: "Bajarilgan Savdolar",
                value: stats.orders > 0 ? `${stats.orders.toLocaleString()}+` : "1,250+",
                icon: CheckCircle2,
                color: "#34D399",
                delay: "0s",
              },
              {
                label: "Mavjud E'lonlar",
                value: stats.listings > 0 ? `${stats.listings.toLocaleString()}+` : `${listings.length > 0 ? listings.length : "50"}+`,
                icon: Package,
                color: "#60A5FA",
                delay: "0.1s",
              },
              {
                label: "Faol Sotuvchilar",
                value: stats.sellers > 0 ? `${stats.sellers}+` : "45+",
                icon: Users,
                color: "#FBBF24",
                delay: "0.2s",
              },
              {
                label: "Qoniqqan Xaridorlar",
                value: "99%",
                icon: ThumbsUp,
                color: "#A78BFA",
                delay: "0.3s",
              },
            ].map((stat, idx, arr) => (
              <div
                key={stat.label}
                className="stat-card-item"
                style={{
                  animation: `statFadeUp 0.6s ease both`,
                  animationDelay: stat.delay,
                }}
              >
                <div className="stat-value-row">
                  <stat.icon size={20} color={stat.color} />
                  <span>{stat.value}</span>
                </div>
                <div className="stat-label-text">{stat.label}</div>
              </div>
            ))}
          </div>
          <style>{`
            @keyframes statFadeUp {
              from { opacity: 0; transform: translateY(12px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            .hero-market-badge {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 6px 14px;
              border-radius: 999px;
              background: rgba(37, 99, 235, 0.25);
              border: 1px solid rgba(59, 130, 246, 0.45);
              backdrop-filter: blur(12px);
              margin-bottom: 18px;
              font-size: 13px;
              font-weight: 600;
              color: #FFF;
            }
            .hero-main-title {
              font-family: 'Outfit', sans-serif;
              font-size: clamp(26px, 3.8vw, 44px);
              font-weight: 800;
              line-height: 1.18;
              color: #FFF;
              margin: 0 0 16px 0;
              letter-spacing: -0.02em;
              text-shadow: 0 2px 20px rgba(0, 0, 0, 0.8);
            }
            .hero-accent-text {
              background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .hero-sub-text {
              font-size: clamp(14px, 1.4vw, 16.5px);
              color: rgba(255, 255, 255, 0.88);
              line-height: 1.6;
              margin: 0 0 26px 0;
              max-width: 520px;
              text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
            }
            .hero-cta-buttons {
              display: flex;
              gap: 12px;
              flex-wrap: wrap;
            }
            .hero-btn-primary {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              font-size: 14px;
              font-weight: 700;
              padding: 12px 24px;
              border-radius: 12px;
              background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
              color: #FFF;
              text-decoration: none;
              box-shadow: 0 4px 20px rgba(37, 99, 235, 0.45);
              transition: transform 0.2s;
            }
            .hero-btn-primary:hover {
              transform: translateY(-1.5px);
            }
            .hero-btn-secondary {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              font-size: 14px;
              font-weight: 600;
              padding: 12px 22px;
              border-radius: 12px;
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 255, 255, 0.12);
              backdrop-filter: blur(12px);
              color: #FFF;
              text-decoration: none;
              transition: background 0.2s;
            }
            .hero-btn-secondary:hover {
              background: rgba(255, 255, 255, 0.14);
            }

            .hero-grid {
              display: grid;
              grid-template-columns: 1fr 400px;
              gap: 40px;
              align-items: center;
              margin-bottom: 40px;
            }
            .stats-grid {
              padding-top: 20px;
              border-top: 1px solid rgba(255, 255, 255, 0.07);
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 16px;
            }
            .stat-card-item {
              padding: 12px 18px;
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              background: rgba(255, 255, 255, 0.02);
              border-radius: 12px;
            }
            .stat-value-row {
              font-family: 'Outfit', sans-serif;
              font-size: 28px;
              font-weight: 900;
              color: #FFF;
              display: flex;
              align-items: center;
              gap: 8px;
              letter-spacing: -0.02em;
              line-height: 1;
            }
            .stat-label-text {
              font-size: 12.5px;
              color: rgba(209, 213, 219, 0.75);
              margin-top: 6px;
              font-weight: 500;
            }

            @media (max-width: 900px) {
              .hero-section { padding-top: 80px !important; padding-bottom: 20px !important; }
              .hero-grid { grid-template-columns: 1fr !important; gap: 24px !important; margin-bottom: 28px !important; }
              .hero-right-card { display: none !important; }
              .stats-grid {
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 10px !important;
                padding-top: 16px !important;
              }
              .stat-card-item {
                background: rgba(10, 16, 32, 0.6) !important;
                border: 1px solid rgba(255, 255, 255, 0.06) !important;
                padding: 12px 14px !important;
              }
              .stat-value-row {
                font-size: 22px !important;
              }
              .hero-cta-buttons {
                flex-direction: column;
                width: 100%;
              }
              .hero-btn-primary, .hero-btn-secondary {
                width: 100%;
                justify-content: center;
              }
            }
          `}</style>
        </div>
      </section>

      {/* Featured Listings Section (Seamless Transparent Background) */}
      <section style={{ padding: "64px 0", background: "transparent" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span className="badge badge-blue">
                  <Sparkles size={12} /> Marketplace Rekomendatsiyasi
                </span>
              </div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(22px, 3.2vw, 32px)", fontWeight: 800, color: "#FFF" }}>
                Sara eFootball Takliflari
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
                Eng mashhur va kuchli jamoa tarkibiga ega hisoblar
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/seller/apply" className="btn btn-secondary btn-sm">
                <Gamepad2 size={14} /> + Akkaunt Sotish
              </Link>
              <Link href="/listings" className="btn btn-primary btn-sm">
                Barcha E&apos;lonlar <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {listings.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "rgba(10, 16, 32, 0.6)",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}>
              <Package size={36} color="var(--text-muted)" />
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: "#FFF", margin: 0 }}>
                Hozircha faol e&apos;lonlar yo&apos;q
              </h3>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: 0, maxWidth: 460 }}>
                Birinchi bo&apos;lib o&apos;z eFootball akkauntingizni sotuvga qo&apos;ying yoki admin panel orqali e&apos;lonlarni tasdiqlang.
              </p>
              <Link href="/seller/apply" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                <Gamepad2 size={15} /> Akkaunt Sotish E&apos;loni Joylash
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing as any} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tournaments Teaser Arena Section (Replaces Old Coin Calculator) */}
      <section style={{ padding: "16px 0 64px", background: "transparent" }}>
        <div className="container">
          <TournamentsTeaser />
        </div>
      </section>

      {/* Seamless Escrow Guarantee Section */}
      <section style={{ padding: "64px 0 32px", background: "transparent" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 40px" }}>
            <span className="badge badge-emerald" style={{ marginBottom: 10 }}>
              <Shield size={12} /> 100% Escrow Kafolati
            </span>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(22px, 3.2vw, 32px)", fontWeight: 800, color: "#FFF", marginBottom: 10 }}>
              Xavfsiz Savdo Qoidalari
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
              Pulingiz to&apos;g&apos;ridan-to&apos;g&apos;ri sotuvchiga o&apos;tmaydi — u platforma hisobida xavfsiz muzlatib saqlanadi.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32 }}>
            {[
              {
                step: "01",
                icon: Shield,
                title: "Tanlang va To'lang",
                desc: "Ma'qul e'lonni tanlab Payme, Click yoki Uzcard orqali to'lov qilasiz. Pul platformada muzlatiladi.",
                color: "var(--accent-primary)",
              },
              {
                step: "02",
                icon: Clock,
                title: "Tezkor Topshirish (15 min)",
                desc: "Sotuvchi Konami ID ma'lumotlarini yoki Coin'larni 15-30 daqiqa ichida yetkazadi.",
                color: "#FBBF24",
              },
              {
                step: "03",
                icon: CheckCircle2,
                title: "Tekshirib Tasdiqlang",
                desc: "Hisobga kirib ma'lumotlarni tekshirib tasdiqlaysiz. Shundagina pul sotuvchiga o'tadi.",
                color: "var(--accent-emerald)",
              },
            ].map((item) => (
              <div key={item.step} style={{ padding: "12px" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <item.icon size={22} color={item.color} />
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: "#FFF", marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
