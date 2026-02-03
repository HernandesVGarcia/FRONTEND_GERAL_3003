import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * 🔧 Interface para dados de exclusão de fusão
 */
export interface ExcluiFusaoRequest {
  boca_origem: number;      // 1-18
  fibra_origem: number;     // 1-144
  boca_destino: number;     // 1-18
  fibra_destino: number;    // 1-144
  id_meta_caixa: number;
}

/**
 * 🔧 Interface para resposta de exclusão de fusão
 */
export interface ExcluiFusaoResponse {
  success: boolean;
  message: string;
  affectedRows?: {
    origem: number;
    destino: number;
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateExcluiFusaoService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 15000; // 15 segundos
  private readonly RETRY_ATTEMPTS = 1; // Não repetir, pois é uma operação de escrita

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  /**
   * 🗑️ Exclui uma fusão de cabo para cabo
   * 
   * @param request - Dados da fusão a ser excluída
   * @returns Observable com resposta da exclusão
   */
  excluirFusao(request: ExcluiFusaoRequest): Observable<ExcluiFusaoResponse> {
    console.log('🗑️ [EXCLUI-FUSAO] Iniciando exclusão de fusão...', request);
    
    // Validar dados
    if (!request.boca_origem || request.boca_origem < 1 || request.boca_origem > 18) {
      console.error('🗑️ [EXCLUI-FUSAO] Boca origem inválida:', request.boca_origem);
      return throwError(() => new Error('Boca origem deve estar entre 1 e 18'));
    }

    if (!request.boca_destino || request.boca_destino < 1 || request.boca_destino > 18) {
      console.error('🗑️ [EXCLUI-FUSAO] Boca destino inválida:', request.boca_destino);
      return throwError(() => new Error('Boca destino deve estar entre 1 e 18'));
    }

    if (!request.fibra_origem || request.fibra_origem < 1 || request.fibra_origem > 144) {
      console.error('🗑️ [EXCLUI-FUSAO] Fibra origem inválida:', request.fibra_origem);
      return throwError(() => new Error('Fibra origem deve estar entre 1 e 144'));
    }

    if (!request.fibra_destino || request.fibra_destino < 1 || request.fibra_destino > 144) {
      console.error('🗑️ [EXCLUI-FUSAO] Fibra destino inválida:', request.fibra_destino);
      return throwError(() => new Error('Fibra destino deve estar entre 1 e 144'));
    }

    if (!request.id_meta_caixa) {
      console.error('🗑️ [EXCLUI-FUSAO] ID da caixa não fornecido');
      return throwError(() => new Error('ID da caixa (id_meta_caixa) é obrigatório'));
    }

    const route = '/update_exclui_fusao';
    const url = `${this.baseUrl}${route}`;
    
    const token = this.authService.getToken();
    if (!token) {
      console.error('🗑️ [EXCLUI-FUSAO] Token de autenticação não encontrado');
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      boca_origem: request.boca_origem,
      fibra_origem: request.fibra_origem,
      boca_destino: request.boca_destino,
      fibra_destino: request.fibra_destino,
      id_meta_caixa: request.id_meta_caixa
    };

    console.log('🗑️ [EXCLUI-FUSAO] Enviando requisição para API...', body);

    return this.http.post<ExcluiFusaoResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /**
   * 🔍 Trata erros da requisição HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ [EXCLUI-FUSAO] Erro na requisição:', error);
    
    let errorMessage = 'Ocorreu um erro ao excluir a fusão.';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      }
    }
    
    return throwError(() => errorMessage);
  }
}
