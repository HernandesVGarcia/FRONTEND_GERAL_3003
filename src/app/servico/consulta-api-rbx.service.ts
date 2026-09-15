import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError, firstValueFrom } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { FiberApiService } from './fiber-api.service';
import {
  InserirClienteRBXService,
  AutenticacaoRBX,
  ContratoRBX,
  ClienteApiTerceiros
} from './inserir-cliente-RBX.service';
import { environment } from '../environments/environment';
import { ERP_RBX } from './erp.constants';

export interface ConsultaClientesResponse {
  success?: boolean;
  data?: any;
  error?: string;
}

interface ContextoErp {
  url: string;
  chaveIntegracao: string;
}

const NAS_CENTRAL_ASSINANTE = '(CENTRAL ASSINANTE)';

@Injectable({
  providedIn: 'root'
})
export class ConsultaApiRbxService {
  private readonly TIMEOUT = 30000;
  private baseUrl: string = environment.apiUrlAbsolute;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private fiberApiService: FiberApiService,
    private inserirClienteRBXService: InserirClienteRBXService
  ) {}

  private async buscarUltimoContratoGpon(): Promise<number | null> {
    try {
      const idCity = this.authService.getIdCity();

      if (!idCity) {
        console.error('❌ [RBX] ID da cidade não encontrado no authService');
        return null;
      }

      const token = this.authService.getToken();
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      const url = `${this.baseUrl}/clientes-buscar-ultimo`;
      const body = { idCIDADES: idCity };

      const response = await firstValueFrom(
        this.http.post<any>(url, body, { headers }).pipe(
          timeout(this.TIMEOUT),
          catchError(this.handleError)
        )
      );

      if (response.response && Array.isArray(response.response) && response.response.length > 0) {
        const contratoGpon = response.response[0].CONTRATO_GPON;

        if (contratoGpon !== undefined && contratoGpon !== null && contratoGpon !== '') {
          const ultimoContrato = typeof contratoGpon === 'string'
            ? parseInt(contratoGpon, 10)
            : Number(contratoGpon);

          if (!isNaN(ultimoContrato) && ultimoContrato > 0) {
            return ultimoContrato;
          }
        }
      }

      if (response.success && response.CONTRATO_GPON !== undefined && response.CONTRATO_GPON !== null) {
        const ultimoContrato = typeof response.CONTRATO_GPON === 'string'
          ? parseInt(response.CONTRATO_GPON, 10)
          : Number(response.CONTRATO_GPON);

        if (!isNaN(ultimoContrato) && ultimoContrato > 0) {
          return ultimoContrato;
        }
      }

      return null;
    } catch (error: any) {
      console.error('❌ [RBX] Erro ao buscar último CONTRATO_GPON:', error);
      return null;
    }
  }

  private async buscarDadosPolo(idPolo: string): Promise<{ url: string; chaveIntegracao: string; idErp: number } | null> {
    try {
      const query = `SELECT HTTP, KEY_ERP, ID_ERP FROM tst.polos WHERE IDPOLO = {idPolo}`;
      const params = { idPolo };

      const response = await firstValueFrom(
        this.fiberApiService.executeDynamicQuery(query, params)
      );

      if (response.success && response.data && response.data.length > 0) {
        const polo = response.data[0];
        const url = polo.HTTP || polo.http;
        const chaveIntegracao = polo.KEY_ERP || polo.key_erp;
        const idErp = polo.ID_ERP || polo.id_erp;

        if (!url || !chaveIntegracao) {
          console.error('❌ [RBX] URL ou ChaveIntegracao não encontrados na tabela tst.polos');
          return null;
        }

        const idErpNum = typeof idErp === 'string' ? parseInt(idErp, 10) : idErp;

        return {
          url,
          chaveIntegracao,
          idErp: idErpNum
        };
      }

      console.error('❌ [RBX] Polo não encontrado na tabela tst.polos para IDPOLO:', idPolo);
      return null;
    } catch (error) {
      console.error('❌ [RBX] Erro ao buscar dados do polo:', error);
      return null;
    }
  }

  private async obterContextoErp(): Promise<ContextoErp | null> {
    const idPolo = this.authService.getPolo();

    if (!idPolo) {
      console.error('❌ [RBX] IDPOLO não encontrado no authService');
      return null;
    }

    const dadosPolo = await this.buscarDadosPolo(idPolo);

    if (!dadosPolo) {
      return null;
    }

    if (dadosPolo.idErp !== 1) {
      console.log(`⏭️ [RBX] ID_ERP (${dadosPolo.idErp}) não é igual a 1. Consulta à API do ERP não será executada.`);
      return null;
    }

    return {
      url: dadosPolo.url,
      chaveIntegracao: dadosPolo.chaveIntegracao
    };
  }

  private extrairResultArray(data: any): any[] {
    if (!data) {
      return [];
    }

    if (data.result && Array.isArray(data.result)) {
      return data.result;
    }

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  }

  private extrairCliente(data: any): ClienteApiTerceiros | null {
    const resultados = this.extrairResultArray(data);

    if (resultados.length > 0) {
      return resultados[0];
    }

    if (data?.Codigo) {
      return data;
    }

    const dadosAninhados = data?.ConsultaClientes || data?.data;
    if (Array.isArray(dadosAninhados) && dadosAninhados.length > 0) {
      return dadosAninhados[0];
    }

    if (dadosAninhados?.Codigo) {
      return dadosAninhados;
    }

    return null;
  }

  private filtrarAutenticacoesValidas(autenticacoes: AutenticacaoRBX[]): AutenticacaoRBX[] {
    return autenticacoes.filter(auth => auth.NAS !== NAS_CENTRAL_ASSINANTE);
  }

  private localizarContrato(contratos: ContratoRBX[], numeroContrato: string | undefined): ContratoRBX | undefined {
    if (!numeroContrato) {
      return undefined;
    }

    return contratos.find(contrato => String(contrato.Numero) === String(numeroContrato));
  }

  private async consultarErp(body: object): Promise<ConsultaClientesResponse> {
    try {
      const contexto = await this.obterContextoErp();

      if (!contexto) {
        return {
          success: false,
          error: 'Contexto ERP indisponível ou ID_ERP diferente de 1'
        };
      }

      const token = this.authService.getToken();
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      const proxyBody = {
        url: contexto.url,
        body
      };

      const response = await firstValueFrom(
        this.http.post<any>(`${this.baseUrl}/consulta-rbx`, proxyBody, { headers }).pipe(
          timeout(this.TIMEOUT),
          catchError(this.handleError)
        )
      );

      if (response.success) {
        return { success: true, data: response.data };
      }

      return {
        success: false,
        error: response.error || 'Erro desconhecido ao consultar API do ERP'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erro desconhecido ao consultar API do ERP'
      };
    }
  }

  async consultarClientes(codigoCliente: string = '1'): Promise<ConsultaClientesResponse> {
    const contexto = await this.obterContextoErp();

    if (!contexto) {
      return {
        success: false,
        error: 'Contexto ERP indisponível ou ID_ERP diferente de 1'
      };
    }

    return this.consultarErp({
      ConsultaClientes: {
        Autenticacao: {
          ChaveIntegracao: contexto.chaveIntegracao
        },
        Filtro: `Codigo = '${codigoCliente}'`
      }
    });
  }

  async consultarAutenticacaoSenha(codigoCliente: string): Promise<ConsultaClientesResponse> {
    const contexto = await this.obterContextoErp();

    if (!contexto) {
      return {
        success: false,
        error: 'Contexto ERP indisponível ou ID_ERP diferente de 1'
      };
    }

    return this.consultarErp({
      ConsultaAutenticacaoSenha: {
        Autenticacao: {
          ChaveIntegracao: contexto.chaveIntegracao
        },
        Filtro: `Cliente = '${codigoCliente}'`
      }
    });
  }

  async consultarContratos(codigoCliente: string): Promise<ConsultaClientesResponse> {
    const contexto = await this.obterContextoErp();

    if (!contexto) {
      return {
        success: false,
        error: 'Contexto ERP indisponível ou ID_ERP diferente de 1'
      };
    }

    return this.consultarErp({
      ConsultaContratos: {
        Autenticacao: {
          ChaveIntegracao: contexto.chaveIntegracao
        },
        Filtro: `Cliente_Codigo = '${codigoCliente}'`
      }
    });
  }

  async iniciarConsultaClientes(): Promise<void> {
    console.log('🚀 [RBX] Iniciando consulta sequencial de clientes após login...');

    const idErp = this.authService.getIdErp();
    if (idErp !== ERP_RBX) {
      console.log(`⏭️ [RBX] ID_ERP (${idErp}) não é RBX (${ERP_RBX}). Consulta não executada.`);
      return;
    }

    try {
      const ultimoContrato = await this.buscarUltimoContratoGpon();
      const codigoInicial = (ultimoContrato !== null && !isNaN(ultimoContrato) && ultimoContrato > 0)
        ? ultimoContrato + 1
        : 1;

      console.log(`🔍 [RBX] Iniciando consultas a partir do código: ${codigoInicial}`);

      const limiteClientes = environment.rbxSyncMaxClientes ?? 0;
      let codigosConsultados = 0;

      if (limiteClientes > 0) {
        console.log(`[RBX] Modo teste: máximo ${limiteClientes} códigos de cliente.`);
      }

      let codigoAtual = codigoInicial;
      let registrosVaziosConsecutivos = 0;
      const maxRegistrosVazios = 15; // quanta segquencias de clientes vazios consecutivos para parar a consulta
      let totalAutenticacoesInseridas = 0;

      while (registrosVaziosConsecutivos <= maxRegistrosVazios) {
        const codigoStr = codigoAtual.toString();
        console.log(`🔍 [RBX] Consultando cliente código: ${codigoStr}`);

        const authResult = await this.consultarAutenticacaoSenha(codigoStr);

        if (!authResult.success || !authResult.data) {
          console.log(`⚠️ [RBX] Sem autenticações para código ${codigoStr}:`, authResult.error);
          registrosVaziosConsecutivos++;
        } else {
          const autenticacoesValidas = this.filtrarAutenticacoesValidas(
            this.extrairResultArray(authResult.data) as AutenticacaoRBX[]
          );

          if (autenticacoesValidas.length === 0) {
            console.log(`⚠️ [RBX] Nenhuma autenticação válida para código ${codigoStr}`);
            registrosVaziosConsecutivos++;
          } else {
            registrosVaziosConsecutivos = 0;

            const [contratosResult, clientesResult] = await Promise.all([
              this.consultarContratos(codigoStr),
              this.consultarClientes(codigoStr)
            ]);

            const contratos = contratosResult.success
              ? this.extrairResultArray(contratosResult.data) as ContratoRBX[]
              : [];

            const cliente = clientesResult.success
              ? this.extrairCliente(clientesResult.data) || {}
              : {};

            if (!clientesResult.success) {
              console.warn(`⚠️ [RBX] ConsultaClientes falhou para código ${codigoStr}:`, clientesResult.error);
            }

            if (contratos.length === 0) {
              console.warn(`⚠️ [RBX] Nenhum contrato retornado para código ${codigoStr}`);
            }

            for (const auth of autenticacoesValidas) {
              const contrato = this.localizarContrato(contratos, auth.Contrato);

              if (!contrato) {
                console.error(`❌ [RBX] Contrato ${auth.Contrato} não encontrado para auth ${auth.Id} (cliente ${codigoStr})`);
                continue;
              }

              console.log(`💾 [RBX] Inserindo auth ${auth.Id} / contrato ${contrato.Numero} / cliente ${codigoStr}`);

              const insertResult = await this.inserirClienteRBXService.inserirIntegracao(
                auth,
                contrato,
                cliente,
                0
              );

              if (insertResult.success) {
                totalAutenticacoesInseridas++;
                console.log(`✅ [RBX] Auth ${auth.Id} inserida com sucesso. ID_META: ${insertResult.id_meta ?? 'N/A'}`);
              } else {
                console.error(`❌ [RBX] Erro ao inserir auth ${auth.Id}:`, insertResult.error);
              }

              await this.aguardar(300);
            }
          }
        }

        codigoAtual++;
        codigosConsultados++;

        if (limiteClientes > 0 && codigosConsultados >= limiteClientes) {
          console.log(`[RBX] Limite de teste atingido: ${limiteClientes} códigos consultados.`);
          break;
        }

        await this.aguardar(500);
      }

      if (totalAutenticacoesInseridas > 0) {
        console.log(`✅ [RBX] Processo concluído! ${totalAutenticacoesInseridas} autenticação(ões) inserida(s).`);
      } else {
        console.log('ℹ️ [RBX] Nenhuma autenticação nova encontrada para inserir.');
      }
    } catch (error: any) {
      console.error('❌ [RBX] Erro ao executar consulta sequencial de clientes:', error);
    }
  }

  private aguardar(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [RBX] Erro na requisição HTTP:', error);
    let errorMessage = 'Ocorreu um erro na requisição à API do ERP.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage += ` - ${error.error.message}`;
      }
    }

    return throwError(() => errorMessage);
  }
}
