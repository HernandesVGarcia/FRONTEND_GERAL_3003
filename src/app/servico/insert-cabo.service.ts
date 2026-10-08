import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * 🔧 Interface para resposta de insert_idmeta
 */
export interface InsertIdMetaResponse {
  id_meta: number;
  message?: string;
}

/**
 * 🔧 Interface para dados do cabo a ser inserido
 */
export interface InsertCaboData {
  capacidade: number;           // Ex: 48
  tubo: number;                 // Ex: 12
  Codigo: number;               // Ex: 1
  Label_cabo: string;           // Ex: "Cabo Principal"
  length: number;               // Comprimento em metros
  GOOGLE_LATLNG: Array<{lng: number, lat: number}>; // Array de coordenadas
  id_condominio?: number;       // Opcional, padrão 0
  id_importacao?: number;
}

/**
 * 🔧 Interface para resposta de insert_cabo
 */
export interface InsertCaboResponse {
  success: boolean;
  id_meta: number;
  message: string;
  tubosInseridos?: number[];
  affectedRows?: {
    cabopa: number;
    cabopb: number;
    cabom: number;
    tubos: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class InsertCaboService {

  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 15000; // 15 segundos (inserção pode demorar mais)
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * 📝 Insere um novo cabo na base de dados
   * 1. Obtém um novo id_meta
   * 2. Insere o cabo com esse id_meta
   * 
   * @param caboData - Dados do cabo a ser inserido
   * @returns Observable com resposta da inserção
   */
  inserirCabo(caboData: InsertCaboData): Observable<InsertCaboResponse> {
    console.log('🗺️ [INSERT-CABO] Iniciando inserção de cabo...', caboData);
    
    // Validar dados
    const validacao = this.validarDadosCabo(caboData);
    if (!validacao.valido) {
      console.error('🗺️ [INSERT-CABO] Dados inválidos:', validacao.erro);
      return throwError(() => new Error(validacao.erro || 'Dados inválidos'));
    }

    // Obter id_city do AuthService
    const idCity = this.authService.getIdCity();
    if (!idCity) {
      console.error('🗺️ [INSERT-CABO] ID da cidade não encontrado no AuthService');
      return throwError(() => new Error('ID da cidade não encontrado. Por favor, selecione uma cidade.'));
    }

    console.log('🗺️ [INSERT-CABO] ID da cidade:', idCity);

    // 1️⃣ PASSO 1: Obter novo id_meta
    return this.obterNovoIdMeta(
      idCity,
      caboData.id_condominio || 0,
      caboData.id_importacao,
    ).pipe(
      switchMap((responseIdMeta: InsertIdMetaResponse) => {
        const novoIdMeta = responseIdMeta.id_meta;
        console.log('🗺️ [INSERT-CABO] Novo id_meta obtido:', novoIdMeta);

        // 2️⃣ PASSO 2: Inserir o cabo com o id_meta obtido
        return this.inserirCaboComIdMeta(novoIdMeta, idCity, caboData);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * 🆕 Obtém um novo id_meta da API
   * 
   * @param idCity - ID da cidade
   * @param idCondominio - ID do condomínio (0 para fora de condomínio)
   * @returns Observable com o novo id_meta
   */
  private obterNovoIdMeta(
    idCity: number,
    idCondominio: number,
    idImportacao?: number,
  ): Observable<InsertIdMetaResponse> {
    const route = '/insert_idmeta';
    const url = `${this.baseUrl}${route}`;
    
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body: Record<string, unknown> = {
      Tipo_objeto: 'cabo',
      id_city: idCity,
      id_condominio: idCondominio,
    };
    if (idImportacao !== undefined && idImportacao !== null) {
      body['id_importacao'] = idImportacao;
    }

    console.log('🗺️ [INSERT-CABO] Requisitando novo id_meta...', body);

    return this.http.post<InsertIdMetaResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS)
    );
  }

  /**
   * 🆕 Insere o cabo na base de dados com o id_meta obtido
   * 
   * @param idMeta - ID meta do cabo
   * @param idCity - ID da cidade
   * @param caboData - Dados do cabo
   * @returns Observable com resposta da inserção
   */
  private inserirCaboComIdMeta(
    idMeta: number, 
    idCity: number, 
    caboData: InsertCaboData
  ): Observable<InsertCaboResponse> {
    const route = '/insert_cabo';
    const url = `${this.baseUrl}${route}`;
    
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      id_meta: idMeta,
      id_city: idCity,
      id_condominio: caboData.id_condominio || 0,
      capacidade: caboData.capacidade,
      Codigo: caboData.Codigo,
      tubo: caboData.tubo,
      Label_cabo: caboData.Label_cabo,
      VIRTUAL2: 0, // Sempre 0 para cabos desenhados
      length: caboData.length,
      GOOGLE_LATLNG: caboData.GOOGLE_LATLNG
    };

    console.log('🗺️ [INSERT-CABO] Inserindo cabo na base de dados...', body);

    return this.http.post<InsertCaboResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS)
    );
  }

  /**
   * 🔍 Valida os dados do cabo antes de inserir
   * 
   * @param caboData - Dados do cabo
   * @returns Objeto com resultado da validação
   */
  private validarDadosCabo(caboData: InsertCaboData): {valido: boolean, erro?: string} {
    if (!caboData) {
      return { valido: false, erro: 'Dados do cabo não fornecidos' };
    }

    if (!caboData.capacidade || caboData.capacidade <= 0) {
      return { valido: false, erro: 'Capacidade inválida' };
    }

    if (!caboData.tubo || caboData.tubo <= 0) {
      return { valido: false, erro: 'Tubo inválido' };
    }

    if (!caboData.Label_cabo || caboData.Label_cabo.trim() === '') {
      return { valido: false, erro: 'Label do cabo não pode ser vazio' };
    }

    if (!caboData.GOOGLE_LATLNG || caboData.GOOGLE_LATLNG.length < 2) {
      return { valido: false, erro: 'Cabo deve ter pelo menos 2 pontos' };
    }

    if (caboData.length <= 0) {
      return { valido: false, erro: 'Comprimento deve ser maior que zero' };
    }

    return { valido: true };
  }

  /**
   * 🔧 Converte string de capacidade para número
   * Ex: "48F" -> 48, "144F" -> 144
   * 
   * @param capacidadeStr - String da capacidade (ex: "48F")
   * @returns Número da capacidade
   */
  static converterCapacidadeParaNumero(capacidadeStr: string): number {
    if (!capacidadeStr) return 0;
    return parseInt(capacidadeStr.replace('F', '').trim(), 10) || 0;
  }

  /**
   * 🔧 Converte string de fibras por tubo para número
   * Ex: "12F" -> 12, "24F" -> 24
   * 
   * @param fibrasPorTuboStr - String de fibras por tubo (ex: "12F")
   * @returns Número de fibras por tubo
   */
  static converterFibrasPorTuboParaNumero(fibrasPorTuboStr: string): number {
    if (!fibrasPorTuboStr) return 12; // Padrão 12 fibras por tubo
    return parseInt(fibrasPorTuboStr.replace('F', '').trim(), 10) || 12;
  }

  /**
   * 🔧 Determina o código baseado no código de cores
   * 
   * @param codigoCores - Código de cores ('TIA/EIA 598' ou 'Telebras')
   * @returns Código numérico
   */
  static determinarCodigo(codigoCores: 'TIA/EIA 598' | 'Telebras'): number {
    // TIA/EIA 598 = 1, Telebras = 2
    return codigoCores === 'TIA/EIA 598' ? 1 : 2;
  }

  /**
   * ❌ Handler de erros HTTP
   */
  private handleError(error: HttpErrorResponse) {
    console.error('🗺️ [INSERT-CABO] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao inserir o cabo.';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      } else if (error.status === 401) {
        errorMessage = 'Não autorizado. Faça login novamente.';
      } else if (error.status === 500) {
        errorMessage = 'Erro no servidor ao inserir cabo.';
      } else {
        errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}

