import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  HostListener,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import {
  AnalisaConexaoNivelService,
  AnalisaConexaoNivelRequest,
  AnalisaConexaoNivelResponse,
  buildSplitterAnalisaRequestFromEntrada,
} from '../servico/analisa-conexao-nivel.service';
import { SplitterEntradaRow, SplitterEntradaService } from '../servico/splitter-entrada.service';
import { SplitterService } from '../servico/splitter.service';
import {
  resolvePerdaSplitterDb,
  TipoSplitterApiRow,
  TiposService,
} from '../servico/tipos.service';

@Component({
  selector: 'app-power-meter-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './power-meter-modal.component.html',
  styleUrls: ['./power-meter-modal.component.css'],
})
export class PowerMeterModalComponent implements AfterViewInit, OnDestroy {
  /** Imagem em `src/assets/power_meter_2.png` */
  readonly imageSrc = 'assets/power_meter_2.png';

  @Input() context: 'cabo' | 'splitter' | undefined;
  @Input() extraData: unknown;

  /** Leituras / resultado da API `analisa_conexao_nivel` (modo cabo). */
  leiturasDbmText = '';

  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef<HTMLElement>;

  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;

  /** Só depois do próximo tick, para não fechar com o clique que abriu o modal. */
  private clickOutsideEnabled = false;
  private enableOutsideCloseTimeoutId: ReturnType<typeof setTimeout> | undefined;

  /**
   * Clique fora do host (ex. diagrama GoJS): backdrop com pointer-events none não recebe o evento.
   * `click` (botão esquerdo) e `contextmenu` (direito) — o direito não dispara `click`.
   */
  private readonly onDocumentPointerOutside = (event: MouseEvent): void => {
    if (!this.clickOutsideEnabled) return;
    const t = event.target;
    if (!(t instanceof Node)) return;
    if (!this.hostRef.nativeElement.contains(t)) {
      this.activeModal.dismiss();
      if (event.type === 'contextmenu') {
        event.preventDefault();
      }
    }
  };

  constructor(
    public activeModal: NgbActiveModal,
    private hostRef: ElementRef<HTMLElement>,
    private analisaConexaoNivelService: AnalisaConexaoNivelService,
    private splitterEntradaService: SplitterEntradaService,
    private splitterService: SplitterService,
    private tiposService: TiposService,
  ) {}

  ngAfterViewInit(): void {
    this.carregarAnalisaConexaoNivelSeAplicavel();

    this.enableOutsideCloseTimeoutId = setTimeout(() => {
      this.clickOutsideEnabled = true;
      document.addEventListener('click', this.onDocumentPointerOutside, true);
      document.addEventListener('contextmenu', this.onDocumentPointerOutside, true);
      this.enableOutsideCloseTimeoutId = undefined;
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.enableOutsideCloseTimeoutId !== undefined) {
      clearTimeout(this.enableOutsideCloseTimeoutId);
    }
    document.removeEventListener('click', this.onDocumentPointerOutside, true);
    document.removeEventListener('contextmenu', this.onDocumentPointerOutside, true);
  }

  onMouseDown(event: MouseEvent): void {
    const t = event.target;
    if (!(t instanceof HTMLElement)) return;
    const header = t.closest('.modal-header');
    if (!header) return;
    if (t.closest('button')) return;
    this.initialX = event.clientX - this.xOffset;
    this.initialY = event.clientY - this.yOffset;
    this.isDragging = true;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.modalDialog) return;
    event.preventDefault();
    this.currentX = event.clientX - this.initialX;
    this.currentY = event.clientY - this.initialY;
    this.xOffset = this.currentX;
    this.yOffset = this.currentY;
    this.modalDialog.nativeElement.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.initialX = this.currentX;
    this.initialY = this.currentY;
    this.isDragging = false;
  }

