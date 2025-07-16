import { Component } from '@angular/core';
import * as go from 'gojs';

@Component({
  selector: 'app-splitter-1-p2',
  template: '<div></div>',
  standalone: true
})
export class Splitter12Component {
  
  constructor() { }

  // Método que retorna o template do nó para o GoJS
  getNodeTemplate(): go.Node {
    return new go.Node("Spot")
      .add(
        new go.Panel("Auto")
          .add(
            new go.Shape("Triangle", {
              fill: "#9FFFFF", 
              stroke: "#0097A9",
              strokeWidth: 2,
              desiredSize: new go.Size(80, 60),
              // Rotação para apontar entrada à esquerda e saídas à direita
              angle: -90
            })
          )
          .add(
            new go.TextBlock({
              margin: 10,              
              editable: true,
              font: "bold 8pt sans-serif",
              stroke: "#000000",
              alignment: go.Spot.Top
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
      category: "splitter12",
      labelText: "Sp 1:2",
      key: "Splitter1",
      loc: "0.5 0.5"
    };
  }
}