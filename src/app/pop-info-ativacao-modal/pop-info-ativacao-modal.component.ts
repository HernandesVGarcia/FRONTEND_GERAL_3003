import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Caixa } from '../modelo/Caixa';
import { Cto_SP } from '../modelo/Cto_SP';
import { Splitter } from '../modelo/Splitter';
import { FibraDestino } from '../modelo/FibraDestino';
import {
  CompartilhamentoService,
  ViabilidadeCirculoCaixaData,
} from '../servico/compartilhamento.service';
import { SplitterViabilidadeService } from '../servico/splitter-viabilidade.service';
import {
  CONEX_SPL_VALOR_LIVRE,
  ConexSplLinhaRow,
  ConexSplitterOcupacaoService,
} from '../servico/conex-splitter-ocupacao.service';
import { ViabilidadeItemNode } from '../viabilidade-modal/viabilidade-modal.component';
import { firstValueFrom, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SplitterEntradaService } from '../servico/splitter-entrada.service';
import { ExtraiCaboEntradaSpService } from '../servico/extrai-cabo-entrada-sp.service';
import { FibraDestinoCaboService } from '../servico/fibra-destino-cabo.service';
import { PesquisaSiglaService } from '../servico/pesquisa-sigla.service';
import { DioEquipamentoService } from '../servico/dio-equipamento.service';
import {
  UpdateClienteAtivacaoRequest,
  UpdateClienteAtivacaoResponse,
  UpdateClienteAtivacaoService,
} from '../servico/update-cliente-ativacao.service';
import {
  UpdateClienteDesativacaoRequest,
  UpdateClienteDesativacaoResponse,
  UpdateClienteDesativacaoService,
} from '../servico/update-cliente-desativacao.service';
import { ExcluiPosicaoOltService } from '../servico/exclui-posicao-olt.service';
import { InsertPosicaoOltService } from '../servico/insert-posicao-olt.service';

const RAIO_PADRAO_METROS = 150;
const RAIO_MAX_METROS = 100_000;

interface SplOcupacaoVm {
  loading: boolean;
  done: boolean;
  error?: string;
  row?: ConexSplLinhaRow;
  noRoute?: boolean;
}

const SPLITTER_VIABILIDADE_SAIDAS_CAP_MAX = 256;
/** Capacidade máxima de fibras em modelo DioEquip quando /pesquisa-dio não devolve CAPACIDADE. */
const DIO_EQUIP_CAP_FALLBACK = 144;

const MSG_DESATIVACAO_SUCESSO = 'Cliente desativado com sucesso.';

function normalizarTextoAlerta(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/\.+$/u, '');
}

/** Uma linha fixa + detalhe da API, sem repetir quando `message` repete o padrão. */
function textoAlertaDesativacaoSucesso(resp: UpdateClienteDesativacaoResponse): string {
  const apiRaw =
    typeof resp.message === 'string' && resp.message.trim() ? resp.message.trim() : '';
  if (
    !apiRaw ||
    normalizarTextoAlerta(apiRaw) === normalizarTextoAlerta(MSG_DESATIVACAO_SUCESSO)
  ) {
    return MSG_DESATIVACAO_SUCESSO;
  }
  return `${MSG_DESATIVACAO_SUCESSO}\n\n${apiRaw}`;
}

@Component({
  selector: 'app-pop-info-ativacao-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, NgbModule],
  templateUrl: './pop-info-ativacao-modal.component.html',
  styleUrls: ['./pop-info-ativacao-modal.component.css'],
})
export class PopInfoAtivacaoModalComponent implements OnInit, OnDestroy {
  @Input() caixas: Caixa[] = [];
  @Input() ctosSP: Cto_SP[] = [];
  /** Coordenadas do cliente no mapa (obrigatórias para a busca). */
  @Input() clienteLat = 0;
  @Input() clienteLng = 0;
  @Input() clienteRotulo = '';
  /** Nome exibível (sigla do cliente no mapa). */
  @Input() clienteNome = '';
  @Input() clienteIdMeta: number | undefined;
  /** Recursos da aba B vindos do MVCObject do marcador (marker.get), não do vetor destino. */
  @Input() recursoCaixaMarcador?: number;
  @Input() recursoSpMarcador?: number;
  @Input() recursoSpSaidaMarcador?: number;
  /** `portas_olt` no MVCObject do marcador (marker.get), igual à origem dos recurso_* . */
  @Input() portasOltMarcador?: number;

  /** Emitido quando `/insert_posicao_olt` devolve um `portas_olt_id` válido — o pai atualiza o marcador. */
  @Output() portasOltOcupacaoRegistada = new EventEmitter<number>();

  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef; // para poder arrastar o modal

  get clienteNomeExibicao(): string {
    const n = (this.clienteNome ?? '').trim();
    if (n) {
      return n;
    }
    const r = (this.clienteRotulo ?? '').trim();
    return r || '—';
  }

  get clienteIdMetaExibicao(): string {
    const id = this.clienteIdMeta;
    if (id != null && Number.isFinite(Number(id)) && Number(id) > 0) {
      return String(id);
    }
    return '—';
  }

  raioMetrosTexto = String(RAIO_PADRAO_METROS);
  errorMessage = '';
  /** Erros só da aba ATIVADO (desativar); não misturar com `errorMessage` da pesquisa. */
  errorMessageAtivado = '';
  resultadoArvore: ViabilidadeItemNode[] = [];
  mensagemSemResultado = '';

  /**
   * True se qualquer recurso do marcador for > 0 — determina qual aba é visível.
   * Aba B (formulário): temRecursoAtivo === true.
   * Aba A (pesquisa):   temRecursoAtivo === false.
   */
  get temRecursoAtivo(): boolean {
    return [
      this.recursoCaixaMarcador,
      this.recursoSpMarcador,
      this.recursoSpSaidaMarcador,
      this.portasOltMarcador,
    ].some((v) => v != null && Number.isFinite(Number(v)) && Number(v) > 0);
  }

