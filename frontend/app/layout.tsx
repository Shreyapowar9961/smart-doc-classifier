// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Document Classifier",
  description: "AI-powered document classification and semantic similarity analysis — offline, fast, accurate.",
  keywords: ["document classifier", "OCR", "AI", "PDF", "BERT", "similarity"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 mt-16 py-6 text-center text-sm text-slate-400">
          Smart Document Classifier · Built with Next.js · Node.js · Python · Tesseract OCR · Sentence Transformers
        </footer>
      </body>
    </html>
  );
}
