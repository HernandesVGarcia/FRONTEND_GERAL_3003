import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, firstValueFrom } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { FiberApiService } from './fiber-api.service';
import { InserirClienteRBXService, ClienteApiTerceiros } from './inserir-cliente-RBX.service';
import { environment } from '../environments/environment';

export interface ConsultaClientesRequest {
  ConsultaClientes: {
    Autenticacao: {
      ChaveIntegracao: string;
    };
    Filtro: string;
  };
}

export interface ConsultaClientesResponse {
  success?: boolean;
  data?: any;
  error?: string;
}

export interface UltimoClienteResponse {
  success: boolean;
  CONTRATO_GPON?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultaApiRbxService {
  private readonly TIMEOUT = 30000; // 30 segundos
  private baseUrl: string = environment.apiUrlAbsolute;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private fiberApiService: FiberApiService,
    private inserirClienteRBXService: InserirClienteRBXService
  ) {}

  /**
   * Busca o último CONTRATO_GPON salvo no banco de dados
   */
  private async buscarUltimoContratoGpon(): Promise<number | null> {
    try {
      // 1. Obter idCIDADES do authService
      const idCity = this.authService.getIdCity();
      
      if (!idCity) {
        console.error('❌ [RBX] ID da cidade não encontrado no authService');
        return null;
      }

      const token = this.authService.getToken();
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      const url = `${this.baseUrl}/clientes-buscar-ultimo`;
      
      // 2. Preparar body com idCIDADES
      const body = {
        idCIDADES: idCity
      };

      console.log('🔍 [RBX] Buscando último CONTRATO_GPON com body:', body);

      // 3. Mudar de GET para POST
      const response = await firstValueFrom(
        this.http.post<any>(url, body, { headers }).pipe(
          timeout(this.TIMEOUT),
          catchError(this.handleError)
        )
      );

      console.log('🔍 [RBX] Resposta completa da API:', response); // DEBUG

      // A API retorna: { "response": [{ "CONTRATO_GPON": "5498", ... }] }
      if (response.response && Array.isArray(response.response) && response.response.length > 0) {
        const contratoGpon = response.response[0].CONTRATO_GPON;
        
        if (contratoGpon !== undefined && contratoGpon !== null && contratoGpon !== '') {
          // Converter string para número
          const ultimoContrato = typeof contratoGpon === 'string' 
            ? parseInt(contratoGpon, 10) 
            : Number(contratoGpon);
          
          // Validar se a conversão foi bem-sucedida
          if (!isNaN(ultimoContrato) && ultimoContrato > 0) {
            console.log('✅ [RBX] Último CONTRATO_GPON encontrado:', ultimoContrato);
            return ultimoContrato;
          } else {
            console.log('⚠️ [RBX] CONTRATO_GPON inválido ou zero:', contratoGpon);
            return null;
          }
        }
      }
      
      // Também verificar formato alternativo (caso mude no futuro)
      if (response.success && response.CONTRATO_GPON !== undefined && response.CONTRATO_GPON !== null) {
        const ultimoContrato = typeof response.CONTRATO_GPON === 'string' 
          ? parseInt(response.CONTRATO_GPON, 10) 
          : Number(response.CONTRATO_GPON);
        
        if (!isNaN(ultimoContrato) && ultimoContrato > 0) {
          console.log('✅ [RBX] Último CONTRATO_GPON encontrado (formato alternativo):', ultimoContrato);
          return ultimoContrato;
        }
      }

      console.log('ℹ️ [RBX] Nenhum cliente encontrado na resposta');
      return null;
    } catch (error: any) {
      console.error('❌ [RBX] Erro ao buscar último CONTRATO_GPON:', error);
      return null;
    }
  }

