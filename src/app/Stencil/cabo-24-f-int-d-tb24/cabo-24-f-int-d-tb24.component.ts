import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';

@Component({
  selector: 'app-cabo-24f-int-d-tb24',
  template: `
    <div class="cabo-24f-d-container" [style.width.px]="width" [style.height.px]="height">
      <div class="cabo-24f-d-header">
        <span>Cabo 24F NAC D</span>
      </div>
      <div class="cabo-24f-d-body">
        <!-- As portas/conexões serão adicionadas aqui posteriormente -->
      </div>
    </div>
  `,
  styles: [`
    .cabo-24f-d-container {
      position: relative;
      border: 2px solid #2196F3;
      border-radius: 5px;
      background-color: #e3f2fd;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      user-select: none;
    }

    .cabo-24f-d-header {
      background-color: #2196F3;
      color: white;
      padding: 8px;
      font-weight: bold;
      text-align: center;
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
    }

    .cabo-24f-d-body {
      padding: 10px;
      display: flex;
      flex-direction: column;
      height: calc(100% - 36px);
      justify-content: space-between;
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class Cabo24FIntDTb24Component implements OnInit {
  @Input() positionX: number = 100;
  @Input() positionY: number = 100;
  
  // Definindo as dimensões do cabo - mais alto para acomodar 24 fibras
  width: number = 100;
  height: number = 400;

  // Define as cores para os ports - usando cores distintas do cabo 24F comum
  // Usando cores levemente modificadas para evitar compartilhamento
  portColors24F_D = ["#4169E1", "#f67828", "#008000", "#964b00", "gray", "white", "red", "black", "yellow","#6b3fa0","#ff58ae","cyan"];
  
  // Método para obter a definição do modelo para usar no GoJS com identificador único
  getModelDefinition() {
    return {
      key: "cabo24F_INT_D_TB24",
      width: this.width,
      height: this.height,
      category: "cabo24F_INT_D_TB24", // Categoria única para o tipo D
      positionX: this.positionX,
      positionY: this.positionY,
      radius: 55,
      resizable: true,
      rotatable: true,
    };
  }

  // Método para obter a definição do nodeTemplate com identificadores únicos para 24F_D
  getNodeTemplate() {
    // Criando um novo node para evitar referências compartilhadas
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
          fill: "#666666", 
          stroke: "#2196F3",
          strokeWidth: 2,
          name: "cabo24F_D_background"                   
        })
          .bind("width", "width")
          .bind("height", "height")
      )
      .add(new go.TextBlock("", {  // texto inicial vazio
        name: "LABEL_24F_D",  // nome único para referência
        font: "bold 15px arial",
        angle: 90,
        position: new go.Point(0, 0),                   
        alignment: go.Spot.Right,
        stroke: "#424242",
        textAlign: "center",  // Esta propriedade alinha texto no centro
        alignmentFocus: go.Spot.Left,
      })
      .bind("text", "labelText")  // bind com a propriedade labelText do node data
      )
      .add(
        new go.Panel(go.Panel.Position)
          .add(
            // Tubo 1 - Verde superior (Fibras 1-6) - agora no lado esquerdo
            new go.Shape("RoundedRectangle", {
              fill: "white",  // Verde escuro
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 1,
              position: new go.Point(-0, 0), // Posicionado à esquerda
              name: "cabo24F_D_tube1"
            })
          )
          
          // Adicionar os ports F1-F6 no tubo verde (primeiro quarto) - agora à esquerda
          .add(this.createPortsPanel24F_D(1, 12, 0, 0, this.height / 2))
          // Adicionar os ports F13-F18 no primeiro tubo branco (terceiro quarto) - agora à esquerda
          .add(this.createPortsPanel24F_D(13, 24, 0, this.height / 2, this.height / 2))
          
      );
  }

  // Método auxiliar específico para 24F_D para criar um painel de ports voltados para a esquerda
  private createPortsPanel24F_D(startFiber: number, endFiber: number, panelX: number, panelY: number, panelHeight: number): go.Panel {
    const panel = new go.Panel(go.Panel.Position);
    const portHeight = panelHeight / (endFiber - startFiber + 1);
    const portWidth = 78; // ajuste aqui para port
    const portMargin = 2;

    for (let i = startFiber; i <= endFiber; i++) {
      const index = (i - 1) % this.portColors24F_D.length;
      const yPosition = panelY + ((i - startFiber) * (panelHeight / (endFiber - startFiber + 1))) + (portHeight / 2) - (portHeight / 4);

      const portXPosition = panelX - portMargin - portWidth - 15;
      
      // Adicionar o label (F1, F2, etc.) agora à direita do port
      panel.add(
        new go.TextBlock(`F${i}`, {
          font: "10px sans-serif",
          position: new go.Point(panelX - 70, yPosition), // ajuste aqui para texto
          textAlign: "right",
          name: `cabo24F_D_label_F${i}`
        })
      );
      
      // Adicionar o port colorido agora à esquerda do retângulo correspondente
      panel.add(
        new go.Shape("Circle", {
          fill: this.portColors24F_D[index],
          stroke: "black",
          strokeWidth: 1.5,
          width: portWidth,
          height: portHeight / 1.5,
          position: new go.Point(panelX - portMargin - portWidth - 15, yPosition),
          portId: `F${i}`,  // Identificador do port
          fromSpot: go.Spot.Left,  // Conexões saem pela esquerda
          toSpot: go.Spot.Left,    // Conexões entram pela esquerda
          cursor: "pointer",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableSelfNode: true,
          toLinkableSelfNode: true,
          alignment: go.Spot.Center,
          toMaxLinks: 1,
          fromMaxLinks: 1,
          name: `cabo24F_D_port_F${i}`
        })
      );

      // 🎨 Adicionar tracinho APENAS para fibras 13-24 (segunda metade do cabo)
            if (i >= 13) {
              panel.add(
                new go.Shape("Rectangle", {
                  fill: "black",
                  stroke: null,
                  width: portWidth * 0.2, // Tracinho um pouco menor que o port
                  height: 2, // Altura do tracinho
                  position: new go.Point(
                    portXPosition , // Centralizado horizontalmente no port
                    yPosition + 4 // Posicionado acima do port
                  ),
                  name: `cabo24F_D_dash_F${i}`
                })
              );
            }
    }

    return panel;
  }
  
  constructor() { }

  ngOnInit(): void {
    console.log('Cabo 24F NAC D Component inicializado');
  }
}
