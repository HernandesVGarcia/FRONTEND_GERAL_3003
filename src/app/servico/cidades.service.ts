import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import {Cidades} from '../modelo/Cidades';
import {Observable, throwError} from 'rxjs';
import { retry, timeout, catchError} from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CidadesService {
private baseUrl: string = environment.apiUrlAbsolute;  
//url:string = 'https://www.fiberworks-quantum.com:3001/cidades'
  //===============================================
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 3;
 //===============================================


  constructor(
    private http:HttpClient,
    private authService: AuthService

  ) { }
 
  
  selecionar():Observable<Cidades[]>{
    const route = `/cidades`;
    const token = this.authService.getToken();
    const polo = this.authService.getPolo();
    const headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`);

    const body = {
      POLO: polo
      
    };

    const url = `${this.baseUrl}${route}`; 
    
    return this.http.post<Cidades[]>(url, body,{headers}).pipe(
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

   