  /** A = pesquisa de recursos; B = formulário complementar (mantido para compatibilidade de template) */
  get abaAtiva(): 'A' | 'B' {
    return this.temRecursoAtivo ? 'B' : 'A';
  }

  /** Permite «Ocupar OLT» quando o rastreio terminou num DIO com fibra e id_meta do cliente válidos. */
  get podeClicarOcuparOlt(): boolean {
    const raw = this.portasOltMarcador;
    if (raw != null) {
      const n = Number(raw);
      if (Number.isFinite(n) && n !== 0) {
        return false;
      }
    }
    const out = this.ultimoFibraDestinoAtivado;
    if (!out) {
      return false;
    }
    if (this.normalizarTipoParaEstacaoDio(out.tipo_objeto) !== 'DIO') {
      return false;
    }
    if (this.parseIndiceFibraDio(out.fibra) == null) {
      return false;
    }
    const idDio = Number(String(out.id_meta ?? '').trim());
    if (!Number.isFinite(idDio) || idDio <= 0 || !Number.isInteger(idDio)) {
      return false;
    }
    const idPop = Number(this.clienteIdMeta);
    return Number.isFinite(idPop) && idPop > 0 && Number.isInteger(idPop);
  }
  campoCaixa = '';
  campoSplitter = '';
  campoSaida = '';
  campoEstacaoDio = '';
  campoPortaOlt = '';
  campoNivel = '';

  /** Linha escolhida na árvore para o POST em Ativar */
  selecaoAtivacao: UpdateClienteAtivacaoRequest | null = null;
  ativarEnviando = false;
  desativarEnviando = false;
  ocuparOltEnviando = false;

  private ultimoFibraDestinoAtivado: FibraDestino | null = null;

  private ocupacaoSplPorIdMeta: Record<number, SplOcupacaoVm> = {};

  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;

  constructor(
    public activeModal: NgbActiveModal,
    private ngZone: NgZone,
    private compartilhamentoService: CompartilhamentoService,
    private splitterViabilidadeService: SplitterViabilidadeService,
    private conexSplitterOcupacaoService: ConexSplitterOcupacaoService,
    private splitterEntradaService: SplitterEntradaService,
    private extraiCaboEntradaSpService: ExtraiCaboEntradaSpService,
    private fibraDestinoCaboService: FibraDestinoCaboService,
    private pesquisaSiglaService: PesquisaSiglaService,
    private dioEquipamentoService: DioEquipamentoService,
    private updateClienteAtivacaoService: UpdateClienteAtivacaoService,
    private updateClienteDesativacaoService: UpdateClienteDesativacaoService,
    private excluiPosicaoOltService: ExcluiPosicaoOltService,
    private insertPosicaoOltService: InsertPosicaoOltService,
  ) {}

  ngOnInit(): void {
    // O pai define `componentInstance` após `open()`; espera até ao fim do bloco síncrono.
    setTimeout(() => {
      this.preencherAbaBPorRecursosMarcador();
      if (this.temRecursoAtivo) {
        // Aba ATIVADO: substitui campoCaixa pelo NUMERO_CX vindo de splitter_entrada
        void this.preencherNumeroCxPorSplitter();
        void this.rastrearRecursoFibraAbaAtivado();
      } else {
        // Aba ATIVAÇÃO: busca automática com raio predefinido
        this.onBuscar();
      }
    }, 0);
  }

  private idMetaSplitterAbaAtivado(): number | null {
    const idRecurso = Number(this.recursoSpMarcador);
    if (Number.isFinite(idRecurso) && Number.isInteger(idRecurso) && idRecurso > 0) {
      return idRecurso;
    }
    const rawCampo = (this.campoSplitter ?? '').trim().replace(',', '.');
    if (rawCampo === '') {
      return null;
    }
    const idCampo = Number(rawCampo);
    return Number.isFinite(idCampo) && Number.isInteger(idCampo) && idCampo > 0
      ? idCampo
      : null;
  }

  private async rastrearRecursoFibraAbaAtivado(): Promise<void> {
    this.ngZone.run(() => {
      this.ultimoFibraDestinoAtivado = null;
    });
    const idMetaSpl = this.idMetaSplitterAbaAtivado();
    if (idMetaSpl == null) {
      console.warn('[pop-info-ativacao] aba ativado sem splitter válido para rastreamento.');
      return;
    }
    try {
      const row = await firstValueFrom(this.splitterEntradaService.buscarPorIdMetaSplitter(idMetaSpl));
      console.log('[pop-info-ativacao] aba ativado splitter_entrada', row);
      if (
        !row ||
        !(String(row.ENTRADA ?? '').trim()) ||
        row.ID_META_CAIXA == null ||
        !(Number(row.ID_META_CAIXA) > 0)
      ) {
        console.warn('[pop-info-ativacao] aba ativado splitter_entrada incompleta', row);
        return;
      }

      const ex = await firstValueFrom(
        this.extraiCaboEntradaSpService.extrairCabEntrada({
          ENTRADA: String(row.ENTRADA).trim(),
          ID_META_CAIXA: Number(row.ID_META_CAIXA),
        }),
      );
      console.log('[pop-info-ativacao] aba ativado extrai_cabo_entrada_sp', ex);

      const out = await firstValueFrom(
        this.fibraDestinoCaboService.rastrearFibra(
          ex.tabela_cabo,
          ex.id_meta_cabo,
          ex.registro,
        ),
      );
      console.log('[pop-info-ativacao] aba ativado analisa-conexao-total', {
        id_meta: out.id_meta,
        tipo_objeto: out.tipo_objeto,
        fibra: out.fibra,
      });
      this.ngZone.run(() => {
        this.ultimoFibraDestinoAtivado = out;
      });
      void this.preencherEstacaoDioPorDestinoRastreio(out);
    } catch (e) {
      console.warn('[pop-info-ativacao] aba ativado cadeia recurso fibra', { idMetaSpl, erro: e });
    }
  }

