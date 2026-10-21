import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  GridsterModule,
  GridsterConfig,
  GridsterItem,
  GridType,
  DisplayGrid,
  CompactType,
} from 'angular-gridster2';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

export interface DashboardPoligonoData {
  id_meta?: number;
  label?: string;
  cabosMetragem?: ChartDatum[];
  caixasTipo?: ChartDatum[];
  clientesStatus?: ChartDatum[];
  diosCapacidade?: ChartDatum[];
  splittersTipo?: ChartDatum[];
  splittersLoading?: boolean;
  condominiosQuantidade?: ChartDatum[];
  estacoesQuantidade?: ChartDatum[];
  modoGeral?: boolean;// flag para indicar se o dashboard é geral ou específico poligono.
}

interface ChartDatum {
  name: string;
  value: number;
}

type ChartViewTarget = 'cabos' | 'caixas' | 'clientes' | 'dios' | 'splitters' | 'condominios' | 'estacoes';

@Component({
  selector: 'app-dashboard-poligono',
  standalone: true,
  imports: [CommonModule, NgbModule, GridsterModule, NgxChartsModule],
  templateUrl: './dashboard-poligono.component.html',
  styleUrls: ['./dashboard-poligono.component.css'],
})
export class DashboardPoligonoComponent implements AfterViewInit, OnDestroy {
  private _data: DashboardPoligonoData = {};

  @Input()
  set data(value: DashboardPoligonoData) {
    this._data = value ?? {};
    if (!this._data.splittersLoading) {
      this.scheduleSyncAllChartViews();
    }
  }
  get data(): DashboardPoligonoData {
    return this._data;
  }

  chartViewCabos: [number, number] = [320, 260];
  chartViewCaixas: [number, number] = [320, 260];
  chartViewClientes: [number, number] = [320, 260];
  chartViewDios: [number, number] = [320, 260];
  chartViewSplitters: [number, number] = [320, 260];
  chartViewCondominios: [number, number] = [320, 260];
  chartViewEstacoes: [number, number] = [320, 260];

  readonly colorScheme: Color = {
    name: 'fiberworks',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#345677', '#629ef8', '#94a3b8', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'],
  };

  get cabosMetragem(): ChartDatum[] {
    return this._data.cabosMetragem ?? [];
  }

  get caixasTipo(): ChartDatum[] {
    return this._data.caixasTipo ?? [];
  }

  get clientesStatus(): ChartDatum[] {
    return this._data.clientesStatus ?? [];
  }

  get diosCapacidade(): ChartDatum[] {
    return this._data.diosCapacidade ?? [];
  }

  get splittersTipo(): ChartDatum[] {
    return this._data.splittersTipo ?? [];
  }

  get condominiosQuantidade(): ChartDatum[] {
    return this._data.condominiosQuantidade ?? [{ name: 'Condomínios', value: 0 }];
  }

  get estacoesQuantidade(): ChartDatum[] {
    return this._data.estacoesQuantidade ?? [{ name: 'Estações', value: 0 }];
  }

  get splittersLoading(): boolean {
    return this._data.splittersLoading === true;
  }

  tooltipCaixas = (item: { name?: string; label?: string; value?: number }): string => {
    const nome = item?.name ?? item?.label ?? '—';
    const qtd = item?.value ?? 0;
    return `${nome}: ${qtd} caixa${qtd === 1 ? '' : 's'}`;
  };

  tooltipClientes = (item: { name?: string; label?: string; value?: number }): string => {
    const nome = item?.name ?? item?.label ?? '—';
    const qtd = item?.value ?? 0;
    return `${nome}: ${qtd} cliente${qtd === 1 ? '' : 's'}`;
  };

  tooltipDios = (item: { name?: string; label?: string; value?: number }): string => {
    const nome = item?.name ?? item?.label ?? '—';
    const qtd = item?.value ?? 0;
    return `${nome}: ${qtd} DIO${qtd === 1 ? '' : 's'}`;
  };

  tooltipSplitters = (item: { name?: string; label?: string; value?: number }): string => {
    const nome = item?.name ?? item?.label ?? '—';
    const qtd = item?.value ?? 0;
    return `${nome}: ${qtd} splitter${qtd === 1 ? '' : 's'}`;
  };

