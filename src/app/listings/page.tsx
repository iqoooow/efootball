import { Suspense } from "react";
import {
  PackageOpen,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  SlidersHorizontal,
  Gamepad2,
  Smartphone,
  Monitor,
  Sparkles,
  Zap,
  Gift,
  Search,
  CheckCircle,
  Flame,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { fetchListings } from "@/lib/dataService";
import { ListingCard } from "@/components/listings/ListingCard";
import { FilterSidebar } from "@/components/listings/FilterSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "eFootball Akkauntlar Bozori | G2G eFootball Zone",
  description: "eFootball 2026 eng kuchli akkauntlari, coinlar va kiberfutbol hisoblari rasmiy kafolat bilan.",
};

interface SearchParams {
  type?: string;
  platform?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  search?: string;
  page?: string;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const { listings, total, perPage } = await fetchListings({
    type: params.type,
    platform: params.platform,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    sort: params.sort,
    search: params.search,
    page,
    perPage: 16,
  });

  const totalPages = Math.ceil(total / perPage);

  // eFootball Mobile Account Categories Ribbon Data
  const popularBrands = [
    {
      name: "Barcha Akkauntlar",
      watermark: "ALL",
      count: `${total} ta e'lon`,
      active: !params.type && !params.minPrice && !params.maxPrice && !params.search && (!params.sort || params.sort === "newest"),
      link: "/listings",
    },
    {
      name: "3200+ Top OVR",
      watermark: "OVR",
      count: "Kuchli tarkiblar",
      active: params.search === "3200",
      link: "/listings?search=3200",
    },
    {
      name: "Epic & BigTime",
      watermark: "EPIC",
      count: "Afsonaviy kartalar",
      active: params.search === "Epic",
      link: "/listings?search=Epic",
    },
    {
      name: "Coin & GP Zaxirali",
      watermark: "COIN",
      count: "Balansli hisoblar",
      active: params.type === "coins",
      link: "/listings?type=coins",
    },
    {
      name: "1-Divizion Pro",
      watermark: "DIV1",
      count: "Yuqori reyting",
      active: params.sort === "rating",
      link: "/listings?sort=rating",
    },
    {
      name: "VIP Akkauntlar",
      watermark: "VIP",
      count: "$50+ donat tarkib",
      active: params.minPrice === "50",
      link: "/listings?minPrice=50&sort=rating",
    },
    {
      name: "Arzon Takliflar",
      watermark: "SALE",
      count: "$25 gacha",
      active: params.maxPrice === "25",
      link: "/listings?maxPrice=25&sort=price_asc",
    },
  ];

