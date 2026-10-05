
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';
import { PopsCli } from '../modelo/PopsCli';




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
  
  selecionar(
    id_condominio?: number,
    status?: number,
    olt_filter?: string | number,
    recurso_sp_filter?: string | number,
  ): Observable<PopsCli[]> {
    const route = `/clientes_coordenadas`;
    const token = this.authService.getToken();
    const idcidade = this.authService.getIdCity();

    const headers = new HttpHeaders()

    
    
      .set('Content-Type', 'application/json')
      
      .set('Authorization',`Bearer ${token}`);

      const body: Record<string, unknown> = {
        id_city: idcidade,
        tamanho: 1,
        id_condominio: id_condominio ?? 0,
        status: status ?? 1,
      };

      if (olt_filter !== undefined) {
        body['olt_filter'] = olt_filter;
      }
      if (recurso_sp_filter !== undefined) {
        body['recurso_sp_filter'] = recurso_sp_filter;
      }

      const url = `${this.baseUrl}${route}`; 


    return this.http.post<{ response: PopsCli[] }>(url, body, { headers }).pipe(
      map((payload) => payload?.response ?? []),
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError((err) => this.handleError(err)),
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro na requisição.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
    }

    return throwError(() => errorMessage);
  }
}
