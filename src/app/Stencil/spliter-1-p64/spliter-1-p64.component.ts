import { Component } from '@angular/core';
import * as go from 'gojs';
import { buildSplitterPortPowerMeterContextClick } from '../splitter-port-power-meter-direct';

const PORT_COLORS = [
  '#4169e1', '#ff9c4a', '#73c883', '#aa7444', 'gray', '#ffffff', 'red', 'black',
  'yellow', '#aa46db', '#ffcbdb', '#00ffff', 'blue', 'green', 'brown', '#99e89d'
];

@Component({
  selector: 'app-splitter-1-p64',
  template: '<div></div>',
  standalone: true
})
export class Splitter164Component {

  constructor() { }

  private createOutputPort(portIndex: number): go.Shape {
    const y = portIndex / 65;
    const fill = PORT_COLORS[(portIndex - 1) % PORT_COLORS.length];
    const portId = `F${portIndex}`;
    const openPm = buildSplitterPortPowerMeterContextClick(portId);
    return new go.Shape('Rectangle', {
      fill,
      stroke: '#E65100',
      desiredSize: new go.Size(34, 5),
      portId,
      fromLinkable: true,
      toLinkable: true,
      fromLinkableDuplicates: false,
      toLinkableDuplicates: false,
      cursor: 'pointer',
      click: openPm,
      contextClick: openPm,
    })
      .bind('alignment', 'espelhado', (esp: boolean) => esp ? new go.Spot(0, y, -8, 0) : new go.Spot(1, y, 8, 0))
      .bind('fromSpot', 'espelhado', (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      .bind('toSpot', 'espelhado', (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right);
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
              const adorno = obj.part as go.Adornment;
              const node = adorno?.adornedPart;
              const diagram = node?.diagram;
              if (diagram && node?.data) {
                const esp = !node.data.espelhado;
                diagram.model.commit((m: go.Model) => (m as go.GraphLinksModel).setDataProperty(node.data, 'espelhado', esp), 'espelhar');
                window.dispatchEvent(new CustomEvent('splitterContextMenu', { detail: { action: 'espelhar', data: node.data, node } }));
              }
            }
          })
          .add(new go.TextBlock(' ⇄ Espelhar', { textAlign: 'left', alignment: go.Spot.Left }))
        )
    })
      .add(
        new go.Panel('Spot', { desiredSize: new go.Size(587, 680) })
          .add(
            new go.Shape({
              fill: '#9FFFFF',
              stroke: '#0097A9',
              strokeWidth: 3,
              geometry: go.Geometry.parse('F M 0 340 L 587 0 L 587 680 Z'),
              geometryStretch: go.GraphObject.None
            }).bind('geometry', 'espelhado', (esp: boolean) =>
              esp ? go.Geometry.parse('F M 587 340 L 0 0 L 0 680 Z') : go.Geometry.parse('F M 0 340 L 587 0 L 587 680 Z'))
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
          cursor: 'pointer',
          click: buildSplitterPortPowerMeterContextClick('ENTRADA'),
          contextClick: buildSplitterPortPowerMeterContextClick('ENTRADA'),
        })
      );

    for (let i = 1; i <= 64; i++) {
      node.add(this.createOutputPort(i));
    }

    return node;
  }

  getModelDefinition(): go.ObjectData {
    return {
      category: 'splitter164',
      labelText: 'Sp 1:64',
      key: 'Splitter1P64',
      loc: '600 800',
      espelhado: false
    };
  }
}
