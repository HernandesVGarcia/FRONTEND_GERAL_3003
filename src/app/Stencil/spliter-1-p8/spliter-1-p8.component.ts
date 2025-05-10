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
        new go.Panel("Auto")
          .add(
            new go.Shape("Triangle", {
              fill: "#AFE4DE", 
              stroke: "#000000",
              strokeWidth: 2,
              desiredSize: new go.Size(200, 140),
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
          desiredSize: new go.Size(10, 8),
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT2",
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT3",
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT4",
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT5",
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT6",
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT7",
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
          fill: "#FB8C00",
          stroke: "#E65100",
          desiredSize: new go.Size(34, 6),
          portId: "OUT8",
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
      loc: "0.5 0.5"
    };
  }
}