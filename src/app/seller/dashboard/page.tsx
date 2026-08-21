"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
  Clock,
  BarChart2,
  ShieldAlert,
  ArrowRight,
  BadgeCheck,
  PlusCircle,
  RefreshCw,
  Search,
  Eye,
  Edit2,
  Trash2,
  Store,
  ChevronRight,
  Menu,
  CreditCard,
  Wallet,
  Sparkles,
  Check,
  Gamepad2,
  LogOut,
  Send,
  User,
  ChevronLeft,
} from "lucide-react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import type { Listing, Order, Profile } from "@/lib/types";
import { getPlatformLabel, formatDate } from "@/lib/utils";
import { ImageUploader } from "@/components/listings/ImageUploader";

type SellerTab = "listings" | "orders" | "earnings";

const PLATFORMS = [
  { id: "mobile", label: "📱 Mobile (iOS/Android)" },
  { id: "ps", label: "🎮 PlayStation" },
  { id: "pc", label: "💻 PC / Steam" },
  { id: "xbox", label: "🎮 Xbox" },
] as const;

const DELIVERY_TIMES = [
  "15 daqiqa",
  "30 daqiqa",
  "1 soat",
  "2-4 soat",
  "24 soat ichida",
];

const emptyListingForm = {
  type: "account" as "account" | "coins",
  title: "",
  description: "",
  platform: "mobile" as "mobile" | "ps" | "pc" | "xbox",
  price: "",
  team_rating: "",
  coin_balance: "",
  gp_balance: "",
  key_players: "",
  delivery_time: "15 daqiqa",
  images: [] as string[],
};

const ITEMS_PER_PAGE = 6;

