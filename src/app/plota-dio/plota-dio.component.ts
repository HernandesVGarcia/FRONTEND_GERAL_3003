import { Component, Input, OnInit, OnChanges, SimpleChanges, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TiposService } from '../servico/tipos.service';
import { PopsEstService } from '../servico/pops-est.service';
import { PopsEst } from '../modelo/popsEst';
import { AuthService } from '../servico/auth.service';
import { InsertDioService, InsertDioRequest } from '../servico/insert-dio.service';

export interface PlotaDioData {
  lat?: number;
  lng?: number;
  estacaoSelecionada?: PopsEst;  // 🆕 Estação completa para pré-seleção
  id_meta?: number;               // 🆕 ID da estação (se disponível)
  sigla?: string;                 // 🆕 Sigla da estação (já disponível em PopsEst)
}

export interface TipoConector {
  id: number;
  tipo: string;
}

@Component({
  selector: 'app-plota-dio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbModule
  ],
  templateUrl: './plota-dio.component.html',
  styleUrls: ['./plota-dio.component.css']
})
export class PlotaDioComponent implements OnInit, OnChanges {
  // Lista de estações
  estacoes: PopsEst[] = [];
  carregandoEstacoes: boolean = false;
  
  // Lista de bastidores (racks)
  bastidores: string[] = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15'];
  
  // Lista de posições nos bastidores
  posicoes: string[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13', 'C14', 'C15'];
  
  // Opções de capacidade (corrigido: 72 em vez de 71)
  capacidades: number[] = [6, 12, 24, 36, 48, 72, 84, 144];
  
  // Tipos de conector
  tiposConector: TipoConector[] = [];
  carregandoConectores: boolean = false;
  
  salvando: boolean = false;
  
  // Formulário
  form = {
    estacaoSelecionada: null as PopsEst | null,
    bastidorSelecionado: '',
    posicaoSelecionada: '',
    capacidade: null as number | null,
    tipoConector: null as number | null,
    lat: '',
    lng: ''
  };

  @Input() data: PlotaDioData = {};

  // Propriedades para arrastar o modal
  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;

  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef;

  constructor(
    public activeModal: NgbActiveModal,
    private tiposService: TiposService,
    private popsEstService: PopsEstService,
    private authService: AuthService,
    private insertDioService: InsertDioService
  ) {}

  ngOnInit(): void {
    // Carregar estações apenas se não vier pré-selecionada
    if (!this.data?.estacaoSelecionada) {
      this.carregarEstacoes();
    }
  
    // Sempre carregar tipos de conector
    this.carregarTiposConector();
    
    // Preencher formulário com dados recebidos
    this.atualizarFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      console.log('🔄 [PLOTA-DIO] Dados atualizados:', changes['data'].currentValue);
      this.atualizarFormulario();
    }
  }

  /**
   * Atualiza o formulário com os dados recebidos
   */
  private atualizarFormulario(): void {
    if (this.data) {
      // Coordenadas (prioridade: estação > data direto)
      const lat = this.data.estacaoSelecionada?.LAT 
        ? Number(this.data.estacaoSelecionada.LAT) 
        : this.data.lat;
      const lng = this.data.estacaoSelecionada?.LNG 
        ? Number(this.data.estacaoSelecionada.LNG) 
        : this.data.lng;
      
      this.form.lat = lat?.toString().replace('.', ',') || '';
      this.form.lng = lng?.toString().replace('.', ',') || '';
      
      // Definir estação diretamente se pré-selecionada
      if (this.data.estacaoSelecionada) {
        this.form.estacaoSelecionada = this.data.estacaoSelecionada;
        console.log('📋 [PLOTA-DIO] Estação pré-selecionada:', this.data.estacaoSelecionada.sigla);
      }
      
      console.log('📝 [PLOTA-DIO] Formulário atualizado com coordenadas:', {
        lat: this.form.lat,
        lng: this.form.lng,
        estacao: this.form.estacaoSelecionada?.sigla
      });
    }
  }

