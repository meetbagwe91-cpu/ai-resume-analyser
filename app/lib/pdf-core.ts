/**
 * pdf-core.ts — Shared pdfjs singleton.
 * Both pdf-parser.ts and pdf2img.ts import from here so the worker
 * is initialized exactly ONCE, even when both run in parallel.
 */

let _lib: any = null;
let _loadPromise: Promise<any> | null = null;

export async function getPdfJs(): Promise<any> {
  if (_lib) return _lib;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    try {
      // @ts-expect-error — pdfjs-dist/build/pdf.mjs has no TS types here
      const mod = await import("pdfjs-dist/build/pdf.mjs");
      const lib = mod.default ?? mod;
      lib.GlobalWorkerOptions.workerSrc = new URL(
        "/pdf.worker.min.mjs",
        window.location.origin
      ).href;
      _lib = lib;
      return lib;
    } catch (err) {
      _loadPromise = null;
      throw err;
    }
  })();

  return _loadPromise;
}
