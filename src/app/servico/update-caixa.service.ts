import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * 🔧 Interface para dados de atualização da caixa
 */
export interface UpdateCaixaData {
  ID_META: number;
  lat: number;
  lng: number;
}

/**
 * 🔧 Interface para resposta de atualização da caixa
 */
export interface UpdateCaixaResponse {
  success: boolean;
  id_meta: number;
  message: string;
  affectedRows: number;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateCaixaService {

  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * 📝 Atualiza as coordenadas de uma caixa existente na base de dados
   * 
   * @param caixaData - Dados da caixa a ser atualizada (ID_META, lat, lng)
   * @returns Observable com resposta da atualização
   */
  atualizarCoordenadas(caixaData: UpdateCaixaData): Observable<UpdateCaixaResponse> {
    console.log('📦 [UPDATE-CAIXA] Iniciando atualização de coordenadas da caixa...', caixaData);
    
    // Validar dados
    const validacao = this.validarDadosCaixa(caixaData);
    if (!validacao.valido) {
      console.error('📦 [UPDATE-CAIXA] Dados inválidos:', validacao.erro);
      return throwError(() => new Error(validacao.erro || 'Dados inválidos'));
    }

    const route = '/update_geocaixa';
    const url = `${this.baseUrl}${route}`;
    
    const token = this.authService.getToken();
    if (!token) {
      console.error('📦 [UPDATE-CAIXA] Token não encontrado');
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      ID_META: caixaData.ID_META,
      lat: caixaData.lat,
      lng: caixaData.lng
    };

    console.log('📦 [UPDATE-CAIXA] Enviando requisição para API...', body);
    console.log('📦 [UPDATE-CAIXA] URL:', url);

    return this.http.post<UpdateCaixaResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /**
   * 🔍 Valida os dados da caixa antes de atualizar
   * 
   * @param caixaData - Dados da caixa
   * @returns Objeto com resultado da validação
   */
  private validarDadosCaixa(caixaData: UpdateCaixaData): {valido: boolean, erro?: string} {
    if (!caixaData) {
      return { valido: false, erro: 'Dados da caixa não fornecidos' };
    }

    if (!caixaData.ID_META || caixaData.ID_META <= 0) {
      return { valido: false, erro: 'ID da caixa (ID_META) inválido' };
    }

    if (caixaData.lat === undefined || caixaData.lat === null) {
      return { valido: false, erro: 'Latitude não fornecida' };
    }

    if (caixaData.lng === undefined || caixaData.lng === null) {
      return { valido: false, erro: 'Longitude não fornecida' };
    }

    // Validar range de coordenadas (opcional, mas recomendado)
    if (caixaData.lat < -90 || caixaData.lat > 90) {
      return { valido: false, erro: 'Latitude deve estar entre -90 e 90' };
    }

    if (caixaData.lng < -180 || caixaData.lng > 180) {
      return { valido: false, erro: 'Longitude deve estar entre -180 e 180' };
    }

    return { valido: true };
  }

  /**
   * ❌ Handler de erros HTTP
   */
  private handleError(error: HttpErrorResponse) {
    console.error('📦 [UPDATE-CAIXA] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao atualizar as coordenadas da caixa.';
    
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
        errorMessage = 'Erro no servidor ao atualizar coordenadas da caixa.';
      } else {
        errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}

