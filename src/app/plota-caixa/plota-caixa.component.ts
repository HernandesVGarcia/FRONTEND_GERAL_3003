import { Component, Input, OnInit, OnChanges, SimpleChanges, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TiposService } from '../servico/tipos.service';
import { InsertCaixaService, InsertCaixaRequest } from '../servico/insert-caixa.service';
import { AuthService } from '../servico/auth.service';

export interface PlotaCaixaData {
  tipagem?: string;
  ID_TIPO?: string;
  lat?: number;
  lng?: number;
  labelCaixa?: string;
  endereco?: string;
  obs?: string;
}

@Component({
  selector: 'app-plota-caixa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbModule
  ],
  templateUrl: './plota-caixa.component.html',
  styleUrls: ['./plota-caixa.component.css']
})
export class PlotaCaixaComponent implements OnInit, OnChanges {
  // Opções de tipagem - agora será carregado da API
  tipagens: string[] = [];
  carregandoTipos: boolean = false;
  salvando: boolean = false;
  
  // Formulário
  form = {
    tipagem: 'INDEFINIDO',
    lat: '',
    lng: '',
    labelCaixa: '',
    endereco: '',
    obs: ''
  };

  @Input() data: PlotaCaixaData = {};

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
    private insertCaixaService: InsertCaixaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Carregar tipos de caixa da API
    this.carregarTiposCaixa();
    
