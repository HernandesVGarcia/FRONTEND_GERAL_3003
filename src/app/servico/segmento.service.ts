import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Segmento } from '../modelo/segmento';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SegmentoService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  liberaSegmento(id_meta: number): Observable<any> {
    const route = `/update_libera_segmento`;
    const token = this.authService.getToken();
    const id_city = this.authService.getIdCity();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = { id_city, id_meta };
    const url = `${this.baseUrl}${route}`;

    return this.http.post(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError),
    );
  }

  excluiSegmento(id_meta: number): Observable<any> {
    const route = `/exclui_segmento`;
    const token = this.authService.getToken();
    const id_city = this.authService.getIdCity();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = { id_city, id_meta };
    const url = `${this.baseUrl}${route}`;

    return this.http.post(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError),
    );
  }

  selecionarSobras(): Observable<Segmento[]> {
    const route = `/segmentos_coordenadas`;
    const token = this.authService.getToken();
    const idcity = this.authService.getIdCity();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      id_city: idcity,
      tipo: 'SOBRA',
    };

    const url = `${this.baseUrl}${route}`;

    return this.http.post<Segmento[]>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro na requisição.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
    }

    return throwError(() => errorMessage);
  }
}
