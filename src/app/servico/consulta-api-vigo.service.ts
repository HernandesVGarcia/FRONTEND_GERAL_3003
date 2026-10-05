import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError, firstValueFrom } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ClienteVigoData, InserirClienteVigoService } from './inserir-cliente-vigo.service';
import {
  UpdateClienteAtivacaoError,
  UpdateClienteAtivacaoRequest,
  UpdateClienteAtivacaoService,
} from './update-cliente-ativacao.service';
import { environment } from '../environments/environment';
import { ERP_VIGO } from './erp.constants';
import { CtoSPService } from './cto-sp.service';
import { Cto_SP } from '../modelo/Cto_SP';

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

export interface VigoUltimoIdIntegracaoCaixasResponse {
  success: boolean;
  idCIDADES?: number;
  ultimoIdIntegracao?: number | null;
  proximoCodigo?: number;
  error?: string;
  code?: string;
}

export interface VigoSyncCaixasResponse {
  success: boolean;
  idCIDADES?: number;
  idPolo?: number | string;
  codigoInicial?: number;
  codigosConsultados?: number;
  totalEncontradosVigo?: number;
  totalVinculados?: number;
  semCorrespondencia?: unknown[];
  multiplasCaixas?: unknown[];
  vaziosConsecutivosFim?: number;
  error?: string;
  code?: string;
}

export interface VigoOcupacaoConexao {
  id_cliente?: number | string;
  porta_cto?: number;
  [key: string]: unknown;
}

export interface VigoOcupacaoSemCorrespondencia {
  id_cliente?: number | string;
  porta_cto?: number;
  motivo?: string;
  detalhe?: string;
}

export interface VigoOcupacaoAviso {
  codigo?: string;
  message?: string;
  [key: string]: unknown;
}

export interface VigoOcupacaoCtoMapearResponse {
  success: boolean;
  idCIDADES?: number;
  idCtoVigo?: number;
  idmeta_caixa?: number;
  portas_caixa?: number;
  idmeta_splitter?: number;
  totalConexoes?: number;
  conexoes?: VigoOcupacaoConexao[];
  payloads?: UpdateClienteAtivacaoRequest[];
  semCorrespondencia?: VigoOcupacaoSemCorrespondencia[];
  avisos?: VigoOcupacaoAviso[];
  error?: string;
  code?: string;
}

export interface ResumoSyncVigoCtoErro {
  payload: UpdateClienteAtivacaoRequest;
  message: string;
}

export interface ResumoSyncVigoCto {
  mapear: VigoOcupacaoCtoMapearResponse;
  ok: UpdateClienteAtivacaoRequest[];
  ignorados: UpdateClienteAtivacaoRequest[];
  erros: ResumoSyncVigoCtoErro[];
}

export interface VigoCaixaIntegracaoItem {
  idmeta_caixa: number;
  numerocx: string;
  idCtoVigo: number;
}

export interface ResumoSyncVigoCtoCaixaErro {
  idCtoVigo: number;
  numerocx?: string;
  message: string;
}

export interface VigoSanearStatusResponse {
  success: boolean;
  idCIDADES?: number;
  dryRun?: boolean;
  totalRecebidos?: number;
  totalValidos?: number;
  totalInvalidos?: number;
  totalEncontrados?: number;
  totalJaZerados?: number;
  totalParaAtualizar?: number;
  totalAtualizados?: number;
  totalNaoEncontrados?: number;
  naoEncontrados?: number[];
  error?: string;
  code?: string;
}

export interface ResumoSyncVigoCtoLote {
  caixasEncontradas: number;
  caixasProcessadas: number;
  totalOk: number;
  totalIgnorados: number;
  totalErrosAtivacao: number;
  caixasFalha: ResumoSyncVigoCtoCaixaErro[];
  detalhes: ResumoSyncVigoCto[];
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
    private inserirClienteVigoService: InserirClienteVigoService,
    private updateClienteAtivacaoService: UpdateClienteAtivacaoService,
    private ctoSPService: CtoSPService,
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

