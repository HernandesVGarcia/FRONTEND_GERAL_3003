import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export type MapLayerId =
  | 'poligonos'
  | 'ceo'
  | 'cto'
  | 'ctosp'
  | 'cabos'
  | 'condominios'
  | 'clientes'
  | 'clientes_ativos'
  | 'clientes_cancelados'
  | 'estacoes';

export const MAP_LAYER_OPTIONS: { id: MapLayerId; label: string }[] = [//APARECE NO COMBOBOX CAMADAS
  { id: 'poligonos', label: 'Polígonos' },
  { id: 'ceo', label: 'CEO' },
  { id: 'cto', label: 'CTO' },
  { id: 'ctosp', label: 'CTOSP' },
  { id: 'cabos', label: 'Cabos' },
  { id: 'condominios', label: 'Condomínios' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'clientes_ativos', label: 'Clientes Ativos' },
  { id: 'clientes_cancelados', label: 'Clientes Cancelados' },
  { id: 'estacoes', label: 'Estações' },
];

@Injectable({
  providedIn: 'root',
})
export class MapLayerVisibilityService {
  private readonly layers: Record<MapLayerId, boolean>; //valor inicial das camadas
  private readonly layersSubject = new BehaviorSubject<Record<MapLayerId, boolean>>(
    {} as Record<MapLayerId, boolean>,
  );

  readonly layersChanged$ = this.layersSubject.asObservable();// observa as mudanças nas camadas

  constructor(private authService: AuthService) {
    const ctoOn = this.authService.getcto_layer() === '1';
    const clientesOn = this.authService.getclientes_layer() === '1';
    this.layers = {
      poligonos: true,
      ceo: this.authService.getceo_layer() === '1',
      cto: ctoOn,
      ctosp: ctoOn,
      cabos: this.authService.getcabos_layer() === '1',
      condominios: true,
      clientes: clientesOn,
      clientes_ativos: clientesOn,
      clientes_cancelados: clientesOn,
      estacoes: true,
    };
    this.layersSubject.next({ ...this.layers });
  }

  isVisible(id: MapLayerId): boolean {
    return this.layers[id];
  }

  getVisibleLayerIds(): MapLayerId[] {// obtém as camadas selecionadas  1ª arrow function filtra as camadas que estão visíveis e a 2ª arrow function pega o id das camadas que estão visíveis
    return MAP_LAYER_OPTIONS.filter((opt) => this.layers[opt.id]).map((opt) => opt.id);
  }

  setVisible(id: MapLayerId, visible: boolean): void {
    if (this.layers[id] === visible) {
      return;
    }
    this.layers[id] = visible;
    this.layersSubject.next({ ...this.layers });
  }

  setFromSelection(selected: MapLayerId[]): void {
    const next: Record<MapLayerId, boolean> = {
      poligonos: selected.includes('poligonos'),
      ceo: selected.includes('ceo'),
      cto: selected.includes('cto'),
      ctosp: selected.includes('ctosp'),
      cabos: selected.includes('cabos'),
      condominios: selected.includes('condominios'),
      clientes: selected.includes('clientes'),
      clientes_ativos: selected.includes('clientes_ativos'),
      clientes_cancelados: selected.includes('clientes_cancelados'),
      estacoes: selected.includes('estacoes'),
    };
    if (
      next.poligonos === this.layers.poligonos &&
      next.ceo === this.layers.ceo &&
      next.cto === this.layers.cto &&
      next.ctosp === this.layers.ctosp &&
      next.cabos === this.layers.cabos &&
      next.condominios === this.layers.condominios &&
      next.clientes === this.layers.clientes &&
      next.clientes_ativos === this.layers.clientes_ativos &&
      next.clientes_cancelados === this.layers.clientes_cancelados &&
      next.estacoes === this.layers.estacoes
    ) {
      return;
    }
    Object.assign(this.layers, next);
    this.layersSubject.next({ ...this.layers });
  }
}
