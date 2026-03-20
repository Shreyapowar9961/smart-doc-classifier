// frontend/lib/api.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 300000, // 5 minutes for OCR+ML on Render
});

export interface Document {
  id: number;
  filename: string;
  originalName: string;
  path: string;
  class: string;
  confidence: number;
  fileSize?: number;
  pageCount?: number;
  uploadDate: string;
  manualOverride?: boolean;
  mimeType?: string;
  textPreview?: string;
}

export interface SimilarDoc {
  id: number;
  filename: string;
  path: string;
  class: string;
  score: number;
}

export interface UploadResult {
  success: boolean;
  document: Document & { textPreview: string };
  topSimilar: SimilarDoc[];
}

export interface HistoryResponse {
  docs: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: {
    total: number;
    byClass: Record<string, number>;
  };
}

export interface SimilarResponse {
  document: Document;
  similar: SimilarDoc[];
  meta: { topN: number; crossClass: boolean; totalCandidates: number };
}

// Upload and classify a document
export async function uploadDocument(
  file: File,
  manualClass?: string,
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  if (manualClass) form.append("manualClass", manualClass);

  const { data } = await api.post<UploadResult>("/upload/classify", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 300000,
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data;
}

// Get paginated history
export async function getHistory(
  page = 1,
  limit = 10,
  classFilter?: string,
  search?: string
): Promise<HistoryResponse> {
  const params: Record<string, string | number> = { page, limit };
  if (classFilter && classFilter !== "all") params.class = classFilter;
  if (search) params.search = search;
  const { data } = await api.get<HistoryResponse>("/history", { params });
  return data;
}

// Get single document
export async function getDocument(id: number): Promise<Document> {
  const { data } = await api.get<Document>(`/history/${id}`);
  return data;
}

// Delete document
export async function deleteDocument(id: number): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/history/${id}`);
  return data;
}

// Get similar documents
export async function getSimilar(
  id: number,
  topN = 3,
  crossClass = false
): Promise<SimilarResponse> {
  const { data } = await api.get<SimilarResponse>(`/similar/${id}`, {
    params: { topN, crossClass },
  });
  return data;
}

// Health check
export async function healthCheck(): Promise<boolean> {
  try {
    await api.get("/health");
    return true;
  } catch {
    return false;
  }
}

export const CLASS_LABELS: Record<string, string> = {
  resume: "Resume / CV",
  invoice: "Invoice / Bill",
  research_paper: "Research Paper",
  lab_report: "Lab Report",
  college_notes: "College Notes",
};

export const CLASS_ICONS: Record<string, string> = {
  resume: "👤",
  invoice: "🧾",
  research_paper: "🔬",
  lab_report: "🧪",
  college_notes: "📚",
};

export const ALL_CLASSES = ["resume", "invoice", "research_paper", "lab_report", "college_notes"];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}
