import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GoogleMapsModule } from '@angular/google-maps';
import { CondominioInternoModalData } from './condominio-interno-modal.data';
import { CondominioPrumadaStencilService } from '../servico/condominio-prumada-stencil.service';
import { CaixaCondominioService } from '../servico/caixa-condominio.service';
import { CaixaCondominio } from '../modelo/CaixaCondominio';
import { CondominioPrumadaPointM } from '../modelo/condominio-prumada.stencil';

const BLANK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'all', elementType: 'all', stylers: [{ visibility: 'off' }] },
];

@Component({
  selector: 'app-condominio-interno-modal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, GoogleMapsModule],
  templateUrl: './condominio-interno-modal.component.html',
  styleUrls: ['./condominio-interno-modal.component.css'],
})
export class CondominioInternoModalComponent implements AfterViewInit, OnDestroy {
  center: google.maps.LatLngLiteral = { lat: -23.326803, lng: -52.114882 };
  zoom = 20;

  mapOptions: google.maps.MapOptions = {
    backgroundColor: '#ffffff',
    styles: BLANK_MAP_STYLES,
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy',
  };

  private map?: google.maps.Map;
  private dxfPolygons: google.maps.Polygon[] = [];
  private andarLabelMarkers: google.maps.Marker[] = [];
  private caixaMarkers: google.maps.Marker[] = [];

  private modalElement: HTMLElement | null = null;
  private modalHeaderElement: HTMLElement | null = null;
  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private dragListenersAttached = false;

  private readonly boundDragMove = (e: MouseEvent) => this.dragMove(e);
  private readonly boundDragEnd = (e: MouseEvent) => this.dragEnd(e);
  private readonly onHeaderMouseDown = (e: MouseEvent) => this.dragStart(e);

  constructor(
    public dialogRef: MatDialogRef<CondominioInternoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CondominioInternoModalData,
    private elementRef: ElementRef<HTMLElement>,
    private condominioPrumadaStencilService: CondominioPrumadaStencilService,
    private caixaCondominioService: CaixaCondominioService,
  ) {
    const lat = Number(data.lat);
    const lng = Number(data.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      this.center = { lat, lng };
    }
  }

  ngAfterViewInit(): void {
    this.setupDragFunctionality();
  }

  ngOnDestroy(): void {
    this.teardownDragListeners();
    this.clearDxfPolygons();
    this.clearCaixaMarkers();
  }

  close(): void {
    this.dialogRef.close();
  }

  get titulo(): string {
    const sigla = this.data.sigla?.trim();
    return sigla ? `Condomínio: ${sigla}` : `Condomínio #${this.data.id_meta}`;
  }

  onMapInitialized(map: google.maps.Map): void {
    this.map = map;
    map.setCenter(this.center);
    this.loadPrumadaStencil();
  }

