import { Component, Input, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { ClientesCadastradosService, ClienteCadastrado } from '../servico/clientes-cadastrados.service';

export interface PlotaClienteData {
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-plota-cliente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    MatIconModule
  ],
  templateUrl: './plota-cliente.component.html',
  styleUrls: ['./plota-cliente.component.css']
})
export class PlotaClienteComponent implements OnInit {
  @Input() data: PlotaClienteData = { lat: 0, lng: 0 };

  clientes: ClienteCadastrado[] = [];
  clientesFiltrados: ClienteCadastrado[] = [];
  selectedCliente: ClienteCadastrado | null = null;
  isLoading = false;
  errorMessage = '';
  salvando = false;

  filtroSigla = '';
  filtroEndereco = '';

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
    private clientesCadastradosService: ClientesCadastradosService
  ) {}

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.selectedCliente = null;

    const filtros: { sigla?: string; endereco?: string } = {};
    if (this.filtroSigla?.trim()) filtros.sigla = this.filtroSigla.trim();
    if (this.filtroEndereco?.trim()) filtros.endereco = this.filtroEndereco.trim();

    this.clientesCadastradosService.buscarClientesCadastrados(filtros).subscribe({
      next: (resultado) => {
        this.clientes = resultado;
        this.clientesFiltrados = resultado;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = typeof err === 'string' ? err : 'Erro ao carregar clientes. Tente novamente.';
        this.clientes = [];
        this.clientesFiltrados = [];
        this.isLoading = false;
      }
    });
  }

  onFiltrar(): void {
    this.carregarClientes();
  }

  onSelectCliente(cliente: ClienteCadastrado): void {
    this.selectedCliente = this.selectedCliente === cliente ? null : cliente;
  }

  isSelected(cliente: ClienteCadastrado): boolean {
    return this.selectedCliente === cliente;
  }

  plotar(): void {
    if (!this.selectedCliente) {
      alert('Selecione um cliente da lista.');
      return;
    }

    if (this.data.lat == null || this.data.lng == null) {
      alert('Coordenadas não encontradas. Feche e tente novamente clicando no mapa.');
      return;
    }

    this.salvando = true;
    this.clientesCadastradosService.plotarCliente(this.selectedCliente, this.data.lat, this.data.lng).subscribe({
      next: (response) => {
        this.salvando = false;
        if (response.success) {
          this.activeModal.close({
            id_meta: response.id_meta,
            id_estacao: response.id_estacao ?? this.selectedCliente!.ID,
            sigla: this.selectedCliente!.SIGLA,
            lat: this.data.lat,
            lng: this.data.lng
          });
        } else {
          alert(response.error || response.message || 'Erro ao plotar cliente.');
        }
      },
      error: (err) => {
        this.salvando = false;
        alert(typeof err === 'string' ? err : 'Erro ao plotar cliente. Tente novamente.');
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
