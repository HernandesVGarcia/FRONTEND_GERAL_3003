



import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * 🔧 Interface para resposta de insert_idmeta
 */


/**
 * 🔧 Interface para dados do log a ser inserido
 */
export interface InsertLogData {
  id_usuario: number;           // Ex: 48
  id_evento: number;            // Ex: 12
  id_city: number|null;         // Ex: 1
  id_meta_objeto: number|null;  // ID do objeto meta (pode ser nulo)
  descricao: string;            // Descrição do evento
  VERSION: string;             // Versão do sistema
}

/**
 * 🔧 Interface para resposta de insert_log
 */
export interface InsertLogResponse {
  success: boolean;
  id_meta: number;
  id_log: number;
  message: string;
  affectedRows?: {
    log: number;
     };
}

@Injectable({
  providedIn: 'root'
})
export class InsertLogService {

  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 15000; // 15 segundos (inserção pode demorar mais)
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * 📝 Insere um novo log na base de dados
   * 
   * @param logData - Dados do log a ser inserido
   * @returns Observable com resposta da inserção
   */
  inserirLog(logData: InsertLogData): Observable<InsertLogResponse> {
    console.log('🗺️ [INSERT-LOG] Iniciando inserção de Log...', logData);

    // Obter id_city do AuthService
    const idCity = this.authService.getIdCity();
    if (!idCity) {
      console.error('🗺️ [INSERT-LOG] ID da cidade não encontrado no AuthService');
      return throwError(() => new Error('ID da cidade não encontrado. Por favor, selecione uma cidade.'));
    }

    // Atribuir id_city quando ele existe
    logData.id_city = idCity;
    console.log('🗺️ [INSERT-LOG] ID da cidade:', idCity);
    
    // Validar dados
    const validacao = this.validarDadosLog(logData);
    if (!validacao.valido) {
      console.error('🗺️ [INSERT-LOG] Dados inválidos:', validacao.erro);
      return throwError(() => new Error(validacao.erro || 'Dados inválidos'));
    }

    // Preparar requisição HTTP
    const route = '/insert_logs';
    const url = `${this.baseUrl}${route}`;
    
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      id_usuario: logData.id_usuario,
      id_evento: logData.id_evento,
      id_city: logData.id_city,
      id_meta_objeto: logData.id_meta_objeto,
      descricao: logData.descricao,
      VERSION: logData.VERSION,
    };

    console.log('🗺️ [INSERT-LOG] Inserindo log na base de dados...', body);

    return this.http.post<InsertLogResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /**
   * 🔍 Valida os dados do log antes de inserir
   * 
   * @param logData - Dados do log
   * @returns Objeto com resultado da validação
   */
  private validarDadosLog(logData: InsertLogData): {valido: boolean, erro?: string} {
    if (!logData.id_usuario || logData.id_usuario <= 0) {
      return { valido: false, erro: 'ID do usuário inválido' };
    }

    if (!logData.id_evento || logData.id_evento <= 0 || logData.id_evento > 53) {
      return { valido: false, erro: 'Número de evento inexistente' };
    }

    if (!logData.id_city || logData.id_city <= 0) {
      return { valido: false, erro: 'ID cidade inexistente' };
    }

    // id_meta_objeto pode ser nulo, então não validamos como obrigatório

    if (!logData.descricao || logData.descricao.trim() === '') {
      return { valido: false, erro: 'Descrição do evento inexistente' };
    }

    if (!logData.VERSION || logData.VERSION.trim() === '') {
      return { valido: false, erro: 'Versão do Sistema Inexistente' };
    }

    return { valido: true };
  }

  

  

  /**
   * ❌ Handler de erros HTTP
   */
  private handleError(error: HttpErrorResponse) {
    console.error('🗺️ [INSERT-LOG] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao inserir o log.';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      } else if (error.status === 401) {
        errorMessage = 'Não autorizado. Faça login novamente.';
      } else if (error.status === 500) {
        errorMessage = 'Erro no servidor ao inserir log.';
      } else {
        errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}

