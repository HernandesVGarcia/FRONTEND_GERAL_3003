import { Injectable } from '@angular/core';

export type KmlCaboCapacity =
  | 1
  | 2
  | 4
  | 6
  | 8
  | 12
  | 24
  | 36
  | 48
  | 72
  | 144;

export const KML_CABO_CAPACITIES: KmlCaboCapacity[] = [
  1, 2, 4, 6, 8, 12, 24, 36, 48, 72, 144,
];

export type KmlCaboCodigoCores = 'Telebras' | 'TIA/EIA 598';

export interface KmlImportCaboItem {
  id: string;
  name: string;
  description: string;
  path: { lat: number; lng: number }[];
  capacidadeF: KmlCaboCapacity;
  folderName: string;
  label: string;
  selected: boolean;
  fibrasPorTubo: string;
  codigoCores: KmlCaboCodigoCores;
  implantStatus: 'pending' | 'ok' | 'error' | 'duplicate';
  implantMessage?: string;
}

export type KmlCaboParseSuccess = {
  ok: true;
  items: KmlImportCaboItem[];
  ignoredNonLines: number;
  fileName?: string;
};

export type KmlCaboParseFailure = {
  ok: false;
  error: string;
  details?: {
    foraDePasta: number;
    pastasInvalidas: string[];
  };
};

export type KmlCaboParseResult = KmlCaboParseSuccess | KmlCaboParseFailure;

export interface KmlCaboParseOptions {
  allowNoItems?: boolean;
}

const MAX_CABOS = 200;

const VALID_CAPACITIES = new Set<number>(KML_CABO_CAPACITIES);

@Injectable({
  providedIn: 'root',
})
export class KmlImportCabosService {
  parseKmlText(
    kmlText: string,
    fileName?: string,
    options?: KmlCaboParseOptions,
  ): KmlCaboParseResult {
    const trimmed = kmlText?.trim();
    if (!trimmed) {
      return { ok: false, error: 'Arquivo KML vazio.' };
    }

    let doc: Document;
    try {
      doc = new DOMParser().parseFromString(trimmed, 'text/xml');
    } catch {
      return { ok: false, error: 'Não foi possível ler o XML do KML.' };
    }

    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return { ok: false, error: 'KML inválido (erro de XML).' };
    }

    const roots: Element[] = [];
    for (const el of Array.from(doc.documentElement.children)) {
      if (localName(el) === 'Document' || localName(el) === 'Folder') {
        roots.push(el);
      }
    }
    if (roots.length === 0) {
      roots.push(doc.documentElement);
    }

    const linesInValidFolders: Array<{
      name: string;
      description: string;
      path: { lat: number; lng: number }[];
      capacidadeF: KmlCaboCapacity;
      folderName: string;
    }> = [];
    let linesOutsideFolder = 0;
    const invalidFolderNames = new Set<string>();
    let ignoredNonLines = 0;

    for (const root of roots) {
      walkKmlElement(root, [], (ctx) => {
        if (localName(ctx.element) !== 'Placemark') {
          return;
        }
        const path = readLineStringPath(ctx.element);
        if (!path) {
          if (hasNonLineGeometry(ctx.element)) {
            ignoredNonLines += 1;
          }
          return;
        }

        const capacidadeF = resolveCaboCapacity(ctx.folderStack);
        if (!capacidadeF) {
          linesOutsideFolder += 1;
          const unknown = nearestFolderName(ctx.folderStack);
          if (unknown) {
            invalidFolderNames.add(unknown);
          }
          return;
        }

        const { name, description } = readPlacemarkMeta(ctx.element);
        linesInValidFolders.push({
          name,
          description,
          path,
          capacidadeF,
          folderName: ctx.folderStack[ctx.folderStack.length - 1] ?? `CABO${capacidadeF}F`,
        });
      });
    }

    if (linesOutsideFolder > 0) {
      return {
        ok: false,
        error: `Organize os cabos nas pastas CABO1F, CABO2F, … CABO144F (ou Cabos Nf do export). ${linesOutsideFolder} trecho(s) fora de pasta válida.`,
        details: {
          foraDePasta: linesOutsideFolder,
          pastasInvalidas: Array.from(invalidFolderNames),
        },
      };
    }

    if (linesInValidFolders.length === 0) {
      if (options?.allowNoItems) {
        return {
          ok: true,
          items: [],
          ignoredNonLines,
          fileName,
        };
      }
      return {
        ok: false,
        error:
          'Nenhum cabo (Placemark/LineString) encontrado nas pastas CABO*nF.',
      };
    }

    if (linesInValidFolders.length > MAX_CABOS) {
      return {
        ok: false,
        error: `O arquivo tem ${linesInValidFolders.length} cabos; o limite é ${MAX_CABOS}. Divida o KML ou reduza a quantidade.`,
      };
    }

