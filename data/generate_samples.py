#!/usr/bin/env python3
"""
data/generate_samples.py
Smart Document Classifier — Fake Training Data Generator

Generates 50+ realistic text samples per class for training:
  - resume
  - invoice
  - research_paper
  - lab_report
  - college_notes

Outputs:
  data/processed/classification.csv  (text, label)
  data/processed/similarity.csv      (text1, text2, score)
  data/samples/<class>/sample_N.txt  (individual files)

Usage:
  python generate_samples.py
  python generate_samples.py --samples 100  # 100 per class
"""

import os
import csv
import random
import argparse
from itertools import combinations
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

random.seed(42)
np.random.seed(42)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROCESSED_DIR = os.path.join(SCRIPT_DIR, "processed")
SAMPLES_DIR = os.path.join(SCRIPT_DIR, "samples")
os.makedirs(PROCESSED_DIR, exist_ok=True)

CLASSES = ["resume", "invoice", "research_paper", "lab_report", "college_notes"]

parser = argparse.ArgumentParser()
parser.add_argument("--samples", type=int, default=60, help="Samples per class")
args = parser.parse_args()
N = args.samples

# ─── Template Generators ──────────────────────────────────────────────────────

NAMES = ["Arjun Sharma", "Priya Patel", "Rohan Gupta", "Sneha Iyer", "Vikram Nair",
         "Ananya Das", "Karthik Reddy", "Meera Joshi", "Rahul Verma", "Divya Kumar",
         "Amit Singh", "Pooja Mehta", "Suresh Pillai", "Neha Agarwal", "Ravi Bhat"]

COMPANIES = ["TechCorp India", "Infosys", "Wipro", "TCS", "HCL Technologies",
             "Accenture", "Cognizant", "Mphasis", "Mindtree", "L&T Infotech",
             "Capgemini", "IBM India", "Microsoft India", "Amazon India", "Flipkart"]

INSTITUTES = ["IIT Bombay", "IIT Delhi", "NIT Trichy", "BITS Pilani", "VIT Vellore",
               "Pune University", "Anna University", "Mumbai University", "IIIT Hyderabad",
               "Manipal Institute of Technology", "SRM University", "Amity University"]

SKILLS_POOL = [
    "Python", "Java", "C++", "JavaScript", "React", "Node.js", "SQL", "MongoDB",
    "Machine Learning", "Deep Learning", "TensorFlow", "Keras", "scikit-learn",
    "Data Analysis", "Pandas", "NumPy", "Tableau", "Power BI", "Git", "Docker",
    "Kubernetes", "AWS", "Azure", "Linux", "REST APIs", "GraphQL", "Django", "Flask"
]


