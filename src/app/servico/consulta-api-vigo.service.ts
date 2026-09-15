import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError, firstValueFrom } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ClienteVigoData, InserirClienteVigoService } from './inserir-cliente-vigo.service';
import { environment } from '../environments/environment';
import { ERP_VIGO } from './erp.constants';

export interface VigoStatusResponse {
  success: boolean;
  erpAtivo?: boolean;
  idErp?: number;
  idPolo?: number | string;
  tokenValido?: boolean;
  expiraEm?: string | null;
  error?: string;
}

export interface VigoClienteSyncItem {
  clienteId: string;
  data: ClienteVigoData;
}

export interface VigoSyncClientesResponse {
  success: boolean;
  idCIDADES?: number;
  idPolo?: number | string;
  codigoInicial?: number;
  codigosConsultados?: number;
  totalEncontrados?: number;
  vaziosConsecutivosFim?: number;
  clientes?: VigoClienteSyncItem[];
  error?: string;
  code?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultaApiVigoService {
  private readonly TIMEOUT = 300000;
  private baseUrl: string = environment.apiUrlAbsolute;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private inserirClienteVigoService: InserirClienteVigoService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  private async consultarStatus(): Promise<VigoStatusResponse> {
    const url = `${this.baseUrl}/consulta-vigo/status`;

    return firstValueFrom(
      this.http.get<VigoStatusResponse>(url, { headers: this.getAuthHeaders() }).pipe(
        timeout(this.TIMEOUT),
        catchError(this.handleError)
      )
    );
  }

  private async sincronizarClientes(idCIDADES: number, limite: number): Promise<VigoSyncClientesResponse> {
    const url = `${this.baseUrl}/consulta-vigo/sincronizar-clientes`;
    const body = { idCIDADES, limite };

    return firstValueFrom(
      this.http.post<VigoSyncClientesResponse>(url, body, { headers: this.getAuthHeaders() }).pipe(
        timeout(this.TIMEOUT),
        catchError(this.handleError)
      )
    );
  }

  async iniciarSyncClientes(): Promise<void> {
    console.log('🚀 [VIGO] Iniciando sync de clientes após login...');

    try {
      const idCity = this.authService.getIdCity();

      if (!idCity) {
        console.error('❌ [VIGO] ID da cidade não encontrado no authService');
        return;
      }

      const idErp = this.authService.getIdErp();
      if (idErp !== ERP_VIGO) {
        console.log(`⏭️ [VIGO] ID_ERP (${idErp}) não é VIGO (${ERP_VIGO}). Sync não executada.`);
        return;
      }

      const limite = environment.vigoSyncMaxClientes ?? 0;
      console.log(`🔍 [VIGO] Polo VIGO ativo. Sincronizando cidade ${idCity}${limite > 0 ? ` (limite: ${limite})` : ''}...`);

      const resultado = await this.sincronizarClientes(idCity, limite);

      if (!resultado.success) {
        console.error('❌ [VIGO] Erro na sincronização:', resultado.error);
        return;
      }

      const clientes = resultado.clientes ?? [];

      if (clientes.length === 0) {
        console.log('ℹ️ [VIGO] Nenhum cliente novo encontrado para inserir.');
        return;
      }

      console.log(`💾 [VIGO] ${clientes.length} cliente(s) encontrado(s). Iniciando inserts...`);

      let totalInseridos = 0;

      for (const item of clientes) {
        const clienteId = item.clienteId || String(item.data?.id ?? '');
        console.log(`💾 [VIGO] Inserindo cliente ${clienteId}...`);

        const insertResult = await this.inserirClienteVigoService.inserirCliente(item.data);

        if (insertResult.success) {
          totalInseridos++;
          console.log(`✅ [VIGO] Cliente ${clienteId} inserido. ID_META: ${insertResult.id_meta ?? 'N/A'}`);
        } else {
          console.error(`❌ [VIGO] Erro ao inserir cliente ${clienteId}:`, insertResult.error);
        }

        await this.aguardar(300);
      }

      if (totalInseridos > 0) {
        console.log(`✅ [VIGO] Processo concluído! ${totalInseridos} cliente(s) inserido(s).`);
      } else {
        console.log('ℹ️ [VIGO] Nenhum cliente foi inserido.');
      }
    } catch (error: any) {
      console.error('❌ [VIGO] Erro ao executar sync de clientes:', error);
    }
  }

  private aguardar(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [VIGO] Erro na requisição HTTP:', error);
    let errorMessage = 'Ocorreu um erro na requisição VIGO.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      if (error.error?.error) {
        errorMessage += ` - ${error.error.error}`;
      }
    }

    return throwError(() => errorMessage);
  }
}
