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
  private readonly TIMEOUT = 15000;
  private readonly RETRY_ATTEMPTS = 2;

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
        catchError(this.handleError),
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('[PostesConcessionariaService] Erro:', error);
    let msg = 'Erro ao buscar postes da concessionária.';
    if (error.status === 401) {
      msg = 'Não autorizado. Faça login novamente.';
    } else if (error.status === 0) {
      msg = 'Não foi possível conectar ao servidor.';
    } else if (error.status === 400) {
      msg = 'Parâmetros de extent inválidos.';
    }
    return throwError(() => new Error(msg));
  }
}
