"use client";

import Link from "next/link";
import { Shield, Star, Send, Mail, MapPin, CheckCircle2, ArrowRight, Trophy } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="footer-root">
      {/* Top Floating CTA Box */}
      <div className="container footer-cta-container">
        <div className="footer-cta-card">
          {/* Left Info */}
          <div className="cta-left-text">
            <div className="cta-guarantee-badge">
              <Shield size={13} />
              <span>100% Escrow Kafolatlangan Tizim</span>
            </div>
            <h2 className="cta-main-title">
              eFootball Akkauntingizni Sotmoqchimisiz?
            </h2>
            <p className="cta-sub-description">
              2 daqiqada tasdiqlangan sotuvchiga aylaning va hisobingizni kafolatlangan xavfsizlik bilan soting.
            </p>
          </div>

          {/* Right Buttons */}
          <div className="cta-buttons-stack">
            <Link
              href="/seller/apply"
              className="cta-white-btn"
            >
              <span>Partner Bo&apos;lish</span>
              <ArrowRight size={16} className="cta-arrow-icon" />
            </Link>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-telegram-btn"
            >
              <Send size={15} color="var(--accent-primary)" />
              <span>@EFZoneSupport</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links Zone */}
      <div className="footer-links-zone">
        <div className="container">
          <div className="footer-columns-grid">
            {/* Column 1: Brand & Badge with Typography Logo */}
            <div className="footer-brand-col">
              <div className="footer-logo-wrap">
                <Logo size="md" />
              </div>

              <div className="footer-license-label">
                RASMIY & XAVFSIZ ESCROW MARKETPLACE
              </div>

              <p className="footer-brand-tagline">
                O&apos;zbekistondagi eng yirik va xavfsiz eFootball akkountlar savdosi hamda kiberfutbol ekotizimi.
              </p>

              <div className="footer-security-pill">
                <Shield size={13} color="#34D399" />
                <span>100% Kafolatlangan Escrow Himoyasi</span>
              </div>
            </div>

            {/* Column 2: Marketplace Navigation */}
            <div className="footer-nav-col">
              <h4 className="footer-col-title">Marketplace</h4>
              <div className="footer-links-list">
                {[
                  { href: "/listings", label: "Barcha Akkauntlar" },
                  { href: "/listings?platform=mobile", label: "📱 Mobile (iOS/Android)" },
                  { href: "/listings?platform=ps", label: "🎮 PlayStation & PC" },
                  { href: "/#turnirlar", label: "🏆 Turnirlar (Tez kunda)" },
                  { href: "/#faq", label: "Savol va Javoblar" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="footer-nav-link"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Column 3: Seller & Terms */}
            <div className="footer-nav-col">
              <h4 className="footer-col-title">Sotuvchilar</h4>
              <div className="footer-links-list">
                {[
                  { href: "/seller/apply", label: "Partnerlik Arizasi" },
                  { href: "/seller/dashboard", label: "Sotuvchi Paneli" },
                  { href: "/terms", label: "Foydalanish Shartlari" },
                  { href: "/privacy", label: "Maxfiylik Siyosati" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="footer-nav-link"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Column 4: Contact & Direct Channels */}
            <div className="footer-nav-col">
              <h4 className="footer-col-title">Bog&apos;lanish</h4>
              <div className="footer-links-list">
                <div className="contact-item">
                  <Send size={15} color="var(--accent-primary)" />
                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-link"
                  >
                    @EFZoneSupport (Telegram)
                  </a>
                </div>
                <div className="contact-item">
                  <Mail size={15} color="var(--accent-primary)" />
                  <span>support@efzone.uz</span>
                </div>
                <div className="contact-item">
                  <MapPin size={15} color="var(--accent-primary)" />
                  <span>Toshkent, O&apos;zbekiston</span>
                </div>
                <div className="contact-item escrow-item">
                  <CheckCircle2 size={15} color="#34D399" />
                  <span>100% Escrow Himoyasi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="footer-bottom-bar">
            <div>
              © 2026 eFootball Zone Marketplace. Barcha huquqlar himoyalangan.
            </div>
            <div>
              eFootball Zone — Licensed & Secured Escrow Provider
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .footer-root {
          position: relative;
          background: transparent;
          margin-top: 48px;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        .footer-cta-container {
          position: relative;
          z-index: 10;
          margin-bottom: 48px;
        }

        .footer-cta-card {
          padding: 40px 44px;
          background: rgba(10, 16, 32, 0.85);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 28px;
        }

        .cta-left-text {
          max-width: 580px;
        }

        .cta-guarantee-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          font-size: 12px;
          font-weight: 600;
          color: #34D399;
          margin-bottom: 12px;
        }

        .cta-main-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 800;
          color: #FFF;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }

        .cta-sub-description {
          color: rgba(209, 213, 219, 0.85);
          font-size: 14px;
          line-height: 1.55;
          margin: 0;
        }

        .cta-buttons-stack {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .cta-white-btn {
          background: #FFFFFF;
          color: #0F172A;
          font-weight: 800;
          font-size: 14px;
          padding: 13px 26px;
          border-radius: 12px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 25px rgba(255, 255, 255, 0.15);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cta-white-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.4);
        }
        .cta-white-btn:hover .cta-arrow-icon {
          transform: translateX(3px);
        }

        .cta-telegram-btn {
          padding: 13px 20px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          color: #FFF;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .cta-telegram-btn:hover {
          background: rgba(37, 99, 235, 0.15);
          border-color: rgba(59, 130, 246, 0.4);
          transform: translateY(-2px);
        }

        .footer-links-zone {
          padding-top: 24px;
          padding-bottom: 36px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .footer-columns-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1.3fr;
          gap: 36px;
          margin-bottom: 40px;
        }

        .footer-brand-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-license-label {
          font-size: 11px;
          font-weight: 700;
          color: #34D399;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .footer-brand-tagline {
          font-size: 13px;
          color: rgba(156, 163, 175, 0.85);
          line-height: 1.5;
          margin: 0;
          max-width: 320px;
        }
        .footer-security-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          font-size: 11.5px;
          font-weight: 600;
          color: #34D399;
          width: fit-content;
        }

        .footer-nav-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .footer-col-title {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #FFF;
          margin: 0;
        }
        .footer-links-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-nav-link {
          font-size: 13px;
          color: rgba(156, 163, 175, 0.85);
          text-decoration: none;
          transition: color 0.15s, transform 0.15s;
          display: inline-block;
        }
        .footer-nav-link:hover {
          color: #FFF;
          transform: translateX(3px);
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(156, 163, 175, 0.85);
        }
        .contact-link {
          color: #FFF;
          text-decoration: none;
        }
        .escrow-item {
          color: #34D399;
          font-size: 12px;
          font-weight: 600;
        }

        .footer-bottom-bar {
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 12px;
          color: rgba(156, 163, 175, 0.6);
        }

        @media (max-width: 860px) {
          .footer-cta-card {
            padding: 28px 20px;
          }
          .cta-buttons-stack {
            width: 100%;
          }
          .cta-white-btn, .cta-telegram-btn {
            width: 100%;
            justify-content: center;
          }
          .footer-columns-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .footer-bottom-bar {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
