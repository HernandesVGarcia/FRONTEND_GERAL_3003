import { Injectable } from '@angular/core';
import { Caixa } from '../modelo/Caixa';
import { Cto } from '../modelo/Cto';
import { Cto_SP } from '../modelo/Cto_SP';
import { PopsCli } from '../modelo/PopsCli';
import { PopsEst } from '../modelo/popsEst';
import { Condominios } from '../modelo/Condominios';
import { Dios } from '../modelo/dios';

export interface MapExportData {
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

@Injectable({
  providedIn: 'root'
})
export class KmlExportService {

  // Ícones customizados - URLs do Google Earth (funcionam localmente e no Google Earth)
  private customIcons = {
    caixa: 'http://maps.google.com/mapfiles/kml/shapes/triangle.png',
    cto: 'http://maps.google.com/mapfiles/kml/shapes/open-diamond.png',
    ctosp: 'http://maps.google.com/mapfiles/kml/shapes/track.png',
    cliente: 'http://maps.google.com/mapfiles/kml/paddle/C.png',
    clienteAtivado: 'http://maps.google.com/mapfiles/kml/paddle/blu-blank.png',
    clienteDesativado: 'http://maps.google.com/mapfiles/kml/paddle/blu-blank.png',
    estacao: 'http://maps.google.com/mapfiles/kml/shapes/ranger_station.png',
    condominio: 'http://maps.google.com/mapfiles/kml/shapes/homegardenbusiness.png',
    dio: 'http://maps.google.com/mapfiles/kml/shapes/square.png'
  };

