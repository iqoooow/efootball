import Link from "next/link";
import { Zap, Home, Search, Gamepad2, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="not-found-page-root">
      <div className="not-found-card animate-fade-in">
        <div className="not-found-icon-box">
          <Gamepad2 size={36} className="text-blue" />
        </div>

        <div className="not-found-code">404</div>

        <h1 className="not-found-heading">Sahifa Topilmadi</h1>
        <p className="not-found-description">
          Siz qidirgan sahifa yoki e&apos;lon mavjud emas yoki o&apos;chirib tashlangan bo&apos;lishi mumkin.
        </p>

        <div className="not-found-actions">
          <Link href="/" className="btn-primary-home">
            <Home size={16} />
            <span>Bosh Sahifa</span>
          </Link>
          <Link href="/listings" className="btn-secondary-market">
            <Search size={16} />
            <span>E&apos;lonlar Bozori</span>
          </Link>
        </div>
      </div>

      <style>{`
        .not-found-page-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 20px 40px 20px;
          background: radial-gradient(circle at 50% 30%, rgba(37, 99, 235, 0.1) 0%, transparent 65%), #030712;
          color: #FFF;
          font-family: 'Inter', sans-serif;
        }

        .not-found-card {
          text-align: center;
          max-width: 460px;
          width: 100%;
          background: rgba(10, 16, 32, 0.85);
          backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          padding: 44px 32px;
          box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.8);
        }

        .not-found-icon-box {
          width: 68px;
          height: 68px;
          border-radius: 20px;
          background: rgba(37, 99, 235, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px auto;
        }

        .not-found-code {
          font-family: 'Outfit', sans-serif;
          font-size: 80px;
          font-weight: 900;
          line-height: 1;
          background: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 12px;
          letter-spacing: -0.04em;
        }

        .not-found-heading {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #FFF;
          margin: 0 0 10px 0;
        }

        .not-found-description {
          font-size: 14px;
          color: rgba(156, 163, 175, 0.9);
          line-height: 1.6;
          margin: 0 0 28px 0;
        }

        .not-found-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-primary-home {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          color: #FFF;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          box-shadow: 0 4px 18px rgba(37, 99, 235, 0.35);
          transition: transform 0.2s;
        }
        .btn-primary-home:hover {
          transform: translateY(-1.5px);
        }

        .btn-secondary-market {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #FFF;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          transition: background 0.2s;
        }
        .btn-secondary-market:hover {
          background: rgba(255, 255, 255, 0.09);
        }

        .text-blue { color: #60A5FA; }

        @media (max-width: 480px) {
          .not-found-card {
            padding: 32px 20px;
          }
          .not-found-actions {
            flex-direction: column;
            width: 100%;
          }
          .btn-primary-home, .btn-secondary-market {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
