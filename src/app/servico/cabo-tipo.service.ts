import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Cabo_tipo } from '../modelo/Cabo_tipo';
import { firstValueFrom } from 'rxjs';
import { timeout, retry } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Cabo_TipoService {

  private baseUrl: string = environment.apiUrlAbsolute;
  
  //url: string = 'https://www.fiberworks-quantum.com:3001/tipo_cabo'
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
  async selecionarAsync(id_meta_cabo: number): Promise<Cabo_tipo[]> {
    try {
      const route = `/tipo_cabo`;
      const token = this.authService.getToken();
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      const body = {
        id_meta: id_meta_cabo,
      };

      const url = `${this.baseUrl}${route}`; 
      
      console.log(`Enviando requisição para ${url} com id_meta=${id_meta_cabo}`);
      
      // Convertendo Observable para Promise usando firstValueFrom
      const response = await firstValueFrom(
        this.http.post<any>(url, body, { headers }).pipe(
          timeout(this.TIMEOUT),
          retry(this.RETRY_ATTEMPTS)
        )
      );
      
      //console.log(`Resposta bruta recebida:`, response);
      
      // Verifica se a resposta é um array ou se está dentro de um objeto 'response'
      let result: Cabo_tipo[];
      if (Array.isArray(response)) {
        result = response;
      } else if (response && response.response && Array.isArray(response.response)) {
        result = response.response;
      } else {
        console.error('Formato de resposta não esperado:', response);
        return [];
      }
      
      // Garante que o resultado é um array válido
      if (!result || result.length === 0) {
        console.warn(`Nenhum tipo de cabo encontrado para id_meta=${id_meta_cabo}`);
        return [];
      }
      
      // Log para debug
      console.log(`Tipos de cabo encontrados para id_meta=${id_meta_cabo}:`, result);
      
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
  selecionar(id_meta_cabo: number) {
    const route = `/tipo_cabo`;
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      id_meta: id_meta_cabo,
    };

    const url = `${this.baseUrl}${route}`;
    
    return this.http.post<Cabo_tipo[]>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS)
    );
  }
}
