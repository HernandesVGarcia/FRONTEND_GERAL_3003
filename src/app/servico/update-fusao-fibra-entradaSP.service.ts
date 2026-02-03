import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * 🔧 Interface para dados de fusão cabo-entrada de splitter
 */
export interface UpdateFusaoFibraEntradaSPRequest {
  id_meta_splitter: number;  // ID do splitter
  boca: number;              // 1-18 (boca do cabo)
  fibra: number;              // 1-144 (fibra do cabo)
  id_meta_caixa: number;      // ID da caixa
}

/**
 * 🔧 Interface para resposta de fusão cabo-entrada de splitter
 */
export interface UpdateFusaoFibraEntradaSPResponse {
  success: boolean;
  message: string;
  affectedRows?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateFusaoFibraEntradaSPService {
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
   * 🔗 Realiza a fusão de cabo para entrada de splitter
   * 
   * @param request - Dados da fusão cabo-entrada de splitter
   * @returns Observable com resposta da fusão
   */
  realizarFusao(request: UpdateFusaoFibraEntradaSPRequest): Observable<UpdateFusaoFibraEntradaSPResponse> {
    console.log('🔗 [FUSAO-ENTRADA-SP] Iniciando fusão cabo-entrada de splitter...', request);
    
    // Validar dados
    if (!request.id_meta_splitter || request.id_meta_splitter <= 0) {
      console.error('🔗 [FUSAO-ENTRADA-SP] ID do splitter inválido:', request.id_meta_splitter);
      return throwError(() => new Error('ID do splitter é obrigatório e deve ser um número positivo'));
    }

    if (!request.boca || request.boca < 1 || request.boca > 18) {
      console.error('🔗 [FUSAO-ENTRADA-SP] Boca inválida:', request.boca);
      return throwError(() => new Error('Boca deve estar entre 1 e 18'));
    }

    if (!request.fibra || request.fibra < 1 || request.fibra > 144) {
      console.error('🔗 [FUSAO-ENTRADA-SP] Fibra inválida:', request.fibra);
      return throwError(() => new Error('Fibra deve estar entre 1 e 144'));
    }

    if (!request.id_meta_caixa || request.id_meta_caixa <= 0) {
      console.error('🔗 [FUSAO-ENTRADA-SP] ID da caixa inválido:', request.id_meta_caixa);
      return throwError(() => new Error('ID da caixa é obrigatório e deve ser um número positivo'));
    }

    const route = '/update_fusao_fibraEntradaSP';
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    return this.http.post<UpdateFusaoFibraEntradaSPResponse>(url, request, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [FUSAO-ENTRADA-SP] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao realizar a fusão cabo-entrada de splitter.';
    
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
