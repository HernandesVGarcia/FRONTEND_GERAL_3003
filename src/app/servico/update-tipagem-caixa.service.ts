import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * Interface para os dados de atualização da tipagem da caixa
 * Mesma estrutura do insert_caixa, acrescido de id_meta para identificar a caixa
 */
export interface UpdateTipagemCaixaRequest {
  id_meta: number;
  ID_TIPO: string;
  NUMERO: string;
  LOCALIZACAO: string;
  TIPO: string;
  OBSERVACAO?: string;
  
}

/**
 * Interface para a resposta da API ao atualizar tipagem da caixa
 */
export interface UpdateTipagemCaixaResponse {
  success: boolean;
  message?: string;
  id_meta?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateTipagemCaixaService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  /**
   * Atualiza a tipagem e detalhes de uma caixa existente na API
   * @param dados - Dados da caixa a ser atualizada
   * @returns Observable com a resposta da atualização
   */
  atualizarTipagem(dados: UpdateTipagemCaixaRequest): Observable<UpdateTipagemCaixaResponse> {
    const route = `/update_tipagem_caixa`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    console.log('📦 [UPDATE-TIPAGEM-CAIXA] Atualizando caixa:', dados);
    console.log('📦 [UPDATE-TIPAGEM-CAIXA] URL:', url);

    return this.http.post<UpdateTipagemCaixaResponse>(url, dados, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [UPDATE-TIPAGEM-CAIXA] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao atualizar os detalhes da caixa.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        errorMessage = 'Não autorizado. Verifique suas credenciais.';
      } else if (error.status === 400) {
        const errorDetail = error.error?.error || error.error?.message || error.error;
        if (typeof errorDetail === 'string') {
          errorMessage = errorDetail;
        } else if (errorDetail && typeof errorDetail === 'object') {
          errorMessage = errorDetail.message || errorDetail.error || 'Dados inválidos.';
        }
      } else if (error.status === 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
      } else {
        errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      }
    }

    return throwError(() => errorMessage);
  }
}
