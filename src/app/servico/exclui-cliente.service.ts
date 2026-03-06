import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * Interface para dados de exclusão do cliente
 */
export interface ExcluiClienteRequest {
  id_meta: number;
  id_city: number;
}

/**
 * Interface para resposta de exclusão do cliente
 */
export interface ExcluiClienteResponse {
  success: boolean;
  message?: string;
  id_meta?: number;
  id_city?: number;
  affectedRowsIds?: number;
  affectedRowstst?: number;
  error?: string;
  flagConectada?: boolean;
  motivo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExcluiClienteService {
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
   * Exclui um cliente da base de dados
   *
   * @param request - Dados do cliente a ser excluído
   * @returns Observable com resposta da exclusão
   */
  excluirCliente(request: ExcluiClienteRequest): Observable<ExcluiClienteResponse> {
    console.log('🗑️ [EXCLUI-CLIENTE] Iniciando exclusão de cliente...', request);

    if (!request.id_meta) {
      console.error('🗑️ [EXCLUI-CLIENTE] ID do cliente não fornecido');
      return throwError(() => new Error('ID do cliente é obrigatório'));
    }

    if (!request.id_city) {
      console.error('🗑️ [EXCLUI-CLIENTE] ID da cidade não fornecido');
      return throwError(() => new Error('ID da cidade é obrigatório'));
    }

    const route = '/exclui_cliente';
    const url = `${this.baseUrl}${route}`;

    const token = this.authService.getToken();
    if (!token) {
      console.error('🗑️ [EXCLUI-CLIENTE] Token de autenticação não encontrado');
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      id_meta: request.id_meta,
      id_city: request.id_city
    };

    console.log('🗑️ [EXCLUI-CLIENTE] Enviando requisição para API...', body);

    return this.http.post<ExcluiClienteResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /**
   * Trata erros da requisição HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ [EXCLUI-CLIENTE] Erro na requisição:', error);

    let errorMessage = 'Ocorreu um erro ao excluir o cliente.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      }
    }

    return throwError(() => ({ message: errorMessage, error: error.error }));
  }
}
