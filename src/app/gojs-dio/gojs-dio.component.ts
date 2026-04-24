import {
  Component,
  Inject,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import * as go from 'gojs';
import jsPDF from 'jspdf';

import { BandejasService } from '../servico/bandejas.service';
import { DioConexDioService } from '../servico/dio-conex-dio.service';
import { AuthService } from '../servico/auth.service';
import { Cabo_TipoService } from '../servico/cabo-tipo.service';
import { Bandejas } from '../modelo/Bandejas';
import { Cabo_tipo } from '../modelo/Cabo_tipo';
import { gojsCableStencilRegistry } from '../gojs-shared/gojs-cable-stencil-registry';
import { ConexaoBandejaFibraService } from '../servico/conexao-bandeja-fibra.service';
import { UpdateExcluiFusaoDioService } from '../servico/update-exclui-fusao-dio.service';

export interface GojsDioDialogData {
  id_meta: number;
  /** Número de fibras da face do DIO (ex.: 12, 36). Define qual stencil dio-12-f / dio-36-f usar. */
  dioFiberCapacity?: number;
}

export interface CaboBandejaItem {
  bandeja: string;
  valorRaw: string;
  livre: boolean;
  idMetaCabo?: number;
  ponta?: 'A' | 'B';
  formatoInvalido?: boolean;
  tipoCabo?: Cabo_tipo;
}

@Component({
  selector: 'app-gojs-dio',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  templateUrl: './gojs-dio.component.html',
  styleUrls: ['./gojs-dio.component.css'],
})
export class GojsDioComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('diagramDiv') diagramDiv: ElementRef<HTMLDivElement> | null = null;

  private diagram: go.Diagram | null = null;
  private gojsModelChangedListener: ((e: go.ChangedEvent) => void) | null = null;
  private readonly registry = gojsCableStencilRegistry;
  private static readonly GOJS_PDF_EXPORT_MAX_PX = 16384;
  /** Desligar para `false` quando o problema estiver isolado. */
  private static readonly GOJS_DIO_DEBUG_LOGS = true;

  /** Margem ao topo do documento (coordenadas GoJS); coluna única. */
  private static readonly CABO_LAYOUT_TOP = 320;
  /** Canto superior esquerdo da face DIO (eixo X). */
  private static readonly DIO_FACE_LOC_X = 40;
  /** Espaço horizontal entre a borda direita da face DIO e a coluna de cabos. */
  private static readonly DIO_TO_CABLE_GAP = 1000; // distancia entre dio e cabos
  /** Se `width` do modelo da face não for válido. */
  private static readonly DIO_FACE_WIDTH_FALLBACK = 70;
  /** Espaço extra entre um cabo e o seguinte (além da altura do stencil). */
  private static readonly CABO_LAYOUT_GAP = 48;

  loading = true;
  /** True durante redraw: não remove o contentor do DOM (padrão gojs-demo); só desativa botões. */
  redrawBusy = false;
  error: string | null = null;
  itens: CaboBandejaItem[] = [];
  diagramInitialized = false;
  initializationError: string | null = null;

  private dataReady = false;
  private viewReady = false;

  /** Arrastar o MatDialog pelo header (alinhado a gojs-demo). */
  private modalElement: HTMLElement | null = null;
  private modalHeaderElement: HTMLElement | null = null;
  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private dragListenersAttached = false;

  private readonly boundDragMove = (e: MouseEvent) => this.dragMove(e);
  private readonly boundDragEnd = (e: MouseEvent) => this.dragEnd(e);
  private readonly onHeaderMouseDown = (e: MouseEvent) => this.dragStart(e);

  constructor(
    public dialogRef: MatDialogRef<GojsDioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GojsDioDialogData,
    private bandejasService: BandejasService,
    private dioConexDioService: DioConexDioService,
    private authService: AuthService,
    private caboTipoService: Cabo_TipoService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private elementRef: ElementRef<HTMLElement>,
    private conexaoBandejaFibraService: ConexaoBandejaFibraService,
    private updateExcluiFusaoDioService: UpdateExcluiFusaoDioService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.loadBandejasAndTipos();
      this.dataReady = true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.error = msg;
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
      // #diagramDiv está dentro de *ngIf; ViewChild só existe após renderizar.
      queueMicrotask(() => {
        this.tryInitDiagram();
        if (!this.diagram) {
          setTimeout(() => this.tryInitDiagram(), 0);
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryInitDiagram();
    this.setupDragFunctionality();
  }

  ngOnDestroy(): void {
    this.teardownDragListeners();
    this.disposeDiagram();
  }

  private setupDragFunctionality(): void {
    setTimeout(() => {
      this.modalElement = this.elementRef.nativeElement.closest(
        '.mat-mdc-dialog-container',
      );
      this.modalHeaderElement = this.elementRef.nativeElement.querySelector(
        '.modal-header',
      );
      if (
        this.dragListenersAttached ||
        !this.modalHeaderElement ||
        !this.modalElement
      ) {
        return;
      }
      this.modalHeaderElement.addEventListener(
        'mousedown',
        this.onHeaderMouseDown,
      );
      document.addEventListener('mousemove', this.boundDragMove);
      document.addEventListener('mouseup', this.boundDragEnd);
      this.dragListenersAttached = true;
    }, 0);
  }

  private teardownDragListeners(): void {
    if (!this.dragListenersAttached) {
      return;
    }
    if (this.modalHeaderElement) {
      this.modalHeaderElement.removeEventListener(
        'mousedown',
        this.onHeaderMouseDown,
      );
    }
    document.removeEventListener('mousemove', this.boundDragMove);
    document.removeEventListener('mouseup', this.boundDragEnd);
    if (this.modalElement) {
      this.modalElement.classList.remove('dragging');
    }
    this.dragListenersAttached = false;
    this.isDragging = false;
    this.modalHeaderElement = null;
    this.modalElement = null;
  }

  private dragStart(event: MouseEvent): void {
    if (
      !this.modalHeaderElement ||
      (event.target !== this.modalHeaderElement &&
        !this.modalHeaderElement.contains(event.target as Node))
    ) {
      return;
    }
    this.initialX = event.clientX - this.currentX;
    this.initialY = event.clientY - this.currentY;
    this.isDragging = true;
    this.modalElement?.classList.add('dragging');
  }

  private dragMove(event: MouseEvent): void {
    if (!this.isDragging || !this.modalElement) {
      return;
    }
    event.preventDefault();
    this.currentX = event.clientX - this.initialX;
    this.currentY = event.clientY - this.initialY;
    this.setTranslate(this.currentX, this.currentY, this.modalElement);
  }

  private dragEnd(_event: MouseEvent): void {
    if (!this.isDragging) {
      return;
    }
    this.initialX = this.currentX;
    this.initialY = this.currentY;
    this.isDragging = false;
    this.modalElement?.classList.remove('dragging');
  }

  private setTranslate(xPos: number, yPos: number, el: HTMLElement): void {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  }

  /** Liberta o GoJS como em gojs-demo `limparDiagrama` (div + instância), para poder voltar a `initializeDiagram`. */
  private disposeDiagram(): void {
    if (this.diagram) {
      if (this.gojsModelChangedListener) {
        this.diagram.removeModelChangedListener(this.gojsModelChangedListener);
        this.gojsModelChangedListener = null;
      }
      this.diagram.div = null;
      this.diagram = null;
    }
    this.diagramInitialized = false;
    this.initializationError = null;
  }

  private finishRedrawBusy(): void {
    this.redrawBusy = false;
    this.cdr.detectChanges();
  }

  private tryInitDiagram(): void {
    if (!this.viewReady || !this.dataReady || this.loading) {
      return;
    }
    if (this.error) {
      return;
    }
    if (!this.diagramDiv?.nativeElement || this.diagram) {
      return;
    }
    this.initializeDiagram();
  }

  private async loadBandejasAndTipos(): Promise<void> {
    const idCity = this.authService.getIdCity();
    if (idCity == null) {
      this.error = 'id_city não disponível (sessão).';
      return;
    }
    const ret = await firstValueFrom(
      this.bandejasService.selecionarPorDio(idCity, this.data.id_meta),
    );
    const bandejasData: Bandejas | null = Array.isArray(ret)
      ? (ret[0] as Bandejas)
      : (ret as { response?: Bandejas[] })?.response?.[0] ?? (ret as Bandejas);

    if (!bandejasData) {
      this.error = 'Nenhum dado de bandejas retornado.';
      return;
    }

    const keys: (keyof Bandejas)[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
    this.itens = keys.map((key) => {
      const valor = bandejasData[key];
      const v = valor != null ? String(valor) : '';
      const parsed = this.parseValorBandeja(v);
      return {
        bandeja: key,
        valorRaw: v,
        ...parsed,
      };
    });

    const ocupados = this.itens.filter(
      (i) => !i.livre && !i.formatoInvalido && i.idMetaCabo != null,
    );
    await Promise.all(
      ocupados.map(async (item) => {
        const tipos = await this.caboTipoService.selecionarAsync(item.idMetaCabo!); // le o tipo de cabos
        item.tipoCabo = tipos && tipos.length > 0 ? tipos[0] : undefined;
      }),
    );
  }

  private parseValorBandeja(
    valor: string,
  ): Omit<CaboBandejaItem, 'bandeja' | 'valorRaw' | 'tipoCabo'> {
    if (!valor || !valor.trim()) {
      return { livre: true };
    }
    const t = valor.trim().toUpperCase();
    if (t === '' || t === 'ZERO') {
      return { livre: true };
    }
    const match = valor.match(/^cabo(\d+)([AB])$/i);
    if (!match) {
      return { livre: false, formatoInvalido: true };
    }
    return {
      livre: false,
      idMetaCabo: parseInt(match[1], 10),
      ponta: match[2].toUpperCase() as 'A' | 'B',
    };
  }

  /** API pode devolver strings; selectCableModelByCapacity usa === em codigo. */
  private normalizeTipoNumericos(t: Cabo_tipo): {
    capacidade: number;
    codigo: number;
    tubo: number;
  } {
    const cap = Number(t.capacidade);
    const cod = Number(t.codigo);
    const tubo = Number(t.tubo);
    return {
      capacidade: Number.isFinite(cap) && cap > 0 ? cap : 12,
      codigo: Number.isFinite(cod) ? cod : 2,
      tubo: Number.isFinite(tubo) ? tubo : 6,
    };
  }

  /** Altura do stencil para espaçamento; coage strings vindas do modelo. */
  private stackHeightFromModel(modelo: go.ObjectData): number {
    const mh = Number(modelo['height']);
    return Number.isFinite(mh) && mh > 0 ? mh : 200;
  }
  

  /**
   * Posição X da coluna de cabos: após a face DIO + gap, para não sobrepor portos D/F.
   */
  private getCableColumnX(): number {
    const cap = this.getDioFiberCapacity();
    const dioModel = this.registry.getDioFaceModelDefinitionForCapacity(cap);
    const w = Number(dioModel['width']);
    const dioWidth =
      Number.isFinite(w) && w > 0 ? w : GojsDioComponent.DIO_FACE_WIDTH_FALLBACK;
    return (
      GojsDioComponent.DIO_FACE_LOC_X + dioWidth + GojsDioComponent.DIO_TO_CABLE_GAP
    );
  }

  /** Capacidade (fibras) do DIO aberto; usada só para escolher o stencil da face. */
  private getDioFiberCapacity(): number {
    const c = this.data.dioFiberCapacity;
    if (c == null) {
      return 12;
    }
    const n = Number(c);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : 12;
  }

  /**
   * Primeira linha de `response[]` da API `/conex_dio` (pares Fk / FNk).
   */
  private extractFirstConexRow(payload: unknown): Record<string, string> | null {
    if (payload == null) {
      return null;
    }
    if (Array.isArray(payload) && payload.length > 0) {
      const r0 = payload[0];
      if (r0 && typeof r0 === 'object' && !Array.isArray(r0)) {
        return this.rowToStringRecord(r0 as Record<string, unknown>);
      }
    }
    if (typeof payload === 'object' && payload !== null && 'response' in payload) {
      const resp = (payload as { response?: unknown }).response;
      if (Array.isArray(resp) && resp.length > 0) {
        const r0 = resp[0];
        if (r0 && typeof r0 === 'object' && !Array.isArray(r0)) {
          return this.rowToStringRecord(r0 as Record<string, unknown>);
        }
      }
    }
    return null;
  }

  private rowToStringRecord(o: Record<string, unknown>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (v != null && String(v).trim() !== '') {
        out[k] = String(v);
      }
    }
    return out;
  }

  /**
   * Extrai só a bandeja a partir do valor do campo Fk (ex.: `dioc1_t1`).
   * O sufixo `_tX` é referência de tabela no backend; não define porto na face DIO.
   */
  private parseFkValueToCableKey(rawF: string): string | null {
    const s = String(rawF).trim();
    if (!s) {
      return null;
    }
    const m = s.match(/^dioc(\d+)(?:_t\d+)?$/i);
    if (!m) {
      return null;
    }
    const n = parseInt(m[1], 10);
    if (!Number.isFinite(n) || n < 1 || n > 6) {
      return null;
    }
    return `C${n}`;
  }

  private fibraNumeroToPort(fn: string): string | null {
    const n = parseInt(String(fn).trim(), 10);
    if (!Number.isFinite(n) || n < 1) {
      return null;
    }
    return `F${n}`;
  }

  private getMaxFiberForCableKey(cableKey: string): number {
    const item = this.itens.find((i) => i.bandeja === cableKey);
    if (!item?.tipoCabo) {
      return 9999;
    }
    const cap = Number(item.tipoCabo.capacidade);
    return Number.isFinite(cap) && cap > 0 ? cap : 9999;
  }

  /**
   * Ligações cabo (C*) → face DIO a partir de uma linha F1/FN1…
   * O índice k do par Fk/FNk é o conector na face → Dk (uma fibra ↔ um conector).
   * Sentido: from cabo, to dioFace (igual ao LinkDrawn habitual no DIO).
   */
  private buildLinkDataFromConexRow(
    row: Record<string, string>,
    capacidade: number,
  ): go.ObjectData[] {
    const out: go.ObjectData[] = [];
    for (let k = 1; k <= capacidade; k++) {
      const fk = `F${k}`;
      const fnk = `FN${k}`;
      const rawF = row[fk]?.trim() ?? '';
      const rawFN = row[fnk]?.trim() ?? '';
      if (!rawF || !rawFN) {
        continue;
      }
      const cableKey = this.parseFkValueToCableKey(rawF);
      if (!cableKey) {
        continue;
      }
      const cablePort = this.fibraNumeroToPort(rawFN);
      if (!cablePort) {
        continue;
      }
      const fibNum = parseInt(rawFN, 10);
      const maxF = this.getMaxFiberForCableKey(cableKey);
      if (Number.isFinite(fibNum) && fibNum > maxF) {
        continue;
      }
      out.push({
        from: cableKey,
        fromPort: cablePort,
        to: 'dioFace',
        toPort: `D${k}`,
      });
    }
    return out;
  }

  private initializeDiagram(): void {
    const el = this.diagramDiv?.nativeElement;
    if (!el) { //Se não existir, return: não cria diagrama
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      try {
        // Opções alinhadas a gojs-demo (ports nomeados F*, D*, linking/relinking).
        this.diagram = new go.Diagram(el, { // liga o GoJS ao div.  tipo assim, ele faz o div la do template ser o diagram do gojs
          'undoManager.isEnabled': true,
          'toolManager.mouseWheelBehavior': go.WheelMode.Zoom,
          'grid.visible': true,
          'grid.gridCellSize': new go.Size(20, 20),
          allowDrop: true,
          allowLink: true,
          allowRelink: true,
          initialAutoScale: go.AutoScale.Uniform,
          initialContentAlignment: go.Spot.Center,
          maxScale: 2,
          minScale: 0.2,
          padding: new go.Margin(120, 40, 40, 40),
          'linkingTool.isUnconnectedLinkValid': false,
          'linkingTool.portGravity': 20,
          'relinkingTool.isUnconnectedLinkValid': false,
          'relinkingTool.portGravity': 20,
          'relinkingTool.fromHandleArchetype': new go.Shape('Diamond', {
            segmentIndex: 0,
            cursor: 'pointer',
            desiredSize: new go.Size(8, 8),
            fill: 'tomato',
            stroke: 'darkred',
          }),
          'relinkingTool.toHandleArchetype': new go.Shape('Diamond', {
            segmentIndex: -1,
            cursor: 'pointer',
            desiredSize: new go.Size(8, 8),
            fill: 'darkred',
            stroke: 'tomato',
          }),
          positionComputation: (_diagram: go.Diagram, pt: go.Point) =>
            new go.Point(Math.max(-3000, pt.x), Math.max(0, pt.y)),
        });

        this.diagram.toolManager.rotatingTool.isEnabled = true;
        this.diagram.toolManager.rotatingTool.snapAngleMultiple = 15; //Rotação de nós ativa, com “snap” a múltiplos de 15°.
        this.diagram.commandHandler.zoomFactor = 1.3;

        this.diagram.nodeTemplateMap = this.registry.buildNodeTemplateMap(); //template (face DIO, cabos, texto, etc.) vindo do gojsCableStencilRegistry.
        // Traço e seta explícitos (como gojs-demo); sem isto o link pode existir no modelo mas ser difícil de ver.
        this.diagram.linkTemplate = new go.Link({
          routing: go.Routing.Normal,
          curve: go.Curve.None,
          corner: 8,
          toShortLength: 5,
          reshapable: true,
          resegmentable: true,
          fromEndSegmentLength: 25,
          toEndSegmentLength: 25,
          relinkableFrom: true,
          relinkableTo: true,
          contextMenu: go.GraphObject.build('ContextMenu', {
            alignment: go.Spot.Left,
            alignmentFocus: go.Spot.Right,
          }).add(
            go.GraphObject.build('ContextMenuButton', {
              click: (e: go.InputEvent, obj: go.GraphObject) => {
                const link = this.getLinkFromContextMenu(e, obj);
                if (link) {
                  this.onExcluirFusaoDioContextClick(link);
                }
              },
            }).add(
              new go.TextBlock(' ❌   Excluir Fusão', {
                textAlign: 'left',
                alignment: go.Spot.Left,
              }),
            ),
          ),
        })
          .add(
            new go.Shape({
              strokeWidth: 3.5,
              stroke: '#2196F3',
              name: 'LINKSHAPE',
            }),
          )
          .add(
            new go.Shape({
              toArrow: 'Standard',
              stroke: null,
              fill: '#2F4F4F',
              scale: 0.8,
              name: 'ARROWSHAPE',
            }),
          );

        const model = new go.GraphLinksModel({
          linkFromPortIdProperty: 'fromPort',
          linkToPortIdProperty: 'toPort',
        });
        model.nodeDataArray = this.buildNodeDataArray();
        model.linkDataArray = []; //começa vazio; as fusões da API entram depois em loadAndApplyDioFusoes
        this.diagram.model = model; //atribui o modelo ao diagrama
        this.registerGojsDioDebugListeners(); //LinkDrawn e mudanças no modelo (quando o debug está ligado).
        this.registerDioCableLinkDrawnListener();

        setTimeout(() => {
          if (this.diagram) {
            this.applyVerticalCableLayout();//alinha cabos na coluna vertical.
            this.diagram.zoomToFit();
          }
          setTimeout(() => {
            void this.loadAndApplyDioFusoes();//carrega fusões da API e adiciona ao modelo.
          }, 200);
        }, 0);

        this.ngZone.run(() => {
          this.diagramInitialized = true;
          this.initializationError = null;
          this.cdr.markForCheck();
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.ngZone.run(() => {
          this.initializationError = msg;
          this.cdr.markForCheck();
        });
      }
    });
  }

  // --- Chamados por initializeDiagram() ---
  // --- constroi o array de nodes para o diagrama um no do conector dos dios depois c1 c2 c3 c4 c5 c6
  private buildNodeDataArray(): go.ObjectData[] {
    const nodes: go.ObjectData[] = []; // Cria nodes vazio; tudo o que se segue faz push para aí.
    const cap = this.getDioFiberCapacity();// capacidade em fibras (12, 36, …) via getDioFiberCapacity()
    const dioModel = this.registry.getDioFaceModelDefinitionForCapacity(cap);//definição do stencil da face nó unico 
    nodes.push({
      ...dioModel,
      key: 'dioFace',
      loc: `${GojsDioComponent.DIO_FACE_LOC_X} ${GojsDioComponent.CABO_LAYOUT_TOP}`,//loc coloca a face na posição fixa (X/Y constantes da classe
    });

    let yCursor = GojsDioComponent.CABO_LAYOUT_TOP;
    const x = this.getCableColumnX();

    for (const row of this.itens) {
      if (row.livre || row.formatoInvalido || row.idMetaCabo == null) {
        continue;
      }

      let modelo: go.ObjectData; // escolhe o modelo do cabo a partir do tipo de cabo
      if (row.tipoCabo) {
        const n = this.normalizeTipoNumericos(row.tipoCabo);
        modelo = this.registry.selectCableModelByCapacity(
          n.capacidade,
          n.codigo,
          n.tubo,
          true,
        );
      } else {
        modelo = this.registry.selectCableModelByCapacity(12, 2, 6, true);
      }

      const h = this.stackHeightFromModel(modelo);
      const y = yCursor;
      yCursor += h + GojsDioComponent.CABO_LAYOUT_GAP;

      const idTag = `cabo${row.idMetaCabo}${row.ponta ?? ''}`;
      const labelCabo = row.tipoCabo?.Label_cabo?.trim();
      const label = labelCabo ? `${labelCabo}\n${idTag}` : idTag;

      nodes.push({
        ...modelo,
        key: row.bandeja,
        loc: `${x} ${y}`,
        labelText: label,
      });
    }

    nodes.push({  // adiciona o titulo do diagrama fica em branco na pagina
      key: 'title',
      category: 'text',
      text: `DIO id_meta ${this.data.id_meta} — ${cap}F — bandejas`,
      loc: `${GojsDioComponent.DIO_FACE_LOC_X} 40`,
      layerName: 'Foreground',
    });

    return nodes;
  }
  // --- registra eventos de debug (quando o debug está ligado).
  // ---log no consol
  private registerGojsDioDebugListeners(): void {
    if (!GojsDioComponent.GOJS_DIO_DEBUG_LOGS || !this.diagram) {
      return;
    }

    const diagram = this.diagram;

    diagram.addDiagramListener('LinkDrawn', (e: go.DiagramEvent) => {
      const link = e.subject as go.Link;
      if (!(link instanceof go.Link)) {
        return;
      }
      const fromNode = link.fromNode;
      const toNode = link.toNode;
      const fromPort = link.fromPort;
      const toPort = link.toPort;
      const fromPortId = fromPort?.portId ?? '';
      const toPortId = toPort?.portId ?? '';
      const fromData = fromNode?.data as go.ObjectData | undefined;
      const toData = toNode?.data as go.ObjectData | undefined;
      const fromKey = fromData?.['key'];
      const toKey = toData?.['key'];
      console.log('[GOJS-DIO] LinkDrawn', {
        fromKey,
        toKey,
        fromPortId,
        toPortId,
        linkData: link.data,
      });
    });

    this.gojsModelChangedListener = (e: go.ChangedEvent) => {
      if (!e.isTransactionFinished || !e.model) {
        return;
      }
      const model = e.model as go.GraphLinksModel;
      const links = model.linkDataArray as go.ObjectData[];
      const linkCount = Array.isArray(links) ? links.length : 0;
      const pn = e.propertyName;
      const propertyName = typeof pn === 'string' ? pn : String(pn);
      const linkSummary = Array.isArray(links)
        ? links.map((ld) => ({
            from: ld?.['from'],
            to: ld?.['to'],
            fromPort: ld?.['fromPort'],
            toPort: ld?.['toPort'],
          }))
        : [];

      console.log('[GOJS-DIO] ModelChanged (transaction finished)', {
        propertyName,
        transactionName: e.oldValue,
        linkDataArrayLength: linkCount,
        links: linkSummary,
      });

      try {
        const inc = model.toIncrementalJson(e);
        const truncated =
          inc.length > 500 ? `${inc.slice(0, 500)}…` : inc;
        console.log('[GOJS-DIO] ModelChanged incremental (truncated)', truncated);
      } catch {
        // incremental JSON pode falhar em casos extremos; ignorar em debug
      }
    };

    diagram.addModelChangedListener(this.gojsModelChangedListener);
  }

  /**
   * Força coluna única: canto superior esquerdo em (cableColumnX, y) por cabo,
   * para o `loc` não ser lido como centro ou outro spot.
   */
  private applyVerticalCableLayout(): void {
    if (!this.diagram) {
      return;
    }
    const d = this.diagram;
    d.startTransaction('Vertical cable layout');
    try {
      let y = GojsDioComponent.CABO_LAYOUT_TOP;
      const x = this.getCableColumnX();
      for (const row of this.itens) {
        if (row.livre || row.formatoInvalido || row.idMetaCabo == null) {
          continue;
        }
        const node = d.findNodeForKey(row.bandeja);
        if (!node) {
          continue;
        }
        node.locationSpot = go.Spot.TopLeft;
        node.position = new go.Point(x, y);
        const h = this.stackHeightFromModel(node.data as go.ObjectData);
        y += h + GojsDioComponent.CABO_LAYOUT_GAP;
      }
      d.requestUpdate();
    } finally {
      d.commitTransaction();
    }
  }

  private parsePortDIndex(portId: string): number | null {
    const m = /^D(\d+)$/i.exec(String(portId ?? '').trim());
    if (!m) {
      return null;
    }
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  private parsePortFIndex(portId: string): number | null {
    const m = /^F(\d+)$/i.exec(String(portId ?? '').trim());
    if (!m) {
      return null;
    }
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  /**
   * Classifica a ligação DIO–cabo: ignorar, portos inválidos, ou OK com fibras.
   * (Usado em LinkDrawn e no menu "Excluir Fusão".)
   */
  private analyzeDioCableLink(
    link: go.Link,
  ):
    | { type: 'skip' }
    | { type: 'bad_ports' }
    | { type: 'ok'; cableKey: string; fibraDio: number; fibraCabo: number } {
    const fromNode = link.fromNode;
    const toNode = link.toNode;
    const fromPort = link.fromPort;
    const toPort = link.toPort;
    const fromData = fromNode?.data as go.ObjectData | undefined;
    const toData = toNode?.data as go.ObjectData | undefined;
    const fromKey = fromData?.['key'];
    const toKey = toData?.['key'];

    if (fromKey === 'title' || toKey === 'title') {
      return { type: 'skip' };
    }

    const fromPortId = fromPort?.portId ?? '';
    const toPortId = toPort?.portId ?? '';
    if (
      fromKey === 'dioFace' &&
      typeof toKey === 'string' &&
      /^C[1-6]$/.test(toKey)
    ) {
      const fibraDio = this.parsePortDIndex(fromPortId);
      const fibraCabo = this.parsePortFIndex(toPortId);
      if (fibraDio == null || fibraCabo == null) {
        return { type: 'bad_ports' };
      }
      return { type: 'ok', cableKey: toKey, fibraDio, fibraCabo };
    }
    if (
      toKey === 'dioFace' &&
      typeof fromKey === 'string' &&
      /^C[1-6]$/.test(fromKey)
    ) {
      const fibraDio = this.parsePortDIndex(toPortId);
      const fibraCabo = this.parsePortFIndex(fromPortId);
      if (fibraDio == null || fibraCabo == null) {
        return { type: 'bad_ports' };
      }
      return { type: 'ok', cableKey: fromKey, fibraDio, fibraCabo };
    }
    return { type: 'skip' };
  }

  private registerDioCableLinkDrawnListener(): void {
    if (!this.diagram) {
      return;
    }
    this.diagram.addDiagramListener('LinkDrawn', (e: go.DiagramEvent) => {
      const link = e.subject as go.Link;
      if (!(link instanceof go.Link)) {
        return;
      }
      void this.handleDioCableLinkDrawnFusao(link);
    });
  }

  private removeDioLinkAfterFailedFusao(link: go.Link): void {
    const d = link.diagram;
    if (!d?.model) {
      return;
    }
    const data = link.data as go.ObjectData | null;
    if (!data) {
      return;
    }
    const model = d.model as go.GraphLinksModel;
    d.startTransaction('remove link after failed DIO fusion');
    try {
      model.removeLinkData(data);
    } finally {
      d.commitTransaction();
    }
  }

  /**
   * Conta ligações que usam um dado nó+porta em qualquer extremo (from ou to).
   * O sentido do desenho (cabo→DIO vs DIO→cabo) altera from/to no modelo; ocupação da
   * fibra do cabo (C#/F#) e do conector na face (dioFace/D#) deve ser verificada nos dois lados.
   */
  private countLinksUsingNodePort(
    model: go.GraphLinksModel,
    nodeKey: string,
    portId: string,
  ): number {
    const arr = model.linkDataArray as go.ObjectData[];
    if (!Array.isArray(arr)) {
      return 0;
    }
    let n = 0;
    for (const ld of arr) {
      const fromMatch =
        ld['from'] === nodeKey && ld['fromPort'] === portId;
      const toMatch = ld['to'] === nodeKey && ld['toPort'] === portId;
      if (fromMatch || toMatch) {
        n++;
      }
    }
    return n;
  }

  /** Link desenhado: persistir fusão DIO↔cabo via API (sentido qualquer). */
  private async handleDioCableLinkDrawnFusao(link: go.Link): Promise<void> {
    const analyzed = this.analyzeDioCableLink(link);
    if (analyzed.type === 'skip') {
      return;
    }

    const fail = (msg: string): void => {
      this.ngZone.run(() => {
        this.removeDioLinkAfterFailedFusao(link);
        this.snackBar.open(msg, 'OK', { duration: 5000 });
      });
    };

    if (analyzed.type === 'bad_ports') {
      fail('Portos inválidos (use D# na face e F# no cabo).');
      return;
    }

    const { cableKey, fibraDio, fibraCabo } = analyzed;

    const model = link.diagram?.model as go.GraphLinksModel | undefined;
    const caboPortId = `F${fibraCabo}`;
    const dioPortId = `D${fibraDio}`;
    if (model) {
      const caboUsos = this.countLinksUsingNodePort(model, cableKey, caboPortId);
      const dioUsos = this.countLinksUsingNodePort(model, 'dioFace', dioPortId);
      if (caboUsos > 1 || dioUsos > 1) {
        this.ngZone.run(() => {
          this.removeDioLinkAfterFailedFusao(link);
          const msg =
            caboUsos > 1
              ? 'Esta fibra do cabo já está conectada. Não é possível criar outra ligação a partir desta porta.'
              : 'Este conector na face do DIO já está em uso. Escolha outro conector.';
          alert(msg);
        });
        return;
      }
    }

    const item = this.itens.find((i) => i.bandeja === cableKey);
    if (!item || item.livre || item.formatoInvalido || item.idMetaCabo == null) {
      fail('Bandeja sem cabo válido — fusão não registada.');
      return;
    }
    if (!item.ponta) {
      fail('Ponta do cabo indisponível (A/B).');
      return;
    }

    const dioCap = this.getDioFiberCapacity();
    if (fibraDio < 1 || fibraDio > dioCap) {
      fail(`Fibra DIO deve estar entre 1 e ${dioCap}.`);
      return;
    }

    const maxFib = this.getMaxFiberForCableKey(cableKey);
    if (fibraCabo < 1 || fibraCabo > maxFib) {
      fail(`Fibra do cabo não é válida para esta bandeja (máx. ${maxFib}).`);
      return;
    }

    try {
      const res = await firstValueFrom(
        this.conexaoBandejaFibraService.conectar({
          fibra_dio: fibraDio,
          fibra_cabo: fibraCabo,
          numero_bandeja: cableKey,
          idmeta_dio: this.data.id_meta,
          idmeta_cabo: item.idMetaCabo,
          Ponta_cabo: item.ponta,
        }),
      );
      this.ngZone.run(() => {
        if (res.success) {
          this.snackBar.open(
            res.message?.trim() || 'Fusão DIO/cabo registada.',
            'OK',
            { duration: 4000 },
          );
        } else {
          this.removeDioLinkAfterFailedFusao(link);
          this.snackBar.open(
            res.message?.trim() || 'Falha ao registar fusão DIO/cabo.',
            'OK',
            { duration: 5000 },
          );
        }
        this.cdr.markForCheck();
      });
    } catch (e: unknown) {
      const msg =
        typeof e === 'string' ? e : 'Falha ao registar fusão DIO/cabo.';
      this.ngZone.run(() => {
        this.removeDioLinkAfterFailedFusao(link);
        this.snackBar.open(msg, 'OK', { duration: 5000 });
        console.warn('[GOJS-DIO] conexao_bandeja_fibra:', e);
        this.cdr.markForCheck();
      });
    }
  }

  private getLinkFromContextMenu(
    e: go.InputEvent,
    obj: go.GraphObject,
  ): go.Link | null {
    if (obj.part && (obj.part as go.Adornment).adornedPart instanceof go.Link) {
      return (obj.part as go.Adornment).adornedPart as go.Link;
    }
    if (obj.part && obj.part.part instanceof go.Link) {
      return obj.part.part as go.Link;
    }
    if (e.diagram && e.diagram.selection.first() instanceof go.Link) {
      return e.diagram.selection.first() as go.Link;
    }
    if (obj.part instanceof go.Link) {
      return obj.part as go.Link;
    }
    return null;
  }

  private onExcluirFusaoDioContextClick(link: go.Link): void {
    this.ngZone.run(() => {
      const analyzed = this.analyzeDioCableLink(link);
      if (analyzed.type === 'skip') {
        this.snackBar.open(
          'Só é possível excluir fusões entre a face DIO e uma bandeja (C1–C6).',
          'OK',
          { duration: 5000 },
        );
        return;
      }
      if (analyzed.type === 'bad_ports') {
        this.snackBar.open(
          'Portos inválidos (use D# na face e F# no cabo).',
          'OK',
          { duration: 5000 },
        );
        return;
      }
      const { cableKey, fibraDio, fibraCabo } = analyzed;
      const item = this.itens.find((i) => i.bandeja === cableKey);
      if (!item || item.livre || item.formatoInvalido || item.idMetaCabo == null) {
        this.snackBar.open('Bandeja sem cabo válido — não é possível excluir.', 'OK', {
          duration: 5000,
        });
        return;
      }
      if (!item.ponta) {
        this.snackBar.open('Ponta do cabo indisponível (A/B).', 'OK', {
          duration: 5000,
        });
        return;
      }
      const dioCap = this.getDioFiberCapacity();
      if (fibraDio < 1 || fibraDio > dioCap) {
        this.snackBar.open(`Fibra DIO deve estar entre 1 e ${dioCap}.`, 'OK', {
          duration: 5000,
        });
        return;
      }
      const maxFib = this.getMaxFiberForCableKey(cableKey);
      if (fibraCabo < 1 || fibraCabo > maxFib) {
        this.snackBar.open(
          `Fibra do cabo não é válida para esta bandeja (máx. ${maxFib}).`,
          'OK',
          { duration: 5000 },
        );
        return;
      }
      //const msg = `Excluir a fusão?\n\n${cableKey}  F${fibraCabo}  <->  DIO  D${fibraDio}`;
      //if (!confirm(msg)) {
      //  return;
      //}
      this.excluirFusaoDioLink(link, {
        cableKey,
        fibraDio,
        fibraCabo,
        item,
      });
    });
  }

  private excluirFusaoDioLink(
    link: go.Link,
    ctx: {
      cableKey: string;
      fibraDio: number;
      fibraCabo: number;
      item: CaboBandejaItem;
    },
  ): void {
    const { cableKey, fibraDio, fibraCabo, item } = ctx;
    this.updateExcluiFusaoDioService
      .excluirFusao({
        fibra_dio: fibraDio,
        fibra_cabo: fibraCabo,
        numero_bandeja: cableKey,
        idmeta_dio: this.data.id_meta,
        idmeta_cabo: item.idMetaCabo!,
        Ponta_cabo: item.ponta!,
      })
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res.success) {
              if (link.diagram?.model && link.data) {
                const model = link.diagram.model as go.GraphLinksModel;
                try {
                  model.removeLinkData(link.data);
                  link.diagram.clearSelection();
                } catch (e) {
                  console.warn('[GOJS-DIO] remove link after excluir:', e);
                }
              }
              this.snackBar.open(
                res.message?.trim() || 'Fusão DIO/cabo excluída.',
                'OK',
                { duration: 4000 },
              );
            } else {
              this.snackBar.open(
                res.message?.trim() || 'Não foi possível excluir a fusão.',
                'OK',
                { duration: 5000 },
              );
            }
            this.cdr.markForCheck();
          });
        },
        error: (err: unknown) => {
          this.ngZone.run(() => {
            const msg =
              typeof err === 'string'
                ? err
                : 'Erro ao excluir fusão DIO/cabo.';
            this.snackBar.open(msg, 'OK', { duration: 5000 });
            link.diagram?.clearSelection();
            this.cdr.markForCheck();
          });
        },
      });
  }

  // --- carrega fusões da API e adiciona ao modelo.

  private async loadAndApplyDioFusoes(): Promise<void> {//Método async: vai à API e só depois altera o modelo.
    const d = this.diagram;
    if (!d?.model) {
      return; //Se não houver modelo, return: não carrega fusões.
    }
    const capacidade = this.getDioFiberCapacity();// capacidade em fibras (12, 36, …) via getDioFiberCapacity()
    try {
      const payload = await firstValueFrom(//firstValueFrom: converte o Observable numa Promise para usar com await.
        this.dioConexDioService.consultar({
          capacidade,
          idmeta: this.data.id_meta,
        }),
      );
      const row = this.extractFirstConexRow(payload);// Extrair uma linha de dados
      if (!row) {
        return; //Se não houver linha, return: não carrega fusões.
      }
      const links = this.buildLinkDataFromConexRow(row, capacidade);// para cada indice kconstroi os links a partir da linha de dados
      if (links.length === 0) {
        return; //Se não houver links, return: não carrega fusões.
      }
      const model = d.model as go.GraphLinksModel;
      const toAdd: go.ObjectData[] = [];
      for (const ld of links) {
        const from = ld['from'] as string; //  lê a propriedade from do objeto com notação de colchetes (útil quando o tipo é genérico tipo ObjectData
        const to = ld['to'] as string; //  lê a propriedade to do objeto com notação de colchetes (útil quando o tipo é genérico tipo ObjectData
        if (model.findNodeDataForKey(from) && model.findNodeDataForKey(to)) { //Se os nós de origem e destino existem, adiciona o link ao array toAdd
          toAdd.push(ld);
        }
      }
      if (toAdd.length === 0) {
        return;
      }
      d.startTransaction('DIO fusões /conex_dio');
      try {
        model.addLinkDataCollection(toAdd);
      } finally {
        d.commitTransaction();
      }
    } catch (e: unknown) {
      console.warn('[GOJS-DIO] Falha ao carregar conectividade DIO:', e);
    }
  }

  //==========================impressão==================================================
  exportarDiagramaParaPDF(): void {
    if (!this.diagram) {
      this.snackBar.open('Diagrama não disponível para exportação.', 'OK', {
        duration: 3000,
      });
      return;
    }

    try {
      const bounds = this.diagram.documentBounds;
      const rawW = Math.max(1, Math.ceil(bounds.width) + 4);
      const rawH = Math.max(1, Math.ceil(bounds.height) + 4);
      const cap = GojsDioComponent.GOJS_PDF_EXPORT_MAX_PX;

      const imageOpts: go.ImageRendererOptions = {
        type: 'image/png',
        background: 'white',
        returnType: 'string',
        size: new go.Size(NaN, NaN),
      };

      if (rawW <= cap && rawH <= cap) {
        imageOpts.scale = 1;
        imageOpts.maxSize = new go.Size(rawW, rawH);
      } else {
        imageOpts.scale = Number.NaN;
        imageOpts.maxSize = new go.Size(cap, cap);
      }

      const imageData = this.diagram.makeImageData(imageOpts) as string;
      if (!imageData) {
        this.snackBar.open('Falha ao gerar imagem do diagrama.', 'OK', {
          duration: 4000,
        });
        return;
      }

      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const headerReserveMm = 22;
      const footerReserveMm = 18;

      const tempImg = new Image();
      tempImg.onload = () => {
        const imgWidth = tempImg.width;
        const imgHeight = tempImg.height;
        const widthMM = imgWidth * 0.264583;
        const heightMM = imgHeight * 0.264583;
        const maxWidth = pageWidth - margin * 2;
        const maxHeight = pageHeight - headerReserveMm - footerReserveMm;
        let finalWidth = widthMM;
        let finalHeight = heightMM;
        if (widthMM > maxWidth || heightMM > maxHeight) {
          const scaleX = maxWidth / widthMM;
          const scaleY = maxHeight / heightMM;
          const s = Math.min(scaleX, scaleY);
          finalWidth = widthMM * s;
          finalHeight = heightMM * s;
        }
        const x = (pageWidth - finalWidth) / 2;
        const contentTop = headerReserveMm;
        const y = contentTop + (maxHeight - finalHeight) / 2;

        pdf.setFontSize(12);
        pdf.text('Diagrama DIO — FiberWorks', pageWidth / 2, 15, {
          align: 'center',
        });
        pdf.addImage(imageData, 'PNG', x, y, finalWidth, finalHeight);
        pdf.setFontSize(10);
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        pdf.text(`Gerado em: ${dataAtual}`, margin, pageHeight - 10);
        pdf.save(`diagrama-dio-${this.data.id_meta}-${Date.now()}.pdf`);
      };
      tempImg.src = imageData;
    } catch (e: unknown) {
      console.error(e);
      this.snackBar.open('Erro ao exportar PDF.', 'OK', { duration: 4000 });
    }
  }

  //===============================================================================

  /**
   * Padrão gojs-demo: não usar `loading` (evita *ngIf a remover #diagramDiv).
   * `disposeDiagram` + recarregar dados + `tryInitDiagram` / `initializeDiagram` no mesmo div.
   */
  async redesenharDiagrama(): Promise<void> {
    this.redrawBusy = true;
    this.cdr.markForCheck();
    try {
      this.error = null;
      this.disposeDiagram();
      await this.loadBandejasAndTipos();
      if (this.error) {
        this.finishRedrawBusy();
        return;
      }
      queueMicrotask(() => {
        this.tryInitDiagram();
        if (!this.diagram) {
          setTimeout(() => {
            this.tryInitDiagram();
            this.finishRedrawBusy();
          }, 0);
        } else {
          this.finishRedrawBusy();
        }
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.error = msg;
      this.finishRedrawBusy();
    }
  }

  abrirLogDio(): void {
    this.snackBar.open(
      'O log detalhado da caixa (Log Caixa) não se aplica ao contexto DIO. Use o diagrama da caixa para esse registo.',
      'Fechar',
      { duration: 6000 },
    );
  }

  close(ev?: Event): void {
    ev?.stopPropagation();
    this.dialogRef.close();
  }
}