  /** CAIXA / CABO / DIO conforme PesquisaSiglaService; demais tipos ignorados aqui. */
  private normalizarTipoParaEstacaoDio(
    raw: string | undefined | null,
  ): 'CAIXA' | 'CABO' | 'DIO' | null {
    const t = (raw ?? '').trim().toUpperCase();
    if (t === 'DIO') {
      return 'DIO';
    }
    if (t === 'CAIXA') {
      return 'CAIXA';
    }
    if (t === 'CABO') {
      return 'CABO';
    }
    return null;
  }

  /** Índice 1-based da fibra na face do DIO (ex.: "13", "F13"). */
  private parseIndiceFibraDio(fibra: string | undefined | null): number | null {
    const s = String(fibra ?? '').trim();
    if (s === '') {
      return null;
    }
    const mPrefix = s.match(/^F\s*(\d+)$/i);
    if (mPrefix) {
      const k = Number(mPrefix[1]);
      return Number.isFinite(k) && k > 0 ? k : null;
    }
    const mOnly = s.match(/^(\d+)$/);
    if (mOnly) {
      const k = Number(mOnly[1]);
      return Number.isFinite(k) && k > 0 ? k : null;
    }
    const anyDigit = s.match(/\d+/);
    if (anyDigit) {
      const k = Number(anyDigit[0]);
      return Number.isFinite(k) && k > 0 ? k : null;
    }
    return null;
  }

  private async preencherPortaOltNivelPorDioEquipamento(
    idMeta: string,
    out: FibraDestino,
    infoDio: { capacidade?: number },
  ): Promise<void> {
    const k = this.parseIndiceFibraDio(out.fibra);
    if (k == null) {
      console.warn('[pop-info-ativacao] fibra inválida para Porta_OLT/Nível', out.fibra);
      return;
    }
    let cap =
      infoDio.capacidade != null && Number.isFinite(infoDio.capacidade) && infoDio.capacidade > 0
        ? Math.floor(Number(infoDio.capacidade))
        : DIO_EQUIP_CAP_FALLBACK;

    try {
      const equipResp = await firstValueFrom(
        this.dioEquipamentoService.selecionar(Number(idMeta), cap),
      );
      const fromApi = equipResp as unknown as {
        response?: Record<string, unknown>[];
        info?: { capacidade?: number };
      };
      const infoCap = fromApi.info?.capacidade;
      if (typeof infoCap === 'number' && Number.isFinite(infoCap) && infoCap > 0) {
        cap = Math.floor(infoCap);
      }
      const row = fromApi.response?.[0];
      if (!row) {
        console.warn('[pop-info-ativacao] dio_equipamento sem dados', idMeta);
        return;
      }
      if (k < 1 || k > cap) {
        console.warn('[pop-info-ativacao] índice fibra fora do range DIO', { k, cap });
        return;
      }
      const obsKey = `obs${k}`;
      const nKey = `N${k}`;
      const obsVal = row[obsKey];
      const nVal = row[nKey];
      let olt = obsVal != null ? String(obsVal).trim() : '';
      let nivel = nVal != null ? String(nVal).trim() : '';
      if (nivel.toUpperCase() === 'OFF') {
        nivel = '';
      }
      if (!olt && !nivel) {
        console.warn('[pop-info-ativacao] obs/N vazios para fibra', k, row);
        return;
      }
      this.ngZone.run(() => {
        if (olt) {
          this.campoPortaOlt = olt;
        }
        if (nivel) {
          this.campoNivel = nivel;
        }
      });
    } catch (e) {
      console.warn('[pop-info-ativacao] dio_equipamento', { idMeta, erro: e });
    }
  }

  private async preencherEstacaoDioPorDestinoRastreio(out: FibraDestino): Promise<void> {
    const tipo = this.normalizarTipoParaEstacaoDio(out.tipo_objeto);
    if (!tipo) {
      return;
    }
    const idMeta = String(out.id_meta ?? '').trim();
    if (idMeta === '' || idMeta === '0') {
      console.warn('[pop-info-ativacao] destino sem id_meta válido para Estação_DIO', out);
      return;
    }
    try {
      if (tipo === 'DIO') {
        const info = await this.pesquisaSiglaService.pesquisarInfoDioAsync(idMeta);
        const base = `${info.pop ?? ''} ${info.sigla ?? ''}`.trim();
        const k = this.parseIndiceFibraDio(out.fibra);
        const fn = k != null ? ` F${k}` : '';
        const texto = (base + fn).trim();
        if (!texto) {
          console.warn(
            '[pop-info-ativacao] Estação_DIO vazia (POP/sigla/fibra)',
            info,
            out.fibra,
          );
        } else {
          this.ngZone.run(() => {
            this.campoEstacaoDio = `DIO: ${texto}`;
          });
        }
        await this.preencherPortaOltNivelPorDioEquipamento(idMeta, out, info);
        return;
      }
      const rotulo = await this.pesquisaSiglaService.pesquisarSiglaAsync(idMeta, tipo);
      const valor = (rotulo ?? '').trim();
      if (!valor) {
        console.warn(
          `[pop-info-ativacao] sigla vazia para ${tipo} id_meta=${idMeta}`,
        );
        return;
      }
      this.ngZone.run(() => {
        this.campoEstacaoDio = `${tipo}: ${valor}`;
      });
    } catch (e) {
      console.warn('[pop-info-ativacao] preencher Estação_DIO', { tipo, idMeta, erro: e });
    }
  }

