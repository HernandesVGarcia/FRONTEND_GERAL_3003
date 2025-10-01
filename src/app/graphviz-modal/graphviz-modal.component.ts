import { Component, OnInit, AfterViewInit, Inject, ViewChild, ElementRef, } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Graphviz } from "@hpcc-js/wasm-graphviz";

@Component({
  selector: 'app-graphviz-modal',
  templateUrl: './graphviz-modal.component.html',
  styleUrls: ['./graphviz-modal.component.css'],
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule]
})
export class GraphvizModalComponent implements OnInit, AfterViewInit {
  dotContent: string = '';
  isLoading: boolean = true;
  error: string = '';
  
  // Variáveis para zoom e pan
  private currentZoom: number = 1;
  private isPanning: boolean = false;
  private startX: number = 0;
  private startY: number = 0;
  private translateX: number = 0;
  private translateY: number = 0;

  // Propriedades para arrastar o modal (mesmo padrão do visualiza-dio)
  isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private modalElement: HTMLElement | null = null;
  private modalContentElement: HTMLElement | null = null;
  private modalHeaderElement: HTMLElement | null = null;



  constructor(
    public dialogRef: MatDialogRef<GraphvizModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Verificar se recebeu dados do modal
    if (this.data && this.data.dotString) {
      this.dotContent = this.data.dotString;
      console.log('📊 [GRAPHVIZ] Usando DOT string do modal:', this.dotContent.substring(0, 100) + '...');
    } else {
      // Fallback: carregar do arquivo (comportamento original)
      this.loadGraphvizFile();
    }
  }

  async ngAfterViewInit() {
    // Configurar funcionalidade de drag (padrão visualiza-dio)
    this.setupDragFunctionality();

    // Aguardar um pouco para garantir que o DOM esteja pronto
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('🔍 [GRAPHVIZ] ngAfterViewInit - Verificando container...');
    const container = document.getElementById('graphviz-container');
    console.log('🔍 [GRAPHVIZ] Container encontrado:', !!container);
    
    // 🆕 NOVO: Adicionar função global para interatividade
    this.setupInteractivity();
    
    if (this.data && this.data.dotString) {
      // 🆕 CORREÇÃO: Verificar se o DOT string está completo
      if (this.isDotStringComplete(this.dotContent)) {
        console.log('✅ [GRAPHVIZ] DOT string completo - Renderizando');
        await this.renderGraphviz();
      } else {
        console.log('❌ [GRAPHVIZ] DOT string incompleto - Aguardando');
        this.error = 'DOT string incompleto. Aguarde o rastreamento terminar.';
        this.isLoading = false;
      }
    } else if (this.dotContent) {
      await this.renderGraphviz();
    }
  }
  // ================================ Arrastar Modal Drag Methods (padrão visualiza-dio) ================================
  
  private setupDragFunctionality(): void {
    setTimeout(() => {
      console.log('Configurando funcionalidade de arrastar modal');
      
      // Encontrar especificamente o modal do graphviz (o mais recente/último)
      const allDialogs = document.querySelectorAll('.cdk-dialog-container');
      this.modalElement = allDialogs[allDialogs.length - 1] as HTMLElement; // Pegar o último (mais recente)
      this.modalContentElement = this.modalElement; // Mover o modal completo, não o conteúdo interno
      
      // Tentar múltiplos seletores para encontrar o header do graphviz especificamente
      this.modalHeaderElement = this.modalElement?.querySelector('.modal-header') as HTMLElement ||
                               document.querySelector('.graphviz-modal-container .modal-header') as HTMLElement ||
                               document.querySelector('[mat-dialog-title]')?.closest('.modal-header') as HTMLElement;
      
      console.log('Total de modais encontrados:', allDialogs.length);
      console.log('Modal element encontrado (último):', !!this.modalElement);
      console.log('Modal content element encontrado:', !!this.modalContentElement);
      console.log('Modal header element encontrado:', !!this.modalHeaderElement);
      
      if (this.modalHeaderElement && this.modalContentElement) {
        console.log('Modal header encontrado para arrastar');
        
        // Adicionar listener global no documento para capturar todos os mousedown
        document.addEventListener('mousedown', (e: MouseEvent) => {
          console.log('🔧 [DRAG] Evento mousedown global capturado');
          console.log('🔧 [DRAG] Target:', e.target);
          console.log('🔧 [DRAG] Modal header element:', !!this.modalHeaderElement);
          
          // Verificar se clicou no header ou em qualquer elemento dentro dele
          const target = e.target as HTMLElement;
          const isInHeader = this.modalHeaderElement && (
            target === this.modalHeaderElement ||
            this.modalHeaderElement.contains(target) ||
            target.closest('.modal-header') === this.modalHeaderElement ||
            target.classList.contains('modal-header') ||
            target.closest('.modal-header') !== null
          );
          
          console.log('🔧 [DRAG] Target === ModalHeader:', target === this.modalHeaderElement);
          console.log('🔧 [DRAG] ModalHeader.contains(Target):', this.modalHeaderElement?.contains(target));
          console.log('🔧 [DRAG] Target.closest(.modal-header):', target.closest('.modal-header'));
          console.log('🔧 [DRAG] Target.classList.contains(modal-header):', target.classList.contains('modal-header'));
          console.log('🔧 [DRAG] isInHeader:', isInHeader);
          
          if (isInHeader) {
            console.log('🔧 [DRAG] Clicou no header - iniciando drag');
            this.dragStart(e);
          } else {
            console.log('🔧 [DRAG] Não clicou no header');
          }
        }, true);
        
        // Adicionar listeners para mousemove e mouseup
        document.addEventListener('mousemove', (e: MouseEvent) => this.dragMove(e));
        document.addEventListener('mouseup', (e: MouseEvent) => this.dragEnd(e));
        
      } else {
        console.warn('Modal header não encontrado para configurar o arrastar');
        console.log('Tentando novamente em 1 segundo...');
        // Tentar novamente após mais tempo
        setTimeout(() => {
          const allDialogs = document.querySelectorAll('.cdk-dialog-container');
          this.modalElement = allDialogs[allDialogs.length - 1] as HTMLElement;
          this.modalContentElement = this.modalElement;
          this.modalHeaderElement = this.modalElement?.querySelector('.modal-header') as HTMLElement ||
                                   document.querySelector('.graphviz-modal-container .modal-header') as HTMLElement;
          if (this.modalHeaderElement && this.modalContentElement) {
            console.log('Modal header encontrado na segunda tentativa');
            document.addEventListener('mousedown', (e: MouseEvent) => {
              if (this.modalHeaderElement && this.modalHeaderElement.contains(e.target as Node)) {
                this.dragStart(e);
              }
            }, true);
            document.addEventListener('mousemove', (e: MouseEvent) => this.dragMove(e));
            document.addEventListener('mouseup', (e: MouseEvent) => this.dragEnd(e));
          }
        }, 1000);
      }
    }, 500);
  }

