import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface DesconexaoBocaRequest {
  numero_boca: string; // "boca1" | "boca2" | ... | "boca18"
  idmeta_caixa: number;
  idmeta_cabo: number;
  Ponta_cabo: 'A' | 'B';
  Capacidade_cabo: number; // 1 | 2 | 4 | 6 | 8 | 12 | 24 | 36 | 48 | 72 | 144
}

export interface DesconexaoBocaResponse {
  success: boolean;
  message: string;
  idmeta_caixa?: number;
  idmeta_cabo?: number;
  numero_boca?: number;
  ponta_cabo?: string;
  capacidade?: number;
  fibras_processadas?: number;
  estrutura_atualizada?: string;
  estrutura_ja_existia?: boolean;
  ja_desconectado?: boolean; // Indica se o cabo já estava desconectado
}

@Injectable({
  providedIn: 'root'
})
export class DesconexaoBocaService {
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
   * Desconecta um cabo de uma boca de caixa
   */
  desconectar(request: DesconexaoBocaRequest): Observable<DesconexaoBocaResponse> {
    const route = `/desconexao_boca`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    return this.http.post<DesconexaoBocaResponse>(url, request, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [DESCONEXAO_BOCA] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao desconectar o cabo da boca.';
    
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

