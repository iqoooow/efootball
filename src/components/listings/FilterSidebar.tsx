"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { SlidersHorizontal } from "lucide-react";

interface FilterState {
  type: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  sort: string;
}

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    type: searchParams.get("type") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minRating: searchParams.get("minRating") || "",
    sort: searchParams.get("sort") || "newest",
  });

  const applyFilters = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      router.push(`/listings?${params.toString()}`);
    },
    [router]
  );

  const update = (key: keyof FilterState, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    applyFilters(updated);
  };

  const clearAll = () => {
    const cleared = { type: "", minPrice: "", maxPrice: "", minRating: "", sort: "newest" };
    setFilters(cleared);
    router.push("/listings");
  };

  const hasActiveFilters =
    filters.type !== "" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.minRating !== "";

  return (
    <div className="g2g-sidebar-root">
      {/* Top Header */}
      <div className="sidebar-top-header">
        <div className="sidebar-title-box">
          <SlidersHorizontal size={16} className="text-muted" />
          <span>Filtrlar</span>
        </div>
        {hasActiveFilters && (
          <button onClick={clearAll} className="sidebar-clear-btn">
            Tozalash
          </button>
        )}
      </div>

      {/* 1. Saralash Tartibi (Sort) */}
      <div className="filter-group-block">
        <span className="group-heading static-label">Saralash tartibi</span>
        <select
          value={filters.sort}
          onChange={(e) => update("sort", e.target.value)}
          className="g2g-select-dropdown"
        >
          <option value="newest">Eng yangi e&apos;lonlar</option>
          <option value="price_asc">Narx: arzondan qimmatga</option>
          <option value="price_desc">Narx: qimmatdan arzonga</option>
          <option value="rating">Eng yuqori reytingli sotuvchilar</option>
        </select>
      </div>

      {/* 2. Kategoriya */}
      <div className="filter-group-block">
        <span className="group-heading static-label">Kategoriya</span>
        <div className="chips-flex-wrap">
          {[
            { value: "", label: "Barchasi" },
            { value: "account", label: "Hisoblar" },
            { value: "coins", label: "Coin & GP" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update("type", opt.value)}
              className={`filter-chip-btn ${filters.type === opt.value ? "active" : ""}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Narx oralig'i ($) */}
      <div className="filter-group-block">
        <span className="group-heading static-label">Narx oralig&apos;i ($)</span>
        <div className="price-inputs-row">
          <input
            type="number"
            min="0"
            placeholder="Min ($)"
            value={filters.minPrice}
            onChange={(e) => update("minPrice", e.target.value)}
            className="price-num-input"
          />
          <span className="price-dash">—</span>
          <input
            type="number"
            min="0"
            placeholder="Max ($)"
            value={filters.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
            className="price-num-input"
          />
        </div>
      </div>

      {/* 4. Sotuvchi minimal reytingi */}
      <div className="filter-group-block last">
        <span className="group-heading static-label">Sotuvchi reytingi</span>
        <div className="chips-flex-wrap">
          {[
            { value: "", label: "Barchasi" },
            { value: "4.0", label: "4.0+ ★" },
            { value: "5.0", label: "5.0 ★ Pro" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update("minRating", opt.value)}
              className={`filter-chip-btn ${filters.minRating === opt.value ? "active" : ""}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .g2g-sidebar-root {
          background: rgba(14, 22, 42, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          width: 100%;
          box-sizing: border-box;
        }

        .sidebar-top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .sidebar-title-box {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #FFF;
        }

        .sidebar-clear-btn {
          background: none;
          border: none;
          color: #60A5FA;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }

        .filter-group-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .filter-group-block.last {
          border-bottom: none;
          padding-bottom: 0;
        }

        .group-heading {
          font-size: 12.5px;
          font-weight: 700;
          color: rgba(229, 231, 235, 0.95);
        }
        .group-heading.static-label {
          margin-bottom: 2px;
        }

        /* Select Dropdown */
        .g2g-select-dropdown {
          width: 100%;
          height: 38px;
          background: rgba(6, 11, 24, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0 10px;
          color: #FFF;
          font-size: 13px;
          outline: none;
          cursor: pointer;
        }
        .g2g-select-dropdown option {
          background: #0B132B;
          color: #FFF;
        }

        /* Chips */
        .chips-flex-wrap {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .filter-chip-btn {
          padding: 6px 12px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(209, 213, 219, 0.85);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .filter-chip-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #FFF;
        }
        .filter-chip-btn.active {
          background: #2563EB;
          border-color: #2563EB;
          color: #FFF;
        }

        /* Price Inputs */
        .price-inputs-row {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
        }
        .price-num-input {
          flex: 1 1 0%;
          min-width: 0;
          width: 100%;
          box-sizing: border-box;
          height: 38px;
          background: rgba(6, 11, 24, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0 10px;
          font-size: 13px;
          color: #FFF;
          outline: none;
        }
        .price-num-input:focus {
          border-color: #60A5FA;
        }
        .price-dash {
          color: rgba(156, 163, 175, 0.5);
          font-size: 13px;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
