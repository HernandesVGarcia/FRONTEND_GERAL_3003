import { AvoidsLinksRouter } from '../utils/AvoidsLinksRouter'

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
import { Cabo12FNacComponent } from '../Stencil/cabo-12-f-nac/cabo-12-f-nac.component';
import { Cabo12FNacDComponent } from '../Stencil/cabo-12-f-nac-d/cabo-12-f-nac-d.component';
import { Cabo24FNacComponent } from '../Stencil/cabo-24-f-nac/cabo-24-f-nac.component';
import { Cabo24FNacDComponent } from '../Stencil/cabo-24-f-nac-d/cabo-24-f-nac-d.component';
import { Cabo36FNacComponent } from '../Stencil/cabo-36-f-nac/cabo-36-f-nac.component';
import { Cabo36FNacDComponent } from '../Stencil/cabo-36-f-nac-d/cabo-36-f-nac-d.component';
import { BocasService } from '../servico/bocas.service';
import { Bocas} from '../modelo/Bocas'
import { rotatePoint } from '@syncfusion/ej2-angular-diagrams';
import { ConexBocasService } from '../servico/conex-bocas.service';
import { ConexaoBoca } from '../modelo/ConexaoBoca';


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

  // Flag para controlar se as conexões já foram criadas
  // Novas propriedades para controle de conexões
  private conexoesCarregadas: ConexaoBoca[] = [];
  private conexoesPorBoca: Map<number, ConexaoBoca[]> = new Map();
  private bocasCarregadas: Set<number> = new Set();
  private carregamentoEmAndamento: boolean = false;
  private conexoesCriadas: boolean = false;
  private bocasProcessadas: Set<number> = new Set();

  private modalElement: HTMLElement | null = null;
  private modalContentElement: HTMLElement | null = null;
  private modalHeaderElement: HTMLElement | null = null; // Novo: referência para o cabeçalho
  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;

  private cabo12FNAC: Cabo12FNacComponent = new Cabo12FNacComponent();
  private cabo12FNAC_D: Cabo12FNacDComponent = new Cabo12FNacDComponent();
  private cabo24FNAC: Cabo24FNacComponent = new Cabo24FNacComponent();
  private cabo24FNAC_D: Cabo24FNacDComponent = new Cabo24FNacDComponent();
  private cabo36FNAC: Cabo36FNacComponent = new Cabo36FNacComponent();
  private cabo36FNAC_D: Cabo36FNacDComponent = new Cabo36FNacDComponent();


  private avoidsLinksRouter: AvoidsLinksRouter | null = null;
  private Alinhamento : string = "D";
  VetorBocas:Bocas[]=[];
  
 
  constructor(
     private ngZone: NgZone,
     private cdr: ChangeDetectorRef,
     private servicoBocas: BocasService,
     private conexBocasService: ConexBocasService
    ) {}

  ngOnInit(): void {
    console.log('GoJSDemo Component inicializado');
    this.selecionar_Bocas();// <-----função para ler bocas
    this.carregarConexoesBocas();


    //this.carregarConexoesBocas(); // <--- CARREGA CONEXÕES DA BOCA DE 1 A 144 FIBRAS
    
  }

