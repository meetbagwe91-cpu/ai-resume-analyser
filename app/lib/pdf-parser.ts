import { getPdfJs } from "./pdf-core";

/**
 * Extract all text from a PDF file.
 * Uses the shared pdfjs singleton (pdf-core.ts) so the worker boots
 * exactly once even when called in parallel with convertPdfToImage().
 * All pages are extracted concurrently via Promise.all.
 */
export async function extractTextFromPdfFile(file: File): Promise<string> {
  const lib = await getPdfJs();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  // Extract all pages IN PARALLEL — serial for-await was slow on multi-page PDFs
  const pageNumbers = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
  const pageTexts = await Promise.all(
    pageNumbers.map(async (pageNum) => {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      // Join items — preserve word spacing by including str values
      return content.items
        .map((item: any) => item.str)
        .filter((s: string) => s.trim().length > 0)
        .join(" ");
    })
  );

  return pageTexts.join("\n");
}
