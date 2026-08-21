"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Loader2,
  AlertCircle,
  X,
  CheckCircle,
  Clock,
  BarChart2,
  ShieldAlert,
  ArrowRight,
  BadgeCheck,
  PlusCircle,
  XCircle,
} from "lucide-react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import type { Listing, Order, Profile } from "@/lib/types";
import { getPlatformLabel, formatCoinAmount, getOrderStatusLabel } from "@/lib/utils";

type Tab = "listings" | "orders" | "earnings";

const PLATFORMS = ["mobile", "ps", "xbox", "pc"] as const;
const DELIVERY_TIMES = [
  "15 daqiqa",
  "30 daqiqa",
  "1 soat",
  "2-4 soat",
  "24 soat ichida",
];

const emptyListing = {
  type: "account" as "account" | "coins",
  title: "",
  description: "",
  platform: "mobile" as (typeof PLATFORMS)[number],
  price: "",
  team_rating: "",
  coin_balance: "",
  key_players: "",
  coin_amount: "",
  delivery_time: "15 daqiqa",
  images: [] as string[],
};

export default function SellerDashboardPage() {
  const router = useRouter();
  const sbRef = useRef<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<Tab>("listings");
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [form, setForm] = useState(emptyListing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (uid: string, sb: any) => {
    try {
      const [listingsRes, ordersRes] = await Promise.all([
        sb
          .from("listings")
          .select("*")
          .eq("seller_id", uid)
          .order("created_at", { ascending: false }),
        sb
          .from("orders")
          .select("*, listing:listings(title, type), buyer:profiles(full_name)")
          .eq("seller_id", uid)
          .order("created_at", { ascending: false }),
      ]);
      if (listingsRes.data) setListings(listingsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data as Order[]);
    } catch (err) {
      console.error("Seller fetch error:", err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const sb = createClient();
        sbRef.current = sb;
        const {
          data: { user },
        } = await sb.auth.getUser();

        if (!user) {
          // Check if admin session
          if (
            typeof window !== "undefined" &&
            sessionStorage.getItem("efzone_admin_session") === "true"
          ) {
            const adminProf: Profile = {
              id: "admin-1",
              role: "admin",
              full_name: "Platforma Admini",
              seller_status: "approved",
              avatar_url: null,
              telegram_username: "efzone_admin",
              created_at: "2023-01-01T00:00:00Z",
            };
            setProfile(adminProf);
            const { data: allListings } = await sb
              .from("listings")
              .select("*")
              .order("created_at", { ascending: false });
            if (allListings) setListings(allListings);
            setLoading(false);
            return;
          }
          router.push("/auth/login");
          return;
        }

        const { data: prof } = await sb
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (prof) {
          setProfile(prof);
          await fetchData(user.id, sb);
        } else {
          setProfile({
            id: user.id,
            role: user.user_metadata?.role || "buyer",
            full_name:
              user.user_metadata?.full_name || user.email?.split("@")[0],
            seller_status: null,
            avatar_url: null,
            telegram_username: null,
            created_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Seller init error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchData, router]);

  const openCreate = () => {
    setEditListing(null);
    setForm(emptyListing);
    setError("");
    setShowModal(true);
  };

  const openEdit = (listing: Listing) => {
    setEditListing(listing);
    setForm({
      type: listing.type,
      title: listing.title,
      description: listing.description || "",
      platform: listing.platform,
      price: String(listing.price),
      team_rating: String(listing.team_rating || ""),
      coin_balance: String(listing.coin_balance || ""),
      key_players: (listing.key_players || []).join(", "),
      coin_amount: String(listing.coin_amount || ""),
      delivery_time: listing.delivery_time || "15 daqiqa",
      images: listing.images || [],
    });
    setError("");
    setShowModal(true);
  };

  const saveListing = async () => {
    if (!form.title.trim()) {
      setError("Sarlavha majburiy");
      return;
    }
    const parsedPrice = parseFloat(form.price);
    if (!form.price || isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Narx to'g'ri musbat raqam bo'lishi kerak (masalan: 35)");
      return;
    }
    setSaving(true);
    setError("");

    const payload: any = {
      id: editListing ? editListing.id : `listing-${Date.now()}`,
      seller_id: profile?.id || "seller-1",
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim() || null,
      platform: form.platform,
      price: parsedPrice,
      delivery_time: form.delivery_time,
      images: form.images.length > 0 ? form.images : ["/hero-bg.jpg"],
      status: "active",
      created_at: new Date().toISOString(),
    };

    if (form.type === "account") {
      payload.team_rating = form.team_rating
        ? parseInt(form.team_rating)
        : 3200;
      payload.coin_balance = form.coin_balance
        ? parseInt(form.coin_balance)
        : 1000000;
      payload.key_players = form.key_players
        ? form.key_players
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : ["106 Messi", "105 Ronaldo"];
    } else {
      payload.coin_amount = form.coin_amount
        ? parseInt(form.coin_amount)
        : 5000000;
    }

    if (sbRef.current) {
      try {
        if (editListing) {
          await sbRef.current
            .from("listings")
            .update(payload)
            .eq("id", editListing.id);
        } else {
          await sbRef.current.from("listings").insert(payload);
        }
      } catch {}
    }

    if (editListing) {
      setListings((ls) =>
        ls.map((l) => (l.id === editListing.id ? { ...l, ...payload } : l))
      );
    } else {
      setListings((ls) => [payload, ...ls]);
    }

    setSaving(false);
    setShowModal(false);
  };

  const deleteListing = async (id: string) => {
    if (!confirm("E'lonni o'chirishni tasdiqlaysizmi?")) return;
    if (sbRef.current) {
      try {
        await sbRef.current.from("listings").delete().eq("id", id);
      } catch {}
    }
    setListings((ls) => ls.filter((l) => l.id !== id));
  };

  if (loading) {
    return (
      <div className="dashboard-loading-screen">
        <Loader2 size={36} className="animate-spin text-blue" />
        <span>Sotuvchi kabineti yuklanmoqda...</span>
      </div>
    );
  }

  // 🔒 ROLE GUARD FOR BUYER (Not a seller)
  const isSeller =
    profile?.role === "seller" ||
    profile?.role === "admin" ||
    profile?.seller_status === "approved";

  if (!isSeller) {
    return (
      <div className="dashboard-guard-screen">
        <div className="guard-card animate-scale-up">
          <div className="guard-icon-wrap">
            <ShieldAlert size={38} className="text-amber" />
          </div>

          <h1 className="guard-title">Sotuvchi Kabineti Cheklangan</h1>

          <p className="guard-desc">
            Siz hozirda <strong>Xaridor</strong> hisobidasiz. Sotuvchi kabinetiga
            kirish va to&apos;g&apos;ridan-to&apos;g&apos;ri boshqaruv faqat
            tasdiqlangan sotuvchilar uchun ochiladi.
          </p>

          <div className="guard-instruction-box">
            <h4 className="instruction-heading">Qanday qilib sotuvchi bo&apos;lish mumkin?</h4>
            <p className="instruction-text">
              O&apos;z eFootball akkauntingiz ma&apos;lumotlarini e&apos;lon
              qilish uchun ariza yuboring. Admin tasdiqlashi bilan sizga avtomatik
              ravishda sotuvchi maqomi beriladi va ushbu kabinet ochiladi.
            </p>
          </div>

          <div className="guard-actions-row">
            <Link href="/seller/apply" className="btn-primary-guard">
              <PlusCircle size={16} /> Akkaunt Sotish Ariza Yuborish
            </Link>
            <Link href="/profile" className="btn-secondary-guard">
              Mening Profilimga Qaytish
            </Link>
          </div>
        </div>

        <style>{`
          .dashboard-guard-screen {
            padding-top: 110px;
            padding-bottom: 80px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding-left: 20px;
            padding-right: 20px;
          }
          .guard-card {
            background: rgba(10, 16, 32, 0.75);
            backdrop-filter: blur(28px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 22px;
            padding: 38px 32px;
            max-width: 500px;
            width: 100%;
            text-align: center;
          }
          .guard-icon-wrap {
            width: 72px;
            height: 72px;
            border-radius: 20px;
            background: rgba(245, 158, 11, 0.12);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 18px;
          }
          .guard-title {
            font-family: 'Outfit', sans-serif;
            font-size: 22px;
            font-weight: 800;
            color: #FFF;
            margin: 0 0 10px 0;
          }
          .guard-desc {
            font-size: 13.5px;
            color: rgba(209, 213, 219, 0.85);
            line-height: 1.6;
            margin: 0 0 20px 0;
          }
          .guard-instruction-box {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            padding: 14px 18px;
            text-align: left;
            margin-bottom: 24px;
          }
          .instruction-heading {
            font-size: 13px;
            font-weight: 700;
            color: #60A5FA;
            margin: 0 0 4px 0;
          }
          .instruction-text {
            font-size: 12.5px;
            color: rgba(156, 163, 175, 0.85);
            line-height: 1.5;
            margin: 0;
          }
          .guard-actions-row {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .btn-primary-guard {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 20px;
            border-radius: 10px;
            background: linear-gradient(135deg, #2563EB, #1D4ED8);
            color: #FFF;
            font-size: 14px;
            font-weight: 700;
            text-decoration: none;
            box-shadow: 0 4px 18px rgba(37, 99, 235, 0.35);
          }
          .btn-secondary-guard {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 11px 20px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.05);
            color: #FFF;
            font-size: 13.5px;
            font-weight: 600;
            text-decoration: none;
          }
          .text-amber { color: #FBBF24; }
        `}</style>
      </div>
    );
  }

  const activeCount = listings.filter((l) => l.status === "active").length;
  const pendingCount = listings.filter((l) => l.status === "pending_review").length;
  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.price || 0), 0);

  return (
    <div className="seller-dashboard-root">
      <div className="container" style={{ maxWidth: 1040 }}>
        {/* Header */}
        <div className="dashboard-header-bar">
          <div>
            <div className="header-badge-row">
              <span className="seller-badge">
                <BadgeCheck size={13} /> Tasdiqlangan Sotuvchi
              </span>
            </div>
            <h1 className="dashboard-title">Sotuvchi Boshqaruv Kabineti</h1>
            <p className="dashboard-sub">
              {profile?.full_name || "Sotuvchi"} | E&apos;lonlaringiz, savdolar va tushgan mablag&apos;lar
            </p>
          </div>

          <button onClick={openCreate} className="create-listing-btn" type="button">
            <Plus size={16} /> Yangi E&apos;lon Joylash
          </button>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrap blue-wrap">
              <Package size={20} className="text-blue" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Faol E&apos;lonlar</span>
              <div className="stat-val">{activeCount} ta</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap amber-wrap">
              <Clock size={20} className="text-amber" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Moderatsiyada (Kutilmoqda)</span>
              <div className="stat-val">{pendingCount} ta</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap emerald-wrap">
              <ShoppingBag size={20} className="text-emerald" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Muvaffaqiyatli Savdolar</span>
              <div className="stat-val">{completedOrders.length} ta</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap rose-wrap">
              <DollarSign size={20} className="text-rose" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Umumiy Daromad</span>
              <div className="stat-val">${totalRevenue.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-nav-tabs">
          <button
            onClick={() => setTab("listings")}
            className={`tab-btn ${tab === "listings" ? "active" : ""}`}
            type="button"
          >
            Mening E&apos;lonlarim ({listings.length})
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`tab-btn ${tab === "orders" ? "active" : ""}`}
            type="button"
          >
            Savdolar Tarixi ({orders.length})
          </button>
          <button
            onClick={() => setTab("earnings")}
            className={`tab-btn ${tab === "earnings" ? "active" : ""}`}
            type="button"
          >
            Mablag&apos; va Payout
          </button>
        </div>

        {/* Tab 1: Listings */}
        {tab === "listings" && (
          <div className="dashboard-card-wrap">
            {listings.length === 0 ? (
              <div className="empty-wrap">
                <Package size={40} className="text-muted" />
                <p>Hozircha birorta ham e&apos;loningiz mavjud emas.</p>
                <button onClick={openCreate} className="create-listing-btn" type="button">
                  <Plus size={15} /> Birinchi E&apos;lonni Qo&apos;shish
                </button>
              </div>
            ) : (
              <div className="listings-grid">
                {listings.map((l) => (
                  <div key={l.id} className="seller-listing-item">
                    <div className="listing-main-content">
                      <div className="listing-title-line">
                        <span className="listing-title-text">{l.title}</span>
                        <span className="listing-price-tag">${l.price}</span>
                      </div>

                      <div className="listing-badges-line">
                        <span className="meta-badge">
                          {getPlatformLabel(l.platform)}
                        </span>
                        {l.team_rating && (
                          <span className="meta-badge">
                            OVR: {l.team_rating}
                          </span>
                        )}
                        {l.status === "active" && (
                          <span className="status-badge badge-active">
                            Faol
                          </span>
                        )}
                        {l.status === "pending_review" && (
                          <span className="status-badge badge-pending">
                            Kutilmoqda
                          </span>
                        )}
                        {l.status === "rejected" && (
                          <span className="status-badge badge-rejected">
                            Rad etilgan
                          </span>
                        )}
                      </div>

                      {l.reject_reason && l.status === "rejected" && (
                        <div className="seller-reject-alert">
                          <AlertCircle size={14} /> Sabab: {l.reject_reason}
                        </div>
                      )}
                    </div>

                    <div className="listing-actions-group">
                      <button
                        onClick={() => openEdit(l)}
                        className="action-icon-btn edit-btn"
                        title="Tahrirlash"
                        type="button"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => deleteListing(l.id)}
                        className="action-icon-btn delete-btn"
                        title="O'chirish"
                        type="button"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Orders */}
        {tab === "orders" && (
          <div className="dashboard-card-wrap">
            {orders.length === 0 ? (
              <div className="empty-wrap">
                <ShoppingBag size={40} className="text-muted" />
                <p>Hozircha savdolar mavjud emas.</p>
              </div>
            ) : (
              <div className="orders-table-wrap">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Buyurtma ID</th>
                      <th>E&apos;lon</th>
                      <th>Narx</th>
                      <th>Status</th>
                      <th>Sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="mono-cell">{o.id.slice(0, 12)}...</td>
                        <td>{o.listing?.title || "eFootball Akkaunt"}</td>
                        <td className="price-cell">${o.price}</td>
                        <td>
                          <span className="order-status-badge">
                            {getOrderStatusLabel(o.status)}
                          </span>
                        </td>
                        <td className="date-cell">
                          {new Date(o.created_at).toLocaleDateString("uz-UZ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Earnings */}
        {tab === "earnings" && (
          <div className="dashboard-card-wrap">
            <div className="payout-overview-card">
              <div className="payout-details">
                <span className="payout-sub">Yechib Olish Mumkin Bo&apos;lgan Balans</span>
                <h2 className="payout-balance">${totalRevenue.toLocaleString()}</h2>
                <p className="payout-note">
                  Escrow xavfsiz to&apos;lov tizimi orqali himoyalangan. Har bir tasdiqlangan savdodan so&apos;ng mablag&apos; bir zumda balansingizga o&apos;tadi.
                </p>
              </div>

              <button
                onClick={() =>
                  alert("Pul yechish so'rovi qabul qilindi. Tez orada admin tomonidan to'lab beriladi.")
                }
                className="payout-btn"
                type="button"
              >
                <DollarSign size={16} /> Pulni Yechib Olish (Payme / Click / USDT)
              </button>
            </div>
          </div>
        )}

        {/* Add / Edit Listing Modal */}
        {showModal && (
          <div className="modal-backdrop animate-fade-in">
            <div className="modal-window animate-scale-up">
              <div className="modal-header">
                <h3 className="modal-title">
                  {editListing ? "E'lonni Tahrirlash" : "Yangi E'lon Qo'shish"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="modal-close-btn"
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>

              {error && <div className="modal-error">{error}</div>}

              <div className="modal-body">
                <div className="form-group">
                  <label className="modal-label">Sarlavha</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="106 Messi + 105 CR7 Booster"
                    className="modal-input"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="modal-label">Platforma</label>
                    <select
                      value={form.platform}
                      onChange={(e) =>
                        setForm({ ...form, platform: e.target.value as any })
                      }
                      className="modal-select"
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {getPlatformLabel(p)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="modal-label">Narx ($ USD)</label>
                    <input
                      type="number"
                      required
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      placeholder="45"
                      className="modal-input"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="modal-label">Jamoa OVR (Kuchlilik)</label>
                    <input
                      type="number"
                      value={form.team_rating}
                      onChange={(e) =>
                        setForm({ ...form, team_rating: e.target.value })
                      }
                      placeholder="3240"
                      className="modal-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="modal-label">Mavjud Coin / GP</label>
                    <input
                      type="number"
                      value={form.coin_balance}
                      onChange={(e) =>
                        setForm({ ...form, coin_balance: e.target.value })
                      }
                      placeholder="1500000"
                      className="modal-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="modal-label">Asosiy O&apos;yinchilar</label>
                  <input
                    type="text"
                    value={form.key_players}
                    onChange={(e) =>
                      setForm({ ...form, key_players: e.target.value })
                    }
                    placeholder="106 Messi, 105 Ronaldo, 104 Ronaldinho"
                    className="modal-input"
                  />
                </div>

                <div className="form-group">
                  <label className="modal-label">Tavsif</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Konami ID toza, email to'liq beriladi..."
                    className="modal-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  onClick={() => setShowModal(false)}
                  className="modal-cancel-btn"
                  type="button"
                >
                  Bekor Qilish
                </button>
                <button
                  onClick={saveListing}
                  disabled={saving}
                  className="modal-save-btn"
                  type="button"
                >
                  {saving ? "Saqlanmoqda..." : "E'lonni Saqlash"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .seller-dashboard-root {
          padding-top: 104px;
          padding-bottom: 80px;
          min-height: 100vh;
        }
        .dashboard-loading-screen {
          padding-top: 140px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: rgba(156, 163, 175, 0.85);
          font-size: 14px;
        }

        .dashboard-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 28px;
        }
        .header-badge-row {
          margin-bottom: 6px;
        }
        .seller-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(16, 185, 129, 0.14);
          color: #34D399;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 999px;
        }
        .dashboard-title {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #FFF;
          margin: 0 0 4px 0;
          letter-spacing: -0.02em;
        }
        .dashboard-sub {
          font-size: 13.5px;
          color: rgba(156, 163, 175, 0.85);
          margin: 0;
        }

        .create-listing-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 18px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          color: #FFF;
          font-size: 13.5px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(37, 99, 235, 0.35);
          transition: all 0.2s ease;
        }
        .create-listing-btn:hover {
          transform: translateY(-1.5px);
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.5);
        }

        /* Stats Grid */
        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: rgba(10, 16, 32, 0.72);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .stat-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .blue-wrap { background: rgba(37, 99, 235, 0.14); }
        .amber-wrap { background: rgba(245, 158, 11, 0.14); }
        .emerald-wrap { background: rgba(16, 185, 129, 0.14); }
        .rose-wrap { background: rgba(244, 63, 94, 0.14); }

        .stat-info {
          display: flex;
          flex-direction: column;
        }
        .stat-label {
          font-size: 12px;
          color: rgba(156, 163, 175, 0.85);
          font-weight: 500;
        }
        .stat-val {
          font-family: 'Outfit', sans-serif;
          font-size: 19px;
          font-weight: 800;
          color: #FFF;
          margin-top: 2px;
        }

        /* Tabs */
        .dashboard-nav-tabs {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding-bottom: 8px;
        }
        .tab-btn {
          padding: 8px 16px;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: rgba(156, 163, 175, 0.85);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .tab-btn:hover {
          color: #FFF;
          background: rgba(255, 255, 255, 0.04);
        }
        .tab-btn.active {
          color: #FFF;
          background: rgba(37, 99, 235, 0.2);
        }

        /* Card Wrap */
        .dashboard-card-wrap {
          background: rgba(10, 16, 32, 0.72);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 24px;
        }

        /* Listings Grid */
        .listings-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .seller-listing-item {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .listing-main-content {
          flex: 1;
          min-width: 260px;
        }
        .listing-title-line {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }
        .listing-title-text {
          font-size: 14.5px;
          font-weight: 700;
          color: #FFF;
        }
        .listing-price-tag {
          font-size: 14px;
          font-weight: 800;
          color: #60A5FA;
        }
        .listing-badges-line {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }
        .meta-badge {
          background: rgba(255, 255, 255, 0.06);
          padding: 2px 7px;
          border-radius: 6px;
          color: rgba(209, 213, 219, 0.85);
          font-weight: 500;
        }
        .status-badge {
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 11px;
        }
        .badge-active { background: rgba(16, 185, 129, 0.15); color: #34D399; }
        .badge-pending { background: rgba(245, 158, 11, 0.15); color: #FBBF24; }
        .badge-rejected { background: rgba(244, 63, 94, 0.15); color: #FB7185; }

        .seller-reject-alert {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 6px;
          font-size: 12px;
          color: #FB7185;
          background: rgba(244, 63, 94, 0.08);
          padding: 4px 8px;
          border-radius: 6px;
        }

        .listing-actions-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .action-icon-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: none;
          background: rgba(255, 255, 255, 0.05);
          color: rgba(209, 213, 219, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .edit-btn:hover {
          background: rgba(37, 99, 235, 0.2);
          color: #60A5FA;
        }
        .delete-btn:hover {
          background: rgba(244, 63, 94, 0.2);
          color: #FB7185;
        }

        /* Orders Table */
        .orders-table-wrap {
          overflow-x: auto;
        }
        .orders-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        .orders-table th {
          text-align: left;
          padding: 10px 14px;
          color: rgba(156, 163, 175, 0.8);
          font-weight: 600;
          font-size: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .orders-table td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: #FFF;
        }
        .mono-cell { font-family: monospace; color: rgba(156, 163, 175, 0.85); }
        .price-cell { font-weight: 700; color: #60A5FA; }
        .date-cell { color: rgba(156, 163, 175, 0.8); font-size: 12.5px; }
        .order-status-badge {
          background: rgba(16, 185, 129, 0.14);
          color: #34D399;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }

        /* Payout Card */
        .payout-overview-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .payout-sub {
          font-size: 13px;
          color: rgba(156, 163, 175, 0.85);
          font-weight: 500;
        }
        .payout-balance {
          font-family: 'Outfit', sans-serif;
          font-size: 36px;
          font-weight: 800;
          color: #FFF;
          margin: 6px 0;
        }
        .payout-note {
          font-size: 13px;
          color: rgba(156, 163, 175, 0.8);
          line-height: 1.5;
          max-width: 600px;
          margin: 0;
        }
        .payout-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          align-self: flex-start;
          padding: 12px 22px;
          border-radius: 10px;
          background: #059669;
          color: #FFF;
          font-size: 14px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .payout-btn:hover { background: #047857; }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-window {
          background: rgba(10, 16, 32, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          width: 100%;
          max-width: 540px;
          padding: 24px 28px;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .modal-title {
          font-family: 'Outfit', sans-serif;
          font-size: 19px;
          font-weight: 700;
          color: #FFF;
          margin: 0;
        }
        .modal-close-btn {
          background: none;
          border: none;
          color: rgba(156, 163, 175, 0.8);
          cursor: pointer;
        }
        .modal-error {
          padding: 8px 12px;
          background: rgba(244, 63, 94, 0.1);
          color: #FB7185;
          font-size: 12.5px;
          border-radius: 8px;
          margin-bottom: 14px;
        }
        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .modal-label {
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(229, 231, 235, 0.9);
          margin-bottom: 4px;
          display: block;
        }
        .modal-input, .modal-select, .modal-textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9px;
          padding: 9px 12px;
          font-size: 13.5px;
          color: #FFF;
          outline: none;
          box-sizing: border-box;
        }
        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        .modal-cancel-btn {
          padding: 9px 16px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #FFF;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }
        .modal-save-btn {
          padding: 9px 18px;
          border-radius: 8px;
          background: #2563EB;
          color: #FFF;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }

        .text-blue { color: #60A5FA; }
        .text-amber { color: #FBBF24; }
        .text-emerald { color: #34D399; }
        .text-rose { color: #FB7185; }
        .text-muted { color: rgba(156, 163, 175, 0.6); }

        .empty-wrap {
          text-align: center;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: rgba(156, 163, 175, 0.85);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
