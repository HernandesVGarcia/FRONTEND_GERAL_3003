import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * Interface para cadastro de cliente (sem coordenadas - não plota no mapa)
 */
export interface InsertClienteRequest {
  CONTRATO_GPON: string;
  CNPJ: string;
  SIGLA: string;
  ENDEREÇO: string;
  NUMERO: string;
  COMPLEMENTO: string;
  BAIRRO: string;
  CEP: string;
  TELEFONE: string;
  id_city: number;
  id_condominio: number;
  OBS: string;
  POP_ESTACAO: number;
}

export interface InsertClienteResponse {
  success: boolean;
  message?: string;
  id_estacao?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InsertClienteService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  cadastrar(dados: InsertClienteRequest): Observable<InsertClienteResponse> {
    const route = `/insert_cliente`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    return this.http.post<InsertClienteResponse>(url, dados, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro ao cadastrar cliente:', error);
    let errorMessage = 'Ocorreu um erro ao cadastrar o cliente.';

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
