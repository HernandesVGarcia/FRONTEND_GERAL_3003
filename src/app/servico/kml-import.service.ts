import { Injectable } from '@angular/core';
import { numeroCaixaFromKmlName } from '../util/caixa-label.util';

export type KmlFolderKind = 'caixa' | 'cto';

export interface KmlImportItem {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  folderKind: KmlFolderKind;
  folderName: string;
  selected: boolean;
  tipagem: string;
  idTipo: string;
  numero: string;
  implantStatus: 'pending' | 'ok' | 'error' | 'duplicate';
  implantMessage?: string;
}

export type KmlParseSuccess = {
  ok: true;
  items: KmlImportItem[];
  ignoredNonPoints: number;
  fileName?: string;
};

export type KmlParseFailure = {
  ok: false;
  error: string;
  details?: {
    foraDePasta: number;
    pastasInvalidas: string[];
  };
};

export type KmlParseResult = KmlParseSuccess | KmlParseFailure;

export interface KmlParseOptions {
  allowNoItems?: boolean;
}

const MAX_POINTS = 200; // Limite de pontos para importação (evitar sobrecarregar o servidor)

const CAIXA_FOLDER_NAMES = new Set(
  ['caixas', 'caixas (ceo)', 'ceo'].map((s) => s.toLowerCase()),
);

const CTO_FOLDER_NAMES = new Set(['ctos', 'cto'].map((s) => s.toLowerCase()));

@Injectable({
  providedIn: 'root',
})
export class KmlImportService {
  parseKmlText(
    kmlText: string,
    fileName?: string,
    options?: KmlParseOptions,
  ): KmlParseResult {
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

    const pointsInValidFolders: Array<{
      name: string;
      description: string;
      lat: number;
      lng: number;
      folderKind: KmlFolderKind;
      folderName: string;
    }> = [];
    let pointsOutsideFolder = 0;
    const invalidFolderNames = new Set<string>();
    let ignoredNonPoints = 0;

    for (const root of roots) {
      walkKmlElement(root, [], (ctx) => {
        if (localName(ctx.element) !== 'Placemark') {
          return;
        }
        const coords = readPointCoordinates(ctx.element);
        if (!coords) {
          if (hasNonPointGeometry(ctx.element)) {
            ignoredNonPoints += 1;
          }
          return;
        }

        const folderKind = resolveFolderKind(ctx.folderStack);
        if (!folderKind) {
          pointsOutsideFolder += 1;
          const unknown = nearestFolderName(ctx.folderStack);
          if (unknown) {
            invalidFolderNames.add(unknown);
          }
          return;
        }

        const { name, description } = readPlacemarkMeta(ctx.element);
        pointsInValidFolders.push({
          name,
          description,
          lat: coords.lat,
          lng: coords.lng,
          folderKind,
          folderName: ctx.folderStack[ctx.folderStack.length - 1] ?? folderKind,
        });
      });
    }

    if (pointsOutsideFolder > 0) {
      return {
        ok: false,
        error: `Organize os pontos nas pastas CAIXAS e CTOS (como no export KML do Fiberworks). ${pointsOutsideFolder} ponto(s) fora de pasta válida.`,
        details: {
          foraDePasta: pointsOutsideFolder,
          pastasInvalidas: Array.from(invalidFolderNames),
        },
      };
    }

    if (pointsInValidFolders.length === 0) {
      if (options?.allowNoItems) {
        return {
          ok: true,
          items: [],
          ignoredNonPoints,
          fileName,
        };
      }
      return {
        ok: false,
        error:
          'Nenhum ponto (Placemark/Point) encontrado nas pastas CAIXAS ou CTOS.',
      };
    }

    if (pointsInValidFolders.length > MAX_POINTS) {
      return {
        ok: false,
        error: `O arquivo tem ${pointsInValidFolders.length} pontos; o limite é ${MAX_POINTS}. Divida o KML ou reduza a quantidade.`,
      };
    }

    const deduped = dedupeByCoordinates(pointsInValidFolders);
    const items: KmlImportItem[] = deduped.map((p, index) => ({
      id: `kml-${index}-${p.lat.toFixed(6)}-${p.lng.toFixed(6)}`,
      name: p.name,
      description: p.description,
      lat: p.lat,
      lng: p.lng,
      folderKind: p.folderKind,
      folderName: p.folderName,
      selected: true,
      tipagem: '',
      idTipo: '',
      numero: numeroCaixaFromKmlName(p.name).numero,
      implantStatus: 'pending',
    }));

    return {
      ok: true,
      items,
      ignoredNonPoints,
      fileName,
    };
  }
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

function resolveFolderKind(folderStack: string[]): KmlFolderKind | null {
  for (let i = folderStack.length - 1; i >= 0; i--) {
    const normalized = normalizeFolderName(folderStack[i]);
    if (CAIXA_FOLDER_NAMES.has(normalized)) {
      return 'caixa';
    }
    if (CTO_FOLDER_NAMES.has(normalized)) {
      return 'cto';
    }
  }
  return null;
}

function nearestFolderName(folderStack: string[]): string | undefined {
  return folderStack.length ? folderStack[folderStack.length - 1] : undefined;
}

function normalizeFolderName(name: string): string {
  return name.trim().toLowerCase();
}

function localName(el: Element): string {
  return el.localName || el.tagName.replace(/^[^:]+:/, '');
}

function readDirectChildText(parent: Element, childLocalName: string): string | null {
  for (const child of Array.from(parent.children)) {
    if (localName(child) === childLocalName) {
      return (child.textContent ?? '').trim();
    }
  }
  return null;
}

function readPlacemarkMeta(placemark: Element): { name: string; description: string } {
  const name = readDirectChildText(placemark, 'name') ?? '';
  const description = readDirectChildText(placemark, 'description') ?? '';
  return { name, description };
}

function readPointCoordinates(placemark: Element): { lat: number; lng: number } | null {
  let pointEl: Element | null = null;
  for (const child of Array.from(placemark.getElementsByTagName('*'))) {
    if (localName(child) === 'Point') {
      pointEl = child;
      break;
    }
  }
  if (!pointEl) {
    return null;
  }
  const coordsText = readDirectChildText(pointEl, 'coordinates');
  if (!coordsText) {
    return null;
  }
  const firstTuple = coordsText.trim().split(/\s+/)[0];
  const parts = firstTuple.split(',').map((p) => p.trim());
  if (parts.length < 2) {
    return null;
  }
  const lng = parseFloat(parts[0]);
  const lat = parseFloat(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }
  return { lat, lng };
}

function hasNonPointGeometry(placemark: Element): boolean {
  for (const child of Array.from(placemark.getElementsByTagName('*'))) {
    const tag = localName(child);
    if (tag === 'LineString' || tag === 'Polygon' || tag === 'MultiGeometry') {
      return true;
    }
  }
  return false;
}

function dedupeByCoordinates<
  T extends { lat: number; lng: number; name: string },
>(points: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const p of points) {
    const key = `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(p);
  }
  return out;
}
