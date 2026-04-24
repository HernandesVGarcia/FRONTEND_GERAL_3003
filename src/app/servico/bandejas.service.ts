import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import {Bandejas} from '../modelo/Bandejas';
import {Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BandejasService {

  private baseUrl: string = environment.apiUrlAbsolute;

  //url:string = 'https://www.fiberworks-quantum.com:3001/bandejas'
    private readonly TIMEOUT = 10000; // 10 segundos
    private readonly RETRY_ATTEMPTS = 2;
  
    constructor(
      
      private http:HttpClient,
      private authService : AuthService) {
          this.authService.refreshToken();
    }
     
  
    // Método para Selecionar Caixa
    
    selecionar():Observable<Bandejas[]>{
      const route = `/bandejas`;
      const token = this.authService.getToken();
      const idcidade = this.authService.getIdCity();
      const idmetadio = this.authService.getIDmetaDio();
      return this.postBandejas(route, token, idcidade, idmetadio);
  }

  /**
   * POST /bandejas com cidade e DIO explícitos (ex.: modal Bandeja / gojs-dio).
   */
  selecionarPorDio(idcidades: number, idmeta: number): Observable<Bandejas[]> {
    const route = `/bandejas`;
    const token = this.authService.getToken();
    return this.postBandejas(route, token, idcidades, idmeta);
  }

  private postBandejas(
    route: string,
    token: string | null,
    idcidades: number | null,
    /** Compatível com `getIDmetaDio()` (string) e chamadas explícitas (number). */
    idmeta: number | string | null,
  ): Observable<Bandejas[]> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      idcidades,
      idmeta,
    };

    const url = `${this.baseUrl}${route}`;

    return this.http.post<Bandejas[]>(url, body, { headers }).pipe(
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
