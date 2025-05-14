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
import { Cabo6FNacDComponent } from '../Stencil/cabo-6-f-nac-d/cabo-6-f-nac-d.component';
import { Cabo6FNacComponent } from '../Stencil/cabo-6-f-nac/cabo-6-f-nac.component';
import { Cabo8FNacDComponent } from '../Stencil/cabo-8-f-nac-d/cabo-8-f-nac-d.component';
import { Cabo8FNacComponent } from '../Stencil/cabo-8-f-nac/cabo-8-f-nac.component';
import { Cabo12FNacComponent } from '../Stencil/cabo-12-f-nac/cabo-12-f-nac.component';
import { Cabo12FNacDComponent } from '../Stencil/cabo-12-f-nac-d/cabo-12-f-nac-d.component';
import { Cabo24FNacComponent } from '../Stencil/cabo-24-f-nac/cabo-24-f-nac.component';
import { Cabo24FNacDComponent } from '../Stencil/cabo-24-f-nac-d/cabo-24-f-nac-d.component';
import { Cabo36FNacComponent } from '../Stencil/cabo-36-f-nac/cabo-36-f-nac.component';
import { Cabo36FNacDComponent } from '../Stencil/cabo-36-f-nac-d/cabo-36-f-nac-d.component';
import { Cabo48FNacDComponent } from '../Stencil/cabo-48-f-nac-d/cabo-48-f-nac-d.component';
import { Cabo48FNacComponent } from '../Stencil/cabo-48-f-nac/cabo-48-f-nac.component';
import { Splitter12Component } from '../Stencil/spliter-1-p2/spliter-1-p2.component';
import { Splitter14Component } from '../Stencil/spliter-1-p4/spliter-1-p4.component';
import { Splitter18Component } from '../Stencil/spliter-1-p8/spliter-1-p8.component';
import { Splitter116Component } from '../Stencil/spliter-1-p16/spliter-1-p16.component';
import { BocasService } from '../servico/bocas.service';
import { SplitterService} from '../servico/splitter.service'
import { Bocas} from '../modelo/Bocas'
import { Splitter} from '../modelo/Splitter'
import { Cabo_tipo} from '../modelo/Cabo_tipo'
import { ConexBocasService } from '../servico/conex-bocas.service';
import { ConexSplitterService } from '../servico/conex-splitter.service';
import { ConexaoBoca } from '../modelo/ConexaoBoca';
import { ConexaoSplitter } from '../modelo/ConexaoSplitter';
import { Cabo_TipoService } from '../servico/cabo-tipo.service';

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
  private conexoesSPCarregadas: ConexaoSplitter[] = []
  private conexoesPorBoca: Map<number, ConexaoBoca[]> = new Map();
  private conexoesPorSplitter: Map<number, ConexaoSplitter[]> = new Map();
  private bocasCarregadas: Set<number> = new Set();
  private splittersCarregados: Set<number> = new Set();
  private carregamentoEmAndamento: boolean = false;
  private carregamentoSPEmAndamento: boolean = false;
  private conexoesCriadas: boolean = false;
  private conexoesSPCriadas: boolean = false;
  
  private bocasProcessadas: Set<number> = new Set();
  private splittersProcessados: Set<number> = new Set();

  private modalElement: HTMLElement | null = null;
  private modalContentElement: HTMLElement | null = null;
  private modalHeaderElement: HTMLElement | null = null; // Novo: referência para o cabeçalho
  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;


  private cabo6FNAC_D: Cabo6FNacDComponent = new Cabo6FNacDComponent();
  private cabo6FNAC: Cabo6FNacComponent = new Cabo6FNacComponent();
  private cabo8FNAC_D: Cabo8FNacDComponent = new Cabo8FNacDComponent();
  private cabo8FNAC: Cabo8FNacComponent = new Cabo8FNacComponent();
  private cabo12FNAC: Cabo12FNacComponent = new Cabo12FNacComponent();
  private cabo12FNAC_D: Cabo12FNacDComponent = new Cabo12FNacDComponent();
  private cabo24FNAC: Cabo24FNacComponent = new Cabo24FNacComponent();
  private cabo24FNAC_D: Cabo24FNacDComponent = new Cabo24FNacDComponent();
  private cabo36FNAC: Cabo36FNacComponent = new Cabo36FNacComponent();
  private cabo36FNAC_D: Cabo36FNacDComponent = new Cabo36FNacDComponent();
  private cabo48FNAC_D: Cabo48FNacDComponent = new Cabo48FNacDComponent();
  private cabo48FNAC: Cabo48FNacComponent = new Cabo48FNacComponent();
    // Instâncias dos diferentes componentes de splitter
  private splitter12: Splitter12Component = new Splitter12Component();
  private splitter14: Splitter14Component = new Splitter14Component();
  private splitter18: Splitter18Component = new Splitter18Component();
  private splitter116: Splitter116Component = new Splitter116Component();




  private avoidsLinksRouter: AvoidsLinksRouter | null = null;
  private Alinhamento : string = "D";
  VetorBocas:Bocas[]=[];
  VetorSplitter: Splitter[]=[];
  VetorTipoCabos: Cabo_tipo[]=[];
 
  
 
  constructor(
     private ngZone: NgZone,
     private cdr: ChangeDetectorRef,
     private servicoBocas: BocasService,
     private servicoSplitter: SplitterService,
     private servicoTipoCabos : Cabo_TipoService ,
     private conexBocasService: ConexBocasService,
     private conexSplitterService: ConexSplitterService,
    ) {}

  ngOnInit(): void {
    console.log('GoJSDemo Component inicializado');
    setTimeout(() => {this.selecionar_Bocas()},1);// <-----função para ler bocas para desenhar cabos
    //this.selecionar_Splitters(); // <-----função para le splitters dentro da caixa

    setTimeout(() => {this.extraiTipoCabosBocas()},1000);
    setTimeout(() => {this.carregarConexoesBocas()},1000);
    setTimeout(() => {this.selecionar_Splitters()},1000);
    setTimeout(() => {this.carregarConexoesSplitters()},5000);


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

  //===========================================================================================================
  //===========================================================================================================

  private filtrarConexao(conexao: ConexaoBoca): boolean {
    const numeroBocaDestino = parseInt(conexao.bocaDestino.replace('Boca', ''));
    
    if (this.bocasProcessadas.has(numeroBocaDestino)) {
      return false;
    }
    
    return true;
  }


 //==============================================================================================================
 //============================================================================================================== 
       
  async selecionar_TipoCabos(idmeta_cabo: number, bocaNumero: number) {
    try {
      console.log(`Iniciando consulta de tipo de cabos para boca ${bocaNumero} com idmeta ${idmeta_cabo}...`);
      
      // Obter tipos de cabo da API
      const tipos = await this.servicoTipoCabos.selecionarAsync(idmeta_cabo);
      
      console.log(`Resposta da API para boca ${bocaNumero}:`, tipos);
      
      // Verificar se há dados retornados
      if (tipos && tipos.length > 0) {
        // Modificação importante: Sempre inserir no índice correspondente ao número da boca - 1
        const targetIndex = bocaNumero - 1;
        
        // Se o array não for grande o suficiente, precisamos expandi-lo
        while (this.VetorTipoCabos.length <= targetIndex) {
          this.VetorTipoCabos.push({
            capacidade: 0,
            codigo: 0,
            tubo: 0
          });
        }
        
        // Agora podemos definir diretamente no índice correto
        this.VetorTipoCabos[targetIndex] = {
          capacidade: tipos[0].capacidade,
          codigo: tipos[0].codigo,
          tubo: tipos[0].tubo
        };
        
        console.log(`Tipo de cabo para boca ${bocaNumero} armazenado no índice ${targetIndex}:`, 
          this.VetorTipoCabos[targetIndex].capacidade);
      } else {
        console.warn(`Nenhum tipo de cabo encontrado para a boca ${bocaNumero}`);
      }
    } catch (error) {
      console.error(`Erro ao consultar tipo de cabo para a boca ${bocaNumero}:`, error);
    }
  }

  // Helper para obter valor de BOCAX com tratamento de tipo
  private getBocaValue(bocaNum: number): string {
    if (this.VetorBocas && this.VetorBocas.length > 0) {
      const property = `BOCA${bocaNum}` as keyof Bocas;
      return this.VetorBocas[0][property] as string || "";
    }
    return "";
  }



  //==============================================================================================================
  //============================================================================================================== 
  //============== FUNÇÃO QUE LE A CONECTIVIDADE DAS BOCAS DA CAIXA ==============================================

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
      const bocasParaCarregar = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] as const;
      
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

