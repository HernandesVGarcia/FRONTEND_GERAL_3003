import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * Cliente cadastrado na base mas ainda não plotado no mapa (sem coordenadas)
 */
export interface ClienteCadastrado {
  ID: number;
  SIGLA: string;
  CONTRATO?: string;
  ENDERECO?: string;
}

export interface ClientesCadastradosResponse {
  success?: boolean;
  response?: ClienteCadastrado[];
  data?: ClienteCadastrado[];
}

export interface ClientePlotarResponse {
  success: boolean;
  message?: string;
  id_meta?: number;
  id_estacao?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesCadastradosService {
  private readonly TIMEOUT = 15000;
  private readonly RETRY_ATTEMPTS = 2;
  private baseUrl: string = environment.apiUrlAbsolute;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Busca clientes cadastrados na base mas ainda não plotados no mapa.
   * Body: idCIDADES (obrigatório), SIGLA e ENDERECO (opcionais para filtro).
   */
  buscarClientesCadastrados(filtros?: { sigla?: string; endereco?: string }): Observable<ClienteCadastrado[]> {
    const route = `/clientes-buscar-cadastrados`;
    const token = this.authService.getToken();
    const idCity = this.authService.getIdCity();

    if (!token) {
      return throwError(() => 'Token de autenticação não disponível. Faça login novamente.');
    }

    if (!idCity) {
      return throwError(() => 'ID da cidade não disponível. Selecione uma cidade.');
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body: { idCIDADES: number; SIGLA?: string; ENDERECO?: string } = {
      idCIDADES: idCity
    };

    if (filtros?.sigla?.trim()) {
      body.SIGLA = filtros.sigla.trim();
    }
    if (filtros?.endereco?.trim()) {
      body.ENDERECO = filtros.endereco.trim();
    }

    const url = `${this.baseUrl}${route}`;

    return this.http.post<ClientesCadastradosResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map(res => res.response || res.data || []),
      catchError(this.handleError)
    );
  }

  /**
   * Plota um cliente no mapa (atualiza com coordenadas).
   * Rota: POST /clientes-plotar-cadastrados
   * Body: ID_CLIENTE, SIGLA, id_city, id_condominio, LAT, LNG, STATUS, ID_PROJETISTA
   */
  plotarCliente(cliente: ClienteCadastrado, lat: number, lng: number): Observable<ClientePlotarResponse> {
    const route = `/clientes-plotar-cadastrados`;
    const token = this.authService.getToken();
    const idCity = this.authService.getIdCity();
    const idProjetista = this.authService.getIdUser();

    if (!token) {
      return throwError(() => 'Token de autenticação não disponível.');
    }
    if (!idCity) {
      return throwError(() => 'ID da cidade não disponível. Selecione uma cidade.');
    }
    if (!idProjetista) {
      return throwError(() => 'Usuário não identificado. Faça login novamente.');
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;
    const body = {
      ID_CLIENTE: cliente.ID,
      SIGLA: cliente.SIGLA,
      id_city: idCity,
      id_condominio: 0,
      LAT: String(lat),
      LNG: String(lng),
      STATUS: 1,
      ID_PROJETISTA: idProjetista
    };

    return this.http.post<ClientePlotarResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('Erro no serviço de clientes cadastrados:', error);
    let errorMessage = 'Ocorreu um erro na operação.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      if (error.status === 401) errorMessage = 'Autenticação falhou. Faça login novamente.';
      else if (error.status === 404) errorMessage = 'Rota não encontrada no servidor.';
      else if (error.status === 500) errorMessage = 'Erro interno do servidor. Tente novamente.';
      else errorMessage = error.error?.error || error.error?.message || errorMessage;
    }

    return throwError(() => errorMessage);
  };
}
