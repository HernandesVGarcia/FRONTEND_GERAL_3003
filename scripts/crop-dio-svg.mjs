/**
 * Recorta bbox do DIO no SVG Visio → dio-visio.svg (preview GoJS arrastável).
 * Entrada: export bruto (página inteira). NÃO copie o export direto para dio-visio.svg.
 * Uso: node scripts/crop-dio-svg.mjs [src/assets/visio_racks/dio1.svg]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racksDir = path.join(__dirname, '../src/assets/visio_racks');

const srcArg = process.argv[2];
/** Não usar dio-visio.svg como entrada padrão (é a saída). Export bruto → dio1.svg ou passe o caminho. */
const defaultCandidates = ['dio1.svg', 'dio.svg', 'dio_SVG.svg', 'dio-export.svg'].map((f) =>
  path.join(racksDir, f),
);
const src = srcArg
  ? path.resolve(process.cwd(), srcArg)
  : defaultCandidates.find((p) => fs.existsSync(p)) ?? defaultCandidates[0];
const out = path.join(racksDir, 'dio-visio.svg');

if (!fs.existsSync(src)) {
  console.error(`Arquivo não encontrado: ${src}`);
  console.error('Exporte o DIO do Visio para dio.svg ou dio1.svg e rode este script.');
  process.exit(1);
}

const xmlRaw = fs.readFileSync(src, 'utf8');
/** Visio embute preview NetZoom em foreignObject com coords gigantes — quebra o bbox. */
const xml = xmlRaw.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '');

function parsePathPoints(d) {
  const pts = [];
  const tokens = d.match(/-?\d+\.?\d*(?:e[-+]?\d+)?/gi);
  if (!tokens || tokens.length < 2) return pts;
  for (let i = 0; i + 1 < tokens.length; i += 2) {
    pts.push([Number(tokens[i]), Number(tokens[i + 1])]);
  }
  return pts;
}

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;

function resetBbox() {
  minX = Infinity;
  minY = Infinity;
  maxX = -Infinity;
  maxY = -Infinity;
}

/** Faixa típica do DIO no SVG Visio POP (mesma escala do rack-visio.svg). */
const PAGE_X0 = 100;
const PAGE_X1 = 420;
const PAGE_Y0 = 130;
const PAGE_Y1 = 250;

function grow(x, y) {
  if (x < PAGE_X0 || x > PAGE_X1 || y < PAGE_Y0 || y > PAGE_Y1) return;
  minX = Math.min(minX, x);
  minY = Math.min(minY, y);
  maxX = Math.max(maxX, x);
  maxY = Math.max(maxY, y);
}

function bboxValid(minW = 40, minH = 8) {
  if (!Number.isFinite(minX)) return false;
  const w = maxX - minX;
  const h = maxY - minY;
  return w >= minW && h >= minH;
}

function scanGeometry(fragment, tx, ty) {
  for (const m of fragment.matchAll(/<path d="([^"]+)"/g)) {
    const d = m[1];
    if (/[aA]/.test(d)) continue;
    for (const [lx, ly] of parsePathPoints(d)) {
      grow(tx + lx, ty + ly);
    }
  }
  for (const m of fragment.matchAll(
    /<rect[^>]*\bx="([-\d.eE+]+)"[^>]*\by="([-\d.eE+]+)"[^>]*\bwidth="([-\d.eE+]+)"[^>]*\bheight="([-\d.eE+]+)"/g,
  )) {
    const x = Number(m[1]);
    const y = Number(m[2]);
    const w = Number(m[3]);
    const h = Number(m[4]);
    grow(tx + x, ty + y);
    grow(tx + x + w, ty + y + h);
  }
  for (const m of fragment.matchAll(
    /<ellipse[^>]*\bcx="([-\d.eE+]+)"[^>]*\bcy="([-\d.eE+]+)"[^>]*\brx="([-\d.eE+]+)"[^>]*\bry="([-\d.eE+]+)"/g,
  )) {
    const cx = Number(m[1]);
    const cy = Number(m[2]);
    const rx = Number(m[3]);
    const ry = Number(m[4]);
    grow(tx + cx - rx, ty + cy - ry);
    grow(tx + cx + rx, ty + cy + ry);
  }
}

function extractGroupAt(fullXml, gStart) {
  let depth = 0;
  let i = gStart;
  while (i < fullXml.length) {
    const open = fullXml.indexOf('<g', i);
    const close = fullXml.indexOf('</g>', i);
    if (close < 0) break;
    if (open >= 0 && open < close) {
      depth += 1;
      i = open + 2;
    } else {
      depth -= 1;
      i = close + 4;
      if (depth === 0) return fullXml.slice(gStart, i);
    }
  }
  return fullXml;
}

function extractForegroundPage(fullXml) {
  const marker = 'v:groupContext="foregroundPage"';
  const idx = fullXml.indexOf(marker);
  if (idx < 0) return fullXml;
  const gStart = fullXml.lastIndexOf('<g ', idx);
  if (gStart < 0) return fullXml;
  return extractGroupAt(fullXml, gStart);
}

function extractDioGroupMarkup(fullXml) {
  const titleRe = /<title>DIO_\d+<\/title>/;
  const titleMatch = fullXml.match(titleRe);
  if (titleMatch) {
    const titleIdx = fullXml.indexOf(titleMatch[0]);
    const gStart = fullXml.lastIndexOf('<g ', titleIdx);
    if (gStart >= 0) return extractGroupAt(fullXml, gStart);
  }
  for (const marker of ['id="group15-1"', 'id="group14-1"']) {
    const idx = fullXml.indexOf(marker);
    if (idx >= 0) {
      const gStart = fullXml.lastIndexOf('<g ', idx);
      if (gStart >= 0) return extractGroupAt(fullXml, gStart);
    }
  }
  return null;
}

