import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';

@Component({
  selector: 'app-cabo-6f-nac-d',
  templateUrl: './cabo-6-f-nac-d.component.html',
  styleUrls: ['./cabo-6-f-nac-d.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class Cabo6FNacDComponent implements OnInit {
  @Input() positionX: number = 0;
  @Input() positionY: number = 0;
  
  // Definindo as dimensões do cabo
  width: number = 100;
  height: number = 150;
  
  // Define as cores para os ports
  portColors = ["#228B22", "yellow", "#FFFFFF", "blue", "#ea384c", "#9b87f5"];
  
  // Método para obter a definição do modelo para usar no GoJS
  getModelDefinition() {
    return {
      key: "cabo6F_D",
      width: this.width,
      height: this.height,
      category: "cabo6F_D",
      radius:30
    };
  }
  
  // Método para obter a definição do nodeTemplate
  getNodeTemplate() {
    return new go.Node(go.Panel.Spot)
      .add(
        new go.Shape("RoundedRectangle", {
          fill: "	#666666", 
          stroke: "#2196F3",
          strokeWidth: 1
        })
          .bind("width", "width")
          .bind("height", "height")
      )
      .add(new go.TextBlock("", {  // texto inicial vazio
        name: "LABEL",  // nome para referência
        font: "12px sans-serif",
        angle: 90,
                        position: new go.Point(0, 0),
                        alignment: go.Spot.Right,
                        stroke: "black",
                        alignmentFocus: go.Spot.Left,
                        textAlign: "center",  // Esta propriedade alinha texto no centro
      })
      .bind("text", "labelText")  // bind com a propriedade labelText do node data
    )
      .add(
        new go.Panel(go.Panel.Position)
          .add(
            // Retângulo verde superior - agora no lado esquerdo
            new go.Shape("RoundedRectangle", {
              fill: "white",  // Forest Green
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 1,
              position: new go.Point(0, 0)  // Posicionado no lado esquerdo, topo
              
            })
          )
          
          // Adicionar os ports F1-F6 no retângulo verde (superior) - agora no lado esquerdo
          .add(this.createPortsPanel(1, 6, 0, 0, this.height / 1))
          
      );
  }
  
  // Método auxiliar para criar um painel de ports - modificado para o lado esquerdo
  private createPortsPanel(startFiber: number, endFiber: number, panelX: number, panelY: number, panelHeight: number): go.Panel {
    const panel = new go.Panel(go.Panel.Position);
    const portHeight = panelHeight / (endFiber - startFiber + 1);
    const portWidth = 30;
    const portMargin = 5;
    
    for (let i = startFiber; i <= endFiber; i++) {
      const index = (i - 1) % this.portColors.length;
      const yPosition = panelY + ((i - startFiber) * (panelHeight / (endFiber - startFiber + 1))) + (portHeight / 2) - (portHeight / 4);
      
     // Adicionar o label (F1, F2, etc.) à direita do port
     panel.add(
      new go.TextBlock(`F${i}`, {
        font: "10px sans-serif",
        position: new go.Point(panelX - portMargin - 55, yPosition),
        textAlign: "left"
      })
    );
  

      // Adicionar o port colorido à esquerda do retângulo correspondente
      panel.add(
        new go.Shape("Circle", {
          fill: this.portColors[index],
          stroke: "#000000",
          strokeWidth: 1,
          width: portWidth,
          height: portHeight / 2,
          //position: new go.Point(panelX - 5 - portWidth, yPosition),
          position: new go.Point(-90, yPosition),
          portId: `F${i}`,  // Identificador do port
          fromSpot: go.Spot.Left,  // Conexões saem pela esquerda (inverso do original)
          toSpot: go.Spot.Left,   // Conexões entram pela direita (inverso do original)
          cursor: "pointer",
          fromLinkable : true,
          toLinkable:true,
          toMaxLinks:1,
          fromMaxLinks:1,
          
          
          
          
        })
      );
    }
      
    
    return panel;
  }
  
  constructor() { }

  ngOnInit(): void {
    console.log('Cabo 6F NAC D Component inicializado');
  }
}
