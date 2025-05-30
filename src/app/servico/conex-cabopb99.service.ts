import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Boca1 } from '../modelo/Boca1';
import { ConexaoBoca } from '../modelo/ConexaoBoca';
import { ConexaoSplitter } from '../modelo/ConexaoSplitter';
import { Observable, throwError, map,firstValueFrom, of, forkJoin } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConexCabopb99Service {

  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  //=======================================================================================================

  private transformarConexoesCab99(dados: any): ConexaoBoca[] {
    const conexoes: ConexaoBoca[] = [];
    console.log('---> 99 resultado da api para o serviço' ,dados);
    // Verificar se os dados estão no formato esperado (podem vir dentro de 'response')
    let dadosArray: Boca1[] = [];
    
    if (dados && Array.isArray(dados)) {
      dadosArray = dados;
    } else if (dados && dados.response && Array.isArray(dados.response)) {
      dadosArray = dados.response;
      console.log("< ======  > transformarCab99",dados);
    } else {
      console.error('Formato de dados inválido:', dados);
      return conexoes; // Retorna array vazio se os dados estiverem em formato inválido
    }
    
    dadosArray.forEach(boca => {
      Object.entries(boca).forEach(([chave, valor]) => { //F1='id()'  : F1 => chave  'id() =>valor
        if (valor && valor !== '=id()' && valor !== null) {
          // Extrair os números da string "TST290686!Pro.Row5.Label"
          const match = valor.match(/TST(\d+)!PROP\.ROW_5\.LABEL/);
          //const match = chave.match(/FIBRA_(\d+))LABEL)
          if (match) {
            const bocaOrigem = parseInt(match[1]);
            //const fibraDestino = parseInt(match[2]);
            
            conexoes.push({
              bocaOrigem: `Drop${bocaOrigem}`,
              fibraOrigem: `F1` ,// F1, F2, etc
              bocaDestino: `Splitter${bocaOrigem}`,
              fibraDestino: `cab99${chave}`
            });
          }
        }
      });
    });
    
    return conexoes;
  }

  //==============================================================================================


  //=======================================================================================================

  private transformarConexoesBc99(dados: any): ConexaoBoca[] {
    const conexoes: ConexaoBoca[] = [];
    console.log('---> 99 resultado da api para o serviço' ,dados);
    // Verificar se os dados estão no formato esperado (podem vir dentro de 'response')
    let dadosArray: Boca1[] = [];
    
    if (dados && Array.isArray(dados)) {
      dadosArray = dados;
    } else if (dados && dados.response && Array.isArray(dados.response)) {
      dadosArray = dados.response;
      console.log("< ======  > transformarBc99",dados);
    } else {
      console.error('Formato de dados inválido:', dados);
      return conexoes; // Retorna array vazio se os dados estiverem em formato inválido
    }
    
    dadosArray.forEach(boca => {
      Object.entries(boca).forEach(([chave, valor]) => { //F1='id()'  : F1 => chave  'id() =>valor
        if (valor && valor !== '=id()' && valor !== null) {
          // Extrair os números da string "prop.splitter185441_7.label"
          const match = valor.match(/prop\.splitter(\d+)_(\d+)\.label/);
          if (match) {
            const splitterId = match[1];
            const fibraDestino = parseInt(match[2]);
            
            conexoes.push({
              bocaOrigem: `Drop${splitterId}`,
              fibraOrigem: `F1` ,// F1, F2, etc
              bocaDestino: `Splitter${splitterId}`,
              fibraDestino: `F${fibraDestino}`
            });
          }
        }
      });
    });
    
    return conexoes;
  }





//============================================================================================================
  private processarConexoesEntreSplittersDrops(conexoesCab99: ConexaoBoca[], conexoesBc99: ConexaoBoca[]): ConexaoBoca[] {
    // Criar um mapeamento de todas as saídas de splitters (BC97)
    console.log('=== DEBUGANDO PROCESSAMENTO ===');
    console.log('Conexões CAB99:', conexoesCab99);
    console.log('Conexões BC99:', conexoesBc99);


     const conexoesCombinadas: ConexaoBoca[] = [];
    
    // Estratégia: conectar cada drop CAB99 com uma fibra específica do splitter BC99
    // Assumindo que queremos conectar sequencialmente
    
    conexoesCab99.forEach((dropCab99, index) => {
      // Pegar a fibra correspondente do BC99 (usando módulo para não ultrapassar o array)
      const fibraIndex = index % conexoesBc99.length;
      const saidaBc99 = conexoesBc99[fibraIndex];
      
      if (saidaBc99) {
        conexoesCombinadas.push({
          bocaOrigem: dropCab99.bocaOrigem,     // Drop409568, Drop409263, etc.
          fibraOrigem: dropCab99.fibraOrigem,   // F1
          bocaDestino: saidaBc99.bocaDestino,   // Splitter397712
          fibraDestino: saidaBc99.fibraDestino  // F1, F2, F3, etc.
        });
      }
    });
    
    console.log('=== RESULTADO FINAL ===');
    console.log('Conexões combinadas criadas:', conexoesCombinadas);
    console.log('Número de conexões:', conexoesCombinadas.length);
    //console.log('====> Conexões combinadas entre splitters:', conexoesCombinadas);
    
    // Se não encontramos nenhuma combinação, retornamos as conexões originais
    if (conexoesCombinadas.length === 0) {
      return [...conexoesCab99, ...conexoesBc99];
    }
    
    return conexoesCombinadas;
  }

  //==============================================================================================



  selecionar(idmetapb:string): Observable<ConexaoBoca[]> {
    const token = this.authService.getToken();
    const idmetacx = this.authService.getIDmetaCaixa();
    const route = `/conex_cabopb_${99}`;
    const route2 = `/conex_bc${99}`;

    const match = idmetapb.match(/cabo(\d+)A/);

    if (!match) {
    console.error('Formato inválido para idmetapb:', idmetapb);
    return of([]); // Retorna observable vazio
  }
    
    const idmetacabo  = parseInt(match[1]);

    console.log('imetacabopb:', idmetacabo);

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);



    const body_cabo = {
      idmeta: idmetacabo,
    };
    const body_caixa ={
      idmeta: idmetacx,
    };

    const urlCab99 = `${this.baseUrl}${route}`;
    const urlBc99 = `${this.baseUrl}${route2}`;

    const reqCab99 = this.http.post<any>(urlCab99, body_cabo, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map(response => this.transformarConexoesCab99(response)),
      catchError(error => {
        console.error('Erro ao consultar conex_cabopb_99:', error);
        return of([]); // Retorna array vazio em caso de erro
      }) 
      
    );


    const reqBc99 = this.http.post<any>(urlBc99, body_caixa, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map(response => this.transformarConexoesBc99(response)),
      catchError(error => {
        console.error('Erro ao consultar conex_bc99:', error);
        return of([]); // Retorna array vazio em caso de erro
      }) 
      
    );
    

    return forkJoin([reqCab99, reqBc99]).pipe(
          map(([conexoesCab99, conexoesBc99]) => {
            //console.log('====> Todas conexões da Boca 97 e 98 recebidas:', [...conexoesBc97, ...conexoesBc98]);
            
            // Processa as conexões para criar conexões combinadas entre splitters diferentes
            const conexoesProcessadas = this.processarConexoesEntreSplittersDrops(conexoesCab99, conexoesBc99);
            
            console.log(`Total de conexões entre splitters encontradas: ${conexoesProcessadas.length}`);
            return conexoesProcessadas;
          }),
          catchError(this.handleError)
        );
      }
  


  
  // ===============================================================Método para permitir o uso de async/await
  async selecionarAsync(idmetapb:string): Promise<ConexaoBoca[]> {
    try {
      return await firstValueFrom(this.selecionar(idmetapb));
    } catch (error) {
      console.error(`Erro ao carregar conexões do cabo Boca99 ${idmetapb}:`, error);
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