  /**
   * 📤 EXPORT: Exporta o conteúdo do mapa para KML
   */
  exportMapToKML(data: MapExportData): void {
    console.log('🗺️ [KML-EXPORT] Iniciando exportação para KML...');
    
    let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Fiberworks Export</name>
    <description>Exportação do mapa Fiberworks</description>
    
    <!-- Estilos com ícones do Google Earth -->
    ${this.createIconStyle('icon-caixa', this.customIcons.caixa)}
    ${this.createIconStyle('icon-cto', this.customIcons.cto)}
    ${this.createIconStyle('icon-ctosp', this.customIcons.ctosp)}
    ${this.createIconStyle('icon-cliente', this.customIcons.cliente)}
    ${this.createIconStyle('icon-cliente-ativado', this.customIcons.clienteAtivado)}
    ${this.createIconStyle('icon-cliente-desativado', this.customIcons.clienteDesativado)}
    ${this.createIconStyle('icon-estacao', this.customIcons.estacao)}
    ${this.createIconStyle('icon-condominio', this.customIcons.condominio)}
    ${this.createIconStyle('icon-dio', this.customIcons.dio)}`;

    // Exportar caixas (CEO)
    if (data.caixas && data.caixas.length > 0) {
      kmlContent += this.exportMarkersToKML('Caixas (CEO)', data.caixas, (item) => ({
        name: item.numero || 'S/N',
        description: `ID: ${item.id_meta}<br>Número: ${item.numero}`,
        lat: parseFloat(item.LAT),
        lng: parseFloat(item.LONGI),
        icon: 'icon-caixa'
      }));
    }

    // Exportar CTOs
    if (data.ctos && data.ctos.length > 0) {
      kmlContent += this.exportMarkersToKML('CTOs', data.ctos, (item) => ({
        name: item.numero || 'S/N',
        description: `ID: ${item.id_meta}<br>Número: ${item.numero}`,
        lat: parseFloat(item.LAT),
        lng: parseFloat(item.LONGI),
        icon: 'icon-cto'
      }));
    }

    // Exportar CTOs com Splitter
    if (data.ctosSP && data.ctosSP.length > 0) {
      kmlContent += this.exportMarkersToKML('CTOs com Splitter', data.ctosSP, (item) => ({
        name: item.numero || 'S/N',
        description: `ID: ${item.id_meta}<br>Número: ${item.numero}`,
        lat: parseFloat(item.LAT),
        lng: parseFloat(item.LONGI),
        icon: 'icon-ctosp'
      }));
    }

    // Exportar Clientes
    // if (data.clientes && data.clientes.length > 0) {
    //   kmlContent += this.exportMarkersToKML('Clientes', data.clientes, (item) => ({
    //     name: item.sigla || 'S/N',
    //     description: `ID: ${item.id_meta}<br>Sigla: ${item.sigla}`,
    //     lat: parseFloat(item.LAT),
    //     lng: parseFloat(item.LNG),
    //     icon: 'icon-cliente'
    //   }));
    // }

    // Exportar Clientes Ativados
    // if (data.clientesAtivados && data.clientesAtivados.length > 0) {
    //   kmlContent += this.exportMarkersToKML('Clientes Ativados', data.clientesAtivados, (item) => ({
    //     name: item.sigla || 'S/N',
    //     description: `ID: ${item.id_meta}<br>Sigla: ${item.sigla}`,
    //     lat: parseFloat(item.LAT),
    //     lng: parseFloat(item.LNG),
    //     icon: 'icon-cliente-ativado'
    //   }));
    // }

    // Exportar Clientes Desativados
    // if (data.clientesDesativados && data.clientesDesativados.length > 0) {
    //   kmlContent += this.exportMarkersToKML('Clientes Desativados', data.clientesDesativados, (item) => ({
    //     name: item.sigla || 'S/N',
    //     description: `ID: ${item.id_meta}<br>Sigla: ${item.sigla}`,
    //     lat: parseFloat(item.LAT),
    //     lng: parseFloat(item.LNG),
    //     icon: 'icon-cliente-desativado'
    //   }));
    // }

    // Exportar estações
    if (data.estacoes && data.estacoes.length > 0) {
      kmlContent += this.exportMarkersToKML('Estações', data.estacoes, (item) => ({
        name: item.sigla || 'S/N',
        description: `ID: ${item.id_meta}<br>Sigla: ${item.sigla}`,
        lat: parseFloat(item.LAT),
        lng: parseFloat(item.LNG),
        icon: 'icon-estacao'
      }));
    }

    // Exportar condomínios
    if (data.condominios && data.condominios.length > 0) {
      kmlContent += this.exportMarkersToKML('Condomínios', data.condominios, (item) => ({
        name: item.sigla || 'S/N',
        description: `ID: ${item.id_meta}<br>Sigla: ${item.sigla}`,
        lat: parseFloat(item.LAT),
        lng: parseFloat(item.LNG),
        icon: 'icon-condominio'
      }));
    }

    // Exportar DIOS
    if (data.dios && data.dios.length > 0) {
      kmlContent += this.exportMarkersToKML('DIOS', data.dios, (item) => ({
        name: item.sigla || 'S/N',
        description: `ID: ${item.id_meta}<br>Sigla: ${item.sigla}<br>Capacidade: ${item.CAPACIDADE}`,
        lat: parseFloat(item.LAT),
        lng: parseFloat(item.LNG),
        icon: 'icon-dio'
      }));
    }

    // Exportar cabos
    if (data.cabos1f && data.cabos1f.length > 0) {
      kmlContent += this.exportCabosToKML('Cabos 1f', data.cabos1f, '#0000FF');
    }
    if (data.cabos2f && data.cabos2f.length > 0) {
      kmlContent += this.exportCabosToKML('Cabos 2f', data.cabos2f, '#00FFFF');
    }
    if (data.cabos4f && data.cabos4f.length > 0) {
      kmlContent += this.exportCabosToKML('Cabos 4f', data.cabos4f, '#29A1D0');
    }
    if (data.cabos6f && data.cabos6f.length > 0) {
      kmlContent += this.exportCabosToKML('Cabos 6f', data.cabos6f, '#000000');
    }
    if (data.cabos8f && data.cabos8f.length > 0) {
      kmlContent += this.exportCabosToKML('Cabos 8f', data.cabos8f, '#0000FF');
    }
    if (data.cabos12f && data.cabos12f.length > 0) {
      kmlContent += this.exportCabosToKML('Cabos 12f', data.cabos12f, '#00FF00');
    }
    if (data.cabos24f && data.cabos24f.length > 0) {
      kmlContent += this.exportCabosToKML('Cabos 24f', data.cabos24f, '#FF00FF');
    }
    if (data.cabos36f && data.cabos36f.length > 0) {
      kmlContent += this.exportCabosToKML('Cabos 36f', data.cabos36f, '#0000FF');
    }
    if (data.cabos48f && data.cabos48f.length > 0) {
      kmlContent += this.exportCabosToKML('Cabos 48f', data.cabos48f, '#FF0000');
    }
    if (data.cabos72f && data.cabos72f.length > 0) {
      kmlContent += this.exportCabosToKML('Cabos 72f', data.cabos72f, '#8000FF');
    }
    if (data.cabos144f && data.cabos144f.length > 0) {
      kmlContent += this.exportCabosToKML('Cabos 144f', data.cabos144f, '#FFAE42');
    }

    kmlContent += `
  </Document>
</kml>`;

    // Criar arquivo e fazer download
    this.downloadFile(kmlContent, 'fiberworks-export.kml', 'application/vnd.google-earth.kml+xml');
    
    console.log('🗺️ [KML-EXPORT] Exportação concluída!');
  }

  /**
   * 📤 EXPORT: Método auxiliar para exportar marcadores
   */
  private exportMarkersToKML(
    folderName: string, 
    items: any[], 
    transformer: (item: any) => {name: string, description: string, lat: number, lng: number, icon: string}
  ): string {
    let kml = `
    <Folder>
      <name>${this.escapeXml(folderName)}</name>`;

    items.forEach(item => {
      try {
        const data = transformer(item);
        
        // Validar coordenadas
        if (isNaN(data.lat) || isNaN(data.lng)) {
          console.warn('Coordenadas inválidas para item:', item);
          return;
        }
        
        // 🆕 Limpar caracteres inválidos antes de escapar
        const escapedName = this.escapeXml(this.cleanInvalidChars(data.name));
        const escapedDescription = this.escapeXml(this.cleanInvalidChars(data.description));

        kml += `
      <Placemark>
        <name>${escapedName}</name>
        <description><![CDATA[${escapedDescription}]]></description>
        <styleUrl>#${data.icon}</styleUrl>
        <Point>
          <coordinates>${data.lng},${data.lat},0</coordinates>
        </Point>
      </Placemark>`;
      } catch (e) {
        console.error('Erro ao processar item para KML:', e, item);
      }
    });

    kml += `
    </Folder>`;

    return kml;
  }

  /**
   * 📤 EXPORT: Método auxiliar para exportar cabos (polylines)
   */
  private exportCabosToKML(folderName: string, cabos: any[], cor: string): string {
    let kml = `
    <Folder>
      <name>${this.escapeXml(folderName)}</name>`;

    cabos.forEach(cabo => {
      try {
        if (cabo.GOOGLE_LATLNG) {
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            // Validar coordenadas
            const validCoords = coords.filter(c => !isNaN(c.lat) && !isNaN(c.lng));
            
            if (validCoords.length === 0) {
              console.warn('Nenhuma coordenada válida para cabo:', cabo.id_meta);
              return;
            }
            
            const coordinatesStr = validCoords.map(c => `${c.lng},${c.lat},0`).join(' ');
            
            const idMeta = cabo.id_meta || 'N/A';
            // 🆕 Limpar caracteres inválidos antes de escapar
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
          }
        }
      } catch (e) {
        console.error('Erro ao processar cabo para KML:', e, cabo);
      }
    });

    kml += `
    </Folder>`;

    return kml;
  }

  /**
   * 📤 EXPORT: Converte string de coordenadas para array
   */
  private convertStringToCoords(coordString: string): any[] {
    try {
      if (Array.isArray(coordString)) {
        return coordString.map(coord => ({
          lat: parseFloat(String(coord.lat)),
          lng: parseFloat(String(coord.lng))
        }));
      }

      const coords = typeof coordString === 'string' ? JSON.parse(coordString) : coordString;
      
      if (Array.isArray(coords)) {
        return coords.map(coord => ({
          lat: parseFloat(String(coord.lat)),
          lng: parseFloat(String(coord.lng))
        }));
      }

      return [];
    } catch (e) {
      console.error('Erro ao converter coordenadas:', e);
      return [];
    }
  }

  /**
   * 📤 EXPORT: Converte cor RGB hexadecimal para formato KML (AABBGGRR)
   */
  private rgbToKmlColor(hex: string): string {
    const hexColor = hex.replace('#', '');
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    
    return `ff${b.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${r.toString(16).padStart(2, '0')}`;
  }

  /**
   * 📤 EXPORT: Cria estilo de ícone customizado no KML
   */
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

  /**
   * 🆕 Limpa caracteres inválidos e de controle
   */
  private cleanInvalidChars(str: string): string {
    if (!str) return '';
    
    // Remover caracteres de controle (0x00-0x1F) exceto \n, \r, \t
    // Remover caracteres não-UTF8 válidos
    return str
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove caracteres de controle exceto \n, \r, \t
      .replace(/[\uFFFE\uFFFF]/g, '') // Remove caracteres não-UTF8
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
      .trim();
  }

  /**
   * 📤 EXPORT: Escapa caracteres especiais XML
   */
  private escapeXml(str: string): string {
    if (!str) return '';
    
    // 🆕 Limpar caracteres inválidos primeiro
    const cleaned = this.cleanInvalidChars(str);
    
    return cleaned
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * 📤 EXPORT: Faz download do arquivo
   */
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
    
    console.log(`📥 Arquivo ${filename} baixado com sucesso!`);
  }
}
