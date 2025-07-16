import { Component } from '@angular/core';
import * as go from 'gojs';

@Component({
  selector: 'app-splitter-1-p8',
  template: '<div></div>',
  standalone: true
})
export class Splitter18Component {
  
  constructor() { }

  // Método que retorna o template do nó para o GoJS
  getNodeTemplate(): go.Node {
    return new go.Node("Spot")
      .add(
        new go.Panel("Spot")
          .add(
            new go.Shape("Triangle", {
              fill: "#9FFFFF", 
              stroke: "#0097A9",
              strokeWidth: 3,
              desiredSize: new go.Size(200, 140),
              // Rotação para apontar entrada à esquerda e saídas à direita
              angle: -90
            })
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
      // Porta de entrada (esquerda)
      .add(
        new go.Shape("Rectangle", {
          fill: "#1E88E5",
          stroke: "#0D47A1",
          desiredSize: new go.Size(10, 8),
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
          fill: "#71afe5",//azul
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F1",
          alignment: new go.Spot(1, 0.15, 4, 0),
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
          fill: "#ff9c4a", //laranja
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F2",
          alignment: new go.Spot(1, 0.25, 4, 0),
          fromSpot: go.Spot.Right,
          toSpot: go.Spot.Right,
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer"
        })
      )

      .add(
        new go.Shape("Rectangle", {
          fill: "#73c883", //verde
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F3",
          alignment: new go.Spot(1, 0.35, 4, 0),
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
          fill: "#aa7444",//marron
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F4",
          alignment: new go.Spot(1, 0.45, 4, 0),
          fromSpot: go.Spot.Right,
          toSpot: go.Spot.Right,
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
          fill: "#aaaaaa", //cinza
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F5",
          alignment: new go.Spot(1, 0.55, 4, 0),
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
          fill: "white", //branco
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F6",
          alignment: new go.Spot(1, 0.65, 4, 0),
          fromSpot: go.Spot.Right,
          toSpot: go.Spot.Right,
          fromLinkable: true,
          toLinkable: true,
          fromLinkableDuplicates: false,
          toLinkableDuplicates: false,
          cursor: "pointer"
        })
      )

      .add(
        new go.Shape("Rectangle", {
          fill: "red", // vermelho
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F7",
          alignment: new go.Spot(1, 0.75, 4, 0),
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
          fill: "#F7ee63", //
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "F8",
          alignment: new go.Spot(1, 0.85, 4, 0),
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
      category: "splitter18",
      labelText: "Sp 1:8",
      key: "Splitter1P8",
      loc: "600 800"
    };
  }
}