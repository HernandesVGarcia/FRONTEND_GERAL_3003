import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError, firstValueFrom } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface ClienteVigoData {
  id?: number | string;
  nome?: string;
  cpfcgc?: string;
  endereco?: string;
  bairro?: string;
  cep?: string;
  celular?: string;
  telefone?: string;
  cidade?: string;
  uf?: string;
  obs?: string;
  situacao?: string;
  latitude?: string | number;
  longitude?: string | number;
}

interface ClienteInsertRequest {
  CONTRATO_GPON: string;
  id_contrato: string;
  id_autenticacao: string;
  CNPJ: string;
  SIGLA: string;
  ENDEREÇO: string;
  NUMERO: string;
  COMPLEMENTO: string;
  BAIRRO: string;
  CEP: string;
  TELEFONE: string;
  id_city: number;
  id_condominio: number;
  OBS: string;
  LAT: string | number | null;
  LNG: string | number | null;
  TAMANHO: string;
  STATUS: string;
  POP_ESTACAO?: number;
  ID_PROJETISTA?: number;
}

export interface ClienteInsertResponse {
  success: boolean;
  message?: string;
  id_meta?: number;
  id_estacao?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InserirClienteVigoService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 30000;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private valorComFallback(primario: unknown, fallback: unknown): string {
    const primarioTexto = primario !== undefined && primario !== null ? String(primario).trim() : '';
    if (primarioTexto !== '') {
      return primarioTexto;
    }

    const fallbackTexto = fallback !== undefined && fallback !== null ? String(fallback).trim() : '';
    return fallbackTexto;
  }

  private valorCoordenada(primario: unknown, fallback: unknown): string | number | null {
    const valor = this.valorComFallback(primario, fallback);
    if (valor === '' || valor === '0' || valor === '0.0000000000000') {
      return null;
    }
    return valor;
  }

  private montarObs(obs?: string, cidade?: string): string {
    const obsTexto = obs?.trim() ?? '';
    const cidadeTexto = cidade?.trim() ?? '';

    if (obsTexto && cidadeTexto) {
      return `${obsTexto} - ${cidadeTexto}`;
    }

    return obsTexto || cidadeTexto;
  }

  private mapearStatusVigo(situacao?: string): string {
    return situacao?.trim().toUpperCase() === 'L' ? '1' : '0';
  }

  private montarEnderecoGeocode(data: ClienteVigoData): string {
    const partes = [
      data.endereco?.trim(),
      data.bairro?.trim(),
      data.cidade?.trim(),
      data.uf?.trim(),
      data.cep?.trim()
    ].filter((parte): parte is string => !!parte && parte.length > 0);

    if (partes.length === 0) {
      return '';
    }

    return `${partes.join(', ')}, Brasil`;
  }

  private geocodeEndereco(address: string): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      const g = typeof google !== 'undefined' ? google : undefined;

      if (!g?.maps?.Geocoder) {
        console.warn('⚠️ [VIGO-GEOCODE] Geocoder não disponível (Maps JS não carregado).');
        resolve(null);
        return;
      }

