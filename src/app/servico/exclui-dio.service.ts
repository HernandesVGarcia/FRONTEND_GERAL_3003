import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * 🔧 Interface para dados de exclusão do DIO
 */
export interface ExcluiDioRequest {
  id_meta: number;
  id_city: number;
  id_condominio: number;
}

/**
 * 🔧 Interface para resposta de exclusão do DIO
 */
export interface ExcluiDioResponse {
  success: boolean;
  message: string;
  id_meta?: number;
  id_city?: number;
  affectedRowsIds?: number;
  affectedRowsDio?: number;
  error?: string;
  // Campos adicionais quando há erro de validação
  flagConectada?: boolean;
  flagSplitter?: boolean;
  totalSplitters?: number;
  motivo?: 'cabos_conectados_e_splitters' | 'cabos_conectados' | 'splitters';
}

@Injectable({
  providedIn: 'root'
})
export class ExcluiDioService {
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
   * 🗑️ Exclui um DIO da base de dados
   * 
   * @param request - Dados do DIO a ser excluído
   * @returns Observable com resposta da exclusão
   */
  excluirDio(request: ExcluiDioRequest): Observable<ExcluiDioResponse> {
    console.log('🗑️ [EXCLUI-DIO] Iniciando exclusão de DIO...', request);
    
    // Validar dados
    if (!request.id_meta) {
      console.error('🗑️ [EXCLUI-DIO] ID do DIO não fornecido');
      return throwError(() => new Error('ID do DIO é obrigatório'));
    }

    if (!request.id_city) {
      console.error('🗑️ [EXCLUI-DIO] ID da cidade não fornecido');
      return throwError(() => new Error('ID da cidade é obrigatório'));
    }

    const route = '/exclui_dio';
    const url = `${this.baseUrl}${route}`;
    
    const token = this.authService.getToken();
    if (!token) {
      console.error('🗑️ [EXCLUI-DIO] Token de autenticação não encontrado');
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      id_meta: request.id_meta,
      id_city: request.id_city,
      id_condominio: request.id_condominio || 0
    };

    console.log('🗑️ [EXCLUI-DIO] Enviando requisição para API...', body);

    return this.http.post<ExcluiDioResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /**
   * 🔍 Trata erros da requisição HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ [EXCLUI-DIO] Erro na requisição:', error);
    
    let errorMessage = 'Ocorreu um erro ao excluir o DIO.';
    
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

