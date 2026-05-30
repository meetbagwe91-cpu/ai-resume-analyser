/**
 * Client-side DOCX export using the `docx` library.
 * Converts ParsedResume data to a downloadable .docx file.
 */
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  BorderStyle,
  SectionType,
} from "docx";

export async function exportToDOCX(
  data: ParsedResume,
  filename = "optimized-resume.docx"
): Promise<void> {
  const { saveAs } = await import("file-saver");

  const ACCENT = "2B4C7E";
  const DARK = "1a1a1a";
  const GRAY = "555555";

  // ── Helper builders ──────────────────────────────────────────────────────

  const sectionHeading = (text: string) =>
    new Paragraph({
      children: [
        new TextRun({
          text: text.toUpperCase(),
          bold: true,
          size: 22,
          font: "Calibri",
          color: ACCENT,
        }),
      ],
      spacing: { before: 300, after: 80 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 1,
          color: ACCENT,
          space: 4,
        },
      },
    });

  const bulletPoint = (text: string) =>
    new Paragraph({
      children: [
        new TextRun({ text, size: 20, font: "Calibri", color: DARK }),
      ],
      bullet: { level: 0 },
      spacing: { after: 40 },
    });

  const textLine = (text: string, opts?: { bold?: boolean; italic?: boolean; color?: string; size?: number }) =>
    new Paragraph({
      children: [
        new TextRun({
          text,
          bold: opts?.bold,
          italics: opts?.italic,
          size: opts?.size ?? 20,
          font: "Calibri",
          color: opts?.color ?? DARK,
        }),
      ],
      spacing: { after: 40 },
    });

  const contactLine = (...parts: (string | undefined)[]) => {
    const filtered = parts.filter(Boolean);
    if (!filtered.length) return null;
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      children: filtered.map(
        (part, i) =>
          new TextRun({
            text: i > 0 ? `  ·  ${part}` : part!,
            size: 18,
            font: "Calibri",
            color: GRAY,
          })
      ),
      spacing: { after: 20 },
    });
  };

  // ── Build document sections ──────────────────────────────────────────────

  const children: Paragraph[] = [];

  // Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.fullName || "Your Name",
          bold: true,
          size: 32,
          font: "Calibri",
          color: DARK,
        }),
      ],
      spacing: { after: 60 },
    })
  );

  // Contact info
  const c = data.contactInfo;
  const line1 = contactLine(c?.email, c?.phone, c?.location);
  const line2 = contactLine(c?.linkedin, c?.portfolio);
  if (line1) children.push(line1);
  if (line2) children.push(line2);
  children.push(new Paragraph({ spacing: { after: 100 }, children: [] }));

  // Summary
  if (data.summary) {
    children.push(sectionHeading("Professional Summary"));
    children.push(textLine(data.summary, { italic: true, color: GRAY }));
  }

  // Skills
  if (data.skills?.length) {
    children.push(sectionHeading("Skills"));
    children.push(textLine(data.skills.join("  ·  ")));
  }

  // Experience
  if (data.experience?.length) {
    children.push(sectionHeading("Experience"));
    for (const exp of data.experience) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title, bold: true, size: 22, font: "Calibri", color: DARK }),
            new TextRun({ text: `  |  ${exp.company}`, size: 20, font: "Calibri", color: GRAY }),
          ],
          spacing: { before: 120, after: 20 },
        })
      );
      children.push(textLine(exp.duration, { italic: true, color: GRAY, size: 18 }));
      for (const bullet of exp.bullets) {
        children.push(bulletPoint(bullet));
      }
    }
  }

  // Projects
  if (data.projects?.length) {
    children.push(sectionHeading("Projects"));
    for (const proj of data.projects) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.name, bold: true, size: 22, font: "Calibri", color: DARK }),
            ...(proj.technologies?.length
              ? [new TextRun({ text: `  —  ${proj.technologies.join(", ")}`, size: 18, font: "Calibri", color: GRAY })]
              : []),
          ],
          spacing: { before: 120, after: 20 },
        })
      );
      if (proj.description) {
        children.push(textLine(proj.description, { italic: true, color: GRAY, size: 18 }));
      }
      for (const bullet of proj.bullets) {
        children.push(bulletPoint(bullet));
      }
    }
  }

  // Education
  if (data.education?.length) {
    children.push(sectionHeading("Education"));
    for (const edu of data.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true, size: 22, font: "Calibri", color: DARK }),
            new TextRun({ text: `  |  ${edu.institution}`, size: 20, font: "Calibri", color: GRAY }),
          ],
          spacing: { before: 80, after: 20 },
        })
      );
      children.push(textLine(edu.year, { italic: true, color: GRAY, size: 18 }));
      if (edu.details) children.push(textLine(edu.details, { size: 18 }));
    }
  }

  // Certifications
  if (data.certifications?.length) {
    children.push(sectionHeading("Certifications"));
    for (const cert of data.certifications) {
      children.push(bulletPoint(cert));
    }
  }

  // Achievements
  if (data.achievements?.length) {
    children.push(sectionHeading("Achievements"));
    for (const ach of data.achievements) {
      children.push(bulletPoint(ach));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          type: SectionType.CONTINUOUS,
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
