import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FiberApiService } from './fiber-api.service';

// Interfaces para o rastreamento de fibras
export interface FiberTraceStep {
  idmeta: number;
  fiber: number | string; // 🆕 NOVO: Permitir string para conector
  tabela: string;
  registro: string;
  tipo: string;
  status: 'processando' | 'fim' | 'continua' | 'erro';
}

export interface FiberTraceResult {
  success: boolean;
  trace: FiberTraceStep[];
  status: string;
  dotString: string; // 🆕 NOVO: DOT string gerado durante o rastreamento
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FiberTraceUnifilarService {

  // 🆕 NOVO: Variáveis globais para composição DOT (igual ao VB6)
  private Objeto_Anterior: string = '';
  private Objeto_Atual: string = '';
  private dotString: string = '';
  private cor: string = 'green';
  private flag_caixa: boolean = false; // 🆕 NOVO: Flag para controlar composição DOT da caixa
  private fibraString: string = ''; // 🆕 NOVO: String fibra composta para labels das conexões
  
  // 🗺️ NOVO: Array para armazenar IDs dos cabos percorridos durante o rastreamento
  private cabosPercorridos: number[] = [];
  
  // 🗺️ NOVO: Array para armazenar informações dos cabos percorridos (ID + capacidade)
  private cabosInfo: Array<{id: number, capacidade: string}> = [];

  constructor(
    private fiberApiService: FiberApiService
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
  getCabosInfo(): Array<{id: number, capacidade: string}> {
    return [...this.cabosInfo]; // Retorna uma cópia para evitar modificações externas
  }

  /**
   * 🗺️ NOVO: Limpa o array de cabos percorridos
   */
  clearCabosPercorridos(): void {
    this.cabosPercorridos = [];
    this.cabosInfo = [];
    console.log('🗺️ [CABO] Arrays de cabos percorridos limpos');
  }

  /**
   * MÉTODO PRINCIPAL: Rastreamento de Fibra
   * Baseado no algoritmo ANALISA_TABELA_INI do módulo VB6 LE_CONEX
   * Abordagem: Identificar tipo do objeto → Executar lógica específica
   */
  ANALISA_TABELAGRAFO(idmeta: number, fiber: number, tabela: string, registro: string): Observable<FiberTraceResult> {
    return new Observable(observer => {
      // 🆕 NOVO: Inicializar variáveis globais DOT (igual ao VB6)
      this.dotString = 'digraph Alf {rankdir=LR;size="7,9";ranksep=0.01;nodesep=0.01;node[shape=record,width=.3,height=.3];';
      this.Objeto_Anterior = '';
      this.Objeto_Atual = '';
      this.cor = 'green';
      this.flag_caixa = false; // 🆕 NOVO: Inicializar flag da caixa
      this.fibraString = ''; // 🆕 NOVO: Inicializar string fibra
      
      // 🗺️ CORREÇÃO: Limpar arrays ANTES de iniciar novo rastreamento
      this.cabosPercorridos = [];
      this.cabosInfo = [];
      console.log(`🗺️ [INICIO-UNIFILAR] Rastreamento iniciado para DIO ${idmeta}, Fibra ${fiber}`);
      console.log(`🗺️ [INICIO-UNIFILAR] Arrays limpos: cabosPercorridos=[${this.cabosPercorridos.join(', ')}], cabosInfo=[${this.cabosInfo.length}]`);
      
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
      // 🆕 NOVO: Inicializar primeiro objeto (DIO de origem) apenas no primeiro passo
      if (stepCount === 0) {
        const siglaResponse = await this.fiberApiService.executeDynamicQuery(
          `SELECT SIGLA FROM tstmeta.dio WHERE id_meta = {idmeta}`,
          { idmeta: idmeta }
        ).toPromise();
        
        const sigla = siglaResponse?.data?.[0]?.SIGLA || `DIO_${idmeta}`;
        this.Objeto_Atual = `${sigla}_F${fiber + 1}`; // +1 porque a fibra vem 0-based B1C1_F1
        this.Objeto_Anterior = this.Objeto_Atual;
        
        // 🆕 CORREÇÃO: Adicionar nó do primeiro objeto
        this.dotString += `${this.Objeto_Atual}[label="${this.Objeto_Atual}",color="${this.cor}"];`;
        
        console.log(`🎯 [DOT] Primeiro objeto definido: ${this.Objeto_Atual}`);
      }

      // Verificar limite de passos
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
        
        // 🆕 NOVO: Finalizar DOT string
        this.dotString += 'size="10"}';
        console.log(`🎨 [DOT] Diagrama final gerado: ${this.dotString}`);
        
        console.log(`🗺️ [FIM-UNIFILAR] Cabos percorridos finais: [${this.cabosPercorridos.join(', ')}] (Total: ${this.cabosPercorridos.length})`);
        observer.next({ 
          success: true, 
          trace: tracePath, 
          status: 'limite_atingido',
          dotString: this.dotString
        });
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
        
        // 🆕 NOVO: Finalizar DOT string
        this.dotString += 'size="10"}';
        console.log(`🎨 [DOT] Diagrama final gerado: ${this.dotString}`);
        
        console.log(`🗺️ [FIM-UNIFILAR] Cabos percorridos finais: [${this.cabosPercorridos.join(', ')}] (Total: ${this.cabosPercorridos.length})`);
        observer.next({ 
          success: true, 
          trace: tracePath, 
          status: 'fim',
          dotString: this.dotString
        });
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
        
        // 🆕 NOVO: Finalizar DOT string
        this.dotString += 'size="10"}';
        console.log(`🎨 [DOT] Diagrama final gerado: ${this.dotString}`);
        
        console.log(`🗺️ [FIM-UNIFILAR] Cabos percorridos finais: [${this.cabosPercorridos.join(', ')}] (Total: ${this.cabosPercorridos.length})`);
        observer.next({ 
          success: true, 
          trace: tracePath, 
          status: 'fim',
          dotString: this.dotString
        });
        observer.complete();
        return;
      }

      // ABORDAGEM VB6: Identificar tipo baseado no CONTEÚDO, não no IDMETA
      const tipoObjeto = this.identificarTipoPeloConteudo(conteudo);
      console.log(`🎯 [TIPO] Tipo identificado pelo conteúdo: ${tipoObjeto}`);

      // 🆕 NOVO: Atualizar objeto anterior ANTES de processar (para usar na conexão)
      if (stepCount > 0) {
        this.Objeto_Anterior = this.Objeto_Atual;
        console.log(`🔄 [DOT] Atualizando objeto anterior: ${this.Objeto_Anterior}`);
      }

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
        
        // 🆕 NOVO: Finalizar DOT string
        this.dotString += 'size="10"}';
        console.log(`🎨 [DOT] Diagrama final gerado: ${this.dotString}`);
        
        observer.next({ 
          success: true, 
          trace: tracePath, 
          status: result.status,
          dotString: this.dotString
        });
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
          
          // 🆕 NOVO: Finalizar DOT string
          this.dotString += ';size="10"}';
          console.log(`🎨 [DOT] Diagrama final gerado: ${this.dotString}`);
          
        console.log(`🗺️ [FIM-UNIFILAR] Cabos percorridos finais: [${this.cabosPercorridos.join(', ')}] (Total: ${this.cabosPercorridos.length})`);
        observer.next({ 
          success: true, 
          trace: tracePath, 
          status: 'fim',
          dotString: this.dotString
        });
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

    // 🗺️ NOVO: Adicionar ID do cabo ao array de cabos percorridos
    if (!this.cabosPercorridos.includes(caboId)) {
      this.cabosPercorridos.push(caboId);
      
      // 🗺️ NOVO: Consultar capacidade do cabo no banco de dados
      try {
        const capacidade = await this.fiberApiService.getCapacidadeCabo(caboId).toPromise() || 'unknown';
        this.cabosInfo.push({id: caboId, capacidade: capacidade});
        
        console.log(`🗺️ [CABO-UNIFILAR] ✅ CABO ENCONTRADO! Cabo ${caboId} (${capacidade}) adicionado aos percorridos. Total: ${this.cabosPercorridos.length}`);
        console.log(`🗺️ [CABO-UNIFILAR] Conteúdo do cabo: ${conteudo}`);
        console.log(`🗺️ [CABO-UNIFILAR] Regex match: ${match}`);
        console.log(`🗺️ [CABO-UNIFILAR] Array atual: [${this.cabosPercorridos.join(', ')}]`);
      } catch (error) {
        console.error(`🗺️ [CABO-UNIFILAR] Erro ao consultar capacidade do cabo ${caboId}:`, error);
        this.cabosInfo.push({id: caboId, capacidade: 'unknown'});
        
        console.log(`🗺️ [CABO-UNIFILAR] ✅ CABO ENCONTRADO! Cabo ${caboId} (unknown) adicionado aos percorridos. Total: ${this.cabosPercorridos.length}`);
      }
    } else {
      console.log(`🗺️ [CABO-UNIFILAR] Cabo ${caboId} já existe no array. Total: ${this.cabosPercorridos.length}`);
    }

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
    
    // 🆕 NOVO: Compor string fibra (igual ao VB6 linha 643)
    try {
      const cabopaResponse = await this.fiberApiService.executeDynamicQuery(
        `SELECT label_cabo FROM tstmeta.cabopa WHERE id_meta = {idmeta}`,
        { idmeta: caboId }
      ).toPromise();
      
      const cabomResponse = await this.fiberApiService.executeDynamicQuery(
        `SELECT capacidade FROM tstmeta.cabom WHERE id_meta = {idmeta}`,
        { idmeta: caboId }
      ).toPromise();
      
      const label_cabo = cabopaResponse?.data?.[0]?.label_cabo || '';
      const capacidade = cabomResponse?.data?.[0]?.capacidade || 0;
      
      // Compor string fibra igual ao VB6
      let fibraString: string;
      if (label_cabo !== '') {
        fibraString = `"${capacidade}F  (${fibra}) ${label_cabo}"`;
      } else {
        fibraString = `"(${capacidade}F)  ${fibra}"`;
      }
      
      // 🆕 NOVO: Armazenar string fibra para usar nas conexões
      this.fibraString = fibraString;
      
      console.log(`🔌 [CABO-FIBRA] String composta: ${fibraString}`);
    } catch (error) {
      console.error(`❌ [CABO-FIBRA] Erro ao compor string fibra:`, error);
      this.fibraString = `"${fibra}"`; // Fallback
    }
    
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
    
    // 🆕 NOVO: Compor DOT da caixa (igual ao VB6) - SÓ se flag_caixa = false
    if (!this.flag_caixa) {
      try {
        const caixaResponse = await this.fiberApiService.executeDynamicQuery(
          `SELECT numerocx, label_cx FROM tstmeta.caixa WHERE id_meta = {idmeta}`,
          { idmeta: caixaId }
        ).toPromise();
        
        const numerocx = caixaResponse?.data?.[0]?.numerocx || caixaId.toString();
        const label_cx = caixaResponse?.data?.[0]?.label_cx || `CX_${caixaId}`;
        
        // Compor novo objeto atual (igual ao VB6 linha 581)
        const novoObjetoAtual = `CX_${numerocx}_CX`;
        
        // 🆕 CORREÇÃO: Adicionar nó do objeto atual (igual ao VB6 linha 581)
        this.dotString += `${novoObjetoAtual}[label="${novoObjetoAtual}",shape=box,ranksep=0.001,fontsize=8,style="rounded,filled",fillcolor=lemonchiffon];`;
        


        
        // 🆕 CORREÇÃO: Conexão igual ao VB6 - OBJETO_ANTERIOR -> OBJETO_ATUAL com label da fibra
        if (this.Objeto_Anterior) {
          const labelFibra = this.fibraString || `"${fibra}"`;
          const conexao = `${this.Objeto_Anterior}->${novoObjetoAtual} [label=${labelFibra},fontcolor="${this.cor}",color="${this.cor}",style="setlinewidth(1.5)",fontsize=7.8,arrowsize=0.5];`;
          this.dotString += conexao;
          console.log(`🔗 [CAIXA-CONEXÃO] ${this.Objeto_Anterior} -> ${novoObjetoAtual} (Label: ${labelFibra})`);
        }
        
        // Atualizar objeto atual APÓS criar a conexão
        this.Objeto_Atual = novoObjetoAtual;
        
        console.log(`🎨 [CAIXA-DOT] Compoe: ${novoObjetoAtual} - Anterior: ${this.Objeto_Anterior}, Atual: ${this.Objeto_Atual}`);
      } catch (error) {
        console.error(`❌ [CAIXA-DOT] Erro ao compor DOT da caixa:`, error);
      }
    } else {
      console.log(`🚫 [CAIXA-DOT] Flag_caixa = true - Pulando composição DOT da caixa`);
    }
    
    // 🆕 NOVO: Inverter flag da caixa (igual ao VB6)
    this.flag_caixa = !this.flag_caixa;
    console.log(`🔄 [FLAG-CAIXA] Invertida para: ${this.flag_caixa}`);
    
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
    
    // 🆕 NOVO: Compor DOT do DIO (igual ao VB6)
    try {
      // 🆕 CORREÇÃO: Consulta igual ao VB6 linha 604-605
      const dioResponse = await this.fiberApiService.executeDynamicQuery(
        `SELECT NOME, pop.id_estacao FROM tstmeta.dio, tstmeta.pop WHERE dio.id_estacao = pop.id_meta AND dio.id_meta = {idmeta}`,
        { idmeta: dioIdmeta }
      ).toPromise();
      
      const estacaoResponse = await this.fiberApiService.executeDynamicQuery(
        `SELECT sigla FROM tst.estações WHERE id_estacao = {id_estacao}`,
        { id_estacao: dioResponse?.data?.[0]?.id_estacao || 0 }
      ).toPromise();
      
      const nome = dioResponse?.data?.[0]?.NOME || `DIO_${dioIdmeta}`;
      const siglaEstacao = estacaoResponse?.data?.[0]?.sigla || 'EST';
      
      // Compor novo objeto atual (igual ao VB6 linha 612)
      const novoObjetoAtual = `"${(nome + '_F' + fibraFinal + '_(' + siglaEstacao+')').substring(0, 40)}"`;
      
      // 🆕 CORREÇÃO: Adicionar nó do objeto anterior (se não for o primeiro)
      if (this.Objeto_Anterior && this.Objeto_Anterior !== this.Objeto_Atual) {
        this.dotString += `${this.Objeto_Anterior}[label="${this.Objeto_Anterior}",color="${this.cor}"];`;
      }
      
      // 🆕 CORREÇÃO: Adicionar nó do objeto atual
      this.dotString += `${novoObjetoAtual}[label=${novoObjetoAtual},color="${this.cor}"];`;
      
        // 🆕 CORREÇÃO: Adicionar conexão entre objetos
       //  if (this.Objeto_Anterior && this.Objeto_Anterior !== this.Objeto_Atual) {
       //   this.dotString += `${this.Objeto_Anterior}->${novoObjetoAtual};`;
       // }

       // 🆕 CORREÇÃO: Adicionar conexão entre objetos com label da fibra (igual ao VB6 linha 612)
       if (this.Objeto_Atual) {
         const labelFibra = this.fibraString || `"${fibraFinal}"`;
         const conexao = `${this.Objeto_Anterior}->${novoObjetoAtual} [label=${labelFibra},color="${this.cor}",style="setlinewidth(2)",fontsize=18];`;
         this.dotString += conexao;
         console.log(`🔗 [DIO-CONEXÃO] ${this.Objeto_Anterior} -> ${novoObjetoAtual} (Label: ${labelFibra})`);
       }
      
      this.Objeto_Atual = novoObjetoAtual;
      
      console.log(`🎨 [DIO-DOT] Compoe: ${novoObjetoAtual} - Anterior: ${this.Objeto_Anterior}, Atual: ${this.Objeto_Atual}`);
    } catch (error) {
      console.error(`❌ [DIO-DOT] Erro ao compor DOT do DIO:`, error);
    }
    
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
        
        // 🆕 NOVO: Compor DOT do SPLITTER (igual ao VB6 linha 710)
        await this.comporSplitterDot(splitterIdmeta, fiber);
        
        return {
          idmeta: splitterIdmeta, // Usar o IDMETA do splitter, não o atual
          fiber: "E" as any, // "E" para Splitter Entrada
          tabela: '',
          registro: '',
          status: 'fim'
        };
      }
    }

    // 🆕 NOVO: Compor DOT do SPLITTER (igual ao VB6 linha 710)
    await this.comporSplitterDot(idmeta, fiber);

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

  // 🆕 NOVO: Compor DOT do SPLITTER (igual ao VB6 linha 710)
  private async comporSplitterDot(idmeta: number, fiber: number): Promise<void> {
    try {
      // Buscar informações do splitter (igual ao VB6 linha 678)
      const splitterResponse = await this.fiberApiService.executeDynamicQuery(
        `SELECT CAPACIDADE, NUMERO_CX, TIPO_SPLITTER, LABEL, acoplamento FROM tstmeta.splitter_e, tst.tipo_splitter WHERE IDMETA = {idmeta} AND tst.tipo_splitter.id = splitter_e.TIPO_SPLITTER`,
        { idmeta: idmeta }
      ).toPromise();
      
      if (!splitterResponse?.success || !splitterResponse.data || splitterResponse.data.length === 0) {
        console.log(`❌ [SPLITTER-DOT] Dados do splitter não encontrados`);
        return;
      }
      
      const splitterData = splitterResponse.data[0];
      const capacidade = splitterData.CAPACIDADE || 0;
      const numeroCx = splitterData.NUMERO_CX || idmeta;
      const tipoSplitter = splitterData.TIPO_SPLITTER || 0;
      const label = splitterData.LABEL || `SPLIT_${idmeta}`;
      const acoplamento = splitterData.ACOPLAMENTO || '';
      
      // Determinar cor (igual ao VB6 linha 690)
      const colorSp = tipoSplitter > 11 ? 'fillcolor=lightblue' : 'fillcolor=palegreen';
      
      // Compor objeto atual (igual ao VB6 linha 697)
      const novoObjetoAtual = `SPLIT_${label}_CX_${numeroCx}`;
      
      // Determinar texto e forma (igual ao VB6 linha 703-704)
      let textoSp: string;
      let sides: number;
      
      if (tipoSplitter > 11) {
        textoSp = `1:${capacidade}_SPLITTER:${label}\\n( CX_${numeroCx} )`;
        sides = 8;
      } else {
        textoSp = `_${acoplamento}_SPLITTER:${label}\\n( CX_${numeroCx} )`;
        sides = 4;
      }
      
      const textoLimitado = `"${textoSp.substring(0, 40)}"`;
      const estilo = 'rounded,filled';
      
      // 🆕 CORREÇÃO: Adicionar nó do objeto anterior com ranksep
      if (this.Objeto_Anterior) {
        this.dotString += `${this.Objeto_Anterior}[ranksep=0.001];`;
      }
      
      // 🆕 CORREÇÃO: Adicionar nó do splitter com interatividade (igual ao VB6 linha 710)
      const url = `javascript:onSplitterClick(${idmeta}, ${capacidade}, '${label}')`;
      const tooltip = `Splitter ${label} - Capacidade: ${capacidade}F - CX: ${numeroCx}`;
      this.dotString += `${novoObjetoAtual}[label=${textoLimitado},shape=polygon,sides="${sides}",style="${estilo}",ranksep=0.001,fontsize=6.5,GRADIENTANGLE=100,${colorSp},URL="${url}",tooltip="${tooltip}"];`;
      
      // 🆕 CORREÇÃO: Adicionar conexão com label "Entrada" (igual ao VB6 linha 710)
      if (this.Objeto_Anterior) {
        const conexao = `${this.Objeto_Anterior}->${novoObjetoAtual} [label="Entrada",color="${this.cor}",fontsize=9,weight=0.1];`;
        this.dotString += conexao;
        console.log(`🔗 [SPLITTER-CONEXÃO] ${this.Objeto_Anterior} -> ${novoObjetoAtual} (Label: "Entrada")`);
      }
      
      this.Objeto_Atual = novoObjetoAtual;
      
      console.log(`🎨 [SPLITTER-DOT] Compoe: ${novoObjetoAtual} - Anterior: ${this.Objeto_Anterior}, Atual: ${this.Objeto_Atual}`);
    } catch (error) {
      console.error(`❌ [SPLITTER-DOT] Erro ao compor DOT do SPLITTER:`, error);
    }
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

    // Extrair IDMETA do splitter do conteúdo: prop.splitter750062_1.label
    const match = conteudo.match(/splitter(\d+)_(\d+)/);
    if (match) {
      const splitterIdmeta = parseInt(match[1]);
      const saidaNumero = parseInt(match[2]);
      console.log(`🔀 [SPLITTER-SAIDA] IDMETA do splitter: ${splitterIdmeta}, Saída: ${saidaNumero}`);
      
      return {
        idmeta: splitterIdmeta, // Usar o IDMETA do splitter, não o atual
        fiber: `S${saidaNumero}` as any, // "S1", "S2", etc. para Splitter Saída
        tabela: '',
        registro: '',
        status: 'fim' // Finaliza o rastreamento como destino final
      };
    }

    // Se não conseguiu extrair o IDMETA, usar o atual
    console.log(`🔀 [SPLITTER-SAIDA] Não foi possível extrair IDMETA, usando atual: ${idmeta}`);
    return {
      idmeta: idmeta,
      fiber: "S" as any, // Fallback para "S" se não conseguir extrair o número
      tabela: '',
      registro: '',
      status: 'fim'
    };
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

    // 🆕 NOVO: Compor DOT do POP (igual ao VB6 linha 597)
    try {
      const popResponse = await this.fiberApiService.executeDynamicQuery(
        `SELECT sigla FROM tst.estações WHERE id_meta = {idmeta}`,
        { idmeta: popIdmeta }
      ).toPromise();
      
      const sigla = popResponse?.data?.[0]?.sigla || `POP_${popIdmeta}`;
      
      // Compor novo objeto atual (igual ao VB6 linha 595)
      const novoObjetoAtual = `"${sigla.substring(0, 22)}"`;
      
      // 🆕 CORREÇÃO: Adicionar nó do objeto atual
      this.dotString += `${novoObjetoAtual}[label=${novoObjetoAtual},color="${this.cor}"];`;
      
      // 🆕 CORREÇÃO: Adicionar conexão entre objetos com label da fibra (igual ao VB6 linha 597)
      if (this.Objeto_Anterior) {
        const labelFibra = this.fibraString || `"${fiber}"`;
        const conexao = `${this.Objeto_Anterior}->${novoObjetoAtual} [label=${labelFibra},color="${this.cor}",style="setlinewidth(2)",fontsize=18];`;
        this.dotString += conexao;
        console.log(`🔗 [POP-CONEXÃO] ${this.Objeto_Anterior} -> ${novoObjetoAtual} (Label: ${labelFibra})`);
      }
      
      this.Objeto_Atual = novoObjetoAtual;
      
      console.log(`🎨 [POP-DOT] Compoe: ${novoObjetoAtual} - Anterior: ${this.Objeto_Anterior}, Atual: ${this.Objeto_Atual}`);
    } catch (error) {
      console.error(`❌ [POP-DOT] Erro ao compor DOT do POP:`, error);
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

    // 🆕 NOVO: Compor DOT do RABICHO (igual ao VB6 linha 628)
    try {
      const rabichoResponse = await this.fiberApiService.executeDynamicQuery(
        `SELECT label_rabicho FROM tstmeta.rabicho WHERE id_meta = {idmeta}`,
        { idmeta: idmeta }
      ).toPromise();
      
      const label_rabicho = rabichoResponse?.data?.[0]?.label_rabicho || `RAB_${idmeta}`;
      
      // Compor novo objeto atual (igual ao VB6 linha 626)
      const novoObjetoAtual = `"${label_rabicho.substring(0, 20)}"`;
      
      // 🆕 CORREÇÃO: Adicionar nó do objeto atual
      this.dotString += `${novoObjetoAtual}[label=${novoObjetoAtual},color="${this.cor}"];`;
      
      // 🆕 CORREÇÃO: Adicionar conexão entre objetos com label da fibra (igual ao VB6 linha 628)
      if (this.Objeto_Anterior) {
        const labelFibra = this.fibraString || `"${fiber}"`;
        const conexao = `${this.Objeto_Anterior}->${novoObjetoAtual} [label=${labelFibra},color="${this.cor}"];`;
        this.dotString += conexao;
        console.log(`🔗 [RABICHO-CONEXÃO] ${this.Objeto_Anterior} -> ${novoObjetoAtual} (Label: ${labelFibra})`);
      }
      
      this.Objeto_Atual = novoObjetoAtual;
      
      console.log(`🎨 [RABICHO-DOT] Compoe: ${novoObjetoAtual} - Anterior: ${this.Objeto_Anterior}, Atual: ${this.Objeto_Atual}`);
    } catch (error) {
      console.error(`❌ [RABICHO-DOT] Erro ao compor DOT do RABICHO:`, error);
    }

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