export default function SellerDashboardPage() {
  const router = useRouter();
  const sbRef = useRef<any>(null);

  // User & Auth State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tab & Navigation State
  const [activeTab, setActiveTab] = useState<SellerTab>("listings");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data Collections
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Search, Filters & Pagination State
  const [listingSearch, setListingSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [form, setForm] = useState(emptyListingForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteProcessingId, setDeleteProcessingId] = useState<string | null>(null);

  // Payout State
  const [payoutCardNumber, setPayoutCardNumber] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // Fetch all seller data from Supabase
  const fetchSellerData = useCallback(async (uid: string, sb: any) => {
    setIsRefreshing(true);
    try {
      const [listingsRes, ordersRes] = await Promise.all([
        sb
          .from("listings")
          .select("*")
          .eq("seller_id", uid)
          .order("created_at", { ascending: false }),
        sb
          .from("orders")
          .select("*, listing:listings(title, type, price, platform), buyer:profiles(full_name, email, telegram_username)")
          .eq("seller_id", uid)
          .order("created_at", { ascending: false }),
      ]);

      if (listingsRes.data) setListings(listingsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data as Order[]);
    } catch (err) {
      console.error("Seller data fetch error:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initialize Seller Dashboard
  useEffect(() => {
    const init = async () => {
      try {
        const sb = createClient();
        sbRef.current = sb;

        const {
          data: { user },
        } = await sb.auth.getUser();

        // Check if admin demo session is active
        if (!user) {
          if (
            typeof window !== "undefined" &&
            sessionStorage.getItem("efzone_admin_session") === "true"
          ) {
            const adminProf: Profile = {
              id: "admin-1",
              role: "admin",
              full_name: "Platforma Me'mori (Admin)",
              seller_status: "approved",
              avatar_url: null,
              telegram_username: "efzone_admin",
              created_at: new Date().toISOString(),
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
          await fetchSellerData(user.id, sb);
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
        console.error("Seller dashboard init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router, fetchSellerData]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditListing(null);
    setForm(emptyListingForm);
    setFormError("");
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: Listing) => {
    setEditListing(item);
    setForm({
      type: "account",
      title: item.title,
      description: item.description || "",
      platform: item.platform,
      price: item.price.toString(),
      team_rating: item.team_rating ? item.team_rating.toString() : "",
      coin_balance: item.coin_balance ? item.coin_balance.toString() : "",
      gp_balance: item.gp_balance ? item.gp_balance.toString() : "",
      key_players: item.key_players ? item.key_players.join(", ") : "",
      delivery_time: item.delivery_time || "15 daqiqa",
      images: item.images && item.images.length > 0 ? item.images : [],
    });
    setFormError("");
    setModalOpen(true);
  };

  // Save / Update Listing
  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.title.trim()) {
      setFormError("Iltimos, e'lon sarlavhasini kiriting.");
      return;
    }

    const parsedPrice = parseFloat(form.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError("Iltimos, to'g'ri narxni kiriting ($ USD).");
      return;
    }

    if (form.images.length === 0) {
      setFormError("Iltimos, kamida 1 ta rasm (muqova) yuklang.");
      return;
    }

    setSaving(true);

    const payload: any = {
      seller_id: profile?.id,
      type: "account",
      title: form.title.trim(),
      description: form.description.trim() || null,
      platform: form.platform,
      price: parsedPrice,
      delivery_time: form.delivery_time,
      images: form.images,
      team_rating: form.team_rating ? parseInt(form.team_rating) : 3100,
      coin_balance: form.coin_balance ? parseInt(form.coin_balance) : 0,
      gp_balance: form.gp_balance ? parseInt(form.gp_balance) : 0,
      key_players: form.key_players
        ? form.key_players
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : ["106 Messi", "105 Ronaldo"],
      status: "pending_review", // New / edited listings go to moderation for safety
      created_at: new Date().toISOString(),
    };

    try {
      if (sbRef.current) {
        if (editListing) {
          await sbRef.current
            .from("listings")
            .update(payload)
            .eq("id", editListing.id);
        } else {
          const { data: inserted, error: insertErr } = await sbRef.current
            .from("listings")
            .insert(payload)
            .select()
            .single();

          if (insertErr) throw insertErr;
          if (inserted) payload.id = inserted.id;
        }
      }

      if (!payload.id) payload.id = editListing?.id || "listing-" + Date.now();

      if (editListing) {
        setListings((prev) =>
          prev.map((l) => (l.id === editListing.id ? { ...l, ...payload } : l))
        );
      } else {
        setListings((prev) => [payload, ...prev]);
      }

      setModalOpen(false);
      setForm(emptyListingForm);
    } catch (err: any) {
      console.error("Save listing error:", err);
      setFormError(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  // Delete Listing
  const handleDeleteListing = async (id: string) => {
    if (!confirm("E'lonni o'chirib tashlashni tasdiqlaysizmi?")) return;
    setDeleteProcessingId(id);
    try {
      if (sbRef.current) {
        await sbRef.current.from("listings").delete().eq("id", id);
      }
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleteProcessingId(null);
    }
  };

  // Payout Submit
  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutCardNumber || !payoutAmount) return;
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      setPayoutCardNumber("");
      setPayoutAmount("");
    }, 4000);
  };

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      const matchSearch =
        l.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
        l.platform.toLowerCase().includes(listingSearch.toLowerCase());
      const matchStatus = statusFilter === "all" ? true : l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [listings, listingSearch, statusFilter]);

  // Paginated Listings
  const totalPages = Math.max(1, Math.ceil(filteredListings.length / ITEMS_PER_PAGE));
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredListings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredListings, currentPage]);

  // Key Metrics
  const activeCount = listings.filter((l) => l.status === "active").length;
  const pendingCount = listings.filter((l) => l.status === "pending_review").length;
  const soldCount = listings.filter((l) => l.status === "sold").length;
  const totalEarnings = orders
    .filter((o) => o.status === "completed" || o.status === "confirmed")
    .reduce((sum, o) => sum + (o.price || 0), 0);

  // Guard Screen: Not a verified seller
  const isSeller =
    profile?.role === "seller" ||
    profile?.role === "admin" ||
    profile?.seller_status === "approved";

  if (loading) {
    return (
      <div className="seller-loading-screen">
        <div className="seller-loading-box">
          <Loader2 size={38} className="animate-spin text-blue" />
          <span>Sotuvchi boshqaruv kabineti yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (!isSeller) {
    return (
      <div className="seller-guard-screen">
        <div className="guard-card animate-scale-up">
          <div className="guard-icon-wrap">
            <ShieldAlert size={38} className="text-amber" />
          </div>
          <h1 className="guard-title">Sotuvchi Kabineti Cheklangan</h1>
          <p className="guard-desc">
            Siz hozirda <strong>Xaridor</strong> hisobidasiz. Ushbu kabinet faqat tasdiqlangan va verifikatsiyadan o&apos;tgan sotuvchilar uchun ochiladi.
          </p>

          <div className="guard-instruction-box">
            <h4 className="instruction-heading">Qanday qilib sotuvchi bo&apos;lish mumkin?</h4>
            <p className="instruction-text">
              O&apos;z eFootball akkauntingizni sotuvga qo&apos;yish uchun ariza yuboring. Moderatorlar tekshirgach sizga avtomatik sotuvchi kabineti ochiladi.
            </p>
          </div>

          <div className="guard-actions-row">
            <Link href="/seller/apply" className="btn-primary-guard">
              <PlusCircle size={16} /> Sotuvchi Bo&apos;lish Uchun Ariza Yuborish
            </Link>
            <Link href="/profile" className="btn-secondary-guard">
              Mening Profilimga Qaytish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-dashboard-container">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="seller-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modern SaaS Left Sidebar */}
      <aside className={`seller-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-box">
          <div className="brand-icon-pill">
            <BadgeCheck size={18} className="text-emerald" />
          </div>
          <div className="brand-info">
            <span className="brand-title">eFootball Zone</span>
            <span className="brand-badge">SOTUVCHI PANELI</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="sidebar-close-mobile-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Seller Profile Pill */}
        <div className="sidebar-user-pill">
          <div className="seller-bubble-avatar">
            {(profile?.full_name || profile?.email || "S").charAt(0).toUpperCase()}
          </div>
          <div className="seller-bubble-info">
            <span className="seller-bubble-name">{profile?.full_name || "Sotuvchi"}</span>
            <span className="seller-bubble-role">Tasdiqlangan Partner</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="sidebar-nav-list">
          <button
            type="button"
            onClick={() => {
              setActiveTab("listings");
              setSidebarOpen(false);
            }}
            className={`nav-tab-item ${activeTab === "listings" ? "active" : ""}`}
          >
            <div className="nav-icon-label">
              <Package size={17} />
              <span>Mening E&apos;lonlarim</span>
            </div>
            <span className="nav-count-sub">{listings.length}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("orders");
              setSidebarOpen(false);
            }}
            className={`nav-tab-item ${activeTab === "orders" ? "active" : ""}`}
          >
            <div className="nav-icon-label">
              <ShoppingBag size={17} />
              <span>Savdolar & Escrow</span>
            </div>
            <span className="nav-count-sub">{orders.length}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("earnings");
              setSidebarOpen(false);
            }}
            className={`nav-tab-item ${activeTab === "earnings" ? "active" : ""}`}
          >
            <div className="nav-icon-label">
              <Wallet size={17} />
              <span>Mablag&apos; & Payout</span>
            </div>
            <span className="nav-count-sub text-emerald">${totalEarnings}</span>
          </button>
        </nav>

        {/* Quick Action Button */}
        <div className="sidebar-action-box">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="sidebar-create-btn"
          >
            <Plus size={16} />
            <span>Yangi E&apos;lon Joylash</span>
          </button>
        </div>

        {/* Sidebar Bottom Footer */}
        <div className="sidebar-footer-group">
          <Link href="/" className="sidebar-store-link">
            <Store size={16} />
            <span>Do&apos;konga Qaytish</span>
          </Link>
          <Link href="/profile" className="sidebar-store-link">
            <User size={16} />
            <span>Mening Profilim</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="seller-main-viewport">
        {/* Top Header Bar */}
        <header className="seller-topbar">
          <div className="topbar-left">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="mobile-sidebar-toggle-btn"
              aria-label="Menyuni ochish"
            >
              <Menu size={20} />
            </button>

            <div className="topbar-breadcrumbs">
              <span className="breadcrumb-root">Sotuvchi</span>
              <ChevronRight size={14} className="breadcrumb-sep" />
              <span className="breadcrumb-current">
                {activeTab === "listings" && "Mening E'lonlarim"}
                {activeTab === "orders" && "Savdolar & Escrow Tarixi"}
                {activeTab === "earnings" && "Mablag' va Payout"}
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="connection-status-pill" title="Supabase Realtime Ulangan">
              <span className="status-live-dot" />
              <span className="status-pill-text">Realtime</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (profile && sbRef.current) fetchSellerData(profile.id, sbRef.current);
              }}
              disabled={isRefreshing}
              className="topbar-refresh-btn"
              title="Yangilash"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              <span className="hidden-mobile-btn">Yangilash</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="topbar-primary-btn"
            >
              <Plus size={15} />
              <span>E&apos;lon Joylash</span>
            </button>
          </div>
        </header>

        {/* Mobile Horizontal Quick Tabs Bar */}
        <div className="mobile-seller-tabs-bar">
          {[
            { key: "listings", label: "E'lonlarim", icon: Package, count: listings.length },
            { key: "orders", label: "Savdolar", icon: ShoppingBag, count: orders.length },
            { key: "earnings", label: "Mablag'", icon: Wallet, count: `$${totalEarnings}` },
          ].map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key as SellerTab)}
                className={`mobile-tab-pill-btn ${isActive ? "active" : ""}`}
              >
                <t.icon size={14} />
                <span>{t.label}</span>
                <span className="tab-chip-counter">{t.count}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <main className="seller-content-scroll">
          {/* TAB 1: LISTINGS */}
          {activeTab === "listings" && (
            <div className="tab-pane animate-fade-in">
              {/* Stat Metric Grid (2x2 on Mobile, 4-Col on Desktop) */}
              <div className="metrics-grid">
                <div className="metric-card card-listings">
                  <div className="metric-icon-wrap bg-blue-soft">
                    <Package size={20} className="text-blue" />
                  </div>
                  <div className="metric-data">
                    <span className="metric-label">Faol E&apos;lonlar</span>
                    <div className="metric-value-row">
                      <span className="metric-number">{activeCount}</span>
                      <span className="metric-unit">ta hisob</span>
                    </div>
                  </div>
                </div>

                <div className="metric-card card-moderation">
                  <div className="metric-icon-wrap bg-amber-soft">
                    <Clock size={20} className="text-amber" />
                  </div>
                  <div className="metric-data">
                    <span className="metric-label">Moderatsiyada</span>
                    <div className="metric-value-row">
                      <span className="metric-number">{pendingCount}</span>
                      <span className="metric-unit">ta ariza</span>
                    </div>
                  </div>
                </div>

                <div className="metric-card card-orders">
                  <div className="metric-icon-wrap bg-purple-soft">
                    <ShoppingBag size={20} className="text-purple" />
                  </div>
                  <div className="metric-data">
                    <span className="metric-label">Muvaffaqiyatli Savdo</span>
                    <div className="metric-value-row">
                      <span className="metric-number">{soldCount}</span>
                      <span className="metric-unit">ta bitim</span>
                    </div>
                  </div>
                </div>

                <div className="metric-card card-earnings">
                  <div className="metric-icon-wrap bg-emerald-soft">
                    <DollarSign size={20} className="text-emerald" />
                  </div>
                  <div className="metric-data">
                    <span className="metric-label">Umumiy Daromad</span>
                    <div className="metric-value-row">
                      <span className="metric-number">${totalEarnings.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Toolbar with Search and Fast Chips */}
              <div className="seller-toolbar">
                <div className="search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    value={listingSearch}
                    onChange={(e) => {
                      setListingSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Sarlavha yoki platforma bo'yicha..."
                    className="toolbar-search-input"
                  />
                  {listingSearch && (
                    <button
                      type="button"
                      onClick={() => setListingSearch("")}
                      className="search-clear-btn"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="filter-pills-bar">
                  {[
                    { key: "all", label: `Barchasi (${listings.length})` },
                    { key: "active", label: `Faol (${activeCount})` },
                    { key: "pending_review", label: `Moderatsiyada (${pendingCount})` },
                    { key: "sold", label: `Sotilgan (${soldCount})` },
                  ].map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={() => {
                        setStatusFilter(chip.key);
                        setCurrentPage(1);
                      }}
                      className={`filter-pill-btn ${statusFilter === chip.key ? "active" : ""}`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Listings Container */}
              <div className="seller-surface-card">
                {filteredListings.length === 0 ? (
                  <div className="seller-empty-box">
                    <Package size={42} className="text-blue" />
                    <h3 className="empty-title">E&apos;lonlar topilmadi</h3>
                    <p className="empty-sub">
                      Hozircha sizda bu toifada e&apos;lonlar mavjud emas. Yangi e&apos;lon qo&apos;shib savdoni boshlang!
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenCreateModal}
                      className="btn-empty-create"
                    >
                      <Plus size={16} /> Birinchi E&apos;lonni Joylash
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="table-responsive desktop-table-view">
                      <table className="seller-custom-table">
                        <thead>
                          <tr>
                            <th>E&apos;lon / Rasmlar</th>
                            <th>Platforma</th>
                            <th>Reyting / OVR</th>
                            <th>Narx ($ / UZS)</th>
                            <th>Holati</th>
                            <th>Amallar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedListings.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <div className="listing-table-title-cell">
                                  <div className="listing-thumb-preview">
                                    <img
                                      src={item.images?.[0] || "/hero-bg.jpg"}
                                      alt={item.title}
                                      className="table-img"
                                    />
                                    {item.images && item.images.length > 1 && (
                                      <span className="table-img-count">
                                        +{item.images.length - 1}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <div className="table-item-title">{item.title}</div>
                                    <div className="table-item-date">{formatDate(item.created_at)}</div>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <span className="platform-tag">
                                  {getPlatformLabel(item.platform)}
                                </span>
                              </td>

                              <td>
                                <span className="ovr-badge">
                                  {item.team_rating || 0} OVR
                                </span>
                              </td>

                              <td>
                                <div className="price-cell-box">
                                  <span className="price-bold">${item.price}</span>
                                  <span className="price-sub-uzs">
                                    ≈ {(item.price * 13000).toLocaleString()} so&apos;m
                                  </span>
                                </div>
                              </td>

                              <td>
                                <span className={`status-pill status-${item.status}`}>
                                  {item.status === "active"
                                    ? "Faol / Sotuvda"
                                    : item.status === "pending_review"
                                    ? "Tekshiruvda"
                                    : item.status === "sold"
                                    ? "Sotilgan"
                                    : "Rad etilgan"}
                                </span>
                              </td>

                              <td>
                                <div className="action-buttons-cell">
                                  <Link
                                    href={`/listings/${item.id}`}
                                    target="_blank"
                                    className="btn-action-icon"
                                    title="Saytda ko'rish"
                                  >
                                    <Eye size={15} />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(item)}
                                    className="btn-action-icon btn-edit"
                                    title="Tahrirlash"
                                  >
                                    <Edit2 size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteListing(item.id)}
                                    disabled={deleteProcessingId === item.id}
                                    className="btn-action-icon btn-delete"
                                    title="O'chirish"
                                  >
                                    {deleteProcessingId === item.id ? (
                                      <Loader2 size={15} className="animate-spin" />
                                    ) : (
                                      <Trash2 size={15} />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards Feed */}
                    <div className="mobile-cards-feed">
                      {paginatedListings.map((item) => (
                        <div key={item.id} className="mobile-seller-card">
                          <div className="card-top-header">
                            <div className="card-cover-wrapper">
                              <img
                                src={item.images?.[0] || "/hero-bg.jpg"}
                                alt={item.title}
                                className="card-cover-img"
                              />
                              {item.images && item.images.length > 1 && (
                                <span className="card-multi-badge">
                                  📷 {item.images.length} ta
                                </span>
                              )}
                            </div>

                            <div className="card-header-info">
                              <span className="card-title-text">{item.title}</span>
                              <span className="card-date-text">{formatDate(item.created_at)}</span>
                              <div className="card-price-row">
                                <span className="price-large">${item.price}</span>
                                <span className="price-uzs">
                                  ≈ {(item.price * 13000).toLocaleString()} so&apos;m
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="card-badges-row">
                            <span className="platform-tag">{getPlatformLabel(item.platform)}</span>
                            <span className="ovr-badge">{item.team_rating || 0} OVR</span>
                            <span className={`status-pill status-${item.status}`}>
                              {item.status === "active"
                                ? "Faol"
                                : item.status === "pending_review"
                                ? "Tekshiruvda"
                                : item.status === "sold"
                                ? "Sotilgan"
                                : "Rad etilgan"}
                            </span>
                          </div>

                          <div className="card-footer-actions">
                            <Link href={`/listings/${item.id}`} target="_blank" className="btn-mobile-view">
                              <Eye size={14} /> Ko&apos;rish
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="btn-mobile-edit"
                            >
                              <Edit2 size={14} /> Tahrirlash
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteListing(item.id)}
                              className="btn-mobile-delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="pagination-bar">
                        <span className="pagination-info">
                          Jami: <strong>{filteredListings.length}</strong> ta ({currentPage}/{totalPages}-sahifa)
                        </span>

                        <div className="pagination-buttons">
                          <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="btn-page-nav"
                          >
                            <ChevronLeft size={16} /> Oldingi
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                            <button
                              key={pg}
                              type="button"
                              onClick={() => setCurrentPage(pg)}
                              className={`btn-page-number ${currentPage === pg ? "active" : ""}`}
                            >
                              {pg}
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="btn-page-nav"
                          >
                            Keyingi <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS & ESCROW */}
          {activeTab === "orders" && (
            <div className="tab-pane animate-fade-in">
              <div className="seller-surface-card">
                <div className="card-head-title-row">
                  <ShoppingBag size={20} className="text-purple" />
                  <h2 className="card-pane-title">Savdolar va Escrow Tarixi</h2>
                </div>

                {orders.length === 0 ? (
                  <div className="seller-empty-box">
                    <ShoppingBag size={42} className="text-purple" />
                    <h3 className="empty-title">Savdolar tarixi mavjud emas</h3>
                    <p className="empty-sub">
                      Xaridorlar sizning e&apos;lonlaringizni xarid qilganda buyurtmalar shu yerda paydo bo&apos;ladi.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="seller-custom-table">
                      <thead>
                        <tr>
                          <th>Buyurtma ID</th>
                          <th>Akkount</th>
                          <th>Summa</th>
                          <th>Xaridor</th>
                          <th>Holati</th>
                          <th>Sana</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o.id}>
                            <td>
                              <span className="order-mono-id">#{o.id.slice(0, 8)}</span>
                            </td>
                            <td>
                              <span className="order-title-td">{o.listing?.title || "eFootball Hisob"}</span>
                            </td>
                            <td>
                              <span className="price-bold">${o.price}</span>
                            </td>
                            <td>
                              <span className="buyer-td-text">
                                {o.buyer?.full_name || o.buyer?.email || "Xaridor"}
                              </span>
                            </td>
                            <td>
                              <span className={`status-pill status-${o.status}`}>
                                {o.status === "completed"
                                  ? "Yakunlandi"
                                  : o.status === "confirmed"
                                  ? "Tasdiqlandi"
                                  : o.status === "paid"
                                  ? "Escrowda (To'langan)"
                                  : o.status === "delivered"
                                  ? "Yetkazildi"
                                  : o.status}
                              </span>
                            </td>
                            <td>
                              <span className="date-td">{formatDate(o.created_at)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: EARNINGS & PAYOUT */}
          {activeTab === "earnings" && (
            <div className="tab-pane animate-fade-in">
              <div className="earnings-split-grid">
                {/* Balance Summary Card */}
                <div className="seller-surface-card">
                  <div className="card-head-title-row">
                    <Wallet size={20} className="text-emerald" />
                    <h2 className="card-pane-title">Mablag&apos; Balansi</h2>
                  </div>

                  <div className="balance-highlight-box">
                    <span className="balance-label">Yechib olish mumkin bo&apos;lgan balans:</span>
                    <div className="balance-amount-row">
                      <span className="balance-val">${totalEarnings}</span>
                      <span className="balance-uzs-val">
                        ≈ {(totalEarnings * 13000).toLocaleString()} so&apos;m
                      </span>
                    </div>
                  </div>

                  <div className="payout-details-list">
                    <div className="payout-stat-item">
                      <span>Savdo komissiyasi:</span>
                      <strong className="text-emerald">0% (Aksiya)</strong>
                    </div>
                    <div className="payout-stat-item">
                      <span>Escrow himoya holati:</span>
                      <strong className="text-blue">Faol</strong>
                    </div>
                    <div className="payout-stat-item">
                      <span>Minimal yechish summasi:</span>
                      <strong>$5 USD (65,000 so&apos;m)</strong>
                    </div>
                  </div>
                </div>

                {/* Request Payout Form */}
                <div className="seller-surface-card">
                  <div className="card-head-title-row">
                    <CreditCard size={20} className="text-blue" />
                    <h2 className="card-pane-title">Pulni Kartaga Yechib Olish</h2>
                  </div>

                  {payoutSuccess ? (
                    <div className="payout-success-alert animate-fade-in">
                      <CheckCircle2 size={32} className="text-emerald" />
                      <h4>Yechib olish arizasi qabul qilindi!</h4>
                      <p>
                        Mablag&apos; 15-30 daqiqa ichida belgilangan Uzcard/Humo kartangizga o&apos;tkaziladi.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePayoutSubmit} className="payout-form">
                      <div className="form-group">
                        <label className="form-label">UZCARD / HUMO Karta Raqami</label>
                        <input
                          type="text"
                          required
                          value={payoutCardNumber}
                          onChange={(e) => setPayoutCardNumber(e.target.value)}
                          placeholder="8600 0000 0000 0000"
                          className="seller-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Yechib olinadigan summa ($ USD)</label>
                        <input
                          type="number"
                          required
                          min="5"
                          max={totalEarnings || 5000}
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          placeholder="50"
                          className="seller-input"
                        />
                      </div>

                      <button type="submit" className="btn-payout-submit">
                        <Send size={15} /> Mablag&apos;ni Yechib Olish
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT LISTING MODAL (With Multi-Image Uploader) */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="modal-content-card animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-line">
              <div className="modal-header-title">
                <Package size={20} className="text-blue" />
                <h3>{editListing ? "E'lonni Tahrirlash" : "Yangi E'lon Joylash"}</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="modal-error-alert animate-fade-in">
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveListing} className="modal-listing-form">
              {/* Multi-Image File Uploader (1 to 6 images) */}
              <ImageUploader
                images={form.images}
                onChange={(imgs) => setForm({ ...form, images: imgs })}
                maxImages={6}
              />

              {/* Title */}
              <div className="form-group">
                <label className="form-label">E&apos;lon Sarlavhasi *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Masalan: 3220 OVR + Big Time Messi, 105 Mbappe, 5M GP"
                  className="seller-input"
                />
              </div>

              {/* Platform Selector Pills */}
              <div className="form-group">
                <label className="form-label">O&apos;yin Platformasi *</label>
                <div className="platform-radio-grid">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setForm({ ...form, platform: p.id as any })}
                      className={`platform-select-btn ${form.platform === p.id ? "active" : ""}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Row: Price + OVR + Delivery */}
              <div className="form-row-three">
                <div className="form-group">
                  <label className="form-label">Narxi ($ USD) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="45"
                    className="seller-input"
                  />
                  {form.price && !isNaN(parseFloat(form.price)) && (
                    <span className="price-calc-hint">
                      ≈ {(parseFloat(form.price) * 13000).toLocaleString()} so&apos;m
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Jamoa OVR Reytingi</label>
                  <input
                    type="number"
                    value={form.team_rating}
                    onChange={(e) => setForm({ ...form, team_rating: e.target.value })}
                    placeholder="3210"
                    className="seller-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Yetkazish Vaqti</label>
                  <select
                    value={form.delivery_time}
                    onChange={(e) => setForm({ ...form, delivery_time: e.target.value })}
                    className="seller-select"
                  >
                    {DELIVERY_TIMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Balances: Coin + GP */}
              <div className="form-row-two">
                <div className="form-group">
                  <label className="form-label">Coin Balansi (ixtiyoriy)</label>
                  <input
                    type="number"
                    value={form.coin_balance}
                    onChange={(e) => setForm({ ...form, coin_balance: e.target.value })}
                    placeholder="1200"
                    className="seller-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GP Balansi (ixtiyoriy)</label>
                  <input
                    type="number"
                    value={form.gp_balance}
                    onChange={(e) => setForm({ ...form, gp_balance: e.target.value })}
                    placeholder="3500000"
                    className="seller-input"
                  />
                </div>
              </div>

              {/* Key Players */}
              <div className="form-group">
                <label className="form-label">Asosiy Yulduz O&apos;yinchilar (vergul bilan)</label>
                <input
                  type="text"
                  value={form.key_players}
                  onChange={(e) => setForm({ ...form, key_players: e.target.value })}
                  placeholder="106 Messi, 105 Ronaldo, 104 Neymar, 103 Haaland"
                  className="seller-input"
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Qo&apos;shimcha Tavsif</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Akkaunt toza, hech qanday ban yoki cheklovlarga uchramagan. Konami ID bilan birga topshiriladi..."
                  className="seller-textarea"
                />
              </div>

              {/* Modal Actions */}
              <div className="modal-actions-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-modal-cancel"
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-modal-submit"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <Check size={16} /> {editListing ? "O'zgarishlarni Saqlash" : "E'lonni Joylash"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded High-End SaaS Styles */}
      <style jsx>{`
        .seller-dashboard-container {
          min-height: 100vh;
          background: #030712;
          color: #FFF;
          display: flex;
          font-family: 'Inter', sans-serif;
          position: relative;
        }

        /* Sidebar Styles */
        .seller-sidebar {
          width: 260px;
          background: rgba(8, 14, 30, 0.95);
          backdrop-filter: blur(28px);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 150;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sidebar-brand-box {
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .brand-icon-pill {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .brand-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .brand-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 15px;
          color: #FFF;
          line-height: 1.1;
        }
        .brand-badge {
          font-size: 9.5px;
          font-weight: 800;
          color: #34D399;
          letter-spacing: 0.06em;
          margin-top: 2px;
        }
        .sidebar-close-mobile-btn {
          display: none;
          background: none;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
        }

        .sidebar-user-pill {
          padding: 14px 18px;
          margin: 12px 14px 4px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .seller-bubble-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #2563EB;
          color: #FFF;
          font-weight: 800;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .seller-bubble-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .seller-bubble-name {
          font-size: 12.5px;
          font-weight: 700;
          color: #FFF;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .seller-bubble-role {
          font-size: 10.5px;
          color: #34D399;
          font-weight: 600;
        }

        .sidebar-nav-list {
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        .nav-tab-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          border-radius: 12px;
          background: transparent;
          border: none;
          color: rgba(209, 213, 219, 0.85);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .nav-tab-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #FFF;
        }
        .nav-tab-item.active {
          background: #2563EB;
          color: #FFF;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
        }
        .nav-icon-label {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-count-sub {
          font-size: 11px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.12);
          padding: 2px 7px;
          border-radius: 999px;
        }

        .sidebar-action-box {
          padding: 12px 14px;
        }
        .sidebar-create-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 16px;
          border-radius: 12px;
          background: linear-gradient(135deg, #10B981, #059669);
          border: none;
          color: #FFF;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
          transition: all 0.2s ease;
        }
        .sidebar-create-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
        }

        .sidebar-footer-group {
          padding: 14px 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sidebar-store-link {
          display: flex;
          align-items: center;
          gap: 9px;
          color: rgba(156, 163, 175, 0.8);
          font-size: 12.5px;
          font-weight: 600;
          text-decoration: none;
          padding: 6px 8px;
          border-radius: 8px;
          transition: all 0.15s ease;
        }
        .sidebar-store-link:hover {
          color: #FFF;
          background: rgba(255, 255, 255, 0.04);
        }

        /* Viewport & Topbar */
        .seller-main-viewport {
          margin-left: 260px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .seller-topbar {
          height: 60px;
          background: rgba(8, 14, 30, 0.85);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .mobile-sidebar-toggle-btn {
          display: none;
          background: none;
          border: none;
          color: #FFF;
          cursor: pointer;
        }
        .topbar-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13.5px;
        }
        .breadcrumb-root { color: rgba(156, 163, 175, 0.7); }
        .breadcrumb-sep { color: rgba(156, 163, 175, 0.4); }
        .breadcrumb-current { font-weight: 700; color: #FFF; }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .connection-status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          font-size: 11.5px;
          font-weight: 600;
          color: #34D399;
        }
        .status-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34D399;
        }
        .topbar-refresh-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #FFF;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .topbar-primary-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 999px;
          background: #2563EB;
          border: none;
          color: #FFF;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(37, 99, 235, 0.35);
        }

        .mobile-seller-tabs-bar {
          display: none;
          padding: 8px 12px;
          gap: 6px;
          overflow-x: auto;
          background: rgba(8, 14, 30, 0.95);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          scrollbar-width: none;
        }
        .mobile-tab-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(209, 213, 219, 0.85);
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
        }
        .mobile-tab-pill-btn.active {
          background: #2563EB;
          color: #FFF;
        }
        .tab-chip-counter {
          font-size: 10px;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.15);
          padding: 1px 5px;
          border-radius: 999px;
        }

        /* Content Area */
        .seller-content-scroll {
          padding: 24px;
          flex: 1;
        }
        .tab-pane {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Stat Metrics */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .metric-card {
          background: rgba(10, 17, 36, 0.85);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 18px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .metric-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bg-blue-soft { background: rgba(37, 99, 235, 0.12); border: 1px solid rgba(37, 99, 235, 0.2); }
        .bg-amber-soft { background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.2); }
        .bg-purple-soft { background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.2); }
        .bg-emerald-soft { background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.2); }

        .metric-data {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .metric-label {
          font-size: 11.5px;
          font-weight: 600;
          color: rgba(156, 163, 175, 0.85);
        }
        .metric-value-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .metric-number {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #FFF;
        }
        .metric-unit {
          font-size: 11.5px;
          color: rgba(156, 163, 175, 0.7);
        }

        /* Toolbar */
        .seller-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 240px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          color: rgba(156, 163, 175, 0.6);
        }
        .search-clear-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: rgba(156, 163, 175, 0.7);
          cursor: pointer;
        }
        .toolbar-search-input {
          width: 100%;
          background: rgba(10, 17, 36, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 10px 36px 10px 38px;
          font-size: 13px;
          color: #FFF;
          outline: none;
        }
        .filter-pills-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .filter-pill-btn {
          padding: 7px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(209, 213, 219, 0.85);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .filter-pill-btn.active {
          background: #2563EB;
          border-color: #2563EB;
          color: #FFF;
        }

        /* Surface Card */
        .seller-surface-card {
          background: rgba(10, 17, 36, 0.85);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 20px;
          overflow: hidden;
        }
        .card-head-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .card-pane-title {
          font-family: 'Outfit', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #FFF;
          margin: 0;
        }

        .seller-empty-box {
          text-align: center;
          padding: 42px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .empty-title {
          font-size: 16px;
          font-weight: 700;
          color: #FFF;
          margin: 0;
        }
        .empty-sub {
          font-size: 13px;
          color: rgba(156, 163, 175, 0.8);
          max-width: 380px;
          margin: 0;
          line-height: 1.5;
        }
        .btn-empty-create {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 12px;
          background: #2563EB;
          border: none;
          color: #FFF;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 6px;
        }

        /* Desktop Table */
        .seller-custom-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .seller-custom-table th {
          text-align: left;
          padding: 12px 16px;
          color: rgba(156, 163, 175, 0.8);
          font-size: 12px;
          font-weight: 600;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .seller-custom-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: #FFF;
        }
        .listing-table-title-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .listing-thumb-preview {
          position: relative;
          width: 48px;
          height: 36px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.04);
        }
        .table-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .table-img-count {
          position: absolute;
          bottom: 2px;
          right: 2px;
          background: rgba(0, 0, 0, 0.75);
          color: #FFF;
          font-size: 9px;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 4px;
        }
        .table-item-title { font-weight: 700; color: #FFF; }
        .table-item-date { font-size: 11px; color: rgba(156, 163, 175, 0.6); }
        .platform-tag {
          background: rgba(255, 255, 255, 0.06);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
        }
        .ovr-badge {
          background: rgba(37, 99, 235, 0.15);
          color: #60A5FA;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 700;
        }
        .price-cell-box {
          display: flex;
          flex-direction: column;
        }
        .price-bold {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: #34D399;
        }
        .price-sub-uzs {
          font-size: 11px;
          color: rgba(156, 163, 175, 0.7);
        }
        .status-pill {
          padding: 3px 9px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
        }
        .status-active { background: rgba(16, 185, 129, 0.14); color: #34D399; }
        .status-pending_review { background: rgba(245, 158, 11, 0.14); color: #FBBF24; }
        .status-sold { background: rgba(37, 99, 235, 0.14); color: #60A5FA; }

        .action-buttons-cell {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-action-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(209, 213, 219, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;
        }
        .btn-action-icon:hover {
          color: #FFF;
          background: rgba(255, 255, 255, 0.08);
        }
        .btn-edit:hover { color: #60A5FA; border-color: rgba(37, 99, 235, 0.4); }
        .btn-delete:hover { color: #FB7185; border-color: rgba(244, 63, 94, 0.4); }

        /* Mobile Cards Feed */
        .mobile-cards-feed {
          display: none;
          flex-direction: column;
          gap: 12px;
        }
        .mobile-seller-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .card-top-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .card-cover-wrapper {
          position: relative;
          width: 72px;
          height: 54px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.05);
        }
        .card-cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .card-multi-badge {
          position: absolute;
          bottom: 2px;
          right: 2px;
          background: rgba(0, 0, 0, 0.8);
          color: #FFF;
          font-size: 8.5px;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 4px;
        }
        .card-header-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .card-title-text {
          font-weight: 700;
          font-size: 13.5px;
          color: #FFF;
          line-height: 1.3;
        }
        .card-date-text {
          font-size: 11px;
          color: rgba(156, 163, 175, 0.6);
        }
        .card-price-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-top: 2px;
        }
        .price-large {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #34D399;
        }
        .price-uzs {
          font-size: 10.5px;
          color: rgba(156, 163, 175, 0.7);
        }
        .card-badges-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .card-footer-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }
        .btn-mobile-view, .btn-mobile-edit {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #FFF;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
        }
        .btn-mobile-delete {
          margin-left: auto;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(244, 63, 94, 0.1);
          color: #FB7185;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* Pagination */
        .pagination-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          margin-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          flex-wrap: wrap;
          gap: 12px;
        }
        .pagination-info {
          font-size: 12px;
          color: rgba(156, 163, 175, 0.8);
        }
        .pagination-buttons {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-page-nav {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #FFF;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-page-nav:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .btn-page-number {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #FFF;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-page-number.active {
          background: #2563EB;
          border-color: #2563EB;
        }

        /* Earnings Tab */
        .earnings-split-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .balance-highlight-box {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 16px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .balance-label {
          font-size: 12px;
          color: #34D399;
          font-weight: 600;
        }
        .balance-amount-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .balance-val {
          font-family: 'Outfit', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: #FFF;
        }
        .balance-uzs-val {
          font-size: 13px;
          color: rgba(209, 213, 219, 0.8);
        }
        .payout-details-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .payout-stat-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          color: rgba(209, 213, 219, 0.85);
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .payout-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .btn-payout-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #10B981, #059669);
          border: none;
          color: #FFF;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(16, 185, 129, 0.35);
        }
        .payout-success-alert {
          text-align: center;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .payout-success-alert h4 {
          font-size: 16px;
          font-weight: 700;
          color: #34D399;
          margin: 0;
        }
        .payout-success-alert p {
          font-size: 13px;
          color: rgba(209, 213, 219, 0.85);
          margin: 0;
          line-height: 1.5;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .modal-content-card {
          background: rgba(10, 16, 32, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 22px;
          padding: 24px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
        }
        .modal-header-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .modal-header-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .modal-header-title h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #FFF;
          margin: 0;
        }
        .modal-close-btn {
          background: none;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
        }
        .modal-error-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.3);
          color: #FB7185;
          font-size: 12.5px;
          margin-bottom: 14px;
        }
        .modal-listing-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-label {
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(209, 213, 219, 0.9);
        }
        .seller-input, .seller-select, .seller-textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 11px 14px;
          font-size: 13.5px;
          color: #FFF;
          outline: none;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s ease;
        }
        .seller-input:focus, .seller-select:focus, .seller-textarea:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
        }
        .platform-radio-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .platform-select-btn {
          padding: 10px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(209, 213, 219, 0.85);
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
        }
        .platform-select-btn.active {
          background: rgba(37, 99, 235, 0.2);
          border-color: #2563EB;
          color: #FFF;
        }
        .form-row-three {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }
        .form-row-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .price-calc-hint {
          font-size: 11px;
          color: #34D399;
          font-weight: 600;
          margin-top: 2px;
        }
        .modal-actions-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .btn-modal-cancel {
          padding: 10px 18px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          color: #FFF;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }
        .btn-modal-submit {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 22px;
          border-radius: 10px;
          background: #2563EB;
          color: #FFF;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
        }

        /* Utilities */
        .text-blue { color: #60A5FA; }
        .text-emerald { color: #34D399; }
        .text-amber { color: #FBBF24; }
        .text-purple { color: #C084FC; }

        /* Loading & Guard */
        .seller-loading-screen, .seller-guard-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #030712;
        }
        .seller-loading-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: rgba(209, 213, 219, 0.85);
          font-size: 14px;
        }
        .guard-card {
          background: rgba(10, 16, 32, 0.85);
          backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 22px;
          padding: 38px 28px;
          max-width: 480px;
          width: 100%;
          text-align: center;
        }
        .guard-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: rgba(245, 158, 11, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .guard-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #FFF;
          margin: 0 0 8px 0;
        }
        .guard-desc {
          font-size: 13px;
          color: rgba(209, 213, 219, 0.85);
          line-height: 1.5;
          margin: 0 0 18px 0;
        }
        .guard-instruction-box {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 14px 16px;
          text-align: left;
          margin-bottom: 20px;
        }
        .instruction-heading {
          font-size: 12.5px;
          font-weight: 700;
          color: #60A5FA;
          margin: 0 0 4px 0;
        }
        .instruction-text {
          font-size: 12px;
          color: rgba(156, 163, 175, 0.85);
          line-height: 1.4;
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
          padding: 12px;
          border-radius: 10px;
          background: #2563EB;
          color: #FFF;
          font-size: 13.5px;
          font-weight: 700;
          text-decoration: none;
        }
        .btn-secondary-guard {
          color: rgba(156, 163, 175, 0.8);
          font-size: 13px;
          text-decoration: none;
          padding: 8px;
        }

        /* Responsive Mobile Breakpoint */
        @media (max-width: 900px) {
          .seller-sidebar {
            transform: translateX(-100%);
          }
          .seller-sidebar.open {
            transform: translateX(0);
          }
          .seller-sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(6px);
            z-index: 140;
          }
          .seller-main-viewport {
            margin-left: 0;
          }
          .mobile-sidebar-toggle-btn {
            display: flex;
          }
          .sidebar-close-mobile-btn {
            display: flex;
          }
          .mobile-seller-tabs-bar {
            display: flex;
          }
          .seller-topbar {
            padding: 8px 12px;
            height: 52px;
          }
          .breadcrumb-root { display: none; }
          .breadcrumb-sep { display: none; }
          .seller-content-scroll {
            padding: 14px 10px;
          }

          /* 2x2 Metrics on Mobile */
          .metrics-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
          .metric-card {
            padding: 12px 14px !important;
            border-radius: 14px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          .metric-icon-wrap {
            width: 32px !important;
            height: 32px !important;
            border-radius: 8px !important;
          }
          .metric-icon-wrap svg {
            width: 16px !important;
            height: 16px !important;
          }
          .metric-label {
            font-size: 11px !important;
          }
          .metric-number {
            font-size: 20px !important;
          }
          .metric-unit {
            font-size: 10.5px !important;
          }

          .desktop-table-view {
            display: none !important;
          }
          .mobile-cards-feed {
            display: flex !important;
          }
          .hidden-mobile-btn {
            display: none;
          }
          .earnings-split-grid {
            grid-template-columns: 1fr;
          }
          .form-row-three, .form-row-two, .platform-radio-grid {
            grid-template-columns: 1fr;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-up {
          animation: scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
