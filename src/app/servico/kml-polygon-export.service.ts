import { Injectable } from '@angular/core';
import { Caixa } from '../modelo/Caixa';
import { Cto } from '../modelo/Cto';
import { Cto_SP } from '../modelo/Cto_SP';
import { PopsEst } from '../modelo/popsEst';
import { Condominios } from '../modelo/Condominios';
import { Dios } from '../modelo/dios';
import { PopsCli } from '../modelo/PopsCli';

export interface PolygonMapExportData {
  caixas?: Caixa[];
  ctos?: Cto[];
  ctosSP?: Cto_SP[];
  clientes?: PopsCli[];
  clientesAtivados?: PopsCli[];
  clientesDesativados?: PopsCli[];
  estacoes?: PopsEst[];
  condominios?: Condominios[];
  dios?: Dios[];
  cabos1f?: any[];
  cabos2f?: any[];
  cabos4f?: any[];
  cabos6f?: any[];
  cabos8f?: any[];
  cabos12f?: any[];
  cabos24f?: any[];
  cabos36f?: any[];
  cabos48f?: any[];
  cabos72f?: any[];
  cabos144f?: any[];
}

export interface PolygonKmlExportResult {
  exported: boolean;
  objectCount: number;
  counts: Record<string, number>;
  boundaryOnly: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class KmlPolygonExportService {
  private readonly customIcons = {
    caixa: 'http://maps.google.com/mapfiles/kml/shapes/triangle.png',
    cto: 'http://maps.google.com/mapfiles/kml/shapes/open-diamond.png',
    ctosp: 'http://maps.google.com/mapfiles/kml/shapes/track.png',
    estacao: 'http://maps.google.com/mapfiles/kml/shapes/ranger_station.png',
    condominio: 'http://maps.google.com/mapfiles/kml/shapes/homegardenbusiness.png',
    dio: 'http://maps.google.com/mapfiles/kml/shapes/square.png',
    cliente: 'http://maps.google.com/mapfiles/kml/paddle/C.png',
    clienteAtivado: 'http://maps.google.com/mapfiles/kml/paddle/blu-blank.png',
    clienteDesativado: 'http://maps.google.com/mapfiles/kml/paddle/blu-blank.png',
  };

  /**
   * Exporta objetos dentro do polígono + contorno do polígono para KML.
   */
  exportPolygonContentsToKML(
    polygon: google.maps.Polygon,
    data: PolygonMapExportData
  ): PolygonKmlExportResult {
    const paths = this.extractPolygonPaths(polygon);
    if (paths.length < 3) {
      return { exported: false, objectCount: 0, counts: {}, boundaryOnly: false };
    }

    const filtered = this.filterMapDataInsidePolygon(polygon, data);
    const counts = this.countFilteredItems(filtered);
    const objectCount = Object.values(counts).reduce((sum, n) => sum + n, 0);
    const boundaryOnly = objectCount === 0;

    const idMeta = polygon.get('id_meta');
    const labelRaw = polygon.get('labelPoligono');
    const tipoRaw = polygon.get('tipoPoligono') ?? polygon.get('tipo') ?? '';
    const label =
      labelRaw != null && String(labelRaw).trim() !== '' ? String(labelRaw).trim() : '(_)';
    const idSuffix =
      idMeta != null && Number.isFinite(Number(idMeta)) && Number(idMeta) > 0
        ? String(idMeta)
        : 'sem-id';

    const strokeColor = this.readPolygonColor(polygon, 'strokeColor', '#808080');
    const fillColor = this.readPolygonColor(polygon, 'fillColor', '#94a3b8');

    let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${this.escapeXml(`Fiberworks Polígono ${label}`)}</name>
    <description>${this.escapeXml(
      `Exportação do polígono id_meta=${idSuffix}, tipo=${tipoRaw || 'N/A'}`
    )}</description>

    ${this.createIconStyle('icon-caixa', this.customIcons.caixa)}
    ${this.createIconStyle('icon-cto', this.customIcons.cto)}
    ${this.createIconStyle('icon-ctosp', this.customIcons.ctosp)}
    ${this.createIconStyle('icon-estacao', this.customIcons.estacao)}
    ${this.createIconStyle('icon-condominio', this.customIcons.condominio)}
    ${this.createIconStyle('icon-dio', this.customIcons.dio)}
    ${this.createIconStyle('icon-cliente', this.customIcons.cliente)}
    ${this.createIconStyle('icon-cliente-ativado', this.customIcons.clienteAtivado)}
    ${this.createIconStyle('icon-cliente-desativado', this.customIcons.clienteDesativado)}

    ${this.exportPolygonBoundaryToKML({
      name: label,
      description: `ID: ${idSuffix}<br>Tipo: ${tipoRaw || 'N/A'}`,
      paths,
      strokeColor,
      fillColor,
    })}`;

    if (filtered.caixas?.length) {
      kmlContent += this.exportMarkersToKML('Caixas (CEO)', filtered.caixas, (item) => ({
        name: item.numero || 'S/N',
        description: `ID: ${item.id_meta}<br>Número: ${item.numero}`,
        lat: parseFloat(item.LAT),
        lng: parseFloat(item.LONGI),
        icon: 'icon-caixa',
      }));
    }
    if (filtered.ctos?.length) {
      kmlContent += this.exportMarkersToKML('CTOs', filtered.ctos, (item) => ({
        name: item.numero || 'S/N',
        description: `ID: ${item.id_meta}<br>Número: ${item.numero}`,
        lat: parseFloat(item.LAT),
        lng: parseFloat(item.LONGI),
        icon: 'icon-cto',
      }));
    }
    if (filtered.ctosSP?.length) {
      kmlContent += this.exportMarkersToKML('CTOs com Splitter', filtered.ctosSP, (item) => ({
        name: item.numero || 'S/N',
        description: `ID: ${item.id_meta}<br>Número: ${item.numero}`,
        lat: parseFloat(item.LAT),
        lng: parseFloat(item.LONGI),
        icon: 'icon-ctosp',
      }));
    }
    if (filtered.estacoes?.length) {
      kmlContent += this.exportMarkersToKML('Estações', filtered.estacoes, (item) => ({
        name: item.sigla || 'S/N',
        description: `ID: ${item.id_meta}<br>Sigla: ${item.sigla}`,
        lat: parseFloat(item.LAT),
        lng: parseFloat(item.LNG),
        icon: 'icon-estacao',
      }));
    }
    if (filtered.condominios?.length) {
      kmlContent += this.exportMarkersToKML('Condomínios', filtered.condominios, (item) => ({
        name: item.sigla || 'S/N',
        description: `ID: ${item.id_meta}<br>Sigla: ${item.sigla}`,
        lat: parseFloat(item.LAT),
        lng: parseFloat(item.LNG),
        icon: 'icon-condominio',
      }));
    }
    if (filtered.dios?.length) {
      kmlContent += this.exportMarkersToKML('DIOS', filtered.dios, (item) => ({
        name: item.sigla || 'S/N',
        description: `ID: ${item.id_meta}<br>Sigla: ${item.sigla}<br>Capacidade: ${item.CAPACIDADE}`,
        lat: parseFloat(item.LAT),
        lng: parseFloat(item.LNG),
        icon: 'icon-dio',
      }));
    }
    if (filtered.clientes?.length) {
      kmlContent += this.exportMarkersToKML('Clientes', filtered.clientes, (item) => ({
        name: item.sigla || 'S/N',
        description: `ID: ${item.id_meta}<br>Sigla: ${item.sigla}`,
        lat: parseFloat(String(item.LAT)),
        lng: parseFloat(String(item.LNG)),
        icon: 'icon-cliente',
      }));
    }
    if (filtered.clientesAtivados?.length) {
      kmlContent += this.exportMarkersToKML('Clientes Ativados', filtered.clientesAtivados, (item) => ({
        name: item.sigla || 'S/N',
        description: `ID: ${item.id_meta}<br>Sigla: ${item.sigla}`,
        lat: parseFloat(String(item.LAT)),
        lng: parseFloat(String(item.LNG)),
        icon: 'icon-cliente-ativado',
      }));
    }
    if (filtered.clientesDesativados?.length) {
      kmlContent += this.exportMarkersToKML('Clientes Desativados', filtered.clientesDesativados, (item) => ({
        name: item.sigla || 'S/N',
        description: `ID: ${item.id_meta}<br>Sigla: ${item.sigla}`,
        lat: parseFloat(String(item.LAT)),
        lng: parseFloat(String(item.LNG)),
        icon: 'icon-cliente-desativado',
      }));
    }

    const caboLayers: { key: keyof PolygonMapExportData; folder: string; cor: string }[] = [
      { key: 'cabos1f', folder: 'Cabos 1f', cor: '#0000FF' },
      { key: 'cabos2f', folder: 'Cabos 2f', cor: '#00FFFF' },
      { key: 'cabos4f', folder: 'Cabos 4f', cor: '#29A1D0' },
      { key: 'cabos6f', folder: 'Cabos 6f', cor: '#000000' },
      { key: 'cabos8f', folder: 'Cabos 8f', cor: '#0000FF' },
      { key: 'cabos12f', folder: 'Cabos 12f', cor: '#00FF00' },
      { key: 'cabos24f', folder: 'Cabos 24f', cor: '#FF00FF' },
      { key: 'cabos36f', folder: 'Cabos 36f', cor: '#0000FF' },
      { key: 'cabos48f', folder: 'Cabos 48f', cor: '#FF0000' },
      { key: 'cabos72f', folder: 'Cabos 72f', cor: '#8000FF' },
      { key: 'cabos144f', folder: 'Cabos 144f', cor: '#FFAE42' },
    ];
    for (const layer of caboLayers) {
      const cabos = filtered[layer.key] as any[] | undefined;
      if (cabos?.length) {
        kmlContent += this.exportCabosToKML(layer.folder, cabos, layer.cor);
      }
    }

    kmlContent += `
  </Document>
</kml>`;

    const fileName = `fiberworks-poligono-${idSuffix}.kml`;
    this.downloadFile(kmlContent, fileName, 'application/vnd.google-earth.kml+xml');

    return { exported: true, objectCount, counts, boundaryOnly };
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

  private countFilteredItems(data: PolygonMapExportData): Record<string, number> {
    return {
      caixas: data.caixas?.length ?? 0,
      ctos: data.ctos?.length ?? 0,
      ctosSP: data.ctosSP?.length ?? 0,
      clientes: data.clientes?.length ?? 0,
      clientesAtivados: data.clientesAtivados?.length ?? 0,
      clientesDesativados: data.clientesDesativados?.length ?? 0,
      estacoes: data.estacoes?.length ?? 0,
      condominios: data.condominios?.length ?? 0,
      dios: data.dios?.length ?? 0,
      cabos1f: data.cabos1f?.length ?? 0,
      cabos2f: data.cabos2f?.length ?? 0,
      cabos4f: data.cabos4f?.length ?? 0,
      cabos6f: data.cabos6f?.length ?? 0,
      cabos8f: data.cabos8f?.length ?? 0,
      cabos12f: data.cabos12f?.length ?? 0,
      cabos24f: data.cabos24f?.length ?? 0,
      cabos36f: data.cabos36f?.length ?? 0,
      cabos48f: data.cabos48f?.length ?? 0,
      cabos72f: data.cabos72f?.length ?? 0,
      cabos144f: data.cabos144f?.length ?? 0,
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
      console.warn('[KML-POLYGON-EXPORT] geometry library indisponível');
      return false;
    }
    return google.maps.geometry.poly.containsLocation(
      new google.maps.LatLng(lat, lng),
      polygon
    );
  }

  private extractPolygonPaths(polygon: google.maps.Polygon): google.maps.LatLngLiteral[] {
    const path = polygon.getPath();
    const out: google.maps.LatLngLiteral[] = [];
    for (let i = 0; i < path.getLength(); i++) {
      const p = path.getAt(i);
      out.push({ lat: p.lat(), lng: p.lng() });
    }
    return out;
  }

  private readPolygonColor(
    polygon: google.maps.Polygon,
    key: 'strokeColor' | 'fillColor',
    fallback: string
  ): string {
    const fromMvc = polygon.get(key);
    if (typeof fromMvc === 'string' && fromMvc.trim()) {
      return fromMvc;
    }
    return fallback;
  }

  private exportPolygonBoundaryToKML(boundary: {
    name: string;
    description: string;
    paths: google.maps.LatLngLiteral[];
    strokeColor: string;
    fillColor: string;
  }): string {
    const closed = [...boundary.paths];
    if (closed.length >= 3) {
      const first = closed[0];
      const last = closed[closed.length - 1];
      if (first.lat !== last.lat || first.lng !== last.lng) {
        closed.push({ ...first });
      }
    }
    const coordinatesStr = closed.map((p) => `${p.lng},${p.lat},0`).join(' ');
    const strokeKml = this.colorToKmlLineFill(boundary.strokeColor, 0.9);
    const fillKml = this.colorToKmlLineFill(boundary.fillColor, 0.25);

    return `
    <Folder>
      <name>${this.escapeXml('Polígono de referência')}</name>
      <Placemark>
        <name>${this.escapeXml(this.cleanInvalidChars(boundary.name))}</name>
        <description><![CDATA[${this.cleanInvalidChars(boundary.description)}]]></description>
        <Style>
          <LineStyle>
            <color>${strokeKml}</color>
            <width>2</width>
          </LineStyle>
          <PolyStyle>
            <color>${fillKml}</color>
            <fill>1</fill>
            <outline>1</outline>
          </PolyStyle>
        </Style>
        <Polygon>
          <tessellate>1</tessellate>
          <outerBoundaryIs>
            <LinearRing>
              <coordinates>${coordinatesStr}</coordinates>
            </LinearRing>
          </outerBoundaryIs>
        </Polygon>
      </Placemark>
    </Folder>`;
  }

  private exportMarkersToKML(
    folderName: string,
    items: any[],
    transformer: (item: any) => {
      name: string;
      description: string;
      lat: number;
      lng: number;
      icon: string;
    }
  ): string {
    let kml = `
    <Folder>
      <name>${this.escapeXml(folderName)}</name>`;

    items.forEach((item) => {
      try {
        const row = transformer(item);
        if (isNaN(row.lat) || isNaN(row.lng)) {
          return;
        }
        kml += `
      <Placemark>
        <name>${this.escapeXml(this.cleanInvalidChars(row.name))}</name>
        <description><![CDATA[${this.escapeXml(this.cleanInvalidChars(row.description))}]]></description>
        <styleUrl>#${row.icon}</styleUrl>
        <Point>
          <coordinates>${row.lng},${row.lat},0</coordinates>
        </Point>
      </Placemark>`;
      } catch (e) {
        console.error('[KML-POLYGON-EXPORT] Erro ao processar marcador:', e, item);
      }
    });

    kml += `
    </Folder>`;
    return kml;
  }

  private exportCabosToKML(folderName: string, cabos: any[], cor: string): string {
    let kml = `
    <Folder>
      <name>${this.escapeXml(folderName)}</name>`;

    cabos.forEach((cabo) => {
      try {
        if (!cabo?.GOOGLE_LATLNG) {
          return;
        }
        const coords = this.parseCoordString(cabo.GOOGLE_LATLNG).filter(
          (c) => !isNaN(c.lat) && !isNaN(c.lng)
        );
        if (!coords.length) {
          return;
        }
        const coordinatesStr = coords.map((c) => `${c.lng},${c.lat},0`).join(' ');
        const idMeta = cabo.id_meta || 'N/A';
        const label = this.escapeXml(this.cleanInvalidChars(cabo.Label_cabo || 'N/A'));
        const tipo = this.escapeXml(folderName || 'N/A');

        kml += `
      <Placemark>
        <name>Cabo ${idMeta}</name>
        <description><![CDATA[
          ID: ${idMeta}<br>
          Label: ${label}<br>
          Tipo: ${tipo}
        ]]></description>
        <Style>
          <LineStyle>
            <color>${this.rgbToKmlColor(cor)}</color>
            <width>3</width>
          </LineStyle>
        </Style>
        <LineString>
          <tessellate>1</tessellate>
          <coordinates>${coordinatesStr}</coordinates>
        </LineString>
      </Placemark>`;
      } catch (e) {
        console.error('[KML-POLYGON-EXPORT] Erro ao processar cabo:', e, cabo);
      }
    });

    kml += `
    </Folder>`;
    return kml;
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

  private rgbToKmlColor(hex: string): string {
    const hexColor = hex.replace('#', '');
    if (hexColor.length !== 6) {
      return 'ff808080';
    }
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    return `ff${b.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${r
      .toString(16)
      .padStart(2, '0')}`;
  }

  /** Converte #RRGGBB ou rgba(...) para KML AABBGGRR com opacidade. */
  private colorToKmlLineFill(color: string, defaultAlpha: number): string {
    const trimmed = (color || '').trim();
    if (trimmed.startsWith('#') && trimmed.length >= 7) {
      const alphaHex = Math.round(defaultAlpha * 255)
        .toString(16)
        .padStart(2, '0');
      return `${alphaHex}${this.rgbToKmlColor(trimmed).substring(2)}`;
    }
    const rgbaMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1], 10);
      const g = parseInt(rgbaMatch[2], 10);
      const b = parseInt(rgbaMatch[3], 10);
      const a = rgbaMatch[4] != null ? parseFloat(rgbaMatch[4]) : defaultAlpha;
      const alphaHex = Math.round(a * 255)
        .toString(16)
        .padStart(2, '0');
      return `${alphaHex}${b.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${r
        .toString(16)
        .padStart(2, '0')}`;
    }
    return this.rgbToKmlColor('#808080');
  }

  private createIconStyle(iconName: string, iconUrl: string): string {
    if (!iconUrl) {
      return '';
    }
    return `
    <Style id="${iconName}">
      <IconStyle>
        <Icon>
          <href>${iconUrl}</href>
        </Icon>
      </IconStyle>
    </Style>`;
  }

  private cleanInvalidChars(str: string): string {
    if (!str) {
      return '';
    }
    return str
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/[\uFFFE\uFFFF]/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim();
  }

  private escapeXml(str: string): string {
    if (!str) {
      return '';
    }
    const cleaned = this.cleanInvalidChars(str);
    return cleaned
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
