import { getPdfJs } from "./pdf-core";

export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

/**
 * Render the first page of a PDF as a JPEG File.
 * Uses the shared pdfjs singleton from pdf-core.ts — no duplicate worker boot.
 */
export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
  try {
    const lib = await getPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const page = await pdf.getPage(1);

    // Scale 1.8 ≈ 1440 px wide — great for preview, far smaller than scale 4
    const viewport = page.getViewport({ scale: 1.8 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const name = file.name.replace(/\.pdf$/i, "");
            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: new File([blob], `${name}.jpg`, { type: "image/jpeg" }),
            });
          } else {
            resolve({ imageUrl: "", file: null, error: "Canvas toBlob returned null" });
          }
        },
        "image/jpeg",
        0.88
      );
    });
  } catch (err: any) {
    console.error("PDF→image error:", err);
    return { imageUrl: "", file: null, error: `PDF conversion failed: ${err?.message ?? err}` };
  }
}