def gen_resume() -> str:
    name = random.choice(NAMES)
    skills = random.sample(SKILLS_POOL, k=random.randint(6, 10))
    institute = random.choice(INSTITUTES)
    company1 = random.choice(COMPANIES)
    company2 = random.choice(COMPANIES)
    gpa = round(random.uniform(7.0, 9.8), 2)
    year = random.randint(2018, 2024)
    exp_years = random.randint(1, 5)
    
    return f"""
CURRICULUM VITAE

{name}
Email: {name.split()[0].lower()}.{name.split()[-1].lower()}@gmail.com
Phone: +91-{random.randint(7000000000, 9999999999)}
LinkedIn: linkedin.com/in/{name.split()[0].lower()}{name.split()[-1].lower()}
GitHub: github.com/{name.split()[0].lower()}{random.randint(100,999)}

OBJECTIVE
Motivated software engineer with {exp_years}+ years of experience in full-stack development
and machine learning. Seeking a challenging role at a dynamic organization to apply skills
in software development and contribute to innovative projects.

EDUCATION
Bachelor of Engineering in Computer Science
{institute}, {year - 4}–{year}
CGPA: {gpa}/10

SKILLS
Technical Skills: {', '.join(skills[:5])}
Tools & Technologies: {', '.join(skills[5:])}
Languages: English (Fluent), Hindi, {random.choice(['Marathi', 'Tamil', 'Telugu', 'Kannada'])}

WORK EXPERIENCE

Software Engineer | {company1} | {year}–Present
- Developed and maintained RESTful APIs using Python and Django framework
- Collaborated with cross-functional teams to deliver projects on time
- Improved system performance by {random.randint(20,50)}% through code optimization
- Mentored {random.randint(2,5)} junior developers and conducted code reviews

Intern | {company2} | {year - 1}–{year}
- Worked on machine learning models for predictive analytics
- Built data pipelines using Apache Spark and Pandas
- Created dashboards in Tableau for business intelligence reporting

PROJECTS
{random.choice(['Smart Traffic Management System', 'E-commerce Recommendation Engine', 'Hospital Management System'])}
- Built using {random.choice(skills)} and {random.choice(skills)}
- Achieved {random.randint(85,98)}% accuracy in predictions
- Deployed on {random.choice(['AWS EC2', 'Heroku', 'Google Cloud', 'Azure'])}

CERTIFICATIONS
- {random.choice(['AWS Certified Developer', 'Google Cloud Associate', 'Azure Fundamentals'])}
- {random.choice(['TensorFlow Developer Certificate', 'Oracle Java SE', 'Scrum Master'])}

ACHIEVEMENTS
- {random.choice(['Smart India Hackathon 2023 Finalist', 'Best Paper Award at IEEE Conference', 'Dean\'s List 2021-22'])}
- {random.choice(['CodeChef 3-star rated', 'LeetCode 500+ problems solved', 'Kaggle Expert'])}

REFERENCES
Available upon request
""".strip()


def gen_invoice() -> str:
    inv_no = f"INV-{random.randint(1000,9999)}"
    company = random.choice(COMPANIES)
    client = f"{random.choice(['ABC', 'XYZ', 'PQR', 'MNO'])} {random.choice(['Solutions', 'Technologies', 'Services', 'Enterprises'])} Pvt Ltd"
    date = f"{random.randint(1,28)}/{random.randint(1,12)}/2024"
    due = f"{random.randint(1,28)}/{random.randint(1,12)}/2024"
    
    items = []
    subtotal = 0
    for _ in range(random.randint(2,5)):
        desc = random.choice([
            "Software Development Services", "IT Consulting", "Cloud Infrastructure",
            "Data Analytics", "Machine Learning Implementation", "API Development",
            "Database Administration", "Security Audit", "Mobile App Development"
        ])
        qty = random.randint(1, 100)
        rate = random.choice([500, 1000, 1500, 2000, 2500, 5000])
        amount = qty * rate
        subtotal += amount
        items.append((desc, qty, rate, amount))
    
    tax_rate = random.choice([5, 12, 18])
    tax = subtotal * tax_rate / 100
    total = subtotal + tax
    
    item_rows = "\n".join([f"  {d:<40} {q:>5}    {r:>8}    {a:>10}" for d, q, r, a in items])
    
    return f"""
TAX INVOICE

INVOICE NUMBER: {inv_no}
Invoice Date: {date}
Due Date: {due}
Payment Terms: Net 30

FROM:
{company}
123, Tech Park, Whitefield
Bangalore - 560066, Karnataka, India
GSTIN: 29ABCDE1234F1Z5
Email: billing@{company.replace(' ', '').lower()}.com

BILL TO:
{client}
456, Business Hub, Andheri East
Mumbai - 400059, Maharashtra, India
GSTIN: 27XYZAB5678G2H6

DESCRIPTION OF SERVICES:
{'─'*70}
  Item Description                             Qty    Unit Rate      Amount
{'─'*70}
{item_rows}
{'─'*70}

SUBTOTAL:                                               INR {subtotal:>10,.2f}
GST @{tax_rate}%:                                               INR {tax:>10,.2f}
{'─'*70}
TOTAL AMOUNT DUE:                                       INR {total:>10,.2f}
{'─'*70}

PAYMENT DETAILS:
Bank: {random.choice(['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Mahindra'])}
Account Number: {random.randint(10000000000,99999999999)}
IFSC Code: {random.choice(['HDFC0001234', 'ICIC0005678', 'SBIN0009012', 'UTIB0003456'])}
Account Type: Current

NOTES:
1. Payment due within 30 days of invoice date.
2. Late payment will attract interest @{random.randint(1,3)}% per month.
3. Please quote invoice number in all correspondence.
4. This is a computer-generated invoice and does not require a signature.

Thank you for your business!
""".strip()


