#!/usr/bin/env python3
"""
data/download_rvlcdip.py
Download and filter RVL-CDIP subset from HuggingFace

Maps RVL-CDIP classes to our 5 classes:
  letter       → resume
  invoice      → invoice
  scientific_report → research_paper
  (others filtered out)

Usage:
  pip install datasets huggingface_hub
  python download_rvlcdip.py
  python download_rvlcdip.py --samples 200  # 200 per class
"""

import os
import csv
import argparse
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "processed")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# RVL-CDIP label index → our class name (None = skip)
RVL_TO_OUR = {
    0:  "college_notes",   # letter
    1:  "resume",          # form (close enough)
    2:  "invoice",         # email → skip
    3:  None,              # handwritten
    4:  None,              # advertisement
    5:  None,              # scientific_publication (no OCR)
    6:  "research_paper",  # scientific_report
    7:  None,              # specification
    8:  None,              # file folder
    9:  None,              # news article
    10: "invoice",         # budget → invoice
    11: "invoice",         # invoice
    12: "lab_report",      # presentation
    13: None,              # questionnaire
    14: "resume",          # resume
    15: None,              # memo
}

parser = argparse.ArgumentParser()
parser.add_argument("--samples", type=int, default=100, help="Max samples per class")
args = parser.parse_args()

print(f"\n{'='*60}")
print("📥 RVL-CDIP Dataset Downloader")
print(f"{'='*60}\n")

try:
    from datasets import load_dataset
    import pytesseract
    from PIL import Image
except ImportError as e:
    print(f"❌ Missing: {e}")
    print("   pip install datasets pytesseract Pillow")
    sys.exit(1)

print("⏳ Loading RVL-CDIP from HuggingFace (may take a while on first run)...")
print("   Source: aharley/rvl_cdip\n")

try:
    dataset = load_dataset("aharley/rvl_cdip", split="train", streaming=True)
except Exception as e:
    print(f"❌ Failed to load dataset: {e}")
    print("   Check internet connection and HuggingFace access.")
    sys.exit(1)

# Counters
counts = {cls: 0 for cls in ["resume", "invoice", "research_paper", "lab_report", "college_notes"]}
target = args.samples
all_rows = []

print(f"🔄 Extracting {target} samples per class using OCR...")
print("   (This may take 10-30 minutes depending on your machine)\n")

for item in dataset:
    label_idx = item.get("label", -1)
    our_class = RVL_TO_OUR.get(label_idx)
    
    if our_class is None or counts.get(our_class, 0) >= target:
        continue
    
    # Check if all classes are complete
    if all(v >= target for v in counts.values()):
        break
    
    try:
        # Extract text via OCR
        img = item["image"]
        if img.mode != "RGB":
            img = img.convert("RGB")
        text = pytesseract.image_to_string(img, config="--psm 3")
        text = text.strip()
        
        if len(text) < 50:  # skip blank images
            continue
        
        all_rows.append({"text": text[:5000], "label": our_class})
        counts[our_class] += 1
        
        total_so_far = sum(counts.values())
        if total_so_far % 10 == 0:
            print(f"   Progress: {counts}")
            
    except Exception as e:
        continue

# ─── Save ─────────────────────────────────────────────────────────────────────
out_path = os.path.join(OUTPUT_DIR, "rvlcdip_subset.csv")
with open(out_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["text", "label"])
    writer.writeheader()
    writer.writerows(all_rows)

print(f"\n✅ RVL-CDIP subset saved: {out_path}")
print(f"   Total samples: {len(all_rows)}")
print(f"   Per class: {counts}")
print(f"\n💡 Tip: Combine with generated samples for best results:")
print(f"   python generate_samples.py")
print(f"   Then merge both CSVs and run: cd ../ml && python train.py\n")
