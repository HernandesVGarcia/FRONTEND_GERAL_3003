import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, retry, timeout, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { PopsInfo } from '../modelo/PopsInfo';

/** Evento emitido quando uma estação é atualizada (ex.: SIGLA alterada) */
export interface EstacaoAtualizadoEvent {
  id_meta: number;
  sigla: string;
}

/** Formato esperado pela API update_estacao */
interface UpdateEstacaoApiBody {
  ID_META: number;
  SIGLA?: string;
  LOGRADOURO?: string;
  NUMERO?: string;
  BAIRRO?: string;
  COMPLEMENTO?: string;
  CONTATO?: string;
  TELEFONE?: string;
  OBSERVACAO?: string;
}

interface PopEstacaoUpdateResponse {
  success: boolean;
  message: string;
  data?: PopsInfo;
}

@Injectable({
  providedIn: 'root'
})
export class PopInfoEstacaoUpdateService {
  private readonly TIMEOUT = 15000; // 15 segundos para operações de update
  private readonly RETRY_ATTEMPTS = 2;
  private baseUrl: string = environment.apiUrlAbsolute;

  private estacaoAtualizado$ = new Subject<EstacaoAtualizadoEvent>();

  /** Observable para escutar quando uma estação é atualizada (ex.: SIGLA alterada no modal) */
  readonly onEstacaoAtualizado = this.estacaoAtualizado$.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Atualiza as informações da estação.
   * Rota: /update_estacao. Campo obrigatório: SIGLA.
   */
  updateEstacaoInfo(id_meta: number, updateData: Partial<PopsInfo>): Observable<PopEstacaoUpdateResponse> {
    const route = `/update_estacao`;
    const token = this.authService.getToken();

    if (!token) {
      console.error('[POP-ESTACAO-UPDATE] Token não disponível para autenticação');
      return throwError(() => 'Token de autenticação não disponível. Faça login novamente.');
    }

    const sigla = (updateData.SIGLA ?? '').toString().trim();
    if (!sigla) {
      console.error('[POP-ESTACAO-UPDATE] SIGLA é obrigatório');
      return throwError(() => 'SIGLA é obrigatório.');
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}${route}`;

    const body: UpdateEstacaoApiBody = {
      ID_META: id_meta,
      SIGLA: updateData.SIGLA,
      LOGRADOURO: updateData.ENDERECO,
      NUMERO: updateData.NUMERO,
      BAIRRO: updateData.BAIRRO,
      COMPLEMENTO: updateData.COMPLEMENTO,
      CONTATO: updateData.CONTATO,
      TELEFONE: updateData.TELEFONE,
      OBSERVACAO: updateData.OBS
    };

    console.log('[POP-ESTACAO-UPDATE] Enviando atualização para:', url);
    console.log('[POP-ESTACAO-UPDATE] Dados a serem atualizados:', body);

    return this.http.post<PopEstacaoUpdateResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map(response => {
        console.log('[POP-ESTACAO-UPDATE] Resposta da atualização:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    console.error('[POP-ESTACAO-UPDATE] Erro ao atualizar informações da estação:', error);
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

  /** Emite evento quando uma estação foi atualizada (para atualizar marcador no mapa) */
  emitEstacaoAtualizado(event: EstacaoAtualizadoEvent): void {
    this.estacaoAtualizado$.next(event);
  }
}
