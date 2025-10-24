import { Component, OnInit, AfterViewInit, Inject, NgZone, ChangeDetectorRef, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';

@Component({
  selector: 'app-gojs-popup',
  templateUrl: './gojs-popup.component.html',
  styleUrls: ['./gojs-popup.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class GoJSPopupComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('diagramDiv') diagramDiv: ElementRef | null = null;
  
  diagram: go.Diagram | null = null;
  diagramInitialized = false;
  initializationError: string | null = null;
  caixaNumerocx: string = '';

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🚀 [GOJS-POPUP] Componente inicializado');
    
    // Obter IDMETA da URL ou localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const idmeta = urlParams.get('idmeta') || localStorage.getItem('idmetaCaixa');
    
    if (idmeta) {
      console.log('🔍 [GOJS-POPUP] IDMETA encontrado:', idmeta);
      this.caixaNumerocx = `Caixa ${idmeta}`;
      // Aqui você pode carregar os dados específicos da caixa
    } else {
      console.log('❌ [GOJS-POPUP] IDMETA não encontrado');
      this.initializationError = 'IDMETA da caixa não fornecido';
    }
  }

  async ngAfterViewInit() {
    if (this.initializationError) return;
    
    try {
      await this.initializeDiagram();
      this.diagramInitialized = true;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('❌ [GOJS-POPUP] Erro ao inicializar diagrama:', error);
      this.initializationError = 'Erro ao inicializar diagrama: ' + (error as Error).message;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.diagram) {
      this.diagram.div = null;
    }
  }

  private async initializeDiagram(): Promise<void> {
    console.log('🔀 [GOJS-POPUP] Iniciando diagrama...');
    
    if (!this.diagramDiv) {
      throw new Error('Elemento diagramDiv não encontrado');
    }

    this.ngZone.runOutsideAngular(() => {
      // Remover diagrama existente se houver
      if (this.diagram) {
        this.diagram.div = null;
      }

      // Criar novo diagrama
      this.diagram = new go.Diagram(this.diagramDiv!.nativeElement, {
        initialContentAlignment: go.Spot.Center,
        allowCopy: false,
        allowDelete: false,
        allowMove: false,
        allowTextEdit: false,
        layout: new go.TreeLayout({
          angle: 0,
          layerSpacing: 30,
          nodeSpacing: 20
        }),
        "undoManager.isEnabled": true
      });

      // Template simples para demonstração
      this.diagram.nodeTemplate = new go.Node("Auto")
        .add(new go.Shape("RoundedRectangle", { strokeWidth: 0 })
          .bind("fill", "color"))
        .add(new go.TextBlock({ margin: 8 })
          .bind("text", "text"));

      // Dados de exemplo
      this.diagram.model = new go.GraphLinksModel([
        { key: 1, text: "Caixa Principal", color: "lightblue" },
        { key: 2, text: "Splitter 1", color: "lightgreen" },
        { key: 3, text: "Splitter 2", color: "lightgreen" },
        { key: 4, text: "Cliente A", color: "lightcoral" },
        { key: 5, text: "Cliente B", color: "lightcoral" }
      ], [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 4 },
        { from: 3, to: 5 }
      ]);

      console.log('✅ [GOJS-POPUP] Diagrama inicializado com sucesso');
    });
  }

  close(): void {
    window.close();
  }

  exportarDiagramaParaPDF(): void {
    console.log('📄 [GOJS-POPUP] Exportando para PDF...');
    // Implementar exportação para PDF
    alert('Funcionalidade de PDF será implementada em breve!');
  }

  redesenharDiagrama(): void {
    console.log('🔄 [GOJS-POPUP] Redesenhando diagrama...');
    if (this.diagram) {
      this.diagram.layoutDiagram(true);
    }
  }

  espelhar(): void {
    console.log('🔂 [GOJS-POPUP] Espelhando diagrama...');
    if (this.diagram) {
      this.diagram.scale = -this.diagram.scale;
    }
  }
}
