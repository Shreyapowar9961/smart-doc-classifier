"use client";
// frontend/components/Header.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const nav = [
    { href: "/", label: "Upload" },
    { href: "/history", label: "History" },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center
                            group-hover:bg-brand-700 transition-colors shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="leading-tight">
              <span className="font-bold text-slate-800 text-base block">Smart Document Classifier</span>
              <span className="text-xs text-slate-400 hidden sm:block">OCR · AI · Similarity</span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                  ${pathname === href
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`}
              >
                {label}
              </Link>
            ))}

            {/* API status dot */}
            <div className="ml-3 flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50
                            border border-slate-200 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">API Ready</span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
