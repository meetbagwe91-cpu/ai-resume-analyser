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
    margin: [10, 10, 10, 10] as [number, number, number, number], // mm: top, right, bottom, left
    filename,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait" as const,
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  await html2pdf().set(options).from(element).save();
}
