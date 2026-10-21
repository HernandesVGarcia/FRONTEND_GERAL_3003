import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface UpdateAnotacaoCoordenadasResponse {
  success: boolean;
  id_meta?: number;
  id_city?: number;
  message?: string;
  affectedRows?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UpdateAnotacaoService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  atualizarCoordenadas(params: {
    id_meta: number;
    lat: number;
    lng: number;
  }): Observable<UpdateAnotacaoCoordenadasResponse> {
    const id_city = this.authService.getIdCity();
    if (!id_city) {
      return throwError(() => new Error('ID da cidade não encontrado'));
    }
    if (!params.id_meta) {
      return throwError(() => new Error('id_meta da anotação é obrigatório'));
    }

    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      id_city,
      id_meta: params.id_meta,
      lat: params.lat,
      lng: params.lng,
    };

    const url = `${this.baseUrl}/update_geometria_anotacao`;

    return this.http.post<UpdateAnotacaoCoordenadasResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('[UPDATE-ANOTACAO] Erro na requisição:', error);

    let errorMessage = 'Ocorreu um erro ao atualizar as coordenadas da anotação.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = typeof error.error.error === 'string' ? error.error.error : errorMessage;
    }

    return throwError(() => ({ message: errorMessage, error: error.error }));
  }
}
