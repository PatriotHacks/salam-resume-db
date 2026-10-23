"use client";

import React, { useState, useEffect } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface Candidate {
  id: string;
  name: string;
  title: string;
  skills: string[];
  experience_years: number;
  location: string;
  avatar_initials: string;
}

export default function CandidateSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [experienceFilter, setExperienceFilter] = useState("Any");
  const [locationInput, setLocationInput] = useState("");
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>([]);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 250);
  const debouncedLocation = useDebounce(locationInput, 250);

  const quickFilterOptions = ["Cybersecurity", "Python", "AWS", "SQL"];

  const toggleQuickFilter = (skill: string) => {
    setSelectedQuickFilters((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();

        if (debouncedSearch) params.append("q", debouncedSearch);
        if (category !== "All") params.append("category", category);
        if (debouncedLocation) params.append("location", debouncedLocation);

        if (experienceFilter === "0-2") {
          params.append("max_exp", "2");
        } else if (experienceFilter === "3-5") {
          params.append("min_exp", "3");
          params.append("max_exp", "5");
        } else if (experienceFilter === "5+") {
          params.append("min_exp", "5");
        }

        selectedQuickFilters.forEach((sf) => params.append("quick_skills", sf));

        const res = await fetch(`http://localhost:8000/api/candidates/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setCandidates(data);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, [debouncedSearch, category, experienceFilter, debouncedLocation, selectedQuickFilters]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 font-sans p-6 bg-slate-50 min-h-screen">
      {/* Search & Filter Controls Container */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Search & Filter Candidates</h2>
          <span className="text-xs text-slate-400">Keyword and category search</span>
        </div>

        {/* Top Control Bar: Search Input + Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="relative md:col-span-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, skill, job title, certification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              <option value="All">All Skill Categories</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Data & AI">Data & AI</option>
              <option value="Cloud Infrastructure">Cloud Infrastructure</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              <option value="Any">Any Experience</option>
              <option value="0-2">0 - 2 Years</option>
              <option value="3-5">3 - 5 Years</option>
              <option value="5+">5+ Years</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Badges + Location Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-slate-400 font-medium mr-2">Quick filters:</span>
          {quickFilterOptions.map((skill) => {
            const isSelected = selectedQuickFilters.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggleQuickFilter(skill)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  isSelected
                    ? "bg-teal-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {skill}
              </button>
            );
          })}

          <div className="ml-auto w-full md:w-56">
            <input
              type="text"
              placeholder="Filter by location"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="w-full px-3 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>
      </div>

      {/* Results Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Candidates</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {candidates.length} matching resume records
            </p>
          </div>
          <button className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1">
            View All Candidates <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Candidate List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">Candidate</th>
                <th className="py-3 px-6">Skills / Expertise</th>
                <th className="py-3 px-6">Experience</th>
                <th className="py-3 px-6">Location</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading candidates...
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No matching candidates found.
                  </td>
                </tr>
              ) : (
                candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {candidate.avatar_initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{candidate.name}</div>
                          <div className="text-xs text-slate-500">{candidate.title}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {candidate.skills.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="text-xs text-slate-400 font-medium">
                            +{candidate.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-600 font-medium text-xs">
                      {candidate.experience_years} years
                    </td>

                    <td className="py-4 px-6 text-slate-600 font-medium text-xs">
                      {candidate.location}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <a
                        href={`/candidates/${candidate.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 transition"
                      >
                        View Profile <ArrowRight className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}