export interface Anotacoes {

    id_meta?: number;
    label_rabicho: string|undefined;
    LAT:Location | undefined;
    LNG:Location | undefined;
    ShapeName?: string;
                   
    }

/** Resolve id_meta de linha API / objeto anotação (case-insensitive; fallback ShapeName RBX{n}). */
export function resolveAnotacaoIdMeta(source: unknown): number | undefined {
  if (source == null || typeof source !== 'object') {
    return undefined;
  }
  const record = source as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    if (key.toLowerCase() === 'id_meta') {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) {
        return n;
      }
    }
  }
  const shapeRaw =
    record['ShapeName'] ?? record['SHAPENAME'] ?? record['shapeName'] ?? record['ShapeNAME'];
  if (typeof shapeRaw === 'string') {
    const match = shapeRaw.trim().match(/^RBX(\d+)$/i);
    if (match) {
      const n = Number(match[1]);
      if (Number.isFinite(n) && n > 0) {
        return n;
      }
    }
  }
  return undefined;
}

export function mapApiRowToAnotacao(row: unknown): Anotacoes {
  const r = (row ?? {}) as Record<string, unknown>;
  const id_meta = resolveAnotacaoIdMeta(r);
  return {
    ...r,
    id_meta,
    label_rabicho: r['label_rabicho'] as string | undefined,
    LAT: r['LAT'] as Anotacoes['LAT'],
    LNG: r['LNG'] as Anotacoes['LNG'],
    ShapeName: r['ShapeName'] as string | undefined,
  } as Anotacoes;
}