    // Preencher formulário com dados recebidos
    this.atualizarFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Atualizar formulário quando o data mudar (quando modal for reaberto com novas coordenadas)
    if (changes['data'] && changes['data'].currentValue) {
      console.log('🔄 [PLOTA-CAIXA] Dados atualizados:', changes['data'].currentValue);
      this.atualizarFormulario();
    }
  }

  /**
   * Atualiza o formulário com os dados recebidos
   */
  private atualizarFormulario(): void {
    if (this.data) {
      this.form.tipagem = this.data.tipagem || 'INDEFINIDO';
      this.form.lat = this.data.lat?.toString().replace('.', ',') || '';
      this.form.lng = this.data.lng?.toString().replace('.', ',') || '';
      this.form.labelCaixa = ''; // Sempre vazio
      this.form.endereco = this.data.endereco || '';
      this.form.obs = this.data.obs || '';

      console.log('📝 [PLOTA-CAIXA] Formulário atualizado com coordenadas:', {
        lat: this.form.lat,
        lng: this.form.lng
      });
    } else {
      // Garantir que sempre tenha um valor inicial
      this.form.tipagem = 'INDEFINIDO';
      this.form.labelCaixa = ''; // Sempre vazio
      this.form.lat = '';
      this.form.lng = '';
    }
  }

  /**
   * Carrega os tipos de caixa da API
   */
  carregarTiposCaixa(): void {
    this.carregandoTipos = true;
    
    this.tiposService.buscarTiposCaixa().subscribe({
      next: (response) => {
        console.log('✅ [PLOTA-CAIXA] Tipos de caixa carregados:', response);
        
        if (response.success && response.data && response.data.length > 0) {
          // Extrair os nomes dos tipos de caixa do campo 'tipocaixa'
          this.tipagens = response.data.map((item: any) => item.tipocaixa || item.tipo || item.descrição || item.nome || '');
          
          // Filtrar valores vazios
          this.tipagens = this.tipagens.filter(tipo => tipo && tipo.trim() !== '');
          
          console.log('📋 [PLOTA-CAIXA] Tipagens disponíveis:', this.tipagens);
          
          // Se não houver valor padrão definido, usar o primeiro da lista
          if (!this.form.tipagem || this.form.tipagem === 'INDEFINIDO') {
            if (this.tipagens.length > 0) {
              this.form.tipagem = this.tipagens[0];
            }
          }
        } else {
          console.warn('⚠️ [PLOTA-CAIXA] Nenhum tipo de caixa encontrado na API');
          // Fallback para valores padrão se a API não retornar dados
          this.tipagens = ['INDEFINIDO'];
        }
        
        this.carregandoTipos = false;
      },
      error: (error) => {
        console.error('❌ [PLOTA-CAIXA] Erro ao carregar tipos de caixa:', error);
        // Fallback para valores padrão em caso de erro
        this.tipagens = [
          'FOSC',
          'FIST CANINHOS',
          'FIST SEM CANINHOS',
          'PLP',
          'TYCO QUADRADA',
          'MINI-CEO FIBRACEM',
          'INDEFINIDO',
          'TERMINADOR',
          'PLP FIBRACEM',
          'NAP',
          'NAP_C18',
          'NAP_C10',
          'NAP_C24'
        ];
        this.carregandoTipos = false;
      }
    });
  }

  // TrackBy functions para evitar loops infinitos
  trackByIndex(index: number): number {
    return index;
  }

  trackByOption(index: number, option: string): string {
    return option || `empty-${index}`;
  }

  /**
   * Retorna o caminho da imagem baseado no tipo de caixa selecionado
   */
  getImagemCaixa(): string {
    if (!this.form.tipagem) {
      return 'assets/BLOCO.png';
    }

    // Mapeamento entre tipos de caixa e nomes de arquivos
    const mapeamentoImagens: { [key: string]: string } = {
      'FOSC': 'assets/icones_tipos_caixas/figuras/1_FOSC.jpg',
      'FIST CANINHOS': 'assets/icones_tipos_caixas/figuras/2_FIST_CANINHOS.png',
      'FIST SEM CANINHOS': 'assets/icones_tipos_caixas/figuras/3_FIST_SEM_CANINHOS.jpg',
      'PLP': 'assets/icones_tipos_caixas/figuras/4_PLP.jpg',
      'TYCO QUADRADA': 'assets/icones_tipos_caixas/figuras/5_TYCO_QUADRADA.jpg',
      'MINI-CEO FIBRACEM': 'assets/icones_tipos_caixas/figuras/6_MINI_CEO.jpg',
      'INDEFINIDO': 'assets/icones_tipos_caixas/figuras/7_INDEFINIDO.jpg',
      'TERMINADOR': 'assets/icones_tipos_caixas/figuras/8_TERMINADOR.jpg',
      'PLP FIBRACEM': 'assets/icones_tipos_caixas/figuras/9_PLP_FIBRACEM.jpg',
      'NAP': 'assets/icones_tipos_caixas/figuras/10_NAP.jpg',
      'NAP_C18': 'assets/icones_tipos_caixas/figuras/11_NAP_C18.jpg',
      'NAP_C10': 'assets/icones_tipos_caixas/figuras/12_NAP_C10.jpg',
      'NAP_C24': 'assets/icones_tipos_caixas/figuras/13_NAP_C24.jpg'
    };

    // Buscar a imagem correspondente (case-insensitive)
    const tipoNormalizado = this.form.tipagem.trim();
    const imagem = mapeamentoImagens[this.form.tipagem] || 
                   Object.entries(mapeamentoImagens).find(([key]) => 
                     key.toUpperCase().trim() === tipoNormalizado.toUpperCase()
                   )?.[1];

    return imagem || 'assets/BLOCO.png'; // Fallback para imagem padrão
  }

  /**
   * Trata erro ao carregar imagem, usando fallback para imagem padrão
   */
  onImagemError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/BLOCO.png';
    }
  }

  plotar(): void {
    // Validar campos obrigatórios: tipagem, lat e lng
    // Permite "INDEFINIDO" para que o usuário possa plotar e definir o tipo depois
    if (!this.form.tipagem || this.form.tipagem.trim() === '') {
      alert('Por favor, selecione uma tipagem.');
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
    const idPolo = this.authService.getPolo();
    const idCity = this.authService.getIdCity();

    // Validar dados necessários do AuthService
    if (!user) {
      alert('Usuário não encontrado. Faça login novamente.');
      return;
    }

    if (!idPolo) {
      alert('Polo não encontrado. Selecione um polo.');
      return;
    }

    if (!idCity) {
      alert('Cidade não encontrada. Selecione uma cidade.');
      return;
    }

    // Calcular ID_TIPO baseado na posição da tipagem na lista
    // O primeiro item da lista tem ID_TIPO = 1, o segundo = 2, etc.
    const indiceTipagem = this.tipagens.indexOf(this.form.tipagem);
    if (indiceTipagem === -1) {
      alert('Tipo de caixa inválido. Selecione um tipo válido.');
      return;
    }
    const ID_TIPO = (indiceTipagem + 1).toString(); // +1 porque arrays começam em 0, mas IDs em 1

    // Converter coordenadas (substituir vírgula por ponto)
    const lat = this.form.lat.replace(',', '.');
    const lng = this.form.lng.replace(',', '.');

    // Validar se as coordenadas são números válidos após a conversão
    if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
      alert('Por favor, preencha coordenadas válidas.');
      return;
    }

    // Se labelCaixa não foi informado, usar "0" temporariamente (será substituído pelo id_meta)
    const labelInformado =
      this.form.labelCaixa && this.form.labelCaixa.trim() !== ''
        ? this.sanitizarLabelCaixa(this.form.labelCaixa.trim())
        : '';
    const numeroLabel = labelInformado !== '' ? labelInformado : '0';
    // Preparar dados para a API
    const dadosCaixa: InsertCaixaRequest = {
      ID_TIPO: ID_TIPO,
      NUMERO: numeroLabel,
      LOCALIZACAO: this.form.endereco && this.form.endereco.trim() !== '' ? this.form.endereco : ' ', // Espaço em vez de string vazia
      TIPO: this.form.tipagem,
      OBSERVACAO: this.form.obs && this.form.obs.trim() !== '' ? this.form.obs : '', // OBSERVACAO é opcional
      idCIDADES: idCity.toString(),
      USER: user,
      id_POLO: idPolo.toString(), // Garantir que seja string (a API valida se é número válido)
      LAT: lat,
      LNG: lng,
      id_condominio: 0
    };

    console.log('📦 [PLOTA-CAIXA] Criando caixa com dados:', dadosCaixa);
    console.log('📦 [PLOTA-CAIXA] Tipagem selecionada:', this.form.tipagem, 'ID_TIPO:', ID_TIPO);
    console.log('📦 [PLOTA-CAIXA] Label informado:', this.form.labelCaixa, '| Usando NUMERO:', numeroLabel);
    console.log('📦 [PLOTA-CAIXA] LOCALIZACAO:', dadosCaixa.LOCALIZACAO === ' ' ? '(vazio - espaço)' : dadosCaixa.LOCALIZACAO);
    console.log('📦 [PLOTA-CAIXA] id_POLO:', dadosCaixa.id_POLO, 'tipo:', typeof dadosCaixa.id_POLO);

    // Ativar loading
    this.salvando = true;

    // Chamar o serviço para criar a caixa
    this.insertCaixaService.criarCaixa(dadosCaixa).subscribe({
      next: (response) => {
        console.log('✅ [PLOTA-CAIXA] Caixa criada com sucesso:', response);
        this.salvando = false;

        // Se label não foi informado (ou ficou vazio após sanitizar), usar o id_meta
        const labelFinal = labelInformado !== '' ? labelInformado : response.id_meta.toString();

        // Preparar dados para retorno (incluindo os IDs retornados)
        const resultado = {
          id_meta: response.id_meta,
          id_caixa: response.id_caixa,
          tipagem: this.form.tipagem,
          ID_TIPO: ID_TIPO,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          labelCaixa: labelFinal, // Usa id_meta se label não foi informado
          endereco: this.form.endereco || undefined,
          obs: this.form.obs || undefined
        };

        console.log('📦 [PLOTA-CAIXA] Label final usado:', labelFinal);

        // Fechar modal e retornar dados
        this.activeModal.close(resultado);
      },
      error: (error) => {
        console.error('❌ [PLOTA-CAIXA] Erro ao criar caixa:', error);
        this.salvando = false;
        alert(`Erro ao criar caixa: ${error}`);
      }
    });
  }

  /**
   * Graphviz-safe: só A-Za-z0-9; resto vira _; colapsa __ e trim de _.
   */
  private sanitizarLabelCaixa(label: string): string {
    return String(label ?? '')
      .replace(/[^A-Za-z0-9]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  fechar(): void {
    this.activeModal.dismiss();
  }

  // Métodos para arrastar o modal
  onMouseDown(event: MouseEvent): void {
    if (event.target instanceof HTMLElement) {
      // Verificar se o clique foi no cabeçalho ou em elementos filhos do cabeçalho
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

