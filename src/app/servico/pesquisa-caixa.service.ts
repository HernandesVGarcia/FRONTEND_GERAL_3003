import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';

export interface PesquisaCaixaRow {
  NUMERO?: string;
  LAT?: number | string;
  LONGI?: number | string;
  LOCALIZAÇAO?: string;
  TIPO?: string;
  OBSERVAÇÃO?: string;
}

export interface PesquisaCaixaResult {
  numero?: string;
  lat: number;
  lng: number;
  tipo?: string;
  localizacao?: string;
  observacao?: string;
}

export interface PesquisaCaixaDetalhes {
  numero?: string;
  localizacao?: string;
  observacao?: string;
  tipo?: string;
  lat?: number;
  lng?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PesquisaCaixaService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  /**
   * POST /pesquisa-caixa — coordenadas e numero da caixa por ID_META.
   */
  buscarPorIdMeta(idMeta: number): Observable<PesquisaCaixaResult | null> {
    return this.buscarRowPorIdMeta(idMeta).pipe(
      map((row) => {
        if (!row) {
          return null;
        }
        const lat = Number(row.LAT);
        const lng = Number(row.LONGI);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return null;
        }
        return this.mapRowToResult(row, lat, lng);
      }),
    );
  }

  /**
   * POST /pesquisa-caixa — detalhes (endereço, observações) sem exigir coordenadas válidas.
   */
  buscarDetalhesPorIdMeta(idMeta: number): Observable<PesquisaCaixaDetalhes | null> {
    return this.buscarRowPorIdMeta(idMeta).pipe(
      map((row) => (row ? this.mapRowToDetalhes(row) : null)),
    );
  }

  private buscarRowPorIdMeta(idMeta: number): Observable<PesquisaCaixaRow | null> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }
    if (!idMeta || idMeta <= 0) {
      return throwError(() => new Error('ID_META inválido'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}/pesquisa-caixa`;
    const body = { ID_META: idMeta };

    return this.http.post<{ response?: PesquisaCaixaRow[] }>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map((res) => res?.response?.[0] ?? null),
      catchError(this.handleError),
    );
  }

  private mapRowToResult(row: PesquisaCaixaRow, lat: number, lng: number): PesquisaCaixaResult {
    const detalhes = this.mapRowToDetalhes(row);
    return {
      numero: detalhes.numero,
      lat,
      lng,
      tipo: detalhes.tipo,
      localizacao: detalhes.localizacao,
      observacao: detalhes.observacao,
    };
  }

  private mapRowToDetalhes(row: PesquisaCaixaRow): PesquisaCaixaDetalhes {
    const lat = Number(row.LAT);
    const lng = Number(row.LONGI);
    return {
      numero: row.NUMERO?.trim() || undefined,
      localizacao: row.LOCALIZAÇAO?.trim() || undefined,
      observacao: row.OBSERVAÇÃO?.trim() || undefined,
      tipo: row.TIPO?.trim() || undefined,
      lat: Number.isFinite(lat) ? lat : undefined,
      lng: Number.isFinite(lng) ? lng : undefined,
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('[PesquisaCaixaService] Erro:', error);
    let msg = 'Erro ao pesquisar caixa por ID_META.';
    if (error.status === 401) {
      msg = 'Não autorizado. Faça login novamente.';
    } else if (error.status === 0) {
      msg = 'Não foi possível conectar ao servidor.';
    }
    return throwError(() => new Error(msg));
  }
}
