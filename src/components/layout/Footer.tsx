"use client";

import Link from "next/link";
import { Shield, Star, Send, Mail, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        background: "transparent",
        marginTop: 48,
        overflow: "hidden",
      }}
    >
      {/* Top Floating CTA Box (Steady Container, Button-Only Hover Effects) */}
      <div className="container" style={{ position: "relative", zIndex: 10, marginBottom: 48 }}>
        <div
          style={{
            padding: "44px 44px",
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 28,
          }}
        >
          {/* Left Info */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 999,
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                fontSize: 12,
                fontWeight: 600,
                color: "#34D399",
                marginBottom: 12,
              }}
            >
              <Shield size={13} /> 100% Insured & Guaranteed Escrow
            </div>
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(22px, 3.2vw, 34px)",
                fontWeight: 900,
                color: "#FFF",
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}
            >
              Ready To Sell Your eFootball Accounts Or Coin?
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 520 }}>
              Get approved as a verified seller in 2 minutes and start earning directly.
            </p>
          </div>

          {/* Right Buttons with High-End Hover Effects */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/seller/apply"
              className="cta-white-btn"
              style={{
                background: "#FFFFFF",
                color: "#0F172A",
                fontWeight: 800,
                fontSize: 14,
                padding: "13px 26px",
                borderRadius: 12,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 10px 25px rgba(255, 255, 255, 0.15)",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              Partner Bo&apos;lish <ArrowRight size={16} className="cta-arrow-icon" style={{ transition: "transform 0.2s ease" }} />
            </Link>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-telegram-btn"
              style={{
                padding: "13px 20px",
                borderRadius: 12,
                border: "1px solid rgba(255, 255, 255, 0.12)",
                background: "rgba(255, 255, 255, 0.04)",
                color: "#FFF",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.25s ease",
              }}
            >
              <Send size={15} color="var(--accent-primary)" /> @EFZoneSupport
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links Zone */}
      <div style={{ background: "transparent", paddingTop: 16, paddingBottom: 36, borderTop: "1px solid rgba(255, 255, 255, 0.04)" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.8fr 1.1fr 1.1fr 1.4fr",
              gap: 40,
              marginBottom: 48,
            }}
          >
            {/* Column 1: Brand & Badge with Typography Logo */}
            <div>
              <div style={{ marginBottom: 14 }}>
                <Logo size="md" />
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-emerald)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
                LICENSED & SECURED ESCROW MARKETPLACE
              </div>

              {/* Verified Reviews Badge Button */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#FFF",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                }}
              >
                <Star size={14} fill="#FBBF24" color="#FBBF24" />
                <span>Verified Customer Reviews</span>
              </div>
            </div>

            {/* Column 2: Marketplace Navigation */}
            <div>
              <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 18, color: "#FFF" }}>Marketplace</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { href: "/listings?type=account", label: "eFootball Hisoblar" },
                  { href: "/listings?type=coins", label: "Coin Paketlari" },
                  { href: "/listings?platform=mobile", label: "Mobile Akauntlar" },
                  { href: "/listings?platform=ps", label: "PlayStation / PC" },
                  { href: "/#faq", label: "Savol va Javoblar" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} style={{
                    fontSize: 13, color: "var(--text-secondary)", textDecoration: "none",
                    transition: "color 0.2s ease, transform 0.2s ease",
                    display: "inline-block",
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#FFF";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-secondary)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >{link.label}</Link>
                ))}
              </div>
            </div>

            {/* Column 3: Seller & Terms */}
            <div>
              <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 18, color: "#FFF" }}>Sotuvchilar</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { href: "/seller/apply", label: "Partnerlik Arizasi" },
                  { href: "/seller/dashboard", label: "Sotuvchi Paneli" },
                  { href: "/seller/apply#terms", label: "Sotuvchi Qoidalari" },
                  { href: "/terms", label: "Foydalanish Shartlari" },
                  { href: "/privacy", label: "Maxfiylik Siyosati" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} style={{
                    fontSize: 13, color: "var(--text-secondary)", textDecoration: "none",
                    transition: "color 0.2s ease, transform 0.2s ease",
                    display: "inline-block",
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#FFF";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-secondary)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >{link.label}</Link>
                ))}
              </div>
            </div>

            {/* Column 4: Contact & Direct Channels */}
            <div>
              <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 18, color: "#FFF" }}>Bog&apos;lanish</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "var(--text-secondary)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Send size={15} color="var(--accent-primary)" />
                  <a href="https://t.me" target="_blank" rel="noopener noreferrer" style={{ color: "#FFF", textDecoration: "none" }}>
                    @EFZoneSupport
                  </a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Mail size={15} color="var(--accent-primary)" />
                  <span>support@efzone.uz</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={15} color="var(--accent-primary)" />
                  <span>Toshkent, O&apos;zbekiston</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--accent-emerald)", marginTop: 4 }}>
                  <CheckCircle2 size={15} color="var(--accent-emerald)" />
                  <span>DOT Escrow ID: 4537032-1799863</span>
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12 }}>
                  <Link href="/privacy" style={{ color: "var(--text-secondary)", textDecoration: "underline" }}>Privacy Policy</Link>
                  <Link href="/terms" style={{ color: "var(--text-secondary)", textDecoration: "underline" }}>Terms of Service</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.03)",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            fontSize: 12,
            color: "var(--text-muted)",
          }}>
            <div>
              All rights reserved. eFootball Zone Marketplace Inc.
            </div>
            <div>
              eFootball Zone Inc — Licensed & Secured Escrow Provider
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cta-white-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.4) !important;
        }

        .cta-white-btn:hover .cta-arrow-icon {
          transform: translateX(4px);
        }

        .cta-telegram-btn:hover {
          background: rgba(37, 99, 235, 0.15) !important;
          border-color: rgba(59, 130, 246, 0.4) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
        }

        @media (max-width: 768px) {
          footer > div:nth-child(2) > div > div:nth-child(1) {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
        }
        @media (max-width: 480px) {
          footer > div:nth-child(2) > div > div:nth-child(1) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
