import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, firstValueFrom } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

// Interface para os dados recebidos da API de terceiros
export interface ClienteApiTerceiros {
  Codigo?: string;
  CNPJ_CNPF?: string;
  Nome?: string;
  Endereco?: string;
  Numero?: string;
  Complemento?: string;
  Bairro?: string;
  CEP?: string;
  TelCelular?: string;
  Observacoes?: string;
  MapsMarkLat?: string | number;
  MapsMarkLng?: string | number;
  Situacao?: string;
}

// Interface para os dados enviados à nossa API
export interface ClienteInsertRequest {
  CONTRATO_GPON: string;
  CNPJ: string;
  SIGLA: string;
  ENDEREÇO: string;
  NUMERO: string;
  COMPLEMENTO: string;
  BAIRRO: string;
  CEP: string;
  TELEFONE: string;
  id_city: number;
  id_condominio: number;
  OBS: string;
  LAT: string | number | null;
  LNG: string | number | null;
  TAMANHO: string;
  STATUS: string;
  POP_ESTACAO?: number;
}

// Interface para a resposta da inserção
export interface ClienteInsertResponse {
  success: boolean;
  message?: string;
  id_meta?: number;
  id_estacao?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InserirClienteRBXService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 30000; // 30 segundos

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Transforma os dados da API de terceiros para o formato da nossa API
   */
  private transformarDados(clienteApi: ClienteApiTerceiros, idCity: number, idCondominio: number = 0): ClienteInsertRequest {
    // Converter STATUS: "C" → "0", outros → "1"
    const status = clienteApi.Situacao === 'C' ? '0' : '1';

    return {
      CONTRATO_GPON: clienteApi.Codigo || '',
      CNPJ: clienteApi.CNPJ_CNPF || '',
      SIGLA: clienteApi.Nome || '',
      ENDEREÇO: clienteApi.Endereco || '',
      NUMERO: clienteApi.Numero || '',
      COMPLEMENTO: clienteApi.Complemento || '',
      BAIRRO: clienteApi.Bairro || '',
      CEP: clienteApi.CEP || '',
      TELEFONE: clienteApi.TelCelular || '',
      id_city: idCity,
      id_condominio: idCondominio,
      OBS: clienteApi.Observacoes || '',
      LAT: clienteApi.MapsMarkLat || null,
      LNG: clienteApi.MapsMarkLng || null,
      TAMANHO: '1',
      STATUS: status,
      POP_ESTACAO: 0 // Valor padrão, ajuste se necessário
    };
  }

  /**
   * Insere um cliente no banco de dados local
   * @param clienteApi - Dados do cliente vindos da API de terceiros
   * @param idCondominio - ID do condomínio (padrão: 0)
   * @returns Promise com a resposta da inserção
   */
  async inserirCliente(clienteApi: ClienteApiTerceiros, idCondominio: number = 0): Promise<ClienteInsertResponse> {
    try {
      // 1. Obter id_city do authService
      const idCity = this.authService.getIdCity();
      
      if (!idCity) {
        const error = 'ID da cidade não encontrado no authService';
        console.error('❌ [INSERIR-CLIENTE-RBX]', error);
        return { success: false, error };
      }

      console.log('🔍 [INSERIR-CLIENTE-RBX] ID da cidade:', idCity);
      console.log('🔍 [INSERIR-CLIENTE-RBX] Dados recebidos da API:', clienteApi);

      // 2. Transformar dados
      const dadosTransformados = this.transformarDados(clienteApi, idCity, idCondominio);
      console.log('🔄 [INSERIR-CLIENTE-RBX] Dados transformados:', dadosTransformados);

      // 3. Preparar requisição
      const token = this.authService.getToken();
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      const route = '/insert_cliente';
      const url = `${this.baseUrl}${route}`;

      // 4. Fazer a requisição
      const response = await firstValueFrom(
        this.http.post<ClienteInsertResponse>(url, dadosTransformados, { headers }).pipe(
          timeout(this.TIMEOUT),
          catchError(this.handleError)
        )
      );

      if (response.success) {
        console.log('✅ [INSERIR-CLIENTE-RBX] Cliente inserido com sucesso:', response);
        return response;
      } else {
        console.error('❌ [INSERIR-CLIENTE-RBX] Erro na inserção:', response.error);
        return {
          success: false,
          error: response.error || 'Erro desconhecido ao inserir cliente'
        };
      }

    } catch (error: any) {
      console.error('❌ [INSERIR-CLIENTE-RBX] Erro ao inserir cliente:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido ao inserir cliente'
      };
    }
  }

  /**
   * Processa e insere um cliente a partir dos dados da API de terceiros
   * Método auxiliar que pode ser chamado diretamente com a resposta da API RBX
   */
  async processarEInserirCliente(dadosApiTerceiros: any): Promise<ClienteInsertResponse> {
    try {
      // Verificar se os dados estão no formato esperado
      // A resposta pode vir em diferentes formatos, ajuste conforme necessário
      let clienteApi: ClienteApiTerceiros;

      // ✅ PRIMEIRO: Verificar se tem propriedade 'result' (formato da API RBX)
      if (dadosApiTerceiros.result && Array.isArray(dadosApiTerceiros.result)) {
        if (dadosApiTerceiros.result.length === 0) {
          return { success: false, error: 'Nenhum cliente encontrado na resposta da API' };
        }
        clienteApi = dadosApiTerceiros.result[0];
        console.log('📦 [INSERIR-CLIENTE-RBX] Cliente extraído de result[0]:', clienteApi);
      }
      // Se for um array, pegar o primeiro item
      else if (Array.isArray(dadosApiTerceiros)) {
        if (dadosApiTerceiros.length === 0) {
          return { success: false, error: 'Nenhum cliente encontrado na resposta da API' };
        }
        clienteApi = dadosApiTerceiros[0];
      } 
      // Se for um objeto com propriedade que contém o array
      else if (dadosApiTerceiros.ConsultaClientes || dadosApiTerceiros.data) {
        const dados = dadosApiTerceiros.ConsultaClientes || dadosApiTerceiros.data;
        if (Array.isArray(dados) && dados.length > 0) {
          clienteApi = dados[0];
        } else if (typeof dados === 'object') {
          clienteApi = dados;
        } else {
          return { success: false, error: 'Formato de dados inválido da API' };
        }
      }
      // Se já for o objeto do cliente
      else {
        clienteApi = dadosApiTerceiros;
      }

      console.log('📦 [INSERIR-CLIENTE-RBX] Processando cliente:', clienteApi);

      // Validar se o cliente foi extraído corretamente
      if (!clienteApi || !clienteApi.Codigo) {
        return { success: false, error: 'Dados do cliente inválidos ou incompletos' };
      }

      // Inserir o cliente
      return await this.inserirCliente(clienteApi);
    } catch (error: any) {
      console.error('❌ [INSERIR-CLIENTE-RBX] Erro ao processar cliente:', error);
      return {
        success: false,
        error: error.message || 'Erro ao processar dados do cliente'
      };
    }
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [INSERIR-CLIENTE-RBX] Erro na requisição HTTP:', error);
    let errorMessage = 'Ocorreu um erro ao inserir o cliente.';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      if (error.error && error.error.error) {
        errorMessage += ` - ${error.error.error}`;
      }
    }
    
    return throwError(() => errorMessage);
  }
}

