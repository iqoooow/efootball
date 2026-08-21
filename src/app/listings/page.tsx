import { Suspense } from "react";
import { PackageOpen, ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, PlusCircle } from "lucide-react";
import Link from "next/link";
import { fetchListings } from "@/lib/dataService";
import { ListingCard } from "@/components/listings/ListingCard";
import { FilterSidebar } from "@/components/listings/FilterSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Barcha E'lonlar Katalogi | EFZone Marketplace",
  description: "eFootball 2026 eng sara hisoblari va Coin'larni qidiring, saralang va xarid qiling.",
};

interface SearchParams {
  type?: string;
  platform?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
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
  const typeLabel =
    params.type === "account"
      ? "eFootball Hisoblar"
      : params.type === "coins"
      ? "Coin Paketlari"
      : "Barcha Marketplace E'lonlari";

  return (
    <div style={{ paddingTop: 88, minHeight: "100vh" }}>
      <div className="container" style={{ paddingTop: 28, paddingBottom: 80 }}>
        {/* Marketplace Header with Akkaunt Sotish Button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
            paddingBottom: 20,
            borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 800,
                color: "#FFF",
                margin: 0,
              }}
            >
              {typeLabel}
            </h1>
            <p
              style={{
                fontSize: 13.5,
                color: "var(--text-secondary)",
                margin: "4px 0 0 0",
              }}
            >
              Jami <strong>{total}</strong> ta tasdiqlangan e&apos;lon mavjud
            </p>
          </div>

          <Link
            href="/seller/apply"
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: "var(--radius-md)",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <PlusCircle size={17} />
            <span>Akkaunt Sotish</span>
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: 32,
            alignItems: "start",
          }}
        >
          {/* Sidebar */}
          <aside
            className="hide-mobile"
            style={{
              position: "sticky",
              top: 104,
              alignSelf: "start",
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
            }}
          >
            <Suspense fallback={<div className="card" style={{ height: 400, padding: 20 }}>Yuklanmoqda...</div>}>
              <FilterSidebar />
            </Suspense>
          </aside>

          {/* Main Listings Grid */}
          <main>
            {listings.length === 0 ? (
              <div
                className="card"
                style={{
                  textAlign: "center",
                  padding: "80px 24px",
                  background: "var(--bg-card)",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid var(--border-medium)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <PackageOpen size={32} color="var(--text-muted)" />
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: "#FFF", marginBottom: 8 }}>
                  Afsuski, ushbu mezonlar bo&apos;yicha e&apos;lon topilmadi
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24, maxWidth: 420, margin: "0 auto 24px", lineHeight: 1.6 }}>
                  Filter parametrlarini o&apos;zgartirib ko&apos;ring yoki barcha e&apos;lonlar katalogiga qayting.
                </p>
                <Link href="/listings" className="btn btn-primary">
                  Filterlarni Tozalash
                </Link>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 20,
                  }}
                >
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing as any} />
                  ))}
                </div>

                {/* Enhanced Pagination (12 items per page) */}
                {totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 48,
                    }}
                  >
                    {/* Previous Button */}
                    {page > 1 ? (
                      <Link
                        href={`/listings?${new URLSearchParams({
                          ...(params.type && { type: params.type }),
                          ...(params.platform && { platform: params.platform }),
                          ...(params.minPrice && { minPrice: params.minPrice }),
                          ...(params.maxPrice && { maxPrice: params.maxPrice }),
                          ...(params.sort && { sort: params.sort }),
                          page: String(page - 1),
                        }).toString()}`}
                        style={{
                          height: 40,
                          padding: "0 14px",
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          textDecoration: "none",
                          background: "rgba(255, 255, 255, 0.04)",
                          color: "var(--text-primary)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <ChevronLeft size={16} /> Oldingi
                      </Link>
                    ) : null}

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      const newParams = new URLSearchParams();
                      if (params.type) newParams.set("type", params.type);
                      if (params.platform) newParams.set("platform", params.platform);
                      if (params.minPrice) newParams.set("minPrice", params.minPrice);
                      if (params.maxPrice) newParams.set("maxPrice", params.maxPrice);
                      if (params.sort) newParams.set("sort", params.sort);
                      newParams.set("page", String(p));

                      return (
                        <Link
                          key={p}
                          href={`/listings?${newParams.toString()}`}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 700,
                            textDecoration: "none",
                            background: p === page ? "var(--accent-primary)" : "rgba(255, 255, 255, 0.04)",
                            color: p === page ? "#FFFFFF" : "var(--text-primary)",
                            border: p === page ? "1.5px solid var(--accent-primary)" : "1px solid rgba(255, 255, 255, 0.1)",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {p}
                        </Link>
                      );
                    })}

                    {/* Next Button */}
                    {page < totalPages ? (
                      <Link
                        href={`/listings?${new URLSearchParams({
                          ...(params.type && { type: params.type }),
                          ...(params.platform && { platform: params.platform }),
                          ...(params.minPrice && { minPrice: params.minPrice }),
                          ...(params.maxPrice && { maxPrice: params.maxPrice }),
                          ...(params.sort && { sort: params.sort }),
                          page: String(page + 1),
                        }).toString()}`}
                        style={{
                          height: 40,
                          padding: "0 14px",
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          textDecoration: "none",
                          background: "rgba(255, 255, 255, 0.04)",
                          color: "var(--text-primary)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        Keyingi <ChevronRight size={16} />
                      </Link>
                    ) : null}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
