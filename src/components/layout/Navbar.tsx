"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Globe,
  Gamepad2,
  Sparkles,
  Trophy,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  PlusCircle,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { Logo } from "./Logo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "UZS">("USD");
  const [currencyOpen, setCurrencyOpen] = useState(false);

  /* Auth state */
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isAdminSession, setIsAdminSession] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check local admin session
    if (typeof window !== "undefined") {
      const savedAdmin = sessionStorage.getItem("efzone_admin_session") === "true";
      setIsAdminSession(savedAdmin);
    }

    async function loadAuth() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // Get current user session
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .single();

          if (userProfile) {
            setProfile(userProfile);
          } else {
            // Default buyer profile fallback
            setProfile({
              id: currentUser.id,
              role: currentUser.user_metadata?.role || "buyer",
              full_name: currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0],
              seller_status: null,
            });
          }
        }

        // Listen for auth state changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          const updatedUser = session?.user || null;
          setUser(updatedUser);

          if (updatedUser) {
            const { data: updatedProfile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", updatedUser.id)
              .single();
            setProfile(
              updatedProfile || {
                id: updatedUser.id,
                role: updatedUser.user_metadata?.role || "buyer",
                full_name: updatedUser.user_metadata?.full_name || updatedUser.email?.split("@")[0],
                seller_status: null,
              }
            );
          } else {
            setProfile(null);
          }
        });

        return () => subscription.unsubscribe();
      } catch (err) {
        console.error("Auth load error:", err);
      }
    }

    loadAuth();

    // Close dropdowns on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("efzone_admin_session");
      }
      setUser(null);
      setProfile(null);
      setIsAdminSession(false);
      setUserDropdownOpen(false);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isSuperAdmin = profile?.role === "admin" || isAdminSession;
  const isSeller = !isSuperAdmin && (profile?.role === "seller" || profile?.seller_status === "approved");
  const isBuyer = !isSuperAdmin && !isSeller;

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (isSuperAdmin ? "Admin" : user?.email?.split("@")[0]) ||
    "Foydalanuvchi";

  return (
    <>
      <header className="navbar-root">
        {/* Top Utility & Trust Bar */}
        <div className="navbar-top-bar">
          <div className="container navbar-top-content">
            <div className="trust-indicator">
              <ShieldCheck size={14} className="text-emerald" />
              <span>100% Escrow Xavfsiz To&apos;lov Kafolati</span>
            </div>

            <div className="top-right-group">
              <span className="support-badge">
                <Sparkles size={13} className="text-amber" /> 24/7 Qo&apos;llab-quvvatlash
              </span>

              {/* Currency Selector */}
              <div className="currency-selector" ref={currencyRef}>
                <button
                  type="button"
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                  className="currency-btn"
                  aria-label="Valyutani tanlash"
                >
                  <Globe size={13} className="text-blue" />
                  <span>{currency === "USD" ? "USD ($)" : "UZS (so'm)"}</span>
                  <ChevronDown size={12} className={`chevron ${currencyOpen ? "rotated" : ""}`} />
                </button>

                {currencyOpen && (
                  <div className="currency-dropdown animate-fade-in">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrency("USD");
                        setCurrencyOpen(false);
                      }}
                      className={`dropdown-item ${currency === "USD" ? "active" : ""}`}
                    >
                      USD ($)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrency("UZS");
                        setCurrencyOpen(false);
                      }}
                      className={`dropdown-item ${currency === "UZS" ? "active" : ""}`}
                    >
                      UZS (so&apos;m)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="container">
          <div className="navbar-main">
            {/* Logo */}
            <Logo size="md" />

            {/* Desktop Navigation Links */}
            <nav className="desktop-nav hidden-mobile">
              <Link href="/listings" className="nav-link">
                <Gamepad2 size={16} className="nav-icon text-blue" />
                <span>Akkauntlar</span>
              </Link>

              <div className="nav-link disabled" title="Tez kunda ishga tushadi">
                <Trophy size={15} className="text-muted" />
                <span>Turnirlar</span>
                <span className="badge-coming-soon">Tez kunda</span>
              </div>
            </nav>

            {/* User Auth Action Group */}
            <div className="auth-action-group">
              {user || isSuperAdmin ? (
                /* Logged In User Pill Dropdown */
                <div className="user-profile-menu" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="user-profile-trigger"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className={`avatar-bubble ${isSuperAdmin ? "admin-avatar" : isSeller ? "seller-avatar" : "buyer-avatar"}`}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-name-text">
                      <span className="name">{displayName}</span>
                      <span className="role-sub">
                        {isSuperAdmin ? "Admin" : isSeller ? "Sotuvchi" : "Xaridor"}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`chevron ${userDropdownOpen ? "rotated" : ""}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="profile-dropdown-panel animate-scale-up">
                      <div className="dropdown-header">
                        <div className="header-name">{displayName}</div>
                        <div className="header-email">{user?.email || "admin@efzone.uz"}</div>
                        <div className="header-badge-row">
                          {isSuperAdmin ? (
                            <span className="role-tag tag-admin">
                              <ShieldAlert size={11} /> Platforma Admini
                            </span>
                          ) : isSeller ? (
                            <span className="role-tag tag-seller">
                              <BadgeCheck size={11} /> Tasdiqlangan Sotuvchi
                            </span>
                          ) : (
                            <span className="role-tag tag-buyer">
                              <User size={11} /> Oddiy Xaridor
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="dropdown-links">
                        {/* Admin Links */}
                        {isSuperAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="menu-item highlight-admin"
                          >
                            <ShieldAlert size={15} />
                            <span>Admin Boshqaruv Paneli</span>
                          </Link>
                        )}

                        {/* Seller Links */}
                        {isSeller && (
                          <Link
                            href="/seller/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="menu-item highlight-seller"
                          >
                            <LayoutDashboard size={15} />
                            <span>Sotuvchi Kabineti</span>
                          </Link>
                        )}

                        {/* Profile Link (for all) */}
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="menu-item"
                        >
                          <User size={15} />
                          <span>Mening Profilim</span>
                        </Link>

                        {/* Buyer only: Akkaunt Sotish Ariza link */}
                        {isBuyer && (
                          <Link
                            href="/seller/apply"
                            onClick={() => setUserDropdownOpen(false)}
                            className="menu-item highlight-apply"
                          >
                            <PlusCircle size={15} />
                            <span>Akkaunt Sotish (Ariza)</span>
                          </Link>
                        )}
                      </div>

                      <div className="dropdown-footer">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="logout-btn"
                        >
                          <LogOut size={14} /> Chiqish
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Logged Out / Guest CTAs */
                <div className="guest-cta-group">
                  <Link href="/auth/login" className="login-link">
                    Kirish
                  </Link>

                  <Link href="/auth/register" className="register-pill-btn">
                    <span>Ro&apos;yxatdan O&apos;tish</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle Button (Visible only on mobile/tablet) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="mobile-hamburger-btn"
                aria-label="Menyuni ochish"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Sidebar (Opens from Left, 80% width) */}
      <div
        className={`mobile-backdrop ${mobileMenuOpen ? "active" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />

      <aside
        className={`mobile-sidebar-drawer ${mobileMenuOpen ? "open" : ""}`}
        aria-label="Mobil navigatsiya"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div onClick={() => setMobileMenuOpen(false)} style={{ cursor: "pointer" }}>
            <Logo size="sm" />
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="drawer-close-btn"
            aria-label="Menyuni yopish"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card if logged in */}
        {(user || isSuperAdmin) && (
          <div className="drawer-user-card">
            <div className={`avatar-bubble ${isSuperAdmin ? "admin-avatar" : isSeller ? "seller-avatar" : "buyer-avatar"}`}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="drawer-user-info">
              <span className="drawer-user-name">{displayName}</span>
              <span className="drawer-user-email">{user?.email || "admin@efzone.uz"}</span>
              <div className="header-badge-row" style={{ marginTop: "4px" }}>
                {isSuperAdmin ? (
                  <span className="role-tag tag-admin">
                    <ShieldAlert size={10} /> Admin
                  </span>
                ) : isSeller ? (
                  <span className="role-tag tag-seller">
                    <BadgeCheck size={10} /> Sotuvchi
                  </span>
                ) : (
                  <span className="role-tag tag-buyer">
                    <User size={10} /> Xaridor
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Drawer Links */}
        <div className="drawer-body">
          <div className="drawer-section-title">Bo&apos;limlar</div>
          <Link
            href="/listings"
            onClick={() => setMobileMenuOpen(false)}
            className="drawer-nav-link"
          >
            <Gamepad2 size={18} className="text-blue" />
            <span>Akkauntlar bozoriga o&apos;tish</span>
          </Link>

          <div className="drawer-nav-link disabled">
            <Trophy size={18} className="text-muted" />
            <span>Turnirlar</span>
            <span className="badge-coming-soon">Tez kunda</span>
          </div>

          <div className="drawer-divider" />

          {/* User authenticated actions */}
          {user || isSuperAdmin ? (
            <>
              <div className="drawer-section-title">Boshqaruv</div>
              {isSuperAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="drawer-nav-link highlight-admin-link"
                >
                  <ShieldAlert size={18} />
                  <span>Admin Boshqaruv Paneli</span>
                </Link>
              )}

              {isSeller && (
                <Link
                  href="/seller/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="drawer-nav-link highlight-seller-link"
                >
                  <LayoutDashboard size={18} />
                  <span>Sotuvchi Kabineti</span>
                </Link>
              )}

              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="drawer-nav-link"
              >
                <User size={18} />
                <span>Mening Profilim</span>
              </Link>

              {isBuyer && (
                <Link
                  href="/seller/apply"
                  onClick={() => setMobileMenuOpen(false)}
                  className="drawer-nav-link highlight-apply-link"
                >
                  <PlusCircle size={18} />
                  <span>Akkaunt Sotish (Ariza)</span>
                </Link>
              )}

              <div className="drawer-divider" />

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="drawer-logout-btn"
              >
                <LogOut size={16} /> Chiqish
              </button>
            </>
          ) : (
            <div className="drawer-guest-actions">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="drawer-login-btn"
              >
                Kirish
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="drawer-register-btn"
              >
                <span>Ro&apos;yxatdan O&apos;tish</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>

        {/* Drawer Footer info */}
        <div className="drawer-footer">
          <div className="drawer-trust-info">
            <ShieldCheck size={14} className="text-emerald" />
            <span>100% Escrow Kafolati</span>
          </div>
        </div>
      </aside>

      {/* Embedded High-End Styles */}
      <style>{`
        .navbar-root {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(3, 7, 18, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .navbar-top-bar {
          background: rgba(8, 14, 30, 0.65);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          font-size: 11.5px;
          padding: 5px 0;
          color: rgba(156, 163, 175, 0.9);
        }
        .navbar-top-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .trust-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #34D399;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .top-right-group {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .support-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: rgba(229, 231, 235, 0.85);
        }
        .currency-selector {
          position: relative;
        }
        .currency-btn {
          background: transparent;
          border: none;
          color: #E5E7EB;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 6px;
          border-radius: 6px;
          transition: background 0.15s ease;
        }
        .currency-btn:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .chevron {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          color: rgba(156, 163, 175, 0.8);
        }
        .chevron.rotated {
          transform: rotate(180deg);
        }
        .currency-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 6px;
          background: rgba(10, 16, 33, 0.96);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 4px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
          z-index: 120;
          min-width: 110px;
        }
        .dropdown-item {
          width: 100%;
          text-align: left;
          padding: 7px 12px;
          font-size: 12px;
          background: transparent;
          color: #9CA3AF;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.15s ease;
        }
        .dropdown-item:hover, .dropdown-item.active {
          background: rgba(37, 99, 235, 0.15);
          color: #60A5FA;
        }

        /* Navbar Main */
        .navbar-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          gap: 20px;
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .nav-link {
          font-size: 13.5px;
          font-weight: 600;
          color: rgba(209, 213, 219, 0.85);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 10px;
          border-radius: 8px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-link:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.04);
        }
        .nav-icon {
          color: #60A5FA;
        }
        .nav-link.disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .badge-coming-soon {
          font-size: 10px;
          font-weight: 700;
          background: rgba(245, 158, 11, 0.12);
          color: #FBBF24;
          padding: 2px 6px;
          border-radius: 6px;
          letter-spacing: -0.01em;
        }

        /* Auth Group */
        .auth-action-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .guest-cta-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .login-link {
          font-size: 13.5px;
          font-weight: 600;
          color: rgba(229, 231, 235, 0.9);
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 999px;
          transition: all 0.2s ease;
        }
        .login-link:hover {
          color: #FFF;
          background: rgba(255, 255, 255, 0.05);
        }
        .register-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          color: #FFF;
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none;
          border-radius: 999px;
          box-shadow: 0 4px 18px rgba(37, 99, 235, 0.35);
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .register-pill-btn:hover {
          transform: translateY(-1.5px);
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.5);
        }

        /* User Profile Trigger */
        .user-profile-menu {
          position: relative;
        }
        .user-profile-trigger {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          padding: 4px 14px 4px 4px;
          display: flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .user-profile-trigger:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(255, 255, 255, 0.14);
        }
        .avatar-bubble {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFF;
          font-weight: 800;
          font-size: 13.5px;
          font-family: 'Outfit', sans-serif;
          flex-shrink: 0;
        }
        .avatar-bubble.buyer-avatar {
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
        }
        .avatar-bubble.seller-avatar {
          background: linear-gradient(135deg, #10B981, #059669);
        }
        .avatar-bubble.admin-avatar {
          background: linear-gradient(135deg, #F43F5E, #BE123C);
        }
        .user-name-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          line-height: 1.2;
        }
        .user-name-text .name {
          font-size: 13px;
          font-weight: 600;
          color: #FFF;
          max-width: 110px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .user-name-text .role-sub {
          font-size: 10px;
          color: rgba(156, 163, 175, 0.8);
          font-weight: 500;
        }

        /* Profile Dropdown Panel */
        .profile-dropdown-panel {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 10px;
          width: 240px;
          background: rgba(8, 14, 30, 0.97);
          backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 24px 50px -10px rgba(0, 0, 0, 0.7);
          z-index: 130;
        }
        .dropdown-header {
          padding: 10px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 6px;
        }
        .header-name {
          font-size: 14px;
          font-weight: 700;
          color: #FFF;
        }
        .header-email {
          font-size: 11.5px;
          color: rgba(156, 163, 175, 0.8);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-top: 1px;
        }
        .header-badge-row {
          margin-top: 6px;
        }
        .role-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
        }
        .role-tag.tag-buyer {
          background: rgba(37, 99, 235, 0.14);
          color: #60A5FA;
        }
        .role-tag.tag-seller {
          background: rgba(16, 185, 129, 0.14);
          color: #34D399;
        }
        .role-tag.tag-admin {
          background: rgba(244, 63, 94, 0.14);
          color: #FB7185;
        }
        .dropdown-links {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 12px;
          border-radius: 10px;
          color: rgba(209, 213, 219, 0.9);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .menu-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #FFF;
        }
        .menu-item.highlight-seller {
          color: #FBBF24;
        }
        .menu-item.highlight-seller:hover {
          background: rgba(245, 158, 11, 0.1);
        }
        .menu-item.highlight-admin {
          color: #FB7185;
        }
        .menu-item.highlight-admin:hover {
          background: rgba(244, 63, 94, 0.12);
        }
        .menu-item.highlight-apply {
          color: #34D399;
        }
        .dropdown-footer {
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          color: #FB7185;
          font-size: 12.5px;
          font-weight: 600;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
        }
        .logout-btn:hover {
          background: rgba(244, 63, 94, 0.1);
        }

        /* Mobile Hamburger Trigger - strictly hidden on desktop */
        .mobile-hamburger-btn {
          display: none;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #FFF;
          cursor: pointer;
          padding: 8px;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .mobile-hamburger-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Mobile Backdrop Overlay */
        .mobile-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 9998;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mobile-backdrop.active {
          opacity: 1;
          pointer-events: auto;
        }

        /* Mobile Sidebar Drawer (Opens from Left, 80% width, 100% height) */
        .mobile-sidebar-drawer {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 82vw;
          max-width: 320px;
          height: 100vh;
          height: 100dvh;
          background: #060B19;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          box-shadow: 20px 0 60px rgba(0, 0, 0, 0.9);
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow-y: auto;
        }
        .mobile-sidebar-drawer.open {
          transform: translateX(0);
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .drawer-close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #9CA3AF;
          border-radius: 8px;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .drawer-close-btn:hover {
          color: #FFF;
          background: rgba(255, 255, 255, 0.1);
        }

        .drawer-user-card {
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .drawer-user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .drawer-user-name {
          font-size: 14px;
          font-weight: 700;
          color: #FFF;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .drawer-user-email {
          font-size: 11.5px;
          color: #9CA3AF;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .drawer-body {
          flex: 1;
          padding: 18px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .drawer-section-title {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(156, 163, 175, 0.6);
          padding: 6px 10px 2px 10px;
        }
        .drawer-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 12px;
          color: rgba(229, 231, 235, 0.9);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .drawer-nav-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #FFF;
        }
        .drawer-nav-link.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .drawer-nav-link.highlight-admin-link {
          color: #FB7185;
        }
        .drawer-nav-link.highlight-admin-link:hover {
          background: rgba(244, 63, 94, 0.1);
        }
        .drawer-nav-link.highlight-seller-link {
          color: #FBBF24;
        }
        .drawer-nav-link.highlight-seller-link:hover {
          background: rgba(245, 158, 11, 0.1);
        }
        .drawer-nav-link.highlight-apply-link {
          color: #34D399;
        }
        .drawer-nav-link.highlight-apply-link:hover {
          background: rgba(16, 185, 129, 0.1);
        }

        .drawer-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
          margin: 10px 6px;
        }

        .drawer-logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 12px;
          color: #FB7185;
          font-size: 14px;
          font-weight: 600;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
          text-align: left;
        }
        .drawer-logout-btn:hover {
          background: rgba(244, 63, 94, 0.1);
        }

        .drawer-guest-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 14px;
          padding: 0 4px;
        }
        .drawer-login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #FFF;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          transition: background 0.2s;
        }
        .drawer-login-btn:hover {
          background: rgba(255, 255, 255, 0.09);
        }
        .drawer-register-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          color: #FFF;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          box-shadow: 0 4px 18px rgba(37, 99, 235, 0.35);
          transition: transform 0.2s;
        }
        .drawer-register-btn:hover {
          transform: translateY(-1px);
        }

        .drawer-footer {
          padding: 16px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(0, 0, 0, 0.2);
        }
        .drawer-trust-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #34D399;
        }

        /* Utilities */
        .text-emerald { color: #34D399; }
        .text-amber { color: #FBBF24; }
        .text-blue { color: #60A5FA; }
        .text-rose { color: #FB7185; }

        /* Responsive Breakpoints */
        @media (max-width: 860px) {
          .hidden-mobile { display: none !important; }
          .navbar-top-bar { display: none !important; }
          .navbar-main { height: 58px !important; }
          .navbar-container { padding: 0 14px !important; }
          .user-profile-menu { display: none !important; }
          .guest-cta-group { display: none !important; }
          .mobile-hamburger-btn {
            display: flex !important;
            width: 40px !important;
            height: 40px !important;
            border-radius: 10px !important;
            background: rgba(255, 255, 255, 0.06) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
        }
        @media (min-width: 861px) {
          .mobile-hamburger-btn { display: none !important; }
          .mobile-backdrop { display: none !important; }
          .mobile-sidebar-drawer { display: none !important; }
        }

        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.96) translateY(-4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-up {
          animation: scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
}

