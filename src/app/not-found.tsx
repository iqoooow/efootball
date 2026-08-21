import Link from "next/link";
import { Zap, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
      background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(0,230,118,0.06) 0%, transparent 70%), var(--bg-base)",
    }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <Zap size={40} color="var(--accent)" />
        </div>

        <div style={{
          fontSize: 120, fontWeight: 900, lineHeight: 1,
          fontFamily: "'Space Grotesk', sans-serif",
          background: "linear-gradient(135deg, #00e676, #4f8ef7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 8,
        }}>
          404
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          Sahifa topilmadi
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 32, lineHeight: 1.7 }}>
          Siz qidirgan sahifa mavjud emas yoki o&apos;chirib tashlangan bo&apos;lishi mumkin.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary">
            <Home size={16} /> Bosh sahifa
          </Link>
          <Link href="/listings" className="btn btn-secondary">
            <Search size={16} /> E&apos;lonlarni ko&apos;rish
          </Link>
        </div>
      </div>
    </div>
  );
}
