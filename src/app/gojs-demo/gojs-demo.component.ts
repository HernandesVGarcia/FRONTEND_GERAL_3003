import { AvoidsLinksRouter } from '../utils/AvoidsLinksRouter'

import { Component, 
  OnInit, 
  Input, 
  Output, 
  EventEmitter, 
  NgZone, 
  ChangeDetectorRef, 
  ElementRef, 
  ViewChild,
  AfterViewInit, 
  OnChanges,
  OnDestroy, 
  SimpleChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';  
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
import { Cabo72FNacDComponent } from '../Stencil/cabo-72-f-nac-d/cabo-72-f-nac-d.component';
import { Cabo72FNacComponent } from '../Stencil/cabo-72-f-nac/cabo-72-f-nac.component';

import { Splitter12Component } from '../Stencil/spliter-1-p2/spliter-1-p2.component';
import { Splitter14Component } from '../Stencil/spliter-1-p4/spliter-1-p4.component';
import { Splitter18Component } from '../Stencil/spliter-1-p8/spliter-1-p8.component';
import { Splitter116Component } from '../Stencil/spliter-1-p16/spliter-1-p16.component';
import { SplitterDesbComponent } from '../Stencil/spliter-desbalanceado/spliter-desbalanceado.component';

import { Cabo1FNacComponent} from '../Stencil/cabo-drop/cabo-drop.component'
import { Cabo1FNacDComponent} from '../Stencil/cabo-drop-d/cabo-drop-d.component'

import { BocasService } from '../servico/bocas.service';
import { ConexCabopb99Service} from '../servico/conex-cabopb99.service';
import { SplitterService} from '../servico/splitter.service'
import { Bocas} from '../modelo/Bocas'
import { Splitter} from '../modelo/Splitter'
import { Cabo_tipo} from '../modelo/Cabo_tipo'
import { ConexBocasService } from '../servico/conex-bocas.service';
import { ConexSpSpService } from '../servico/conex-sp-sp.service';
import { ConexSplitterService } from '../servico/conex-splitter.service';
import { ConexaoBoca } from '../modelo/ConexaoBoca';
import { ConexaoSplitter } from '../modelo/ConexaoSplitter';
import { Cabo_TipoService } from '../servico/cabo-tipo.service';
import { GojsDropComponent } from '../gojs-drop/gojs-drop.component';
import { ZoomPanTool } from '@syncfusion/ej2-angular-diagrams';
import { PopClienteService } from '../servico/pop-cliente.service';
import jsPDF from 'jspdf';

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

  // 🚀 NOVO - Flag apenas para controle de inicialização dos cabos
  private cabosInicializados: boolean = false;
  private splittersInicializados: boolean = false;
  // 🆕 NOVO - Flag para controle de inicialização dos drops
  private dropsInicializados: boolean = false;



  // Flag para controlar se as conexões já foram criadas
  // Novas propriedades para controle de conexões
  private conexoesCarregadas: ConexaoBoca[] = [];
  private conexoesCarregadasSpSp: ConexaoSplitter[] = [];
  private conexoesSPCarregadas: ConexaoSplitter[] = [];
  private conexoesPorBoca: Map<number, ConexaoBoca[]> = new Map();
  private conexoesPorSplitter: Map<number, ConexaoSplitter[]> = new Map();
  private bocasCarregadas: Set<number> = new Set();
  private splittersCarregados: Set<number> = new Set();
  private carregamentoEmAndamento: boolean = false;
  private carregamentoEmAndamento99: boolean = false;
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
  private cabo72FNAC_D: Cabo72FNacDComponent = new Cabo72FNacDComponent();
  private cabo72FNAC: Cabo72FNacComponent = new Cabo72FNacComponent();

    // Instâncias dos diferentes componentes de splitter
  private splitter12: Splitter12Component = new Splitter12Component();
  private splitter14: Splitter14Component = new Splitter14Component();
  private splitter18: Splitter18Component = new Splitter18Component();
  private splitter116: Splitter116Component = new Splitter116Component();
  private splitterDesb: SplitterDesbComponent = new SplitterDesbComponent();

  private cabo1FNAC: Cabo1FNacComponent= new Cabo1FNacComponent();
  private cabo1FNAC_D: Cabo1FNacDComponent= new Cabo1FNacDComponent();



  private avoidsLinksRouter: AvoidsLinksRouter | null = null;
  private Alinhamento : string = "D";
  VetorBocas:Bocas[]=[];
  VetorDrops_Sp:ConexaoBoca[]=[];
  VetorPopsCli:string[]=[]
  VetorSplitter: Splitter[]=[];
  VetorTipoCabos: Cabo_tipo[]=[];
  // 🆕 NOVO - Vetor para dados dos POPs
  VetorDadosPops: any[] = [];
  
 
  constructor(
     private ngZone: NgZone,
     private cdr: ChangeDetectorRef,
     private servicoBocas: BocasService,
     private serviceCabo99: ConexCabopb99Service,
     private servicoSplitter: SplitterService,
     private servicoTipoCabos : Cabo_TipoService ,
     private conexBocasService: ConexBocasService,
     private conexSplitterService: ConexSplitterService,
     private conexSpSpService:ConexSpSpService,
     private gojsDropComponent: GojsDropComponent,
     // 🆕 NOVO - Serviço para POPs
     private popClienteService: PopClienteService,
    ) {}


  //==============================================================================================================  

  ngOnInit(): void {
    /*
    console.log('GoJSDemo Component inicializado');
    /////////////////////setTimeout(() => {this.selecionar_Bocas()},1);// <-----função para ler bocas para desenhar cabos
    //this.selecionar_Splitters(); // <-----função para le splitters dentro da caixa

    
    ////////////setTimeout(() => {this.extraiTipoCabosBocas()},1000);

    // 🚀 NOVO - Carregamento async dos cabos apenas
    this.carregarDadosCabosAsync();
    

    setTimeout(() => {this.selecionar_Splitters()},500);

    */

    this.carregarDadosCompletosAsync();

    //setTimeout(() => {this.carregarConexoesBocas()},1);
    //setTimeout(() => {this.carregarConexoesSplitters()},3000);
    //setTimeout(() => {this.carregarConexoesBocas9798()},2000);
    //setTimeout(() => {this.selecionar_cabo99()},2000); 
    
        console.log('GoJSDemo Component inicializado');
        
  }

//================================================================================================

// 🚀 NOVA FUNÇÃO - Carregamento async de cabos e splitters
  private async carregarDadosCompletosAsync(): Promise<void> {
    try {
      this.mostrarCursorEspera();
      console.log('🚀 Iniciando carregamento async completo...');
      
      // 1. Carregar dados dos cabos
      await this.carregarDadosCabosAsync();
      
      // 2. Carregar dados dos splitters
      await this.carregarDadosSplittersAsync();

      // 3. Carregar drops (cabo 99)
      await this.gojsDropComponent.carregarDadosDropsAsync(this.VetorBocas, this.serviceCabo99);

      // 3. Carregar drops (cabo 99)
      //console.log('💧 Carregando drops...');
      //await this.carregarDadosDropsAsync(); //await this.selecionar_cabo99();
      
      /*
      // 3. Carregar conexões das bocas
      console.log('🔗 Carregando conexões das bocas...');
      await this.carregarConexoesBocas();
      
      // 4. Carregar conexões dos splitters
      console.log('🔗 Carregando conexões dos splitters...');
      await this.carregarConexoesSplitters();
      
      // 5. Carregar conexões entre splitters (bocas 97/98)
      console.log('🔗 Carregando conexões entre splitters...');
      await this.carregarConexoesBocas9798();
      
      // 6. Carregar drops (cabo 99)
      console.log('💧 Carregando drops...');
      await this.selecionar_cabo99();

      */
      
      console.log('✅ Carregamento completo concluído com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro durante o carregamento completo:', error);
    } finally {
      this.restaurarCursor();
    }
  }




// 🚀 NOVA FUNÇÃO - Carregamento async dos splitters
  private async carregarDadosSplittersAsync(): Promise<void> {
    try {
      console.log('🔧 Carregando dados dos splitters...');
      
      const retorno = await firstValueFrom(this.servicoSplitter.selecionar());
      this.VetorSplitter = retorno;
      
      console.log('✅ Dados dos splitters carregados:', this.VetorSplitter.length, 'splitters');
      
      // Se o diagrama já estiver inicializado, adicionar splitters
      if (this.diagram && !this.splittersInicializados) {
        console.log('🎨 Adicionando splitters ao diagrama...');
        this.adicionarSplittersAoDiagrama();
        this.splittersInicializados = true;
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar splitters:', error);
      throw error;
    }
  }

//================================================================================================


// 🚀 NOVA FUNÇÃO - Adicionar splitters ao diagrama
  private adicionarSplittersAoDiagrama(): void {
    if (!this.diagram || this.VetorSplitter.length === 0) {
      console.log('Não foi possível adicionar splitters: diagrama não inicializado ou não há splitters');
      return;
    }

    console.log('🎨 Adicionando splitters ao diagrama:', this.VetorSplitter);
    
    const model = this.diagram.model as go.GraphLinksModel;
    const splitterNodes: go.ObjectData[] = [];
    const posicoesSplitters: {id: string, x: number, y: number}[] = [];
    
    this.VetorSplitter.forEach((splitter, index) => {
      const posX = 350;
      const posY = 400 + (index * 400);

      posicoesSplitters.push({
        id: `Splitter${splitter.IDMETA || index}`,
        x: posX,
        y: posY
      });
      
      let splitterModelDefinition: go.ObjectData;
      
      switch (splitter.TIPO_SPLITTER) {
        case 12:
          splitterModelDefinition = this.splitter12.getModelDefinition();
          break;
        case 13:
          splitterModelDefinition = this.splitter14.getModelDefinition();
          break;
        case 14:
          splitterModelDefinition = this.splitter18.getModelDefinition();
          break;
        case 15:
          splitterModelDefinition = this.splitter116.getModelDefinition();
          break;
        default:
          splitterModelDefinition = this.splitterDesb.getModelDefinition();
          break;
      }
      
      const splitterNode: go.ObjectData = {
        ...splitterModelDefinition,
        key: `Splitter${splitter.IDMETA || index}`,
        labelText: `${splitter.LABEL || 'Splitter'} (${this.servicoSplitter.getSplitterName(splitter.TIPO_SPLITTER || 12)})`,
        loc: `${posX} ${posY}`,
        idmeta: splitter.IDMETA,
        tipoSplitter: splitter.TIPO_SPLITTER,
      };
      
      splitterNodes.push(splitterNode);
    });
    
    model.addNodeDataCollection(splitterNodes);
    
    setTimeout(() => {
      if (this.diagram) {
        posicoesSplitters.forEach(posicao => {
          const node = this.diagram?.findNodeForKey(posicao.id);
          if (node) {
            node.resizable = true;
            node.rotatable = true;
            node.movable = true;
            node.position = new go.Point(posicao.x, posicao.y);
          }
        });
      }
    }, 100);
  }


//================================================================================================






  // 🚀 NOVA FUNÇÃO - Carregamento async completo dos cabos
  private async carregarDadosCabosAsync(): Promise<void> {
    try {
      this.mostrarCursorEspera();
      console.log('🚀 Iniciando carregamento async dos dados dos cabos...');
      
      // 1. Carregar dados das bocas
      console.log('📡 Carregando dados das bocas...');
      await this.carregarBocasAsync();
      
      // 2. Carregar tipos de cabos baseado nas bocas
      console.log('🔧 Carregando tipos de cabos...');
      await this.carregarTiposCabosAsync();
      
      // 3. Adicionar cabos ao diagrama (se já estiver inicializado)
      if (this.diagram && !this.cabosInicializados) {
        console.log('🎨 Adicionando cabos ao diagrama...');
        this.adicionarCabosAoDiagrama();
        this.cabosInicializados = true;
      }
      
      console.log('✅ Carregamento dos cabos concluído com sucesso!');


      
    } catch (error) {
      console.error('❌ Erro durante o carregamento dos cabos:', error);
    } finally {
      this.restaurarCursor();
    }
  }
//================================================================================================================
// 🚀 NOVA FUNÇÃO - Carregar bocas de forma async
  private async carregarBocasAsync(): Promise<void> {
    try {
      const retorno = await firstValueFrom(this.servicoBocas.selecionar()); // serviço bocas usa observable
      
      if ('response' in retorno) {
        this.VetorBocas = (retorno as any).response;
      } else {
        this.VetorBocas = retorno as Bocas[];
      }
      
      console.log('✅ Dados das bocas carregados:', this.VetorBocas[0]?.BOCA1);
    } catch (error) {
      console.error('❌ Erro ao carregar Bocas:', error);
      throw error;
    }
  }
//=================================================================================================================

  // 🚀 NOVA FUNÇÃO - Carregar tipos de cabos de forma async
  private async carregarTiposCabosAsync(): Promise<void> {
    console.log('🔧 Extraindo capacidade das bocas...');
    
    const promessasTiposCabos: Promise<void>[] = [];

    // Processar todas as 18 bocas
    for (let i = 1; i <= 18; i++) {
      const bocaInfo = this.getBocaValue(i);
      if (bocaInfo && bocaInfo !== " ") {
        const promessa = this.processarBocaAsync(bocaInfo, i);
        promessasTiposCabos.push(promessa);
      }
    }

    // Aguardar todas as consultas de tipos de cabo terminarem
    await Promise.all(promessasTiposCabos);
    
    console.log('✅ Todos os tipos de cabo foram carregados');
  }

//=================================================================================================================


// 🚀 NOVA FUNÇÃO - Processar boca de forma async
  private async processarBocaAsync(bocaInfo: string, bocaNumero: number): Promise<void> {
    const match = bocaInfo.match(/cabo(\d+)[AB]/);
    if (match) {
      const idmetacabo = parseInt(match[1]);
      console.log(`🔍 Processando boca ${bocaNumero} com idmeta ${idmetacabo}...`);
      
      await this.selecionar_TipoCabos(idmetacabo, bocaNumero);
    } else {
      console.warn(`⚠️ Padrão de cabo não encontrado para boca ${bocaNumero}: ${bocaInfo}`);
    }
  }




//=================================================================================================================

// Helper para obter valor de BOCAX com tratamento de tipo
  private getBocaValue(bocaNum: number): string {
    if (this.VetorBocas && this.VetorBocas.length > 0) {
      const property = `BOCA${bocaNum}` as keyof Bocas;
      return this.VetorBocas[0][property] as string || "";
    }
    return "";
  }

//=================================================================================================================

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
 
  ngAfterViewInit(): void {
    if (this.isOpen) {
      console.log('AfterViewInit: Modal está aberto, inicializando diagrama');
      this.mostrarCursorEspera();
      //setTimeout(() => this.initializeDiagram(), 2000);
    }
    this.setupDragFunctionality();

    }

 /*   

*/

  //CABOS:=========================

  private isConexaoReversa(conexao: ConexaoBoca): boolean {
    return this.conexoesCarregadas.some(existente => 
      existente.bocaOrigem === conexao.bocaDestino &&
      existente.bocaDestino === conexao.bocaOrigem &&
      existente.fibraOrigem === conexao.fibraDestino &&
      existente.fibraDestino === conexao.fibraOrigem
    );
  }

  //CABOS:===========================================================================================================
  //===========================================================================================================

  private filtrarConexao(conexao: ConexaoBoca): boolean {
    const numeroBocaDestino = parseInt(conexao.bocaDestino.replace('Boca', ''));
    
    if (this.bocasProcessadas.has(numeroBocaDestino)) {
      return false;
    }
    
    return true;
  }


 //CABOS:==============================================================================================================
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

  //=======================================================================================================================

  



  //CABOS:==============================================================================================================
  //============================================================================================================== 
  //============== FUNÇÃO QUE LE A CONECTIVIDADE DAS BOCAS DA CAIXA ==============================================

  // Método atualizado para carregar conexões sequencialmente usando async/await
  async carregarConexoesBocas() {
    this.mostrarCursorEspera();
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
      console.log('this.diagram :',this.diagram, '!this.conexoesCriadas:', !this.conexoesCriadas, 'this.conexoesCarregadas.length :',this.conexoesCarregadas.length ) 
      
      if (this.diagram && !this.conexoesCriadas && this.conexoesCarregadas.length > 0) {
        //this.criarConexoesAutomaticas();
        await this.aguardarNosECriarConexoes();
      }
    } catch (error) {
      console.error('Erro durante o carregamento de conexões:', error);
    } finally {
      this.restaurarCursor();
      this.carregamentoEmAndamento = false;

    }
  }
//=========================================================================================================================
    // 🎯 Nova função para aguardar nós existirem no diagrama
  private async aguardarNosECriarConexoes(): Promise<void> {
    console.log('🎯 Aguardando nós existirem no diagrama...');
    
    const maxTentativas = 50;
    const intervalo = 100;
    
    for (let tentativa = 0; tentativa < maxTentativas; tentativa++) {

      console.log('==>tentativa :',tentativa );
      if (this.verificarSeNosExistem()) {
        console.log('🎯 Nós encontrados no diagrama, criando conexões...');
        this.criarConexoesAutomaticas();
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, intervalo));
    }
    
    console.warn('⚠️ Timeout aguardando nós no diagrama');
  }

