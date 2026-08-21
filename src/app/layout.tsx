import type { Metadata } from "next";
import "./globals.css";
import { ShellWrapper } from "@/components/layout/ShellWrapper";

export const metadata: Metadata = {
  title: {
    default: "EFZone — eFootball 2026 Marketplace | Hisoblar va Coin",
    template: "%s | EFZone",
  },
  description:
    "O'zbekistondagi eng yirik va xavfsiz eFootball marketplace. Tasdiqlangan sotuvchilardan 100% kafolat bilan eFootball hisob va Coin sotib oling.",
  keywords: ["efootball", "efootball 2026", "pes", "marketplace", "hisob sotish", "coin", "efzone", "bigtime messi", "booster ronaldo"],
  openGraph: {
    title: "EFZone — eFootball 2026 Marketplace",
    description: "Xavfsiz va ishonchli eFootball hisob va tanga savdosi platformasi",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <ShellWrapper>{children}</ShellWrapper>
      </body>
    </html>
  );
}
