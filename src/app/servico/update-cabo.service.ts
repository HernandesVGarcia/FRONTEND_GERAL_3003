import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/**
 * 🔧 Interface para dados de atualização do cabo
 */
export interface UpdateCaboData {
  id_meta: number;
  length: number;
  GOOGLE_LATLNG: Array<{lng: number, lat: number}>;
}

/**
 * 🔧 Interface para resposta de atualização do cabo
 */
export interface UpdateCaboResponse {
  success: boolean;
  id_meta: number;
  message: string;
  affectedRows?: number;
  length?: number;
  totalPontos?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateCaboService {

  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 15000; // 15 segundos
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * 📝 Atualiza a geometria de um cabo existente na base de dados
   * 
   * @param caboData - Dados do cabo a ser atualizado
   * @returns Observable com resposta da atualização
   */
  atualizarCabo(caboData: UpdateCaboData): Observable<UpdateCaboResponse> {
    console.log('🗺️ [UPDATE-CABO] Iniciando atualização de cabo...', caboData);
    
    // Validar dados
    const validacao = this.validarDadosCabo(caboData);
    if (!validacao.valido) {
      console.error('🗺️ [UPDATE-CABO] Dados inválidos:', validacao.erro);
      return throwError(() => new Error(validacao.erro || 'Dados inválidos'));
    }

    const route = '/update_geocabo';
    const url = `${this.baseUrl}${route}`;
    
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      id_meta: caboData.id_meta,
      length: caboData.length,
      GOOGLE_LATLNG: caboData.GOOGLE_LATLNG
    };

    console.log('🗺️ [UPDATE-CABO] Enviando requisição para API...', body);

    return this.http.post<UpdateCaboResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /**
   * 🔍 Valida os dados do cabo antes de atualizar
   * 
   * @param caboData - Dados do cabo
   * @returns Objeto com resultado da validação
   */
  private validarDadosCabo(caboData: UpdateCaboData): {valido: boolean, erro?: string} {
    if (!caboData) {
      return { valido: false, erro: 'Dados do cabo não fornecidos' };
    }

    if (!caboData.id_meta || caboData.id_meta <= 0) {
      return { valido: false, erro: 'ID do cabo (id_meta) inválido' };
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
   * 🧮 Extrai coordenadas de uma polyline do Google Maps
   * 
   * @param polyline - Polyline do Google Maps
   * @returns Array de coordenadas {lng, lat}
   */
  extrairCoordenadasPolyline(polyline: google.maps.Polyline): Array<{lng: number, lat: number}> {
    const path = polyline.getPath();
    const coordenadas: Array<{lng: number, lat: number}> = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordenadas.push({
        lng: point.lng(),
        lat: point.lat()
      });
    }
    
    console.log('📍 [UPDATE-CABO] Coordenadas extraídas:', coordenadas.length, 'pontos');
    return coordenadas;
  }

  /**
   * 📏 Calcula o comprimento de uma polyline usando Google Maps Geometry
   * 
   * @param polyline - Polyline do Google Maps
   * @returns Comprimento em metros
   */
  calcularComprimentoPolyline(polyline: google.maps.Polyline): number {
    const path = polyline.getPath();
    const comprimento = google.maps.geometry.spherical.computeLength(path);
    
    // Arredondar para 2 casas decimais
    return Math.round(comprimento * 100) / 100;
  }

  /**
   * ❌ Handler de erros HTTP
   */
  private handleError(error: HttpErrorResponse) {
    console.error('🗺️ [UPDATE-CABO] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao atualizar o cabo.';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      } else if (error.status === 401) {
        errorMessage = 'Não autorizado. Faça login novamente.';
      } else if (error.status === 404) {
        errorMessage = 'Cabo não encontrado na base de dados.';
      } else if (error.status === 500) {
        errorMessage = 'Erro no servidor ao atualizar cabo.';
      } else {
        errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}

