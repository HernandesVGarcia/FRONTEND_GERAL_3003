import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, firstValueFrom } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface ExcluiPosteAprovadoRequest {
  id: number;
  id_city: number;
}

export interface ExcluiPosteAprovadoResponse {
  success: boolean;
  id?: number;
  id_city?: number;
  message?: string;
  error?: string;
  affectedRows?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ExcluiPosteAprovadoService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 15000;
  private readonly RETRY_ATTEMPTS = 0;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  excluirPosteAprovado(request: ExcluiPosteAprovadoRequest): Observable<ExcluiPosteAprovadoResponse> {
    if (!request.id) {
      return throwError(() => new Error('ID do poste aprovado é obrigatório'));
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

    const url = `${this.baseUrl}/exclui-poste-aprovado`;

    return this.http.post<ExcluiPosteAprovadoResponse>(url, request, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError),
    );
  }

  async excluirPosteAprovadoAsync(request: ExcluiPosteAprovadoRequest): Promise<ExcluiPosteAprovadoResponse> {
    return firstValueFrom(this.excluirPosteAprovado(request));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('[EXCLUI-POSTE-APROVADO] Erro na requisição:', error);

    let errorMessage = 'Ocorreu um erro ao excluir o poste aprovado.';

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
