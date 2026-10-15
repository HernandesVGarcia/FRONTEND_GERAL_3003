import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import {Token} from '../modelo/Token';
import {Observable, throwError} from 'rxjs';
import { retry, timeout, catchError} from 'rxjs/operators';
//import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';

console.log('inicialização do app-lista-caixa2-ok')

@Injectable({
  providedIn: 'root'
})



export class TokenService {

  
  private baseUrl: string = environment.apiUrlAbsolute; 
  //url:string = 'https://www.fiberworks-quantum.com:3001/usuarios/login'
  //===============================================
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 3;
 //===============================================


  constructor(
    private http:HttpClient,
    //private authService: AuthService

  ) { }
 
  
  selecionar(usuario:string, senha:string):Observable<Token[]>{
    const route = `/usuarios/login`;
    //const token = this.authService.getToken();
    const headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    //.set('Authorization', `Bearer ${token}`);

    const body = {
      chave: usuario,
      senha: senha
    };

    const url = `${this.baseUrl}${route}`; 
    
    return this.http.post<Token[]>(url, body,{headers}).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }
  
  private handleError(error: HttpErrorResponse) {
    console.error('Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro na requisição.';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;

    } else if (error.status === 401) {
      errorMessage = 'Chave ou senha invalidos.';
    } else if (error.status === 429) {
      const apiMsg = error.error?.erro?.mensagem as string | undefined;
      errorMessage =
        apiMsg && apiMsg.trim() !== ''
          ? `${apiMsg.trim()} Tente novamente em cerca de 5 minutos.`
          : 'Muitas tentativas de login. Tente novamente em cerca de 5 minutos.';
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
    }
    
    return throwError(() => errorMessage);
  };
}