RESEARCH_TOPICS = [
    ("Deep Learning for Medical Image Segmentation", "Healthcare AI", "CNN, U-Net, MRI, segmentation"),
    ("Federated Learning for Privacy-Preserving ML", "Distributed AI", "privacy, gradient, federated"),
    ("Graph Neural Networks for Fraud Detection", "FinTech", "GNN, node classification, transactions"),
    ("Transformer Architecture for Code Generation", "NLP", "GPT, code synthesis, program generation"),
    ("Reinforcement Learning for Autonomous Vehicles", "Robotics", "reward, policy, self-driving"),
]

def gen_research_paper() -> str:
    topic, domain, keywords = random.choice(RESEARCH_TOPICS)
    author1 = random.choice(NAMES)
    author2 = random.choice(NAMES)
    institute = random.choice(INSTITUTES)
    year = random.randint(2021, 2024)
    
    return f"""
{topic.upper()}

{author1}¹, {author2}²
¹Department of Computer Science, {institute}
²Department of Data Science, {random.choice(INSTITUTES)}

Abstract—
This paper presents a novel approach to {topic.lower()} using state-of-the-art machine learning
techniques. We propose a framework that addresses key challenges in {domain} by leveraging
{keywords.split(',')[0].strip()} architectures. Experimental results on benchmark datasets demonstrate
that our method achieves superior performance compared to existing baselines, with an improvement
of {random.randint(3,15)}% in accuracy and {random.randint(10,40)}% reduction in computational overhead.
Our ablation study confirms the contribution of each component.

Keywords— {keywords}, neural networks, {domain.lower()}, benchmark evaluation

I. INTRODUCTION

The rapid advancement of artificial intelligence has enabled significant breakthroughs in {domain}.
Traditional approaches suffer from limitations including high computational cost, lack of scalability,
and poor generalization to unseen data. Recent works [1,2,3] have attempted to address these challenges
using deep learning, but remain constrained by data availability and model interpretability.

In this paper, we make the following contributions:
(1) We propose a novel {keywords.split(',')[0].strip()}-based architecture optimized for {domain}
(2) We introduce a training strategy that reduces overfitting by {random.randint(15,35)}%
(3) We conduct extensive experiments on {random.randint(3,6)} benchmark datasets
(4) We release our code and pre-trained models for reproducibility

II. RELATED WORK

Several approaches have been proposed for {topic.lower()}. Smith et al. [1] introduced a CNN-based
method achieving {random.randint(75,88)}% accuracy on standard benchmarks. Lee et al. [2] proposed
an attention mechanism that improves feature extraction but requires {random.randint(3,8)}x more
parameters. Wang et al. [3] applied transfer learning from ImageNet, achieving state-of-the-art
results on domain-specific tasks. Our work differs by addressing computational efficiency without
sacrificing performance.

III. METHODOLOGY

Our proposed framework consists of three main components:

A. Feature Extraction Module
We utilize a modified {random.choice(['ResNet-50', 'EfficientNet-B4', 'Vision Transformer', 'MobileNetV3'])}
backbone pre-trained on {random.choice(['ImageNet', 'JFT-300M', 'LAION-5B'])} for robust feature
extraction. The backbone is fine-tuned with a learning rate of {random.choice([1e-4, 5e-4, 1e-3])}.

B. Classification Head
A {random.randint(2,4)}-layer MLP with dropout (p={random.choice([0.3, 0.4, 0.5])}) is attached
to the backbone output. We use {random.choice(['ReLU', 'GELU', 'Swish'])} activations.

C. Training Objective
We optimize using {random.choice(['AdamW', 'SGD with Momentum', 'AdaFactor'])} with weight decay
{random.choice([1e-4, 1e-5, 5e-5])}. The loss function is cross-entropy combined with a
regularization term λ={random.choice([0.01, 0.001, 0.1])}.

IV. EXPERIMENTS

Datasets: We evaluate on {random.randint(2,4)} public benchmarks.
Implementation: PyTorch {random.choice(['1.12', '2.0', '2.1'])}, NVIDIA A100 GPU, batch size {random.choice([16,32,64])}.

Results: Our method achieves {random.uniform(87,97):.1f}% accuracy on the primary benchmark,
outperforming baselines by {random.randint(2,8)}%. Inference time is {random.randint(12,50)}ms per sample.

V. CONCLUSION

We presented a novel approach to {topic.lower()} demonstrating significant improvements over
state-of-the-art methods. Future work will explore {random.choice(['multi-modal inputs', 'real-time deployment', 'zero-shot generalization'])}.

REFERENCES
[1] A. Smith et al., "Deep Learning for {domain}," IEEE CVPR, {year-2}.
[2] B. Lee et al., "Attention Mechanisms in {keywords.split(',')[0].strip()}," NeurIPS, {year-1}.
[3] C. Wang et al., "Transfer Learning Survey," IEEE TPAMI, {year}.
""".strip()


