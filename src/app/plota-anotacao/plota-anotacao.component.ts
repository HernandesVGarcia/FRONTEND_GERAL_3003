import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InsertAnotacaoService } from '../servico/insert-anotacao.service';
import { AuthService } from '../servico/auth.service';

export interface PlotaAnotacaoData {
  lat?: number;
  lng?: number;
}

export interface PlotaAnotacaoResult {
  id_meta: number;
  label_rabicho: string;
  lat: number;
  lng: number;
  ShapeName?: string;
}

@Component({
  selector: 'app-plota-anotacao',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule, MatIconModule],
  templateUrl: './plota-anotacao.component.html',
  styleUrls: ['./plota-anotacao.component.css'],
})
export class PlotaAnotacaoComponent implements OnInit, OnChanges {
  salvando = false;

  form = {
    label_rabicho: '',
    lat: '',
    lng: '',
  };

  @Input() data: PlotaAnotacaoData = {};

  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef;

  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;

  constructor(
    public activeModal: NgbActiveModal,
    private insertAnotacaoService: InsertAnotacaoService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.atualizarFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']?.currentValue) {
      this.atualizarFormulario();
    }
  }

  private atualizarFormulario(): void {
    this.form.label_rabicho = '';
    this.form.lat = this.data.lat?.toString().replace('.', ',') || '';
    this.form.lng = this.data.lng?.toString().replace('.', ',') || '';
  }

  salvar(): void {
    const texto = this.form.label_rabicho?.trim();
    if (!texto) {
      alert('Por favor, preencha o texto da anotação.');
      return;
    }

    if (!this.form.lat?.trim() || !this.form.lng?.trim()) {
      alert('Coordenadas não encontradas.');
      return;
    }

    const lat = this.form.lat.replace(',', '.');
    const lng = this.form.lng.replace(',', '.');
    if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
      alert('Coordenadas inválidas.');
      return;
    }

    const idCity = this.authService.getIdCity();
    if (!idCity) {
      alert('Cidade não encontrada. Selecione uma cidade.');
      return;
    }

    this.salvando = true;
    this.insertAnotacaoService
      .criarAnotacao({
        label_rabicho: texto,
        id_city: idCity.toString(),
        LAT: lat,
        LNG: lng,
        id_condominio: 0,
      })
      .subscribe({
        next: (response) => {
          this.salvando = false;
          if (response.success !== false && response.id_meta != null) {
            const resultado: PlotaAnotacaoResult = {
              id_meta: response.id_meta,
              label_rabicho: texto,
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              ShapeName: response.ShapeName,
            };
            this.activeModal.close(resultado);
          } else {
            alert(response.error || response.message || 'Erro ao criar anotação.');
          }
        },
        error: (error) => {
          this.salvando = false;
          alert(`Erro ao criar anotação: ${error}`);
        },
      });
  }

  fechar(): void {
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
