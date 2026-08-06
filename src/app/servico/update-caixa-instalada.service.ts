import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface UpdateCaixaInstaladaRequest {
  ID_META: number | string;
  INSTALADA: 0 | 1;
}

export interface UpdateCaixaInstaladaResponse {
  success: boolean;
  message?: string;
  ID_META?: number | string;
  INSTALADA?: 0 | 1;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UpdateCaixaInstaladaService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  atualizarInstalada(dados: UpdateCaixaInstaladaRequest): Observable<UpdateCaixaInstaladaResponse> {
    const route = `/update_caixa_instalada`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    return this.http.post<UpdateCaixaInstaladaResponse>(url, dados, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('[UPDATE-CAIXA-INSTALADA] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao atualizar o status de instalação da caixa.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else if (error.status === 401) {
      errorMessage = 'Não autorizado. Verifique suas credenciais.';
    } else if (error.status === 400) {
      const errorDetail = error.error?.error || error.error?.message || error.error;
      errorMessage = typeof errorDetail === 'string' ? errorDetail : 'Dados inválidos.';
    } else if (error.status === 500) {
      errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
    }

    return throwError(() => errorMessage);
  }
}
