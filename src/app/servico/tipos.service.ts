import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface TipoResponse {
  success: boolean;
  tipo: string;
  count: number;
  data: any[];
}

@Injectable({
  providedIn: 'root'
})
export class TiposService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  /**
   * Busca tipos de objetos (caixa, splitter, rack, etc.)
   * @param tipo - Tipo do objeto: 'caixa', 'splitter', 'rack', 'equipamento', 'poste', 'conector'
   * @returns Observable com a lista de tipos
   */
  buscarTipos(tipo: string): Observable<TipoResponse> {
    const route = `/tipos/${tipo}`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    return this.http.get<TipoResponse>(url, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /**
   * Busca tipos de caixa especificamente
   * @returns Observable com a lista de tipos de caixa
   */
  buscarTiposCaixa(): Observable<TipoResponse> {
    return this.buscarTipos('caixa');
  }

  /**
   * Busca tipos de splitter especificamente
   * @returns Observable com a lista de tipos de splitter
   */
  buscarTiposSplitter(): Observable<TipoResponse> {
    return this.buscarTipos('splitter');
  }

  /**
   * Busca tipos de rack especificamente
   * @returns Observable com a lista de tipos de rack
   */
  buscarTiposRack(): Observable<TipoResponse> {
    return this.buscarTipos('rack');
  }

  /**
   * Busca tipos de equipamento especificamente
   * @returns Observable com a lista de tipos de equipamento
   */
  buscarTiposEquipamento(): Observable<TipoResponse> {
    return this.buscarTipos('equipamento');
  }

  /**
   * Busca tipos de poste especificamente
   * @returns Observable com a lista de tipos de poste
   */
  buscarTiposPoste(): Observable<TipoResponse> {
    return this.buscarTipos('poste');
  }

  /**
   * Busca tipos de conector especificamente
   * @returns Observable com a lista de tipos de conector
   */
  buscarTiposConector(): Observable<TipoResponse> {
    return this.buscarTipos('conector');
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro na requisição de tipos:', error);
    let errorMessage = 'Ocorreu um erro ao buscar os tipos.';

    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
    }

    return throwError(() => errorMessage);
  }
}

