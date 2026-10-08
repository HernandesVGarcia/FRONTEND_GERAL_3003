/**
 * Graphviz-safe: só A-Za-z0-9; resto vira _; colapsa __ e trim de _.
 * Mesma regra usada em plota-caixa e detalhes-caixa.
 */
export function sanitizarLabelCaixa(label: string): string {
  return String(label ?? '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function numeroCaixaFromKmlName(name: string): {
  raw: string;
  numero: string;
} {
  const raw = (name ?? '').trim();
  const sanitized = raw ? sanitizarLabelCaixa(raw) : '';
  return {
    raw,
    numero: sanitized !== '' ? sanitized : '0',
  };
}

/** Chave case-insensitive para unicidade de NUMERO na cidade (null se vazio ou "0"). */
export function chaveNumeroUnicoCidade(
  numero: string | undefined,
): string | null {
  const sanitized = sanitizarLabelCaixa(String(numero ?? ''));
  if (!sanitized || sanitized === '0') {
    return null;
  }
  return sanitized.toUpperCase();
}

/** Rótulos de caixa/CTO vindos da API (`numero`; fallback `NUMEROCX` se existir). */
export function rotulosNumeroApiRow(row: Record<string, unknown>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const key of ['numero', 'NUMEROCX', 'numerocx', 'NUMERO']) {
    const raw = row[key];
    if (raw == null) {
      continue;
    }
    const s = String(raw).trim();
    if (!s || seen.has(s)) {
      continue;
    }
    seen.add(s);
    out.push(s);
  }
  return out;
}