  return (
    <div className="g2g-marketplace-root">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div className="g2g-breadcrumbs">
          <Link href="/">Bosh sahifa</Link>
          <span className="crumb-sep">›</span>
          <Link href="/listings">O&apos;yin akkauntlari</Link>
          <span className="crumb-sep">›</span>
          <span className="crumb-active">eFootball</span>
        </div>

        {/* 1. G2G 3D Purple Hero Category Banner */}
        <div className="g2g-hero-banner">
          <div className="hero-banner-content">
            <div className="hero-category-badge">
              <div className="hero-cat-icon">
                <Gamepad2 size={24} color="#FFF" />
              </div>
              <div>
                <h1 className="hero-cat-title">eFootball Akkauntlari</h1>
                <p className="hero-cat-desc">Rasmiy Escrow kafolatlangan savdo markazi</p>
              </div>
            </div>

            <div className="hero-metrics-row">
              <div className="metric-badge-box">
                <span className="metric-lbl">Jami takliflar</span>
                <span className="metric-val">{total > 0 ? `${total} ta` : "3.7k"}</span>
              </div>
              <div className="metric-badge-box">
                <span className="metric-lbl">Faol sotuvchilar</span>
                <span className="metric-val">218+ Pro</span>
              </div>
              <div className="metric-badge-box">
                <span className="metric-lbl">Xavfsizlik</span>
                <span className="metric-val text-emerald">100% Escrow</span>
              </div>
            </div>
          </div>

          <div className="hero-cta-box">
            <Link href="/seller/apply" className="btn-hero-sell">
              <PlusCircle size={17} />
              <span>Akkaunt Sotish</span>
            </Link>
          </div>
        </div>

        {/* 2. Service Tabs Pill-Bar */}
        <div className="g2g-service-tabs-row">
          <div className="service-tabs-wrap">
            <Link href="/listings" className="service-tab-btn active">
              <Gamepad2 size={15} />
              <span>O&apos;yin akkauntlari</span>
            </Link>
            <Link href="/listings?type=coin" className="service-tab-btn">
              <Zap size={15} />
              <span>Coin & GP To&apos;ldirish</span>
            </Link>
            <Link href="/seller/apply" className="service-tab-btn">
              <Gift size={15} />
              <span>Sotuvchi bo&apos;lish</span>
            </Link>
          </div>
        </div>

        {/* 3. Popular Brands Horizontal Ribbon */}
        <div className="g2g-brands-section">
          <div className="brands-title-row">
            <Flame size={16} className="text-amber" />
            <span className="brands-title">Ommabop kategoriyalar</span>
          </div>

          <div className="brands-scroll-track">
            {popularBrands.map((b, idx) => (
              <Link
                key={idx}
                href={b.link}
                className={`brand-ribbon-card ${b.active ? "active" : ""}`}
              >
                <div className="brand-watermark">{b.watermark}</div>
                <div className="brand-name">{b.name}</div>
                <div className="brand-count">{b.count}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* 4. Clean Search Input & Dynamic Active Filter Tags */}
        <div className="search-bar-clean-wrap">
          <form action="/listings" method="GET" className="search-input-pill">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              name="search"
              defaultValue={params.search || ""}
              placeholder="E'lonlar va o'yinchilar bo'yicha qidirish (masalan: Messi, 3200 OVR)..."
              className="search-input-field"
            />
            {params.platform && <input type="hidden" name="platform" value={params.platform} />}
            {params.sort && <input type="hidden" name="sort" value={params.sort} />}
          </form>

          {/* Dynamic Active Filters Row (only if user actually filtered) */}
          <div className="active-filters-live-row">
            <div className="active-chips-list">
              {params.search && (
                <span className="live-filter-tag">
                  Qidiruv: <strong>&quot;{params.search}&quot;</strong>
                  <Link
                    href={`/listings?${new URLSearchParams({
                      ...(params.platform && { platform: params.platform }),
                      ...(params.minPrice && { minPrice: params.minPrice }),
                      ...(params.maxPrice && { maxPrice: params.maxPrice }),
                      ...(params.sort && { sort: params.sort }),
                    }).toString()}`}
                    className="tag-x-btn"
                  >
                    ×
                  </Link>
                </span>
              )}
              {params.platform && (
                <span className="live-filter-tag">
                  Platforma: <strong>{params.platform === "mobile" ? "Android/iOS" : params.platform.toUpperCase()}</strong>
                  <Link
                    href={`/listings?${new URLSearchParams({
                      ...(params.search && { search: params.search }),
                      ...(params.minPrice && { minPrice: params.minPrice }),
                      ...(params.maxPrice && { maxPrice: params.maxPrice }),
                      ...(params.sort && { sort: params.sort }),
                    }).toString()}`}
                    className="tag-x-btn"
                  >
                    ×
                  </Link>
                </span>
              )}
              {(params.minPrice || params.maxPrice) && (
                <span className="live-filter-tag">
                  Narx: <strong>${params.minPrice || "0"} - ${params.maxPrice || "∞"}</strong>
                  <Link
                    href={`/listings?${new URLSearchParams({
                      ...(params.search && { search: params.search }),
                      ...(params.platform && { platform: params.platform }),
                      ...(params.sort && { sort: params.sort }),
                    }).toString()}`}
                    className="tag-x-btn"
                  >
                    ×
                  </Link>
                </span>
              )}
            </div>

            <span className="live-results-count">
              Jami <strong>{total}</strong> ta e&apos;lon topildi
            </span>
          </div>
        </div>

        {/* 5. Main Catalog Grid (Left Sidebar + Right 4-Column Cards) */}
        <div className="g2g-catalog-main-layout">
          {/* Left: Filter Sidebar */}
          <aside className="g2g-sidebar-pane">
            <Suspense
              fallback={
                <div className="sidebar-loading">Filterlar yuklanmoqda...</div>
              }
            >
              <FilterSidebar />
            </Suspense>
          </aside>

          {/* Right: Listings Stream (4-Column Grid like G2G) */}
          <main className="g2g-cards-pane">
            {listings.length === 0 ? (
              <div className="g2g-empty-state">
                <div className="empty-circle-icon">
                  <PackageOpen size={36} />
                </div>
                <h3 className="empty-title">
                  Ushbu filterlar bo&apos;yicha e&apos;lon topilmadi
                </h3>
                <p className="empty-text">
                  Qidiruv so&apos;zini yoki filter parametrlarini o&apos;zgartirib ko&apos;ring.
                </p>
                <Link href="/listings" className="empty-clear-action">
                  Barcha E&apos;lonlarni Ko&apos;rish
                </Link>
              </div>
            ) : (
              <>
                <div className="g2g-cards-4col-grid">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing as any} />
                  ))}
                </div>

                {/* Numbered Pagination */}
                {totalPages > 1 && (
                  <div className="g2g-pagination">
                    {page > 1 && (
                      <Link
                        href={`/listings?${new URLSearchParams({
                          ...(params.platform && { platform: params.platform }),
                          ...(params.minPrice && { minPrice: params.minPrice }),
                          ...(params.maxPrice && { maxPrice: params.maxPrice }),
                          ...(params.sort && { sort: params.sort }),
                          ...(params.search && { search: params.search }),
                          page: String(page - 1),
                        }).toString()}`}
                        className="page-nav-btn"
                      >
                        <ChevronLeft size={16} /> Oldingi
                      </Link>
                    )}

                    <div className="page-nums-list">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                        .map((pNum) => (
                          <Link
                            key={pNum}
                            href={`/listings?${new URLSearchParams({
                              ...(params.platform && { platform: params.platform }),
                              ...(params.minPrice && { minPrice: params.minPrice }),
                              ...(params.maxPrice && { maxPrice: params.maxPrice }),
                              ...(params.sort && { sort: params.sort }),
                              ...(params.search && { search: params.search }),
                              page: String(pNum),
                            }).toString()}`}
                            className={`page-num-item ${pNum === page ? "active" : ""}`}
                          >
                            {pNum}
                          </Link>
                        ))}
                    </div>

                    {page < totalPages && (
                      <Link
                        href={`/listings?${new URLSearchParams({
                          ...(params.platform && { platform: params.platform }),
                          ...(params.minPrice && { minPrice: params.minPrice }),
                          ...(params.maxPrice && { maxPrice: params.maxPrice }),
                          ...(params.sort && { sort: params.sort }),
                          ...(params.search && { search: params.search }),
                          page: String(page + 1),
                        }).toString()}`}
                        className="page-nav-btn"
                      >
                        Keyingi <ChevronRight size={16} />
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <style>{`
        .g2g-marketplace-root {
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
          margin-bottom: 20px;
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

        /* 1. Purple 3D Hero Banner */
        .g2g-hero-banner {
          background: linear-gradient(135deg, #4C1D95 0%, #311068 50%, #1E084A 100%);
          border: 1px solid rgba(167, 139, 250, 0.25);
          border-radius: 20px;
          padding: 28px 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          box-shadow: 0 16px 40px rgba(49, 16, 104, 0.4);
          position: relative;
          overflow: hidden;
        }

        .hero-banner-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
          z-index: 2;
        }

        .hero-category-badge {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .hero-cat-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .hero-cat-title {
          font-family: 'Outfit', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #FFF;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .hero-cat-desc {
          font-size: 13.5px;
          color: rgba(233, 213, 255, 0.85);
          margin: 4px 0 0 0;
        }

        .hero-metrics-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .metric-badge-box {
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 6px 14px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
        }

        .metric-lbl {
          font-size: 10px;
          text-transform: uppercase;
          color: rgba(216, 180, 254, 0.8);
          font-weight: 600;
        }

        .metric-val {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: #FFF;
        }

        .btn-hero-sell {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 12px;
          background: #E11D48;
          color: #FFF;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(225, 29, 72, 0.45);
          transition: all 0.2s ease;
          z-index: 2;
        }
        .btn-hero-sell:hover {
          background: #F43F5E;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(225, 29, 72, 0.6);
        }

        /* 2. Service Tabs Pill-Bar */
        .g2g-service-tabs-row {
          margin-bottom: 24px;
        }
        .service-tabs-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .service-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(209, 213, 219, 0.85);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .service-tab-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #FFF;
        }
        .service-tab-btn.active {
          background: #4F46E5;
          border-color: #4F46E5;
          color: #FFF;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
        }

        /* 3. Popular Brands Ribbon */
        .g2g-brands-section {
          margin-bottom: 28px;
        }
        .brands-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13.5px;
          font-weight: 700;
          color: #FFF;
          margin-bottom: 12px;
        }
        .brands-scroll-track {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
        }
        .brand-ribbon-card {
          position: relative;
          background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
          border-radius: 12px;
          padding: 14px 12px;
          text-decoration: none;
          color: #FFF;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          min-height: 80px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
        }
        .brand-ribbon-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 22px rgba(220, 38, 38, 0.4);
        }
        .brand-ribbon-card.active {
          border: 2px solid #FFF;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }
        .brand-watermark {
          position: absolute;
          top: 4px;
          right: 6px;
          font-family: 'Outfit', sans-serif;
          font-size: 28px;
          font-weight: 900;
          color: rgba(0, 0, 0, 0.2);
          pointer-events: none;
        }
        .brand-name {
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.2;
        }
        .brand-count {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.75);
          margin-top: 3px;
        }

        /* 4. Clean Search Input & Dynamic Active Filter Tags */
        .search-bar-clean-wrap {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .search-input-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(14, 22, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 10px 16px;
          transition: all 0.2s ease;
        }
        .search-input-pill:focus-within {
          border-color: #3B82F6;
          box-shadow: 0 0 16px rgba(59, 130, 246, 0.25);
        }

        .search-icon {
          color: rgba(156, 163, 175, 0.7);
          flex-shrink: 0;
        }

        .search-input-field {
          flex: 1;
          background: transparent;
          border: none;
          color: #FFF;
          font-size: 13.5px;
          outline: none;
        }
        .search-input-field::placeholder {
          color: rgba(156, 163, 175, 0.5);
        }

        .active-filters-live-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12.5px;
          color: rgba(156, 163, 175, 0.8);
          padding: 0 4px;
        }

        .active-chips-list {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .live-filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(37, 99, 235, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.35);
          color: #93C5FD;
          font-size: 11.5px;
          padding: 3px 10px;
          border-radius: 6px;
        }

        .tag-x-btn {
          color: #FFF;
          text-decoration: none;
          font-size: 14px;
          line-height: 1;
          margin-left: 2px;
          opacity: 0.8;
          transition: opacity 0.15s ease;
        }
        .tag-x-btn:hover {
          opacity: 1;
          color: #F87171;
        }

        .live-results-count {
          font-size: 12.5px;
          color: rgba(156, 163, 175, 0.75);
          margin-left: auto;
        }

        /* 5. Main Catalog Layout */
        .g2g-catalog-main-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 24px;
          align-items: start;
        }

        .g2g-sidebar-pane {
          position: sticky;
          top: 90px;
          align-self: start;
        }

        .g2g-cards-pane {
          min-width: 0;
        }

        /* 4-Column Card Grid */
        .g2g-cards-4col-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        /* Empty State */
        .g2g-empty-state {
          text-align: center;
          padding: 64px 20px;
          background: rgba(14, 22, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
        }
        .empty-circle-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          color: rgba(156, 163, 175, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .empty-title {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #FFF;
          margin: 0 0 8px 0;
        }
        .empty-text {
          font-size: 13.5px;
          color: rgba(156, 163, 175, 0.8);
          margin: 0 auto 20px auto;
          max-width: 400px;
        }
        .empty-clear-action {
          display: inline-flex;
          padding: 9px 20px;
          background: #2563EB;
          color: #FFF;
          font-size: 13px;
          font-weight: 700;
          border-radius: 8px;
          text-decoration: none;
        }

        /* Numbered Pagination */
        .g2g-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 36px;
        }
        .page-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(209, 213, 219, 0.9);
          font-size: 12.5px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .page-nav-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #FFF;
        }
        .page-nums-list {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .page-num-item {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(209, 213, 219, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12.5px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .page-num-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #FFF;
        }
        .page-num-item.active {
          background: #2563EB;
          border-color: #2563EB;
          color: #FFF;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        .text-amber { color: #FBBF24; }
        .text-emerald { color: #34D399; }

        /* Responsive Breakpoints */
        @media (max-width: 1280px) {
          .g2g-cards-4col-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .g2g-catalog-main-layout {
            grid-template-columns: 1fr;
          }
          .g2g-sidebar-pane {
            position: static;
          }
          .g2g-cards-4col-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .g2g-hero-banner {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
            padding: 20px;
          }
          .hero-cat-title {
            font-size: 20px;
          }
          .btn-hero-sell {
            width: 100%;
            justify-content: center;
          }
          .brands-scroll-track {
            grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          }
          .g2g-cards-4col-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
