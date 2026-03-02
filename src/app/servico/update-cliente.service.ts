import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * Interface para dados de atualização da cliente
 */
export interface UpdateClienteData {
  ID_META: number;
  lat: number;
  lng: number;
}

/**
 * Interface para resposta de atualização da cliente
 */
export interface UpdateClienteResponse {
  success: boolean;
  id_meta: number;
  message: string;
  affectedRows: number;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateClienteService {

  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Atualiza as coordenadas de uma cliente existente na base de dados
   * 
   * @param clienteData - Dados da cliente a ser atualizada (ID_META, lat, lng)
   * @returns Observable com resposta da atualização
   */
  atualizarCoordenadas(clienteData: UpdateClienteData): Observable<UpdateClienteResponse> {
    console.log('📡 [UPDATE-cliente] Iniciando atualização de coordenadas da cliente...', clienteData);
    
    // Validar dados
    const validacao = this.validarDadosCliente(clienteData);
    if (!validacao.valido) {
      console.error('📡 [UPDATE-cliente] Dados inválidos:', validacao.erro);
      return throwError(() => new Error(validacao.erro || 'Dados inválidos'));
    }

    const route = '/update_geopop';
    const url = `${this.baseUrl}${route}`;
    
    const token = this.authService.getToken();
    if (!token) {
      console.error('📡 [UPDATE-cliente] Token não encontrado');
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      ID_META: clienteData.ID_META,
      lat: clienteData.lat,
      lng: clienteData.lng
    };

    console.log('📡 [UPDATE-cliente] Enviando requisição para API...', body);
    console.log('📡 [UPDATE-cliente] URL:', url);

    return this.http.post<UpdateClienteResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /**
   * Valida os dados da estação antes de atualizar
   * 
   * @param clienteData - Dados da estação
   * @returns Objeto com resultado da validação
   */
  private validarDadosCliente(clienteData: UpdateClienteData): {valido: boolean, erro?: string} {
    if (!clienteData) {
      return { valido: false, erro: 'Dados da cliente não fornecidos' };
    }

    if (!clienteData.ID_META || clienteData.ID_META <= 0) {
      return { valido: false, erro: 'ID da cliente (ID_META) inválido' };
    }

    if (clienteData.lat === undefined || clienteData.lat === null) {
      return { valido: false, erro: 'Latitude não fornecida' };
    }

    if (clienteData.lng === undefined || clienteData.lng === null) {
      return { valido: false, erro: 'Longitude não fornecida' };
    }

    // Validar range de coordenadas
    if (clienteData.lat < -90 || clienteData.lat > 90) {
      return { valido: false, erro: 'Latitude deve estar entre -90 e 90' };
    }

    if (clienteData.lng < -180 || clienteData.lng > 180) {
      return { valido: false, erro: 'Longitude deve estar entre -180 e 180' };
    }

    return { valido: true };
  }

  /**
   * Handler de erros HTTP
   */
  private handleError(error: HttpErrorResponse) {
    console.error('📡 [UPDATE-Cliente] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao atualizar as coordenadas da cliente.';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      } else if (error.status === 401) {
        errorMessage = 'Não autorizado. Faça login novamente.';
      } else if (error.status === 404) {
        errorMessage = 'Rota não encontrada. Verifique a URL da API.';
      } else if (error.status === 500) {
        errorMessage = 'Erro no servidor ao atualizar coordenadas da cliente.';
      } else {
        errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
