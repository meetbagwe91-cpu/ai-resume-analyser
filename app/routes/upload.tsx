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
  { title: "Resuman — New Analysis" },
  { name: "description", content: "Upload your résumé for intelligent AI feedback." },
]);

// ─── localStorage result cache ────────────────────────────────────────────────
const CACHE_PREFIX = "resuman_cache_";
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

// ─── Fire-and-forget background storage upload ────────────────────────────────
// Returns a promise that NEVER rejects — failures are logged and ignored.
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

// ─── Component ────────────────────────────────────────────────────────────────
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

    // ── Cache check ───────────────────────────────────────────────────────────
    let fileHash = "";
    try {
      fileHash = await hashFile(file);
      const cachedId = readCache(fileHash);
      if (cachedId) { navigate(`/resume/${cachedId}`); return; }
    } catch { /* skip */ }

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 1 — Extract text from PDF (ONLY blocking operation before AI)
    // Firebase Storage is NOT in this critical path — it runs in background.
    // ═══════════════════════════════════════════════════════════════════════════
    setStatusText("Reading résumé…");
    setStatusStep(0);

    let resumeText = "";
    let imgFile: File | null = null;

    try {
      // Extract text from PDF
      const rawText = await extractTextFromPdfFile(file);
      resumeText = cleanResumeText(rawText);
    } catch (e: any) {
      console.error("PDF processing error:", e);
      fail(`Could not read PDF: ${e?.message ?? "Unknown error."}`);
      return;
    }

    if (!resumeText.trim()) {
      fail("No text found in your PDF. Make sure it is not a scanned image-only document.");
      return;
    }

    // Fire background storage upload for the PDF
    const uid = user.uid;
    const docId = generateUUID();
    const pdfUploadPromise = uploadToStorage(`resumes/${uid}/${generateUUID()}_${file.name}`, file);

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 2 — AI Analysis (starts immediately after text extraction)
    // ═══════════════════════════════════════════════════════════════════════════
    setStatusText("AI is analysing your résumé…");
    setStatusStep(1);

    const systemPrompt = prepareInstructions({ jobTitle, jobDescription, AIResponseFormat });
    const userMessage  = `Resume text:\n\n${resumeText}`;

    let raw = "";
    try {
      raw = await queryGroq(
        systemPrompt,
        userMessage,
        "llama-3.3-70b-versatile",
        90000,
        2000
      );
    } catch (e: any) {
      fail(e?.message ?? "AI analysis failed. Please try again.");
      return;
    }

    // Robust JSON extraction — handles preamble text and markdown fences
    raw = raw.trim();
    const jsonStart = raw.indexOf("{");
    const jsonEnd   = raw.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      raw = raw.slice(jsonStart, jsonEnd + 1);
    }

    let feedback: Feedback;
    try {
      feedback = JSON.parse(raw);
    } catch {
      console.error("AI raw output (parse failed):", raw);
      fail("AI returned an unexpected format — please try again.");
      return;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STEP 3 — Save to Firestore, then navigate immediately
    // Storage URLs are patched into the document once uploads complete.
    // ═══════════════════════════════════════════════════════════════════════════
    setStatusText("Saving results…");
    setStatusStep(2);

    try {
      const { db } = await import("~/lib/firebase");
      const { doc, setDoc, updateDoc } = await import("firebase/firestore");

      // Save immediately with empty storage URLs so user gets result fast
      await setDoc(doc(db, "resumes", docId), {
        id: docId,
        userId: uid,
        companyName,
        jobTitle,
        jobDescription,
        imagePath: "",      // patched in background
        resumePath: "",     // patched in background
        resumeText,
        feedback,
        createdAt: new Date().toISOString(),
      });

      if (fileHash) writeCache(fileHash, docId);

      // Navigate NOW — user sees results while uploads complete in background
      navigate(`/resume/${docId}`);

      // Patch storage URLs into Firestore once they resolve (non-blocking)
      pdfUploadPromise.then(async (pdfUrl) => {
        try {
          await updateDoc(doc(db, "resumes", docId), {
            ...(pdfUrl ? { resumePath: pdfUrl } : { resumePath: "failed" }),
            imagePath: "failed" // We no longer use previews
          });
        } catch { /* non-fatal */ }
      });

    } catch (e: any) {
      console.error("Firestore save error:", e);
      fail(`Failed to save results: ${e?.message ?? "Unknown error."}`);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) { setStatusText("Please select a PDF first."); setIsError(true); return; }
    const fd = new FormData(e.currentTarget);
    await handleAnalyze({
      companyName:    fd.get("companyName")    as string,
      jobTitle:       fd.get("jobTitle")       as string,
      jobDescription: fd.get("jobDescription") as string,
      file,
    });
  };

  if (!isLoading && !isAuthenticated) { navigate("/auth?next=/upload"); return null; }

  const STEPS = ["Reading résumé…", "AI is analysing…", "Saving…"];

  return (
    <div className="page-shell">
      <Navbar />

      <section style={{ padding: "5rem 3rem 8rem", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ position: "fixed", inset: 0, zIndex: -1 }}>
          <img src="/images/img1.jpeg" alt="Background" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(247, 244, 239, 0.5)" }} />
        </div>

        <div style={{ marginBottom: "3.5rem", textAlign: "center", position: "relative" }} className="anim-fade-up">
          <span className="section-label">New Analysis</span>
          <h1 style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)", margin: "0.5rem 0 1rem" }}>Upload your résumé</h1>
          <p style={{ maxWidth: 440, margin: "0 auto", fontSize: "1rem" }}>
            Provide the role details and your résumé for precise, role-specific AI feedback.
          </p>
        </div>

        <div className="card-elevated anim-fade-up anim-delay-1" style={{ padding: "3rem 3.5rem" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", width: "100%", marginBottom: "1.5rem" }}>
              <div className="field">
                <label htmlFor="companyName">Target Company</label>
                <input type="text" name="companyName" id="companyName" placeholder="e.g. Stripe, Google" required />
              </div>
              <div className="field">
                <label htmlFor="jobTitle">Job Title</label>
                <input type="text" name="jobTitle" id="jobTitle" placeholder="e.g. Product Designer" required />
              </div>
            </div>

            <div className="field" style={{ width: "100%", marginBottom: "2rem" }}>
              <label htmlFor="jobDescription">
                Job Description
                <span style={{ fontWeight: 300, textTransform: "none", letterSpacing: 0, fontSize: "0.78rem", marginLeft: "0.5rem", color: "var(--color-stone-light)" }}>
                  (optional, improves accuracy)
                </span>
              </label>
              <textarea name="jobDescription" id="jobDescription" placeholder="Paste the full job description here…" rows={4} />
            </div>

            <div style={{ width: "100%", marginBottom: "2.5rem" }}>
              <label style={{ marginBottom: "0.75rem" }}>Résumé Document</label>
              <FileUploader onFileSelect={setFile} />
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
              <button
                type="submit"
                disabled={isProcessing || !file}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem", padding: "1.1rem 2rem", opacity: isProcessing || !file ? 0.55 : 1 }}
              >
                {isProcessing ? (
                  <>
                    <div style={{ width: 16, height: 16, borderRadius: "100%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.9s linear infinite" }} />
                    Analysing…
                  </>
                ) : (
                  <>
                    Start Analysis
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </>
                )}
              </button>

              {statusText && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.625rem",
                  padding: "0.75rem 1.25rem", borderRadius: "100px",
                  background: isError ? "var(--color-clay-light)" : "var(--color-sage-light)",
                  border: `1px solid ${isError ? "rgba(168,92,74,0.2)" : "rgba(123,155,126,0.2)"}`,
                  fontSize: "0.82rem", color: isError ? "var(--color-clay)" : "var(--color-sage)",
                }}>
                  {!isError && <div style={{ width: 12, height: 12, borderRadius: "100%", border: "2px solid rgba(123,155,126,0.3)", borderTopColor: "var(--color-sage)", animation: "spin 0.9s linear infinite", flexShrink: 0 }} />}
                  {statusText}
                </div>
              )}

              {isProcessing && !isError && (
                <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                  {STEPS.map((label, i) => (
                    <div key={i} title={label} style={{
                      height: 4,
                      width: i < statusStep ? 36 : i === statusStep ? 28 : 12,
                      borderRadius: "100px",
                      background: i < statusStep ? "var(--color-sage)" : i === statusStep ? "var(--color-olive)" : "var(--color-cream-deep)",
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
      </section>
    </div>
  );
};

export default Upload;