  options: GridsterConfig = {
    gridType: GridType.Fixed,
    compactType: CompactType.None,
    margin: 10,
    outerMargin: true,
    minCols: 12,
    maxCols: 12,
    minRows: 6,
    maxRows: 100,
    maxItemCols: 12,
    minItemCols: 1,
    maxItemRows: 100,
    minItemRows: 1,
    defaultItemCols: 1,
    defaultItemRows: 1,
    fixedColWidth: 105,
    fixedRowHeight: 105,
    draggable: { enabled: true },
    resizable: { enabled: true },
    pushItems: true,
    displayGrid: DisplayGrid.Always,
    itemResizeCallback: () => this.scheduleSyncAllChartViews(),
    itemChangeCallback: () => this.scheduleSyncAllChartViews(),
  };

  dashboard: GridsterItem[] = [
    { cols: 4, rows: 2, y: 0, x: 0 },
    { cols: 4, rows: 2, y: 0, x: 4 },
    { cols: 4, rows: 2, y: 0, x: 8 },
    { cols: 4, rows: 2, y: 2, x: 0 },
    { cols: 4, rows: 2, y: 2, x: 4 },
    { cols: 4, rows: 2, y: 2, x: 8 },
    { cols: 4, rows: 2, y: 4, x: 0 },
  ];

  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;
  private baseLeft = 0;
  private baseTop = 0;
  private resizeObserver: ResizeObserver | null = null;
  private syncScheduled = false;
  exportandoPdf = false;
  pdfErro: string | null = null;
  csvErro: string | null = null;

  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef<HTMLElement>;
  @ViewChild('reportArea', { static: false }) reportArea!: ElementRef<HTMLElement>;
  @ViewChild('chartCabos', { static: false }) chartCabos!: ElementRef<HTMLElement>;
  @ViewChild('chartCaixas', { static: false }) chartCaixas!: ElementRef<HTMLElement>;
  @ViewChild('chartClientes', { static: false }) chartClientes!: ElementRef<HTMLElement>;
  @ViewChild('chartDios', { static: false }) chartDios!: ElementRef<HTMLElement>;
  @ViewChild('chartSplitters', { static: false }) chartSplitters!: ElementRef<HTMLElement>;
  @ViewChild('chartCondominios', { static: false }) chartCondominios!: ElementRef<HTMLElement>;
  @ViewChild('chartEstacoes', { static: false }) chartEstacoes!: ElementRef<HTMLElement>;

  constructor(public activeModal: NgbActiveModal) {}

