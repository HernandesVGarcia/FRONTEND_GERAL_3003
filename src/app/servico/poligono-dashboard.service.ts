import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PolygonMapExportData } from './kml-polygon-export.service';
import { SplitterViabilidadeService } from './splitter-viabilidade.service';
import { TiposService, TipoSplitterApiRow } from './tipos.service';
import { Splitter } from '../modelo/Splitter';

/**
 * Relatório estatístico do polígono (dashboard).
 * Regras de filtro geométrico alinhadas ao export KML em kml-polygon-export.service.ts.
 */
export interface PoligonoDashboardReport {
  cabosMetragem: { name: string; value: number }[];
  caixasTipo: { name: string; value: number }[];
  clientesStatus: { name: string; value: number }[];
  diosCapacidade: { name: string; value: number }[];
  condominiosQuantidade: { name: string; value: number }[];
  estacoesQuantidade: { name: string; value: number }[];
}

const CABO_TYPES: { key: keyof PolygonMapExportData; label: string }[] = [
  { key: 'cabos1f', label: '1f' },
  { key: 'cabos2f', label: '2f' },
  { key: 'cabos4f', label: '4f' },
  { key: 'cabos6f', label: '6f' },
  { key: 'cabos8f', label: '8f' },
  { key: 'cabos12f', label: '12f' },
  { key: 'cabos24f', label: '24f' },
  { key: 'cabos36f', label: '36f' },
  { key: 'cabos48f', label: '48f' },
  { key: 'cabos72f', label: '72f' },
  { key: 'cabos144f', label: '144f' },
];

@Injectable({
  providedIn: 'root',
})
export class PoligonoDashboardService {
  private cachedTiposSplitter: TipoSplitterApiRow[] | null = null;

  constructor(
    private splitterViabilidadeService: SplitterViabilidadeService,
    private tiposService: TiposService
  ) {}
  // constroi o relatório do polígono.
  buildReport( 
    polygon: google.maps.Polygon,
    data: PolygonMapExportData
  ): PoligonoDashboardReport {
    return this.buildReportFromData(this.filterMapDataInsidePolygon(polygon, data));
  }//------------------------------------------------------------ */

  // constroi o relatório do mapa.
  buildMapReport(data: PolygonMapExportData): PoligonoDashboardReport {
    return this.buildReportFromData(data);
  }//------------------------------------------------------------ */  

  private buildReportFromData(data: PolygonMapExportData): PoligonoDashboardReport {
    const condominiosTotal = data.condominios?.length ?? 0;
    const estacoesTotal = data.estacoes?.length ?? 0;

    return {
      cabosMetragem: this.aggregateCabosMetragem(data),
      caixasTipo: [
        { name: 'CEO', value: data.caixas?.length ?? 0 },
        { name: 'CTO', value: data.ctos?.length ?? 0 },
        { name: 'CTOSP', value: data.ctosSP?.length ?? 0 },
      ],
      clientesStatus: [
        { name: 'Ativo', value: data.clientesAtivados?.length ?? 0 },
        { name: 'Desativado', value: data.clientesDesativados?.length ?? 0 },
        { name: 'Cancelado', value: data.clientes?.length ?? 0 },
      ],
      diosCapacidade: this.aggregateDiosPorCapacidade(data.dios ?? []),
      condominiosQuantidade: [{ name: 'Condomínios', value: condominiosTotal }],
      estacoesQuantidade: [{ name: 'Estações', value: estacoesTotal }],
    };
  }

  loadSplittersPorTipo(
    polygon: google.maps.Polygon,
    data: PolygonMapExportData
  ): Observable<{ name: string; value: number }[]> {
    return this.loadSplittersPorTipoFromData(this.filterMapDataInsidePolygon(polygon, data));
  }

  loadSplittersPorTipoFromData(
    data: PolygonMapExportData
  ): Observable<{ name: string; value: number }[]> {
    const boxIds = this.collectUniqueBoxIds(data);

    if (boxIds.length === 0) {
      return of([]);
    }

    return this.loadTiposSplitter().pipe(
      switchMap((tipos) =>
        forkJoin(
          boxIds.map((id) =>
            this.splitterViabilidadeService.listarPorIdMetaCaixa(id).pipe(catchError(() => of([])))
          )
        ).pipe(
          map((lists) => lists.flat()),
          map((splitters) => this.aggregateSplittersPorTipo(splitters, tipos))
        )
      )
    );
  }

