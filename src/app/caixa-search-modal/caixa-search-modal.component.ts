

import { Component, Inject,Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CaixaSearchService, CaixaSearchResult } from '../servico/caixa-search.service';
import { CompartilhamentoService, CaixaData } from '../servico/compartilhamento.service';

@Component({
  selector: 'app-caixa-search-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './caixa-search-modal.component.html',
  styleUrls: ['./caixa-search-modal.component.css']
})
export class CaixaSearchModalComponent implements AfterViewInit {
  @ViewChild('draggableContainer') draggableContainer!: ElementRef;
  @ViewChild('draggableHeader') draggableHeader!: ElementRef;

  @Output() caixaSelecionada= new EventEmitter<CaixaSearchResult>()
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
    public dialogRef: MatDialogRef<CaixaSearchModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private caixaSearchService: CaixaSearchService,
    private compartilhamentoService: CompartilhamentoService
  ) {}

  ngAfterViewInit(): void {
    this.setupDragListeners();
  }

  private setupDragListeners(): void {
    const header = this.draggableHeader.nativeElement;
    const container = this.draggableContainer.nativeElement;

    header.addEventListener('mousedown', this.dragStart.bind(this));
    document.addEventListener('mousemove', this.dragMove.bind(this));
    document.addEventListener('mouseup', this.dragEnd.bind(this));

    // Touch events for mobile
    header.addEventListener('touchstart', this.dragStart.bind(this));
    document.addEventListener('touchmove', this.dragMove.bind(this));
    document.addEventListener('touchend', this.dragEnd.bind(this));
  }

  private dragStart(e: MouseEvent | TouchEvent): void {
    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

    this.initialX = clientX - this.xOffset;
    this.initialY = clientY - this.yOffset;

    if ((e.target as HTMLElement).closest('.draggable-header')) {
      this.isDragging = true;
    }
  }

  private dragMove(e: MouseEvent | TouchEvent): void {
    if (this.isDragging) {
      e.preventDefault();
      
      const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
      const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

      this.currentX = clientX - this.initialX;
      this.currentY = clientY - this.initialY;

      this.xOffset = this.currentX;
      this.yOffset = this.currentY;

      this.setTranslate(this.currentX, this.currentY);
    }
  }

  private dragEnd(): void {
    this.initialX = this.currentX;
    this.initialY = this.currentY;
    this.isDragging = false;
  }

  private setTranslate(xPos: number, yPos: number): void {
    const container = this.draggableContainer.nativeElement;
    // Combinar a posição central inicial com o offset do drag
    container.style.transform = `translate(calc(-50% + ${xPos}px), calc(-50% + ${yPos}px))`;
  }
  

  onBuscaCompleta(): void {
    if (!this.numeroFilter.trim() && !this.localizacaoFilter.trim()) {
      this.errorMessage = 'Informe pelo menos um filtro para realizar a busca.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.filteredData = [];

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
    
    // Converter CaixaSearchResult para CaixaData
    const caixaData: CaixaData = {
      LAT: caixa.LAT,
      LONGI: caixa.LONGI,
      NUMERO: caixa.NUMERO,
      LOCALIZACAO: caixa.LOCALIZACAO
    };

    // Compartilhar dados da caixa via service
    this.compartilhamentoService.compartilharCaixa(caixaData);
    
    // Emitir evento para compatibilidade (opcional)
    this.caixaSelecionada.emit(caixa);
    
    console.log('Dados da caixa compartilhados via service:', caixaData);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