  ngAfterViewInit(): void {
    this.schedulePositionOuterDialogCentered();
    this.resizeObserver = new ResizeObserver(() => this.scheduleSyncAllChartViews());
    this.observeChartContainers();
    this.scheduleSyncAllChartViews();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  private observeChartContainers(): void {
    const elements = [
      this.chartCabos?.nativeElement,
      this.chartCaixas?.nativeElement,
      this.chartClientes?.nativeElement,
      this.chartDios?.nativeElement,
      this.chartSplitters?.nativeElement,
      this.chartCondominios?.nativeElement,
      this.chartEstacoes?.nativeElement,
    ];
    for (const el of elements) {
      if (el && this.resizeObserver) {
        this.resizeObserver.observe(el);
      }
    }
  }

  private scheduleSyncAllChartViews(): void {
    if (this.syncScheduled) {
      return;
    }
    this.syncScheduled = true;
    requestAnimationFrame(() => {
      this.syncScheduled = false;
      this.syncAllChartViews();
    });
  }

  private syncAllChartViews(): void {
    if (this.chartCabos?.nativeElement) {
      this.syncChartView(this.chartCabos.nativeElement, 'cabos');
    }
    if (this.chartCaixas?.nativeElement) {
      this.syncChartView(this.chartCaixas.nativeElement, 'caixas');
    }
    if (this.chartClientes?.nativeElement) {
      this.syncChartView(this.chartClientes.nativeElement, 'clientes');
    }
    if (this.chartDios?.nativeElement) {
      this.syncChartView(this.chartDios.nativeElement, 'dios');
    }
    if (this.chartSplitters?.nativeElement) {
      this.syncChartView(this.chartSplitters.nativeElement, 'splitters');
    }
    if (this.chartCondominios?.nativeElement) {
      this.syncChartView(this.chartCondominios.nativeElement, 'condominios');
    }
    if (this.chartEstacoes?.nativeElement) {
      this.syncChartView(this.chartEstacoes.nativeElement, 'estacoes');
    }
  }

  private syncChartView(el: HTMLElement, target: ChartViewTarget): void {
    const width = Math.max(200, el.clientWidth - 16);
    const height = Math.max(120, el.clientHeight - 8);
    const next: [number, number] = [width, height];

    if (target === 'cabos') {
      if (this.chartViewCabos[0] !== next[0] || this.chartViewCabos[1] !== next[1]) {
        this.chartViewCabos = next;
      }
      return;
    }
    if (target === 'caixas') {
      if (this.chartViewCaixas[0] !== next[0] || this.chartViewCaixas[1] !== next[1]) {
        this.chartViewCaixas = next;
      }
      return;
    }
    if (target === 'clientes') {
      if (this.chartViewClientes[0] !== next[0] || this.chartViewClientes[1] !== next[1]) {
        this.chartViewClientes = next;
      }
      return;
    }
    if (target === 'dios') {
      if (this.chartViewDios[0] !== next[0] || this.chartViewDios[1] !== next[1]) {
        this.chartViewDios = next;
      }
      return;
    }
    if (target === 'splitters') {
      if (this.chartViewSplitters[0] !== next[0] || this.chartViewSplitters[1] !== next[1]) {
        this.chartViewSplitters = next;
      }
      return;
    }
    if (target === 'condominios') {
      if (this.chartViewCondominios[0] !== next[0] || this.chartViewCondominios[1] !== next[1]) {
        this.chartViewCondominios = next;
      }
      return;
    }
    if (this.chartViewEstacoes[0] !== next[0] || this.chartViewEstacoes[1] !== next[1]) {
      this.chartViewEstacoes = next;
    }
  }

  private getOuterDialog(): HTMLElement | null {
    const host = this.modalDialog?.nativeElement?.closest('ngb-modal-window');
    return host?.querySelector(':scope > .modal-dialog') ?? null;
  }

  private schedulePositionOuterDialogCentered(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.positionOuterDialogCentered());
    });
  }

  private positionOuterDialogCentered(): void {
    const outer = this.getOuterDialog();
    const inner = this.modalDialog?.nativeElement;
    if (!outer || !inner) {
      return;
    }

    const pad = 8;
    const innerRect = inner.getBoundingClientRect();
    let w = innerRect.width;
    let h = innerRect.height;
    if (w < 1) {
      w = window.innerWidth * 0.95;
    }
    if (h < 1) {
      h = 400;
    }

    const left = Math.max(pad, (window.innerWidth - w) / 2);
    const top = Math.max(pad, (window.innerHeight - h) / 2);

    this.baseLeft = left;
    this.baseTop = top;
    this.xOffset = 0;
    this.yOffset = 0;
    this.currentX = 0;
    this.currentY = 0;

    outer.style.setProperty('position', 'fixed', 'important');
    outer.style.setProperty('margin', '0', 'important');
    outer.style.setProperty('left', `${left}px`, 'important');
    outer.style.setProperty('top', `${top}px`, 'important');
    outer.style.setProperty('right', 'auto', 'important');
    outer.style.setProperty('max-width', `${w}px`, 'important');
    outer.style.setProperty('width', `${w}px`, 'important');
    outer.style.setProperty('max-height', 'none', 'important');
    outer.style.setProperty('transform', 'none', 'important');
    inner.style.transform = 'none';
  }

  private clampDragOffset(): void {
    const outer = this.getOuterDialog();
    if (!outer) {
      return;
    }

    const pad = 8;
    const w = outer.offsetWidth || outer.getBoundingClientRect().width;
    const h = outer.offsetHeight || outer.getBoundingClientRect().height;
    const minX = pad - this.baseLeft;
    const maxX = window.innerWidth - w - pad - this.baseLeft;
    const minY = pad - this.baseTop;
    const maxY = window.innerHeight - h - pad - this.baseTop;

    this.currentX = Math.min(Math.max(this.currentX, minX), Math.max(minX, maxX));
    this.currentY = Math.min(Math.max(this.currentY, minY), Math.max(minY, maxY));
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
      this.clampDragOffset();
      this.xOffset = this.currentX;
      this.yOffset = this.currentY;
      const outer = this.getOuterDialog();
      if (outer) {
        outer.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.initialX = this.currentX;
    this.initialY = this.currentY;
    this.isDragging = false;
  }

  get tituloPoligono(): string {
    if (this._data.modoGeral) {
      return 'Relatório geral';
    }
    const lab = this._data.label?.trim();
    if (lab && lab !== '(_)' && lab !== 'N/A') {
      return lab;
    }
    return 'Polígono';
  }

  get idMetaLabel(): string {
    const id = this._data.id_meta;
    return id != null && Number.isFinite(id) && id > 0 ? String(id) : '—';
  }

  fechar(): void {
    this.activeModal.dismiss();
  }

  exportarCsv(): void {
    if (this.splittersLoading) {
      return;
    }

    this.csvErro = null;

    try {
      const csv = this.buildCsvExportContent();
      const fileName = this.buildRelatorioFileName('csv');
      this.downloadTextFile(csv, fileName, 'text/csv;charset=utf-8');
    } catch {
      this.csvErro = 'Erro ao gerar CSV.';
    }
  }

  private buildRelatorioFileName(extension: 'pdf' | 'csv'): string {
    const idPart = this._data.modoGeral
      ? 'mapa-geral'
      : this._data.id_meta != null && Number.isFinite(this._data.id_meta) && this._data.id_meta > 0
        ? String(this._data.id_meta)
        : 'poligono';
    const prefix = this._data.modoGeral ? 'relatorio-mapa' : 'relatorio-poligono';
    return `${prefix}-${idPart}-${Date.now()}.${extension}`;
  }

  private buildCsvExportContent(): string {
    const lines: string[] = [];

    lines.push(this.csvRow(['Relatório', this.tituloPoligono]));
    lines.push(this.csvRow(['id_meta', this.idMetaLabel]));
    lines.push(this.csvRow(['Gerado em', new Date().toLocaleString('pt-BR')]));
    lines.push('');

    lines.push(this.csvRow(['Secao', 'Categoria', 'Valor', 'Unidade']));

    const secoes: { titulo: string; unidade: string; dados: ChartDatum[] }[] = [
      { titulo: 'Cabos por metragem (m)', unidade: 'm', dados: this.cabosMetragem },
      { titulo: 'Caixas (CEO / CTO / CTOSP)', unidade: 'quantidade', dados: this.caixasTipo },
      { titulo: 'Clientes (Ativo / Desativado / Cancelado)', unidade: 'quantidade', dados: this.clientesStatus },
      { titulo: 'DIOs por capacidade', unidade: 'quantidade', dados: this.diosCapacidade },
      { titulo: 'Splitters por tipo', unidade: 'quantidade', dados: this.splittersTipo },
      { titulo: 'Condomínios', unidade: 'quantidade', dados: this.condominiosQuantidade },
      { titulo: 'Estações', unidade: 'quantidade', dados: this.estacoesQuantidade },
    ];

    for (const secao of secoes) {
      for (const entry of secao.dados) {
        lines.push(
          this.csvRow([
            secao.titulo,
            entry.name ?? '',
            String(entry.value ?? 0),
            secao.unidade,
          ]),
        );
      }
    }

    return `\uFEFF${lines.join('\r\n')}`;
  }

  private csvRow(cells: string[]): string {
    return cells.map((cell) => this.escapeCsvCell(cell)).join(',');
  }

  private escapeCsvCell(value: string): string {
    const text = value ?? '';
    if (/[",\r\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  private downloadTextFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  async exportarPdf(): Promise<void> {
    if (this.exportandoPdf || this.splittersLoading || !this.reportArea?.nativeElement) {
      return;
    }

    this.exportandoPdf = true;
    this.pdfErro = null;

    const reportEl = this.reportArea.nativeElement;
    const scrollParent = reportEl.closest('.modal-body') as HTMLElement | null;
    const prevScrollTop = scrollParent?.scrollTop ?? 0;
    const prevScrollLeft = scrollParent?.scrollLeft ?? 0;

    try {
      this.syncAllChartViews();
      await this.waitForNextPaint();

      if (scrollParent) {
        scrollParent.scrollTop = 0;
        scrollParent.scrollLeft = 0;
      }
      await this.waitForNextPaint();

      const reportSvg = this.buildReportSvg(reportEl);
      const [{ default: jsPDF }, { svg2pdf }] = await Promise.all([
        import('jspdf'),
        import('svg2pdf.js'),
      ]);

      const fileName = this.buildRelatorioFileName('pdf');

      try {
        const pdf = await this.buildPdfFromReportSvg(reportSvg, jsPDF, svg2pdf);
        pdf.save(fileName);
      } catch {
        const pdf = await this.buildPdfFromRasterSvg(reportSvg, jsPDF);
        pdf.save(fileName);
      }
    } catch {
      this.pdfErro = 'Erro ao gerar PDF.';
    } finally {
      if (scrollParent) {
        scrollParent.scrollTop = prevScrollTop;
        scrollParent.scrollLeft = prevScrollLeft;
      }
      this.exportandoPdf = false;
    }
  }

  private buildReportSvg(reportEl: HTMLElement): SVGSVGElement {
    const width = Math.max(reportEl.scrollWidth, reportEl.clientWidth, 1);
    const height = Math.max(reportEl.scrollHeight, reportEl.clientHeight, 1);
    const reportRect = reportEl.getBoundingClientRect();

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', String(width));
    bg.setAttribute('height', String(height));
    bg.setAttribute('fill', '#f1f5f9');
    svg.appendChild(bg);

    const items = reportEl.querySelectorAll('gridster-item');
    items.forEach((item, index) => {
      this.appendWidgetToReportSvg(svg, item as HTMLElement, reportRect, index);
    });

    return svg;
  }

  private appendWidgetToReportSvg(
    svg: SVGSVGElement,
    item: HTMLElement,
    reportRect: DOMRect,
    index: number,
  ): void {
    const card = item.querySelector('.widget-card') as HTMLElement | null;
    if (!card) {
      return;
    }

    const itemRect = item.getBoundingClientRect();
    if (itemRect.width < 1 || itemRect.height < 1) {
      return;
    }

    const x = itemRect.left - reportRect.left;
    const y = itemRect.top - reportRect.top;
    const w = itemRect.width;
    const h = itemRect.height;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${x},${y})`);

    const cardBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    cardBg.setAttribute('width', String(w));
    cardBg.setAttribute('height', String(h));
    cardBg.setAttribute('fill', '#ffffff');
    cardBg.setAttribute('stroke', '#dee2e6');
    cardBg.setAttribute('rx', '8');
    g.appendChild(cardBg);

    const titleText = card.querySelector('.widget-title')?.textContent?.trim() ?? '';
    if (titleText) {
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      title.setAttribute('x', '12');
      title.setAttribute('y', '22');
      title.setAttribute('fill', '#334155');
      title.setAttribute('font-size', '12');
      title.setAttribute('font-weight', '600');
      title.setAttribute('font-family', 'Inter, Arial, sans-serif');
      title.textContent = titleText;
      g.appendChild(title);

      const divider = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      divider.setAttribute('x1', '0');
      divider.setAttribute('y1', '36');
      divider.setAttribute('x2', String(w));
      divider.setAttribute('y2', '36');
      divider.setAttribute('stroke', '#e2e8f0');
      g.appendChild(divider);
    }

    const chartTop = 44;
    const chartPad = 8;
    const chartW = w - chartPad * 2;
    const chartH = h - chartTop - chartPad;
    const legendData = this.getLegendDataForWidget(index);
    const legendW = legendData.length > 0 ? Math.min(96, chartW * 0.38) : 0;

    if (legendData.length > 0) {
      this.appendDataLegend(g, legendData, chartPad, chartTop, legendW);
    }

    const chartSvg = card.querySelector('.widget-chart svg') as SVGSVGElement | null;
    if (chartSvg) {
      this.embedClonedSvg(g, chartSvg, chartPad + legendW, chartTop, chartW - legendW, chartH);
    }

    svg.appendChild(g);
  }

  private getLegendDataForWidget(index: number): ChartDatum[] {
    switch (index) {
      case 1:
        return this.caixasTipo;
      case 2:
        return this.clientesStatus;
      case 3:
        return this.diosCapacidade;
      default:
        return [];
    }
  }

  private appendDataLegend(
    parent: SVGGElement,
    data: ChartDatum[],
    x: number,
    y: number,
    maxWidth: number,
  ): void {
    const colors = this.colorScheme.domain ?? [];
    const lineH = 16;

    data.forEach((entry, i) => {
      const rowY = y + i * lineH + 10;
      const swatch = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      swatch.setAttribute('x', String(x));
      swatch.setAttribute('y', String(rowY - 8));
      swatch.setAttribute('width', '10');
      swatch.setAttribute('height', '10');
      swatch.setAttribute('fill', colors[i % colors.length] ?? '#629ef8');
      swatch.setAttribute('rx', '2');
      parent.appendChild(swatch);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(x + 14));
      label.setAttribute('y', String(rowY));
      label.setAttribute('fill', '#334155');
      label.setAttribute('font-size', '10');
      label.setAttribute('font-family', 'Inter, Arial, sans-serif');
      label.textContent = this.truncateLegendLabel(`${entry.name}: ${entry.value}`, maxWidth - 18);
      parent.appendChild(label);
    });
  }

  private truncateLegendLabel(text: string, maxPx: number): string {
    const maxChars = Math.max(8, Math.floor(maxPx / 6));
    if (text.length <= maxChars) {
      return text;
    }
    return `${text.slice(0, maxChars - 1)}…`;
  }

  private embedClonedSvg(
    parent: SVGGElement,
    source: SVGSVGElement,
    x: number,
    y: number,
    boxW: number,
    boxH: number,
  ): void {
    let srcW = source.width?.baseVal?.value ?? 0;
    let srcH = source.height?.baseVal?.value ?? 0;
    if (srcW < 1 || srcH < 1) {
      const r = source.getBoundingClientRect();
      srcW = r.width || 300;
      srcH = r.height || 200;
    }

    const scale = Math.min(boxW / srcW, boxH / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    const offsetX = x + (boxW - drawW) / 2;
    const offsetY = y + (boxH - drawH) / 2;

    const cloned = document.importNode(source, true) as SVGSVGElement;
    const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    wrapper.setAttribute('transform', `translate(${offsetX},${offsetY}) scale(${scale})`);
    wrapper.appendChild(cloned);
    parent.appendChild(wrapper);
  }

  private async buildPdfFromReportSvg(
    svgEl: SVGSVGElement,
    jsPDF: typeof import('jspdf').default,
    svg2pdfFn: typeof import('svg2pdf.js').svg2pdf,
  ): Promise<InstanceType<typeof jsPDF>> {
    const svgW = parseFloat(svgEl.getAttribute('width') || '800');
    const svgH = parseFloat(svgEl.getAttribute('height') || '500');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentTop = 22;
    const availW = pdfW - margin * 2;
    const availH = pdfH - contentTop - margin;
    const scale = Math.min(availW / svgW, availH / svgH);
    const drawW = svgW * scale;
    const drawH = svgH * scale;
    const x = (pdfW - drawW) / 2;
    const y = contentTop;

    pdf.setFontSize(12);
    pdf.text(`Relatório — ${this.tituloPoligono}`, pdfW / 2, 10, { align: 'center' });
    pdf.setFontSize(9);
    pdf.text(
      `id_meta: ${this.idMetaLabel} | Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      pdfW / 2,
      15,
      { align: 'center' },
    );

    await svg2pdfFn(svgEl, pdf, { x, y, width: drawW, height: drawH });
    return pdf;
  }

  private async buildPdfFromRasterSvg(
    svgEl: SVGSVGElement,
    jsPDF: typeof import('jspdf').default,
  ): Promise<InstanceType<typeof jsPDF>> {
    const svgString = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('svg raster'));
        img.src = url;
      });

      const svgW = parseFloat(svgEl.getAttribute('width') || '800');
      const svgH = parseFloat(svgEl.getAttribute('height') || '500');
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(svgW * scale);
      canvas.height = Math.round(svgH * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('canvas');
      }
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentTop = 22;
      const availW = pdfW - margin * 2;
      const availH = pdfH - contentTop - margin;
      const pxToMm = 0.264583;
      const imgWmm = canvas.width * pxToMm;
      const imgHmm = canvas.height * pxToMm;
      const fit = Math.min(availW / imgWmm, availH / imgHmm);
      const drawW = imgWmm * fit;
      const drawH = imgHmm * fit;
      const x = (pdfW - drawW) / 2;
      const y = contentTop;

      pdf.setFontSize(12);
      pdf.text(`Relatório — ${this.tituloPoligono}`, pdfW / 2, 10, { align: 'center' });
      pdf.setFontSize(9);
      pdf.text(
        `id_meta: ${this.idMetaLabel} | Gerado em: ${new Date().toLocaleString('pt-BR')}`,
        pdfW / 2,
        15,
        { align: 'center' },
      );
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, drawW, drawH);
      return pdf;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  private waitForNextPaint(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  }
}
