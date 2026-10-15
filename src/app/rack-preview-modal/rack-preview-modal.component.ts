import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import * as go from 'gojs';
import type { RackStencilJson } from './rack-stencil.types';
import {
  DIO_PORT_CENTERS_FALLBACK,
  resolveDioPortCenters,
  type DioPortCenterNorm,
} from './dio-visio-port-parser';
import { AvoidsLinksRouter } from '../utils/AvoidsLinksRouter';

/** SVG Visio recortado — gerar com node scripts/crop-rack-svg.mjs a partir de rask-svg.svg */
const RACK_VISIO_SVG = 'assets/visio_racks/rack-visio.svg';
/** viewBox rack-visio.svg — atualizar após crop-rack-svg.mjs */
const RACK_VISIO_VB_W = 180.75;
const RACK_VISIO_VB_H = 576.72;
const RACK_SVG_ASPECT = RACK_VISIO_VB_H / RACK_VISIO_VB_W;
const RACK_SVG_WIDTH = 196;

const DIO_VISIO_SVG = 'assets/visio_racks/dio-visio.svg';
/** Fallback se viewBox não for lido do arquivo */
const DIO_VISIO_VB_W_FALLBACK = 138.45;
const DIO_VISIO_VB_H_FALLBACK = 48.97;
const DIO_GAP = 48;
/** Espaço vertical entre dois DIOs no preview (links entre equipamentos). */
const DIO_STACK_GAP = 56;
/** Grade 3×12 alinhada ao dio-visio.svg (portas D1–D36, preview de links). */
const DIO_PORT_COLS = 12;
const DIO_PORT_ROWS = 3;
/** Marca de porta (px diagrama) — visível sobre o conector Visio. */
const DIO_PORT_HIT_D = 2.5;
const DIO_LABEL_H = 16;

type DioPortLinkSide = 'top' | 'bottom' | 'left' | 'right';

function dioPortLinkSide(portNum: number): DioPortLinkSide {
  const idx = portNum - 1;
  const row = Math.floor(idx / DIO_PORT_COLS);
  const col = idx % DIO_PORT_COLS;
  if (row === 0) return 'top';
  if (row === DIO_PORT_ROWS - 1) return 'bottom';
  if (col <= 4) return 'left';
  if (col >= 7) return 'right';
  return 'top';
}

function dioLinkSideToSpot(side: unknown): go.Spot {
  switch (side) {
    case 'top':
      return go.Spot.TopSide;
    case 'bottom':
      return go.Spot.BottomSide;
    case 'left':
      return go.Spot.LeftSide;
    case 'right':
      return go.Spot.RightSide;
    default:
      return go.Spot.TopSide;
  }
}

const SVG_VIEWBOX_RE =
  /viewBox="\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*"/;

type DioVisioMeta = {
  vbW: number;
  vbH: number;
  vbX: number;
  vbY: number;
  cacheKey: string;
  sourceUrl: string;
  portCenters: DioPortCenterNorm[];
};

/** Preview visual 42U — SVG Visio ou fallback nativo GoJS. */
const U_COUNT = 42;
const U_PX = 11;
const BAY_W = 96;
const RAIL_W = 14;
const NUM_W = 22;
const SIDE_W = NUM_W + RAIL_W;
const FRAME_PAD = 5;
const OUTER_FRAME_FILL = '#4a4a4a';
const OUTER_FRAME_STROKE = '#2e2e2e';
const SIDE_FILL = '#757575';
const HOLE_SZ = 2.5;

type RackVisualMode = 'svg' | 'native';

@Component({
  selector: 'app-rack-preview-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './rack-preview-modal.component.html',
  styleUrl: './rack-preview-modal.component.css',
})
export class RackPreviewModalComponent implements AfterViewInit, OnDestroy {
  @ViewChild('diagramDiv') diagramDiv: ElementRef<HTMLDivElement> | null = null;

  private diagram: go.Diagram | null = null;

  constructor(public dialogRef: MatDialogRef<RackPreviewModalComponent>, private ngZone: NgZone) {}

