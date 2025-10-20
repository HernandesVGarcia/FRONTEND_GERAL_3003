import { Component } from '@angular/core';
import * as go from 'gojs';

@Component({
  selector: 'app-splitter-1-p2-desb',
  template: '<div></div>',
  standalone: true
})
export class SplitterDesbComponent {
  
  constructor() { }

  // Método que retorna o template do nó para o GoJS
  getNodeTemplate(): go.Node {
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
          .add(new go.TextBlock("Mapear Splitter", { 
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
                console.log('🔀 [SPLITTER-TEMPLATE] Excluir Splitter clicado:', splitterData);
                alert('Função de exclusão será implementada em breve!');
              }
            }
          })
          .add(new go.TextBlock("Excluir Splitter", { 
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
          .add(new go.TextBlock("Power Meter", { 
            textAlign: "left",
            alignment: go.Spot.Left
          }))
        )
    })
      .add(
        new go.Panel("Spot")
          .add(
            new go.Shape("Triangle", {
              fill: "#74FF73", 
              stroke: "#0097A9",
              strokeWidth: 2,
              desiredSize: new go.Size(100, 80),
              // Rotação para apontar entrada à esquerda e saídas à direita
              angle: -90
            })
          )
          .add(
            new go.TextBlock({
              width: 50,
              height:100,
              margin: 20,
              maxLines:3,  
              spacingBelow:2,
              textAlign:"center",        
              editable: true,
              font: "bold 6pt sans-serif",
              stroke: "#000000",
              alignment: go.Spot.Center,
              position: new go.Point(100 + 2, 40),
            }).bind("text", "labelText")
          )
      )
      // Porta de entrada (esquerda)
      .add(
        new go.Shape("Rectangle", {
          fill: "#1E88E5",
          stroke: "#0D47A1",
          desiredSize: new go.Size(8, 5),
          portId: "ENTRADA",
          alignment: new go.Spot(0, 0.5, -4, 0),
          fromSpot: go.Spot.Left,
          toSpot: go.Spot.Left,
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer"
        })
      )
      // Porta de saída 1 (superior direita)
      .add(
        new go.Shape("Rectangle", {
          fill: "#71afe5",
          stroke: "#E65100",
          desiredSize: new go.Size(24, 5),
          portId: "F1",
          alignment: new go.Spot(1, 0.30, 4, 0),
          fromSpot: go.Spot.Right,
          toSpot: go.Spot.Right,
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer"
        })
      )
      // Porta de saída 2 (inferior direita)
      .add(
        new go.Shape("Rectangle", {
          fill: "#ff9c4a",
          stroke: "#E65100",
          desiredSize: new go.Size(24, 5),
          portId: "F2",
          alignment: new go.Spot(1, 0.70, 4, 0),
          fromSpot: go.Spot.Right,
          toSpot: go.Spot.Right,
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer"
        })
      );
  }

  // Método que retorna a definição do modelo para o GoJS
  getModelDefinition(): go.ObjectData {
    return {
      category: "splitterDesb",
      labelText: "Sp 1:2",
      key: "SplitterDesb",
      loc: "600 800"
    };
  }
}
