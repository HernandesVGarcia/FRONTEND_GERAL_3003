import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Caixa } from '../modelo/Caixa';
import { Cto_SP } from '../modelo/Cto_SP';
import { Splitter } from '../modelo/Splitter';
import {
  CompartilhamentoService,
  ViabilidadeCirculoCaixaData,
} from '../servico/compartilhamento.service';
import { SplitterViabilidadeService } from '../servico/splitter-viabilidade.service';

/** Nó da árvore de viabilidade; splitters carregados ao expandir o details. */
export type ViabilidadeItemNode =
  | {
      tipo: 'ceo';
      item: Caixa;
      distanciaMetros: number;
      splitters?: Splitter[];
      splittersLoading?: boolean;
      splittersError?: string;
    }
  | {
      tipo: 'ctosp';
      item: Cto_SP;
      distanciaMetros: number;
      splitters?: Splitter[];
      splittersLoading?: boolean;
      splittersError?: string;
    };

const RAIO_PADRAO_METROS = 150;
const RAIO_MAX_METROS = 100_000;
/** Limite de linhas `saída(k)` por splitter (proteção contra valores absurdos da API). */
const SPLITTER_VIABILIDADE_SAIDAS_CAP_MAX = 256;

@Component({
  selector: 'app-viabilidade-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, NgbModule],
  templateUrl: './viabilidade-modal.component.html',
  styleUrls: ['./viabilidade-modal.component.css'],
})
export class ViabilidadeModalComponent implements AfterViewInit, OnDestroy {
  @Input() caixas: Caixa[] = [];
  @Input() ctosSP: Cto_SP[] = [];

  @ViewChild('enderecoInput', { static: false })
  enderecoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef;

  enderecoTexto = '';
  /** Valor em texto para o utilizador editar (por defeito 150 m). */
  raioMetrosTexto = String(RAIO_PADRAO_METROS);
  errorMessage = '';
  placesReady = false;
  isSearching = false;
  resultadoArvore: ViabilidadeItemNode[] = [];
  mensagemSemResultado = '';

  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;
  private placeChangedListener: google.maps.MapsEventListener | null = null;
  private autocomplete: google.maps.places.Autocomplete | null = null;

  constructor(
    public activeModal: NgbActiveModal,
    private ngZone: NgZone,
    private compartilhamentoService: CompartilhamentoService,
    private splitterViabilidadeService: SplitterViabilidadeService,
  ) {}

  ngAfterViewInit(): void {
    queueMicrotask(() => this.initAutocomplete());
  }

  ngOnDestroy(): void {
    this.placeChangedListener = null;
    this.autocomplete = null;
    this.compartilhamentoService.limparViabilidadeCirculosCaixas();
  }

