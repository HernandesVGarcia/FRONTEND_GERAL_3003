import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface ConexaoBandejaFibraRequest {
  fibra_dio: number;
  fibra_cabo: number;
  numero_bandeja: string;
  idmeta_dio: number;
  idmeta_cabo: number;
  Ponta_cabo: 'A' | 'B';
}

export interface ConexaoBandejaFibraResponse {
  success: boolean;
  message?: string;
  idmeta_dio?: number;
  idmeta_cabo?: number;
  error?: string;
  details?: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class ConexaoBandejaFibraService {
  private baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT_MS = 30000;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  conectar(
    request: ConexaoBandejaFibraRequest,
  ): Observable<ConexaoBandejaFibraResponse> {
    const route = `/conexao_bandeja_fibra`;
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    const url = `${this.baseUrl}${route}`;
    console.log('[CONEXAO_BANDEJA_FIBRA] POST', url, 'body:', { ...request });
    return this.http
      .post<ConexaoBandejaFibraResponse>(url, request, { headers })
      .pipe(
        timeout(this.TIMEOUT_MS),
        catchError((error: HttpErrorResponse) => this.handleError(error)),
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [CONEXAO_BANDEJA_FIBRA] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao registar a fusão DIO/cabo.';
    const body = error.error as Record<string, unknown> | undefined;
    if (body && typeof body === 'object') {
      if (typeof body['error'] === 'string') {
        errorMessage = body['error'];
      } else if (
        body['error'] &&
        typeof body['error'] === 'object' &&
        'message' in (body['error'] as object)
      ) {
        errorMessage = String((body['error'] as { message?: string }).message);
      }
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}, ${error.message}`;
    }
    return throwError(() => errorMessage);
  }
}

