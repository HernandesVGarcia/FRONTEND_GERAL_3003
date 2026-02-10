import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface LeIdmetaLogEntry {
  usuario?: string;   // REGISTRO na API
  data?: string;     // DATA na API
  hora?: string;     // HORA na API
  evento?: string;   // EVENTO na API
  descricao?: string; // LABEL na API
}

/** Normaliza item da API: REGISTRO→usuario, DATA→data, HORA→hora, EVENTO→evento, LABEL→descricao */
function normalizeEntry(raw: any): LeIdmetaLogEntry {
  if (!raw || typeof raw !== 'object') return {};
  return {
    usuario: raw.REGISTRO ?? raw.registro ?? raw.usuario ?? raw.Usuario,
    data: raw.DATA ?? raw.data ?? raw.Data,
    hora: raw.HORA ?? raw.hora ?? raw.Hora,
    evento: raw.EVENTO ?? raw.evento ?? raw.Evento,
    descricao: raw.LABEL ?? raw.label ?? raw.descricao ?? raw.Descricao
  };
}

@Injectable({
  providedIn: 'root'
})
export class LeIdmetaLogService {

  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Busca os logs da caixa pelo ID_META_CAIXA.
   * Rota: POST /le_idmeta_log
   * Body: { ID_META_CAIXA: number }
   */
  listar(idMetaCaixa: number): Observable<LeIdmetaLogEntry[]> {
    const route = '/le_idmeta_log';
    const url = `${this.baseUrl}${route}`;
    const token = this.authService.getToken();

    if (!token) {
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }
    if (!idMetaCaixa) {
      return throwError(() => new Error('ID_META_CAIXA é obrigatório'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = { ID_META_CAIXA: idMetaCaixa };

    return this.http.post<{ response?: any[] } | any[]>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map((res) => {
        let arr: any[] = [];
        if (Array.isArray(res)) arr = res;
        else if (res && (res as any).response) arr = (res as any).response;
        return arr.map(normalizeEntry);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('[LeIdmetaLogService] Erro:', error);
    let msg = 'Ocorreu um erro ao carregar o log da caixa.';
    if (error.error instanceof ErrorEvent) {
      msg = `Erro: ${error.error.message}`;
    } else if (error.status === 401) {
      msg = 'Não autorizado. Faça login novamente.';
    } else if (error.status === 0) {
      msg = 'Não foi possível conectar ao servidor.';
    }
    return throwError(() => new Error(msg));
  }
}