  /** Cabo: inalterado — usa `analisaRequest` vindo do `gojs-demo` (`buildCableAnalisaRequest`). */
  private carregarAnalisaConexaoNivelSeAplicavel(): void {
    if (this.context === 'cabo') {
      const ex = this.extraData as { analisaRequest?: AnalisaConexaoNivelRequest | null } | null | undefined;
      const req = ex?.analisaRequest;
      if (!req) return;

      this.analisaConexaoNivelService
        .analisa(req)
        .pipe(take(1))
        .subscribe({
          next: (res) => this.aplicarRespostaAnalisa(res),
          error: (err: unknown) => {
            this.leiturasDbmText =
              typeof err === 'string' ? err : 'Erro ao analisar conexão.';
          },
        });
      return;
    }

    if (this.context === 'splitter') {
      const idmeta = this.parseIdmetaSplitterDoExtra(this.extraData);
      if (idmeta == null) return;

      forkJoin({
        row: this.splitterEntradaService.buscarPorIdMetaSplitter(idmeta).pipe(take(1)),
        tipos: this.tiposService.buscarTiposSplitter().pipe(
          take(1),
          catchError(() =>
            of({ success: false, tipo: 'splitter', count: 0, data: [] as TipoSplitterApiRow[] }),
          ),
        ),
      })
        .pipe(
          switchMap(({ row, tipos }) => {
            if (!row?.ENTRADA?.trim()) {
              this.leiturasDbmText = 'Sem entrada no splitter.';
              return EMPTY;
            }
            const req = buildSplitterAnalisaRequestFromEntrada(row.ENTRADA, row.ID_META_CAIXA);
            if (!req) {
              this.leiturasDbmText = 'Entrada do splitter inválida ou incompleta.';
              return EMPTY;
            }
            const tiposList = (tipos.data ?? []) as TipoSplitterApiRow[];
            return this.analisaConexaoNivelService
              .analisa(req)
              .pipe(map((res) => ({ res, row, tiposList })));
          }),
        )
        .subscribe({
          next: (payload: {
            res: AnalisaConexaoNivelResponse;
            row: SplitterEntradaRow;
            tiposList: TipoSplitterApiRow[];
          }) => {
            const fallback = this.splitterService.getSplitterAttenuation(payload.row.TIPO_SPLITTER);
            const perda = resolvePerdaSplitterDb({
              tipos: payload.tiposList,
              tipoSplitterId: payload.row.TIPO_SPLITTER,
              portId: this.getPortIdFromExtra(),
              fallbackPerda: fallback,
            });
            const isSaida = this.isSplitterPortaSaida(this.getPortIdFromExtra());
            this.aplicarRespostaAnalisa(payload.res, {
              isSplitterSaida: isSaida,
              perdaSplitterDb: perda,
            });
          },
          error: (err: unknown) => {
            this.leiturasDbmText =
              typeof err === 'string' ? err : 'Erro ao analisar conexão.';
          },
        });
    }
  }

  private parseIdmetaSplitterDoExtra(extra: unknown): number | null {
    if (extra === null || typeof extra !== 'object' || Array.isArray(extra)) return null;
    const v = (extra as { idmeta?: unknown }).idmeta;
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v;
    if (typeof v === 'string') {
      const p = parseInt(v, 10);
      if (Number.isFinite(p) && p > 0) return p;
    }
    return null;
  }

