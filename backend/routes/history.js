// backend/routes/history.js
// GET /history — paginated document history
// DELETE /history/:id — delete a document

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// GET /history?page=1&limit=10&class=resume&search=report
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const classFilter = req.query.class || null;
    const search = req.query.search || null;

    // Build filter
    const where = {};
    if (classFilter && classFilter !== "all") where.class = classFilter;
    if (search) {
      where.OR = [
        { originalName: { contains: search } },
        { text: { contains: search } },
      ];
    }

    const [docs, total] = await Promise.all([
      prisma.document.findMany({
        where,
        select: {
          id: true,
          filename: true,
          originalName: true,
          path: true,
          class: true,
          confidence: true,
          fileSize: true,
          pageCount: true,
          uploadDate: true,
          manualOverride: true,
          mimeType: true,
        },
        orderBy: { uploadDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.document.count({ where }),
    ]);

    // Class distribution (for stats widget)
    const classCounts = await prisma.document.groupBy({
      by: ["class"],
      _count: { class: true },
    });

    res.json({
      docs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      stats: {
        total,
        byClass: Object.fromEntries(
          classCounts.map((c) => [c.class, c._count.class])
        ),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /history/:id — single document details
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid document ID" });

    const doc = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        filename: true,
        originalName: true,
        path: true,
        class: true,
        confidence: true,
        text: true,
        fileSize: true,
        pageCount: true,
        uploadDate: true,
        manualOverride: true,
        mimeType: true,
      },
    });

    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

// DELETE /history/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid document ID" });

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Delete physical file
    const filePath = path.join(__dirname, "..", doc.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted file: ${doc.path}`);
    }

    // Delete DB record
    await prisma.document.delete({ where: { id } });

    res.json({ success: true, message: `Document "${doc.originalName}" deleted.` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
