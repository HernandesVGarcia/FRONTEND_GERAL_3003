import * as go from 'gojs';

function addFibraToggleButton(
  nodeTemplate: go.Node,
  eventName: 'caboContextMenu' | 'splitterContextMenu',
  opts?: { hideForDrop?: boolean }
): go.Node {
  const hideForDrop = opts?.hideForDrop === true;
  nodeTemplate.add(
    new go.TextBlock({
      text: '+',
      font: 'bold 32pt sans-serif',
      stroke: '#1a66cc', //'#c62828',
      cursor: 'pointer',
      alignment: go.Spot.Top,
      alignmentFocus: go.Spot.Bottom,
      margin: new go.Margin(0, 0, 4, 0),
      pickable: true,
      click: (_e, obj) => {
        const data = obj.part?.data;
        if (!data) {
          return;
        }
        window.dispatchEvent(
          new CustomEvent(eventName, {
            detail: { action: 'toggleFibras', data }
          })
        );
      }
    })
      .bind(
        new go.Binding('text', 'fibrasPainelAberto', (aberto) => (aberto ? '−' : '+'))
      )
      .bind(
        new go.Binding('visible', 'key', (k) =>
          hideForDrop ? !/^Drop/i.test(String(k ?? '')) : true
        )
      )
  );
  return nodeTemplate;
}

/**
 * Adiciona botão +/− acima do nó do cabo (área fora do desenho)
 * para abrir/fechar o painel Visualizar fibras via caboContextMenu / toggleFibras.
 * Oculto para drops (key Drop*).
 */
export function decorateCableWithFibraToggle(nodeTemplate: go.Node): go.Node {
  return addFibraToggleButton(nodeTemplate, 'caboContextMenu', { hideForDrop: true });
}

/**
 * Adiciona botão +/− acima do nó do splitter
 * para abrir/fechar FibraTabelaSplitter via splitterContextMenu / toggleFibras.
 */
export function decorateSplitterWithFibraToggle(nodeTemplate: go.Node): go.Node {
  return addFibraToggleButton(nodeTemplate, 'splitterContextMenu');
}
