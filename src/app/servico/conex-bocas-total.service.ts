


import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Boca1 } from '../modelo/Boca1';
import { ConexaoBoca } from '../modelo/ConexaoBoca';
import { Observable, throwError, map,firstValueFrom } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConexBocasTotalService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  private transformarConexoes(dados: any, bocaNumero: number): ConexaoBoca[] {
    const conexoes: ConexaoBoca[] = [];
    
    // Verificar se os dados estão no formato esperado (podem vir dentro de 'response')
    let dadosArray: Boca1[] = [];
    
    if (dados && Array.isArray(dados)) {
      dadosArray = dados;
    } else if (dados && dados.response && Array.isArray(dados.response)) {
      dadosArray = dados.response;
    } else {
      console.error('Formato de dados inválido:', dados);
      return conexoes; // Retorna array vazio se os dados estiverem em formato inválido
    }
    

   // ========================================exemplo de resposta da API
   // {
   //   "response": [
   //       {
   //           "F1": "prop.boca2_8.label",
   //           "F2": "prop.boca2_9.label",
   //           "F3": "prop.boca2_10.label",
   //           "F4": "prop.boca2_11.label",
   //           "F5": "=id()",
   //           "F6": "=id()",
   //           "F7": "=id()",
   //           "F8": "=id()",
   //           "F9": "=id()",...



    dadosArray.forEach(boca => {
      Object.entries(boca).forEach(([chave, valor]) => { //F1='id()'  : F1 => chave  'id() =>valor
        if (valor && valor !== '=id()') {
          // Extrair os números da string "prop.bocaX_Y.label"
          const match = valor.match(/prop\.boca(\d+)_(\d+)\.label/);
          if (match) {
            const bocaDestino = parseInt(match[1]);
            const fibraDestino = parseInt(match[2]);
            
            conexoes.push({
              bocaOrigem: `Boca${bocaNumero}`,
              fibraOrigem: chave, // F1, F2, etc
              bocaDestino: `Boca${bocaDestino}`,
              fibraDestino: `F${fibraDestino}`
            });
          }
        }
      });
    });
    
    return conexoes;
  }

  selecionar(bocaNumero: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 99, capacite:number|undefined): Observable<ConexaoBoca[]> {
    const token = this.authService.getToken();
    const idmetacx = this.authService.getIDmetaCaixa();
    const route = `/conex_bc`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);


      if (!bocaNumero || !capacite) {
        return throwError(() => 'Boca e capacidade são obrigatórios');
      }

    const body = {
      idmeta: Number(idmetacx),
      capacidade:Number(capacite),
      boca:Number(bocaNumero)
    };

    const url = `${this.baseUrl}${route}`;

    return this.http.post<any>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map(response => this.transformarConexoes(response, bocaNumero)),
      catchError(this.handleError)
    );

  }

  // Método para permitir o uso de async/await
  async selecionarAsync(bocaNumero: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 99, capacite:number|undefined): Promise<ConexaoBoca[]> {
    try {
      return await firstValueFrom(this.selecionar(bocaNumero,capacite));
    } catch (error) {
      console.error(`Erro ao carregar conexões da Boca ${bocaNumero},:`,"capacidade:",capacite, error);
      return [];
    }

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
