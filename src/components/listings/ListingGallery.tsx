"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck, Gamepad2, Monitor, Smartphone, Maximize2 } from "lucide-react";
import { getPlatformLabel } from "@/lib/utils";

interface ListingGalleryProps {
  images: string[] | null;
  title: string;
  platform: string;
  teamRating?: number | null;
}

export function ListingGallery({
  images,
  title,
  platform,
  teamRating,
}: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const imageList = (images || []).filter(
    (img) => typeof img === "string" && img.trim() !== ""
  );
  const hasImages = imageList.length > 0;
  const currentImage = hasImages ? imageList[activeIndex] || imageList[0] : null;

  const platformIcons: Record<string, any> = {
    ps: Gamepad2,
    xbox: Gamepad2,
    pc: Monitor,
    mobile: Smartphone,
  };
  const PlatformIcon = platformIcons[platform] || Gamepad2;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="listing-gallery-wrapper">
      {/* Main Image Showcase */}
      <div
        className="gallery-main-showcase"
        onClick={() => currentImage && setFullscreenImage(currentImage)}
      >
        {hasImages && currentImage ? (
          <>
            <img src={currentImage} alt={title} className="gallery-main-img" />
            <button
              type="button"
              className="gallery-zoom-btn"
              title="Kattalashtirib ko'rish"
            >
              <Maximize2 size={15} />
            </button>
          </>
        ) : (
          <div className="detail-fallback-banner">
            <div className="fallback-bg-art" />
            <div className="fallback-meta">
              <span className="fallback-pill">
                <PlatformIcon size={14} /> {getPlatformLabel(platform)}
              </span>
              <span className="fallback-ovr-text">
                {teamRating ? `${teamRating} OVR Rating` : "eFootball Hisob"}
              </span>
            </div>
          </div>
        )}

        {/* Carousel Navigation Arrows if multiple images */}
        {imageList.length > 1 && (
          <div className="gallery-nav-arrows">
            <button
              type="button"
              onClick={handlePrev}
              className="btn-gallery-arrow prev"
              aria-label="Oldingi rasm"
            >
              <ChevronLeft size={20} />
            </button>

            <span className="gallery-counter-tag">
              {activeIndex + 1} / {imageList.length}
            </span>

            <button
              type="button"
              onClick={handleNext}
              className="btn-gallery-arrow next"
              aria-label="Keyingi rasm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Floating Badges */}
        <div className="hero-top-badges">
          <span className="badge-platform-tag">
            <PlatformIcon size={13} /> {getPlatformLabel(platform)}
          </span>
          {teamRating && (
            <span className="badge-ovr-tag">🔥 {teamRating} OVR</span>
          )}
        </div>

        <div className="hero-bottom-guarantee">
          <ShieldCheck size={14} className="text-emerald" />
          <span>100% Escrow Himoyalangan</span>
        </div>
      </div>

      {/* Thumbnail Strip (1 to 6 images) */}
      {imageList.length > 1 && (
        <div className="gallery-thumbs-row">
          {imageList.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`gallery-thumb-btn ${activeIndex === idx ? "active" : ""}`}
            >
              <img src={imgUrl} alt={`${title} skrinshot ${idx + 1}`} className="thumb-strip-img" />
              {idx === 0 && <span className="thumb-main-label">Muqova</span>}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {fullscreenImage && (
        <div className="lightbox-overlay" onClick={() => setFullscreenImage(null)}>
          <div className="lightbox-modal-box" onClick={(e) => e.stopPropagation()}>
            <img src={fullscreenImage} alt={title} className="lightbox-full-img" />
            <button
              type="button"
              onClick={() => setFullscreenImage(null)}
              className="lightbox-close-btn"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .listing-gallery-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        .gallery-main-showcase {
          position: relative;
          aspect-ratio: 16 / 9;
          max-height: 440px;
          border-radius: 20px;
          overflow: hidden;
          background: #0B0F19;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          cursor: pointer;
        }
        .gallery-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .gallery-main-showcase:hover .gallery-main-img {
          transform: scale(1.02);
        }
        .gallery-zoom-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 10;
        }
        .gallery-main-showcase:hover .gallery-zoom-btn {
          opacity: 1;
        }

        .gallery-nav-arrows {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          pointer-events: none;
          z-index: 8;
        }
        .btn-gallery-arrow {
          pointer-events: auto;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-gallery-arrow:hover {
          background: rgba(37, 99, 235, 0.85);
          border-color: #2563EB;
          transform: scale(1.08);
        }
        .gallery-counter-tag {
          position: absolute;
          bottom: 14px;
          right: 14px;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #FFF;
          font-size: 11.5px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
        }

        .hero-top-badges {
          position: absolute;
          top: 14px;
          left: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 5;
        }
        .badge-platform-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #FFF;
          font-size: 11.5px;
          font-weight: 700;
        }
        .badge-ovr-tag {
          padding: 5px 10px;
          border-radius: 8px;
          background: rgba(37, 99, 235, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #FFF;
          font-size: 11.5px;
          font-weight: 800;
        }

        .hero-bottom-guarantee {
          position: absolute;
          bottom: 14px;
          left: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34D399;
          font-size: 11px;
          font-weight: 700;
          z-index: 5;
        }

        /* Fallback Art */
        .detail-fallback-banner {
          width: 100%;
          height: 100%;
          position: relative;
          background: radial-gradient(circle at 50% 50%, #1e293b 0%, #030712 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fallback-bg-art {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .fallback-meta {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .fallback-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.2);
          border: 1px solid rgba(37, 99, 235, 0.4);
          color: #60A5FA;
          font-size: 12px;
          font-weight: 700;
        }
        .fallback-ovr-text {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #FFF;
        }

        /* Thumbnail Strip */
        .gallery-thumbs-row {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 2px 0;
        }
        .gallery-thumbs-row::-webkit-scrollbar {
          display: none;
        }
        .gallery-thumb-btn {
          position: relative;
          width: 80px;
          height: 56px;
          border-radius: 10px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          flex-shrink: 0;
          padding: 0;
          transition: all 0.15s ease;
        }
        .gallery-thumb-btn:hover {
          border-color: rgba(37, 99, 235, 0.6);
        }
        .gallery-thumb-btn.active {
          border-color: #2563EB;
          box-shadow: 0 0 12px rgba(37, 99, 235, 0.5);
          transform: translateY(-2px);
        }
        .thumb-strip-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .thumb-main-label {
          position: absolute;
          bottom: 2px;
          left: 2px;
          right: 2px;
          background: rgba(37, 99, 235, 0.85);
          color: #FFF;
          font-size: 8px;
          font-weight: 800;
          text-align: center;
          border-radius: 4px;
          padding: 1px 0;
        }

        /* Lightbox */
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(16px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .lightbox-modal-box {
          position: relative;
          max-width: 90vw;
          max-height: 85vh;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.9);
        }
        .lightbox-full-img {
          width: 100%;
          height: auto;
          max-height: 85vh;
          object-fit: contain;
        }
        .lightbox-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFF;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
