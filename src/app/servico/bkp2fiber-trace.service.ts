import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FiberApiService } from './fiber-api.service';

// Interfaces para o rastreamento de fibras
export interface FiberTraceStep {
  idmeta: number;
  fiber: number;
  tabela: string;
  registro: string;
  tipo: string;
  status: 'processando' | 'fim' | 'continua' | 'erro';
}

export interface FiberTraceResult {
  success: boolean;
  trace: FiberTraceStep[];
  status: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FiberTraceService {

  constructor(
    private fiberApiService: FiberApiService
  ) {}

  /**
   * Cancela todas as operações em andamento
   */
  cancelAllOperations(): void {
    console.log('🛑 [TRACE-SERVICE] Cancelando todas as operações HTTP');
    this.fiberApiService.cancelAllOperations();
  }

  /**
   * Método para calcular tubo baseado no número da fibra
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

  //============================================================= =============================================================
  //============================================================================================================================================
  //============================================================================================================================================
  /**
   * MÉTODO PRINCIPAL: Rastreamento de Fibra
   * Baseado no algoritmo ANALISA_TABELA_INI do módulo VB6 LE_CONEX
   * 
   * @param idmeta ID do equipamento inicial
   * @param fiber Número da fibra inicial
   * @param tabela Tabela inicial
   * @param registro Registro/campo inicial
   * @returns Observable com a rota completa da fibra
   */
  ANALISA_TABELA_INI(idmeta: number, fiber: number, tabela: string, registro: string): Observable<FiberTraceResult> {
    // PASSO 1: Criar Observable para retornar o resultado
    return new Observable(observer => {
      // PASSO 2: Iniciar o rastreamento recursivo
      this.performTrace(idmeta, fiber, tabela, registro, [], observer, 0);
    });
  }

  /**
   * Executa o rastreamento recursivo da fibra
   * Implementa o loop principal do algoritmo VB6
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
      // PASSO 1: Verificar limite de passos para evitar loops infinitos
      if (stepCount >= 1500) {
        console.log(`🛑 [LIMITE] Rastreamento interrompido - Limite de 1500 passos atingido (passo ${stepCount})`);
        const limitStep: FiberTraceStep = {
          idmeta: idmeta,
          fiber: fiber,
          tabela: tabela,
          registro: registro,
          tipo: 'limite_atingido',
          status: 'fim'
        };
        tracePath.push(limitStep);
        observer.next({ success: true, trace: tracePath, status: 'limite_atingido' });
        observer.complete();
        return;
      }

      // PASSO 2: Log do passo atual e debug
      console.log(`🔍 [RASTREIO] Passo ${stepCount + 1}/150 - IDMETA: ${idmeta}, Fibra: ${fiber}, Tabela: ${tabela}, Registro: ${registro}`);
      console.log(`📊 ===============>[DEBUG] Valores da busca - IDMETA: ${idmeta}, Tabela: ${tabela}, Registro: ${registro}`);
      
      // PASSO 3: Criar objeto do passo atual para o trace
      const currentStep: FiberTraceStep = {
        idmeta: idmeta,
        fiber: fiber,
        tabela: tabela,
        registro: registro,
        tipo: 'unknown',
        status: 'processando'
      };

      // PASSO 4: Consultar registro atual no banco de dados
      console.log(`📋 [CONSULTA] Buscando registro ${registro} na tabela ${tabela} para IDMETA ${idmeta}`);
      const registroResponse = await this.fiberApiService.getRegistroByIdmeta(tabela, idmeta, registro).toPromise();
      
      // PASSO 5: Verificar se encontrou conexão
      if (!registroResponse || !registroResponse.success || !registroResponse.valor) {
        // Cabo aberto - para aqui
        console.log(`❌ [FIM] Cabo aberto - sem conexão encontrada`);
        currentStep.status = 'fim';
        currentStep.tipo = 'cabo_aberto';
        tracePath.push(currentStep);
        observer.next({ success: true, trace: tracePath, status: 'fim' });
        observer.complete();
        return;
      }

      // PASSO 6: Obter conteúdo da conexão encontrada
      const tabel = registroResponse.valor;
      console.log(`✅ [CONEXÃO] Encontrada conexão: ${tabel}`);

      // PASSO 7: Verificar se parou na caixa (=id())
      if (tabel === '=id()') {
        console.log(`🏠 [CAIXA] Parada na caixa - fim do rastreamento`);
        currentStep.status = 'fim';
        currentStep.tipo = 'caixa_parada';
        tracePath.push(currentStep);
        observer.next({ success: true, trace: tracePath, status: 'fim' });
        observer.complete();
        return;
      }

      // PASSO 8: Inicializar variáveis para próximo passo
      let nextIdmeta = idmeta;
      let nextFiber = fiber;
      let nextTabela = tabela;
      let nextRegistro = registro;
      let status = 'continua';

      // PASSO 9: Verificar se há conteúdo para processar
      if (tabel !== '' && tabel !== null && tabel !== undefined) {
        console.log(`🔄 [CONTINUA] Conteúdo encontrado: ${tabel}`);
        
        // PASSO 10: Verificar se é =id() (parada na caixa atual)
        if (tabel === '=id()') {
          console.log(`🏠 [CAIXA-ATUAL] Fibra parou na caixa atual - IDMETA: ${idmeta}`);
          nextIdmeta = idmeta;
          nextFiber = 1;
          nextTabela = '';
          nextRegistro = '';
          status = 'fim';
        } else {
          // PASSO 11: Processar o conteúdo para extrair próxima tabela/registro/IDMETA
          const result = await this.processContent(tabel, registro, idmeta, tabela);
          nextIdmeta = result.idmeta;
          nextFiber = result.fiber;
          nextTabela = result.tabela;
          nextRegistro = result.registro;
          status = 'continua';
        }
        
        console.log(`➡️ [PRÓXIMO] IDMETA: ${nextIdmeta}, Fibra: ${nextFiber}, Tabela: ${nextTabela}, Registro: ${nextRegistro}`);
      } else {
        // PASSO 12: Conteúdo vazio - fim do rastreamento
        console.log(`🏁 [FIM] Conteúdo vazio - fim do rastreamento`);
        status = 'fim';
      }

      // PASSO 13: Atualizar status do passo atual e adicionar ao trace
      currentStep.status = status as 'processando' | 'fim' | 'continua' | 'erro';
      tracePath.push(currentStep);

      // PASSO 14: Verificar se deve parar ou continuar
      if (status === 'fim' || status === 'erro') {
        console.log(`🏁 [FIM] Rastreamento finalizado - Status: ${status}`);
        observer.next({ success: true, trace: tracePath, status: status });
        observer.complete();
      } else if (nextTabela && nextRegistro) {
        // PASSO 15: Continuar rastreamento recursivo
        console.log(`➡️ [CONTINUA] Próximo passo - IDMETA: ${nextIdmeta}, Fibra: ${nextFiber}, Tabela: ${nextTabela}, Registro: ${nextRegistro}`);
        console.log(`📊 ===============>[DEBUG] Nova busca - IDMETA: ${nextIdmeta}, Tabela: ${nextTabela}, Registro: ${nextRegistro}`);
        await this.performTrace(nextIdmeta, nextFiber, nextTabela, nextRegistro, tracePath, observer, stepCount + 1);
      } else {
        // PASSO 16: Verificar se chegou em algum equipamento específico (destino final)
        if (nextIdmeta !== idmeta) {
          console.log(`🏁 [DESTINO] Adicionando equipamento ao trace - IDMETA: ${nextIdmeta}, Fibra: ${nextFiber}`);
          const finalStep: FiberTraceStep = {
            idmeta: nextIdmeta,
            fiber: nextFiber,
            tabela: '',
            registro: '',
            tipo: 'destino_final',
            status: 'fim'
          };
          tracePath.push(finalStep);
        } else if (nextTabela === '' && nextRegistro === '' && nextIdmeta === idmeta) {
          // PASSO 17: Caso especial: =id() - fibra parou na caixa atual
          console.log(`🏠 [CAIXA-ATUAL] Adicionando caixa atual ao trace - IDMETA: ${nextIdmeta}, Fibra: ${nextFiber}`);
          const caixaStep: FiberTraceStep = {
            idmeta: nextIdmeta,
            fiber: nextFiber,
            tabela: '',
            registro: '',
            tipo: 'caixa_atual',
            status: 'fim'
          };
          tracePath.push(caixaStep);
        } else {
          // PASSO 18: Rastreamento interrompido - Tabela ou registro vazios
          console.log(`❌ [FIM] Rastreamento interrompido - Tabela ou registro vazios`);
          currentStep.status = 'fim';
          currentStep.tipo = 'cabo_aberto';
          tracePath.push(currentStep);
        }
        observer.next({ success: true, trace: tracePath, status: 'fim' });
        observer.complete();
      }

    } catch (error: any) {
      // PASSO 19: Tratamento de erro
      observer.error({ success: false, error: error.message, trace: tracePath });
    }
  }

  /**
   * Processa o conteúdo dinamicamente - seguindo exatamente o VB6
   * Extrai próxima tabela, registro e IDMETA baseado no conteúdo
   */
  private async processContent(conteudo: string, registro: string, idmeta: number, tabelaOriginal: string): Promise<{
    idmeta: number,
    fiber: number,
    tabela: string,
    registro: string
  }> {
    // PASSO 1: Log do processamento do conteúdo
    console.log(`🔍 [PROCESSAR] Conteúdo: ${conteudo}, Registro: ${registro}, IDMETA: ${idmeta}`);
    
    // PASSO 2: Verificar se o conteúdo é =id() (parada na caixa atual)
    if (conteudo === '=id()') {
      console.log(`🏠 [CAIXA-ATUAL] Fibra parou na caixa atual - IDMETA: ${idmeta}`);
      return { idmeta, fiber: 1, tabela: '', registro: '' };
    }
    
    // PASSO 3: Extrair informações do conteúdo usando regex
    const info = this.extractInfoFromContent(conteudo, idmeta);
    console.log(`📊 [EXTRAÍDO] ${JSON.stringify(info)}`);
    
    // PASSO 4: Inicializar variáveis para próxima tabela/registro/IDMETA
    let proximaTabela = '';
    let proximoRegistro = '';
    let proximoIdmeta = idmeta;
    let proximaFibra = 1;
    
    // PASSO 5: Processar baseado no tipo de equipamento extraído
    if (info.tipo === 'diocabo') {
      // PASSO 5A: DIO com bandeja: processar como DIOcabo
      console.log(`🔌 [DIO-CABO] Processando DIO com bandeja: ${conteudo}`);
      const result = await this.processDIOCabo(conteudo, registro, idmeta, tabelaOriginal);
      return {
        idmeta: result.idmeta,
        fiber: result.fiber,
        tabela: result.tabela,
        registro: result.registro
      };
      
    } else if (info.tipo === 'caixa_atual') {
      // PASSO 5B: Caixa atual: parar rastreamento - fibra parou na própria caixa
      console.log(`🏠 [CAIXA-ATUAL] Fibra parou na caixa atual - IDMETA: ${info.idmeta}`);
      proximaTabela = '';
      proximoRegistro = '';
      proximoIdmeta = info.idmeta;
      proximaFibra = info.fibra;
      console.log(`✅ [CAIXA-ATUAL] Rastreamento finalizado - IDMETA: ${proximoIdmeta}, Fibra: ${proximaFibra}`);
      
    } else if (info.tipo === 'cabo') {
      // PASSO 5C: Cabo: determinar ponta A ou B baseado no conteúdo (seguindo VB6)
      const isPontaB = conteudo.includes('B!');
      const isPontaA = conteudo.includes('A!');
      const isLabel = conteudo.includes('Label');
      const isValue = conteudo.includes('VALUE');
      const tubo = this.calculateTubo(info.fibra);
      
      // PASSO 5C.1: Detectar ponta B com Label
      if (isPontaB && isLabel) {
        proximaTabela = `cabob_t${tubo}`;
        proximoRegistro = `FIBRA_${info.fibra}LABEL`; // FIBRA_1LABEL no exemplo
        console.log(`🔌 [CABO-B] Detectada ponta B - Tabela: ${proximaTabela}, Registro: ${proximoRegistro}`);
      } 
      // PASSO 5C.2: Detectar ponta A com Label
      else if (isPontaA && isLabel) {
        proximaTabela = `caboa_t${tubo}`;
        proximoRegistro = `FIBRA_${info.fibra}LABEL`; // FIBRA_1LABEL no exemplo
        console.log(`🔌 [CABO-A] Detectada ponta A - Tabela: ${proximaTabela}, Registro: ${proximoRegistro}`);
      } 
      // PASSO 5C.3: Detectar ponta B com Value
      else if (isPontaB && isValue) {
        proximaTabela = `cabob_t${tubo}`;
        proximoRegistro = `FIBRA_${info.fibra}`; // FIBRA_1 no exemplo
        console.log(`🔌 [CABO-B] Detectada ponta B - Tabela: ${proximaTabela}, Registro: ${proximoRegistro}`);
      } 
      // PASSO 5C.4: Detectar ponta A com Value
      else if (isPontaA && isValue) {
        proximaTabela = `caboa_t${tubo}`;
        proximoRegistro = `FIBRA_${info.fibra}`; // FIBRA_1 no exemplo
        console.log(`🔌 [CABO-A] Detectada ponta A - Tabela: ${proximaTabela}, Registro: ${proximoRegistro}`);
      } else {
        // PASSO 5C.5: Erro: não conseguiu detectar ponta
        console.log(`❌ [ERRO-CABO] Não conseguiu detectar ponta A ou B no conteúdo: ${conteudo}`);
        proximaTabela = '';
        proximoRegistro = '';
      }

      // PASSO 5C.6: Definir IDMETA e fibra para cabo
      proximoIdmeta = info.idmeta;
      proximaFibra = info.fibra;
      
    } else if (info.tipo === 'caixa') {
      // PASSO 5D: Caixa: ir para cxbocaX_tY
      const tubo = this.calculateTubo(info.fibra);
      proximaTabela = `cxboca${info.boca}_t${tubo}`;
      
      // PASSO 5D.1: Determinar se próximo campo termina com L (Label) ou não (Value)
      if (conteudo.includes('prop.') && conteudo.includes('label') && !conteudo.includes('=')) {
        proximoRegistro = `F${info.fibra}L`; // F1L no exemplo
      } else {
        proximoRegistro = `F${info.fibra}`; // F1 no exemplo
      }
      
      // PASSO 5D.2: Definir IDMETA e fibra para caixa
      proximoIdmeta = info.idmeta;
      proximaFibra = info.fibra;
      
    } else if (info.tipo === 'dio') {
      // PASSO 5E: DIO: destino final - parar rastreamento e retornar IDMETA e fibra
      console.log(`🏁 [DIO] Fibra chegou no DIO ID: ${info.idmeta} - DESTINO FINAL`);
      
      // PASSO 5E.1: Extrair número da fibra do registro
      const fibra = this.extractFiberFromRegistro(registro);
      console.log(`🔍 [DIO] Fibra extraída do registro: ${fibra}`);
      
      // PASSO 5E.2: Parar o rastreamento - DIO é o destino final
      proximaTabela = '';
      proximoRegistro = '';
      proximoIdmeta = info.idmeta;
      proximaFibra = fibra;
      
      console.log(`✅ [DIO] Rastreamento finalizado - IDMETA: ${proximoIdmeta}, Fibra: ${proximaFibra}`);
    } else if (info.tipo === 'pop') {
      // PASSO 5F: POP: parar
      console.log(`🏢 [POP] Fibra chegou no POP ID: ${info.idmeta} - DESTINO FINAL`);
      proximaTabela = '';
      proximoRegistro = '';
      proximoIdmeta = info.idmeta;
      proximaFibra = info.fibra;
      console.log(`✅ [POP] Rastreamento finalizado - IDMETA: ${proximoIdmeta}, Fibra: ${proximaFibra}`);
    } else if (info.tipo === 'splitter') {
      // PASSO 5G: Splitter: parar
      console.log(`🔀 [SPLITTER] Fibra chegou no Splitter ID: ${info.idmeta} - DESTINO FINAL`);
      proximaTabela = '';
      proximoRegistro = '';
      proximoIdmeta = info.idmeta;
      proximaFibra = info.fibra;
      console.log(`✅ [SPLITTER] Rastreamento finalizado - IDMETA: ${proximoIdmeta}, Fibra: ${proximaFibra}`);
    } else if (info.tipo === 'splitter_entrada') {
      // PASSO 5H: Splitter entrada: parar rastreamento (seguindo VB6)
      console.log(`🔀 [SPLITTER-ENTRADA] Fibra chegou na entrada do Splitter ID: ${info.idmeta} - FIM DO RASTREAMENTO`);
      proximaTabela = '';
      proximoRegistro = '';
      proximoIdmeta = info.idmeta;
      proximaFibra = info.fibra;
      console.log(`✅ [SPLITTER-ENTRADA] Rastreamento finalizado - IDMETA: ${proximoIdmeta}, Fibra: ${proximaFibra}`);
    } else {
      // PASSO 5I: Tipo de equipamento não reconhecido
      console.log(`❓ [DESCONHECIDO] Tipo de equipamento não reconhecido: ${info.tipo}`);
    }
    
    // PASSO 6: Log do próximo passo e retornar resultado
    console.log(`➡️ [PRÓXIMO] Tabela: ${proximaTabela}, Registro: ${proximoRegistro}, IDMETA: ${proximoIdmeta}, Fibra: ${proximaFibra}`);
    
    return {
      idmeta: proximoIdmeta,
      fiber: proximaFibra,
      tabela: proximaTabela,
      registro: proximoRegistro
    };
  }

  /**
   * Processa equipamento tipo DIO com Bandeja (DIOcabo)
   * Seguindo exatamente a lógica do VB6 le_conex
   */
  private async processDIOCabo(tabel: string, registro: string, idmeta: number, tabelaOriginal: string): Promise<{
    idmeta: number, 
    fiber: number, 
    tabela: string, 
    registro: string
  }> {
    // Extrair número da fibra - linha 360-361 VB6
    const fiber = parseInt(registro.substring(1)); // Remove 'F' do início
    console.log(`🔍 [DIO-CABO] Fibra extraída: ${fiber}`);
    
    // Determinar conector baseado na tabela - linhas 364-369 VB6
    const conector = this.extractConectorFromTabela(tabel);
    console.log(`🔌 [DIO-CABO] Conector determinado: c${conector}`);
    
    // Buscar cabo conectado na bandeja - linhas 364-369 VB6
    console.log(`🔍 [DIO-CABO] Buscando cabo conectado na bandeja c${conector}...`);
    const caboResponse = await this.fiberApiService.executeDynamicQuery(
      `SELECT c${conector} as cabo FROM tstmeta.dio WHERE id_meta = {idmeta}`,
      { idmeta: idmeta }
    ).toPromise();
    
    // Verificar se cabo é "ZERO" - linha 371 VB6
    if (!caboResponse?.success || !caboResponse.data || caboResponse.data.length === 0 || caboResponse.data[0].cabo === 'ZERO') {
      console.log(`❌ [DIO-CABO] Cabo não encontrado ou ZERO - fim do rastreamento`);
      return { idmeta, fiber: 0, tabela: '', registro: '' };
    }
    
    const cabo = caboResponse.data[0].cabo;
    console.log(`✅ [DIO-CABO] Cabo encontrado: ${cabo}`);
    
    // Calcular tubo baseado na fibra - linhas 380-391 VB6
    const tubo = this.calculateTubo(fiber);
    console.log(`📊 [DIO-CABO] Tubo calculado para fibra ${fiber}: t${tubo}`);
    
    // VB6 linha 375: "select FN" & FIBER & " as fiber from " & TABELA
    // TABELA mantém o valor original (dio_t2), não muda durante o processamento
    console.log(`🔍 [DIO-CABO] Consultando fibra FN${fiber} na tabela original...`);
    
    // Buscar fibra conectada na tabela original (como no VB6)
    // A tabela deve ser dinâmica, não fixa
    const fiberResponse = await this.fiberApiService.executeDynamicQuery(
      `SELECT FN${fiber} as fiber FROM tstmeta.${tabelaOriginal} WHERE idmeta = {idmeta}`,
      { idmeta: idmeta }
    ).toPromise();
    
    const fibraCabo = fiberResponse?.data?.[0]?.fiber || 0;
    console.log(`🔍 [DIO-CABO] Fibra conectada encontrada: ${fibraCabo}`);
    
    // Se não encontrou fibra conectada, retornar fim do rastreamento
    if (fibraCabo === 0 || fibraCabo === null || fibraCabo === undefined) {
      console.log(`❌ [DIO-CABO] Fibra conectada não encontrada - fim do rastreamento`);
      return { idmeta, fiber: 0, tabela: '', registro: '' };
    }
    
    // Calcular tubo para o cabo - linhas 380-391 VB6
    const tuboCabo = this.calculateTubo(fibraCabo);
    console.log(`📊 [DIO-CABO] Tubo calculado para fibra do cabo ${fibraCabo}: t${tuboCabo}`);
    
    // Determinar ponta A ou B - linhas 393-395 VB6
    const isPontaB = cabo.includes('B');
    const tabelaCabo = isPontaB ? `cabob_t${tuboCabo}` : `caboa_t${tuboCabo}`;
    console.log(`🔌 [DIO-CABO] Ponta ${isPontaB ? 'B' : 'A'} - Tabela do cabo: ${tabelaCabo}`);
    
    // Extrair IDMETA do cabo - linha 399 VB6: IDmet = Mid(CABO, 5, POS - 5)
    const caboIdmeta = this.extractCaboIdmeta(cabo);
    console.log(`🆔 [DIO-CABO] IDMETA do cabo extraído: ${caboIdmeta}`);
    
    console.log(`✅ [DIO-CABO] Resultado final - IDMETA: ${caboIdmeta}, Fibra: ${fibraCabo}, Tabela: ${tabelaCabo}, Registro: Fibra_${fibraCabo}`);
    
    return {
      idmeta: caboIdmeta,
      fiber: fibraCabo,
      tabela: tabelaCabo,
      registro: `Fibra_${fibraCabo}` // linha 397 VB6: reg = "Fibra_" & fibra
    };
  }

  /**
   * Extrai informações do conteúdo - seguindo lógica do VB6
   */
  private extractInfoFromContent(conteudo: string, idmeta: number): {
    tipo: string,
    idmeta: number,
    fibra: number,
    boca?: number
  } {
    // PASSO 1: Log do conteúdo a ser analisado
    console.log(`🔍 [EXTRAIR] Conteúdo: ${conteudo}`);
    
    // PASSO 2: Verificar se é parada na caixa atual (=id())
    if (conteudo === '=id()') {
      console.log(`🏠 [CAIXA] Fibra parou na caixa atual - IDMETA: ${idmeta}`);
      return {
        tipo: 'caixa_atual',
        idmeta: idmeta, // Usar o IDMETA atual da caixa
        fibra: 1
      };
    }
    
    // PASSO 3: Verificar se é DIO com bandeja (dioc2_t1, dioc1_t2, etc.)
    if (conteudo.includes('dioc') && conteudo.includes('_t')) {
      const match = conteudo.match(/dioc(\d+)_t(\d+)/);
      if (match) {
        return {
          tipo: 'diocabo',
          idmeta: 0, // Será preenchido depois
          fibra: 1   // Será preenchido depois
        };
      }
    }
    
    // PASSO 4: Verificar se é cabo (ponta A ou B): =cabo350807A!Prop.Fibra_1.Label
    if (conteudo.includes('cabo') && conteudo.includes('!') && conteudo.includes('Prop.Fibra_')) {
      const match = conteudo.match(/=cabo(\d+)([AB])!Prop\.Fibra_(\d+)\.(Label|VALUE)/);
      if (match) {
        return {
          tipo: 'cabo',
          idmeta: parseInt(match[1]), // match[1] = ID do cabo
          fibra: parseInt(match[3])   // match[3] = número da fibra
        };
      }
    }
    
    // PASSO 5: Verificar se é caixa TST: =TST350814!PROP.BOCA2_1.VALUE
    if (conteudo.includes('TST') && conteudo.includes('BOCA')) {
      const match = conteudo.match(/=TST(\d+)!PROP\.BOCA(\d+)_(\d+)\.VALUE/);
      if (match) {
        return {
          tipo: 'caixa',
          idmeta: parseInt(match[1]), // match[1] = ID da caixa
          fibra: parseInt(match[3]),  // match[3] = número da fibra
          boca: parseInt(match[2])    // match[2] = número da boca
        };
      }
    }
    
    // PASSO 6: Verificar se é caixa simples: prop.boca1_1.label
    if (conteudo.includes('prop.') && conteudo.includes('label') && !conteudo.includes('=')) {
      const match = conteudo.match(/prop\.boca(\d+)_(\d+)\.label/);
      if (match) {
        return {
          tipo: 'caixa',
          idmeta: idmeta, // Manter o IDMETA atual - mesma caixa
          fibra: parseInt(match[2]), // match[2] = número da fibra
          boca: parseInt(match[1])   // match[1] = número da boca
        };
      }
    }
    
    // PASSO 7: Verificar se é DIO: =DIO350833!PROP.ROW_5.LABEL
    if (conteudo.includes('DIO') && conteudo.includes('!') && conteudo.includes('PROP.ROW_5.LABEL')) {
      const match = conteudo.match(/=DIO(\d+)!PROP\.ROW_5\.LABEL/);
      if (match) {
        return {
          tipo: 'dio',
          idmeta: parseInt(match[1]), // match[1] = ID do DIO
          fibra: 1
        };
      }
    }
    
    // PASSO 8: Verificar se é splitter: splitter_e ou splitter_E (entrada do splitter)
    if (conteudo.includes('splitter_e') || conteudo.includes('splitter_E')) {
      console.log(`🔀 [SPLITTER] Encontrada entrada de splitter: ${conteudo}`);
      // Extrair número da fibra do nome da tabela (seguindo VB6)
      const pos1 = conteudo.indexOf('_');
      const pos2 = conteudo.indexOf('.l');
      if (pos1 !== -1 && pos2 !== -1) {
        const digitos = pos2 - pos1;
        const idmet = parseInt(conteudo.substring(pos1 + 2, pos1 + 2 + digitos - 1));
        console.log(`🔀 [SPLITTER] IDMETA extraído: ${idmet}`);
        return {
          tipo: 'splitter_entrada',
          idmeta: idmet,
          fibra: 1
        };
      }
    }
    
    // PASSO 9: Padrão não reconhecido
    console.log(`❓ [DESCONHECIDO] Conteúdo não reconhecido: ${conteudo}`);
    return {
      tipo: 'unknown',
      idmeta: 0,
      fibra: 1
    };
  }

  // Métodos auxiliares para extração de dados
  private extractFiberFromRegistro(registro: string): number {
    // Para tabelas dio_tX: F1, F2, F3, etc.
    // Para tabelas caboa_tX/cabob_tX: FIBRA_1LABEL, FIBRA_2LABEL, etc.
    if (registro.startsWith('F') && !registro.includes('_')) {
      // Formato F1, F2, F3 (tabelas dio_tX)
      return parseInt(registro.substring(1));
    } else if (registro.startsWith('FIBRA_') && registro.includes('LABEL')) {
      // Formato FIBRA_1LABEL, FIBRA_2LABEL (tabelas caboa_tX/cabob_tX)
      const startIndex = registro.indexOf('_') + 1;
      const endIndex = registro.indexOf('LABEL');
      return parseInt(registro.substring(startIndex, endIndex));
    }
    return 1; // Default
  }

  private extractConectorFromTabela(tabela: string): number {
    // Seguindo exatamente a lógica do VB6 linhas 364-369
    if (tabela.includes('c1')) return 1;
    if (tabela.includes('c2')) return 2;
    if (tabela.includes('c3')) return 3;
    if (tabela.includes('c4')) return 4;
    if (tabela.includes('c5')) return 5;
    if (tabela.includes('c6')) return 6;
    
    // Se não encontrar, retornar 1 como padrão
    return 1;
  }

  private extractCaboIdmeta(cabo: string): number {
    const posA = cabo.indexOf('A');
    const posB = cabo.indexOf('B');
    const pos = Math.max(posA, posB);
    // VB6: Mid(CABO, 5, POS - 5) - começa na posição 5, pega (POS - 5) caracteres
    return parseInt(cabo.substring(4, pos)); // substring(4, pos) = posição 5 até POS
  }
}