"use client";
// frontend/app/page.tsx  — Home: Upload + Classify
import { useState } from "react";
import { useForm } from "react-hook-form";
import UploadZone from "@/components/UploadZone";
import ResultsPanel from "@/components/ResultsPanel";
import { uploadDocument, UploadResult, ALL_CLASSES, CLASS_LABELS, CLASS_ICONS } from "@/lib/api";

type FormValues = { manualClass: string };

type Stage = "idle" | "uploading" | "processing" | "done" | "error";

const STAGE_MESSAGES: Record<Stage, string> = {
  idle: "",
  uploading: "Uploading file…",
  processing: "Running OCR + ML pipeline… (this may take 10–30 sec)",
  done: "Done!",
  error: "An error occurred",
};

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [uploadPct, setUploadPct] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, watch } = useForm<FormValues>({ defaultValues: { manualClass: "" } });
  const manualClass = watch("manualClass");

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setStage("idle");
    setErrorMsg("");
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStage("uploading");
    setUploadPct(0);
    setErrorMsg("");
    setResult(null);

    try {
      const res = await uploadDocument(file, manualClass || undefined, (pct) => {
        setUploadPct(pct);
        if (pct === 100) setStage("processing");
      });
      setResult(res);
      setStage("done");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || "Upload failed";
      setErrorMsg(msg);
      setStage("error");
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setStage("idle");
    setUploadPct(0);
    setErrorMsg("");
  };

  const isProcessing = stage === "uploading" || stage === "processing";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100
                        text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-2">
          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
          Fully Offline · No Cloud APIs
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Smart Document Classifier
        </h1>
        <p className="text-slate-500 text-base max-w-lg mx-auto leading-relaxed">
          Upload any PDF or image → AI extracts text via OCR → classifies the document →
          finds semantically similar files in your archive.
        </p>
      </div>

      {/* Supported classes */}
      <div className="flex flex-wrap gap-2 justify-center">
        {ALL_CLASSES.map((cls) => (
          <span key={cls} className={`badge badge-${cls} py-1 px-3`}>
            {CLASS_ICONS[cls]} {CLASS_LABELS[cls]}
          </span>
        ))}
      </div>

      {/* Main card */}
      {result ? (
        <ResultsPanel result={result} onReset={handleReset} />
      ) : (
        <div className="card p-6 space-y-5">
          {/* Upload zone */}
          <UploadZone onFile={handleFile} disabled={isProcessing} />

          {/* Options row */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            {/* Manual class selector */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Manual Class Override
                <span className="text-slate-400 font-normal ml-1">(optional — overrides AI prediction)</span>
              </label>
              <select
                {...register("manualClass")}
                disabled={isProcessing}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5
                           bg-white text-slate-700 focus:outline-none focus:ring-2
                           focus:ring-brand-400 focus:border-transparent disabled:opacity-50"
              >
                <option value="">🤖 Auto-detect (recommended)</option>
                {ALL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {CLASS_ICONS[cls]} {CLASS_LABELS[cls]}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!file || isProcessing}
              className="btn-primary py-2.5 px-8 text-base sm:w-auto w-full"
            >
              {isProcessing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {stage === "uploading" ? `Uploading ${uploadPct}%` : "Classifying…"}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Classify Document
                </>
              )}
            </button>
          </div>

          {/* Progress bar */}
          {isProcessing && (
            <div className="animate-fade-in">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>{STAGE_MESSAGES[stage]}</span>
                {stage === "uploading" && <span>{uploadPct}%</span>}
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-300"
                  style={{
                    width: stage === "processing" ? "100%" : `${uploadPct}%`,
                    animation: stage === "processing" ? "shimmer 1.5s infinite" : "none",
                    backgroundImage: stage === "processing"
                      ? "linear-gradient(90deg, #3b82f6 25%, #60a5fa 50%, #3b82f6 75%)"
                      : undefined,
                    backgroundSize: "200% 100%",
                  }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {stage === "error" && (
            <div className="animate-slide-up bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
              <p className="text-red-700 font-semibold">❌ Error</p>
              <p className="text-red-600 mt-1">{errorMsg}</p>
              <p className="text-red-400 text-xs mt-2">
                Make sure the backend is running at{" "}
                <code className="bg-red-100 px-1 rounded">
                  {process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}
                </code>
                {" "}and Python dependencies are installed.
              </p>
            </div>
          )}
        </div>
      )}

      {/* How it works */}
      {!result && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 animate-fade-in">
          {[
            { step: "1", icon: "⬆", label: "Upload", desc: "PDF or image (20MB max)" },
            { step: "2", icon: "🔍", label: "OCR", desc: "Tesseract extracts text" },
            { step: "3", icon: "🤖", label: "Classify", desc: "TF-IDF + ML predicts class" },
            { step: "4", icon: "🧠", label: "Similarity", desc: "BERT finds related docs" },
          ].map(({ step, icon, label, desc }) => (
            <div key={step} className="card px-4 py-4 text-center">
              <div className="w-8 h-8 bg-brand-600 text-white text-xs font-bold rounded-full
                              flex items-center justify-center mx-auto mb-2">
                {step}
              </div>
              <div className="text-2xl mb-1">{icon}</div>
              <p className="font-semibold text-slate-800 text-sm">{label}</p>
              <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
