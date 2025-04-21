import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';

@Component({
  selector: 'app-cabo-12f-nac',
  templateUrl: './cabo-12-f-nac.component.html',
  styleUrls: ['./cabo-12-f-nac.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class Cabo12FNacComponent implements OnInit {
  @Input() positionX: number = 100;
  @Input() positionY: number = 100;
  
  // Definindo as dimensões do cabo
  width: number = 100;
  height: number = 250;

  // Define as cores para os ports
  portColors = ["#228B22", "yellow", "#FFFFFF", "#1EAEDB", "#ea384c", "#9b87f5"];
  
  // Método para obter a definição do modelo para usar no GoJS
  getModelDefinition() {
    return {
      key: "cabo12F",
      width: this.width,
      height: this.height,
      category: "cabo",
      positionX:this.positionX,
      positionY:this.positionY,
      radius: 55,
      resizable: true,
      rotatable:true,
      
    };
  }

  // Novo método para obter a definição do nodeTemplate
  getNodeTemplate() {
    return new go.Node(go.Panel.Auto)
      .add(
        new go.Shape("RoundedRectangle", {
          fill: "gray",//"#e3f2fd", 
          stroke: "#2196F3",
          strokeWidth: 2,
          
          
          
          
        })
          .bind("width", "width")
          .bind("height", "height")
          
     
  
  
  

)
.add(
  new go.Panel(go.Panel.Position)
    .add(
      // Retângulo verde superior
      new go.Shape("RoundedRectangle", {
        fill: "#008000",  // Verde claro
        stroke: "#2196F3",
        strokeWidth: 1,
        width: this.width / 2,
        height: this.height / 2,
        position: new go.Point(this.width/ 2, 0) , // Posicionado no lado direito, topo
        
      })
    )
    .add(
      // Retângulo amarelo inferior
      new go.Shape("RoundedRectangle", {
        fill: "yellow",  // Amarelo claro
        stroke: "#2196F3",
        strokeWidth: 1,
        width: this.width / 2,
        height: this.height / 2,
        position: new go.Point(this.width / 2, this.height / 2)  // Posicionado no lado direito, parte inferior
      })
    )
      // Adicionar todos os ports F1-F12 ao retângulo azul principal
      // Adicionar os ports F1-F6 no retângulo verde (superior)
      .add(this.createPortsPanel(1, 6, this.width / 2, 0, this.height / 2))
      // Adicionar os ports F7-F12 no retângulo amarelo (inferior)
      .add(this.createPortsPanel(7, 12, this.width / 2, this.height / 2, this.height / 2))
  );
}

// Método auxiliar para criar um painel de ports
private createPortsPanel(startFiber: number, endFiber: number, panelX: number, panelY: number, panelHeight: number): go.Panel {
const panel = new go.Panel(go.Panel.Position);
const portHeight = panelHeight / (endFiber - startFiber + 1);
const portWidth = 10;
const portMargin = 1;

for (let i = startFiber; i <= endFiber; i++) {
  const index = (i - 1) % this.portColors.length;
  const yPosition = panelY + ((i - startFiber) * (panelHeight / (endFiber - startFiber + 1))) + (portHeight / 2) - (portHeight / 4);
  
  // Adicionar o label (F1, F2, etc.)
  panel.add(
    new go.TextBlock(`F${i}`, {
      font: "bold 10px sans-serif",
      position: new go.Point(panelX + portMargin - 3, yPosition),
      textAlign: "right"
    })
  );
  
  // Adicionar o port colorido sobre o retângulo correspondente
  panel.add(
    new go.Shape("Circle", {
      fill: this.portColors[index],
      stroke: "#000000",
      strokeWidth: 1.5,
      width: portWidth,
      height: portHeight / 2,
      position: new go.Point(panelX + this.width / 3, yPosition),
      portId: `F${i}`,  // Identificador do port
      fromSpot: go.Spot.RightSide,  // Conexões saem pela direita
      toSpot: go.Spot.RightSide,     // Conexões entram pela esquerda
      cursor: "pointer",
      fromLinkable : true,
      toLinkable:true,
      alignment: go.Spot.Center
      
      
    })
  );
}

return panel;
}
  
  constructor() { }

  ngOnInit(): void {
    console.log('Cabo 12F NAC Component inicializado');
  }
}