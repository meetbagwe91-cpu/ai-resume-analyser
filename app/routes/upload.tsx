import { type FormEvent, useState, useEffect } from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { useAppStore } from "~/lib/store";
import { useNavigate } from "react-router";
import { generateUUID, cleanResumeText, hashFile } from "~/lib/utils";
import { AIResponseFormat, prepareInstructions } from "../../constants";
import { extractTextFromPdfFile } from "~/lib/pdf-parser";
import { queryGroq } from "~/lib/groq";

export const meta = () => ([
  { title: "Resumate — New Analysis" },
  { name: "description", content: "Upload your résumé for intelligent AI feedback." },
]);

const CACHE_PREFIX = "resumate_cache_";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function readCache(hash: string): string | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + hash);
    if (!raw) return null;
    const { id, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) { localStorage.removeItem(CACHE_PREFIX + hash); return null; }
    return id;
  } catch { return null; }
}
function writeCache(hash: string, id: string) {
  try { localStorage.setItem(CACHE_PREFIX + hash, JSON.stringify({ id, ts: Date.now() })); } catch {}
}

function uploadToStorage(path: string, blob: File | Blob): Promise<string> {
  return (async () => {
    try {
      const { storage } = await import("~/lib/firebase");
      const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
      const snap = await uploadBytes(ref(storage, path), blob);
      return getDownloadURL(snap.ref);
    } catch (e) {
      console.warn(`Background upload failed for ${path}:`, e);
      return "";
    }
  })();
}

