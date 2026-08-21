"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Upload, X, Star, Image as ImageIcon, AlertCircle } from "lucide-react";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

// Compress and convert File to base64 Data URL (max 1200px, 85% quality)
const processImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("Faqat rasm fayllari (JPG, PNG, WebP) qabul qilinadi"));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(e.target?.result as string);

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error("Rasmni o'qib bo'lmadi"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Faylni yuklashda xatolik"));
    reader.readAsDataURL(file);
  });
};

export function ImageUploader({
  images,
  onChange,
  maxImages = 6,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFiles = async (files: FileList | File[]) => {
    setUploadError("");
    const fileArray = Array.from(files);
    const availableSlots = maxImages - images.length;

    if (availableSlots <= 0) {
      setUploadError(`Maksimal ${maxImages} ta rasm yuklash mumkin`);
      return;
    }

    const filesToProcess = fileArray.slice(0, availableSlots);
    setIsProcessing(true);

    try {
      const base64List = await Promise.all(
        filesToProcess.map((f) => processImageFile(f))
      );
      onChange([...images, ...base64List]);
    } catch (err: any) {
      setUploadError(err.message || "Rasmlarni yuklashda xatolik yuz berdi");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const setAsMainCover = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    onChange(updated);
  };

  return (
    <div className="image-uploader-wrapper">
      {/* Upload Header Info */}
      <div className="upload-header-row">
        <div>
          <label className="upload-label">
            Akkount Rasmlari & Skrinshotlar ({images.length}/{maxImages})
          </label>
          <p className="upload-hint">
            1 tadan 6 tagacha rasm yuklang. <strong>1-chi rasm</strong> asosiy muqova (cover) sifatida ko&apos;rinadi.
          </p>
        </div>
        <span className="upload-count-tag">
          {images.length === 0 ? "Rasm yuklanmagan" : `${images.length}/${maxImages} ta`}
        </span>
      </div>

      {uploadError && (
        <div className="upload-error-alert">
          <AlertCircle size={14} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Grid of uploaded images + Dropzone */}
      <div className="images-preview-grid">
        {images.map((imgSrc, idx) => (
          <div key={idx} className={`image-thumb-card ${idx === 0 ? "is-main-cover" : ""}`}>
            <img src={imgSrc} alt={`Akkount rasmi ${idx + 1}`} className="thumb-img" />

            {/* Badge on main image */}
            {idx === 0 ? (
              <span className="main-cover-badge">
                <Star size={10} fill="#FFF" /> Asosiy Muqova
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setAsMainCover(idx)}
                className="make-main-btn"
                title="Asosiy muqova qilish"
              >
                Asosiy qilish
              </button>
            )}

            {/* Delete button */}
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="thumb-delete-btn"
              title="Rasmni o'chirish"
            >
              <X size={13} />
            </button>
          </div>
        ))}

        {/* Upload Dropzone Box if under limit */}
        {images.length < maxImages && (
          <div
            className={`upload-dropzone-box ${isDragging ? "dragging" : ""} ${isProcessing ? "processing" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <div className="dropzone-inner">
              <div className="dropzone-icon-circle">
                <Upload size={18} />
              </div>
              <span className="dropzone-main-text">
                {isProcessing ? "Yuklanmoqda..." : "Rasm tanlang yoki tashlang"}
              </span>
              <span className="dropzone-sub-text">PNG, JPG, WEBP (Maks: 6 ta)</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .image-uploader-wrapper {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 8px;
        }
        .upload-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }
        .upload-label {
          font-size: 13px;
          font-weight: 700;
          color: #FFF;
          display: block;
          margin-bottom: 2px;
        }
        .upload-hint {
          font-size: 11.5px;
          color: rgba(156, 163, 175, 0.8);
          margin: 0;
          line-height: 1.4;
        }
        .upload-hint strong {
          color: #60A5FA;
        }
        .upload-count-tag {
          font-size: 11px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(209, 213, 219, 0.85);
          padding: 3px 8px;
          border-radius: 6px;
          white-space: nowrap;
        }
        .upload-error-alert {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.3);
          border-radius: 8px;
          color: #FB7185;
          font-size: 12px;
        }
        .images-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 10px;
          margin-top: 4px;
        }
        .image-thumb-card {
          position: relative;
          aspect-ratio: 4 / 3;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s ease;
        }
        .image-thumb-card.is-main-cover {
          border: 2px solid #2563EB;
          box-shadow: 0 0 16px rgba(37, 99, 235, 0.4);
        }
        .thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .main-cover-badge {
          position: absolute;
          top: 6px;
          left: 6px;
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          color: #FFF;
          font-size: 9.5px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }
        .make-main-btn {
          position: absolute;
          bottom: 6px;
          left: 6px;
          right: 6px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFF;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 0;
          border-radius: 6px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .image-thumb-card:hover .make-main-btn {
          opacity: 1;
        }
        .thumb-delete-btn {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .thumb-delete-btn:hover {
          background: #E11D48;
          border-color: #E11D48;
        }
        .upload-dropzone-box {
          aspect-ratio: 4 / 3;
          border: 2px dashed rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 8px;
          text-align: center;
        }
        .upload-dropzone-box:hover,
        .upload-dropzone-box.dragging {
          border-color: #3B82F6;
          background: rgba(37, 99, 235, 0.08);
          transform: translateY(-1px);
        }
        .dropzone-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .dropzone-icon-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #60A5FA;
        }
        .dropzone-main-text {
          font-size: 11px;
          font-weight: 700;
          color: #FFF;
          line-height: 1.2;
        }
        .dropzone-sub-text {
          font-size: 9.5px;
          color: rgba(156, 163, 175, 0.6);
        }

        @media (max-width: 600px) {
          .images-preview-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
          .make-main-btn {
            opacity: 1;
            font-size: 9px;
            padding: 2px 0;
          }
        }
      `}</style>
    </div>
  );
}
