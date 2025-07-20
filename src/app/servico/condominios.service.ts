

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import {Condominios} from '../modelo/Condominios';
import {Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';


@Injectable({
  providedIn: 'root'
})

export class CondominiosService {
  
  url:string = 'https://www.fiberworks-quantum.com:3001/condominios_coordenadas'
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http:HttpClient,
    private authService : AuthService) {
        this.authService.refreshToken();
  }
   

  // Método para Selecionar Caixa
  
  selecionar():Observable<Condominios[]>{
    const token = this.authService.getToken();
    const idcidade = this.authService.getIdCity();

    const headers = new HttpHeaders()

    


    
      .set('Content-Type', 'application/json')
      
      .set('Authorization',`Bearer ${token}`);

      const body = {
        id_city: idcidade,
        
      };


    return this.http.post<Condominios[]>(this.url,body,{ headers }).pipe(
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
}   

}