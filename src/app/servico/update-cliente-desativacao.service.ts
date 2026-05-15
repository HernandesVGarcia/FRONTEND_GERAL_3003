import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/** Corpo esperado pela rota `/update_cliente_desativação`. */
export interface UpdateClienteDesativacaoRequest {
  idmeta_cliente: number;
  idmeta_caixa: number;
  idmeta_splitter: number;
  saida_splitter: number;
}

/** Resposta 200 típica (subset; a API pode devolver mais campos). */
export interface UpdateClienteDesativacaoResponse {
  message?: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class UpdateClienteDesativacaoService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT_MS = 120_000;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  /** POST `/update_cliente_desativação` — liberta recurso cliente / splitter. */
  desativarCliente(body: UpdateClienteDesativacaoRequest): Observable<UpdateClienteDesativacaoResponse> {
    const route = `/update_cliente_desativacao`;
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    const url = `${this.baseUrl}${route}`;

    return this.http.post<UpdateClienteDesativacaoResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT_MS),
      catchError((error: unknown) => {
        let msg = 'Erro ao desativar cliente.';
        if (error instanceof HttpErrorResponse) {
          const er = error.error;
          if (er != null && typeof er === 'object' && 'message' in er && typeof (er as { message?: string }).message === 'string') {
            msg = (er as { message: string }).message;
          } else if (er != null && typeof er === 'object' && 'error' in er) {
            msg = String((er as { error: unknown }).error);
          } else if (typeof error.message === 'string') {
            msg = error.message;
          }
        } else if (error instanceof Error) {
          msg = error.message;
        }
        console.warn('[update_cliente_desativação]', msg);
        return throwError(() => new Error(msg));
      }),
    );
  }
}
