import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, firstValueFrom } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface InsertPosteAprovadoPayload {
  NUM_SEQ_GEO: number | string;
  obs: string;
  LATI: number;
  LONG: number;
  ORIGEM: string;
}

export interface InsertPosteAprovadoRequest {
  id_city: number;
  NUM_SEQ_GEO: number | string;
  obs: string;
  LATI: number;
  LONG: number;
  ORIGEM: string;
}

export interface InsertPosteAprovadoResponse {
  success: boolean;
  insertId?: number;
  NUM_SEQ_GEO?: number | string;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class InsertPosteAprovadoService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  inserirPoste(payload: InsertPosteAprovadoPayload): Observable<InsertPosteAprovadoResponse> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }

    const idCity = this.authService.getIdCity();
    if (!idCity) {
      return throwError(() => new Error('ID da cidade não encontrado'));
    }

    const origem = payload.ORIGEM?.trim();
    if (!origem) {
      return throwError(() => new Error('Origem do poste (tabela) não informada'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body: InsertPosteAprovadoRequest = {
      id_city: idCity,
      NUM_SEQ_GEO: payload.NUM_SEQ_GEO,
      obs: payload.obs?.trim() ? payload.obs.trim() : '-',
      LATI: payload.LATI,
      LONG: payload.LONG,
      ORIGEM: origem,
    };

    const url = `${this.baseUrl}/insert_poste_aprovado`;

    return this.http.post<InsertPosteAprovadoResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError),
    );
  }

  async inserirPosteAsync(payload: InsertPosteAprovadoPayload): Promise<InsertPosteAprovadoResponse> {
    return firstValueFrom(this.inserirPoste(payload));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro ao inserir poste aprovado:', error);
    let errorMessage = 'Erro ao inserir poste aprovado.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      const detail = error.error?.message || error.error?.error || error.message;
      if (typeof detail === 'string') {
        errorMessage = detail;
      }
    }

    return throwError(() => errorMessage);
  }
}
