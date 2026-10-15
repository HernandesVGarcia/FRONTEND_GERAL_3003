/** Centro normalizado (0–1) do conector no viewBox do dio-visio.svg. */
export type DioPortCenterNorm = { nx: number; ny: number };

/** Fallback — gerado por scripts/parse-dio-port-centers.mjs a partir do dio-visio.svg atual. */
export const DIO_PORT_CENTERS_FALLBACK: DioPortCenterNorm[] = [
  { nx: 0.18644, ny: 0.27057 },
  { nx: 0.24358, ny: 0.27057 },
  { nx: 0.29881, ny: 0.27057 },
  { nx: 0.35786, ny: 0.27057 },
  { nx: 0.415, ny: 0.27057 },
  { nx: 0.47214, ny: 0.27057 },
  { nx: 0.52928, ny: 0.27057 },
  { nx: 0.58642, ny: 0.27057 },
  { nx: 0.64356, ny: 0.27057 },
  { nx: 0.7007, ny: 0.27057 },
  { nx: 0.75784, ny: 0.27057 },
  { nx: 0.81498, ny: 0.27057 },
  { nx: 0.18644, ny: 0.48606 },
  { nx: 0.24358, ny: 0.48606 },
  { nx: 0.29881, ny: 0.48606 },
  { nx: 0.35786, ny: 0.48606 },
  { nx: 0.415, ny: 0.48606 },
  { nx: 0.47214, ny: 0.48606 },
  { nx: 0.52928, ny: 0.48606 },
  { nx: 0.58642, ny: 0.48606 },
  { nx: 0.64356, ny: 0.48606 },
  { nx: 0.7007, ny: 0.48606 },
  { nx: 0.75784, ny: 0.48606 },
  { nx: 0.81497, ny: 0.48606 },
  { nx: 0.18625, ny: 0.7099 },
  { nx: 0.24339, ny: 0.7099 },
  { nx: 0.29863, ny: 0.7099 },
  { nx: 0.35767, ny: 0.7099 },
  { nx: 0.41481, ny: 0.7099 },
  { nx: 0.47195, ny: 0.7099 },
  { nx: 0.52909, ny: 0.7099 },
  { nx: 0.58623, ny: 0.7099 },
  { nx: 0.64337, ny: 0.7099 },
  { nx: 0.7005, ny: 0.7099 },
  { nx: 0.75765, ny: 0.7099 },
  { nx: 0.81478, ny: 0.7099 },
];

type Transform = { tx: number; ty: number; rot: number };

function parseTransform(str: string | undefined): Transform {
  const out: Transform = { tx: 0, ty: 0, rot: 0 };
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

function applyTransform(t: Transform, x: number, y: number): { x: number; y: number } {
  let px = x;
  let py = y;
  if (t.rot === -90 || t.rot === 270) {
    px = -y;
    py = x;
  }
  return { x: px + t.tx, y: py + t.ty };
}

/** Extrai centros dos rects st3 2.6336×3.6 (corpo do conector Visio). */
export function parseDioPortCentersFromSvg(
  xml: string,
  vbx: number,
  vby: number,
  vbw: number,
  vbh: number,
): DioPortCenterNorm[] {
  const stack: Transform[] = [{ tx: 0, ty: 0, rot: 0 }];
  const page: { x: number; y: number }[] = [];
  const tagRe = /<\/?g\b[^>]*>|<rect\b[^>]*\/>|<rect\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(xml))) {
    const tag = m[0];
    if (tag.startsWith('</g')) {
      if (stack.length > 1) stack.pop();
      continue;
    }
    if (tag.startsWith('<g')) {
      const tr = tag.match(/transform="([^"]+)"/);
      const parent = stack[stack.length - 1];
      const local = parseTransform(tr?.[1]);
      const abs = applyTransform(parent, local.tx, local.ty);
      stack.push({ tx: abs.x, ty: abs.y, rot: local.rot });
      continue;
    }
    if (
      tag.includes('class="st3"') &&
      /width="2\.6336"/.test(tag) &&
      /height="3\.6"/.test(tag)
    ) {
      const x = Number(tag.match(/\bx="([^"]+)"/)?.[1] ?? 0);
      const y = Number(tag.match(/\by="([^"]+)"/)?.[1] ?? 0);
      const cx = x + 2.6336 / 2;
      const cy = y + 3.6 / 2;
      const p = applyTransform(stack[stack.length - 1], cx, cy);
      page.push({ x: p.x, y: p.y });
    }
  }

  page.sort((a, b) => a.y - b.y || a.x - b.x);
  if (page.length < 36) return [];

  const rows: { x: number; y: number }[][] = [];
  let row: { x: number; y: number }[] = [page[0]];
  for (let i = 1; i < page.length; i += 1) {
    if (Math.abs(page[i].y - row[0].y) > 2) {
      rows.push(row.sort((a, b) => a.x - b.x));
      row = [page[i]];
    } else {
      row.push(page[i]);
    }
  }
  rows.push(row.sort((a, b) => a.x - b.x));

  const flat = rows.slice(0, 3).flatMap((r) => r.slice(0, 12));
  if (flat.length !== 36) return [];

  return flat.map((p) => ({
    nx: (p.x - vbx) / vbw,
    ny: (p.y - vby) / vbh,
  }));
}

export function resolveDioPortCenters(
  xml: string,
  vbx: number,
  vby: number,
  vbw: number,
  vbh: number,
): DioPortCenterNorm[] {
  const parsed = parseDioPortCentersFromSvg(xml, vbx, vby, vbw, vbh);
  return parsed.length === 36 ? parsed : DIO_PORT_CENTERS_FALLBACK;
}
