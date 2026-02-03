import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * 🔧 Interface para dados de fusão splitter-splitter (saída-entrada)
 */
export interface UpdateFusaoSaidaEntradaSPRequest {
  id_meta_splitterS: number;  // ID do splitter de saída
  saida_splitter: number;     // Número da saída (1, 2, 3, etc.)
  id_meta_splitterE: number;  // ID do splitter de entrada
  id_meta_caixa: number;      // ID da caixa
}

/**
 * 🔧 Interface para resposta de fusão splitter-splitter (saída-entrada)
 */
export interface UpdateFusaoSaidaEntradaSPResponse {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateFusaoSaidaEntradaSPService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 30000; // 30 segundos
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  /**
   * 🔗 Realiza a fusão de saída de splitter para entrada de outro splitter
   * 
   * @param request - Dados da fusão splitter-splitter (saída-entrada)
   * @returns Observable com resposta da fusão
   */
  realizarFusao(request: UpdateFusaoSaidaEntradaSPRequest): Observable<UpdateFusaoSaidaEntradaSPResponse> {
    console.log('🔗 [FUSAO-SAIDA-ENTRADA-SP] Iniciando fusão splitter-splitter (saída-entrada)...', request);
    
    // Validar dados
    if (!request.id_meta_splitterS || request.id_meta_splitterS <= 0) {
      console.error('🔗 [FUSAO-SAIDA-ENTRADA-SP] ID do splitter de saída inválido:', request.id_meta_splitterS);
      return throwError(() => new Error('ID do splitter de saída é obrigatório e deve ser um número positivo'));
    }

    if (!request.saida_splitter || request.saida_splitter < 1) {
      console.error('🔗 [FUSAO-SAIDA-ENTRADA-SP] Saída do splitter inválida:', request.saida_splitter);
      return throwError(() => new Error('Saída do splitter deve ser um número positivo'));
    }

    if (!request.id_meta_splitterE || request.id_meta_splitterE <= 0) {
      console.error('🔗 [FUSAO-SAIDA-ENTRADA-SP] ID do splitter de entrada inválido:', request.id_meta_splitterE);
      return throwError(() => new Error('ID do splitter de entrada é obrigatório e deve ser um número positivo'));
    }

    if (!request.id_meta_caixa || request.id_meta_caixa <= 0) {
      console.error('🔗 [FUSAO-SAIDA-ENTRADA-SP] ID da caixa inválido:', request.id_meta_caixa);
      return throwError(() => new Error('ID da caixa é obrigatório e deve ser um número positivo'));
    }

    const route = '/update_fusao_SaidaEntradaSP';
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    return this.http.post<UpdateFusaoSaidaEntradaSPResponse>(url, request, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [FUSAO-SAIDA-ENTRADA-SP] Erro na requisição:', error);
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      console.error('❌ [FUSAO-SAIDA-ENTRADA-SP] Erro do cliente:', error.error.message);
      return throwError(() => new Error(`Erro do cliente: ${error.error.message}`));
    } else {
      // Erro do lado do servidor
      console.error(`❌ [FUSAO-SAIDA-ENTRADA-SP] Erro do servidor: ${error.status} - ${error.message}`);
      const errorMessage = error.error?.error || error.error?.message || `Erro do servidor: ${error.status}`;
      return throwError(() => new Error(errorMessage));
    }
  }
}
