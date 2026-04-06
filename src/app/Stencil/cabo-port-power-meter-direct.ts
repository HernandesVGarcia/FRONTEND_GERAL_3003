import * as go from 'gojs';

/**
 * Clique direito no port (fibra): abre Power Meter com cabo + portId, sem menu.
 * Usar como `contextClick` no Shape do port (cabo 6 fibras, piloto).
 */
export function buildPortPowerMeterContextClick(
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
      new CustomEvent('caboContextMenu', {
        detail: { action: 'powerMeter', data: part.data, portId },
      }),
    );
  };
}