LAB_EXPERIMENTS = [
    ("Verification of Ohm's Law", "Physics", "voltage, current, resistance"),
    ("Titration of Acids and Bases", "Chemistry", "molarity, equivalence point, pH"),
    ("Simple Harmonic Motion Analysis", "Physics", "oscillation, frequency, amplitude"),
    ("Enzyme Kinetics — Effect of Temperature on Amylase", "Biology", "enzyme, substrate, rate"),
    ("Digital Logic Gate Verification", "Electronics", "AND, OR, NOT, truth table"),
    ("Stack Implementation using Arrays", "Data Structures", "push, pop, overflow, underflow"),
    ("Transistor as a Switch", "Electronics", "BJT, saturation, cut-off, collector"),
]

def gen_lab_report() -> str:
    exp_name, subject, keywords = random.choice(LAB_EXPERIMENTS)
    student = random.choice(NAMES)
    roll_no = f"20{random.randint(1000,9999)}"
    batch = random.choice(["A1", "A2", "B1", "B2", "C1", "C2"])
    date = f"{random.randint(1,28)}/{random.randint(1,12)}/2024"
    
    readings = [(i+1, round(random.uniform(1,10),2), round(random.uniform(1,10),2)) 
                for i in range(random.randint(5,8))]
    
    table = "\n".join([f"    {r[0]}         {r[1]}          {r[2]}" for r in readings])
    
    return f"""
LABORATORY REPORT

Experiment Name: {exp_name}
Subject: {subject} Lab
Student Name: {student}
Roll Number: {roll_no}
Batch: {batch}
Date of Experiment: {date}
Date of Submission: {date}

AIM / OBJECTIVE:
To verify and study {exp_name.lower()} and to understand the relationship between
{keywords.split(',')[0].strip()} and {keywords.split(',')[1].strip()} under controlled conditions.

THEORY / BACKGROUND:
{exp_name} is a fundamental concept in {subject}. According to the theoretical framework,
{keywords.split(',')[0].strip()} is directly proportional to {keywords.split(',')[1].strip()}
when {keywords.split(',')[2].strip()} remains constant. This relationship can be expressed
mathematically and verified through controlled experimentation.

APPARATUS / MATERIALS REQUIRED:
1. {random.choice(['Power supply (0-30V)', 'Beaker (500mL)', 'Oscilloscope', 'Voltmeter'])}
2. {random.choice(['Connecting wires', 'Burette (50mL)', 'Spring balance', 'Breadboard'])}
3. {random.choice(['Resistors (various values)', 'Standard solution (0.1M)', 'Masses', 'IC 7408'])}
4. {random.choice(['Multimeter', 'pH meter', 'Stopwatch', 'Function generator'])}
5. {random.choice(['Rheostat', 'Conical flask', 'Pendulum bob', 'LED indicators'])}

PROCEDURE:
1. Set up the apparatus as shown in the circuit/experimental diagram.
2. Ensure all connections are secure and the circuit is properly grounded.
3. Gradually vary {keywords.split(',')[0].strip()} from minimum to maximum range.
4. For each setting, record the corresponding {keywords.split(',')[1].strip()}.
5. Repeat each reading {random.randint(2,4)} times to minimize random errors.
6. Tabulate all observations carefully.
7. Plot the graph of {keywords.split(',')[0].strip()} vs {keywords.split(',')[1].strip()}.

OBSERVATIONS:

    S.No.     {keywords.split(',')[0].strip():<15} {keywords.split(',')[1].strip():<15}
    {'─'*40}
{table}

CALCULATIONS:
Mean value = {round(np.mean([r[2] for r in readings]), 3)}
Standard Deviation = {round(np.std([r[2] for r in readings]), 3)}
Percentage Error = {round(random.uniform(0.5, 4.5), 2)}%

GRAPH:
A graph of {keywords.split(',')[0].strip()} vs {keywords.split(',')[1].strip()} was plotted.
The graph shows a {random.choice(['linear', 'hyperbolic', 'sinusoidal', 'logarithmic'])} relationship,
confirming the theoretical prediction.

RESULT:
The experiment successfully verified {exp_name}. The experimentally obtained value of
{keywords.split(',')[2].strip()} = {round(random.uniform(1,100), 3)} {random.choice(['Ω', 'mol/L', 'N/m', 'Hz'])}
The theoretical value = {round(random.uniform(1,100), 3)}
Percentage error = {round(random.uniform(0.1, 5.0), 2)}%

SOURCES OF ERROR:
1. Instrumental errors due to limited precision of measuring instruments
2. Random errors due to fluctuations in {keywords.split(',')[0].strip()}
3. Human parallax error during reading
4. Contact resistance in connections (for electrical experiments)

CONCLUSION:
The experiment was performed successfully. The results confirm the theoretical relationship
between {keywords.split(',')[0].strip()} and {keywords.split(',')[1].strip()}. The percentage
error of {round(random.uniform(0.1, 5.0), 2)}% is within acceptable limits, indicating accurate
experimental technique.

PRECAUTIONS:
1. All readings were taken after the instrument had stabilized.
2. The experiment was conducted under constant room temperature ({random.randint(22,28)}°C).
3. All glassware was cleaned and dried before use.

Signature of Student: _______________     Signature of Lab Instructor: _______________
""".strip()


