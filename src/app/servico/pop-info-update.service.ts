import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { PopsInfo } from '../modelo/PopsInfo';

interface PopInfoUpdateRequest {
  id_meta: number;
  SIGLA?: string;
  ENDERECO?: string;
  NUMERO?: string;
  BAIRRO?: string;
  COMPLEMENTO?: string;
  CONTATO?: string;
  TELEFONE?: string;
  OBS?: string;
  USUARIO?: string;
  data?: string;
}

interface PopInfoUpdateResponse {
  success: boolean;
  message: string;
  data?: PopsInfo;
}

@Injectable({
  providedIn: 'root'
})
export class PopInfoUpdateService {
  private readonly TIMEOUT = 15000; // 15 segundos para operações de update
  private readonly RETRY_ATTEMPTS = 2;
  private baseUrl: string = environment.apiUrlAbsolute;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Atualiza as informações do POP/cliente.
   * A rota utilizada será definida conforme especificação da API.
   */
  updatePopInfo(id_meta: number, updateData: Partial<PopsInfo>): Observable<PopInfoUpdateResponse> {
    const route = `/clientes-update`; // Rota a ser confirmada com o backend
    const token = this.authService.getToken();

    if (!token) {
      console.error('Token não disponível para autenticação');
      return throwError(() => 'Token de autenticação não disponível. Faça login novamente.');
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    // Preparar dados para envio
    const body: PopInfoUpdateRequest = {
      id_meta,
      ...updateData
    };

    console.log('Enviando atualização para:', url);
    console.log('Dados a serem atualizados:', body);

    return this.http.post<PopInfoUpdateResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map(response => {
        console.log('Resposta da atualização:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    console.error('Erro ao atualizar informações do POP/cliente:', error);
    let errorMessage = 'Ocorreu um erro ao atualizar as informações.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;

      if (error.status === 401) {
        errorMessage = 'Autenticação falhou. Por favor, faça login novamente.';
      } else if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão de rede.';
      } else if (error.status === 403) {
        errorMessage = 'Você não tem permissão para atualizar este recurso.';
      } else if (error.status === 404) {
        errorMessage = 'Rota de atualização não encontrada no servidor.';
      } else if (error.status === 400) {
        errorMessage = 'Dados inválidos enviados para atualização.';
      } else if (error.status === 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
      }
    }

    return throwError(() => errorMessage);
  }
}
