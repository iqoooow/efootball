"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        const msg = authError.message || "";
        if (msg.includes("Invalid login credentials")) {
          setError("Email yoki parol noto'g'ri kiritildi.");
        } else if (msg.includes("Email not confirmed")) {
          setError("Email manzilingiz hali tasdiqlanmagan. Iltimos, pochtangizni tekshiring.");
        } else if (msg.includes("rate limit") || authError.status === 429) {
          setError("Juda ko'p urinish bajarildi (Rate Limit). Iltimos, 1 daqiqa kuting.");
        } else {
          setError(msg || "Email yoki parol noto'g'ri.");
        }
        setLoading(false);
        return;
      }
      router.push("/"); router.refresh();
    } catch { setError("Ulanishda xatolik yuz berdi."); setLoading(false); }
  };

  return (
    <>
      <video autoPlay muted loop playsInline style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", zIndex: -2,
      }} src="/try_what_you_can.mp4" />

      <div style={{
        position: "fixed", inset: 0, zIndex: -1,
        background: "linear-gradient(135deg, rgba(2,4,14,0.88) 0%, rgba(4,8,22,0.80) 100%)",
      }} />

      <div className="auth-page-wrap">
        {/* Logo */}
        <Link href="/" className="auth-logo-link">
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 20px rgba(37,99,235,0.45)", flexShrink: 0,
          }}>
            <Zap size={19} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 20, color: "#fff", letterSpacing: "-0.02em" }}>
            EF<span style={{ color: "#60A5FA" }}>Zone</span>
          </span>
        </Link>

        {/* Card */}
        <div className="auth-card-wrap">
          {/* Header */}
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 5, color: "#fff" }}>
              Xush kelibsiz
            </h1>
            <p style={{ fontSize: 13.5, color: "rgba(156,163,175,0.8)" }}>Hisobingizga kiring</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", marginBottom: 18,
              background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.20)",
              borderRadius: 10, fontSize: 13, color: "#FCA5A5", fontWeight: 500,
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="l-email" style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(156,163,175,0.9)" }}>Email manzil</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(107,114,128,0.8)", pointerEvents: "none" }} />
                <input id="l-email" type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="sizning@email.com" className="auth-input-base" />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label htmlFor="l-pass" style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(156,163,175,0.9)" }}>Parol</label>
                <Link href="/auth/forgot-password" style={{ fontSize: 12, color: "#60A5FA", textDecoration: "none", fontWeight: 500 }}>Unutdingizmi?</Link>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(107,114,128,0.8)", pointerEvents: "none" }} />
                <input id="l-pass" type={showPass ? "text" : "password"} required autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="auth-input-base has-suffix" />
                <button type="button" onClick={() => setShowPass(v => !v)} aria-label={showPass ? "Yashirish" : "Ko'rish"}
                  style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(107,114,128,0.8)", display: "flex", padding: 4 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button id="login-submit" type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Kirilmoqda...</> : <>Kirish <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "22px 0" }} />

          <p style={{ textAlign: "center", fontSize: 13.5, color: "rgba(156,163,175,0.8)" }}>
            Hisob yo&apos;qmi?{" "}
            <Link href="/auth/register" style={{ color: "#60A5FA", fontWeight: 600, textDecoration: "none" }}>
              Ro&apos;yxatdan o&apos;ting
            </Link>
          </p>
        </div>

        {/* Trust */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 18, fontSize: 12, color: "rgba(110,231,183,0.55)" }}>
          <ShieldCheck size={13} color="#34D399" />
          256-bit SSL shifrlash bilan himoyalangan
        </div>
      </div>

      <style>{`
        /* Responsive Auth */
        .auth-page-wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          position: relative;
          box-sizing: border-box;
        }
        .auth-logo-link {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
          margin-bottom: 28px;
        }
        .auth-card-wrap {
          width: 100%;
          max-width: 420px;
          background: rgba(6, 10, 24, 0.78);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 22px;
          padding: 36px 32px;
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset;
          animation: loginIn 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
          box-sizing: border-box;
        }
        .auth-input-base {
          width: 100%;
          padding: 11px 14px 11px 42px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 11px;
          font-size: 14px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .auth-input-base:focus {
          border-color: rgba(37,99,235,0.55);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
          background: rgba(37,99,235,0.05);
        }
        .auth-input-base::placeholder { color: rgba(107,114,128,0.7); }
        .auth-input-base.has-suffix { padding-right: 44px; }
        .auth-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 13px 20px;
          margin-top: 6px;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 15px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(37,99,235,0.40);
          transition: all 0.22s cubic-bezier(0.16,1,0.3,1);
        }
        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(37,99,235,0.55);
        }
        .auth-submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .auth-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        @keyframes loginIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px rgba(6,10,24,0.92) inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
        }
        @media (max-width: 480px) {
          .auth-card-wrap {
            padding: 28px 20px;
            border-radius: 18px;
          }
          .auth-logo-link { margin-bottom: 20px; }
        }
        @media (max-width: 360px) {
          .auth-card-wrap { padding: 24px 16px; }
        }
`}</style>
    </>
  );
}
