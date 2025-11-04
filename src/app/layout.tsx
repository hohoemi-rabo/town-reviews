import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { ToastProvider } from "@/components/Toast/ToastProvider";

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ['400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-zen-maru-gothic",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "まち口コミ帳",
  description: "南信州の口コミ文化をデジタルで可視化し、「誰に教わったか」まで残す地図型レビューサービス",
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${zenMaruGothic.variable} font-sans antialiased flex flex-col h-screen overflow-hidden`}
      >
        <ToastProvider>
          {children}
          <Footer />
          <CookieBanner />
        </ToastProvider>
      </body>
    </html>
  );
}
