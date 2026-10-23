# Salam Resume Database

A searchable, performant library of resumes for **Salam Consulting**.
Recruiters can search and filter candidates in real time, and (soon) run job-description matching to get the **top 5 candidates with % fit scores**.

Built as part of **PatriotHacks × CS Club** at George Mason University’s BitLab.

---

## Features (Current)

### Candidate Search & Filter (Live)
- **As-you-type search** across name, job title, skills, and certifications
- **Debounced input** (250ms) so the API is not hit on every keystroke
- **Quick filter pills**: Cybersecurity, Python, AWS, SQL
- **Dropdown filters**: skill category, years of experience
- **Location filter**
- Results table with avatar initials, skill chips, experience, location, and “View Profile”

### Backend API
- FastAPI service on port `8000`
- `GET /api/candidates/search` with query params: `q`, `min_exp`, `max_exp`, `location`, `quick_skills`
- CORS enabled for local Next.js frontend
- Mock candidate data (5 sample profiles) for development

---

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+ (3.13 works)
- **Git**

---

## How to Run Locally

You need **two terminals**.

### Terminal 1 — Backend (Port 8000)

```bash
cd backend
source venv/bin/activate

# Important: run from the backend/ folder (not backend/app/)
uvicorn app.main:app --reload --port 8000

API Status Check: http://127.0.0.1:8000
Swagger API Docs: http://127.0.0.1:8000/docs

### Terminal 2 — Frontend (Port 3000)

Bash

cd frontend
npm run dev
Open http://localhost:3000 in your browser



## Project Structure

```text
salam-resume-db/
├── backend/                 # FastAPI + Python
│   ├── app/
│   │   ├── main.py          # API entrypoint + search endpoint
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── workers/
│   ├── requirements.txt
│   └── venv/
├── frontend/                # Next.js + TypeScript + Tailwind
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   │   └── candidates/
│   │   │       └── CandidateSearch.tsx
│   │   ├── hooks/
│   │   │   └── useDebounce.ts
│   │   └── lib/
│   └── package.json
├── docs/                    # Specs / PDFs
├── prototypes/              # Original HTML mockups (reference only)
└── README.md
