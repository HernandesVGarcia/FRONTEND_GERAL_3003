import { Component } from '@angular/core';
import * as go from 'gojs';
import { buildSplitterPortPowerMeterContextClick } from '../splitter-port-power-meter-direct';

@Component({
  selector: 'app-splitter-1-p4',
  template: '<div></div>',
  standalone: true
})
export class Splitter14Component {
  
  constructor() { }

  private static geoNormal = go.Geometry.parse("F M 60 0 L 120 100 L 0 100 Z");
  private static geoEspelhado = go.Geometry.parse("F M 60 100 L 0 0 L 120 0 Z");

  getNodeTemplate(): go.Node {
    const geoNorm = Splitter14Component.geoNormal;
    const geoEsp = Splitter14Component.geoEspelhado;
    return new go.Node("Spot", {
      contextMenu: go.GraphObject.build("ContextMenu", {
        // 🎯 NOVO: Alinhamento à esquerda
        alignment: go.Spot.Left,
        alignmentFocus: go.Spot.Right
      })
        .add(
          go.GraphObject.build("ContextMenuButton", {
            click: (e, obj) => {
              const contextmenu = obj.part;
              if (contextmenu && contextmenu.data) {
                window.dispatchEvent(new CustomEvent('splitterContextMenu', {
                  detail: { action: 'visualizarFibras', data: contextmenu.data }
                }));
              }
            }
          })
          .add(new go.TextBlock(" 👁 Visualizar fibras", {
            textAlign: "left",
            alignment: go.Spot.Left
          }))
        )
        .add(
          go.GraphObject.build("ContextMenuButton", {
            click: (e, obj) => {
              const contextmenu = obj.part;
              if (contextmenu && contextmenu.data) {
                const splitterData = contextmenu.data;
                console.log('🔀 [SPLITTER-TEMPLATE] Mapear Splitter clicado:', splitterData);
                // Disparar evento customizado para o componente pai
                window.dispatchEvent(new CustomEvent('splitterContextMenu', { 
                  detail: { action: 'mapear', data: splitterData } 
                }));
              }
            }
          })
          .add(new go.TextBlock(" 🔍 Mapear Splitter", { 
            textAlign: "left",
            alignment: go.Spot.Left
          }))
        )
        .add(
          go.GraphObject.build("ContextMenuButton", {
            click: (e, obj) => {
              const contextmenu = obj.part;
              if (contextmenu && contextmenu.data) {
                const splitterData = contextmenu.data;
                const node = (contextmenu.part && (contextmenu.part as go.Adornment).adornedPart) ? (contextmenu.part as go.Adornment).adornedPart : null;
                console.log('🔀 [SPLITTER-TEMPLATE] Excluir Splitter clicado:', splitterData);
                window.dispatchEvent(new CustomEvent('splitterContextMenu', { 
                  detail: { action: 'excluir', data: splitterData, node } 
                }));
              }
            }
          })
          .add(new go.TextBlock("❌ Excluir Splitter", { 
            textAlign: "left",
            alignment: go.Spot.Left
          }))
        )
        .add(
          go.GraphObject.build("ContextMenuButton", {
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
          .add(new go.TextBlock(" ⇄ Espelhar", { textAlign: "left", alignment: go.Spot.Left }))
        )

    })
      .add(
        new go.Panel("Spot")
          .add(
            new go.Shape({
              geometry: geoNorm,
              fill: "#9FFFFF",
              stroke: "#0097A9",
              strokeWidth: 2,
              desiredSize: new go.Size(120, 100),
              angle: -90
            }).bind("geometry", "espelhado", (esp: boolean) => esp ? geoEsp : geoNorm)
          )
          .add(
            new go.TextBlock({
              margin: 5,
              editable: true,
              font: "bold 10pt sans-serif",
              stroke: "#000000",
              alignment: go.Spot.Center
            }).bind("text", "labelText")
          )
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#1E88E5",
          stroke: "#0D47A1",
          desiredSize: new go.Size(8, 6),
          portId: "ENTRADA",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('ENTRADA'),
          contextClick: buildSplitterPortPowerMeterContextClick('ENTRADA'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(1, 0.5, 4, 0) : new go.Spot(0, 0.5, -4, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Right : go.Spot.Left)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Right : go.Spot.Left)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#71afe5",
          stroke: "#E65100",
          desiredSize: new go.Size(24, 6),
          portId: "F1",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F1'),
          contextClick: buildSplitterPortPowerMeterContextClick('F1'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.20, -4, 0) : new go.Spot(1, 0.20, 4, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#ff9c4a",
          stroke: "#E65100",
          desiredSize: new go.Size(24, 6),
          portId: "F2",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F2'),
          contextClick: buildSplitterPortPowerMeterContextClick('F2'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.40, -4, 0) : new go.Spot(1, 0.40, 4, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#73c883",
          stroke: "#E65100",
          desiredSize: new go.Size(24, 6),
          portId: "F3",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F3'),
          contextClick: buildSplitterPortPowerMeterContextClick('F3'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.60, -4, 0) : new go.Spot(1, 0.60, 4, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#aa7444",
          stroke: "#E65100",
          desiredSize: new go.Size(24, 6),
          portId: "F4",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F4'),
          contextClick: buildSplitterPortPowerMeterContextClick('F4'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.80, -4, 0) : new go.Spot(1, 0.80, 4, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      );
  }

  getModelDefinition(): go.ObjectData {
    return {
      category: "splitter14",
      labelText: "Sp 1:4",
      key: "Splitter1P4",
      loc: "300 300",
      espelhado: false
    };
  }
}