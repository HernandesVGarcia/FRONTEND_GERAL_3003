import { Component } from '@angular/core';
import * as go from 'gojs';
import { buildSplitterPortPowerMeterContextClick } from '../splitter-port-power-meter-direct';

@Component({
  selector: 'app-splitter-1-p16',
  template: '<div></div>',
  standalone: true
})
export class Splitter116Component {
  
  constructor() { }

  private static geoNormal = go.Geometry.parse("F M 170 0 L 340 240 L 0 240 Z");
  private static geoEspelhado = go.Geometry.parse("F M 170 240 L 0 0 L 340 0 Z");

  getNodeTemplate(): go.Node {
    const geoNorm = Splitter116Component.geoNormal;
    const geoEsp = Splitter116Component.geoEspelhado;
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
              strokeWidth: 3,
              desiredSize: new go.Size(340, 240),
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
          desiredSize: new go.Size(12, 10),
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
      // Porta de saída 1 (superior direita)
      .add(
        new go.Shape("Rectangle", {
          fill: "#4169e1", // azul
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F1",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F1'),
          contextClick: buildSplitterPortPowerMeterContextClick('F1'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.038, -8, 0) : new go.Spot(1, 0.038, 8, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#ff9c4a",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F2",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F2'),
          contextClick: buildSplitterPortPowerMeterContextClick('F2'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.097, -8, 0) : new go.Spot(1, 0.097, 8, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#73c883",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F3",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F3'),
          contextClick: buildSplitterPortPowerMeterContextClick('F3'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.159, -8, 0) : new go.Spot(1, 0.159, 8, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#aa7444",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F4",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F4'),
          contextClick: buildSplitterPortPowerMeterContextClick('F4'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.219, -8, 0) : new go.Spot(1, 0.219, 8, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "gray",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F5",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F5'),
          contextClick: buildSplitterPortPowerMeterContextClick('F5'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.283, -8, 0) : new go.Spot(1, 0.283, 8, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#ffffff",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F6",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F6'),
          contextClick: buildSplitterPortPowerMeterContextClick('F6'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.345, -8, 0) : new go.Spot(1, 0.345, 8, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "red",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F7",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F7'),
          contextClick: buildSplitterPortPowerMeterContextClick('F7'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.407, -8, 0) : new go.Spot(1, 0.407, 8, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "black",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F8",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F8'),
          contextClick: buildSplitterPortPowerMeterContextClick('F8'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.469, -8, 0) : new go.Spot(1, 0.469, 8, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "yellow",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F9",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F9'),
          contextClick: buildSplitterPortPowerMeterContextClick('F9'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.531, -8, 0) : new go.Spot(1, 0.531, 8, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#aa46db",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F10",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F10'),
          contextClick: buildSplitterPortPowerMeterContextClick('F10'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.593, -8, 0) : new go.Spot(1, 0.593, 8, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#ffcbdb",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F11",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F11'),
          contextClick: buildSplitterPortPowerMeterContextClick('F11'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.655, -8, 0) : new go.Spot(1, 0.655, 8, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#00ffff",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F12",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F12'),
          contextClick: buildSplitterPortPowerMeterContextClick('F12'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.717, -8, 0) : new go.Spot(1, 0.717, 8, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "blue",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F13",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F13'),
          contextClick: buildSplitterPortPowerMeterContextClick('F13'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.779, -8, 0) : new go.Spot(1, 0.779, 8, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "green",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F14",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F14'),
          contextClick: buildSplitterPortPowerMeterContextClick('F14'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.841, -8, 0) : new go.Spot(1, 0.841, 8, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "brown",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F15",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F15'),
          contextClick: buildSplitterPortPowerMeterContextClick('F15'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.903, -8, 0) : new go.Spot(1, 0.903, 8, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#99e89d",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F16",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
          click: buildSplitterPortPowerMeterContextClick('F16'),
          contextClick: buildSplitterPortPowerMeterContextClick('F16'),
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.962, -8, 0) : new go.Spot(1, 0.962, 8, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      );

  }

  // Método que retorna a definição do modelo para o GoJS
  getModelDefinition(): go.ObjectData {
    return {
      category: "splitter116",
      labelText: "Sp 1:16",
      key: "Splitter1P16",
      loc: "600 800",
      espelhado: false
    };
  }
}
