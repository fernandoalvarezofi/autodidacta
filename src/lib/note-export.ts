import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const PAGE_W = 794; // A4 @ 96dpi
const MARGIN = 32;

async function snapshot(el: HTMLElement) {
  return html2canvas(el, {
    backgroundColor: "#fbf6ee",
    scale: 2,
    useCORS: true,
    logging: false,
  });
}

export async function exportNoteAsPng(el: HTMLElement, filename: string) {
  const canvas = await snapshot(el);
  return new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("No se pudo generar PNG"));
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}

export async function exportNoteAsPdf(el: HTMLElement, filename: string) {
  const canvas = await snapshot(el);
  const imgData = canvas.toDataURL("image/jpeg", 0.92);

  const pdf = new jsPDF({ unit: "px", format: "a4", orientation: "portrait", hotfixes: ["px_scaling"] });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();
  const usableW = pdfW - MARGIN * 2;
  const ratio = canvas.height / canvas.width;
  const imgH = usableW * ratio;

  if (imgH <= pdfH - MARGIN * 2) {
    pdf.addImage(imgData, "JPEG", MARGIN, MARGIN, usableW, imgH);
  } else {
    // Multi-página: cortamos el canvas en bandas del alto de página
    const pageBandH = ((pdfH - MARGIN * 2) * canvas.width) / usableW;
    const pages = Math.ceil(canvas.height / pageBandH);
    for (let i = 0; i < pages; i++) {
      const sy = i * pageBandH;
      const sh = Math.min(pageBandH, canvas.height - sy);
      const tmp = document.createElement("canvas");
      tmp.width = canvas.width;
      tmp.height = sh;
      const ctx = tmp.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);
      const slice = tmp.toDataURL("image/jpeg", 0.92);
      const sliceH = (usableW * sh) / canvas.width;
      if (i > 0) pdf.addPage();
      pdf.addImage(slice, "JPEG", MARGIN, MARGIN, usableW, sliceH);
    }
  }
  pdf.save(`${filename}.pdf`);
}

export function safeFilename(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60) || "nota";
}

// Type augmentation for jsPDF hotfixes option
declare module "jspdf" {
  interface jsPDFOptions {
    hotfixes?: string[];
  }
}
