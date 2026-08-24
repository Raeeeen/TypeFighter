import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PresenceBeacon from "@/components/PresenceBeacon";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TypeFighter — Typing Battle Game",
    template: "%s | TypeFighter",
  },
  description:
    "Battle bosses across 10 floors by typing sentences fast and accurately. Free browser-based typing game with leaderboards.",
  keywords: [
    "typing game",
    "typing test",
    "typing practice",
    "typing battle",
    "WPM game",
  ],
  metadataBase: new URL("https://typefighter.onrender.com"),
  openGraph: {
    title: "TypeFighter — Typing Battle Game",
    description:
      "Battle bosses across 10 floors by typing sentences fast and accurately.",
    url: "https://typefighter.onrender.com",
    siteName: "TypeFighter",
    images: ["/assets/logo.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TypeFighter — Typing Battle Game",
    description:
      "Battle bosses across 10 floors by typing sentences fast and accurately.",
    images: ["/assets/logo.png"],
  },
  icons: {
    icon: [
      {
        url: "/assets/logo.png",
        type: "image/png",
      },
    ],
    shortcut: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PresenceBeacon />
        {children}
      </body>
    </html>
  );
}