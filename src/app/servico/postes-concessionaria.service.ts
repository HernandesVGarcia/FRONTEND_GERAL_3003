import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';
import {
  PosteConcessionaria,
  PostesConcessionariaExtent,
} from '../modelo/poste-concessionaria';

@Injectable({
  providedIn: 'root',
})
export class PostesConcessionariaService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 60000;
  private readonly RETRY_ATTEMPTS = 1;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  buscarPorExtent(extent: PostesConcessionariaExtent): Observable<PosteConcessionaria[]> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }

    const postesTabela = this.authService.getPostesTabela();
    if (!postesTabela) {
      return throwError(() => new Error('Tabela de postes da concessionária não configurada para esta cidade'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}/postes_coordenadas`;
    const body = {
      POSTES: postesTabela,
      LAT_MAX: String(extent.LAT_MAX),
      LAT_MIN: String(extent.LAT_MIN),
      LONG_MAX: String(extent.LONG_MAX),
      LONG_MIN: String(extent.LONG_MIN),
    };

    return this.http
      .post<{ response?: PosteConcessionaria[] } | PosteConcessionaria[]>(url, body, { headers })
      .pipe(
        timeout(this.TIMEOUT),
        retry(this.RETRY_ATTEMPTS),
        map((res) => {
          if (Array.isArray(res)) {
            return res;
          }
          return res?.response ?? [];
        }),
        catchError((error: unknown) => this.handleError(error)),
      );
  }

  private handleError(error: unknown): Observable<never> {
    console.error('[PostesConcessionariaService] Erro:', error);
    let msg = 'Erro ao buscar postes da concessionária.';

    const errorName = error && typeof error === 'object' && 'name' in error
      ? String((error as { name: string }).name)
      : '';
    const errorMessage = error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : '';

    if (errorName === 'TimeoutError' || errorMessage.includes('Timeout')) {
      msg = 'A consulta demorou demais. Aproxime mais o mapa (área menor) e tente novamente.';
    } else if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        msg = 'Não autorizado. Faça login novamente.';
      } else if (error.status === 0) {
        msg = 'Não foi possível conectar ao servidor.';
      } else if (error.status === 400) {
        msg = 'Parâmetros de extent inválidos.';
      } else if (error.status === 504 || error.status === 408) {
        msg = 'O servidor demorou para responder. Aproxime mais o mapa e tente novamente.';
      }
    }

    return throwError(() => new Error(msg));
  }
}
