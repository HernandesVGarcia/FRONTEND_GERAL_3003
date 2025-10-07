import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { retry, timeout, catchError, takeUntil, map } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';

// Interfaces para as consultas dinâmicas
export interface QueryConexRequest {
  query: string;
  params: { [key: string]: any };
}

export interface QueryConexResponse {
  success: boolean;
  data: any[];
  error?: string;
}

export interface IdmetaByVisualRequest {
  tabelaCabo: string;
  nomeCabo: string;
}

export interface IdmetaByVisualResponse {
  success: boolean;
  idmeta: number;
  error?: string;
}

export interface RegistroByIdmetaRequest {
  tabela: string;
  idmeta: number;
  registro: string;
}

export interface RegistroByIdmetaResponse {
  success: boolean;
  valor: string;
  error?: string;
}

export interface FiberConnectedRequest {
  tabela: string;
  idmeta: number;
  fiber: number;
}

export interface FiberConnectedResponse {
  success: boolean;
  fiber: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FiberApiService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;
  private cancelSubject = new Subject<void>();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.refreshToken();
  }

  /**
   * Cancela todas as operações em andamento
   */
  cancelAllOperations(): void {
    console.log('🛑 [API-SERVICE] Cancelando todas as operações HTTP');
    this.cancelSubject.next();
  }

  /**
   * Verifica se as operações foram canceladas
   */
  private isCancelled(): boolean {
    return this.cancelSubject.closed;
  }

  /**=========================================API====QUERY DINAMICA===================================================
   * 1. Consulta dinâmica genérica - baseada na consulta principal do VB6
   * SELECT {regist} as registro from {TABELA} where idmeta = {idmeta}
   */
  executeDynamicQuery(query: string, params: { [key: string]: any }): Observable<QueryConexResponse> {
    const route = `/query-conex`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body: QueryConexRequest = {
      query: query,
      params: params
    };

    const url = `${this.baseUrl}${route}`;

    return this.http.post<QueryConexResponse>(url, body, { headers }).pipe(
      takeUntil(this.cancelSubject),
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /**=======================================API=========================================================
   * 2. Buscar IDMETA por nome visual - baseada na consulta do VB6
   * SELECT ID_META from {TABELACABO} where id_VISIO = '{NOMECABO}'
   */
  getIdmetaByVisualName(tabelaCabo: string, nomeCabo: string): Observable<IdmetaByVisualResponse> {
    const route = `/query-conex/idmeta-visual`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      tabelaCabo: tabelaCabo,
      nomeCabo: nomeCabo
    };

    const url = `${this.baseUrl}${route}`;

    return this.http.post<IdmetaByVisualResponse>(url, body, { headers }).pipe(
      takeUntil(this.cancelSubject),
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(error => {
        console.error('Erro ao buscar IDMETA por nome visual:', error);
        return throwError(() => error);
      })
    );
  }

  /**========================================API=========================================================
   * 3. Buscar registro por IDMETA - baseada na consulta do VB6
   * SELECT {regist} as registro from {TABELA} where idmeta = {idmeta}
   */
  getRegistroByIdmeta(tabela: string, idmeta: number, registro: string): Observable<RegistroByIdmetaResponse> {
    const route = `/query-conex/registro-idmeta`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      tabela: tabela,
      idmeta: idmeta,
      registro: registro
    };

    const url = `${this.baseUrl}${route}`;

    return this.http.post<RegistroByIdmetaResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(error => {
        console.error('Erro ao buscar registro por IDMETA:', error);
        return throwError(() => error);
      })
    );
  }

  /**=========================================API=======================================================
   * 4. Buscar fibra conectada - baseada na consulta do VB6
   * SELECT FN{FIBER} as fiber from {TABELA} where idmeta = {idmeta}
   */
  getFiberConnected(tabela: string, idmeta: number, fiber: number): Observable<FiberConnectedResponse> {
    const route = `/query-conex/fiber-connected`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      tabela: tabela,
      idmeta: idmeta,
      fiber: fiber
    };

    const url = `${this.baseUrl}${route}`;

    return this.http.post<FiberConnectedResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(error => {
        console.error('Erro ao buscar fibra conectada:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * 🗺️ NOVO: Buscar capacidade do cabo por IDMETA
   * SELECT capacidade FROM tstmeta.cabopa WHERE id_meta = {idMeta}
   */
  getCapacidadeCabo(idMeta: number): Observable<string> {
    const query = `SELECT capacidade FROM tstmeta.cabopa WHERE id_meta = ${idMeta}`;
    console.log(`🗺️ [API-CAPACIDADE] Consultando capacidade do cabo ${idMeta}: ${query}`);
    
    return this.executeDynamicQuery(query, {}).pipe(
      map(response => {
        if (response.success && response.data && response.data.length > 0) {
          const capacidade = response.data[0].capacidade;
          console.log(`🗺️ [API-CAPACIDADE] Capacidade encontrada para cabo ${idMeta}: ${capacidade}`);
          return capacidade;
        } else {
          console.warn(`🗺️ [API-CAPACIDADE] Capacidade não encontrada para cabo ${idMeta}`);
          return 'unknown';
        }
      }),
      catchError(error => {
        console.error(`🗺️ [API-CAPACIDADE] Erro ao consultar capacidade do cabo ${idMeta}:`, error);
        return throwError(() => error);
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro na requisição FiberApi:', error);
    let errorMessage = 'Ocorreu um erro na requisição de API.';
    
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
