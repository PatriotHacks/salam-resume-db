from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, func, cast, String
from typing import List, Optional
from pydantic import BaseModel

# Database setup imports (adjust according to your project structure)
from app.db import get_db
from app.models import Candidate, CandidateProfile

router = APIRouter()

# Schema for the frontend response
class CandidateSearchResult(BaseModel):
    id: str
    name: str
    title: str
    skills: List[str]
    experience_years: int
    location: str
    avatar_initials: str

@router.get("/candidates/search", response_model=List[CandidateSearchResult])
def search_candidates(
    q: Optional[str] = Query(None, description="Search term (name, skill, title, cert)"),
    category: Optional[str] = Query(None),
    min_exp: Optional[int] = Query(None),
    max_exp: Optional[int] = Query(None),
    location: Optional[str] = Query(None),
    quick_skills: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(CandidateProfile).join(Candidate)

    # 1. Dynamic Keyword Search ("As-you-type" matching)
    if q and q.strip():
        search_term = f"%{q.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(Candidate.name).like(search_term),
                func.lower(CandidateProfile.title).like(search_term),
                # Search array of skills converted to text string
                func.lower(cast(CandidateProfile.skills, String)).like(search_term),
                func.lower(cast(CandidateProfile.certifications, String)).like(search_term)
            )
        )

    # 2. Filter by Experience Range
    if min_exp is not None:
        query = query.filter(CandidateProfile.total_years_exp >= min_exp)
    if max_exp is not None:
        query = query.filter(CandidateProfile.total_years_exp <= max_exp)

    # 3. Filter by Location
    if location and location.strip():
        query = query.filter(func.lower(Candidate.location).like(f"%{location.strip().lower()}%"))

    # 4. Filter by Quick Skill Badges (e.g., ["Python", "AWS"])
    if quick_skills:
        for skill in quick_skills:
            query = query.filter(CandidateProfile.skills.any(skill))

    results = query.limit(50).all()

    # Format output to match frontend structure
    output = []
    for p in results:
        initials = "".join([n[0] for n in p.candidate.name.split() if n])[:2].upper()
        output.append({
            "id": p.candidate_id,
            "name": p.candidate.name,
            "title": p.title or "Unspecified",
            "skills": p.skills or [],
            "experience_years": p.total_years_exp or 0,
            "location": p.candidate.location or "N/A",
            "avatar_initials": initials
        })

    return output