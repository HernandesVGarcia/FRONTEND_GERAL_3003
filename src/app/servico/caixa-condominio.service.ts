import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';
import { CaixaCondominio } from '../modelo/CaixaCondominio';

export interface CaixasCondominioResponse {
  response?: CaixaCondominio[];
}

@Injectable({
  providedIn: 'root',
})
export class CaixaCondominioService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  selecionarPorCondominio(idCondominio: number): Observable<CaixaCondominio[]> {
    if (!Number.isFinite(idCondominio) || idCondominio <= 0) {
      return throwError(() => new Error('id_condominio inválido'));
    }

    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token de autenticação não disponível'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}/caixas_condominio`;
    const body = { id_condominio: idCondominio };

    return this.http.post<CaixaCondominio[] | CaixasCondominioResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map((retorno) => this.unwrapResponse(retorno)),
      catchError(this.handleError),
    );
  }

  private unwrapResponse(
    retorno: CaixaCondominio[] | CaixasCondominioResponse,
  ): CaixaCondominio[] {
    if (Array.isArray(retorno)) {
      return retorno;
    }
    if (retorno && Array.isArray(retorno.response)) {
      return retorno.response;
    }
    return [];
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro ao carregar caixas do condomínio.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
    }

    return throwError(() => ({ message: errorMessage, error: error.error }));
  }
}