  /**
   * Carrega as estações da API
   */
  carregarEstacoes(): void {
    this.carregandoEstacoes = true;
    
    this.popsEstService.selecionar().subscribe({
      next: (response) => {
        console.log('✅ [PLOTA-DIO] Estações carregadas:', response);
        
        // A resposta pode vir como array direto ou dentro de 'response'
        if (Array.isArray(response)) {
          this.estacoes = response;
        } else if (response && (response as any).response && Array.isArray((response as any).response)) {
          this.estacoes = (response as any).response;
        } else {
          this.estacoes = [];
        }
        
        console.log('📋 [PLOTA-DIO] Estações disponíveis:', this.estacoes.length);
        this.carregandoEstacoes = false;
      },
      error: (error) => {
        console.error('❌ [PLOTA-DIO] Erro ao carregar estações:', error);
        this.estacoes = [];
        this.carregandoEstacoes = false;
      }
    });
  }

  /**
   * Carrega os tipos de conector da API
   */
  carregarTiposConector(): void {
    this.carregandoConectores = true;
    
    this.tiposService.buscarTiposConector().subscribe({
      next: (response) => {
        console.log('✅ [PLOTA-DIO] Tipos de conector carregados:', response);
        
        if (response.success && response.data && response.data.length > 0) {
          // Extrair os tipos de conector (id e tipo)
          this.tiposConector = response.data.map((item: any) => ({
            id: item.id || item.id_tipoconector || item.id_conector || 0,
            tipo: item.tipo || item.tipoconector || item.conector || ''
          })).filter((item: TipoConector) => item.id > 0 && item.tipo.trim() !== '');
          
          console.log('📋 [PLOTA-DIO] Tipos de conector disponíveis:', this.tiposConector);
        } else {
          console.warn('⚠️ [PLOTA-DIO] Nenhum tipo de conector encontrado na API');
          this.tiposConector = [];
        }
        
        this.carregandoConectores = false;
      },
      error: (error) => {
        console.error('❌ [PLOTA-DIO] Erro ao carregar tipos de conector:', error);
        // Fallback para valores padrão em caso de erro
        this.tiposConector = [
          { id: 1, tipo: 'SC/APC' },
          { id: 2, tipo: 'SC/PC' },
          { id: 3, tipo: 'ST/APC' },
          { id: 4, tipo: 'ST/PC' },
          { id: 5, tipo: 'FC/APC' },
          { id: 6, tipo: 'FC/PC' },
          { id: 7, tipo: 'LC' },
          { id: 8, tipo: 'E2000' }
        ];
        this.carregandoConectores = false;
      }
    });
  }

  /**
   * Organiza as capacidades em linhas para exibição
   */
  getCapacidadeRows(): number[][] {
    return [
      [6, 12, 24, 36],
      [48, 72, 84, 144]
    ];
  }

  // TrackBy functions para evitar loops infinitos
  trackByIndex(index: number): number {
    return index;
  }

  trackByEstacao(index: number, estacao: PopsEst): string {
    return estacao.sigla || `estacao-${index}`;
  }

  trackByBastidor(index: number, bastidor: string): string {
    return bastidor;
  }

  trackByPosicao(index: number, posicao: string): string {
    return posicao;
  }

  trackByConector(index: number, conector: TipoConector): number {
    return conector.id;
  }

  /**
   * Seleciona uma estação
   */
  selecionarEstacao(estacao: PopsEst): void {
    this.form.estacaoSelecionada = estacao;
    console.log('📋 [PLOTA-DIO] Estação selecionada:', estacao);
  }

  /**
   * Seleciona um bastidor
   */
  selecionarBastidor(bastidor: string): void {
    this.form.bastidorSelecionado = bastidor;
    console.log('📋 [PLOTA-DIO] Bastidor selecionado:', bastidor);
  }

