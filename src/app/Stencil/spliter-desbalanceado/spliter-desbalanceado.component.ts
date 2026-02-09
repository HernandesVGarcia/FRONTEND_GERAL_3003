import { Component } from '@angular/core';
import * as go from 'gojs';

@Component({
  selector: 'app-splitter-1-p2-desb',
  template: '<div></div>',
  standalone: true
})
export class SplitterDesbComponent {

  // Triângulo: ápice esquerda (entrada), base direita (saídas). Com angle -90 fica entrada à esquerda.
  private static geoNormal = go.Geometry.parse("F M 50 0 L 100 80 L 0 80 Z");
  private static geoEspelhado = go.Geometry.parse("F M 50 80 L 0 0 L 100 0 Z");

  constructor() { }

  // Método que retorna o template do nó para o GoJS
  getNodeTemplate(): go.Node {
    const geoNorm = SplitterDesbComponent.geoNormal;
    const geoEsp = SplitterDesbComponent.geoEspelhado;
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
                alert(`Splitter: ${splitterData.labelText}\nID: ${splitterData.idmeta}\nTipo: ${splitterData.tipoSplitter}`);
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
          .add(new go.TextBlock(" ⇄ Espelhar", { textAlign: "left", alignment: go.Spot.Left }))
        )
    })
      .add(
        new go.Panel("Spot")
          .add(
            new go.Shape({
              geometry: geoNorm,
              fill: "#74FF73",
              stroke: "#0097A9",
              strokeWidth: 2,
              desiredSize: new go.Size(100, 80),
              angle: -90
            }).bind("geometry", "espelhado", (esp: boolean) => esp ? geoEsp : geoNorm)
          )
          .add(
            new go.TextBlock({
              width: 50,
              height: 100,
              margin: 20,
              maxLines: 3,
              spacingBelow: 2,
              textAlign: "center",
              editable: true,
              font: "bold 6pt sans-serif",
              stroke: "#000000",
              alignment: go.Spot.Center,
              position: new go.Point(100 + 2, 40),
            }).bind("text", "labelText")
          )
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#1E88E5",
          stroke: "#0D47A1",
          desiredSize: new go.Size(8, 5),
          portId: "ENTRADA",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer"
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(1, 0.5, 4, 0) : new go.Spot(0, 0.5, -4, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Right : go.Spot.Left)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Right : go.Spot.Left)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#71afe5",
          stroke: "#E65100",
          desiredSize: new go.Size(24, 5),
          portId: "F1",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer"
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.30, -4, 0) : new go.Spot(1, 0.30, 4, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      )
      .add(
        new go.Shape("Rectangle", {
          fill: "#ff9c4a",
          stroke: "#E65100",
          desiredSize: new go.Size(24, 5),
          portId: "F2",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer"
        })
          .bind("alignment", "espelhado", (esp: boolean) => esp ? new go.Spot(0, 0.70, -4, 0) : new go.Spot(1, 0.70, 4, 0))
          .bind("fromSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
          .bind("toSpot", "espelhado", (esp: boolean) => esp ? go.Spot.Left : go.Spot.Right)
      );
  }

  // Método que retorna a definição do modelo para o GoJS
  getModelDefinition(): go.ObjectData {
    return {
      category: "splitterDesb",
      labelText: "Sp 1:2",
      key: "SplitterDesb",
      loc: "600 800",
      espelhado: false
    };
  }
}
