import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface TipoResponse {
  success: boolean;
  tipo: string;
  count: number;
  data: any[];
}

/** Linha de `GET /tipos/splitter` (`tipo_splitter`). */
export interface TipoSplitterApiRow {
  id: number;
  acoplamento?: string;
  /** Ramo principal / primeira saída (F1). */
  perda_P1: number;
  /**
   * Segundo ramo (F2) e, na UI, F3+ quando só existem duas colunas na BD.
   * Nos **desbalanceados**, P1 e P2 diferem (saídas com perdas distintas); nos **balanceados** a BD
   * costuma repetir o mesmo valor em P1 e P2.
   */
  perda_P2: number;
}

/**
 * Perda (dB) na saída a partir de `tipo_splitter`.
 *
 * Nos **desbalanceados**, `perda_P1` e `perda_P2` refletem ramos com perdas diferentes; mapear porta→coluna:
 * - **F1**: `perda_P1`
 * - **F2**: `perda_P2`
 * - **F3+**: `perda_P2` (só há P1/P2 na API; ramos extra alinham com o segundo ramo)
 *
 * Nos **balanceados**, P1 e P2 são em geral iguais na mesma linha; F1/F2/F3+ acabam com o mesmo dB.
 * Ex.: **1:16** balanceado — cada saída F1…F16 perde o mesmo valor (ex. 13.7 dB; P1 = P2 na linha `tipo_splitter`).
 *
 * - **Sem `portId` de saída** (`F1`…`Fn`) ou formato inválido: devolve `fallbackPerda` — o Power Meter só
 *   aplica perda de ramo na fórmula de saída quando `isSplitterPortaSaida` (entrada/menu sem porta não aplica).
 *
 * Se não houver linha para `tipoSplitterId`, usa `fallbackPerda` (ex. `getSplitterAttenuation`).
 */
export function resolvePerdaSplitterDb(args: {
  tipos: TipoSplitterApiRow[];
  tipoSplitterId: number;
  portId?: string;
  fallbackPerda: number;
}): number {
  const m = /^F(\d+)$/i.exec(String(args.portId ?? '').trim());
  if (!m) {
    return args.fallbackPerda;
  }
  const n = parseInt(m[1], 10);
  const row = args.tipos.find((t) => t.id === args.tipoSplitterId);
  if (!row) return args.fallbackPerda;
  const p1 = Number(row.perda_P1);
  const p2 = Number(row.perda_P2);
  if (n === 1) {
    return Number.isFinite(p1) ? p1 : args.fallbackPerda;
  }
  return Number.isFinite(p2) ? p2 : args.fallbackPerda;
}

@Injectable({
  providedIn: 'root'
})
export class TiposService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  /**
   * Busca tipos de objetos (caixa, splitter, rack, etc.)
   * @param tipo - Tipo do objeto: 'caixa', 'splitter', 'rack', 'equipamento', 'poste', 'conector'
   * @returns Observable com a lista de tipos
   */
  buscarTipos(tipo: string): Observable<TipoResponse> {
    const route = `/tipos/${tipo}`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    return this.http.get<TipoResponse>(url, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /**
   * Busca tipos de caixa especificamente
   * @returns Observable com a lista de tipos de caixa
   */
  buscarTiposCaixa(): Observable<TipoResponse> {
    return this.buscarTipos('caixa');
  }

  /**
   * Busca tipos de splitter especificamente
   * @returns Observable com a lista de tipos de splitter
   */
  buscarTiposSplitter(): Observable<TipoResponse> {
    return this.buscarTipos('splitter');
  }

  /**
   * Busca tipos de rack especificamente
   * @returns Observable com a lista de tipos de rack
   */
  buscarTiposRack(): Observable<TipoResponse> {
    return this.buscarTipos('rack');
  }

  /**
   * Busca tipos de equipamento especificamente
   * @returns Observable com a lista de tipos de equipamento
   */
  buscarTiposEquipamento(): Observable<TipoResponse> {
    return this.buscarTipos('equipamento');
  }

  /**
   * Busca tipos de poste especificamente
   * @returns Observable com a lista de tipos de poste
   */
  buscarTiposPoste(): Observable<TipoResponse> {
    return this.buscarTipos('poste');
  }

  /**
   * Busca tipos de conector especificamente
   * @returns Observable com a lista de tipos de conector
   */
  buscarTiposConector(): Observable<TipoResponse> {
    return this.buscarTipos('conector');
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro na requisição de tipos:', error);
    let errorMessage = 'Ocorreu um erro ao buscar os tipos.';

    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
    }

    return throwError(() => errorMessage);
  }
}

