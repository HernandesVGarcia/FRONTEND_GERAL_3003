import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/** Corpo da rota `update_geopoligono`. */
export interface AtualizarGeometriaPoligonoPayload {
  id_meta: number;
  Label: string;
  GOOGLE_LATLNG: Array<{ lat: number; lng: number }>;
}

export interface AtualizarGeometriaPoligonoResponse {
  success?: boolean;
  message?: string;
  id_meta?: number;
  nome?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UpdatePoligonoService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.refreshToken();
  }

  atualizarGeometria(
    payload: AtualizarGeometriaPoligonoPayload
  ): Observable<AtualizarGeometriaPoligonoResponse> {
    const route = `/update_geopoligono`;
    const url = `${this.baseUrl}${route}`;
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    return this.http
      .post<AtualizarGeometriaPoligonoResponse>(url, payload, { headers })
      .pipe(timeout(this.TIMEOUT), retry(this.RETRY_ATTEMPTS), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro na requisição (update polígono):', error);
    let errorMessage = 'Ocorreu um erro ao atualizar o polígono.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else if (typeof error.error?.error === 'string') {
      errorMessage = error.error.error;
    } else if (typeof error.message === 'string') {
      errorMessage = `${error.message}`;
    }
    return throwError(() => errorMessage);
  }
}