  /**
   * Consulta os dados do polo na tabela tst.polos
   */
  private async buscarDadosPolo(idPolo: string): Promise<{ url: string; chaveIntegracao: string; idErp: number } | null> {
    try {
      const query = `SELECT HTTP, KEY_ERP, ID_ERP FROM tst.polos WHERE IDPOLO = {idPolo}`;
      const params = { idPolo: idPolo };

      const response = await firstValueFrom(
        this.fiberApiService.executeDynamicQuery(query, params)
      );

      if (response.success && response.data && response.data.length > 0) {
        const polo = response.data[0];
        const url = polo.HTTP || polo.http;
        const chaveIntegracao = polo.KEY_ERP || polo.key_erp;
        const idErp = polo.ID_ERP || polo.id_erp;

        if (!url || !chaveIntegracao) {
          console.error('❌ [RBX] URL ou ChaveIntegracao não encontrados na tabela tst.polos');
          return null;
        }

        // Converter ID_ERP para número se for string
        const idErpNum = typeof idErp === 'string' ? parseInt(idErp, 10) : idErp;

        console.log('✅ [RBX] Dados do polo recuperados:', { 
          url, 
          chaveIntegracao: '***', 
          idErp: idErpNum 
        });
        
        return { 
          url, 
          chaveIntegracao, 
          idErp: idErpNum 
        };
      } else {
        console.error('❌ [RBX] Polo não encontrado na tabela tst.polos para IDPOLO:', idPolo);
        return null;
      }
    } catch (error) {
      console.error('❌ [RBX] Erro ao buscar dados do polo:', error);
      return null;
    }
  }

  /**
   * Consulta clientes na API do ERP
   */
  async consultarClientes(codigoCliente: string = '1'): Promise<ConsultaClientesResponse> {
    try {
      // 1. Buscar IDPOLO do authService
      const idPolo = this.authService.getPolo();
      
      if (!idPolo) {
        const error = 'IDPOLO não encontrado no authService';
        console.error('❌ [RBX]', error);
        return { success: false, error };
      }

      console.log('🔍 [RBX] IDPOLO recuperado:', idPolo);

      // 2. Buscar dados do polo (URL, ChaveIntegracao e ID_ERP)
      const dadosPolo = await this.buscarDadosPolo(idPolo);
      
      if (!dadosPolo) {
        const error = 'Não foi possível recuperar os dados do polo';
        console.error('❌ [RBX]', error);
        return { success: false, error };
      }

      // 3. Verificar se ID_ERP é igual a 1
      if (dadosPolo.idErp !== 1) {
        const message = `ID_ERP (${dadosPolo.idErp}) não é igual a 1. Consulta à API do ERP não será executada.`;
        console.log('⏭️ [RBX]', message);
        return { 
          success: false, 
          error: message 
        };
      }

      console.log('✅ [RBX] ID_ERP validado (igual a 1). Prosseguindo com a consulta...');

      // 4. Preparar o body da requisição
      const body: ConsultaClientesRequest = {
        ConsultaClientes: {
          Autenticacao: {
            ChaveIntegracao: dadosPolo.chaveIntegracao
          },
          Filtro: `Codigo = '${codigoCliente}'`
        }
      };

      //comentei por segurança 25112025
      //console.log('📤 [RBX] Enviando requisição através do proxy para:', dadosPolo.url);
      //console.log('📤 [RBX] Body:', JSON.stringify(body, null, 2));

      // 5. Fazer a requisição através do proxy do backend (evita CORS)
      const token = this.authService.getToken();
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      const proxyBody = {
        url: dadosPolo.url,
        body: body
      };

      const proxyUrl = `${this.baseUrl}/consulta-rbx`;

      const response = await firstValueFrom(
        this.http.post<any>(proxyUrl, proxyBody, { headers }).pipe(
          timeout(this.TIMEOUT),
          catchError(this.handleError)
        )
      );

      if (response.success) {
        console.log('✅ [RBX] Resposta da API do ERP:', response.data);
        return { success: true, data: response.data };
      } else {
        console.error('❌ [RBX] Erro na resposta do proxy:', response.error);
        return {
          success: false,
          error: response.error || 'Erro desconhecido ao consultar API do ERP'
        };
      }

    } catch (error: any) {
      console.error('❌ [RBX] Erro ao consultar clientes:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido ao consultar API do ERP'
      };
    }
  }

