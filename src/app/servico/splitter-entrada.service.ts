import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/** Uma linha devolvida por `POST /splitter_entrada` (campo `response[]`). */
export interface SplitterEntradaRow {
  ENTRADA: string;
  TIPO_SPLITTER: number;
  ID_META_CAIXA: number;
  LABEL: string;
  CAPACIDADE: number;
  X: string;
  Y: string;
  ESPELHAR: number;
  ROT: number;
}

@Injectable({
  providedIn: 'root',
})
export class SplitterEntradaService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 15000;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  /**
   * `POST /splitter_entrada` — dados da entrada do splitter (ENTRADA, ID_META_CAIXA, etc.).
   * Body: IDMETA do splitter.
   */
  buscarPorIdMetaSplitter(idmetaSplitter: number): Observable<SplitterEntradaRow | null> {
    const route = `/splitter_entrada`;
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = { IDMETA: idmetaSplitter };
    const url = `${this.baseUrl}${route}`;

    return this.http
      .post<{ response: SplitterEntradaRow[] }>(url, body, { headers })
      .pipe(
        timeout(this.TIMEOUT),
        map((res) => {
          const rows = res?.response;
          if (!rows || rows.length === 0) return null;
          return rows[0];
        }),
        catchError(this.handleError),
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro em splitter_entrada:', error);
    let message = 'Erro ao obter entrada do splitter.';
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else if (error.status) {
      message = `Código: ${error.status}`;
    }
    return throwError(() => message);
  }
}
