import { Component, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { EstacaoSearchService, EstacaoSearchResult } from '../servico/estacao-search.service';
import { CompartilhamentoService, EstacaoData } from '../servico/compartilhamento.service';

@Component({
  selector: 'app-estacao-search-modal',
  standalone: true,
  imports: [
    CommonModule,
    NgbModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './estacao-search-modal.component.html',
  styleUrls: ['./estacao-search-modal.component.css']
})
export class EstacaoSearchModalComponent {
  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef;

  siglaFilter: string = '';
  enderecoFilter: string = '';

  filteredData: EstacaoSearchResult[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedEstacao: EstacaoSearchResult | null = null;

  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;

  constructor(
    public activeModal: NgbActiveModal,
    private estacaoSearchService: EstacaoSearchService,
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

  isSelected(estacao: EstacaoSearchResult): boolean {
    return this.selectedEstacao === estacao;
  }

  onBuscaCompleta(): void {
    if (!this.siglaFilter.trim() && !this.enderecoFilter.trim()) {
      this.errorMessage = 'Informe pelo menos um filtro para realizar a busca.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.filteredData = [];
    this.selectedEstacao = null;

    const filtros = {
      sigla: this.siglaFilter.trim() || undefined,
      endereco: this.enderecoFilter.trim() || undefined
    };

    console.log('Iniciando busca de estações com filtros:', filtros);

    this.estacaoSearchService.buscarEstacoes(filtros).subscribe({
      next: (resultado) => {
        console.log('Resultado da busca:', resultado);
        this.filteredData = resultado;
        this.isLoading = false;

        if (resultado.length === 0) {
          this.errorMessage = 'Nenhuma estação encontrada com os critérios informados.';
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

  onSelectEstacao(estacao: EstacaoSearchResult): void {
    console.log('Estação selecionada:', estacao);
    this.selectedEstacao = estacao;

    const estacaoData: EstacaoData = {
      LAT: estacao.LAT,
      LNG: estacao.LNG,
      SIGLA: estacao.SIGLA,
      ENDERECO: estacao.ENDERECO
    };

    this.compartilhamentoService.compartilharEstacao(estacaoData);
    console.log('Dados da estação compartilhados via service:', estacaoData);
  }

  onCancel(): void {
    this.activeModal.close();
  }
}