//=========================função que le os Cabos das Bocas das caixas , Boca1, Boca2....Boca18  
selecionar_Bocas() {
    console.log('Iniciando seleção de Bocas...');

    
    this.servicoBocas.selecionar().subscribe({
      next: (retorno) => {
        console.log('Dados recebidos:', retorno);
        if ('response' in retorno) {
          this.VetorBocas = (retorno as any).response;
        } else {
          this.VetorBocas = retorno as Bocas[];
        }
        console.log(this.VetorBocas[0].BOCA1);
      },
      error: (erro) => {
        console.error('Erro ao carregar Bocas:', erro);
      }
    });
  }

  private isConexaoReversa(conexao: ConexaoBoca): boolean {
    return this.conexoesCarregadas.some(existente => 
      existente.bocaOrigem === conexao.bocaDestino &&
      existente.bocaDestino === conexao.bocaOrigem &&
      existente.fibraOrigem === conexao.fibraDestino &&
      existente.fibraDestino === conexao.fibraOrigem
    );
  }

  private filtrarConexao(conexao: ConexaoBoca): boolean {
    const numeroBocaDestino = parseInt(conexao.bocaDestino.replace('Boca', ''));
    
    if (this.bocasProcessadas.has(numeroBocaDestino)) {
      return false;
    }
    
    return true;
  }


  //==============================================================================================


  //============== FUNÇÃO QUE LE A CONECTIVIDADE DAS BOCAS DA CAIXA ==============================

  // Método atualizado para carregar conexões sequencialmente usando async/await
  async carregarConexoesBocas() {
    if (this.carregamentoEmAndamento) {
      console.log('Carregamento de conexões já em andamento, aguardando...');
      return;
    }

    this.carregamentoEmAndamento = true;
    console.log('Iniciando carregamento sequencial das conexões de bocas com filtragem das conexoes...');

    try {
      // Carregar cada boca sequencialmente
      const bocasParaCarregar = [1, 2, 3, 4] as const;
      
      for (const bocaNumero of bocasParaCarregar) {
        if (!this.bocasCarregadas.has(bocaNumero)) {
          console.log(`Carregando conexões da Boca ${bocaNumero}...`);
          
          const todasConexoes = await this.conexBocasService.selecionarAsync(bocaNumero);
          console.log(`Todas conexões da Boca ${bocaNumero} recebidas:`, todasConexoes);
          
          // Armazenar as conexões desta boca
          const conexoesFiltradas = todasConexoes.filter(conexao => this.filtrarConexao(conexao));
          console.log(`Conexões da Boca ${bocaNumero} após filtragem:`, conexoesFiltradas);
          
          this.conexoesPorBoca.set(bocaNumero, conexoesFiltradas);
          this.bocasCarregadas.add(bocaNumero)

          // Acumular conexões em um único array
          this.conexoesCarregadas = [
            ...this.conexoesCarregadas,
            ...conexoesFiltradas
          ];

          this.bocasProcessadas.add(bocaNumero)
        }
      }
      
      // Depois que todas as bocas forem carregadas, criar as conexões
      console.log('Todas as bocas foram carregadas:', this.bocasCarregadas.size);
      console.log('Total de conexões carregadas após filtragem:', this.conexoesCarregadas.length);
      
      if (this.diagram && !this.conexoesCriadas && this.conexoesCarregadas.length > 0) {
        this.criarConexoesAutomaticas();
      }
    } catch (error) {
      console.error('Erro durante o carregamento de conexões:', error);
    } finally {
      this.carregamentoEmAndamento = false;
    }
  }