    const items: KmlImportCaboItem[] = linesInValidFolders.map((line, index) => ({
      id: `kml-cabo-${index}-${line.capacidadeF}`,
      name: line.name,
      description: line.description,
      path: line.path,
      capacidadeF: line.capacidadeF,
      folderName: line.folderName,
      label: deriveCaboLabel(line.name, line.description, line.capacidadeF, index),
      selected: true,
      fibrasPorTubo: '12F',
      codigoCores: 'TIA/EIA 598',
      implantStatus: 'pending',
    }));

    return {
      ok: true,
      items,
      ignoredNonLines,
      fileName,
    };
  }
}

export function chaveLabelCaboCidade(label: string | undefined): string | null {
  const s = String(label ?? '').trim();
  if (!s) {
    return null;
  }
  return s.toUpperCase();
}

function deriveCaboLabel(
  name: string,
  description: string,
  capacidadeF: KmlCaboCapacity,
  index: number,
): string {
  const rawName = (name ?? '').trim();
  if (rawName && !/^cabo\s*\d+$/i.test(rawName)) {
    return rawName;
  }
  const fromDesc = extractLabelFromDescription(description);
  if (fromDesc) {
    return fromDesc;
  }
  if (rawName) {
    return rawName;
  }
  return `Cabo_${capacidadeF}F_${index + 1}`;
}

function extractLabelFromDescription(description: string): string | null {
  const text = (description ?? '').replace(/<[^>]+>/g, ' ');
  const match = text.match(/Label:\s*([^\n<]+)/i);
  if (match?.[1]) {
    const label = match[1].trim();
    return label || null;
  }
  return null;
}

function resolveCaboCapacity(folderStack: string[]): KmlCaboCapacity | null {
  for (let i = folderStack.length - 1; i >= 0; i--) {
    const cap = parseCaboFolderCapacity(folderStack[i]);
    if (cap != null) {
      return cap;
    }
  }
  return null;
}

function parseCaboFolderCapacity(folderName: string): KmlCaboCapacity | null {
  const normalized = folderName.trim().toLowerCase().replace(/\s+/g, '');
  const match = normalized.match(/^cabos?(\d+)f$/);
  if (!match) {
    return null;
  }
  const n = parseInt(match[1], 10);
  if (!VALID_CAPACITIES.has(n)) {
    return null;
  }
  return n as KmlCaboCapacity;
}

function walkKmlElement(
  element: Element,
  folderStack: string[],
  visit: (ctx: { element: Element; folderStack: string[] }) => void,
): void {
  if (localName(element) === 'Placemark') {
    visit({ element, folderStack });
    return;
  }

  for (const child of Array.from(element.children)) {
    const tag = localName(child);
    if (tag === 'Folder') {
      const folderName = readDirectChildText(child, 'name') ?? '(sem nome)';
      walkKmlElement(child, [...folderStack, folderName], visit);
    } else {
      walkKmlElement(child, folderStack, visit);
    }
  }
}

function nearestFolderName(folderStack: string[]): string | undefined {
  return folderStack.length ? folderStack[folderStack.length - 1] : undefined;
}

function localName(el: Element): string {
  return el.localName || el.tagName.replace(/^[^:]+:/, '');
}

function readDirectChildText(
  parent: Element,
  childLocalName: string,
): string | null {
  for (const child of Array.from(parent.children)) {
    if (localName(child) === childLocalName) {
      return (child.textContent ?? '').trim();
    }
  }
  return null;
}

function readPlacemarkMeta(placemark: Element): {
  name: string;
  description: string;
} {
  const name = readDirectChildText(placemark, 'name') ?? '';
  const description = readDirectChildText(placemark, 'description') ?? '';
  return { name, description };
}

function readLineStringPath(
  placemark: Element,
): { lat: number; lng: number }[] | null {
  let lineEl: Element | null = null;
  for (const child of Array.from(placemark.getElementsByTagName('*'))) {
    if (localName(child) === 'LineString') {
      lineEl = child;
      break;
    }
  }
  if (!lineEl) {
    return null;
  }
  const coordsText = readDirectChildText(lineEl, 'coordinates');
  if (!coordsText) {
    return null;
  }
  const path: { lat: number; lng: number }[] = [];
  const tuples = coordsText.trim().split(/\s+/);
  for (const tuple of tuples) {
    const parts = tuple.split(',').map((p) => p.trim());
    if (parts.length < 2) {
      continue;
    }
    const lng = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      continue;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      continue;
    }
    path.push({ lat, lng });
  }
  if (path.length < 2) {
    return null;
  }
  return path;
}

function hasNonLineGeometry(placemark: Element): boolean {
  for (const child of Array.from(placemark.getElementsByTagName('*'))) {
    const tag = localName(child);
    if (tag === 'Point' || tag === 'Polygon' || tag === 'MultiGeometry') {
      return true;
    }
  }
  return false;
}
