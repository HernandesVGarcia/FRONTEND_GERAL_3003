import { Component, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CaixaSearchService, CaixaSearchResult } from '../servico/caixa-search.service';
import { CompartilhamentoService, CaixaData } from '../servico/compartilhamento.service';

@Component({
  selector: 'app-caixa-search-modal',
  standalone: true,
  imports: [
    CommonModule,
    NgbModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './caixa-search-modal.component.html',
  styleUrls: ['./caixa-search-modal.component.css']
})
export class CaixaSearchModalComponent {
  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef;

  numeroFilter: string = '';
  localizacaoFilter: string = '';

  filteredData: CaixaSearchResult[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedCaixa: CaixaSearchResult | null = null;

  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;

  constructor(
    public activeModal: NgbActiveModal,
    private caixaSearchService: CaixaSearchService,
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

  isSelected(caixa: CaixaSearchResult): boolean {
    return this.selectedCaixa === caixa;
  }

  onBuscaCompleta(): void {
    if (!this.numeroFilter.trim() && !this.localizacaoFilter.trim()) {
      this.errorMessage = 'Informe pelo menos um filtro para realizar a busca.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.filteredData = [];
    this.selectedCaixa = null;

    const filtros = {
      numero: this.numeroFilter.trim() || undefined,
      localizacao: this.localizacaoFilter.trim() || undefined
    };

    console.log('Iniciando busca com filtros:', filtros);

    this.caixaSearchService.buscarCaixas(filtros).subscribe({
      next: (resultado) => {
        console.log('Resultado da busca:', resultado);
        this.filteredData = resultado;
        this.isLoading = false;

        if (resultado.length === 0) {
          this.errorMessage = 'Nenhuma caixa encontrada com os critérios informados.';
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

  onSelectCaixa(caixa: CaixaSearchResult): void {
    console.log('Caixa selecionada:', caixa);
    this.selectedCaixa = caixa;

    const caixaData: CaixaData = {
      LAT: caixa.LAT,
      LONGI: caixa.LONGI,
      NUMERO: caixa.NUMERO,
      LOCALIZACAO: caixa.LOCALIZACAO
    };

    this.compartilhamentoService.compartilharCaixa(caixaData);
    console.log('Dados da caixa compartilhados via service:', caixaData);
  }

  onCancel(): void {
    this.activeModal.close();
  }
}
