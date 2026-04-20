// Sistema unificado de exportación de documentos.
// Soporta tres formatos: PDF, DOCX (Word) y Markdown.
// Acepta contenido en distintas formas (markdown, HTML, timeline, FAQ, plano).

import jsPDF from "jspdf";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageOrientation,
  LevelFormat,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
} from "docx";

// ============================================================================
// Tipos
// ============================================================================

export type ExportFormat = "pdf" | "docx" | "md";

export type PageSize = "A4" | "Letter";
export type Orientation = "portrait" | "landscape";
export type FontFamily = "serif" | "sans" | "mono";

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  title: string;
  author?: string;
  subtitle?: string;
  // Avanzadas
  pageSize?: PageSize; // default A4
  orientation?: Orientation; // default portrait
  fontFamily?: FontFamily; // default serif
  fontSize?: number; // pt, default 11
  includeHeader?: boolean; // título arriba
  includeFooter?: boolean; // página X de Y
  includeDate?: boolean; // fecha en el header
  marginCm?: number; // default 2cm
  accentHex?: string; // color para títulos, default #ea580c (orange)
}

// Estructuras de contenido reconocidas
export interface MarkdownDoc {
  kind: "markdown";
  markdown: string;
}
export interface TimelineDoc {
  kind: "timeline";
  title?: string;
  events: Array<{ date: string; title: string; description: string; category?: string }>;
}
export interface FaqDoc {
  kind: "faq";
  title?: string;
  items: Array<{ question: string; answer: string; category?: string }>;
}
export interface HtmlDoc {
  kind: "html";
  html: string;
}

export type ExportableContent = MarkdownDoc | TimelineDoc | FaqDoc | HtmlDoc;

// ============================================================================
// API pública
// ============================================================================

export async function exportDocument(content: ExportableContent, opts: ExportOptions): Promise<void> {
  const filename = safeFilename(opts.filename || opts.title || "documento");
  const md = contentToMarkdown(content, opts);

  switch (opts.format) {
    case "md":
      downloadBlob(new Blob([md], { type: "text/markdown;charset=utf-8" }), `${filename}.md`);
      return;
    case "pdf":
      await exportPdf(md, opts, filename);
      return;
    case "docx":
      await exportDocx(md, opts, filename);
      return;
  }
}

export function safeFilename(s: string): string {
  return (
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) || "documento"
  );
}

export const DEFAULT_OPTIONS: Required<Omit<ExportOptions, "format" | "filename" | "title" | "subtitle" | "author">> = {
  pageSize: "A4",
  orientation: "portrait",
  fontFamily: "serif",
  fontSize: 11,
  includeHeader: true,
  includeFooter: true,
  includeDate: true,
  marginCm: 2,
  accentHex: "#ea580c",
};

// ============================================================================
// Conversión de contenido → markdown canónico
// ============================================================================

function contentToMarkdown(c: ExportableContent, opts: ExportOptions): string {
  const lines: string[] = [];
  if (opts.title) lines.push(`# ${opts.title}`, "");
  if (opts.subtitle) lines.push(`*${opts.subtitle}*`, "");

  switch (c.kind) {
    case "markdown":
      lines.push(c.markdown);
      break;
    case "html":
      lines.push(htmlToMarkdown(c.html));
      break;
    case "timeline":
      if (c.title) lines.push(`## ${c.title}`, "");
      for (const ev of c.events) {
        lines.push(`### ${ev.date} — ${ev.title}`);
        if (ev.category) lines.push(`*${ev.category}*`);
        lines.push("", ev.description, "");
      }
      break;
    case "faq":
      if (c.title) lines.push(`## ${c.title}`, "");
      c.items.forEach((it, i) => {
        lines.push(`### Q${i + 1}. ${it.question}`);
        lines.push("", it.answer, "");
        if (it.category) lines.push(`*Categoría: ${it.category}*`, "");
      });
      break;
  }
  return lines.join("\n");
}

// HTML → markdown muy simple (cubre TipTap output)
function htmlToMarkdown(html: string): string {
  if (typeof document === "undefined") return html;
  const div = document.createElement("div");
  div.innerHTML = html;
  return nodeToMd(div).trim();
}

