import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { Poligonos } from '../modelo/poligonos';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/** Corpo da rota `/insert_poligono` — LAT/LNG são calculados na API. */
export interface InserirPoligonoPayload {
  id_city: number;
  Label: string;
  tipo: string;
  GOOGLE_LATLNG: Array<{ lat: number; lng: number }>;
}

export interface InserirPoligonoResponse {
  success?: boolean;
  message?: string;
  id_meta?: number;
  idmeta_poligono?: number;
  nome?: string;
  tipo?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PoligonosService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.refreshToken();
  }

  selecionar(): Observable<Poligonos[]> {
    const route = `/poligonos_coordenadas`;
    const token = this.authService.getToken();
    const idcity = this.authService.getIdCity();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = { id_city: idcity };
    const url = `${this.baseUrl}${route}`;

    return this.http.post<Poligonos[]>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /** Insere polígono; centro LAT/LNG é derivado dos vértices no servidor. */
  inserirPoligono(payload: InserirPoligonoPayload): Observable<InserirPoligonoResponse> {
    const route = `/insert_poligono`;
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    const url = `${this.baseUrl}${route}`;
    return this.http.post<InserirPoligonoResponse>(url, payload, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro na requisição.';
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
