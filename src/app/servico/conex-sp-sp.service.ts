
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


  //====================================================================================================================

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
              //fibraOrigem: chave, // F1, F2, etc
              fibraOrigem: `F${fibraOrigem}`, // F1, F2, etc
              bocaDestino: `Splitter${splitterId}`,
              fibraDestino: chave
            });
          }
        }
      });
    });
    
    return conexoes;
  }

  //==========================================================================================================

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
    
    //console.log('====> Conexões BC98:', conexoes);
    return conexoes;
  }


  //============================================================================================================
  private processarConexoesEntreSplitters(conexoesBc97: ConexaoSplitter[], conexoesBc98: ConexaoSplitter[]): ConexaoSplitter[] {
    // Criar um mapeamento de todas as saídas de splitters (BC97)
    const mapaSaidasSplitter: Record<string, ConexaoSplitter[]> = {};
    
    // Agrupar todas as conexões BC97 (saídas) por splitter
    conexoesBc97.forEach(conn => {
      const key = conn.bocaOrigem;
      if (!mapaSaidasSplitter[key]) {
        mapaSaidasSplitter[key] = [];
      }
      mapaSaidasSplitter[key].push(conn);
    });
    
    // Criar um mapeamento de todas as entradas de splitters (BC98)
    const mapaEntradasSplitter: Record<string, ConexaoSplitter[]> = {};
    
    // Agrupar todas as conexões BC98 (entradas) por splitter
    conexoesBc98.forEach(conn => {
      const key = conn.bocaOrigem;
      if (!mapaEntradasSplitter[key]) {
        mapaEntradasSplitter[key] = [];
      }
      mapaEntradasSplitter[key].push(conn);
    });
    
    // Agora criar conexões combinadas entre splitters
    const conexoesCombinadas: ConexaoSplitter[] = [];
    
    // Para cada splitter que tem saídas
    Object.entries(mapaSaidasSplitter).forEach(([splitterSaida, conexoesSaida]) => {
      // Para cada splitter que tem entradas
      Object.entries(mapaEntradasSplitter).forEach(([splitterEntrada, conexoesEntrada]) => {
        // Se são splitters diferentes
        if (splitterSaida !== splitterEntrada) {
          // Para cada conexão de saída
          conexoesSaida.forEach(saida => {
            // Para cada conexão de entrada
            conexoesEntrada.forEach(entrada => {
              // Criar uma conexão entre os splitters
              conexoesCombinadas.push({
                bocaOrigem: saida.bocaOrigem,
                fibraOrigem: saida.fibraOrigem,
                bocaDestino: entrada.bocaOrigem,
                fibraDestino: entrada.fibraDestino
              });
            });
          });
        }
      });
    });
    
    //console.log('====> Conexões combinadas entre splitters:', conexoesCombinadas);
    
    // Se não encontramos nenhuma combinação, retornamos as conexões originais
    if (conexoesCombinadas.length === 0) {
      return [...conexoesBc97, ...conexoesBc98];
    }
    
    return conexoesCombinadas;
  }
  //=============================================================================================================
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
        //console.log('====> Todas conexões da Boca 97 e 98 recebidas:', [...conexoesBc97, ...conexoesBc98]);
        
        // Processa as conexões para criar conexões combinadas entre splitters diferentes
        const conexoesProcessadas = this.processarConexoesEntreSplitters(conexoesBc97, conexoesBc98);
        
        console.log(`Total de conexões entre splitters encontradas: ${conexoesProcessadas.length}`);
        return conexoesProcessadas;
      }),
      catchError(this.handleError)
    );
  }

  // =========================================================Método para permitir o uso de async/await
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
