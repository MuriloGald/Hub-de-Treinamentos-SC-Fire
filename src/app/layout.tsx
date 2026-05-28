import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SC Fire — Plataforma de Treinamentos",
    template: "%s | SC Fire",
  },
  description:
    "Hub profissional de treinamentos em Brigada de Incêndio, NR23, Lei Lucas e Segurança. Plataforma SC Fire.",
  keywords: [
    "brigada de incêndio",
    "treinamento",
    "NR23",
    "Lei Lucas",
    "SIPAT",
    "segurança",
    "SC Fire",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${geistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col antialiased">{children}</body>
    </html>
  );
}
