import { Component, 
  OnInit, 
  Input, 
  Output, 
  EventEmitter, 
  NgZone, 
  ChangeDetectorRef, 
  ElementRef, 
  ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';

@Component({
  selector: 'app-gojs-demo',
  templateUrl: './gojs-demo.component.html',
  styleUrls: ['./gojs-demo.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class GoJSDemoComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @ViewChild('diagramDiv') diagramDiv: ElementRef | null = null;
  
  public diagramInitialized = false;
  public initializationError: string | null = null;
  public diagram: go.Diagram | null = null;
  
  private nodeDataArray = [
    { key: "Cabo Saída", category: "CABO_SAIDA", tipo: "12 FO (Portas à Direita)", loc: "100 100" },
    { key: "Cabo Entrada", category: "CABO_ENTRADA", tipo: "12 FO (Portas à Esquerda)", loc: "300 100" },
    { key: "Cabo Entrada1", category: "CABO_ENTRADA", tipo: "12 FO (Portas à Esquerda)", loc: "500 100" },
    { key: "Cabo Saída1", category: "CABO_SAIDA", tipo: "24 FO (Portas à Direita)", loc: "100 250" },
    { key: "Cabo Entrada2", category: "CABO_ENTRADA", tipo: "24 FO (Portas à Esquerda)", loc: "300 250" }
  ];

  private linkDataArray = [
    { from: "Cabo Saída", to: "Cabo Entrada", fromPort: "P1", toPort: "P1", text: "Conexão 1" },
    { from: "Cabo Saída", to: "Cabo Entrada1", fromPort: "P2", toPort: "P2", text: "Conexão 2" },
    { from: "Cabo Saída1", to: "Cabo Entrada2", fromPort: "P1", toPort: "P1", text: "Conexão 3" }
  ];

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('GoJSDemo Component inicializado');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      console.log('Modal está sendo aberto');
      if (!this.diagramInitialized || !this.diagram) {
        // Aguardar a renderização do DOM
        setTimeout(() => {
          console.log('Iniciando diagrama após abertura do modal');
          this.initializeDiagram();
        }, 200);
      } else {
        console.log('Diagrama já inicializado, apenas atualizando');
        this.updateDiagramLayout();
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.isOpen) {
      console.log('AfterViewInit: Modal está aberto, inicializando diagrama');
      setTimeout(() => this.initializeDiagram(), 200);
    }
  }

  private updateDiagramLayout(): void {
    if (this.diagram) {
      console.log('Atualizando layout do diagrama');
      // Removendo o terceiro argumento e passando apenas um booleano
      this.diagram.layoutDiagram(true);
    }
  }

  private initializeDiagram(): void {
    if (!this.diagramDiv?.nativeElement) {
      console.error('Elemento DOM do diagrama não encontrado');
      this.initializationError = 'Erro: Elemento do diagrama não encontrado';
      this.cdr.detectChanges();
      return;
    }

    try {
      console.log('Iniciando criação do diagrama');
      this.ngZone.runOutsideAngular(() => {
        // Remover diagrama existente se houver
        if (this.diagram) {
          console.log('Removendo diagrama existente');
          this.diagram.div = null;
          this.diagram = null;
        }

        // Criando um novo diagrama
        this.diagram = new go.Diagram(this.diagramDiv?.nativeElement, {
          "undoManager.isEnabled": true,
          "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
          "grid.visible": true,
          "grid.gridCellSize": new go.Size(20, 20),
          allowDrop: true,
          allowLink: true,
          allowRelink: true,
          "initialAutoScale": go.Diagram.Uniform,
          "initialContentAlignment": go.Spot.Center,
          "maxScale": 2,
          "minScale": 0.2,
          padding: new go.Margin(40, 40, 40, 40)
        });

        console.log('Diagrama criado, configurando templates');

        // Registrando os node templates
        this.setupTemplates();
        
        // Aplicando o modelo de dados
        const model = new go.GraphLinksModel(this.nodeDataArray, this.linkDataArray);
        model.nodeKeyProperty = "key"; 
        this.diagram.model = model;

        // Configurar o layout do diagrama
        this.diagram.layout = new go.LayeredDigraphLayout({
          direction: 0,  // direção horizontal: 0=direita, 90=baixo, 180=esquerda, 270=cima
          layerSpacing: 50,
          columnSpacing: 30,
          setsPortSpots: false
        });
        
        // Forçar layout inicial - Corrigindo a chamada para layoutDiagram
        this.diagram.layoutDiagram(true);
        
        // Marcando como inicializado
        this.ngZone.run(() => {
          console.log('Diagrama inicializado com sucesso');
          this.diagramInitialized = true;
          this.initializationError = null;
          this.cdr.detectChanges();
        });
      });
    } catch (err: any) {
      console.error('Erro ao inicializar diagrama:', err);
      this.initializationError = err.message || 'Erro desconhecido';
      this.diagramInitialized = false;
      this.cdr.detectChanges();
    }
  }

  private setupTemplates(): void {
    if (!this.diagram) return;

    // Template para cabos de saída
    this.diagram.nodeTemplateMap.add("CABO_SAIDA", 
      this.createNodeTemplate(
        "#c6efce", "#006100", "CABO_SAIDA", 
        [go.Spot.RightCenter, new go.Spot(1, 0.3), new go.Spot(1, 0.7)]
      )
    );

    // Template para cabos de entrada
    this.diagram.nodeTemplateMap.add("CABO_ENTRADA", 
      this.createNodeTemplate(
        "#ffc7ce", "#9c0006", "CABO_ENTRADA", 
        [go.Spot.LeftCenter, new go.Spot(0, 0.3), new go.Spot(0, 0.7)]
      )
    );

    // Template para links
    this.diagram.linkTemplate = this.createLinkTemplate();
  }

  // Método para criar tooltips
  

  // Método para criar portas
  private makePort(id: string, spot: go.Spot, output: boolean, input: boolean) {
    return new go.Shape("Circle", {
        fill: output ? "#1E88E5" : "#D32F2F",
        stroke: null,
        desiredSize: new go.Size(8, 8),
        alignment: spot, 
        alignmentFocus: spot,
        portId: id,
        fromSpot: output ? spot : go.Spot.None,
        toSpot: input ? spot : go.Spot.None,
        fromLinkable: output,
        toLinkable: input,
        cursor: "pointer",
        
      });
  }

  // Método para criar template de nó
  private createNodeTemplate(fillColor: string, strokeColor: string, category: string, portSpots: go.Spot[]): go.Node {
    const node = new go.Node("Spot", { 
      selectable: true,
      resizable: true,
      resizeObjectName: "SHAPE",
      
    });

    // Painel principal do nó
    const panel = new go.Panel("Auto");
    
    // Forma do nó
    panel.add(
      new go.Shape("Rectangle", {
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: 2,
        width: 140,
        height: 80,
        name: "SHAPE"
      })
    );
    
    // Texto do nó
    panel.add(
      new go.TextBlock({ 
        margin: 8,
        font: "bold 12px sans-serif",
        stroke: strokeColor,
        wrap: go.TextBlock.WrapFit,
        textAlign: "center"
      }).bind("text", "tipo")
    );
    
    node.add(panel);
    
    // Adicionar portas
    portSpots.forEach((spot, index) => {
      node.add(this.makePort("P" + (index + 1), spot, category === "CABO_SAIDA", category === "CABO_ENTRADA"));
    });
    
    return node;
  }

  // Método para criar template de link
  private createLinkTemplate(): go.Link {
    return new go.Link({ 
      routing: go.Link.AvoidsNodes,
      corner: 10,
      curve: go.Link.JumpOver,
      reshapable: true,
      resegmentable: true,
      relinkableFrom: true,
      relinkableTo: true,
      toEndSegmentLength: 30,
      fromEndSegmentLength: 30,
      
    })
    .add(
      new go.Shape({ 
        strokeWidth: 2.5, 
        stroke: "#333" 
      })
    )
    .add(
      new go.Shape({ 
        toArrow: "Standard", 
        stroke: null, 
        fill: "#333",
        scale: 1.2
      })
    )
    .add(
      new go.TextBlock({
        segmentOffset: new go.Point(0, -10),
        font: "10pt sans-serif",
        stroke: "#1565C0",
        background: "white"
      })
      .bind("text", "text")
    );
  }

  close() {
    console.log('Fechando modal GoJS');
    this.closeModal.emit();
  }

  
  
}
