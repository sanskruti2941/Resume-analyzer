# Intelligent Resume & Career Advisor

A full-stack AI-powered resume analysis system built with React, Node.js/Express, and Supabase.

## Features
- PDF resume upload and text extraction
- Skill detection from a predefined skills list
- Resume scoring (out of 100)
- Job description matching using TF-IDF + cosine similarity
- Career role recommendations
- Learning path suggestions

---

## Project Structure

```
resume-advisor/
├── backend/
│   ├── server.js
│   ├── .env.example
│   ├── package.json
│   ├── routes/
│   │   ├── upload.js     → POST /upload
│   │   ├── analyze.js    → POST /analyze
│   │   └── match.js      → POST /match
│   └── utils/
│       ├── nlp.js        → All AI/NLP logic
│       └── supabase.js   → DB client
├── frontend/
│   ├── package.json
│   ├── public/index.html
│   └── src/
│       ├── App.js
│       ├── App.css
│       ├── index.js
│       └── components/
│           ├── UploadSection.js
│           ├── ResultsPanel.js
│           └── JobMatcher.js
└── supabase_setup.sql
```

---

## Setup Instructions

### 1. Supabase Setup (Optional but recommended)

1. Go to https://app.supabase.com and create a free project
2. Open the SQL Editor and paste the contents of `supabase_setup.sql`, then run it
3. Go to Project Settings → API and copy:
   - Project URL
   - anon/public key

### 2. Backend Setup

```bash
cd resume-advisor/backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
PORT=5000
```

> Note: If you skip Supabase, the app still works — database saving is just disabled.

Start the backend:
```bash
npm run dev     # with auto-reload (nodemon)
# or
npm start       # without auto-reload
```

Backend runs at: http://localhost:5000

### 3. Frontend Setup

```bash
cd resume-advisor/frontend

# Install dependencies
npm install

# Start the app
npm start
```

Frontend runs at: http://localhost:3000

The frontend proxies API calls to `http://localhost:5000` automatically (configured in package.json).

---

## API Endpoints

| Method | Route      | Description                        |
|--------|------------|------------------------------------|
| POST   | /upload    | Upload PDF, returns extracted text |
| POST   | /analyze   | Analyze text: skills, score, careers |
| POST   | /match     | Compare resume with job description |

---

## How It Works

### Skill Extraction
Matches resume text against a predefined list of 40+ tech skills using regex word boundaries.

### Resume Scoring (0–100)
- Skill coverage: up to 60 pts
- Resume sections (experience, education, etc.): up to 25 pts
- Content length: up to 15 pts

### Job Matching (TF-IDF + Cosine Similarity)
1. Tokenizes both resume and job description
2. Builds term frequency vectors
3. Computes cosine similarity → match percentage

### Career Recommendations
Maps detected skills to roles (Data Scientist, Frontend Dev, etc.) based on skill overlap.