      const geocoder = new g.maps.Geocoder();
      geocoder.geocode(
        {
          address,
          region: 'BR',
          componentRestrictions: { country: 'BR' }
        },
        (results, status) => {
          if (status === 'OK' && results?.[0]?.geometry?.location) {
            const loc = results[0].geometry.location;
            resolve({ lat: loc.lat(), lng: loc.lng() });
            return;
          }

          console.warn(`⚠️ [VIGO-GEOCODE] Falha ao geocodificar (${status}):`, address);
          resolve(null);
        }
      );
    });
  }

  transformarDadosVigo(data: ClienteVigoData, idCity: number, idCondominio: number = 0): ClienteInsertRequest {
    const contratoGpon = data.id !== undefined && data.id !== null ? String(data.id).trim() : '';

    return {
      CONTRATO_GPON: contratoGpon,
      id_contrato: '0',
      id_autenticacao: '0',
      CNPJ: data.cpfcgc?.trim() ?? '',
      SIGLA: data.nome?.trim() ?? '',
      ENDEREÇO: data.endereco?.trim() ?? '',
      NUMERO: '',
      COMPLEMENTO: '',
      BAIRRO: data.bairro?.trim() ?? '',
      CEP: data.cep?.trim() ?? '',
      TELEFONE: this.valorComFallback(data.celular, data.telefone),
      id_city: idCity,
      id_condominio: idCondominio,
      OBS: this.montarObs(data.obs, data.cidade),
      LAT: this.valorCoordenada(data.latitude, null),
      LNG: this.valorCoordenada(data.longitude, null),
      TAMANHO: '1',
      STATUS: this.mapearStatusVigo(data.situacao),
      POP_ESTACAO: 0,
      ID_PROJETISTA: 555
    };
  }

  async inserirCliente(data: ClienteVigoData, idCondominio: number = 0): Promise<ClienteInsertResponse> {
    try {
      const idCity = this.authService.getIdCity();

      if (!idCity) {
        const error = 'ID da cidade não encontrado no authService';
        console.error('❌ [INSERIR-CLIENTE-VIGO]', error);
        return { success: false, error };
      }

      const dadosTransformados = this.transformarDadosVigo(data, idCity, idCondominio);

      if (dadosTransformados.LAT != null && dadosTransformados.LNG != null) {
        console.log('📍 [VIGO-GEOCODE] Usando coordenadas do VIGO:', {
          LAT: dadosTransformados.LAT,
          LNG: dadosTransformados.LNG
        });
      } else {
        const endereco = this.montarEnderecoGeocode(data);

        if (!endereco) {
          console.warn('⚠️ [VIGO-GEOCODE] Sem coordenadas e sem endereço — insert só em estações.');
        } else {
          console.log('🔍 [VIGO-GEOCODE] Sem coordenadas VIGO. Geocodificando:', endereco);
          const coords = await this.geocodeEndereco(endereco);

          if (coords) {
            dadosTransformados.LAT = coords.lat;
            dadosTransformados.LNG = coords.lng;
            const obsGeocode = 'Coordenada inserida por consulta de endereço na integração.';
            dadosTransformados.OBS = dadosTransformados.OBS?.trim()
              ? `${dadosTransformados.OBS.trim()} - ${obsGeocode}`
              : obsGeocode;
            console.log('✅ [VIGO-GEOCODE] Coordenadas obtidas via Google:', coords);
          } else {
            console.warn('⚠️ [VIGO-GEOCODE] Geocode falhou — insert só em estações.');
          }
        }
      }

      console.log('🔄 [INSERIR-CLIENTE-VIGO] Dados transformados:', dadosTransformados);

      return await this.enviarInsert(dadosTransformados);
    } catch (error: any) {
      console.error('❌ [INSERIR-CLIENTE-VIGO] Erro ao inserir cliente:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido ao inserir cliente VIGO'
      };
    }
  }

  private async enviarInsert(dadosTransformados: ClienteInsertRequest): Promise<ClienteInsertResponse> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}/insert_cliente`; // URL da API para inserir o cliente

    const response = await firstValueFrom(
      this.http.post<ClienteInsertResponse>(url, dadosTransformados, { headers }).pipe(
        timeout(this.TIMEOUT),
        catchError(this.handleError)
      )
    );

    if (response.success) {
      console.log('✅ [INSERIR-CLIENTE-VIGO] Cliente inserido com sucesso:', response);
      return response;
    }

    console.error('❌ [INSERIR-CLIENTE-VIGO] Erro na inserção:', response.error);
    return {
      success: false,
      error: response.error || 'Erro desconhecido ao inserir cliente'
    };
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [INSERIR-CLIENTE-VIGO] Erro na requisição HTTP:', error);
    let errorMessage = 'Ocorreu um erro ao inserir o cliente VIGO.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      if (error.error && error.error.error) {
        errorMessage += ` - ${error.error.error}`;
      }
    }

    return throwError(() => errorMessage);
  }
}
