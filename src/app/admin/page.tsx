"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Users,
  Package,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  AlertCircle,
  BarChart2,
  Shield,
  Clock,
  TrendingUp,
  Lock,
  ArrowLeft,
  ShieldAlert,
  Search,
  Filter,
  Check,
  X,
  Sparkles,
  LogOut,
  RefreshCw,
  BadgeCheck,
  UserCheck,
  UserX,
  DollarSign,
  ArrowRight,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import type { Listing, Order, Profile, UserRole } from "@/lib/types";
import { getPlatformLabel, formatDate } from "@/lib/utils";

type AdminTab = "overview" | "moderation" | "users" | "listings" | "orders";

// Master Credentials
const ADMIN_LOGIN_USER = "admin";
const ADMIN_LOGIN_PASS = "admin123";

export default function AdminPage() {
  const sbRef = useRef<any>(null);

  // Auth & Security state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard Data states (100% Dynamic from Supabase)
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Moderation state
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [listingToReject, setListingToReject] = useState<Listing | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [actionProcessing, setActionProcessing] = useState(false);

  // User Filter & Search
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");

  // Listing Filter & Search
  const [listingSearch, setListingSearch] = useState("");
  const [listingStatusFilter, setListingStatusFilter] = useState<string>("all");

  // Fetch real data from Supabase (Resilient In-Memory Join)
  const fetchAllData = useCallback(async (sb: any) => {
    try {
      const [listingsRes, profilesRes, ordersRes] = await Promise.all([
        sb
          .from("listings")
          .select("*")
          .order("created_at", { ascending: false }),
        sb.from("profiles").select("*").order("created_at", { ascending: false }),
        sb
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      const profilesData = profilesRes.data || [];
      const listingsData = listingsRes.data || [];
      const ordersData = ordersRes.data || [];

      const profileMap = new Map(profilesData.map((p: any) => [p.id, p]));
      const listingMap = new Map(listingsData.map((l: any) => [l.id, l]));

      const populatedListings = listingsData.map((l: any) => ({
        ...l,
        seller: profileMap.get(l.seller_id) || l.seller || null,
      }));

      const populatedOrders = ordersData.map((o: any) => ({
        ...o,
        listing: listingMap.get(o.listing_id),
        buyer: profileMap.get(o.buyer_id),
        seller: profileMap.get(o.seller_id),
      }));

      setListings(populatedListings);
      setUsers(profilesData);
      setOrders(populatedOrders);
    } catch (err) {
      console.error("Admin fetch error:", err);
    }
  }, []);

  // Initial Auth Check
  useEffect(() => {
    const checkSecurity = async () => {
      const savedAuth = sessionStorage.getItem("efzone_admin_session");
      if (savedAuth === "true") {
        setIsAuthenticated(true);
        if (isSupabaseConfigured) {
          const sb = createClient();
          sbRef.current = sb;
          await fetchAllData(sb);
        }
        setAuthLoading(false);
        return;
      }

      if (isSupabaseConfigured) {
        try {
          const sb = createClient();
          sbRef.current = sb;
          const {
            data: { user },
          } = await sb.auth.getUser();
          if (user) {
            const { data: prof } = await sb
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();
            if (prof?.role === "admin") {
              setIsAuthenticated(true);
              sessionStorage.setItem("efzone_admin_session", "true");
              await fetchAllData(sb);
              setAuthLoading(false);
              return;
            }
          }
        } catch {}
      }

      setIsAuthenticated(false);
      setAuthLoading(false);
    };

    checkSecurity();
  }, [fetchAllData]);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);

    const u = usernameInput.trim();
    const p = passwordInput.trim();

    if (u === ADMIN_LOGIN_USER && p === ADMIN_LOGIN_PASS) {
      setIsAuthenticated(true);
      sessionStorage.setItem("efzone_admin_session", "true");
      if (isSupabaseConfigured) {
        const sb = createClient();
        sbRef.current = sb;
        await fetchAllData(sb);
      }
      setLoggingIn(false);
      return;
    }

    // Try Supabase auth if username looks like email
    if (isSupabaseConfigured && u.includes("@")) {
      try {
        const sb = createClient();
        const { data, error } = await sb.auth.signInWithPassword({
          email: u,
          password: p,
        });
        if (!error && data.user) {
          const { data: prof } = await sb
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();
          if (prof?.role === "admin") {
            setIsAuthenticated(true);
            sessionStorage.setItem("efzone_admin_session", "true");
            sbRef.current = sb;
            await fetchAllData(sb);
            setLoggingIn(false);
            return;
          }
        }
      } catch {}
    }

    setLoginError("Login yoki parol noto'g'ri. Ruxsat berilmadi.");
    setLoggingIn(false);
  };

  // Handle Admin Logout
  const handleAdminLogout = () => {
    sessionStorage.removeItem("efzone_admin_session");
    setIsAuthenticated(false);
    setUsernameInput("");
    setPasswordInput("");
  };

  // Moderation: Approve Listing
  const handleApproveListing = async (listing: Listing) => {
    setActionProcessing(true);
    try {
      if (sbRef.current) {
        // 1. Update listing status to active
        await sbRef.current
          .from("listings")
          .update({ status: "active", reject_reason: null })
          .eq("id", listing.id);

        // 2. Upgrade seller profile to role 'seller' & seller_status 'approved'
        if (listing.seller_id) {
          await sbRef.current
            .from("profiles")
            .update({ role: "seller", seller_status: "approved" })
            .eq("id", listing.seller_id);
        }
      }

      // Update local states
      setListings((prev) =>
        prev.map((l) =>
          l.id === listing.id ? { ...l, status: "active", reject_reason: null } : l
        )
      );

      setUsers((prev) =>
        prev.map((u) =>
          u.id === listing.seller_id
            ? { ...u, role: u.role === "admin" ? "admin" : "seller", seller_status: "approved" }
            : u
        )
      );

      setSelectedListing(null);
    } catch (err) {
      console.error("Approve error:", err);
    } finally {
      setActionProcessing(false);
    }
  };

  // Moderation: Reject Listing
  const openRejectModal = (listing: Listing) => {
    setListingToReject(listing);
    setRejectReasonInput("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!listingToReject) return;
    const reason = rejectReasonInput.trim() || "Ma'lumotlar talabga javob bermaydi.";
    setActionProcessing(true);

    try {
      if (sbRef.current) {
        // Update listing to rejected with reason
        await sbRef.current
          .from("listings")
          .update({ status: "rejected", reject_reason: reason })
          .eq("id", listingToReject.id);
      }

      setListings((prev) =>
        prev.map((l) =>
          l.id === listingToReject.id
            ? { ...l, status: "rejected", reject_reason: reason }
            : l
        )
      );

      setRejectModalOpen(false);
      setListingToReject(null);
      setSelectedListing(null);
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setActionProcessing(false);
    }
  };

  // User Management: Change Role
  const handleChangeUserRole = async (userId: string, newRole: UserRole) => {
    try {
      if (sbRef.current) {
        await sbRef.current
          .from("profiles")
          .update({
            role: newRole,
            seller_status: newRole === "seller" ? "approved" : null,
          })
          .eq("id", userId);
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                role: newRole,
                seller_status: newRole === "seller" ? "approved" : u.seller_status,
              }
            : u
        )
      );
    } catch (err) {
      console.error("Role update error:", err);
    }
  };

  // Listing Management: Toggle Active / Removed
  const handleToggleListingStatus = async (listingId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "removed" : "active";
    try {
      if (sbRef.current) {
        await sbRef.current
          .from("listings")
          .update({ status: newStatus })
          .eq("id", listingId);
      }
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: newStatus as any } : l))
      );
    } catch (err) {
      console.error("Listing toggle error:", err);
    }
  };

  // Statistics Calculation
  const pendingModerationCount = listings.filter((l) => l.status === "pending_review").length;
  const activeListingsCount = listings.filter((l) => l.status === "active").length;
  const totalBuyers = users.filter((u) => u.role === "buyer").length;
  const totalSellers = users.filter((u) => u.role === "seller").length;
  const totalCompletedOrders = orders.filter((o) => o.status === "completed").length;
  const totalPlatformVolume = orders.reduce((sum, o) => sum + (o.price || 0), 0);

  if (authLoading) {
    return (
      <div className="admin-loading-view">
        <Loader2 size={38} className="animate-spin text-rose" />
        <span>Admin xavfsizlik protokoli tekshirilmoqda...</span>
      </div>
    );
  }

  // 🔒 AUTHENTICATION LOGIN GATE SCREEN
  if (!isAuthenticated) {
    return (
      <div className="admin-login-screen">
        <div className="admin-login-card animate-scale-up">
          <div className="login-icon-wrap">
            <ShieldAlert size={36} className="text-rose" />
          </div>

          <div className="login-badge-wrap">
            <span className="admin-security-badge">
              <Lock size={12} /> Boshqaruv Markazi (RBAC 256-Bit)
            </span>
          </div>

          <h1 className="login-title">Platforma Admin Paneli</h1>
          <p className="login-desc">
            Ushbu bo&apos;lim faqat vakolatli ma&apos;murlar uchun himoyalangan. Kirish uchun hisob ma&apos;lumotlarini kiriting.
          </p>

          {loginError && (
            <div className="login-error-alert animate-fade-in">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="admin-login-form">
            <div className="input-group">
              <label className="input-label" htmlFor="admin-u">
                Foydalanuvchi nomi yoki Email
              </label>
              <input
                id="admin-u"
                type="text"
                required
                autoComplete="username"
                placeholder="masalan: admin"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="admin-input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="admin-p">
                Maxfiy Parol
              </label>
              <input
                id="admin-p"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="admin-input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="admin-login-submit-btn"
            >
              {loggingIn ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Tekshirilmoqda...
                </>
              ) : (
                <>
                  Admin Panelga Kirish <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer-hint">
            <span>Demo kirish: <strong>admin</strong> / <strong>admin123</strong></span>
          </div>
        </div>

        <style>{`
          .admin-login-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            background: radial-gradient(circle at 50% 30%, rgba(244, 63, 94, 0.08) 0%, transparent 65%), #030712;
          }
          .admin-login-card {
            background: rgba(10, 16, 32, 0.85);
            backdrop-filter: blur(32px);
            border: 1px solid rgba(255, 255, 255, 0.09);
            border-radius: 24px;
            padding: 40px 36px;
            max-width: 440px;
            width: 100%;
            text-align: center;
            box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.8);
          }
          .login-icon-wrap {
            width: 68px;
            height: 68px;
            border-radius: 20px;
            background: rgba(244, 63, 94, 0.12);
            border: 1px solid rgba(244, 63, 94, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
          }
          .login-badge-wrap {
            margin-bottom: 12px;
          }
          .admin-security-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: rgba(244, 63, 94, 0.12);
            color: #FB7185;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 999px;
          }
          .login-title {
            font-family: 'Outfit', sans-serif;
            font-size: 23px;
            font-weight: 800;
            color: #FFF;
            margin: 0 0 6px 0;
            letter-spacing: -0.02em;
          }
          .login-desc {
            font-size: 13px;
            color: rgba(156, 163, 175, 0.85);
            line-height: 1.55;
            margin: 0 0 24px 0;
          }
          .login-error-alert {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 11px 14px;
            background: rgba(244, 63, 94, 0.12);
            border: 1px solid rgba(244, 63, 94, 0.3);
            border-radius: 10px;
            color: #FB7185;
            font-size: 13px;
            font-weight: 600;
            text-align: left;
            margin-bottom: 18px;
          }
          .admin-login-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .input-group {
            display: flex;
            flex-direction: column;
            text-align: left;
            gap: 6px;
          }
          .input-label {
            font-size: 12.5px;
            font-weight: 600;
            color: rgba(209, 213, 219, 0.9);
          }
          .admin-input-field {
            width: 100%;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 11px;
            padding: 11px 14px;
            font-size: 14px;
            color: #FFF;
            outline: none;
            box-sizing: border-box;
            transition: all 0.2s ease;
          }
          .admin-input-field:focus {
            border-color: rgba(244, 63, 94, 0.6);
            box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.15);
            background: rgba(244, 63, 94, 0.04);
          }
          .admin-login-submit-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 13px 20px;
            margin-top: 4px;
            background: linear-gradient(135deg, #F43F5E 0%, #E11D48 100%);
            color: #FFF;
            font-size: 14.5px;
            font-weight: 700;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(244, 63, 94, 0.4);
            transition: all 0.2s ease;
          }
          .admin-login-submit-btn:hover:not(:disabled) {
            transform: translateY(-1.5px);
            box-shadow: 0 8px 26px rgba(244, 63, 94, 0.55);
          }
          .admin-login-submit-btn:disabled {
            opacity: 0.65;
            cursor: not-allowed;
          }
          .login-footer-hint {
            margin-top: 20px;
            font-size: 12px;
            color: rgba(156, 163, 175, 0.7);
          }
          .login-footer-hint strong {
            color: #FFF;
          }
        `}</style>
      </div>
    );
  }

  // Filter Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.telegram_username?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole =
      userRoleFilter === "all" ? true : u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filter Listings
  const filteredListings = listings.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
      l.platform.toLowerCase().includes(listingSearch.toLowerCase());
    const matchesStatus =
      listingStatusFilter === "all" ? true : l.status === listingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pending Moderation Listings
  const pendingListings = listings.filter((l) => l.status === "pending_review");

  return (
    <div className="admin-root-layout">
      {/* Top Admin Header Bar */}
      <header className="admin-header-nav">
        <div className="container admin-header-content">
          <div className="admin-brand-group">
            <Link href="/" className="admin-back-btn" title="Bosh sahifaga">
              <ArrowLeft size={16} />
            </Link>
            <div className="admin-tag-pill">
              <ShieldAlert size={14} className="text-rose" />
              <span>Admin Boshqaruv Markazi</span>
            </div>
          </div>

          <div className="admin-header-actions">
            <button
              type="button"
              onClick={() => {
                if (sbRef.current) fetchAllData(sbRef.current);
              }}
              className="admin-action-pill"
              title="Yangilash"
            >
              <RefreshCw size={14} /> Yangilash
            </button>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="admin-logout-pill"
            >
              <LogOut size={14} /> Chiqish
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="container admin-main-body">
        {/* Navigation Tabs Bar */}
        <div className="admin-nav-tabs-bar">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          >
            <BarChart2 size={16} />
            <span>Umumiy Ko&apos;rinish</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("moderation")}
            className={`admin-tab-btn ${activeTab === "moderation" ? "active" : ""}`}
          >
            <Clock size={16} />
            <span>Moderatsiya & Arizalar</span>
            {pendingModerationCount > 0 && (
              <span className="tab-counter-badge">{pendingModerationCount}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
          >
            <Users size={16} />
            <span>Foydalanuvchilar & Rollar</span>
            <span className="tab-counter-badge neutral">{users.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("listings")}
            className={`admin-tab-btn ${activeTab === "listings" ? "active" : ""}`}
          >
            <Package size={16} />
            <span>Barcha E&apos;lonlar</span>
            <span className="tab-counter-badge neutral">{listings.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`admin-tab-btn ${activeTab === "orders" ? "active" : ""}`}
          >
            <ShoppingBag size={16} />
            <span>Savdolar & Escrow</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: OVERVIEW & STATS */}
        {/* ============================================================ */}
        {activeTab === "overview" && (
          <div className="admin-tab-content animate-fade-in">
            {/* Stat KPI Cards Grid */}
            <div className="kpi-cards-grid">
              <div className="kpi-card" onClick={() => setActiveTab("moderation")}>
                <div className="kpi-icon-bubble amber-bubble">
                  <Clock size={22} className="text-amber" />
                </div>
                <div className="kpi-details">
                  <span className="kpi-title">Kutilayotgan E&apos;lonlar</span>
                  <div className="kpi-number">{pendingModerationCount} ta</div>
                  <span className="kpi-subtext">Moderatsiyani kutayotgan arizalar</span>
                </div>
              </div>

              <div className="kpi-card" onClick={() => setActiveTab("listings")}>
                <div className="kpi-icon-bubble emerald-bubble">
                  <Package size={22} className="text-emerald" />
                </div>
                <div className="kpi-details">
                  <span className="kpi-title">Faol Marketplace E&apos;lonlari</span>
                  <div className="kpi-number">{activeListingsCount} ta</div>
                  <span className="kpi-subtext">Sotuvdagi tasdiqlangan akkauntlar</span>
                </div>
              </div>

              <div className="kpi-card" onClick={() => setActiveTab("users")}>
                <div className="kpi-icon-bubble blue-bubble">
                  <Users size={22} className="text-blue" />
                </div>
                <div className="kpi-details">
                  <span className="kpi-title">Foydalanuvchilar Bazasi</span>
                  <div className="kpi-number">{users.length} nafar</div>
                  <span className="kpi-subtext">
                    {totalBuyers} xaridor / {totalSellers} sotuvchi
                  </span>
                </div>
              </div>

              <div className="kpi-card" onClick={() => setActiveTab("orders")}>
                <div className="kpi-icon-bubble rose-bubble">
                  <DollarSign size={22} className="text-rose" />
                </div>
                <div className="kpi-details">
                  <span className="kpi-title">Muvaffaqiyatli Savdo Hajmi</span>
                  <div className="kpi-number">${totalPlatformVolume.toLocaleString()}</div>
                  <span className="kpi-subtext">{totalCompletedOrders} ta yakunlangan tranzaksiya</span>
                </div>
              </div>
            </div>

            {/* Overview Action Banner for Pending Moderation */}
            {pendingModerationCount > 0 && (
              <div className="moderation-alert-banner">
                <div className="alert-banner-left">
                  <div className="pulse-dot" />
                  <div>
                    <h3 className="alert-heading">
                      {pendingModerationCount} ta yangi akkaunt e&apos;loni tasdiqlashni kutmoqda!
                    </h3>
                    <p className="alert-sub">
                      Foydalanuvchilar yangi e&apos;lon yuborishgan. Ularni tekshirib, Approve qilsangiz, avtomatik ravishda saytga chiqadi va foydalanuvchiga Sotuvchi maqomi beriladi.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("moderation")}
                  className="alert-review-btn"
                >
                  Ko&apos;rib Chiqish <ArrowRight size={15} />
                </button>
              </div>
            )}

            {/* Quick Summary Tables Grid */}
            <div className="overview-summary-grid">
              {/* Left: Recent Pending Submissions */}
              <div className="summary-panel-card">
                <div className="panel-header">
                  <h3 className="panel-title">Oxirgi Yuborilgan Arizalar</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("moderation")}
                    className="panel-link-btn"
                  >
                    Barchasi <ArrowRight size={13} />
                  </button>
                </div>

                {pendingListings.length === 0 ? (
                  <div className="empty-mini-box">
                    <CheckCircle2 size={32} className="text-emerald" />
                    <span>Hozirda kutilayotgan moderatsiya mavjud emas</span>
                  </div>
                ) : (
                  <div className="mini-submissions-list">
                    {pendingListings.slice(0, 4).map((item) => (
                      <div key={item.id} className="mini-sub-item">
                        <div className="mini-sub-info">
                          <span className="mini-sub-title">{item.title}</span>
                          <div className="mini-sub-meta">
                            <span className="badge-platform">{getPlatformLabel(item.platform)}</span>
                            <span className="badge-price">${item.price}</span>
                            <span className="meta-author">
                              {item.seller?.full_name || "Yangi Xaridor"}
                            </span>
                          </div>
                        </div>
                        <div className="mini-actions">
                          <button
                            type="button"
                            onClick={() => handleApproveListing(item)}
                            className="btn-quick-approve"
                            title="Tasdiqlash (Approve)"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => openRejectModal(item)}
                            className="btn-quick-reject"
                            title="Rad etish (Reject)"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Platform System Roles Stats */}
              <div className="summary-panel-card">
                <div className="panel-header">
                  <h3 className="panel-title">Rollar va Huquqlar Holati</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("users")}
                    className="panel-link-btn"
                  >
                    Foydalanuvchilarni Boshqarish <ArrowRight size={13} />
                  </button>
                </div>

                <div className="roles-breakdown-list">
                  <div className="role-stat-item">
                    <div className="role-stat-left">
                      <div className="role-dot role-dot-buyer" />
                      <div>
                        <div className="role-stat-name">Xaridorlar (Buyers)</div>
                        <div className="role-stat-desc">Oddiy ro&apos;yxatdan o&apos;tgan foydalanuvchilar</div>
                      </div>
                    </div>
                    <span className="role-stat-count">{totalBuyers} nafar</span>
                  </div>

                  <div className="role-stat-item">
                    <div className="role-stat-left">
                      <div className="role-dot role-dot-seller" />
                      <div>
                        <div className="role-stat-name">Tasdiqlangan Sotuvchilar (Sellers)</div>
                        <div className="role-stat-desc">Arizasi tasdiqlangan va kabineti ochiqlar</div>
                      </div>
                    </div>
                    <span className="role-stat-count text-emerald">{totalSellers} nafar</span>
                  </div>

                  <div className="role-stat-item">
                    <div className="role-stat-left">
                      <div className="role-dot role-dot-admin" />
                      <div>
                        <div className="role-stat-name">Platforma Adminlari</div>
                        <div className="role-stat-desc">To&apos;liq boshqaruv huquqiga ega ma&apos;murlar</div>
                      </div>
                    </div>
                    <span className="role-stat-count text-rose">
                      {users.filter((u) => u.role === "admin").length} nafar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MODERATION & APPLICATIONS */}
        {/* ============================================================ */}
        {activeTab === "moderation" && (
          <div className="admin-tab-content animate-fade-in">
            <div className="tab-header-row">
              <div>
                <h2 className="tab-heading">Moderatsiya & E&apos;lon Arizalari</h2>
                <p className="tab-sub">
                  Foydalanuvchilar tomonidan sotuvga yuborilgan akkauntlarni tekshiring va tasdiqlang
                </p>
              </div>
            </div>

            {pendingListings.length === 0 ? (
              <div className="empty-state-card">
                <CheckCircle2 size={48} className="text-emerald" />
                <h3 className="empty-title">Kutilayotgan arizalar yo&apos;q!</h3>
                <p className="empty-sub">
                  Barcha yuborilgan e&apos;lonlar ko&apos;rib chiqilgan va moderatsiya qilingan.
                </p>
              </div>
            ) : (
              <div className="moderation-cards-list">
                {pendingListings.map((item) => (
                  <div key={item.id} className="moderation-card">
                    <div className="moderation-card-body">
                      {/* Top Info */}
                      <div className="mod-header-line">
                        <div className="mod-title-wrap">
                          <span className="mod-title">{item.title}</span>
                          <span className="mod-price">${item.price}</span>
                        </div>
                        <span className="mod-pending-badge">
                          <Clock size={12} /> Tekshirish kutilmoqda
                        </span>
                      </div>

                      {/* Details Pills */}
                      <div className="mod-meta-pills">
                        <span className="mod-pill">
                          <strong>Platforma:</strong> {getPlatformLabel(item.platform)}
                        </span>
                        {item.team_rating && (
                          <span className="mod-pill">
                            <strong>Team OVR:</strong> {item.team_rating}
                          </span>
                        )}
                        {item.coin_balance && (
                          <span className="mod-pill">
                            <strong>Coins/GP:</strong> {item.coin_balance.toLocaleString()}
                          </span>
                        )}
                        <span className="mod-pill">
                          <strong>Sana:</strong> {formatDate(item.created_at)}
                        </span>
                      </div>

                      {/* Key Players */}
                      {item.key_players && item.key_players.length > 0 && (
                        <div className="mod-players-row">
                          <span className="players-label">Yulduz O&apos;yinchilar:</span>
                          <div className="players-tags">
                            {item.key_players.map((p, idx) => (
                              <span key={idx} className="player-tag">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {item.description && (
                        <div className="mod-desc-box">
                          <span className="desc-label">Tavsif:</span> {item.description}
                        </div>
                      )}

                      {/* Seller Contact Info */}
                      <div className="mod-seller-info">
                        <span className="seller-info-title">Sotuvchi Ma&apos;lumotlari:</span>
                        <div className="seller-contact-chips">
                          <span className="contact-chip">
                            <Users size={13} /> {item.seller?.full_name || "Yangi Xaridor"}
                          </span>
                          {item.seller?.email && (
                            <span className="contact-chip">
                              <ExternalLink size={13} /> {item.seller.email}
                            </span>
                          )}
                          {item.seller?.telegram_username && (
                            <span className="contact-chip highlight-chip">
                              <MessageSquare size={13} /> @{item.seller.telegram_username}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="moderation-card-actions">
                      <button
                        type="button"
                        disabled={actionProcessing}
                        onClick={() => handleApproveListing(item)}
                        className="btn-approve-action"
                      >
                        <Check size={16} /> Tasdiqlash & Seller Qilish (Approve)
                      </button>

                      <button
                        type="button"
                        disabled={actionProcessing}
                        onClick={() => openRejectModal(item)}
                        className="btn-reject-action"
                      >
                        <X size={16} /> Rad Etish (Reject)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: USERS & ROLES MANAGEMENT */}
        {/* ============================================================ */}
        {activeTab === "users" && (
          <div className="admin-tab-content animate-fade-in">
            <div className="tab-header-row">
              <div>
                <h2 className="tab-heading">Foydalanuvchilar & Rollar Boshqaruvi</h2>
                <p className="tab-sub">
                  Platforma a&apos;zolari, ularning rollari va ruxsatlarini bir klikda o&apos;zgartirish
                </p>
              </div>

              {/* Filters & Search */}
              <div className="tab-filters-row">
                <div className="search-input-wrap">
                  <Search size={15} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Ism, email yoki telegram bo'yicha qidiruv..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="admin-search-input"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="admin-select-filter"
                >
                  <option value="all">Barcha Rollar</option>
                  <option value="buyer">Faqat Xaridorlar (Buyer)</option>
                  <option value="seller">Faqat Sotuvchilar (Seller)</option>
                  <option value="admin">Faqat Adminlar (Admin)</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="admin-table-card">
              <div className="table-responsive">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Foydalanuvchi</th>
                      <th>Email / Aloqa</th>
                      <th>Joriy Rol</th>
                      <th>Sotuvchi Maqomi</th>
                      <th>Ro&apos;yxatdan O&apos;tgan</th>
                      <th>Rolni O&apos;zgartirish</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="user-table-cell">
                            <div
                              className={`user-table-avatar ${
                                u.role === "admin"
                                  ? "av-admin"
                                  : u.role === "seller"
                                  ? "av-seller"
                                  : "av-buyer"
                              }`}
                            >
                              {(u.full_name || u.email || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="user-cell-name">
                                {u.full_name || "Nomsiz Foydalanuvchi"}
                              </div>
                              {u.telegram_username && (
                                <div className="user-cell-tg">@{u.telegram_username}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="email-cell">{u.email || "Email mavjud emas"}</td>

                        <td>
                          <span className={`role-badge-pill role-${u.role}`}>
                            {u.role === "admin"
                              ? "Admin"
                              : u.role === "seller"
                              ? "Sotuvchi"
                              : "Xaridor"}
                          </span>
                        </td>

                        <td>
                          {u.seller_status === "approved" && (
                            <span className="status-tag tag-approved">Tasdiqlangan</span>
                          )}
                          {u.seller_status === "pending" && (
                            <span className="status-tag tag-pending">Kutilmoqda</span>
                          )}
                          {u.seller_status === "rejected" && (
                            <span className="status-tag tag-rejected">Rad etilgan</span>
                          )}
                          {!u.seller_status && (
                            <span className="status-tag tag-none">Mavjud emas</span>
                          )}
                        </td>

                        <td className="date-cell">{formatDate(u.created_at)}</td>

                        <td>
                          <div className="role-switch-actions">
                            <button
                              type="button"
                              onClick={() => handleChangeUserRole(u.id, "buyer")}
                              className={`btn-role-opt ${u.role === "buyer" ? "active-buyer" : ""}`}
                              title="Buyer qilish"
                            >
                              Buyer
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChangeUserRole(u.id, "seller")}
                              className={`btn-role-opt ${u.role === "seller" ? "active-seller" : ""}`}
                              title="Seller qilish"
                            >
                              Seller
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChangeUserRole(u.id, "admin")}
                              className={`btn-role-opt ${u.role === "admin" ? "active-admin" : ""}`}
                              title="Admin qilish"
                            >
                              Admin
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: ALL LISTINGS MANAGEMENT */}
        {/* ============================================================ */}
        {activeTab === "listings" && (
          <div className="admin-tab-content animate-fade-in">
            <div className="tab-header-row">
              <div>
                <h2 className="tab-heading">Barcha Marketplace E&apos;lonlari</h2>
                <p className="tab-sub">
                  Platformadagi barcha faol, o&apos;chirilgan va kutilayotgan e&apos;lonlar nazorati
                </p>
              </div>

              {/* Filters */}
              <div className="tab-filters-row">
                <div className="search-input-wrap">
                  <Search size={15} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Sarlavha bo'yicha qidiruv..."
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                    className="admin-search-input"
                  />
                </div>

                <select
                  value={listingStatusFilter}
                  onChange={(e) => setListingStatusFilter(e.target.value)}
                  className="admin-select-filter"
                >
                  <option value="all">Barcha Statuslar</option>
                  <option value="active">Faol (Active)</option>
                  <option value="pending_review">Kutilmoqda (Pending)</option>
                  <option value="rejected">Rad etilgan (Rejected)</option>
                  <option value="removed">O&apos;chirilgan (Removed)</option>
                  <option value="sold">Sotilgan (Sold)</option>
                </select>
              </div>
            </div>

            <div className="admin-table-card">
              <div className="table-responsive">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>E&apos;lon Nomi</th>
                      <th>Platforma</th>
                      <th>Narx</th>
                      <th>Sotuvchi</th>
                      <th>Status</th>
                      <th>Sana</th>
                      <th>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map((l) => (
                      <tr key={l.id}>
                        <td>
                          <div className="listing-table-name">
                            <span className="name-bold">{l.title}</span>
                            {l.team_rating && (
                              <span className="sub-ovr">OVR: {l.team_rating}</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className="platform-tag">{getPlatformLabel(l.platform)}</span>
                        </td>

                        <td className="price-cell">${l.price}</td>

                        <td>{l.seller?.full_name || "Sotuvchi"}</td>

                        <td>
                          {l.status === "active" && (
                            <span className="status-tag tag-approved">Faol</span>
                          )}
                          {l.status === "pending_review" && (
                            <span className="status-tag tag-pending">Kutilmoqda</span>
                          )}
                          {l.status === "rejected" && (
                            <span className="status-tag tag-rejected">Rad etilgan</span>
                          )}
                          {l.status === "removed" && (
                            <span className="status-tag tag-none">O&apos;chirilgan</span>
                          )}
                          {l.status === "sold" && (
                            <span className="status-tag tag-approved">Sotildi</span>
                          )}
                        </td>

                        <td className="date-cell">{formatDate(l.created_at)}</td>

                        <td>
                          <div className="listing-manage-actions">
                            {l.status === "active" ? (
                              <button
                                type="button"
                                onClick={() => handleToggleListingStatus(l.id, l.status)}
                                className="btn-toggle-remove"
                                title="O'chirish (Noactive qilish)"
                              >
                                O&apos;chirish
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleListingStatus(l.id, l.status)}
                                className="btn-toggle-active"
                                title="Faollashtirish"
                              >
                                Faollashtirish
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: ORDERS & ESCROW */}
        {/* ============================================================ */}
        {activeTab === "orders" && (
          <div className="admin-tab-content animate-fade-in">
            <div className="tab-header-row">
              <div>
                <h2 className="tab-heading">Savdolar & Escrow Xavfsiz Tranzaksiyalar</h2>
                <p className="tab-sub">
                  Platformada amalga oshirilgan to&apos;lovlar va xaridor/sotuvchi o&apos;rtasidagi savdolar
                </p>
              </div>
            </div>

            <div className="admin-table-card">
              <div className="table-responsive">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Buyurtma ID</th>
                      <th>E&apos;lon</th>
                      <th>Mablag&apos;</th>
                      <th>Xaridor</th>
                      <th>Sotuvchi</th>
                      <th>Escrow Status</th>
                      <th>Sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="mono-cell">{o.id}</td>
                        <td className="name-bold">{o.listing?.title || "eFootball Akkaunt"}</td>
                        <td className="price-cell">${o.price}</td>
                        <td>{o.buyer?.full_name || "Xaridor"}</td>
                        <td>{o.seller?.full_name || "Sotuvchi"}</td>
                        <td>
                          <span className="status-tag tag-approved">
                            {o.status === "completed"
                              ? "Yakunlangan"
                              : o.status === "delivered"
                              ? "Yetkazildi"
                              : "To'langan (Escrow)"}
                          </span>
                        </td>
                        <td className="date-cell">{formatDate(o.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* REJECT MODAL WITH REASON */}
      {/* ============================================================ */}
      {rejectModalOpen && listingToReject && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-card animate-scale-up">
            <div className="modal-header-line">
              <div className="modal-title-group">
                <XCircle size={22} className="text-rose" />
                <h3 className="modal-heading">E&apos;lonni Rad Etish</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="modal-btn-close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="modal-desc-text">
              <strong>&quot;{listingToReject.title}&quot;</strong> e&apos;lonini rad etish sababini kiriting. Ushbu sabab foydalanuvchining shaxsiy profilida ko&apos;rsatiladi:
            </p>

            <textarea
              rows={4}
              placeholder="masalan: Konami ID skrinshoti to'liq ko'rinmayapti yoki narx noto'g'ri kiritilgan..."
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              className="reject-reason-textarea"
            />

            <div className="modal-actions-row">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="btn-modal-cancel"
              >
                Bekor Qilish
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={handleConfirmReject}
                className="btn-modal-confirm-reject"
              >
                {actionProcessing ? "Rad etilmoqda..." : "Rad Etishni Tasdiqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded High-End Admin Styles (AI izlarisiz, Zero border-maniya) */}
      <style>{`
        .admin-root-layout {
          min-height: 100vh;
          background: #030712;
          padding-bottom: 80px;
        }
        .admin-loading-view {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: rgba(156, 163, 175, 0.85);
          font-size: 14px;
        }

        /* Top Bar */
        .admin-header-nav {
          background: rgba(8, 14, 30, 0.8);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          position: sticky;
          top: 0;
          z-index: 90;
        }
        .admin-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
        }
        .admin-brand-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .admin-back-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(209, 213, 219, 0.85);
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .admin-back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #FFF;
        }
        .admin-tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(244, 63, 94, 0.12);
          color: #FB7185;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
        }
        .admin-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .admin-action-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: rgba(209, 213, 219, 0.9);
          font-size: 12.5px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
        }
        .admin-action-pill:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #FFF;
        }
        .admin-logout-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(244, 63, 94, 0.1);
          color: #FB7185;
          font-size: 12.5px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
        }
        .admin-logout-pill:hover {
          background: rgba(244, 63, 94, 0.2);
          color: #FFF;
        }

        /* Body */
        .admin-main-body {
          padding-top: 24px;
        }

        /* Tabs Bar */
        .admin-nav-tabs-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .admin-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          border-radius: 10px;
          background: transparent;
          border: none;
          color: rgba(156, 163, 175, 0.85);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .admin-tab-btn:hover {
          background: rgba(255, 255, 255, 0.04);
          color: #FFF;
        }
        .admin-tab-btn.active {
          background: rgba(244, 63, 94, 0.14);
          color: #FB7185;
        }
        .tab-counter-badge {
          background: #F43F5E;
          color: #FFF;
          font-size: 11px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 999px;
        }
        .tab-counter-badge.neutral {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(209, 213, 219, 0.9);
        }

        /* KPI Cards */
        .kpi-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .kpi-card {
          background: rgba(10, 16, 32, 0.72);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 18px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .kpi-card:hover {
          background: rgba(255, 255, 255, 0.04);
          transform: translateY(-2px);
        }
        .kpi-icon-bubble {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .amber-bubble { background: rgba(245, 158, 11, 0.14); }
        .emerald-bubble { background: rgba(16, 185, 129, 0.14); }
        .blue-bubble { background: rgba(37, 99, 235, 0.14); }
        .rose-bubble { background: rgba(244, 63, 94, 0.14); }

        .kpi-details {
          display: flex;
          flex-direction: column;
        }
        .kpi-title {
          font-size: 12.5px;
          color: rgba(156, 163, 175, 0.85);
          font-weight: 600;
        }
        .kpi-number {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #FFF;
          margin: 3px 0 2px 0;
        }
        .kpi-subtext {
          font-size: 11.5px;
          color: rgba(156, 163, 175, 0.65);
        }

        /* Moderation Banner */
        .moderation-alert-banner {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: 18px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
        }
        .alert-banner-left {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          max-width: 720px;
        }
        .pulse-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #FBBF24;
          margin-top: 5px;
          box-shadow: 0 0 12px #FBBF24;
          flex-shrink: 0;
        }
        .alert-heading {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #FFF;
          margin: 0 0 4px 0;
        }
        .alert-sub {
          font-size: 13px;
          color: rgba(209, 213, 219, 0.85);
          line-height: 1.5;
          margin: 0;
        }
        .alert-review-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 10px;
          background: #D97706;
          color: #FFF;
          font-size: 13.5px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s;
        }
        .alert-review-btn:hover {
          background: #B45309;
        }

        /* Overview Summary Grid */
        .overview-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 20px;
        }
        .summary-panel-card {
          background: rgba(10, 16, 32, 0.72);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 24px;
        }
        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .panel-title {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #FFF;
          margin: 0;
        }
        .panel-link-btn {
          background: none;
          border: none;
          color: #60A5FA;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .empty-mini-box {
          text-align: center;
          padding: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: rgba(156, 163, 175, 0.8);
          font-size: 13px;
        }
        .mini-submissions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .mini-sub-item {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .mini-sub-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .mini-sub-title {
          font-size: 13px;
          font-weight: 700;
          color: #FFF;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .mini-sub-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
        }
        .badge-platform {
          background: rgba(255, 255, 255, 0.06);
          padding: 1px 6px;
          border-radius: 4px;
          color: rgba(209, 213, 219, 0.85);
        }
        .badge-price {
          color: #60A5FA;
          font-weight: 700;
        }
        .meta-author {
          color: rgba(156, 163, 175, 0.7);
        }
        .mini-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .btn-quick-approve {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 6px;
          background: rgba(16, 185, 129, 0.14);
          color: #34D399;
          font-size: 11.5px;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }
        .btn-quick-approve:hover { background: rgba(16, 185, 129, 0.25); }
        .btn-quick-reject {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 6px;
          background: rgba(244, 63, 94, 0.14);
          color: #FB7185;
          font-size: 11.5px;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }
        .btn-quick-reject:hover { background: rgba(244, 63, 94, 0.25); }

        /* Roles breakdown list */
        .roles-breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .role-stat-item {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .role-stat-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .role-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .role-dot-buyer { background: #60A5FA; }
        .role-dot-seller { background: #34D399; }
        .role-dot-admin { background: #FB7185; }

        .role-stat-name {
          font-size: 13.5px;
          font-weight: 700;
          color: #FFF;
        }
        .role-stat-desc {
          font-size: 11.5px;
          color: rgba(156, 163, 175, 0.7);
        }
        .role-stat-count {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: #FFF;
        }

        /* Tab Header Row */
        .tab-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 20px;
        }
        .tab-heading {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #FFF;
          margin: 0 0 4px 0;
        }
        .tab-sub {
          font-size: 13px;
          color: rgba(156, 163, 175, 0.85);
          margin: 0;
        }

        /* Moderation Cards */
        .moderation-cards-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .moderation-card {
          background: rgba(10, 16, 32, 0.72);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .mod-header-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }
        .mod-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .mod-title {
          font-family: 'Outfit', sans-serif;
          font-size: 17px;
          font-weight: 800;
          color: #FFF;
        }
        .mod-price {
          font-size: 16px;
          font-weight: 800;
          color: #60A5FA;
        }
        .mod-pending-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(245, 158, 11, 0.14);
          color: #FBBF24;
          font-size: 11.5px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 999px;
        }
        .mod-meta-pills {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        .mod-pill {
          background: rgba(255, 255, 255, 0.04);
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12.5px;
          color: rgba(209, 213, 219, 0.9);
        }
        .mod-players-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }
        .players-label {
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(156, 163, 175, 0.85);
        }
        .players-tags {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }
        .player-tag {
          background: rgba(37, 99, 235, 0.12);
          color: #93C5FD;
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .mod-desc-box {
          margin-top: 12px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: rgba(209, 213, 219, 0.85);
          line-height: 1.5;
        }
        .desc-label {
          font-weight: 700;
          color: rgba(156, 163, 175, 0.9);
        }
        .mod-seller-info {
          margin-top: 14px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .seller-info-title {
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(156, 163, 175, 0.85);
        }
        .seller-contact-chips {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .contact-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255, 255, 255, 0.05);
          padding: 3px 9px;
          border-radius: 6px;
          font-size: 12px;
          color: #FFF;
        }
        .highlight-chip {
          background: rgba(37, 99, 235, 0.15);
          color: #60A5FA;
        }

        .moderation-card-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .btn-approve-action {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 20px;
          border-radius: 10px;
          background: #059669;
          color: #FFF;
          font-size: 13.5px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-approve-action:hover {
          background: #047857;
          transform: translateY(-1px);
        }
        .btn-reject-action {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 18px;
          border-radius: 10px;
          background: rgba(244, 63, 94, 0.12);
          color: #FB7185;
          font-size: 13.5px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-reject-action:hover {
          background: rgba(244, 63, 94, 0.22);
          color: #FFF;
        }

        /* Tables & Filters */
        .tab-filters-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .search-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          color: rgba(156, 163, 175, 0.7);
        }
        .admin-search-input {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9px;
          padding: 8px 12px 8px 34px;
          font-size: 13px;
          color: #FFF;
          outline: none;
          min-width: 240px;
        }
        .admin-select-filter {
          background: rgba(10, 16, 32, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9px;
          padding: 8px 12px;
          font-size: 13px;
          color: #FFF;
          outline: none;
        }

        .admin-table-card {
          background: rgba(10, 16, 32, 0.72);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 16px;
        }
        .table-responsive {
          overflow-x: auto;
        }
        .admin-data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .admin-data-table th {
          text-align: left;
          padding: 10px 14px;
          color: rgba(156, 163, 175, 0.8);
          font-weight: 600;
          font-size: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .admin-data-table td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: #FFF;
        }

        .user-table-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .user-table-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          color: #FFF;
        }
        .av-buyer { background: #2563EB; }
        .av-seller { background: #059669; }
        .av-admin { background: #E11D48; }

        .user-cell-name { font-weight: 700; color: #FFF; }
        .user-cell-tg { font-size: 11px; color: #60A5FA; }
        .email-cell { color: rgba(156, 163, 175, 0.9); }

        .role-badge-pill {
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 11px;
        }
        .role-buyer { background: rgba(37, 99, 235, 0.14); color: #60A5FA; }
        .role-seller { background: rgba(16, 185, 129, 0.14); color: #34D399; }
        .role-admin { background: rgba(244, 63, 94, 0.14); color: #FB7185; }

        .status-tag {
          padding: 2px 7px;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 600;
        }
        .tag-approved { background: rgba(16, 185, 129, 0.14); color: #34D399; }
        .tag-pending { background: rgba(245, 158, 11, 0.14); color: #FBBF24; }
        .tag-rejected { background: rgba(244, 63, 94, 0.14); color: #FB7185; }
        .tag-none { background: rgba(255, 255, 255, 0.05); color: rgba(156, 163, 175, 0.7); }

        .role-switch-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .btn-role-opt {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.04);
          color: rgba(156, 163, 175, 0.8);
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-role-opt:hover { color: #FFF; background: rgba(255, 255, 255, 0.08); }
        .active-buyer { background: #2563EB !important; color: #FFF !important; }
        .active-seller { background: #059669 !important; color: #FFF !important; }
        .active-admin { background: #E11D48 !important; color: #FFF !important; }

        /* Listing specific */
        .listing-table-name .name-bold { font-weight: 700; color: #FFF; display: block; }
        .listing-table-name .sub-ovr { font-size: 11px; color: #60A5FA; }
        .platform-tag {
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11.5px;
        }
        .btn-toggle-remove {
          background: rgba(244, 63, 94, 0.1);
          color: #FB7185;
          border: none;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-toggle-active {
          background: rgba(16, 185, 129, 0.1);
          color: #34D399;
          border: none;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Reject Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-card {
          background: rgba(10, 16, 32, 0.97);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 22px;
          padding: 28px;
          max-width: 500px;
          width: 100%;
        }
        .modal-header-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .modal-heading {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #FFF;
          margin: 0;
        }
        .modal-btn-close {
          background: none;
          border: none;
          color: rgba(156, 163, 175, 0.8);
          cursor: pointer;
        }
        .modal-desc-text {
          font-size: 13.5px;
          color: rgba(209, 213, 219, 0.85);
          line-height: 1.55;
          margin: 0 0 14px 0;
        }
        .reject-reason-textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 13.5px;
          color: #FFF;
          outline: none;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
          margin-bottom: 20px;
        }
        .modal-actions-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }
        .btn-modal-cancel {
          padding: 9px 16px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.06);
          color: #FFF;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }
        .btn-modal-confirm-reject {
          padding: 9px 18px;
          border-radius: 8px;
          background: #E11D48;
          color: #FFF;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }

        .text-rose { color: #FB7185; }
        .text-amber { color: #FBBF24; }
        .text-emerald { color: #34D399; }
        .text-blue { color: #60A5FA; }

        .empty-state-card {
          text-align: center;
          padding: 48px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          background: rgba(10, 16, 32, 0.72);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .empty-title {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #FFF;
          margin: 0;
        }
        .empty-sub {
          font-size: 13.5px;
          color: rgba(156, 163, 175, 0.85);
          margin: 0;
        }

        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-up {
          animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