  private async obterUltimoIdIntegracaoCaixas(
    idCIDADES: number,
  ): Promise<VigoUltimoIdIntegracaoCaixasResponse> {
    const url = `${this.baseUrl}/consulta-vigo/ultimo-id-integracao-caixas`;
    const body = { idCIDADES };

    return firstValueFrom(
      this.http
        .post<VigoUltimoIdIntegracaoCaixasResponse>(url, body, { headers: this.getAuthHeaders() })
        .pipe(timeout(this.TIMEOUT), catchError(this.handleError)),
    );
  }

  private async sincronizarCaixasIntegracao(
    idCIDADES: number,
    codigoInicial: number,
    limite: number,
  ): Promise<VigoSyncCaixasResponse> {
    const url = `${this.baseUrl}/consulta-vigo/sincronizar-caixas`;
    const body = { idCIDADES, codigoInicial, limite };

    return firstValueFrom(
      this.http.post<VigoSyncCaixasResponse>(url, body, { headers: this.getAuthHeaders() }).pipe(
        timeout(this.TIMEOUT),
        catchError(this.handleError),
      ),
    );
  }

  /** Após login: continua ID_INTEGRACAO a partir do maior já gravado na cidade (10 IDs). */
  async iniciarSyncCaixas(): Promise<void> {
    const limiteLogin = environment.vigoSyncMaxCaixasLogin ?? 10;
    console.log('🚀 [VIGO] Iniciando sync de ID_INTEGRACAO (caixas) após login...');

    try {
      const idCity = this.authService.getIdCity();
      if (!idCity) {
        console.error('❌ [VIGO] ID da cidade não encontrado no authService');
        return;
      }

      const idErp = this.authService.getIdErp();
      if (idErp !== ERP_VIGO) {
        console.log(`⏭️ [VIGO] ID_ERP (${idErp}) não é VIGO (${ERP_VIGO}). Sync caixas não executada.`);
        return;
      }

      const ultimo = await this.obterUltimoIdIntegracaoCaixas(idCity);
      if (!ultimo.success) {
        console.error('❌ [VIGO] Erro ao obter último ID_INTEGRACAO:', ultimo.error);
        return;
      }

      const codigoInicial = ultimo.proximoCodigo ?? 1;
      console.log(
        `🔍 [VIGO] Último ID_INTEGRACAO=${ultimo.ultimoIdIntegracao ?? 'nenhum'} → consultando ${limiteLogin} ID(s) a partir de ${codigoInicial}...`,
      );

      const resultado = await this.sincronizarCaixasIntegracao(idCity, codigoInicial, limiteLogin);

      if (!resultado.success) {
        console.error('❌ [VIGO] Erro na sincronização de caixas:', resultado.error);
        return;
      }

      console.log(
        `✅ [VIGO] Sync caixas concluída: ${resultado.totalVinculados ?? 0} vínculo(s), ` +
          `${resultado.totalEncontradosVigo ?? 0} CTO(s) no VIGO, ` +
          `${resultado.codigosConsultados ?? 0} código(s) consultado(s).`,
      );
    } catch (error: unknown) {
      console.error('❌ [VIGO] Erro ao executar sync de caixas:', error);
    }
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

  async mapearOcupacaoCto(idCtoVigo: number): Promise<VigoOcupacaoCtoMapearResponse> {
    const idCity = this.authService.getIdCity();
    if (!idCity) {
      throw new Error('ID da cidade não encontrado. Selecione a cidade no login.');
    }

    const url = `${this.baseUrl}/consulta-vigo/ocupacao-cto-mapear`;
    const body = { idCIDADES: idCity, idCtoVigo };

    const resultado = await firstValueFrom(
      this.http
        .post<VigoOcupacaoCtoMapearResponse>(url, body, { headers: this.getAuthHeaders() })
        .pipe(timeout(this.TIMEOUT), catchError(this.handleError)),
    );

    if (!resultado.success) {
      throw new Error(resultado.error ?? 'Erro ao mapear ocupação da CTO VIGO.');
    }

    if (resultado.avisos?.length) {
      console.warn('[VIGO] Avisos ocupacao-cto-mapear:', resultado.avisos);
    }
    if (resultado.semCorrespondencia?.length) {
      console.warn('[VIGO] Sem correspondência:', resultado.semCorrespondencia);
    }

    return resultado;
  }

  async aplicarOcupacaoCto(idCtoVigo: number): Promise<ResumoSyncVigoCto> {
    console.log(`🔗 [VIGO] Conectividade CTO id=${idCtoVigo}...`);

    const mapear = await this.mapearOcupacaoCto(idCtoVigo);
    const payloads = mapear.payloads ?? [];
    const ok: UpdateClienteAtivacaoRequest[] = [];
    const ignorados: UpdateClienteAtivacaoRequest[] = [];
    const erros: ResumoSyncVigoCtoErro[] = [];

    if (payloads.length === 0) {
      console.log('ℹ️ [VIGO] Nenhum payload para ativar (CTO sem ocupações mapeáveis).');
      return { mapear, ok, ignorados, erros };
    }

    console.log(`🔗 [VIGO] Aplicando ${payloads.length} conexão(ões)...`);

    for (const payload of payloads) {
      try {
        await firstValueFrom(
          this.updateClienteAtivacaoService.ativarOuOcuparCliente(payload),
        );
        ok.push(payload);
        console.log(
          `✅ [VIGO] Saída ${payload.saida_splitter} — cliente ${payload.idmeta_cliente}`,
        );
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        const code = e instanceof UpdateClienteAtivacaoError ? e.code : undefined;
        if (code === 'CLIENTE_JA_CONECTADO') {
          ignorados.push(payload);
          console.log(
            `⏭️ [VIGO] Cliente ${payload.idmeta_cliente} já conectado (recurso_sp) — ignorado.`,
          );
        } else {
          erros.push({ payload, message });
          console.warn(
            `⚠️ [VIGO] Saída ${payload.saida_splitter} — ${message}`,
          );
        }
      }

      await this.aguardar(200);
    }

    console.log(
      `🔗 [VIGO] Conectividade concluída: ${ok.length} OK, ${ignorados.length} ignorado(s), ${erros.length} falha(s).`,
    );

    return { mapear, ok, ignorados, erros };
  }

  private parseIdCtoVigo(raw: unknown): number | null {
    const id = Number.parseInt(String(raw ?? '').trim(), 10);
    if (!Number.isFinite(id) || id <= 0) {
      return null;
    }
    return id;
  }

  private extrairIntegracaoVigo(row: Cto_SP): number | null {
    const raw =
      row.ID_INTEGRACAO ??
      (row as unknown as Record<string, unknown>)['id_integracao'];
    return this.parseIdCtoVigo(raw);
  }

  private normalizarRespostaCtosSp(retorno: unknown): Cto_SP[] {
    if (retorno != null && typeof retorno === 'object' && 'response' in retorno) {
      return ((retorno as { response: Cto_SP[] }).response ?? []) as Cto_SP[];
    }
    return (retorno as Cto_SP[]) ?? [];
  }

  private async coletarCaixasComIntegracaoVigo(): Promise<VigoCaixaIntegracaoItem[]> {
    const retorno = await firstValueFrom(this.ctoSPService.selecionar());
    const rows = this.normalizarRespostaCtosSp(retorno);

    const porCto = new Map<number, VigoCaixaIntegracaoItem>();

    for (const row of rows) {
      const idCtoVigo = this.extrairIntegracaoVigo(row);
      if (idCtoVigo == null || porCto.has(idCtoVigo)) {
        continue;
      }
      const numerocx =
        (row.NUMEROCX != null && String(row.NUMEROCX).trim()) ||
        (row.numero != null && String(row.numero).trim()) ||
        '';

      porCto.set(idCtoVigo, {
        idmeta_caixa: row.id_meta ?? 0,
        numerocx,
        idCtoVigo,
      });
    }

    console.log(
      `🔗 [VIGO] CTO-SP: ${rows.length} listada(s), ${porCto.size} com ID_INTEGRACAO (id_cto distintos).`,
    );

    return [...porCto.values()].sort((a, b) =>
      a.numerocx.localeCompare(b.numerocx, undefined, { numeric: true }),
    );
  }

  async aplicarOcupacaoTodasCaixas(): Promise<ResumoSyncVigoCtoLote> {
    console.log('🔗 [VIGO] Conectividade — CTO-SP com ID_INTEGRACAO (POST /ctos_sp)...');

    const caixas = await this.coletarCaixasComIntegracaoVigo();

    const resumo: ResumoSyncVigoCtoLote = {
      caixasEncontradas: caixas.length,
      caixasProcessadas: 0,
      totalOk: 0,
      totalIgnorados: 0,
      totalErrosAtivacao: 0,
      caixasFalha: [],
      detalhes: [],
    };

    if (caixas.length === 0) {
      console.log(
        'ℹ️ [VIGO] Nenhuma CTO-SP com ID_INTEGRACAO (POST /ctos_sp). Rode sincronizar-caixas e publique ctos_sp.js com ID_INTEGRACAO no SELECT.',
      );
      return resumo;
    }

    for (const caixa of caixas) {
      console.log(
        `🔗 [VIGO] Caixa ${caixa.numerocx || caixa.idmeta_caixa} (CTO ${caixa.idCtoVigo})...`,
      );

      try {
        const detalhe = await this.aplicarOcupacaoCto(caixa.idCtoVigo);
        resumo.detalhes.push(detalhe);
        resumo.caixasProcessadas++;
        resumo.totalOk += detalhe.ok.length;
        resumo.totalIgnorados += detalhe.ignorados.length;
        resumo.totalErrosAtivacao += detalhe.erros.length;
      } catch (e: unknown) {
        const message =
          typeof e === 'string' ? e : e instanceof Error ? e.message : String(e);
        resumo.caixasFalha.push({
          idCtoVigo: caixa.idCtoVigo,
          numerocx: caixa.numerocx,
          message,
        });
        console.warn(`⚠️ [VIGO] Caixa CTO ${caixa.idCtoVigo}: ${message}`);
      }

      await this.aguardar(300);
    }

    console.log(
      `🔗 [VIGO] Lote concluído: ${resumo.caixasProcessadas}/${caixas.length} caixa(s), ` +
        `${resumo.totalOk} ativação(ões) OK, ${resumo.totalIgnorados} já conectado(s), ` +
        `${resumo.totalErrosAtivacao} falha(s) de saída, ` +
        `${resumo.caixasFalha.length} caixa(s) com erro de mapeamento.`,
    );

    return resumo;
  }

  /** Zera `tstmeta.pop.STATUS` dos CONTRATO_GPON informados na cidade logada. */
  async sanearStatusClientes(
    contratos: number[],
    dryRun: boolean,
  ): Promise<VigoSanearStatusResponse> {
    const idCity = this.authService.getIdCity();
    if (!idCity) {
      throw new Error('ID da cidade não encontrado. Selecione a cidade no login.');
    }

    const url = `${this.baseUrl}/consulta-vigo/sanear-status-clientes`;
    const body = { idCIDADES: idCity, contratos, dryRun };

    const resultado = await firstValueFrom(
      this.http
        .post<VigoSanearStatusResponse>(url, body, { headers: this.getAuthHeaders() })
        .pipe(timeout(this.TIMEOUT), catchError(this.handleError)),
    );

    if (!resultado.success) {
      throw new Error(resultado.error ?? 'Erro ao sanear STATUS dos clientes.');
    }

    console.log(
      `🧹 [VIGO] Saneamento${dryRun ? ' (prévia)' : ''}: ${resultado.totalEncontrados ?? 0} encontrado(s), ` +
        `${resultado.totalJaZerados ?? 0} já em 0, ${resultado.totalParaAtualizar ?? 0} a atualizar, ` +
        `${resultado.totalAtualizados ?? 0} atualizado(s), ${resultado.totalNaoEncontrados ?? 0} sem correspondência.`,
    );

    return resultado;
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
