import { Graphviz } from '@hpcc-js/wasm-graphviz';
import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';

const PDF_MARGIN_MM = 10;
const RASTER_FALLBACK_SCALE = 3;
const MAX_CANVAS_EDGE = 16384;

export interface SaveGraphvizPdfFromDotParams {
  dotContent: string;
  title?: string | null;
  fileName: string;
}

function getSvgDimensions(svgEl: Element): { w: number; h: number } {
  const vb = svgEl.getAttribute('viewBox');
  if (vb) {
    const parts = vb.trim().split(/[\s,]+/).map(parseFloat);
    if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
      return { w: parts[2], h: parts[3] };
    }
  }
  const parseLen = (s: string | null): number => {
    if (!s) return 0;
    const m = /^([\d.]+)/.exec(s.trim());
    return m ? parseFloat(m[1]) : 0;
  };
  const w = parseLen(svgEl.getAttribute('width'));
  const h = parseLen(svgEl.getAttribute('height'));
  if (w > 0 && h > 0) {
    return { w, h };
  }
  return { w: 800, h: 600 };
}

function parseSvgRoot(svgString: string): Element {
  const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('SVG inválido');
  }
  return doc.documentElement;
}

async function rasterizeSvgToCanvas(svgString: string): Promise<HTMLCanvasElement> {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Falha ao carregar SVG para raster'));
      img.src = url;
    });
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;
    if (!w || !h) {
      const root = parseSvgRoot(svgString);
      const d = getSvgDimensions(root);
      w = d.w;
      h = d.h;
    }
    const maxDim = Math.max(w, h, 1);
    let scale = RASTER_FALLBACK_SCALE;
    scale = Math.min(scale, MAX_CANVAS_EDGE / maxDim);
    if (!Number.isFinite(scale) || scale < 1) {
      scale = 1;
    }
    const tw = Math.min(Math.round(w * scale), MAX_CANVAS_EDGE);
    const th = Math.min(Math.round(h * scale), MAX_CANVAS_EDGE);
    const canvas = document.createElement('canvas');
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D indisponível');
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tw, th);
    ctx.drawImage(img, 0, 0, tw, th);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function buildPdfWithVectorSvg(
  svgEl: Element,
  title: string | undefined | null,
  now: Date,
): Promise<jsPDF> {
  const { w: svgW, h: svgH } = getSvgDimensions(svgEl);
  const orientation = svgW >= svgH ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();

  let headerBottom = PDF_MARGIN_MM;
  if (title != null && String(title).trim() !== '') {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(String(title), pdfW / 2, 20, { align: 'center' });
    headerBottom = 28;
  }
  const dateStr =
    now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Gerado em: ${dateStr}`, pdfW / 2, headerBottom + 6, {
    align: 'center',
  });
  const contentTop = headerBottom + 14;
  const availW = pdfW - 2 * PDF_MARGIN_MM;
  const availH = pdfH - contentTop - PDF_MARGIN_MM;
  const scale = Math.min(availW / svgW, availH / svgH);
  const drawW = svgW * scale;
  const drawH = svgH * scale;
  const x = (pdfW - drawW) / 2;
  const y = contentTop;

  await svg2pdf(svgEl, pdf, {
    x,
    y,
    width: drawW,
    height: drawH,
  });
  return pdf;
}

function buildPdfWithRasterCanvas(
  canvas: HTMLCanvasElement,
  title: string | undefined | null,
  now: Date,
): jsPDF {
  const orientation =
    canvas.width >= canvas.height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  let headerBottom = PDF_MARGIN_MM;
  if (title != null && String(title).trim() !== '') {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(String(title), pdfW / 2, 20, { align: 'center' });
    headerBottom = 28;
  }
  const dateStr =
    now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Gerado em: ${dateStr}`, pdfW / 2, headerBottom + 6, {
    align: 'center',
  });
  const contentTop = headerBottom + 14;
  const availW = pdfW - 2 * PDF_MARGIN_MM;
  const availH = pdfH - contentTop - PDF_MARGIN_MM;
  const scaleX = availW / imgWidth;
  const scaleY = availH / imgHeight;
  const s = Math.min(scaleX, scaleY);
  const finalWidth = imgWidth * s;
  const finalHeight = imgHeight * s;
  const x = (pdfW - finalWidth) / 2;
  const y = contentTop;

  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
  return pdf;
}

/**
 * Gera PDF a partir do DOT via SVG (Graphviz WASM): tenta vetor com svg2pdf;
 * se falhar, rasteriza o SVG para canvas e incorpora como PNG.
 */
export async function saveGraphvizPdfFromDot(
  params: SaveGraphvizPdfFromDotParams,
): Promise<void> {
  const { dotContent, title, fileName } = params;
  if (!dotContent?.trim()) {
    throw new Error('Conteúdo DOT não disponível');
  }

  const graphviz = await Graphviz.load();
  const svgString = await graphviz.layout(dotContent, 'svg', 'dot');
  const now = new Date();
  const svgEl = parseSvgRoot(svgString);

  try {
    const pdf = await buildPdfWithVectorSvg(svgEl, title, now);
    pdf.save(fileName);
  } catch (err) {
    console.warn('[PDF] Vetorial falhou, a usar raster a partir do SVG:', err);
    const canvas = await rasterizeSvgToCanvas(svgString);
    const pdf = buildPdfWithRasterCanvas(canvas, title, now);
    pdf.save(fileName);
  }
}
