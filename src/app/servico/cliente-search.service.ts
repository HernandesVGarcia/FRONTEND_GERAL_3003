


import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface ClienteSearchResult {
  ID_META: number;
  SIGLA: string;
  LAT: number;
  LNG: number;
  ENDERECO: string;
}

export interface ClienteSearchRequest {
  SIGLA?: string;
  ENDERECO?: string;
  idCIDADES: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteSearchService {
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;
  private baseUrl: string = environment.apiUrlAbsolute;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  buscarClientes(filtros: { sigla?: string, endereco?: string }): Observable<ClienteSearchResult[]> {
    const route = `/clientes-buscar`;
    const token = this.authService.getToken();
    const idcidade = this.authService.getIdCity();
    
    if (!token) {
      console.error('Token não disponível para autenticação');
      return throwError(() => 'Token de autenticação não disponível. Faça login novamente.');
    }

    if (!idcidade) {
      console.error('ID da cidade não disponível');
      return throwError(() => 'ID da cidade não disponível. Selecione uma cidade.');
    }
    
    console.log('Realizando busca de caixas com filtros:', filtros);

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body: ClienteSearchRequest = {
      idCIDADES: idcidade
    };

    // Adicionar filtros apenas se foram fornecidos
    if (filtros.sigla && filtros.sigla.trim() !== '') {
      body.SIGLA = filtros.sigla.trim();
    }

    if (filtros.endereco && filtros.endereco.trim() !== '') {
      body.ENDERECO = filtros.endereco.trim();
    }

    const url = `${this.baseUrl}${route}`; 

    return this.http.post<{ response: ClienteSearchResult[] }>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map(response => response.response || []),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    console.error('Erro na busca de clientes:', error);
    let errorMessage = 'Ocorreu um erro na busca.';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      
      if (error.status === 401) {
        errorMessage = 'Autenticação falhou. Por favor, faça login novamente.';
      } else if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão de rede.';
      } else if (error.status === 403) {
        errorMessage = 'Você não tem permissão para acessar este recurso.';
      } else if (error.status === 404) {
        errorMessage = 'Rota de busca não encontrada no servidor.';
      }
    }
    
    return throwError(() => errorMessage);
  }
}
