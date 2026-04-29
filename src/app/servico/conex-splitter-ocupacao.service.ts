import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/** Linha típica: ENTRADA + F1..FN (strings da API como prop.boca_.... ou "=id()" livre). */
export interface ConexSplLinhaRow {
  ENTRADA?: string;
  [key: string]: string | undefined;
}

const CAP_ROUTES = new Map<number, string>([
  [2, 'conex_sp2'],
  [4, 'conex_sp4'],
  [8, 'conex_sp8'],
  [16, 'conex_sp16'],
  [32, 'conex_sp32'],
  [64, 'conex_sp64'],
  [128, 'conex_sp128'],
]);

/** Valor de célula que indica porta livre. */
export const CONEX_SPL_VALOR_LIVRE = '=id()';

/**
 * POST /conex_sp{N} com body { idmeta } — ocupação F1…FN das saídas do splitter (viabilidade).
 */
@Injectable({
  providedIn: 'root',
})
export class ConexSplitterOcupacaoService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  /** Capacidades com rota configurada na API (2^1 … 2^7 exceto omitidos). */
  temRotaOcupacao(capacidade: number): boolean {
    const c = Math.floor(Number(capacidade));
    return Number.isFinite(c) && c > 0 && CAP_ROUTES.has(c);
  }

  /** Primeira linha de `response` ou `null` se vazio ou rota/corpo inválidos. */
  consultarOcupacaoPorCapacidade(
    capacidade: number,
    idmeta: number,
  ): Observable<ConexSplLinhaRow | null> {
    const c = Math.floor(Number(capacidade));
    const id = Number(idmeta);
    if (!Number.isFinite(c) || c <= 0 || !CAP_ROUTES.has(c)) {
      return of(null);
    }
    if (!Number.isFinite(id) || id <= 0) {
      return throwError(() => 'idmeta do splitter inválido.');
    }
    const suffix = CAP_ROUTES.get(c)!;
    const url = `${this.baseUrl}/${suffix}`;
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token ?? ''}`);
    const body = { idmeta: id };

    return this.http.post<{ response: ConexSplLinhaRow[] }>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map((res) => {
        const rows = res?.response;
        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }
        return rows[0] ?? null;
      }),
      catchError((err: unknown) => this.handleError(err)),
    );
  }

  private handleError = (error: unknown): Observable<never> => {
    console.error('[ConexSplitterOcupacao]', error);
    let msg = 'Erro ao consultar ocupação do splitter.';
    if (error instanceof HttpErrorResponse && error.error instanceof ErrorEvent) {
      msg = error.error.message;
    } else if (error instanceof HttpErrorResponse && typeof error.message === 'string') {
      msg = `${error.status ?? '?'} ${error.message}`;
    } else if (typeof error === 'string') {
      msg = error;
    }
    return throwError(() => msg);
  };
}