//=========================================================================================================================
  // 🎯 Nova função para verificar se os nós necessários existem
  private verificarSeNosExistem(): boolean {
    if (!this.diagram) return false;
    
    const nosNecessarios = new Set<string>();
    
    this.conexoesCarregadas.forEach(conexao => {
      nosNecessarios.add(conexao.bocaOrigem);
      nosNecessarios.add(conexao.bocaDestino);
    });
    
    for (const nomeNo of nosNecessarios) {
      const no = this.diagram.findNodeForKey(nomeNo);
      if (!no) {
        console.log(`🎯 Nó ${nomeNo} ainda não existe no diagrama`);
        return false;
      }
    }
    
    console.log('🎯 Todos os nós necessários existem no diagrama');
    return true;
  }


     //CABOS=============================================seleciona modelo do cabo através do tipo ========================

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

      else if (capacidade <= 48) {
        // Para capacidades acima de 48, assumimos o modelo de 36 fibras
        return isLadoDireito 
          ? this.cabo48FNAC_D.getModelDefinition() 
          : this.cabo48FNAC.getModelDefinition();
      }

      else {
        // Para capacidades acima de 24, assumimos o modelo de 48 fibras
        return isLadoDireito 
          ? this.cabo72FNAC_D.getModelDefinition() 
          : this.cabo72FNAC.getModelDefinition();
      }

      

      
    }
  
  
