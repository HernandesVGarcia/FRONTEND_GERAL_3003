import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';

@Component({
  selector: 'app-cabo-6f-nac',
  templateUrl: './cabo-6-f-nac.component.html',
  styleUrls: ['./cabo-6-f-nac.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class Cabo6FNacComponent implements OnInit {
  @Input() positionX: number = 100;
  @Input() positionY: number = 100;
  
  // Definindo as dimensões do cabo
  width: number = 100;
  height: number = 150;

  // Define as cores para os ports
  portColors6f = ["green", "yellow", "white", "blue", "red", "#7a68d2"];
  
  // Método para obter a definição do modelo para usar no GoJS
  getModelDefinition() {
    return {
      key: "cabo6F",
      width: this.width,
      height: this.height,
      category: "cabo6F",
      positionX:this.positionX,
      positionY:this.positionY,
      radius: 55,
      resizable: true,
      rotatable:true,
      
    };
  }

  // Novo método para obter a definição do nodeTemplate
  getNodeTemplate() {
    return new go.Node(go.Panel.Spot)
      .add(
        new go.Shape("RoundedRectangle", {
          fill: "#666666",//"#e3f2fd", 
          stroke: "#2196F3",
          strokeWidth: 2,                   
        })
          .bind("width", "width")
          .bind("height", "height")
          
        )

        .add(new go.TextBlock("", {  // texto inicial vazio
        name: "LABEL",  // nome para referência
        font: "12px sans-serif",
        angle: -90,
        position: new go.Point(0, 0),
        alignment: go.Spot.Left,
        stroke: "black",
        alignmentFocus: go.Spot.Right,
        textAlign: "center",  // Esta propriedade alinha texto no centro



      })
      .bind("text", "labelText")  // bind com a propriedade labelText do node data
    )

.add(
  new go.Panel(go.Panel.Position)
    .add(
      // Retângulo verde superior
      new go.Shape("RoundedRectangle", {
        fill: "white",  // Verde claro
        stroke: "#2196F3",
        strokeWidth: 1,
        width: this.width / 2,
        height: this.height / 1,
        position: new go.Point(this.width/ 2, 0) , // Posicionado no lado direito, topo
        
      })
    )
    
      // Adicionar todos os ports F1-F12 ao retângulo azul principal
      // Adicionar os ports F1-F6 no retângulo verde (superior)
      .add(this.createPortsPanel(1, 6, this.width / 2, 0, this.height / 1))
      
  );
}

// Método auxiliar para criar um painel de ports
private createPortsPanel(startFiber: number, endFiber: number, panelX: number, panelY: number, panelHeight: number): go.Panel {
const panel = new go.Panel(go.Panel.Position);
const portHeight = panelHeight / (endFiber - startFiber + 1);
const portWidth = 25;
const portMargin = 1;

for (let i = startFiber; i <= endFiber; i++) {
  const index = (i - 1) % this.portColors6f.length;
  const yPosition = panelY + ((i - startFiber) * (panelHeight / (endFiber - startFiber + 1))) + (portHeight / 2) - (portHeight / 4);
  
  // Adicionar o label (F1, F2, etc.)
  panel.add(
    new go.TextBlock(`F${i}`, {
      font: "10px sans-serif",
      position: new go.Point(panelX + portMargin + 1, yPosition),
      textAlign: "right"
    })
  );
  
  // Adicionar o port colorido sobre o retângulo correspondente
  panel.add(
    new go.Shape("Circle", {
      fill: this.portColors6f[index],
      stroke: "black",
      strokeWidth: 1,
      width: portWidth,
      height: portHeight / 2,
      position: new go.Point(panelX + this.width / 3, yPosition),
      portId: `F${i}`,  // Identificador do port
      fromSpot: go.Spot.RightSide,  // Conexões saem pela direita
      toSpot: go.Spot.RightSide,     // Conexões entram pela esquerda
      cursor: "pointer",
      fromLinkable : true,
      toLinkable:true,
      alignment: go.Spot.Center,
      toMaxLinks:1,
      fromMaxLinks:1,
      
      
      
      
    })
  );
}

return panel;
}
  
  constructor() { }

  ngOnInit(): void {
    console.log('Cabo 6F NAC Component inicializado');
  }
}
