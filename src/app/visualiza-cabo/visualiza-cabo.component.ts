import { Component, OnInit, OnDestroy, Inject, AfterViewInit, inject, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSpinner } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FibraDestinoCaboService } from '../servico/fibra-destino-cabo.service';
import { Cabo_TipoService } from '../servico/cabo-tipo.service';
import { FibraDestino, CaboInfo } from '../modelo/FibraDestino';
import { FiberTraceService, FiberTraceResult, FiberTraceStep } from '../servico/fiber-trace.service';
import { Cabo_tipo } from '../modelo/Cabo_tipo';
import { GraphvizModalComponent } from '../graphviz-modal/graphviz-modal.component';
import { FiberTraceUnifilarCaboService } from '../servico/fiber-trace-unifilar-cabo.service';
import { FiberTraceMapCaboService, FiberTraceMapResult, CaboMapHighlightInfo, SplitterMapHighlightInfo } from '../servico/fiber-trace-map-cabo.service';


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
  cor?: string;
}

@Component({
  selector: 'app-visualiza-cabo',
  templateUrl: './visualiza-cabo.component.html',
  styleUrls: ['./visualiza-cabo.component.css'],
  standalone: true,
  imports: [CommonModule, MatIcon, MatSpinner]
})
export class VisualizaCaboComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly fiberTraceMapCaboService = inject(FiberTraceMapCaboService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly cdr = inject(ChangeDetectorRef);
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

  // Propriedades para rastreamento de fibras
  caboInfo: CaboInfo | null = null;
  fibrasPontaA: FibraDestino[] = [];
  fibrasPontaB: FibraDestino[] = [];
  isRastreando = false;
  rastreandoMensagem = '';

  // Propriedades para arrastar o modal (mesmo padrão do visualiza-dio)
  isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private modalElement: HTMLElement | null = null;
  private modalHeaderElement: HTMLElement | null = null;
  private dragListenersAttached = false;
  private readonly boundDragMove = (e: MouseEvent) => this.dragMove(e);
  private readonly boundDragEnd = (e: MouseEvent) => this.dragEnd(e);

  // Propriedades das cores das fibras
  private coresFibras: string[] = [];
  private codigo: number = 0;
  private tubo: number = 0;
  private isNacional: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<VisualizaCaboComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VisualizaCaboDialogData,
    private fibraDestinoService: FibraDestinoCaboService,
    private fiberTraceService: FiberTraceService,
    private caboTipoService: Cabo_TipoService,
    private dialog: MatDialog,
    private FiberTraceUnifilarCaboServ: FiberTraceUnifilarCaboService,
  ) {
    this.config = data.config || {
      title: 'Visualiza Cabo',
      isEditable: false,
      showAllFields: true
    };
  }

  /**
   * Define as cores das fibras baseado no código do cabo e quantidade de fibras por tubo
   * @param codigo 1 = Internacional, 2 = Nacional
   * @param tubo Quantidade de fibras por tubo
   */
  private definirCoresFibras(codigo: number, tubo: number): void {
    this.codigo = codigo;
    this.tubo = tubo;
    this.isNacional = codigo === 2;

    if (this.isNacional) {
      // Cores NACIONAIS
      if (tubo === 2) {
        // TB2: Apenas 2 cores que se repetem
        this.coresFibras = ["#00FF00", "#FFFF00"];
      } else if (tubo === 8) {
        // TB8: 8 cores únicas NACIONAIS
        this.coresFibras = ["#00FF00", "#FFFF00", "#FFFFFF", "#4169E1", "#FF0000", "#8A2BE2", "#8B4513", "#FF69B4"];
      } else if (tubo === 12) {
        // TB12: 12 cores únicas NACIONAIS
        this.coresFibras = ["#00FF00", "#FFFF00", "#FFFFFF", "#4169E1", "#FF0000", "#8A2BE2", "#8B4513", "#FF69B4", "#000000", "#808080", "#FFA500", "#00FFFF"];
      } else {
        // Padrão: 6 cores que se repetem
        this.coresFibras = ["#00FF00", "#FFFF00", "#FFFFFF", "#4169E1", "#FF0000", "#8A2BE2"];
      }
    } else {
      // Cores INTERNACIONAIS
      if (tubo === 2) {
        // TB2: Apenas 2 cores que se repetem
        this.coresFibras = ["#4169E1", "#FFA500"];
      } else if (tubo === 8) {
        // TB8: 8 cores únicas INTERNACIONAIS
        this.coresFibras = ["#4169E1", "#FFA500", "#00FF00", "#8B4513", "#808080", "#FFFFFF", "#FF0000", "#000000"];
      } else if (tubo === 12) {
        // TB12: 12 cores únicas INTERNACIONAIS
        this.coresFibras = ["#4169E1", "#FFA500", "#00FF00", "#8B4513", "#808080", "#FFFFFF", "#FF0000", "#000000", "#FFFF00", "#8A2BE2", "#FF69B4", "#00FFFF"];
      } else {
        // Padrão: 6 cores que se repetem
        this.coresFibras = ["#4169E1", "#FFA500", "#00FF00", "#8B4513", "#808080", "#FFFFFF"];
      }
    }

    console.log(`🎨 Cores definidas: ${this.isNacional ? 'NACIONAL' : 'INTERNACIONAL'}, Tubo: ${tubo}, Cores:`, this.coresFibras);
  }

  /**
   * Obtém a cor da fibra baseado no número da fibra
   * @param numeroFibra Número da fibra (1, 2, 3, etc.)
   * @returns Cor da fibra em hexadecimal
   */
  public obterCorFibra(numeroFibra: number): string {
    if (this.coresFibras.length === 0) {
      return '#CCCCCC'; // Cor padrão se não houver cores definidas
    }
    
    const index = (numeroFibra - 1) % this.coresFibras.length;
    return this.coresFibras[index];
  }

  async ngOnInit(): Promise<void> {
    this.initializeButtons();
    this.initializeFiberOptions();
    await this.loadVisualizaCaboData();
  }

  ngAfterViewInit(): void {
    this.setupDragFunctionality();
  }

  ngOnDestroy(): void {
    this.teardownDragListeners();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadVisualizaCaboData(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;

    try {
      // 1. Consultar capacidade do cabo
      console.log(`🔍 Consultando capacidade do cabo ${this.data.id_meta}`);
      const tipoCabo = await this.caboTipoService.selecionarAsync(this.data.id_meta);
      
      if (!tipoCabo || tipoCabo.length === 0) {
        throw new Error('Capacidade do cabo não encontrada');
      }

      const capacidade = parseInt(String(tipoCabo[0].capacidade || '12'));
      
      this.caboInfo = {
        id_meta: this.data.id_meta,
        capacidade: capacidade,
        grupos: this.fibraDestinoService.calcularGrupos(capacidade),
        label: tipoCabo[0].Label_cabo || `Cabo ${this.data.id_meta}`
      };

      // Definir cores das fibras baseado no código e tubo
      const codigo = tipoCabo[0].codigo || 2; // se nao tiver sera nacional
      const tubo = tipoCabo[0].tubo || 6;    // se nao tiver sera 6
      this.definirCoresFibras(codigo, tubo);

      console.log(`✅ Cabo encontrado: ${this.caboInfo.label} - ${capacidade}F`);

      // 2. Atualizar opções de grupos baseado na capacidade
      this.updateFiberOptionsForCapacity(capacidade);

      // 3. Criar dados do visualiza cabo
      this.visualizaCaboData = {
        id_meta: this.data.id_meta,
        nome_cabo: this.caboInfo.label,
        tipo_cabo: `Cabo Óptico ${capacidade}F`,
        fibras: this.generateFiberData()
      };

      // 4. Inicializar botões baseado na capacidade
      this.initializeButtons();

      // 5. Inicializar o grid ANTES do rastreamento
      this.populateFlexGrid();

      // 6. Rastrear primeiro grupo automaticamente (já selecionado)
      await this.rastrearGrupo(1);
      this.isLoading = false;

    } catch (error) {
      console.error('❌ Erro ao carregar dados do cabo:', error);
      this.errorMessage = 'Erro ao carregar dados do cabo';
      this.isLoading = false;
    }
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
    console.log(`🔍 populateFlexGrid - visualizaCaboData:`, !!this.visualizaCaboData);
    if (!this.visualizaCaboData) return;

    // Determinar número de linhas baseado na capacidade do cabo
    const capacidade = this.caboInfo?.capacidade || 12;
    const numeroLinhas = Math.min(capacidade, 12); // Máximo 12 linhas por grupo
    
    console.log(`🔍 populateFlexGrid - Capacidade: ${capacidade}, Linhas: ${numeroLinhas}`);

    // Inicializar grid com número correto de linhas (7 colunas)
    this.flexGridData = [];
    console.log(`🔍 populateFlexGrid - flexGridData inicializado`);
    
    for (let row = 0; row < numeroLinhas; row++) {
      const rowData: FlexGridCell[] = [];
      
      for (let col = 0; col < 7; col++) { // 7 colunas (0-6)
        let value = '';
        let editable = false;
        
        // Definir conteúdo das células baseado na posição
        if (col === 0) {
          value = ''; // Vazio
        } else if (col === 1) {
          value = ''; // PONTA A - Número da fibra (será preenchido pelo rastreamento)
          editable = true;
        } else if (col === 2) {
          value = ''; // PONTA A - Tipo do objeto (será preenchido pelo rastreamento)
          editable = true;
        } else if (col === 3) {
          value = `F${row + 1}`; // F1, F2, F3... - Coluna central colorida
        } else if (col === 4) {
          value = ''; // PONTA B - Tipo do objeto (será preenchido pelo rastreamento)
          editable = true;
        } else if (col === 5) {
          value = ''; // PONTA B - Número da fibra (será preenchido pelo rastreamento)
          editable = true;
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
    
    console.log(`✅ populateFlexGrid - Grid criado com ${this.flexGridData.length} linhas`);
  }

  onFlexGridCellChange(rowIndex: number, colIndex: number, newValue: string): void {
    if (this.flexGridData[rowIndex] && this.flexGridData[rowIndex][colIndex]) {
      this.flexGridData[rowIndex][colIndex].value = newValue;
    }
  }

  // ================================ Botões das Fibras ================================

  /** Número real da fibra na linha do grupo (ex.: grupo 2 → 13, 14, …) */
  numeroFibraDoGrupo(indexZeroBased: number): number {
    const grupo = this.selectedFiberGroup || 1;
    return (grupo - 1) * 12 + indexZeroBased + 1;
  }
  
  private initializeButtons(): void {
    // Determinar número de botões baseado na capacidade do cabo
    const capacidade = this.caboInfo?.capacidade || 12;
    const numeroBotoes = Math.min(capacidade, 12); // Máximo 12 botões por grupo
    
    console.log(`🔍 initializeButtons - Capacidade: ${capacidade}, Botões: ${numeroBotoes}`);

    // Inicializar arrays com número correto de botões
    this.fibraEsmButtons = Array(numeroBotoes).fill(null).map((_, index) => ({ index: index + 1 }));
    this.fibraEsButtons = Array(numeroBotoes).fill(null).map((_, index) => ({ index: index + 1 }));
    this.fibraDsButtons = Array(numeroBotoes).fill(null).map((_, index) => ({ index: index + 1 }));
    this.fibraDsmButtons = Array(numeroBotoes).fill(null).map((_, index) => ({ index: index + 1 }));
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

  // tracer sobre o mapa usando fiberTraceMapCaboService
  onFibraEsmClick(fibraNumber: number): void {
    console.log(`FIBRA_ESM${fibraNumber} clicada`);
    this.runFibraMapTrace(fibraNumber, 'A');
    this.highlightFiberRow(fibraNumber - 1);
  }

  // tracer unifilar usando graphviz
  onFibraEsClick(fibraNumber: number): void {
    fibraNumber = fibraNumber +((this.selectedFiberGroup-1)*12);
    const tubo = this.fiberTraceService.calculateTubo(fibraNumber);

    console.log(`🔴 [DEBUG] onFibraDsClick chamado com fibraNumber: ${fibraNumber}`);
    console.log(`FIBRA_ES${fibraNumber} clicada`);
    
    const tabela = `caboa_t${tubo}`;
    const regist = `FIBRA_${fibraNumber}LABEL`; // FIBRA_1LABEL FIBRA_2LABEL etc. 

    console.log(`🔍 [TRACER-UNIFILAR CABO] Parâmetros: IDMETA=${this.data.id_meta}, Fiber=${fibraNumber}, Tabela=${tabela}, Registro=${regist}`);

    this.FiberTraceUnifilarCaboServ.ANALISA_TABELAGRAFO(this.data.id_meta, fibraNumber, tabela, regist)
    .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (result: any) => {
          this.isLoading = false;
          
          if (result.success) {
                 console.log('✅ [TRACER-UNIFILAR CABO] Rastreamento concluído com sucesso:', result.trace.length, 'passos');
                 console.log('📊 [TRACER-UNIFILAR CABO] Status final:', result.status);
                 console.log('🔍 [TRACER-UNIFILAR CABO] Passos do rastreamento:', result.trace);
                 
                 // 🗺️ NOVO: Capturar cabos percorridos e destacar no mapa
                 const cabosPercorridos = this.FiberTraceUnifilarCaboServ.getCabosPercorridos();
                 const cabosInfo = this.FiberTraceUnifilarCaboServ.getCabosInfo();
                 console.log('🗺️ [TRACER-UNIFILAR CABO] Cabos percorridos capturados:', cabosPercorridos);
                 console.log('🗺️ [TRACER-UNIFILAR CABO] Informações dos cabos:', cabosInfo);
                 console.log('🗺️ [TRACER-UNIFILAR CABO] Total de cabos:', cabosPercorridos.length);
                 
                 // 🗺️ NOVO: Comunicar com o Google Maps para destacar os cabos com capacidade
                 this.highlightCabosNoMapaComCapacidade(cabosInfo);
                 
                 // 🆕 NOVO: DOT string já vem do rastreamento (refatorado!)
                 console.log('🎨 [TRACER] DOT String gerado durante o rastreamento:');
                 console.log(result.dotString);
            
            // 🆕 CORREÇÃO: Só abrir modal quando o rastreamento estiver realmente completo
            if (result.status === 'fim' && result.dotString && result.dotString.includes('size="10"}')) {
              console.log('🎨 [TRACER] DOT String completo - Abrindo modal GraphViz');
              this.openGraphvizModal(result.dotString, fibraNumber);
            } else {
              console.log('⏳ [TRACER] Rastreamento ainda em andamento ou DOT incompleto');
            }
            
           // this.errorMessage = `Rastreamento concluído! ${result.trace.length} passos executados. Status: ${result.status}`;
          } else {
            console.error('❌ [TRACER-UNIFILAR CABO] Erro no rastreamento:', result.error);
            this.errorMessage = `Erro no rastreamento: ${result.error}`;
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('❌ [TRACER-UNIFILAR CABO] Erro no rastreamento:', error);
          this.errorMessage = `Erro no rastreamento: ${error.message}`;
        }
      });

    



    // Aqui você pode adicionar a lógica específica para FIBRA_DS
    // Por exemplo, destacar a linha correspondente no grid
    this.highlightFiberRow(fibraNumber - 1);
  }
  


  //==============================================firbras ponta B do cabo==================================================================
  onFibraDsClick(fibraNumber: number): void {
    

    fibraNumber = fibraNumber +((this.selectedFiberGroup-1)*12);
    const tubo = this.fiberTraceService.calculateTubo(fibraNumber);

    console.log(`🔴 [DEBUG] onFibraDsClick chamado com fibraNumber: ${fibraNumber}`);
    console.log(`FIBRA_DS${fibraNumber} clicada`);
    
    const tabela = `cabob_t${tubo}`;
    const regist = `FIBRA_${fibraNumber}LABEL`; // FIBRA_1LABEL FIBRA_2LABEL etc. 

    console.log(`🔍 [TRACER-UNIFILAR CABO] Parâmetros: IDMETA=${this.data.id_meta}, Fiber=${fibraNumber}, Tabela=${tabela}, Registro=${regist}`);

    this.FiberTraceUnifilarCaboServ.ANALISA_TABELAGRAFO(this.data.id_meta, fibraNumber, tabela, regist)
    .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (result: any) => {
          this.isLoading = false;
          
          if (result.success) {
                 console.log('✅ [TRACER-UNIFILAR CABO] Rastreamento concluído com sucesso:', result.trace.length, 'passos');
                 console.log('📊 [TRACER-UNIFILAR CABO] Status final:', result.status);
                 console.log('🔍 [TRACER-UNIFILAR CABO] Passos do rastreamento:', result.trace);
                 
                 // 🗺️ NOVO: Capturar cabos percorridos e destacar no mapa
                 const cabosPercorridos = this.FiberTraceUnifilarCaboServ.getCabosPercorridos();
                 const cabosInfo = this.FiberTraceUnifilarCaboServ.getCabosInfo();
                 console.log('🗺️ [TRACER-UNIFILAR CABO] Cabos percorridos capturados:', cabosPercorridos);
                 console.log('🗺️ [TRACER-UNIFILAR CABO] Informações dos cabos:', cabosInfo);
                 console.log('🗺️ [TRACER-UNIFILAR CABO] Total de cabos:', cabosPercorridos.length);
                 
                 // 🗺️ NOVO: Comunicar com o Google Maps para destacar os cabos com capacidade
                 this.highlightCabosNoMapaComCapacidade(cabosInfo);
                 
                 // 🆕 NOVO: DOT string já vem do rastreamento (refatorado!)
                 console.log('🎨 [TRACER] DOT String gerado durante o rastreamento:');
                 console.log(result.dotString);
            
            // 🆕 CORREÇÃO: Só abrir modal quando o rastreamento estiver realmente completo
            if (result.status === 'fim' && result.dotString && result.dotString.includes('size="10"}')) {
              console.log('🎨 [TRACER] DOT String completo - Abrindo modal GraphViz');
              this.openGraphvizModal(result.dotString, fibraNumber);
            } else {
              console.log('⏳ [TRACER] Rastreamento ainda em andamento ou DOT incompleto');
            }
            
           // this.errorMessage = `Rastreamento concluído! ${result.trace.length} passos executados. Status: ${result.status}`;
          } else {
            console.error('❌ [TRACER-UNIFILAR CABO] Erro no rastreamento:', result.error);
            this.errorMessage = `Erro no rastreamento: ${result.error}`;
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('❌ [TRACER-UNIFILAR CABO] Erro no rastreamento:', error);
          this.errorMessage = `Erro no rastreamento: ${error.message}`;
        }
      });

    



    // Aqui você pode adicionar a lógica específica para FIBRA_DS
    // Por exemplo, destacar a linha correspondente no grid
    this.highlightFiberRow(fibraNumber - 1);
  }

  //================================================================================================================

  onFibraDsmClick(fibraNumber: number): void {
    console.log(`FIBRA_DSM${fibraNumber} clicada`);
    this.runFibraMapTrace(fibraNumber, 'B');
    this.highlightFiberRow(fibraNumber - 1);
  }
  //================================================================================================================
  private buildFibraTraceParams(fibraNumber: number, ponta: 'A' | 'B'): {
    fibra: number;
    tabela: string;
    regist: string;
  } {
    const fibra = fibraNumber + (this.selectedFiberGroup - 1) * 12;
    const tubo = this.fiberTraceService.calculateTubo(fibra);
    const tabela = ponta === 'A' ? `caboa_t${tubo}` : `cabob_t${tubo}`;
    const regist = `FIBRA_${fibra}LABEL`;
    return { fibra, tabela, regist };
  }

  //================================================================================================================
  private runFibraMapTrace(fibraNumber: number, ponta: 'A' | 'B'): void {
    const { fibra, tabela, regist } = this.buildFibraTraceParams(fibraNumber, ponta);
    const pontaLabel = ponta === 'A' ? 'ESM' : 'DSM';

    console.log(
      `🔍 [TRACER-MAP CABO ${pontaLabel}] Parâmetros: IDMETA=${this.data.id_meta}, Fiber=${fibra}, Tabela=${tabela}, Registro=${regist}`,
    );

    this.clearCabosHighlight();
    this.isLoading = true;
    this.errorMessage = null;

    this.fiberTraceMapCaboService.ANALISA_TABELAGRAFO(this.data.id_meta, fibra, tabela, regist)
      .pipe(takeUntil(this.destroy$)) //utilizado para cancelar a subscrição quando o componente for destruído, evitando memory leaks caso modal seja fechado antes de concluir o rastreamento
      .subscribe({
        next: (result: FiberTraceMapResult) => {
          this.isLoading = false;

          if (result.success) {
            console.log(
              `✅ [TRACER-MAP CABO ${pontaLabel}] Rastreamento concluído:`,
              result.trace.length,
              'passos',
            );
            this.highlightCabosNoMapaComCapacidade(result.cabosInfo, result.splittersInfo);
          } else {
            console.error(`❌ [TRACER-MAP CABO ${pontaLabel}] Erro no rastreamento:`, result.error);
            this.errorMessage = `Erro no rastreamento: ${result.error}`;
          }
        },
        error: (error: unknown) => {
          this.isLoading = false;
          const message = error instanceof Error ? error.message : String(error);
          console.error(`❌ [TRACER-MAP CABO ${pontaLabel}] Erro no rastreamento:`, error);
          this.errorMessage = `Erro no rastreamento: ${message}`;
        },
      });
  }
//================================================================================================================
  private highlightFiberRow(rowIndex: number): void {
    // Lógica para destacar a linha correspondente no grid
    // Por exemplo, adicionar uma classe CSS ou mudar a cor
    console.log(`Destacando linha ${rowIndex + 1} do grid`);
  }

  // ================================ Opções de Grupos de Fibras ================================
  
  async onFiberGroupChange(selectedValue: number): Promise<void> {
    this.selectedFiberGroup = selectedValue;
    const selectedOption = this.fiberOptions.find(opt => opt.value === selectedValue);
    
    if (selectedOption) {
      console.log(`Grupo selecionado: ${selectedOption.label} (Fibras ${selectedOption.startFiber} a ${selectedOption.endFiber})`);
      
      // Rastrear o grupo selecionado
      await this.rastrearGrupo(selectedValue);
    }
  }

  private updateGridForFiberGroup(startFiber: number, endFiber: number): void {
    // Lógica para atualizar o grid baseado no grupo de fibras selecionado
    console.log(`Atualizando grid para fibras ${startFiber} a ${endFiber}`);
    // Por exemplo, mostrar apenas as fibras do grupo selecionado
    // ou destacar as fibras relevantes no grid
  }

  // ================================ Métodos de Rastreamento ================================

  private updateFiberOptionsForCapacity(capacidade: number): void {
    this.fiberOptions = [];
    const grupos = this.fibraDestinoService.calcularGrupos(capacidade);
    
    for (let i = 1; i <= grupos; i++) {
      const startFiber = (i - 1) * 12 + 1;
      const endFiber = Math.min(i * 12, capacidade);
      
      this.fiberOptions.push({
        value: i,
        label: `...${endFiber}F`,
        startFiber: startFiber,
        endFiber: endFiber
      });
    }
    
    // Selecionar automaticamente o primeiro grupo
    this.selectedFiberGroup = 1;
    
    console.log(`✅ Opções de grupos criadas: ${this.fiberOptions.length} grupos para ${capacidade}F`);
    console.log(`✅ Primeiro grupo selecionado automaticamente: ${this.fiberOptions[0]?.label}`);
  }

  private async rastrearGrupo(grupo: number): Promise<void> {
    if (!this.caboInfo) {
      console.error('❌ Informações do cabo não disponíveis');
      return;
    }

    this.isRastreando = true;
    this.rastreandoMensagem = `Rastreando fibras do grupo ${grupo}...`;
    console.log(`🔍 Rastreando grupo ${grupo} - PONTA A e PONTA B`);

    try {
      // Rastrear PONTA A primeiro (sequencial)
      console.log(`🔍 [GRUPO ${grupo}] Iniciando rastreio da PONTA A...`);
      const fibrasA = await this.fibraDestinoService.rastrearGrupoVisualizacaoAsync(
        this.caboInfo.id_meta,
        grupo,
        'A',
        this.caboInfo.capacidade,
        ({ fibra, ponta }) => this.atualizarMensagemRastreio(fibra, ponta),
      );
      this.fibrasPontaA = fibrasA;
      console.log(`✅ [GRUPO ${grupo}] PONTA A concluída: ${fibrasA.length} fibras`);

      // Rastrear PONTA B depois (sequencial)
      console.log(`🔍 [GRUPO ${grupo}] Iniciando rastreio da PONTA B...`);
      const fibrasB = await this.fibraDestinoService.rastrearGrupoVisualizacaoAsync(
        this.caboInfo.id_meta,
        grupo,
        'B',
        this.caboInfo.capacidade,
        ({ fibra, ponta }) => this.atualizarMensagemRastreio(fibra, ponta),
      );
      this.fibrasPontaB = fibrasB;
      console.log(`✅ [GRUPO ${grupo}] PONTA B concluída: ${fibrasB.length} fibras`);

      console.log(`✅ Grupo ${grupo} rastreado completamente:`, {
        pontaA: fibrasA.length,
        pontaB: fibrasB.length
      });

      // Atualizar o grid com os resultados
      this.updateGridWithResults();

    } catch (error) {
      console.error('❌ Erro ao rastrear grupo:', error);
      this.errorMessage = 'Erro ao rastrear fibras do grupo';
    } finally {
      this.isRastreando = false;
      this.rastreandoMensagem = '';
    }
  }

  private atualizarMensagemRastreio(fibra: number, ponta: 'A' | 'B'): void {
    this.rastreandoMensagem = `Rastreando Fibra ${fibra} Ponta ${ponta}...`;
    this.cdr.detectChanges();
  }

  private updateGridWithResults(): void {
    console.log(`🔍 updateGridWithResults - flexGridData:`, this.flexGridData?.length, 'fibrasPontaA:', this.fibrasPontaA?.length);
    if (!this.flexGridData || this.fibrasPontaA.length === 0) {
      console.log(`❌ updateGridWithResults - Condição não atendida: flexGridData=${!!this.flexGridData}, fibrasPontaA.length=${this.fibrasPontaA?.length}`);
      return;
    }

    // Calcular offset baseado no grupo selecionado
    const grupo = this.selectedFiberGroup || 1;
    const offset = (grupo - 1) * 12;
    console.log(`🔍 Atualizando grid para grupo ${grupo} - offset: ${offset}`);

    // Limpar grid atual
    this.flexGridData.forEach(row => {
      row.forEach(cell => {
        if (cell.editable) {
          cell.value = '';
        }
      });
    });

    // Limpar especificamente as colunas de OBS (índices 0 e 6)
    this.flexGridData.forEach(row => {
      if (row[0]) row[0].value = ''; // Coluna 0 - OBS PONTA A
      if (row[6]) row[6].value = ''; // Coluna 6 - OBS PONTA B
    });

    // Determinar número de fibras a processar baseado na capacidade
    const capacidade = this.caboInfo?.capacidade || 12;
    const numeroFibras = Math.min(capacidade, 12);
    
    console.log(`🔍 updateGridWithResults - Processando ${numeroFibras} fibras de ${capacidade}F`);

    // Preencher com resultados do rastreamento
    for (let i = 0; i < this.fibrasPontaA.length && i < numeroFibras; i++) {
      const fibraA = this.fibrasPontaA[i];
      const fibraB = this.fibrasPontaB[i];
      const numeroFibra = offset + i + 1; // Número real da fibra (ex: grupo 2 = F13, F14, F15...)
      
      console.log(`🔍 [GRID DEBUG] Fibra ${i + 1} (Número real: ${numeroFibra}): PONTA A = ${fibraA.tipo_objeto} (obs_dio: ${fibraA.obs_dio}), PONTA B = ${fibraB.tipo_objeto} (obs_dio: ${fibraB.obs_dio})`);

      // Obter cor da fibra apenas para a coluna central
      const corFibra = this.obterCorFibra(numeroFibra);

      // PONTA A - Número da fibra (coluna 1)
      if (this.flexGridData[i] && this.flexGridData[i][1]) {
        this.flexGridData[i][1].value = fibraA.fibra || numeroFibra.toString();
        // Sem cor específica - mantém cor padrão
      }

      // PONTA A - Tipo do objeto (coluna 2)
      if (this.flexGridData[i] && this.flexGridData[i][2]) {
        this.flexGridData[i][2].value = fibraA.tipo_objeto || 'SEM_CONEXAO';
        // Sem cor específica - mantém cor padrão
      }

      // PONTA A - OBS do DIO (coluna 0) - apenas se tiver OBS
      console.log(`🔍 [GRID DEBUG] PONTA A - Verificando: tipo_objeto='${fibraA.tipo_objeto}', obs_dio='${fibraA.obs_dio}', coluna0=${!!this.flexGridData[i]?.[0]}`);
      if (this.flexGridData[i] && this.flexGridData[i][0] && fibraA.obs_dio && fibraA.obs_dio !== '-----') {
        console.log(`🔍 [GRID] PONTA A - DIO OBS encontrada: ${fibraA.obs_dio} para fibra ${i + 1}`);
        this.flexGridData[i][0].value = fibraA.obs_dio;
      }

      // Coluna central - Número da fibra (coluna 3) - ÚNICA que segue o código de cores
      if (this.flexGridData[i] && this.flexGridData[i][3]) {
        this.flexGridData[i][3].value = `F${numeroFibra}`;
        this.flexGridData[i][3].cor = corFibra;
      }

      // PONTA B - Tipo do objeto (coluna 4)
      if (this.flexGridData[i] && this.flexGridData[i][4]) {
        this.flexGridData[i][4].value = fibraB.tipo_objeto || 'SEM_CONEXAO';
        // Sem cor específica - mantém cor padrão
      }

      // PONTA B - Número da fibra (coluna 5)
      if (this.flexGridData[i] && this.flexGridData[i][5]) {
        this.flexGridData[i][5].value = fibraB.fibra || numeroFibra.toString();
        // Sem cor específica - mantém cor padrão
      }

      // PONTA B - OBS do DIO (coluna 6) - apenas se tiver OBS
      console.log(`🔍 [GRID DEBUG] PONTA B - Verificando: tipo_objeto='${fibraB.tipo_objeto}', obs_dio='${fibraB.obs_dio}', coluna6=${!!this.flexGridData[i]?.[6]}`);
      if (this.flexGridData[i] && this.flexGridData[i][6] && fibraB.obs_dio && fibraB.obs_dio !== '-----') {
        console.log(`🔍 [GRID] PONTA B - DIO OBS encontrada: ${fibraB.obs_dio} para fibra ${i + 1}`);
        this.flexGridData[i][6].value = fibraB.obs_dio;
      }

      
    }

    console.log('✅ Grid atualizado com resultados do rastreamento');
  }

  // ================================ Tooltip Debug ================================
  
  onCellHover(value: string, colIndex: number, rowIndex: number): void {
    console.log(`🔍 [TOOLTIP DEBUG] Hover na célula [${rowIndex}][${colIndex}]: "${value}"`);
    console.log(`🔍 [TOOLTIP DEBUG] Valor completo:`, value);
  }

  // ================================ Arrastar Modal Drag Methods (mesmo padrão do visualiza-dio) ================================
  
  private setupDragFunctionality(): void {
    setTimeout(() => {
      this.modalElement = this.elementRef.nativeElement.closest(
        '.mat-mdc-dialog-container',
      ) as HTMLElement | null;
      this.modalHeaderElement = this.elementRef.nativeElement.querySelector(
        '.modal-header',
      ) as HTMLElement | null;

      if (
        this.dragListenersAttached ||
        !this.modalHeaderElement ||
        !this.modalElement
      ) {
        return;
      }

      this.modalHeaderElement.addEventListener('mousedown', (e: MouseEvent) =>
        this.dragStart(e),
      );
      document.addEventListener('mousemove', this.boundDragMove);
      document.addEventListener('mouseup', this.boundDragEnd);
      this.dragListenersAttached = true;
    }, 0);
  }

  private teardownDragListeners(): void {
    if (!this.dragListenersAttached) {
      return;
    }

    document.removeEventListener('mousemove', this.boundDragMove);
    document.removeEventListener('mouseup', this.boundDragEnd);

    if (this.modalHeaderElement) {
      this.modalHeaderElement.classList.remove('dragging');
    }
    if (this.modalElement) {
      this.modalElement.classList.remove('dragging');
    }

    this.dragListenersAttached = false;
    this.isDragging = false;
    this.modalElement = null;
    this.modalHeaderElement = null;
  }

  private dragStart(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    if (
      !this.modalHeaderElement ||
      (event.target !== this.modalHeaderElement &&
        !this.modalHeaderElement.contains(event.target as Node))
    ) {
      return;
    }

    this.isDragging = true;
    this.initialX = event.clientX - this.currentX;
    this.initialY = event.clientY - this.currentY;

    this.modalHeaderElement.classList.add('dragging');
    this.modalElement?.classList.add('dragging');

    event.preventDefault();
  }

  private dragMove(event: MouseEvent): void {
    if (!this.isDragging || !this.modalElement) {
      return;
    }

    event.preventDefault();

    this.currentX = event.clientX - this.initialX;
    this.currentY = event.clientY - this.initialY;

    this.modalElement.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;
  }

  private dragEnd(_event: MouseEvent): void {
    if (!this.isDragging) {
      return;
    }

    this.isDragging = false;
    this.modalHeaderElement?.classList.remove('dragging');
    this.modalElement?.classList.remove('dragging');
  }


/*********************************************************************************************************************
   * 🗺️ NOVO: Destaca cabos percorridos no Google Maps com informações de capacidade
   */
private highlightCabosNoMapaComCapacidade(
  cabosInfo: Array<CaboMapHighlightInfo | { id: number; capacidade: string }>,
  splittersInfo: SplitterMapHighlightInfo[] = [],
): void {
  console.log('🗺️ [HIGHLIGHT] Destacando cabos no mapa com capacidade:', cabosInfo);
  console.log('🗺️ [HIGHLIGHT] Splitters no mapa:', splittersInfo);

  const event = new CustomEvent('highlightCabosComCapacidade', {
    detail: { cabosInfo, splittersInfo },
  });
  window.dispatchEvent(event);

  console.log('🗺️ [HIGHLIGHT] Evento de destaque com capacidade enviado para o Google Maps');
}

/**
 * 🗺️ NOVO: Limpa destaque dos cabos no Google Maps
 */
private clearCabosHighlight(): void {
  console.log('🗺️ [CLEAR] Limpando destaque dos cabos no mapa');
  
  // 🗺️ NOVO: Comunicar com o Google Maps via evento customizado
  const event = new CustomEvent('clearCabosHighlight');
  window.dispatchEvent(event);
  
  console.log('🗺️ [CLEAR] Evento de limpeza enviado para o Google Maps');
}



  // Método para abrir o modal GraphViz
  openGraphvizModal(dotString?: string, fibraNumber?: number): void {
    const dialogRef = this.dialog.open(GraphvizModalComponent, {
      width: '90vw',
      height: '90vh',
      maxWidth: '1200px',
      maxHeight: '800px',
      disableClose: false,
      data: { 
        title: `Diagrama Unifilar Cabo - F${fibraNumber || 'N/A'} (Cabo ${this.data.id_meta})`,
        dotString: dotString || ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal GraphViz fechado:', result);
    });
  }
}