  private dragStart(event: MouseEvent): void {
    console.log('🔧 [DRAG] dragStart chamado');
    console.log('🔧 [DRAG] Target:', event.target);
    console.log('🔧 [DRAG] Modal header element:', !!this.modalHeaderElement);
    
    // Prevenir arrastar se clicou em um botão
    if ((event.target as HTMLElement).closest('button')) {
      console.log('🔧 [DRAG] Clicou em botão, cancelando drag');
      return;
    }

    console.log('🔧 [DRAG] Iniciando arrasto do modal');
    
    // Simplificar - já sabemos que clicou no header, então iniciar o drag diretamente
    if (this.modalHeaderElement && this.modalContentElement) {
      console.log('🔧 [DRAG] Drag iniciado com sucesso');
      this.initialX = event.clientX - this.currentX;
      this.initialY = event.clientY - this.currentY;
      this.isDragging = true;
      
      this.modalContentElement.classList.add('dragging');
      console.log('🔧 [DRAG] Classe dragging adicionada');
    } else {
      console.log('🔧 [DRAG] Modal header ou content não existe');
    }
  }

  private dragMove(event: MouseEvent): void {
    if (this.isDragging && this.modalContentElement) {
      event.preventDefault();
      
      this.currentX = event.clientX - this.initialX;
      this.currentY = event.clientY - this.initialY;

      console.log('🔧 [DRAG] Movendo:', this.currentX, this.currentY);
      this.setTranslate(this.currentX, this.currentY, this.modalContentElement);
    } else {
      console.log('🔧 [DRAG] dragMove chamado mas não está arrastando. isDragging:', this.isDragging, 'modalContentElement:', !!this.modalContentElement);
    }
  }

  private dragEnd(event: MouseEvent): void {
    console.log('🔧 [DRAG] dragEnd chamado. isDragging:', this.isDragging);
    if (this.isDragging) {
      this.initialX = this.currentX;
      this.initialY = this.currentY;
      
      this.isDragging = false;
      if (this.modalContentElement) {
        this.modalContentElement.classList.remove('dragging');
        console.log('🔧 [DRAG] Classe dragging removida');
      }
    }
  }

  private setTranslate(xPos: number, yPos: number, el: HTMLElement): void {
    if (el) {
      el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
      console.log('🔧 [DRAG] Transform aplicado:', `translate3d(${xPos}px, ${yPos}px, 0)`);
    } else {
      console.log('🔧 [DRAG] Elemento não encontrado para aplicar transform');
    }
  }
  




//==================================================================================================

  // 🆕 NOVO: Configurar interatividade do GraphViz
  private setupInteractivity(): void {
    // Adicionar função global para clique no splitter
    (window as any).onSplitterClick = (idmeta: number, capacidade: number, label: string) => {
      console.log(`🔀 [SPLITTER-CLICK] IDMETA: ${idmeta}, Capacidade: ${capacidade}F, Label: ${label}`);
      this.handleSplitterClick(idmeta, capacidade, label);
    };
  }