//CABOS===================================================== Função para criar conexões automáticas baseadas em dados da API
  private criarConexoesAutomaticas() {
    console.log("Criando conexões automáticas");
    
    // Verificar se todas as bocas necessárias foram carregadas antes de criar conexões
    const bocasNecessarias = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
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



//SPLITTERS==============================================================================================================
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
        let splitterIdMeta = splitter.IDMETA;
        const splitterCapacidade = splitter.CAPACIDADE;

        console.log ('===> tamanho do VetorSplitter=', this.VetorSplitter.length)
        
        if (!this.splittersCarregados.has(splitterIdMeta || 0) && splitterIdMeta && splitterCapacidade) {
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
//SPLITTERS===================================DESENHA AS CONEXOES DOS SPLITTERS============================================================================
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
    console.log('conexoes splitters -->', linkDataArray)
    
    if (linkDataArray.length > 0) {
      model.addLinkDataCollection(linkDataArray);
      //this.conexoesSPCriadas = true;
    }
  }
}


//SPLITTERS===============================================================================================================
//==============================================================================================================

//=========================função que le Bocas 97 e 98 

// Método atualizado para carregar conexões sequencialmente usando async/await
  async carregarConexoesBocas9798() {

    


    console.log(`======> função que le Boca 97 e 98 recebidas:`);
    this.conexoesCarregadasSpSp = await this.conexSpSpService.selecionarConexoesEntreSplittersAsync();
    console.log(`======> Todas conexões da Boca 97 e 98 recebidas:`, this.conexoesCarregadasSpSp);
     
  
  if (!this.conexoesCarregadasSpSp || this.conexoesCarregadasSpSp.length === 0 ) {
    console.log("Conexões de splitter já foram criadas anteriormente ou não há conexões, pulando...");
    return;
  }
  
  const linkDataArray = this.conexoesCarregadasSpSp.map(conexaoSpSp => {
    return {
      from: conexaoSpSp.bocaOrigem,
      fromPort: conexaoSpSp.fibraOrigem,
      to: conexaoSpSp.bocaDestino,
      toPort: conexaoSpSp.fibraDestino,
      routing: go.Link.Orthogonal,
      curve: go.Link.None,
      corner: 1
    };
  });

  // Verificar se já existem links com estas conexões
  if (this.diagram && this.diagram.model) {
    const model = this.diagram.model as go.GraphLinksModel;
    
    console.log(`Adicionando ${linkDataArray.length} novas conexões de splitter ao diagrama ${this.conexoesCarregadasSpSp[0].bocaOrigem}`);
    


    if (linkDataArray.length > 0) {
      model.addLinkDataCollection(linkDataArray);
      //this.conexoesSPCriadas = true;
    }
  }
}

  
//========================permite movimentar o modal===========================================================================================================

  private setupDragFunctionality(): void {
    setTimeout(() => {

      console.log('entrou em setupDragFunctionality');
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

  //==========================permite movimentar o modal========================================================================================================

  private dragStart(event: MouseEvent): void {
    // Verificamos se o evento ocorreu no cabeçalho (não necessário, mas adicionado por segurança)
    console.log('entrou em dragStart');
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

  //==========================permite movimentar o modal========================================================================================================

  private dragMove(event: MouseEvent): void {

    //console.log('entrou em dragMove');
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

  //================================================================================================================================

  private setTranslate(xPos: number, yPos: number, el: HTMLElement): void {
    if (el) {
      el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
  }

//SPLITTER====================================================================================================== 
/*
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
        setTimeout(() => this.carregarConexoesSplitters(), 300);
      }
    },
    error: (erro) => {
      console.error('Erro ao carregar Splitters:', erro);
    }
  });
}



//SPLITTER======================================================================================================
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
        case 1:
          splitterModelDefinition = this.splitterDesb.getModelDefinition();
          break
        case 2:
          splitterModelDefinition = this.splitterDesb.getModelDefinition();
          break
        case 3:
          splitterModelDefinition = this.splitterDesb.getModelDefinition();
          break
        case 4:
          splitterModelDefinition = this.splitterDesb.getModelDefinition();
          break
        case 5:
          splitterModelDefinition = this.splitterDesb.getModelDefinition();
          break
        case 6:
          splitterModelDefinition = this.splitterDesb.getModelDefinition();
          break
        case 7:
          splitterModelDefinition = this.splitterDesb.getModelDefinition();
          break
        case 8:
          splitterModelDefinition = this.splitterDesb.getModelDefinition();
          break
        case 9:
          splitterModelDefinition = this.splitterDesb.getModelDefinition();
          break
        case 10:
          splitterModelDefinition = this.splitterDesb.getModelDefinition();
          break
        case 11:
          splitterModelDefinition = this.splitterDesb.getModelDefinition();
          break
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
          splitterModelDefinition = this.splitter12.getModelDefinition();
          break;
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

    
 }
  }, 100);

}
*/

//DIAGRAMA=============================================================================================================
  private updateDiagramLayout(): void {
    if (this.diagram) {
      console.log('Atualizando layout do diagrama');
      // Removendo o terceiro argumento e passando apenas um booleano
      this.diagram.layoutDiagram(true);
    }
  }

//====================================================================================================================
// 🔄 MANTIDA - Função para adicionar cabos ao diagrama
  private adicionarCabosAoDiagrama(): void {
    if (!this.diagram) {
      console.error('Diagrama não está inicializado');
      return;
    }

    console.log('🎨 Adicionando cabos ao diagrama com dados completos...');
    
    const model = this.diagram.model as go.GraphLinksModel;
    const cabosParaAdicionar: go.ObjectData[] = [];

   


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
      let Drop1: go.ObjectData | null = null;

      /*
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
          
      */

       
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
          if (this.VetorTipoCabos.length >= 8 && this.VetorTipoCabos[7]) {
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

        // -----------------------------------------------define MODELO cabo BOCA09 --------------------------------------

        if (this.VetorBocas[0].BOCA9 !== " ") {
          if (this.VetorTipoCabos.length >= 9 && this.VetorTipoCabos[8]) {
            const capacidade = this.VetorTipoCabos[8].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 9: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, false);
            
            Boca9 = { 
              ...modeloSelecionado, 
              key: "Boca9",
              loc: "0 0"
            };
          } else {
            console.log('Boca 9: Capacidade não disponível, usando modelo padrão 24F');
            Boca9 = { 
              ...this.cabo24FNAC.getModelDefinition(), 
              key: "Boca9",
              loc: "0 0"
            };
          }
        }


        // -----------------------------------------------define MODELO cabo BOCA010 --------------------------------------

        if (this.VetorBocas[0].BOCA10 !== " ") {
          if (this.VetorTipoCabos.length >= 10 && this.VetorTipoCabos[9]) {
            const capacidade = this.VetorTipoCabos[9].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 10: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, true);
            
            Boca10 = { 
              ...modeloSelecionado, 
              key: "Boca10",
              loc: "0 0"
            };
          } else {
            console.log('Boca 10: Capacidade não disponível, usando modelo padrão 24F');
            Boca10 = { 
              ...this.cabo24FNAC.getModelDefinition(), 
              key: "Boca10",
              loc: "0 0"
            };
          }
        }

        // -----------------------------------------------define MODELO cabo BOCA011 --------------------------------------

        if (this.VetorBocas[0].BOCA11 !== " ") {
          if (this.VetorTipoCabos.length >= 11 && this.VetorTipoCabos[10]) {
            const capacidade = this.VetorTipoCabos[10].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 11: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, false);
            
            Boca11 = { 
              ...modeloSelecionado, 
              key: "Boca11",
              loc: "0 0"
            };
          } else {
            console.log('Boca 11: Capacidade não disponível, usando modelo padrão 24F');
            Boca11 = { 
              ...this.cabo24FNAC.getModelDefinition(), 
              key: "Boca11",
              loc: "0 0"
            };
          }
        }

        // -----------------------------------------------define MODELO cabo BOCA012 --------------------------------------

        if (this.VetorBocas[0].BOCA12 !== " ") {
          if (this.VetorTipoCabos.length >= 12 && this.VetorTipoCabos[11]) {
            const capacidade = this.VetorTipoCabos[11].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 12: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, true);
            
            Boca12 = { 
              ...modeloSelecionado, 
              key: "Boca12",
              loc: "0 0"
            };
          } else {
            console.log('Boca 12: Capacidade não disponível, usando modelo padrão 24F');
            Boca12 = { 
              ...this.cabo24FNAC.getModelDefinition(), 
              key: "Boca12",
              loc: "0 0"
            };
          }
        }
       
       


 // -----------------------------------------------define MODELO cabo BOCA013 --------------------------------------

        if (this.VetorBocas[0].BOCA13 !== " ") {
          if (this.VetorTipoCabos.length >= 13 && this.VetorTipoCabos[12]) {
            const capacidade = this.VetorTipoCabos[12].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 13: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, true);
            
            Boca13 = { 
              ...modeloSelecionado, 
              key: "Boca13",
              loc: "0 0"
            };
          } else {
            console.log('Boca 13: Capacidade não disponível, usando modelo padrão 24F');
            Boca13 = { 
              ...this.cabo24FNAC.getModelDefinition(), 
              key: "Boca13",
              loc: "0 0"
            };
          }
        }
       
      
 


 // -----------------------------------------------define MODELO cabo BOCA014 --------------------------------------

        if (this.VetorBocas[0].BOCA14 !== " ") {
          if (this.VetorTipoCabos.length >= 14 && this.VetorTipoCabos[13]) {
            const capacidade = this.VetorTipoCabos[13].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 14: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, true);
            
            Boca14 = { 
              ...modeloSelecionado, 
              key: "Boca14",
              loc: "0 0"
            };
          } else {
            console.log('Boca 14: Capacidade não disponível, usando modelo padrão 24F');
            Boca14 = { 
              ...this.cabo24FNAC.getModelDefinition(), 
              key: "Boca14",
              loc: "0 0"
            };
          }
        }
       
      
 

 // -----------------------------------------------define MODELO cabo BOCA015 --------------------------------------

        if (this.VetorBocas[0].BOCA15 !== " ") {
          if (this.VetorTipoCabos.length >= 15 && this.VetorTipoCabos[14]) {
            const capacidade = this.VetorTipoCabos[14].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 15: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, true);
            
            Boca15 = { 
              ...modeloSelecionado, 
              key: "Boca15",
              loc: "0 0"
            };
          } else {
            console.log('Boca 15: Capacidade não disponível, usando modelo padrão 24F');
            Boca15 = { 
              ...this.cabo24FNAC.getModelDefinition(), 
              key: "Boca15",
              loc: "0 0"
            };
          }
        }
       
      
 

 // -----------------------------------------------define MODELO cabo BOCA016 --------------------------------------

        if (this.VetorBocas[0].BOCA16 !== " ") {
          if (this.VetorTipoCabos.length >= 16 && this.VetorTipoCabos[15]) {
            const capacidade = this.VetorTipoCabos[15].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 16: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, true);
            
            Boca16 = { 
              ...modeloSelecionado, 
              key: "Boca16",
              loc: "0 0"
            };
          } else {
            console.log('Boca 16: Capacidade não disponível, usando modelo padrão 24F');
            Boca16 = { 
              ...this.cabo24FNAC.getModelDefinition(), 
              key: "Boca16",
              loc: "0 0"
            };
          }
        }
       
      
 

 // -----------------------------------------------define MODELO cabo BOCA017 --------------------------------------

        if (this.VetorBocas[0].BOCA17 !== " ") {
          if (this.VetorTipoCabos.length >= 17 && this.VetorTipoCabos[16]) {
            const capacidade = this.VetorTipoCabos[16].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 17: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, true);
            
            Boca17 = { 
              ...modeloSelecionado, 
              key: "Boca17",
              loc: "0 0"
            };
          } else {
            console.log('Boca 17: Capacidade não disponível, usando modelo padrão 24F');
            Boca17 = { 
              ...this.cabo24FNAC.getModelDefinition(), 
              key: "Boca17",
              loc: "0 0"
            };
          }
        }
       
      

 // -----------------------------------------------define MODELO cabo BOCA018 --------------------------------------

        if (this.VetorBocas[0].BOCA18 !== " ") {
          if (this.VetorTipoCabos.length >= 18 && this.VetorTipoCabos[17]) {
            const capacidade = this.VetorTipoCabos[17].capacidade || 0; // Use default 0 if undefined
            console.log(`Boca 18: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, true);
            
            Boca18 = { 
              ...modeloSelecionado, 
              key: "Boca18",
              loc: "0 0"
            };
          } else {
            console.log('Boca 18: Capacidade não disponível, usando modelo padrão 24F');
            Boca18 = { 
              ...this.cabo24FNAC.getModelDefinition(), 
              key: "Boca18",
              loc: "0 0"
            };
          }
        }


        const nodeDataArray = [
          Boca1, Boca2, Boca3, Boca4, Boca5, Boca6, Boca7, Boca8, Boca9, Boca10, Boca11, Boca12, Boca13, Boca14, Boca15, Boca16, Boca17, Boca18, Splitter1, Drop1,
          { key: "title", category: "text", text: "Diagrama da Caixa", loc: "-500 -200",layerName: "Foreground" }
        ].filter(node => node !== null);


        model.nodeDataArray = nodeDataArray


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
                        console.log("Aplicando transformação ao cabo4");
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
                        console.log("Aplicando transformação ao cabo5");
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
                        console.log("Aplicando transformação ao cabo6");
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
                        console.log("Aplicando transformação ao cabo7");
                        node7.resizable=true;
                        node7.rotatable=true;
                        node7.scale=1;  
                        node7.position=new go.Point(-200,1600);
                        node7.data.labelText = this.VetorBocas[0].BOCA7 + "__Boca:7";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node8 = this.diagram!.findNodeForKey("Boca8");             

            if (node8) {
            console.log("Node cabo8 encontrado via findNodeForKey:", node8);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo8");
                        node8.resizable=true;
                        node8.rotatable=true;
                        node8.scale=1;  
                        node8.position=new go.Point(1000,1600);
                        node8.data.labelText = this.VetorBocas[0].BOCA8 + "__Boca:8";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node9 = this.diagram!.findNodeForKey("Boca9");             

            if (node9) {
            console.log("Node cabo9 encontrado via findNodeForKey:", node9);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo9");
                        node9.resizable=true;
                        node9.rotatable=true;
                        node9.scale=1;  
                        node9.position=new go.Point(-200,1900);
                        node9.data.labelText = this.VetorBocas[0].BOCA9 + "__Boca:9";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node10 = this.diagram!.findNodeForKey("Boca10");             

            if (node10) {
            console.log("Node cabo10 encontrado via findNodeForKey:", node10);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo10");
                        node10.resizable=true;
                        node10.rotatable=true;
                        node10.scale=1;  
                        node10.position=new go.Point(1000,1900);
                        node10.data.labelText = this.VetorBocas[0].BOCA10 + "__Boca:10";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node11 = this.diagram!.findNodeForKey("Boca11");             

            if (node11) {
            console.log("Node cabo11 encontrado via findNodeForKey:", node11);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo11");
                        node11.resizable=true;
                        node11.rotatable=true;
                        node11.scale=1;  
                        node11.position=new go.Point(0,2400);
                        node11.data.labelText = this.VetorBocas[0].BOCA11 + "__Boca:11";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }

            let node12 = this.diagram!.findNodeForKey("Boca12");             

            if (node12) {
            console.log("Node cabo12 encontrado via findNodeForKey:", node12);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo12");
                        node12.resizable=true;
                        node12.rotatable=true;
                        node12.scale=1;  
                        node12.position=new go.Point(1000,2400);
                        node12.data.labelText = this.VetorBocas[0].BOCA12 + "__Boca:12";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node13 = this.diagram!.findNodeForKey("Boca13");             

            if (node13) {
            console.log("Node cabo13 encontrado via findNodeForKey:", node13);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo13");
                        node13.resizable=true;
                        node13.rotatable=true;
                        node13.scale=1;  
                        node13.position=new go.Point(1000,2400);
                        node13.data.labelText = this.VetorBocas[0].BOCA13 + "__Boca:13";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node14 = this.diagram!.findNodeForKey("Boca14");             

            if (node14) {
            console.log("Node cabo14 encontrado via findNodeForKey:", node14);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo14");
                        node14.resizable=true;
                        node14.rotatable=true;
                        node14.scale=1;  
                        node14.position=new go.Point(1000,2400);
                        node14.data.labelText = this.VetorBocas[0].BOCA14 + "__Boca:14";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node15 = this.diagram!.findNodeForKey("Boca15");             

            if (node15) {
            console.log("Node cabo15 encontrado via findNodeForKey:", node15);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo15");
                        node15.resizable=true;
                        node15.rotatable=true;
                        node15.scale=1;  
                        node15.position=new go.Point(-200,2800);
                        node15.data.labelText = this.VetorBocas[0].BOCA15 + "__Boca:15";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node16 = this.diagram!.findNodeForKey("Boca16");             

            if (node16) {
            console.log("Node cabo16 encontrado via findNodeForKey:", node16);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo16");
                        node16.resizable=true;
                        node16.rotatable=true;
                        node16.scale=1;  
                        node16.position=new go.Point(1200,2800);
                        node16.data.labelText = this.VetorBocas[0].BOCA16 + "__Boca:16";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node17 = this.diagram!.findNodeForKey("Boca17");             

            if (node17) {
            console.log("Node cabo17 encontrado via findNodeForKey:", node17);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo17");
                        node17.resizable=true;
                        node17.rotatable=true;
                        node17.scale=1;  
                        node17.position=new go.Point(0,3200);
                        node17.data.labelText = this.VetorBocas[0].BOCA17 + "__Boca:17";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node18 = this.diagram!.findNodeForKey("Boca18");             

            if (node18) {
            console.log("Node cabo18 encontrado via findNodeForKey:", node18);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo18");
                        node18.resizable=true;
                        node18.rotatable=true;
                        node18.scale=1;  
                        node18.position=new go.Point(1000,3200);
                        node18.data.labelText = this.VetorBocas[0].BOCA18 + "__Boca:18";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }
          
                     
          
             else {
            console.error("Não foi possível encontrar o cabo por nenhum método");

          }
          // Finaliza a transação única
          
        }, 1);


     
  }



//DIAGRAMA=============================================================================================================
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
          this.diagram.commandHandler.zoomToFit
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
        this.diagram.commandHandler.zoomFactor=1.3;
        this.diagram.scrollToRect=scroll;
        //this.diagram.zoomToFit;;
        //this.diagram.toolManager.showToolTip;

        // Inicializar e configurar o AvoidsLinksRouter
        this.avoidsLinksRouter = new AvoidsLinksRouter();
        this.avoidsLinksRouter.epsilonDistance = 15; // Distância entre links paralelos
        this.avoidsLinksRouter.linkSpacing=30;
        this.diagram.routers.push(this.avoidsLinksRouter);
        console.log('AvoidsLinksRouter adicionado ao diagrama');



        // Adicionar listener para capturar movimento de cabos
        this.diagram.addDiagramListener("SelectionMoved", (e: go.DiagramEvent) => {
          e.subject.each((node: go.Node) => {
            if (node.data.key && node.data.key.startsWith("Boca")) {
              console.log(`Cabo ${node.data.key} movido para:`, {
                x: node.position.x,
                y: node.position.y
              });
            }
          });
        });






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
        caboTemplateMap.add("cabo72F_D", this.cabo72FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo72F", this.cabo72FNAC.getNodeTemplate());
        caboTemplateMap.add("splitter12", this.splitter12.getNodeTemplate());
        // Adicionar templates para cada tipo de splitter
        caboTemplateMap.add("splitter12", this.splitter12.getNodeTemplate());
        caboTemplateMap.add("splitter14", this.splitter14.getNodeTemplate());
        caboTemplateMap.add("splitter18", this.splitter18.getNodeTemplate());
        caboTemplateMap.add("splitter116", this.splitter116.getNodeTemplate());
        caboTemplateMap.add("splitterDesb", this.splitterDesb.getNodeTemplate());
        
        // Adicionar templates genéricos para outros tipos de splitters que ainda não têm componentes específicos
        caboTemplateMap.add("splitter132", this.splitter116.getNodeTemplate());
        caboTemplateMap.add("splitter164", this.splitter116.getNodeTemplate());
        caboTemplateMap.add("splitter1128", this.splitter116.getNodeTemplate());
        caboTemplateMap.add("splitter1256", this.splitter116.getNodeTemplate());

        // Adicionar templates DROPS
        caboTemplateMap.add("cabo1F", this.cabo1FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo1F_D", this.cabo1FNAC_D.getNodeTemplate());

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

        
  
        model.linkDataArray = [];  // Inicialmente sem conexões
        
        // Atribuindo o modelo ao diagrama
        this.diagram.model = model;

        
        

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
       


        

        console.log('Diagrama criado com dois cabos do modelo Cabo_12F_NAC com suporte a conexões específicas de porta');
        
        // Marcando como inicializado
        this.ngZone.run(() => {
          console.log('Diagrama inicializado com sucesso');
          this.diagramInitialized = true;
          this.initializationError = null;
          this.cdr.detectChanges();

          // 🚀 NOVO - Tentar adicionar cabos se já carregados
          if (this.VetorBocas.length > 0 && this.VetorTipoCabos.length > 0 && !this.cabosInicializados) {
            console.log('🎨 Dados dos cabos já carregados, adicionando ao diagrama...');
            this.adicionarCabosAoDiagrama();
            this.cabosInicializados = true;
          }
                    
          

          // 🚀 NOVO - Tentar adicionar splitters se já carregados
          if (this.VetorSplitter.length > 0 && !this.splittersInicializados) {
            console.log('🎨 Dados dos splitters já carregados, adicionando ao diagrama...');
            this.adicionarSplittersAoDiagrama();
            this.splittersInicializados = true;
          }

          console.log('drop this.diagram:',this.diagram,'!this.gojsDropComponent.isDropsInicializados:',!this.gojsDropComponent.isDropsInicializados,'this.gojsDropComponent.vetorPopsCli.length > 0',this.gojsDropComponent.vetorPopsCli.length > 0)
          

          // 🔄 NOVO - Adicionar drops usando o serviço
          setTimeout(() => {
          if (this.diagram && !this.gojsDropComponent.isDropsInicializados && this.gojsDropComponent.vetorPopsCli.length > 0) {
            console.log('🎨 Adicionando drops ao diagrama...');
            
            this.gojsDropComponent.adicionarDropsAoDiagrama(this.diagram);
          } 
          },100);

          


       /*   if (this.diagram && !this.dropsInicializados && this.VetorPopsCli.length > 0) {
        console.log('🎨 Adicionando drops ao diagrama...');
        this.adicionarDropsAoDiagrama();
        this.dropsInicializados = true;
      }
      */
          


        });


      });
    } catch (err: any) {
      console.error('Erro ao inicializar diagrama:', err);
      this.initializationError = err.message || 'Erro desconhecido';
      this.diagramInitialized = false;
      this.cdr.detectChanges();
    }



    setTimeout(() => {this.carregarConexoesBocas()},1); 
    setTimeout(() => {this.carregarConexoesSplitters()},1);
    setTimeout(() => {this.carregarConexoesBocas9798()},1);
    //setTimeout(() => {this.adicionarDropsAoDiagrama()},1);
    
    //setTimeout(() => {this.selecionar_cabo99()},1); 


  }


  
  //SISTEMA============================================================================================================

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


  private mostrarCursorEspera(): void {
  document.body.style.cursor = 'wait';
  if (this.diagramDiv?.nativeElement) {
    this.diagramDiv.nativeElement.style.cursor = 'wait';
  }
}

private restaurarCursor(): void {
  document.body.style.cursor = 'default';
  if (this.diagramDiv?.nativeElement) {
    this.diagramDiv.nativeElement.style.cursor = 'default';
  }
}

  exportarDiagramaParaPDF(): void {
    if (!this.diagram) {
      console.log('Diagrama não está disponível para exportação');
      return;
    }

    try {
      console.log('Iniciando exportação do diagrama para PDF...');
      
      // Capturar imagem do diagrama com alta qualidade
      const imageData = this.diagram.makeImageData({
        scale: 2,
        maxSize: new go.Size(6000, 7000),
        type: "image/png",
        background: "white",
        returnType: "string"
      });

      if (!imageData) {
        console.error('Falha ao gerar imagem do diagrama');
        return;
      }

      // Criar PDF em formato landscape para melhor visualização
      //const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      // Dimensões da página A4 landscape: 297x210mm
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      
      // Calcular dimensões da imagem mantendo proporção
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - (margin * 2);
      
      // Adicionar título
      pdf.setFontSize(16);
      pdf.text('Diagrama de Conexões - FiberWorks', pageWidth / 2, 15, { align: 'center' });
      
      // Adicionar imagem
      pdf.addImage(imageData, 'PNG', margin, 25, maxWidth, maxHeight - 15);
      
      // Adicionar rodapé com data
      pdf.setFontSize(10);
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      pdf.text(`Gerado em: ${dataAtual}`, margin, pageHeight - 5);
      
      // Salvar o PDF
      const nomeArquivo = `diagrama-conexoes-${new Date().getTime()}.pdf`;
      pdf.save(nomeArquivo);
      
      console.log(`PDF exportado com sucesso: ${nomeArquivo}`);
      
    } catch (error) {
      console.error('Erro ao exportar diagrama para PDF:', error);
    }
  }
}
