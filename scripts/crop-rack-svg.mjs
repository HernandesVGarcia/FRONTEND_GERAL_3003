/**
 * Calcula bbox do rack no SVG Visio (transforms + paths) e grava rack-visio.svg recortado.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '../src/assets/visio_racks/rask-svg.svg');
const out = path.join(__dirname, '../src/assets/visio_racks/rack-visio.svg');

const xml = fs.readFileSync(src, 'utf8');

const pathPointRe =
  /(?:^|[\s,])(-?\d+\.?\d*)\s+(-?\d+\.?\d*)(?:\s|$)/g;

function parsePathPoints(d) {
  const pts = [];
  const tokens = d.match(/-?\d+\.?\d*/g);
  if (!tokens || tokens.length < 2) return pts;
  for (let i = 0; i + 1 < tokens.length; i += 2) {
    pts.push([Number(tokens[i]), Number(tokens[i + 1])]);
  }
  return pts;
}

const groupRe =
  /<g[^>]*transform="translate\(([-\d.]+),([-\d.]+)\)"[^>]*>([\s\S]*?)<\/g>/g;

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;

for (const m of xml.matchAll(groupRe)) {
  const tx = Number(m[1]);
  const ty = Number(m[2]);
  const inner = m[3];
  const pathDs = [...inner.matchAll(/<path d="([^"]+)"/g)].map((x) => x[1]);
  for (const d of pathDs) {
    for (const [lx, ly] of parsePathPoints(d)) {
      const x = tx + lx;
      const y = ty + ly;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  const texts = [...inner.matchAll(/<text x="([-\d.]+)" y="([-\d.]+)"/g)];
  for (const t of texts) {
    const x = tx + Number(t[1]);
    const y = ty + Number(t[2]);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
}

const pad = 4;
const vx = minX - pad;
const vy = minY - pad;
const vw = maxX - minX + 2 * pad;
const vh = maxY - minY + 2 * pad;

let cropped = xml.replace(
  /width="[^"]+"\s*\n\s*height="[^"]+" viewBox="[^"]+"/,
  `width="${vw.toFixed(2)}" height="${vh.toFixed(2)}" viewBox="${vx.toFixed(2)} ${vy.toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}"`,
);

cropped = cropped.replace(
  /<!-- Gerado pelo Microsoft Office Visio[^>]*-->/,
  `<!-- Crop automático: scripts/crop-rack-svg.mjs (origem rask-svg.svg) -->`,
);

fs.writeFileSync(out, cropped);
console.log(`bbox: ${minX.toFixed(1)}..${maxX.toFixed(1)} x ${minY.toFixed(1)}..${maxY.toFixed(1)}`);
console.log(`viewBox: ${vx.toFixed(2)} ${vy.toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}`);
console.log(`Wrote ${out}`);
