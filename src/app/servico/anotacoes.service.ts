import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Anotacoes, mapApiRowToAnotacao } from '../modelo/Anotacoes';
import { Observable, throwError } from 'rxjs';
import { map, retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})

export class AnotacoesService {
  private baseUrl: string = environment.apiUrlAbsolute;  
  //url:string = 'https://www.fiberworks-quantum.com:3001/anotacoes_coordenadas'
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    
    private http:HttpClient,
    private authService : AuthService) {
        this.authService.refreshToken();
  }
   

  // Método para Selecionar Caixa
  
  selecionar():Observable<Anotacoes[]>{
    const route = `/anotacoes_coordenadas`;
    const token = this.authService.getToken();
    const idcidade = this.authService.getIdCity();

    const headers = new HttpHeaders()

    


    
      .set('Content-Type', 'application/json')
      
      .set('Authorization',`Bearer ${token}`);

      const body = {
        id_city: idcidade,
        
      };

      const url = `${this.baseUrl}${route}`; 


    return this.http.post<unknown>(url, body, { headers }).pipe(
      map((body) => {
        const raw =
          body != null && typeof body === 'object' && 'response' in body
            ? (body as { response: unknown }).response
            : body;
        const rows = Array.isArray(raw) ? raw : [];
        return rows.map((row) => mapApiRowToAnotacao(row));
      }),
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