  /** ABA AtivadoObtém NUMERO_CX da caixa via splitter_entrada e atualiza campoCaixa. */
  private async preencherNumeroCxPorSplitter(): Promise<void> {
    const idSp = this.recursoSpMarcador;
    if (idSp == null || !Number.isFinite(Number(idSp)) || Number(idSp) <= 0) return;
    try {
      const row = await firstValueFrom(
        this.splitterEntradaService.buscarPorIdMetaSplitter(Number(idSp)),
      );
      const cx = row?.NUMERO_CX?.trim();
      if (cx) this.campoCaixa = cx;
    } catch {
      // mantém o fallback (id_meta) já preenchido por preencherAbaBPorRecursosMarcador
    }
  }

  ngOnDestroy(): void {
    this.compartilhamentoService.limparViabilidadeCirculosCaixas();
  }

  /**
   * Formata números para a aba B. Aceita 0 (a API `clientes_coordenadas` pode devolver
   * `recurso_*: 0`); só rejeita ausente, NaN ou valores negativos.
   */
  private textoRecursoSeValido(raw: number | undefined | null): string | null {
    if (raw == null) {
      return null;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) {
      return null;
    }
    return String(n);
  }

  private preencherAbaBPorRecursosMarcador(): void {
    const cx = this.textoRecursoSeValido(this.recursoCaixaMarcador);
    const sp = this.textoRecursoSeValido(this.recursoSpMarcador);
    const sd = this.textoRecursoSeValido(this.recursoSpSaidaMarcador);
    // portasOltMarcador só para `/exclui_posicao_olt`; campoPortaOlt só pelo rótulo dio_equipamento.

    if (cx !== null) {
      this.campoCaixa = cx;
    }
    if (sp !== null) {
      this.campoSplitter = sp;
    }
    if (sd !== null) {
      this.campoSaida = sd;
    }
  }

