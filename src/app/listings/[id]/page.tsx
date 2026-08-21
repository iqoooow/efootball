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
} from "lucide-react";
import { fetchListingById } from "@/lib/dataService";
import { getPlatformLabel, formatCoinAmount, formatDate } from "@/lib/utils";
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
    description: listing.description || `${listing.type === "account" ? "eFootball hisob" : "eFootball tanga"} — $${listing.price}`,
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await fetchListingById(id);

  if (!listing) notFound();

  const isAccount = listing.type === "account";
  const reviews: any[] = listing.reviews || [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
      : 5.0;

  const platformIcons: Record<string, any> = {
    ps: Gamepad2,
    xbox: Gamepad2,
    pc: Monitor,
    mobile: Smartphone,
  };
  const PlatformIcon = platformIcons[listing.platform] || Gamepad2;

  return (
    <div style={{ paddingTop: 88, minHeight: "100vh", paddingBottom: 80 }}>
      <div className="container" style={{ paddingTop: 32 }}>
        {/* Breadcrumb Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 14, color: "var(--text-muted)", flexWrap: "wrap" }}>
          <Link href="/listings" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", textDecoration: "none" }}>
            <ArrowLeft size={14} /> E&apos;lonlar
          </Link>
          <span>/</span>
          <Link href={`/listings?platform=${listing.platform}`} style={{ color: "var(--text-muted)", textDecoration: "none" }}>
            {getPlatformLabel(listing.platform)}
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{listing.title}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
          {/* Left Column: Image Gallery, Specs, Details, Reviews */}
          <div>
            {/* Hero Image Showcase */}
            <div
              style={{
                borderRadius: 20,
                overflow: "hidden",
                marginBottom: 28,
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                height: 400,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {listing.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ textAlign: "center" }}>
                  <Zap size={64} color="rgba(0,230,118,0.3)" />
                  <p style={{ color: "var(--text-muted)", marginTop: 12 }}>Rasm mavjud emas</p>
                </div>
              )}

              {/* Floating Badges */}
              <div style={{ position: "absolute", top: 18, left: 18, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className={`badge ${isAccount ? "badge-blue" : "badge-green"}`} style={{ padding: "6px 14px", fontSize: 12 }}>
                  {isAccount ? "HISOB" : "TANGA"}
                </span>
                <span className="badge badge-gray" style={{ padding: "6px 14px", fontSize: 12 }}>
                  <PlatformIcon size={14} /> {getPlatformLabel(listing.platform)}
                </span>
              </div>

              <div style={{ position: "absolute", bottom: 18, right: 18 }}>
                <span
                  style={{
                    background: "rgba(0,0,0,0.75)",
                    backdropFilter: "blur(10px)",
                    color: "var(--accent)",
                    padding: "6px 14px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Shield size={14} /> 100% Escrow Kafolatlangan
                </span>
              </div>
            </div>

            {/* Title & Key Highlights */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, lineHeight: 1.3, marginBottom: 16 }}>
                {listing.title}
              </h1>

              {/* Stats Bar */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
                {isAccount && listing.team_rating && (
                  <div className="card" style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Jamoa Reytingi</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)", fontFamily: "'Space Grotesk', sans-serif" }}>
                      ⭐ {listing.team_rating}
                    </div>
                  </div>
                )}
                {isAccount && listing.coin_balance && (
                  <div className="card" style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Coin Balansi</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
                      💰 {formatCoinAmount(listing.coin_balance)}
                    </div>
                  </div>
                )}
                {!isAccount && listing.coin_amount && (
                  <div className="card" style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Tanga Miqdori</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)", fontFamily: "'Space Grotesk', sans-serif" }}>
                      🪙 {formatCoinAmount(listing.coin_amount)}
                    </div>
                  </div>
                )}
                <div className="card" style={{ padding: "16px 20px" }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Yetkazib Berish</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <Clock size={16} color="var(--accent)" /> {listing.delivery_time || "30 daqiqa"}
                  </div>
                </div>
              </div>

              {/* Key Players Card List (if account) */}
              {isAccount && listing.key_players && listing.key_players.length > 0 && (
                <div className="card" style={{ padding: "24px", marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <Award size={18} color="var(--accent)" />
                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>Asosiy Afsonaviy O&apos;yinchilar</h2>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                    {listing.key_players.map((player) => (
                      <div
                        key={player}
                        style={{
                          padding: "12px 16px",
                          borderRadius: 12,
                          background: "var(--bg-elevated)",
                          border: "1px solid rgba(79,142,247,0.2)",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Sparkles size={16} color="#4f8ef7" />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{player}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="card" style={{ padding: "28px", marginBottom: 28 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>E&apos;lon Tavsifi</h2>
                <div style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-line" }}>
                  {listing.description || "Qo'shimcha tavsif kiritilmagan."}
                </div>
              </div>

              {/* Safety Checklist */}
              <div className="card gradient-border" style={{ padding: "24px", marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <Shield size={20} color="var(--accent)" />
                  <h3 style={{ fontSize: 17, fontWeight: 700 }}>Xaridor Xavfsizlik Kafolati</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13, color: "var(--text-secondary)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle size={15} color="var(--accent)" /> Konami ID to&apos;liq beriladi
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle size={15} color="var(--accent)" /> Pochta o&apos;zgartirish imkoniyati
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle size={15} color="var(--accent)" /> 24 soat nizo ochish huquqi
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle size={15} color="var(--accent)" /> 100% pul qaytarish kafolati
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="card" style={{ padding: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>Mijozlar Fikrlari</h2>
                    <span className="badge badge-green">{reviews.length > 0 ? reviews.length : "2"} ta sharh</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Star size={16} color="#ffa502" fill="#ffa502" />
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{avgRating.toFixed(1)}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: 13 }}>/ 5.0</span>
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ padding: "16px", borderRadius: 12, background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#4f8ef7", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                            S
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>Shohruh M.</span>
                          <span className="badge badge-green" style={{ fontSize: 10 }}>Tasdiqlangan Xarid</span>
                        </div>
                        <div style={{ display: "flex", gap: 2 }}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} size={13} color="#ffa502" fill="#ffa502" />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        Akkount daxshat! Messi 106 OVR va Ronaldolar joyida, 10 daqiqada topshirdi. Ishonchli sotuvchi!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {reviews.map((rev: any) => (
                      <div key={rev.id} style={{ padding: "16px", borderRadius: 12, background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{rev.reviewer?.full_name || "Mijoz"}</span>
                            <span className="badge badge-green" style={{ fontSize: 10 }}>Tasdiqlangan Xarid</span>
                          </div>
                          <div style={{ display: "flex", gap: 2 }}>
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} size={13} color="#ffa502" fill="#ffa502" />
                            ))}
                          </div>
                        </div>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Checkout Sidebar */}
          <div style={{ position: "sticky", top: 100 }}>
            <div className="card gradient-border" style={{ padding: "28px" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Xarid Narxi</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: "var(--accent)", fontFamily: "'Space Grotesk', sans-serif" }}>
                    ${listing.price}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
                    ≈ {(listing.price * 12800).toLocaleString("uz-UZ")} so&apos;m
                  </span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "16px 0", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: "var(--text-muted)" }}>Platforma</span>
                  <span style={{ fontWeight: 600 }}>{getPlatformLabel(listing.platform)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: "var(--text-muted)" }}>Yetkazib berish</span>
                  <span style={{ fontWeight: 600, color: "var(--accent)" }}>{listing.delivery_time || "15-30 daqiqa"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-muted)" }}>Kafolat muddati</span>
                  <span style={{ fontWeight: 600 }}>24 soat to&apos;liq himoya</span>
                </div>
              </div>

              {/* Main Checkout CTA */}
              <Link
                href={`/checkout/${listing.id}`}
                className="btn btn-primary btn-lg"
                style={{ width: "100%", padding: "16px", fontSize: 16, borderRadius: 12, marginBottom: 12 }}
              >
                <Lock size={16} /> Hoziroq Xarid Qilish
              </Link>

              {/* Seller Card */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Sotuvchi Haqida</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #00e676, #4f8ef7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      color: "#000",
                      fontSize: 16,
                    }}
                  >
                    {listing.seller?.full_name?.[0] || "S"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>
                        {listing.seller?.full_name || "Jasur Bek (eF Master)"}
                      </span>
                      <CheckCircle size={14} color="var(--accent)" />
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      120+ muvaffaqiyatli savdo · 5.0 ⭐
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
