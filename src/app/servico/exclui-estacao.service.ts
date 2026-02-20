import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * Interface para dados de exclusão da estação
 */
export interface ExcluiEstacaoRequest {
  id_meta: number;
  id_city: number;
}

/**
 * Interface para resposta de exclusão da estação
 */
export interface ExcluiEstacaoResponse {
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
export class ExcluiEstacaoService {
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
   * Exclui uma estação da base de dados
   *
   * @param request - Dados da estação a ser excluída
   * @returns Observable com resposta da exclusão
   */
  excluirEstacao(request: ExcluiEstacaoRequest): Observable<ExcluiEstacaoResponse> {
    console.log('🗑️ [EXCLUI-ESTACAO] Iniciando exclusão de estação...', request);

    if (!request.id_meta) {
      console.error('🗑️ [EXCLUI-ESTACAO] ID da estação não fornecido');
      return throwError(() => new Error('ID da estação é obrigatório'));
    }

    if (!request.id_city) {
      console.error('🗑️ [EXCLUI-ESTACAO] ID da cidade não fornecido');
      return throwError(() => new Error('ID da cidade é obrigatório'));
    }

    const route = '/exclui_estacao';
    const url = `${this.baseUrl}${route}`;

    const token = this.authService.getToken();
    if (!token) {
      console.error('🗑️ [EXCLUI-ESTACAO] Token de autenticação não encontrado');
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      id_meta: request.id_meta,
      id_city: request.id_city
    };

    console.log('🗑️ [EXCLUI-ESTACAO] Enviando requisição para API...', body);

    return this.http.post<ExcluiEstacaoResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /**
   * Trata erros da requisição HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ [EXCLUI-ESTACAO] Erro na requisição:', error);

    let errorMessage = 'Ocorreu um erro ao excluir a estação.';

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
