import PDFDocument from "pdfkit";
import type { RiskTier, ScanType } from "../types";

const TIER_COLOR: Record<RiskTier, string> = {
  AAA: "#00b6cc",
  AA: "#3aa856",
  A: "#c9a227",
  BB: "#e07a1f",
  C: "#d11a33",
};

const TIER_LABEL: Record<RiskTier, string> = {
  AAA: "VERIFIED SAFE",
  AA: "LOW RISK",
  A: "CAUTION",
  BB: "HIGH RISK",
  C: "DANGER",
};

export interface PdfScan {
  id: string;
  target: string;
  scanType: ScanType;
  meshScore: number;
  tier: RiskTier;
  reportMarkdown: string;
  reportHash: string;
  easUid: string | null;
  reportUrl: string;
  scannedAt: number;
}

const INK = "#0E141D";
const MUTED = "#6b7785";

/**
 * Renders a scan report to a branded PDF. Pure pdfkit — no headless browser,
 * so it stays small and works on Bun/Alpine.
 */
export function generateReportPdf(scan: PdfScan): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const tierColor = TIER_COLOR[scan.tier] ?? INK;
    const left = doc.page.margins.left;
    const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // ── Masthead ──────────────────────────────────────────────────────────────
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(22).text("MESHLINE", left, 50);
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text("AI-powered onchain risk intelligence for Base", left, 76);
    doc.moveTo(left, 96).lineTo(left + contentWidth, 96).strokeColor("#d9dee5").lineWidth(1).stroke();

    // ── Score block ───────────────────────────────────────────────────────────
    let y = 116;
    doc.fillColor(tierColor).font("Helvetica-Bold").fontSize(48).text(String(scan.meshScore), left, y);
    doc.fillColor(MUTED).font("Helvetica").fontSize(11).text("/ 1000  MESH Score", left + 130, y + 22);

    doc
      .fillColor(tierColor)
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(`${scan.tier} · ${TIER_LABEL[scan.tier] ?? ""}`, left + 130, y + 2);

    y += 78;

    // ── Meta table ────────────────────────────────────────────────────────────
    const meta: [string, string][] = [
      ["Target", scan.target],
      ["Scan type", scan.scanType],
      ["Scanned", new Date(scan.scannedAt * 1000).toUTCString()],
      ["Report hash", scan.reportHash],
      ["EAS attestation", scan.easUid ? scan.easUid : "not attested onchain"],
    ];
    doc.fontSize(9);
    for (const [k, v] of meta) {
      doc.fillColor(MUTED).font("Helvetica-Bold").text(k, left, y, { width: 100, continued: false });
      doc.fillColor(INK).font("Helvetica").text(v, left + 105, y, { width: contentWidth - 105 });
      y = doc.y + 5;
    }

    doc.moveTo(left, y + 4).lineTo(left + contentWidth, y + 4).strokeColor("#eef1f4").lineWidth(1).stroke();
    doc.y = y + 16;

    // ── Report body (markdown → pdf) ──────────────────────────────────────────
    renderMarkdown(doc, scan.reportMarkdown, left, contentWidth);

    // ── Footer ────────────────────────────────────────────────────────────────
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      const fy = doc.page.height - 40;
      doc
        .fillColor(MUTED)
        .font("Helvetica")
        .fontSize(8)
        .text(scan.reportUrl, left, fy, { width: contentWidth - 60, lineBreak: false });
      doc.text(`Page ${i + 1} of ${range.count}`, left, fy, { width: contentWidth, align: "right" });
    }

    doc.end();
  });
}

/**
 * Minimal, robust markdown renderer for the structured AI reports
 * (headings, bullets, bold, paragraphs). Line-based — no AST edge cases.
 */
function renderMarkdown(doc: PDFKit.PDFDocument, md: string, left: number, width: number) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let inCode = false;

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith("```")) {
      inCode = !inCode;
      doc.moveDown(0.2);
      continue;
    }
    if (inCode) {
      doc.fillColor("#334").font("Courier").fontSize(9).text(line, left, doc.y, { width });
      continue;
    }
    if (line.trim() === "") {
      doc.moveDown(0.5);
      continue;
    }

    if (line.startsWith("### ")) {
      doc.moveDown(0.3).fillColor(INK).font("Helvetica-Bold").fontSize(11).text(line.slice(4), left, doc.y, { width });
    } else if (line.startsWith("## ")) {
      doc.moveDown(0.5).fillColor(INK).font("Helvetica-Bold").fontSize(13).text(line.slice(3), left, doc.y, { width });
    } else if (line.startsWith("# ")) {
      doc.moveDown(0.5).fillColor(INK).font("Helvetica-Bold").fontSize(16).text(line.slice(2), left, doc.y, { width });
    } else if (/^\s*[-*]\s+/.test(line)) {
      const text = line.replace(/^\s*[-*]\s+/, "");
      doc.fillColor(INK).fontSize(10);
      renderInline(doc, "•  " + text, left + 8, width - 8);
    } else {
      doc.fillColor(INK).fontSize(10);
      renderInline(doc, line, left, width);
    }
  }
}

/** Renders a line, toggling bold for **...** spans. */
function renderInline(doc: PDFKit.PDFDocument, text: string, x: number, width: number) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  if (parts.length === 1 && !parts[0].startsWith("**")) {
    doc.font("Helvetica").text(stripInline(text), x, doc.y, { width });
    return;
  }
  parts.forEach((part, i) => {
    const last = i === parts.length - 1;
    if (part.startsWith("**") && part.endsWith("**")) {
      doc.font("Helvetica-Bold").text(part.slice(2, -2), { width, continued: !last });
    } else {
      doc.font("Helvetica").text(stripInline(part), { width, continued: !last });
    }
  });
}

function stripInline(s: string): string {
  return s.replace(/`([^`]+)`/g, "$1").replace(/\*\*/g, "");
}
