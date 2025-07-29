import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import {Bocas} from '../modelo/Bocas';
import {Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BocasService {

  private baseUrl: string = environment.apiUrlAbsolute;

  //url:string = 'https://www.fiberworks-quantum.com:3001/bocas'
    private readonly TIMEOUT = 10000; // 10 segundos
    private readonly RETRY_ATTEMPTS = 2;
  
    constructor(
      
      private http:HttpClient,
      private authService : AuthService) {
          this.authService.refreshToken();
    }
     
  
    // Método para Selecionar Caixa
    
    selecionar():Observable<Bocas[]>{
      
      const route = `/bocas`;
      const token = this.authService.getToken();
      const idcidade = this.authService.getIdCity();
      const idmetacx = this.authService.getIDmetaCaixa();
  
      const headers = new HttpHeaders()
  
      
  
  
      
        .set('Content-Type', 'application/json')
        //.set('Access-Control-Allow-Origin', '*')
        //.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
        //.set('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
        .set('Authorization',`Bearer ${token}`);
  
        const body = {
          idcidades: idcidade,
          idmeta:idmetacx
        };

      const url = `${this.baseUrl}${route}`;  
  
  
      return this.http.post<Bocas[]>(url,body,{ headers }).pipe(
        
        timeout(this.TIMEOUT),
        retry(this.RETRY_ATTEMPTS),
        catchError(this.handleError),
        
        
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