  /**
   * @param opts Saída do splitter (F1, F2, …): somar perda ao valor de atenuação e descontar do nível (VB `power_meter` 255–259).
   */
  private aplicarRespostaAnalisa(
    res: AnalisaConexaoNivelResponse,
    opts?: { isSplitterSaida: boolean; perdaSplitterDb: number },
  ): void {
    if (!res.success) {
      this.leiturasDbmText = res.error ?? 'Análise sem sucesso.';
      return;
    }
    const lines: string[] = [];
    if (res.metragem != null) {
      lines.push(`Metragem: ${Math.floor(Number(res.metragem))} m`);
    }

    const perda =
      opts?.isSplitterSaida && opts.perdaSplitterDb > 0 ? opts.perdaSplitterDb : 0;

    if (opts?.isSplitterSaida && perda > 0) {
      const atBase = Number(res.atenuacao ?? 0);
      // `res.atenuacao` já inclui perda por metragem (ver `analisa_conexao_nivel.js` atenuacaoComPerdaPorMetragem).
      lines.push(`Atenuação: ${(atBase + perda).toFixed(2)} dB`);
      lines.push(this.formatarLinhaNivelSaidaSplitter(res, perda));
    } else {
      if (res.atenuacao != null) {
        lines.push(`Atenuação: ${Number(res.atenuacao).toFixed(2)} dB`);
      }
      lines.push(this.formatarLinhaNivel(res));
    }

    if (res.motivo) {
      lines.push(`(${res.motivo})`);
    }
    this.leiturasDbmText = lines.length > 0 ? lines.join('\n') : '—';
  }

  /** Porta de saída do stencil: F1, F2, … (não ENTRADA). */
  private isSplitterPortaSaida(portId: string | undefined): boolean {
    if (!portId) return false;
    return /^F\d+$/i.test(String(portId).trim());
  }

  private getPortIdFromExtra(): string | undefined {
    const ex = this.extraData as { portId?: string } | null | undefined;
    const p = ex?.portId;
    return typeof p === 'string' ? p.trim() : undefined;
  }

  /**
   * VB SPLITTER_SAIDA: desconta a perda do ramo (`resolvePerdaSplitterDb`: F1→P1, F2+→P2).
   * `res.atenuacao` já inclui percurso + termo por km (API); não subtrair outra vez (metragem/1000)*0,23.
   * Nível ≈ nivels − atenuacao − perda.
   */
  private formatarLinhaNivelSaidaSplitter(
    res: AnalisaConexaoNivelResponse,
    perda: number,
  ): string {
    if (res.nivels === -399) {
      return 'Nível: OFF';
    }
    if (
      res.motivo === 'DIO' &&
      res.nivels != null &&
      !Number.isNaN(Number(res.nivels))
    ) {
      const nivelDio = Number(res.nivels);
      const atenuacao = Number(res.atenuacao ?? 0);
      const exibido = nivelDio - atenuacao - perda;
      return `Nível: ${(Number.isFinite(exibido) ? exibido : nivelDio).toFixed(2)} dBm`;
    }
    return 'Nível: --.-- dBm';
  }

  /**
   * VB: com destino DIO e nível válido mostra dBm; OFF (-399); caso contrário overflow "--.-- dBm".
   */
  private formatarLinhaNivel(res: AnalisaConexaoNivelResponse): string {
    if (res.nivels === -399) {
      return 'Nível: OFF';
    }
    if (
      res.motivo === 'DIO' &&
      res.nivels != null &&
      !Number.isNaN(Number(res.nivels))
    ) {
      const nivelDio = Number(res.nivels);
      const atenuacao = Number(res.atenuacao ?? 0);
      const exibido = nivelDio - (Number.isFinite(atenuacao) ? atenuacao : 0);
      return `Nível: ${(Number.isFinite(exibido) ? exibido : nivelDio).toFixed(2)} dBm`;
    }
    return 'Nível: --.-- dBm';
  }

  get modalTitle(): string {
    if (this.context === 'splitter') {
      const d = this.extraData as { portId?: string } | null | undefined;
      if (d?.portId) return `Power Meter — Splitter (${d.portId})`;
      return 'Power Meter — Splitter';
    }
    if (this.context === 'cabo') {
      const d = this.extraData as { portId?: string } | null | undefined;
      if (d?.portId) return `Power Meter — Cabo (${d.portId})`;
      return 'Power Meter — Cabo';
    }
    return 'Power Meter';
  }

  fechar(): void {
    this.activeModal.close();
  }
}
