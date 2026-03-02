import { Component, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ClienteSearchService, ClienteSearchResult } from '../servico/cliente-search.service';
import { CompartilhamentoService, ClienteData } from '../servico/compartilhamento.service';

@Component({
  selector: 'app-cliente-search-modal',
  standalone: true,
  imports: [
    CommonModule,
    NgbModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './cliente-search-modal.component.html',
  styleUrls: ['./cliente-search-modal.component.css']
})
export class ClienteSearchModalComponent {
  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef;

  siglaFilter: string = '';
  enderecoFilter: string = '';

  filteredData: ClienteSearchResult[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedCliente: ClienteSearchResult | null = null;

  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;

  constructor(
    public activeModal: NgbActiveModal,
    private clienteSearchService: ClienteSearchService,
    private compartilhamentoService: CompartilhamentoService
  ) {}

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

  isSelected(cliente: ClienteSearchResult): boolean {
    return this.selectedCliente === cliente;
  }

  onBuscaCompleta(): void {
    if (!this.siglaFilter.trim() && !this.enderecoFilter.trim()) {
      this.errorMessage = 'Informe pelo menos um filtro para realizar a busca.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.filteredData = [];
    this.selectedCliente = null;

    const filtros = {
      sigla: this.siglaFilter.trim() || undefined,
      endereco: this.enderecoFilter.trim() || undefined
    };

    console.log('Iniciando busca com filtros:', filtros);

    this.clienteSearchService.buscarClientes(filtros).subscribe({
      next: (resultado) => {
        console.log('Resultado da busca:', resultado);
        this.filteredData = resultado;
        this.isLoading = false;

        if (resultado.length === 0) {
          this.errorMessage = 'Nenhum cliente encontrado com os critérios informados.';
        }
      },
      error: (error) => {
        console.error('Erro na busca:', error);
        this.errorMessage = typeof error === 'string' ? error : 'Erro ao realizar a busca. Tente novamente.';
        this.filteredData = [];
        this.isLoading = false;
      }
    });
  }

  onSelectCliente(cliente: ClienteSearchResult): void {
    console.log('Cliente selecionado:', cliente);
    this.selectedCliente = cliente;

    const clienteData: ClienteData = {
      LAT: cliente.LAT,
      LNG: cliente.LNG,
      SIGLA: cliente.SIGLA,
      ENDERECO: cliente.ENDERECO
    };

    this.compartilhamentoService.compartilharCliente(clienteData);
    console.log('Dados do cliente compartilhados via service:', clienteData);
  }

  onCancel(): void {
    this.activeModal.close();
  }
}