  /**
   * Inicia a consulta sequencial de clientes após o login
   * Deve ser chamado logo após o login bem-sucedido
   * Só executa se ID_ERP === 1
   * 
   * Lógica:
   * 1. Busca o último CONTRATO_GPON salvo
   * 2. Consulta a API de terceiros a partir do próximo número
   * 3. Se não encontrar, verifica mais 6 registros antes de parar
   * 4. Se encontrar, continua pesquisando e salvando
   * 5. Acumula todos os clientes em um array e envia para inserção
   */
  async iniciarConsultaClientes(): Promise<void> {
    console.log('🚀 [RBX] Iniciando consulta sequencial de clientes após login...');

    try {
      // 1. Buscar o último CONTRATO_GPON salvo
      const ultimoContrato = await this.buscarUltimoContratoGpon();
      console.log('🔍 [RBX] Último contrato retornado:', ultimoContrato, 'Tipo:', typeof ultimoContrato);
      
      // Garantir que é número válido
      const codigoInicial = (ultimoContrato !== null && !isNaN(ultimoContrato) && ultimoContrato > 0) 
        ? ultimoContrato + 1 
        : 1;
      
      console.log(`🔍 [RBX] Iniciando consultas a partir do código: ${codigoInicial}`);

      // 2. Array para acumular clientes encontrados
      const clientesEncontrados: ClienteApiTerceiros[] = [];
      
      // 3. Variáveis de controle
      let codigoAtual = codigoInicial;
      let registrosVaziosConsecutivos = 0;
      const maxRegistrosVazios = 6; // Verificar mais 6 registros antes de parar

      // 4. Loop para consultar sequencialmente
      while (registrosVaziosConsecutivos <= maxRegistrosVazios) {
        console.log(`🔍 [RBX] Consultando cliente código: ${codigoAtual}`);

        const resultado = await this.consultarClientes(codigoAtual.toString());

        if (resultado.success && resultado.data) {
          // Verificar se retornou algum cliente
          let clienteEncontrado: ClienteApiTerceiros | null = null;

          // Extrair cliente da resposta (mesma lógica do processarEInserirCliente)
          if (resultado.data.result && Array.isArray(resultado.data.result) && resultado.data.result.length > 0) {
            clienteEncontrado = resultado.data.result[0];
          } else if (Array.isArray(resultado.data) && resultado.data.length > 0) {
            clienteEncontrado = resultado.data[0];
          } else if (resultado.data.ConsultaClientes || resultado.data.data) {
            const dados = resultado.data.ConsultaClientes || resultado.data.data;
            if (Array.isArray(dados) && dados.length > 0) {
              clienteEncontrado = dados[0];
            } else if (typeof dados === 'object' && dados.Codigo) {
              clienteEncontrado = dados;
            }
          } else if (resultado.data.Codigo) {
            clienteEncontrado = resultado.data;
          }

          if (clienteEncontrado && clienteEncontrado.Codigo) {
            console.log(`✅ [RBX] Cliente encontrado (código ${codigoAtual}):`, clienteEncontrado);
            clientesEncontrados.push(clienteEncontrado);
            registrosVaziosConsecutivos = 0; // Resetar contador
          } else {
            console.log(`⚠️ [RBX] Nenhum cliente encontrado para código ${codigoAtual}`);
            registrosVaziosConsecutivos++;
          }
        } else {
          console.log(`⚠️ [RBX] Erro ou sem dados para código ${codigoAtual}:`, resultado.error);
          registrosVaziosConsecutivos++;
        }

        // Incrementar código para próxima consulta
        codigoAtual++;

        // Pequeno delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // 5. Processar todos os clientes encontrados
      if (clientesEncontrados.length > 0) {
        console.log(`📦 [RBX] Total de ${clientesEncontrados.length} cliente(s) encontrado(s). Inserindo no banco...`);

        // Inserir cada cliente sequencialmente
        for (let i = 0; i < clientesEncontrados.length; i++) {
          const cliente = clientesEncontrados[i];
          console.log(`💾 [RBX] Inserindo cliente ${i + 1}/${clientesEncontrados.length} (código: ${cliente.Codigo})`);

          const insertResult = await this.inserirClienteRBXService.inserirCliente(cliente);
          
          if (insertResult.success) {
            console.log(`✅ [RBX] Cliente ${cliente.Codigo} inserido com sucesso! ID_META: ${insertResult.id_meta}`);
          } else {
            console.error(`❌ [RBX] Erro ao inserir cliente ${cliente.Codigo}:`, insertResult.error);
          }

          // Pequeno delay entre inserções
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        console.log(`✅ [RBX] Processo concluído! ${clientesEncontrados.length} cliente(s) processado(s).`);
      } else {
        console.log('ℹ️ [RBX] Nenhum cliente novo encontrado para inserir.');
      }

    } catch (error: any) {
      console.error('❌ [RBX] Erro ao executar consulta sequencial de clientes:', error);
    }
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [RBX] Erro na requisição HTTP:', error);
    let errorMessage = 'Ocorreu um erro na requisição à API do ERP.';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage += ` - ${error.error.message}`;
      }
    }
    
    return throwError(() => errorMessage);
  }
}

