import { Injectable } from '@angular/core';
import { HttpClient,HttpErrorResponse,HttpHeaders } from '@angular/common/http';
import {Caixa} from '../modelo/Caixa';
import {Observable,throwError} from 'rxjs';
import {catchError, retry, timeout } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';


console.log('inicialização do app-lista-caixa2-ok')

@Injectable({
  providedIn: 'root',
  

})



export class CaixaService {

  

  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;
  private readonly TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjoxMiwiZW1haWwiOiJzdXBvcnRlQGZpYmVyd29ya3MuY29tLmJyIiwiaWF0IjoxNzQyNDE1MDEzLCJleHAiOjE3NDI0MTg2MTN9.ATIDLq_4ZmMDx7rqsX-0ZSEYQOD-nuPh78Lyw9A4ECg';

  
  
  url:string = 'https://www.fiberworks-quantum.com:3001/caixas'

  constructor(
    private http:HttpClient,
    private authService: AuthService) { 
      this.authService.refreshToken();
    
  }

  // Método para Selecionar Caixa

  
  selecionar():Observable<Caixa[]>{
    //return this.http.get<Caixa[]>(this.url);
    const token = this.authService.getToken();
    
    if (!token) {
      console.error('Token não disponível para autenticação');
      return throwError(() => 'Token de autenticação não disponível. Faça login novamente.');
    }
    
    console.log('Token obtido, preparando requisição com autorização');

    const headers = new HttpHeaders()
    .set('Content-type','application/json')
    .set('Authorization', `Bearer ${token}`);

    return this.http.get<Caixa[]>(this.url, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
    

}

   private handleError(error: HttpErrorResponse) {
    console.error('Erro na requisição de caixas:', error);
    let errorMessage = 'Ocorreu um erro na requisição.';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      
      if (error.status === 401) {
        errorMessage = 'Autenticação falhou. Por favor, faça login novamente.';
        // Aqui poderíamos adicionar uma chamada para limpar o token inválido
        // this.authService.clearToken();
      } else if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão de rede.';
      } else if (error.status === 403) {
        errorMessage = 'Você não tem permissão para acessar este recurso.';
      }
    }
    
    return throwError(() => errorMessage);

}
}