function nodeToMd(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const inner = Array.from(el.childNodes).map(nodeToMd).join("");

  switch (tag) {
    case "h1":
      return `\n# ${inner}\n\n`;
    case "h2":
      return `\n## ${inner}\n\n`;
    case "h3":
      return `\n### ${inner}\n\n`;
    case "h4":
    case "h5":
    case "h6":
      return `\n#### ${inner}\n\n`;
    case "p":
      return `${inner}\n\n`;
    case "br":
      return "\n";
    case "strong":
    case "b":
      return `**${inner}**`;
    case "em":
    case "i":
      return `*${inner}*`;
    case "u":
      return inner; // markdown no tiene underline, lo dejamos plano
    case "s":
    case "del":
      return `~~${inner}~~`;
    case "code":
      return `\`${inner}\``;
    case "pre":
      return `\n\`\`\`\n${el.textContent ?? ""}\n\`\`\`\n\n`;
    case "blockquote":
      return inner
        .split("\n")
        .filter(Boolean)
        .map((l) => `> ${l}`)
        .join("\n") + "\n\n";
    case "ul":
      return (
        Array.from(el.children)
          .map((li) => `- ${nodeToMd(li).trim()}`)
          .join("\n") + "\n\n"
      );
    case "ol":
      return (
        Array.from(el.children)
          .map((li, i) => `${i + 1}. ${nodeToMd(li).trim()}`)
          .join("\n") + "\n\n"
      );
    case "li":
      return inner;
    case "hr":
      return "\n---\n\n";
    case "a": {
      const href = el.getAttribute("href") ?? "";
      return `[${inner}](${href})`;
    }
    default:
      return inner;
  }
}

// ============================================================================
// Tokens visuales por opciones
// ============================================================================

interface ResolvedOpts {
  pageSize: PageSize;
  orientation: Orientation;
  fontFamily: FontFamily;
  fontSize: number;
  marginCm: number;
  accentHex: string;
  includeHeader: boolean;
  includeFooter: boolean;
  includeDate: boolean;
  title: string;
  author: string;
}

function resolve(opts: ExportOptions): ResolvedOpts {
  return {
    pageSize: opts.pageSize ?? DEFAULT_OPTIONS.pageSize,
    orientation: opts.orientation ?? DEFAULT_OPTIONS.orientation,
    fontFamily: opts.fontFamily ?? DEFAULT_OPTIONS.fontFamily,
    fontSize: opts.fontSize ?? DEFAULT_OPTIONS.fontSize,
    marginCm: opts.marginCm ?? DEFAULT_OPTIONS.marginCm,
    accentHex: opts.accentHex ?? DEFAULT_OPTIONS.accentHex,
    includeHeader: opts.includeHeader ?? DEFAULT_OPTIONS.includeHeader,
    includeFooter: opts.includeFooter ?? DEFAULT_OPTIONS.includeFooter,
    includeDate: opts.includeDate ?? DEFAULT_OPTIONS.includeDate,
    title: opts.title ?? "",
    author: opts.author ?? "",
  };
}

function fontFor(family: FontFamily): { jspdf: string; docx: string } {
  switch (family) {
    case "sans":
      return { jspdf: "helvetica", docx: "Inter" };
    case "mono":
      return { jspdf: "courier", docx: "JetBrains Mono" };
    case "serif":
    default:
      return { jspdf: "times", docx: "Georgia" };
  }
}

// ============================================================================
// PDF (jsPDF) — render markdown nativo, sin html2canvas (mejor calidad y peso)
// ============================================================================

interface MdBlock {
  type: "h1" | "h2" | "h3" | "p" | "ul" | "ol" | "quote" | "hr" | "code";
  text?: string;
  items?: string[];
}