//===============================================================================================================
 //==============================================================================================================

//==============================================================================================================
  //============================================================================================================== 
  //============== FUNÇÃO QUE LE A CONECTIVIDADE DOS SPLITTERS DA CAIXA ==============================================

  // Método atualizado para carregar conexões sequencialmente usando async/await
  async carregarConexoesSplitters() {
    console.log('-->INICIO DA FUNÇÃO CARREGAR CONEXAO SPLITTER');
    if (this.carregamentoSPEmAndamento) {
      console.log('Carregamento de conexões Splitters já em andamento, aguardando...');
      return;
    }

    if (!this.VetorSplitter || this.VetorSplitter.length === 0) {
      console.log('Nenhum splitter encontrado para carregar conexões');
      return;
    }

    this.carregamentoSPEmAndamento = true;
    console.log('Iniciando carregamento sequencial das conexões de splitters...');

    try {
      // Percorrer cada splitter no vetor
      for (let i = 0; i < this.VetorSplitter.length; i++) {
        const splitter = this.VetorSplitter[i];
        const splitterIdMeta = splitter.IDMETA;
        const splitterCapacidade = splitter.CAPACIDADE;
        
        if (!this.splittersCarregados.has(splitterCapacidade || 0) && splitterIdMeta && splitterCapacidade) {
          console.log(`Carregando conexões do splitter ${i+1} (capacidade ${splitterCapacidade}, idMeta ${splitterIdMeta})...`);
          
          const todasSPConexoes = await this.conexSplitterService.selecionarAsync(splitterCapacidade, splitterIdMeta);
          console.log(`Conexões do Splitter ${i+1} recebidas:`, todasSPConexoes);
          
          // Armazenar as conexões deste splitter
          this.conexoesPorSplitter.set(splitterCapacidade, todasSPConexoes);
          this.splittersCarregados.add(splitterCapacidade);

          // Acumular conexões em um único array
          this.conexoesSPCarregadas = [
            ...this.conexoesSPCarregadas,
            ...todasSPConexoes
          ];

          this.splittersProcessados.add(splitterCapacidade);
        }
      }
      
      console.log('Todos os splitters foram processados:', this.splittersCarregados.size);
      console.log('Total de conexões de splitters carregadas:', this.conexoesSPCarregadas.length);
      
      if (this.diagram && !this.conexoesSPCriadas && this.conexoesSPCarregadas.length > 0) {
        this.criarConexoesSplitterAutomaticas();
      }
    } catch (error) {
      console.error('Erro durante o carregamento de conexões dos splitters:', error);
    } finally {
      this.carregamentoSPEmAndamento = false;
    }
  }
