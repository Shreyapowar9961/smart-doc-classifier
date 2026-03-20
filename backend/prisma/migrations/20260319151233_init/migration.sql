-- CreateTable
CREATE TABLE "Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 0,
    "text" TEXT NOT NULL,
    "embedding" TEXT NOT NULL,
    "uploadDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "pageCount" INTEGER NOT NULL DEFAULT 1,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "manualOverride" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE INDEX "Document_class_idx" ON "Document"("class");

-- CreateIndex
CREATE INDEX "Document_uploadDate_idx" ON "Document"("uploadDate");
