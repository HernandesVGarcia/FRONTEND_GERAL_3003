import { Component, Input, OnInit, OnChanges, SimpleChanges, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { InsertEstacaoService, InsertEstacaoRequest } from '../servico/insert-estacao.service';
import { AuthService } from '../servico/auth.service';

export interface PlotaEstacaoData {
  lat?: number;
  lng?: number;
  nome?: string;
  logradouro?: string;
  complemento?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  idCidade?: number;
  telefone?: string;
  observacoes?: string;
  id_meta?: number;
}

@Component({
  selector: 'app-plota-estacao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    MatIconModule
  ],
  templateUrl: './plota-estacao.component.html',
  styleUrls: ['./plota-estacao.component.css']
})
export class PlotaEstacaoComponent implements OnInit, OnChanges {
  salvando = false;

  form = {
    nome: '',
    logradouro: '',
    complemento: '',
    numero: '',
    bairro: '',
    cidade: '',
    telefone: '',
    observacoes: ''
  };

  @Input() data: PlotaEstacaoData = {};

  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;

  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef;

  constructor(
    public activeModal: NgbActiveModal,
    private insertEstacaoService: InsertEstacaoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.atualizarFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.atualizarFormulario();
    }
  }

  private atualizarFormulario(): void {
    if (this.data) {
      this.form.nome = this.data.nome || '';
      this.form.logradouro = this.data.logradouro || '';
      this.form.complemento = this.data.complemento || '';
      this.form.numero = this.data.numero || '';
      this.form.bairro = this.data.bairro || '';
      this.form.cidade = this.data.cidade || '';
      this.form.telefone = this.data.telefone || '';
      this.form.observacoes = this.data.observacoes || '';
    }
  }

  plotar(): void {
    if (!this.form.nome?.trim()) {
      alert('Por favor, preencha o campo Nome.');
      return;
    }
    if (this.data.lat == null || this.data.lng == null) {
      alert('Coordenadas não encontradas. Feche e tente novamente clicando no mapa.');
      return;
    }

    const idCity = this.authService.getIdCity();
    if (!idCity) {
      alert('Cidade não encontrada. Selecione uma cidade no workspace.');
      return;
    }

    const idUser = this.authService.getIdUser();
    if (!idUser) {
      alert('Usuário não identificado. Faça login novamente.');
      return;
    }

    const dados: InsertEstacaoRequest = {
      CONTRATO_GPON: '0',
      CNPJ: '',
      SIGLA: this.form.nome.trim(),
      ENDEREÇO: this.form.logradouro?.trim() || '',
      NUMERO: this.form.numero?.trim() || '',
      COMPLEMENTO: this.form.complemento?.trim() || '',
      BAIRRO: this.form.bairro?.trim() || '',
      CEP: '',
      TELEFONE: this.form.telefone?.trim() || '',
      id_city: idCity,
      id_condominio: 0,
      ID_PROJETISTA: idUser,
      OBS: this.form.observacoes?.trim() || '',
      LAT: String(this.data.lat),
      LNG: String(this.data.lng),
      TAMANHO: '2',
      STATUS: '1',
      POP_ESTACAO: 1
    };

    this.salvando = true;
    this.insertEstacaoService.criarEstacao(dados).subscribe({
      next: (response) => {
        this.salvando = false;
        if (response.success && response.id_meta) {
          const resultado: PlotaEstacaoData = {
            id_meta: response.id_meta,
            lat: this.data.lat,
            lng: this.data.lng,
            nome: this.form.nome.trim(),
            logradouro: this.form.logradouro?.trim() || undefined,
            complemento: this.form.complemento?.trim() || undefined,
            numero: this.form.numero?.trim() || undefined,
            bairro: this.form.bairro?.trim() || undefined,
            cidade: this.form.cidade?.trim() || undefined,
            telefone: this.form.telefone?.trim() || undefined,
            observacoes: this.form.observacoes?.trim() || undefined
          };
          this.activeModal.close(resultado);
        } else {
          alert(response.error || response.message || 'Erro ao criar estação.');
        }
      },
      error: (err) => {
        this.salvando = false;
        alert(typeof err === 'string' ? err : 'Erro ao criar estação. Tente novamente.');
      }
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
