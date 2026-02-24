import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * Interface para o body da rota update_dio_equipamento
 * Atualiza obs (equipamento) e N (dbm) de um grupo de 12 fibras
 */
export interface UpdateDioEquipamentoRequest {
  grupo: number;
  campo1: string;
  campo2: string;
  campo3: string;
  campo4: string;
  campo5: string;
  campo6: string;
  campo7: string;
  campo8: string;
  campo9: string;
  campo10: string;
  campo11: string;
  campo12: string;
  n1: string;
  n2: string;
  n3: string;
  n4: string;
  n5: string;
  n6: string;
  n7: string;
  n8: string;
  n9: string;
  n10: string;
  n11: string;
  n12: string;
  id_meta_dio: number;
}

export interface UpdateDioEquipamentoResponse {
  message?: string;
  affectedRows?: number;
  tabela?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateDioEquipamentoService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  atualizar(request: UpdateDioEquipamentoRequest): Observable<UpdateDioEquipamentoResponse> {
    const route = `/update_dio_equipamento`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    return this.http.post<UpdateDioEquipamentoResponse>(url, request, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro ao atualizar DIO equipamento:', error);
    let errorMessage = 'Ocorreu um erro ao atualizar equipamento e dBm.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      const detail = error.error?.error || error.error?.message || error.error;
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (detail && typeof detail === 'object') {
        errorMessage = (detail as any).message || (detail as any).error || errorMessage;
      }
    }

    return throwError(() => errorMessage);
  }
}
