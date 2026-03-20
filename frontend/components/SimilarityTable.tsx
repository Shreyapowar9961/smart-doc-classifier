"use client";
// frontend/components/SimilarityTable.tsx
import { SimilarDoc, CLASS_LABELS, CLASS_ICONS } from "@/lib/api";

interface Props {
  similar: SimilarDoc[];
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    score >= 0.8 ? "#16a34a" :
    score >= 0.5 ? "#d97706" : "#64748b";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-sm font-bold w-12 text-right" style={{ color }}>
        {score.toFixed(3)}
      </span>
    </div>
  );
}

export default function SimilarityTable({ similar }: Props) {
  if (!similar || similar.length === 0) {
    return (
      <div className="card p-6 text-center">
        <div className="text-3xl mb-2">🔍</div>
        <p className="text-slate-500 text-sm font-medium">No similar documents yet</p>
        <p className="text-slate-400 text-xs mt-1">
          Upload more documents to see semantic similarity scores
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">Top Similar Documents</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by cosine similarity using sentence-transformers embeddings
          </p>
        </div>
        <span className="badge bg-brand-50 text-brand-700 border border-brand-100">
          {similar.length} found
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-8">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">Similarity Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {similar.map((doc, i) => (
              <tr key={doc.id}
                className="hover:bg-slate-50 transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Rank */}
                <td className="px-6 py-4">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${i === 0 ? "bg-amber-100 text-amber-700"
                      : i === 1 ? "bg-slate-100 text-slate-600"
                      : "bg-orange-50 text-orange-600"}`}>
                    {i + 1}
                  </span>
                </td>

                {/* Filename */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">📄</span>
                    <div>
                      <p className="font-medium text-slate-800 truncate max-w-[200px]">
                        {doc.filename}
                      </p>
                      <p className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
                        {doc.path}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Class */}
                <td className="px-4 py-4">
                  <span className={`badge badge-${doc.class}`}>
                    {CLASS_ICONS[doc.class]} {CLASS_LABELS[doc.class] || doc.class}
                  </span>
                </td>

                {/* Score */}
                <td className="px-4 py-4 pr-6">
                  <ScoreBar score={doc.score} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> High (≥0.8)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium (0.5–0.8)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-400" /> Low (&lt;0.5)
        </span>
      </div>
    </div>
  );
}
