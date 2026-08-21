"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Maximize2,
  X,
  Sparkles,
  Trophy,
  Gamepad2,
} from "lucide-react";

interface ListingGalleryProps {
  images: string[] | null;
  title: string;
  platform?: string;
  teamRating?: number | null;
}

export function ListingGallery({
  images,
  title,
  platform = "mobile",
  teamRating,
}: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const imageList = (images || []).filter(
    (img) => typeof img === "string" && img.trim() !== ""
  );
  const hasImages = imageList.length > 0;
  const currentImage = hasImages ? imageList[activeIndex] || imageList[0] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="g2g-gallery-root">
      {/* Main Image Showcase Frame */}
      <div
        className="gallery-frame"
        onClick={() => currentImage && setFullscreenImage(currentImage)}
      >
        {hasImages && currentImage ? (
          <>
            <img src={currentImage} alt={title} className="gallery-main-photo" />
            <div className="gallery-overlay-gradient" />
            <button
              type="button"
              className="gallery-zoom-trigger"
              title="Kattalashtirib ko'rish"
            >
              <Maximize2 size={16} />
            </button>
          </>
        ) : (
          /* High-End eFootball Stadium Fallback Card */
          <div className="gallery-stadium-fallback">
            <div className="fallback-watermark">EFB</div>
            <div className="fallback-glow-orb" />

            <div className="fallback-inner-content">
              <div className="fallback-top-row">
                <span className="fallback-pill-badge">
                  <Smartphone size={13} /> Android & iOS (Universal)
                </span>
                <span className="fallback-escrow-pill">
                  <ShieldCheck size={13} className="text-emerald" /> 100% Escrow Himoya
                </span>
              </div>

              <div className="fallback-center-hero">
                <div className="fallback-ovr-circle">
                  <span className="ovr-lbl">OVR</span>
                  <span className="ovr-num">{teamRating || "3200+"}</span>
                </div>
                <div className="fallback-text-stack">
                  <h3 className="fallback-title">{title}</h3>
                  <p className="fallback-sub">eFootball 2026 Mobile Rasmiy Hisobi</p>
                </div>
              </div>

              <div className="fallback-bottom-row">
                <div className="fallback-feature-item">
                  <Sparkles size={13} className="text-amber" />
                  <span>Konami ID to&apos;liq topshiriladi</span>
                </div>
                <div className="fallback-feature-item">
                  <Trophy size={13} className="text-blue" />
                  <span>1-Divizion Pro tarkib</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Carousel Navigation Arrows if multiple images */}
        {imageList.length > 1 && (
          <div className="gallery-controls-bar">
            <button
              type="button"
              onClick={handlePrev}
              className="gallery-nav-btn prev"
              aria-label="Oldingi rasm"
            >
              <ChevronLeft size={20} />
            </button>

            <span className="gallery-photo-counter">
              {activeIndex + 1} / {imageList.length}
            </span>

            <button
              type="button"
              onClick={handleNext}
              className="gallery-nav-btn next"
              aria-label="Keyingi rasm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Thumbnails Carousel (if multiple images) */}
      {imageList.length > 1 && (
        <div className="gallery-thumbnails-track">
          {imageList.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`thumbnail-card ${activeIndex === idx ? "active" : ""}`}
            >
              <img src={imgUrl} alt={`${title} rasm ${idx + 1}`} className="thumb-img" />
              {idx === 0 && <span className="thumb-badge">Asosiy</span>}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {fullscreenImage && (
        <div className="lightbox-modal-backdrop" onClick={() => setFullscreenImage(null)}>
          <button
            type="button"
            className="lightbox-close-btn"
            onClick={() => setFullscreenImage(null)}
            aria-label="Yopish"
          >
            <X size={24} />
          </button>
          <img
            src={fullscreenImage}
            alt={title}
            className="lightbox-full-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <style jsx>{`
        .g2g-gallery-root {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .gallery-frame {
          position: relative;
          width: 100%;
          height: 380px;
          border-radius: 18px;
          overflow: hidden;
          background: linear-gradient(135deg, #0B132B 0%, #030712 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gallery-main-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }
        .gallery-frame:hover .gallery-main-photo {
          transform: scale(1.02);
        }

        .gallery-overlay-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, transparent 40%, rgba(0, 0, 0, 0.6) 100%);
          pointer-events: none;
        }

        .gallery-zoom-trigger {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 3;
        }
        .gallery-zoom-trigger:hover {
          background: #2563EB;
          border-color: #2563EB;
          transform: scale(1.08);
        }

        /* High-End eFootball Stadium Fallback */
        .gallery-stadium-fallback {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: radial-gradient(circle at 50% 30%, #1E1B4B 0%, #0F172A 60%, #020617 100%);
          overflow: hidden;
        }

        .fallback-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Outfit', sans-serif;
          font-size: 160px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.03);
          letter-spacing: 0.1em;
          pointer-events: none;
          user-select: none;
        }

        .fallback-glow-orb {
          position: absolute;
          top: -20%;
          right: -10%;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%);
          filter: blur(30px);
          pointer-events: none;
        }

        .fallback-inner-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .fallback-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .fallback-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 12.5px;
          font-weight: 600;
          color: #FFF;
        }

        .fallback-escrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          font-size: 12.5px;
          font-weight: 700;
          color: #34D399;
        }

        .fallback-center-hero {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .fallback-ovr-circle {
          width: 84px;
          height: 84px;
          border-radius: 20px;
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ovr-lbl {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: rgba(0, 0, 0, 0.6);
        }

        .ovr-num {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 900;
          color: #000;
          line-height: 1;
        }

        .fallback-title {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #FFF;
          margin: 0 0 6px 0;
          letter-spacing: -0.01em;
        }

        .fallback-sub {
          font-size: 13.5px;
          color: rgba(199, 210, 254, 0.85);
          margin: 0;
        }

        .fallback-bottom-row {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .fallback-feature-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: rgba(229, 231, 235, 0.85);
          font-weight: 500;
        }

        /* Carousel Navigation Controls */
        .gallery-controls-bar {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 6px 12px;
          border-radius: 999px;
          z-index: 3;
        }

        .gallery-nav-btn {
          background: none;
          border: none;
          color: #FFF;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          opacity: 0.8;
          transition: opacity 0.15s ease;
        }
        .gallery-nav-btn:hover {
          opacity: 1;
        }

        .gallery-photo-counter {
          font-size: 12px;
          font-weight: 700;
          color: #FFF;
          padding: 0 4px;
        }

        /* Thumbnails Strip */
        .gallery-thumbnails-track {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 4px;
        }

        .thumbnail-card {
          position: relative;
          width: 80px;
          height: 56px;
          border-radius: 10px;
          overflow: hidden;
          background: #0F172A;
          border: 2px solid transparent;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .thumbnail-card:hover {
          border-color: rgba(255, 255, 255, 0.3);
        }
        .thumbnail-card.active {
          border-color: #3B82F6;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
        }

        .thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumb-badge {
          position: absolute;
          bottom: 2px;
          right: 2px;
          background: rgba(0, 0, 0, 0.7);
          font-size: 9px;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 4px;
          color: #FFF;
        }

        /* Lightbox Modal */
        .lightbox-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.92);
          backdrop-filter: blur(16px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .lightbox-close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 44px;
          height: 44px;
          color: #FFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .lightbox-close-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: scale(1.1);
        }

        .lightbox-full-img {
          max-width: 90vw;
          max-height: 85vh;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
        }

        .text-emerald { color: #34D399; }
        .text-amber { color: #FBBF24; }
        .text-blue { color: #60A5FA; }
      `}</style>
    </div>
  );
}
