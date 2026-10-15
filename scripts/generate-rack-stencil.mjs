/**
 * Extrai LWPOLYLINE de rack DXF (Visio) → rack-42u.stencil.json (preview GoJS).
 *
 * Uso:
 *   node scripts/generate-rack-stencil.mjs
 *   node scripts/generate-rack-stencil.mjs src/assets/visio_racks/rack-desagrupado.dxf
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const dxfArg = process.argv[2];
const dxfPath = dxfArg
  ? path.resolve(process.cwd(), dxfArg)
  : path.join(root, 'src/assets/visio_racks/rack-desagrupado.dxf');
const outPath = path.join(root, 'src/assets/visio_racks/rack-42u.stencil.json');

const content = fs.readFileSync(dxfPath, 'utf8');
const lines = content.split(/\r?\n/);
const pairs = [];
for (let i = 0; i + 1 < lines.length; i += 2) {
  const code = Number.parseInt(lines[i].trim(), 10);
  if (Number.isFinite(code)) {
    pairs.push({ code, value: lines[i + 1].trim() });
  }
}

function parseLwpolyline(start) {
  let closed = false;
  let pendingX = null;
  const vertices = [];
  for (let i = start; i < pairs.length; i++) {
    const p = pairs[i];
    if (p.code === 0) break;
    if (p.code === 70) closed = (Number(p.value) & 1) === 1;
    else if (p.code === 10) pendingX = Number(p.value);
    else if (p.code === 20 && pendingX !== null) {
      vertices.push([pendingX, Number(p.value)]);
      pendingX = null;
    }
  }
  if (vertices.length < 2) return null;
  const [fx, fy] = vertices[0];
  const [lx, ly] = vertices[vertices.length - 1];
  const closesAtEnd = Math.hypot(fx - lx, fy - ly) < 1e-5;
  return { closed: closed || closesAtEnd, vertices };
}

function collectFromBlock(blockName) {
  let inBlock = false;
  const polylines = [];
  for (let i = 0; i < pairs.length; i++) {
    if (pairs[i].code === 0 && pairs[i].value === 'BLOCK') {
      inBlock = false;
      for (let j = i + 1; j < Math.min(i + 30, pairs.length); j++) {
        if (pairs[j].code === 2 && pairs[j].value === blockName) {
          inBlock = true;
          break;
        }
        if (pairs[j].code === 0) break;
      }
    }
    if (inBlock && pairs[i].code === 0 && pairs[i].value === 'ENDBLK') {
      break;
    }
    if (inBlock && pairs[i].code === 0 && pairs[i].value === 'LWPOLYLINE') {
      const pl = parseLwpolyline(i + 1);
      if (pl) polylines.push(pl);
    }
  }
  return polylines;
}

function collectFromEntities() {
  let inEntities = false;
  const polylines = [];
  for (let i = 0; i < pairs.length; i++) {
    if (pairs[i].code === 0 && pairs[i].value === 'SECTION') {
      const next = pairs[i + 1];
      inEntities = next?.code === 2 && next.value === 'ENTITIES';
    }
    if (inEntities && pairs[i].code === 0 && pairs[i].value === 'ENDSEC') {
      break;
    }
    if (inEntities && pairs[i].code === 0 && pairs[i].value === 'LWPOLYLINE') {
      const pl = parseLwpolyline(i + 1);
      if (pl) polylines.push(pl);
    }
  }
  return polylines;
}

const blockName = '42U';
let extractFrom = 'block';
let polylines = collectFromBlock(blockName);
if (polylines.length === 0) {
  polylines = collectFromEntities();
  extractFrom = 'ENTITIES';
}

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
for (const pl of polylines) {
  for (const [x, y] of pl.vertices) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
}

const widthDxf = maxX - minX;
const heightDxf = maxY - minY;
const targetW = 280;
const scale = widthDxf > 0 ? targetW / widthDxf : 1;

/** DXF Y para cima → GoJS Y para baixo, origem normalizada. */
function mapPoint(x, y) {
  return {
    x: (x - minX) * scale,
    y: (maxY - y) * scale,
  };
}

const paths = polylines.map((pl) => ({
  closed: pl.closed,
  points: pl.vertices.map(([x, y]) => mapPoint(x, y)),
}));

const dxfBase = path.basename(dxfPath);
const stencil = {
  version: 1,
  source: dxfBase,
  block: blockName,
  extractFrom,
  note:
    paths.length === 0
      ? `Nenhuma LWPOLYLINE em bloco ${blockName} nem em ENTITIES. Preview GoJS usa desenho nativo.`
      : extractFrom === 'ENTITIES'
        ? `Bloco ${blockName} vazio no DXF; geometria lida de ENTITIES (Visio desagrupado).`
        : undefined,
  dxfBounds: paths.length ? { minX, minY, maxX, maxY } : null,
  width: paths.length ? widthDxf * scale : null,
  height: paths.length ? heightDxf * scale : null,
  uCount: 42,
  pathCount: paths.length,
  paths,
};

fs.writeFileSync(outPath, JSON.stringify(stencil));
console.log(`DXF: ${dxfPath}`);
console.log(`Extract: ${extractFrom} → ${paths.length} paths`);
console.log(`Wrote → ${outPath}`);
if (paths.length) {
  console.log(`Bounds (DXF): ${minX.toFixed(2)}..${maxX.toFixed(2)} x ${minY.toFixed(2)}..${maxY.toFixed(2)}`);
  console.log(`Size (scaled): ${stencil.width.toFixed(1)} x ${stencil.height.toFixed(1)}`);
} else {
  console.warn(stencil.note);
}
