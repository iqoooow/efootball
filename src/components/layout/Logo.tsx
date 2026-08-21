import Link from "next/link";
import { Zap } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({ size = "md", href = "/" }: LogoProps) {
  const fontSize = size === "sm" ? 17 : size === "lg" ? 25 : 21;
  const iconBoxSize = size === "sm" ? 28 : size === "lg" ? 38 : 32;
  const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;

  const logoContent = (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* Sleek Futuristic Icon Badge */}
      <div
        style={{
          width: iconBoxSize,
          height: iconBoxSize,
          borderRadius: 8,
          background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(37, 99, 235, 0.45)",
          flexShrink: 0,
        }}
      >
        <Zap size={iconSize} color="#FFFFFF" fill="#FFFFFF" />
      </div>

      {/* Modern Typography Wordmark Logo */}
      <span
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 900,
          fontSize: fontSize,
          letterSpacing: "-0.03em",
          color: "#FFFFFF",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        eFootball
        <span
          style={{
            background: "linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)",
            color: "#FFFFFF",
            padding: "3px 8px",
            borderRadius: 6,
            fontSize: fontSize - 4,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            boxShadow: "0 2px 10px rgba(37, 99, 235, 0.3)",
          }}
        >
          ZONE
        </span>
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none" }}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
