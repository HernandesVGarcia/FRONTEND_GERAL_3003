/**
 * Extrai centros dos conectores (rect st3 2.6336×3.6) em coords normalizadas do viewBox.
 * Uso: node scripts/parse-dio-port-centers.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.join(__dirname, '../src/assets/visio_racks/dio-visio.svg');
const xml = fs.readFileSync(svgPath, 'utf8');

const vbMatch = xml.match(/viewBox="\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*"/);
if (!vbMatch) throw new Error('viewBox missing');
const [vbx, vby, vbw, vbh] = vbMatch.slice(1).map(Number);

/** Acumula transform translate/rotate em cadeia simplificada (Visio DIO: só translate + rotate -90). */
function parseTransform(str) {
  const out = { tx: 0, ty: 0, rot: 0 };
  if (!str) return out;
  const tr = str.match(/translate\(\s*([-\d.eE+]+)\s*,\s*([-\d.eE+]+)\s*\)/);
  if (tr) {
    out.tx += Number(tr[1]);
    out.ty += Number(tr[2]);
  }
  const rot = str.match(/rotate\(\s*(-?\d+(?:\.\d+)?)\s*\)/);
  if (rot) out.rot += Number(rot[1]);
  return out;
}

function apply(t, x, y) {
  let { tx, ty, rot } = t;
  if (rot === -90 || rot === 270) {
    const nx = -y;
    const ny = x;
    x = nx;
    y = ny;
  }
  return { x: x + tx, y: y + ty };
}

function mergeTransforms(stack) {
  let x = 0;
  let y = 0;
  for (const t of stack) {
    const p = apply(t, x, y);
    x = p.x;
    y = p.y;
  }
  return { tx: x, ty: y };
}

/** Parser XML leve: percorre <g transform> empilhando. */
const stack = [{ tx: 0, ty: 0, rot: 0 }];
const centers = [];
const tagRe = /<\/?g\b[^>]*>|<rect\b[^>]*\/>|<rect\b[^>]*>/gi;
let m;
while ((m = tagRe.exec(xml))) {
  const tag = m[0];
  if (tag.startsWith('</g')) {
    if (stack.length > 1) stack.pop();
    continue;
  }
  if (tag.startsWith('<g')) {
    const tr = tag.match(/transform="([^"]+)"/);
    const parent = stack[stack.length - 1];
    const local = parseTransform(tr?.[1] ?? '');
    const abs = apply(parent, local.tx, local.ty);
    stack.push({ tx: abs.x, ty: abs.y, rot: local.rot });
    continue;
  }
  if (tag.includes('class="st3"') && /width="2\.6336"/.test(tag) && /height="3\.6"/.test(tag)) {
    const x = Number(tag.match(/\bx="([^"]+)"/)?.[1] ?? 0);
    const y = Number(tag.match(/\by="([^"]+)"/)?.[1] ?? 0);
    const w = 2.6336;
    const h = 3.6;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const t = stack[stack.length - 1];
    const p = apply(t, cx, cy);
    const nx = (p.x - vbx) / vbw;
    const ny = (p.y - vby) / vbh;
    centers.push({ x: p.x, y: p.y, nx, ny });
  }
}

centers.sort((a, b) => a.y - b.y || a.x - b.x);
console.log('viewBox', { vbx, vby, vbw, vbh });
console.log('connectors', centers.length);

if (centers.length >= 36) {
  const rows = [];
  let row = [centers[0]];
  for (let i = 1; i < centers.length; i += 1) {
    if (Math.abs(centers[i].y - row[0].y) > 2) {
      rows.push(row.sort((a, b) => a.x - b.x));
      row = [centers[i]];
    } else {
      row.push(centers[i]);
    }
  }
  rows.push(row.sort((a, b) => a.x - b.x));
  console.log('rows', rows.map((r) => r.length));
  const picked = rows.slice(0, 3).flatMap((r) => r.slice(0, 12));
  if (picked.length === 36) {
    const left = Math.min(...picked.map((p) => p.nx));
    const right = Math.max(...picked.map((p) => p.nx));
    const top = Math.min(...picked.map((p) => p.ny));
    const bottom = Math.max(...picked.map((p) => p.ny));
    console.log('normalized bbox', { left, top, right, bottom, gridW: right - left, gridH: bottom - top });
    console.log('first row nx', rows[0].slice(0, 12).map((p) => p.nx.toFixed(4)));
    console.log('first row ny', rows[0].slice(0, 12).map((p) => p.ny.toFixed(4)));
    const flat = rows.slice(0, 3).flatMap((r) => r.slice(0, 12));
    console.log(
      'portCenters',
      JSON.stringify(flat.map((p) => ({ nx: +p.nx.toFixed(5), ny: +p.ny.toFixed(5) }))),
    );
  }
}
