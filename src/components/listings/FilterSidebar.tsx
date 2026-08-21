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
    filters.type !== "" || filters.minPrice !== "" || filters.maxPrice !== "" || filters.minRating !== "";

  const groupTitleStyle = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: "var(--text-muted)",
    marginBottom: 10,
    display: "block",
  };

  const chipStyle = (active: boolean) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
    border: active
      ? "1.5px solid var(--accent-primary)"
      : "1px solid rgba(255, 255, 255, 0.1)",
    background: active ? "var(--accent-primary)" : "transparent",
    color: active ? "#FFFFFF" : "var(--text-secondary)",
    whiteSpace: "nowrap" as const,
  });

  const currentMaxPrice = filters.maxPrice ? parseInt(filters.maxPrice, 10) : 500;

  return (
    <div
      style={{
        width: 280,
        background: "rgba(255, 255, 255, 0.02)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "var(--radius-lg)",
        padding: 24,
      }}
    >
      {/* ── Top Header Row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 16,
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text-primary)",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          <SlidersHorizontal size={18} color="var(--text-secondary)" />
          Filtrlar
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            style={{
              fontSize: 13,
              color: "var(--accent-primary)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontWeight: 500,
              textDecoration: "underline",
              textUnderlineOffset: 2,
            }}
          >
            Tozalash
          </button>
        )}
      </div>

      {/* ── Group 1: SARALASH TARTIBI ── */}
      <div style={{ marginBottom: 28 }}>
        <span style={groupTitleStyle}>Saralash Tartibi</span>
        <select
          value={filters.sort}
          onChange={(e) => update("sort", e.target.value)}
          style={{
            width: "100%",
            height: 40,
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 10,
            padding: "0 12px",
            fontSize: 14,
            color: "var(--text-primary)",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="newest" style={{ background: "#0F172A", color: "#FFF" }}>
            Eng yangi e&apos;lonlar
          </option>
          <option value="price_asc" style={{ background: "#0F172A", color: "#FFF" }}>
            Narx: arzondan qimmatga
          </option>
          <option value="price_desc" style={{ background: "#0F172A", color: "#FFF" }}>
            Narx: qimmatdan arzonga
          </option>
          <option value="rating" style={{ background: "#0F172A", color: "#FFF" }}>
            Eng yuqori reytingli sotuvchilar
          </option>
        </select>
      </div>

      {/* ── Group 2: KATEGORIYA ── */}
      <div style={{ marginBottom: 20 }}>
        <span style={groupTitleStyle}>Kategoriya</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "nowrap" }}>
          {[
            { value: "", label: "Barchasi" },
            { value: "account", label: "Hisoblar" },
            { value: "coins", label: "Coin" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update("type", opt.value)}
              style={chipStyle(filters.type === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Subtle Divider Line between Category and Price ── */}
      <div
        style={{
          height: 1,
          background: "rgba(255, 255, 255, 0.06)",
          margin: "20px 0",
        }}
      />

      {/* ── Group 3: NARX ORALIG'I (Min & Max Inputs) ── */}
      <div style={{ marginBottom: 28 }}>
        <span style={groupTitleStyle}>Narx Oralig&apos;i ($)</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="number"
            min="0"
            placeholder="Min ($)"
            value={filters.minPrice}
            onChange={(e) => update("minPrice", e.target.value)}
            style={{
              width: "100%",
              height: 38,
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 8,
              padding: "0 10px",
              fontSize: 13,
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>—</span>
          <input
            type="number"
            min="0"
            placeholder="Max ($)"
            value={filters.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
            style={{
              width: "100%",
              height: 38,
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 8,
              padding: "0 10px",
              fontSize: 13,
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* ── Group 4: SOTUVCHI MINIMAL REYTINGI ── */}
      <div>
        <span style={groupTitleStyle}>Sotuvchi Minimal Reytingi</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { value: "", label: "Barchasi" },
            { value: "4.0", label: "4.0+ ★" },
            { value: "4.5", label: "4.5+ ★" },
            { value: "5.0", label: "5.0 ★" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update("minRating", opt.value)}
              style={chipStyle(filters.minRating === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