  private initAutocomplete(): void {
    this.errorMessage = '';
    const g = typeof google !== 'undefined' ? google : undefined;
    if (!g?.maps?.places?.Autocomplete) {
      this.placesReady = false;
      this.errorMessage =
        'API Places não disponível. Confirme "libraries=...,places" no script do mapa e que a chave tem Places ativo.';
      return;
    }
    const el = this.enderecoInput?.nativeElement;
    if (!el) {
      this.errorMessage = 'Campo de endereço indisponível.';
      return;
    }
    this.placesReady = true;
    this.autocomplete = new g.maps.places.Autocomplete(el, {
      fields: ['geometry', 'formatted_address', 'name'],
      componentRestrictions: { country: 'br' },
    });
    this.placeChangedListener = this.autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => this.onPlaceChangedFromAutocomplete());
    });
  }

  private onPlaceChangedFromAutocomplete(): void {
    if (!this.autocomplete) {
      return;
    }
    const place = this.autocomplete.getPlace();
    if (!place.geometry?.location) {
      return;
    }
    const loc = place.geometry.location;
    const endereco =
      (place.formatted_address ?? place.name ?? this.enderecoTexto ?? '').trim() ||
      this.enderecoTexto.trim() ||
      'Viabilidade';
    this.aplicarPesquisa(loc.lat(), loc.lng(), endereco);
  }

  onPesquisarGeocode(): void {
    const address = (this.enderecoTexto || '').trim();
    if (!address) {
      this.errorMessage = 'Digite um endereço ou selecione uma sugestão da lista.';
      return;
    }
    this.errorMessage = '';
    this.isSearching = true;
    this.mensagemSemResultado = '';
    const g = typeof google !== 'undefined' ? google : undefined;
    if (!g?.maps?.Geocoder) {
      this.isSearching = false;
      this.errorMessage = 'Geocoder não disponível.';
      return;
    }
    const geocoder = new g.maps.Geocoder();
    geocoder.geocode(
      {
        address,
        region: 'BR',
        componentRestrictions: { country: 'BR' },
      },
      (results, status) => {
        this.ngZone.run(() => {
          this.isSearching = false;
          if (status === 'OK' && results && results[0]?.geometry?.location) {
            const loc = results[0].geometry.location;
            const endereco =
              (results[0].formatted_address || address || '').trim() || 'Viabilidade';
            this.aplicarPesquisa(loc.lat(), loc.lng(), endereco);
          } else {
            this.resultadoArvore = [];
            this.errorMessage =
              status === 'ZERO_RESULTS'
                ? 'Nenhum resultado para este endereço. Tente outro texto ou escolha uma sugestão.'
                : `Não foi possível localizar o endereço (${status}).`;
          }
        });
      },
    );
  }

  /**
   * Interpreta o raio em metros; aceita vírgula ou ponto decimal.
   * @returns null se inválido (não numérico ou menor que 1 m).
   */
  private obterRaioMetrosValido(): number | null {
    const raw = (this.raioMetrosTexto ?? '').trim().replace(',', '.');
    if (raw === '') {
      return null;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 1) {
      return null;
    }
    return Math.min(n, RAIO_MAX_METROS);
  }

  private aplicarPesquisa(lat: number, lng: number, enderecoRotulo: string): void {
    this.errorMessage = '';
    this.mensagemSemResultado = '';
    const raio = this.obterRaioMetrosValido();
    if (raio === null) {
      this.resultadoArvore = [];
      this.compartilhamentoService.limparViabilidadeCirculosCaixas();
      this.errorMessage =
        'Indique um raio válido em metros (número ≥ 1; use ponto ou vírgula para decimais).';
      return;
    }
    const g = typeof google !== 'undefined' ? google : undefined;
    if (!g?.maps?.geometry?.spherical) {
      this.resultadoArvore = [];
      this.compartilhamentoService.limparViabilidadeCirculosCaixas();
      this.errorMessage =
        'Biblioteca geometry não disponível. Confirme "libraries=...,geometry" no script do mapa.';
      return;
    }

    const rotuloMapa = (enderecoRotulo || '').trim() || 'Viabilidade';
    this.compartilhamentoService.compartilharViabilidadePontoMapa({
      lat,
      lng,
      endereco: rotuloMapa,
    });

    const temCeo = (this.caixas?.length ?? 0) > 0;
    const temCtosp = (this.ctosSP?.length ?? 0) > 0;
    if (!temCeo && !temCtosp) {
      this.resultadoArvore = [];
      this.compartilhamentoService.limparViabilidadeCirculosCaixas();
      this.mensagemSemResultado =
        'Não há caixas (CEO) nem CTO-SP carregadas no mapa. Carregue um projeto antes de verificar viabilidade.';
      return;
    }
    const origin = new g.maps.LatLng(lat, lng);
    this.resultadoArvore = this.computeNearbyItems(origin, raio);
    if (this.resultadoArvore.length === 0) {
      this.compartilhamentoService.limparViabilidadeCirculosCaixas();
      this.mensagemSemResultado = `Nenhum ponto (CEO ou CTO-SP) encontrado num raio de ${Math.round(raio)} m.`;
    } else {
      const pontos = this.pontosCirculosDaArvore(this.resultadoArvore);
      this.compartilhamentoService.compartilharViabilidadeCirculosCaixas(pontos);
    }
  }

  private pontosCirculosDaArvore(nodes: ViabilidadeItemNode[]): ViabilidadeCirculoCaixaData[] {
    const out: ViabilidadeCirculoCaixaData[] = [];
    for (const node of nodes) {
      const pos = this.parseLatLngPair(node.item.LAT, node.item.LONGI);
      if (!pos) {
        continue;
      }
      out.push({ lat: pos.lat(), lng: pos.lng() });
    }
    return out;
  }

  private parseLatLngPair(
    latRaw: Caixa['LAT'] | Cto_SP['LAT'],
    lngRaw: Caixa['LONGI'] | Cto_SP['LONGI'],
  ): google.maps.LatLng | null {
    if (latRaw == null || lngRaw == null) {
      return null;
    }
    const lat = typeof latRaw === 'number' ? latRaw : Number(latRaw);
    const lng = typeof lngRaw === 'number' ? lngRaw : Number(lngRaw);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return null;
    }
    return new google.maps.LatLng(lat, lng);
  }

  /** CEO só entra na lista se tiver splitters (conta_splitter maior que 0). CTO-SP não usa este filtro. */
  private ceoEntraNaListaViabilidade(caixa: Caixa): boolean {
    const n = caixa.conta_splitter;
    if (n == null) {
      return false;
    }
    const v = typeof n === 'number' ? n : Number(n);
    return Number.isFinite(v) && v > 0;
  }

  private computeNearbyItems(origin: google.maps.LatLng, raioMetros: number): ViabilidadeItemNode[] {
    const out: ViabilidadeItemNode[] = [];
    for (const caixa of this.caixas ?? []) {
      if (!this.ceoEntraNaListaViabilidade(caixa)) {
        continue;
      }
      const pos = this.parseLatLngPair(caixa.LAT, caixa.LONGI);
      if (!pos) {
        continue;
      }
      const d = google.maps.geometry.spherical.computeDistanceBetween(origin, pos);
      if (d <= raioMetros) {
        out.push({ tipo: 'ceo', item: caixa, distanciaMetros: d });
      }
    }
    for (const ctosp of this.ctosSP ?? []) {
      const pos = this.parseLatLngPair(ctosp.LAT, ctosp.LONGI);
      if (!pos) {
        continue;
      }
      const d = google.maps.geometry.spherical.computeDistanceBetween(origin, pos);
      if (d <= raioMetros) {
        out.push({ tipo: 'ctosp', item: ctosp, distanciaMetros: d });
      }
    }
    out.sort((a, b) => a.distanciaMetros - b.distanciaMetros);
    return out;
  }

  /** Formato: `CX_<nomedacaixa> : (<N> Metros)` para CEO e CTO-SP. */
  rotuloLinhaViabilidade(node: ViabilidadeItemNode): string {
    const nome = this.nomeCaixaLista(node);
    const m = Math.round(node.distanciaMetros);
    return `CX_${nome}  :  (${m} Metros)`;
  }

  private nomeCaixaLista(node: ViabilidadeItemNode): string {
    const n = node.item.numero;
    if (n != null && String(n).trim() !== '') {
      return String(n).trim();
    }
    return 'sem_nome';
  }

  /** Formato: `splitter_<id>` — id = id_meta / IDMETA do registo (nunca o LABEL). */
  rotuloSplitterViabilidade(sp: Splitter): string {
    const raw = sp.id_meta ?? sp.IDMETA;
    if (raw != null && String(raw).trim() !== '') {
      const n = Number(raw);
      if (Number.isFinite(n)) {
        return `splitter_${n}`;
      }
    }
    return 'splitter_?';
  }

  /** `[1..N]` com N = capacidade do splitter; `[]` se inválida ou ≤ 0. */
  indicesSaidasSplitter(sp: Splitter): number[] {
    const raw = sp.capacidade ?? sp.CAPACIDADE;
    if (raw == null || String(raw).trim() === '') {
      return [];
    }
    const cap = Math.floor(Number(raw));
    if (!Number.isFinite(cap) || cap <= 0) {
      return [];
    }
    const n = Math.min(cap, SPLITTER_VIABILIDADE_SAIDAS_CAP_MAX);
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  rotuloLinhaSaida(k: number): string {
    return `saída(${k}) : ______`;
  }

  onCentrarEquipamentoNaLista(node: ViabilidadeItemNode): void {
    const pos = this.parseLatLngPair(node.item.LAT, node.item.LONGI);
    if (!pos) {
      return;
    }
    this.compartilhamentoService.compartilharViabilidadeCentrarEquipamento({
      lat: pos.lat(),
      lng: pos.lng(),
      zoom: 19,
    });
  }

  onDetalhesViabilidadeToggle(ev: Event, node: ViabilidadeItemNode): void {
    const el = ev.target as HTMLDetailsElement;
    if (!el.open) {
      return;
    }
    if (node.splitters !== undefined) {
      return;
    }
    if (node.splittersLoading) {
      return;
    }
    const idMeta = node.item.id_meta;
    if (idMeta == null || idMeta <= 0) {
      node.splitters = [];
      return;
    }
    node.splittersLoading = true;
    node.splittersError = undefined;
    this.splitterViabilidadeService.listarPorIdMetaCaixa(idMeta).subscribe({
      next: (list) => {
        this.ngZone.run(() => {
          node.splitters = list ?? [];
          node.splittersLoading = false;
        });
      },
      error: (err: unknown) => {
        this.ngZone.run(() => {
          node.splittersLoading = false;
          node.splittersError = typeof err === 'string' ? err : 'Erro ao carregar splitters.';
          node.splitters = [];
        });
      },
    });
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }

  onMouseDown(event: MouseEvent): void {
    if (event.target instanceof HTMLElement) {
      const header = event.target.closest('.modal-header');
      if (header && !event.target.closest('.btn-close')) {
        this.initialX = event.clientX - this.xOffset;
        this.initialY = event.clientY - this.yOffset;
        if (event.target === header || header.contains(event.target)) {
          this.isDragging = true;
          event.preventDefault();
        }
      }
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      event.preventDefault();
      this.currentX = event.clientX - this.initialX;
      this.currentY = event.clientY - this.initialY;
      this.xOffset = this.currentX;
      this.yOffset = this.currentY;
      if (this.modalDialog) {
        this.modalDialog.nativeElement.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.initialX = this.currentX;
    this.initialY = this.currentY;
    this.isDragging = false;
  }
}
