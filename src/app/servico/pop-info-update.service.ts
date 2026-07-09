import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, retry, timeout, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { PopsInfo } from '../modelo/PopsInfo';

/** Evento emitido quando um cliente é atualizado (ex.: SIGLA alterada) */
export interface ClienteAtualizadoEvent {
  id_meta: number;
  sigla: string;
}

/** Formato esperado pela API update_cliente */
interface UpdateClienteApiBody {
  ID_META: number;
  SIGLA?: string;
  CONTRATO?: string;
  ID_CONTRATO?: string | number;
  LOGRADOURO?: string;
  NUMERO?: string;
  BAIRRO?: string;
  COMPLEMENTO?: string;
  CONTATO?: string;
  TELEFONE?: string;
  OBSERVACAO?: string;
  CPF_CNPJ?: string;
}

interface PopInfoUpdateResponse {
  success: boolean;
  message: string;
  data?: PopsInfo;
}

@Injectable({
  providedIn: 'root'
})
export class PopInfoUpdateService {
  private readonly TIMEOUT = 15000; // 15 segundos para operações de update
  private readonly RETRY_ATTEMPTS = 2;
  private baseUrl: string = environment.apiUrlAbsolute;

  private clienteAtualizado$ = new Subject<ClienteAtualizadoEvent>();

  /** Observable para escutar quando um cliente é atualizado (ex.: SIGLA alterada no modal) */
  readonly onClienteAtualizado = this.clienteAtualizado$.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Atualiza as informações do POP/cliente.
   * A rota utilizada será definida conforme especificação da API.
   */
  updatePopInfo(id_meta: number, updateData: Partial<PopsInfo>): Observable<PopInfoUpdateResponse> {
    const route = `/update_cliente`;
    const token = this.authService.getToken();

    if (!token) {
      console.error('Token não disponível para autenticação');
      return throwError(() => 'Token de autenticação não disponível. Faça login novamente.');
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    const body: UpdateClienteApiBody = {
      ID_META: id_meta,
      SIGLA: updateData.SIGLA,
      CONTRATO: updateData.CONTRATO_GPON,
      ID_CONTRATO: this.normalizarIdContrato(updateData.id_contrato),
      LOGRADOURO: updateData.ENDERECO,
      NUMERO: updateData.NUMERO,
      BAIRRO: updateData.BAIRRO,
      COMPLEMENTO: updateData.COMPLEMENTO,
      CONTATO: updateData.CONTATO,
      TELEFONE: updateData.TELEFONE,
      OBSERVACAO: updateData.OBS,
      CPF_CNPJ: updateData.CNPJ
    };

    console.log('Enviando atualização para:', url);
    console.log('Dados a serem atualizados:', body);

    return this.http.post<PopInfoUpdateResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map(response => {
        console.log('Resposta da atualização:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    console.error('Erro ao atualizar informações do POP/cliente:', error);
    let errorMessage = 'Ocorreu um erro ao atualizar as informações.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;

      if (error.status === 401) {
        errorMessage = 'Autenticação falhou. Por favor, faça login novamente.';
      } else if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão de rede.';
      } else if (error.status === 403) {
        errorMessage = 'Você não tem permissão para atualizar este recurso.';
      } else if (error.status === 404) {
        errorMessage = 'Rota de atualização não encontrada no servidor.';
      } else if (error.status === 400) {
        errorMessage = 'Dados inválidos enviados para atualização.';
      } else if (error.status === 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
      }
    }

    return throwError(() => errorMessage);
  }

  /** Emite evento quando um cliente foi atualizado (para atualizar marcador no mapa) */
  emitClienteAtualizado(event: ClienteAtualizadoEvent): void {
    this.clienteAtualizado$.next(event);
  }

  private normalizarIdContrato(valor: string | number | null | undefined): string {
    if (valor === undefined || valor === null) {
      return '0';
    }
    const texto = String(valor).trim();
    return texto === '' ? '0' : texto;
  }
}