COLLEGE_SUBJECTS = [
    ("Operating Systems", "Unit 3: Process Management", "process, thread, scheduling, deadlock"),
    ("Data Structures and Algorithms", "Unit 2: Trees and Graphs", "binary tree, BFS, DFS, traversal"),
    ("Database Management Systems", "Unit 4: SQL and Transactions", "SQL, ACID, transaction, normalization"),
    ("Computer Networks", "Unit 5: Transport Layer", "TCP, UDP, socket, congestion control"),
    ("Machine Learning", "Unit 6: Neural Networks", "perceptron, backpropagation, gradient descent"),
    ("Software Engineering", "Unit 3: Design Patterns", "MVC, singleton, factory, observer"),
]

def gen_college_notes() -> str:
    subject, unit, keywords = random.choice(COLLEGE_SUBJECTS)
    topic1, topic2, topic3 = keywords.split(",")[:3]
    kw_list = keywords.split(",")
    
    return f"""
{subject.upper()} — LECTURE NOTES
{unit}
Date: {random.randint(1,28)}/{random.randint(1,12)}/2024

{'='*60}
CHAPTER OVERVIEW
{'='*60}

This unit covers fundamental concepts of {topic1.strip()} in the context of {subject.lower()}.
By the end of this unit, students should be able to:
• Explain the concept of {kw_list[0].strip()} and its significance
• Differentiate between {kw_list[1].strip()} and {kw_list[2].strip()}
• Apply theoretical concepts to solve problems
• Analyze real-world scenarios involving {kw_list[0].strip()}

{'─'*60}
TOPIC 1: INTRODUCTION TO {kw_list[0].strip().upper()}
{'─'*60}

Definition:
A {kw_list[0].strip()} is defined as {random.choice([
    'an abstract data structure that maintains a hierarchical relationship',
    'a mechanism for managing shared resources in a concurrent environment',
    'a protocol that ensures reliable data transmission over unreliable channels',
    'an algorithm that systematically explores nodes in a graph structure'
])}.

Key Properties:
1. {random.choice(['Efficiency', 'Correctness', 'Completeness'])} — must satisfy all {kw_list[0].strip()} requirements
2. {random.choice(['Scalability', 'Reliability', 'Consistency'])} — performance under increasing load
3. {random.choice(['Atomicity', 'Durability', 'Isolation'])} — behavior in failure scenarios

Example:
Consider a system with {random.randint(3,8)} processes/nodes. The {kw_list[0].strip()} operates
as follows:
Step 1: Initialize the {kw_list[0].strip()} with default parameters
Step 2: Apply {kw_list[1].strip()} to determine priority/order
Step 3: Execute the operation while maintaining {kw_list[2].strip()} invariants
Step 4: Verify correctness using post-conditions

{'─'*60}
TOPIC 2: {kw_list[1].strip().upper()} VS {kw_list[2].strip().upper()}
{'─'*60}

Comparison Table:
┌─────────────────┬───────────────────────┬───────────────────────┐
│ Parameter        │ {kw_list[1].strip():<21} │ {kw_list[2].strip():<21} │
├─────────────────┼───────────────────────┼───────────────────────┤
│ Complexity      │ O(n log n)            │ O(n²)                 │
│ Space           │ O(n)                  │ O(1)                  │
│ Use Case        │ Large datasets        │ Small datasets        │
│ Stability       │ Stable                │ Not stable            │
└─────────────────┴───────────────────────┴───────────────────────┘

Important Note: {kw_list[1].strip()} is preferred when {random.choice([
    'memory is not a constraint and speed is critical',
    'data is already partially sorted',
    'stability of equal elements must be preserved'
])}.

{'─'*60}
TOPIC 3: ALGORITHMS & COMPLEXITY ANALYSIS
{'─'*60}

Algorithm — {kw_list[0].strip().title()}:
```
function {kw_list[0].strip().replace(' ','_')}(input):
    if input is empty:
        return null
    
    result = initialize()
    for each element in input:
        process(element)
        update(result)
    
    return result
```

Time Complexity: O({random.choice(['n log n', 'n²', 'n', 'log n', '1'])})
Space Complexity: O({random.choice(['n', 'log n', '1', 'n²'])})
Best Case: O({random.choice(['n', 'log n', '1'])})
Worst Case: O({random.choice(['n²', 'n log n', 'n'])})

{'─'*60}
PRACTICE QUESTIONS
{'─'*60}

1. [2 marks] Define {kw_list[0].strip()} and list its properties.

2. [4 marks] Compare and contrast {kw_list[1].strip()} with {kw_list[2].strip()} using suitable examples.

3. [6 marks] Given a scenario with {random.randint(3,7)} concurrent operations, trace the execution
   of {kw_list[0].strip()} step by step.

4. [8 marks] Design an efficient algorithm using {kw_list[0].strip()} for the following problem:
   [Problem description with constraints and expected output]

5. [Previous Year Question 2022] Explain the trade-offs between {kw_list[1].strip()} and
   {kw_list[2].strip()}. When would you choose one over the other? (8 marks)

{'─'*60}
IMPORTANT FORMULAE
{'─'*60}

1. Efficiency = (Useful Work Done) / (Total Resources Used)
2. Throughput = (Number of Processes Completed) / (Time Period)  
3. Waiting Time = Completion Time - Burst Time - Arrival Time
4. Turnaround Time = Completion Time - Arrival Time

{'─'*60}
REFERENCES
{'─'*60}

1. Silberschatz, Galvin, Gagne — "{subject}", 10th Edition, Wiley
2. NPTEL Video Lectures — {subject} by Prof. {random.choice(NAMES)}, IIT {random.choice(['Delhi', 'Bombay', 'Madras'])}
3. GeeksForGeeks — {kw_list[0].strip()} tutorials
4. Previous year question papers — {random.choice(INSTITUTES)} {random.randint(2018,2023)}
""".strip()


