import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface InsertAnotacaoRequest {
  label_rabicho: string;
  id_city: string | number;
  LAT: string | number;
  LNG: string | number;
  id_condominio?: number;
}

export interface InsertAnotacaoResponse {
  success: boolean;
  message: string;
  id_meta?: number;
  ShapeName?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class InsertAnotacaoService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  criarAnotacao(dados: InsertAnotacaoRequest): Observable<InsertAnotacaoResponse> {
    const route = `/insert_anotacao`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    return this.http.post<InsertAnotacaoResponse>(url, dados, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('[INSERT-ANOTACAO] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao criar a anotação.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else if (error.status === 401) {
      errorMessage = 'Não autorizado. Verifique suas credenciais.';
    } else if (error.status === 400) {
      const errorDetail = error.error?.error || error.error?.message || error.error;
      errorMessage = typeof errorDetail === 'string' ? errorDetail : 'Dados inválidos.';
    } else if (error.status === 500) {
      errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
    }

    return throwError(() => errorMessage);
  }
}
