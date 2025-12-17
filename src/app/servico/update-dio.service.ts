import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * 🔧 Interface para dados de atualização do DIO
 */
export interface UpdateDioData {
  ID_META: number;
  lat: number;
  lng: number;
}

/**
 * 🔧 Interface para resposta de atualização do DIO
 */
export interface UpdateDioResponse {
  success: boolean;
  id_meta: number;
  message: string;
  affectedRows: number;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateDioService {

  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * 📝 Atualiza as coordenadas de um DIO existente na base de dados
   * 
   * @param dioData - Dados do DIO a ser atualizado (ID_META, lat, lng)
   * @returns Observable com resposta da atualização
   */
  atualizarCoordenadas(dioData: UpdateDioData): Observable<UpdateDioResponse> {
    console.log('📡 [UPDATE-DIO] Iniciando atualização de coordenadas do DIO...', dioData);
    
    // Validar dados
    const validacao = this.validarDadosDio(dioData);
    if (!validacao.valido) {
      console.error('📡 [UPDATE-DIO] Dados inválidos:', validacao.erro);
      return throwError(() => new Error(validacao.erro || 'Dados inválidos'));
    }

    const route = '/update_geodio';
    const url = `${this.baseUrl}${route}`;
    
    const token = this.authService.getToken();
    if (!token) {
      console.error('📡 [UPDATE-DIO] Token não encontrado');
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      ID_META: dioData.ID_META,
      lat: dioData.lat,
      lng: dioData.lng
    };

    console.log('📡 [UPDATE-DIO] Enviando requisição para API...', body);
    console.log('📡 [UPDATE-DIO] URL:', url);

    return this.http.post<UpdateDioResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /**
   * 🔍 Valida os dados do DIO antes de atualizar
   * 
   * @param dioData - Dados do DIO
   * @returns Objeto com resultado da validação
   */
  private validarDadosDio(dioData: UpdateDioData): {valido: boolean, erro?: string} {
    if (!dioData) {
      return { valido: false, erro: 'Dados do DIO não fornecidos' };
    }

    if (!dioData.ID_META || dioData.ID_META <= 0) {
      return { valido: false, erro: 'ID do DIO (ID_META) inválido' };
    }

    if (dioData.lat === undefined || dioData.lat === null) {
      return { valido: false, erro: 'Latitude não fornecida' };
    }

    if (dioData.lng === undefined || dioData.lng === null) {
      return { valido: false, erro: 'Longitude não fornecida' };
    }

    // Validar range de coordenadas
    if (dioData.lat < -90 || dioData.lat > 90) {
      return { valido: false, erro: 'Latitude deve estar entre -90 e 90' };
    }

    if (dioData.lng < -180 || dioData.lng > 180) {
      return { valido: false, erro: 'Longitude deve estar entre -180 e 180' };
    }

    return { valido: true };
  }

  /**
   * ❌ Handler de erros HTTP
   */
  private handleError(error: HttpErrorResponse) {
    console.error('📡 [UPDATE-DIO] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao atualizar as coordenadas do DIO.';
    
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
        errorMessage = 'Erro no servidor ao atualizar coordenadas do DIO.';
      } else {
        errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}

