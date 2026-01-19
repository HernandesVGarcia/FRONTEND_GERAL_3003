import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * Interface para dados de atualização da estação
 */
export interface UpdateEstacaoData {
  ID_META: number;
  lat: number;
  lng: number;
}

/**
 * Interface para resposta de atualização da estação
 */
export interface UpdateEstacaoResponse {
  success: boolean;
  id_meta: number;
  message: string;
  affectedRows: number;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateEstacaoService {

  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Atualiza as coordenadas de uma estação existente na base de dados
   * 
   * @param estacaoData - Dados da estação a ser atualizada (ID_META, lat, lng)
   * @returns Observable com resposta da atualização
   */
  atualizarCoordenadas(estacaoData: UpdateEstacaoData): Observable<UpdateEstacaoResponse> {
    console.log('📡 [UPDATE-ESTAÇÃO] Iniciando atualização de coordenadas da estação...', estacaoData);
    
    // Validar dados
    const validacao = this.validarDadosEstacao(estacaoData);
    if (!validacao.valido) {
      console.error('📡 [UPDATE-ESTAÇÃO] Dados inválidos:', validacao.erro);
      return throwError(() => new Error(validacao.erro || 'Dados inválidos'));
    }

    const route = '/update_geopop';
    const url = `${this.baseUrl}${route}`;
    
    const token = this.authService.getToken();
    if (!token) {
      console.error('📡 [UPDATE-ESTAÇÃO] Token não encontrado');
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      ID_META: estacaoData.ID_META,
      lat: estacaoData.lat,
      lng: estacaoData.lng
    };

    console.log('📡 [UPDATE-ESTAÇÃO] Enviando requisição para API...', body);
    console.log('📡 [UPDATE-ESTAÇÃO] URL:', url);

    return this.http.post<UpdateEstacaoResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /**
   * Valida os dados da estação antes de atualizar
   * 
   * @param estacaoData - Dados da estação
   * @returns Objeto com resultado da validação
   */
  private validarDadosEstacao(estacaoData: UpdateEstacaoData): {valido: boolean, erro?: string} {
    if (!estacaoData) {
      return { valido: false, erro: 'Dados da estação não fornecidos' };
    }

    if (!estacaoData.ID_META || estacaoData.ID_META <= 0) {
      return { valido: false, erro: 'ID da estação (ID_META) inválido' };
    }

    if (estacaoData.lat === undefined || estacaoData.lat === null) {
      return { valido: false, erro: 'Latitude não fornecida' };
    }

    if (estacaoData.lng === undefined || estacaoData.lng === null) {
      return { valido: false, erro: 'Longitude não fornecida' };
    }

    // Validar range de coordenadas
    if (estacaoData.lat < -90 || estacaoData.lat > 90) {
      return { valido: false, erro: 'Latitude deve estar entre -90 e 90' };
    }

    if (estacaoData.lng < -180 || estacaoData.lng > 180) {
      return { valido: false, erro: 'Longitude deve estar entre -180 e 180' };
    }

    return { valido: true };
  }

  /**
   * Handler de erros HTTP
   */
  private handleError(error: HttpErrorResponse) {
    console.error('📡 [UPDATE-ESTAÇÃO] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao atualizar as coordenadas da estação.';
    
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
        errorMessage = 'Erro no servidor ao atualizar coordenadas da estação.';
      } else {
        errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
