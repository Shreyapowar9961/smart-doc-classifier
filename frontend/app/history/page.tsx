"use client";
// frontend/app/history/page.tsx — History page
import { useState, useEffect, useCallback } from "react";
import { getHistory, HistoryResponse, ALL_CLASSES, CLASS_LABELS, CLASS_ICONS } from "@/lib/api";
import HistoryList from "@/components/HistoryList";
import Link from "next/link";

export default function HistoryPage() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [classFilter, setClassFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getHistory(page, 10, classFilter, search || undefined);
      setData(res);
    } catch (e) {
      console.error("Failed to load history:", e);
    } finally {
      setLoading(false);
    }
  }, [page, classFilter, search]);

  useEffect(() => { load(); }, [load]);

  // Search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDeleted = (id: number) => {
    if (data) {
      setData((prev) => prev ? {
        ...prev,
        docs: prev.docs.filter((d) => d.id !== id),
        stats: { ...prev.stats, total: prev.stats.total - 1 },
      } : null);
    }
  };

  const handleClassFilter = (cls: string) => {
    setClassFilter(cls);
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Document History</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            All uploaded and classified documents
          </p>
        </div>
        <Link href="/" className="btn-primary text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Upload New
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        {/* Class filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => handleClassFilter("all")}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
              ${classFilter === "all"
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            All Classes
          </button>
          {ALL_CLASSES.map((cls) => (
            <button
              key={cls}
              onClick={() => handleClassFilter(cls)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                ${classFilter === cls
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {CLASS_ICONS[cls]} {cls.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 sm:ml-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search filenames…"
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none
                       focus:ring-2 focus:ring-brand-400 w-48"
          />
          <button type="submit" className="btn-ghost text-xs py-1.5 px-3">
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
              className="text-xs text-slate-400 hover:text-slate-700 px-2"
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* List */}
      <HistoryList
        docs={data?.docs ?? []}
        stats={data?.stats}
        pagination={data?.pagination ?? {
          page: 1, total: 0, totalPages: 1, hasNext: false, hasPrev: false
        }}
        onPageChange={setPage}
        onDeleted={handleDeleted}
        loading={loading}
      />
    </div>
  );
}
