import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface InsertPosicaoOltRequest {
  idmeta_dio: number;
  fibra_dio: number;
  idmeta_pop: number;
}

export interface InsertPosicaoOltResponse {
  success?: boolean;
  message?: string;
  portas_olt_id?: number;
  idmeta_dio?: number;
  cliente?: number;
  fibra?: number;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class InsertPosicaoOltService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT_MS = 60_000;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  /** POST `/insert_posicao_olt` — associa posição OLT (DIO + fibra) ao cliente. */
  inserir(body: InsertPosicaoOltRequest): Observable<InsertPosicaoOltResponse> {
    const route = `/insert_posicao_olt`;
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    const url = `${this.baseUrl}${route}`;

    return this.http.post<InsertPosicaoOltResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT_MS),
      catchError((error: unknown) => {
        let msg = 'Erro ao registar posição OLT.';
        if (error instanceof HttpErrorResponse) {
          const er = error.error;
          if (
            er != null &&
            typeof er === 'object' &&
            'message' in er &&
            typeof (er as { message?: string }).message === 'string'
          ) {
            msg = (er as { message: string }).message;
          } else if (er != null && typeof er === 'object' && 'error' in er) {
            msg = String((er as { error: unknown }).error);
          } else if (typeof error.message === 'string') {
            msg = error.message;
          }
        } else if (error instanceof Error) {
          msg = error.message;
        }
        console.warn('[insert_posicao_olt]', msg);
        return throwError(() => new Error(msg));
      }),
    );
  }
}
