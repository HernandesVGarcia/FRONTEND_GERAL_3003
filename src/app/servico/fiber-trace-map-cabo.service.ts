import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FiberApiService } from './fiber-api.service';
import { PesquisaCaixaService } from './pesquisa-caixa.service';
import { TiposService, TipoSplitterApiRow } from './tipos.service';
import {  buildSplitterAnalisaRequestFromEntrada,  parseSplitterEntradaPropLabel,} from './analisa-conexao-nivel.service';

export interface FiberTraceStep {
  idmeta: number;
  fiber: number | string;
  tabela: string;
  registro: string;
  tipo: string;
  status: 'processando' | 'fim' | 'continua' | 'erro';
}

export interface CaboMapHighlightInfo {
  id: number;
  capacidade: string;
  fibra: number;
}

export interface SplitterMapHighlightInfo {
  idMetaSplitter: number;
  idMetaCaixa: number;
  saida: number;
  acoplamento: string;
  tipoSplitter: number;
  lat: number;
  lng: number;
  numeroCaixa?: string;
}

export interface FiberTraceMapResult {
  success: boolean;
  trace: FiberTraceStep[]; // array de passos do rastreamento
  status: string;  // valores tipicos: processando, fim, erro, limite_atingido, cabo_aberto, caixa_parada 
  cabosInfo: CaboMapHighlightInfo[];
  splittersInfo: SplitterMapHighlightInfo[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FiberTraceMapCaboService{
  
  // 🗺️ NOVO: Array para armazenar IDs dos cabos percorridos durante o rastreamento
  private cabosPercorridos: number[] = [];
  
  // 🗺️ NOVO: Array para armazenar informações dos cabos percorridos (ID + capacidade + fibra)
  private cabosInfo: CaboMapHighlightInfo[] = [];

  private splittersPercorridos: string[] = [];
  private splittersInfo: SplitterMapHighlightInfo[] = [];
  private tiposSplitterCache: TipoSplitterApiRow[] | null = null;

  constructor(
    private fiberApiService: FiberApiService,
    private pesquisaCaixaService: PesquisaCaixaService,
    private tiposService: TiposService,
  ) {}

  /**
   * 🗺️ NOVO: Retorna os IDs dos cabos percorridos durante o último rastreamento
   */
  getCabosPercorridos(): number[] {
    return [...this.cabosPercorridos]; // Retorna uma cópia para evitar modificações externas
  }

  /**
   * 🗺️ NOVO: Retorna as informações dos cabos percorridos (ID + capacidade)
   */
  getCabosInfo(): CaboMapHighlightInfo[] {
    return [...this.cabosInfo]; // Retorna uma cópia para evitar modificações externas
  }

  getSplittersInfo(): SplitterMapHighlightInfo[] {
    return [...this.splittersInfo];
  }

  /**
   * 🗺️ NOVO: Limpa o array de cabos percorridos
   */
  clearCabosPercorridos(): void {
    this.cabosPercorridos = [];
    this.cabosInfo = [];
    this.splittersPercorridos = [];
    this.splittersInfo = [];
    console.log('🗺️ [CABO] Arrays de cabos percorridos limpos');
  }

  private buildMapTraceResult(
    partial: Omit<FiberTraceMapResult, 'cabosInfo' | 'splittersInfo'>,
  ): FiberTraceMapResult {
    return {
      ...partial,
      cabosInfo: [...this.cabosInfo],
      splittersInfo: [...this.splittersInfo],
    };
  }

  private async resolveAcoplamentoSplitter(tipoSplitterId: number): Promise<string> {
    if (!this.tiposSplitterCache) {
      try {
        const response = await this.tiposService.buscarTiposSplitter().toPromise();
        this.tiposSplitterCache = (response?.data ?? []) as TipoSplitterApiRow[];
      } catch (error) {
        console.error('🗺️ [SPLITTER-MAP] Erro ao buscar tipos de splitter:', error);
        this.tiposSplitterCache = [];
      }
    }

    const row = this.tiposSplitterCache.find((tipo) => tipo.id === tipoSplitterId);
    return row?.acoplamento?.trim() || `Tipo ${tipoSplitterId}`;
  }

  private async registrarSplitterPercorrido(
    idMetaSplitter: number,
    idMetaCaixa: number,
    saida: number,
    tipoSplitter: number,
  ): Promise<void> {
    const key = `${idMetaSplitter}-${saida}`;
    if (this.splittersPercorridos.includes(key)) {
      console.log(`🗺️ [SPLITTER-MAP] Splitter ${key} já registrado`);
      return;
    }

    let lat = 0;
    let lng = 0;
    let numeroCaixa: string | undefined;

    try {
      const caixa = await this.pesquisaCaixaService.buscarPorIdMeta(idMetaCaixa).toPromise();
      if (caixa) {
        lat = caixa.lat;
        lng = caixa.lng;
        numeroCaixa = caixa.numero;
      }
    } catch (error) {
      console.error(
        `🗺️ [SPLITTER-MAP] Erro ao buscar coordenadas da caixa ${idMetaCaixa}:`,
        error,
      );
    }

    const acoplamento = await this.resolveAcoplamentoSplitter(tipoSplitter);

    this.splittersPercorridos.push(key);
    this.splittersInfo.push({
      idMetaSplitter,
      idMetaCaixa,
      saida,
      acoplamento,
      tipoSplitter,
      lat,
      lng,
      numeroCaixa,
    });
    console.log(
      `🗺️ [SPLITTER-MAP] Splitter ${idMetaSplitter} S${saida} (${acoplamento}) na caixa ${idMetaCaixa} registrado`,
    );
  }

  /**
   * Registra um cabo em cabosPercorridos/cabosInfo para highlight no mapa.
   */
  private async registrarCaboPercorrido(caboId: number, fibra: number): Promise<void> {
    if (this.cabosPercorridos.includes(caboId)) {
      console.log(`🗺️ [CABO-MAP] Cabo ${caboId} já existe no array. Total: ${this.cabosPercorridos.length}`);
      return;
    }

    this.cabosPercorridos.push(caboId);

    try {
      const capacidade = (await this.fiberApiService.getCapacidadeCabo(caboId).toPromise()) || 'unknown';
      this.cabosInfo.push({ id: caboId, capacidade, fibra });
      console.log(
        `🗺️ [CABO-MAP] Cabo ${caboId} (${capacidade}, fibra ${fibra}) adicionado aos percorridos. Total: ${this.cabosPercorridos.length}`,
      );
    } catch (error) {
      console.error(`🗺️ [CABO-MAP] Erro ao consultar capacidade do cabo ${caboId}:`, error);
      this.cabosInfo.push({ id: caboId, capacidade: 'unknown', fibra });
      console.log(
        `🗺️ [CABO-MAP] Cabo ${caboId} (unknown, fibra ${fibra}) adicionado aos percorridos. Total: ${this.cabosPercorridos.length}`,
      );
    }
  }

  /**
   * MÉTODO PRINCIPAL: Rastreamento de Fibra
   * Baseado no algoritmo ANALISA_TABELA_INI do módulo VB6 LE_CONEX
   * Abordagem: Identificar tipo do objeto → Executar lógica específica
   */
  ANALISA_TABELAGRAFO(idmeta: number, fiber: number, tabela: string, registro: string): Observable<FiberTraceMapResult> {
    return new Observable(observer => {
      
      // 🗺️ CORREÇÃO: Limpar arrays ANTES de iniciar novo rastreamento
      this.cabosPercorridos = [];
      this.cabosInfo = [];
      this.splittersPercorridos = [];
      this.splittersInfo = [];
      console.log(`🗺️ [INICIO-MAP] Rastreamento iniciado para cabo  ${idmeta}, Fibra ${fiber}`);
      console.log(`🗺️ [INICIO-MAP] Arrays limpos: cabosPercorridos=[${this.cabosPercorridos.join(', ')}], cabosInfo=[${this.cabosInfo.length}]`);
      
      this.performTrace(idmeta, fiber, tabela, registro, [], observer, 0);  
    });
  }

  /**
   * Executa o rastreamento recursivo da fibra
   * Seguindo a lógica do VB6: testar tipo → executar apenas o necessário
   */
  private async performTrace(
    idmeta: number, 
    fiber: number, 
    tabela: string, 
    registro: string, 
    tracePath: FiberTraceStep[], 
    observer: any,
    stepCount: number = 0
  ): Promise<void> {
    try {
      if (stepCount === 0) {
        await this.registrarCaboPercorrido(idmeta, fiber);
      }

      if (stepCount >= 1000) {
        console.log(`🛑 [LIMITE] Rastreamento interrompido - Limite de 150 passos atingido`);
        const limitStep: FiberTraceStep = {
          idmeta: idmeta,
          fiber: fiber,
          tabela: tabela,
          registro: registro,
          tipo: 'limite_atingido',
          status: 'fim'
        };
        tracePath.push(limitStep);
        
        console.log(`🗺️ [FIM-MAP] Cabos percorridos finais: [${this.cabosPercorridos.join(', ')}] (Total: ${this.cabosPercorridos.length})`);
        observer.next(this.buildMapTraceResult({// observer é o observable que recebe o resultado do rastreamento
          success: true,
          trace: tracePath,
          status: 'limite_atingido',
        }));
        observer.complete();
        return;
      }

      console.log(`🔍 [RASTREIO] Passo ${stepCount + 1}/150 - IDMETA: ${idmeta}, Fibra: ${fiber}, Tabela: ${tabela}, Registro: ${registro}`);
      
      // Criar objeto do passo atual
      const currentStep: FiberTraceStep = {
        idmeta: idmeta,
        fiber: fiber,
        tabela: tabela,
        registro: registro,
        tipo: 'unknown',
        status: 'processando'
      };

      // Consultar registro atual no banco de dados
      const registroResponse = await this.fiberApiService.getRegistroByIdmeta(tabela, idmeta, registro).toPromise();
      
      // Verificar se encontrou conexão
      if (!registroResponse || !registroResponse.success || !registroResponse.valor) {
        console.log(`❌ [FIM] Cabo aberto - sem conexão encontrada`);
        currentStep.status = 'fim';
        currentStep.tipo = 'cabo_aberto';
        tracePath.push(currentStep);
        
        console.log(`🗺️ [FIM-MAP] Cabos percorridos finais: [${this.cabosPercorridos.join(', ')}] (Total: ${this.cabosPercorridos.length})`);
        observer.next(this.buildMapTraceResult({
          success: true,
          trace: tracePath,
          status: 'fim',
        }));
        observer.complete();
        return;
      }

      const conteudo = registroResponse.valor;
      console.log(`✅ [CONEXÃO] Encontrada conexão: ${conteudo}`);

      // Verificar se parou na caixa (=id())
      if (conteudo === '=id()') {
        console.log(`🏠 [CAIXA] Parada na caixa - fim do rastreamento`);
        currentStep.status = 'fim';
        currentStep.tipo = 'caixa_parada';
        tracePath.push(currentStep);
        
        console.log(`🗺️ [FIM-MAP] Cabos percorridos finais: [${this.cabosPercorridos.join(', ')}] (Total: ${this.cabosPercorridos.length})`);
        observer.next(this.buildMapTraceResult({
          success: true,
          trace: tracePath,
          status: 'fim',
        }));
        observer.complete();
        return;
      }

      // ABORDAGEM VB6: Identificar tipo baseado no CONTEÚDO, não no IDMETA
      const tipoObjeto = this.identificarTipoPeloConteudo(conteudo);
      console.log(`🎯 [TIPO] Tipo identificado pelo conteúdo: ${tipoObjeto}`);

      // Executar apenas a lógica específica do tipo
      const result = await this.processarPorTipo(tipoObjeto, conteudo, registro, idmeta, tabela, fiber);
      
      // Atualizar status do passo atual
      currentStep.status = result.status;
      currentStep.tipo = tipoObjeto;
      tracePath.push(currentStep);

      // Verificar se deve parar ou continuar
      if (result.status === 'fim' || result.status === 'erro') {
        // Se parou em um destino final (splitter, DIO, etc.), adicionar o passo final com o IDMETA correto
        if (result.idmeta !== idmeta) {
          const finalStep: FiberTraceStep = {
            idmeta: result.idmeta,
            fiber: result.fiber,
            tabela: result.tabela,
            registro: result.registro,
            tipo: tipoObjeto,
            status: 'fim'
          };
          tracePath.push(finalStep);
        }
        
        console.log(`🏁 [FIM] Rastreamento finalizado - Status: ${result.status}`);
        
        observer.next(this.buildMapTraceResult({
          success: true,
          trace: tracePath,
          status: result.status,
        }));
        observer.complete();
      } else if (result.tabela && result.registro) {
        // Continuar rastreamento recursivo
        console.log(`➡️ [CONTINUA] Próximo passo - IDMETA: ${result.idmeta}, Fibra: ${result.fiber}, Tabela: ${result.tabela}, Registro: ${result.registro}`);
        await this.performTrace(result.idmeta, typeof result.fiber === 'string' ? 0 : result.fiber, result.tabela, result.registro, tracePath, observer, stepCount + 1);
        } else {
        // Rastreamento interrompido
          console.log(`❌ [FIM] Rastreamento interrompido - Tabela ou registro vazios`);
          currentStep.status = 'fim';
          currentStep.tipo = 'cabo_aberto';
          tracePath.push(currentStep);
          
        console.log(`🗺️ [FIM-MAP] Cabos percorridos finais: [${this.cabosPercorridos.join(', ')}] (Total: ${this.cabosPercorridos.length})`);
        observer.next(this.buildMapTraceResult({
          success: true,
          trace: tracePath,
          status: 'fim',
        }));
        observer.complete();
      }

    } catch (error: any) {
      console.error(`❌ [ERRO] Erro no rastreamento:`, error);
      observer.error({ success: false, error: error.message, trace: tracePath });
    }
  }

  /**
   * Identifica o tipo do objeto analisando o conteúdo
   * Baseado na lógica do VB6: analisar o conteúdo para determinar o próximo passo
   */
  private identificarTipoPeloConteudo(conteudo: string): string {
    console.log(`🔍 [ANALISAR] Conteúdo: ${conteudo}`);

    // Verificar se é parada na caixa atual
    if (conteudo === '=id()') {
      return 'caixa_atual';
    }

    // Verificar se é DIO com bandeja (dioc2_t1, dioc1_t2, etc.)
    if (conteudo.includes('dioc') && conteudo.includes('_t')) {
      return 'dio_cabo';
    }

    // Verificar se é cabo (ponta A ou B): =cabo350807A!Prop.Fibra_1.Label
    if (conteudo.includes('cabo') && conteudo.includes('!') && conteudo.includes('Prop.Fibra_')) {
      return 'cabo';
    }

    // 🆕 NOVO: Verificar se é cabo com conexão direta (sem sufixo): =cabo596806B!PROP.FIBRA_2
    if (conteudo.includes('cabo') && conteudo.includes('!') && conteudo.includes('PROP.FIBRA_')) {
      return 'cabo';
    }

    // 🆕 NOVO: Verificar se é cabo com conexão direta (minúsculo): =cabo{ID}{A/B}!Prop.Fibra_{N}
    if (conteudo.includes('cabo') && conteudo.includes('!') && conteudo.includes('Prop.Fibra_') && !conteudo.includes('.')) {
      return 'cabo';
    }

    // Verificar se é caixa TST: =TST350814!PROP.BOCA2_1.VALUE
    if (conteudo.includes('TST') && conteudo.includes('BOCA')) {
      return 'caixa';
    }

    // Verificar se é caixa simples: prop.boca1_1.label
    if (conteudo.includes('prop.') && conteudo.includes('boca') && conteudo.includes('label')) {
      return 'caixa';
    }

    // Verificar se é POP: =TST714932!PROP.ROW_5.LABEL (TST + ROW_5 = POP)
    if (conteudo.includes('TST') && conteudo.includes('ROW_5')) {
      return 'pop';
    }

    // Verificar se é DIO simples: =DIO350815!PROP.F1.VALUE ou =DIO350833!PROP.ROW_5.LABEL
    if (conteudo.includes('DIO') && conteudo.includes('!') && conteudo.includes('PROP.')) {
      return 'dio';
    }

    // Verificar se é POP: =POP350816!PROP.F1.VALUE
    if (conteudo.includes('POP') && conteudo.includes('!') && conteudo.includes('PROP.F')) {
      return 'pop';
    }

    // Verificar se é Splitter: =SPLITTER350817!PROP.F1.VALUE
    if (conteudo.includes('SPLITTER') && conteudo.includes('!') && conteudo.includes('PROP.F')) {
      return 'splitter';
    }

    // Verificar se é Splitter simples: prop.splitter_e299315.label
    if (conteudo.includes('prop.') && conteudo.includes('splitter_e') && conteudo.includes('label')) {
      return 'splitter';
    }

    // 🆕 NOVO: Verificar se é Saída de Splitter: prop.splitter750062_1.label
    if (conteudo.includes('prop.') && conteudo.includes('splitter') && conteudo.includes('_') && conteudo.includes('label')) {
      return 'splitter_saida';
    }

    // Verificar se é Rabicho: =RABICHO350818!PROP.F1.VALUE
    if (conteudo.includes('RABICHO') && conteudo.includes('!') && conteudo.includes('PROP.F')) {
      return 'rabicho';
    }

    console.log(`❓ [DESCONHECIDO] Tipo não reconhecido no conteúdo: ${conteudo}`);
    return 'unknown';
  }

  /**
   * Processa o conteúdo baseado no tipo do objeto
   * Seguindo a lógica do VB6: cada tipo tem sua lógica específica
   */
  private async processarPorTipo(
    tipoObjeto: string,
    conteudo: string,
    registro: string,
    idmeta: number,
    tabela: string,
    fiber: number
  ): Promise<{
    idmeta: number,
    fiber: number | string, // 🆕 NOVO: Permitir string para conector
    tabela: string,
    registro: string,
    status: 'processando' | 'fim' | 'continua' | 'erro'
  }> {
    console.log(`🔄 [PROCESSAR] Tipo: ${tipoObjeto}, Conteúdo: ${conteudo}`);

    switch (tipoObjeto) {
      case 'cabo':
        return await this.processarCabo(conteudo, registro, idmeta, tabela, fiber);
      
      case 'caixa':
        return await this.processarCaixa(conteudo, registro, idmeta, tabela, fiber);
      
      case 'dio':
        return await this.processarDIO(conteudo, registro, idmeta, tabela, fiber);
      
      case 'dio_cabo':
        return await this.processarDIOCabo(conteudo, registro, idmeta, tabela, fiber);
      
      case 'caixa_atual':
        return await this.processarCaixaAtual(conteudo, registro, idmeta, tabela, fiber);
      
      case 'splitter':
        return await this.processarSplitter(conteudo, registro, idmeta, tabela, fiber);
      
      case 'splitter_saida':
        return await this.processarSplitterSaida(conteudo, registro, idmeta, tabela, fiber);
      
      case 'pop':
        return await this.processarPOP(conteudo, registro, idmeta, tabela, fiber);
      
      case 'rabicho':
        return await this.processarRabicho(conteudo, registro, idmeta, tabela, fiber);
      
      default:
        console.log(`❓ [DESCONHECIDO] Tipo de equipamento não reconhecido: ${tipoObjeto}`);
      return {
          idmeta: idmeta,
          fiber: fiber,
          tabela: '',
          registro: '',
          status: 'erro'
        };
    }
  }

  /**
   * Processa equipamento tipo CABO
   * Lógica específica para cabos - baseada no VB6
   */
  private async processarCabo(
    conteudo: string,
    registro: string,
    idmeta: number,
    tabela: string,
    fiber: number
  ): Promise<{
    idmeta: number,
    fiber: number,
    tabela: string,
    registro: string,
    status: 'processando' | 'fim' | 'continua' | 'erro'
  }> {
    console.log(`🔌 [CABO] Processando cabo: ${conteudo}`);

    // Extrair informações do conteúdo do cabo
    // 🆕 NOVO: Regex flexível para diferentes padrões de cabo
    let match = conteudo.match(/=cabo(\d+)([AB])!Prop\.Fibra_(\d+)\.(Label|VALUE)/);
    
    // casos abaixo que existe conexao direta entre cabos atraves do segmento sobra e o VALUE pode nao aparecer -->=cabo596806B!PROP.FIBRA_12
    // Se não encontrou, tentar padrão de conexão direta (maiúsculo)
    if (!match) {
      match = conteudo.match(/=cabo(\d+)([AB])!PROP\.FIBRA_(\d+)$/);
    }
    
    // Se ainda não encontrou, tentar padrão de conexão direta (minúsculo)
    if (!match) {
      match = conteudo.match(/=cabo(\d+)([AB])!Prop\.Fibra_(\d+)$/);
    }
    
    if (!match) {
      console.log(`❌ [CABO] Formato de conteúdo inválido: ${conteudo}`);
      return { idmeta, fiber, tabela: '', registro: '', status: 'erro' };
    }

    const caboId = parseInt(match[1]);
    const ponta = match[2]; // A ou B
    const fibra = parseInt(match[3]);
    const tipo = match[4] || 'VALUE'; // Label, VALUE ou VALUE (padrão para conexão direta)

    await this.registrarCaboPercorrido(caboId, fibra);

    // Calcular tubo baseado na fibra
    const tubo = this.calculateTubo(fibra);

    // 🆕 NOVO: Detecção de variáveis seguindo exatamente a documentação
    const isPontaB = ponta === 'B';
    const isPontaA = ponta === 'A';
    const isLabel = tipo === 'Label';
    const isValue = tipo === 'VALUE';

    // 🆕 NOVO: Lógica de combinação com && (AND) - exatamente como na documentação
    let proximaTabela: string;
    let proximoRegistro: string;

    if (isPontaB && isLabel) {
      // Ponta B + Label → cabob_tX + FIBRA_XLABEL
      proximaTabela = `cabob_t${tubo}`;
      proximoRegistro = `FIBRA_${fibra}LABEL`;
    } else if (isPontaA && isLabel) {
      // Ponta A + Label → caboa_tX + FIBRA_XLABEL
      proximaTabela = `caboa_t${tubo}`;
      proximoRegistro = `FIBRA_${fibra}LABEL`;
    } else if (isPontaB && isValue) {
      // Ponta B + Value → cabob_tX + FIBRA_X
      proximaTabela = `cabob_t${tubo}`;
      proximoRegistro = `FIBRA_${fibra}`;
    } else if (isPontaA && isValue) {
      // Ponta A + Value → caboa_tX + FIBRA_X
      proximaTabela = `caboa_t${tubo}`;
      proximoRegistro = `FIBRA_${fibra}`;
    } else {
      // Fallback para casos não cobertos
      console.log(`⚠️ [CABO] Combinação não esperada: Ponta=${ponta}, Tipo=${tipo}`);
      proximaTabela = ponta === 'B' ? `cabob_t${tubo}` : `caboa_t${tubo}`;
      proximoRegistro = tipo === 'Label' ? `FIBRA_${fibra}LABEL` : `FIBRA_${fibra}`;
    }

    console.log(`✅ [CABO] Próximo passo - Tabela: ${proximaTabela}, Registro: ${proximoRegistro}`);

    return {
      idmeta: caboId,
      fiber: fibra,
      tabela: proximaTabela,
      registro: proximoRegistro,
      status: 'continua'
    };
  }

  /**
   * Processa equipamento tipo CAIXA
   * Lógica específica para caixas - baseada no VB6
   */
  private async processarCaixa(
    conteudo: string,
    registro: string,
    idmeta: number,
    tabela: string,
    fiber: number
  ): Promise<{
    idmeta: number,
    fiber: number,
    tabela: string,
    registro: string,
    status: 'processando' | 'fim' | 'continua' | 'erro'
  }> {
    console.log(`🏠 [CAIXA] Processando caixa: ${conteudo}`);

    // Verificar se é parada na caixa atual
    if (conteudo === '=id()') {
      console.log(`🏠 [CAIXA] Fibra parou na caixa atual`);
      return { idmeta, fiber: 1, tabela: '', registro: '', status: 'fim' };
    }

    // Extrair informações do conteúdo da caixa
    let match = conteudo.match(/=TST(\d+)!PROP\.BOCA(\d+)_(\d+)\.VALUE/);
    let caixaId, boca, fibra;

    if (match) {
      // Formato: =TST298818!PROP.BOCA1_1.VALUE
      caixaId = parseInt(match[1]);
      boca = parseInt(match[2]);
      fibra = parseInt(match[3]);
      } else {
      // Formato: prop.boca2_1.label
      match = conteudo.match(/prop\.boca(\d+)_(\d+)\.label/);
      if (!match) {
        console.log(`❌ [CAIXA] Formato de conteúdo inválido: ${conteudo}`);
        return { idmeta, fiber, tabela: '', registro: '', status: 'erro' };
      }
      caixaId = idmeta; // Usar o IDMETA atual para caixa simples
      boca = parseInt(match[1]);
      fibra = parseInt(match[2]);
    }

    // Calcular tubo baseado na fibra
    const tubo = this.calculateTubo(fibra);

    // Determinar próxima tabela e registro
    const proximaTabela = `cxboca${boca}_t${tubo}`;
    
    // Determinar próximo registro baseado no formato do conteúdo
    let proximoRegistro;
    if (conteudo.includes('prop.') && conteudo.includes('label') && !conteudo.includes('=')) {
      // Formato: prop.boca2_1.label → F1L
      proximoRegistro = `F${fibra}L`;
    } else {
      // Formato: =TST298818!PROP.BOCA1_1.VALUE → F1
      proximoRegistro = `F${fibra}`;
    }
    
    console.log(`✅ [CAIXA] Próximo passo - Tabela: ${proximaTabela}, Registro: ${proximoRegistro}`);

    return {
      idmeta: caixaId,
      fiber: fibra,
      tabela: proximaTabela,
      registro: proximoRegistro,
      status: 'continua'
    };
  }

  /**
   * Processa equipamento tipo DIO
   * Lógica específica para DIOs - baseada no VB6
   */
  private async processarDIO(
    conteudo: string,
    registro: string,
    idmeta: number,
    tabela: string,
    fiber: number
  ): Promise<{
    idmeta: number,
    fiber: number | string, // 🆕 NOVO: Permitir string para conector
    tabela: string,
    registro: string,
    status: 'processando' | 'fim' | 'continua' | 'erro'
  }> {
    console.log(`🔌 [DIO] Processando DIO: ${conteudo}`);

    // Verificar se é DIO com bandeja
    if (conteudo.includes('dioc') && conteudo.includes('_t')) {
      return await this.processarDIOCabo(conteudo, registro, idmeta, tabela, fiber);
    }

    // 🆕 NOVO: DIO simples - consultar conector no cabo anterior ANTES de extrair ID do DIO
    console.log(`🔍 [DIO] Consultando conector no cabo anterior - Tabela: ${tabela}, IDMETA: ${idmeta}, Fibra: ${fiber}`);
    
    // Construir campo FN_XLABEL baseado na fibra (ex: FN_12LABEL)
    const campoFibra = `FN_${fiber}LABEL`;
    console.log(`🔍 [DIO] Campo a consultar: ${campoFibra}`);
    
    // Consultar fibra final no cabo anterior (tabela e idmeta ainda são do cabo)
    const fibraResponse = await this.fiberApiService.executeDynamicQuery(
      `SELECT ${campoFibra} as fibra FROM tstmeta.${tabela} WHERE IDMETA = {idmeta}`,
      { idmeta: idmeta }
    ).toPromise();
    
    let fibraFinal = 0;
    if (fibraResponse?.success && fibraResponse.data && fibraResponse.data.length > 0) {
      const fibraNumero = fibraResponse.data[0].fibra;
      if (fibraNumero && fibraNumero !== 'ZERO') {
        // FN_XLABEL retorna o número da fibra final no DIO
        fibraFinal = parseInt(fibraNumero);
        console.log(`✅ [DIO] Fibra final encontrada: ${fibraFinal}`);
      } else {
        fibraFinal = 0;
        console.log(`❌ [DIO] Fibra ZERO ou vazia`);
      }
    } else {
      console.log(`❌ [DIO] Fibra não encontrada ou erro na consulta`);
    }

    // 🆕 NOVO: Agora extrair IDMETA do DIO do conteúdo: =DIO350833!PROP.ROW_5.LABEL
    let dioIdmeta = idmeta;
    const match = conteudo.match(/=DIO(\d+)!/);
    if (match) {
      dioIdmeta = parseInt(match[1]);
      console.log(`🔌 [DIO] IDMETA do DIO extraído: ${dioIdmeta}`);
    }
    
    console.log(`🏁 [DIO] Fibra chegou no DIO - DESTINO FINAL - Fibra final: ${fibraFinal}`);

    return {
      idmeta: dioIdmeta,
      fiber: fibraFinal, // 🆕 NOVO: Fibra final no campo fiber (número)
      tabela: '',
      registro: '', // 🆕 NOVO: Limpar registro
      status: 'fim'
    };
  }

  /**
   * Processa DIO com bandeja (DIOcabo)
   * Lógica específica para DIOs com bandeja - baseada no VB6
   */
  private async processarDIOCabo(
    conteudo: string,
    registro: string,
    idmeta: number,
    tabela: string,
    fiber: number
  ): Promise<{
    idmeta: number, 
    fiber: number, 
    tabela: string, 
    registro: string,
    status: 'processando' | 'fim' | 'continua' | 'erro'
  }> {
    console.log(`🔌 [DIO-CABO] Processando DIO com bandeja: ${conteudo}`);

    // Extrair número da fibra
    const fibra = parseInt(registro.substring(1)); // Remove 'F' do início

    // Determinar conector baseado no conteúdo (dioc2_t1 → 2)
    const conector = this.extractConectorFromTabela(conteudo);

    // Buscar cabo conectado na bandeja
    console.log(`🔍 [DIO-CABO] Consultando campo c${conector} para IDMETA ${idmeta}`);
    const caboResponse = await this.fiberApiService.executeDynamicQuery(
      `SELECT c${conector} as cabo FROM tstmeta.dio WHERE id_meta = {idmeta}`,
      { idmeta: idmeta }
    ).toPromise();
    console.log(`📊 [DIO-CABO] Resposta:`, caboResponse);
    
    if (!caboResponse?.success || !caboResponse.data || caboResponse.data.length === 0 || caboResponse.data[0].cabo === 'ZERO') {
      console.log(`❌ [DIO-CABO] Cabo não encontrado ou ZERO`);
      return { idmeta, fiber: 0, tabela: '', registro: '', status: 'fim' };
    }
    
    const cabo = caboResponse.data[0].cabo;

    // Buscar fibra conectada na tabela original
    const fiberResponse = await this.fiberApiService.executeDynamicQuery(
      `SELECT FN${fibra} as fiber FROM tstmeta.${tabela} WHERE IDMETA = {idmeta}`,
      { idmeta: idmeta }
    ).toPromise();
    
    const fibraCabo = fiberResponse?.data?.[0]?.fiber || 0;
    if (fibraCabo === 0) {
      console.log(`❌ [DIO-CABO] Fibra conectada não encontrada`);
      return { idmeta, fiber: 0, tabela: '', registro: '', status: 'fim' };
    }

    // Calcular tubo para o cabo
    const tuboCabo = this.calculateTubo(fibraCabo);
    
    // Determinar ponta A ou B
    const isPontaB = cabo.includes('B');
    const tabelaCabo = isPontaB ? `cabob_t${tuboCabo}` : `caboa_t${tuboCabo}`;
    
    // Extrair IDMETA do cabo
    const caboIdmeta = this.extractCaboIdmeta(cabo);
    
    console.log(`✅ [DIO-CABO] Resultado - IDMETA: ${caboIdmeta}, Fibra: ${fibraCabo}, Tabela: ${tabelaCabo}`);
    
    return {
      idmeta: caboIdmeta,
      fiber: fibraCabo,
      tabela: tabelaCabo,
      registro: `Fibra_${fibraCabo}`,
      status: 'continua'
    };
  }

  /**
   * Processa equipamento tipo SPLITTER
   * Lógica específica para splitters - baseada no VB6
   */
  private async processarSplitter(
    conteudo: string,
    registro: string,
    idmeta: number,
    tabela: string,
    fiber: number
  ): Promise<{
    idmeta: number,
    fiber: number,
    tabela: string,
    registro: string,
    status: 'processando' | 'fim' | 'continua' | 'erro'
  }> {
    console.log(`🔀 [SPLITTER] Processando splitter: ${conteudo}`);

    // Verificar se é splitter simples (prop.splitter_e299315.label)
    if (conteudo.includes('prop.') && conteudo.includes('splitter_e') && conteudo.includes('label')) {
      // Extrair IDMETA do splitter do conteúdo: prop.splitter_e299315.label
      const match = conteudo.match(/splitter_e(\d+)/);
      if (match) {
        const splitterIdmeta = parseInt(match[1]);
        console.log(`🔀 [SPLITTER] IDMETA do splitter extraído: ${splitterIdmeta}`);

        
        return {
          idmeta: splitterIdmeta, // Usar o IDMETA do splitter, não o atual
          fiber: "E" as any, // "E" para Splitter Entrada
          tabela: '',
          registro: '',
          status: 'fim'
        };
      }
    }

    // Splitter complexo - destino final
    console.log(`🏁 [SPLITTER] Fibra chegou no Splitter - DESTINO FINAL`);
        return {
      idmeta: idmeta,
      fiber: "E" as any, // "E" para Splitter Entrada
      tabela: '',
      registro: '',
      status: 'fim'
    };
  }

  /**
   * Processa equipamento tipo Splitter Saída
   * Lógica específica para saídas de splitter - baseada no VB6
   */
  private async processarSplitterSaida(
    conteudo: string,
    registro: string,
    idmeta: number,
    tabela: string,
    fiber: number
  ): Promise<{
    idmeta: number,
    fiber: number,
    tabela: string,
    registro: string,
    status: 'processando' | 'fim' | 'continua' | 'erro'
  }> {
    console.log(`🔀 [SPLITTER-SAIDA] Processando saída de splitter: ${conteudo}`);

    const match = conteudo.match(/splitter(\d+)_(\d+)/);
    if (!match) {
      console.log(`🔀 [SPLITTER-SAIDA] Não foi possível extrair IDMETA do splitter: ${conteudo}`);
      return { idmeta, fiber, tabela: '', registro: '', status: 'fim' };
    }

    const splitterIdmeta = parseInt(match[1], 10);
    const saidaNumero = parseInt(match[2], 10);
    console.log(`🔀 [SPLITTER-SAIDA] IDMETA do splitter: ${splitterIdmeta}, Saída: ${saidaNumero}`);

    try {
      const splitterResponse = await this.fiberApiService.executeDynamicQuery(
        `SELECT ENTRADA, ID_META_CAIXA, TIPO_SPLITTER FROM tstmeta.splitter_e WHERE idmeta = {idmeta}`,
        { idmeta: splitterIdmeta },
      ).toPromise();

      const row = splitterResponse?.data?.[0];
      if (!splitterResponse?.success || !row) {
        console.log(`🔀 [SPLITTER-SAIDA] Splitter ${splitterIdmeta} não encontrado em splitter_e`);
        return { idmeta: splitterIdmeta, fiber: saidaNumero, tabela: '', registro: '', status: 'fim' };
      }

      const entrada = String(row.ENTRADA ?? '').trim();
      const idMetaCaixa = Number(row.ID_META_CAIXA);
      const tipoSplitter = Number(row.TIPO_SPLITTER) || 0;

      await this.registrarSplitterPercorrido(
        splitterIdmeta,
        idMetaCaixa,
        saidaNumero,
        tipoSplitter,
      );

      if (!entrada || entrada === '=id()') {
        console.log(`🔀 [SPLITTER-SAIDA] ENTRADA vazia/livre — fim do trace (saída S${saidaNumero})`);
        return { idmeta: splitterIdmeta, fiber: saidaNumero, tabela: '', registro: '', status: 'fim' };
      }

      const proximo = buildSplitterAnalisaRequestFromEntrada(entrada, idMetaCaixa);//metodo que esta no servico analisa-conexao-nivel.service.ts
      if (!proximo) {
        console.log(`🔀 [SPLITTER-SAIDA] ENTRADA inválida: ${entrada}`);
        return { idmeta: splitterIdmeta, fiber: saidaNumero, tabela: '', registro: '', status: 'fim' };
      }

      const parsed = parseSplitterEntradaPropLabel(entrada);//metodo que esta no servico analisa-conexao-nivel.service.ts
      const fibraBoca = parsed?.fibra ?? fiber;

      console.log(
        `🔀 [SPLITTER-SAIDA] Continuando pela ENTRADA → caixa ${proximo.idmeta}, ` +
        `${proximo.tabela}, ${proximo.regist} (ENTRADA: ${entrada})`,
      );

      return {
        idmeta: proximo.idmeta,
        fiber: fibraBoca,
        tabela: proximo.tabela,
        registro: proximo.regist,
        status: 'continua',
      };
    } catch (error) {
      console.error(`❌ [SPLITTER-SAIDA] Erro ao consultar ENTRADA do splitter ${splitterIdmeta}:`, error);
      return { idmeta: splitterIdmeta, fiber: saidaNumero, tabela: '', registro: '', status: 'fim' };
    }
  }

  /**
   * Processa equipamento tipo POP
   * Lógica específica para POPs - baseada no VB6
   */
  private async processarPOP(
    conteudo: string,
    registro: string,
    idmeta: number,
    tabela: string,
    fiber: number
  ): Promise<{
    idmeta: number,
    fiber: number,
    tabela: string,
    registro: string,
    status: 'processando' | 'fim' | 'continua' | 'erro'
  }> {
    console.log(`🏢 [POP] Processando POP: ${conteudo}`);

    // Extrair IDMETA do POP do conteúdo
    let popIdmeta = idmeta;
    
    // Formato: =TST714932!PROP.ROW_5.LABEL
    const matchTST = conteudo.match(/=TST(\d+)!/);
    if (matchTST) {
      popIdmeta = parseInt(matchTST[1]);
      console.log(`🏢 [POP] IDMETA do POP extraído: ${popIdmeta}`);
    }
    
    // Formato: =POP350816!PROP.F1.VALUE
    const matchPOP = conteudo.match(/=POP(\d+)!/);
    if (matchPOP) {
      popIdmeta = parseInt(matchPOP[1]);
      console.log(`🏢 [POP] IDMETA do POP extraído: ${popIdmeta}`);
    }

    // POP - destino final
    console.log(`🏁 [POP] Fibra chegou no POP - DESTINO FINAL`);
    return {
      idmeta: popIdmeta,
      fiber: fiber,
      tabela: '',
      registro: '',
      status: 'fim'
    };
  }

  /**
   * Processa equipamento tipo RABICHO
   * Lógica específica para rabichos - baseada no VB6
   */
  private async processarRabicho(
    conteudo: string,
    registro: string,
    idmeta: number,
    tabela: string,
    fiber: number
  ): Promise<{
    idmeta: number,
    fiber: number,
    tabela: string,
    registro: string,
    status: 'processando' | 'fim' | 'continua' | 'erro'
  }> {
    console.log(`🔗 [RABICHO] Processando rabicho: ${conteudo}`);

    // Rabicho - destino final
    console.log(`🏁 [RABICHO] Fibra chegou no Rabicho - DESTINO FINAL`);
    return {
      idmeta: idmeta,
      fiber: fiber,
      tabela: '',
      registro: '',
      status: 'fim'
    };
  }

  /**
   * Processa equipamento tipo CAIXA_ATUAL
   * Lógica específica para parada na caixa atual - baseada no VB6
   */
  private async processarCaixaAtual(
    conteudo: string,
    registro: string,
    idmeta: number,
    tabela: string,
    fiber: number
  ): Promise<{
    idmeta: number,
    fiber: number,
    tabela: string,
    registro: string,
    status: 'processando' | 'fim' | 'continua' | 'erro'
  }> {
    console.log(`🏠 [CAIXA-ATUAL] Processando parada na caixa atual: ${conteudo}`);

    // Caixa atual - destino final
    console.log(`🏁 [CAIXA-ATUAL] Fibra parou na caixa atual - DESTINO FINAL`);
    return {
      idmeta: idmeta,
      fiber: 1,
      tabela: '',
      registro: '',
      status: 'fim'
    };
  }

  /**
   * Calcula o tubo baseado no número da fibra
   * Baseado na lógica do módulo VB6 LE_CONEX
   */
  calculateTubo(fibra: number): number {
    if (fibra < 13) return 1;
    if (fibra > 12 && fibra <= 24) return 2;
    if (fibra > 24 && fibra <= 36) return 3;
    if (fibra > 36 && fibra <= 48) return 4;
    if (fibra > 48 && fibra <= 60) return 5;
    if (fibra > 60 && fibra <= 72) return 6;
    if (fibra > 72 && fibra <= 84) return 7;
    if (fibra > 84 && fibra <= 96) return 8;
    if (fibra > 96 && fibra <= 108) return 9;
    if (fibra > 108 && fibra <= 120) return 10;
    if (fibra > 120 && fibra <= 132) return 11;
    if (fibra > 132) return 12;
      return 1;
    }
    
  /**
   * Extrai o conector do conteúdo (ex: dioc2_t1 → 2)
   * Limita entre 1 e 6 (bandejas do DIO vão de c1 a c6)
   */
  private extractConectorFromTabela(conteudo: string): number {
    // Extrair conector do formato dioc2_t1 → 2
    const match = conteudo.match(/dioc(\d+)_t/);
    const conector = match ? parseInt(match[1]) : 1;
    // Limitar entre 1 e 6 (bandejas do DIO)
    return Math.min(Math.max(conector, 1), 6);
  }

  /**
   * Extrai o IDMETA do cabo (ex: cabo350807A → 350807)
   */
  private extractCaboIdmeta(cabo: string): number {
    const posA = cabo.indexOf('A');
    const posB = cabo.indexOf('B');
    const pos = Math.max(posA, posB);
    return parseInt(cabo.substring(4, pos));
  }

  /**
   * Cancela todas as operações em andamento
   */
  cancelAllOperations(): void {
    console.log('🛑 [TRACE-SERVICE] Cancelando todas as operações HTTP');
    this.fiberApiService.cancelAllOperations();
  }

  
}