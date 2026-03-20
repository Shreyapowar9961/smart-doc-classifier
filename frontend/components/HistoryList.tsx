"use client";
// frontend/components/HistoryList.tsx
import { useState } from "react";
import { Document, CLASS_LABELS, CLASS_ICONS, formatBytes, formatDate, deleteDocument } from "@/lib/api";

interface Props {
  docs: Document[];
  stats?: { total: number; byClass: Record<string, number> };
  pagination: {
    page: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean;
  };
  onPageChange: (page: number) => void;
  onDeleted: (id: number) => void;
  loading?: boolean;
}

function ClassBadge({ cls }: { cls: string }) {
  return (
    <span className={`badge badge-${cls}`}>
      {CLASS_ICONS[cls]} {CLASS_LABELS[cls] || cls}
    </span>
  );
}

function ConfidencePill({ conf }: { conf: number }) {
  const pct = Math.round(conf * 100);
  const color = conf >= 0.85 ? "bg-emerald-100 text-emerald-700"
    : conf >= 0.65 ? "bg-amber-100 text-amber-700"
    : "bg-red-100 text-red-700";
  return <span className={`badge ${color}`}>{pct}%</span>;
}

export default function HistoryList({ docs, stats, pagination, onPageChange, onDeleted, loading }: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?\nThis will remove the file permanently.`)) return;
    setDeletingId(id);
    try {
      await deleteDocument(id);
      onDeleted(id);
    } catch (e) {
      alert("Failed to delete document. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="card divide-y divide-slate-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-5 flex items-center gap-4">
            <div className="skeleton w-10 h-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-3 w-1/2" />
            </div>
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="text-5xl mb-4">📂</div>
        <p className="text-slate-600 font-semibold text-lg">No documents found</p>
        <p className="text-slate-400 text-sm mt-2">
          Upload your first document on the home page to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="card px-4 py-3 col-span-2 sm:col-span-1">
            <p className="text-2xl font-bold text-brand-700">{stats.total}</p>
            <p className="text-xs text-slate-400 mt-0.5">Total Docs</p>
          </div>
          {Object.entries(stats.byClass).map(([cls, count]) => (
            <div key={cls} className="card px-4 py-3">
              <p className="text-xl font-bold text-slate-800">{count}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {CLASS_ICONS[cls]} {cls.replace("_", " ")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidence</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Size</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Uploaded</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {docs.map((doc, i) => (
                <tr key={doc.id}
                  className={`hover:bg-slate-50 transition-colors animate-fade-in
                    ${deletingId === doc.id ? "opacity-40" : ""}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Document name + path */}
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 bg-brand-50 border border-brand-100 rounded-lg flex items-center
                                      justify-center text-sm shrink-0 mt-0.5">
                        {CLASS_ICONS[doc.class] || "📄"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate max-w-[200px]">
                          {doc.originalName}
                        </p>
                        <p className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
                          {doc.path}
                        </p>
                        {doc.manualOverride && (
                          <span className="text-xs text-purple-500 font-medium">✏ Manual override</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Class */}
                  <td className="px-4 py-4">
                    <ClassBadge cls={doc.class} />
                  </td>

                  {/* Confidence */}
                  <td className="px-4 py-4">
                    <ConfidencePill conf={doc.confidence} />
                  </td>

                  {/* Size */}
                  <td className="px-4 py-4 hidden md:table-cell text-slate-500">
                    {doc.fileSize ? formatBytes(doc.fileSize) : "—"}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-4 hidden lg:table-cell text-slate-400 text-xs whitespace-nowrap">
                    {formatDate(doc.uploadDate)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleDelete(doc.id, doc.originalName)}
                      disabled={deletingId === doc.id}
                      className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50
                                 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === doc.id ? "Deleting…" : "🗑 Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-slate-100 px-5 py-4 flex items-center justify-between bg-slate-50">
            <p className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-30"
              >
                ← Prev
              </button>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
