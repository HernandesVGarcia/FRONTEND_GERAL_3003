import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, firstValueFrom } from 'rxjs';
import { retry, timeout, catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';
import { DesconexaoBandejaService, DesconexaoBandejaRequest, DesconexaoBandejaResponse } from './desconexao-bandeja.service';
import { DesconexaoBocaService, DesconexaoBocaRequest, DesconexaoBocaResponse } from './desconexao-boca.service';
import { BocasService } from './bocas.service';
import { Bocas } from '../modelo/Bocas';

/**
 * 🔌 Serviço para buscar objetos conectados às pontas dos cabos
 * 
 * Este serviço centraliza a lógica de extração de informações de conexão
 * a partir do campo fibra_1label retornado pela rota /verificar_ponta.
 * 
 * Suporta:
 * - CAIXAS (extrai número da boca)
 * - DIOs (identifica conexão, mas não extrai bandeja)
 * - Condomínios
 * - Rabichos
 * - Sobras
 */

// ============================================================================
// INTERFACES - Request/Response da API
// ============================================================================

// ✅ Interface para a rota /verificar_ponta
export interface VerificarPontaRequest {
  ponta: 'A' | 'B';
  IDMETA: number;
}

export interface VerificarPontaResponse {
  response: Array<{
    fibra_1label: string;
  }>;
  ponta: 'A' | 'B';
  IDMETA: number;
  total: number;
}

// ✅ Interface para a rota /tipo_objeto
export interface TipoObjetoRequest {
  idmeta: number;
}

export interface TipoObjetoResponse {
  idmeta: number;
  tipo_objeto: string;
  id_city: number;
  id_condominio: number;
}

// ============================================================================
// INTERFACES - Resultado da Extração
// ============================================================================

export type TipoObjetoConectado = 'CAIXA' | 'DIO' | 'CONDOMINIO' | 'RABICHO' | 'SOBRA' | 'DESCONHECIDO';

export interface ObjetoConectado {
  tipo: TipoObjetoConectado;
  idMeta: number;
  // Para CAIXA: número da boca (1-18)
  // Para DIO: null (não temos informação da bandeja no formato atual)
  // Para outros: pode ser número de conexão ou null
  numeroConexao: number | null;
  // Informações adicionais específicas do tipo
  infoAdicional?: {
    // Para CAIXA
    numeroBoca?: number;
    // Para DIO (não usado no formato atual)
    numeroBandeja?: number;
  };
}

// ============================================================================
// SERVIÇO
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class BuscaObjetoConexPontaService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private desconexaoBandejaService: DesconexaoBandejaService,
    private desconexaoBocaService: DesconexaoBocaService,
    private bocasService: BocasService
  ) {
    this.authService.refreshToken();
  }

  // ============================================================================
  // MÉTODO PRINCIPAL - Buscar objeto conectado à ponta do cabo
  // ============================================================================

  /**
   * 🔍 Busca o objeto conectado à ponta do cabo
   * 
   * @param idMetaCabo - ID_META do cabo
   * @param pontaCabo - 'A' ou 'B'
   * @returns Observable com o objeto conectado ou null se não encontrar
   */
  buscarObjetoConectado(
    idMetaCabo: number,
    pontaCabo: 'A' | 'B'
  ): Observable<ObjetoConectado | null> {
    return new Observable(observer => {
      // 1️⃣ Chamar API para obter informações da ponta
      this.verificarPonta(idMetaCabo, pontaCabo).subscribe({
        next: (response) => {
          if (!response || !response.response || response.response.length === 0) {
            console.warn(`⚠️ [BUSCA-OBJETO-CONEX] Nenhuma fibra encontrada na ponta ${pontaCabo}`);
            observer.next(null);
            observer.complete();
            return;
          }

          // 2️⃣ Pegar o primeiro item do array (fibra_1label)
          const primeiroItem = response.response[0];
          const fibraLabel = primeiroItem.fibra_1label;

          if (!fibraLabel || fibraLabel.trim() === '') {
            console.warn(`⚠️ [BUSCA-OBJETO-CONEX] Label da fibra vazio na ponta ${pontaCabo}`);
            observer.next(null);
            observer.complete();
            return;
          }

          // 3️⃣ Extrair informações do campo fibra_1label
          const objetoConectado = this.extrairObjetoConectado(fibraLabel);

          if (!objetoConectado) {
            console.warn(`⚠️ [BUSCA-OBJETO-CONEX] Não foi possível extrair objeto conectado do campo: ${fibraLabel}`);
            observer.next(null);
            observer.complete();
            return;
          }

          // 4️⃣ Processar conforme o tipo
          this.processarObjetoConectado(objetoConectado).subscribe({
            next: (resultado) => {
              observer.next(resultado);
              observer.complete();
            },
            error: (error) => {
              console.error(`❌ [BUSCA-OBJETO-CONEX] Erro ao processar objeto conectado:`, error);
              observer.next(null);
              observer.complete();
            }
          });
        },
        error: (error) => {
          console.error(`❌ [BUSCA-OBJETO-CONEX] Erro ao chamar API:`, error);
          observer.next(null);
          observer.complete();
        }
      });
    });
  }

  // ============================================================================
  // MÉTODO - Chamar API /verificar_ponta
  // ============================================================================

  /**
   * 📡 Chama a API /verificar_ponta para obter informações da ponta do cabo
   */
  private verificarPonta(
    idMetaCabo: number,
    pontaCabo: 'A' | 'B'
  ): Observable<VerificarPontaResponse> {
    const route = `/verificar_ponta`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body: VerificarPontaRequest = {
      ponta: pontaCabo,
      IDMETA: idMetaCabo
    };

    const url = `${this.baseUrl}${route}`;

    return this.http.post<any>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map((rawResponse: any): VerificarPontaResponse => {
        // Verificar se a resposta tem a estrutura esperada
        if (rawResponse?.response && Array.isArray(rawResponse.response)) {
          return {
            response: rawResponse.response,
            ponta: rawResponse.ponta || pontaCabo,
            IDMETA: rawResponse.IDMETA || idMetaCabo,
            total: rawResponse.total || rawResponse.response.length
          };
        }
        
        throw new Error('Resposta da API em formato inesperado');
      }),
      catchError(this.handleError)
    );
  }

  // ============================================================================
  // MÉTODO - Chamar API /tipo_objeto
  // ============================================================================

  /**
   * 🔍 Consulta o tipo do objeto na API
   * 
   * @param idMeta - ID_META do objeto
   * @returns Observable com o tipo do objeto
   */
  private consultarTipoObjeto(idMeta: number): Observable<TipoObjetoResponse> {
    const route = `/tipo_objeto`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body: TipoObjetoRequest = {
      idmeta: idMeta
    };

    const url = `${this.baseUrl}${route}`;

    return this.http.post<any>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map((rawResponse: any): TipoObjetoResponse => {
        // A resposta pode vir diretamente ou dentro de uma propriedade
        if (rawResponse?.tipo_objeto) {
          return {
            idmeta: rawResponse.idmeta || idMeta,
            tipo_objeto: rawResponse.tipo_objeto,
            id_city: rawResponse.id_city || 0,
            id_condominio: rawResponse.id_condominio || 0
          };
        }
        
        throw new Error('Resposta da API em formato inesperado');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * 🔄 Converte o tipo_objeto da API (maiúsculas) para TipoObjetoConectado
   */
  private mapearTipoObjeto(tipoObjetoApi: string): TipoObjetoConectado {
    const tipoNormalizado = tipoObjetoApi.trim().toUpperCase();
    
    switch (tipoNormalizado) {
      case 'CAIXA':
        return 'CAIXA';
      case 'DIO':
        return 'DIO';
      case 'CONDOMINIO':
        return 'CONDOMINIO';
      case 'RABICHO':
        return 'RABICHO';
      case 'SOBRA':
        return 'SOBRA';
      case 'CABO':
        return 'DESCONHECIDO'; // Cabo não é um objeto conectado
      default:
        return 'DESCONHECIDO';
    }
  }

  // ============================================================================
  // MÉTODO - Extrair informações do campo fibra_1label
  // ============================================================================

  /**
   * 🔍 Extrai informações básicas do campo fibra_1label
   * 
   * Formatos suportados:
   * - CAIXA: =TST130171!PROP.BOCA1_1.VALUE ou TST130171!PROP.BOCA1_1.VALUE
   * - DIO: =DIO129388!PROP.ROW_5.LABEL ou DIO129447!PROP.ROW_5.LABEL
   *   (ROW_X não indica bandeja, apenas confirma conexão ao DIO)
   * 
   * @param fibraLabel - Valor do campo fibra_1label
   * @returns Objeto com tipo, ID_META e número de conexão, ou null
   */
  private extrairObjetoConectado(
    fibraLabel: string | null | undefined
  ): ObjetoConectado | null {
    if (!fibraLabel || fibraLabel.trim() === '') {
      return null;
    }

    // Remover o sinal de igual no início se existir
    const labelLimpo = fibraLabel.trim().replace(/^=/, '');

    // Padrão para CAIXA: TST{numero}!PROP.BOCA{numero}_{numero}.VALUE
    // Exemplo: =TST130171!PROP.BOCA1_1.VALUE ou TST130171!PROP.BOCA1_1.VALUE
    const matchCaixa = labelLimpo.match(/TST(\d+)!PROP\.BOCA(\d+)_\d+\.VALUE/);
    if (matchCaixa) {
      const idMeta = parseInt(matchCaixa[1], 10);
      const numeroBoca = parseInt(matchCaixa[2], 10);
      
      return {
        tipo: 'CAIXA',
        idMeta: idMeta,
        numeroConexao: numeroBoca,
        infoAdicional: {
          numeroBoca: numeroBoca
        }
      };
    }

    // Padrão para DIO: DIO{numero}!PROP.ROW_{numero}.LABEL
    // Exemplo: =DIO129388!PROP.ROW_5.LABEL ou DIO129447!PROP.ROW_5.LABEL
    // Nota: ROW_X não indica bandeja, apenas confirma que está conectado ao DIO
    const matchDio = labelLimpo.match(/DIO(\d+)!PROP\.ROW_\d+\.LABEL/);
    if (matchDio) {
      const idMeta = parseInt(matchDio[1], 10);
      
      return {
        tipo: 'DIO',
        idMeta: idMeta,
        numeroConexao: null, // Não temos informação da bandeja neste formato
        infoAdicional: {
          numeroBandeja: undefined
        }
      };
    }

    // TODO: Adicionar padrões para outros tipos de objetos no futuro
    // - Condomínios
    // - Rabichos
    // - Sobras
    // etc.

    console.warn(`⚠️ [EXTRAIR-OBJETO] Formato não reconhecido: ${fibraLabel}`);
    return {
      tipo: 'DESCONHECIDO',
      idMeta: 0,
      numeroConexao: null
    };
  }

  // ============================================================================
  // MÉTODO - Processar objeto conectado conforme o tipo
  // ============================================================================

  /**
   * 🔄 Processa o objeto conectado conforme seu tipo
   * Agora valida o tipo usando a API antes de processar
   */
  private processarObjetoConectado(
    objeto: ObjetoConectado
  ): Observable<ObjetoConectado | null> {
    return new Observable(observer => {
      // ✅ Validar se o idMeta é válido antes de consultar a API
      if (!objeto.idMeta || objeto.idMeta <= 0) {
        console.warn(
          `⚠️ [PROCESSAR-OBJETO] ID_META inválido (${objeto.idMeta}). ` +
          `Objeto não conectado ou formato não reconhecido.`
        );
        observer.next(null);
        observer.complete();
        return;
      }

      // ✅ Primeiro, validar o tipo usando a API
      this.consultarTipoObjeto(objeto.idMeta).subscribe({
        next: (tipoResponse) => {
          const tipoReal = this.mapearTipoObjeto(tipoResponse.tipo_objeto);
          
          // ✅ Verificar se o tipo extraído corresponde ao tipo real
          if (objeto.tipo !== tipoReal && tipoReal !== 'DESCONHECIDO') {
            console.warn(
              `⚠️ [PROCESSAR-OBJETO] Tipo extraído (${objeto.tipo}) não corresponde ao tipo real (${tipoReal}). ` +
              `Atualizando tipo para ${tipoReal}.`
            );
            objeto.tipo = tipoReal;
          }
          
          // ✅ Processar conforme o tipo validado
          switch (objeto.tipo) {
            case 'CAIXA':
              this.validarCaixa(objeto).subscribe({
                next: (caixaValidada) => {
                  observer.next(caixaValidada);
                  observer.complete();
                },
                error: (error) => {
                  console.error(`❌ [PROCESSAR-OBJETO] Erro ao validar caixa:`, error);
                  observer.next(null);
                  observer.complete();
                }
              });
              break;

            case 'DIO':
              this.validarDio(objeto).subscribe({
                next: (dioValidado) => {
                  observer.next(dioValidado);
                  observer.complete();
                },
                error: (error) => {
                  console.error(`❌ [PROCESSAR-OBJETO] Erro ao validar DIO:`, error);
                  observer.next(null);
                  observer.complete();
                }
              });
              break;

            case 'CONDOMINIO':
              this.validarCondominio(objeto).subscribe({
                next: (condominioValidado) => {
                  observer.next(condominioValidado);
                  observer.complete();
                },
                error: (error) => {
                  console.error(`❌ [PROCESSAR-OBJETO] Erro ao validar condomínio:`, error);
                  observer.next(null);
                  observer.complete();
                }
              });
              break;

            case 'RABICHO':
              this.validarRabicho(objeto).subscribe({
                next: (rabichoValidado) => {
                  observer.next(rabichoValidado);
                  observer.complete();
                },
                error: (error) => {
                  console.error(`❌ [PROCESSAR-OBJETO] Erro ao validar rabicho:`, error);
                  observer.next(null);
                  observer.complete();
                }
              });
              break;

            case 'SOBRA':
              this.validarSobra(objeto).subscribe({
                next: (sobraValidada) => {
                  observer.next(sobraValidada);
                  observer.complete();
                },
                error: (error) => {
                  console.error(`❌ [PROCESSAR-OBJETO] Erro ao validar sobra:`, error);
                  observer.next(null);
                  observer.complete();
                }
              });
              break;

            default:
              console.warn(`⚠️ [PROCESSAR-OBJETO] Tipo desconhecido ou não suportado: ${objeto.tipo}`);
              observer.next(null);
              observer.complete();
              break;
          }
        },
        error: (error) => {
          console.error(`❌ [PROCESSAR-OBJETO] Erro ao consultar tipo do objeto:`, error);
          // Fallback: tentar processar com o tipo extraído mesmo assim
          observer.next(null);
          observer.complete();
        }
      });
    });
  }

  // ============================================================================
  // MÉTODO - Validar CAIXA (implementado)
  // ============================================================================

  /**
   * ✅ Valida se o objeto é realmente uma CAIXA consultando a API
   */
  private validarCaixa(objeto: ObjetoConectado): Observable<ObjetoConectado | null> {
    return new Observable(observer => {
      // Validações básicas
      if (!objeto.idMeta || objeto.idMeta <= 0) {
        console.error(`❌ [VALIDAR-CAIXA] ID_META inválido: ${objeto.idMeta}`);
        observer.next(null);
        observer.complete();
        return;
      }

      if (!objeto.numeroConexao || objeto.numeroConexao < 1 || objeto.numeroConexao > 18) {
        console.error(`❌ [VALIDAR-CAIXA] Número de boca inválido: ${objeto.numeroConexao}`);
        observer.next(null);
        observer.complete();
        return;
      }

      // ✅ Validar tipo usando a API
      this.consultarTipoObjeto(objeto.idMeta).subscribe({
        next: (tipoResponse) => {
          const tipoNormalizado = tipoResponse.tipo_objeto.trim().toUpperCase();
          
          if (tipoNormalizado !== 'CAIXA') {
            console.error(
              `❌ [VALIDAR-CAIXA] Objeto ${objeto.idMeta} não é uma CAIXA. ` +
              `Tipo real: ${tipoResponse.tipo_objeto}`
            );
            observer.next(null);
            observer.complete();
            return;
          }

          console.log(
            `✅ [VALIDAR-CAIXA] Caixa validada: ID=${objeto.idMeta}, ` +
            `Boca=${objeto.numeroConexao}, City=${tipoResponse.id_city}`
          );
          observer.next(objeto);
          observer.complete();
        },
        error: (error) => {
          console.error(`❌ [VALIDAR-CAIXA] Erro ao consultar tipo:`, error);
          observer.next(null);
          observer.complete();
        }
      });
    });
  }

  // ============================================================================
  // MÉTODOS - Validar outros tipos de objetos
  // ============================================================================

  /**
   * ✅ Valida se o objeto é realmente um DIO
   */
  private validarDio(objeto: ObjetoConectado): Observable<ObjetoConectado | null> {
    return new Observable(observer => {
      // Validações básicas
      if (!objeto.idMeta || objeto.idMeta <= 0) {
        console.error(`❌ [VALIDAR-DIO] ID_META inválido: ${objeto.idMeta}`);
        observer.next(null);
        observer.complete();
        return;
      }

      // ✅ Validar tipo usando a API
      this.consultarTipoObjeto(objeto.idMeta).subscribe({
        next: (tipoResponse) => {
          const tipoNormalizado = tipoResponse.tipo_objeto.trim().toUpperCase();
          
          if (tipoNormalizado !== 'DIO') {
            console.error(
              `❌ [VALIDAR-DIO] Objeto ${objeto.idMeta} não é um DIO. ` +
              `Tipo real: ${tipoResponse.tipo_objeto}`
            );
            observer.next(null);
            observer.complete();
            return;
          }

          console.log(
            `✅ [VALIDAR-DIO] DIO validado: ID=${objeto.idMeta}, ` +
            `City=${tipoResponse.id_city}`
          );
          observer.next(objeto);
          observer.complete();
        },
        error: (error) => {
          console.error(`❌ [VALIDAR-DIO] Erro ao consultar tipo:`, error);
          observer.next(null);
          observer.complete();
        }
      });
    });
  }

  // ============================================================================
  // MÉTODO PÚBLICO - Desconectar cabo do DIO
  // ============================================================================

  /**
   * 🔌 Desconecta um cabo de uma bandeja de DIO
   * 
   * A bandeja é detectada automaticamente pela API buscando em C1-C6 da tabela DIO
   * pelo padrão "cabo{idmeta_cabo}{Ponta_cabo}" (ex: "cabo130154A")
   * 
   * @param idMetaDio - ID_META do DIO
   * @param idMetaCabo - ID_META do cabo
   * @param pontaCabo - 'A' ou 'B'
   * @param capacidadeCabo - Capacidade do cabo
   * @returns Observable com a resposta da desconexão
   */
  desconectarCaboDoDio(
    idMetaDio: number,
    idMetaCabo: number,
    pontaCabo: 'A' | 'B',
    capacidadeCabo: number
  ): Observable<DesconexaoBandejaResponse> {
    console.log(
      `🔌 [DESCONECTAR-DIO] Iniciando desconexão do cabo ${idMetaCabo} ` +
      `(Ponta ${pontaCabo}) do DIO ${idMetaDio}...`
    );
    
    const request: DesconexaoBandejaRequest = {
      idmeta_dio: idMetaDio,
      idmeta_cabo: idMetaCabo,
      Ponta_cabo: pontaCabo,
      Capacidade_cabo: capacidadeCabo
    };

    return this.desconexaoBandejaService.desconectar(request).pipe(
      map(response => {
        if (response.success) {
          console.log(`✅ [DESCONECTAR-DIO] ${response.message}`);
        } else {
          console.error(`❌ [DESCONECTAR-DIO] Erro: ${response.message}`);
        }
        return response;
      }),
      catchError(error => {
        console.error(`❌ [DESCONECTAR-DIO] Erro ao desconectar:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * 🔌 Desconecta um cabo de uma boca de CAIXA
   * 
   * @param idMetaCaixa - ID_META da caixa
   * @param numeroBoca - Número da boca (1-18)
   * @param idMetaCabo - ID_META do cabo
   * @param pontaCabo - 'A' ou 'B'
   * @param capacidadeCabo - Capacidade do cabo
   * @returns Observable com a resposta da desconexão
   */
  desconectarCaboDaCaixa(
    idMetaCaixa: number,
    numeroBoca: number,
    idMetaCabo: number,
    pontaCabo: 'A' | 'B',
    capacidadeCabo: number
  ): Observable<DesconexaoBocaResponse> {
    console.log(
      `🔌 [DESCONECTAR-CAIXA] Iniciando desconexão do cabo ${idMetaCabo} ` +
      `(Ponta ${pontaCabo}) da boca ${numeroBoca} da caixa ${idMetaCaixa}...`
    );
    
    const request: DesconexaoBocaRequest = {
      numero_boca: `boca${numeroBoca}`,
      idmeta_caixa: idMetaCaixa,
      idmeta_cabo: idMetaCabo,
      Ponta_cabo: pontaCabo,
      Capacidade_cabo: capacidadeCabo
    };

    return this.desconexaoBocaService.desconectar(request).pipe(
      map(response => {
        if (response.success) {
          console.log(`✅ [DESCONECTAR-CAIXA] ${response.message}`);
        } else {
          console.error(`❌ [DESCONECTAR-CAIXA] Erro: ${response.message}`);
        }
        return response;
      }),
      catchError(error => {
        console.error(`❌ [DESCONECTAR-CAIXA] Erro ao desconectar:`, error);
        return throwError(() => error);
      })
    );
  }

  // ============================================================================
  // MÉTODO UNIFICADO - Desconectar cabo de qualquer objeto
  // ============================================================================

  /**
   * 🔌 Desconecta um cabo do objeto conectado (CAIXA ou DIO)
   * 
   * Método unificado que identifica o tipo de objeto e chama o método de desconexão apropriado.
   * Para CAIXA: valida se o cabo está realmente conectado na boca antes de desconectar.
   * Para DIO: a bandeja é detectada automaticamente pela API.
   * 
   * @param objeto - Objeto conectado (obtido via buscarObjetoConectado)
   * @param idMetaCabo - ID_META do cabo
   * @param pontaCabo - 'A' ou 'B'
   * @param capacidadeCabo - Capacidade do cabo
   * @returns Observable com a resposta da desconexão
   */
  desconectarCabo(
    objeto: ObjetoConectado,
    idMetaCabo: number,
    pontaCabo: 'A' | 'B',
    capacidadeCabo: number
  ): Observable<DesconexaoBocaResponse | DesconexaoBandejaResponse> {
    console.log(
      `🔌 [DESCONECTAR-CABO] Tipo de objeto: ${objeto.tipo}, ` +
      `ID_META objeto: ${objeto.idMeta}, ID_META cabo: ${idMetaCabo}`
    );

    switch (objeto.tipo) {
      case 'CAIXA':
        if (!objeto.numeroConexao || objeto.numeroConexao < 1 || objeto.numeroConexao > 18) {
          console.error(`❌ [DESCONECTAR-CABO] Número de boca inválido: ${objeto.numeroConexao}`);
          return throwError(() => 'Número de boca inválido');
        }
        // Validar se o cabo está realmente na boca antes de desconectar
        return this.validarEDesconectarCaixa(
          objeto.idMeta,
          objeto.numeroConexao,
          idMetaCabo,
          pontaCabo,
          capacidadeCabo
        );

      case 'DIO':
        return this.desconectarCaboDoDio(
          objeto.idMeta,
          idMetaCabo,
          pontaCabo,
          capacidadeCabo
        );

      default:
        console.error(`❌ [DESCONECTAR-CABO] Tipo de objeto não suportado para desconexão: ${objeto.tipo}`);
        return throwError(() => `Tipo de objeto não suportado para desconexão: ${objeto.tipo}`);
    }
  }

  /**
   * 🔍 Valida se o cabo está na boca correta e então desconecta
   * 
   * @param idMetaCaixa - ID_META da caixa
   * @param numeroBoca - Número da boca (1-18)
   * @param idMetaCabo - ID_META do cabo
   * @param pontaCabo - 'A' ou 'B'
   * @param capacidadeCabo - Capacidade do cabo
   * @returns Observable com a resposta da desconexão
   */
  private validarEDesconectarCaixa(
    idMetaCaixa: number,
    numeroBoca: number,
    idMetaCabo: number,
    pontaCabo: 'A' | 'B',
    capacidadeCabo: number
  ): Observable<DesconexaoBocaResponse> {
    return new Observable(observer => {
      console.log(`🔍 [VALIDAR-CAIXA] Validando conexão na boca ${numeroBoca} da caixa ${idMetaCaixa}...`);
      
      // Setar o ID da caixa para a consulta de bocas
      this.authService.setIDmetaCaixa(idMetaCaixa);
      
      // Consultar as bocas da caixa
      this.bocasService.selecionar().subscribe({
        next: (retorno) => {
          const bocasData: Bocas = Array.isArray(retorno) ? retorno[0] : (retorno as any).response?.[0] || retorno;
          
          if (!bocasData) {
            console.error('❌ [VALIDAR-CAIXA] Nenhum dado de boca retornado para a caixa');
            observer.error('Não foi possível obter as bocas da caixa.');
            return;
          }

          // Validar que o cabo está realmente conectado na boca encontrada
          const bocaKey = `BOCA${numeroBoca}` as keyof Bocas;
          const valorBoca = bocasData[bocaKey];
          const padraoCabo = `cabo${idMetaCabo}${pontaCabo}`;

          if (!valorBoca || typeof valorBoca !== 'string' || !valorBoca.includes(padraoCabo)) {
            console.error(`❌ [VALIDAR-CAIXA] Cabo não encontrado na boca ${numeroBoca} conforme esperado`);
            observer.error(`Ponta ${pontaCabo} do cabo não está conectada na boca ${numeroBoca}.`);
            return;
          }

          console.log(`✅ [VALIDAR-CAIXA] Validação OK - Cabo encontrado na boca ${numeroBoca}`);

          // Validação OK, prosseguir com a desconexão
          this.desconectarCaboDaCaixa(
            idMetaCaixa,
            numeroBoca,
            idMetaCabo,
            pontaCabo,
            capacidadeCabo
          ).subscribe({
            next: (response) => {
              observer.next(response);
              observer.complete();
            },
            error: (error) => {
              observer.error(error);
            }
          });
        },
        error: (error) => {
          console.error('❌ [VALIDAR-CAIXA] Erro ao consultar bocas:', error);
          observer.error('Erro ao validar as bocas da caixa.');
        }
      });
    });
  }

  // ============================================================================
  // MÉTODOS - Validar outros tipos de objetos
  // ============================================================================

  /**
   * ✅ Valida se o objeto é realmente um CONDOMINIO
   */
  private validarCondominio(objeto: ObjetoConectado): Observable<ObjetoConectado | null> {
    return new Observable(observer => {
      if (!objeto.idMeta || objeto.idMeta <= 0) {
        console.error(`❌ [VALIDAR-CONDOMINIO] ID_META inválido: ${objeto.idMeta}`);
        observer.next(null);
        observer.complete();
        return;
      }

      this.consultarTipoObjeto(objeto.idMeta).subscribe({
        next: (tipoResponse) => {
          const tipoNormalizado = tipoResponse.tipo_objeto.trim().toUpperCase();
          
          if (tipoNormalizado !== 'CONDOMINIO') {
            console.error(
              `❌ [VALIDAR-CONDOMINIO] Objeto ${objeto.idMeta} não é um CONDOMINIO. ` +
              `Tipo real: ${tipoResponse.tipo_objeto}`
            );
            observer.next(null);
            observer.complete();
            return;
          }

          console.log(`✅ [VALIDAR-CONDOMINIO] Condomínio validado: ID=${objeto.idMeta}`);
          observer.next(objeto);
          observer.complete();
        },
        error: (error) => {
          console.error(`❌ [VALIDAR-CONDOMINIO] Erro ao consultar tipo:`, error);
          observer.next(null);
          observer.complete();
        }
      });
    });
  }

  /**
   * ✅ Valida se o objeto é realmente um RABICHO
   */
  private validarRabicho(objeto: ObjetoConectado): Observable<ObjetoConectado | null> {
    return new Observable(observer => {
      if (!objeto.idMeta || objeto.idMeta <= 0) {
        console.error(`❌ [VALIDAR-RABICHO] ID_META inválido: ${objeto.idMeta}`);
        observer.next(null);
        observer.complete();
        return;
      }

      this.consultarTipoObjeto(objeto.idMeta).subscribe({
        next: (tipoResponse) => {
          const tipoNormalizado = tipoResponse.tipo_objeto.trim().toUpperCase();
          
          if (tipoNormalizado !== 'RABICHO') {
            console.error(
              `❌ [VALIDAR-RABICHO] Objeto ${objeto.idMeta} não é um RABICHO. ` +
              `Tipo real: ${tipoResponse.tipo_objeto}`
            );
            observer.next(null);
            observer.complete();
            return;
          }

          console.log(`✅ [VALIDAR-RABICHO] Rabicho validado: ID=${objeto.idMeta}`);
          observer.next(objeto);
          observer.complete();
        },
        error: (error) => {
          console.error(`❌ [VALIDAR-RABICHO] Erro ao consultar tipo:`, error);
          observer.next(null);
          observer.complete();
        }
      });
    });
  }

  /**
   * ✅ Valida se o objeto é realmente uma SOBRA
   */
  private validarSobra(objeto: ObjetoConectado): Observable<ObjetoConectado | null> {
    return new Observable(observer => {
      if (!objeto.idMeta || objeto.idMeta <= 0) {
        console.error(`❌ [VALIDAR-SOBRA] ID_META inválido: ${objeto.idMeta}`);
        observer.next(null);
        observer.complete();
        return;
      }

      this.consultarTipoObjeto(objeto.idMeta).subscribe({
        next: (tipoResponse) => {
          const tipoNormalizado = tipoResponse.tipo_objeto.trim().toUpperCase();
          
          if (tipoNormalizado !== 'SOBRA') {
            console.error(
              `❌ [VALIDAR-SOBRA] Objeto ${objeto.idMeta} não é uma SOBRA. ` +
              `Tipo real: ${tipoResponse.tipo_objeto}`
            );
            observer.next(null);
            observer.complete();
            return;
          }

          console.log(`✅ [VALIDAR-SOBRA] Sobra validada: ID=${objeto.idMeta}`);
          observer.next(objeto);
          observer.complete();
        },
        error: (error) => {
          console.error(`❌ [VALIDAR-SOBRA] Erro ao consultar tipo:`, error);
          observer.next(null);
          observer.complete();
        }
      });
    });
  }

  // ============================================================================
  // TRATAMENTO DE ERROS
  // ============================================================================

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [BUSCA-OBJETO-CONEX] Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro ao buscar objeto conectado.';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else {
        errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
      }
    }
    
    return throwError(() => errorMessage);
  }
}

