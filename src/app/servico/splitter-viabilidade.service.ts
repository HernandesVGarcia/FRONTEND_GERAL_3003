import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';
import { Splitter } from '../modelo/Splitter';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * Lista splitters por id_meta da caixa/CTO na API, sem usar getIDmetaCaixa().
 * Usa o mesmo POST /splitter que {@link SplitterService#selecionar}.
 */
@Injectable({
  providedIn: 'root',
})
export class SplitterViabilidadeService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  listarPorIdMetaCaixa(idMetaCaixa: number): Observable<Splitter[]> {
    if (idMetaCaixa == null || !Number.isFinite(Number(idMetaCaixa)) || idMetaCaixa <= 0) {
      return of([]);
    }
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token ?? ''}`);

    const body = { ID_META_CAIXA: idMetaCaixa };
    const url = `${this.baseUrl}/splitter`;

    return this.http.post<{ response: Splitter[] }>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map((response) => (response?.response ? response.response : [])),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('[SplitterViabilidade]', error);
    let errorMessage = 'Ocorreu um erro ao carregar splitters.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}, ${error.message}`;
    }
    return throwError(() => errorMessage);
  }
}
