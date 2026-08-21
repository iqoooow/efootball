"use client";

import { useState } from "react";
import { MessageCircle, X, Send, ShieldCheck, Zap, HelpCircle } from "lucide-react";

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => {
      setMessage("");
      setSent(false);
      setOpen(false);
    }, 2500);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Yordam va Qo'llab-quvvatlash"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 99,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #00e676, #00c85a)",
          border: "none",
          boxShadow: "0 8px 30px rgba(0,230,118,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#000",
          cursor: "pointer",
          transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? <X size={26} strokeWidth={2.5} /> : <MessageCircle size={26} strokeWidth={2.5} />}
      </button>

      {/* Floating Support Modal */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 24,
            width: 360,
            maxWidth: "calc(100vw - 48px)",
            background: "var(--bg-card)",
            border: "1px solid rgba(0,230,118,0.3)",
            borderRadius: 20,
            padding: 24,
            zIndex: 100,
            boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 30px rgba(0,230,118,0.1)",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(0,230,118,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={18} color="var(--accent)" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>24/7 Tezkor Yordam</h3>
              <p style={{ fontSize: 12, color: "var(--accent)" }}>● O&apos;rtacha javob vaqti: 2 daqiqa</p>
            </div>
          </div>

          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
            Hisob xaridi, to&apos;lov yoki Konami ID bo&apos;yicha savollaringiz bormi? Mutaxassislarimiz yordam berishga tayyor!
          </p>

          {sent ? (
            <div className="alert alert-success" style={{ textAlign: "center", padding: "16px" }}>
              <ShieldCheck size={20} />
              <div>
                <strong>Xabar yuborildi!</strong>
                <p style={{ fontSize: 12, marginTop: 2 }}>Operatorimiz tez orada siz bilan bog&apos;lanadi.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Savolingizni yozing..."
                className="form-input"
                style={{ minHeight: 90, fontSize: 13 }}
                required
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontSize: 13 }}>
                  <Send size={14} /> Yuborish
                </button>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: 13, padding: "0 12px" }}
                >
                  Telegram
                </a>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
