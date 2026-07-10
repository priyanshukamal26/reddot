import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Bricolage_Grotesque } from "next/font/google";
import Providers from "./providers";
import CursorAndGrain from "@/components/layout/CursorAndGrain";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RedDot — Menstrual Health, Private by Design",
  description:
    "A menstrual health tracker that's local-first and encrypted by default, with an AI layer that interprets lab reports and finds real patterns in your cycle data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${bricolageGrotesque.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-void text-paper font-sans">
        <Providers>
          <CursorAndGrain />
          {children}
        </Providers>
      </body>
    </html>
  );
}
