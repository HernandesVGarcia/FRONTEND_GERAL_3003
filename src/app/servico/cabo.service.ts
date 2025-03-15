import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import {Cabos12f} from '../modelo/Cabos12f';
import {Observable, throwError} from 'rxjs';
import { retry, timeout, catchError} from 'rxjs/operators';


console.log('inicialização do app-lista-caixa2-ok')

@Injectable({
  providedIn: 'root'
})



export class CaboService {

  
  
  url:string = 'https://15.229.242.119:3001/cabos'
  //===============================================
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 3;
 //===============================================


  constructor(private http:HttpClient) { }
 
  
  selecionar(idCidade:number, capacidade:number):Observable<Cabos12f[]>{
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body = {
      idCIDADES: idCidade,
      capacidade: capacidade
    };
    
    return this.http.post<Cabos12f[]>(this.url, body).pipe(
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

   

