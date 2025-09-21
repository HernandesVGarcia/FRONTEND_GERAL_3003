import { Component, OnInit, OnDestroy, Inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSpinner } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface VisualizaCaboData {
  id_meta: number;
  nome_cabo: string;
  tipo_cabo: string;
  fibras: CaboFiberData[];
}

export interface CaboFiberData {
  fibra_numero: number;
  cor: string;
  status: string;
  destino: string;
  observacoes: string;
}

export interface VisualizaCaboConfig {
  title: string;
  isEditable: boolean;
  showAllFields: boolean;
}

export interface VisualizaCaboDialogData {
  id_meta: number;
  config?: VisualizaCaboConfig;
}

export interface FlexGridCell {
  value: string;
  editable: boolean;
}

@Component({
  selector: 'app-visualiza-cabo',
  templateUrl: './visualiza-cabo.component.html',
  styleUrls: ['./visualiza-cabo.component.css'],
  standalone: true,
  imports: [CommonModule, MatIcon, MatSpinner]
})
export class VisualizaCaboComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  
  visualizaCaboData: VisualizaCaboData | null = null;
  flexGridData: FlexGridCell[][] = [];
  isLoading = false;
  errorMessage: string | null = null;
  config: VisualizaCaboConfig;

  // Arrays para os botões das fibras
  fibraEsmButtons: any[] = [];
  fibraEsButtons: any[] = [];
  fibraDsButtons: any[] = [];
  fibraDsmButtons: any[] = [];

  // Opções de grupos de fibras
  fiberOptions: { value: number; label: string; startFiber: number; endFiber: number }[] = [];
  selectedFiberGroup = 12;

  // Propriedades para arrastar o modal (mesmo padrão do visualiza-dio)
  isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private modalElement: HTMLElement | null = null;
  private modalContentElement: HTMLElement | null = null;
  private modalHeaderElement: HTMLElement | null = null;

  // Cores das fibras (baseadas no VB6)
  private coresFibras = [
    '#00FF00', // Verde
    '#FFFF00', // Amarelo
    '#FFFFFF', // Branco
    '#0000FF', // Azul
    '#FF0000', // Vermelho
    '#C0C0FF'  // Lilás
  ];

  constructor(
    public dialogRef: MatDialogRef<VisualizaCaboComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VisualizaCaboDialogData
  ) {
    this.config = data.config || {
      title: 'Visualiza Cabo',
      isEditable: false,
      showAllFields: true
    };
  }

  ngOnInit(): void {
    this.initializeButtons();
    this.initializeFiberOptions();
    this.loadVisualizaCaboData();
  }

  ngAfterViewInit(): void {
    this.setupDragFunctionality();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadVisualizaCaboData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Simular carregamento de dados
    setTimeout(() => {
      this.visualizaCaboData = {
        id_meta: this.data.id_meta,
        nome_cabo: `Cabo ${this.data.id_meta}`,
        tipo_cabo: 'Cabo Óptico 144F',
        fibras: this.generateFiberData()
      };

      this.populateFlexGrid();
      this.isLoading = false;
    }, 1000);
  }

  private generateFiberData(): CaboFiberData[] {
    const fibras: CaboFiberData[] = [];
    
    // Gerar 12 fibras (2 grupos de 6 cores)
    for (let i = 0; i < 12; i++) {
      const corIndex = i % 6;
      fibras.push({
        fibra_numero: i + 1,
        cor: this.coresFibras[corIndex],
        status: 'Livre',
        destino: '',
        observacoes: ''
      });
    }
    
    return fibras;
  }

  private populateFlexGrid(): void {
    if (!this.visualizaCaboData) return;

    // Inicializar grid 12x10 (12 linhas, 10 colunas)
    this.flexGridData = [];
    
    for (let row = 0; row < 12; row++) {
      const rowData: FlexGridCell[] = [];
      
      for (let col = 0; col < 7; col++) { // 7 colunas (0-6)
        let value = '';
        let editable = false;
        
             // Definir conteúdo das células baseado na posição
             if (col === 0) {
               value = ''; // Vazio
             } else if (col === 1) {
               value = ''; // Vazio - Coluna reduzida
             } else if (col === 2) {
               value = ''; // Vazio - Coluna expandida
             } else if (col === 3) {
               value = `F${row + 1}`; // F1, F2, F3... - Coluna central colorida
             } else if (col === 4) {
               value = ''; // Vazio - Coluna expandida
             } else if (col === 5) {
               value = ''; // Vazio - Coluna reduzida
             } else if (col === 6) {
               value = ''; // Vazio
             }
        
        rowData.push({
          value,
          editable
        });
      }
      
      this.flexGridData.push(rowData);
    }
  }

  onFlexGridCellChange(rowIndex: number, colIndex: number, newValue: string): void {
    if (this.flexGridData[rowIndex] && this.flexGridData[rowIndex][colIndex]) {
      this.flexGridData[rowIndex][colIndex].value = newValue;
    }
  }

  // ================================ Botões das Fibras ================================
  
  private initializeButtons(): void {
    // Inicializar arrays com 12 botões cada
    this.fibraEsmButtons = Array(12).fill(null).map((_, index) => ({ index: index + 1 }));
    this.fibraEsButtons = Array(12).fill(null).map((_, index) => ({ index: index + 1 }));
    this.fibraDsButtons = Array(12).fill(null).map((_, index) => ({ index: index + 1 }));
    this.fibraDsmButtons = Array(12).fill(null).map((_, index) => ({ index: index + 1 }));
  }

  private initializeFiberOptions(): void {
    // Criar opções de 12F até 144F (12 em 12)
    this.fiberOptions = [];
    for (let i = 12; i <= 144; i += 12) {
      const startFiber = i - 11; // 1, 13, 25, 37, etc.
      const endFiber = i; // 12, 24, 36, 48, etc.
      
      this.fiberOptions.push({
        value: i,
        label: `...${i}F`,
        startFiber: startFiber,
        endFiber: endFiber
      });
    }
  }

  onFibraEsmClick(fibraNumber: number): void {
    console.log(`FIBRA_ESM${fibraNumber} clicada`);
    // Aqui você pode adicionar a lógica específica para FIBRA_ESM
    // Por exemplo, destacar a linha correspondente no grid
    this.highlightFiberRow(fibraNumber - 1);
  }

  onFibraEsClick(fibraNumber: number): void {
    console.log(`FIBRA_ES${fibraNumber} clicada`);
    // Aqui você pode adicionar a lógica específica para FIBRA_ES
    // Por exemplo, destacar a linha correspondente no grid
    this.highlightFiberRow(fibraNumber - 1);
  }

  onFibraDsClick(fibraNumber: number): void {
    console.log(`FIBRA_DS${fibraNumber} clicada`);
    // Aqui você pode adicionar a lógica específica para FIBRA_DS
    // Por exemplo, destacar a linha correspondente no grid
    this.highlightFiberRow(fibraNumber - 1);
  }

  onFibraDsmClick(fibraNumber: number): void {
    console.log(`FIBRA_DSM${fibraNumber} clicada`);
    // Aqui você pode adicionar a lógica específica para FIBRA_DSM
    // Por exemplo, destacar a linha correspondente no grid
    this.highlightFiberRow(fibraNumber - 1);
  }

  private highlightFiberRow(rowIndex: number): void {
    // Lógica para destacar a linha correspondente no grid
    // Por exemplo, adicionar uma classe CSS ou mudar a cor
    console.log(`Destacando linha ${rowIndex + 1} do grid`);
  }

  // ================================ Opções de Grupos de Fibras ================================
  
  onFiberGroupChange(selectedValue: number): void {
    this.selectedFiberGroup = selectedValue;
    const selectedOption = this.fiberOptions.find(opt => opt.value === selectedValue);
    
    if (selectedOption) {
      console.log(`Grupo selecionado: ${selectedOption.label} (Fibras ${selectedOption.startFiber} a ${selectedOption.endFiber})`);
      // Aqui você pode adicionar lógica para filtrar/atualizar o grid baseado no grupo selecionado
      this.updateGridForFiberGroup(selectedOption.startFiber, selectedOption.endFiber);
    }
  }

  private updateGridForFiberGroup(startFiber: number, endFiber: number): void {
    // Lógica para atualizar o grid baseado no grupo de fibras selecionado
    console.log(`Atualizando grid para fibras ${startFiber} a ${endFiber}`);
    // Por exemplo, mostrar apenas as fibras do grupo selecionado
    // ou destacar as fibras relevantes no grid
  }

  // ================================ Arrastar Modal Drag Methods (mesmo padrão do visualiza-dio) ================================
  
  private setupDragFunctionality(): void {
    setTimeout(() => {
      console.log('Configurando funcionalidade de arrastar modal visualiza-cabo');
      this.modalElement = document.querySelector('.cdk-dialog-container') as HTMLElement;
      this.modalContentElement = this.modalElement; // Mover o modal completo, não o conteúdo interno
      this.modalHeaderElement = document.querySelector('.modal-header') as HTMLElement;
      
      if (this.modalHeaderElement && this.modalContentElement) {
        console.log('Modal header encontrado para arrastar visualiza-cabo');
        // Adicionar listener apenas no cabeçalho, não no modal inteiro
        this.modalHeaderElement.addEventListener('mousedown', (e: MouseEvent) => this.dragStart(e));
        document.addEventListener('mousemove', (e: MouseEvent) => this.dragMove(e));
        document.addEventListener('mouseup', (e: MouseEvent) => this.dragEnd(e));
      } else {
        console.warn('Modal header não encontrado para configurar o arrastar visualiza-cabo');
      }
    }, 500);
  }

  private dragStart(event: MouseEvent): void {
    // Prevenir arrastar se clicou em um botão
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    this.isDragging = true;
    this.initialX = event.clientX - this.currentX;
    this.initialY = event.clientY - this.currentY;
    
    if (this.modalHeaderElement) {
      this.modalHeaderElement.classList.add('dragging');
    }
    
    event.preventDefault();
  }

  private dragMove(event: MouseEvent): void {
    if (!this.isDragging || !this.modalContentElement) return;

    this.currentX = event.clientX - this.initialX;
    this.currentY = event.clientY - this.initialY;

    // Aplicar transformação ao modal
    this.modalContentElement.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
  }

  private dragEnd(event: MouseEvent): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    
    if (this.modalHeaderElement) {
      this.modalHeaderElement.classList.remove('dragging');
    }
  }
}