const Upload = () => {
  const { isAuthenticated, isLoading, user } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth?next=/upload");
  }, [isLoading, isAuthenticated, navigate]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [statusStep, setStatusStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [isError, setIsError] = useState(false);

  const fail = (msg: string) => {
    setStatusText(msg);
    setIsError(true);
    setIsProcessing(false);
  };

  const handleAnalyze = async ({
    companyName, jobTitle, jobDescription, file,
  }: { companyName: string; jobTitle: string; jobDescription: string; file: File }) => {
    setIsProcessing(true);
    setIsError(false);
    setStatusStep(0);
    if (!user) { fail("You must be logged in."); return; }

    let fileHash = "";
    try {
      fileHash = await hashFile(file);
      const cachedId = readCache(fileHash);
      if (cachedId) { navigate(`/resume/${cachedId}`); return; }
    } catch { /* skip */ }

    setStatusText("Reading résumé…");
    setStatusStep(0);
    let resumeText = "";
    try {
      const rawText = await extractTextFromPdfFile(file);
      resumeText = cleanResumeText(rawText);
    } catch (e: any) {
      fail(`Could not read PDF: ${e?.message ?? "Unknown error."}`);
      return;
    }
    if (!resumeText.trim()) {
      fail("No text found in your PDF. Make sure it is not a scanned image-only document.");
      return;
    }

    const uid = user.uid;
    const docId = generateUUID();
    const pdfUploadPromise = uploadToStorage(`resumes/${uid}/${generateUUID()}_${file.name}`, file);

    setStatusText("AI is analysing your résumé…");
    setStatusStep(1);
    const systemPrompt = prepareInstructions({ jobTitle, jobDescription, AIResponseFormat });
    const userMessage = `Resume text:\n\n${resumeText}`;
    let raw = "";
    try {
      raw = await queryGroq(systemPrompt, userMessage, "llama-3.3-70b-versatile", 90000, 2000);
    } catch (e: any) {
      fail(e?.message ?? "AI analysis failed. Please try again.");
      return;
    }

    raw = raw.trim();
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd > jsonStart) raw = raw.slice(jsonStart, jsonEnd + 1);

    let feedback: Feedback;
    try {
      feedback = JSON.parse(raw);
    } catch {
      fail("AI returned an unexpected format — please try again.");
      return;
    }

    setStatusText("Saving results…");
    setStatusStep(2);
    try {
      const { db } = await import("~/lib/firebase");
      const { doc, setDoc, updateDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "resumes", docId), {
        id: docId, userId: uid, companyName, jobTitle, jobDescription,
        imagePath: "", resumePath: "", resumeText, feedback,
        createdAt: new Date().toISOString(),
      });
      if (fileHash) writeCache(fileHash, docId);
      navigate(`/resume/${docId}`);
      pdfUploadPromise.then(async (pdfUrl) => {
        try {
          await updateDoc(doc(db, "resumes", docId), {
            ...(pdfUrl ? { resumePath: pdfUrl } : { resumePath: "failed" }),
            imagePath: "failed",
          });
        } catch { /* non-fatal */ }
      });
    } catch (e: any) {
      fail(`Failed to save results: ${e?.message ?? "Unknown error."}`);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) { setStatusText("Please select a PDF first."); setIsError(true); return; }
    const fd = new FormData(e.currentTarget);
    await handleAnalyze({
      companyName: fd.get("companyName") as string,
      jobTitle: fd.get("jobTitle") as string,
      jobDescription: fd.get("jobDescription") as string,
      file,
    });
  };

  if (!isLoading && !isAuthenticated) return null;

  const STEPS = ["Reading résumé…", "AI is analysing…", "Saving…"];

  return (
    <div className="page-shell">
      <Navbar />

      <div style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}>
        <img src="/images/img1.jpeg" alt="Background" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(247, 244, 239, 0.6)" }} />
      </div>

      <div style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "clamp(3rem, 6vw, 5rem) 2rem 6rem",
        width: "100%",
      }}>
        {/* Page header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }} className="anim-fade-up">
          <span className="section-label">New Analysis</span>
          <h1 style={{ marginTop: "0.5rem", marginBottom: "1rem" }}>
            Upload your résumé
          </h1>
          <p style={{ maxWidth: 440, margin: "0 auto" }}>
            Provide your target role details and your résumé for precise, role-specific AI feedback.
          </p>
        </div>

        {/* Form card */}
        <div className="card-elevated anim-fade-up anim-delay-1" style={{
          padding: "clamp(2rem, 5vw, 3rem) clamp(1.75rem, 5vw, 3.5rem)",
        }}>
          <form onSubmit={handleSubmit}>
            {/* Company + job title row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.25rem",
              width: "100%",
              marginBottom: "1.25rem",
            }}>
              <div className="field">
                <label htmlFor="companyName">Target Company</label>
                <input type="text" name="companyName" id="companyName" placeholder="e.g. Stripe, Google" required />
              </div>
              <div className="field">
                <label htmlFor="jobTitle">Job Title</label>
                <input type="text" name="jobTitle" id="jobTitle" placeholder="e.g. Product Designer" required />
              </div>
            </div>

            {/* Job description */}
            <div className="field" style={{ width: "100%", marginBottom: "1.75rem" }}>
              <label htmlFor="jobDescription">
                Job Description
                <span style={{
                  fontWeight: 400,
                  textTransform: "none",
                  letterSpacing: 0,
                  fontSize: "0.78rem",
                  marginLeft: "0.5rem",
                  color: "var(--color-stone-light)",
                }}>
                  (optional, improves accuracy)
                </span>
              </label>
              <textarea
                name="jobDescription"
                id="jobDescription"
                placeholder="Paste the full job description here…"
                rows={4}
              />
            </div>

            {/* File uploader */}
            <div style={{ width: "100%", marginBottom: "2rem" }}>
              <label style={{ marginBottom: "0.75rem" }}>Résumé Document (PDF)</label>
              <FileUploader onFileSelect={setFile} />
            </div>

            {/* Submit area */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", width: "100%" }}>
              <button
                type="submit"
                disabled={isProcessing || !file}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "1rem 2rem",
                  fontSize: "0.85rem",
                  opacity: isProcessing || !file ? 0.55 : 1,
                }}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner spinner-light" style={{ width: 16, height: 16 }} />
                    Analysing…
                  </>
                ) : (
                  <>
                    Start Analysis
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>

              {/* Status feedback */}
              {statusText && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.75rem 1.25rem",
                  borderRadius: "100px",
                  background: isError ? "var(--color-clay-light)" : "var(--color-sage-light)",
                  border: `1px solid ${isError ? "rgba(168,92,74,0.2)" : "rgba(90,122,92,0.2)"}`,
                  fontSize: "0.82rem",
                  color: isError ? "var(--color-clay)" : "var(--color-sage-dark)",
                }}>
                  {!isError && <div className="spinner" style={{ width: 12, height: 12, borderTopColor: "var(--color-sage)" }} />}
                  {statusText}
                </div>
              )}

              {/* Progress dots */}
              {isProcessing && !isError && (
                <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                  {STEPS.map((label, i) => (
                    <div key={i} title={label} style={{
                      height: 4,
                      width: i < statusStep ? 36 : i === statusStep ? 28 : 12,
                      borderRadius: "100px",
                      background: i < statusStep
                        ? "var(--color-sage)"
                        : i === statusStep
                        ? "var(--color-espresso)"
                        : "var(--color-ivory-deep)",
                      transition: "width 0.4s ease, background 0.4s ease",
                    }} />
                  ))}
                </div>
              )}

              {isProcessing && !isError && (
                <p style={{ fontSize: "0.75rem", color: "var(--color-stone-light)", margin: 0, textAlign: "center" }}>
                  Usually 15–25 seconds · please keep this tab open
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
