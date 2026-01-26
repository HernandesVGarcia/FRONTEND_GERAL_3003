import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * 🔧 Interface para dados de exclusão do splitter
 */
export interface ExcluiSplitterRequest {
  id_meta: number;
  id_city: number;
  id_condominio: number;
  capacidade: number;
  id_meta_cx: number; // ID da caixa de emenda (obrigatório para decrementar contador)
}

/**
 * 🔧 Interface para resposta de exclusão do splitter
 */
export interface ExcluiSplitterResponse {
  success: boolean;
  message: string;
  id_meta?: number;
  id_city?: number;
  affectedRowsIds?: number;
  affectedRowsSplitterE?: number;
  error?: string;
  // Campos adicionais quando há erro de validação
  flagConectada?: boolean;
  motivo?: 'conectado';
}

@Injectable({
  providedIn: 'root'
})
export class ExcluiSplitterService {
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
   * 🗑️ Exclui um splitter da base de dados
   * 
   * @param request - Dados do splitter a ser excluído
   * @returns Observable com resposta da exclusão
   */
  excluirSplitter(request: ExcluiSplitterRequest): Observable<ExcluiSplitterResponse> {
    console.log('🗑️ [EXCLUI-SPLITTER] Iniciando exclusão de splitter...', request);
    
    // Validar dados
    if (!request.id_meta) {
      console.error('🗑️ [EXCLUI-SPLITTER] ID do splitter não fornecido');
      return throwError(() => new Error('ID do splitter é obrigatório'));
    }

    if (!request.id_city) {
      console.error('🗑️ [EXCLUI-SPLITTER] ID da cidade não fornecido');
      return throwError(() => new Error('ID da cidade é obrigatório'));
    }

    if (!request.capacidade || request.capacidade <= 0) {
      console.error('🗑️ [EXCLUI-SPLITTER] Capacidade não fornecida ou inválida');
      return throwError(() => new Error('Capacidade é obrigatória e deve ser um número positivo'));
    }

    if (!request.id_meta_cx) {
      console.error('🗑️ [EXCLUI-SPLITTER] ID da caixa não fornecido');
      return throwError(() => new Error('ID da caixa (id_meta_cx) é obrigatório'));
    }

    const route = '/exclui_splitter';
    const url = `${this.baseUrl}${route}`;
    
    const token = this.authService.getToken();
    if (!token) {
      console.error('🗑️ [EXCLUI-SPLITTER] Token de autenticação não encontrado');
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      id_meta: request.id_meta,
      id_city: request.id_city,
      id_condominio: request.id_condominio || 0,
      capacidade: request.capacidade,
      id_meta_cx: request.id_meta_cx
    };

    console.log('🗑️ [EXCLUI-SPLITTER] Enviando requisição para API...', body);

    return this.http.post<ExcluiSplitterResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /**
   * 🔍 Trata erros da requisição HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ [EXCLUI-SPLITTER] Erro na requisição:', error);
    
    let errorMessage = 'Ocorreu um erro ao excluir o splitter.';
    
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
