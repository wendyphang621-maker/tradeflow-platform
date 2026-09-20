import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeFlow 外贸业务平台",
  description: "客户、商机、订单、交付、产品素材与团队协作一体化工作台。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="light">
      <body className="antialiased">{children}</body>
    </html>
  );
}
