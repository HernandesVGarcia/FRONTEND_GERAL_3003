import { AvoidsLinksRouter } from '../utils/AvoidsLinksRouter'

import { Component, 
  OnInit, 
  Inject, 
  NgZone, 
  ChangeDetectorRef, 
  ElementRef, 
  ViewChild,
  AfterViewInit, 
  OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';  
import { CommonModule } from '@angular/common';
import * as go from 'gojs';

import { Cabo1FNacComponent} from '../Stencil/cabo-drop/cabo-drop.component'
import { Cabo1FNacDComponent} from '../Stencil/cabo-drop-d/cabo-drop-d.component'
import { Cabo1FIntComponent } from '../Stencil/cabo-1-f-int/cabo-1-f-int.component';
import { Cabo1FIntDComponent } from '../Stencil/cabo-1-f-int-d/cabo-1-f-int-d.component';

import { Cabo2FNacComponent} from '../Stencil/cabo-2-f-nac/cabo-2-f-nac.component'
import { Cabo2FNacDComponent} from '../Stencil/cabo-2-f-nac-d/cabo-2-f-nac-d.component'
import { Cabo2FIntComponent } from '../Stencil/cabo-2-f-int/cabo-2-f-int.component';
import { Cabo2FIntDComponent } from '../Stencil/cabo-2-f-int-d/cabo-2-f-int-d.component';

import { Cabo4FNacDComponent } from '../Stencil/cabo-4-f-nac-d/cabo-4-f-nac-d.component';
import { Cabo4FNacComponent } from '../Stencil/cabo-4-f-nac/cabo-4-f-nac.component';
import { Cabo4FIntComponent } from '../Stencil/cabo-4-f-int/cabo-4-f-int.component';
import { Cabo4FIntDComponent } from '../Stencil/cabo-4-f-int-d/cabo-4-f-int-d.component';

import { Cabo6FNacDComponent } from '../Stencil/cabo-6-f-nac-d/cabo-6-f-nac-d.component';
import { Cabo6FNacComponent } from '../Stencil/cabo-6-f-nac/cabo-6-f-nac.component';
import { Cabo6FIntComponent } from '../Stencil/cabo-6-f-int/cabo-6-f-int.component';
import { Cabo6FIntDComponent } from '../Stencil/cabo-6-f-int-d/cabo-6-f-int-d.component';


import { Cabo8FNacDComponent } from '../Stencil/cabo-8-f-nac-d/cabo-8-f-nac-d.component';
import { Cabo8FNacComponent } from '../Stencil/cabo-8-f-nac/cabo-8-f-nac.component';
import { Cabo8FIntComponent } from '../Stencil/cabo-8-f-int/cabo-8-f-int.component';
import { Cabo8FIntDComponent } from '../Stencil/cabo-8-f-int-d/cabo-8-f-int-d.component';

import { Cabo12FNacComponent } from '../Stencil/cabo-12-f-nac/cabo-12-f-nac.component';
import { Cabo12FNacDComponent } from '../Stencil/cabo-12-f-nac-d/cabo-12-f-nac-d.component';
import { Cabo12FIntComponent } from '../Stencil/cabo-12-f-int/cabo-12-f-int.component';
import { Cabo12FIntDComponent } from '../Stencil/cabo-12-f-int-d/cabo-12-f-int-d.component';
import { Cabo12FNacTb12Component } from '../Stencil/cabo-12-f-nac-tb12/cabo-12-f-nac-tb12.component';
import { Cabo12FNacDTb12Component } from '../Stencil/cabo-12-f-nac-d-tb12/cabo-12-f-nac-d-tb12.component';
import { Cabo12FIntTb12Component } from '../Stencil/cabo-12-f-int-tb12/cabo-12-f-int-tb12.component';
import { Cabo12FIntDTb12Component } from '../Stencil/cabo-12-f-int-d-tb12/cabo-12-f-int-d-tb12.component';
import { Cabo12FNacTb2Component } from '../Stencil/cabo-12-f-nac-tb2/cabo-12-f-nac-tb2.component';
import { Cabo12FNacDTb2Component } from '../Stencil/cabo-12-f-nac-d-tb2/cabo-12-f-nac-d-tb2.component';
import { Cabo12FIntTb2Component } from '../Stencil/cabo-12-f-int-tb2/cabo-12-f-int-tb2.component';
import { Cabo12FIntDTb2Component } from '../Stencil/cabo-12-f-int-d-tb2/cabo-12-f-int-d-tb2.component';

import { Cabo24FNacComponent } from '../Stencil/cabo-24-f-nac/cabo-24-f-nac.component';
import { Cabo24FNacDComponent } from '../Stencil/cabo-24-f-nac-d/cabo-24-f-nac-d.component';
import { Cabo24FIntComponent } from '../Stencil/cabo-24-f-int/cabo-24-f-int.component';
import { Cabo24FIntDComponent } from '../Stencil/cabo-24-f-int-d/cabo-24-f-int-d.component';
import { Cabo24FNacTb24Component } from '../Stencil/cabo-24-f-nac-tb24/cabo-24-f-nac-tb24.component';
import { Cabo24FNacDTb24Component } from '../Stencil/cabo-24-f-nac-d-tb24/cabo-24-f-nac-d-tb24.component';
import { Cabo24FIntTb24Component } from '../Stencil/cabo-24-f-int-tb24/cabo-24-f-int-tb24.component';
import { Cabo24FIntDTb24Component } from '../Stencil/cabo-24-f-int-d-tb24/cabo-24-f-int-d-tb24.component';

import { Cabo36FNacComponent } from '../Stencil/cabo-36-f-nac/cabo-36-f-nac.component';
import { Cabo36FNacDComponent } from '../Stencil/cabo-36-f-nac-d/cabo-36-f-nac-d.component';
import { Cabo36FIntComponent } from '../Stencil/cabo-36-f-int/cabo-36-f-int.component';
import { Cabo36FIntDComponent } from '../Stencil/cabo-36-f-int-d/cabo-36-f-int-d.component';

import { Cabo48FNacDComponent } from '../Stencil/cabo-48-f-nac-d/cabo-48-f-nac-d.component';
import { Cabo48FNacComponent } from '../Stencil/cabo-48-f-nac/cabo-48-f-nac.component';
import { Cabo48FIntComponent } from '../Stencil/cabo-48-f-int/cabo-48-f-int.component';
import { Cabo48FIntDComponent } from '../Stencil/cabo-48-f-int-d/cabo-48-f-int-d.component';

import { Cabo72FNacDComponent } from '../Stencil/cabo-72-f-nac-d/cabo-72-f-nac-d.component';
import { Cabo72FNacComponent } from '../Stencil/cabo-72-f-nac/cabo-72-f-nac.component';
import { Cabo72FIntComponent } from '../Stencil/cabo-72-f-int/cabo-72-f-int.component';
import { Cabo72FIntDComponent } from '../Stencil/cabo-72-f-int-d/cabo-72-f-int-d.component';

import { Cabo144FNacComponent } from '../Stencil/cabo-144-f-nac/cabo-144-f-nac.component';
import { Cabo144FNacDComponent } from '../Stencil/cabo-144-f-nac-d/cabo-144-f-nac-d.component';
import { Cabo144FIntComponent } from '../Stencil/cabo-144-f-int/cabo-144-f-int.component';
import { Cabo144FIntDComponent } from '../Stencil/cabo-144-f-int-d/cabo-144-f-int-d.component';

import { Splitter12Component } from '../Stencil/spliter-1-p2/spliter-1-p2.component';
import { Splitter14Component } from '../Stencil/spliter-1-p4/spliter-1-p4.component';
import { Splitter18Component } from '../Stencil/spliter-1-p8/spliter-1-p8.component';
import { Splitter116Component } from '../Stencil/spliter-1-p16/spliter-1-p16.component';
import { SplitterDesbComponent } from '../Stencil/spliter-desbalanceado/spliter-desbalanceado.component';



import { BocasService } from '../servico/bocas.service';
import { ConexCabopb99Service} from '../servico/conex-cabopb99.service';
import { SplitterService} from '../servico/splitter.service'
import { Bocas} from '../modelo/Bocas'
import { Splitter} from '../modelo/Splitter'
import { Cabo_tipo} from '../modelo/Cabo_tipo'
import { ConexBocasService } from '../servico/conex-bocas.service';
import { ConexBocasTotalService } from '../servico/conex-bocas-total.service';
import { ConexSpSpService } from '../servico/conex-sp-sp.service';
import { ConexSplitterService } from '../servico/conex-splitter.service';
import { ConexaoBoca } from '../modelo/ConexaoBoca';
import { ConexaoSplitter } from '../modelo/ConexaoSplitter';
import { Cabo_TipoService } from '../servico/cabo-tipo.service';
import { CaboDestinoCxService } from '../servico/cabo-destino-cx.service';
import { GojsDropComponent } from '../gojs-drop/gojs-drop.component';
import { PopClienteService } from '../servico/pop-cliente.service';
import { UpdateBocaXYService} from '../servico/update-boca-xy.service';
import { UpdateFusaoService } from '../servico/update-fusao.service';
import { AuthService } from '../servico/auth.service'; // 🏠 NOVO: Import AuthService
import { FiberApiService } from '../servico/fiber-api.service'; // 🏠 NOVO: Import FiberApiService
import { UpdateSplitterXYService} from '../servico/update-splitter-xy.service';
import { UpdateBocaAngleService} from '../servico/update-boca-angle.service';
import { UpdateBocaLadoService} from '../servico/update-boca-lado.service';
import { PesquisaSiglaService } from '../servico/pesquisa-sigla.service';
import jsPDF from 'jspdf';
import { Cabo_destino_CX } from '../modelo/Cabo_destino_CX';
import { DestinoSigla } from '../modelo/DestinoSigla';

@Component({
  selector: 'app-gojs-demo',
  templateUrl: './gojs-demo.component.html',
  styleUrls: ['./gojs-demo.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class GoJSDemoComponent implements OnInit, AfterViewInit {
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
  
  // 🏠 NOVO: Propriedade para armazenar o número da caixa
  public caixaNumerocx: string = 'N/A';
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

  private cabo1FNAC: Cabo1FNacComponent= new Cabo1FNacComponent();
  private cabo1FNAC_D: Cabo1FNacDComponent= new Cabo1FNacDComponent();
  private cabo1FINT: Cabo1FIntComponent = new Cabo1FIntComponent();
  private cabo1FINT_D: Cabo1FIntDComponent = new Cabo1FIntDComponent();

  private cabo2FNAC_D: Cabo2FNacDComponent = new Cabo2FNacDComponent();
  private cabo2FNAC: Cabo2FNacComponent = new Cabo2FNacComponent();
  private cabo2FINT: Cabo2FIntComponent = new Cabo2FIntComponent();
  private cabo2FINT_D: Cabo2FIntDComponent = new Cabo2FIntDComponent();

  private cabo4FNAC_D: Cabo4FNacDComponent = new Cabo4FNacDComponent();
  private cabo4FNAC: Cabo4FNacComponent = new Cabo4FNacComponent();
  private cabo4FINT: Cabo4FIntComponent = new Cabo4FIntComponent();
  private cabo4FINT_D: Cabo4FIntDComponent = new Cabo4FIntDComponent();

  private cabo6FNAC_D: Cabo6FNacDComponent = new Cabo6FNacDComponent();
  private cabo6FNAC: Cabo6FNacComponent = new Cabo6FNacComponent();
  private cabo6FINT: Cabo6FIntComponent = new Cabo6FIntComponent();
  private cabo6FINT_D: Cabo6FIntDComponent = new Cabo6FIntDComponent();
   

  private cabo8FNAC_D: Cabo8FNacDComponent = new Cabo8FNacDComponent();
  private cabo8FNAC: Cabo8FNacComponent = new Cabo8FNacComponent();
  private cabo8FINT: Cabo8FIntComponent = new Cabo8FIntComponent();
  private cabo8FINT_D: Cabo8FIntDComponent = new Cabo8FIntDComponent();

  private cabo12F_NAC: Cabo12FNacComponent = new Cabo12FNacComponent();
  private cabo12F_NAC_D: Cabo12FNacDComponent = new Cabo12FNacDComponent();
  private cabo12FINT: Cabo12FIntComponent = new Cabo12FIntComponent();
  private cabo12FINT_D: Cabo12FIntDComponent = new Cabo12FIntDComponent();
  private cabo12FINT_TB2: Cabo12FIntTb2Component = new Cabo12FIntTb2Component();
  private cabo12FINT_D_TB2: Cabo12FIntDTb2Component = new Cabo12FIntDTb2Component();
  private cabo12FNAC_TB2: Cabo12FNacTb2Component = new Cabo12FNacTb2Component();
  private cabo12FNAC_D_TB2: Cabo12FNacDTb2Component = new Cabo12FNacDTb2Component();
  private cabo12FINT_TB12: Cabo12FIntTb12Component = new Cabo12FIntTb12Component();
  private cabo12FINT_D_TB12: Cabo12FIntDTb12Component = new Cabo12FIntDTb12Component();
  private cabo12FNAC_TB12: Cabo12FNacTb12Component = new Cabo12FNacTb12Component();
  private cabo12FNAC_D_TB12: Cabo12FNacDTb12Component = new Cabo12FNacDTb12Component();

  private cabo24FNAC: Cabo24FNacComponent = new Cabo24FNacComponent();
  private cabo24FNAC_D: Cabo24FNacDComponent = new Cabo24FNacDComponent();
  private cabo24FINT: Cabo24FIntComponent = new Cabo24FIntComponent();
  private cabo24FINT_D: Cabo24FIntDComponent = new Cabo24FIntDComponent();
  private cabo24FNAC_TB24: Cabo24FNacTb24Component = new Cabo24FNacTb24Component();
  private cabo24FNAC_D_TB24: Cabo24FNacDTb24Component = new Cabo24FNacDTb24Component();
  private cabo24FINT_TB24: Cabo24FIntTb24Component = new Cabo24FIntTb24Component();
  private cabo24FINT_D_TB24: Cabo24FIntDTb24Component = new Cabo24FIntDTb24Component();

  private cabo36FNAC: Cabo36FNacComponent = new Cabo36FNacComponent();
  private cabo36FNAC_D: Cabo36FNacDComponent = new Cabo36FNacDComponent();
  private cabo36FINT: Cabo36FIntComponent = new Cabo36FIntComponent();
  private cabo36FINT_D: Cabo36FIntDComponent = new Cabo36FIntDComponent();


  private cabo48FNAC_D: Cabo48FNacDComponent = new Cabo48FNacDComponent();
  private cabo48FNAC: Cabo48FNacComponent = new Cabo48FNacComponent();
  private cabo48FINT_D: Cabo48FIntDComponent = new Cabo48FIntDComponent();
  private cabo48FINT: Cabo48FIntComponent = new Cabo48FIntComponent();



  private cabo72FNAC_D: Cabo72FNacDComponent = new Cabo72FNacDComponent();
  private cabo72FNAC: Cabo72FNacComponent = new Cabo72FNacComponent();
  private cabo72FINT_D: Cabo72FIntDComponent = new Cabo72FIntDComponent();
  private cabo72FINT: Cabo72FIntComponent = new Cabo72FIntComponent();


  private cabo144FNAC_D: Cabo144FNacDComponent = new Cabo144FNacDComponent();
  private cabo144FNAC: Cabo144FNacComponent = new Cabo144FNacComponent();
  private cabo144FINT_D: Cabo144FIntDComponent = new Cabo144FIntDComponent();
  private cabo144FINT: Cabo144FIntComponent = new Cabo144FIntComponent();

  
    // Instâncias dos diferentes componentes de splitter
  private splitter12: Splitter12Component = new Splitter12Component();
  private splitter14: Splitter14Component = new Splitter14Component();
  private splitter18: Splitter18Component = new Splitter18Component();
  private splitter116: Splitter116Component = new Splitter116Component();
  private splitterDesb: SplitterDesbComponent = new SplitterDesbComponent();

  private savedViewportBounds: go.Rect | null = null;
  private savedScale: number = 1;




  private avoidsLinksRouter: AvoidsLinksRouter | null = null;
  private Alinhamento : string = "D";
  VetorBocas:Bocas[]=[];
  VetorDrops_Sp:ConexaoBoca[]=[];
  VetorPopsCli:string[]=[]
  VetorSplitter: Splitter[]=[];
  VetorTipoCabos: Cabo_tipo[]=[];
  VetorDestinoCabos:Cabo_destino_CX[]=[];
  VetorDestinoSiglas: DestinoSigla[] = [];
  // 🆕 NOVO - Vetor para dados dos POPs
  VetorDadosPops: any[] = [];
  
  // Adicionar propriedade para armazenar a referência do handler
  private handleSplitterContextMenu: ((event: any) => void) | null = null;
  
  // Adicionar flag para evitar múltiplas chamadas
  private modalSplitterOpen = false;
  
  // Adicionar debounce para evitar múltiplas chamadas rápidas
  private lastModalCallTime = 0;
  
  // Adicionar controle de eventos duplicados
  private lastEventId = '';
  
  // Flag global para controlar se o listener já foi adicionado
  private static globalListenerAdded = false;
  
  constructor(
     public dialogRef: MatDialogRef<GoJSDemoComponent>,
     @Inject(MAT_DIALOG_DATA) public data: any,
     private ngZone: NgZone,
     private cdr: ChangeDetectorRef,
     private servicoBocas: BocasService,
     private serviceCabo99: ConexCabopb99Service,
     private servicoSplitter: SplitterService,
     private servicoTipoCabos : Cabo_TipoService ,
     private servicoDestinoCabos : CaboDestinoCxService,
     private conexBocasTotalService: ConexBocasTotalService,
     private conexBocasService: ConexBocasService,
     private conexSplitterService: ConexSplitterService,
     private conexSpSpService:ConexSpSpService,
     private gojsDropComponent: GojsDropComponent,
     private UpdateBCXYService: UpdateBocaXYService,
     private UpdateSPXYService: UpdateSplitterXYService,
     private UpdateBCAngleService:UpdateBocaAngleService,
     private UpdateBCLadoService:UpdateBocaLadoService,    
     private popClienteService: PopClienteService,
     private pesquisaSiglaService: PesquisaSiglaService,
    private authService: AuthService, // 🏠 NOVO: Injetar AuthService
    private fiberApiService: FiberApiService, // 🏠 NOVO: Injetar FiberApiService
    private dialog: MatDialog, // 🔀 NOVO: Injetar MatDialog para context menu
    private updateFusaoService: UpdateFusaoService // 🔗 NOVO: Serviço para realizar fusões internas
   ) {}


  //==============================================================================================================  

  

  /**
   * 🏠 NOVO: Carrega o número da caixa (numerocx) usando o idmeta disponível
   */
  private async carregarNumerocxCaixa(): Promise<void> {
    try {
      const idmeta = this.authService.getIDmetaCaixa();
      if (idmeta) {
        console.log('🏠 [GOJS] Consultando numerocx para idmeta:', idmeta);
        
        const response = await this.fiberApiService.executeDynamicQuery(
          `SELECT numerocx FROM tstmeta.caixa WHERE id_meta = {idmeta}`,
          { idmeta: idmeta }
        ).toPromise();
        
        if (response?.success && response.data && response.data.length > 0) {
          this.caixaNumerocx = response.data[0].numerocx || 'N/A';
          console.log('🏠 [GOJS] Numerocx da caixa carregado:', this.caixaNumerocx);
        } else {
          this.caixaNumerocx = 'N/A';
          console.log('🏠 [GOJS] Numerocx não encontrado para idmeta:', idmeta);
        }
      } else {
        this.caixaNumerocx = 'N/A';
        console.log('🏠 [GOJS] IDMETA da caixa não disponível');
      }
    } catch (error) {
      console.error('❌ [GOJS] Erro ao carregar numerocx da caixa:', error);
      this.caixaNumerocx = 'N/A';
    }
  }

  async ngOnInit(): Promise<void> {
    console.log('🔀 [DEBUG] ngOnInit() chamado - GoJS Demo Component inicializado');
    console.log('🔀 [DEBUG] Componente GoJS está sendo inicializado...');
    /*
    console.log('GoJSDemo Component inicializado');
    /////////////////////setTimeout(() => {this.selecionar_Bocas()},1);// <-----função para ler bocas para desenhar cabos
    //this.selecionar_Splitters(); // <-----função para le splitters dentro da caixa

    
    ////////////setTimeout(() => {this.extraiTipoCabosBocas()},1000);

    // 🚀 NOVO - Carregamento async dos cabos apenas
    this.carregarDadosCabosAsync();
    

    setTimeout(() => {this.selecionar_Splitters()},500);

    */

    // 🏠 NOVO: Carregar numerocx da caixa antes dos dados completos
    await this.carregarNumerocxCaixa();
    
    setTimeout(() => {this.carregarDadosCompletosAsync()},500); //estava em 100 coloquei 500 pois tipos de cabos esrava vindo rrado no redraw
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



//===============================================================================================================
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

    //this.diagram.startTransaction("Adicionar Splitters ao diagrama ");

    console.log('🎨 Adicionando splitters ao diagrama:', this.VetorSplitter);
    
    const model = this.diagram.model as go.GraphLinksModel;
    const splitterNodes: go.ObjectData[] = [];
    const posicoesSplitters: {id: string, x: number, y: number}[] = [];
    let POSX=0;
    let POSY=0;
    
    this.VetorSplitter.forEach((splitter, index) => {

      const posX = 750;
      const posY = 1500 + (index * 400);

      if (this.VetorSplitter[index].X != 0 || this.VetorSplitter[index].Y != 0 ){ 
        POSX=Math.round(this.VetorSplitter[index].X),
        POSY=Math.round(this.VetorSplitter[index].Y)
         } else {
          POSX= posX,
          POSY= posY
      }

      

      posicoesSplitters.push({
        id: `Splitter${splitter.IDMETA || index}`,
        x: POSX,//posX,
        y: POSY //posy,
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
        loc: `${POSX} ${POSY}`,
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
    }, 10);

    setTimeout(() => {this.carregarConexoesSplitters()},200); // estava 10 aumentei para 200 pois as conexoes nao estavam ficando coloridas
    setTimeout(() => {this.carregarConexoesBocas9798()},10)

    //this.diagram.commitTransaction();
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
      
      // 4. Carregar destino dos cabos das bocas da caixa
      console.log('🔧 ---------------------------------------------->Carregando destino dos cabos das bocas da caixa...');
      await this.carregarDestinoCabosSequencial(); 

      // 4. Criar VetorDestinoSiglas
      console.log('🏷️ Criando VetorDestinoSiglas...');
      await this.criarVetorDestinoSiglasAsync();
      

      // 7. 🆕 NOVO - Aplicar labels com siglas após tudo carregado
      console.log('🏷️ Aplicando labels com siglas...');
      await this.aplicarLabelsComSiglas();

      // 7. 🆕 ATUALIZADO - Aplicar labels com siglas apenas se o diagrama estiver disponível
    //  if (this.diagram && this.cabosInicializados) {
    //    console.log('🏷️ Aplicando labels com siglas...');
    //    await this.aplicarLabelsComSiglas();
    //  } else {
    //    console.warn('⚠️ Diagrama não disponível ou cabos não inicializados, pulando aplicação de labels');
    //    console.log(`   Diagrama disponível: ${!!this.diagram}`);
    //    console.log(`   Cabos inicializados: ${this.cabosInicializados}`);
    //  }



      // 5. Buscar o nome do Objeto de destino
      //await this.criarVetorDestinoSiglasAsync();
     // console.log('🔍 Siglas dos destinos carregadas');


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

  //================================================================================================================

// Helper para obter valor de BOCAX com tratamento de tipo
  private getBocaValue(bocaNum: number): string {
    if (this.VetorBocas && this.VetorBocas.length > 0) {
      const property = `BOCA${bocaNum}` as keyof Bocas;
      return this.VetorBocas[0][property] as string || "";
    }
    return "";
  }

//=================================================================================================================

 async carregarDestinoCabosSequencial(): Promise<void> {
    try {
      console.log('🚀 Iniciando carregamento sequencial de destinos...');
      
      if (!this.VetorBocas || this.VetorBocas.length === 0) {
        console.warn('❌ VetorBocas vazio ou não inicializado');
        return;
      }

      // Inicializar VetorDestinoCabos com 18 posições vazias
      this.VetorDestinoCabos = new Array(18).fill(null).map(() => ({
        tipo_objeto: '',
        id_meta: '0'
      }));

      // Processar cada boca de 1 a 18 sequencialmente
      for (let i = 1; i <= 18; i++) {
        const arrayIndex = i - 1; // Índice do array (0-17)
        const bocaKey = `BOCA${i}` as keyof typeof this.VetorBocas[0];
        const bocaValue = this.VetorBocas[0][bocaKey];

        console.log(`🔍 Processando Boca ${i}...`);

        // Verificar se a boca tem valor válido
        if (!bocaValue || bocaValue === ' ' || bocaValue === '0' || bocaValue.trim() === '') {
          console.log(`   Boca ${i}: sem cabo válido, mantendo posição vazia`);
          // Posição já está vazia pela inicialização
          continue;
        }

        const bocaId = String(bocaValue).trim();
        console.log(`   Boca ${i}: ID do cabo = ${bocaId}`);

        try {
          // 🆕 NOVO - Extrair apenas a parte numérica do ID do cabo
          const ultimaLetra = bocaId.slice(-1).toUpperCase();
          
          // Extrair apenas os números do ID (remover "cabo" e a letra final)
          const idNumerico = bocaId.replace(/^cabo/, '').replace(/[A-Za-z]$/, '');
          
          console.log(`   ID original: ${bocaId}, ID numérico extraído: ${idNumerico}, Última letra: ${ultimaLetra}`);

          // Determinar tabela baseada na última letra
          const tabela_cabo = ultimaLetra === 'A' ? "caboa_t1" : "cabob_t1";
          
          console.log(`   Consultando ${tabela_cabo} para ID numérico ${idNumerico}...`);

          // 🆕 ALTERADO - Chamar o serviço com o ID numérico
          const resultado = await this.servicoDestinoCabos.selecionarAsync(idNumerico, tabela_cabo);

          if (resultado && resultado.length > 0) {
            // Preencher na posição correta
            this.VetorDestinoCabos[arrayIndex] = {
              tipo_objeto: resultado[0].tipo_objeto || '',
              id_meta: resultado[0].id_meta || '0'
            };
            console.log(`✅ Boca ${i}: ${this.VetorDestinoCabos[arrayIndex].tipo_objeto} - ${this.VetorDestinoCabos[arrayIndex].id_meta}`);
          } else {
            console.log(`⚠️  Boca ${i}: nenhum destino encontrado`);
            // Posição permanece vazia
          }

        } catch (error) {
          console.error(`❌ Erro ao processar Boca ${i}:`, error);
          // Posição permanece vazia em caso de erro
        }
      }

      console.log('✅ Carregamento sequencial concluído');
      console.log('📊 VetorDestinoCabos final:', this.VetorDestinoCabos);

    } catch (error) {
      console.error('❌ Erro geral no carregamento sequencial:', error);
    }
  }

//=================================================================================================================

/**
   * 🆕 NOVA FUNÇÃO - Criar VetorDestinoSiglas baseado no VetorDestinoCabos
   */
  async criarVetorDestinoSiglasAsync(): Promise<void> {
    try {
      console.log('🏷️ Iniciando criação do VetorDestinoSiglas...');
      
      if (!this.VetorDestinoCabos || this.VetorDestinoCabos.length === 0) {
        console.warn('❌ VetorDestinoCabos vazio, inicializando VetorDestinoSiglas vazio');
        this.VetorDestinoSiglas = new Array(18).fill(null).map(() => ({
          tipo_objeto: '',
          id_meta: '',
          sigla: ''
        }));
        return;
      }

      // Usar o serviço para criar o vetor com siglas
      this.VetorDestinoSiglas = await this.pesquisaSiglaService.criarVetorDestinoSiglasAsync(this.VetorDestinoCabos);
      
      console.log('✅ VetorDestinoSiglas criado com sucesso:');
      console.log('📊 VetorDestinoSiglas final:', this.VetorDestinoSiglas);

    } catch (error) {
      console.error('❌ Erro ao criar VetorDestinoSiglas:', error);
      // Inicializar vetor vazio em caso de erro
      this.VetorDestinoSiglas = new Array(18).fill(null).map(() => ({
        tipo_objeto: '',
        id_meta: '',
        sigla: ''
      }));
    }
  }


//=================================================================================================================



  /**
   * 🆕 NOVO: Configura context menu HTML customizado para splitters
   */
  private setupCustomContextMenu(): void {
    console.log('🔀 [CUSTOM-CONTEXT] Configurando context menu HTML customizado...');
    
    // Criar elemento HTML do context menu
    const contextMenu = document.createElement('div');
    contextMenu.id = 'splitter-context-menu';
    contextMenu.className = 'splitter-context-menu';
    contextMenu.style.cssText = `
      position: fixed;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      padding: 8px 0;
      min-width: 150px;
      font-family: 'Roboto', sans-serif;
      z-index: 10000;
      display: none;
    `;
    
    // Adicionar opções do menu
    const options = [
      { text: 'Mapear Splitter', action: 'mapear' },
      { text: 'Informações', action: 'info' },
      { text: 'Configurar', action: 'config' }
    ];
    
    options.forEach(option => {
      const menuItem = document.createElement('div');
      menuItem.className = 'context-menu-item';
      menuItem.style.cssText = `
        display: flex;
        align-items: center;
        padding: 8px 16px;
        cursor: pointer;
        transition: background-color 0.2s;
        font-size: 14px;
        color: #333;
      `;
      menuItem.textContent = option.text;
      
      menuItem.addEventListener('mouseenter', () => {
        menuItem.style.backgroundColor = '#f5f5f5';
      });
      
      menuItem.addEventListener('mouseleave', () => {
        menuItem.style.backgroundColor = 'transparent';
      });
      
      menuItem.addEventListener('click', () => {
        console.log(`🔀 [CUSTOM-CONTEXT] Opção clicada: ${option.action}`);
        this.handleContextMenuAction(option.action);
        this.hideCustomContextMenu();
      });
      
      contextMenu.appendChild(menuItem);
    });
    
    // Adicionar ao body
    document.body.appendChild(contextMenu);
    
    // Adicionar listener para botão direito no diagrama
    if (this.diagram && this.diagram.div) {
      this.diagram.div.addEventListener('contextmenu', (event: MouseEvent) => {
        console.log('🔀 [CUSTOM-CONTEXT] Botão direito detectado no GoJS');
        console.log('🔀 [CUSTOM-CONTEXT] Event target:', event.target);
        console.log('🔀 [CUSTOM-CONTEXT] ClientX:', event.clientX, 'ClientY:', event.clientY);
        
        // 🔧 CORREÇÃO: Usar coordenadas relativas ao canvas
        const canvas = event.target as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        console.log('🔀 [CUSTOM-CONTEXT] Coordenadas relativas ao canvas:', x, y);
        
        // Encontrar o objeto clicado usando coordenadas do canvas
        const point = new go.Point(x, y);
        const goObject = this.diagram!.findObjectAt(point);
        
        console.log('🔀 [CUSTOM-CONTEXT] GoObject encontrado:', goObject);
        
        if (goObject && goObject.part && goObject.part.data && goObject.part.data.key && goObject.part.data.key.startsWith("Splitter")) {
          console.log('🔀 [CUSTOM-CONTEXT] Splitter clicado:', goObject.part.data);
          event.preventDefault();
          event.stopPropagation();
          
          // Salvar dados do splitter
          this.currentSplitterData = goObject.part.data;
          
          // Mostrar context menu
          this.showCustomContextMenu(event.clientX, event.clientY);
        } else {
          console.log('🔀 [CUSTOM-CONTEXT] Não é um splitter ou objeto não encontrado');
          if (goObject) {
            console.log('🔀 [CUSTOM-CONTEXT] Objeto encontrado mas não é splitter:', goObject.part?.data);
          }
        }
      });
    }
    
    // Adicionar listener para fechar o menu ao clicar fora
    document.addEventListener('click', () => {
      this.hideCustomContextMenu();
    });
    
    console.log('🔀 [CUSTOM-CONTEXT] Context menu HTML customizado configurado com sucesso!');
  }

  /**
   * 🆕 NOVO: Mostra o context menu customizado
   */
  private showCustomContextMenu(x: number, y: number): void {
    const contextMenu = document.getElementById('splitter-context-menu');
    if (contextMenu) {
      contextMenu.style.left = `${x}px`;
      contextMenu.style.top = `${y}px`;
      contextMenu.style.display = 'block';
      console.log('🔀 [CUSTOM-CONTEXT] Context menu mostrado');
    }
  }

  /**
   * 🆕 NOVO: Esconde o context menu customizado
   */
  private hideCustomContextMenu(): void {
    const contextMenu = document.getElementById('splitter-context-menu');
    if (contextMenu) {
      contextMenu.style.display = 'none';
    }
  }

  /**
   * 🆕 NOVO: Manipula ações do context menu
   */
  private handleContextMenuAction(action: string): void {
    if (!this.currentSplitterData) {
      console.log('🔀 [CUSTOM-CONTEXT] Nenhum splitter selecionado');
      return;
    }
    
    console.log(`🔀 [CUSTOM-CONTEXT] Executando ação: ${action}`, this.currentSplitterData);
    
    switch (action) {
      case 'mapear':
        this.abrirModalSplitter(this.currentSplitterData);
        break;
      case 'info':
        alert(`Splitter: ${this.currentSplitterData.labelText}\nID: ${this.currentSplitterData.idmeta}\nTipo: ${this.currentSplitterData.tipoSplitter}`);
        break;
      case 'config':
        alert('Função de configuração será implementada em breve!');
        break;
    }
  }

  // 🆕 NOVO: Propriedade para armazenar dados do splitter atual
  private currentSplitterData: any = null;


  //===============================================================================================================
 
  ngAfterViewInit(): void {
    console.log('🔀 [DEBUG] ngAfterViewInit() chamado - MatDialog');
    console.log('AfterViewInit: Modal MatDialog aberto, inicializando diagrama');
    this.mostrarCursorEspera();
    setTimeout(() => this.initializeDiagram(), 100);
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
            tubo: 0,
            Label_cabo:''
          });
        }
        
        // Agora podemos definir diretamente no índice correto
        this.VetorTipoCabos[targetIndex] = {
          capacidade: tipos[0].capacidade,
          codigo: tipos[0].codigo,
          tubo: tipos[0].tubo,
          Label_cabo: tipos[0].Label_cabo
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

          if (this.VetorBocas[0] && this.VetorBocas[0][`BOCA${bocaNumero}`] !== ' ') {


          console.log(`Carregando conexões da Boca ${bocaNumero}...`);

          //const bocaKey = `BOCA${bocaNumero}`;

          

          console.log("valor do vetorBocas:",this.VetorBocas[0][`BOCA${bocaNumero}`])
        
          
          const todasConexoes = await this.conexBocasTotalService.selecionarAsync(bocaNumero,this.VetorTipoCabos[bocaNumero-1].capacidade);
          console.log(`capacidade:`,this.VetorTipoCabos[bocaNumero-1].capacidade)
          console.log(`=============================>Todas conexões da Boca ${bocaNumero} recebidas:`, todasConexoes);//,'CAPACIDADE BOCA:',this.VetorTipoCabos[(bocaNumero-1)].capacidade);
          
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

     private selecionarModeloCaboPorCapacidade(capacidade: number ,codigo: number, tubo: number , isLadoDireito: boolean): go.ObjectData {
      console.log(`Selecionando modelo para: capacidade=${capacidade}, codigo=${codigo}, tubo=${tubo}, direito=${isLadoDireito}`);
      
      

      // Capacidade 1
    if (capacidade <= 1) {
      if (codigo === 2) { // NAC
        return isLadoDireito 
          ? this.cabo1FNAC_D.getModelDefinition() 
          : this.cabo1FNAC.getModelDefinition();
      } else { // INT (codigo 1)
        return isLadoDireito 
          ? this.cabo1FINT_D.getModelDefinition() 
          : this.cabo1FINT.getModelDefinition();
      }
    }

      
      // Capacidade 2
    else if (capacidade <= 2) {
      if (codigo === 2) { // NAC
        return isLadoDireito 
          ? this.cabo2FNAC_D.getModelDefinition() 
          : this.cabo2FNAC.getModelDefinition();
      } else { // INT
        return isLadoDireito 
          ? this.cabo2FINT_D.getModelDefinition() 
          : this.cabo2FINT.getModelDefinition();
      }
    }
                  
      // Capacidade 4
    else if (capacidade <= 4) {
      if (codigo === 2) { // NAC
        return isLadoDireito 
          ? this.cabo4FNAC_D.getModelDefinition() 
          : this.cabo4FNAC.getModelDefinition();
      } else { // INT
        return isLadoDireito 
          ? this.cabo4FINT_D.getModelDefinition() 
          : this.cabo4FINT.getModelDefinition();
      }
    }  
    
    
       // Capacidade 6
    else if (capacidade <= 6) {
      if (codigo === 2) { // NAC
        return isLadoDireito 
          ? this.cabo6FNAC_D.getModelDefinition() 
          : this.cabo6FNAC.getModelDefinition();
      } else { // INT
        return isLadoDireito 
          ? this.cabo6FINT_D.getModelDefinition() 
          : this.cabo6FINT.getModelDefinition();
      }
    }

    


      // Capacidade 8
    else if (capacidade <= 8) {
      if (codigo === 2) { // NAC
        return isLadoDireito 
          ? this.cabo8FNAC_D.getModelDefinition() 
          : this.cabo8FNAC.getModelDefinition();
      } else { // INT
        return isLadoDireito 
          ? this.cabo8FINT_D.getModelDefinition() 
          : this.cabo8FINT.getModelDefinition();
      }
    }


      
    //================================================================
    // Capacidade 12
    
    
    else if (capacidade <= 12) {
  if (codigo === 2) { // NAC
    if (tubo === 2) {
      return isLadoDireito 
        ? this.cabo12FNAC_D_TB2.getModelDefinition() 
        : this.cabo12FNAC_TB2.getModelDefinition();
    } else if (tubo === 6) {
      return isLadoDireito 
        ? this.cabo12F_NAC_D.getModelDefinition() 
        : this.cabo12F_NAC.getModelDefinition();
    } else   { //(tubo === 12)
      return isLadoDireito 
        ? this.cabo12FNAC_D_TB12.getModelDefinition() 
        : this.cabo12FNAC_TB12.getModelDefinition();
    }

    
  } else if (codigo === 1) { // INT
    if (tubo === 2) {
      return isLadoDireito 
        ? this.cabo12FINT_D_TB2.getModelDefinition() 
        : this.cabo12FINT_TB2.getModelDefinition();
    } else if (tubo === 6) {
      return isLadoDireito 
        ? this.cabo12FINT_D.getModelDefinition() 
        : this.cabo12FINT.getModelDefinition();
    } else   { //(tubo === 12)
      return isLadoDireito 
        ? this.cabo12FINT_D_TB12.getModelDefinition() 
        : this.cabo12FINT_TB12.getModelDefinition();
    }
}
    }


      //================================================================
      // Capacidade 24
      else if (capacidade <= 24) {
      if (codigo === 2) { // NAC
        if (tubo === 6) {
          return isLadoDireito 
            ? this.cabo24FNAC_D.getModelDefinition() 
            : this.cabo24FNAC.getModelDefinition();
        } else if (tubo === 24) {
          return isLadoDireito 
            ? this.cabo24FNAC_D_TB24.getModelDefinition() 
            : this.cabo24FNAC_TB24.getModelDefinition();
            } else {
          // Default para NAC quando tubo não é 6 nem 24
          return isLadoDireito 
            ? this.cabo24FNAC_D.getModelDefinition() 
            : this.cabo24FNAC.getModelDefinition();

            
        }
      } else { // INT
        if (tubo === 6) {
          return isLadoDireito 
            ? this.cabo24FINT_D.getModelDefinition() 
            : this.cabo24FINT.getModelDefinition();
            } else if (tubo === 24) {
          return isLadoDireito 
            ? this.cabo24FINT_D_TB24.getModelDefinition() 
            : this.cabo24FINT_TB24.getModelDefinition();
            } else {
          // Default para INT quando tubo não é 6 nem 24
          return isLadoDireito 
            ? this.cabo24FINT_D.getModelDefinition() 
            : this.cabo24FINT.getModelDefinition();

        } 
      }
    }

    //=====================================================================
      else if (capacidade <= 36) {
        if (codigo === 2) { // NAC
        // Para capacidades acima de 24, assumimos o modelo de 36 fibras
        return isLadoDireito 
          ? this.cabo36FNAC_D.getModelDefinition() 
          : this.cabo36FNAC.getModelDefinition();
      }else { // INT
        return isLadoDireito 
          ? this.cabo36FINT_D.getModelDefinition() 
          : this.cabo36FINT.getModelDefinition();
      }
    }



      else if (capacidade <= 48) {
        if (codigo === 2) { // NAC
        // Para capacidades acima de 48, assumimos o modelo de 36 fibras
        return isLadoDireito 
          ? this.cabo48FNAC_D.getModelDefinition() 
          : this.cabo48FNAC.getModelDefinition();
      }else { // INT
        return isLadoDireito 
          ? this.cabo48FINT_D.getModelDefinition() 
          : this.cabo48FINT.getModelDefinition();
      }
    }

      else if (capacidade <= 72) {
        if (codigo === 2) { // NAC
        return isLadoDireito 
          ? this.cabo72FNAC_D.getModelDefinition() 
          : this.cabo72FNAC.getModelDefinition();
      }else { // INT
        return isLadoDireito 
          ? this.cabo72FINT_D.getModelDefinition() 
          : this.cabo72FINT.getModelDefinition();
      }
    }


    else if (capacidade <= 144) {
        if (codigo === 2) { // NAC
        return isLadoDireito 
          ? this.cabo144FNAC_D.getModelDefinition() 
          : this.cabo144FNAC.getModelDefinition();
      }else { // INT
        return isLadoDireito 
          ? this.cabo144FINT_D.getModelDefinition() 
          : this.cabo144FINT.getModelDefinition();
      }
    }






      // ✅ RETORNO PADRÃO - Este é o ponto chave da Opção 1
  // Caso alguma condição não seja atendida, retorna um modelo padrão
  console.warn(`Condição não prevista: capacidade=${capacidade}, codigo=${codigo}, tubo=${tubo}`);
  return isLadoDireito 
    ? this.cabo12F_NAC_D.getModelDefinition() 
    : this.cabo12F_NAC.getModelDefinition();

      
    } 
  
  
  
//CABOS===================================================== Função para criar conexões automáticas baseadas em dados da API
  private criarConexoesAutomaticas() {
    console.log("Criando conexões automáticas");
    
    // Verificar se todas as bocas necessárias foram carregadas antes de criar conexões
    const bocasNecessarias = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    const todasBocasCarregadas = bocasNecessarias.every(boca => this.bocasCarregadas.has(boca));
    
   // 250829if (this.conexoesCriadas || !this.conexoesCarregadas.length || !todasBocasCarregadas) {
   // 250829  console.log("Conexões já foram criadas anteriormente, pulando...");
   // 250829  return;
   //250829 }  não estava deixando desenhar as conexoes apesa de receber da API --> depois de nova rota mais rapida /conex_bc
    
    

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
console.log('======================================>Conexão: ' ,conexao.bocaOrigem,conexao.fibraOrigem,conexao.bocaDestino,conexao.fibraDestino)

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

    this.diagram.startTransaction("Criar conexões de splitters");

    const model = this.diagram.model as go.GraphLinksModel;
    
    console.log(`Adicionando ${linkDataArray.length} novas conexões de splitter ao diagrama`);
    console.log('conexoes splitters -->', linkDataArray)
    
    if (linkDataArray.length > 0) {
      model.addLinkDataCollection(linkDataArray);
      //this.conexoesSPCriadas = true;
      this.diagram.commitTransaction();
    }
  }
}


//SPLITTERS===============================================================================================================
//==============================================================================================================

//=========================função que le Bocas 97 e 98 e faz conexoes somente entre splitters

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
  console.log('======================================>Conexão SPSP: ' ,conexaoSpSp.bocaOrigem,conexaoSpSp.fibraOrigem,conexaoSpSp.bocaDestino,conexaoSpSp.fibraDestino)

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
      console.log('entrou em setupDragFunctionality - MatDialog');
      
      // 🆕 NOVO: Procurar pelo container do MatDialog
      this.modalElement = document.querySelector('.mat-mdc-dialog-container') as HTMLElement;
      this.modalContentElement = document.querySelector('.gojs-modal-content') as HTMLElement;
      this.modalHeaderElement = document.querySelector('.modal-header') as HTMLElement;

      console.log('Modal elements encontrados:', {
        modalElement: !!this.modalElement,
        modalContentElement: !!this.modalContentElement,
        modalHeaderElement: !!this.modalHeaderElement
      });

      if (this.modalHeaderElement && this.modalElement) {
        console.log('Modal header encontrado para arrastar - MatDialog');
        // Adicionar listener apenas no cabeçalho, não no modal inteiro
        this.modalHeaderElement.addEventListener('mousedown', (e: MouseEvent) => this.dragStart(e));
        document.addEventListener('mousemove', (e: MouseEvent) => this.dragMove(e));
        document.addEventListener('mouseup', (e: MouseEvent) => this.dragEnd(e));
      } else {
        console.warn('Modal header não encontrado para configurar o arrastar - MatDialog');
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
      
      if (this.modalElement) {
        this.modalElement.classList.add('dragging');
      }
    }
  }

  //==========================permite movimentar o modal========================================================================================================

  private dragMove(event: MouseEvent): void {
    //console.log('entrou em dragMove');
    if (this.isDragging && this.modalElement) {
      event.preventDefault();
      
      this.currentX = event.clientX - this.initialX;
      this.currentY = event.clientY - this.initialY;

      // 🆕 NOVO: Aplicar transform no container do MatDialog
      this.setTranslate(this.currentX, this.currentY, this.modalElement);
    }
  }

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

  //================================================================================================================================

  private setTranslate(xPos: number, yPos: number, el: HTMLElement): void {
    if (el) {
      el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
  }



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

    console.log('===================> startTransaction do gojs aplicado')
    this.diagram.startTransaction("Aplicar transformações iniciais");
    
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
          if (this.VetorTipoCabos.length >= 1 && this.VetorTipoCabos[0]) {
         
          const capacidade = this.VetorTipoCabos[0].capacidade || 0;
          const codigo = this.VetorTipoCabos[0].codigo || 2;
          const tubo = this.VetorTipoCabos[0].tubo || 6;
          let lado = false; // bocas impares são esquerda (false) bocas pares direita (true)

          if (this.VetorBocas[0].LD1 === 'D') {lado=true } 

          console.log(`Boca 1: Usando capacidade ${capacidade} para selecionar modelo`);  
          // Selecionar o modelo com base na capacidade
          const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
          
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
            const codigo = this.VetorTipoCabos[1].codigo || 2;
            const tubo = this.VetorTipoCabos[1].tubo || 6;
            let lado=true;

            if (this.VetorBocas[0].LD2 === 'E') {lado=false } 

            console.log(`Boca 2: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
            Boca2 = { 
              ...modeloSelecionado, 
              key: "Boca2",
              loc: "400 0",
              
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
            const codigo = this.VetorTipoCabos[2].codigo || 2;
            const tubo = this.VetorTipoCabos[2].tubo || 6;
            let lado=false;

            if (this.VetorBocas[0].LD3 === 'D') {lado=true } 
            
            console.log(`Boca 3: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
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
            const codigo = this.VetorTipoCabos[3].codigo || 2;
            const tubo = this.VetorTipoCabos[3].tubo || 6;
            console.log(`Boca 4: Usando capacidade ${capacidade} para selecionar modelo`);
            let lado=true;

            if (this.VetorBocas[0].LD4 === 'E') {lado=false } 
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
            Boca4 = { 
              ...modeloSelecionado, 
              key: "Boca4",
              loc: "0 0",
              
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
            const codigo = this.VetorTipoCabos[4].codigo || 2;
            const tubo = this.VetorTipoCabos[4].tubo || 6;
            let lado=false;

            if (this.VetorBocas[0].LD5 === 'D') {lado=true } 


            console.log(`Boca 5: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
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
            let lado=true;

            if (this.VetorBocas[0].LD6 === 'E') {lado=false } 


            console.log(`Boca 6: Usando capacidade ${capacidade} para selecionar modelo`);
            const codigo = this.VetorTipoCabos[5].codigo || 2;
            const tubo = this.VetorTipoCabos[5].tubo || 6;
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
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
            const codigo = this.VetorTipoCabos[6].codigo || 2;
            const tubo = this.VetorTipoCabos[6].tubo || 6;
            let lado=false;

            if (this.VetorBocas[0].LD7 === 'D') {lado=true } 

            console.log(`Boca 7: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
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
            const codigo = this.VetorTipoCabos[7].codigo || 2;
            const tubo = this.VetorTipoCabos[7].tubo || 6;
            let lado=true;

            if (this.VetorBocas[0].LD8 === 'E') {lado=false } 

            console.log(`Boca 8: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
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
            const codigo = this.VetorTipoCabos[8].codigo || 2;
            const tubo = this.VetorTipoCabos[8].tubo || 6;
            let lado=false;

            if (this.VetorBocas[0].LD9 === 'D') {lado=true } 

            console.log(`Boca 9: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
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
            const codigo = this.VetorTipoCabos[9].codigo || 2;
            const tubo = this.VetorTipoCabos[9].tubo || 6;
            let lado=true;

            if (this.VetorBocas[0].LD10 === 'E') {lado=false } 


            console.log(`Boca 10: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
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
            const codigo = this.VetorTipoCabos[10].codigo || 2;
            const tubo = this.VetorTipoCabos[10].tubo || 6;
             let lado=false;

             if (this.VetorBocas[0].LD11 === 'D') {lado=true } 

            console.log(`Boca 11: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
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
            const codigo = this.VetorTipoCabos[11].codigo || 2;
            const tubo = this.VetorTipoCabos[11].tubo || 6;
            let lado=true;

            if (this.VetorBocas[0].LD12 === 'E') {lado=false } 

            console.log(`Boca 12: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
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
            const codigo = this.VetorTipoCabos[12].codigo || 2;
            const tubo = this.VetorTipoCabos[12].tubo || 6;
            let lado=false;

            if (this.VetorBocas[0].LD13 === 'D') {lado=true } 

            console.log(`Boca 13: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
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
            const codigo = this.VetorTipoCabos[13].codigo || 2;
            const tubo = this.VetorTipoCabos[13].tubo || 6;
            let lado=true;

            if (this.VetorBocas[0].LD14 === 'E') {lado=false } 

            console.log(`Boca 14: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
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
            const codigo = this.VetorTipoCabos[14].codigo || 2;
            const tubo = this.VetorTipoCabos[14].tubo || 6;
            let lado=false;

            if (this.VetorBocas[0].LD15 === 'D') {lado=true } 

            console.log(`Boca 15: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
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
            const codigo = this.VetorTipoCabos[15].codigo || 2;
            const tubo = this.VetorTipoCabos[15].tubo || 6;
            let lado=true;

            if (this.VetorBocas[0].LD16 === 'E') {lado=false } 

            console.log(`Boca 16: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
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
            const codigo = this.VetorTipoCabos[16].codigo || 2;
            const tubo = this.VetorTipoCabos[16].tubo || 6;
            let lado=false;

            if (this.VetorBocas[0].LD17 === 'D') {lado=true } 

            console.log(`Boca 17: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
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
            const codigo = this.VetorTipoCabos[17].codigo || 2;
            const tubo = this.VetorTipoCabos[17].tubo || 6;
            let lado=true;

            if (this.VetorBocas[0].LD18 === 'E') {lado=false } 

            console.log(`Boca 18: Usando capacidade ${capacidade} para selecionar modelo`);
            
            const modeloSelecionado = this.selecionarModeloCaboPorCapacidade(capacidade, codigo, tubo, lado);
            
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
          { key: "title", category: "text", text: "Diagrama da Caixa", loc: "300 300",layerName: "Foreground" }
        ].filter(node => node !== null);


        model.nodeDataArray = nodeDataArray


        setTimeout(() => {
          if (!this.diagram) return;
          // Métodos alternativos para encontrar o nó
          //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}

          
          //console.log('===================> startTransaction do gojs aplicado')
          //this.diagram.startTransaction("Aplicar transformações iniciais");
          let node1 = this.diagram!.findNodeForKey("Boca1");
          
          if (node1) {
            console.log("Node cabo1 encontrado via findNodeForKey:", node1);
            
                        console.log("Aplicando transformação ao cabo1");
                        
                        node1.resizable=true;
                        node1.rotatable=true;
                        //node1.locationSpot=go.Spot.Center;
                        node1.locationSpot=go.Spot.Center;
                        
                        
                        node1.rotateObject.scale=1000;
                        node1.scale=1;
                        node1.movable=true;
                        if (this.VetorBocas[0].ROT1 !== undefined && this.VetorBocas[0].ROT1 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT1));
                        const rotationRadians = rotationDegrees;
                        node1.angle = rotationRadians;}
                        //node1.angle=this.VetorBocas[0].ROT1;
                        if (this.VetorBocas[0].X1!=0 || this.VetorBocas[0].Y1 != 0) {node1.position=new go.Point(Math.round(this.VetorBocas[0].X1),Math.round(this.VetorBocas[0].Y1));}
                        else {node1.position=new go.Point(500,500);
                        }
                        

                      
                      //const destinoSigla = this.VetorDestinoSiglas[0];
                      //const destinoInfo = destinoSigla && destinoSigla.tipo_objeto ?` (Destino: ${destinoSigla.tipo_objeto} - ${destinoSigla.sigla || 'S/ID'})` : ''; 
                      
                      //console.log ('--------------------------------------------------> conteudo de destinoinfo: ', destinoInfo);
                      //node1.data.labelText = this.VetorBocas[0].BOCA1 + "__(Boca:1)__\n" + this.VetorTipoCabos[0].Label_cabo ;//+ " (Destino:" + this.VetorDestinoSiglas[0].tipo_objeto + "  " + this.VetorDestinoSiglas[0].sigla + ")" ;
                      //node1.data.labelText = this.VetorBocas[0].BOCA1 + "__(Boca:1)__\n" + (this.VetorTipoCabos[0]?.Label_cabo || '') + this.VetorDestinoSiglas[0].sigla;    
                      
                      this.diagram.updateAllTargetBindings();  // força atualização do bindin}}

                          

          }
                                  
          // Método 2: Como alternativa, usando findNodeForKey
          let node2 = this.diagram!.findNodeForKey("Boca2");
          //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
          
          if (node2) {
            console.log("Node cabo2 encontrado via findNodeForKey:", node2);
                        console.log("Aplicando transformação ao cabo2");
                        //console.log("=============>sigla:",this.VetorDestinoSiglas[1].sigla)
                        node2.resizable=true;
                        node2.rotatable=true;
                        node2.movable=true;
                        if (this.VetorBocas[0].ROT2 !== undefined && this.VetorBocas[0].ROT2 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT2));
                        const rotationRadians = rotationDegrees;
                        node2.angle = rotationRadians;}
                        //node2.angle=this.VetorBocas[0].ROT2;
                        if (this.VetorBocas[0].X2!=0 || this.VetorBocas[0].Y2 != 0) {node2.position=new go.Point(Math.round(this.VetorBocas[0].X2),Math.round(this.VetorBocas[0].Y2));}
                        else {node2.position=new go.Point(1500,500);
                        }
                        node2.scale=1;                        
                        
                          //node2.data.labelText = this.VetorBocas[0].BOCA2 + "__Boca:2__\n" + this.VetorTipoCabos[1].Label_cabo ;//+ " (Destino:" + this.VetorDestinoSiglas[1].tipo_objeto + "  " + this.VetorDestinoSiglas[1].sigla + ")" ;
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
                        if (this.VetorBocas[0].ROT3 !== undefined && this.VetorBocas[0].ROT3 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT3));
                        const rotationRadians = rotationDegrees;
                        node3.angle = rotationRadians;}  
                        if (this.VetorBocas[0].X3!=0 || this.VetorBocas[0].Y3 != 0) {node3.position=new go.Point(Math.round(this.VetorBocas[0].X3),Math.round(this.VetorBocas[0].Y3));}
                        else {node3.position=new go.Point(200,1000);
                        }
                        //node3.data.labelText = this.VetorBocas[0].BOCA3 + "__Boca:3__\n" + this.VetorTipoCabos[2].Label_cabo ;//+ " (Destino:" + this.VetorDestinoSiglas[2].tipo_objeto + "  " + this.VetorDestinoSiglas[2].sigla + ")" ;
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
                        if (this.VetorBocas[0].ROT4 !== undefined && this.VetorBocas[0].ROT4 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT4));
                        const rotationRadians = rotationDegrees;
                        node4.angle = rotationRadians;}
                        //node4.angle=this.VetorBocas[0].ROT4;
                        if (this.VetorBocas[0].X4!=0 || this.VetorBocas[0].Y4 != 0) {node4.position=new go.Point(Math.round(this.VetorBocas[0].X4),Math.round(this.VetorBocas[0].Y4));}  
                        else {node4.position=new go.Point(1000,1000);}
                        //node4.data.labelText = this.VetorBocas[0].BOCA4 + "__Boca:4__\n" + this.VetorTipoCabos[3].Label_cabo;
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
                        if (this.VetorBocas[0].ROT5 !== undefined && this.VetorBocas[0].ROT5 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT5));
                        const rotationRadians = rotationDegrees;
                        node5.angle = rotationRadians;}
                        if (this.VetorBocas[0].X5!=0 || this.VetorBocas[0].Y5 != 0) {node5.position=new go.Point(Math.round(this.VetorBocas[0].X5),Math.round(this.VetorBocas[0].Y5));}    
                        else {node5.position=new go.Point(200,1500)};
                        //node5.data.labelText = this.VetorBocas[0].BOCA5 + "__Boca:5__\n" + this.VetorTipoCabos[4].Label_cabo;
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
                        if (this.VetorBocas[0].ROT6 !== undefined && this.VetorBocas[0].ROT6 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT6));
                        const rotationRadians = rotationDegrees;
                        node6.angle = rotationRadians;}
                        if (this.VetorBocas[0].X6!=0 || this.VetorBocas[0].Y6 != 0) {node6.position=new go.Point(Math.round(this.VetorBocas[0].X6),Math.round(this.VetorBocas[0].Y6));}    
                        else {node6.position=new go.Point(1000,1500)};
                        //node6.data.labelText = this.VetorBocas[0].BOCA6 + "__Boca:6__\n" + this.VetorTipoCabos[5].Label_cabo;
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
                        if (this.VetorBocas[0].ROT7 !== undefined && this.VetorBocas[0].ROT7 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT7));
                        const rotationRadians = rotationDegrees;
                        node7.angle = rotationRadians;}
                        if (this.VetorBocas[0].X7!=0 || this.VetorBocas[0].Y7 != 0) {node7.position=new go.Point(Math.round(this.VetorBocas[0].X7),Math.round(this.VetorBocas[0].Y7));}  
                        else {node7.position=new go.Point(0,1800)};
                        //node7.data.labelText = this.VetorBocas[0].BOCA7 + "__Boca:7__\n" + this.VetorTipoCabos[6].Label_cabo;
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
                        if (this.VetorBocas[0].ROT8 !== undefined && this.VetorBocas[0].ROT8 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT8));
                        const rotationRadians = rotationDegrees;
                        node8.angle = rotationRadians;}
                        if (this.VetorBocas[0].X8!=0 || this.VetorBocas[0].Y8 != 0) {node8.position=new go.Point(Math.round(this.VetorBocas[0].X8),Math.round(this.VetorBocas[0].Y8));}    
                        else {node8.position=new go.Point(1200,1800);}
                        //node8.data.labelText = this.VetorBocas[0].BOCA8 + "__Boca:8__\n" + this.VetorTipoCabos[7].Label_cabo;
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
                        if (this.VetorBocas[0].ROT9 !== undefined && this.VetorBocas[0].ROT9 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT9));
                        const rotationRadians = rotationDegrees;
                        node9.angle = rotationRadians;}
                        if (this.VetorBocas[0].X9!=0 || this.VetorBocas[0].Y9 != 0) {node9.position=new go.Point(Math.round(this.VetorBocas[0].X9),Math.round(this.VetorBocas[0].Y9));}  
                        else {node9.position=new go.Point(200,2000);}
                        //node9.data.labelText = this.VetorBocas[0].BOCA9 + "__Boca:9__\n" + this.VetorTipoCabos[8].Label_cabo;
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
                        if (this.VetorBocas[0].ROT10 !== undefined && this.VetorBocas[0].ROT10 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT10));
                        const rotationRadians = rotationDegrees;
                        node10.angle = rotationRadians;}  
                        if (this.VetorBocas[0].X10!=0 || this.VetorBocas[0].Y10 != 0) {node10.position=new go.Point(Math.round(this.VetorBocas[0].X10),Math.round(this.VetorBocas[0].Y10));}  
                        else {node10.position=new go.Point(1000,2000);}
                        //node10.data.labelText = this.VetorBocas[0].BOCA10 + "__Boca:10__\n" + this.VetorTipoCabos[9].Label_cabo;
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
                        if (this.VetorBocas[0].ROT11 !== undefined && this.VetorBocas[0].ROT11 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT11));
                        const rotationRadians = rotationDegrees;
                        node11.angle = rotationRadians;} 
                        if (this.VetorBocas[0].X11!=0 || this.VetorBocas[0].Y11 != 0) {node11.position=new go.Point(Math.round(this.VetorBocas[0].X11),Math.round(this.VetorBocas[0].Y11));}   
                        else {node11.position=new go.Point(200,2500);}
                        //node11.data.labelText = this.VetorBocas[0].BOCA11 + "__Boca:11__\n" + this.VetorTipoCabos[10].Label_cabo;
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
                        if (this.VetorBocas[0].ROT12 !== undefined && this.VetorBocas[0].ROT12 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT12));
                        const rotationRadians = rotationDegrees;
                        node12.angle = rotationRadians;}
                        if (this.VetorBocas[0].X12!=0 || this.VetorBocas[0].Y12 != 0) {node12.position=new go.Point(Math.round(this.VetorBocas[0].X12),Math.round(this.VetorBocas[0].Y12));}  
                        else{node12.position=new go.Point(1000,2500);}
                        //node12.data.labelText = this.VetorBocas[0].BOCA12 + "__Boca:12__\n" + this.VetorTipoCabos[11].Label_cabo;
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
                        if (this.VetorBocas[0].ROT13 !== undefined && this.VetorBocas[0].ROT13 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT13));
                        const rotationRadians = rotationDegrees;
                        node13.angle = rotationRadians;}
                        if (this.VetorBocas[0].X13!=0 || this.VetorBocas[0].Y13 != 0) {node13.position=new go.Point(Math.round(this.VetorBocas[0].X13),Math.round(this.VetorBocas[0].Y13));}  
                        else{node13.position=new go.Point(200,3000);}
                        //node13.data.labelText = this.VetorBocas[0].BOCA13 + "__Boca:13__\n" + this.VetorTipoCabos[12].Label_cabo;
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
                        if (this.VetorBocas[0].ROT14 !== undefined && this.VetorBocas[0].ROT14 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT14));
                        const rotationRadians = rotationDegrees;
                        node14.angle = rotationRadians;}
                        if (this.VetorBocas[0].X14!=0 || this.VetorBocas[0].Y14 != 0) {node14.position=new go.Point(Math.round(this.VetorBocas[0].X14),Math.round(this.VetorBocas[0].Y14));}  
                        else {node14.position=new go.Point(1000,3000);}
                        //node14.data.labelText = this.VetorBocas[0].BOCA14 + "__Boca:14__\n" + this.VetorTipoCabos[13].Label_cabo;
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
                        if (this.VetorBocas[0].ROT15 !== undefined && this.VetorBocas[0].ROT15 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT15));
                        const rotationRadians = rotationDegrees;
                        node15.angle = rotationRadians;} 
                        if (this.VetorBocas[0].X15!=0 || this.VetorBocas[0].Y15 != 0) {node15.position=new go.Point(Math.round(this.VetorBocas[0].X15),Math.round(this.VetorBocas[0].Y15));} 
                        else {node15.position=new go.Point(200,3500);}
                        //node15.data.labelText = this.VetorBocas[0].BOCA15 + "__Boca:15__\n";
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
                        if (this.VetorBocas[0].ROT16 !== undefined && this.VetorBocas[0].ROT16 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT16));
                        const rotationRadians = rotationDegrees;
                        node16.angle = rotationRadians;}
                        if (this.VetorBocas[0].X16!=0 || this.VetorBocas[0].Y16 != 0) {node16.position=new go.Point(Math.round(this.VetorBocas[0].X16),Math.round(this.VetorBocas[0].Y16));}  
                        else{node16.position=new go.Point(1000,3500);}
                        //node16.data.labelText = this.VetorBocas[0].BOCA16 + "__Boca:16__\n";
                          this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }


            let node17 = this.diagram!.findNodeForKey("Boca17");             

            if (node17) {
            console.log("Node cabo17 encontrado via findNodeForKey:", node17);
            //if (this.diagram) {console.log(this.diagram.model.nodeDataArray)}
                        console.log("Aplicando transformação ao cabo17");
                        node17.resizable=true;
                        node17.rotatable=true;
                        node17.rotateObject.scale=10;
                        node17.scale=1;
                        if (this.VetorBocas[0].ROT17 !== undefined && this.VetorBocas[0].ROT17 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT17));
                        const rotationRadians = rotationDegrees;
                        node17.angle = rotationRadians;} 
                        if (this.VetorBocas[0].X17!=0 || this.VetorBocas[0].Y17 != 0) {node17.position=new go.Point(Math.round(this.VetorBocas[0].X17),Math.round(this.VetorBocas[0].Y17));} 
                        else {node17.position=new go.Point(200,4000);}
                        //node17.data.labelText = this.VetorBocas[0].BOCA17 + "__Boca:17__\n";
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
                        if (this.VetorBocas[0].ROT18 !== undefined && this.VetorBocas[0].ROT18 !== null) {
                        const rotationDegrees = parseFloat(String(this.VetorBocas[0].ROT18));
                        const rotationRadians = rotationDegrees;
                        node18.angle = rotationRadians;}
                        if (this.VetorBocas[0].X18!=0 || this.VetorBocas[0].Y18 != 0) {node18.position=new go.Point(Math.round(this.VetorBocas[0].X18),Math.round(this.VetorBocas[0].Y18));}  
                        else {node18.position=new go.Point(1000,4000);}
                        //node18.data.labelText = this.VetorBocas[0].BOCA18 + "__Boca:18__\n";
                        this.diagram?.updateAllTargetBindings();  // força atualização do bindin}})             
          
            }
          
                     
          
             else {
            console.error("Não foi possível encontrar o cabo por nenhum método");

          }
          // Finaliza a transação única
          console.log('===================> commit do gojs aplicado')
          this.diagram?.commitTransaction();

           //🆕 NOVO - Aplicar labels após propriedades físicas estarem prontas
        setTimeout(async () => {
        console.log('🏷️ Aplicando labels com siglas após propriedades físicas...');
        await this.aplicarLabelsComSiglas();


        setTimeout(() => {this.carregarConexoesBocas()},1); // conexoes de bocas para bocas (cabos com cabos)


        //setTimeout(() => {this.carregarConexoesSplitters()},2000); //agora esta em adicionarSplittersAoDiagrama()
        //setTimeout(() => {this.carregarConexoesBocas9798()},1000); //agora adicionarSplittersAoDiagrama()

        


         setTimeout(() => {
            this.aplicarCoresEmTodasAsConexoes();
          }, 3000);
    








      }, 400); 

          
        }, 1);


     
  }

  private validarPosicaoYMinima(node: go.Node, newPosition: go.Point): go.Point {
    // ⚠️ LIMITAÇÃO DE Y NEGATIVO: Impede que os nodes sejam arrastados para Y < 0
    const minY = 10; // Coordenada Y mínima permitida
    
    if (newPosition.y < minY) {
      console.log(`🚫 Node ${node.data.key} tentou mover para Y=${newPosition.y}, limitando para Y=${minY}`);
      return new go.Point(newPosition.x, minY);
    }
    
    return newPosition;
  }
