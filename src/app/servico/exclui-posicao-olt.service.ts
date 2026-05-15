import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface ExcluiPosicaoOltRequest {
  /** `portas_olt` associada ao marcador cliente. */
  id: number;
  /** `id_meta` do cliente (`id_pop` na API). */
  id_pop: number;
}

export interface ExcluiPosicaoOltResponse {
  message?: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class ExcluiPosicaoOltService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT_MS = 60_000;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  /** POST `/exclui_posicao_olt` — remove associação de posição OLT. */
  excluir(body: ExcluiPosicaoOltRequest): Observable<ExcluiPosicaoOltResponse> {
    const route = `/exclui_posicao_olt`;
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    const url = `${this.baseUrl}${route}`;

    return this.http.post<ExcluiPosicaoOltResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT_MS),
      catchError((error: unknown) => {
        let msg = 'Erro ao excluir posição OLT.';
        if (error instanceof HttpErrorResponse) {
          const er = error.error;
          if (
            er != null &&
            typeof er === 'object' &&
            'message' in er &&
            typeof (er as { message?: string }).message === 'string'
          ) {
            msg = (er as { message: string }).message;
          } else if (er != null && typeof er === 'object' && 'error' in er) {
            msg = String((er as { error: unknown }).error);
          } else if (typeof error.message === 'string') {
            msg = error.message;
          }
        } else if (error instanceof Error) {
          msg = error.message;
        }
        console.warn('[exclui_posicao_olt]', msg);
        return throwError(() => new Error(msg));
      }),
    );
  }
}