# ─── Main Generator ───────────────────────────────────────────────────────────
GENERATORS = {
    "resume": gen_resume,
    "invoice": gen_invoice,
    "research_paper": gen_research_paper,
    "lab_report": gen_lab_report,
    "college_notes": gen_college_notes,
}

print(f"\n{'='*60}")
print("📝 Smart Document Classifier — Sample Generator")
print(f"{'='*60}\n")
print(f"Generating {N} samples per class ({N * len(CLASSES)} total)...\n")

all_samples = []

for cls in CLASSES:
    cls_dir = os.path.join(SAMPLES_DIR, cls)
    os.makedirs(cls_dir, exist_ok=True)
    gen_fn = GENERATORS[cls]
    
    for i in range(N):
        text = gen_fn()
        all_samples.append({"text": text, "label": cls})
        
        # Save individual file
        filepath = os.path.join(cls_dir, f"sample_{i+1:03d}.txt")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(text)
    
    print(f"  ✅ {cls:<20} {N} samples generated → samples/{cls}/")

# Shuffle
random.shuffle(all_samples)

# ─── Save classification.csv ─────────────────────────────────────────────────
clf_path = os.path.join(PROCESSED_DIR, "classification.csv")
with open(clf_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["text", "label"])
    writer.writeheader()
    writer.writerows(all_samples)
