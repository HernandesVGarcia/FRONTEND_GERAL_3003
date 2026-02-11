import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface LeFusaoTuboRequest {
  id_meta_caixa: number;
  boca: number;
  tubo: number;
  fibras_portubo: number;
}

/** Resposta quando o tubo está livre. */
export interface LeFusaoTuboOkResponse {
  message: string; // "tubo livre"
}

/** Resposta quando o tubo já tem conexão. */
export interface LeFusaoTuboConexaoResponse {
  error: string;
  message: string;
  boca?: number;
  campo?: string;
  valor_atual?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeFusaoTuboService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 15000;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  /**
   * Verifica se o tubo está livre (sem fusão).
   * @returns true se o tubo está livre, false se já possui conexão ou em caso de erro.
   */
  verificarTuboLivre(request: LeFusaoTuboRequest): Observable<boolean> {
    const route = '/le_fusao_tubo';
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    const url = `${this.baseUrl}${route}`;

    return this.http.post<LeFusaoTuboOkResponse | LeFusaoTuboConexaoResponse>(url, request, { headers }).pipe(
      timeout(this.TIMEOUT),
      map((res) => !('error' in res) && res?.message === 'tubo livre'),
      catchError(() => of(false))
    );
  }
}