//==============================================================================================



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
    this.setupDragFunctionality();
  }


  private setupDragFunctionality(): void {
    setTimeout(() => {
      this.modalElement = document.querySelector('.modal') as HTMLElement;
      this.modalContentElement = document.querySelector('.modal-content') as HTMLElement;
      this.modalHeaderElement = document.querySelector('.modal-header') as HTMLElement;
      
      if (this.modalHeaderElement && this.modalContentElement) {
        console.log('Modal header encontrado para arrastar');
        // Adicionar listener apenas no cabeçalho, não no modal inteiro
        this.modalHeaderElement.addEventListener('mousedown', (e: MouseEvent) => this.dragStart(e));
        document.addEventListener('mousemove', (e: MouseEvent) => this.dragMove(e));
        document.addEventListener('mouseup', (e: MouseEvent) => this.dragEnd(e));
      } else {
        console.warn('Modal header não encontrado para configurar o arrastar');
      }
    }, 500);
  }

  private dragStart(event: MouseEvent): void {
    // Verificamos se o evento ocorreu no cabeçalho (não necessário, mas adicionado por segurança)
    if (this.modalHeaderElement && 
      (event.target === this.modalHeaderElement || 
       this.modalHeaderElement.contains(event.target as Node))) {
      
      this.initialX = event.clientX - this.currentX;
      this.initialY = event.clientY - this.currentY;
      this.isDragging = true;
      
      if (this.modalContentElement) {
        this.modalContentElement.classList.add('dragging');
      }
    }
  }

  private dragMove(event: MouseEvent): void {
    if (this.isDragging && this.modalContentElement) {
      event.preventDefault();
      
      this.currentX = event.clientX - this.initialX;
      this.currentY = event.clientY - this.initialY;

      this.setTranslate(this.currentX, this.currentY, this.modalContentElement);
    }
  }

  private dragEnd(event: MouseEvent): void {
    if (this.isDragging) {
      this.initialX = this.currentX;
      this.initialY = this.currentY;
      
      this.isDragging = false;
      if (this.modalContentElement) {
        this.modalContentElement.classList.remove('dragging');
      }
    }
  }

  private setTranslate(xPos: number, yPos: number, el: HTMLElement): void {
    if (el) {
      el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
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
          // Resetar a flag quando o diagrama for recriado
          this.conexoesCriadas = false;
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
          padding: new go.Margin(40, 40, 40, 40),
          "linkingTool.isUnconnectedLinkValid": false,
          "linkingTool.portGravity": 20,
          "relinkingTool.isUnconnectedLinkValid": false,
          "relinkingTool.portGravity": 20,
          "relinkingTool.fromHandleArchetype":
            new go.Shape("Diamond", { 
              segmentIndex: 0, 
              cursor: "pointer", 
              desiredSize: new go.Size(8, 8), 
              fill: "tomato", 
              stroke: "darkred" 
            }),
          "relinkingTool.toHandleArchetype":
            new go.Shape("Diamond", { 
              segmentIndex: -1, 
              cursor: "pointer", 
              desiredSize: new go.Size(8, 8), 
              fill: "darkred", 
              stroke: "tomato" 
            })
        });


        // Inicializar e configurar o AvoidsLinksRouter
        this.avoidsLinksRouter = new AvoidsLinksRouter();
        this.avoidsLinksRouter.epsilonDistance = 5; // Distância entre links paralelos
        this.avoidsLinksRouter.linkSpacing=30;
        this.diagram.routers.push(this.avoidsLinksRouter);
        console.log('AvoidsLinksRouter adicionado ao diagrama');



        // Definindo o modelo de nós para o diagrama
        // Agora usando o nodeTemplate definido no componente do modelo

        const caboTemplateMap = new go.Map<string, go.Node>();
        caboTemplateMap.add("cabo", this.cabo12FNAC.getNodeTemplate());
        caboTemplateMap.add("caboD", this.cabo12FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo24F", this.cabo24FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo24F_D", this.cabo24FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo36F", this.cabo36FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo36F_D", this.cabo36FNAC_D.getNodeTemplate());

        

        // Obtendo a definição do modelo do componente Cabo_12F_NAC
        this.diagram.nodeTemplateMap = caboTemplateMap;

        const caboModelTemplate = this.cabo12FNAC.getModelDefinition();
        const caboDModelTemplate = this.cabo12FNAC_D.getModelDefinition();
        const cabo24FModelTemplate = this.cabo24FNAC.getModelDefinition();
        const cabo24FDModelTemplate = this.cabo24FNAC_D.getModelDefinition();
        const cabo36FModelTemplate = this.cabo36FNAC.getModelDefinition();
        const cabo36FDModelTemplate = this.cabo36FNAC_D.getModelDefinition();

        // Criando dois cabos com base no mesmo modelo, mas com posições diferentes

        


        // Declare as variáveis fora dos blocos condicionais
        // Declaração correta das variáveis com tipos compatíveis
      let Boca1: go.ObjectData | null = null;
      let Boca2: go.ObjectData | null = null;
      let Boca3: go.ObjectData | null = null;
      let Boca4: go.ObjectData | null = null;
      let Boca5: go.ObjectData | null = null;
      let Boca6: go.ObjectData | null = null;
      let Boca7: go.ObjectData | null = null;
      let Boca8: go.ObjectData | null = null;
      let Boca9: go.ObjectData | null = null;
      let Boca10: go.ObjectData | null = null;
      let Boca11: go.ObjectData | null = null;
      let Boca12: go.ObjectData | null = null;
      let Boca13: go.ObjectData | null = null;
      let Boca14: go.ObjectData | null = null;
      let Boca15: go.ObjectData | null = null;
      let Boca16: go.ObjectData | null = null;
      let Boca17: go.ObjectData | null = null;
      let Boca18: go.ObjectData | null = null;

        if (this.VetorBocas[0].BOCA1!=" ") {
          
        Boca1 = { 
          ...cabo36FModelTemplate, 
          key: "Boca1",
          loc: "0 0"  // Posição do primeiro cabo
        } };
        
        if (this.VetorBocas[0].BOCA2!=" ") {
        Boca2 = { 
          ...cabo36FDModelTemplate, 
          key: "Boca2",
          loc: "4000 0", // Posição do segundo cabo (200px à direita do primeiro)
        }};

        if (this.VetorBocas[0].BOCA3!=" ") {
          Boca3 = { 
            ...cabo24FModelTemplate, 
            key: "Boca3",
            loc: "0 0", // Posição do segundo cabo (200px à direita do primeiro)  
         
        }};

        if (this.VetorBocas[0].BOCA4!=" ") {
          Boca4 = { 
            ...cabo24FDModelTemplate, 
            key: "Boca4",
            loc: "0 0", // Posição do segundo cabo (200px à direita do primeiro)  
         
        }};

        if (this.VetorBocas[0].BOCA5!=" ") {
          Boca5 = { 
            ...caboModelTemplate, 
            key: "Boca5",
            loc: "0 0", // Posição do segundo cabo (200px à direita do primeiro)  
         
        }};

        if (this.VetorBocas[0].BOCA6!=" ") {
          Boca6 = { 
            ...caboDModelTemplate, 
            key: "Boca6",
            loc: "0 0", // Posição do segundo cabo (200px à direita do primeiro)  
         
        }};

        if (this.VetorBocas[0].BOCA7!=" ") {
          Boca7 = { 
            ...caboModelTemplate, 
            key: "Boca7",
            loc: "0 0", // Posição do segundo cabo (200px à direita do primeiro)  
         
        }};

        if (this.VetorBocas[0].BOCA8!=" ") {
          Boca8 = { 
            ...caboDModelTemplate, 
            key: "Boca8",
            loc: "0 0", // Posição do segundo cabo (200px à direita do primeiro)  
         
        }};
        
       

        // Configurando o LinkTemplate para conexões entre cabos
        // Modificando para que as conexões liguem diretamente aos portos
        this.diagram.linkTemplate =
          new go.Link({
            routing:  go.Routing.Orthogonal ,  // Conexões ortogonais (90 graus)
            curve: go.Curve.None,
            corner: 1,
            toShortLength: 1,
            reshapable: true,
            resegmentable: true,                    
            // Essencial: conecções de porta para porta (não do centro do nó)
            fromEndSegmentLength: 5,
            toEndSegmentLength: 5,
            // Adicione validação de conexão para respeitar os limites
            relinkableFrom: true,
            relinkableTo: true
          })
          .add(
            new go.Shape({
              strokeWidth: 3.5,
              stroke: "#2196F3"
            })
          )
          .add(
            new go.Shape({  // Seta na ponta da linha
              toArrow: "Standard",
              stroke: null,
              fill: "#2F4F4F",
              scale: 0.8
            })
          );
        
                 


        const model = new go.GraphLinksModel({

      // Importante: uso explícito das propriedades da porta
        linkFromPortIdProperty: "fromPort",
        linkToPortIdProperty: "toPort",
        
        
        
      });

        // Configurando os nós no modelo


        //model.nodeDataArray = [Boca1, Boca2, Boca3];
        // Filtre valores nulos antes de adicioná-los ao array
        model.nodeDataArray = [Boca1, Boca2, Boca3, Boca4, Boca5, Boca6, Boca7, Boca8].filter(boca => boca !== null );
        
        model.linkDataArray = [];  // Inicialmente sem conexões
        
        // Atribuindo o modelo ao diagrama
        this.diagram.model = model;


        
        //this.carregarConexoesBocas();


        //=================================detectar conexoes==========================================
        //=================================//=================================//======================

        this.diagram.addDiagramListener("LinkDrawn", (e: go.DiagramEvent) => {
          const link = e.subject as go.Link;

          // Verificar se o objeto clicado é realmente um link
          if (!(link instanceof go.Link)) return;
          
          // Obtendo os nós (cabos) de origem e destino
          const fromNode = link.fromNode;
          const toNode = link.toNode;
          
          // Obtendo as portas de origem e destino
          const fromPort = link.fromPort;
          const toPort = link.toPort;

          if (fromNode && toNode && fromPort && toPort) {
            // Obtendo os números das portas (F1, F2, etc)
            const fromPortNumber = fromPort.portId;
            const toPortNumber = toPort.portId;
            
            // Obtendo os identificadores dos cabos
            const fromCableKey = fromNode.data.key;
            const toCableKey = toNode.data.key;

            console.log("Nova Conexão Detectada:");
            console.log("  Cabo Origem:", fromCableKey);
            console.log("  Porta Origem:", fromPortNumber);
            console.log("  Cabo Destino:", toCableKey);
            console.log("  Porta Destino:", toPortNumber);

          }});

        //=================================//=================================//=================================
        //=================================     
       



        // Aplicar o flip horizontal ao cabo2 após o diagrama ser inicializado
        // Verificar e manipular o cabo2 após inicialização
        setTimeout(() => {
          // Métodos alternativos para encontrar o nó
          if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
          let node1 = this.diagram!.findNodeForKey("Boca1");
          
          if (node1) {
            console.log("Node cabo1 encontrado via findNodeForKey:", node1);
            
                        console.log("Aplicando transformação ao cabo1");
                        node1.resizable=true;
                        node1.rotatable=true; 
                        node1.scale=1;
                        node1.movable=true;
                        node1.position=new go.Point(-400,-1100);

                        node1.data.labelText = this.VetorBocas[0].BOCA1 + "__Boca:1";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}}

                          



          }
                        
          
          // Método 2: Como alternativa, usando findNodeForKey
          let node2 = this.diagram!.findNodeForKey("Boca2");
          if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
          
          if (node2) {
            console.log("Node cabo2 encontrado via findNodeForKey:", node2);
                        console.log("Aplicando transformação ao cabo2");
                        node2.resizable=true;
                        node2.rotatable=true;
                        node2.movable=true;
                        node2.position=new go.Point(400,-1100);
                        node2.scale=1;                        
                        
                          node2.data.labelText = this.VetorBocas[0].BOCA2 + "__Boca:2";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}}

                          
                        



                        }
                      
                    


            let node3 = this.diagram!.findNodeForKey("Boca3");             

            if (node3) {
            console.log("Node cabo3 encontrado via findNodeForKey:", node3);
            if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo3");
                        node3.resizable=true;
                        node3.rotatable=true;
                        node3.scale=1;  
                        node3.position=new go.Point(-600,-300);
                        node3.data.labelText = this.VetorBocas[0].BOCA3 + "__Boca:3";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             

                            
            
          } 
          
          
          let node4 = this.diagram!.findNodeForKey("Boca4");             

            if (node4) {
            console.log("Node cabo4 encontrado via findNodeForKey:", node4);
            if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo3");
                        node4.resizable=true;
                        node4.rotatable=true;
                        node4.scale=1;  
                        node4.position=new go.Point(600,-300);
                        node4.data.labelText = this.VetorBocas[0].BOCA4 + "__Boca:4";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node5 = this.diagram!.findNodeForKey("Boca5");             

            if (node5) {
            console.log("Node cabo5 encontrado via findNodeForKey:", node5);
            if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo3");
                        node5.resizable=true;
                        node5.rotatable=true;
                        node5.scale=1;  
                        node5.position=new go.Point(-400,200);
                        node5.data.labelText = this.VetorBocas[0].BOCA5 + "__Boca:5";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }

            let node6 = this.diagram!.findNodeForKey("Boca6");             

            if (node6) {
            console.log("Node cabo6 encontrado via findNodeForKey:", node6);
            if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo3");
                        node6.resizable=true;
                        node6.rotatable=true;
                        node6.scale=1;  
                        node6.position=new go.Point(400,200);
                        node6.data.labelText = this.VetorBocas[0].BOCA6 + "__Boca:6";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node7 = this.diagram!.findNodeForKey("Boca7");             

            if (node7) {
            console.log("Node cabo7 encontrado via findNodeForKey:", node7);
            if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo3");
                        node7.resizable=true;
                        node7.rotatable=true;
                        node7.scale=1;  
                        node7.position=new go.Point(-600,600);
                        node7.data.labelText = this.VetorBocas[0].BOCA7 + "__Boca:7";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node8 = this.diagram!.findNodeForKey("Boca8");             

            if (node8) {
            console.log("Node cabo7 encontrado via findNodeForKey:", node8);
            if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo3");
                        node8.resizable=true;
                        node8.rotatable=true;
                        node8.scale=1;  
                        node8.position=new go.Point(600,600);
                        node8.data.labelText = this.VetorBocas[0].BOCA8 + "__Boca:8";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }
          
            
          
          
             else {
            console.error("Não foi possível encontrar o cabo por nenhum método");
          }
        }, 100);

        
        

        console.log('Diagrama criado com dois cabos do modelo Cabo_12F_NAC com suporte a conexões específicas de porta');
        
        // Marcando como inicializado
        this.ngZone.run(() => {
          console.log('Diagrama inicializado com sucesso');
          this.diagramInitialized = true;
          this.initializationError = null;
          this.cdr.detectChanges();
                    
          // Criar conexões automáticas apenas uma vez após o diagrama estar pronto
          // e todos os nós terem sido configurados
          setTimeout(() => {
            if (!this.conexoesCriadas) {
              //this.criarConexoesAutomaticas();
              this.carregarConexoesBocas()
              //this.conexoesCriadas = true;
            }
          }, 1000);
        });
      });
    } catch (err: any) {
      console.error('Erro ao inicializar diagrama:', err);
      this.initializationError = err.message || 'Erro desconhecido';
      this.diagramInitialized = false;
      this.cdr.detectChanges();
    }
  }

  //===================================================== Função para criar conexões automáticas baseadas em dados da API
  private criarConexoesAutomaticas() {
    console.log("Criando conexões automáticas");
    
    // Verificar se todas as bocas necessárias foram carregadas antes de criar conexões
    const bocasNecessarias = [1, 2, 3, 4];
    const todasBocasCarregadas = bocasNecessarias.every(boca => this.bocasCarregadas.has(boca));
    
    if (this.conexoesCriadas || !this.conexoesCarregadas.length || !todasBocasCarregadas) {
      console.log("Conexões já foram criadas anteriormente, pulando...");
      return;
    }
    
    

    const linkDataArray = this.conexoesCarregadas.map(conexao => {
      return {
        from: conexao.bocaOrigem,
        fromPort: conexao.fibraOrigem,
        to: conexao.bocaDestino,
        toPort: conexao.fibraDestino,
        routing: go.Link.Orthogonal,
        curve: go.Link.None,
        corner: 1
      };
    });



    

    // Verificar se já existem links com estas conexões
    if (this.diagram && this.diagram.model) {
      const model = this.diagram.model as go.GraphLinksModel;
      
      console.log(`Adicionando ${linkDataArray.length} novas conexões ao diagrama`);
      
      if (linkDataArray.length > 0) {
        model.addLinkDataCollection(linkDataArray);
        this.conexoesCriadas = true;
      
     
        this.conexoesCriadas = true;

        
      }
    }
  }

  //close() {
   // console.log('Fechando modal GoJS');
   // this.closeModal.emit();
  //}

  close(event?: MouseEvent) {
    if (event) {
      // Parar a propagação do evento para evitar que seja capturado por outros handlers
      event.preventDefault();
      event.stopPropagation();
      console.log('Evento de fechamento interceptado e propagação interrompida');
    }
    
    console.log('Fechando modal GoJS');
    // Certifique-se de executar a emissão do evento dentro da NgZone
    this.ngZone.run(() => {
      this.closeModal.emit();
    });
  }
  
}