  private loadPrumadaStencil(): void {
    if (
      !this.map ||
      typeof google.maps.geometry?.spherical?.computeOffset !== 'function'
    ) {
      return;
    }

    this.condominioPrumadaStencilService.loadStencil().subscribe({
      next: (stencil) => {
        if (!this.map || stencil.shapes.length === 0) {
          return;
        }

        const shapes = this.condominioPrumadaStencilService.filterShapesByQtdAndares(
          stencil.shapes,
          this.data.qtdAndares,
          stencil.maxAndares,
        );

        if (shapes.length === 0) {
          return;
        }

        this.clearDxfPolygons();
        const originM = this.condominioPrumadaStencilService.computeOrigin(shapes);
        const bounds = new google.maps.LatLngBounds();

        for (const shape of shapes) {
          const paths = shape.verticesM.map((v) =>
            this.condominioPrumadaStencilService.localPointToLatLng(
              v.x,
              v.y,
              this.center,
              originM,
            ),
          );

          for (const p of paths) {
            bounds.extend(p);
          }

          const isCentral =
            this.condominioPrumadaStencilService.isCentralPrumadaShape(shape);

          const polygon = new google.maps.Polygon({
            paths,
            map: this.map,
            strokeColor: '#666666',
            strokeOpacity: 1,
            strokeWeight: 1,
            fillColor: isCentral ? '#ffffff' : '#d3d3ab',
            fillOpacity: isCentral ? 1 : 0.7,
            clickable: false,
            zIndex: isCentral ? 2 : 1,
          });
          polygon.set('dxfLayer', shape.layer);
          this.dxfPolygons.push(polygon);

          if (isCentral) {
            const labelText =
              this.condominioPrumadaStencilService.getLayerLabel(shape.layer);
            if (labelText) {
              const centroidM =
                this.condominioPrumadaStencilService.shapeCentroidM(shape);
              const labelPos =
                this.condominioPrumadaStencilService.localPointToLatLng(
                  centroidM.x,
                  centroidM.y,
                  this.center,
                  originM,
                );
              const labelMarker = new google.maps.Marker({
                position: labelPos,
                map: this.map,
                clickable: false,
                zIndex: google.maps.Marker.MAX_ZINDEX + 1,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillOpacity: 0,
                  strokeOpacity: 0,
                  scale: 1,
                },
                label: {
                  text: labelText,
                  color: 'rgba(15, 23, 42, 0.72)',
                  fontSize: '22px',
                  fontWeight: 'bold',
                },
              });
              this.andarLabelMarkers.push(labelMarker);
            }
          }
        }

        if (!bounds.isEmpty()) {
          this.map.fitBounds(bounds, 32);
        }

        this.loadCaixasCondominio(originM, bounds);
      },
      error: (err) => {
        console.error('[CONDOMINIO-PRUMADA] Falha ao carregar stencil:', err);
      },
    });
  }

  private loadCaixasCondominio(
    originM: CondominioPrumadaPointM,
    bounds: google.maps.LatLngBounds,
  ): void {
    if (!this.map || !this.data.id_meta) {
      return;
    }

    this.caixaCondominioService.selecionarPorCondominio(this.data.id_meta).subscribe({
      next: (caixas) => {
        if (!this.map) {
          return;
        }

        this.clearCaixaMarkers();

        for (const caixa of caixas) {
          const marker = this.criarMarcadorCaixaCondominio(caixa, originM, bounds);
          if (marker) {
            this.caixaMarkers.push(marker);
          }
        }

        if (!bounds.isEmpty()) {
          this.map.fitBounds(bounds, 32);
        }
      },
      error: (err) => {
        console.error('[CONDOMINIO-CAIXAS] Falha ao carregar caixas:', err);
      },
    });
  }

  private criarMarcadorCaixaCondominio(
    caixa: CaixaCondominio,
    originM: CondominioPrumadaPointM,
    bounds: google.maps.LatLngBounds,
  ): google.maps.Marker | null {
    if (!this.map) {
      return null;
    }

    const xM = this.condominioPrumadaStencilService.parsePinCoordM(caixa.PINX);
    const yM = this.condominioPrumadaStencilService.parsePinCoordM(caixa.PINY);
    if (xM == null || yM == null) {
      return null;
    }

    const position = this.condominioPrumadaStencilService.localPointToLatLng(
      xM,
      yM,
      this.center,
      originM,
    );
    bounds.extend(position);

    const idTipo = Number(caixa.ID_TIPO ?? 1);
    const iconConfig = this.iconConfigCaixaCondominio(idTipo);

    const marker = new google.maps.Marker({
      position,
      map: this.map,
      title: caixa.numero || `Caixa #${caixa.id_meta}`,
      clickable: true,
      zIndex: google.maps.Marker.MAX_ZINDEX,
      label: {
        text: caixa.numero || 'S/N',
        color: 'blue',
        fontSize: '10px',
      },
      icon: iconConfig,
    });

    marker.set('id_meta', caixa.id_meta);
    marker.set('numero', caixa.numero);
    marker.set('ID_TIPO', idTipo);
    marker.set('conta_splitter', caixa.conta_splitter);
    marker.set('caixa_condominio_data', caixa);

    return marker;
  }

  private iconConfigCaixaCondominio(
    idTipo: number,
  ): google.maps.Icon {
    if (idTipo >= 10 && idTipo <= 13) {
      return {
        url: '/assets/CTO80.png',
        labelOrigin: new google.maps.Point(50, 10),
        scaledSize: new google.maps.Size(18, 22),
      };
    }
    if (idTipo > 13) {
      return {
        url: '/assets/CTOSP.png',
        labelOrigin: new google.maps.Point(50, 10),
        scaledSize: new google.maps.Size(18, 22),
      };
    }
    return {
      url: '/assets/fosc ama.png',
      labelOrigin: new google.maps.Point(70, 10),
      scaledSize: new google.maps.Size(20, 40),
    };
  }

  private clearCaixaMarkers(): void {
    for (const marker of this.caixaMarkers) {
      marker.setMap(null);
    }
    this.caixaMarkers = [];
  }

  private clearDxfPolygons(): void {
    for (const polygon of this.dxfPolygons) {
      polygon.setMap(null);
    }
    this.dxfPolygons = [];

    for (const marker of this.andarLabelMarkers) {
      marker.setMap(null);
    }
    this.andarLabelMarkers = [];
  }

  private setupDragFunctionality(): void {
    setTimeout(() => {
      this.modalElement = this.elementRef.nativeElement.closest(
        '.mat-mdc-dialog-container',
      );
      this.modalHeaderElement = this.elementRef.nativeElement.querySelector(
        '.modal-header',
      );
      if (
        this.dragListenersAttached ||
        !this.modalHeaderElement ||
        !this.modalElement
      ) {
        return;
      }
      this.modalHeaderElement.addEventListener(
        'mousedown',
        this.onHeaderMouseDown,
      );
      document.addEventListener('mousemove', this.boundDragMove);
      document.addEventListener('mouseup', this.boundDragEnd);
      this.dragListenersAttached = true;
    }, 0);
  }

  private teardownDragListeners(): void {
    if (!this.dragListenersAttached) {
      return;
    }
    if (this.modalHeaderElement) {
      this.modalHeaderElement.removeEventListener(
        'mousedown',
        this.onHeaderMouseDown,
      );
    }
    document.removeEventListener('mousemove', this.boundDragMove);
    document.removeEventListener('mouseup', this.boundDragEnd);
    if (this.modalElement) {
      this.modalElement.classList.remove('dragging');
    }
    this.dragListenersAttached = false;
    this.isDragging = false;
    this.modalHeaderElement = null;
    this.modalElement = null;
  }

  private dragStart(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    if (
      !this.modalHeaderElement ||
      (event.target !== this.modalHeaderElement &&
        !this.modalHeaderElement.contains(event.target as Node))
    ) {
      return;
    }
    this.initialX = event.clientX - this.currentX;
    this.initialY = event.clientY - this.currentY;
    this.isDragging = true;
    this.modalElement?.classList.add('dragging');
  }

  private dragMove(event: MouseEvent): void {
    if (!this.isDragging || !this.modalElement) {
      return;
    }
    event.preventDefault();
    this.currentX = event.clientX - this.initialX;
    this.currentY = event.clientY - this.initialY;
    this.setTranslate(this.currentX, this.currentY, this.modalElement);
  }

  private dragEnd(_event: MouseEvent): void {
    if (!this.isDragging) {
      return;
    }
    this.initialX = this.currentX;
    this.initialY = this.currentY;
    this.isDragging = false;
    this.modalElement?.classList.remove('dragging');
  }

  private setTranslate(xPos: number, yPos: number, el: HTMLElement): void {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  }
}
