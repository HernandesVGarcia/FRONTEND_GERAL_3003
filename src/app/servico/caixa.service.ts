import { Injectable } from '@angular/core';
import { HttpClient,HttpErrorResponse,HttpHeaders } from '@angular/common/http';
import {Caixa} from '../modelo/Caixa';
import {Observable,throwError} from 'rxjs';
import {catchError, retry, timeout } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';


console.log('inicialização do app-lista-caixa2-ok')

@Injectable({
  providedIn: 'root',
  

})



export class CaixaService {

  

  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;

  private baseUrl: string = environment.apiUrlAbsolute;
  
  //url:string = 'https://www.fiberworks-quantum.com:3001/caixas'

  constructor(
    private http:HttpClient,
    private authService: AuthService) { 
      this.authService.refreshToken();
    
  }

  // Método para Selecionar Caixa

  
  selecionar():Observable<Caixa[]>{
    //return this.http.get<Caixa[]>(this.url);
    const route = `/caixas`;
    const token = this.authService.getToken();
    const idcidade = this.authService.getIdCity();
    
    if (!token) {
      console.error('Token não disponível para autenticação');
      return throwError(() => 'Token de autenticação não disponível. Faça login novamente.');
    }
    
    console.log('Token obtido, preparando requisição com autorização');

    const headers = new HttpHeaders()
    .set('Content-type','application/json')
    .set('Authorization', `Bearer ${token}`);

    const body = {
      idCIDADES: idcidade
    };

    const url = `${this.baseUrl}${route}`; 

    return this.http.post<Caixa[]>(url,body,{ headers }).pipe(
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
