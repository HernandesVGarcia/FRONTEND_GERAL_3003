import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface ExcluiAnotacaoRequest {
  id_meta: number;
  id_city: number;
}

export interface ExcluiAnotacaoResponse {
  success: boolean;
  id_meta?: number;
  id_city?: number;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExcluiAnotacaoService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 15000;
  private readonly RETRY_ATTEMPTS = 0;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  excluirAnotacao(request: ExcluiAnotacaoRequest): Observable<ExcluiAnotacaoResponse> {
    if (!request.id_meta) {
      return throwError(() => new Error('id_meta da anotação é obrigatório'));
    }
    if (!request.id_city) {
      return throwError(() => new Error('ID da cidade é obrigatório'));
    }

    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}/exclui_anotacao`;

    return this.http.post<ExcluiAnotacaoResponse>(url, request, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('[EXCLUI-ANOTACAO] Erro na requisição:', error);

    let errorMessage = 'Ocorreu um erro ao excluir a anotação.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = typeof error.error.error === 'string' ? error.error.error : errorMessage;
    }

    return throwError(() => ({ message: errorMessage, error: error.error }));
  }
}
