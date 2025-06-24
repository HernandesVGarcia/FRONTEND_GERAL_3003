import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import {Splitter} from '../modelo/Splitter';
import {Observable, throwError,tap } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';

export interface UpdateCoordenadasResponse {
  response: any;
  message: string;
  affectedRows: number;
}


@Injectable({
  providedIn: 'root'
})
export class UpdateSplitterXYService {

  url:string = 'https://www.fiberworks-quantum.com:3001/update_splitterxy'
    private readonly TIMEOUT = 10000; // 10 segundos
    private readonly RETRY_ATTEMPTS = 2;
  
    constructor(
      private http:HttpClient,
      private authService : AuthService) {
          this.authService.refreshToken();
    }
     
  
    // Método para Selecionar Caixa
    
    atualizar(BCX:number,BCY:number,IDMETASP:number):Observable<UpdateCoordenadasResponse>{
      
      const token = this.authService.getToken();
      //const idcidade = this.authService.getIdCity();
      // const idmetacx = this.authService.getIDmetaCaixa();
      //console.log('X:' , BCX, 'Y:', BCY, 'BOCA:', BC, 'CAIXA:',idmetacx )
    console.log('=== INÍCIO DA REQUISIÇÃO ===');
    console.log('URL:', this.url);
    console.log('Token:', token ? 'Token presente' : 'Token ausente');
    //console.log('ID Meta Caixa:', idmetacx);
    console.log('Coordenadas - X:', BCX, 'Y:', BCY, 'IDMETASP:', IDMETASP);

    if (!token) {
      console.error('ERRO: Token não encontrado');
      return throwError(() => 'Token de autenticação não encontrado');
    }

    if (!IDMETASP) {
      console.error('ERRO: ID meta SPLITTER não encontrado');
      return throwError(() => 'ID da meta SPLITTER não encontrado');
    }
  
      const headers = new HttpHeaders()
  
        
      
        .set('Content-Type', 'application/json')
        .set('Authorization',`Bearer ${token}`);
  
        const body = {
          
          
          IDMETA:IDMETASP,
          X:BCX,
          Y:BCY,
          

        };

        console.log('Headers:', headers.keys());
        console.log('Body da requisição:', body);
    console.log('=== ENVIANDO REQUISIÇÃO ===');
  
  
      return this.http.post<UpdateCoordenadasResponse>(this.url,body,{ headers }).pipe(
        tap((response: any) => {
        console.log('=== RESPOSTA RECEBIDA ===');
        console.log('Resposta da API:', response);
      }),
        timeout(this.TIMEOUT),
        retry(this.RETRY_ATTEMPTS),
        catchError(this.handleError),
        
        
      );
      
  }
  
  private handleError = (error: HttpErrorResponse) => {
    console.error('=== ERRO NA REQUISIÇÃO ===');
    console.error('Tipo do erro:', error.constructor.name);
    console.error('Status:', error.status);
    console.error('Status Text:', error.statusText);
    console.error('URL:', error.url);
    console.error('Erro completo:', error);
    
    let errorMessage = 'Ocorreu um erro ao atualizar as coordenadas SPLITTER.';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente (rede, etc)
      console.error('Erro do cliente:', error.error.message);
      errorMessage = `Erro de rede: ${error.error.message}`;
    } else {
      // Erro do servidor
      console.error('Erro do servidor - Body:', error.error);
      switch (error.status) {
        case 0:
          errorMessage = 'Erro de conexão: Verifique se a API está rodando e acessível.';
          break;
        case 400:
          errorMessage = 'Dados inválidos enviados para a API.';
          break;
        case 401:
          errorMessage = 'Token de autenticação inválido.';
          break;
        case 404:
          errorMessage = 'Rota da API não encontrada. Verifique a URL.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor.';
          break;
        default:
          errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      }
    }
    
    return throwError(() => errorMessage);
  }
}
    
   