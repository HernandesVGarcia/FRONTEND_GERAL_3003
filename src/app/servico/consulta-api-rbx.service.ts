import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, firstValueFrom } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { FiberApiService } from './fiber-api.service';
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

@Injectable({
  providedIn: 'root'
})
export class ConsultaApiRbxService {
  private readonly TIMEOUT = 30000; // 30 segundos
  private baseUrl: string = environment.apiUrlAbsolute;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private fiberApiService: FiberApiService
  ) {}

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
   * Inicia a consulta de clientes após o login
   * Deve ser chamado logo após o login bem-sucedido
   * Só executa se ID_ERP === 1
   */
  iniciarConsultaClientes(): void {
    console.log('🚀 [RBX] Iniciando consulta de clientes após login...');
    
    this.consultarClientes('1').then(result => {
      if (result.success) {
        console.log('✅ [RBX] Consulta de clientes concluída com sucesso');
        console.log('📊 [RBX] Dados recebidos:', result.data);
      } else {
        // Se ID_ERP não for 1, não é um erro crítico, apenas informativo
        if (result.error && result.error.includes('ID_ERP')) {
          console.log('ℹ️ [RBX]', result.error);
        } else {
          console.error('❌ [RBX] Falha na consulta de clientes:', result.error);
        }
      }
    }).catch(error => {
      console.error('❌ [RBX] Erro ao executar consulta de clientes:', error);
    });
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

