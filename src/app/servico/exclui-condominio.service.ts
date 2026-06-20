import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface ExcluiCondominioRequest {
  id_meta: number;
  id_city: number;
}

export interface ExcluiCondominioResponse {
  success: boolean;
  message?: string;
  id_meta?: number;
  id_city?: number;
  affectedRowsIds?: number;
  affectedRowsCondominio?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExcluiCondominioService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 15000;
  private readonly RETRY_ATTEMPTS = 1;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  excluirCondominio(request: ExcluiCondominioRequest): Observable<ExcluiCondominioResponse> {
    if (!request.id_meta) {
      return throwError(() => new Error('ID do condomínio é obrigatório'));
    }

    if (!request.id_city) {
      return throwError(() => new Error('ID da cidade é obrigatório'));
    }

    const route = '/exclui_condominio';
    const url = `${this.baseUrl}${route}`;

    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      id_meta: request.id_meta,
      id_city: request.id_city
    };

    return this.http.post<ExcluiCondominioResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro ao excluir o condomínio.';

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
