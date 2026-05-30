import { useState, useEffect } from "react";
import DiagnosisCard from "./DiagnosisCard";
import { queryGroq } from "~/lib/groq";
import { prepareDeepDiagnosisPrompt } from "../../constants";

export default function JobMatchingPanel({ resumes }: { resumes: Resume[] }) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveDiagnosis, setLiveDiagnosis] = useState<DeepDiagnosis | null>(null);

  // Set default selection when resumes load
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  // Clear live diagnosis when user switches resume
  useEffect(() => {
    setLiveDiagnosis(null);
  }, [selectedResumeId]);

  const selectedResume = resumes.find(r => r.id === selectedResumeId);
  const baseDiagnosis = selectedResume?.optimization?.diagnosis;
  const activeDiagnosis = liveDiagnosis || baseDiagnosis;

  const handleAnalyze = async () => {
    if (!selectedResume) {
      alert("Please select a résumé first.");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please paste a target Job Description to run the analysis.");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const diagnosisPrompt = prepareDeepDiagnosisPrompt({
        jobTitle: selectedResume.jobTitle || "Target Role",
        jobDescription,
        existingFeedback: JSON.stringify(selectedResume.feedback),
      });
      const userMessage = `Here is my parsed résumé text:\n\n${selectedResume.resumeText || "No text available."}`;

      let raw = await queryGroq(
        diagnosisPrompt,
        userMessage,
        "llama-3.3-70b-versatile",
        90000,
        2048
      );

      raw = raw.trim();
      const jsonStart = raw.indexOf("{");
      const jsonEnd   = raw.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        raw = raw.slice(jsonStart, jsonEnd + 1);
      }
      
      const newDiagnosis = JSON.parse(raw);
      setLiveDiagnosis(newDiagnosis);
    } catch (e: any) {
      alert("Analysis failed: " + (e?.message || "Unknown error"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="anim-fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="section-label" style={{ marginBottom: "0.25rem" }}>Career Intelligence</span>
          <h3 style={{ margin: 0, fontSize: "1.4rem" }}>Job Matching & Skills Gap Analysis</h3>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
        {/* Left Column: Controls */}
        <div className="card-elevated" style={{ padding: "1.5rem", alignSelf: "start" }}>
          <h4 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>Configure Match</h4>
          
          <div className="form-group">
            <label htmlFor="resume-select">Select Résumé</label>
            <select 
              id="resume-select"
              value={selectedResumeId}
              onChange={e => setSelectedResumeId(e.target.value)}
              className="form-control"
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-taupe)" }}
            >
              {resumes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.jobTitle || r.companyName || "Untitled Résumé"} 
                  {r.createdAt ? ` (${new Date(r.createdAt).toLocaleDateString()})` : ""}
                </option>
              ))}
              {resumes.length === 0 && <option value="">No résumés available</option>}
            </select>
          </div>

          <div className="form-group" style={{ marginTop: "1.5rem" }}>
            <label htmlFor="jd-input">Target Job Description</label>
            <p style={{ fontSize: "0.75rem", color: "var(--color-stone)", margin: "0.25rem 0 0.5rem" }}>
              Paste a specific job description to run a real-time keyword overlap and skills gap analysis.
            </p>
            <textarea
              id="jd-input"
              rows={6}
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-taupe)", resize: "vertical", fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}
            />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={!selectedResumeId || isAnalyzing || resumes.length === 0 || !jobDescription.trim()}
            className="btn-primary"
            style={{ width: "100%", marginTop: "1.5rem", justifyContent: "center" }}
          >
            {isAnalyzing ? (
              <>
                <div style={{ width: 14, height: 14, borderRadius: "100%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.9s linear infinite", marginRight: "0.5rem" }} />
                Analyzing Match...
              </>
            ) : "Run Match Analysis"}
          </button>
        </div>

        {/* Right Column: Results */}
        <div>
          {activeDiagnosis ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <DiagnosisCard diagnosis={activeDiagnosis} />
            </div>
          ) : (
            <div className="card-elevated" style={{ padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="var(--color-taupe)" strokeWidth={1.5} style={{ marginBottom: "1rem" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>No Analysis Available</h4>
              <p style={{ margin: 0, color: "var(--color-stone)", fontSize: "0.9rem", maxWidth: 300 }}>
                Paste a Job Description and click "Run Match Analysis" to see your keyword overlap, skills gap, and job title recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