  private loadTiposSplitter(): Observable<TipoSplitterApiRow[]> {// Carrega os tipos de splitters no polígono.
    if (this.cachedTiposSplitter) {
      return of(this.cachedTiposSplitter);
    }
    return this.tiposService.buscarTiposSplitter().pipe(
      map((resp) => (Array.isArray(resp?.data) ? resp.data : []) as TipoSplitterApiRow[]),
      map((tipos) => {
        this.cachedTiposSplitter = tipos;
        return tipos;
      }),
      catchError(() => of([] as TipoSplitterApiRow[]))
    );
  }

  private collectUniqueBoxIds(filtered: PolygonMapExportData): number[] {// Coleta os IDs únicos de caixas no polígono.
    const ids = new Set<number>();
    const sources = [filtered.caixas, filtered.ctos, filtered.ctosSP];
    for (const items of sources) {
      for (const item of items ?? []) {
        const id = Number(item?.id_meta);
        if (Number.isFinite(id) && id > 0) {
          ids.add(id);
        }
      }
    }
    return [...ids];
  }

  private aggregateSplittersPorTipo(// Agrupa os splitters por tipo.
    splitters: Splitter[],
    tipos: TipoSplitterApiRow[]
  ): { name: string; value: number }[] {
    const counts = new Map<number, { label: string; value: number }>();

    for (const splitter of splitters) {
      const tipo = Number(splitter?.TIPO_SPLITTER);
      if (!Number.isFinite(tipo) || tipo <= 0) {
        continue;
      }
      const row = tipos.find((t) => t.id === tipo);
      const label = row?.acoplamento?.trim() || `Tipo ${tipo}`;
      const existing = counts.get(tipo);
      if (existing) {
        existing.value += 1;
      } else {
        counts.set(tipo, { label, value: 1 });
      }
    }

    return [...counts.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, entry]) => ({ name: entry.label, value: entry.value }))
      .filter((entry) => entry.value > 0);
  }

  private aggregateDiosPorCapacidade(dios: any[]): { name: string; value: number }[] {// Agrupa os dios por capacidade.
    const counts = new Map<string, number>();

    for (const dio of dios) {
      const raw = dio?.CAPACIDADE;
      const capNum = Number(raw);
      const label =
        raw != null && Number.isFinite(capNum) && capNum > 0 ? `${capNum}F` : 'N/A';
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    const result: { name: string; value: number; sortKey: number }[] = [];
    for (const [name, value] of counts.entries()) {
      if (value <= 0) {
        continue;
      }
      const sortKey =
        name === 'N/A' ? Number.MAX_SAFE_INTEGER : parseInt(name.replace(/F$/i, ''), 10);
      result.push({ name, value, sortKey: Number.isFinite(sortKey) ? sortKey : Number.MAX_SAFE_INTEGER });
    }

    result.sort((a, b) => a.sortKey - b.sortKey);
    return result.map(({ name, value }) => ({ name, value }));
  }

  private aggregateCabosMetragem(// Agrupa os cabos por tipo.
    filtered: PolygonMapExportData
  ): { name: string; value: number }[] {
    const result: { name: string; value: number }[] = [];

    for (const tipo of CABO_TYPES) {
      const cabos = filtered[tipo.key] as any[] | undefined;
      if (!cabos?.length) {
        continue;
      }

      let totalMeters = 0;
      for (const cabo of cabos) {
        totalMeters += this.computePolylineLengthMeters(cabo?.GOOGLE_LATLNG);
      }

      const rounded = Math.round(totalMeters);
      if (rounded > 0) {
        result.push({ name: tipo.label, value: rounded });
      }
    }

    return result;
  }

  private computePolylineLengthMeters(googleLatLng: unknown): number {// Calcula o comprimento de uma linha em metros.
    const coords = this.parseCoordString(googleLatLng).filter(
      (c) => Number.isFinite(c.lat) && Number.isFinite(c.lng)
    );
    if (coords.length < 2) {
      return 0;
    }
    if (typeof google.maps.geometry?.spherical?.computeLength !== 'function') {
      console.warn('[POLIGONO-DASHBOARD] geometry library indisponível');
      return 0;
    }
    const path = coords.map((c) => new google.maps.LatLng(c.lat, c.lng));
    return google.maps.geometry.spherical.computeLength(path);
  }

  private filterMapDataInsidePolygon(
    polygon: google.maps.Polygon,
    data: PolygonMapExportData
  ): PolygonMapExportData {
    return {
      caixas: this.filterMarkers(data.caixas, 'LAT', 'LONGI', polygon),
      ctos: this.filterMarkers(data.ctos, 'LAT', 'LONGI', polygon),
      ctosSP: this.filterMarkers(data.ctosSP, 'LAT', 'LONGI', polygon),
      clientes: this.filterMarkers(data.clientes, 'LAT', 'LNG', polygon),
      clientesAtivados: this.filterMarkers(data.clientesAtivados, 'LAT', 'LNG', polygon),
      clientesDesativados: this.filterMarkers(data.clientesDesativados, 'LAT', 'LNG', polygon),
      estacoes: this.filterMarkers(data.estacoes, 'LAT', 'LNG', polygon),
      condominios: this.filterMarkers(data.condominios, 'LAT', 'LNG', polygon),
      dios: this.filterMarkers(data.dios, 'LAT', 'LNG', polygon),
      cabos1f: this.filterCabos(data.cabos1f, polygon),
      cabos2f: this.filterCabos(data.cabos2f, polygon),
      cabos4f: this.filterCabos(data.cabos4f, polygon),
      cabos6f: this.filterCabos(data.cabos6f, polygon),
      cabos8f: this.filterCabos(data.cabos8f, polygon),
      cabos12f: this.filterCabos(data.cabos12f, polygon),
      cabos24f: this.filterCabos(data.cabos24f, polygon),
      cabos36f: this.filterCabos(data.cabos36f, polygon),
      cabos48f: this.filterCabos(data.cabos48f, polygon),
      cabos72f: this.filterCabos(data.cabos72f, polygon),
      cabos144f: this.filterCabos(data.cabos144f, polygon),
    };
  }

  private filterMarkers(
    items: any[] | undefined,
    latKey: string,
    lngKey: string,
    polygon: google.maps.Polygon
  ): any[] {
    if (!items?.length) {
      return [];
    }
    return items.filter((item) => {
      const lat = parseFloat(String(item[latKey]));
      const lng = parseFloat(String(item[lngKey]));
      return this.isLatLngInsidePolygon(lat, lng, polygon);
    });
  }

  private filterCabos(cabos: any[] | undefined, polygon: google.maps.Polygon): any[] {
    if (!cabos?.length) {
      return [];
    }
    return cabos.filter((cabo) => {
      const coords = this.parseCoordString(cabo?.GOOGLE_LATLNG);
      return coords.some((c) => this.isLatLngInsidePolygon(c.lat, c.lng, polygon));
    });
  }

  private isLatLngInsidePolygon(
    lat: number,
    lng: number,
    polygon: google.maps.Polygon
  ): boolean {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return false;
    }
    if (typeof google.maps.geometry?.poly?.containsLocation !== 'function') {
      console.warn('[POLIGONO-DASHBOARD] geometry library indisponível');
      return false;
    }
    return google.maps.geometry.poly.containsLocation(
      new google.maps.LatLng(lat, lng),
      polygon
    );
  }

  private parseCoordString(coordString: unknown): { lat: number; lng: number }[] {
    try {
      if (Array.isArray(coordString)) {
        return coordString.map((coord: any) => ({
          lat: parseFloat(String(coord.lat)),
          lng: parseFloat(String(coord.lng)),
        }));
      }
      const coords =
        typeof coordString === 'string' ? JSON.parse(coordString) : coordString;
      if (Array.isArray(coords)) {
        return coords.map((coord: any) => ({
          lat: parseFloat(String(coord.lat)),
          lng: parseFloat(String(coord.lng)),
        }));
      }
      return [];
    } catch {
      return [];
    }
  }
}
