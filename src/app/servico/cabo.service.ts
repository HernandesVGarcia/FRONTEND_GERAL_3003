import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import {Cabos12f} from '../modelo/Cabos12f';
import {Observable, throwError} from 'rxjs';
import { retry, timeout, catchError} from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';


//console.log('inicialização do app-lista-caixa2-ok')

@Injectable({
  providedIn: 'root'
})



export class CaboService {

  private baseUrl: string = environment.apiUrlAbsolute;
  
  //url:string = 'https://www.fiberworks-quantum.com:3001/cabos'
  //===============================================
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 3;
 //===============================================


  constructor(
    private http:HttpClient,
    private authService: AuthService

  ) { }
 
  
  selecionar(idCidade:number, capacidade:number):Observable<Cabos12f[]>{
    const route = `/cabos`;
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`);

    const body = {
      idCIDADES: idCidade,
      capacidade: capacidade
    };

    const url = `${this.baseUrl}${route}`; 
    
    return this.http.post<Cabos12f[]>(url, body,{headers}).pipe(
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
    } else {
      // Erro do servidor
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
    }
    
    return throwError(() => errorMessage);
  };
}

   

