import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
//import {Bocas} from '../modelo/Bocas';
import {Splitter} from '../modelo/Splitter';
import {Observable, throwError } from 'rxjs';
import { retry, timeout, catchError, map } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';


@Injectable({
  providedIn: 'root'
})
export class SplitterService {

  url:string = 'https://www.fiberworks-quantum.com:3001/splitter'
    private readonly TIMEOUT = 10000; // 10 segundos
    private readonly RETRY_ATTEMPTS = 2;
  
    constructor(
      private http:HttpClient,
      private authService : AuthService) {
          this.authService.refreshToken();
    }
     
  
    // Método para Selecionar Caixa
    
    selecionar():Observable<Splitter[]>{
      const token = this.authService.getToken();
      //const idcidade = this.authService.getIdCity();
      const idmetacx = this.authService.getIDmetaCaixa();
  
      const headers = new HttpHeaders()
  
      
  
  
      
        .set('Content-Type', 'application/json')
        //.set('Access-Control-Allow-Origin', '*')
        //.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
        //.set('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
        .set('Authorization',`Bearer ${token}`);
  
        const body = {
          ID_META_CAIXA:idmetacx
        };
  
  
      //return this.http.post<Splitter[]>(this.url,body,{ headers }).pipe(
      return this.http.post<{response: Splitter[]}>(this.url, body, { headers }).pipe(
        
        timeout(this.TIMEOUT),
        retry(this.RETRY_ATTEMPTS),

        map(response => {
          // Verificar se a resposta contém o campo 'response'
          if (response && response.response) {
            return response.response;
          }
          // Se não contiver, retornar um array vazio
          return [];
        }),



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

  // Método auxiliar para obter o tipo de componente splitter baseado no TIPO_SPLITTER
  getSplitterComponentType(tipoSplitter: number): string {
    switch(tipoSplitter) {
      case 1: return "splitterDesb"
      case 2: return "splitterDesb"
      case 3: return "splitterDesb"
      case 4: return "splitterDesb"
      case 5: return "splitterDesb"
      case 6: return "splitterDesb"
      case 7: return "splitterDesb"
      case 8: return "splitterDesb"
      case 9: return "splitterDesb"
      case 10: return "splitterDesb"
      case 11: return "splitterDesb"
      case 12: return "splitter12"; // 1:2
      case 13: return "splitter14"; // 1:4
      case 14: return "splitter18"; // 1:8
      case 15: return "splitter116"; // 1:16
      case 16: return "splitter132"; // 1:32
      case 17: return "splitter164"; // 1:64
      case 18: return "splitter1128"; // 1:128
      case 19: return "splitter1256"; // 1:256
      default: return "0"; // Padrão para tipo desconhecido
    }
  }

  // Método auxiliar para obter o nome do splitter baseado no TIPO_SPLITTER
  getSplitterName(tipoSplitter: number): string {
    switch(tipoSplitter) {
      case 1: return "1/99";
      case 2: return "2/98";
      case 3: return "5/95";
      case 4: return "10/90";
      case 5: return "15/85";
      case 6: return "20/80";
      case 7: return "25/75";
      case 8: return "30/70";
      case 9: return "35/65";
      case 10: return "40/60";
      case 11: return "45/55";
      case 12: return "1:2";
      case 13: return "1:4";
      case 14: return "1:8";
      case 15: return "1:16";
      case 16: return "1:32";
      case 17: return "1:64";
      case 18: return "1:128";
      case 19: return "1:256";
      default: return "Splitter Desconhecido";
    }
  }

  // Método auxiliar para obter atenuação do splitter baseado no TIPO_SPLITTER
  getSplitterAttenuation(tipoSplitter: number): number {
    switch(tipoSplitter) {
      case 12: return 3.7;
      case 13: return 7.1;
      case 14: return 10.5;
      case 15: return 13.7;
      case 16: return 17.1;
      case 17: return 20.5;
      case 18: return 23;
      case 19: return 26;
      default: return 0;
    }
  
}

}

