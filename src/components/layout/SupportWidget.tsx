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
        className="support-floating-btn"
      >
        {open ? (
          <X size={20} strokeWidth={2.5} />
        ) : (
          <MessageCircle size={22} strokeWidth={2.2} />
        )}
      </button>

      {/* Floating Support Modal */}
      {open && (
        <div className="support-modal-window animate-scale-up">
          <div className="support-modal-header">
            <div className="support-icon-bubble">
              <Zap size={18} color="#60A5FA" />
            </div>
            <div>
              <h3 className="support-modal-title">24/7 Tezkor Yordam</h3>
              <p className="support-modal-subtitle">● O&apos;rtacha javob vaqti: 2 daqiqa</p>
            </div>
          </div>

          <p className="support-modal-desc">
            Hisob xaridi, to&apos;lov yoki Konami ID bo&apos;yicha savollaringiz bormi? Mutaxassislarimiz yordam berishga tayyor!
          </p>

          {sent ? (
            <div className="support-sent-alert">
              <ShieldCheck size={20} color="#34D399" />
              <div>
                <strong>Xabar yuborildi!</strong>
                <p style={{ fontSize: 12, margin: "2px 0 0" }}>
                  Operatorimiz tez orada siz bilan bog&apos;lanadi.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Savolingizni yozing..."
                className="support-textarea"
                required
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="support-send-btn">
                  <Send size={14} /> Yuborish
                </button>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noreferrer"
                  className="support-tg-btn"
                >
                  Telegram
                </a>
              </div>
            </form>
          )}
        </div>
      )}

      <style>{`
        .support-floating-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFF;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .support-floating-btn:hover {
          transform: scale(1.08);
        }

        .support-modal-window {
          position: fixed;
          bottom: 84px;
          right: 24px;
          width: 340px;
          max-width: calc(100vw - 32px);
          background: rgba(10, 16, 32, 0.95);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 22px;
          z-index: 100;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
        }

        .support-modal-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .support-icon-bubble {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(37, 99, 235, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .support-modal-title {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #FFF;
          margin: 0;
        }

        .support-modal-subtitle {
          font-size: 11.5px;
          color: #34D399;
          margin: 2px 0 0;
          font-weight: 600;
        }

        .support-modal-desc {
          font-size: 12.5px;
          color: rgba(209, 213, 219, 0.85);
          margin-bottom: 14px;
          line-height: 1.5;
        }

        .support-textarea {
          width: 100%;
          min-height: 80px;
          background: rgba(6, 11, 26, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 10px 12px;
          color: #FFF;
          font-size: 13px;
          outline: none;
          resize: vertical;
        }
        .support-textarea:focus {
          border-color: #60A5FA;
        }

        .support-send-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #2563EB;
          color: #FFF;
          border: none;
          border-radius: 10px;
          padding: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .support-tg-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #FFF;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
        }

        .support-sent-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          padding: 14px;
          color: #FFF;
          font-size: 13px;
        }

        @media (max-width: 480px) {
          .support-floating-btn {
            bottom: 16px;
            right: 16px;
            width: 44px;
            height: 44px;
          }
          .support-modal-window {
            bottom: 70px;
            right: 16px;
            left: 16px;
            width: auto;
          }
        }
      `}</style>
    </>
  );
}
