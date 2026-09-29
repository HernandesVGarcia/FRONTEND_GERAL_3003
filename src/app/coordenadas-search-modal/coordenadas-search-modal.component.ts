import {
  Component,
  ElementRef,
  HostListener,
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
  selector: 'app-coordenadas-search-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, NgbModule],
  templateUrl: './coordenadas-search-modal.component.html',
  styleUrls: ['./coordenadas-search-modal.component.css'],
})
export class CoordenadasSearchModalComponent {
  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef;

  latitudeTexto = '';
  longitudeTexto = '';
  errorMessage = '';

  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;

  constructor(
    public activeModal: NgbActiveModal,
    private compartilhamentoService: CompartilhamentoService,
  ) {}

  onPesquisar(): void {
    this.errorMessage = '';

    const latStr = (this.latitudeTexto || '').trim();
    const lngStr = (this.longitudeTexto || '').trim();

    if (!latStr || !lngStr) {
      this.errorMessage = 'Informe latitude e longitude.';
      return;
    }

    const lat = this.parseCoord(latStr);
    const lng = this.parseCoord(lngStr);

    if (lat === null) {
      this.errorMessage = 'Latitude inválida.';
      return;
    }
    if (lng === null) {
      this.errorMessage = 'Longitude inválida.';
      return;
    }
    if (lat < -90 || lat > 90) {
      this.errorMessage = 'Latitude deve estar entre -90 e 90.';
      return;
    }
    if (lng < -180 || lng > 180) {
      this.errorMessage = 'Longitude deve estar entre -180 e 180.';
      return;
    }

    const data: LogradouroPesquisaData = {
      lat,
      lng,
      endereco: `Coordenadas: ${lat}, ${lng}`,
    };
    this.compartilhamentoService.compartilharLogradouroPesquisa(data);
    this.activeModal.close(data);
  }

  private parseCoord(raw: string): number | null {
    const normalized = raw.replace(',', '.').trim();
    const value = Number.parseFloat(normalized);
    if (!Number.isFinite(value)) {
      return null;
    }
    return value;
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
