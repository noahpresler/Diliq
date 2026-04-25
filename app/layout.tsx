import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diliq — AI-native company intelligence",
  description:
    "Search any company. Get an instant, source-cited investment brief.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL?.startsWith("http")
      ? process.env.NEXT_PUBLIC_APP_URL
      : "https://diliq.presler.me",
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="bg-[#0A0A0F] text-white antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
