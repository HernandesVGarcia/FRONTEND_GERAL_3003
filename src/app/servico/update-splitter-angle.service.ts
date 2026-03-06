import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';

export interface UpdateSplitterAngleResponse {
  response?: any;
  message?: string;
  affectedRows?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateSplitterAngleService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  /**
   * Atualiza o ângulo do splitter.
   * Rota: /update_splitterAngle
   * Body: { ID_META, ROT } - ROT é o ângulo em radianos
   */
  atualizar(id_meta: number, ROT: number): Observable<UpdateSplitterAngleResponse> {
    const route = `/update_splitterAngle`;
    const token = this.authService.getToken();

    if (!token) {
      return throwError(() => 'Token de autenticação não encontrado');
    }

    if (!id_meta || id_meta <= 0) {
      return throwError(() => 'ID_META do splitter é obrigatório');
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      ID_META: id_meta,
      ROT: ROT
    };

    const url = `${this.baseUrl}${route}`;

    return this.http.post<UpdateSplitterAngleResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'Ocorreu um erro ao atualizar o ângulo do splitter.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro de rede: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Erro de conexão: Verifique se a API está rodando e acessível.';
          break;
        case 400:
          errorMessage = 'Dados inválidos enviados para a API de ângulos do splitter.';
          break;
        case 401:
          errorMessage = 'Token de autenticação inválido.';
          break;
        case 404:
          errorMessage = 'Rota da API de ângulos do splitter não encontrada. Verifique a URL.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor na API de ângulos do splitter.';
          break;
        default:
          errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      }
    }

    return throwError(() => errorMessage);
  }
}