//========================================Aplicando labels nos cabos apos os campos de destino e destino sigla ter carregado nos vetores==========================================================================

// 🆕 NOVA FUNÇÃO - Aplicar labels com siglas após carregamento completo


  private async aplicarLabelsComSiglas(): Promise<void> {

    
    if (!this.diagram) {
      console.error('❌ Diagrama não está disponível para aplicar labels');
      return;
    }

    console.log('🏷️ Iniciando aplicação de labels com siglas...');
    console.log('📊 VetorDestinoSiglas atual:', this.VetorDestinoSiglas);
    console.log('📊 VetorBocas atual:', this.VetorBocas);
    console.log('📊 VetorTipoCabos atual:', this.VetorTipoCabos);

    // Verificações de segurança
    if (!this.VetorDestinoSiglas || this.VetorDestinoSiglas.length === 0) {
      console.warn('⚠️ VetorDestinoSiglas vazio, criando array com elementos vazios');
      this.VetorDestinoSiglas = new Array(18).fill(null).map(() => ({
        tipo_objeto: '',
        id_meta: '',
        sigla: ''
      }));
    }

    if (!this.VetorBocas || this.VetorBocas.length === 0) {
      console.warn('⚠️ VetorBocas vazio, não é possível aplicar labels');
      return;
    }

    try {
      this.diagram.startTransaction("Aplicar labels com siglas");

      // Aplicar labels para cada boca (1-18)
      for (let i = 1; i <= 18; i++) {
        const node = this.diagram.findNodeForKey(`Boca${i}`);
        if (node) {
          const arrayIndex = i - 1; // Converter para índice do array (0-17)
          const bocaKey = `BOCA${i}` as keyof typeof this.VetorBocas[0];
          const bocaValue = this.VetorBocas[0][bocaKey];

          // Verificar se a boca tem valor válido
          if (!bocaValue || bocaValue === ' ' || bocaValue === '0' || bocaValue.trim() === '') {
            console.log(`   Boca ${i}: sem cabo válido, pulando label`);
            continue;
          }

          // Obter dados do destino e sigla
          const destinoSigla = this.VetorDestinoSiglas[arrayIndex];
          const tipoCabo = this.VetorTipoCabos[arrayIndex];

          // Construir informação do destino
          let destinoInfo = '';
          if (destinoSigla && destinoSigla.tipo_objeto && destinoSigla.tipo_objeto.trim() !== '') {
            const siglaTexto = destinoSigla.sigla && destinoSigla.sigla.trim() !== '' ? destinoSigla.sigla : 'aberto';
            destinoInfo = ` (Destino: ${destinoSigla.tipo_objeto} - ${siglaTexto})`;
          }

          // Construir label completo
          const tipoCaboLabel = tipoCabo?.Label_cabo || '';
          const labelCompleto = `${bocaValue}__Boca:${i}__\n${tipoCaboLabel}${destinoInfo} \n`;

          // Aplicar o label
          node.data.labelText = labelCompleto;
          
          console.log(`✅ Label aplicado para Boca ${i}: ${labelCompleto}`);
        } else {
          console.log(`⚠️ Node Boca${i} não encontrado`);
        }
      }

      // Atualizar todas as bindings do diagrama
      this.diagram.updateAllTargetBindings();
      this.diagram.commitTransaction();

      console.log('✅ Labels com siglas aplicados com sucesso!');

    } catch (error) {
      console.error('❌ Erro ao aplicar labels com siglas:', error);
      if (this.diagram) {
        this.diagram.rollbackTransaction();
      }
    }
  }