  // 🆕 NOVO: Manipular clique no splitter
  private handleSplitterClick(idmeta: number, capacidade: number, label: string): void {
    // Mostrar informações do splitter
    const message = `Splitter Clicado!\n\nIDMETA: ${idmeta}\nCapacidade: ${capacidade}F\nLabel: ${label}`;
    alert(message);
    
    // Aqui você pode adicionar outras ações:
    // - Abrir modal de detalhes
    // - Navegar para outra página
    // - Mostrar informações adicionais
    // - etc.
  }


  // 🆕 NOVO: Verificar se o DOT string está completo
  private isDotStringComplete(dotString: string): boolean {
    if (!dotString || dotString.length < 50) return false;
    
    // Verificar se tem início e fim corretos
    const hasStart = dotString.includes('digraph');
    const hasEnd = dotString.includes('size="10"}');
    const hasNodes = dotString.includes('[') && dotString.includes(']');
    
    return hasStart && hasEnd && hasNodes;
  }

  private loadGraphvizFile() {
    this.isLoading = true;
    this.error = '';
    
    // Carregar o arquivo graphviz.txt da pasta assets
    this.http.get('/assets/graphviz.txt', { responseType: 'text' }).subscribe({
      next: (content) => {
        this.dotContent = content;
        console.log('Arquivo graphviz.txt carregado com sucesso');
      },
      error: (error) => {
        console.error('Erro ao carregar arquivo graphviz.txt:', error);
        this.error = 'Erro ao carregar o arquivo graphviz.txt';
        this.isLoading = false;
      }
    });
  }

  private async renderGraphviz() {
    try {
      console.log('🎨 [GRAPHVIZ] Iniciando renderização...');
      console.log('🎨 [GRAPHVIZ] DOT Content length:', this.dotContent.length);
      console.log('🎨 [GRAPHVIZ] DOT Content preview:', this.dotContent.substring(0, 200) + '...');
      
      // Usar a biblioteca @hpcc-js/wasm-graphviz
      const graphviz = await Graphviz.load();
      console.log('🎨 [GRAPHVIZ] GraphViz carregado');
      
      // Renderizar o diagrama com suporte a JavaScript
      const svg = await graphviz.layout(this.dotContent, 'svg', 'dot');
      console.log('🎨 [GRAPHVIZ] SVG gerado, tamanho:', svg.length);
      
      // 🆕 CORREÇÃO: Aguardar o DOM estar pronto e tentar múltiplas vezes
      let container: HTMLElement | null = null;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!container && attempts < maxAttempts) {
        container = document.getElementById('graphviz-container');
        if (!container) {
          console.log(`🔄 [GRAPHVIZ] Tentativa ${attempts + 1}/${maxAttempts} - Container não encontrado, aguardando...`);
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
      }
      
      if (container) {
        container.innerHTML = svg;
        console.log('🎨 [GRAPHVIZ] SVG inserido no DOM');
        
        // Aplicar transformações de zoom e pan
        this.applyTransformations();
        console.log('✅ [GRAPHVIZ] Diagrama GraphViz renderizado com sucesso');
      } else {
        console.error('❌ [GRAPHVIZ] Container não encontrado após', maxAttempts, 'tentativas!');
        this.error = 'Erro: Container do diagrama não encontrado';
      }
      
      this.isLoading = false;
    } catch (error) {
      console.error('❌ [GRAPHVIZ] Erro ao renderizar GraphViz:', error);
      this.error = 'Erro ao renderizar o diagrama GraphViz: ' + (error instanceof Error ? error.message : 'Erro desconhecido');
      this.isLoading = false;
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onRefresh(): void {
    this.isLoading = true;
    this.error = '';
    this.resetZoom();
    this.renderGraphviz();
  }

  // Métodos para zoom e pan
  private applyTransformations(): void {
    const container = document.getElementById('graphviz-container');
    if (container) {
      const svg = container.querySelector('svg');
      if (svg) {
        svg.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.currentZoom})`;
        svg.style.transformOrigin = '0 0';
      }
    }
  }

  zoomIn(): void {
    this.currentZoom = Math.min(this.currentZoom * 1.2, 5);
    this.applyTransformations();
  }

  zoomOut(): void {
    this.currentZoom = Math.max(this.currentZoom / 1.2, 0.1);
    this.applyTransformations();
  }

  resetZoom(): void {
    this.currentZoom = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.applyTransformations();
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    this.currentZoom = Math.max(0.1, Math.min(5, this.currentZoom * delta));
    this.applyTransformations();
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button === 0) { // Botão esquerdo
      this.isPanning = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
      event.preventDefault();
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isPanning) {
      this.translateX = event.clientX - this.startX;
      this.translateY = event.clientY - this.startY;
      this.applyTransformations();
    }
  }

  onMouseUp(event: MouseEvent): void {
    this.isPanning = false;
  }
}

