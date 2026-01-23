import { Component, OnInit, Inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TiposService } from '../servico/tipos.service';

export interface TipoSplitter {
  id: number;
  acoplamento: string;
  perda_P1: number;
  perda_P2: number;
}

export interface PlotaSplitterData {
  x: number;
  y: number;
  tipo?: 'balanceado' | 'desbalanceado';
}

export interface PlotaSplitterResult {
  tipoSplitter: TipoSplitter | null;
  label: string | null;
}

@Component({
  selector: 'app-plota-splitter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './plota-splitter.component.html',
  styleUrls: ['./plota-splitter.component.css']
})
export class PlotaSplitterComponent implements OnInit, AfterViewInit, OnDestroy {
  splittersBalanceados: TipoSplitter[] = [];
  selectedSplitter: TipoSplitter | null = null;
  splitterLabel: string = '';
  loading = true;
  error: string | null = null;
  tipoSplitter: 'balanceado' | 'desbalanceado' = 'balanceado';

  // Propriedades para arrastar o modal
  private modalElement: HTMLElement | null = null;
  private modalHeaderElement: HTMLElement | null = null;
  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;

  constructor(
    public dialogRef: MatDialogRef<PlotaSplitterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlotaSplitterData,
    private tiposService: TiposService
  ) {}

  ngOnInit(): void {
    // Determinar o tipo baseado nos dados recebidos (padrão: balanceado)
    this.tipoSplitter = this.data.tipo || 'balanceado';
    this.carregarSplitters(this.tipoSplitter);
  }

  ngAfterViewInit(): void {
    this.setupDragFunctionality();
  }

  ngOnDestroy(): void {
    // Remover listeners ao destruir o componente
    document.removeEventListener('mousemove', this.dragMoveHandler);
    document.removeEventListener('mouseup', this.dragEndHandler);
  }

  carregarSplitters(tipo: 'balanceado' | 'desbalanceado'): void {
    this.loading = true;
    this.error = null;

    this.tiposService.buscarTiposSplitter().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Filtrar splitters baseado no tipo
          // Balanceado: contém "BALANCEADO" no acoplamento
          // Desbalanceado: NÃO contém "BALANCEADO" E NÃO contém "DESBALANCEADO"
          this.splittersBalanceados = response.data
            .filter((splitter: any) => {
              if (!splitter.acoplamento) return false;
              const acoplamentoUpper = splitter.acoplamento.toUpperCase();
              
              if (tipo === 'balanceado') {
                // Balanceado: deve conter "BALANCEADO"
                return acoplamentoUpper.includes('BALANCEADO');
              } else {
                // Desbalanceado: NÃO contém "BALANCEADO" E NÃO contém "DESBALANCEADO"
                return !acoplamentoUpper.includes('BALANCEADO') && 
                       !acoplamentoUpper.includes('DESBALANCEADO');
              }
            })
            .map((splitter: any) => ({
              id: splitter.id,
              acoplamento: splitter.acoplamento,
              perda_P1: splitter.perda_P1 || 0,
              perda_P2: splitter.perda_P2 || 0
            }))
            .sort((a, b) => a.id - b.id); // Ordenar por ID

          const tipoTexto = tipo === 'balanceado' ? 'balanceados' : 'desbalanceados';
          console.log(`🔗 [PLOTA-SPLITTER] Splitters ${tipoTexto} carregados:`, this.splittersBalanceados);
        } else {
          const tipoTexto = tipo === 'balanceado' ? 'balanceado' : 'desbalanceado';
          this.error = `Nenhum splitter ${tipoTexto} encontrado`;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('🔗 [PLOTA-SPLITTER] Erro ao carregar splitters:', err);
        this.error = 'Erro ao carregar tipos de splitter. Tente novamente.';
        this.loading = false;
      }
    });
  }


  onCancelar(): void {
    this.dialogRef.close({ tipoSplitter: null });
  }

  onPlotar(): void {
    if (this.selectedSplitter) {
      console.log('🔗 [PLOTA-SPLITTER] Splitter selecionado para plotar:', this.selectedSplitter);
      console.log('🔗 [PLOTA-SPLITTER] Label:', this.splitterLabel);
      console.log('🔗 [PLOTA-SPLITTER] Coordenadas:', this.data.x, this.data.y);
      this.dialogRef.close({ 
        tipoSplitter: this.selectedSplitter,
        label: this.splitterLabel.trim() || null
      });
    }
  }

  // ================================ Funcionalidade de Arrastar Modal ================================
  
  private setupDragFunctionality(): void {
    setTimeout(() => {
      console.log('🔗 [PLOTA-SPLITTER] Configurando arrastar modal');
      
      // Procurar pelo container do MatDialog - pegar o último (mais recente)
      const allDialogs = document.querySelectorAll('.mat-mdc-dialog-container');
      this.modalElement = allDialogs[allDialogs.length - 1] as HTMLElement;
      
      // Procurar o header dentro do modal encontrado
      if (this.modalElement) {
        this.modalHeaderElement = this.modalElement.querySelector('.modal-header') as HTMLElement;
      }

      console.log('🔗 [PLOTA-SPLITTER] Modal elements encontrados:', {
        modalElement: !!this.modalElement,
        modalHeaderElement: !!this.modalHeaderElement
      });

      if (this.modalHeaderElement && this.modalElement) {
        console.log('🔗 [PLOTA-SPLITTER] Modal header encontrado para arrastar');
        // Adicionar listener apenas no cabeçalho
        this.modalHeaderElement.addEventListener('mousedown', (e: MouseEvent) => this.dragStart(e));
        document.addEventListener('mousemove', this.dragMoveHandler);
        document.addEventListener('mouseup', this.dragEndHandler);
      } else {
        console.warn('🔗 [PLOTA-SPLITTER] Modal header não encontrado para configurar o arrastar');
      }
    }, 500);
  }

  private dragStart(event: MouseEvent): void {
    // Prevenir arrastar se clicou em um botão
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    if (this.modalHeaderElement && 
        (event.target === this.modalHeaderElement || 
         this.modalHeaderElement.contains(event.target as Node))) {
      
      this.initialX = event.clientX - this.currentX;
      this.initialY = event.clientY - this.currentY;
      this.isDragging = true;
      
      if (this.modalElement) {
        this.modalElement.classList.add('dragging');
      }
    }
  }

  private dragMoveHandler = (event: MouseEvent) => {
    this.dragMove(event);
  };

  private dragMove(event: MouseEvent): void {
    if (this.isDragging && this.modalElement) {
      event.preventDefault();
      
      this.currentX = event.clientX - this.initialX;
      this.currentY = event.clientY - this.initialY;
      
      this.setTranslate(this.currentX, this.currentY, this.modalElement);
    }
  }

  private dragEndHandler = (event: MouseEvent) => {
    this.dragEnd(event);
  };

  private dragEnd(event: MouseEvent): void {
    if (this.isDragging) {
      this.initialX = this.currentX;
      this.initialY = this.currentY;
      
      this.isDragging = false;
      if (this.modalElement) {
        this.modalElement.classList.remove('dragging');
      }
    }
  }

  private setTranslate(xPos: number, yPos: number, el: HTMLElement): void {
    if (el) {
      el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
  }
}
