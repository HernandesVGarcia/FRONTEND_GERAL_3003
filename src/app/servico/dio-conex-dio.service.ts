import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface DioConexDioRequest {
  capacidade: number;
  idmeta: number;
}

/** Resposta com pares F1/FN1… por conector da face DIO (formato da API). */
export interface DioConexDioResponse {
  response?: Array<Record<string, string>>;
  info?: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class DioConexDioService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 30000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  /**
   * Conectividade DIO ↔ cabos nas bandejas (fusões por conector/fibra).
   * Corpo: capacidade da face + id_meta do DIO.
   */
  consultar(body: DioConexDioRequest): Observable<DioConexDioResponse> {
    const route = `/conex_dio`;
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    return this.http.post<DioConexDioResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('[DioConexDio]', error);
    let msg = 'Erro ao obter conectividade DIO/bandejas.';
    if (error.error instanceof ErrorEvent) {
      msg = error.error.message;
    } else if (
      error.error &&
      typeof error.error === 'object' &&
      'message' in error.error
    ) {
      msg = String((error.error as { message?: string }).message);
    } else if (error.message) {
      msg = error.message;
    }
    return throwError(() => msg);
  }
}