//===================================DESENHA AS CONEXOES DOS SPLITTERS============================================================================
 //==============================================================================================================


 private criarConexoesSplitterAutomaticas() {
  console.log("Criando conexões automáticas para splitters");
  
  if (this.conexoesSPCriadas || !this.conexoesSPCarregadas.length) {
    console.log("Conexões de splitter já foram criadas anteriormente ou não há conexões, pulando...");
    return;
  }
  
  const linkDataArray = this.conexoesSPCarregadas.map(conexao => {
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
    
    console.log(`Adicionando ${linkDataArray.length} novas conexões de splitter ao diagrama`);
    
    if (linkDataArray.length > 0) {
      model.addLinkDataCollection(linkDataArray);
      this.conexoesSPCriadas = true;
    }
  }
}


//===============================================================================================================
 //==============================================================================================================












  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      console.log('Modal está sendo aberto');
      if (!this.diagramInitialized || !this.diagram) {
        // Aguardar a renderização do DOM
        setTimeout(() => {
          console.log('Iniciando diagrama após abertura do modal');
          this.initializeDiagram();
        }, 2000); // a partir de 200 o tempo, começa a nao dar tempo de ter a capacidade do cabo lida
      } else {
        console.log('Diagrama já inicializado, apenas atualizando');
        this.updateDiagramLayout();
      }
    }
  }

  //===============================================================================================================
 //==============================================================================================================

  ngAfterViewInit(): void {
    if (this.isOpen) {
      console.log('AfterViewInit: Modal está aberto, inicializando diagrama');
      //setTimeout(() => this.initializeDiagram(), 2000);
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




//=======================================
  private updateDiagramLayout(): void {
    if (this.diagram) {
      console.log('Atualizando layout do diagrama');
      // Removendo o terceiro argumento e passando apenas um booleano
      this.diagram.layoutDiagram(true);
    }
  }

  //=============================================================================================================
 //==============================================================================================================
  //======================================= inicicialise diagrama ===============================================
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
          this.diagram.allowVerticalScroll=true;
          this.diagram.allowHorizontalScroll=true;
          this.diagram.scrollMode
          //this.diagram.allowZoom=false;
          
          console.log('Removendo diagrama existente');
          this.diagram.div = null;
          this.diagram = null;
          // Resetar a flag quando o diagrama for recriado
          this.conexoesCriadas = false;
        }

        // Criando um novo diagrama
        this.diagram = new go.Diagram(this.diagramDiv?.nativeElement, {
          "undoManager.isEnabled": true,
          //"toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
          "toolManager.mouseWheelBehavior": go.WheelMode.Zoom,
          "grid.visible": true,
          "grid.gridCellSize": new go.Size(20, 20),
          allowDrop: true,
          allowLink: true,
          allowRelink: true,
          //"initialAutoScale": go.Diagram.Uniform,
          "initialAutoScale": go.AutoScale.Uniform,
          "initialContentAlignment": go.Spot.Center,
          "maxScale": 3,
          "minScale": 0.09,
          padding: new go.Margin(200, 40, 40, 40),
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
        this.avoidsLinksRouter.epsilonDistance = 15; // Distância entre links paralelos
        this.avoidsLinksRouter.linkSpacing=30;
        this.diagram.routers.push(this.avoidsLinksRouter);
        console.log('AvoidsLinksRouter adicionado ao diagrama');



        // Definindo o modelo de nós para o diagrama
        // Agora usando o nodeTemplate definido no componente do modelo

        const caboTemplateMap = new go.Map<string, go.Node>();
        caboTemplateMap.add("cabo6F_D", this.cabo6FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo6F", this.cabo6FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo8F_D", this.cabo8FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo8F", this.cabo8FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo", this.cabo12FNAC.getNodeTemplate());
        caboTemplateMap.add("caboD", this.cabo12FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo24F", this.cabo24FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo24F_D", this.cabo24FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo36F", this.cabo36FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo36F_D", this.cabo36FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo48F_D", this.cabo48FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo48F", this.cabo48FNAC.getNodeTemplate());
        caboTemplateMap.add("splitter12", this.splitter12.getNodeTemplate());
        // Adicionar templates para cada tipo de splitter
        caboTemplateMap.add("splitter12", this.splitter12.getNodeTemplate());
        caboTemplateMap.add("splitter14", this.splitter14.getNodeTemplate());
        caboTemplateMap.add("splitter18", this.splitter18.getNodeTemplate());
        caboTemplateMap.add("splitter116", this.splitter116.getNodeTemplate());
        
        // Adicionar templates genéricos para outros tipos de splitters que ainda não têm componentes específicos
        caboTemplateMap.add("splitter132", this.splitter116.getNodeTemplate());
        caboTemplateMap.add("splitter164", this.splitter116.getNodeTemplate());
        caboTemplateMap.add("splitter1128", this.splitter116.getNodeTemplate());
        caboTemplateMap.add("splitter1256", this.splitter116.getNodeTemplate());
        

        // Obtendo a definição do modelo do componente Cabo_12F_NAC
        this.diagram.nodeTemplateMap = caboTemplateMap;

        
       

        
       // Adicionar um template para o texto do título --- texto adicionado para o diagram sempre esta abaixo da marca dagua
       this.diagram.nodeTemplateMap.add("text",
        new go.Node("Spot")
          .add(
            new go.TextBlock({
              font: "bold 16pt sans-serif",
              stroke: "white",
              margin: 10,
              editable: false,
              
            })
            .bind("text")
          )
          // Garantir que o nó de texto não seja movido pelas outras partes do diagrama
          .bind(new go.Binding("position", "loc", go.Point.parse).makeTwoWay(go.Point.stringify))
          // Desabilitar a movimentação pelo usuário
          //.movable(false)
         
      );
        


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
      let Splitter1: go.ObjectData | null = null;//= this.splitter12.getModelDefinition();


      //setTimeout(() => {this.extraiTipoCabosBocas()},500)

      if (this.VetorTipoCabos[0]) {setTimeout(() => {console.log('capacidade do cabo na boca 1',this.VetorTipoCabos[0].capacidade);},1000)}
      if (this.VetorTipoCabos[1]) {setTimeout(() => {console.log('capacidade do cabo na boca 2',this.VetorTipoCabos[1].capacidade);},1000)}
        if (this.VetorTipoCabos[2]) {setTimeout(() => {console.log('capacidade do cabo na boca 3',this.VetorTipoCabos[2].capacidade);},1000)}
          if (this.VetorTipoCabos[3]) {setTimeout(() => {console.log('capacidade do cabo na boca 4',this.VetorTipoCabos[3].capacidade);},1000)}
            if (this.VetorTipoCabos[4]) {setTimeout(() => {console.log('capacidade do cabo na boca 5',this.VetorTipoCabos[4].capacidade);},1000)}
              if (this.VetorTipoCabos[5]) {setTimeout(() => {console.log('capacidade do cabo na boca 6',this.VetorTipoCabos[5].capacidade);},1000)}
                if (this.VetorTipoCabos[6]) {setTimeout(() => {console.log('capacidade do cabo na boca 7',this.VetorTipoCabos[6].capacidade);},1000)}
                  if (this.VetorTipoCabos[7]) {setTimeout(() => {console.log('capacidade do cabo na boca 8',this.VetorTipoCabos[7].capacidade);},1000)}

      //  if (this.VetorBocas[0].BOCA1!=" ") {
          


       
        // -----------------------------------------------define MODELO cabo BOCA01 --------------------------------------
        if (this.VetorBocas[0].BOCA1 !== " ") {
        // Verifica se temos informações de capacidade para esta boca
        if (this.VetorTipoCabos.length >= 1 && this.VetorTipoCabos[0]) {
          const capacidade = this.VetorTipoCabos[0].capacidade || 0;
          console.log(`Boca 1: Usando capacidade ${capacidade} para selecionar modelo`);
          
          // Selecionar o modelo com base na capacidade
          const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, false);
          
          Boca1 = { 
            ...modeloSelecionado, 
            key: "Boca1",
            loc: "0 0"
          };
        } else {
          console.log('Boca 1: Capacidade não disponível, usando modelo padrão 36F');
          Boca1 = { 
            ...this.cabo36FNAC.getModelDefinition(), 
            key: "Boca1",
            loc: "0 0"
          };
        }
      }



        // -----------------------------------------------define MODELO cabo BOCA02 --------------------------------------
        if (this.VetorBocas[0].BOCA2 !== " ") {
          if (this.VetorTipoCabos.length >= 2 && this.VetorTipoCabos[1]) {
            const capacidade = this.VetorTipoCabos[1].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 2: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, true);
            
            Boca2 = { 
              ...modeloSelecionado, 
              key: "Boca2",
              loc: "400 0"
            };
          } else {
            console.log('Boca 2: Capacidade não disponível, usando modelo padrão 36F_D');
            Boca2 = { 
              ...this.cabo36FNAC_D.getModelDefinition(), 
              key: "Boca2",
              loc: "400 0"
            };
          }
        }




        // -----------------------------------------------define MODELO cabo BOCA03 --------------------------------------
        if (this.VetorBocas[0].BOCA3 !== " ") {
          if (this.VetorTipoCabos.length >= 3 && this.VetorTipoCabos[2]) {
            const capacidade = this.VetorTipoCabos[2].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 3: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, false);
            
            Boca3 = { 
              ...modeloSelecionado, 
              key: "Boca3",
              loc: "0 0"
            };
          } else {
            console.log('Boca 3: Capacidade não disponível, usando modelo padrão 24F');
            Boca3 = { 
              ...this.cabo24FNAC.getModelDefinition(), 
              key: "Boca3",
              loc: "0 0"
            };
          }
        }

        // -----------------------------------------------define MODELO cabo BOCA04 --------------------------------------
        if (this.VetorBocas[0].BOCA4 !== " ") {
          if (this.VetorTipoCabos.length >= 4 && this.VetorTipoCabos[3]) {
            const capacidade = this.VetorTipoCabos[3].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 4: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, true);
            
            Boca4 = { 
              ...modeloSelecionado, 
              key: "Boca4",
              loc: "0 0"
            };
          } else {
            console.log('Boca 4: Capacidade não disponível, usando modelo padrão 24F');
            Boca4 = { 
              ...this.cabo24FNAC.getModelDefinition(), 
              key: "Boca4",
              loc: "0 0"
            };
          }
        }

        // -----------------------------------------------define MODELO cabo BOCA05 --------------------------------------

        if (this.VetorBocas[0].BOCA5 !== " ") {
          if (this.VetorTipoCabos.length >= 5 && this.VetorTipoCabos[4]) {
            const capacidade = this.VetorTipoCabos[4].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 5: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, false);
            
            Boca5 = { 
              ...modeloSelecionado, 
              key: "Boca5",
              loc: "0 0"
            };
          } else {
            console.log('Boca 5: Capacidade não disponível, usando modelo padrão 24F');
            Boca5 = { 
              ...this.cabo24FNAC.getModelDefinition(), 
              key: "Boca5",
              loc: "0 0"
            };
          }
        }

        // -----------------------------------------------define MODELO cabo BOCA06 --------------------------------------

        if (this.VetorBocas[0].BOCA6 !== " ") {
          if (this.VetorTipoCabos.length >= 6 && this.VetorTipoCabos[5]) {
            const capacidade = this.VetorTipoCabos[5].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 6: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, true);
            
            Boca6 = { 
              ...modeloSelecionado, 
              key: "Boca6",
              loc: "0 0"
            };
          } else {
            console.log('Boca 6: Capacidade não disponível, usando modelo padrão 24F');
            Boca6 = { 
              ...this.cabo24FNAC.getModelDefinition(), 
              key: "Boca6",
              loc: "0 0"
            };
          }
        }

        // -----------------------------------------------define MODELO cabo BOCA07 --------------------------------------

        if (this.VetorBocas[0].BOCA7 !== " ") {
          if (this.VetorTipoCabos.length >= 7 && this.VetorTipoCabos[6]) {
            const capacidade = this.VetorTipoCabos[6].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 7: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, false);
            
            Boca7 = { 
              ...modeloSelecionado, 
              key: "Boca7",
              loc: "0 0"
            };
          } else {
            console.log('Boca 7: Capacidade não disponível, usando modelo padrão 24F');
            Boca7 = { 
              ...this.cabo24FNAC.getModelDefinition(), 
              key: "Boca7",
              loc: "0 0"
            };
          }
        }

        // -----------------------------------------------define MODELO cabo BOCA08 --------------------------------------

        if (this.VetorBocas[0].BOCA8 !== " ") {
          if (this.VetorTipoCabos.length >= 7 && this.VetorTipoCabos[7]) {
            const capacidade = this.VetorTipoCabos[7].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 8: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, true);
            
            Boca8 = { 
              ...modeloSelecionado, 
              key: "Boca8",
              loc: "0 0"
            };
          } else {
            console.log('Boca 8: Capacidade não disponível, usando modelo padrão 24F');
            Boca8 = { 
              ...this.cabo24FNAC.getModelDefinition(), 
              key: "Boca8",
              loc: "0 0"
            };
          }
        }
       

      


 // -----------------------------------------------
        // Configurando o LinkTemplate para conexões entre cabos
        // Modificando para que as conexões liguem diretamente aos portos
        this.diagram.linkTemplate =
          new go.Link({
            routing:go.Routing.AvoidsNodes, // go.Routing.Orthogonal ,  // Conexões ortogonais (90 graus)
            curve: go.Curve.None, // fica confuso as opçoes
            corner: 8,
            toShortLength: 5,
            reshapable: true,
            resegmentable: true,                    
            // Essencial: conecções de porta para porta (não do centro do nó)
            fromEndSegmentLength: 25,
            toEndSegmentLength: 25,
            // Adicione validação de conexão para respeitar os limites
            relinkableFrom: true,
            relinkableTo: true,
            
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
        // comentei em 030525 para por texto digrama da caixa model.nodeDataArray = [Boca1, Boca2, Boca3, Boca4, Boca5, Boca6, Boca7, Boca8].filter(boca => boca !== null );


        const nodeDataArray = [
          Boca1, Boca2, Boca3, Boca4, Boca5, Boca6, Boca7, Boca8, Splitter1,
          { key: "title", category: "text", text: "Diagrama da Caixa", loc: "-500 -200",layerName: "Foreground" }
        ].filter(node => node !== null);
        
        model.nodeDataArray = nodeDataArray;


        
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
          if (!this.diagram) return;
          // Métodos alternativos para encontrar o nó
          //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}

          

          this.diagram.startTransaction("Aplicar transformações iniciais");
          let node1 = this.diagram!.findNodeForKey("Boca1");
          
          if (node1) {
            console.log("Node cabo1 encontrado via findNodeForKey:", node1);
            
                        console.log("Aplicando transformação ao cabo1");
                        
                        node1.resizable=true;
                        node1.rotatable=true; 
                        node1.scale=1;
                        node1.movable=true;
                        node1.position=new go.Point(0,0);
                        this.diagram?.commitTransaction()

                        node1.data.labelText = this.VetorBocas[0].BOCA1 + "__Boca:1";
                          this.diagram.updateAllTargetBindings();  // força atualização do bindin}}

                          



          }
                        
          
          // Método 2: Como alternativa, usando findNodeForKey
          let node2 = this.diagram!.findNodeForKey("Boca2");
          //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
          
          if (node2) {
            console.log("Node cabo2 encontrado via findNodeForKey:", node2);
                        console.log("Aplicando transformação ao cabo2");
                        node2.resizable=true;
                        node2.rotatable=true;
                        node2.movable=true;
                        node2.position=new go.Point(800,0);
                        node2.scale=1;                        
                        
                          node2.data.labelText = this.VetorBocas[0].BOCA2 + "__Boca:2";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}}

                          
                        



                        }
                      
                    


            let node3 = this.diagram!.findNodeForKey("Boca3");             

            if (node3) {
            console.log("Node cabo3 encontrado via findNodeForKey:", node3);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo3");
                        node3.resizable=true;
                        node3.rotatable=true;
                        node3.scale=1;  
                        node3.position=new go.Point(-200,700);
                        node3.data.labelText = this.VetorBocas[0].BOCA3 + "__Boca:3";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             

                            
            
          } 
          
          
          let node4 = this.diagram!.findNodeForKey("Boca4");             

            if (node4) {
            console.log("Node cabo4 encontrado via findNodeForKey:", node4);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo3");
                        node4.resizable=true;
                        node4.rotatable=true;
                        node4.scale=1;  
                        node4.position=new go.Point(1000,700);
                        node4.data.labelText = this.VetorBocas[0].BOCA4 + "__Boca:4";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node5 = this.diagram!.findNodeForKey("Boca5");             

            if (node5) {
            console.log("Node cabo5 encontrado via findNodeForKey:", node5);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo3");
                        node5.resizable=true;
                        node5.rotatable=true;
                        node5.scale=1;  
                        node5.position=new go.Point(0,1200);
                        node5.data.labelText = this.VetorBocas[0].BOCA5 + "__Boca:5";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }

            let node6 = this.diagram!.findNodeForKey("Boca6");             

            if (node6) {
            console.log("Node cabo6 encontrado via findNodeForKey:", node6);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo3");
                        node6.resizable=true;
                        node6.rotatable=true;
                        node6.scale=1;  
                        node6.position=new go.Point(800,1200);
                        node6.data.labelText = this.VetorBocas[0].BOCA6 + "__Boca:6";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node7 = this.diagram!.findNodeForKey("Boca7");             

            if (node7) {
            console.log("Node cabo7 encontrado via findNodeForKey:", node7);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo3");
                        node7.resizable=true;
                        node7.rotatable=true;
                        node7.scale=1;  
                        node7.position=new go.Point(-200,1600);
                        node7.data.labelText = this.VetorBocas[0].BOCA7 + "__Boca:7";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node8 = this.diagram!.findNodeForKey("Boca8");             

            if (node8) {
            console.log("Node cabo7 encontrado via findNodeForKey:", node8);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo3");
                        node8.resizable=true;
                        node8.rotatable=true;
                        node8.scale=1;  
                        node8.position=new go.Point(1000,1600);
                        node8.data.labelText = this.VetorBocas[0].BOCA8 + "__Boca:8";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }
          
            
          
          
             else {
            console.error("Não foi possível encontrar o cabo por nenhum método");

          }
          // Finaliza a transação única
          
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
            // Desenhar splitters se já estiverem carregados
            if (this.VetorSplitter && this.VetorSplitter.length > 0) {
              this.desenharSplitters();
            }
          }, 300);
        });
      });
    } catch (err: any) {
      console.error('Erro ao inicializar diagrama:', err);
      this.initializationError = err.message || 'Erro desconhecido';
      this.diagramInitialized = false;
      this.cdr.detectChanges();
    }
  }







