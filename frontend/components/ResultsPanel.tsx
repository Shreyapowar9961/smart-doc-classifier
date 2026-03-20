"use client";
// frontend/components/ResultsPanel.tsx
import { UploadResult, CLASS_LABELS, CLASS_ICONS, formatBytes, formatDate } from "@/lib/api";
import SimilarityTable from "./SimilarityTable";

interface Props {
  result: UploadResult;
  onReset: () => void;
}

const CLASS_COLORS: Record<string, string> = {
  resume: "bg-blue-50 border-blue-200 text-blue-800",
  invoice: "bg-emerald-50 border-emerald-200 text-emerald-800",
  research_paper: "bg-purple-50 border-purple-200 text-purple-800",
  lab_report: "bg-amber-50 border-amber-200 text-amber-800",
  college_notes: "bg-rose-50 border-rose-200 text-rose-800",
};

const CONF_COLOR = (conf: number) => {
  if (conf >= 0.85) return "text-emerald-600";
  if (conf >= 0.65) return "text-amber-600";
  return "text-red-500";
};

export default function ResultsPanel({ result, onReset }: Props) {
  const { document: doc, topSimilar } = result;
  const confPct = Math.round(doc.confidence * 100);
  const classColor = CLASS_COLORS[doc.class] || "bg-slate-50 border-slate-200 text-slate-800";
  const icon = CLASS_ICONS[doc.class] || "📄";
  const label = CLASS_LABELS[doc.class] || doc.class;

  return (
    <div className="animate-slide-up space-y-5">
      {/* Success banner */}
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-emerald-800 font-semibold text-sm">Document classified successfully!</p>
          <p className="text-emerald-600 text-xs mt-0.5 truncate">
            ✅ Saved to: <code className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded">{doc.path}</code>
          </p>
        </div>
        <button onClick={onReset}
          className="shrink-0 text-xs text-emerald-600 hover:text-emerald-800 underline font-medium">
          Upload another
        </button>
      </div>

      {/* Main result card */}
      <div className="card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* File info */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
              {icon}
            </div>
            <div>
              <h2 className="text-slate-800 font-bold text-lg leading-tight truncate max-w-xs">
                {doc.filename}
              </h2>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                {doc.fileSize && <span>{formatBytes(doc.fileSize)}</span>}
                {doc.pageCount && <span>{doc.pageCount} page{doc.pageCount > 1 ? "s" : ""}</span>}
                <span>{formatDate(doc.uploadDate)}</span>
              </div>
            </div>
          </div>

          {/* Class badge */}
          <div className={`border rounded-xl px-4 py-3 text-center shrink-0 ${classColor}`}>
            <p className="text-xs font-medium opacity-70 mb-1">Predicted Class</p>
            <p className="font-bold text-base">{icon} {label}</p>
          </div>
        </div>

        {/* Confidence meter */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Confidence Score</span>
            <span className={`font-bold text-lg ${CONF_COLOR(doc.confidence)}`}>
              {confPct}%
            </span>
          </div>
          <div className="score-bar h-3">
            <div
              className="score-fill h-full rounded-full"
              style={{
                width: `${confPct}%`,
                background: doc.confidence >= 0.85
                  ? "linear-gradient(90deg, #16a34a, #22c55e)"
                  : doc.confidence >= 0.65
                    ? "linear-gradient(90deg, #d97706, #f59e0b)"
                    : "linear-gradient(90deg, #dc2626, #ef4444)",
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0%</span>
            <span className={confPct >= 85 ? "text-emerald-500 font-medium" : ""}>
              {confPct >= 85 ? "High confidence ✓" : confPct >= 65 ? "Moderate" : "Low — consider manual override"}
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Saved path */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
          <p className="text-xs text-slate-500 font-medium mb-1">Saved Path</p>
          <code className="text-sm text-brand-700 font-mono break-all">{doc.path}</code>
        </div>

        {/* Text preview */}
        {doc.textPreview && doc.textPreview.length > 30 && (
          <div>
            <p className="text-xs text-slate-500 font-medium mb-2">OCR Text Preview</p>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 max-h-36 overflow-y-auto
                            scrollbar-thin text-xs text-slate-600 font-mono leading-relaxed whitespace-pre-wrap">
              {doc.textPreview}…
            </div>
          </div>
        )}
      </div>

      {/* Similarity table */}
      <SimilarityTable similar={topSimilar} />
    </div>
  );
}
