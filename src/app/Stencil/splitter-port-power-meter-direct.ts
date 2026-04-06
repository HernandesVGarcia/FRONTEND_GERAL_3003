import * as go from 'gojs';

/**
 * Clique no port de saída (esquerdo ou direito): abre Power Meter com splitter + portId, sem menu.
 * Usar como `click` e `contextClick` no Shape do port (ex.: F1, F2).
 */
export function buildSplitterPortPowerMeterContextClick(
  portId: string,
): (e: go.InputEvent, thisObj: go.GraphObject) => void {
  return (e: go.InputEvent, thisObj: go.GraphObject): void => {
    const part = thisObj.part;
    if (!(part instanceof go.Node) || !part.data) return;
    e.handled = true;
    const diagram = e.diagram;
    if (diagram) {
      const cmt = diagram.toolManager.contextMenuTool;
      if (cmt.isActive) {
        cmt.doCancel();
      }
      queueMicrotask(() => {
        const t = diagram.toolManager.contextMenuTool;
        if (t.isActive) {
          t.doCancel();
        }
      });
    }
    window.dispatchEvent(
      new CustomEvent('splitterContextMenu', {
        detail: { action: 'powerMeter', data: part.data, portId },
      }),
    );
  };
}
