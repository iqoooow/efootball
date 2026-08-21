"use client";

import Link from "next/link";
import { useState } from "react";
import { Zap, Mail, Lock, User, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passMatch = confirm.length > 0 && confirm !== password;
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColor = ["", "#EF4444", "#F59E0B", "#10B981"][strength];
  const strengthLabel = ["", "Zaif", "O'rtacha", "Kuchli"][strength];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Parollar mos kelmaydi");
      return;
    }
    if (password.length < 6) {
      setError("Parol kamida 6 ta belgi bo'lishi kerak");
      return;
    }
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      // Sign up user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: "buyer" } },
      });

      if (authError) {
        const msg = authError.message || "";
        if (msg.includes("already registered") || msg.includes("User already exists")) {
          setError("Bu email allaqachon ro'yxatdan o'tgan. Kirish sahifasidan kiring.");
        } else if (msg.includes("rate limit") || msg.includes("exceeded") || authError.status === 429) {
          setError("Juda ko'p so'rov yuborildi (Rate Limit). Iltimos, 1 daqiqa kuting yoki Kirish sahifasidan kiring.");
        } else if (msg.includes("invalid")) {
          setError("Email manzili noto'g'ri kiritildi.");
        } else {
          setError(msg || "Xatolik yuz berdi. Qayta urinib ko'ring.");
        }
        setLoading(false);
        return;
      }

      // Try automatic login immediately after registration
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!loginError) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Ulanishda xatolik yuz berdi.");
    }
    setLoading(false);
  };

  const iconStyle = {
    position: "absolute" as const, left: 13, top: "50%", transform: "translateY(-50%)",
    color: "rgba(107,114,128,0.8)", pointerEvents: "none" as const,
  };
  const eyeStyle = {
    position: "absolute" as const, right: 11, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer",
    color: "rgba(107,114,128,0.8)", display: "flex", padding: 4,
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

        {/* Success */}
        {success ? (
          <div className="auth-card-wrap" style={{ textAlign: "center", border: "1px solid rgba(16,185,129,0.18)" }}>
            <div style={{
              width: 68, height: 68, borderRadius: "50%",
              background: "rgba(16,185,129,0.09)", border: "1.5px solid rgba(16,185,129,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
            }}>
              <CheckCircle2 size={34} color="#34D399" strokeWidth={1.5} />
            </div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 10, color: "#fff" }}>
              Muvaffaqiyatli ro&apos;yxatdan o&apos;tdingiz!
            </h2>
            <p style={{ fontSize: 13.5, color: "rgba(156,163,175,0.8)", lineHeight: 1.7, marginBottom: 24 }}>
              <strong style={{ color: "#fff" }}>{email}</strong> hisobingiz muvaffaqiyatli yaratildi. Bosh sahifaga yo&apos;naltirilmoqdasiz...
            </p>
            <Link href="/" className="auth-submit-btn" style={{ textDecoration: "none" }}>
              Bosh sahifaga o&apos;tish <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="auth-card-wrap">
            <div style={{ marginBottom: 22, textAlign: "center" }}>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 5, color: "#fff" }}>
                Hisob yarating
              </h1>
              <p style={{ fontSize: 13.5, color: "rgba(156,163,175,0.8)" }}>EFZone marketplacega qo&apos;shiling</p>
            </div>

            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", marginBottom: 16,
                background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.20)",
                borderRadius: 10, fontSize: 13, color: "#FCA5A5", fontWeight: 500,
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {/* Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="r-name" style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(156,163,175,0.9)" }}>To&apos;liq ism</label>
                <div style={{ position: "relative" }}>
                  <User size={15} style={iconStyle} />
                  <input id="r-name" type="text" required autoComplete="name"
                    value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ism Familiya" className="auth-input-base" />
                </div>
              </div>

              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="r-email" style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(156,163,175,0.9)" }}>Email manzil</label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} style={iconStyle} />
                  <input id="r-email" type="email" required autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="sizning@email.com" className="auth-input-base" />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="r-pass" style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(156,163,175,0.9)" }}>Parol</label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={iconStyle} />
                  <input id="r-pass" type={showPass ? "text" : "password"} required autoComplete="new-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kamida 6 ta belgi" className="auth-input-base has-suffix" />
                  <button type="button" style={eyeStyle} onClick={() => setShowPass(v => !v)} aria-label={showPass ? "Yashirish" : "Ko'rish"}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {strength > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <div style={{ flex: 1, display: "flex", gap: 3 }}>
                      {[1,2,3].map(n => (
                        <div key={n} style={{ flex: 1, height: 3, borderRadius: 9, background: n <= strength ? strengthColor : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: strengthColor, whiteSpace: "nowrap" }}>{strengthLabel}</span>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="r-confirm" style={{ fontSize: 12.5, fontWeight: 500, color: "rgba(156,163,175,0.9)" }}>Parolni tasdiqlang</label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={iconStyle} />
                  <input id="r-confirm" type={showConfirm ? "text" : "password"} required autoComplete="new-password"
                    value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className={`auth-input-base has-suffix${passMatch ? " auth-input-error" : ""}`} />
                  <button type="button" style={eyeStyle} onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? "Yashirish" : "Ko'rish"}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {passMatch && <p style={{ fontSize: 11.5, color: "#FCA5A5", marginTop: 2 }}>Parollar mos kelmaydi</p>}
              </div>

              {/* Terms */}
              <p style={{ fontSize: 12, color: "rgba(107,114,128,0.8)", lineHeight: 1.55 }}>
                Ro&apos;yxatdan o&apos;tish orqali{" "}
                <Link href="/terms" style={{ color: "#60A5FA", textDecoration: "none" }}>shartlar</Link>
                {" "}va{" "}
                <Link href="/privacy" style={{ color: "#60A5FA", textDecoration: "none" }}>maxfiylik siyosati</Link>
                ni qabul qilasiz.
              </p>

              <button id="register-submit" type="submit" disabled={loading || passMatch} className="auth-submit-btn">
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Ro&apos;yxat bo&apos;linmoqda...</>
                  : <>Ro&apos;yxatdan o&apos;tish <ArrowRight size={16} /></>
                }
              </button>
            </form>

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "20px 0" }} />
            <p style={{ textAlign: "center", fontSize: 13.5, color: "rgba(156,163,175,0.8)" }}>
              Hisob bormi?{" "}
              <Link href="/auth/login" style={{ color: "#60A5FA", fontWeight: 600, textDecoration: "none" }}>Kirish</Link>
            </p>
          </div>
        )}

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

        .auth-input-error {
          border-color: rgba(239,68,68,0.45) !important;
        }
      `}</style>
    </>
  );
}
