import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * Interface para os dados de entrada ao criar uma estação via /insert_cliente
 * TAMANHO=2 e POP_ESTACAO=1 indicam à API que deve salvar como estação
 */
export interface InsertEstacaoRequest {
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
  ID_PROJETISTA: number;  // ID do usuário logado (AuthService.getIdUser())
  OBS: string;
  LAT: string;
  LNG: string;
  TAMANHO: string;
  STATUS: string;
  POP_ESTACAO: number;
}

/**
 * Interface para a resposta da API ao criar uma estação
 */
export interface InsertEstacaoResponse {
  success: boolean;
  message?: string;
  id_meta?: number;
  id_estacao?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InsertEstacaoService {
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
   * Cria uma nova estação na API via rota /insert_cliente
   * @param dados - Dados da estação a ser criada
   * @returns Observable com a resposta contendo id_meta
   */
  criarEstacao(dados: InsertEstacaoRequest): Observable<InsertEstacaoResponse> {
    const route = `/insert_cliente`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    console.log('📡 [INSERT-ESTAÇÃO] Criando estação:', dados);
    console.log('📡 [INSERT-ESTAÇÃO] URL:', url);

    return this.http.post<InsertEstacaoResponse>(url, dados, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [INSERT-ESTAÇÃO] Erro na requisição:', error);
    console.error('❌ [INSERT-ESTAÇÃO] Erro completo:', JSON.stringify(error, null, 2));
    let errorMessage = 'Ocorreu um erro ao criar a estação.';

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