function parseMarkdown(md: string): MdBlock[] {
  const lines = md.split(/\r?\n/);
  const blocks: MdBlock[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];
  let inCode = false;
  let codeBuf: string[] = [];

  const flushList = () => {
    if (listType && listItems.length) {
      blocks.push({ type: listType, items: listItems });
    }
    listType = null;
    listItems = [];
  };

  for (const raw of lines) {
    if (raw.startsWith("```")) {
      if (inCode) {
        blocks.push({ type: "code", text: codeBuf.join("\n") });
        codeBuf = [];
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(raw);
      continue;
    }
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line === "---" || line === "***") {
      flushList();
      blocks.push({ type: "hr" });
      continue;
    }
    let m;
    if ((m = /^(#{1,3})\s+(.*)$/.exec(line))) {
      flushList();
      const lvl = m[1].length as 1 | 2 | 3;
      blocks.push({ type: (`h${lvl}` as "h1" | "h2" | "h3"), text: m[2] });
      continue;
    }
    if (/^>\s+/.test(line)) {
      flushList();
      blocks.push({ type: "quote", text: line.replace(/^>\s+/, "") });
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listItems.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listItems.push(line.replace(/^\d+\.\s+/, ""));
      continue;
    }
    flushList();
    blocks.push({ type: "p", text: line });
  }
  flushList();
  return blocks;
}

// Limpia inline markdown (** y *) para PDF/DOCX rendering plano
function stripInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1 ($2)");
}

// Spans con bold/italic para DOCX
interface Span {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
}

function parseInline(s: string): Span[] {
  const spans: Span[] = [];
  // Tokenizar **bold**, *italic*, `code`
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) spans.push({ text: s.slice(last, m.index) });
    const tok = m[0];
    if (tok.startsWith("**")) spans.push({ text: tok.slice(2, -2), bold: true });
    else if (tok.startsWith("`")) spans.push({ text: tok.slice(1, -1), code: true });
    else spans.push({ text: tok.slice(1, -1), italic: true });
    last = m.index + tok.length;
  }
  if (last < s.length) spans.push({ text: s.slice(last) });
  return spans.length ? spans : [{ text: s }];
}

