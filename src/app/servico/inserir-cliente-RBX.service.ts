import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError, firstValueFrom } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface AutenticacaoRBX {
  Id?: string;
  Cliente?: string;
  Contrato?: string;
  NAS?: string;
  Porta?: string;
  Usuario?: string;
  Senha?: string;
  MAC?: string;
  Observacao?: string;
}

export interface ContratoRBX {
  Numero?: string;
  Cliente_Codigo?: string;
  Cliente_Nome?: string;
  Cliente_CPF_CNPJ?: string;
  Cliente_Tel_Celular?: string;
  EnderecoInstalacao_Logradouro?: string;
  EnderecoInstalacao_Numero?: string;
  EnderecoInstalacao_Complemento?: string;
  EnderecoInstalacao_Bairro?: string;
  EnderecoInstalacao_CEP?: string;
  EnderecoInstalacao_Latitude?: string | number;
  EnderecoInstalacao_Longitude?: string | number;
  Situacao_Codigo?: string;
}

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

export interface ClienteInsertRequest {
  CONTRATO_GPON: string;
  id_contrato: string;
  id_autenticacao: string;
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
  ID_PROJETISTA?: number;
}

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
  private readonly TIMEOUT = 30000;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private valorComFallback(primario: unknown, fallback: unknown): string {
    const primarioTexto = primario !== undefined && primario !== null ? String(primario).trim() : '';
    if (primarioTexto !== '') {
      return primarioTexto;
    }

    const fallbackTexto = fallback !== undefined && fallback !== null ? String(fallback).trim() : '';
    return fallbackTexto;
  }

  private valorCoordenada(primario: unknown, fallback: unknown): string | number | null {
    const valor = this.valorComFallback(primario, fallback);
    if (valor === '' || valor === '0' || valor === '0.0000000000000') {
      return null;
    }
    return valor;
  }

  private mapearStatus(situacaoContrato?: string, situacaoCliente?: string): string {
    const situacao = (situacaoContrato || situacaoCliente || '').trim().toUpperCase();
    if (situacao === 'A') {
      return '1';
    }
    if (situacao === 'C' || situacao === 'T') {
      return '0';
    }
    return '0';
  }

  transformarDadosIntegracao(
    auth: AutenticacaoRBX,
    contrato: ContratoRBX,
    cliente: ClienteApiTerceiros,
    idCity: number,
    idCondominio: number = 0
  ): ClienteInsertRequest {
    const situacaoContrato = contrato.Situacao_Codigo?.trim() || '';
    const status = situacaoContrato
      ? this.mapearStatus(contrato.Situacao_Codigo)
      : this.mapearStatus(undefined, cliente.Situacao);

    return {
      CONTRATO_GPON: contrato.Cliente_Codigo || cliente.Codigo || auth.Cliente || '',
      id_contrato: contrato.Numero || auth.Contrato || '',
      id_autenticacao: auth.Id || '',
      CNPJ: cliente.CNPJ_CNPF || '',
      SIGLA: contrato.Cliente_Nome || cliente.Nome || '',
      ENDEREÇO: this.valorComFallback(contrato.EnderecoInstalacao_Logradouro, cliente.Endereco),
      NUMERO: this.valorComFallback(contrato.EnderecoInstalacao_Numero, cliente.Numero),
      COMPLEMENTO: this.valorComFallback(contrato.EnderecoInstalacao_Complemento, cliente.Complemento),
      BAIRRO: this.valorComFallback(contrato.EnderecoInstalacao_Bairro, cliente.Bairro),
      CEP: this.valorComFallback(contrato.EnderecoInstalacao_CEP, cliente.CEP),
      TELEFONE: this.valorComFallback(contrato.Cliente_Tel_Celular, cliente.TelCelular),
      id_city: idCity,
      id_condominio: idCondominio,
      OBS: cliente.Observacoes || '',
      LAT: this.valorCoordenada(contrato.EnderecoInstalacao_Latitude, cliente.MapsMarkLat),
      LNG: this.valorCoordenada(contrato.EnderecoInstalacao_Longitude, cliente.MapsMarkLng),
      TAMANHO: '1',
      STATUS: status,
      POP_ESTACAO: 0,
      ID_PROJETISTA: 555
    };
  }

  private transformarDados(clienteApi: ClienteApiTerceiros, idCity: number, idCondominio: number = 0): ClienteInsertRequest {
    return {
      CONTRATO_GPON: clienteApi.Codigo || '',
      id_contrato: '0',
      id_autenticacao: '0',
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
      STATUS: this.mapearStatus(undefined, clienteApi.Situacao),
      POP_ESTACAO: 0,
      ID_PROJETISTA: 555
    };
  }

  async inserirIntegracao(
    auth: AutenticacaoRBX,
    contrato: ContratoRBX,
    cliente: ClienteApiTerceiros,
    idCondominio: number = 0
  ): Promise<ClienteInsertResponse> {
    try {
      const idCity = this.authService.getIdCity();

      if (!idCity) {
        const error = 'ID da cidade não encontrado no authService';
        console.error('❌ [INSERIR-CLIENTE-RBX]', error);
        return { success: false, error };
      }

      const dadosTransformados = this.transformarDadosIntegracao(auth, contrato, cliente, idCity, idCondominio);
      console.log('🔄 [INSERIR-CLIENTE-RBX] Dados integração transformados:', dadosTransformados);

      return await this.enviarInsert(dadosTransformados);
    } catch (error: any) {
      console.error('❌ [INSERIR-CLIENTE-RBX] Erro ao inserir integração:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido ao inserir integração RBX'
      };
    }
  }

  async inserirCliente(clienteApi: ClienteApiTerceiros, idCondominio: number = 0): Promise<ClienteInsertResponse> {
    try {
      const idCity = this.authService.getIdCity();

      if (!idCity) {
        const error = 'ID da cidade não encontrado no authService';
        console.error('❌ [INSERIR-CLIENTE-RBX]', error);
        return { success: false, error };
      }

      const dadosTransformados = this.transformarDados(clienteApi, idCity, idCondominio);
      return await this.enviarInsert(dadosTransformados);
    } catch (error: any) {
      console.error('❌ [INSERIR-CLIENTE-RBX] Erro ao inserir cliente:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido ao inserir cliente'
      };
    }
  }

  private async enviarInsert(dadosTransformados: ClienteInsertRequest): Promise<ClienteInsertResponse> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}/insert_cliente`;

    const response = await firstValueFrom(
      this.http.post<ClienteInsertResponse>(url, dadosTransformados, { headers }).pipe(
        timeout(this.TIMEOUT),
        catchError(this.handleError)
      )
    );

    if (response.success) {
      console.log('✅ [INSERIR-CLIENTE-RBX] Cliente inserido com sucesso:', response);
      return response;
    }

    console.error('❌ [INSERIR-CLIENTE-RBX] Erro na inserção:', response.error);
    return {
      success: false,
      error: response.error || 'Erro desconhecido ao inserir cliente'
    };
  }

  async processarEInserirCliente(dadosApiTerceiros: any): Promise<ClienteInsertResponse> {
    try {
      let clienteApi: ClienteApiTerceiros;

      if (dadosApiTerceiros.result && Array.isArray(dadosApiTerceiros.result)) {
        if (dadosApiTerceiros.result.length === 0) {
          return { success: false, error: 'Nenhum cliente encontrado na resposta da API' };
        }
        clienteApi = dadosApiTerceiros.result[0];
      } else if (Array.isArray(dadosApiTerceiros)) {
        if (dadosApiTerceiros.length === 0) {
          return { success: false, error: 'Nenhum cliente encontrado na resposta da API' };
        }
        clienteApi = dadosApiTerceiros[0];
      } else if (dadosApiTerceiros.ConsultaClientes || dadosApiTerceiros.data) {
        const dados = dadosApiTerceiros.ConsultaClientes || dadosApiTerceiros.data;
        if (Array.isArray(dados) && dados.length > 0) {
          clienteApi = dados[0];
        } else if (typeof dados === 'object') {
          clienteApi = dados;
        } else {
          return { success: false, error: 'Formato de dados inválido da API' };
        }
      } else {
        clienteApi = dadosApiTerceiros;
      }

      if (!clienteApi || !clienteApi.Codigo) {
        return { success: false, error: 'Dados do cliente inválidos ou incompletos' };
      }

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
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      if (error.error && error.error.error) {
        errorMessage += ` - ${error.error.error}`;
      }
    }

    return throwError(() => errorMessage);
  }
}