print(f"\n💾 Saved: data/processed/classification.csv ({len(all_samples)} rows)")

# ─── Generate similarity.csv ─────────────────────────────────────────────────
print("\n🔄 Computing similarity scores for similarity.csv...")

# Sample pairs: 5 same-class pairs + 5 cross-class pairs per class
sim_samples = []
texts = [s["text"] for s in all_samples]
labels = [s["label"] for s in all_samples]

# TF-IDF cosine similarity for ground truth
tfidf = TfidfVectorizer(max_features=5000, ngram_range=(1,2))
try:
    X_tfidf = tfidf.fit_transform(texts[:200])  # sample 200 for speed
    texts_sample = texts[:200]
    labels_sample = labels[:200]
    
    for i in range(min(50, len(texts_sample))):
        for j in range(i+1, min(i+10, len(texts_sample))):
            score = float(cosine_similarity(X_tfidf[i], X_tfidf[j])[0][0])
            sim_samples.append({
                "text1": texts_sample[i][:500],
                "text2": texts_sample[j][:500],
                "score": round(score, 4),
                "label1": labels_sample[i],
                "label2": labels_sample[j],
                "same_class": labels_sample[i] == labels_sample[j],
            })

    sim_path = os.path.join(PROCESSED_DIR, "similarity.csv")
    with open(sim_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["text1", "text2", "score", "label1", "label2", "same_class"])
        writer.writeheader()
        writer.writerows(sim_samples[:500])
    
    print(f"💾 Saved: data/processed/similarity.csv ({len(sim_samples[:500])} pairs)")
except Exception as e:
    print(f"⚠️  Similarity CSV skipped: {e}")

print(f"\n{'='*60}")
print("✅ Data generation complete!")
print(f"   Total samples: {len(all_samples)}")
print(f"   Per class: {N}")
print(f"   Files in: data/samples/ and data/processed/")
print(f"\nNext step: cd ml && python train.py")
print(f"{'='*60}\n")
