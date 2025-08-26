import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { PopsInfo } from '../modelo/PopsInfo';

interface PopInfoResponse {
  response?: PopsInfo | null;
  data?: PopsInfo | null;
  // Adicionando campos alternativos que a API pode retornar
  success?: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PopInfoService {
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;
  private baseUrl: string = environment.apiUrlAbsolute;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Busca informações detalhadas do POP/cliente por ID.
   * A rota utilizada é /clientes-info conforme especificação.
   */
  getPopInfo(id_meta: number): Observable<PopsInfo | null> {
    const route = `/clientes-info`;
    const token = this.authService.getToken();

    if (!token) {
      console.error('Token não disponível para autenticação');
      return throwError(() => 'Token de autenticação não disponível. Faça login novamente.');
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    // Corpo mínimo contendo o identificador solicitado
    const body = { id_meta };



    return this.http.post<PopInfoResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map(res => {
        if (res && res.response) {
          // Se response é um array, pegar o primeiro item
          if (Array.isArray(res.response) && res.response.length > 0) {
            return res.response[0];
          }
          // Se response é um objeto direto
          return res.response;
        } else if (res && res.data) {
          // Se data é um array, pegar o primeiro item
          if (Array.isArray(res.data) && res.data.length > 0) {
            return res.data[0];
          }
          // Se data é um objeto direto
          return res.data;
        } else {
          return null;
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    console.error('Erro ao buscar informações do POP/cliente:', error);
    let errorMessage = 'Ocorreu um erro na consulta de informações.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;

      if (error.status === 401) {
        errorMessage = 'Autenticação falhou. Por favor, faça login novamente.';
      } else if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão de rede.';
      } else if (error.status === 403) {
        errorMessage = 'Você não tem permissão para acessar este recurso.';
      } else if (error.status === 404) {
        errorMessage = 'Rota não encontrada no servidor.';
      }
    }

    return throwError(() => errorMessage);
  }
}


