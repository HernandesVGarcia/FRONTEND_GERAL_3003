import { Component } from '@angular/core';
import * as go from 'gojs';
import { buildSplitterPortPowerMeterContextClick } from '../splitter-port-power-meter-direct';

@Component({
  selector: 'app-splitter-1-p8',
  template: '<div></div>',
  standalone: true
})
export class Splitter18Component {
  
  constructor() { }

  private static geoNormal = go.Geometry.parse("F M 100 0 L 200 140 L 0 140 Z");
  private static geoEspelhado = go.Geometry.parse("F M 100 140 L 0 0 L 200 0 Z");

  // Método que retorna o template do nó para o GoJS
  getNodeTemplate(): go.Node {
    const geoNorm = Splitter18Component.geoNormal;
    const geoEsp = Splitter18Component.geoEspelhado;
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
              const contextmenu = obj.part;
              if (contextmenu && contextmenu.data) {
                const splitterData = contextmenu.data;
                console.log('🔀 [SPLITTER-TEMPLATE] Power Meter clicado:', splitterData);
                window.dispatchEvent(new CustomEvent('splitterContextMenu', {
                  detail: { action: 'powerMeter', data: splitterData }
                }));
              }
            }
          })
          .add(new go.TextBlock("🔌 Power Meter", { 
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
          .add(new go.TextBlock(" ⇄ Espelhar", { 
            textAlign: "left",
            alignment: go.Spot.Left
          }))
        )
    })
      .add(
        new go.Panel("Spot")
          .add(
            // Triângulo: geometria e portas alternam conforme data.espelhado (context menu "Espelhar")
            new go.Shape({
              geometry: geoNorm,
              fill: "#9FFFFF",
              stroke: "#0097A9",
              strokeWidth: 3,
              desiredSize: new go.Size(200, 140),
              angle: -90
            }).bind("geometry", "espelhado", (esp: boolean) => esp ? geoEsp : geoNorm)
          )
          .add(
            new go.TextBlock({
              margin: 5,
              editable: true,
              font: "bold 9pt sans-serif",
              stroke: "#000000",
              textAlign:"center",
              alignment: go.Spot.Center
            }).bind("text", "labelText")
          )
      )
      // Porta de entrada: esquerda se normal, direita se espelhado
      .add(
        new go.Shape("Rectangle", {
          fill: "#1E88E5",
          stroke: "#0D47A1",
          desiredSize: new go.Size(10, 8),
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
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.15, -4, 0) : new go.Spot(1, 0.15, 4, 0))
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
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.25, -4, 0) : new go.Spot(1, 0.25, 4, 0))
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
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.35, -4, 0) : new go.Spot(1, 0.35, 4, 0))
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
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.45, -4, 0) : new go.Spot(1, 0.45, 4, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )

      
      .add(
        new go.Shape("Rectangle", {
          fill: "#aaaaaa",
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
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.55, -4, 0) : new go.Spot(1, 0.55, 4, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "white",
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
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.65, -4, 0) : new go.Spot(1, 0.65, 4, 0))
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
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.75, -4, 0) : new go.Spot(1, 0.75, 4, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#F7ee63",
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
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.85, -4, 0) : new go.Spot(1, 0.85, 4, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      );


  }

  // Método que retorna a definição do modelo para o GoJS
  getModelDefinition(): go.ObjectData {
    return {
      category: "splitter18",
      labelText: "Sp 1:8",
      key: "Splitter1P8",
      loc: "600 800",
      espelhado: false
    };
  }
}