<<<<<<< HEAD
# Smart Document Classifier & Semantic Similarity Analyzer

> A production-ready full-stack AI/ML mini-project for 3rd-year CS/Data Science students.

![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Node.js%20%7C%20Python%20%7C%20SQLite-blue)
![Offline](https://img.shields.io/badge/Mode-Fully%20Offline-green)
![Classes](https://img.shields.io/badge/Classes-5%20Document%20Types-orange)

---

## 🎯 What This Project Does

Upload any PDF or image → the system automatically:
1. **Extracts text** using Tesseract OCR (fully local)
2. **Classifies** the document into one of 5 categories using ML
3. **Computes similarity** against all stored docs using BERT embeddings
4. **Saves** the file to a class-specific folder
5. **Returns** path, confidence score, and top-3 similar documents

---

## 📁 Folder Structure

```
smart-doc-classifier/
├── frontend/                    # Next.js 14 app
│   ├── app/
│   │   ├── page.tsx            # Home (upload)
│   │   ├── history/page.tsx    # Upload history
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── UploadZone.tsx      # Drag-drop uploader
│   │   ├── ResultsPanel.tsx    # Classification results
│   │   ├── SimilarityTable.tsx # Top-3 similar docs table
│   │   ├── HistoryList.tsx     # Paginated history
│   │   └── Header.tsx
│   └── lib/api.ts              # Axios API client
│
├── backend/                     # Node.js + Express
│   ├── server.js               # Main server
│   ├── routes/
│   │   ├── upload.js           # POST /upload/classify
│   │   ├── history.js          # GET /history
│   │   └── similar.js          # GET /similar/:id
│   ├── prisma/
│   │   └── schema.prisma       # SQLite schema
│   ├── scripts/
│   │   └── classify.py         # 🐍 ML pipeline (OCR+classify+embed)
│   └── uploads/                # Auto-organized by class
│       ├── resume/
│       ├── invoice/
│       ├── research_paper/
│       ├── lab_report/
│       └── college_notes/
│
├── ml/                          # Python ML pipeline
│   ├── train.py                # Train classifier
│   ├── classify.py             # Inference script (called by backend)
│   ├── evaluate.py             # Accuracy eval
│   ├── models/                 # Saved model artifacts
│   │   ├── classifier.pkl      # TF-IDF + LogReg model
│   │   └── tfidf.pkl           # Vectorizer
│   └── notebooks/
│       └── EDA_and_Training.ipynb
│
├── data/
│   ├── generate_samples.py     # Fake data generator (50/class)
│   ├── download_rvlcdip.py     # RVL-CDIP subset downloader
│   ├── samples/                # 50 fake samples per class
│   └── processed/
│       ├── classification.csv  # text, label
│       └── similarity.csv      # text1, text2, score
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.ml
│   └── docker-compose.yml
│
└── README.md
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- Python 3.10+
- Tesseract OCR installed
- poppler-utils (for PDF processing)

### 1. Install Tesseract
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr poppler-utils

# macOS
brew install tesseract poppler

# Windows
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
node server.js
# Runs on http://localhost:4000
```

### 3. ML Setup
```bash
cd ml
pip install -r requirements.txt
python ../data/generate_samples.py    # Generate training data
python train.py                        # Train classifier (~2 min)
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

---

## 🌐 Deployment

### Vercel (Frontend)
```bash
cd frontend
vercel deploy
# Set env: NEXT_PUBLIC_API_URL=https://your-backend.render.com
```

### Render (Backend)
1. Connect GitHub repo to Render
2. Set build command: `npm install && npx prisma migrate deploy`
3. Set start command: `node server.js`
4. Add env: `DATABASE_URL=file:./dev.db`

### Docker (Full Stack)
```bash
docker-compose -f docker/docker-compose.yml up --build
```

---

## 🤖 ML Architecture

```
Input (PDF/Image)
       ↓
  Tesseract OCR
       ↓
  Extracted Text
       ↓
  ┌────────────────────────────────┐
  │         ML Pipeline            │
  │  TF-IDF Vectorizer             │
  │  → LogisticRegression          │
  │  → class + confidence          │
  │                                │
  │  all-MiniLM-L6-v2 Embeddings  │
  │  → 384-dim vector              │
  │  → cosine similarity vs DB    │
  └────────────────────────────────┘
       ↓
  JSON Output: {class, confidence, embedding, top_similar}
```

### Why TF-IDF + LogReg?
- Trains in <30 seconds on CPU
- 90%+ accuracy on 5-class document classification
- No GPU required
- Deterministic inference
- Easy to retrain with new data

### Embeddings: all-MiniLM-L6-v2
- 384-dim sentence embeddings
- ~80MB model download (once)
- Cosine similarity for semantic matching
- Works offline after first download

---

## 📊 Dataset

### RVL-CDIP Subset
- Source: `aharley/rvl_cdip` on HuggingFace
- Classes mapped: letter→resume, invoice→invoice, scientific_report→research_paper
- Download script: `data/download_rvlcdip.py`

### Generated Samples
- 50 fake documents per class
- Run: `python data/generate_samples.py`
- Stored in `data/samples/`

---

## 🔌 API Reference

### POST /upload/classify
```json
// Request: multipart/form-data
{ "file": <PDF or image>, "manualClass": "resume" (optional) }

// Response
{
  "id": 1,
  "filename": "resume_john.pdf",
  "path": "uploads/resume/resume_john.pdf",
  "class": "resume",
  "confidence": 0.94,
  "topSimilar": [
    { "id": 3, "filename": "cv_jane.pdf", "score": 0.87 },
    { "id": 7, "filename": "resume_2023.pdf", "score": 0.81 }
  ]
}
```

### GET /history?page=1&limit=10
```json
{
  "docs": [...],
  "total": 47,
  "page": 1,
  "totalPages": 5
}
```

### GET /similar/:id
```json
{
  "document": { "id": 5, "filename": "...", "class": "invoice" },
  "similar": [
    { "id": 2, "filename": "inv_2024.pdf", "score": 0.91 },
    ...
  ]
}
```

### DELETE /history/:id
```json
{ "success": true, "message": "Document deleted" }
```

---

## 🎓 For Students — Learning Outcomes

After building this project you'll understand:
- **OCR**: Text extraction from real-world documents
- **NLP**: TF-IDF vectorization, document classification
- **Semantic Search**: Dense embeddings + cosine similarity
- **REST API Design**: File upload, DB integration, response schemas
- **Full-Stack**: React ↔ Node.js ↔ Python inter-process communication
- **Database**: Prisma ORM, SQLite, schema design
- **DevOps**: Docker, Vercel/Render deployment

---

## 📈 Expected Performance
| Metric | Target |
|--------|--------|
| Classification accuracy | ≥90% |
| OCR speed (A4 PDF) | <5 sec |
| Embedding + similarity | <2 sec |
| API response time | <10 sec total |
| DB capacity | 1000+ docs |

---

## 🧩 Stretch Goals
- [ ] Fine-tune DistilBERT for higher accuracy
- [ ] Add confidence threshold alerts
- [ ] Export history to CSV
- [ ] Multi-language OCR
- [ ] Dark mode UI
- [ ] PWA support (offline caching)
=======
# smart-doc-classifier
SmartDocClassifier - AI full-stack app: OCR extraction, ML doc classification, BERT semantic similarity. Next.js UI, Node backend, Prisma DB. Offline-ready, Vercel deploy. For research paper novelty detection!
>>>>>>> ce5708e664ac44909086cb136e35492693f93dfc
