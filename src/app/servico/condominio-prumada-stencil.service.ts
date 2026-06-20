import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  CondominioPrumadaPointM,
  CondominioPrumadaShape,
  CondominioPrumadaStencil,
} from '../modelo/condominio-prumada.stencil';
import { CONDOMINIO_PRUMADA_STENCIL } from '../Stencil/condominio-prumada/condominio-prumada.stencil.data';

@Injectable({
  providedIn: 'root',
})
export class CondominioPrumadaStencilService {
  loadStencil(): Observable<CondominioPrumadaStencil> {
    return of(CONDOMINIO_PRUMADA_STENCIL);
  }

  /** TERREO + ANDAR1..ANDAR{qtdAndares}; omitir qtdAndares desenha o stencil inteiro. */
  filterShapesByQtdAndares(
    shapes: CondominioPrumadaShape[],
    qtdAndares?: number,
    maxAndares?: number,
  ): CondominioPrumadaShape[] {
    if (qtdAndares == null || !Number.isFinite(qtdAndares) || qtdAndares <= 0) {
      return shapes;
    }

    const limit = Math.min(Math.floor(qtdAndares), maxAndares ?? qtdAndares);

    return shapes.filter((shape) => {
      if (shape.layer === 'TERREO') {
        return true;
      }
      const match = shape.layer.match(/^ANDAR(\d+)$/i);
      if (!match) {
        return false;
      }
      return Number.parseInt(match[1], 10) <= limit;
    });
  }

  computeOrigin(shapes: CondominioPrumadaShape[]): CondominioPrumadaPointM {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const shape of shapes) {
      for (const v of shape.verticesM) {
        minX = Math.min(minX, v.x);
        maxX = Math.max(maxX, v.x);
        minY = Math.min(minY, v.y);
        maxY = Math.max(maxY, v.y);
      }
    }

    if (!Number.isFinite(minX)) {
      return { x: 0, y: 0 };
    }

    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
    };
  }

  /** Faixa central entre os blocos laterais (~25 m no DXF). */
  isCentralPrumadaShape(shape: CondominioPrumadaShape): boolean {
    const xs = shape.verticesM.map((v) => v.x);
    const width = Math.max(...xs) - Math.min(...xs);
    return width <= 30;
  }

  shapeCentroidM(shape: CondominioPrumadaShape): CondominioPrumadaPointM {
    const xs = shape.verticesM.map((v) => v.x);
    const ys = shape.verticesM.map((v) => v.y);
    return {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...ys) + Math.max(...ys)) / 2,
    };
  }

  /** Rótulo no centro da prumada: T no térreo, número nos andares. */
  getLayerLabel(layer: string): string | null {
    if (layer === 'TERREO') {
      return 'T';
    }
    const match = layer.match(/^ANDAR(\d+)$/i);
    return match ? match[1] : null;
  }

  /** Converte PINX/PINY da API ("200,2125 mm") para metros locais (mesma unidade do stencil). */
  parsePinCoordM(raw: string | number | null | undefined): number | null {
    if (raw == null) {
      return null;
    }
    if (typeof raw === 'number') {
      return Number.isFinite(raw) ? raw : null;
    }
    const normalized = String(raw).trim().replace(/\s*mm\s*$/i, '').replace(',', '.');
    const value = Number.parseFloat(normalized);
    return Number.isFinite(value) ? value : null;
  }

  localPointToLatLng(
    xM: number,
    yM: number,
    center: google.maps.LatLngLiteral,
    originM: CondominioPrumadaPointM,
  ): google.maps.LatLngLiteral {
    const localX = xM - originM.x;
    const localY = yM - originM.y;
    const origin = new google.maps.LatLng(center.lat, center.lng);

    const yHeading = localY >= 0 ? 0 : 180;
    const yPoint = google.maps.geometry.spherical.computeOffset(
      origin,
      Math.abs(localY),
      yHeading,
    );

    const xHeading = localX >= 0 ? 90 : 270;
    const point = google.maps.geometry.spherical.computeOffset(
      yPoint,
      Math.abs(localX),
      xHeading,
    );

    return { lat: point.lat(), lng: point.lng() };
  }
}
