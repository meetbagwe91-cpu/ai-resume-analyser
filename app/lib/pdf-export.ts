/**
 * Client-side PDF export using html2pdf.js
 * Converts the resume template DOM element to a downloadable PDF.
 */
export async function exportToPDF(
  element: HTMLElement,
  filename = "optimized-resume.pdf"
): Promise<void> {
  // Dynamic import to avoid SSR issues
  const html2pdf = (await import("html2pdf.js")).default;

  const options = {
    margin: [0, 0, 0, 0] as [number, number, number, number],
    filename,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: {
      scale: 3,
      useCORS: true,
      letterRendering: true,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait" as const,
    },
    pagebreak: { mode: ["css", "legacy"] },
  };

  await html2pdf().set(options).from(element).save();
}

/**
 * Log a download event to Firestore for the given resume.
 * This is fire-and-forget — failures are non-fatal.
 */
export async function logDownload(resumeId: string, filename: string): Promise<void> {
  try {
    const { db } = await import("~/lib/firebase");
    const { doc, updateDoc, arrayUnion } = await import("firebase/firestore");

    const downloadRecord: DownloadRecord = {
      downloadedAt: new Date().toISOString(),
      format: "pdf",
      filename,
    };

    await updateDoc(doc(db, "resumes", resumeId), {
      downloads: arrayUnion(downloadRecord),
    });
  } catch (e) {
    console.warn("Failed to log download:", e);
  }
}
