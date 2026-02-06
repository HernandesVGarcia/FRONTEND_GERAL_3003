import { Component } from '@angular/core';
import * as go from 'gojs';

const PORT_COLORS = [
  '#4169e1', '#ff9c4a', '#73c883', '#aa7444', 'gray', '#ffffff', 'red', 'black',
  'yellow', '#aa46db', '#ffcbdb', '#00ffff', 'blue', 'green', 'brown', '#99e89d'
];

@Component({
  selector: 'app-splitter-1-p32',
  template: '<div></div>',
  standalone: true
})
export class Splitter132Component {

  constructor() { }

  private createOutputPort(portIndex: number): go.Shape {
    const y = portIndex / 33;
    const fill = PORT_COLORS[(portIndex - 1) % PORT_COLORS.length];
    return new go.Shape('Rectangle', {
      fill,
      stroke: '#E65100',
      desiredSize: new go.Size(34, 5),
      portId: `F${portIndex}`,
      alignment: new go.Spot(1, y, 8, 0),
      fromSpot: go.Spot.Right,
      toSpot: go.Spot.Right,
      fromLinkable: true,
      toLinkable: true,
      fromLinkableDuplicates: false,
      toLinkableDuplicates: false,
      cursor: 'pointer'
    });
  }

  getNodeTemplate(): go.Node {
    const node = new go.Node('Spot', {
      contextMenu: go.GraphObject.build('ContextMenu', {
        alignment: go.Spot.Left,
        alignmentFocus: go.Spot.Right
      })
        .add(
          go.GraphObject.build('ContextMenuButton', {
            click: (e, obj) => {
              const contextmenu = obj.part;
              if (contextmenu && contextmenu.data) {
                const splitterData = contextmenu.data;
                console.log('🔀 [SPLITTER-TEMPLATE] Mapear Splitter clicado:', splitterData);
                window.dispatchEvent(new CustomEvent('splitterContextMenu', {
                  detail: { action: 'mapear', data: splitterData }
                }));
              }
            }
          })
          .add(new go.TextBlock(' 🔍 Mapear Splitter', { textAlign: 'left', alignment: go.Spot.Left }))
        )
        .add(
          go.GraphObject.build('ContextMenuButton', {
            click: (e, obj) => {
              const contextmenu = obj.part;
              if (contextmenu && contextmenu.data) {
                const splitterData = contextmenu.data;
                const nodeRef = (contextmenu.part && (contextmenu.part as go.Adornment).adornedPart)
                  ? (contextmenu.part as go.Adornment).adornedPart : null;
                console.log('🔀 [SPLITTER-TEMPLATE] Excluir Splitter clicado:', splitterData);
                window.dispatchEvent(new CustomEvent('splitterContextMenu', {
                  detail: { action: 'excluir', data: splitterData, node: nodeRef }
                }));
              }
            }
          })
          .add(new go.TextBlock('❌ Excluir Splitter', { textAlign: 'left', alignment: go.Spot.Left }))
        )
        .add(
          go.GraphObject.build('ContextMenuButton', {
            click: (e, obj) => {
              const contextmenu = obj.part;
              if (contextmenu && contextmenu.data) {
                const splitterData = contextmenu.data;
                console.log('🔀 [SPLITTER-TEMPLATE] Power Meter clicado:', splitterData);
                alert(`Splitter: ${splitterData.labelText}\nID: ${splitterData.idmeta}\nTipo: ${splitterData.tipoSplitter}`);
              }
            }
          })
          .add(new go.TextBlock('🔌 Power Meter', { textAlign: 'left', alignment: go.Spot.Left }))
        )
    })
      .add(
        new go.Panel('Spot')
          .add(
            new go.Shape('Triangle', {
              fill: '#9FFFFF',
              stroke: '#0097A9',
              strokeWidth: 3,
              desiredSize: new go.Size(680, 480),
              angle: -90
            })
          )
          .add(
            new go.TextBlock({
              margin: 5,
              editable: true,
              font: 'bold 10pt sans-serif',
              stroke: '#000000',
              alignment: go.Spot.Center
            }).bind('text', 'labelText')
          )
      )
      .add(
        new go.Shape('Rectangle', {
          fill: '#1E88E5',
          stroke: '#0D47A1',
          desiredSize: new go.Size(12, 10),
          portId: 'ENTRADA',
          alignment: new go.Spot(0, 0.5, -4, 0),
          fromSpot: go.Spot.Left,
          toSpot: go.Spot.Left,
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: 'pointer'
        })
      );

    for (let i = 1; i <= 32; i++) {
      node.add(this.createOutputPort(i));
    }

    return node;
  }

  getModelDefinition(): go.ObjectData {
    return {
      category: 'splitter132',
      labelText: 'Sp 1:32',
      key: 'Splitter1P32',
      loc: '600 800'
    };
  }
}
