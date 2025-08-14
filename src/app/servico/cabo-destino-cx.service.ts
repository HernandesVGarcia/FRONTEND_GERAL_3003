
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Cabo_destino_CX } from '../modelo/Cabo_destino_CX';
import { firstValueFrom } from 'rxjs';
import { timeout, retry } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CaboDestinoCxService {

  private baseUrl: string = environment.apiUrlAbsolute;
  
  //url: string = 'https://www.fiberworks-api.com:3001/analisa-conexao'
  //===============================================
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 3;
  //===============================================

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }
 
  /**
   * Seleciona tipos de cabo por ID usando async/await
   */
  async selecionarAsync(id_meta: string, tabela_cab:string): Promise<Cabo_destino_CX[]> {
    try {
      const route = `/analisa-conexao`;
      const token = this.authService.getToken();      
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      const body = {
        tabela_cabo: tabela_cab,
        id_meta_cabo: id_meta,
        chave_user: this.authService.getUsuario(),
      };

      const url = `${this.baseUrl}${route}`; 
      
      console.log(`Enviando requisição para ${url} com id_meta=${id_meta}`);
      console.log(':',tabela_cab,':',id_meta,':',this.authService.getUsuario() )
      
      // Convertendo Observable para Promise usando firstValueFrom
      const response = await firstValueFrom(
        this.http.post<any>(url, body, { headers }).pipe(
          timeout(this.TIMEOUT),
          retry(this.RETRY_ATTEMPTS)
        )
      );
      
      //console.log(`Resposta bruta recebida:`, response);
      
      // Verifica se a resposta é um array ou se está dentro de um objeto 'response'
      let result: Cabo_destino_CX[];
      if (Array.isArray(response)) {
        result = response;
      } else if (response && response.response && Array.isArray(response.response)) {
        result = response.response;
     } else if (response && response.id_meta && response.tipo_objeto) {
        // This is the case you're seeing - successful analysis with destination info
        console.log(`Análise concluída para id_meta=${response.id_meta}, tipo=${response.tipo_objeto}`);
        return [{
          id_meta: response.id_meta,
          tipo_objeto: response.tipo_objeto
        }];
      } else if (response && response.success === false) {
        console.warn(`Análise falhou para id_meta=${id_meta}:`, response.message);
        return [];
      } else {
        console.error('Formato de resposta não esperado:', response);
        return [];
      }
      
      if (!result || result.length === 0) {
        console.warn(`Nenhum tipo de cabo encontrado para id_meta=${id_meta}`);
        return [];
      }
      
      console.log(`Tipos de cabo encontrados para id_meta=${id_meta}:`, result);
      return result;
    } catch (error) {
      console.error('Erro na requisição:', error);
      let errorMessage = 'Ocorreu um erro na requisição.';
      
      if (error instanceof HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
          // Erro do cliente
          errorMessage = `Erro: ${error.error.message}`;
        } else {
          // Erro do servidor
          errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
        }
      }
      
      console.error(errorMessage);
      return []; // Retorna array vazio em caso de erro
    }
  }
  
  /**
   * Método original que retorna Observable (mantido para compatibilidade)
   */
  
}
