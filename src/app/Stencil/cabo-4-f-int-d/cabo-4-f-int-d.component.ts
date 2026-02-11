import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';

@Component({
  selector: 'app-cabo-4f-int-d',
  templateUrl: './cabo-4-f-int-d.component.html',
  styleUrls: ['./cabo-4-f-int-d.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class Cabo4FIntDComponent implements OnInit {
  @Input() positionX: number = 0;
  @Input() positionY: number = 0;
  
  // Definindo as dimensões do cabo
  width: number = 100;
  height: number = 150;
  
  // Define as cores para os ports
  portColors = ["#4169E1", "#f67828", "#008000", "#964b00"];
  
  // Método para obter a definição do modelo para usar no GoJS
  getModelDefinition() {
    return {
      key: "cabo4FINT_D",
      width: this.width,
      height: this.height,
      category: "cabo4FINT_D",
      radius:30
    };
  }
  
  // Método para obter a definição do nodeTemplate
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
                  detail: { action: 'powerMeter', data: cableData }
                }));
              }
            }
          }).add(new go.TextBlock(' 🔌 Power Meter', { textAlign: 'left', alignment: go.Spot.Left }))
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
          fill: "	#666666", 
          stroke: "#2196F3",
          strokeWidth: 1
        })
          .bind("width", "width")
          .bind("height", "height")
      )
      .add(new go.TextBlock("", {  // texto inicial vazio
        name: "LABEL",  // nome para referência
                font: "bold 13px arial",
                angle: 90,
                position: new go.Point(100, 0),
                alignment: go.Spot.Right,
                alignmentFocus: go.Spot.Left,
                stroke:"#424242",
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
          .add(this.createPortsPanel(1, 4, 0, 0, this.height / 1))
          
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
          toLinkable: true,
          fromLinkableSelfNode: true,
          toLinkableSelfNode: true,
          toMaxLinks:1,
          fromMaxLinks:1,
          
          
          
          
        })
      );
    }
      
    
    return panel;
  }
  
  constructor() { }

  ngOnInit(): void {
    console.log('Cabo 4F INT D Component inicializado');
  }
}

