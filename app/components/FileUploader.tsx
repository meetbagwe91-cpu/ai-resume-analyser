import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "../lib/utils";
import Tooltip from "./Tooltip";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const onDrop = useCallback((accepted: File[]) => {
    onFileSelect?.(accepted[0] || null);
  }, [onFileSelect]);

  const maxSize = 20 * 1024 * 1024;

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop, multiple: false,
    accept: { "application/pdf": [".pdf"] },
    maxSize,
  });

  const file = acceptedFiles[0] || null;

  return (
    <div style={{ width: "100%" }}>
      {!file ? (
        <div {...getRootProps()} className={`drop-zone${isDragActive ? " drag-active" : ""}`}>
          <input {...getInputProps()} />
          {/* Icon */}
          <div style={{
            width: 64, height: 64, borderRadius: "1.25rem",
            background: "var(--color-cream-warm)",
            border: "1px solid rgba(196,181,160,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "1.75rem"
          }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="var(--color-taupe-dark)" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", fontWeight: 400, color: "var(--color-espresso)", marginBottom: "0.625rem" }}>
            {isDragActive ? "Release to upload" : "Drop your résumé here"}
          </h3>
          <p style={{ color: "var(--color-stone)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>
            or{" "}
            <span style={{ color: "var(--color-olive)", fontWeight: 500, borderBottom: "1px solid var(--color-olive)", paddingBottom: "1px", cursor: "pointer" }}>
              browse files
            </span>
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <Tooltip content="Files are securely processed and immediately encrypted. You can delete them at any time.">
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {["PDF Only", `Max ${formatSize(maxSize)}`].map(t => (
                  <span key={t} style={{
                    fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase",
                    color: "var(--color-stone-light)", background: "var(--color-cream-warm)",
                    padding: "0.375rem 0.875rem", borderRadius: "100px", border: "1px solid rgba(196,181,160,0.3)"
                  }}>{t}</span>
                ))}
              </div>
            </Tooltip>
          </div>
        </div>
      ) : (
        <div {...getRootProps()} className="drop-zone-selected">
          <input {...getInputProps()} />
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", overflow: "hidden" }}>
            <div style={{
              width: 44, height: 44, borderRadius: "0.875rem",
              background: "var(--color-cream-warm)", border: "1px solid rgba(196,181,160,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--color-taupe-dark)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontWeight: 500, color: "var(--color-espresso)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0, lineHeight: 1.4 }}>{file.name}</p>
              <p style={{ fontSize: "0.8rem", color: "var(--color-stone)", margin: 0, marginTop: "0.125rem" }}>{formatSize(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onFileSelect?.(null); }}
            style={{
              width: 36, height: 36, borderRadius: "100%",
              background: "var(--color-cream-deep)",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--color-clay)", flexShrink: 0, transition: "background 0.2s"
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--color-clay-light)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--color-cream-deep)")}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
