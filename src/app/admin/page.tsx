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
  ChevronRight,
  Menu,
  SlidersHorizontal,
  FileText,
  Activity,
  Layers,
  Settings,
  Store,
  CreditCard,
  Zap,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    setIsRefreshing(true);
    try {
      const [listingsRes, profilesRes, ordersRes] = await Promise.all([
        sb.from("listings").select("*").order("created_at", { ascending: false }),
        sb.from("profiles").select("*").order("created_at", { ascending: false }),
        sb.from("orders").select("*").order("created_at", { ascending: false }),
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
    } finally {
      setIsRefreshing(false);
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
    window.location.href = "/";
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
  const handleRejectListing = async () => {
    if (!listingToReject) return;
    setActionProcessing(true);
    try {
      const reason = rejectReasonInput.trim() || "E'lon talablarga javob bermaydi";
      if (sbRef.current) {
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
      setRejectReasonInput("");
      setSelectedListing(null);
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setActionProcessing(false);
    }
  };

  // User Management: Update User Role
  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
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
                seller_status: newRole === "seller" ? "approved" : null,
              }
            : u
        )
      );
    } catch (err) {
      console.error("Update role error:", err);
    }
  };

  // Listing Management: Toggle Listing Status
  const handleToggleListingStatus = async (
    listingId: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === "active" ? "rejected" : "active";
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
      console.error("Toggle status error:", err);
    }
  };

  // Loading Screen
  if (authLoading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-box">
          <Loader2 className="animate-spin text-rose" size={40} />
          <p>Xavfsiz Admin tizimi yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Login Gate Screen
  if (!isAuthenticated) {
    return (
      <div className="admin-login-screen">
        <div className="admin-login-card">
          <div className="login-icon-wrap">
            <Lock size={28} className="text-rose" />
          </div>

          <div className="login-badge-wrap">
            <span className="admin-security-badge">
              <ShieldAlert size={12} /> Boshqaruv Markazi
            </span>
          </div>

          <h1 className="login-title">eFootball Zone Admin</h1>
          <p className="login-desc">
            Ushbu panel faqat platforma ma&apos;murlari uchun mo&apos;ljallangan.
          </p>

          {loginError && (
            <div className="login-error-alert animate-fade-in">
              <AlertCircle size={16} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="admin-login-form">
            <div className="form-group">
              <label className="form-label">Admin Login</label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="admin"
                className="admin-input"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Xavfsizlik Paroli</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="admin-input"
                autoComplete="current-password"
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
            <span>Standart kirish: <strong>admin</strong> / <strong>admin123</strong></span>
          </div>
        </div>

        <style>{`
          .admin-loading-screen, .admin-login-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background: radial-gradient(circle at 50% 30%, rgba(244, 63, 94, 0.08) 0%, transparent 65%), #030712;
            color: #FFF;
            font-family: 'Inter', sans-serif;
          }
          .admin-loading-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;
            color: #9CA3AF;
            font-size: 14px;
          }
          .admin-login-card {
            background: rgba(10, 16, 32, 0.9);
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
            width: 64px;
            height: 64px;
            border-radius: 20px;
            background: rgba(244, 63, 94, 0.12);
            border: 1px solid rgba(244, 63, 94, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
          }
          .login-badge-wrap { margin-bottom: 12px; }
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
            font-size: 22px;
            font-weight: 800;
            color: #FFF;
            margin: 0 0 6px 0;
          }
          .login-desc {
            font-size: 13px;
            color: rgba(156, 163, 175, 0.85);
            line-height: 1.5;
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
            font-size: 12.5px;
            margin-bottom: 20px;
            text-align: left;
          }
          .admin-login-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            text-align: left;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .form-label {
            font-size: 12px;
            font-weight: 600;
            color: rgba(209, 213, 219, 0.9);
          }
          .admin-input {
            width: 100%;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 12px 14px;
            font-size: 14px;
            color: #FFF;
            outline: none;
            box-sizing: border-box;
            transition: all 0.2s ease;
          }
          .admin-input:focus {
            border-color: #FB7185;
            background: rgba(255, 255, 255, 0.07);
            box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.15);
          }
          .admin-login-submit-btn {
            margin-top: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 13px 20px;
            background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%);
            border: none;
            border-radius: 12px;
            color: #FFF;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(225, 29, 72, 0.4);
            transition: all 0.2s ease;
          }
          .admin-login-submit-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 24px rgba(225, 29, 72, 0.55);
          }
          .login-footer-hint {
            margin-top: 20px;
            font-size: 12px;
            color: rgba(156, 163, 175, 0.7);
          }
          .login-footer-hint strong { color: #FFF; }
          .text-rose { color: #FB7185; }
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
  const pendingModerationCount = pendingListings.length;
  const activeListingsCount = listings.filter((l) => l.status === "active").length;
  const totalVolume = orders
    .filter((o) => o.status === "completed" || o.status === "confirmed")
    .reduce((sum, o) => sum + (o.price || 0), 0);

  return (
    <div className="admin-dashboard-container">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modern SaaS Left Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-box">
          <div className="brand-icon-pill">
            <ShieldAlert size={18} className="text-rose" />
          </div>
          <div className="brand-info">
            <span className="brand-title">eFootball Zone</span>
            <span className="brand-badge">ADMIN SUITE</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="sidebar-close-mobile-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Admin Profile Chip */}
        <div className="sidebar-admin-chip">
          <div className="admin-avatar-bubble">A</div>
          <div className="admin-chip-info">
            <div className="chip-name">Bosh Ma&apos;mur</div>
            <div className="chip-status">
              <span className="status-dot-pulse" /> Onlayn
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="nav-group-label">Asosiy Boshqaruv</div>

          <button
            type="button"
            onClick={() => {
              setActiveTab("overview");
              setSidebarOpen(false);
            }}
            className={`nav-tab-item ${activeTab === "overview" ? "active" : ""}`}
          >
            <div className="nav-icon-label">
              <BarChart2 size={17} />
              <span>Umumiy Ko&apos;rinish</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("moderation");
              setSidebarOpen(false);
            }}
            className={`nav-tab-item ${activeTab === "moderation" ? "active" : ""}`}
          >
            <div className="nav-icon-label">
              <Clock size={17} />
              <span>Moderatsiya & Arizalar</span>
            </div>
            {pendingModerationCount > 0 && (
              <span className="nav-counter-badge pulse-badge">
                {pendingModerationCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("users");
              setSidebarOpen(false);
            }}
            className={`nav-tab-item ${activeTab === "users" ? "active" : ""}`}
          >
            <div className="nav-icon-label">
              <Users size={17} />
              <span>Foydalanuvchilar & Rollar</span>
            </div>
            <span className="nav-count-sub">{users.length}</span>
          </button>

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
              <span>Barcha E&apos;lonlar</span>
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
        </nav>

        {/* Sidebar Bottom Footer */}
        <div className="sidebar-footer-group">
          <Link href="/" className="sidebar-store-link">
            <Store size={16} />
            <span>Do&apos;konga O&apos;tish</span>
            <ExternalLink size={13} className="ml-auto" />
          </Link>

          <button
            type="button"
            onClick={handleAdminLogout}
            className="sidebar-logout-btn"
          >
            <LogOut size={16} />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <div className="admin-main-viewport">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="mobile-sidebar-toggle-btn"
              aria-label="Admin menyuni ochish"
            >
              <Menu size={20} />
            </button>

            <div className="topbar-breadcrumbs">
              <span className="breadcrumb-root">Admin</span>
              <ChevronRight size={14} className="breadcrumb-sep" />
              <span className="breadcrumb-current">
                {activeTab === "overview" && "Umumiy Ko'rinish"}
                {activeTab === "moderation" && "Moderatsiya & Arizalar"}
                {activeTab === "users" && "Foydalanuvchilar"}
                {activeTab === "listings" && "E'lonlar Boshqaruvi"}
                {activeTab === "orders" && "Savdolar & Escrow"}
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
                if (sbRef.current) fetchAllData(sbRef.current);
              }}
              disabled={isRefreshing}
              className="topbar-refresh-btn"
              title="Ma'lumotlarni yangilash"
            >
              <RefreshCw
                size={14}
                className={isRefreshing ? "animate-spin" : ""}
              />
              <span className="hidden-mobile-btn">Yangilash</span>
            </button>
          </div>
        </header>

        {/* Mobile Horizontal Quick Tabs Bar (Visible on mobile/tablet) */}
        <div className="mobile-admin-tabs-bar">
          {[
            { key: "overview", label: "Umumiy", icon: BarChart2, count: null },
            { key: "moderation", label: "Moderatsiya", icon: Clock, count: pendingModerationCount },
            { key: "users", label: "Foydalanuvchilar", icon: Users, count: users.length },
            { key: "listings", label: "E'lonlar", icon: Package, count: listings.length },
            { key: "orders", label: "Savdolar", icon: ShoppingBag, count: orders.length },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as AdminTab)}
                className={`mobile-tab-pill-btn ${isActive ? "active" : ""}`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`tab-chip-counter ${tab.key === "moderation" && pendingModerationCount > 0 ? "highlight-amber" : ""}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Body Area */}
        <main className="admin-content-scroll">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="tab-pane animate-fade-in">
              {/* Stat Metric Grid */}
              <div className="metrics-grid">
                <div
                  className="metric-card card-moderation cursor-pointer"
                  onClick={() => setActiveTab("moderation")}
                >
                  <div className="metric-icon-wrap bg-amber-soft">
                    <Clock size={22} className="text-amber" />
                  </div>
                  <div className="metric-data">
                    <span className="metric-label">Kutilayotgan E&apos;lonlar</span>
                    <div className="metric-value-row">
                      <span className="metric-number">{pendingModerationCount}</span>
                      <span className="metric-unit">ta ariza</span>
                    </div>
                    <span className="metric-sub-hint">
                      {pendingModerationCount > 0
                        ? "Tezkor moderatsiyani kutyapti"
                        : "Barcha arizalar ko'rib chiqilgan"}
                    </span>
                  </div>
                </div>

                <div
                  className="metric-card card-listings cursor-pointer"
                  onClick={() => setActiveTab("listings")}
                >
                  <div className="metric-icon-wrap bg-blue-soft">
                    <Package size={22} className="text-blue" />
                  </div>
                  <div className="metric-data">
                    <span className="metric-label">Faol Marketplace E&apos;lonlari</span>
                    <div className="metric-value-row">
                      <span className="metric-number">{activeListingsCount}</span>
                      <span className="metric-unit">ta hisob</span>
                    </div>
                    <span className="metric-sub-hint">Sotuvda tasdiqlangan</span>
                  </div>
                </div>

                <div
                  className="metric-card card-users cursor-pointer"
                  onClick={() => setActiveTab("users")}
                >
                  <div className="metric-icon-wrap bg-purple-soft">
                    <Users size={22} className="text-purple" />
                  </div>
                  <div className="metric-data">
                    <span className="metric-label">Foydalanuvchilar Bazasi</span>
                    <div className="metric-value-row">
                      <span className="metric-number">{users.length}</span>
                      <span className="metric-unit">nafar</span>
                    </div>
                    <span className="metric-sub-hint">
                      {users.filter((u) => u.role === "seller").length} sotuvchi /{" "}
                      {users.filter((u) => u.role === "buyer").length} xaridor
                    </span>
                  </div>
                </div>

                <div
                  className="metric-card card-orders cursor-pointer"
                  onClick={() => setActiveTab("orders")}
                >
                  <div className="metric-icon-wrap bg-emerald-soft">
                    <DollarSign size={22} className="text-emerald" />
                  </div>
                  <div className="metric-data">
                    <span className="metric-label">Muvaffaqiyatli Savdo</span>
                    <div className="metric-value-row">
                      <span className="metric-number">${totalVolume.toLocaleString()}</span>
                    </div>
                    <span className="metric-sub-hint">
                      {orders.filter((o) => o.status === "completed" || o.status === "confirmed").length} ta yakunlangan tranzaksiya
                    </span>
                  </div>
                </div>
              </div>

              {/* Two Column Layout: Quick Moderation Feed + Role Distribution */}
              <div className="overview-split-layout">
                {/* Left Column: Quick Moderation Stream */}
                <div className="admin-surface-card">
                  <div className="card-header-flex">
                    <div className="header-title-box">
                      <Clock size={18} className="text-amber" />
                      <h2 className="card-section-title">
                        Oxirgi Yuborilgan Arizalar
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("moderation")}
                      className="card-action-link"
                    >
                      Barchasi ({pendingModerationCount}) <ArrowRight size={14} />
                    </button>
                  </div>

                  {pendingListings.length === 0 ? (
                    <div className="empty-overview-box">
                      <CheckCircle2 size={36} className="text-emerald" />
                      <p className="empty-title">Hozirda yangi arizalar yo&apos;q</p>
                      <span className="empty-sub">
                        Sotuvchilar yangi hisob joylaganda bu yerda paydo bo&apos;ladi
                      </span>
                    </div>
                  ) : (
                    <div className="quick-moderation-list">
                      {pendingListings.slice(0, 3).map((item) => (
                        <div key={item.id} className="quick-mod-item">
                          <div className="quick-mod-main">
                            <div className="quick-mod-title">{item.title}</div>
                            <div className="quick-mod-meta">
                              <span className="platform-tag">
                                {getPlatformLabel(item.platform)}
                              </span>
                              <span className="ovr-tag">{item.team_rating || 0} OVR</span>
                              <span className="price-tag">${item.price}</span>
                            </div>
                            <div className="quick-mod-seller">
                              Sotuvchi:{" "}
                              <strong>
                                {item.seller?.full_name ||
                                  item.seller?.email ||
                                  "Noma'lum"}
                              </strong>
                            </div>
                          </div>

                          <div className="quick-mod-actions">
                            <button
                              type="button"
                              onClick={() => handleApproveListing(item)}
                              disabled={actionProcessing}
                              className="btn-quick-approve"
                              title="Tasdiqlash"
                            >
                              <Check size={14} /> Tasdiqlash
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setListingToReject(item);
                                setRejectModalOpen(true);
                              }}
                              disabled={actionProcessing}
                              className="btn-quick-reject"
                              title="Rad etish"
                            >
                              <X size={14} /> Rad etish
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Platform Statistics & Role Breakdown */}
                <div className="admin-surface-card">
                  <div className="card-header-flex">
                    <div className="header-title-box">
                      <Shield size={18} className="text-blue" />
                      <h2 className="card-section-title">
                        Rollar va Huquqlar Holati
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("users")}
                      className="card-action-link"
                    >
                      Boshqarish <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="role-distribution-list">
                    <div className="role-stat-row">
                      <div className="role-stat-info">
                        <span className="role-dot dot-buyer" />
                        <div>
                          <div className="role-stat-name">Xaridorlar (Buyers)</div>
                          <div className="role-stat-sub">
                            Oddiy ro&apos;yxatdan o&apos;tgan foydalanuvchilar
                          </div>
                        </div>
                      </div>
                      <div className="role-stat-count">
                        {users.filter((u) => u.role === "buyer").length} nafar
                      </div>
                    </div>

                    <div className="role-stat-row">
                      <div className="role-stat-info">
                        <span className="role-dot dot-seller" />
                        <div>
                          <div className="role-stat-name">
                            Tasdiqlangan Sotuvchilar (Sellers)
                          </div>
                          <div className="role-stat-sub">
                            Arizasi tasdiqlangan va kabineti ochiqlar
                          </div>
                        </div>
                      </div>
                      <div className="role-stat-count">
                        {users.filter((u) => u.role === "seller").length} nafar
                      </div>
                    </div>

                    <div className="role-stat-row">
                      <div className="role-stat-info">
                        <span className="role-dot dot-admin" />
                        <div>
                          <div className="role-stat-name">
                            Platforma Adminlari
                          </div>
                          <div className="role-stat-sub">
                            To&apos;liq boshqaruv huquqiga ega me&apos;morlar
                          </div>
                        </div>
                      </div>
                      <div className="role-stat-count">
                        {users.filter((u) => u.role === "admin").length} nafar
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MODERATSIYA & ARIZALAR */}
          {activeTab === "moderation" && (
            <div className="tab-pane animate-fade-in">
              <div className="pane-header-row">
                <div className="pane-title-group">
                  <div className="pane-heading-flex">
                    <h2 className="pane-main-title">E&apos;lonlar Moderatsiyasi</h2>
                    <span className="pane-counter-badge">
                      {pendingListings.length} ta kutilmoqda
                    </span>
                  </div>
                  <p className="pane-sub-desc">
                    Sotuvchilar tomonidan yuklangan va tasdiqlashni kutayotgan hisoblar
                  </p>
                </div>
              </div>

              {pendingListings.length === 0 ? (
                <div className="admin-empty-pane">
                  <CheckCircle2 size={48} className="text-emerald" />
                  <h3 className="empty-pane-title">Moderatsiya navbati bo&apos;sh!</h3>
                  <p className="empty-pane-desc">
                    Hozirda ko&apos;rib chiqilishi kerak bo&apos;lgan yangi arizalar mavjud emas.
                  </p>
                </div>
              ) : (
                <div className="moderation-cards-grid">
                  {pendingListings.map((item) => (
                    <div key={item.id} className="moderation-card">
                      <div className="mod-card-top">
                        <div className="mod-card-badges">
                          <span className="platform-tag">
                            {getPlatformLabel(item.platform)}
                          </span>
                          <span className="ovr-tag">{item.team_rating || 0} OVR</span>
                          <span className="pending-status-tag">
                            <Clock size={11} /> Tekshiruvda
                          </span>
                        </div>
                        <div className="mod-card-price">${item.price}</div>
                      </div>

                      <h3 className="mod-card-title">{item.title}</h3>

                      <div className="mod-card-stats-grid">
                        <div className="stat-pill">
                          <span className="stat-name">Coinlar:</span>
                          <span className="stat-val text-amber">
                            {item.coin_balance || item.coin_amount || 0}
                          </span>
                        </div>
                        <div className="stat-pill">
                          <span className="stat-name">GP:</span>
                          <span className="stat-val text-blue">
                            {item.gp_balance || 0}
                          </span>
                        </div>
                        <div className="stat-pill">
                          <span className="stat-name">Turi:</span>
                          <span className="stat-val">
                            {item.type === "coins" ? "Coin Paketi" : "Akkount"}
                          </span>
                        </div>
                      </div>

                      {item.key_players && item.key_players.length > 0 && (
                        <div className="mod-players-box">
                          <span className="players-label">Yulduzlar:</span>
                          <div className="player-chips">
                            {item.key_players.map((p: string, idx: number) => (
                              <span key={idx} className="player-chip">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.description && (
                        <div className="mod-desc-quote">
                          &ldquo;{item.description}&rdquo;
                        </div>
                      )}

                      <div className="mod-seller-footer">
                        <div className="seller-profile-wrap">
                          <div className="seller-sm-avatar">
                            {item.seller?.full_name?.charAt(0) || "S"}
                          </div>
                          <div>
                            <div className="seller-sm-name">
                              {item.seller?.full_name || item.seller?.email || "Sotuvchi"}
                            </div>
                            {item.seller?.telegram_username && (
                              <a
                                href={`https://t.me/${item.seller.telegram_username.replace("@", "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="seller-tg-link"
                              >
                                @{item.seller.telegram_username.replace("@", "")}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mod-action-buttons">
                        <button
                          type="button"
                          onClick={() => handleApproveListing(item)}
                          disabled={actionProcessing}
                          className="btn-mod-approve"
                        >
                          <Check size={16} /> Tasdiqlash & Saytga Chiqarish
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setListingToReject(item);
                            setRejectModalOpen(true);
                          }}
                          disabled={actionProcessing}
                          className="btn-mod-reject"
                        >
                          <X size={16} /> Rad Etish
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FOYDALANUVCHILAR VA ROLLAR */}
          {activeTab === "users" && (
            <div className="tab-pane animate-fade-in">
              <div className="pane-header-row">
                <div>
                  <h2 className="pane-main-title">Foydalanuvchilar Boshqaruvi</h2>
                  <p className="pane-sub-desc">
                    Tizimdagi barcha profillar va ularning huquqlarini (Admin, Sotuvchi, Xaridor) boshqarish
                  </p>
                </div>
              </div>

              {/* Filter & Search Toolbar */}
              <div className="table-toolbar">
                <div className="search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Ism, email yoki Telegram bo'yicha qidiruv..."
                    className="toolbar-search-input"
                  />
                </div>

                <div className="filter-select-box">
                  <Filter size={14} className="filter-icon" />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="toolbar-select"
                  >
                    <option value="all">Barcha rollar ({users.length})</option>
                    <option value="buyer">Faqat Xaridorlar</option>
                    <option value="seller">Faqat Sotuvchilar</option>
                    <option value="admin">Faqat Adminlar</option>
                  </select>
                </div>
              </div>

              {/* Users Table (Desktop) & Cards (Mobile) */}
              <div className="admin-table-container">
                <div className="table-responsive desktop-table-view">
                  <table className="admin-custom-table">
                    <thead>
                      <tr>
                        <th>Foydalanuvchi</th>
                        <th>Email Manzili</th>
                        <th>Telegram</th>
                        <th>Joriy Rol</th>
                        <th>Sotuvchi Holati</th>
                        <th>Rolni O&apos;zgartirish</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="table-empty-td">
                            Foydalanuvchilar topilmadi
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id}>
                            <td>
                              <div className="user-cell-flex">
                                <div
                                  className={`user-table-av av-${u.role || "buyer"}`}
                                >
                                  {(u.full_name || u.email || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <div className="table-user-name">
                                    {u.full_name || "Ismsiz"}
                                  </div>
                                  <div className="table-user-id">
                                    ID: {u.id.slice(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="email-td">{u.email || "—"}</td>
                            <td>
                              {u.telegram_username ? (
                                <a
                                  href={`https://t.me/${u.telegram_username.replace("@", "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="table-tg-link"
                                >
                                  @{u.telegram_username.replace("@", "")}
                                </a>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td>
                              <span className={`role-pill role-${u.role || "buyer"}`}>
                                {u.role === "admin"
                                  ? "Admin"
                                  : u.role === "seller"
                                  ? "Sotuvchi"
                                  : "Xaridor"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`seller-status-tag status-${u.seller_status || "none"}`}
                              >
                                {u.seller_status === "approved"
                                  ? "Tasdiqlangan"
                                  : u.seller_status === "pending"
                                  ? "Kutilmoqda"
                                  : u.seller_status === "rejected"
                                  ? "Rad etilgan"
                                  : "Yo'q"}
                              </span>
                            </td>
                            <td>
                              <div className="role-switch-btn-group">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateUserRole(u.id, "buyer")}
                                  className={`btn-role-opt ${u.role === "buyer" || !u.role ? "active-buyer" : ""}`}
                                >
                                  Buyer
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateUserRole(u.id, "seller")}
                                  className={`btn-role-opt ${u.role === "seller" ? "active-seller" : ""}`}
                                >
                                  Seller
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateUserRole(u.id, "admin")}
                                  className={`btn-role-opt ${u.role === "admin" ? "active-admin" : ""}`}
                                >
                                  Admin
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile User Cards List */}
                <div className="mobile-cards-feed">
                  {filteredUsers.length === 0 ? (
                    <div className="table-empty-td">Foydalanuvchilar topilmadi</div>
                  ) : (
                    filteredUsers.map((u) => (
                      <div key={u.id} className="mobile-admin-data-card">
                        <div className="card-top-row">
                          <div className="user-avatar-meta">
                            <div className={`user-table-av av-${u.role || "buyer"}`}>
                              {(u.full_name || u.email || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="card-item-title">{u.full_name || "Ismsiz"}</div>
                              <div className="card-item-subtitle">{u.email || `ID: ${u.id.slice(0, 8)}...`}</div>
                            </div>
                          </div>

                          <span className={`role-pill role-${u.role || "buyer"}`}>
                            {u.role === "admin" ? "Admin" : u.role === "seller" ? "Sotuvchi" : "Xaridor"}
                          </span>
                        </div>

                        {u.telegram_username && (
                          <div className="card-meta-line">
                            <span className="meta-label">Telegram:</span>
                            <a
                              href={`https://t.me/${u.telegram_username.replace("@", "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="table-tg-link"
                            >
                              @{u.telegram_username.replace("@", "")}
                            </a>
                          </div>
                        )}

                        <div className="card-role-action-box">
                          <span className="role-action-title">Rolni boshqarish:</span>
                          <div className="role-switch-btn-group full-width">
                            <button
                              type="button"
                              onClick={() => handleUpdateUserRole(u.id, "buyer")}
                              className={`btn-role-opt ${u.role === "buyer" || !u.role ? "active-buyer" : ""}`}
                            >
                              Xaridor
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateUserRole(u.id, "seller")}
                              className={`btn-role-opt ${u.role === "seller" ? "active-seller" : ""}`}
                            >
                              Sotuvchi
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateUserRole(u.id, "admin")}
                              className={`btn-role-opt ${u.role === "admin" ? "active-admin" : ""}`}
                            >
                              Admin
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BARCHA E'LONLAR */}
          {activeTab === "listings" && (
            <div className="tab-pane animate-fade-in">
              <div className="pane-header-row">
                <div>
                  <h2 className="pane-main-title">E&apos;lonlar Katalogi</h2>
                  <p className="pane-sub-desc">
                    Saytdagi barcha faol, kutilayotgan va sotilgan akkountlar ro&apos;yxati
                  </p>
                </div>
              </div>

              {/* Filter & Search Toolbar */}
              <div className="table-toolbar">
                <div className="search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                    placeholder="Sarlavha yoki platforma bo'yicha..."
                    className="toolbar-search-input"
                  />
                </div>

                <div className="filter-select-box">
                  <Filter size={14} className="filter-icon" />
                  <select
                    value={listingStatusFilter}
                    onChange={(e) => setListingStatusFilter(e.target.value)}
                    className="toolbar-select"
                  >
                    <option value="all">Barcha holatlar ({listings.length})</option>
                    <option value="active">Faol (Sotuvda)</option>
                    <option value="pending_review">Moderatsiyada</option>
                    <option value="sold">Sotilgan</option>
                    <option value="rejected">Rad etilgan</option>
                  </select>
                </div>
              </div>

              {/* Listings Table (Desktop) & Cards (Mobile) */}
              <div className="admin-table-container">
                <div className="table-responsive desktop-table-view">
                  <table className="admin-custom-table">
                    <thead>
                      <tr>
                        <th>E&apos;lon Nomi</th>
                        <th>Platforma</th>
                        <th>OVR / Narx</th>
                        <th>Sotuvchi</th>
                        <th>Holati</th>
                        <th>Boshqaruv</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredListings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="table-empty-td">
                            E&apos;lonlar topilmadi
                          </td>
                        </tr>
                      ) : (
                        filteredListings.map((l) => (
                          <tr key={l.id}>
                            <td>
                              <div className="table-listing-cell">
                                <span className="listing-bold-title">{l.title}</span>
                                <span className="listing-date">
                                  {formatDate(l.created_at)}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="platform-tag">
                                {getPlatformLabel(l.platform)}
                              </span>
                            </td>
                            <td>
                              <div className="ovr-price-cell">
                                <span className="table-ovr-badge">{l.team_rating || 0} OVR</span>
                                <span className="table-price-badge">${l.price}</span>
                              </div>
                            </td>
                            <td>
                              <span className="table-seller-name">
                                {l.seller?.full_name || l.seller?.email || "Sotuvchi"}
                              </span>
                            </td>
                            <td>
                              <span className={`listing-status-tag status-${l.status}`}>
                                {l.status === "active"
                                  ? "Faol"
                                  : l.status === "pending_review"
                                  ? "Moderatsiyada"
                                  : l.status === "sold"
                                  ? "Sotilgan"
                                  : "Rad etilgan"}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions-cell">
                                <Link
                                  href={`/listings/${l.id}`}
                                  target="_blank"
                                  className="btn-table-view"
                                  title="Saytda ko'rish"
                                >
                                  <Eye size={14} />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleToggleListingStatus(l.id, l.status)}
                                  className={
                                    l.status === "active"
                                      ? "btn-toggle-deactivate"
                                      : "btn-toggle-activate"
                                  }
                                >
                                  {l.status === "active" ? "O'chirish" : "Faollashtirish"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Listings Cards List */}
                <div className="mobile-cards-feed">
                  {filteredListings.length === 0 ? (
                    <div className="table-empty-td">E&apos;lonlar topilmadi</div>
                  ) : (
                    filteredListings.map((l) => (
                      <div key={l.id} className="mobile-admin-data-card">
                        <div className="card-top-row">
                          <div>
                            <div className="card-item-title">{l.title}</div>
                            <div className="card-item-subtitle">{formatDate(l.created_at)}</div>
                          </div>
                          <div className="table-price-badge">${l.price}</div>
                        </div>

                        <div className="card-badges-flex">
                          <span className="platform-tag">{getPlatformLabel(l.platform)}</span>
                          <span className="table-ovr-badge">{l.team_rating || 0} OVR</span>
                          <span className={`listing-status-tag status-${l.status}`}>{l.status}</span>
                        </div>

                        <div className="card-listing-footer">
                          <span className="card-seller-label">
                            Sotuvchi: <strong>{l.seller?.full_name || "Noma'lum"}</strong>
                          </span>
                          <div className="card-action-btns">
                            <Link href={`/listings/${l.id}`} target="_blank" className="btn-table-view">
                              <Eye size={14} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleToggleListingStatus(l.id, l.status)}
                              className={l.status === "active" ? "btn-toggle-deactivate" : "btn-toggle-activate"}
                            >
                              {l.status === "active" ? "O'chirish" : "Faollashtirish"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SAVDOLAR & ESCROW */}
          {activeTab === "orders" && (
            <div className="tab-pane animate-fade-in">
              <div className="pane-header-row">
                <div>
                  <h2 className="pane-main-title">Savdolar & Escrow Himoyasi</h2>
                  <p className="pane-sub-desc">
                    Xaridor va sotuvchi o&apos;rtasidagi barcha xavfsiz to&apos;lov tranzaksiyalari
                  </p>
                </div>
              </div>

              <div className="admin-table-container">
                <div className="table-responsive desktop-table-view">
                  <table className="admin-custom-table">
                    <thead>
                      <tr>
                        <th>Buyurtma ID</th>
                        <th>Akkount</th>
                        <th>Summa</th>
                        <th>Xaridor</th>
                        <th>Sotuvchi</th>
                        <th>Holati</th>
                        <th>Sana</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="table-empty-td">
                            Hozircha hech qanday buyurtma amalga oshirilmagan
                          </td>
                        </tr>
                      ) : (
                        orders.map((o) => (
                          <tr key={o.id}>
                            <td>
                              <span className="order-id-badge">#{o.id.slice(0, 8)}</span>
                            </td>
                            <td className="listing-name-td">
                              {o.listing?.title || "Akkount"}
                            </td>
                            <td className="amount-td">${o.price || 0}</td>
                            <td>{o.buyer?.full_name || o.buyer?.email || "Xaridor"}</td>
                            <td>{o.seller?.full_name || o.seller?.email || "Sotuvchi"}</td>
                            <td>
                              <span className={`order-status-tag status-${o.status}`}>
                                {o.status === "completed"
                                  ? "Yakunlangan"
                                  : o.status === "confirmed"
                                  ? "Tasdiqlangan"
                                  : o.status === "paid"
                                  ? "To'langan (Escrow)"
                                  : o.status === "awaiting_delivery"
                                  ? "Yetkazish kutilmoqda"
                                  : o.status === "delivered"
                                  ? "Yetkazildi"
                                  : o.status === "disputed"
                                  ? "Bahsli (Dispute)"
                                  : "Qaytarilgan"}
                              </span>
                            </td>
                            <td className="date-td">{formatDate(o.created_at)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Orders Feed */}
                <div className="mobile-cards-feed">
                  {orders.length === 0 ? (
                    <div className="table-empty-td">Hozircha hech qanday buyurtma mavjud emas</div>
                  ) : (
                    orders.map((o) => (
                      <div key={o.id} className="mobile-admin-data-card">
                        <div className="card-top-row">
                          <div>
                            <span className="order-id-badge">#{o.id.slice(0, 8)}</span>
                            <div className="card-item-title" style={{ marginTop: 4 }}>
                              {o.listing?.title || "Akkount"}
                            </div>
                          </div>
                          <div className="amount-td">${o.price || 0}</div>
                        </div>

                        <div className="card-meta-line">
                          <span className="meta-label">Xaridor:</span>
                          <span>{o.buyer?.full_name || o.buyer?.email || "Xaridor"}</span>
                        </div>

                        <div className="card-meta-line">
                          <span className="meta-label">Sotuvchi:</span>
                          <span>{o.seller?.full_name || o.seller?.email || "Sotuvchi"}</span>
                        </div>

                        <div className="card-listing-footer">
                          <span className={`order-status-tag status-${o.status}`}>
                            {o.status === "completed"
                              ? "Yakunlangan"
                              : o.status === "confirmed"
                              ? "Tasdiqlangan"
                              : o.status === "paid"
                              ? "To'langan (Escrow)"
                              : o.status === "delivered"
                              ? "Yetkazildi"
                              : o.status}
                          </span>
                          <span className="date-td">{formatDate(o.created_at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-card animate-scale-up">
            <div className="modal-header-line">
              <div className="modal-title-group">
                <XCircle size={20} className="text-rose" />
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
              Sotuvchiga nima sababdan e&apos;lon rad etilganini bildiring:
            </p>

            <textarea
              rows={3}
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              placeholder="Masalan: Skrinshotlar noaniq, OVR tasdiqlanmadi..."
              className="reject-reason-textarea"
            />

            <div className="modal-actions-row">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="btn-modal-cancel"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleRejectListing}
                disabled={actionProcessing}
                className="btn-modal-confirm-reject"
              >
                {actionProcessing ? "Saqlanmoqda..." : "Rad etishni tasdiqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ultra-Premium Glassmorphic Styles */}
      <style>{`
        .admin-dashboard-container {
          display: flex;
          min-height: 100vh;
          background: #030712;
          color: #F3F4F6;
          font-family: 'Inter', -apple-system, sans-serif;
          overflow-x: hidden;
        }

        /* Sidebar Styles */
        .admin-sidebar {
          width: 260px;
          background: rgba(6, 11, 26, 0.98);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border-right: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 150;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sidebar-brand-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 22px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .brand-icon-pill {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .brand-info {
          display: flex;
          flex-direction: column;
        }
        .brand-title {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: #FFF;
          letter-spacing: -0.01em;
        }
        .brand-badge {
          font-size: 9.5px;
          font-weight: 800;
          color: #FB7185;
          letter-spacing: 0.08em;
        }
        .sidebar-close-mobile-btn {
          display: none;
          margin-left: auto;
          background: none;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
        }

        .sidebar-admin-chip {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 16px 16px 10px 16px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
        }
        .admin-avatar-bubble {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #E11D48, #BE123C);
          color: #FFF;
          font-weight: 800;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .admin-chip-info {
          display: flex;
          flex-direction: column;
        }
        .chip-name {
          font-size: 13px;
          font-weight: 700;
          color: #FFF;
        }
        .chip-status {
          font-size: 11px;
          color: #34D399;
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 600;
        }
        .status-dot-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34D399;
          box-shadow: 0 0 8px #34D399;
        }

        .sidebar-nav {
          flex: 1;
          padding: 12px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }
        .nav-group-label {
          font-size: 10.5px;
          font-weight: 700;
          color: rgba(156, 163, 175, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 8px 12px 4px 12px;
        }
        .nav-tab-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          border-radius: 12px;
          color: rgba(209, 213, 219, 0.85);
          font-size: 13.5px;
          font-weight: 600;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
          width: 100%;
        }
        .nav-tab-item:hover {
          color: #FFF;
          background: rgba(255, 255, 255, 0.05);
        }
        .nav-tab-item.active {
          color: #FFF;
          background: linear-gradient(135deg, rgba(225, 29, 72, 0.18) 0%, rgba(225, 29, 72, 0.08) 100%);
          border: 1px solid rgba(244, 63, 94, 0.25);
          font-weight: 700;
        }
        .nav-tab-item.active svg {
          color: #FB7185;
        }
        .nav-icon-label {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-counter-badge {
          background: #E11D48;
          color: #FFF;
          font-size: 11px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 999px;
        }
        .pulse-badge {
          box-shadow: 0 0 10px rgba(225, 29, 72, 0.6);
          animation: pulseAnim 2s infinite;
        }
        .nav-count-sub {
          font-size: 11.5px;
          color: rgba(156, 163, 175, 0.7);
          font-weight: 600;
        }

        .sidebar-footer-group {
          padding: 14px 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sidebar-store-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          color: rgba(209, 213, 219, 0.85);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .sidebar-store-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #FFF;
        }
        .sidebar-logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          color: #FB7185;
          font-size: 13px;
          font-weight: 600;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
          width: 100%;
          text-align: left;
        }
        .sidebar-logout-btn:hover {
          background: rgba(244, 63, 94, 0.12);
        }

        /* Main Viewport */
        .admin-main-viewport {
          margin-left: 260px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: radial-gradient(circle at 50% 10%, rgba(244, 63, 94, 0.03) 0%, transparent 60%), #030712;
        }

        /* Topbar */
        .admin-topbar {
          height: 64px;
          background: rgba(8, 14, 30, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0 28px;
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
          gap: 14px;
        }
        .mobile-sidebar-toggle-btn {
          display: none;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #FFF;
          padding: 6px;
          border-radius: 8px;
          cursor: pointer;
        }
        .topbar-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 600;
        }
        .breadcrumb-root { color: rgba(156, 163, 175, 0.8); }
        .breadcrumb-sep { color: rgba(156, 163, 175, 0.4); }
        .breadcrumb-current { color: #FFF; font-weight: 700; }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .connection-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #34D399;
          font-size: 11.5px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
        }
        .status-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34D399;
        }
        .topbar-refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #FFF;
          font-size: 12.5px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .topbar-refresh-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Content Area */
        .admin-content-scroll {
          padding: 28px;
          flex: 1;
        }
        .tab-pane {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 18px;
        }
        .metric-card {
          background: rgba(10, 17, 36, 0.85);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 22px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .metric-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.14);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
        }
        .metric-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bg-amber-soft { background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.2); }
        .bg-blue-soft { background: rgba(37, 99, 235, 0.12); border: 1px solid rgba(37, 99, 235, 0.2); }
        .bg-purple-soft { background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.2); }
        .bg-emerald-soft { background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.2); }

        .metric-data {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .metric-label {
          font-size: 12px;
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
          font-size: 26px;
          font-weight: 800;
          color: #FFF;
          line-height: 1.1;
        }
        .metric-unit {
          font-size: 12px;
          color: rgba(156, 163, 175, 0.7);
          font-weight: 600;
        }
        .metric-sub-hint {
          font-size: 11.5px;
          color: rgba(156, 163, 175, 0.6);
          margin-top: 2px;
        }

        /* Overview Split Layout */
        .overview-split-layout {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 20px;
        }
        .admin-surface-card {
          background: rgba(10, 17, 36, 0.85);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 24px;
        }
        .card-header-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .header-title-box {
          display: flex;
          align-items: center;
          gap: 9px;
        }
        .card-section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #FFF;
          margin: 0;
        }
        .card-action-link {
          background: none;
          border: none;
          color: #60A5FA;
          font-size: 12.5px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
        }

        .empty-overview-box {
          text-align: center;
          padding: 36px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .empty-title {
          font-size: 15px;
          font-weight: 700;
          color: #FFF;
          margin: 0;
        }
        .empty-sub {
          font-size: 12.5px;
          color: rgba(156, 163, 175, 0.7);
        }

        .quick-moderation-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .quick-mod-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }
        .quick-mod-title {
          font-size: 14px;
          font-weight: 700;
          color: #FFF;
          margin-bottom: 4px;
        }
        .quick-mod-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          margin-bottom: 4px;
        }
        .platform-tag {
          background: rgba(255, 255, 255, 0.06);
          padding: 2px 7px;
          border-radius: 6px;
          font-weight: 600;
        }
        .ovr-tag {
          background: rgba(37, 99, 235, 0.15);
          color: #60A5FA;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
        }
        .price-tag {
          color: #34D399;
          font-weight: 700;
          font-size: 13px;
        }
        .quick-mod-seller {
          font-size: 11.5px;
          color: rgba(156, 163, 175, 0.8);
        }
        .quick-mod-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .btn-quick-approve {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 12px;
          border-radius: 8px;
          background: #059669;
          color: #FFF;
          font-size: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .btn-quick-approve:hover { background: #047857; }
        .btn-quick-reject {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(244, 63, 94, 0.12);
          color: #FB7185;
          font-size: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-quick-reject:hover { background: rgba(244, 63, 94, 0.25); color: #FFF; }

        /* Role Distribution */
        .role-distribution-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .role-stat-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
        }
        .role-stat-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .role-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dot-buyer { background: #2563EB; box-shadow: 0 0 8px #2563EB; }
        .dot-seller { background: #10B981; box-shadow: 0 0 8px #10B981; }
        .dot-admin { background: #E11D48; box-shadow: 0 0 8px #E11D48; }
        .role-stat-name {
          font-size: 13px;
          font-weight: 700;
          color: #FFF;
        }
        .role-stat-sub {
          font-size: 11px;
          color: rgba(156, 163, 175, 0.7);
        }
        .role-stat-count {
          font-size: 13.5px;
          font-weight: 800;
          color: #FFF;
        }

        /* Pane Header & Badges */
        .pane-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 4px;
        }
        .pane-title-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .pane-heading-flex {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .pane-main-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #FFF;
          margin: 0;
        }
        .pane-sub-desc {
          font-size: 13px;
          color: rgba(156, 163, 175, 0.85);
          margin: 0;
          line-height: 1.4;
        }
        .pane-counter-badge {
          background: rgba(245, 158, 11, 0.14);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #FBBF24;
          font-size: 11.5px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
        }

        .admin-empty-pane {
          text-align: center;
          padding: 36px 20px;
          background: rgba(10, 17, 36, 0.85);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
        }
        .empty-pane-title {
          font-family: 'Outfit', sans-serif;
          font-size: 17px;
          font-weight: 800;
          color: #FFF;
          margin: 0;
        }
        .empty-pane-desc {
          font-size: 13px;
          color: rgba(156, 163, 175, 0.85);
          margin: 0;
          max-width: 420px;
          line-height: 1.5;
        }

        /* Moderation Cards Grid */
        .moderation-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 20px;
        }
        .moderation-card {
          background: rgba(10, 17, 36, 0.85);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .mod-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .mod-card-badges {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pending-status-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(245, 158, 11, 0.12);
          color: #FBBF24;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
        }
        .mod-card-price {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #34D399;
        }
        .mod-card-title {
          font-family: 'Outfit', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #FFF;
          margin: 0;
        }
        .mod-card-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
        }
        .stat-pill {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          padding: 6px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .stat-name { font-size: 10.5px; color: rgba(156, 163, 175, 0.7); }
        .stat-val { font-size: 12.5px; font-weight: 700; color: #FFF; }

        .mod-players-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .players-label { font-size: 11.5px; font-weight: 600; color: rgba(156, 163, 175, 0.8); }
        .player-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .player-chip {
          background: rgba(37, 99, 235, 0.14);
          color: #93C5FD;
          font-size: 11.5px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .mod-desc-quote {
          font-size: 12.5px;
          color: rgba(209, 213, 219, 0.85);
          font-style: italic;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          padding: 8px 12px;
        }

        .mod-seller-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .seller-profile-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .seller-sm-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #10B981;
          color: #FFF;
          font-weight: 800;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .seller-sm-name { font-size: 12.5px; font-weight: 700; color: #FFF; }
        .seller-tg-link { font-size: 11.5px; color: #60A5FA; text-decoration: none; }

        .mod-action-buttons {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 10px;
          margin-top: 6px;
        }
        .btn-mod-approve {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 14px;
          border-radius: 10px;
          background: #059669;
          color: #FFF;
          font-size: 12.5px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .btn-mod-approve:hover { background: #047857; }
        .btn-mod-reject {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(244, 63, 94, 0.12);
          color: #FB7185;
          font-size: 12.5px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-mod-reject:hover { background: rgba(244, 63, 94, 0.22); color: #FFF; }

        /* Toolbar & Tables */
        .table-toolbar {
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
          min-width: 260px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          color: rgba(156, 163, 175, 0.6);
        }
        .toolbar-search-input {
          width: 100%;
          background: rgba(10, 17, 36, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 10px 14px 10px 38px;
          font-size: 13px;
          color: #FFF;
          outline: none;
        }
        .filter-select-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .filter-icon {
          position: absolute;
          left: 12px;
          color: rgba(156, 163, 175, 0.6);
        }
        .toolbar-select {
          background: rgba(10, 17, 36, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 10px 14px 10px 34px;
          font-size: 13px;
          color: #FFF;
          outline: none;
        }

        .admin-table-container {
          background: rgba(10, 17, 36, 0.85);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          overflow: hidden;
        }
        .table-responsive { overflow-x: auto; }
        .admin-custom-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .admin-custom-table th {
          text-align: left;
          padding: 14px 18px;
          color: rgba(156, 163, 175, 0.8);
          font-weight: 600;
          font-size: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.01);
        }
        .admin-custom-table td {
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: #FFF;
        }
        .table-empty-td {
          text-align: center;
          padding: 36px !important;
          color: rgba(156, 163, 175, 0.7);
        }

        .user-cell-flex {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-table-av {
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
        .table-user-name { font-weight: 700; color: #FFF; }
        .table-user-id { font-size: 11px; color: rgba(156, 163, 175, 0.6); }
        .email-td { color: rgba(209, 213, 219, 0.85); }
        .table-tg-link { color: #60A5FA; text-decoration: none; font-weight: 600; }

        .role-pill {
          padding: 3px 9px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
        }
        .role-buyer { background: rgba(37, 99, 235, 0.14); color: #60A5FA; }
        .role-seller { background: rgba(16, 185, 129, 0.14); color: #34D399; }
        .role-admin { background: rgba(244, 63, 94, 0.14); color: #FB7185; }

        .seller-status-tag {
          padding: 2px 7px;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 600;
        }
        .status-approved { background: rgba(16, 185, 129, 0.14); color: #34D399; }
        .status-pending { background: rgba(245, 158, 11, 0.14); color: #FBBF24; }
        .status-rejected { background: rgba(244, 63, 94, 0.14); color: #FB7185; }
        .status-none { color: rgba(156, 163, 175, 0.5); }

        .role-switch-btn-group {
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

        .table-listing-cell { display: flex; flex-direction: column; gap: 2px; }
        .listing-bold-title { font-weight: 700; color: #FFF; }
        .listing-date { font-size: 11px; color: rgba(156, 163, 175, 0.6); }
        .ovr-price-cell { display: flex; align-items: center; gap: 6px; }
        .table-ovr-badge { background: rgba(37, 99, 235, 0.15); color: #60A5FA; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11.5px; }
        .table-price-badge { color: #34D399; font-weight: 700; font-size: 12.5px; }
        .table-seller-name { font-size: 12.5px; color: rgba(209, 213, 219, 0.9); }

        .listing-status-tag {
          padding: 2px 7px;
          border-radius: 5px;
          font-size: 11.5px;
          font-weight: 600;
        }
        .status-active { background: rgba(16, 185, 129, 0.14); color: #34D399; }
        .status-pending_review { background: rgba(245, 158, 11, 0.14); color: #FBBF24; }
        .status-sold { background: rgba(37, 99, 235, 0.14); color: #60A5FA; }

        .table-actions-cell { display: flex; align-items: center; gap: 8px; }
        .btn-table-view {
          padding: 6px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          color: #FFF;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }
        .btn-toggle-deactivate {
          background: rgba(244, 63, 94, 0.1);
          color: #FB7185;
          border: none;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-toggle-activate {
          background: rgba(16, 185, 129, 0.1);
          color: #34D399;
          border: none;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
        }

        .order-id-badge {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11.5px;
        }
        .listing-name-td { font-weight: 600; }
        .amount-td { font-weight: 700; color: #34D399; }
        .order-status-tag { padding: 2px 7px; border-radius: 5px; font-size: 11.5px; font-weight: 600; }
        .date-td { font-size: 11.5px; color: rgba(156, 163, 175, 0.7); }

        /* Modal Overlay */
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
          max-width: 480px;
          width: 100%;
        }
        .modal-header-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .modal-title-group { display: flex; align-items: center; gap: 8px; }
        .modal-heading {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #FFF;
          margin: 0;
        }
        .modal-btn-close { background: none; border: none; color: #9CA3AF; cursor: pointer; }
        .modal-desc-text {
          font-size: 13.5px;
          color: rgba(209, 213, 219, 0.85);
          line-height: 1.5;
          margin: 0 0 14px 0;
        }
        .reject-reason-textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px;
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
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          color: #FFF;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }
        .btn-modal-confirm-reject {
          padding: 9px 18px;
          border-radius: 10px;
          background: #E11D48;
          color: #FFF;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }

        /* Utilities */
        .text-rose { color: #FB7185; }
        .text-amber { color: #FBBF24; }
        .text-emerald { color: #34D399; }
        .text-blue { color: #60A5FA; }
        .text-purple { color: #C084FC; }
        .text-muted { color: rgba(156, 163, 175, 0.6); }
        .cursor-pointer { cursor: pointer; }
        .ml-auto { margin-left: auto; }

        /* Mobile Quick Tabs Bar */
        .mobile-admin-tabs-bar {
          display: none;
          padding: 8px 12px;
          gap: 6px;
          overflow-x: auto;
          background: rgba(8, 14, 30, 0.95);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          scrollbar-width: none;
        }
        .mobile-admin-tabs-bar::-webkit-scrollbar {
          display: none;
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
          transition: all 0.15s ease;
        }
        .mobile-tab-pill-btn.active {
          background: #E11D48;
          border-color: #E11D48;
          color: #FFF;
          box-shadow: 0 2px 10px rgba(225, 29, 72, 0.35);
        }
        .tab-chip-counter {
          font-size: 10px;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.15);
          padding: 1px 5px;
          border-radius: 999px;
        }
        .tab-chip-counter.highlight-amber {
          background: #F59E0B;
          color: #000;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(6px);
            z-index: 140;
          }
          .admin-main-viewport {
            margin-left: 0;
          }
          .mobile-sidebar-toggle-btn {
            display: flex;
          }
          .sidebar-close-mobile-btn {
            display: flex;
          }
          .mobile-admin-tabs-bar {
            display: flex;
          }
          .admin-topbar {
            padding: 8px 12px;
            height: 52px;
          }
          .topbar-breadcrumbs {
            font-size: 13px;
          }
          .breadcrumb-root { display: none; }
          .breadcrumb-sep { display: none; }
          .admin-content-scroll {
            padding: 14px 10px;
          }

          /* 2x2 Compact Metric Cards Grid on Mobile */
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
          .metric-sub-hint {
            display: none !important;
          }

          .overview-split-layout {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .admin-surface-card {
            padding: 16px 12px;
            border-radius: 16px;
          }
          .quick-mod-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .quick-mod-actions {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
          .btn-quick-approve, .btn-quick-reject {
            justify-content: center;
          }

          .hidden-mobile-btn {
            display: none;
          }

          .desktop-table-view {
            display: none !important;
          }
          .mobile-cards-feed {
            display: flex !important;
            padding: 12px;
          }
        }

        /* Mobile Data Cards */
        .mobile-cards-feed {
          display: none;
          flex-direction: column;
          gap: 12px;
        }
        .mobile-admin-data-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .card-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .user-avatar-meta {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .card-item-title {
          font-weight: 700;
          font-size: 14px;
          color: #FFF;
        }
        .card-item-subtitle {
          font-size: 11.5px;
          color: rgba(156, 163, 175, 0.7);
        }
        .card-meta-line {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: rgba(209, 213, 219, 0.85);
        }
        .meta-label {
          color: rgba(156, 163, 175, 0.6);
          font-size: 11.5px;
        }
        .card-role-action-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 4px;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }
        .role-action-title {
          font-size: 11px;
          font-weight: 600;
          color: rgba(156, 163, 175, 0.7);
        }
        .role-switch-btn-group.full-width {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 6px;
          width: 100%;
        }
        .card-badges-flex {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .card-listing-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }
        .card-seller-label {
          font-size: 11.5px;
          color: rgba(156, 163, 175, 0.8);
        }
        .card-action-btns {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @keyframes pulseAnim {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
