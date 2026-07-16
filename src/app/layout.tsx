import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sony WH-1000XM6 | Silence, perfected.",
  description: "Experience the ultimate in noise cancellation and high-fidelity audio with the flagship Sony WH-1000XM6 headphones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} bg-[#050505] text-white antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
