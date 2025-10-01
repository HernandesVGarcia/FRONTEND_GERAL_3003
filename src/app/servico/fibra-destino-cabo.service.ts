import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { FibraDestino, ConsultaFibra, CaboInfo } from '../modelo/FibraDestino';
import { firstValueFrom } from 'rxjs';
import { timeout, retry } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { FiberApiService } from './fiber-api.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FibraDestinoCaboService {

  private baseUrl: string = environment.apiUrlAbsolute;
  
  //===============================================
  private readonly TIMEOUT = 15000; // 15 segundos (mais tempo para rastreamento)
  private readonly RETRY_ATTEMPTS = 2; // Menos tentativas para evitar sobrecarga
  //===============================================

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private fiberApiService: FiberApiService
  ) { }

  /**
   * Processa o tipo de objeto RABICHO conforme lógica VB6
   * If RSmet!tipo_objeto = "Rabicho" Then 
   *   Set RStst = frmLogin.connMETA.Execute("SELECT label_rabicho AS NOME FROM rabicho WHERE ID_META ='" & idcabo & "';")
   *   DESTNAME = RStst!nome
   */
  async processarTipoRabicho(id_meta: string): Promise<string> {
    try {
      console.log(`🔍 [RABICHO] Processando RABICHO para IDMETA: ${id_meta}`);
      
      const rabichoResponse = await this.fiberApiService.executeDynamicQuery(
        'SELECT label_rabicho AS NOME FROM rabicho WHERE ID_META = {idmeta}',
        { idmeta: id_meta }
      ).toPromise();

      if (rabichoResponse?.success && rabichoResponse.data && rabichoResponse.data.length > 0) {
        const labelRabicho = rabichoResponse.data[0].NOME;
        
        console.log(`📊 [RABICHO] Label encontrado: ${labelRabicho}`);
        return labelRabicho;
      } else {
        console.log(`❌ [RABICHO] RABICHO não encontrado para IDMETA: ${id_meta}`);
        return 'RABICHO NÃO ENCONTRADO';
      }
    } catch (error) {
      console.error(`❌ [RABICHO] Erro ao processar RABICHO:`, error);
      return 'ERRO AO CONSULTAR RABICHO';
    }
  }

  /**
   * Processa o tipo de objeto CONDOMINIO conforme lógica VB6
   * If RSmet!tipo_objeto = "CONDOMINIO" Then 
   *   Set RStst = frmLogin.conn.Execute("SELECT CONDOMINIO AS NOME FROM condominio WHERE ID_META ='" & idcabo & "';")
   *   DESTNAME = RStst!nome
   */
  async processarTipoCondominio(id_meta: string): Promise<string> {
    try {
      console.log(`🔍 [CONDOMINIO] Processando CONDOMINIO para IDMETA: ${id_meta}`);
      
      const condominioResponse = await this.fiberApiService.executeDynamicQuery(
        'SELECT CONDOMINIO AS NOME FROM tst.condominio WHERE ID_META = {idmeta}',
        { idmeta: id_meta }
      ).toPromise();

      if (condominioResponse?.success && condominioResponse.data && condominioResponse.data.length > 0) {
        const nomeCondominio = condominioResponse.data[0].NOME;
        
        console.log(`📊 [CONDOMINIO] Nome encontrado: ${nomeCondominio}`);
        return nomeCondominio;
      } else {
        console.log(`❌ [CONDOMINIO] CONDOMINIO não encontrado para IDMETA: ${id_meta}`);
        return 'CONDOMINIO NÃO ENCONTRADO';
      }
    } catch (error) {
      console.error(`❌ [CONDOMINIO] Erro ao processar CONDOMINIO:`, error);
      return 'ERRO AO CONSULTAR CONDOMINIO';
    }
  }

  /**
   * Processa o tipo de objeto CABO conforme lógica VB6
   * If RSmet!tipo_objeto = "cabo" Then 
   *   DESTNAME = "- - - - - - - - - -"
   * Este tracejado indica que a fibra está aberta em algum ponto
   */
  processarTipoCabo(): string {
    console.log(`🔍 [CABO] Processando CABO - fibra aberta detectada`);
    return '- - - - - - - - - -';
  }

  /**
   * Processa o tipo de objeto POP conforme lógica VB6
   * If RSmet!tipo_objeto = "POP" Then 
   *   Set RStst = frmLogin.conn.Execute("SELECT SIGLA AS NOME FROM estações WHERE ID_META ='" & idcabo & "';")
   *   DESTNAME = RStst!nome
   */
  async processarTipoPop(id_meta: string): Promise<string> {
    try {
      console.log(`🔍 [POP] Processando POP para IDMETA: ${id_meta}`);
      
      const popResponse = await this.fiberApiService.executeDynamicQuery(
        'SELECT SIGLA AS NOME FROM tst.estações WHERE ID_META = {idmeta}',
        { idmeta: id_meta }
      ).toPromise();

      if (popResponse?.success && popResponse.data && popResponse.data.length > 0) {
        const sigla = popResponse.data[0].NOME;
        
        console.log(`📊 [POP] Sigla encontrada: ${sigla}`);
        return sigla;
      } else {
        console.log(`❌ [POP] POP não encontrado para IDMETA: ${id_meta}`);
        return 'POP NÃO ENCONTRADO';
      }
    } catch (error) {
      console.error(`❌ [POP] Erro ao processar POP:`, error);
      return 'ERRO AO CONSULTAR POP';
    }
  }

  /**
   * Processa o tipo de objeto SPLITTER conforme lógica VB6
   * If RSmet!tipo_objeto = "splitter" Then 
   *   Set RStst = frmLogin.connMETA.Execute("select numero_cx,capacidade from splitter_e where idmeta=" & idcabo & ";")
   *   DESTNAME = "CX " & RStst!numero_cx & "/Entrada_Splitter " & idcabo & "_1:" & RStst!CAPACIDADE
   */
  async processarTipoSplitter(id_meta: string): Promise<string> {
    try {
      console.log(`🔍 [SPLITTER] Processando SPLITTER para IDMETA: ${id_meta}`);
      
      const splitterResponse = await this.fiberApiService.executeDynamicQuery(
        'SELECT numero_cx, capacidade FROM splitter_e WHERE idmeta = {idmeta}',
        { idmeta: id_meta }
      ).toPromise();

      if (splitterResponse?.success && splitterResponse.data && splitterResponse.data.length > 0) {
        const splitterData = splitterResponse.data[0];
        const numeroCx = splitterData.numero_cx;
        const capacidade = splitterData.capacidade;
        
        console.log(`📊 [SPLITTER] Dados encontrados - Numero_CX: ${numeroCx}, Capacidade: ${capacidade}`);
        
        const resultado = `CX ${numeroCx}/Entrada_Splitter ${id_meta}_1:${capacidade}`;
        console.log(`📊 [SPLITTER] Resultado final: ${resultado}`);
        return resultado;
      } else {
        console.log(`❌ [SPLITTER] SPLITTER não encontrado para IDMETA: ${id_meta}`);
        return 'SPLITTER NÃO ENCONTRADO';
      }
    } catch (error) {
      console.error(`❌ [SPLITTER] Erro ao processar SPLITTER:`, error);
      return 'ERRO AO CONSULTAR SPLITTER';
    }
  }

  /**
   * Consulta OBS do DIO nas tabelas dio_tX baseado na fibra
   * If fibra_publica <= 12 Then TABELA = "dio_t1"
   * If fibra_publica > 12 Then TABELA = "dio_t2"
   * Set RStst = frmLogin.connMETA.Execute("SELECT obs" & fibra_publica & " as obs FROM " & TABELA & " WHERE IDMETA ='" & idcabo & "';")
   * If RStst!OBS <> "" Then obs_dio = RStst!OBS Else obs_dio = "-----"
   */
  private async consultarObsDio(id_meta: string, fibra: string): Promise<string> {
    try {
      const fibra_publica = parseInt(fibra);
      const grupo = Math.ceil(fibra_publica / 12);
      const tabela = `dio_t${grupo}`;
      
      console.log(`🔍 [DIO OBS] Consultando OBS - Fibra: ${fibra_publica}, Grupo: ${grupo}, Tabela: ${tabela}`);
      
      const obsQuery = `SELECT obs${fibra_publica} as obs FROM ${tabela} WHERE IDMETA = {idmeta}`;
      const obsResponse = await this.fiberApiService.executeDynamicQuery(obsQuery, { idmeta: id_meta }).toPromise();
      
      if (obsResponse?.success && obsResponse.data && obsResponse.data.length > 0) {
        const obs = obsResponse.data[0].obs;
        const obs_dio = obs && obs.trim() !== '' ? obs : '-----';
        console.log(`📊 [DIO OBS] OBS encontrada: ${obs_dio}`);
        return obs_dio;
      } else {
        console.log(`❌ [DIO OBS] OBS não encontrada para fibra ${fibra_publica} na tabela ${tabela}`);
        return '-----';
      }
    } catch (error) {
      console.error(`❌ [DIO OBS] Erro ao consultar OBS:`, error);
      return '-----';
    }
  }

  /**
   * Processa o tipo de objeto DIO conforme lógica VB6
   * If RSmet!tipo_objeto = "DIO" Then 
   *   Set RStst = frmLogin.connMETA.Execute("SELECT SIGLA AS NOME,ID_ESTACAO FROM dio WHERE ID_META ='" & idcabo & "';")
   *   DESTNAME = RStst!nome
   *   idEstacao = RStst!ID_ESTACAO
   *   If RSmet!tipo_objeto = "DIO" Then 
   *     Set RStst = frmLogin.conn.Execute("SELECT SIGLA FROM estações WHERE ID_META ='" & idEstacao & "';")
   *     DESTNAME = DESTNAME & ": " & RStst!sigla
   */
  async processarTipoDio(id_meta: string, fibra: string = '1'): Promise<{destino: string, obs: string}> {
    try {
      console.log(`🔍 [DIO] Processando DIO para IDMETA: ${id_meta}`);
      
      // Primeira consulta: buscar SIGLA e ID_ESTACAO do DIO
      const dioResponse = await this.fiberApiService.executeDynamicQuery(
        'SELECT SIGLA AS NOME, ID_ESTACAO FROM dio WHERE ID_META = {idmeta}',
        { idmeta: id_meta }
      ).toPromise();

      if (dioResponse?.success && dioResponse.data && dioResponse.data.length > 0) {
        const dioData = dioResponse.data[0];
        const sigla = dioData.NOME;
        const idEstacao = dioData.ID_ESTACAO;
        
        console.log(`📊 [DIO] Dados encontrados - Sigla: ${sigla}, ID_Estacao: ${idEstacao}`);
        
        // Segunda consulta: buscar SIGLA da estação
        if (idEstacao) {
          const estacaoResponse = await this.fiberApiService.executeDynamicQuery(
            'SELECT SIGLA FROM tst.estações WHERE ID_META = {idmeta}',
            { idmeta: idEstacao }
          ).toPromise();

          if (estacaoResponse?.success && estacaoResponse.data && estacaoResponse.data.length > 0) {
            const estacaoSigla = estacaoResponse.data[0].SIGLA;
            const destino = `${sigla}: ${estacaoSigla}`;
            console.log(`📊 [DIO] Resultado final: ${destino}`);
            
            // Consultar OBS do DIO
            const obs = await this.consultarObsDio(id_meta, fibra);
            console.log(`🔍 [DIO] OBS: ${obs}`);
            
            return { destino, obs };
          } else {
            console.log(`❌ [DIO] Estação não encontrada para IDMETA: ${idEstacao}`);
            const obs = await this.consultarObsDio(id_meta, fibra);
            return { destino: sigla, obs }; // Retorna apenas a sigla do DIO se não encontrar a estação
          }
        } else {
          console.log(`❌ [DIO] ID_ESTACAO não encontrado para DIO: ${id_meta}`);
          const obs = await this.consultarObsDio(id_meta, fibra);
          return { destino: sigla, obs }; // Retorna apenas a sigla do DIO se não tiver estação
        }
      } else {
        console.log(`❌ [DIO] DIO não encontrado para IDMETA: ${id_meta}`);
        return { destino: 'DIO NÃO ENCONTRADO', obs: '-----' };
      }
    } catch (error) {
      console.error(`❌ [DIO] Erro ao processar DIO:`, error);
      return { destino: 'ERRO AO CONSULTAR DIO', obs: '-----' };
    }
  }

  /**
   * Processa o tipo de objeto CAIXA conforme lógica VB6
   * If RSmet!tipo_objeto = "CAIXA" Then 
   *   Set RStst = frmLogin.conn.Execute("SELECT NUMERO AS NOME,TIPO FROM caixa WHERE ID_META ='" & idcabo & "';")
   *   If RStst!TIPO <> "TERMINADOR" Then 
   *     DESTNAME = "CAIXA " & RStst!nome 
   *   Else 
   *     DESTNAME = "TERMINADOR " & RStst!nome
   */
  async processarTipoCaixa(id_meta: string): Promise<string> {
    try {
      console.log(`🔍 [CAIXA] Processando caixa para IDMETA: ${id_meta}`);
      
      const caixaResponse = await this.fiberApiService.executeDynamicQuery(
        'SELECT NUMERO AS NOME, TIPO FROM tst.caixa WHERE ID_META = {idmeta}',
        { idmeta: id_meta }
      ).toPromise();

      if (caixaResponse?.success && caixaResponse.data && caixaResponse.data.length > 0) {
        const caixaData = caixaResponse.data[0];
        const numero = caixaData.NOME;
        const tipo = caixaData.TIPO;
        
        console.log(`📊 [CAIXA] Dados encontrados - Número: ${numero}, Tipo: ${tipo}`);
        
        if (tipo !== 'TERMINADOR') {
          return `CAIXA ${numero}`;
        } else {
          return `TERMINADOR ${numero}`;
        }
      } else {
        console.log(`❌ [CAIXA] Caixa não encontrada para IDMETA: ${id_meta}`);
        return 'CAIXA NÃO ENCONTRADA';
      }
    } catch (error) {
      console.error(`❌ [CAIXA] Erro ao processar caixa:`, error);
      return 'ERRO AO CONSULTAR CAIXA';
    }
  }

  /**
   * Rastreia uma fibra específica até o destino final
   */
  async rastrearFibraAsync(
    tabela_cabo: string, 
    id_meta_cabo: number, 
    registro: string
  ): Promise<FibraDestino | null> {
    try {
      const route = `/analisa-conexao-total`;
      const token = this.authService.getToken();
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      const body: ConsultaFibra = {
        tabela_cabo: tabela_cabo,
        id_meta_cabo: id_meta_cabo,
        chave_user: this.authService.getUsuario() || '',
        registro: registro
      };

      const url = `${this.baseUrl}${route}`;
      
      // Extrair número da fibra do registro para log detalhado
      const numeroFibraCabo = registro.replace('FIBRA_', '').replace('LABEL', '');
      // Extrair ponta da tabela (caboa_t1 = A, cabob_t1 = B)
      const ponta = tabela_cabo.includes('caboa_') ? 'PONTA A' : 'PONTA B';
      console.log(`🔍 Rastreando fibra: ${tabela_cabo} - ${id_meta_cabo} - ${registro} (Fibra do cabo: ${numeroFibraCabo}) - ${ponta}`);
      
      const response = await firstValueFrom(
        this.http.post<any>(url, body, { headers }).pipe(
          timeout(this.TIMEOUT),
          retry(this.RETRY_ATTEMPTS)
        )
      );
      
      // Verifica se a resposta contém os dados esperados
      if (response && response.id_meta && response.tipo_objeto && response.fibra) {
        let tipoObjetoProcessado = response.tipo_objeto;
        
        // Processa tipo CAIXA conforme lógica VB6
        if (response.tipo_objeto === 'CAIXA') {
          tipoObjetoProcessado = await this.processarTipoCaixa(response.id_meta);
          console.log(`🔍 [CAIXA] Tipo processado: ${response.tipo_objeto} -> ${tipoObjetoProcessado}`);
        }
        
        // Processa tipo DIO conforme lógica VB6
        if (response.tipo_objeto === 'DIO') {
          const dioResult = await this.processarTipoDio(response.id_meta, response.fibra);
          tipoObjetoProcessado = dioResult.destino;
          console.log(`🔍 [DIO] Tipo processado: ${response.tipo_objeto} -> ${tipoObjetoProcessado}`);
          console.log(`🔍 [DIO] OBS: ${dioResult.obs}`);
          
          // Armazenar OBS para popular o grid posteriormente
          response.obs_dio = dioResult.obs;
        }
        
        // Processa tipo SPLITTER conforme lógica VB6
        if (response.tipo_objeto === 'splitter') {
          tipoObjetoProcessado = await this.processarTipoSplitter(response.id_meta);
          console.log(`🔍 [SPLITTER] Tipo processado: ${response.tipo_objeto} -> ${tipoObjetoProcessado}`);
        }
        
        // Processa tipo POP conforme lógica VB6
        if (response.tipo_objeto === 'POP') {
          tipoObjetoProcessado = await this.processarTipoPop(response.id_meta);
          console.log(`🔍 [POP] Tipo processado: ${response.tipo_objeto} -> ${tipoObjetoProcessado}`);
        }
        
        // Processa tipo CABO conforme lógica VB6
        if (response.tipo_objeto === 'cabo') {
          tipoObjetoProcessado = this.processarTipoCabo();
          console.log(`🔍 [CABO] Tipo processado: ${response.tipo_objeto} -> ${tipoObjetoProcessado}`);
        }
        
        // Processa tipo CONDOMINIO conforme lógica VB6
        if (response.tipo_objeto === 'CONDOMINIO') {
          tipoObjetoProcessado = await this.processarTipoCondominio(response.id_meta);
          console.log(`🔍 [CONDOMINIO] Tipo processado: ${response.tipo_objeto} -> ${tipoObjetoProcessado}`);
        }
        
        // Processa tipo RABICHO conforme lógica VB6
        if (response.tipo_objeto === 'Rabicho') {
          tipoObjetoProcessado = await this.processarTipoRabicho(response.id_meta);
          console.log(`🔍 [RABICHO] Tipo processado: ${response.tipo_objeto} -> ${tipoObjetoProcessado}`);
        }
        
        const resultado: FibraDestino = {
          id_meta: response.id_meta,
          tipo_objeto: tipoObjetoProcessado,
          fibra: response.fibra,
          obs_dio: response.obs_dio // Incluir OBS do DIO se existir
        };
        
        console.log(`✅ Fibra rastreada: ${ponta} - Cabo fibra ${numeroFibraCabo} -> Destino fibra ${response.fibra} (${tipoObjetoProcessado})`);
        return resultado;
      } else if (response && response.success === false) {
        console.warn(`❌ Rastreamento falhou:`, response.message || 'Sem mensagem de erro');
        return null;
      } else {
        console.error('❌ Formato de resposta não esperado:', response);
        return null;
      }
      
    } catch (error) {
      console.error('❌ Erro no rastreamento da fibra:', error);
      
      if (error instanceof HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
          console.error(`Erro do cliente: ${error.error.message}`);
        } else {
          console.error(`Erro do servidor: ${error.status} - ${error.message}`);
        }
      }
      
      return null;
    }
  }

  /**
   * Rastreia um grupo completo de fibras baseado na capacidade
   */
  async rastrearGrupoFibrasAsync(
    id_meta_cabo: number,
    grupo: number,
    ponta: 'A' | 'B',
    capacidade: number
  ): Promise<FibraDestino[]> {
    try {
      // Calcular o tubo baseado no grupo (1-12)
      const tubo = grupo; // Grupo 1 = t1, Grupo 2 = t2, etc.
      const tabela_cabo = `cabo${ponta.toLowerCase()}_t${tubo}`;
      
      // Determinar quantas fibras processar baseado no grupo
      let fibrasParaProcessar = 12; // Padrão para grupos completos
      
      if (grupo === 1) {
        // No primeiro grupo, processar apenas 12 fibras (1-12)
        fibrasParaProcessar = Math.min(12, capacidade);
      } else {
        // Para outros grupos, calcular quantas fibras restam
        const fibrasAnteriores = (grupo - 1) * 12;
        const fibrasRestantes = capacidade - fibrasAnteriores;
        fibrasParaProcessar = Math.min(12, fibrasRestantes);
      }
      
      console.log(`🔍 Rastreando grupo ${grupo} - ${ponta} - Tabela: ${tabela_cabo} - ${fibrasParaProcessar} fibras`);
      
      // Calcular offset baseado no grupo
      const offset = (grupo - 1) * 12;
      
      console.log(`🔍 [GRUPO ${grupo}] Executando ${fibrasParaProcessar} consultas sequenciais...`);
      
      // Executar consultas sequenciais (uma por vez)
      const resultados: (FibraDestino | null)[] = [];
      
      for (let i = 1; i <= fibrasParaProcessar; i++) {
        const fibraNumero = offset + i;
        const registro = `FIBRA_${fibraNumero}LABEL`;
        console.log(`🔍 [GRUPO ${grupo}] Consultando fibra ${fibraNumero} (${registro}) - ${i}/${fibrasParaProcessar}`);
        
        try {
          const resultado = await this.rastrearFibraAsync(tabela_cabo, id_meta_cabo, registro);
          resultados.push(resultado);
          console.log(`✅ [GRUPO ${grupo}] Fibra ${fibraNumero} concluída`);
        } catch (error) {
          console.error(`❌ [GRUPO ${grupo}] Erro na fibra ${fibraNumero}:`, error);
          resultados.push(null);
        }
      }
      
      console.log(`🔍 [GRUPO ${grupo}] Consultas sequenciais concluídas. Resultados recebidos: ${resultados.length}`);
      
      // Filtrar resultados nulos e adicionar índice da fibra
      const fibrasRastreadas: FibraDestino[] = [];
      resultados.forEach((resultado, index) => {
        const fibraEsperada = offset + index + 1;
        console.log(`🔍 [GRUPO ${grupo}] Processando resultado ${index + 1}/${resultados.length} - Fibra esperada: ${fibraEsperada}`);
        
        if (resultado) {
          console.log(`🔍 [GRUPO ${grupo}] Resultado encontrado: fibra ${resultado.fibra} -> ${resultado.tipo_objeto}`);
          // Adicionar o número da fibra original se não estiver presente
          if (!resultado.fibra) {
            resultado.fibra = (index + 1).toString();
          }
          // Se resultado.fibra for '0', manter como '0' (fibra parada na caixa)
          fibrasRastreadas.push(resultado);
        } else {
          console.log(`🔍 [GRUPO ${grupo}] Resultado nulo para fibra ${fibraEsperada}`);
          // Adicionar resultado vazio para manter a ordem
          fibrasRastreadas.push({
            id_meta: '',
            tipo_objeto: 'SEM_CONEXAO',
            fibra: (index + 1).toString()
          });
        }
      });
      
      console.log(`✅ Grupo ${grupo} rastreado: ${fibrasRastreadas.length} fibras processadas`);
      return fibrasRastreadas;
      
    } catch (error) {
      console.error('❌ Erro no rastreamento do grupo:', error);
      return [];
    }
  }

  

  /**
   * Rastreia apenas as fibras de um grupo específico (para visualização)
   */
  async rastrearGrupoVisualizacaoAsync(
    id_meta_cabo: number,
    grupo: number,
    ponta: 'A' | 'B',
    capacidade: number
  ): Promise<FibraDestino[]> {
    return await this.rastrearGrupoFibrasAsync(id_meta_cabo, grupo, ponta, capacidade);
  }

  /**
   * Calcula o número de grupos baseado na capacidade
   */
  calcularGrupos(capacidade: number): number {
    return Math.ceil(capacidade / 12);
  }

  /**
   * Calcula o tubo baseado no grupo
   */
  calcularTubo(grupo: number): number {
    return grupo; // Grupo 1 = t1, Grupo 2 = t2, etc.
  }

  /**
   * Gera a tabela do cabo baseada no grupo e ponta
   */
  gerarTabelaCabo(grupo: number, ponta: 'A' | 'B'): string {
    return `cabo${ponta.toLowerCase()}_t${grupo}`;
  }

  /**
   * Método que retorna Observable (mantido para compatibilidade)
   */
  rastrearFibra(tabela_cabo: string, id_meta_cabo: number, registro: string) {
    const route = `/analisa-conexao-total`;
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body: ConsultaFibra = {
      tabela_cabo: tabela_cabo,
      id_meta_cabo: id_meta_cabo,
      chave_user: this.authService.getUsuario() || '',
      registro: registro
    };

    const url = `${this.baseUrl}${route}`;
    
    return this.http.post<FibraDestino>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS)
    );
  }
}
