from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel

app = FastAPI(title="Salam Resume DB API")

# Enable CORS so Next.js (port 3000) can communicate with FastAPI (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Response schema for candidates
class CandidateResult(BaseModel):
    id: str
    name: str
    title: str
    skills: List[str]
    experience_years: int
    location: str
    avatar_initials: str

# Mock database matching your UI screenshots
MOCK_CANDIDATES = [
    {
        "id": "1",
        "name": "Alex Morgan",
        "title": "Senior Software Engineer",
        "skills": ["Python", "AWS", "React", "Docker", "Node.js"],
        "experience_years": 8,
        "location": "Washington, DC",
        "avatar_initials": "AM"
    },
    {
        "id": "2",
        "name": "Jordan Lee",
        "title": "Cybersecurity Analyst",
        "skills": ["Cybersecurity", "Python", "SIEM", "Splunk", "Linux"],
        "experience_years": 5,
        "location": "Arlington, VA",
        "avatar_initials": "JL"
    },
    {
        "id": "3",
        "name": "Taylor Brooks",
        "title": "Data Analyst",
        "skills": ["SQL", "Python", "Power BI", "Tableau", "Excel"],
        "experience_years": 3,
        "location": "Fairfax, VA",
        "avatar_initials": "TB"
    },
    {
        "id": "4",
        "name": "Casey Rivera",
        "title": "Cloud Solutions Architect",
        "skills": ["AWS", "Azure", "Terraform", "Kubernetes"],
        "experience_years": 10,
        "location": "Remote",
        "avatar_initials": "CR"
    },
    {
        "id": "5",
        "name": "Sam Patel",
        "title": "IT Support Specialist",
        "skills": ["Networking", "Windows", "Linux", "Active Directory"],
        "experience_years": 2,
        "location": "Sterling, VA",
        "avatar_initials": "SP"
    }
]

@app.get("/")
def root():
    return {"status": "ok", "message": "Salam Resume DB API is running"}

@app.get("/api/candidates/search", response_model=List[CandidateResult])
def search_candidates(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    min_exp: Optional[int] = Query(None),
    max_exp: Optional[int] = Query(None),
    location: Optional[str] = Query(None),
    quick_skills: Optional[List[str]] = Query(None)
):
    results = MOCK_CANDIDATES

    # Filter by keyword (as-you-type)
    if q and q.strip():
        term = q.strip().lower()
        results = [
            c for c in results
            if term in c["name"].lower()
            or term in c["title"].lower()
            or any(term in skill.lower() for skill in c["skills"])
        ]

    # Filter by Quick Filter Skills
    if quick_skills:
        results = [
            c for c in results
            if any(qs.lower() in [s.lower() for s in c["skills"]] for qs in quick_skills)
        ]

    # Filter by Location
    if location and location.strip():
        loc_term = location.strip().lower()
        results = [c for c in results if loc_term in c["location"].lower()]

    # Filter by Experience
    if min_exp is not None:
        results = [c for c in results if c["experience_years"] >= min_exp]
    if max_exp is not None:
        results = [c for c in results if c["experience_years"] <= max_exp]

    return results