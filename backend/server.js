// backend/server.js
// Smart Document Classifier — Express Server

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const uploadRouter = require("./routes/upload");
const historyRouter = require("./routes/history");
const similarRouter = require("./routes/similar");

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Ensure upload directories exist ───────────────────────────────────────
const CLASSES = ["resume", "invoice", "research_paper", "lab_report", "college_notes"];
CLASSES.forEach((cls) => {
  const dir = path.join(__dirname, "uploads", cls);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created: uploads/${cls}/`);
  }
});

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://*.vercel.app",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use("/upload", uploadRouter);
app.use("/history", historyRouter);
app.use("/similar", similarRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    classes: CLASSES,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ─── Start server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Smart Doc Classifier API running on http://localhost:${PORT}`);
  console.log(`📂 Upload folders ready in ./uploads/`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL || "file:./dev.db"}`);
  console.log(`🌐 CORS enabled for: http://localhost:3000\n`);
});

module.exports = app;
