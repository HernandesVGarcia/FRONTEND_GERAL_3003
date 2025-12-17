import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface DesconexaoBandejaRequest {
  idmeta_dio: number;
  idmeta_cabo: number;
  Ponta_cabo: 'A' | 'B';
  Capacidade_cabo: number; // 1 | 2 | 4 | 6 | 8 | 12 | 24 | 36 | 48 | 72 | 144
}

export interface DesconexaoBandejaResponse {
  success: boolean;
  message: string;
  idmeta_dio?: number;
  idmeta_cabo?: number;
  numero_bandeja?: number;
  ponta_cabo?: string;
  capacidade?: number;
  fibras_processadas?: number;
  ja_desconectado?: boolean; // Indica se o cabo já estava desconectado
}

@Injectable({
  providedIn: 'root'
})
export class DesconexaoBandejaService {
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
   * Desconecta um cabo de uma bandeja de DIO
   * A bandeja é detectada automaticamente buscando em C1-C6 da tabela DIO
   * pelo padrão "cabo{idmeta_cabo}{Ponta_cabo}" (ex: "cabo130154A")
   */
  desconectar(request: DesconexaoBandejaRequest): Observable<DesconexaoBandejaResponse> {
    const route = `/desconexao_bandeja`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    return this.http.post<DesconexaoBandejaResponse>(url, request, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [DESCONEXAO_BANDEJA] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao desconectar o cabo da bandeja.';
    
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

