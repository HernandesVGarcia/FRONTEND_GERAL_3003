import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';
import { buildPortPowerMeterContextClick } from '../cabo-port-power-meter-direct';

@Component({
  selector: 'app-cabo-2f-nac',
  templateUrl: './cabo-2-f-nac.component.html',
  styleUrls: ['./cabo-2-f-nac.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class Cabo2FNacComponent implements OnInit {
  @Input() positionX: number = 100;
  @Input() positionY: number = 100;
  
  // Definindo as dimensões do cabo
  width: number = 100;
  height: number = 100;

  // Define as cores para os ports
  portColors4f = ["green", "yellow"];
  
  // Método para obter a definição do modelo para usar no GoJS
  getModelDefinition() {
    return {
      key: "cabo2F",
      width: this.width,
      height: this.height,
      category: "cabo2F",
      positionX:this.positionX,
      positionY:this.positionY,
      radius: 55,
      resizable: true,
      rotatable:true,
      
    };
  }

  // Novo método para obter a definição do nodeTemplate
  getNodeTemplate() {
    return new go.Node(go.Panel.Spot, {
      contextMenu: go.GraphObject.build('ContextMenu', {
        alignment: go.Spot.Left,
        alignmentFocus: go.Spot.Right
      })
        .add(
          go.GraphObject.build('ContextMenuButton', {
            click: (e, obj) => {
              const contextmenu = obj.part;
              if (contextmenu && contextmenu.data) {
                const cableData = contextmenu.data;
                window.dispatchEvent(new CustomEvent('caboContextMenu', {
                  detail: { action: 'visualizarFibras', data: cableData }
                }));
              }
            }
          }).add(new go.TextBlock(' 👁 Visualizar fibras', { textAlign: 'left', alignment: go.Spot.Left }))
        )
        .add(
          go.GraphObject.build('ContextMenuButton', {
            click: (e, obj) => {
              const contextmenu = obj.part;
              if (contextmenu && contextmenu.data) {
                const cableData = contextmenu.data;
                window.dispatchEvent(new CustomEvent('caboContextMenu', {
                  detail: { action: 'fusaoPorTubos', data: cableData }
                }));
              }
            }
          }).add(new go.TextBlock(' 🔗 Fusão por tubos', { textAlign: 'left', alignment: go.Spot.Left }))
        )
        .add(
          go.GraphObject.build('ContextMenuButton', {
            click: (e, obj) => {
              const contextmenu = obj.part;
              if (contextmenu && contextmenu.data) {
                const cableData = contextmenu.data;
                window.dispatchEvent(new CustomEvent('caboContextMenu', {
                  detail: { action: 'espelhar', data: cableData }
                }));
              }
            }
          }).add(new go.TextBlock(' ⇄ Espelhar', { textAlign: 'left', alignment: go.Spot.Left }))
        )
    })
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
                position: new go.Point(100, 0),
                alignment: go.Spot.Left,
                alignmentFocus: go.Spot.Right,
                stroke:"blue",
                wrap: go.Wrap.Fit,
                width: 300,
                textAlign: "center",  // Esta propriedade alinha texto no centro
                overflow: go.TextOverflow.Ellipsis      
                



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
        width: this.width / 2.0,
        height: this.height / 1,
        position: new go.Point(this.width/ 2, 0) , // Posicionado no lado direito, topo
        
      })
    )
    
      // Adicionar todos os ports F1-F12 ao retângulo azul principal
      // Adicionar os ports F1-F6 no retângulo verde (superior)
      .add(this.createPortsPanel(1, 2, this.width / 2, 0, this.height / 1))
      
  );
}

// Método auxiliar para criar um painel de ports
private createPortsPanel(startFiber: number, endFiber: number, panelX: number, panelY: number, panelHeight: number): go.Panel {
const panel = new go.Panel(go.Panel.Position);
const portHeight = panelHeight / (endFiber - startFiber + 1);
const portWidth = 15;
const portMargin = 5;

for (let i = startFiber; i <= endFiber; i++) {
  const index = (i - 1) % this.portColors4f.length;
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
      fill: this.portColors4f[index],
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
      toLinkable: true,
      fromLinkableSelfNode: true,
      toLinkableSelfNode: true,
      alignment: go.Spot.Center,
      toMaxLinks:1,
      fromMaxLinks:1,
      contextClick: buildPortPowerMeterContextClick(`F${i}`),
    })
  );
}

return panel;
}
  
  constructor() { }

  ngOnInit(): void {
    console.log('Cabo 2F NAC Component inicializado');
  }
}