//DIAGRAMA=============================================================================================================
//==============================================================================================================
//======================================= inicicialise diagrama ===============================================
  private initializeDiagram(): void {
    console.log('🔀 [DEBUG] Método initializeDiagram() chamado');
    console.log('🔀 [DEBUG] Iniciando diagrama GoJS...');
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
          //this.diagram.commandHandler.zoomToFit
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
          "maxScale": 2,    //====> ajuste zoom
          "minScale": 0.2, //====> ajuste zoom
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


              
            }),

        

          // ⚠️ LIMITAÇÃO DE ARRASTE: Função para validar posições durante o movimento
          "positionComputation": (diagram: go.Diagram, pt: go.Point) => {
            // 🚫 Impede coordenadas X e Y negativas
            return new go.Point(Math.max(-3000, pt.x), Math.max(0, pt.y));
          }
        


        });

        this.diagram.toolManager.rotatingTool.isEnabled = true;
        this.diagram.toolManager.rotatingTool.snapAngleMultiple = 15; // Snap a cada 15°
        this.diagram.toolManager.rotatingTool.computeRotate;

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

        


        //*************************************************movimento do cabo capturar X Y cabos e splitters ******************************************************** */ 
        // Adicionar listener para capturar movimento de cabos
        this.diagram.addDiagramListener("SelectionMoved", (e: go.DiagramEvent) => {
          e.subject.each((node: go.Node) => {

            // ⚠️ VALIDAÇÃO DE POSIÇÃO Y: Verificar se o node foi movido para coordenada Y negativa
            const currentPos = node.position;
            const validatedPos = this.validarPosicaoYMinima(node, currentPos);
            
            // Se a posição foi ajustada, aplicar a correção
            if (validatedPos.y !== currentPos.y) {
              node.position = validatedPos;
            }
            //======================================================================================


            if (node.data.key && node.data.key.startsWith("Boca")) {
              const apenasNumBoca = node.data.key.replace('Boca','');
              console.log(`Cabo ${node.data.key} movido para POSIÇÃO:`, {
                x: node.position.x,
                y: node.position.y
              });
              const xboca= node.position.x;
              const yboca= node.position.y;
              this.UpdateBCXYService.atualizar(xboca, yboca, apenasNumBoca).subscribe({next:(response)=>{console.log ('Coordenas Cabo atualizadas', response)}})
              }
              
              if (node.data.key && node.data.key.startsWith("Splitter")) {
              const apenasNumBoca = node.data.key.replace('Splitter','');
              console.log(`Splitter ${node.data.key} movido para POSIÇÃO:`, {
                x: node.position.x,
                y: node.position.y
              });
              const xboca= node.position.x;
              const yboca= node.position.y;
              this.UpdateSPXYService.atualizar(xboca, yboca, apenasNumBoca).subscribe({next:(response)=>{console.log ('Coordenas Splitter atualizadas', response)}})
              }



          });
        });

       //============================================ ROTAÇÃO CABO E SPLITTER ===================================================== 

       // 🔄 NOVO - Listener específico para rotação com PartRotated
        this.diagram.addDiagramListener("PartRotated", (e: go.DiagramEvent) => {
          const rotatedObject = e.subject as go.GraphObject;
          const originalAngleDegrees = e.parameter as number; // Ângulo original em graus
          
          // Obter o nó pai do objeto rotacionado
          let node: go.Node | null = null;
          if (rotatedObject instanceof go.Node) {
            node = rotatedObject;
          } else {
            // Se for uma parte do nó, encontrar o nó pai
            node = rotatedObject.part as go.Node;
          }
          
          if (node && node.data && node.data.key) {
            const currentAngleRadians = node.angle; // Ângulo atual em radianos
            const currentAngleDegrees = currentAngleRadians * 180 / Math.PI; // Converter para graus
            
            console.log(`🔄 [PartRotated] Rotação detectada no node ${node.data.key}:`, {
              originalAngleDegrees: originalAngleDegrees,
              currentAngleRadians: currentAngleRadians,
              currentAngleDegrees: currentAngleDegrees.toFixed(1) + '°',
              rotationDelta: (currentAngleDegrees - originalAngleDegrees).toFixed(1) + '°'
            });

            // Detectar se é um cabo (Boca)
            if (node.data.key.startsWith("Boca")) {
              const apenasNumBoca = node.data.key.replace('Boca','');
              console.log(`🔄 Cabo ${node.data.key} rotacionado:`, {
                de: originalAngleDegrees.toFixed(1) + '°',
                para: currentAngleDegrees.toFixed(1) + '°',
                radianos: currentAngleRadians
              });
              
              // TODO: Implementar serviço para salvar ângulo do cabo
               this.UpdateBCAngleService.atualizar(currentAngleRadians, apenasNumBoca).subscribe();
            }
            
            // Detectar se é um splitter
            if (node.data.key.startsWith("Splitter")) {
              const apenasNumSplitter = node.data.key.replace('Splitter','');
              console.log(`🔄 Splitter ${node.data.key} rotacionado:`, {
                de: originalAngleDegrees.toFixed(1) + '°',
                para: currentAngleDegrees.toFixed(1) + '°',
                radianos: currentAngleRadians
              });

              // this.UpdateSPAngleService.atualizar(currentAngleRadians, apenasNumSplitter)
            }
          }
        });

        // 🆕 NOVO: Context menu nativo do GoJS para splitters
        // 🆕 CORREÇÃO: Adicionar listener APENAS UMA VEZ globalmente
        if (!GoJSDemoComponent.globalListenerAdded) {
          console.log('🔀 [GLOBAL] Adicionando listener splitterContextMenu pela primeira vez');
          
          this.handleSplitterContextMenu = (event: any) => {
            const { action, data } = event.detail;
            
            switch (action) {
              case 'mapear':
                this.abrirModalSplitter(data);
                break;
              case 'info':
                alert(`Splitter: ${data.labelText}\nID: ${data.idmeta}\nTipo: ${data.tipoSplitter}`);
                break;
              case 'config':
                alert('Função de configuração será implementada em breve!');
                break;
            }
          };

          window.addEventListener('splitterContextMenu', this.handleSplitterContextMenu);
          GoJSDemoComponent.globalListenerAdded = true;
          console.log('🔀 [GLOBAL] Listener splitterContextMenu adicionado globalmente');
        } else {
          console.log('🔀 [GLOBAL] Listener splitterContextMenu já existe globalmente');
        }



        

        // Definindo o modelo de nós para o diagrama
        // Agora usando o nodeTemplate definido no componente do modelo

        const caboTemplateMap = new go.Map<string, go.Node>();

        // Adicionar templates DROPS
        caboTemplateMap.add("cabo1F", this.cabo1FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo1F_D", this.cabo1FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo1FINT", this.cabo1FINT.getNodeTemplate());
        caboTemplateMap.add("cabo1FINT_D", this.cabo1FINT_D.getNodeTemplate());

        caboTemplateMap.add("cabo2F", this.cabo2FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo2F_D", this.cabo2FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo2FINT", this.cabo2FINT.getNodeTemplate());
        caboTemplateMap.add("cabo2FINT_D", this.cabo2FINT_D.getNodeTemplate());


        caboTemplateMap.add("cabo4F_D", this.cabo4FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo4F", this.cabo4FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo4FINT_D", this.cabo4FINT_D.getNodeTemplate());
        caboTemplateMap.add("cabo4FINT", this.cabo4FINT.getNodeTemplate());


        caboTemplateMap.add("cabo6F_D", this.cabo6FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo6F", this.cabo6FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo6FINT_D", this.cabo6FINT_D.getNodeTemplate());
        caboTemplateMap.add("cabo6FINT", this.cabo6FINT.getNodeTemplate());


        caboTemplateMap.add("cabo8F_D", this.cabo8FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo8F", this.cabo8FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo8FINT_D", this.cabo8FINT_D.getNodeTemplate());
        caboTemplateMap.add("cabo8FINT", this.cabo8FINT.getNodeTemplate());


        caboTemplateMap.add("cabo12F_NAC", this.cabo12F_NAC.getNodeTemplate());
        caboTemplateMap.add("cabo12F_NAC_D", this.cabo12F_NAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo12FINT", this.cabo12FINT.getNodeTemplate());
        caboTemplateMap.add("cabo12FINT_D", this.cabo12FINT_D.getNodeTemplate());
        caboTemplateMap.add("cabo12FNAC_TB12", this.cabo12FNAC_TB12.getNodeTemplate());
        caboTemplateMap.add("cabo12FNAC_D_TB12", this.cabo12FNAC_D_TB12.getNodeTemplate());
        caboTemplateMap.add("cabo12FINT_TB12", this.cabo12FINT_TB12.getNodeTemplate());
        caboTemplateMap.add("cabo12FINT_D_TB12", this.cabo12FINT_D_TB12.getNodeTemplate());
        caboTemplateMap.add("cabo12FNAC_TB2", this.cabo12FNAC_TB2.getNodeTemplate());
        caboTemplateMap.add("cabo12FNAC_D_TB2", this.cabo12FNAC_D_TB2.getNodeTemplate());
        caboTemplateMap.add("cabo12FINT_TB2", this.cabo12FINT_TB2.getNodeTemplate());
        caboTemplateMap.add("cabo12FINT_D_TB2", this.cabo12FINT_D_TB2.getNodeTemplate());


        caboTemplateMap.add("cabo24F", this.cabo24FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo24F_D", this.cabo24FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo24F_INT", this.cabo24FINT.getNodeTemplate());
        caboTemplateMap.add("cabo24F_INT_D", this.cabo24FINT_D.getNodeTemplate());
        caboTemplateMap.add("cabo24F_NAC_TB24", this.cabo24FNAC_TB24.getNodeTemplate());
        caboTemplateMap.add("cabo24F_NAC_D_TB24", this.cabo24FNAC_D_TB24.getNodeTemplate());
        caboTemplateMap.add("cabo24F_INT_TB24", this.cabo24FINT_TB24.getNodeTemplate());
        caboTemplateMap.add("cabo24F_INT_D_TB24", this.cabo24FINT_D_TB24.getNodeTemplate());


        caboTemplateMap.add("cabo36F", this.cabo36FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo36F_D", this.cabo36FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo36FINT", this.cabo36FINT.getNodeTemplate());
        caboTemplateMap.add("cabo36FINT_D", this.cabo36FINT_D.getNodeTemplate());

        caboTemplateMap.add("cabo48F_D", this.cabo48FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo48F", this.cabo48FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo48FINT_D", this.cabo48FINT_D.getNodeTemplate());
        caboTemplateMap.add("cabo48FINT", this.cabo48FINT.getNodeTemplate());

        caboTemplateMap.add("cabo72F_D", this.cabo72FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo72F", this.cabo72FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo72FINT_D", this.cabo72FINT_D.getNodeTemplate());
        caboTemplateMap.add("cabo72FINT", this.cabo72FINT.getNodeTemplate());

        caboTemplateMap.add("cabo144F_D", this.cabo144FNAC_D.getNodeTemplate());
        caboTemplateMap.add("cabo144F", this.cabo144FNAC.getNodeTemplate());
        caboTemplateMap.add("cabo144FINT_D", this.cabo144FINT_D.getNodeTemplate());
        caboTemplateMap.add("cabo144FINT", this.cabo144FINT.getNodeTemplate());



        
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
              stroke: "#2196F3",
              name: "LINKSHAPE"
            })
          )
          .add(
            new go.Shape({  // Seta na ponta da linha
              toArrow: "Standard",
              stroke: null,
              fill: "#2F4F4F",
              scale: 0.8,
              name: "ARROWSHAPE"
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

            // 🔗 NOVO: Realizar fusão interna via API
            this.realizarFusaoInterna(
              fromCableKey,
              fromPortNumber,
              toCableKey,
              toPortNumber
            );

            this.aplicarCorDoPortNaConexao(link);

          }
        }  );

        


        

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
          },3500); //estava em 100

          


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


    // mudei as conexoes de lugar 13082025
    //setTimeout(() => {this.carregarConexoesBocas()},3000); 
    //setTimeout(() => {this.carregarConexoesSplitters()},3000);
    //setTimeout(() => {this.carregarConexoesBocas9798()},2000);
    

    

    //setTimeout(() => {this.adicionarDropsAoDiagrama()},1);
    
    //setTimeout(() => {this.selecionar_cabo99()},1); 


    //setTimeout(() => {
    //        this.aplicarCoresEmTodasAsConexoes();
    //      }, 1000);




  }

  /**
   * 🔗 NOVO: Extrai o número da boca de uma string como "Boca1", "boca2", etc.
   * @param bocaKey - String no formato "Boca1", "boca2", "BOCA18", etc.
   * @returns Número da boca (1-18) ou null se não conseguir extrair
   */
  private extrairNumeroBoca(bocaKey: string): number | null {
    if (!bocaKey) return null;
    
    // Remove espaços e converte para minúsculo
    const key = bocaKey.trim().toLowerCase();
    
    // Procura por padrão "boca" seguido de números
    const match = key.match(/boca\s*(\d+)/);
    if (match && match[1]) {
      const numero = parseInt(match[1], 10);
      // Valida se está no range válido (1-18)
      if (numero >= 1 && numero <= 18) {
        return numero;
      }
    }
    
    console.warn(`⚠️ [UPDATE_FUSAO] Não foi possível extrair número da boca de: ${bocaKey}`);
    return null;
  }

  /**
   * 🔗 NOVO: Extrai o número da fibra de uma string como "F1", "F3", "F144", etc.
   * @param portNumber - String no formato "F1", "F3", "f144", etc.
   * @returns Número da fibra (1-144) ou null se não conseguir extrair
   */
  private extrairNumeroFibra(portNumber: string): number | null {
    if (!portNumber) return null;
    
    // Remove espaços e converte para maiúsculo
    const port = portNumber.trim().toUpperCase();
    
    // Procura por padrão "F" seguido de números
    const match = port.match(/^F(\d+)$/);
    if (match && match[1]) {
      const numero = parseInt(match[1], 10);
      // Valida se está no range válido (1-144)
      if (numero >= 1 && numero <= 144) {
        return numero;
      }
    }
    
    console.warn(`⚠️ [UPDATE_FUSAO] Não foi possível extrair número da fibra de: ${portNumber}`);
    return null;
  }

  /**
   * 🔗 NOVO: Realiza fusão interna de fibras dentro da caixa
   * @param fromCableKey - Chave do cabo origem (ex: "Boca1")
   * @param fromPortNumber - Número da porta origem (ex: "F3")
   * @param toCableKey - Chave do cabo destino (ex: "Boca2")
   * @param toPortNumber - Número da porta destino (ex: "F3")
   */
  private realizarFusaoInterna(
    fromCableKey: string,
    fromPortNumber: string,
    toCableKey: string,
    toPortNumber: string
  ): void {
    try {
      // Extrair números das bocas e fibras
      const boca_origem = this.extrairNumeroBoca(fromCableKey);
      const fibra_origem = this.extrairNumeroFibra(fromPortNumber);
      const boca_destino = this.extrairNumeroBoca(toCableKey);
      const fibra_destino = this.extrairNumeroFibra(toPortNumber);

      // Validar se todos os valores foram extraídos corretamente
      if (boca_origem === null || fibra_origem === null || boca_destino === null || fibra_destino === null) {
        console.error('❌ [UPDATE_FUSAO] Erro ao extrair valores:', {
          fromCableKey,
          fromPortNumber,
          toCableKey,
          toPortNumber,
          boca_origem,
          fibra_origem,
          boca_destino,
          fibra_destino
        });
        alert('Erro ao processar conexão. Verifique os valores e tente novamente.');
        return;
      }

      // Obter id_meta_caixa
      const idMetaCaixaStr = this.authService.getIDmetaCaixa();
      if (!idMetaCaixaStr) {
        console.error('❌ [UPDATE_FUSAO] id_meta_caixa não disponível');
        alert('Erro: ID da caixa não encontrado. Certifique-se de que a caixa está aberta.');
        return;
      }

      const id_meta_caixa = parseInt(idMetaCaixaStr, 10);
      if (isNaN(id_meta_caixa)) {
        console.error('❌ [UPDATE_FUSAO] id_meta_caixa inválido:', idMetaCaixaStr);
        alert('Erro: ID da caixa inválido.');
        return;
      }

      console.log('🔗 [UPDATE_FUSAO] Realizando fusão:', {
        boca_origem,
        fibra_origem,
        boca_destino,
        fibra_destino,
        id_meta_caixa
      });

      // Chamar o serviço
      this.updateFusaoService.realizarFusao({
        boca_origem,
        fibra_origem,
        boca_destino,
        fibra_destino,
        id_meta_caixa
      }).subscribe({
        next: (response) => {
          console.log('✅ [UPDATE_FUSAO] Fusão realizada com sucesso:', response);
          if (response.message) {
            // Opcional: mostrar mensagem de sucesso ao usuário
            console.log('✅', response.message);
          }
        },
        error: (error) => {
          console.error('❌ [UPDATE_FUSAO] Erro ao realizar fusão:', error);
          alert(`Erro ao realizar fusão: ${error}`);
        }
      });

    } catch (error) {
      console.error('❌ [UPDATE_FUSAO] Erro inesperado:', error);
      alert('Erro inesperado ao processar a conexão.');
    }
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
    this.dialogRef.close();
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

 //==========================================================IMPRIME PDF=====================================================

  exportarDiagramaParaPDF(): void {
    if (!this.diagram) {
      console.log('Diagrama não está disponível para exportação');
      return;
    }

    try {
      console.log('Iniciando exportação do diagrama para PDF...');
      
      // 🎯 CONFIGURAÇÃO PARA MANTER TAMANHO ORIGINAL:
      const imageData = this.diagram.makeImageData({
        scale: 1,                    // 🔧 Escala 1:1 - sem ampliar
        type: "image/png",
        background: "white",
        returnType: "string",
        size: new go.Size(NaN, NaN)    // 🔧 Usa tamanho natural do diagrama
      }) as string; // 🔧 CORRIGIDO: Cast explícito para string

      if (!imageData) {
        console.error('Falha ao gerar imagem do diagrama');
        return;
      }

      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10; // 🔧 Margem maior para não encostar nas bordas
      
      // 🎯 SEM ESTICAMENTO - Usa tamanho natural da imagem:
      const tempImg = new Image();
      tempImg.onload = () => {
        const imgWidth = tempImg.width;
        const imgHeight = tempImg.height;
        
        // 🔧 Converte pixels para mm (72 DPI padrão)
        const widthMM = imgWidth * 0.264583;
        const heightMM = imgHeight * 0.264583;
        
        // 🔧 Calcula escala APENAS se a imagem for maior que a página
        const maxWidth = pageWidth - (margin * 2);
        const maxHeight = pageHeight - 20; // Espaço para título e rodapé
        
        let finalWidth = widthMM;
        let finalHeight = heightMM;
        
        // 🔧 Só reduz se necessário, nunca aumenta
        if (widthMM > maxWidth || heightMM > maxHeight) {
          const scaleX = maxWidth / widthMM;
          const scaleY = maxHeight / heightMM;
          const scale = Math.min(scaleX, scaleY);
          
          finalWidth = widthMM * scale;
          finalHeight = heightMM * scale;
        }
        
        // 🔧 Centraliza na página
        const x = (pageWidth - finalWidth) / 2;
        const y = 10 + (maxHeight - finalHeight) / 2;
        
        // Adiciona título
        pdf.setFontSize(12);
        pdf.text('Diagrama de Conexões - FiberWorks', pageWidth / 2, 15, { align: 'center' });
        
        // 🎯 Adiciona imagem com tamanho calculado (sem esticar)
        pdf.addImage(imageData, 'PNG', x, y, finalWidth, finalHeight);
        
        // Adiciona rodapé
        pdf.setFontSize(10);
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        pdf.text(`Gerado em: ${dataAtual}`, margin, pageHeight - 10);
        
        const nomeArquivo = `diagrama-conexoes-${new Date().getTime()}.pdf`;
        pdf.save(nomeArquivo);
        
        console.log(`PDF exportado sem esticamento: ${nomeArquivo}`);
        console.log(`Tamanho original: ${imgWidth}x${imgHeight}px`);
        console.log(`Tamanho no PDF: ${finalWidth.toFixed(1)}x${finalHeight.toFixed(1)}mm`);
      };
      
      tempImg.src = imageData;
      
    } catch (error) {
      console.error('Erro ao exportar diagrama para PDF:', error);
    }



    }
  //===============================================================================================================
  // 🎨 Função para aplicar cor do port de origem na conexão
  private aplicarCorDoPortNaConexao(link: go.Link): void {
    const fromPort = link.fromPort;
    
    if (fromPort && fromPort instanceof go.Shape) {
      const portColor = (fromPort as go.Shape).fill;
      
      // Aplicar a cor na linha
      const linkShape = link.findObject("LINKSHAPE") as go.Shape;
      if (linkShape) {
        // ⚡ Exceção para fibra branca: usar linha preta segmentada
        if (portColor === "white" || portColor === "#FFFFFF" || portColor === "#ffffff") {
          linkShape.stroke = "gray";
          linkShape.strokeDashArray = [8, 4]; // Linha pontilhada
          console.log(`  Fibra branca detectada - aplicando linha preta segmentada`);
        } else {
          linkShape.stroke = portColor;
          linkShape.strokeDashArray = null; // Linha sólida
        }
      }
      
      // Aplicar a cor na seta também
      const arrowShape = link.findObject("ARROWSHAPE") as go.Shape;
      if (arrowShape) {
        if (portColor === "white" || portColor === "#FFFFFF" || portColor === "#ffffff") {
          arrowShape.fill = "black";
        } else {
          arrowShape.fill = portColor;
        }
      }
      
      console.log(`  Cor aplicada: ${portColor}`);
    }
  }

  // 🎨 Função para aplicar cores em todas as conexões existentes (para conexões do banco)
  private aplicarCoresEmTodasAsConexoes(): void {
    if (!this.diagram) return;
    
    console.log('🎨 Aplicando cores em todas as conexões carregadas do banco...');
    
    this.diagram.links.each((link: go.Link) => {
      this.aplicarCorDoPortNaConexao(link);
    });
    
    console.log('✅ Cores aplicadas em todas as conexões existentes');
  }

   // 🆕 NOVO - Função para redesenhar completamente o diagrama
  redesenharDiagrama(): void {
    console.log('🔄 Iniciando redesenho completo do diagrama...');
    
    try {
      this.mostrarCursorEspera();

      // 1. Salvar estado da visualização antes de resetar
      this.salvarEstadoVisualizacao();
      
      // 2 Resetar todos os estados
      this.resetarEstados();

      // 3. RECARREGAR dados do banco
      this.carregarDadosCompletosAsync();
           
      
      // 4. Só então redesenhar
      setTimeout(() => {
        this.initializeDiagram();
        console.log('✅ Diagrama redesenhado com sucesso!');
      }, 1000);


      setTimeout(() => {
      // 5. Restaurar estado da visualização
      this.restaurarEstadoVisualizacao();
      }, 1000);

      
    } catch (error) {
      console.error('❌ Erro durante o redesenho:', error);
      this.initializationError = 'Erro ao redesenhar o diagrama';
    } finally {
      setTimeout(() => {
        this.restaurarCursor();
      }, 1000);
    }
  }
   //=============================================função utilizada no redraw=================================================================
  // 🆕 NOVO - Função para resetar todos os estados
  private resetarEstados(): void {
    console.log('🔄 Resetando estados...');
    
    // Resetar flags de inicialização
    this.cabosInicializados = false;
    this.splittersInicializados = false;
    this.dropsInicializados = false;
    this.diagramInitialized = false;
    
    // Resetar flags de conexões
    this.conexoesCriadas = false;
    this.conexoesSPCriadas = false;
    
    // Resetar flags de carregamento
    this.carregamentoEmAndamento = false;
    this.carregamentoEmAndamento99 = false;
    this.carregamentoSPEmAndamento = false;
    
    // Limpar conjuntos de controle
    
    
    this.bocasCarregadas.clear();
    this.splittersCarregados.clear();
    this.bocasProcessadas.clear();
    this.splittersProcessados.clear();
    
    // Limpar mapas de conexões
    this.conexoesPorBoca.clear();
    this.conexoesPorSplitter.clear();
    
    // Resetar arrays de conexões
    this.conexoesCarregadas = [];
    this.conexoesCarregadasSpSp = [];
    this.conexoesSPCarregadas = [];


    // Limpar vetores de dados para forçar recarregamento do banco
    this.VetorBocas = [];
    this.VetorSplitter = [];
    this.VetorTipoCabos = [];
    this.VetorDrops_Sp = [];
    this.VetorPopsCli = [];
    this.VetorDadosPops = [];
    this.VetorDestinoSiglas=[];
    this.VetorDestinoCabos=[];

    // Limpar e reinicializar o diagrama
      this.limparDiagrama();
    
    // Resetar estado do componente de drops
    this.gojsDropComponent.resetarEstado();
    
    console.log('✅ Estados resetados');
  }

  // 🆕 NOVO - Função para limpar completamente o diagrama
  private limparDiagrama(): void {
    console.log('🗑️ Limpando diagrama...');
    
    if (this.diagram) {
      
      
      // Limpar modelo
      if (this.diagram.model) {
        const model = this.diagram.model as go.GraphLinksModel;
        model.nodeDataArray = [];
        model.linkDataArray = [];
      }
      
      // Remover diagram do DOM
      this.diagram.div = null;
      this.diagram = null;
    }
    
    // Limpar erro de inicialização
    this.initializationError = null;
    
    console.log('✅ Diagrama limpo');
  }

//===================================função utilizada no Redraw===========================================

// 🆕 NOVO - Função para salvar estado da visualização
  private salvarEstadoVisualizacao(): void {
    if (!this.diagram) return;
    
    console.log('💾 Salvando estado da visualização...');
    
    // Salvar bounds da viewport
    this.savedViewportBounds = this.diagram.viewportBounds.copy();
    
    // Salvar nível de zoom
    this.savedScale = this.diagram.scale;
    
    console.log('✅ Estado salvo:', {
      bounds: this.savedViewportBounds,
      scale: this.savedScale
    });
  }

  // 🆕 NOVO - Função para restaurar estado da visualização (melhorada)
  private restaurarEstadoVisualizacao(): void {
    if (!this.diagram || !this.savedViewportBounds) return;
    
    console.log('🔄 Restaurando estado da visualização...');
    console.log('Estado a restaurar:', {
      bounds: this.savedViewportBounds,
      scale: this.savedScale
    });
    
    // Aguardar o diagrama ser totalmente renderizado
    setTimeout(() => {
      if (this.diagram && this.savedViewportBounds) {
        // 1. Primeiro aplicar o zoom
        this.diagram.scale = this.savedScale;
        
        // 2. Aguardar um pouco e depois ajustar a posição
        setTimeout(() => {
          if (this.diagram && this.savedViewportBounds) {
            // Calcular o centro da viewport salva
            const centerX = this.savedViewportBounds.centerX;
            const centerY = this.savedViewportBounds.centerY;
            
            // Centralizar nesse ponto
            this.diagram.centerRect(this.savedViewportBounds);
            
            console.log('✅ Estado da visualização restaurado:', {
              centerX,
              centerY,
              scale: this.savedScale,
              finalPosition: this.diagram.position,
              finalScale: this.diagram.scale
            });
          }
        }, 100);
      }
    }, 300); // Aumentei o tempo inicial também
  }

//=========================================================== FUNÇÃO ESPELHAR BOCAS ==============================
espelhar(): void {
    if (!this.diagram) {
      console.log('❌ Diagrama não inicializado');
      return;
    }

    const selectedNode = this.diagram.selection.first();
  
    if (!(selectedNode instanceof go.Node)) {
      console.log('❌ Nenhum node selecionado');
      return;
    }

    const nodeData = selectedNode.data;
    if (!nodeData || !nodeData.key) {
      console.log('❌ Node sem dados válidos');
      return;
    }

    let lado = ''

    console.log('🔄 === FUNÇÃO ESPELHAR DISPARADA ===', nodeData.key);

    const bocaNumber = nodeData.key.replace('Boca', '');

    const ldValue = this.VetorBocas[0][`LD${bocaNumber}` as keyof typeof this.VetorBocas[0]]; 

    console.log('🔄 === FUNÇÃO ESPELHAR BOCA:', bocaNumber);

    if (ldValue === "D") {lado='E'} else {lado='D'}
        
    this.UpdateBCLadoService.atualizar(lado, bocaNumber).subscribe();

    setTimeout(() => {this.redesenharDiagrama();},500)

  }

  /**
   * 🆕 NOVO: Mostrar context menu para splitters
   */
  private showSplitterContextMenu(event: any, splitterData: any): void {
    console.log('🔀 [SPLITTER-CONTEXT] Mostrando context menu para:', splitterData);
    
    // Criar context menu
    const contextMenu = document.createElement('div');
    contextMenu.className = 'splitter-context-menu';
    contextMenu.innerHTML = `
      <div class="context-menu-item" data-action="mapear">
        <mat-icon>account_tree</mat-icon>
        Mapear Splitter
      </div>
    `;
    
    // Determinar posição do mouse
    let x: number, y: number;
    if (event.clientX !== undefined) {
      // Evento de mouse normal
      x = event.clientX;
      y = event.clientY;
    } else if (event.x !== undefined) {
      // Evento do GoJS
      x = event.x;
      y = event.y;
    } else {
      // Fallback
      x = 100;
      y = 100;
    }
    
    // Posicionar menu
    contextMenu.style.position = 'fixed';
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.style.zIndex = '10000';
    
    // Adicionar ao DOM
    document.body.appendChild(contextMenu);
    
    // Adicionar listener para clique
    contextMenu.addEventListener('click', (e) => {
      const action = (e.target as HTMLElement).closest('[data-action]')?.getAttribute('data-action');
      if (action === 'mapear') {
        this.abrirModalSplitter(splitterData);
      }
      document.body.removeChild(contextMenu);
    });
    
    // Remover menu ao clicar fora
    setTimeout(() => {
      document.addEventListener('click', () => {
        if (document.body.contains(contextMenu)) {
          document.body.removeChild(contextMenu);
        }
      }, { once: true });
    }, 100);
  }

  /**
   * 🆕 NOVO: Abrir modal de splitter
   */
  private abrirModalSplitter(splitterData: any): void {
    // 🆕 CORREÇÃO: Debounce mais rigoroso para evitar múltiplas chamadas rápidas
    const now = Date.now();
    const timeDiff = now - this.lastModalCallTime;
    
    if (timeDiff < 1000) { // 1000ms de debounce (aumentado)
      console.log(`🔀 [BLOQUEADO] Chamada muito rápida (${timeDiff}ms)`);
      return;
    }
    this.lastModalCallTime = now;
    
    // 🆕 CORREÇÃO: Evitar múltiplas chamadas simultâneas
    if (this.modalSplitterOpen) {
      console.log('🔀 [BLOQUEADO] Modal já está aberto');
      return;
    }
    
    this.modalSplitterOpen = true;
    console.log('🔀 [ABRINDO] Modal para splitter:', splitterData.idmeta);
    
    // 🆕 DEBUG: Stack trace completo para identificar origem
    const stack = new Error().stack?.split('\n').slice(1, 5);
    console.log('🔀 [STACK] Origem da chamada:');
    stack?.forEach((line, index) => {
      console.log(`  ${index + 1}: ${line.trim()}`);
    });
    
    // Importar MatDialog dinamicamente
    import('@angular/material/dialog').then(({ MatDialog }) => {
      import('../graphviz-splitter-modal/graphviz-splitter-modal.component').then(({ GraphvizSplitterModalComponent }) => {
        const dialogRef = this.dialog.open(GraphvizSplitterModalComponent, {
          width: '90vw',
          height: '90vh',
          maxWidth: '1200px',
          maxHeight: '800px',
          disableClose: false,
          hasBackdrop: false, // 🎯 NOVO: Remover backdrop para não bloquear
          panelClass: 'splitter-modal-container', // 🎯 NOVO: Classe para z-index alto
          data: { 
            idmeta: splitterData.idmeta || (splitterData.key ? splitterData.key.replace('Splitter', '') : splitterData),
            title: `Diagrama Splitter - ${splitterData.label || splitterData.key}`,
            capacidade: this.getCapacidadeFromTipo(splitterData.tipoSplitter) || 8,

          }
        });

        dialogRef.afterClosed().subscribe(result => {
          console.log('Modal Splitter fechado:', result);
          // 🆕 CORREÇÃO: Resetar flag quando modal for fechado
          this.modalSplitterOpen = false;
        });
      });
    });
  }


  private getCapacidadeFromTipo(tipoSplitter: number): number {
    switch(tipoSplitter) {



      case 1: return 2;   // 1:2 Splitter desbalanceado 1/99
      case 2: return 2;   // 1:2 Splitter desbalanceado2/98
      case 3: return 2;   // 1:2 Splitter desbalanceado 5/95
      case 4: return 2;   // 1:2 Splitter desbalanceado 10/90
      case 5: return 2;   // 1:2 Splitter desbalanceado 15/85
      case 6: return 2;   // 1:2 Splitter desbalanceado 20/80
      case 7: return 2;   // 1:2 Splitter desbalanceado 25/75
      case 8: return 2;   // 1:2 Splitter desbalanceado 30/70
      case 9: return 2;   // 1:2 Splitter desbalanceado 35/65
      case 10: return 2;   // 1:2 Splitter desbalanceado 40/60
      case 11: return 2;   // 1:2 Splitter desbalanceado 45/55
      case 12: return 2;   // 1:2
      case 13: return 4;   // 1:4
      case 14: return 8;   // 1:8
      case 15: return 16;  // 1:16
      case 16: return 32;  // 1:32
      default: return 8;  // fallback
    }
  }


}