  /**
   * Seleciona uma posição
   */
  selecionarPosicao(posicao: string): void {
    this.form.posicaoSelecionada = posicao;
    console.log('📋 [PLOTA-DIO] Posição selecionada:', posicao);
  }

  /**
   * Cria o DIO
   */
  criar(): void {
    // Validar campos obrigatórios
    if (!this.form.estacaoSelecionada) {
      alert('Por favor, selecione uma estação.');
      return;
    }

    if (!this.form.bastidorSelecionado || this.form.bastidorSelecionado.trim() === '') {
      alert('Por favor, selecione um bastidor.');
      return;
    }

    if (!this.form.posicaoSelecionada || this.form.posicaoSelecionada.trim() === '') {
      alert('Por favor, selecione uma posição.');
      return;
    }

    if (!this.form.capacidade) {
      alert('Por favor, selecione a capacidade.');
      return;
    }

    if (!this.form.tipoConector) {
      alert('Por favor, selecione o tipo de conector.');
      return;
    }

    if (!this.form.lat || this.form.lat.trim() === '') {
      alert('Por favor, preencha a coordenada LAT.');
      return;
    }

    if (!this.form.lng || this.form.lng.trim() === '') {
      alert('Por favor, preencha a coordenada LONG.');
      return;
    }

    // Obter dados do AuthService
    const user = this.authService.getUsuario();
    const idCity = this.authService.getIdCity();

    // Validar dados necessários do AuthService
    if (!user) {
      alert('Usuário não encontrado. Faça login novamente.');
      return;
    }

    if (!idCity) {
      alert('Cidade não encontrada. Selecione uma cidade.');
      return;
    }

    // Converter coordenadas (substituir vírgula por ponto)
    const lat = this.form.lat.replace(',', '.');
    const lng = this.form.lng.replace(',', '.');

    // Validar se as coordenadas são números válidos após a conversão
    if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
      alert('Por favor, preencha coordenadas válidas.');
      return;
    }

    // Obter id_estacao da estação selecionada
    // Prioridade: 1) data.id_meta (passado do context menu), 2) estacao.id_estacao, 3) estacao.id_meta, 4) sigla como fallback
    let idEstacao: string | number | undefined;
    
    // 🔍 Log para debug: verificar conteúdo de this.data
    console.log('🔍 [PLOTA-DIO] Conteúdo de this.data:', this.data);
    console.log('🔍 [PLOTA-DIO] this.data.id_meta:', this.data?.id_meta);
    
    // Primeiro tentar usar o id_meta passado diretamente do context menu
    if (this.data?.id_meta) {
      idEstacao = this.data.id_meta;
      console.log('✅ [PLOTA-DIO] Usando id_meta do data:', idEstacao);
    } else {
      // Se não tiver no data, tentar obter da estação selecionada
      const estacao = this.form.estacaoSelecionada as any;
      
      if (estacao?.id_estacao) {
        idEstacao = estacao.id_estacao;
        console.log('✅ [PLOTA-DIO] Usando id_estacao da estação:', idEstacao);
      } else if (estacao?.id_meta) {
        idEstacao = estacao.id_meta;
        console.log('✅ [PLOTA-DIO] Usando id_meta da estação:', idEstacao);
      } else if (estacao?.sigla) {
        // Usar sigla como fallback se não encontrar id_estacao ou id_meta
        idEstacao = estacao.sigla;
        console.warn('⚠️ [PLOTA-DIO] id_estacao não encontrado, usando sigla como fallback:', idEstacao);
      }
    }

    if (!idEstacao) {
      alert('Erro: Não foi possível identificar o ID da estação.');
      return;
    }

    // Construir sigla como concatenação de bastidor + posição (ex: "B1C10")
    const sigla = `${this.form.bastidorSelecionado}${this.form.posicaoSelecionada}`;
    
    if (!sigla || sigla.trim() === '') {
      alert('Erro: Não foi possível construir a sigla do DIO.');
      return;
    }

