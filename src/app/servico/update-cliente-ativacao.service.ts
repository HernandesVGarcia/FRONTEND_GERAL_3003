import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/** Corpo esperado pela rota `/update_clientes_ativacao` (mirror de `req.body` no Express). */
export interface UpdateClienteAtivacaoRequest {
  idmeta_cliente: number;
  idmeta_caixa: number;
  idmeta_splitter: number;
  saida_splitter: number;
}

/** Resposta 200 típica (subset; a API pode devolver mais campos). */
export interface UpdateClienteAtivacaoResponse {
  message?: string;
  recurso_caixa?: number;
  recurso_sp?: number;
  recurso_sp_saida?: number;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class UpdateClienteAtivacaoService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT_MS = 120_000;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  /** POST `/update_clientes_ativacao` — ocupa recurso cliente / splitter. */
  ativarOuOcuparCliente(body: UpdateClienteAtivacaoRequest): Observable<UpdateClienteAtivacaoResponse> {
    const route = `/update_cliente_ativacao`;
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    const url = `${this.baseUrl}${route}`;

    return this.http.post<UpdateClienteAtivacaoResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT_MS),
      catchError((error: unknown) => {
        let msg = 'Erro ao ativar ocupação do cliente.';
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
        console.warn('[update_clientes_ativacao]', msg);
        return throwError(() => new Error(msg));
      }),
    );
  }
}
