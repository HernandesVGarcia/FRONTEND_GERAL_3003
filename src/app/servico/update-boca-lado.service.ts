

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';

export interface UpdateLadoResponse {
  response: any;
  message: string;
  affectedRows: number;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateBocaLadoService {
  private baseUrl: string = environment.apiUrlAbsolute; 
  //url: string = 'https://www.fiberworks-quantum.com:3001/update_bocaLado'
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;
  
  constructor(
    private http: HttpClient,
    private authService: AuthService) {
      this.authService.refreshToken();
  }
     
  atualizar(LAD: string, BC: number): Observable<UpdateLadoResponse> {
    const route = `/update_bocaLado`;
    const token = this.authService.getToken();
    const idmetacx = this.authService.getIDmetaCaixa();
    
    if (!token) {
      return throwError(() => 'Token de autenticação não encontrado');
    }

    if (!idmetacx) {
      return throwError(() => 'ID da meta caixa não encontrado');
    }
  
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      boca: parseInt(BC.toString()),
      ID_META: parseInt(idmetacx.toString()),
      LADO: LAD
    };

    const url = `${this.baseUrl}${route}`; 
  
    return this.http.post<UpdateLadoResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }
  
  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'Ocorreu um erro ao atualizar o ângulo da boca.';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro de rede: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Erro de conexão: Verifique se a API está rodando e acessível.';
          break;
        case 400:
          errorMessage = 'Dados inválidos enviados para a API de ângulos.';
          break;
        case 401:
          errorMessage = 'Token de autenticação inválido.';
          break;
        case 404:
          errorMessage = 'Rota da API de ângulos não encontrada. Verifique a URL.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor na API de ângulos.';
          break;
        default:
          errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      }
    }
    
    return throwError(() => errorMessage);
  }
}