    // Preparar dados para a API no formato InsertDioRequest
    const dadosDio: InsertDioRequest = {
      sigla: sigla,
      id_estacao: String(idEstacao),
      CONECTOR: String(this.form.tipoConector),
      CAPACIDADE: String(this.form.capacidade),
      id_city: String(idCity),
      LAT: lat,
      LNG: lng,
      id_condominio: 0
    };

    console.log('📦 [PLOTA-DIO] Criando DIO com dados:', dadosDio);
    console.log('📦 [PLOTA-DIO] id_estacao que será enviado para a API:', dadosDio.id_estacao);

    // Ativar loading
    this.salvando = true;

    // Chamar o serviço para criar o DIO
    this.insertDioService.criarDio(dadosDio).subscribe({
      next: (response) => {
        console.log('✅ [PLOTA-DIO] DIO criado com sucesso:', response);
        this.salvando = false;
        
        // Validar que id_meta foi retornado
        if (!response.id_meta) {
          console.error('❌ [PLOTA-DIO] id_meta não foi retornado na resposta:', response);
          alert('Erro: DIO criado mas ID não foi retornado. Verifique os logs.');
          this.salvando = false;
          return;
        }
        
        // Mostrar mensagem de sucesso
        // comentado em 17012026alert(`DIO criado com sucesso!\n\nSigla: ${sigla}\n${response.message || ''}`);
        
        // Preparar dados para retorno (incluindo os IDs retornados)
        const resultado = {
          id_meta: response.id_meta,
          sigla: sigla,
          CAPACIDADE: parseInt(String(this.form.capacidade || '0'), 10),
          LAT: parseFloat(lat),
          LNG: parseFloat(lng),
          id_estacao: typeof idEstacao === 'number' ? idEstacao : parseInt(String(idEstacao), 10) // Adicionar id_estacao (id_meta da estação)
        };
        
        console.log('📦 [PLOTA-DIO] Dados preparados para retorno:', resultado);
        
        // Fechar modal e retornar dados completos
        this.activeModal.close(resultado);
      },
      error: (error) => {
        console.error('❌ [PLOTA-DIO] Erro ao criar DIO:', error);
        this.salvando = false;
        
        // Mostrar mensagem de erro
        const errorMessage = typeof error === 'string' ? error : error.message || 'Erro desconhecido ao criar DIO.';
        alert(`Erro ao criar DIO:\n\n${errorMessage}`);
      }
    });
  }

  /**
   * Verifica se a estação já está pré-selecionada (vinda do context menu)
   */
  get estacaoPreSelecionada(): boolean {
    return !!this.data?.estacaoSelecionada;
  }

  /**
   * Verifica se todos os campos obrigatórios estão preenchidos
   */
  get formValido(): boolean {
    return !!(
      this.form.estacaoSelecionada &&
      this.form.bastidorSelecionado &&
      this.form.posicaoSelecionada &&
      this.form.capacidade !== null &&
      this.form.tipoConector !== null
    );
  }

  fechar(): void {
    this.activeModal.dismiss();
  }

  // Métodos para arrastar o modal
  onMouseDown(event: MouseEvent): void {
    if (event.target instanceof HTMLElement) {
      const header = event.target.closest('.modal-header');
      if (header && !event.target.closest('.btn-close')) {
        this.initialX = event.clientX - this.xOffset;
        this.initialY = event.clientY - this.yOffset;

        if (event.target === header || header.contains(event.target)) {
          this.isDragging = true;
          event.preventDefault();
        }
      }
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      event.preventDefault();
      this.currentX = event.clientX - this.initialX;
      this.currentY = event.clientY - this.initialY;

      this.xOffset = this.currentX;
      this.yOffset = this.currentY;

      if (this.modalDialog) {
        this.modalDialog.nativeElement.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
      }
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.initialX = this.currentX;
    this.initialY = this.currentY;
    this.isDragging = false;
  }
}