//=====================================================================================
  private extraiTipoCabosBocas() {

   

       console.log('Extraindo capacidade das bocas');
    
       // Processamento para Boca 1
       this.processarBoca(this.VetorBocas[0].BOCA1, 1);
       
       // Processamento para Boca 2
       this.processarBoca(this.VetorBocas[0].BOCA2, 2);
       
       // Processamento para Boca 3
       this.processarBoca(this.VetorBocas[0].BOCA3, 3);

       // Processamento para Boca 4
       this.processarBoca(this.VetorBocas[0].BOCA4, 4);

       // Processamento para Boca 5
       this.processarBoca(this.VetorBocas[0].BOCA5, 5);

       // Processamento para Boca 6
       this.processarBoca(this.VetorBocas[0].BOCA6, 6);

       // Processamento para Boca 7
       this.processarBoca(this.VetorBocas[0].BOCA7, 7);

       // Processamento para Boca 8
       this.processarBoca(this.VetorBocas[0].BOCA8, 8);
     }
     
     private processarBoca(bocaInfo: string | undefined, bocaNumero: number) {
       if (!bocaInfo || bocaInfo === " ") {
         console.log(`Boca ${bocaNumero} está vazia ou indefinida`);
         return;
       }
       
       const match = bocaInfo.match(/cabo(\d+)[AB]/);
       if (match) {
         const idmetacabo = parseInt(match[1]);
         console.log(`Este é o idmeta do cabo boca ${bocaNumero}:`, idmetacabo);
         this.selecionar_TipoCabos(idmetacabo, bocaNumero);
       } else {
         console.warn(`Padrão de cabo não encontrado para boca ${bocaNumero}: ${bocaInfo}`);
       }
     }

     //=============================================seleciona modelo do cabo através do tipo ========================

     private selecionarModeloCaboPorCapacidade(capacidade: number , isLadoDireito: boolean): go.ObjectData {
      console.log(`Selecionando modelo para cabo com capacidade ${capacidade}, lado direito: ${isLadoDireito}`);
      
     


      if (capacidade <= 6) {
        return isLadoDireito 
          ? this.cabo6FNAC_D.getModelDefinition() 
          : this.cabo6FNAC.getModelDefinition();
      } 
      if (capacidade <= 8) {
        return isLadoDireito 
          ? this.cabo8FNAC_D.getModelDefinition() 
          : this.cabo8FNAC.getModelDefinition();
      } 
      if (capacidade <= 12) {
        return isLadoDireito 
          ? this.cabo12FNAC_D.getModelDefinition() 
          : this.cabo12FNAC.getModelDefinition();
      } 
      else if (capacidade <= 24) {
        return isLadoDireito 
          ? this.cabo24FNAC_D.getModelDefinition() 
          : this.cabo24FNAC.getModelDefinition();
      } 
      else if (capacidade <= 36) {
        // Para capacidades acima de 24, assumimos o modelo de 36 fibras
        return isLadoDireito 
          ? this.cabo36FNAC_D.getModelDefinition() 
          : this.cabo36FNAC.getModelDefinition();
      }
      else {
        // Para capacidades acima de 24, assumimos o modelo de 48 fibras
        return isLadoDireito 
          ? this.cabo48FNAC_D.getModelDefinition() 
          : this.cabo48FNAC.getModelDefinition();
      }
    }
  
  


  //===================================================== Função para criar conexões automáticas baseadas em dados da API
  private criarConexoesAutomaticas() {
    console.log("Criando conexões automáticas");
    
    // Verificar se todas as bocas necessárias foram carregadas antes de criar conexões
    const bocasNecessarias = [1, 2, 3, 4, 5, 6, 7, 8];
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

// Adicionar o método para selecionar splitters
selecionar_Splitters() {
  console.log('Iniciando seleção de Splitters dentro da caixa...');
  
  this.servicoSplitter.selecionar().subscribe({
    next: (retorno) => {
      console.log('Splitters recebidos ---> :', retorno);
      this.VetorSplitter = retorno;
      
      // Se os splitters foram carregados e o diagrama já está inicializado, desenhar os splitters
      if (this.diagram && this.VetorSplitter.length > 0) {
        this.desenharSplitters();
        // Após desenhar os splitters, carregar suas conexões
        setTimeout(() => this.carregarConexoesSplitters(), 500);
      }
    },
    error: (erro) => {
      console.error('Erro ao carregar Splitters:', erro);
    }
  });
}

// Método para desenhar os splitters no diagrama
private desenharSplitters() {
  if (!this.diagram || this.VetorSplitter.length === 0) {
    console.log('--->Não foi possível desenhar splitters: diagrama não inicializado ou não há splitters');
    return;
  }

  console.log('--->Desenhando splitters no diagrama:', this.VetorSplitter);
  
 // this.diagram.startTransaction('Adicionar Splitters');

  this.diagram.layout = new go.Layout();

  const autoLayout = this.diagram.layout;
//const emptyLayout = new go.Layout();  // Layout que não faz nada
//emptyLayout.isInitial = false;
//emptyLayout.isOngoing = false;
//this.diagram.layout = emptyLayout;
  
  const model = this.diagram.model as go.GraphLinksModel;
  const splitterNodes: go.ObjectData[] = [];

  // Primeiro, calculamos as posições para cada splitter
  const posicoesSplitters: {id: string, x: number, y: number}[] = [];
  
  // Criar nós para cada splitter
  this.VetorSplitter.forEach((splitter, index) => {
    // Calcular posição dinâmica para não sobrepor os splitters
    const posX = 350 //+ (index * 100);
    const posY = 400 + (index * 400);
   

   // Armazenar a posição calculada para cada splitter
   posicoesSplitters.push({
    id: `Splitter${splitter.IDMETA || index}`,
    x: posX,
    y: posY
  });
    
    // Obter tipo de componente baseado no TIPO_SPLITTER
    const categoria = this.servicoSplitter.getSplitterComponentType(splitter.TIPO_SPLITTER || 12);
    
    console.log(`Splitter ${index} (ID: ${splitter.IDMETA}): usando categoria '${categoria}' para tipo ${splitter.TIPO_SPLITTER}`);
      
      // Obter o modelo adequado baseado no tipo de splitter
      let splitterModelDefinition: go.ObjectData;
      
      switch (splitter.TIPO_SPLITTER) {
        case 13:
          splitterModelDefinition = this.splitter14.getModelDefinition();
          break;
        case 14:
          splitterModelDefinition = this.splitter18.getModelDefinition();
          break;
        case 15:
          splitterModelDefinition = this.splitter116.getModelDefinition();
          break;
        case 16: // Usando modelo 1:16 para splitters maiores por enquanto
        case 17:
        case 18:
        case 19:
          splitterModelDefinition = this.splitter116.getModelDefinition();
          break;
        case 12:
        default:
          splitterModelDefinition = this.splitter12.getModelDefinition();
          break;
      }
      
      // Criar dados do nó com a definição de modelo adequada
      const splitterNode: go.ObjectData = {
        ...splitterModelDefinition,
      key: `Splitter${splitter.IDMETA || index}`,
      labelText: `${splitter.LABEL || 'Splitter'} (${this.servicoSplitter.getSplitterName(splitter.TIPO_SPLITTER || 12)})`,
      loc: `${posX} ${posY}`,
      //loc: "500  1300",
      idmeta: splitter.IDMETA,
      tipoSplitter: splitter.TIPO_SPLITTER,
      
    };
    
    splitterNodes.push(splitterNode);
  });
  
  // Adicionar nós ao modelo
  model.addNodeDataCollection(splitterNodes);
  
  // Configurar propriedades dos nós após adicioná-los
  
  setTimeout(() => {
    if (this.diagram){
    //splitterNodes.forEach(nodeData => {
     // const node = this.diagram?.findNodeForKey(nodeData['key']);
     // Aplicar as posições armazenadas para cada splitter
     posicoesSplitters.forEach(posicao => {
      const node = this.diagram?.findNodeForKey(posicao.id);
      if (node) {
        node.resizable = true;
        node.rotatable = true;
        node.movable = true;
        node.position=new go.Point(posicao.x,posicao.y)
        
      }
    });

    //this.diagram.layout = new go.ForceDirectedLayout({
    //  maxIterations: 200,
    //  defaultSpringLength: 100
    //})


    //this.diagram.layout =new go.TreeLayout({
    //  angle: 0,  // 0 = da esquerda para direita, 90 = de cima para baixo
    //  nodeSpacing: 200,
    //  layerSpacing: 800
   // })

   
    
   
 //   this.diagram.commitTransaction('Adicionar Splitters');
 }
  }, 100);

}
  
}
