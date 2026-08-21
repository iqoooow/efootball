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
} from "lucide-react";
import Link from "next/link";
import { fetchListings } from "@/lib/dataService";
import { ListingCard } from "@/components/listings/ListingCard";
import { FilterSidebar } from "@/components/listings/FilterSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Barcha E'lonlar Katalogi | EFZone Marketplace",
  description: "eFootball 2026 eng sara hisoblarini qidiring, saralang va xarid qiling.",
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
    perPage: 12,
  });

  const totalPages = Math.ceil(total / perPage);
  const currentPlatform = params.platform || "all";

  const platforms = [
    { key: "all", label: "Barchasi" },
    { key: "mobile", label: "📱 Mobile" },
    { key: "ps", label: "🎮 PlayStation" },
    { key: "pc", label: "💻 PC" },
    { key: "xbox", label: "🎮 Xbox" },
  ];

  return (
    <div className="listings-page-root">
      <div className="container listings-container">
        {/* Marketplace Header */}
        <div className="marketplace-header-row">
          <div>
            <div className="header-badge-row">
              <span className="live-market-badge">
                <Sparkles size={12} /> eFootball 2026 Katalog
              </span>
            </div>
            <h1 className="marketplace-main-title">
              Barcha Marketplace E&apos;lonlari
            </h1>
            <p className="marketplace-sub-count">
              Jami <strong>{total}</strong> ta tasdiqlangan e&apos;lon mavjud
            </p>
          </div>

          <Link href="/seller/apply" className="btn-add-listing-cta">
            <PlusCircle size={17} />
            <span>Akkaunt Sotish</span>
          </Link>
        </div>

        {/* Mobile Quick Platform Filter Pills Bar */}
        <div className="mobile-platform-pills-bar">
          {platforms.map((p) => {
            const isSelected =
              (p.key === "all" && !params.platform) || params.platform === p.key;
            return (
              <Link
                key={p.key}
                href={
                  p.key === "all"
                    ? `/listings${params.sort ? `?sort=${params.sort}` : ""}`
                    : `/listings?platform=${p.key}${params.sort ? `&sort=${params.sort}` : ""}`
                }
                className={`platform-pill-btn ${isSelected ? "active" : ""}`}
              >
                {p.label}
              </Link>
            );
          })}
        </div>

        {/* Responsive Catalog Layout */}
        <div className="listings-catalog-grid">
          {/* Desktop Left Filter Sidebar */}
          <aside className="desktop-filter-sidebar">
            <Suspense
              fallback={
                <div className="filter-loading-placeholder">
                  Filterlar yuklanmoqda...
                </div>
              }
            >
              <FilterSidebar />
            </Suspense>
          </aside>

          {/* Main Listings Stream */}
          <main className="listings-main-stream">
            {listings.length === 0 ? (
              <div className="empty-listings-card">
                <div className="empty-icon-wrap">
                  <PackageOpen size={32} className="text-muted" />
                </div>
                <h3 className="empty-heading">
                  Ushbu mezonlar bo&apos;yicha e&apos;lon topilmadi
                </h3>
                <p className="empty-desc">
                  Filter parametrlarini o&apos;zgartirib ko&apos;ring yoki boshqa platformani tanlang.
                </p>
                <Link href="/listings" className="empty-reset-btn">
                  Filterlarni Tozalash
                </Link>
              </div>
            ) : (
              <>
                <div className="listings-cards-responsive-grid">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing as any} />
                  ))}
                </div>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="pagination-wrapper">
                    {page > 1 && (
                      <Link
                        href={`/listings?${new URLSearchParams({
                          ...(params.platform && { platform: params.platform }),
                          ...(params.minPrice && { minPrice: params.minPrice }),
                          ...(params.maxPrice && { maxPrice: params.maxPrice }),
                          ...(params.sort && { sort: params.sort }),
                          page: String(page - 1),
                        }).toString()}`}
                        className="pagination-nav-btn"
                      >
                        <ChevronLeft size={16} /> Oldingi
                      </Link>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      const newParams = new URLSearchParams();
                      if (params.platform) newParams.set("platform", params.platform);
                      if (params.minPrice) newParams.set("minPrice", params.minPrice);
                      if (params.maxPrice) newParams.set("maxPrice", params.maxPrice);
                      if (params.sort) newParams.set("sort", params.sort);
                      newParams.set("page", String(p));

                      return (
                        <Link
                          key={p}
                          href={`/listings?${newParams.toString()}`}
                          className={`pagination-num-btn ${p === page ? "active" : ""}`}
                        >
                          {p}
                        </Link>
                      );
                    })}

                    {page < totalPages && (
                      <Link
                        href={`/listings?${new URLSearchParams({
                          ...(params.platform && { platform: params.platform }),
                          ...(params.minPrice && { minPrice: params.minPrice }),
                          ...(params.maxPrice && { maxPrice: params.maxPrice }),
                          ...(params.sort && { sort: params.sort }),
                          page: String(page + 1),
                        }).toString()}`}
                        className="pagination-nav-btn"
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
        .listings-page-root {
          padding-top: 88px;
          min-height: 100vh;
          background: #030712;
        }

        .listings-container {
          padding-top: 28px;
          padding-bottom: 80px;
        }

        .marketplace-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .header-badge-row {
          margin-bottom: 6px;
        }

        .live-market-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.15);
          border: 1px solid rgba(37, 99, 235, 0.3);
          color: #60A5FA;
          font-size: 11.5px;
          font-weight: 700;
        }

        .marketplace-main-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(22px, 3.2vw, 32px);
          font-weight: 800;
          color: #FFF;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .marketplace-sub-count {
          font-size: 13.5px;
          color: rgba(156, 163, 175, 0.85);
          margin: 4px 0 0 0;
        }

        .marketplace-sub-count strong {
          color: #FFF;
        }

        .btn-add-listing-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          color: #FFF;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 18px rgba(37, 99, 235, 0.35);
          transition: transform 0.2s;
        }

        .btn-add-listing-cta:hover {
          transform: translateY(-1.5px);
        }

        /* Mobile Platform Quick Filter Bar */
        .mobile-platform-pills-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 16px;
          margin-bottom: 20px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .mobile-platform-pills-bar::-webkit-scrollbar {
          display: none;
        }

        .platform-pill-btn {
          padding: 8px 16px;
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

        .platform-pill-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #FFF;
        }

        .platform-pill-btn.active {
          background: #2563EB;
          border-color: #2563EB;
          color: #FFF;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
        }

        /* Catalog Grid Layout */
        .listings-catalog-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 32px;
          align-items: start;
        }

        .desktop-filter-sidebar {
          position: sticky;
          top: 96px;
          align-self: start;
        }

        .listings-main-stream {
          min-width: 0;
        }

        .listings-cards-responsive-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .empty-listings-card {
          text-align: center;
          padding: 64px 20px;
          background: rgba(10, 16, 32, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 24px;
        }

        .empty-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .empty-heading {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #FFF;
          margin: 0 0 8px 0;
        }

        .empty-desc {
          font-size: 13.5px;
          color: rgba(156, 163, 175, 0.85);
          margin: 0 auto 20px auto;
          max-width: 380px;
        }

        .empty-reset-btn {
          display: inline-flex;
          padding: 10px 20px;
          background: #2563EB;
          color: #FFF;
          font-weight: 700;
          font-size: 13.5px;
          border-radius: 10px;
          text-decoration: none;
        }

        .pagination-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 40px;
          flex-wrap: wrap;
        }

        .pagination-nav-btn {
          height: 40px;
          padding: 0 14px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.04);
          color: #FFF;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .pagination-num-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13.5px;
          font-weight: 700;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.04);
          color: #FFF;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .pagination-num-btn.active {
          background: #2563EB;
          border-color: #2563EB;
          color: #FFF;
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .listings-catalog-grid {
            grid-template-columns: 1fr;
          }
          .desktop-filter-sidebar {
            display: none;
          }
          .listings-cards-responsive-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}