function walkGroupsLeaf(fragment, tx, ty) {
  const groupOpenRe = /<g\b([^>]*)>/g;
  const opens = [...fragment.matchAll(groupOpenRe)];
  if (opens.length === 0) {
    scanGeometry(fragment, tx, ty);
    return;
  }
  for (const match of opens) {
    const attrs = match[1];
    if (/rotate\s*\(/.test(attrs)) continue;
    const innerStartIdx = match.index + match[0].length;
    let depth = 1;
    let pos = innerStartIdx;
    while (depth > 0 && pos < fragment.length) {
      const nextOpen = fragment.indexOf('<g', pos);
      const nextClose = fragment.indexOf('</g>', pos);
      if (nextClose < 0) break;
      if (nextOpen >= 0 && nextOpen < nextClose) {
        depth += 1;
        pos = nextOpen + 2;
      } else {
        depth -= 1;
        if (depth === 0) {
          const inner = fragment.slice(innerStartIdx, nextClose);
          const tr = attrs.match(/transform="translate\(([-\d.eE+]+),([-\d.eE+]+)\)"/);
          const cTx = tx + (tr ? Number(tr[1]) : 0);
          const cTy = ty + (tr ? Number(tr[2]) : 0);
          walkGroupsLeaf(inner, cTx, cTy);
          break;
        }
        pos = nextClose + 4;
      }
    }
  }
}

function bboxFromGroupMarkup(markup) {
  resetBbox();
  const dioClean = markup.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '');
  const rootTr = dioClean.match(/transform="translate\(([-\d.eE+]+),([-\d.eE+]+)\)"/);
  const rootTx = rootTr ? Number(rootTr[1]) : 0;
  const rootTy = rootTr ? Number(rootTr[2]) : 0;
  const gIdx = dioClean.indexOf('<g');
  if (gIdx < 0) return false;
  const innerStart = dioClean.indexOf('>', gIdx) + 1;
  const innerEnd = dioClean.lastIndexOf('</g>');
  if (innerEnd <= innerStart) return false;
  walkGroupsLeaf(dioClean.slice(innerStart, innerEnd), rootTx, rootTy);
  return bboxValid();
}

/** Fallback estilo crop-rack: grupos com translate + paths/rects diretos */
function bboxRackStyle(fullXml) {
  resetBbox();
  const groupRe =
    /<g[^>]*transform="translate\(([-\d.eE+]+),([-\d.eE+]+)\)"[^>]*>([\s\S]*?)<\/g>/g;
  for (const m of fullXml.matchAll(groupRe)) {
    const tx = Number(m[1]);
    const ty = Number(m[2]);
    const inner = m[3];
    scanGeometry(inner, tx, ty);
  }
  return bboxValid(20, 5);
}

let bboxMode = 'dio-group';
let dioOnly = extractDioGroupMarkup(xml);
if (!dioOnly || !bboxFromGroupMarkup(dioOnly)) {
  const page = extractForegroundPage(xml);
  resetBbox();
  if (bboxFromGroupMarkup(page)) {
    bboxMode = 'foreground-page-filtered';
  } else if (bboxRackStyle(xml)) {
    bboxMode = 'rack-style-scan';
  } else {
    console.error('Não foi possível calcular bbox do DIO.');
    console.error('Confira dio1.svg (export Visio completo) ou passe o caminho do arquivo.');
    process.exit(1);
  }
}

const pad = 6;
const vx = minX - pad;
const vy = minY - pad;
const vw = maxX - minX + 2 * pad;
const vh = maxY - minY + 2 * pad;

const viewBoxAttr = `viewBox="${vx.toFixed(2)} ${vy.toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}"`;
const sizeAttrs = `width="${vw.toFixed(2)}" height="${vh.toFixed(2)}" ${viewBoxAttr}`;

let cropped = xmlRaw.replace(
  /width="[^"]+"\s*\n\s*height="[^"]+"\s+viewBox="[^"]+"/,
  sizeAttrs,
);
if (!cropped.includes(`viewBox="${vx.toFixed(2)}`)) {
  cropped = xmlRaw
    .replace(/viewBox="[^"]+"/, viewBoxAttr)
    .replace(/width="[^"]+"/, `width="${vw.toFixed(2)}"`)
    .replace(/height="[^"]+"/, `height="${vh.toFixed(2)}"`);
}

cropped = cropped.replace(
  /<!-- Gerado pelo Microsoft Office Visio[^>]*-->/,
  `<!-- Crop: scripts/crop-dio-svg.mjs (origem ${path.basename(src)}) -->`,
);
cropped = cropped.replace(
  /<!-- Crop: scripts\/crop-dio-svg\.mjs[^>]*-->/,
  `<!-- Crop: scripts/crop-dio-svg.mjs (origem ${path.basename(src)}) -->`,
);

cropped = cropped.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '');
fs.writeFileSync(out, cropped);
console.log(`Source: ${src}`);
console.log(`bbox mode: ${bboxMode}`);
console.log(`bbox: ${minX.toFixed(1)}..${maxX.toFixed(1)} x ${minY.toFixed(1)}..${maxY.toFixed(1)}`);
console.log(`viewBox: ${vx.toFixed(2)} ${vy.toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}`);
console.log(`aspect (h/w): ${(vh / vw).toFixed(4)}`);
console.log(
  `GoJS constants: DIO_VISIO_VB_W=${vw.toFixed(2)} DIO_VISIO_VB_H=${vh.toFixed(2)}`,
);
console.log(`Wrote ${out}`);

if (vw > 400 || vh > 400) {
  console.warn(
    'AVISO: viewBox muito grande — confira se a entrada não é dio-visio.svg já recortado ou export errado.',
  );
}
