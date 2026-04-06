import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

/** Tubo 1–12 a partir do número da fibra (mesma regra que `analisa_conexao_nivel.js`). */
export function tuboFromFibra(fibraNum: number): number {
  const f = Number(fibraNum);
  if (f <= 12) return 1;
  if (f <= 24) return 2;
  if (f <= 36) return 3;
  if (f <= 48) return 4;
  if (f <= 60) return 5;
  if (f <= 72) return 6;
  if (f <= 84) return 7;
  if (f <= 96) return 8;
  if (f <= 108) return 9;
  if (f <= 120) return 10;
  if (f <= 132) return 11;
  return 12;
}

export interface BuildCableAnalisaArgs {
  bocaKey: string;
  portId: string;
  bocaValue: string;
  idMetaCabo: string | number | undefined | null;
}

/** Monta `regist` / `tabela` / `idmeta` para cabo (fluxo VB power_meter + combo fibra). */
export function buildCableAnalisaRequest(
  args: BuildCableAnalisaArgs,
): { regist: string; tabela: string; idmeta: number } | null {
  const mBoca = /^Boca(\d+)$/i.exec(String(args.bocaKey || '').trim());
  if (!mBoca) return null;
  const mPort = /^F(\d+)$/i.exec(String(args.portId || '').trim());
  if (!mPort) return null;
  const fibra = parseInt(mPort[1], 10);
  if (!Number.isFinite(fibra) || fibra < 1) return null;

  const bocaId = String(args.bocaValue ?? '').trim();
  if (!bocaId || bocaId === '0') return null;

  /** `id_meta` da linha do cabo (cabopa/cabopb), não o id_meta do destino/caixa em VetorDestinoCabos. */
  let idmeta: number;
  if (typeof args.idMetaCabo === 'number' && Number.isFinite(args.idMetaCabo) && args.idMetaCabo > 0) {
    idmeta = args.idMetaCabo;
  } else {
    const raw = String(args.idMetaCabo ?? '').trim();
    const parsed = parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      idmeta = parsed;
    } else {
      const mCabo = bocaId.match(/cabo(\d+)[AB]/i);
      if (!mCabo) return null;
      idmeta = parseInt(mCabo[1], 10);
      if (!Number.isFinite(idmeta) || idmeta <= 0) return null;
    }
  }

  const ultimaLetra = bocaId.slice(-1).toUpperCase();
  const prefix = ultimaLetra === 'A' ? 'caboa' : 'cabob';
  const tubo = tuboFromFibra(fibra);
  const tabela = `${prefix}_t${tubo}`;
  const regist = `FIBRA_${fibra}`;

  return { regist, tabela, idmeta };
}

/**
 * Extrai boca e fibra de strings tipo `prop.boca2_1.label` (fluxo VB `power_meter` / SPLITTER_ENTRADA).
 * **Boca 98** (ex.: `prop.boca98_1.label`): exceção — entrada do splitter ligada à saída de outro splitter
 * (boca virtual), não a um cabo direto; fora isso bocas 1–18.
 */
export function parseSplitterEntradaPropLabel(entrada: string): { bocaNum: number; fibra: number } | null {
  const s = String(entrada || '').trim();
  if (!s) return null;
  const m = /boca(\d+)_(\d+)/i.exec(s);
  if (!m) return null;
  const bocaNum = parseInt(m[1], 10);
  const fibra = parseInt(m[2], 10);
  const bocaValida =
    Number.isFinite(bocaNum) &&
    bocaNum >= 1 &&
    (bocaNum <= 18 || bocaNum === 98);
  if (!bocaValida) return null;
  if (!Number.isFinite(fibra) || fibra < 1 || fibra > 144) return null;
  return { bocaNum, fibra };
}

/**
 * Monta `analisa-conexao-nivel` a partir de `splitter_e.ENTRADA` + `ID_META_CAIXA` (VB: `cxbocaN_tK`, `f{n}l`, idmeta da caixa).
 * Não usa `splitter_t*` — a API rejeita essas tabelas.
 */
export function buildSplitterAnalisaRequestFromEntrada(
  entrada: string,
  idMetaCaixa: number,
): { regist: string; tabela: string; idmeta: number } | null {
  const idmeta =
    typeof idMetaCaixa === 'number' && Number.isFinite(idMetaCaixa) && idMetaCaixa > 0
      ? idMetaCaixa
      : null;
  if (idmeta == null) return null;

  const parsed = parseSplitterEntradaPropLabel(entrada);
  if (!parsed) return null;

  const tubo = tuboFromFibra(parsed.fibra);
  const tabela = `cxboca${parsed.bocaNum}_t${tubo}`;
  const regist = `f${parsed.fibra}l`;

  return { regist, tabela, idmeta };
}

export interface AnalisaConexaoNivelRequest {
  regist: string;
  tabela: string;
  idmeta: number;
  metragem?: number;
  atenuacao?: number;
  nivels?: number;
}

export interface AnalisaConexaoNivelPasso {
  iteracao: number;
  tabela: string;
  idmeta: number;
  regist: string;
  resultado: string;
  destinoTab: string;
}

export interface AnalisaConexaoNivelResponse {
  success: boolean;
  metragem?: number;
  atenuacao?: number;
  nivels?: number;
  fiber?: number | string;
  passos?: AnalisaConexaoNivelPasso[];
  iteracoes?: number;
  motivo?: string;
  warning?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AnalisaConexaoNivelService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 60000;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  /**
   * POST `/analisa_conexao_nivel` — análise de percurso/nível (port VB ANALISA_TABELA_INI_CAIXA).
   * Usado pelo Power Meter (cabo ou splitter) quando o payload é válido (`buildCableAnalisaRequest` ou `buildSplitterAnalisaRequestFromEntrada`).
   */
  analisa(request: AnalisaConexaoNivelRequest): Observable<AnalisaConexaoNivelResponse> {
    const route = `/analisa-conexao-nivel`;
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    const url = `${this.baseUrl}${route}`;

    console.log('[ANALISA_CONEXAO_NIVEL] Enviando para API:', {
      url,
      body: { ...request },
    });

    return this.http.post<AnalisaConexaoNivelResponse>(url, request, { headers }).pipe(
      timeout(this.TIMEOUT),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ [ANALISA_CONEXAO_NIVEL] Erro na requisição:', error);
    let errorMessage = 'Erro ao analisar conexão.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else if (error.error && typeof error.error === 'object' && 'error' in error.error) {
      errorMessage = String((error.error as { error?: string }).error ?? errorMessage);
    } else {
      errorMessage = `Código: ${error.status}, ${error.message}`;
    }
    return throwError(() => errorMessage);
  }
}
