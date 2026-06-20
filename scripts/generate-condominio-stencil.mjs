/**
 * Gera condominio-prumada.stencil.json a partir de Condominio__dxf.dxf.
 * Uso: node scripts/generate-condominio-stencil.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dxfPath = path.join(root, 'src/assets/esboço_condominio/Condominio__dxf.dxf');
const outPath = path.join(root, 'src/app/Stencil/condominio-prumada/condominio-prumada.stencil.json');

const content = fs.readFileSync(dxfPath, 'utf8');
const lines = content.split(/\r?\n/);
const pairs = [];
for (let i = 0; i + 1 < lines.length; i += 2) {
  const code = Number.parseInt(lines[i].trim(), 10);
  if (Number.isFinite(code)) {
    pairs.push({ code, value: lines[i + 1].trim() });
  }
}

function isTargetLayer(layer) {
  return layer === 'TERREO' || /^ANDAR\d+$/i.test(layer);
}

function parseLwpolyline(start) {
  let layer = '';
  let pendingX = null;
  const verticesM = [];
  for (let i = start; i < pairs.length; i++) {
    const p = pairs[i];
    if (p.code === 0) break;
    if (p.code === 8) layer = p.value;
    else if (p.code === 10) pendingX = Number(p.value);
    else if (p.code === 20 && pendingX !== null) {
      verticesM.push({ x: pendingX, y: Number(p.value) });
      pendingX = null;
    }
  }
  if (!layer || verticesM.length < 3) return null;
  return { layer, verticesM };
}

let inEntities = false;
const shapes = [];
for (let i = 0; i < pairs.length; i++) {
  if (
    pairs[i].code === 0 &&
    pairs[i].value === 'SECTION' &&
    pairs[i + 1]?.code === 2 &&
    pairs[i + 1].value === 'ENTITIES'
  ) {
    inEntities = true;
  }
  if (inEntities && pairs[i].code === 0 && pairs[i].value === 'ENDSEC') break;
  if (inEntities && pairs[i].code === 0 && pairs[i].value === 'LWPOLYLINE') {
    const shape = parseLwpolyline(i + 1);
    if (shape && isTargetLayer(shape.layer)) shapes.push(shape);
  }
}

let maxAndares = 0;
for (const s of shapes) {
  const m = s.layer.match(/^ANDAR(\d+)$/i);
  if (m) maxAndares = Math.max(maxAndares, Number.parseInt(m[1], 10));
}

const stencil = {
  version: 1,
  source: 'Condominio__dxf.dxf',
  maxAndares,
  shapes,
};

fs.writeFileSync(outPath, JSON.stringify(stencil));
console.log(`Stencil gerado: ${shapes.length} shapes, maxAndares=${maxAndares}`);
