
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Boca1 } from '../modelo/Boca1';
import { ConexaoSplitter } from '../modelo/ConexaoSplitter';
import { Observable, throwError, forkJoin, of, map, firstValueFrom } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConexSpSpService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private transformarConexoesBc97(dados: any, idMetaCx: string): ConexaoSplitter[] {
    const conexoes: ConexaoSplitter[] = [];
    
    // Verificar se os dados estão no formato esperado (podem vir dentro de 'response')
    let dadosArray: Boca1[] = [];
    
    if (dados && Array.isArray(dados)) {
      dadosArray = dados;
    } else if (dados && dados.response && Array.isArray(dados.response)) {
      dadosArray = dados.response;
    } else {
      console.error('Formato de dados inválido para BC97:', dados);
      return conexoes; // Retorna array vazio se os dados estiverem em formato inválido
    }
    
    // Processar as conexões de saída do splitter - formato prop.splitterXXXXXX_Y.label
    dadosArray.forEach(boca => {
      Object.entries(boca).forEach(([chave, valor]) => {
        if (valor && valor !== '=id()') {
          // Extrair os números da string "prop.splitterXXXXXX_Y.label"
          const match = valor.match(/prop\.splitter(\d+)_(\d+)\.label/);
          if (match) {
            const splitterId = match[1];
            const fibraOrigem = parseInt(match[2]);
            
            conexoes.push({
              bocaOrigem: `Splitter${splitterId}`,
              fibraOrigem: `F${fibraOrigem}`,
              bocaDestino: `Splitter${splitterId}`,
              fibraDestino: chave
            });
          }
        }
      });
    });
    
    return conexoes;
  }

  private transformarConexoesBc98(dados: any, idMetaCx: string): ConexaoSplitter[] {
    const conexoes: ConexaoSplitter[] = [];
    
    // Verificar se os dados estão no formato esperado (podem vir dentro de 'response')
    let dadosArray: Boca1[] = [];
    
    if (dados && Array.isArray(dados)) {
      dadosArray = dados;
    } else if (dados && dados.response && Array.isArray(dados.response)) {
      dadosArray = dados.response;
    } else {
      console.error('Formato de dados inválido para BC98:', dados);
      return conexoes; // Retorna array vazio se os dados estiverem em formato inválido
    }
    
    // Processar as conexões de entrada do splitter - formato prop.splitter_eXXXXXX.label
    dadosArray.forEach(boca => {
      Object.entries(boca).forEach(([chave, valor]) => {
        if (valor && valor !== '=id()') {
          // Extrair os números da string "prop.splitter_eXXXXXX.label"
          const match = valor.match(/prop\.splitter_e(\d+)\.label/);
          if (match) {
            const splitterId = match[1];
            
            conexoes.push({
              bocaOrigem: `Splitter${splitterId}`,
              fibraOrigem: chave, // F1, F2, etc
              bocaDestino: `Splitter${splitterId}`,
              fibraDestino: `ENTRADA`
            });
          }
        }
      });
    });
    
    return conexoes;
  }

  private processarConexoesEntreSplitters(conexoesBc97: ConexaoSplitter[], conexoesBc98: ConexaoSplitter[]): ConexaoSplitter[] {
    const conexoesCombinadas: ConexaoSplitter[] = [];
    
    // Criar um mapa das origens (BC97) organizadas por posição da fibra
    const mapaOrigens: Record<string, ConexaoSplitter> = {};
    conexoesBc97.forEach(conn => {
      // Usar a fibraDestino (que é a posição F1, F2, etc.) como chave
      mapaOrigens[conn.fibraDestino] = conn;
    });
    
    // Criar um mapa dos destinos (BC98) organizadas por posição da fibra
    const mapaDestinos: Record<string, ConexaoSplitter> = {};
    conexoesBc98.forEach(conn => {
      // Usar a fibraOrigem (que é a posição F1, F2, etc.) como chave
      mapaDestinos[conn.fibraOrigem] = conn;
    });
    
    // Fazer o mapeamento correto: F1 da origem conecta com F1 do destino, etc.
    Object.keys(mapaOrigens).forEach(posicaoFibra => {
      const origem = mapaOrigens[posicaoFibra];
      const destino = mapaDestinos[posicaoFibra];
      
      if (origem && destino) {
        // Criar a conexão correta entre splitters diferentes
        conexoesCombinadas.push({
          bocaOrigem: origem.bocaOrigem,
          fibraOrigem: origem.fibraOrigem,
          bocaDestino: destino.bocaOrigem,
          fibraDestino: 'ENTRADA'
        });
      }
    });
    
    console.log(`====> Conexões mapeadas corretamente: ${conexoesCombinadas.length}`);
    return conexoesCombinadas;
  }

  selecionarConexoesEntreSplitters(idMetaCx: string | undefined): Observable<ConexaoSplitter[]> {
    if (!idMetaCx) {
      console.error('ID META da caixa não definido');
      return of([]);
    }
    
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      idmeta: idMetaCx
    };

    // URLs para ambas as requisições
    const urlBc97 = `${this.baseUrl}/conex_bc97`;
    const urlBc98 = `${this.baseUrl}/conex_bc98`;
    
    console.log(`Requisitando conexões de splitters para caixa com ID META ${idMetaCx} em: ${urlBc97} e ${urlBc98}`);

    // Fazendo requisições para ambas as rotas
    const reqBc97 = this.http.post<any>(urlBc97, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map(response => this.transformarConexoesBc97(response, idMetaCx)),
      catchError(error => {
        console.error('Erro ao consultar conex_bc97:', error);
        return of([]); // Retorna array vazio em caso de erro
      })
    );
    
    const reqBc98 = this.http.post<any>(urlBc98, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map(response => this.transformarConexoesBc98(response, idMetaCx)),
      catchError(error => {
        console.error('Erro ao consultar conex_bc98:', error);
        return of([]); // Retorna array vazio em caso de erro
      })
    );
    
    // Combinando os resultados das duas requisições
    return forkJoin([reqBc97, reqBc98]).pipe(
      map(([conexoesBc97, conexoesBc98]) => {
        console.log('====bc97 data:', conexoesBc97);
        console.log('====bc98 data:', conexoesBc98);
        
        // Processa as conexões para criar conexões combinadas entre splitters diferentes
        const conexoesProcessadas = this.processarConexoesEntreSplitters(conexoesBc97, conexoesBc98);
        
        console.log(`===============> Total de conexões entre splitters encontradas: ${conexoesProcessadas.length}`);
        return conexoesProcessadas;
      }),
      catchError(this.handleError)
    );
  }

  // Método para permitir o uso de async/await
  async selecionarConexoesEntreSplittersAsync(): Promise<ConexaoSplitter[]> {
    const idMetaCx = this.authService.getIDmetaCaixa();
    try {
      if (!idMetaCx) {
        console.error('ID META da caixa não definido');
        return [];
      }
      
      console.log(`Iniciando selecionarConexoesEntreSplittersAsync para caixa com ID META: ${idMetaCx}`);
      return await firstValueFrom(this.selecionarConexoesEntreSplitters(idMetaCx));
    } catch (error) {
      console.error(`Erro ao carregar conexões entre Splitters:`, error);
      return [];
    }
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro na requisição de conexões entre splitters:', error);
    let errorMessage = 'Ocorreu um erro na requisição.';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
    }
    
    return throwError(() => errorMessage);
  }
}
