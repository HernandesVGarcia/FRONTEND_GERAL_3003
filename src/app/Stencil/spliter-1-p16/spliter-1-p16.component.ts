import { Component } from '@angular/core';
import * as go from 'gojs';

@Component({
  selector: 'app-splitter-1-p16',
  template: '<div></div>',
  standalone: true
})
export class Splitter116Component {
  
  constructor() { }

  // Método que retorna o template do nó para o GoJS
  getNodeTemplate(): go.Node {
    return new go.Node("Spot")
      .add(
        new go.Panel("Auto")
          .add(
            new go.Shape("Triangle", {
              fill: "#AFE4DE", 
              stroke: "#000000",
              strokeWidth: 2,
              desiredSize: new go.Size(340, 240),
              // Rotação para apontar entrada à esquerda e saídas à direita
              angle: -90
            })
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
      // Porta de entrada (esquerda)
      .add(
        new go.Shape("Rectangle", {
          fill: "#1E88E5",
          stroke: "#0D47A1",
          desiredSize: new go.Size(12, 10),
          portId: "IN",
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT1",
          alignment: new go.Spot(1, 0.038, 8, 0),
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT2",
          alignment: new go.Spot(1, 0.097, 8, 0),
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT3",
          alignment: new go.Spot(1, 0.159, 8, 0),
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT4",
          alignment: new go.Spot(1, 0.221, 8, 0),
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT5",
          alignment: new go.Spot(1, 0.283, 8, 0),
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT6",
          alignment: new go.Spot(1, 0.345, 8, 0),
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT7",
          alignment: new go.Spot(1, 0.407, 8, 0),
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT8",
          alignment: new go.Spot(1, 0.469, 8, 0),
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT9",
          alignment: new go.Spot(1, 0.531, 8, 0),
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT10",
          alignment: new go.Spot(1, 0.593, 8, 0),
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT11",
          alignment: new go.Spot(1, 0.655, 8, 0),
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT12",
          alignment: new go.Spot(1, 0.717, 8, 0),
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT13",
          alignment: new go.Spot(1, 0.779, 8, 0),
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT14",
          alignment: new go.Spot(1, 0.841, 8, 0),
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT15",
          alignment: new go.Spot(1, 0.903, 8, 0),
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT16",
          alignment: new go.Spot(1, 0.962, 8, 0),
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
      category: "splitter116",
      labelText: "Sp 1:16",
      key: "Splitter1P16",
      loc: "0.5 0.5"
    };
  }
}
