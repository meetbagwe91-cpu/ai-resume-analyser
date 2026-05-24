import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export const generateUUID = () => crypto.randomUUID();

/**
 * Normalise raw pdfjs text output before sending to the LLM.
 *
 * What this removes / fixes:
 *  - Runs of 3+ whitespace/newlines collapsed to a single separator
 *  - Lines that are pure whitespace or single characters (PDF artefacts)
 *  - Repeated identical lines (page headers / footers repeated on every page)
 *  - Lines shorter than 2 chars that aren't bullet markers
 *  - Control characters and zero-width spaces
 *
 * The result is clipped to `maxChars` (default 4 000) which is well above
 * what any single-page resume needs while saving hundreds of input tokens.
 */
export function cleanResumeText(raw: string, maxChars = 4000): string {
  // 1. Strip control chars / zero-width spaces
  let text = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\uFEFF\u200B-\u200D]/g, "");

  // 2. Normalise Windows line-endings
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 3. Split into lines and clean each
  const lines = text.split("\n").map(l => l.trim());

  // 4. Remove pure-whitespace lines and very short PDF artefact lines
  //    (keep lines ≥ 2 chars or common bullet chars)
  const bulletRe = /^[-•·▪▸*>]$/;
  const filtered = lines.filter(l => l.length >= 2 || bulletRe.test(l));

  // 5. Remove repeated consecutive duplicate lines (headers/footers)
  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const line of filtered) {
    const key = line.toLowerCase().replace(/\s+/g, " ");
    if (!seen.has(key)) {
      deduped.push(line);
      // Only track short lines (< 60 chars) as potential repeated headers
      if (key.length < 60) seen.add(key);
    }
  }

  // 6. Collapse runs of blank lines to a single blank line
  let result = deduped.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  // 7. Hard cap — beyond 4 000 chars the model sees diminishing returns
  //    and token cost climbs linearly. Trim at a sentence boundary if possible.
  if (result.length > maxChars) {
    result = result.slice(0, maxChars);
    const lastBreak = Math.max(result.lastIndexOf("\n"), result.lastIndexOf(". "));
    if (lastBreak > maxChars * 0.85) result = result.slice(0, lastBreak);
    result += "\n[... truncated for analysis]";
  }

  return result;
}

/**
 * SHA-256 hash of a File's bytes — used for deduplication / cache lookup.
 * Returns a 16-char hex prefix (enough to identify identical files).
 */
export async function hashFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  const bytes = new Uint8Array(hashBuf);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16); // 16 hex chars = 64 bits — plenty for dedup
}
