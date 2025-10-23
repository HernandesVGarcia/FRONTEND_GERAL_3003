



import { Component, OnInit, AfterViewInit, Inject, ViewChild, ElementRef, } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Graphviz } from "@hpcc-js/wasm-graphviz";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { FiberTraceUnifilarSplitterService } from '../servico/fiber-trace-unifilar-splitter.service';
import { SplitterModalService } from '../servico/splitter-modal.service';

@Component({
  selector: 'app-graphviz-splitter-modal',
  templateUrl: './graphviz-splitter-modal.component.html',
  styleUrls: ['./graphviz-splitter-modal.component.css'],
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule]
})
export class GraphvizSplitterModalComponent implements OnInit, AfterViewInit {
  dotContent: string = '';
  isLoading: boolean = true;
  error: string = '';
  isGeneratingPDF: boolean = false;
  splitterInfo: any = null;
  containerId: string = ''; // 🆕 NOVO: ID único do container baseado no IDMETA
  
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
    public dialogRef: MatDialogRef<GraphvizSplitterModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private fiberTraceSplitterService: FiberTraceUnifilarSplitterService,
    private dialog: MatDialog,
    private splitterModalService: SplitterModalService
  ) {}

  ngOnInit() {
    // 🆕 NOVO: Gerar ID único do container baseado no IDMETA
    this.containerId = `graphviz-splitter-container-${this.data.idmeta}`;
    console.log('🔍 [SPLITTER-MODAL] Container ID:', this.containerId);
    
    // 🆕 NOVO: Carregar splitter usando o serviço
    if (this.data && this.data.idmeta) {
      console.log('🔀 [SPLITTER-MODAL] Carregando splitter IDMETA:', this.data.idmeta);
      //this.carregarSplitterMapping();
      this.tracerSplitter();
    } else {
      console.log('❌ [SPLITTER-MODAL] IDMETA não fornecido');
      this.error = 'IDMETA do splitter não fornecido';
      this.isLoading = false;
    }
    
    // ****************************click em caixas no diagrama unifilar cabo*******
    // 🏠 NOVO: Função global para cliques em caixas (Opção 1 - Evento Customizado)
    (window as any).onCaixaClick = (idmeta: number, numerocx: string, label_cx: string) => {
      console.log('🏠 [CAIXA-CLICK] Caixa clicada:', { idmeta, numerocx, label_cx });
      
      // Enviar evento para o google-maps abrir o GoJS modal
      const event = new CustomEvent('openGoJSModal', {
        detail: { idmeta, numerocx, label_cx }
      });
      window.dispatchEvent(event);
      
      console.log('🏠 [CAIXA-CLICK] Evento openGoJSModal enviado para o Google Maps');
    };

    // 🔀 NOVO: Função própria para cliques em splitters dentro deste modal
    (window as any).onSplitterClick = (idmeta: number, capacidade: number, label: string) => {
      console.log(`🔀 [SPLITTER-CLICK-SPLITTER-MODAL] IDMETA: ${idmeta}, Capacidade: ${capacidade}F, Label: ${label}`);
      this.handleSplitterClick(idmeta, capacidade, label);
    };
  }

  ngOnDestroy() {
    // Resetar flag do serviço quando modal fecha
    this.fiberTraceSplitterService.resetEntradaFlag();
  }
  
  








  /**
   * 🆕 NOVO: Carregar mapeamento do splitter usando o serviço
   */
  private carregarSplitterMapping(): void {
    this.isLoading = true;
    this.error = '';

    console.log('🔀 [SPLITTER-MODAL] Iniciando carregamento do splitter...');

   /* this.fiberTraceSplitterService.ANALISA_SPLITTER_MAPPING(this.data.idmeta).subscribe({
      next: (result) => {
        if (result.success) {
          this.dotContent = result.dotString;
          this.splitterInfo = result.splitterInfo;
          console.log('🔀 [SPLITTER-MODAL] Splitter carregado com sucesso:', result.splitterInfo);
          console.log('🔀 [SPLITTER-MODAL] DOT string:', this.dotContent);
          
          // 🆕 NOVO: Renderizar automaticamente após carregar
          setTimeout(async () => {
            await this.renderGraphviz();
          }, 500);
        } else {
          this.error = result.error || 'Erro ao carregar splitter';
          console.error('❌ [SPLITTER-MODAL] Erro:', result.error);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Erro ao carregar splitter';
        this.isLoading = false;
        console.error('❌ [SPLITTER-MODAL] Erro:', error);
      }
    });*/
  }
  // ********************************************************************************

  async ngAfterViewInit() {
    // Configurar funcionalidade de drag (padrão visualiza-dio)
    this.setupDragFunctionality();

    // Aguardar um pouco para garantir que o DOM esteja pronto
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('🔍 [GRAPHVIZ] ngAfterViewInit - Verificando container...');
    const container = document.getElementById(this.containerId);
    console.log('🔍 [GRAPHVIZ] Container encontrado:', !!container, 'ID:', this.containerId);
    
    // 🆕 CORREÇÃO: Não configurar interatividade aqui - função global já está configurada no graphviz-modal
    
    // 🆕 NOVO: Renderizar quando o splitter for carregado
    if (this.dotContent && !this.isLoading) {
      console.log('✅ [SPLITTER-MODAL] DOT string carregado - Renderizando');
      await this.renderGraphviz();
    } else if (this.dotContent) {
      // Aguardar um pouco e tentar novamente
      setTimeout(async () => {
        if (this.dotContent && !this.isLoading) {
          await this.renderGraphviz();
        }
      }, 1000);
    }
  }
  // ================================ Arrastar Modal Drag Methods (padrão visualiza-dio) ================================
 
 private tracerSplitter(): void {
  console.log('🔍 [GRAPHVIZ] Capacidade:', this.data.capacidade);
  this.fiberTraceSplitterService.ANALISA_TABELAGRAFO_TOTAL(this.data.idmeta,1,this.data.capacidade,this.data.capacidade).subscribe({
    next: (result) => {
      if (result.success) {
        this.dotContent = result.dotString;
        console.log('🔍 [GRAPHVIZ] DOT Content:', this.dotContent);

        // 🆕 ADICIONAR: Chamar renderGraphviz após receber o dotString
        this.isLoading = false; // Parar o loading
        setTimeout(async () => {
          await this.renderGraphviz();
        }, 100); // Pequeno delay para garantir que o DOM está pronto
        } else {
        this.error = result.error || 'Erro ao carregar dados do splitter';
        this.isLoading = false;
        }
        },
        error: (error) => {
        this.error = 'Erro ao carregar dados do splitter: ' + error.message;
        this.isLoading = false;
        console.error('❌ [GRAPHVIZ] Erro:', error);
        }


        
      
    }  );
 
 
  }
 
 
  // =================================tracer
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
        
        // 🆕 CORREÇÃO: Usar a estratégia do visualiza-dio - listener apenas no header específico
        this.modalHeaderElement.addEventListener('mousedown', (e: MouseEvent) => this.dragStart(e));
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

  // 🔀 NOVO: Manipular clique no splitter dentro deste modal
  public handleSplitterClick(idmeta: number, capacidade: number, label: string): void {
    console.log(`🔀 [SPLITTER-CLICK-HANDLER] Abrindo modal para splitter: ${idmeta}`);
    
    // Usar o serviço para abrir o modal
    this.splitterModalService.openSplitterModal(idmeta, capacidade, label);
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
        container = document.getElementById(this.containerId);
        if (!container) {
          console.log(`🔄 [GRAPHVIZ] Tentativa ${attempts + 1}/${maxAttempts} - Container não encontrado, aguardando... ID: ${this.containerId}`);
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
    const container = document.getElementById(this.containerId);
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

  // Método para gerar PDF do diagrama
  async onPrintPDF(): Promise<void> {
    try {
      this.isGeneratingPDF = true;
      console.log('🖨️ [PDF] Iniciando geração de PDF...');

      // Aguardar um pouco para garantir que o SVG está renderizado
      await new Promise(resolve => setTimeout(resolve, 500));

      const container = document.getElementById(this.containerId);
      if (!container) {
        throw new Error(`Container do diagrama não encontrado: ${this.containerId}`);
      }

      const svg = container.querySelector('svg');
      if (!svg) {
        throw new Error('SVG do diagrama não encontrado');
      }

      console.log('🖨️ [PDF] Capturando SVG com html2canvas...');

      // Capturar o SVG como canvas
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2, // Maior resolução
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: container.scrollWidth,
        height: container.scrollHeight
      });

      console.log('🖨️ [PDF] Canvas capturado:', canvas.width, 'x', canvas.height);

      // Criar PDF
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calcular dimensões para ajustar ao PDF
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calcular escala para ajustar a imagem ao PDF
      const scaleX = pdfWidth / imgWidth;
      const scaleY = pdfHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY) * 0.9; // 90% para margem

      const finalWidth = imgWidth * scale;
      const finalHeight = imgHeight * scale;

      // Centralizar a imagem no PDF
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      console.log('🖨️ [PDF] Adicionando imagem ao PDF...');
      console.log('🖨️ [PDF] Dimensões:', finalWidth, 'x', finalHeight);
      console.log('🖨️ [PDF] Posição:', x, ',', y);

      // Adicionar título se disponível
      if (this.data?.title) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(this.data.title, pdfWidth / 2, 20, { align: 'center' });
      }

      // Adicionar data de geração
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${dateStr}`, pdfWidth / 2, 30, { align: 'center' });

      // Adicionar a imagem do diagrama
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', x, y + 10, finalWidth, finalHeight);

      // Gerar nome do arquivo
      const fileName = this.data?.title 
        ? `diagrama_${this.data.title.replace(/[^a-zA-Z0-9]/g, '_')}_${now.getTime()}.pdf`
        : `diagrama_graphviz_${now.getTime()}.pdf`;

      console.log('🖨️ [PDF] Salvando arquivo:', fileName);

      // Salvar o PDF
      pdf.save(fileName);

      console.log('✅ [PDF] PDF gerado com sucesso!');
      
    } catch (error) {
      console.error('❌ [PDF] Erro ao gerar PDF:', error);
      this.error = 'Erro ao gerar PDF: ' + (error as Error).message;
    } finally {
      this.isGeneratingPDF = false;
    }
  }
}