async function exportPdf(md: string, opts: ExportOptions, filename: string): Promise<void> {
  const r = resolve(opts);
  const font = fontFor(r.fontFamily);
  const pdf = new jsPDF({
    unit: "mm",
    format: r.pageSize.toLowerCase() as "a4" | "letter",
    orientation: r.orientation,
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const m = r.marginCm * 10; // mm
  const usableW = pageW - m * 2;

  let y = m;
  const headerH = r.includeHeader ? 12 : 0;
  if (r.includeHeader) y += headerH;

  pdf.setFont(font.jspdf, "normal");
  pdf.setFontSize(r.fontSize);

  const lineH = r.fontSize * 0.45; // mm aprox
  const blocks = parseMarkdown(md);
  const accent = hexToRgb(r.accentHex);

  const ensureSpace = (need: number) => {
    if (y + need > pageH - m - (r.includeFooter ? 8 : 0)) {
      pdf.addPage();
      y = m + headerH;
    }
  };

  // Header en cada página (lo aplicamos al final iterando páginas)
  const writeWrap = (text: string, x: number, opt?: { bold?: boolean; italic?: boolean; size?: number; color?: [number, number, number] }) => {
    const size = opt?.size ?? r.fontSize;
    pdf.setFontSize(size);
    const style = opt?.bold && opt?.italic ? "bolditalic" : opt?.bold ? "bold" : opt?.italic ? "italic" : "normal";
    pdf.setFont(font.jspdf, style);
    if (opt?.color) pdf.setTextColor(opt.color[0], opt.color[1], opt.color[2]);
    else pdf.setTextColor(30, 30, 30);
    const wrapped = pdf.splitTextToSize(text, usableW - (x - m));
    for (const line of wrapped) {
      ensureSpace(size * 0.45 + 1);
      pdf.text(line, x, y);
      y += size * 0.45 + 1;
    }
    pdf.setTextColor(30, 30, 30);
  };

  for (const b of blocks) {
    if (b.type === "h1") {
      ensureSpace(14);
      y += 4;
      writeWrap(stripInline(b.text!), m, { bold: true, size: r.fontSize + 10, color: [accent.r, accent.g, accent.b] });
      y += 2;
    } else if (b.type === "h2") {
      ensureSpace(12);
      y += 3;
      writeWrap(stripInline(b.text!), m, { bold: true, size: r.fontSize + 5 });
      // línea bajo H2
      pdf.setDrawColor(accent.r, accent.g, accent.b);
      pdf.setLineWidth(0.3);
      pdf.line(m, y, m + Math.min(40, usableW), y);
      y += 3;
    } else if (b.type === "h3") {
      ensureSpace(9);
      y += 2;
      writeWrap(stripInline(b.text!), m, { bold: true, size: r.fontSize + 2 });
      y += 1;
    } else if (b.type === "p") {
      writeWrap(stripInline(b.text!), m);
      y += 2;
    } else if (b.type === "quote") {
      ensureSpace(lineH * 2);
      pdf.setDrawColor(accent.r, accent.g, accent.b);
      pdf.setLineWidth(0.6);
      const startY = y - 2;
      const lines = pdf.splitTextToSize(stripInline(b.text!), usableW - 8);
      for (const line of lines) {
        ensureSpace(lineH + 1);
        pdf.setFont(font.jspdf, "italic");
        pdf.setTextColor(80, 80, 80);
        pdf.text(line, m + 6, y);
        y += lineH + 1;
      }
      pdf.line(m + 1, startY, m + 1, y - 1);
      pdf.setTextColor(30, 30, 30);
      y += 2;
    } else if (b.type === "ul" || b.type === "ol") {
      let i = 1;
      for (const it of b.items ?? []) {
        const bullet = b.type === "ul" ? "•" : `${i}.`;
        const lines = pdf.splitTextToSize(stripInline(it), usableW - 8);
        lines.forEach((line: string, idx: number) => {
          ensureSpace(lineH + 1);
          pdf.setFont(font.jspdf, "normal");
          if (idx === 0) {
            pdf.setTextColor(accent.r, accent.g, accent.b);
            pdf.text(bullet, m, y);
            pdf.setTextColor(30, 30, 30);
          }
          pdf.text(line, m + 6, y);
          y += lineH + 1;
        });
        i++;
      }
      y += 1;
    } else if (b.type === "code") {
      const lines = (b.text ?? "").split("\n");
      pdf.setFillColor(245, 245, 240);
      const blockH = lines.length * (lineH + 0.5) + 4;
      ensureSpace(blockH);
      pdf.rect(m, y - 2, usableW, blockH, "F");
      pdf.setFont("courier", "normal");
      pdf.setFontSize(r.fontSize - 1);
      pdf.setTextColor(40, 40, 40);
      for (const line of lines) {
        pdf.text(line, m + 2, y + 2);
        y += lineH + 0.5;
      }
      y += 4;
    } else if (b.type === "hr") {
      ensureSpace(4);
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.2);
      pdf.line(m, y, pageW - m, y);
      y += 4;
    }
  }

  // Header + footer en todas las páginas
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    if (r.includeHeader && r.title) {
      pdf.setFont(font.jspdf, "italic");
      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      pdf.text(r.title, m, m - 2);
      if (r.includeDate) {
        const date = new Date().toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" });
        pdf.text(date, pageW - m, m - 2, { align: "right" });
      }
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.2);
      pdf.line(m, m, pageW - m, m);
    }
    if (r.includeFooter) {
      pdf.setFont(font.jspdf, "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(140, 140, 140);
      pdf.text(`${p} / ${totalPages}`, pageW / 2, pageH - m / 2, { align: "center" });
      if (r.author) pdf.text(r.author, m, pageH - m / 2);
    }
  }

  pdf.save(`${filename}.pdf`);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

// ============================================================================
// DOCX (docx-js)
// ============================================================================

async function exportDocx(md: string, opts: ExportOptions, filename: string): Promise<void> {
  const r = resolve(opts);
  const font = fontFor(r.fontFamily);
  const accent = r.accentHex.replace("#", "");
  const blocks = parseMarkdown(md);

  const dxa = (cm: number) => Math.round(cm * 567);
  const margin = dxa(r.marginCm);

  const sizePt = r.fontSize * 2; // half-points

  // Page size
  const pageWidthDxa = r.pageSize === "A4" ? 11906 : 12240;
  const pageHeightDxa = r.pageSize === "A4" ? 16838 : 15840;

  const children: Paragraph[] = [];

  for (const b of blocks) {
    if (b.type === "h1") {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 160 },
          children: [
            new TextRun({
              text: stripInline(b.text!),
              bold: true,
              size: sizePt + 16,
              color: accent,
              font: font.docx,
            }),
          ],
        }),
      );
    } else if (b.type === "h2") {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 120 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: accent, space: 1 },
          },
          children: [
            new TextRun({ text: stripInline(b.text!), bold: true, size: sizePt + 8, font: font.docx }),
          ],
        }),
      );
    } else if (b.type === "h3") {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
          children: [
            new TextRun({ text: stripInline(b.text!), bold: true, size: sizePt + 4, font: font.docx }),
          ],
        }),
      );
    } else if (b.type === "p") {
      children.push(
        new Paragraph({
          spacing: { after: 120, line: 320 },
          alignment: AlignmentType.JUSTIFIED,
          children: spansToRuns(parseInline(b.text!), sizePt, font.docx),
        }),
      );
    } else if (b.type === "quote") {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 120 },
          indent: { left: 360 },
          border: {
            left: { style: BorderStyle.SINGLE, size: 12, color: accent, space: 8 },
          },
          children: [
            new TextRun({ text: stripInline(b.text!), italics: true, size: sizePt, font: font.docx, color: "555555" }),
          ],
        }),
      );
    } else if (b.type === "ul") {
      for (const it of b.items ?? []) {
        children.push(
          new Paragraph({
            numbering: { reference: "bullets", level: 0 },
            spacing: { after: 60 },
            children: spansToRuns(parseInline(it), sizePt, font.docx),
          }),
        );
      }
    } else if (b.type === "ol") {
      for (const it of b.items ?? []) {
        children.push(
          new Paragraph({
            numbering: { reference: "numbers", level: 0 },
            spacing: { after: 60 },
            children: spansToRuns(parseInline(it), sizePt, font.docx),
          }),
        );
      }
    } else if (b.type === "code") {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 120 },
          shading: { fill: "F5F5F0", type: ShadingType.CLEAR, color: "auto" },
          children: [
            new TextRun({ text: b.text ?? "", font: "Courier New", size: sizePt - 2 }),
          ],
        }),
      );
    } else if (b.type === "hr") {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 80 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC", space: 1 } },
          children: [new TextRun({ text: "" })],
        }),
      );
    }
  }

  const headerChildren: Paragraph[] = [];
  if (r.includeHeader && r.title) {
    headerChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({ text: r.title, italics: true, size: 18, color: "888888", font: font.docx }),
          ...(r.includeDate
            ? [
                new TextRun({ text: "\t", font: font.docx }),
                new TextRun({
                  text: new Date().toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                  italics: true,
                  size: 18,
                  color: "888888",
                  font: font.docx,
                }),
              ]
            : []),
        ],
      }),
    );
  }

  const footerChildren: Paragraph[] = [];
  if (r.includeFooter) {
    footerChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Página ", size: 18, color: "888888", font: font.docx }),
          new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888", font: font.docx }),
          new TextRun({ text: " de ", size: 18, color: "888888", font: font.docx }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: "888888", font: font.docx }),
        ],
      }),
    );
  }

  const doc = new Document({
    creator: r.author || "Autodidacta",
    title: r.title,
    styles: {
      default: { document: { run: { font: font.docx, size: sizePt } } },
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
        {
          reference: "numbers",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: r.orientation === "landscape" ? pageHeightDxa : pageWidthDxa,
              height: r.orientation === "landscape" ? pageWidthDxa : pageHeightDxa,
              orientation: r.orientation === "landscape" ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
            },
            margin: { top: margin, bottom: margin, left: margin, right: margin },
          },
        },
        headers: headerChildren.length
          ? { default: new Header({ children: headerChildren }) }
          : undefined,
        footers: footerChildren.length
          ? { default: new Footer({ children: footerChildren }) }
          : undefined,
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${filename}.docx`);
}

function spansToRuns(spans: Span[], size: number, font: string): TextRun[] {
  return spans.map(
    (s) =>
      new TextRun({
        text: s.text,
        bold: s.bold,
        italics: s.italic,
        size,
        font: s.code ? "Courier New" : font,
      }),
  );
}

// ============================================================================
// Utilidades
// ============================================================================

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Helper: convertir uno de nuestros outputs generados al ExportableContent
export function asExportable(
  type: "summary" | "study_guide" | "business_plan" | "timeline" | "faq",
  content: unknown,
): ExportableContent {
  if (type === "timeline") return { kind: "timeline", ...(content as Omit<TimelineDoc, "kind">) };
  if (type === "faq") return { kind: "faq", ...(content as Omit<FaqDoc, "kind">) };
  // markdown content tiene { markdown: string }
  const c = content as { markdown?: string };
  return { kind: "markdown", markdown: c.markdown ?? "" };
}
