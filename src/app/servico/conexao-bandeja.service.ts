import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface ConexaoBandejaRequest {
  numero_bandeja: string; // "C1" | "C2" | "C3" | "C4" | "C5" | "C6"
  idmeta_dio: number;
  idmeta_cabo: number;
  Ponta_cabo: 'A' | 'B';
  Capacidade_cabo: number; // 1 | 2 | 4 | 6 | 8 | 12 | 24 | 36 | 48 | 72 | 144
}

export interface ConexaoBandejaResponse {
  success: boolean;
  message: string;
  idmeta_dio?: number;
  idmeta_cabo?: number;
  numero_bandeja?: number;
  ponta_cabo?: string;
  capacidade?: number;
  fibras_processadas?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConexaoBandejaService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 30000; // 30 segundos (pode demorar mais devido ao processamento)
  private readonly RETRY_ATTEMPTS = 1; // Não repetir, pois é uma operação de escrita

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  /**
   * Conecta um cabo a uma bandeja de DIO
   */
  conectar(request: ConexaoBandejaRequest): Observable<ConexaoBandejaResponse> {
    const route = `/conexao_bandeja`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    return this.http.post<ConexaoBandejaResponse>(url, request, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [CONEXAO_BANDEJA] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao conectar o cabo à bandeja.';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else {
        errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      }
    }
    
    return throwError(() => errorMessage);
  }
}

