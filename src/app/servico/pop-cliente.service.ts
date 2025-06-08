
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { popDrop } from '../modelo/popDrop'
import { Observable, throwError, map, of, firstValueFrom } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PopClienteService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService) 
    { }

  // Método original para um único ID (mantido para compatibilidade)
  //================================================================================================
  selecionar(idMeta: string | undefined): Observable<popDrop[]> {
    if (!idMeta) {
      console.error('ID META não definido para pop');
      return new Observable(subscriber => {
        subscriber.next([]);
        subscriber.complete();
      });
    }
    
    const token = this.authService.getToken();
    const route = `/pop`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      ID_META: idMeta
    };

    const url = `${this.baseUrl}${route}`;
    console.log(`*===> Requisitando cliente com ID META ${idMeta} em: ${url}`);

    return this.http.post<any>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map(response => {
        // ✅ CORREÇÃO: Extrai os dados da propriedade "response"
        console.log('========> POP Raw Response:', response);
        if (response && response.response && Array.isArray(response.response)) {
          console.log('========> POP Extracted Data:', response.response);
          return response.response as popDrop[];
        }
        console.log('========> POP No valid data found');
        return [];
      }),
      catchError(error => {
        console.error('Erro ao consultar pop:', error);
        return of([]); // Retorna array vazio em caso de erro
      })
    );
  }


  //============================================================================================
  async selecionarAsync(idMeta: string | undefined): Promise<popDrop[]> {
    try {
      if (!idMeta) {
        console.error('ID META não definido para pop');
        return [];
      }
      
      console.log(`Iniciando selecionarAsync para pop idMeta:${idMeta}`);
      return await firstValueFrom(this.selecionar(idMeta));
    } catch (error) {
      console.error(`Erro ao carregar pop:`, error);
      return [];
    }
  }

  // Método simplificado para múltiplos IDs (sequencial)
  //=============================================================================================
  async selecionarMultiplosAsync(idMetas: string[]): Promise<popDrop[]> {
    try {
      if (!idMetas || idMetas.length === 0) {
        console.error('Vetor de IDs META está vazio ou não definido');
        return [];
      }
      
      console.log(`Iniciando selecionarMultiplosAsync para ${idMetas.length} pops:`, idMetas);
      
      const todosDados: popDrop[] = [];
      
      // Faz as requisições sequenciais (uma após a outra)
      for (const idMeta of idMetas) {
        const dados = await this.selecionarAsync(idMeta);
        if (dados && dados.length > 0) {
          // Adiciona o ID_META aos dados para identificação
          const dadosComId = dados.map(item => ({
            ...item,
            ID_META_ORIGEM: idMeta
          }));
          todosDados.push(...dadosComId);
          console.log('=======>todos os pops',todosDados)
        }
      }
      
      return todosDados;
    } catch (error) {
      console.error(`Erro ao carregar múltiplos pops:`, error);
      return [];
    }
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro na requisição de pop:', error);
    let errorMessage = 'Ocorreu um erro na requisição.';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
    }
    
    return throwError(() => errorMessage);
  }
}
