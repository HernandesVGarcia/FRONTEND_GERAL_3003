import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/** Payload da rota `/extrai_cabo_entrada_sp`. */
export interface ExtraiCaboEntradaSpRequest {
  ENTRADA: string;
  ID_META_CAIXA: number;
}

/** Resposta 200 de `/extrai_cabo_entrada_sp` (subset usado pela cadeia). */
export interface ExtraiCaboEntradaSpSuccess {
  success: true;
  tabela_cabo: string;
  id_meta_cabo: number;
  registro: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExtraiCaboEntradaSpService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 30000;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  /**
   * POST `/extrai_cabo_entrada_sp` — monta cabo/registo a partir de ENTRADA + ID_META_CAIXA (splitter).
   */
  extrairCabEntrada(req: ExtraiCaboEntradaSpRequest): Observable<ExtraiCaboEntradaSpSuccess> {
    const route = `/extrai_cabo_entrada_sp`;
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    const url = `${this.baseUrl}${route}`;

    type Raw = ExtraiCaboEntradaSpSuccess & Partial<{ error?: string }>;

    return this.http.post<Raw>(url, req, { headers }).pipe(
      timeout(this.TIMEOUT),
      map((res) => {
        if (
          !res ||
          !(res.success === true) ||
          typeof res.tabela_cabo !== 'string' ||
          typeof res.registro !== 'string' ||
          res.id_meta_cabo == null
        ) {
          const detail = typeof (res as Raw)?.error === 'string' ? (res as Raw).error : 'Resposta extrai indefinida.';
          throw new Error(detail);
        }
        const idCab = typeof res.id_meta_cabo === 'number' ? res.id_meta_cabo : Number(res.id_meta_cabo);
        if (!Number.isFinite(idCab) || idCab <= 0) {
          throw new Error('id_meta_cabo invalido.');
        }
        return {
          success: true as const,
          tabela_cabo: res.tabela_cabo,
          id_meta_cabo: idCab,
          registro: res.registro,
        };
      }),
      catchError((error: unknown) => {
        let msg = 'Erro em extrai_cabo_entrada_sp.';
        if (error instanceof HttpErrorResponse && error.error && typeof error.error === 'object') {
          const er = error.error as { error?: unknown };
          if (er.error != null) msg = String(er.error);
        } else if (error instanceof HttpErrorResponse && error.message) {
          msg = error.message;
        } else if (error instanceof Error) {
          msg = error.message;
        }
        console.warn('[extrai_cabo_entrada_sp]', msg);
        return throwError(() => new Error(msg));
      }),
    );
  }
}