  close(): void {
    this.dialogRef.close();
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      queueMicrotask(() => void this.initDiagram());
    });
  }

  ngOnDestroy(): void {
    if (this.diagram) {
      this.diagram.div = null;
      this.diagram.clear();
      this.diagram = null;
    }
  }

  private async initDiagram(): Promise<void> {
    const div = this.diagramDiv?.nativeElement;
    if (!div) return;

    let stencil: RackStencilJson | null = null;
    try {
      const res = await fetch('assets/visio_racks/rack-42u.stencil.json');
      if (res.ok) {
        stencil = (await res.json()) as RackStencilJson;
      }
    } catch {
      stencil = null;
    }

    const rackSvgOk = await this.assetAvailable(RACK_VISIO_SVG);
    const dioMeta = await this.loadDioVisioMeta();
    const mode: RackVisualMode = rackSvgOk ? 'svg' : 'native';

    this.mountDiagram(mode, dioMeta, stencil);
  }

  private async assetAvailable(url: string): Promise<boolean> {
    try {
      const res = await fetch(url);
      return res.ok;
    } catch {
      return false;
    }
  }

  /** Lê viewBox de dio-visio.svg (recortado). Export bruto → node scripts/crop-dio-svg.mjs */
  private async loadDioVisioMeta(): Promise<DioVisioMeta | null> {
    try {
      const res = await fetch(DIO_VISIO_SVG, { cache: 'no-store' });
      if (!res.ok) return null;
      const text = await res.text();
      const m = text.match(SVG_VIEWBOX_RE);
      const cacheKey = `${text.length}-${text.indexOf('DIO_')}`;
      const sourceUrl = `${DIO_VISIO_SVG}?v=${encodeURIComponent(cacheKey)}`;
      if (!m) {
        return {
          vbW: DIO_VISIO_VB_W_FALLBACK,
          vbH: DIO_VISIO_VB_H_FALLBACK,
          vbX: 0,
          vbY: 0,
          cacheKey,
          sourceUrl,
          portCenters: DIO_PORT_CENTERS_FALLBACK,
        };
      }
      const vbX = Number(m[1]);
      const vbY = Number(m[2]);
      const vbW = Number(m[3]);
      const vbH = Number(m[4]);
      if (vbW > 350 || vbH > 350) {
        console.warn(
          '[rack-preview] dio-visio.svg parece export Visio completo (viewBox grande). Rode: node scripts/crop-dio-svg.mjs src/assets/visio_racks/dio1.svg',
        );
        return null;
      }
      const portCenters = resolveDioPortCenters(text, vbX, vbY, vbW, vbH);
      return { vbW, vbH, vbX, vbY, cacheKey, sourceUrl, portCenters };
    } catch {
      return null;
    }
  }

  private rackVisualSize(mode: RackVisualMode): { w: number; h: number } {
    if (mode === 'svg') {
      return { w: RACK_SVG_WIDTH, h: RACK_SVG_WIDTH * RACK_SVG_ASPECT };
    }
    const rackH = U_COUNT * U_PX;
    return {
      w: SIDE_W + BAY_W + SIDE_W + 2 * FRAME_PAD,
      h: rackH + 2 * FRAME_PAD,
    };
  }

  private mountDiagram(
    mode: RackVisualMode,
    dioMeta: DioVisioMeta | null,
    stencil: RackStencilJson | null,
  ): void {
    const div = this.diagramDiv?.nativeElement;
    if (!div) return;

    const { w: rackW, h: rackH } = this.rackVisualSize(mode);
    /** Mesmo px/unidade Visio que o Picture do rack. */
    const visioPxPerUnit = rackW / RACK_VISIO_VB_W;
    const dioVbW = dioMeta?.vbW ?? DIO_VISIO_VB_W_FALLBACK;
    const dioVbH = dioMeta?.vbH ?? DIO_VISIO_VB_H_FALLBACK;
    const dioW = dioVbW * visioPxPerUnit;
    const dioH = dioVbH * visioPxPerUnit;

    const diagram = new go.Diagram(div, {
      'animationManager.isEnabled': false,
      initialContentAlignment: go.Spot.Center,
      initialAutoScale: go.AutoScale.Uniform,
      padding: 24,
      allowMove: true,
      allowCopy: false,
      allowDelete: false,
      allowInsert: false,
      allowLink: true,
      allowRelink: true,
      allowTextEdit: false,
      'linkingTool.isUnconnectedLinkValid': false,
      'linkingTool.portGravity': 16,
      'relinkingTool.portGravity': 16,
      'toolManager.mouseWheelBehavior': go.WheelMode.Zoom,
      minScale: 0.25,
      maxScale: 6,
    });
    diagram.commandHandler.zoomFactor = 1.25;

    diagram.linkTemplate = new go.Link({
      layerName: 'Foreground',
      pickable: false,
      selectable: false,
      routing: go.Routing.AvoidsNodes,
      curve: go.Curve.None,
      corner: 8,
      relinkableFrom: false,
      relinkableTo: false,
      reshapable: false,
      resegmentable: false,
      toShortLength: 0,
      fromEndSegmentLength: 8,
      toEndSegmentLength: 8,
    }).add(
      new go.Shape({
        strokeWidth: 1.5,//largura linha de conexao
        stroke: '#2196F3',
        name: 'LINKSHAPE',
      }),
    );

    const temporaryLink = new go.Link({
      layerName: 'Tool',
      routing: go.Routing.AvoidsNodes,
      curve: go.Curve.None,
      corner: 8,
    }).add(
      new go.Shape({
        strokeWidth: 0.9,
        stroke: '#2196F3',
      }),
    );
    diagram.toolManager.linkingTool.temporaryLink = temporaryLink;
    diagram.toolManager.relinkingTool.temporaryLink = temporaryLink;

    const portOnlyLink = (
      fromNode: go.Node | null,
      fromPort: go.GraphObject | null,
      toNode: go.Node | null,
      toPort: go.GraphObject | null,
    ): boolean => {
      if (fromNode?.category !== 'dioPort' || toNode?.category !== 'dioPort') {
        return false;
      }
      const fromId = fromPort?.portId ?? fromNode?.data?.port;
      const toId = toPort?.portId ?? toNode?.data?.port;
      if (typeof fromId !== 'string' || !fromId || typeof toId !== 'string' || !toId) {
        return false;
      }
      return fromNode !== toNode;
    };
    diagram.toolManager.linkingTool.linkValidation = portOnlyLink;
    diagram.toolManager.relinkingTool.linkValidation = portOnlyLink;

    const locBinding = new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(
      go.Point.stringify,
    );

    const rackTemplate = new go.Node('Auto', {
      locationSpot: go.Spot.TopLeft,
      selectable: false,
      movable: false,
      pickable: false,
      avoidable: false,
    })
      .add(
        mode === 'svg'
          ? new go.Picture({
              source: RACK_VISIO_SVG,
              width: rackW,
              height: rackH,
              imageStretch: go.GraphObject.Uniform,
            })
          : this.buildNativeRackPanel(stencil),
      )
      .bind(locBinding);

    const portLayout = this.computeDioPortLayout(
      dioW,
      dioH,
      dioMeta?.portCenters,
    );

    const dioGroupTemplate = new go.Group('Spot', {
      locationSpot: go.Spot.TopLeft,
      selectable: true,
      movable: true,
      avoidable: false,
      computesBoundsAfterDrag: true,
      fromLinkable: false,
      toLinkable: false,
    })
      .add(
        new go.TextBlock({
          font: 'bold 10px Segoe UI, sans-serif',
          stroke: '#37474f',
          alignment: new go.Spot(0, 0, 0, 0),
          alignmentFocus: go.Spot.TopLeft,
        }).bind('text', 'label'),
      )
      .add(
        new go.Panel('Spot', {
          alignment: new go.Spot(0, 0, 0, DIO_LABEL_H),
          alignmentFocus: go.Spot.TopLeft,
        }).add(this.buildDioGroupBody(dioMeta, dioW, dioH)),
      )
      .bind(locBinding);

    const portAvoidPadX = Math.max(2, (portLayout.avoidW - DIO_PORT_HIT_D) / 2) * 1.15;
    const portAvoidPadY = Math.max(2, (portLayout.avoidH - DIO_PORT_HIT_D) / 2) * 1.15;

    const dioPortTemplate = new go.Node('Spot', {
      locationSpot: go.Spot.Center,
      movable: false,
      selectable: true,
      avoidable: true,
      /** Desvio do link usa margem extra; o ancoradouro fica no centro do círculo. */
      avoidableMargin: new go.Margin(
        portAvoidPadY,
        portAvoidPadX,
        portAvoidPadY,
        portAvoidPadX,
      ),
      fromLinkable: true,
      toLinkable: true,
      fromLinkableSelfNode: false,
      toLinkableSelfNode: false,
      fromMaxLinks: 1,
      toMaxLinks: 1,
      cursor: 'crosshair',
    })
      .bind(new go.Binding('portId', 'port'))
      .bind(new go.Binding('location', 'loc', go.Point.parse))
      .bind(new go.Binding('fromSpot', 'linkSide', dioLinkSideToSpot))
      .bind(new go.Binding('toSpot', 'linkSide', dioLinkSideToSpot))
      .add(
        new go.Shape('Circle', {
          width: DIO_PORT_HIT_D,
          height: DIO_PORT_HIT_D,
          fill: 'rgba(146,208,80,0.55)',
          stroke: '#2e7d32',
          strokeWidth: 0.25,
        }),
      );

    const nodeMap = new go.Map<string, go.Part>();
    nodeMap.add('rack', rackTemplate);
    nodeMap.add('dioPort', dioPortTemplate);
    diagram.nodeTemplateMap = nodeMap;

    const groupMap = new go.Map<string, go.Group>();
    groupMap.add('dioGroup', dioGroupTemplate);
    diagram.groupTemplateMap = groupMap;

    const nodes: go.ObjectData[] = [
      {
        key: 'rack',
        category: 'rack',
        loc: go.Point.stringify(new go.Point(0, 0)),
      },
    ];

    if (dioMeta) {
      const dioX = rackW + DIO_GAP;
      const stackY2 = dioH + DIO_LABEL_H + DIO_STACK_GAP;
      nodes.push(
        ...this.buildDioGroupWithPorts('dio1', 'DIO 1', dioX, 0, portLayout),
        ...this.buildDioGroupWithPorts('dio2', 'DIO 2', dioX, stackY2, portLayout),
      );
    }

    diagram.model = new go.GraphLinksModel({
      nodeDataArray: nodes,
      linkFromPortIdProperty: 'fromPort',
      linkToPortIdProperty: 'toPort',
    });

    /** Separa trechos coincidentes (mesmo parametro do gojs-demo, escala menor no preview). */
    const avoidsLinksRouter = new AvoidsLinksRouter({
      linkSpacing: 6,
      epsilonDistance: 10,
      avoidsNodes: true,
    });
    diagram.routers.add(avoidsLinksRouter);
    diagram.addDiagramListener('LinkDrawn', () => {
      avoidsLinksRouter.invalidateRouter();
    });

    this.diagram = diagram;
  }

  /** Desenho Visio + orelhas (portas são nós filhos do grupo, evitáveis pelo roteador). */
  private buildDioGroupBody(
    dioMeta: DioVisioMeta | null,
    dioW: number,
    dioH: number,
  ): go.Panel {
    const panel = new go.Panel('Spot', { width: dioW, height: dioH })
      .add(
        new go.Picture({
          source: dioMeta?.sourceUrl ?? DIO_VISIO_SVG,
          width: dioW,
          height: dioH,
          imageStretch: go.GraphObject.Uniform,
          pickable: false,
        }),
      );
    this.addDioDragEars(panel, dioW, dioH);
    return panel;
  }

  private computeDioPortLayout(
    dioW: number,
    dioH: number,
    portCenters: DioPortCenterNorm[] | undefined,
  ): {
    avoidW: number;
    avoidH: number;
    slots: { port: string; center: go.Point }[];
  } {
    const centers =
      portCenters?.length === 36 ? portCenters : DIO_PORT_CENTERS_FALLBACK;
    const colStep = (centers[1].nx - centers[0].nx) * dioW;
    const rowStep = (centers[12].ny - centers[0].ny) * dioH;
    const avoidW = Math.max(4, colStep * 0.88);
    const avoidH = Math.max(4, rowStep * 0.88);
    const slots: { port: string; center: go.Point }[] = [];

    for (let i = 0; i < 36; i += 1) {
      const c = centers[i];
      slots.push({
        port: `D${i + 1}`,
        center: new go.Point(c.nx * dioW, DIO_LABEL_H + c.ny * dioH),
      });
    }
    return { avoidW, avoidH, slots };
  }

  private buildDioGroupWithPorts(
    groupKey: string,
    label: string,
    x: number,
    y: number,
    layout: { slots: { port: string; center: go.Point }[] },
  ): go.ObjectData[] {
    const out: go.ObjectData[] = [
      {
        key: groupKey,
        isGroup: true,
        category: 'dioGroup',
        label,
        loc: go.Point.stringify(new go.Point(x, y)),
      },
    ];
    for (const slot of layout.slots) {
      const abs = new go.Point(x + slot.center.x, y + slot.center.y);
      const portNum = Number.parseInt(slot.port.replace(/^D/i, ''), 10);
      out.push({
        key: `${groupKey}-${slot.port}`,
        group: groupKey,
        category: 'dioPort',
        port: slot.port,
        linkSide: dioPortLinkSide(portNum),
        loc: go.Point.stringify(abs),
      });
    }
    return out;
  }

  /** Arrastar o DIO pelas orelhas (centro fica livre para link nas portas). */
  private addDioDragEars(panel: go.Panel, dioW: number, dioH: number): void {
    const earW = Math.max(10, dioW * 0.09);
    const earH = dioH * 0.88;
    const mkEar = (x: number): go.Shape =>
      new go.Shape('Rectangle', {
        width: earW,
        height: earH,
        fill: 'rgba(120,144,156,0.28)',
        stroke: 'rgba(70,90,100,0.55)',
        strokeWidth: 1,
        alignment: new go.Spot(0, 0, x, dioH / 2),
        alignmentFocus: go.Spot.Center,
        pickable: true,
        cursor: 'grab',
      });
    panel.add(mkEar(earW / 2));
    panel.add(mkEar(dioW - earW / 2));
  }

  private buildNativeRackPanel(stencil: RackStencilJson | null): go.Panel {
    const rackH = U_COUNT * U_PX;
    const totalW = SIDE_W + BAY_W + SIDE_W + 2 * FRAME_PAD;
    const holeGap = (U_PX - 3 * HOLE_SZ) / 4;

    const addMountingHoles = (panel: go.Panel, holeX: number): void => {
      for (let slot = 0; slot < U_COUNT; slot += 1) {
        const slotTop = slot * U_PX;
        for (let h = 0; h < 3; h += 1) {
          const top = slotTop + holeGap + h * (HOLE_SZ + holeGap);
          panel.add(
            new go.Shape('Rectangle', {
              width: HOLE_SZ,
              height: HOLE_SZ,
              fill: '#1a1a1a',
              stroke: '#000',
              strokeWidth: 0.25,
              alignment: new go.Spot(0, 0, holeX, top),
            }),
          );
        }
      }
    };

    const sideFrame = (side: 'left' | 'right'): go.Panel => {
      const panel = new go.Panel(go.Panel.Spot, {
        width: SIDE_W,
        height: rackH,
        isClipping: true,
      });
      panel.add(
        new go.Shape('Rectangle', {
          width: SIDE_W,
          height: rackH,
          fill: SIDE_FILL,
          stroke: null,
        }),
      );
      const dividerX = side === 'left' ? NUM_W : RAIL_W;
      panel.add(
        new go.Shape('Rectangle', {
          width: 1,
          height: rackH,
          fill: '#333',
          stroke: null,
          alignment: new go.Spot(0, 0, dividerX, 0),
        }),
      );
      const nums = new go.Panel(go.Panel.Vertical, {
        width: NUM_W,
        height: rackH,
        alignment:
          side === 'left'
            ? new go.Spot(0, 0, 0, 0)
            : new go.Spot(1, 0, -NUM_W, 0),
      });
      for (let u = U_COUNT; u >= 1; u--) {
        nums.add(
          new go.TextBlock(String(u), {
            height: U_PX,
            margin: new go.Margin(
              0,
              side === 'left' ? 2 : 4,
              0,
              side === 'right' ? 2 : 4,
            ),
            font: 'bold 9px Arial,sans-serif',
            stroke: '#e65100',
            textAlign: side === 'left' ? 'right' : 'left',
            verticalAlignment: go.Spot.Center,
          }),
        );
      }
      panel.add(nums);
      const holeX = side === 'left' ? SIDE_W - HOLE_SZ : 0;
      addMountingHoles(panel, holeX);
      return panel;
    };

    const bay = new go.Shape('Rectangle', {
      width: BAY_W,
      height: rackH,
      fill: '#ffffff',
      stroke: '#555',
      strokeWidth: 1,
    });

    const core = new go.Panel(go.Panel.Horizontal, { defaultAlignment: go.Spot.Top })
      .add(sideFrame('left'))
      .add(bay)
      .add(sideFrame('right'));

    const frame = new go.Panel(go.Panel.Spot, {
      width: totalW,
      height: rackH + 2 * FRAME_PAD,
    })
      .add(
        new go.Shape('Rectangle', {
          width: totalW,
          height: rackH + 2 * FRAME_PAD,
          fill: OUTER_FRAME_FILL,
          stroke: OUTER_FRAME_STROKE,
          strokeWidth: 1.5,
        }),
      )
      .add(new go.Panel(go.Panel.Horizontal, { alignment: go.Spot.Center }).add(core));

    void stencil;
    return frame;
  }
}
