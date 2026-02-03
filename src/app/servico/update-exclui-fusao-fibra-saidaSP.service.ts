import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * 🔧 Interface para dados de exclusão de fusão cabo-saída de splitter
 */
export interface ExcluiFusaoFibraSaidaSPRequest {
  id_meta_splitter: number;  // ID do splitter
  saida_splitter: number;     // Número da saída (1, 2, 3, etc.)
  boca: number;               // 1-18 (boca do cabo)
  fibra: number;               // 1-144 (fibra do cabo)
  id_meta_caixa: number;      // ID da caixa
}

/**
 * 🔧 Interface para resposta de exclusão de fusão cabo-saída de splitter
 */
export interface ExcluiFusaoFibraSaidaSPResponse {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateExcluiFusaoFibraSaidaSPService {
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
   * 🗑️ Exclui a fusão de cabo para saída de splitter
   * 
   * @param request - Dados da fusão cabo-saída de splitter a ser excluída
   * @returns Observable com resposta da exclusão
   */
  excluirFusao(request: ExcluiFusaoFibraSaidaSPRequest): Observable<ExcluiFusaoFibraSaidaSPResponse> {
    console.log('🗑️ [EXCLUI-FUSAO-SAIDA-SP] Iniciando exclusão de fusão cabo-saída de splitter...', request);
    
    // Validar dados
    if (!request.id_meta_splitter || request.id_meta_splitter <= 0) {
      console.error('🗑️ [EXCLUI-FUSAO-SAIDA-SP] ID do splitter inválido:', request.id_meta_splitter);
      return throwError(() => new Error('ID do splitter é obrigatório e deve ser um número positivo'));
    }

    if (!request.saida_splitter || request.saida_splitter < 1) {
      console.error('🗑️ [EXCLUI-FUSAO-SAIDA-SP] Saída do splitter inválida:', request.saida_splitter);
      return throwError(() => new Error('Saída do splitter deve ser um número positivo'));
    }

    if (!request.boca || request.boca < 1 || request.boca > 18) {
      console.error('🗑️ [EXCLUI-FUSAO-SAIDA-SP] Boca inválida:', request.boca);
      return throwError(() => new Error('Boca deve estar entre 1 e 18'));
    }

    if (!request.fibra || request.fibra < 1 || request.fibra > 144) {
      console.error('🗑️ [EXCLUI-FUSAO-SAIDA-SP] Fibra inválida:', request.fibra);
      return throwError(() => new Error('Fibra deve estar entre 1 e 144'));
    }

    if (!request.id_meta_caixa || request.id_meta_caixa <= 0) {
      console.error('🗑️ [EXCLUI-FUSAO-SAIDA-SP] ID da caixa inválido:', request.id_meta_caixa);
      return throwError(() => new Error('ID da caixa é obrigatório e deve ser um número positivo'));
    }

    const route = '/update_exclui_fusao_fibraSaidaSP';
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    return this.http.post<ExcluiFusaoFibraSaidaSPResponse>(url, request, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [EXCLUI-FUSAO-SAIDA-SP] Erro na requisição:', error);
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      console.error('❌ [EXCLUI-FUSAO-SAIDA-SP] Erro do cliente:', error.error.message);
      return throwError(() => new Error(`Erro do cliente: ${error.error.message}`));
    } else {
      // Erro do lado do servidor
      console.error(`❌ [EXCLUI-FUSAO-SAIDA-SP] Erro do servidor: ${error.status} - ${error.message}`);
      const errorMessage = error.error?.error || error.error?.message || `Erro do servidor: ${error.status}`;
      return throwError(() => new Error(errorMessage));
    }
  }
}
