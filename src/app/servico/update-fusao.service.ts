import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface UpdateFusaoRequest {
  boca_origem: number;
  fibra_origem: number;
  boca_destino: number;
  fibra_destino: number;
  id_meta_caixa: number;
}

export interface UpdateFusaoResponse {
  response?: {
    origem: any;
    destino: any;
  };
  message?: string;
  affectedRows?: {
    origem: number;
    destino: number;
  };
  error?: string;
  campo?: string;
  valor_atual?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateFusaoService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 30000; // 30 segundos
  private readonly RETRY_ATTEMPTS = 1; // Não repetir, pois é uma operação de escrita

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  /**
   * Realiza a fusão interna de fibras dentro da caixa
   */
  realizarFusao(request: UpdateFusaoRequest): Observable<UpdateFusaoResponse> {
    const route = `/update_fusao`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    return this.http.post<UpdateFusaoResponse>(url, request, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [UPDATE_FUSAO] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao realizar a fusão.';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
        // Se houver mensagem mais detalhada, usar ela
        if (error.error.message) {
          errorMessage = error.error.message;
        }
      } else {
        errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      }
    }
    
    return throwError(() => errorMessage);
  }
}
