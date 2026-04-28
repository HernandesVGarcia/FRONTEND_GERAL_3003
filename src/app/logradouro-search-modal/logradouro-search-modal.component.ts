import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  CompartilhamentoService,
  LogradouroPesquisaData,
} from '../servico/compartilhamento.service';

@Component({
  selector: 'app-logradouro-search-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, NgbModule],
  templateUrl: './logradouro-search-modal.component.html',
  styleUrls: ['./logradouro-search-modal.component.css'],
})
export class LogradouroSearchModalComponent implements AfterViewInit, OnDestroy {
  @ViewChild('enderecoInput', { static: false })
  enderecoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef;

  enderecoTexto = '';
  errorMessage = '';
  placesReady = false;
  isSearching = false;

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
    private compartilhamentoService: CompartilhamentoService,
    private ngZone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    queueMicrotask(() => this.initAutocomplete());
  }

  ngOnDestroy(): void {
    this.placeChangedListener = null;
    this.autocomplete = null;
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
    const data: LogradouroPesquisaData = {
      lat: loc.lat(),
      lng: loc.lng(),
      endereco:
        (place.formatted_address ?? place.name ?? this.enderecoTexto).trim() ||
        this.enderecoTexto,
    };
    this.finalizarComPonto(data);
  }

  onPesquisarGeocode(): void {
    const address = (this.enderecoTexto || '').trim();
    if (!address) {
      this.errorMessage = 'Digite um endereço ou selecione uma sugestão da lista.';
      return;
    }
    this.errorMessage = '';
    this.isSearching = true;
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
            this.finalizarComPonto({
              lat: loc.lat(),
              lng: loc.lng(),
              endereco: results[0].formatted_address || address,
            });
          } else {
            this.errorMessage =
              status === 'ZERO_RESULTS'
                ? 'Nenhum resultado para este endereço. Tente outro texto ou escolha uma sugestão.'
                : `Não foi possível localizar o endereço (${status}).`;
          }
        });
      },
    );
  }

  private finalizarComPonto(data: LogradouroPesquisaData): void {
    this.compartilhamentoService.compartilharLogradouroPesquisa(data);
    this.activeModal.close(data);
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
