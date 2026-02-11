import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface UpdateFusaoTubosRequest {
  boca_origem: number;
  fibras_portubo_origem: number;
  tubo_origem: number;
  boca_destino: number;
  fibras_portubo_destino: number;
  tubo_destino: number;
  id_meta_caixa: number;
}

export interface UpdateFusaoTubosResponse {
  response?: {
    numPares: number;
    origem: number;
    destino: number;
  };
  message?: string;
  affectedRows?: {
    origem: number;
    destino: number;
  };
  error?: string;
  details?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateFusaoTubosService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 30000;
  private readonly RETRY_ATTEMPTS = 1;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  /**
   * Realiza a fusão por tubos (origem -> destino) na caixa.
   */
  fundirTubos(request: UpdateFusaoTubosRequest): Observable<UpdateFusaoTubosResponse> {
    const route = '/update_fusao_tubo';
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    return this.http.post<UpdateFusaoTubosResponse>(url, request, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ [UPDATE_FUSAO_TUBOS] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao realizar a fusão por tubos.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      if (error.error && typeof error.error === 'object') {
        const err = error.error as { error?: string; message?: string };
        if (err.error) errorMessage = err.error;
        if (err.message) errorMessage = err.message;
      } else {
        errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      }
    }

    return throwError(() => errorMessage);
  }
}
