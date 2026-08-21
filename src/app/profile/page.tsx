"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Clock,
  ArrowRight,
  LogOut,
  Sparkles,
  CheckCircle,
  LayoutDashboard,
  PlusCircle,
  AlertCircle,
  XCircle,
  BadgeCheck,
  ShieldAlert,
  Gamepad2,
} from "lucide-react";
import type { Listing, Order } from "@/lib/types";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!currentUser) {
          // Check if admin session is active
          if (typeof window !== "undefined" && sessionStorage.getItem("efzone_admin_session") === "true") {
            setProfile({
              id: "admin-1",
              role: "admin",
              full_name: "Platforma Admini",
              email: "admin@efzone.uz",
              seller_status: "approved",
            });
            setUser({ email: "admin@efzone.uz", id: "admin-1", created_at: new Date().toISOString() });
            setLoading(false);
            return;
          }
          window.location.href = "/auth/login";
          return;
        }

        setUser(currentUser);

        const { data: userProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        setProfile(
          userProfile || {
            id: currentUser.id,
            role: currentUser.user_metadata?.role || "buyer",
            full_name: currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0],
            seller_status: null,
          }
        );

        // Fetch user's listings (pending, active, rejected)
        const { data: listingsData } = await supabase
          .from("listings")
          .select("*")
          .eq("seller_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (listingsData) {
          setUserListings(listingsData);
        }

        // Fetch user's purchase orders
        const { data: ordersData } = await supabase
          .from("orders")
          .select("*, listing:listings(title, price, platform)")
          .eq("buyer_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (ordersData) {
          setUserOrders(ordersData);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("efzone_admin_session");
    }
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="profile-loading-screen">
        <div className="loading-spinner" />
        <span>Profil ma&apos;lumotlari yuklanmoqda...</span>
      </div>
    );
  }

  const role = profile?.role || "buyer";
  const isSeller = role === "seller" || profile?.seller_status === "approved";
  const isAdmin = role === "admin";

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Foydalanuvchi";

  return (
    <div className="profile-page-root">
      <div className="container" style={{ maxWidth: 920 }}>
        {/* Profile Card Header */}
        <div className="profile-header-card">
          <div className="profile-identity">
            <div className={`profile-avatar ${isAdmin ? "avatar-admin" : isSeller ? "avatar-seller" : "avatar-buyer"}`}>
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="profile-info-text">
              <div className="profile-name-row">
                <h1 className="profile-display-name">{displayName}</h1>
                {isAdmin ? (
                  <span className="profile-badge badge-admin">
                    <ShieldAlert size={12} /> Platforma Admini
                  </span>
                ) : isSeller ? (
                  <span className="profile-badge badge-seller">
                    <BadgeCheck size={12} /> Tasdiqlangan Sotuvchi
                  </span>
                ) : (
                  <span className="profile-badge badge-buyer">
                    <User size={12} /> Xaridor
                  </span>
                )}
              </div>

              <div className="profile-email-row">
                <Mail size={14} className="text-muted" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="profile-logout-btn" type="button">
            <LogOut size={15} /> Chiqish
          </button>
        </div>

        {/* Status & Role Information Banner */}
        {!isSeller && !isAdmin && (
          <div className="buyer-onboarding-banner">
            <div className="banner-content">
              <div className="banner-icon-bubble">
                <PlusCircle size={22} className="text-blue" />
              </div>
              <div>
                <h3 className="banner-title">O&apos;z eFootball akkauntingizni sotmoqchimisiz?</h3>
                <p className="banner-desc">
                  Akkaunt sotish uchun ariza yuboring. Admin tasdiqlagach, e&apos;loningiz ommaviy marketplacega chiqadi va sizga avtomatik tarzda <strong>Tasdiqlangan Sotuvchi</strong> maqomi beriladi.
                </p>
              </div>
            </div>
            <Link href="/seller/apply" className="banner-cta-btn">
              <span>E&apos;lon Joylash</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {isSeller && (
          <div className="seller-status-banner">
            <div className="banner-content">
              <div className="banner-icon-bubble seller-bubble">
                <LayoutDashboard size={22} className="text-emerald" />
              </div>
              <div>
                <h3 className="banner-title">Siz tasdiqlangan sotuvchisiz!</h3>
                <p className="banner-desc">
                  Sotuvchi kabinetingiz orqali yangi e&apos;lonlar joylashingiz, buyurtmalarni boshqarishingiz va hisobingizdagi mablag&apos;larni yechib olishingiz mumkin.
                </p>
              </div>
            </div>
            <Link href="/seller/dashboard" className="banner-cta-btn seller-cta">
              <span>Sotuvchi Kabineti</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {isAdmin && (
          <div className="admin-status-banner">
            <div className="banner-content">
              <div className="banner-icon-bubble admin-bubble">
                <ShieldAlert size={22} className="text-rose" />
              </div>
              <div>
                <h3 className="banner-title">Platforma Admin Paneli faol</h3>
                <p className="banner-desc">
                  Kutilayotgan akkaunt e&apos;lonlarini tasdiqlash (Approve/Reject), foydalanuvchilar rollarini boshqarish va to&apos;liq platforma nazorati.
                </p>
              </div>
            </div>
            <Link href="/admin" className="banner-cta-btn admin-cta">
              <span>Admin Panelga O&apos;tish</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* User Submitted Listings / Arizalar Section */}
        <div className="profile-section-card">
          <div className="section-header">
            <h2 className="section-title">Mening Yuborgan E&apos;lonlarim (Arizalar)</h2>
            <span className="section-subtitle">
              Siz tomoningizdan sotuvga yuborilgan akkauntlar va ularning moderatsiya holati
            </span>
          </div>

          {userListings.length === 0 ? (
            <div className="empty-state-box">
              <Gamepad2 size={36} className="text-muted" />
              <p className="empty-text">Siz hali birorta ham e&apos;lon yubormagansiz.</p>
              <Link href="/seller/apply" className="empty-cta-btn">
                <PlusCircle size={15} /> Akkaunt Sotish Ariza Yuborish
              </Link>
            </div>
          ) : (
            <div className="listings-status-list">
              {userListings.map((item) => (
                <div key={item.id} className="listing-status-card">
                  <div className="listing-info">
                    <div className="listing-title-row">
                      <span className="item-title">{item.title}</span>
                      <span className="item-price">${item.price}</span>
                    </div>

                    <div className="listing-meta-row">
                      <span className="meta-tag">Platforma: {item.platform.toUpperCase()}</span>
                      {item.team_rating && <span className="meta-tag">OVR: {item.team_rating}</span>}
                      <span className="meta-date">
                        {new Date(item.created_at).toLocaleDateString("uz-UZ")}
                      </span>
                    </div>

                    {item.reject_reason && item.status === "rejected" && (
                      <div className="reject-reason-box">
                        <AlertCircle size={14} className="text-rose" />
                        <span><strong>Rad etish sababi:</strong> {item.reject_reason}</span>
                      </div>
                    )}
                  </div>

                  <div className="listing-badge-col">
                    {item.status === "pending_review" && (
                      <span className="status-pill pill-pending">
                        <Clock size={13} /> Kutilmoqda (Admin ko&apos;rmoqda)
                      </span>
                    )}
                    {item.status === "active" && (
                      <span className="status-pill pill-active">
                        <CheckCircle size={13} /> Faol / Sotuvda
                      </span>
                    )}
                    {item.status === "rejected" && (
                      <span className="status-pill pill-rejected">
                        <XCircle size={13} /> Rad etilgan
                      </span>
                    )}
                    {item.status === "sold" && (
                      <span className="status-pill pill-sold">
                        <CheckCircle size={13} /> Sotildi
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="quick-actions-grid">
          <Link href="/listings" className="quick-link-card">
            <div className="link-content">
              <ShoppingBag size={20} className="text-blue" />
              <div>
                <div className="link-title">Marketplace Katalogi</div>
                <div className="link-desc">Barcha sotuvdagi akkauntlarni ko&apos;rish</div>
              </div>
            </div>
            <ArrowRight size={16} className="chevron-icon" />
          </Link>

          <Link href="/seller/apply" className="quick-link-card">
            <div className="link-content">
              <PlusCircle size={20} className="text-emerald" />
              <div>
                <div className="link-title">Yangi E&apos;lon Yuborish</div>
                <div className="link-desc">O&apos;z akkauntingizni sotuvga qo&apos;yish</div>
              </div>
            </div>
            <ArrowRight size={16} className="chevron-icon" />
          </Link>
        </div>
      </div>

      <style>{`
        .profile-page-root {
          padding-top: 108px;
          padding-bottom: 80px;
          min-height: 100vh;
        }
        .profile-loading-screen {
          padding-top: 120px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: rgba(156, 163, 175, 0.85);
          font-size: 14px;
        }
        .loading-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(59, 130, 246, 0.15);
          border-top-color: #3B82F6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Profile Header Card */
        .profile-header-card {
          background: rgba(10, 16, 32, 0.7);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 28px 32px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        .profile-identity {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .profile-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFF;
          font-weight: 800;
          font-size: 26px;
          font-family: 'Outfit', sans-serif;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          flex-shrink: 0;
        }
        .avatar-buyer { background: linear-gradient(135deg, #2563EB, #1D4ED8); }
        .avatar-seller { background: linear-gradient(135deg, #10B981, #059669); }
        .avatar-admin { background: linear-gradient(135deg, #F43F5E, #BE123C); }

        .profile-name-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }
        .profile-display-name {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #FFF;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .profile-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 999px;
        }
        .badge-buyer { background: rgba(37, 99, 235, 0.15); color: #60A5FA; }
        .badge-seller { background: rgba(16, 185, 129, 0.15); color: #34D399; }
        .badge-admin { background: rgba(244, 63, 94, 0.15); color: #FB7185; }

        .profile-email-row {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(156, 163, 175, 0.85);
          font-size: 13.5px;
        }
        .profile-logout-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          border-radius: 10px;
          background: rgba(244, 63, 94, 0.08);
          color: #FB7185;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .profile-logout-btn:hover {
          background: rgba(244, 63, 94, 0.16);
          color: #FFF;
        }

        /* Banners */
        .buyer-onboarding-banner, .seller-status-banner, .admin-status-banner {
          border-radius: 18px;
          padding: 22px 26px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .buyer-onboarding-banner {
          background: rgba(37, 99, 235, 0.08);
          border: 1px solid rgba(37, 99, 235, 0.2);
        }
        .seller-status-banner {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .admin-status-banner {
          background: rgba(244, 63, 94, 0.08);
          border: 1px solid rgba(244, 63, 94, 0.2);
        }
        .banner-content {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          max-width: 620px;
        }
        .banner-icon-bubble {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(37, 99, 235, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .banner-icon-bubble.seller-bubble { background: rgba(16, 185, 129, 0.15); }
        .banner-icon-bubble.admin-bubble { background: rgba(244, 63, 94, 0.15); }
        .banner-title {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #FFF;
          margin: 0 0 4px 0;
        }
        .banner-desc {
          font-size: 13px;
          color: rgba(209, 213, 219, 0.85);
          line-height: 1.55;
          margin: 0;
        }
        .banner-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 18px;
          border-radius: 10px;
          background: #2563EB;
          color: #FFF;
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .banner-cta-btn:hover {
          background: #1D4ED8;
          transform: translateY(-1px);
        }
        .banner-cta-btn.seller-cta {
          background: #059669;
        }
        .banner-cta-btn.seller-cta:hover { background: #047857; }
        .banner-cta-btn.admin-cta {
          background: #E11D48;
        }
        .banner-cta-btn.admin-cta:hover { background: #BE123C; }

        /* Section Card */
        .profile-section-card {
          background: rgba(10, 16, 32, 0.7);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 28px 32px;
          margin-bottom: 24px;
        }
        .section-header {
          margin-bottom: 20px;
        }
        .section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #FFF;
          margin: 0 0 4px 0;
        }
        .section-subtitle {
          font-size: 13px;
          color: rgba(156, 163, 175, 0.85);
        }

        /* Listings Status List */
        .listings-status-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .listing-status-card {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          transition: background 0.15s ease;
        }
        .listing-status-card:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .listing-info {
          flex: 1;
          min-width: 260px;
        }
        .listing-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }
        .item-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #FFF;
        }
        .item-price {
          font-size: 14px;
          font-weight: 800;
          color: #60A5FA;
        }
        .listing-meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: rgba(156, 163, 175, 0.85);
        }
        .meta-tag {
          background: rgba(255, 255, 255, 0.06);
          padding: 2px 7px;
          border-radius: 6px;
          font-weight: 500;
        }
        .reject-reason-box {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          font-size: 12.5px;
          color: #FB7185;
          background: rgba(244, 63, 94, 0.08);
          padding: 6px 10px;
          border-radius: 8px;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .pill-pending { background: rgba(245, 158, 11, 0.14); color: #FBBF24; }
        .pill-active { background: rgba(16, 185, 129, 0.14); color: #34D399; }
        .pill-rejected { background: rgba(244, 63, 94, 0.14); color: #FB7185; }
        .pill-sold { background: rgba(107, 114, 128, 0.2); color: #9CA3AF; }

        /* Empty State */
        .empty-state-box {
          text-align: center;
          padding: 36px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .empty-text {
          font-size: 14px;
          color: rgba(156, 163, 175, 0.85);
          margin: 0;
        }
        .empty-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 6px;
          padding: 9px 18px;
          border-radius: 10px;
          background: rgba(37, 99, 235, 0.15);
          color: #60A5FA;
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .empty-cta-btn:hover {
          background: rgba(37, 99, 235, 0.25);
          color: #FFF;
        }

        /* Quick Links Grid */
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }
        .quick-link-card {
          background: rgba(10, 16, 32, 0.7);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 18px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .quick-link-card:hover {
          background: rgba(255, 255, 255, 0.04);
          transform: translateY(-1.5px);
        }
        .link-content {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .link-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #FFF;
        }
        .link-desc {
          font-size: 12px;
          color: rgba(156, 163, 175, 0.85);
          margin-top: 1px;
        }
        .text-blue { color: #60A5FA; }
        .text-emerald { color: #34D399; }
        .text-amber { color: #FBBF24; }
        .text-rose { color: #FB7185; }
        .text-muted { color: rgba(156, 163, 175, 0.7); }

        /* Responsive Mobile Breakpoint */
        @media (max-width: 768px) {
          .profile-page-root {
            padding-top: 76px;
            padding-bottom: 60px;
          }
          .profile-header-card {
            padding: 18px 16px;
            border-radius: 16px;
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
          }
          .profile-avatar {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }
          .profile-display-name {
            font-size: 18px;
          }
          .profile-logout-btn {
            width: 100%;
            justify-content: center;
          }

          .buyer-onboarding-banner,
          .seller-status-banner,
          .admin-status-banner {
            padding: 16px;
            border-radius: 16px;
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .banner-content {
            gap: 10px;
          }
          .banner-icon-bubble {
            width: 36px;
            height: 36px;
          }
          .banner-title {
            font-size: 15px;
          }
          .banner-desc {
            font-size: 12px;
          }
          .banner-cta-btn {
            width: 100%;
            justify-content: center;
          }

          .profile-section-card {
            padding: 18px 14px;
            border-radius: 16px;
          }
          .section-title {
            font-size: 16px;
          }
          .section-subtitle {
            font-size: 12px;
          }

          .listing-status-card {
            padding: 12px 14px;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .listing-info {
            width: 100%;
            min-width: 0;
          }
          .listing-title-row {
            justify-content: space-between;
          }
          .listing-badge-col {
            width: 100%;
          }
          .status-pill {
            display: inline-flex;
            width: 100%;
            justify-content: center;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
