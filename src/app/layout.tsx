import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ['400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-zen-maru-gothic",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "まち口コミ帳",
  description: "南信州の口コミ文化をデジタルで可視化し、「誰に教わったか」まで残す地図型レビューサービス",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${zenMaruGothic.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
