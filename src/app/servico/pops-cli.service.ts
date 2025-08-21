
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import {PopsEst} from '../modelo/popsEst';
import {Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';




@Injectable({
  providedIn: 'root'
})

export class PopsCliService {

  private baseUrl: string = environment.apiUrlAbsolute; 
  //url:string = 'https://www.fiberworks-quantum.com:3001/clientes_coordenadas'
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http:HttpClient,
    private authService : AuthService) {
        this.authService.refreshToken();
  }
   

  // Método para Selecionar Caixa
  
  selecionar(id_condominio?: number, status?: number, olt_filter?: string):Observable<PopsEst[]>{
    const route = `/clientes_coordenadas`;
    const token = this.authService.getToken();
    const idcidade = this.authService.getIdCity();

    const headers = new HttpHeaders()

    
    
      .set('Content-Type', 'application/json')
      
      .set('Authorization',`Bearer ${token}`);

      const body = {
        id_city: idcidade,        
        tamanho:1,
        id_condominio: id_condominio ?? 0,  // usa 0 como padrão se não fornecido
        status: status ?? 1,                // usa 1 como padrão se não fornecido
        olt_filter: olt_filter ?? "zero"    // usa "zero" como padrão se não fornecido
        
      };

      const url = `${this.baseUrl}${route}`; 


    return this.http.post<PopsEst[]>(url,body,{ headers }).pipe(
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
