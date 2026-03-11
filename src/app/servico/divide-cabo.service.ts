import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface DivideCaboRequest {
  id_meta_original: number;
  GOOGLE_LATLNG_parte1: Array<{ lat: number; lng: number }>;
  GOOGLE_LATLNG_parte2: Array<{ lat: number; lng: number }>;
}

export interface DivideCaboResponse {
  success: boolean;
  id_meta_original: number;
  id_meta_novo: number;
  message: string;
  length_parte1?: number;
  length_parte2?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DivideCaboService {
  private baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 15000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  dividirCabo(body: DivideCaboRequest): Observable<DivideCaboResponse> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}/divide_cabo`;

    return this.http.post<DivideCaboResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError((error) => {
        console.error('❌ [DIVIDE-CABO] Erro na API:', error);
        return throwError(() => error);
      })
    );
  }
}