  /** Valores da aba B para espelhar no marcador se a API não devolver recurso_*. */
  private extrairRecursoFormularioAbaB(): { caixa?: number; sp?: number; saida?: number } | undefined {
    const parseCampo = (s: string): number | undefined => {
      const raw = (s ?? '').trim().replace(',', '.');
      if (raw === '') {
        return undefined;
      }
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) {
        return undefined;
      }
      return n;
    };
    const caixa = parseCampo(this.campoCaixa);
    const sp = parseCampo(this.campoSplitter);
    const saida = parseCampo(this.campoSaida);
    if (caixa === undefined && sp === undefined && saida === undefined) {
      return undefined;
    }
    return { caixa, sp, saida };
  }

  /**
   * Resolve `idmeta_caixa`: marcador (`recursoCaixaMarcador`) quando válido; senão `POST /splitter_entrada`.
   */
  private async resolverIdMetaCaixaParaDesativacao(): Promise<
    { ok: true; idCaixa: number } | { ok: false; message: string }
  > {
    const cxM = this.recursoCaixaMarcador;
    const marcadorCaixaOk =
      cxM != null &&
      Number.isFinite(Number(cxM)) &&
      Number(cxM) > 0 &&
      Number.isInteger(Number(cxM));
    if (marcadorCaixaOk) {
      return { ok: true, idCaixa: Number(cxM) };
    }
    const idSpl = this.idMetaSplitterAbaAtivado();
    if (idSpl == null) {
      return {
        ok: false,
        message:
          'Não foi possível obter id da caixa: recurso_caixa ausente no marcador e splitter inválido. Verifique o id_meta do splitter.',
      };
    }
    try {
      const row = await firstValueFrom(
        this.splitterEntradaService.buscarPorIdMetaSplitter(idSpl),
      );
      const idCx = row?.ID_META_CAIXA;
      if (
        idCx == null ||
        !Number.isFinite(Number(idCx)) ||
        !(Number(idCx) > 0) ||
        !Number.isInteger(Number(idCx))
      ) {
        return {
          ok: false,
          message:
            'Não foi possível obter id da caixa a partir do splitter (splitter_entrada não devolveu ID_META_CAIXA válido).',
        };
      }
      return { ok: true, idCaixa: Number(idCx) };
    } catch (e: unknown) {
      const detail =
        typeof e === 'string' ? e : e instanceof Error ? e.message : 'Erro desconhecido';
      return {
        ok: false,
        message: `Erro ao consultar splitter_entrada: ${detail}`,
      };
    }
  }

  /**
   * Body para `/update_cliente_desativação` com `idmeta_caixa` já resolvido.
   * `campoCaixa` não substitui o id_meta (pode ser NUMERO_CX).
   */
  private montarPayloadDesativacaoComCaixa(idCaixa: number): UpdateClienteDesativacaoRequest | null {
    const idCliente = Number(this.clienteIdMeta);
    if (!Number.isFinite(idCliente) || idCliente <= 0 || !Number.isInteger(idCliente)) {
      return null;
    }
    const spMarcador = this.recursoSpMarcador;
    let idSpl: number | null =
      spMarcador != null &&
      Number.isFinite(Number(spMarcador)) &&
      Number(spMarcador) > 0 &&
      Number.isInteger(Number(spMarcador))
        ? Number(spMarcador)
        : null;
    if (idSpl == null) {
      idSpl = this.parseCampoInteiroPositivo(this.campoSplitter);
    }
    if (idSpl == null) {
      return null;
    }
    const sdMarcador = this.recursoSpSaidaMarcador;
    let saida: number | null =
      sdMarcador != null &&
      Number.isFinite(Number(sdMarcador)) &&
      Number(sdMarcador) > 0 &&
      Number.isInteger(Number(sdMarcador))
        ? Number(sdMarcador)
        : null;
    if (saida == null) {
      saida = this.parseCampoInteiroPositivo(this.campoSaida);
    }
    if (saida == null) {
      return null;
    }
    return {
      idmeta_cliente: idCliente,
      idmeta_caixa: idCaixa,
      idmeta_splitter: idSpl,
      saida_splitter: saida,
    };
  }

  private parseCampoInteiroPositivo(s: string): number | null {
    const raw = (s ?? '').trim().replace(',', '.');
    if (raw === '') {
      return null;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
      return null;
    }
    return n;
  }

  /** Body opcional para `POST /exclui_posicao_olt` (`id` = portas_olt, `id_pop` = id_meta cliente). */
  private idsParaExclusaoPosicaoOlt(): { id: number; id_pop: number } | null {
    const id = Number(this.portasOltMarcador);
    const id_pop = Number(this.clienteIdMeta);
    if (!Number.isFinite(id) || id <= 0 || !Number.isInteger(id)) {
      return null;
    }
    if (!Number.isFinite(id_pop) || id_pop <= 0 || !Number.isInteger(id_pop)) {
      return null;
    }
    return { id, id_pop };
  }

  onBuscar(): void {
    const lat = Number(this.clienteLat);
    const lng = Number(this.clienteLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      this.errorMessage =
        'Coordenadas do cliente inválidas. Recoloca o marcador ou reabre a partir do mapa.';
      this.resultadoArvore = [];
      this.mensagemSemResultado = '';
      this.compartilhamentoService.limparViabilidadeCirculosCaixas();
      this.compartilhamentoService.limparViabilidadePontoMapa();
      return;
    }
    const rotulo =
      (this.clienteRotulo ?? '').trim() ||
      `Cliente (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
    this.aplicarPesquisa(lat, lng, rotulo);
  }

  /**
   * Interpreta o raio em metros; aceita vírgula ou ponto decimal.
   * @returns null se inválido (não numérico ou menor que 1 m).
   */
  private obterRaioMetrosValido(): number | null {
    const raw = (this.raioMetrosTexto ?? '').trim().replace(',', '.');
    if (raw === '') {
      return null;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 1) {
      return null;
    }
    return Math.min(n, RAIO_MAX_METROS);
  }

  private aplicarPesquisa(lat: number, lng: number, enderecoRotulo: string): void {
    this.errorMessage = '';
    this.mensagemSemResultado = '';
    const raio = this.obterRaioMetrosValido();
    if (raio === null) {
      this.resultadoArvore = [];
      this.compartilhamentoService.limparViabilidadeCirculosCaixas();
      this.errorMessage =
        'Indique um raio válido em metros (número ≥ 1; use ponto ou vírgula para decimais).';
      return;
    }
    const g = typeof google !== 'undefined' ? google : undefined;
    if (!g?.maps?.geometry?.spherical) {
      this.resultadoArvore = [];
      this.compartilhamentoService.limparViabilidadeCirculosCaixas();
      this.errorMessage =
        'Biblioteca geometry não disponível. Confirme "libraries=...,geometry" no script do mapa.';
      return;
    }

    const rotuloMapa = (enderecoRotulo || '').trim() || 'Ativação cliente';
    this.compartilhamentoService.compartilharViabilidadePontoMapa({
      lat,
      lng,
      endereco: rotuloMapa,
    });

    const temCeo = (this.caixas?.length ?? 0) > 0;
    const temCtosp = (this.ctosSP?.length ?? 0) > 0;
    if (!temCeo && !temCtosp) {
      this.resultadoArvore = [];
      this.compartilhamentoService.limparViabilidadeCirculosCaixas();
      this.mensagemSemResultado =
        'Não há caixas (CEO) nem CTO-SP carregadas no mapa. Carregue um projeto antes de pesquisar.';
      return;
    }
    const origin = new g.maps.LatLng(lat, lng);
    this.resultadoArvore = this.computeNearbyItems(origin, raio);
    if (this.resultadoArvore.length === 0) {
      this.compartilhamentoService.limparViabilidadeCirculosCaixas();
      this.mensagemSemResultado = `Nenhum ponto (CEO ou CTO-SP) encontrado num raio de ${Math.round(raio)} m.`;
    } else {
      const pontos = this.pontosCirculosDaArvore(this.resultadoArvore);
      this.compartilhamentoService.compartilharViabilidadeCirculosCaixas(pontos);
    }
  }

  private pontosCirculosDaArvore(nodes: ViabilidadeItemNode[]): ViabilidadeCirculoCaixaData[] {
    const out: ViabilidadeCirculoCaixaData[] = [];
    for (const node of nodes) {
      const pos = this.parseLatLngPair(node.item.LAT, node.item.LONGI);
      if (!pos) {
        continue;
      }
      out.push({ lat: pos.lat(), lng: pos.lng() });
    }
    return out;
  }

  private parseLatLngPair(
    latRaw: Caixa['LAT'] | Cto_SP['LAT'],
    lngRaw: Caixa['LONGI'] | Cto_SP['LONGI'],
  ): google.maps.LatLng | null {
    if (latRaw == null || lngRaw == null) {
      return null;
    }
    const lat = typeof latRaw === 'number' ? latRaw : Number(latRaw);
    const lng = typeof lngRaw === 'number' ? lngRaw : Number(lngRaw);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return null;
    }
    return new google.maps.LatLng(lat, lng);
  }

  private ceoEntraNaListaViabilidade(caixa: Caixa): boolean {
    const n = caixa.conta_splitter;
    if (n == null) {
      return false;
    }
    const v = typeof n === 'number' ? n : Number(n);
    return Number.isFinite(v) && v > 0; // true se o numero de splitters é maior que 0
  }
   //================================================================================================
  // calcula a distancia entre o ponto de origem e o ponto de destino e retorna a lista de caixas e ctos-sp dentro do raio
  // e devolve no array out o tipo caixa ou ctos-sp de item e a distancia em metros
  private computeNearbyItems(origin: google.maps.LatLng, raioMetros: number): ViabilidadeItemNode[] {
    const out: ViabilidadeItemNode[] = [];
    for (const caixa of this.caixas ?? []) {
      if (!this.ceoEntraNaListaViabilidade(caixa)) {
        continue;
      }
      const pos = this.parseLatLngPair(caixa.LAT, caixa.LONGI);
      if (!pos) {
        continue;
      }
      const d = google.maps.geometry.spherical.computeDistanceBetween(origin, pos);
      if (d <= raioMetros) {
        out.push({ tipo: 'ceo', item: caixa, distanciaMetros: d });
      }
    }
    for (const ctosp of this.ctosSP ?? []) {
      const pos = this.parseLatLngPair(ctosp.LAT, ctosp.LONGI);
      if (!pos) {
        continue;
      }
      const d = google.maps.geometry.spherical.computeDistanceBetween(origin, pos);
      if (d <= raioMetros) {
        out.push({ tipo: 'ctosp', item: ctosp, distanciaMetros: d });
      }
    }
    out.sort((a, b) => a.distanciaMetros - b.distanciaMetros);
    return out;
  }
  //================================================================================================

  rotuloLinhaViabilidade(node: ViabilidadeItemNode): string {
    const nome = this.nomeCaixaLista(node);
    const m = Math.round(node.distanciaMetros);
    return `CX_${nome}  :  (${m} Metros)`;
  }

  private nomeCaixaLista(node: ViabilidadeItemNode): string {
    const n = node.item.numero;
    if (n != null && String(n).trim() !== '') {
      return String(n).trim();
    }
    return 'sem_nome';
  }

  rotuloSplitterViabilidade(sp: Splitter): string {
    const raw = sp.id_meta ?? sp.IDMETA;
    if (raw != null && String(raw).trim() !== '') {
      const n = Number(raw);
      if (Number.isFinite(n)) {
        return `splitter_${n}`;
      }
    }
    return 'splitter_?';
  }

  indicesSaidasSplitter(sp: Splitter): number[] {
    const raw = sp.capacidade ?? sp.CAPACIDADE;
    if (raw == null || String(raw).trim() === '') {
      return [];
    }
    const cap = Math.floor(Number(raw));
    if (!Number.isFinite(cap) || cap <= 0) {
      return [];
    }
    const n = Math.min(cap, SPLITTER_VIABILIDADE_SAIDAS_CAP_MAX);
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  private idMetaSplitter(sp: Splitter): number | null {
    const raw = sp.id_meta ?? sp.IDMETA;
    if (raw == null || String(raw).trim() === '') {
      return null;
    }
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  private capacidadeSplitterNum(sp: Splitter): number {
    const raw = sp.capacidade ?? sp.CAPACIDADE;
    return Math.floor(Number(raw));
  }

  private patchOcupSpl(id: number, patch: Partial<SplOcupacaoVm>): void {
    const cur = this.ocupacaoSplPorIdMeta[id] ?? { loading: false, done: false };
    this.ocupacaoSplPorIdMeta = {
      ...this.ocupacaoSplPorIdMeta,
      [id]: { ...cur, ...patch },
    };
  }

  ocupSpliterEstado(sp: Splitter): SplOcupacaoVm | undefined {
    const id = this.idMetaSplitter(sp);
    return id != null ? this.ocupacaoSplPorIdMeta[id] : undefined;
  }

  ocupSpliterCarregando(sp: Splitter): boolean {
    return !!this.ocupSpliterEstado(sp)?.loading;
  }

  ocupSpliterSemRotaOcupacao(sp: Splitter): boolean {
    const st = this.ocupSpliterEstado(sp);
    return !!(st?.done && st.noRoute && !st.error);
  }

  ocupSpliterErroApiOcupacao(sp: Splitter): string | null {
    const st = this.ocupSpliterEstado(sp);
    if (st?.done && st.error) {
      return String(st.error);
    }
    return null;
  }

  textoStatusSaidaSpliter(sp: Splitter, k: number): string {
    const st = this.ocupSpliterEstado(sp);
    if (!st?.done || st.loading || st.noRoute || st.error) {
      return '—';
    }
    const key = `F${k}`;
    const raw = st.row?.[key];
    const cell = typeof raw === 'string' ? raw.trim() : '';
    if (cell === '') {
      return 'Indefinido';
    }
    if (cell === CONEX_SPL_VALOR_LIVRE) {
      return 'Livre';
    }
    return 'Ocupada';
  }

  prefixoLinhaSaidaViabilidade(k: number): string {
    return `saída(${k}) : `;
  }

  classesCorStatusSaidaSpliter(sp: Splitter, k: number): Record<string, boolean> {
    const s = this.textoStatusSaidaSpliter(sp, k);
    return {
      'viabilidade-saida-livre': s === 'Livre',
      'viabilidade-saida-ocupada': s === 'Ocupada',
      'viabilidade-saida-neutra': s === '—' || s === 'Indefinido',
    };
  }

  /** Destaque da saída escolhida para o botão Ativar. */
  isSaidaAtivacaoSelecionada(node: ViabilidadeItemNode, sp: Splitter, k: number): boolean {
    const sel = this.selecaoAtivacao;
    if (!sel) {
      return false;
    }
    const idCaixa = Number(node.item?.id_meta);
    const idSpl = this.idMetaSplitter(sp);
    return (
      idSpl === sel.idmeta_splitter &&
      Number.isFinite(idCaixa) &&
      idCaixa === sel.idmeta_caixa &&
      k === sel.saida_splitter
    );
  }

  /**
   * Atualiza payload de ativação a partir da linha clicada (síncrono).
   * @returns false se os identificadores forem inválidos.
   */
  private registrarSelecaoSaidaParaAtivacao(node: ViabilidadeItemNode, sp: Splitter, k: number): boolean {
    const idCliente = Number(this.clienteIdMeta);
    if (!Number.isFinite(idCliente) || idCliente <= 0) {
      console.warn('[pop-info-ativacao] id_meta do cliente ausente ou inválido para ativação.');
      this.errorMessage =
        'Identificador do cliente (id_meta) inválido — não foi possível preparar a ativação.';
      return false;
    }
    const idCaixa = Number(node.item?.id_meta);
    if (!Number.isFinite(idCaixa) || idCaixa <= 0) {
      console.warn('[pop-info-ativacao] id_meta da caixa/equipamento ausente.', node.item);
      this.errorMessage =
        'Identificador da caixa/equipamento inválido — não foi possível preparar a ativação.';
      return false;
    }
    const idSpl = this.idMetaSplitter(sp);
    if (idSpl == null) {
      console.warn('[pop-info-ativacao] id_meta do splitter ausente.');
      this.errorMessage = 'Identificador do splitter inválido — não foi possível preparar a ativação.';
      return false;
    }
    const saida = Number(k);
    if (!Number.isFinite(saida) || saida <= 0 || !Number.isInteger(saida)) {
      console.warn('[pop-info-ativacao] número de saída inválido.', k);
      this.errorMessage = 'Número de saída do splitter inválido.';
      return false;
    }
    this.selecaoAtivacao = {
      idmeta_cliente: idCliente,
      idmeta_caixa: idCaixa,
      idmeta_splitter: idSpl,
      saida_splitter: saida,
    };
    this.errorMessage = '';
    return true;
  }

  /**
   * Clique na linha da saída F{k}: regista seleção para Ativar.
   */
  onClickSaidaExtrairFluxo( node: ViabilidadeItemNode,  sp: Splitter,  k: number, ev: Event,
  ): void {
    ev.stopPropagation(); //impede o clique de “subir” para elementos pai (evita disparar outros click de container/linha/modal).
    ev.preventDefault(); //bloqueia a acao padrao do elemento clicado (ex.: navegacao de <a>, submit implicito, etc).

    if (this.textoStatusSaidaSpliter(sp, k) === 'Livre') {
      void this.registrarSelecaoSaidaParaAtivacao(node, sp, k);
    } else {
      this.selecaoAtivacao = null;
    }
  }

  onToggleSpliterOccDetails(ev: Event, sp: Splitter): void {
    const details = (ev.currentTarget ?? ev.target) as HTMLDetailsElement;
    if (!details.open) {
      return;
    }
    const id = this.idMetaSplitter(sp);
    if (id == null) {
      return;
    }
    const prev = this.ocupacaoSplPorIdMeta[id];
    if (prev?.done || prev?.loading) {
      return;
    }
    const cap = this.capacidadeSplitterNum(sp);
    if (!this.conexSplitterOcupacaoService.temRotaOcupacao(cap)) {
      this.ngZone.run(() =>
        this.patchOcupSpl(id, { loading: false, done: true, noRoute: true }),
      );
      return;
    }

    this.ngZone.run(() =>
      this.patchOcupSpl(id, { loading: true, done: false, error: undefined, noRoute: false }),
    );
    this.conexSplitterOcupacaoService.consultarOcupacaoPorCapacidade(cap, id).subscribe({
      next: (row) => {
        this.ngZone.run(() =>
          this.patchOcupSpl(id, {
            loading: false,
            done: true,
            row: row ?? undefined,
            noRoute: false,
            error: undefined,
          }),
        );
      },
      error: (err: unknown) => {
        const msg = typeof err === 'string' ? err : 'Erro ao consultar ocupação.';
        this.ngZone.run(() =>
          this.patchOcupSpl(id, {
            loading: false,
            done: true,
            error: msg,
          }),
        );
      },
    });
  }

  onCentrarEquipamentoNaLista(_node: ViabilidadeItemNode): void {
    // no-op: no modal de ativação o mapa permanece centrado no cliente
  }

  onDetalhesViabilidadeToggle(ev: Event, node: ViabilidadeItemNode): void {
    const el = ev.target as HTMLDetailsElement;
    if (!el.open) {
      return;
    }
    if (node.splitters !== undefined) {
      return;
    }
    if (node.splittersLoading) {
      return;
    }
    const idMeta = node.item.id_meta;
    if (idMeta == null || idMeta <= 0) {
      node.splitters = [];
      return;
    }
    node.splittersLoading = true;
    node.splittersError = undefined;
    this.splitterViabilidadeService.listarPorIdMetaCaixa(idMeta).subscribe({
      next: (list) => {
        this.ngZone.run(() => {
          node.splitters = list ?? [];
          node.splittersLoading = false;
        });
      },
      error: (err: unknown) => {
        this.ngZone.run(() => {
          node.splittersLoading = false;
          node.splittersError = typeof err === 'string' ? err : 'Erro ao carregar splitters.';
          node.splitters = [];
        });
      },
    });
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }

  /** POST de ativação com a saída selecionada na árvore (aba A). */
  onAtivar(): void {
    if (!this.selecaoAtivacao) {
      this.errorMessage =
        'Selecione uma saída do splitter na árvore (aba A — clique em saída(k)) antes de ativar.';
      return;
    }
    if (this.ativarEnviando) {
      return;
    }
    this.ativarEnviando = true;
    this.errorMessage = '';

    this.updateClienteAtivacaoService.ativarOuOcuparCliente(this.selecaoAtivacao).subscribe({
      next: (resp) => {
        this.ngZone.run(() => {
          this.ativarEnviando = false;
          this.activeModal.close({
            ativar: true as const,
            payload: resp,
            idMetaCliente: this.clienteIdMeta,
            recursoFormulario: this.extrairRecursoFormularioAbaB(),
          });
        });
      },
      error: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Erro ao ativar ocupação.';
        this.ngZone.run(() => {
          this.ativarEnviando = false;
          this.errorMessage = msg;
        });
      },
    });
  }

  async onDesativar(): Promise<void> {
    if (this.desativarEnviando || this.ocuparOltEnviando) {
      return;
    }
    this.desativarEnviando = true;
    this.errorMessageAtivado = '';

    const resolved = await this.resolverIdMetaCaixaParaDesativacao();
    if (!resolved.ok) {
      this.ngZone.run(() => {
        this.desativarEnviando = false;
        this.errorMessageAtivado = resolved.message;
      });
      return;
    }

    const body = this.montarPayloadDesativacaoComCaixa(resolved.idCaixa);
    if (!body) {
      this.ngZone.run(() => {
        this.desativarEnviando = false;
        this.errorMessageAtivado =
          'Não foi possível montar o pedido de desativação — verifique id_meta do cliente e os recursos da caixa, splitter e saída.';
      });
      return;
    }

    this.updateClienteDesativacaoService
      .desativarCliente(body)
      .pipe(
        switchMap((respDesativacao) => {
          const ids = this.idsParaExclusaoPosicaoOlt();
          if (ids == null) {
            return of({
              respDesativacao,
              oltErroMsg: undefined as string | undefined,
            });
          }
          return this.excluiPosicaoOltService.excluir(ids).pipe(
            map(() => ({
              respDesativacao,
              oltErroMsg: undefined as string | undefined,
            })),
            catchError((e: unknown) => {
              const oltErroMsg =
                e instanceof Error
                  ? e.message
                  : typeof e === 'string'
                    ? e
                    : 'Erro ao excluir posição OLT.';
              return of({ respDesativacao, oltErroMsg });
            }),
          );
        }),
      )
      .subscribe({
        next: (x) => {
          this.ngZone.run(() => {
            this.desativarEnviando = false;
            let mensagemAlerta = textoAlertaDesativacaoSucesso(x.respDesativacao);
            if (x.oltErroMsg) {
              mensagemAlerta += `\n\nAviso: ${x.oltErroMsg}`;
            }
            alert(mensagemAlerta);
            this.activeModal.close({
              desativar: true as const,
              payload: x.respDesativacao,
              idMetaCliente: this.clienteIdMeta,
            });
          });
        },
        error: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Erro ao desativar.';
          this.ngZone.run(() => {
            this.desativarEnviando = false;
            this.errorMessageAtivado = msg;
          });
        },
      });
  }

  onOcuparOlt(): void {
    if (this.ocuparOltEnviando || this.desativarEnviando) {
      return;
    }
    if (!this.podeClicarOcuparOlt) {
      return;
    }
    const out = this.ultimoFibraDestinoAtivado;
    if (!out) {
      return;
    }
    const fibra_dio = this.parseIndiceFibraDio(out.fibra);
    if (fibra_dio == null) {
      return;
    }
    const idmeta_dio = Number(String(out.id_meta ?? '').trim());
    const idmeta_pop = Number(this.clienteIdMeta);
    if (
      !Number.isFinite(idmeta_dio) ||
      idmeta_dio <= 0 ||
      !Number.isInteger(idmeta_dio) ||
      !Number.isFinite(idmeta_pop) ||
      idmeta_pop <= 0 ||
      !Number.isInteger(idmeta_pop)
    ) {
      return;
    }

    this.errorMessageAtivado = '';
    this.ocuparOltEnviando = true;
    this.insertPosicaoOltService
      .inserir({ idmeta_dio, fibra_dio, idmeta_pop })
      .subscribe({
        next: (resp) => {
          this.ngZone.run(() => {
            this.ocuparOltEnviando = false;
            const api =
              typeof resp.message === 'string' && resp.message.trim()
                ? resp.message.trim()
                : '';
            const rawId = resp.portas_olt_id;
            const pid = typeof rawId === 'number' ? rawId : Number(rawId);
            const pidOk =
              Number.isFinite(pid) &&
              pid > 0 &&
              Number.isInteger(pid);
            if (pidOk) {
              this.portasOltOcupacaoRegistada.emit(pid);
            } else {
              console.warn('[pop-info-ativacao] insert_posicao_olt sem portas_olt_id válido', resp);
              this.errorMessageAtivado =
                'A API não devolveu portas_olt_id válido; o marcador não foi atualizado.';
            }
            const avisoExtra = pidOk ? '' : '\n\nAviso: resposta sem portas_olt_id válido.';
            alert((api || 'Posição OLT registada.') + avisoExtra);
          });
        },
        error: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Erro ao registar posição OLT.';
          this.ngZone.run(() => {
            this.ocuparOltEnviando = false;
            this.errorMessageAtivado = msg;
          });
        },
      });
  }

  onMouseDown(event: MouseEvent): void {
    if (event.target instanceof HTMLElement) {
      const header = event.target.closest('.modal-header');
      if (header && !event.target.closest('.btn-close')) {
        this.initialX = event.clientX - this.xOffset;
        this.initialY = event.clientY - this.yOffset;
        if (event.target === header || header.contains(event.target)) {
          this.isDragging = true;
          event.preventDefault();
        }
      }
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      event.preventDefault();
      this.currentX = event.clientX - this.initialX;
      this.currentY = event.clientY - this.initialY;
      this.xOffset = this.currentX;
      this.yOffset = this.currentY;
      if (this.modalDialog) {
        this.modalDialog.nativeElement.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.initialX = this.currentX;
    this.initialY = this.currentY;
    this.isDragging = false;
  }
}
