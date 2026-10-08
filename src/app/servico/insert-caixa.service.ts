import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * Interface para os dados de entrada ao criar uma caixa
 */
export interface InsertCaixaRequest {
  ID_TIPO: string;
  NUMERO: string;
  LOCALIZACAO: string;
  TIPO: string;
  OBSERVACAO?: string;
  idCIDADES: string;
  USER: string;
  id_POLO: string;
  LAT: string;
  LNG: string;
  id_condominio: number;
  id_importacao?: number;
}

/**
 * Interface para a resposta da API ao criar uma caixa
 */
export interface InsertCaixaResponse {
  success: boolean;
  message: string;
  id_meta: number;
  id_caixa: number;
}

@Injectable({
  providedIn: 'root'
})
export class InsertCaixaService {
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
   * Cria uma nova caixa na API
   * @param dados - Dados da caixa a ser criada
   * @returns Observable com a resposta contendo id_meta e id_caixa
   */
  criarCaixa(dados: InsertCaixaRequest): Observable<InsertCaixaResponse> {
    const route = `/insert_caixa`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    console.log('📦 [INSERT-CAIXA] Criando caixa:', dados);
    console.log('📦 [INSERT-CAIXA] URL:', url);

    return this.http.post<InsertCaixaResponse>(url, dados, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [INSERT-CAIXA] Erro na requisição:', error);
    console.error('❌ [INSERT-CAIXA] Erro completo:', JSON.stringify(error, null, 2));
    let errorMessage = 'Ocorreu um erro ao criar a caixa.';

    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      if (error.status === 401) {
        errorMessage = 'Não autorizado. Verifique suas credenciais.';
      } else if (error.status === 400) {
        // Tentar extrair mensagem de erro mais específica da resposta
        const errorDetail = error.error?.error || error.error?.message || error.error;
        if (typeof errorDetail === 'string') {
          errorMessage = errorDetail;
        } else if (errorDetail && typeof errorDetail === 'object') {
          errorMessage = errorDetail.message || errorDetail.error || 'Dados inválidos. Verifique os campos obrigatórios.';
        } else {
          errorMessage = 'Dados inválidos. Verifique os campos obrigatórios.';
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

