"use client";
// frontend/components/UploadZone.tsx
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/tiff": [".tiff", ".tif"],
  "image/bmp": [".bmp"],
};

export default function UploadZone({ onFile, disabled }: Props) {
  const [rejected, setRejected] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejections: any[]) => {
      setRejected(null);
      if (rejections.length > 0) {
        setRejected(rejections[0]?.errors?.[0]?.message || "File not accepted");
        return;
      }
      if (accepted[0]) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    disabled,
  });

  const file = acceptedFiles[0];

  return (
    <div
      {...getRootProps()}
      className={`
        relative group cursor-pointer rounded-2xl border-2 border-dashed p-10
        flex flex-col items-center justify-center gap-4 text-center
        transition-all duration-200 select-none
        ${isDragActive
          ? "border-brand-500 bg-brand-50 drag-active"
          : file
            ? "border-brand-400 bg-brand-50"
            : "border-slate-300 bg-white hover:border-brand-400 hover:bg-slate-50"
        }
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      <input {...getInputProps()} />

      {/* Icon */}
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all
        ${file ? "bg-brand-600" : "bg-slate-100 group-hover:bg-brand-100"}`}>
        {file ? (
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : isDragActive ? (
          <svg className="w-8 h-8 text-brand-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-slate-400 group-hover:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )}
      </div>

      {/* Text */}
      {file ? (
        <div className="animate-slide-up">
          <p className="text-brand-700 font-semibold text-base">{file.name}</p>
          <p className="text-slate-500 text-sm mt-1">
            {(file.size / 1024).toFixed(1)} KB · {file.type || "document"}
          </p>
          <p className="text-brand-500 text-xs mt-2 font-medium">✓ File ready — click Classify below</p>
        </div>
      ) : isDragActive ? (
        <div>
          <p className="text-brand-600 font-semibold text-lg">Drop it here!</p>
          <p className="text-slate-400 text-sm">Release to upload</p>
        </div>
      ) : (
        <div>
          <p className="text-slate-700 font-semibold text-base">
            Drag & drop a document here
          </p>
          <p className="text-slate-400 text-sm mt-1">
            or <span className="text-brand-600 underline">click to browse</span>
          </p>
          <div className="flex gap-2 mt-4 justify-center flex-wrap">
            {["PDF", "PNG", "JPG", "TIFF"].map((ext) => (
              <span key={ext} className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-full font-mono">
                .{ext.toLowerCase()}
              </span>
            ))}
          </div>
          <p className="text-slate-300 text-xs mt-3">Max 20 MB</p>
        </div>
      )}

      {/* Error */}
      {rejected && (
        <div className="absolute bottom-3 left-0 right-0 mx-4 bg-red-50 border border-red-200
                        text-red-700 text-xs px-3 py-2 rounded-lg">
          ⚠ {rejected}
        </div>
      )}
    </div>
  );
}
