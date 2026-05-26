import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface ExcluiPoligonoRequest {
  id_meta: number;
  id_city: number;
}

export interface ExcluiPoligonoResponse {
  success: boolean;
  message?: string;
  id_meta?: number;
  id_city?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExcluiPoligonoService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 15000;
  private readonly RETRY_ATTEMPTS = 1;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  excluirPoligono(request: ExcluiPoligonoRequest): Observable<ExcluiPoligonoResponse> {
    console.log('🗑️ [EXCLUI-POLIGONO] Iniciando exclusão de polígono...', request);

    if (!request.id_meta) {
      console.error('🗑️ [EXCLUI-POLIGONO] ID do polígono não fornecido');
      return throwError(() => new Error('ID do polígono é obrigatório'));
    }

    if (!request.id_city) {
      console.error('🗑️ [EXCLUI-POLIGONO] ID da cidade não fornecido');
      return throwError(() => new Error('ID da cidade é obrigatório'));
    }

    const route = '/exclui_poligono';
    const url = `${this.baseUrl}${route}`;

    const token = this.authService.getToken();
    if (!token) {
      console.error('🗑️ [EXCLUI-POLIGONO] Token de autenticação não encontrado');
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      id_meta: request.id_meta,
      id_city: request.id_city
    };

    console.log('🗑️ [EXCLUI-POLIGONO] Enviando requisição para API...', body);

    return this.http.post<ExcluiPoligonoResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ [EXCLUI-POLIGONO] Erro na requisição:', error);

    let errorMessage = 'Ocorreu um erro ao excluir o polígono.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      }
    }

    return throwError(() => ({ message: errorMessage, error: error.error }));
  }
}
