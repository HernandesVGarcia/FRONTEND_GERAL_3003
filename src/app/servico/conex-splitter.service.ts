import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Boca1 } from '../modelo/Boca1';
import { ConexaoSplitter } from '../modelo/ConexaoSplitter';
import { Observable, throwError, map, firstValueFrom } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConexSplitterService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private transformarConexoes(dados: any, splitterNumero: number,splitterIdMeta:any): ConexaoSplitter[] {
    const conexoes: ConexaoSplitter[] = [];
    
    // Verificar se os dados estão no formato esperado (podem vir dentro de 'response')
    let dadosArray: Boca1[] = [];
    
    if (dados && Array.isArray(dados)) {
      dadosArray = dados;
    } else if (dados && dados.response && Array.isArray(dados.response)) {
      dadosArray = dados.response;
    } else {
      console.error('Formato de dados inválido para splitter:', dados);
      return conexoes; // Retorna array vazio se os dados estiverem em formato inválido
    }
    
    // Processar as conexões do splitter
    dadosArray.forEach(boca => {
      Object.entries(boca).forEach(([chave, valor]) => {
        if (valor && valor !== '=id()') {
          // Extrair os números da string "prop.bocaX_Y.label"
          const match = valor.match(/prop\.boca(\d+)_(\d+)\.label/);
          if (match) {
            const bocaDestino = parseInt(match[1]);
            const fibraDestino = parseInt(match[2]);
            
            conexoes.push({
              bocaOrigem: `Splitter${splitterIdMeta}`,
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

  selecionar(capacidade: number | undefined, idMetaSp: number | undefined): Observable<ConexaoSplitter[]> {
    if (!capacidade || !idMetaSp) {
      console.error('Capacidade ou ID META não definidos para splitter');
      return new Observable(subscriber => {
        subscriber.next([]);
        subscriber.complete();
      });
    }
    
    const token = this.authService.getToken();
    const route = `/conex_sp${capacidade}`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      idmeta: idMetaSp
    };

    const url = `${this.baseUrl}${route}`;
    console.log(`Requisitando conexões do splitter ${capacidade} com ID META ${idMetaSp} em: ${url}`);

    return this.http.post<any>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map(response => this.transformarConexoes(response, capacidade,idMetaSp)),
      catchError(this.handleError)
    );
  }

  // Método para permitir o uso de async/await
  async selecionarAsync(capacidade: number | undefined, idMetaSp: number | undefined): Promise<ConexaoSplitter[]> {
    try {
      if (!capacidade || !idMetaSp) {
        console.error('Capacidade ou ID META não definidos para splitter');
        return [];
      }
      
      console.log(`Iniciando selecionarAsync para splitter capacidade:${capacidade}, idMeta:${idMetaSp}`);
      return await firstValueFrom(this.selecionar(capacidade, idMetaSp));
    } catch (error) {
      console.error(`Erro ao carregar conexões do Splitter ${capacidade}:`, error);
      return [];
    }
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro na requisição de conexões de splitter:', error);
    let errorMessage = 'Ocorreu um erro na requisição.';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
    }
    
    return throwError(() => errorMessage);
  }
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



   