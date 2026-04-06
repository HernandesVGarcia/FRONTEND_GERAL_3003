import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';
import { buildPortPowerMeterContextClick } from '../cabo-port-power-meter-direct';

@Component({
  selector: 'app-cabo-144f-int',
  template: `
    <div class="cabo-144f-container" [style.width.px]="width" [style.height.px]="height">
      <div class="cabo-144f-header">
        <span>Cabo 144F NAC</span>
      </div>
      <div class="cabo-144f-body">
        <!-- As portas/conexões serão adicionadas aqui posteriormente -->
      </div>
    </div>
  `,
  styles: [`
    .cabo-144f-container {
      position: relative;
      border: 2px solid #2196F3;
      border-radius: 5px;
      background-color: #e3f2fd;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      user-select: none;
    }

    .cabo-144f-header {
      background-color: #2196F3;
      color: white;
      padding: 8px;
      font-weight: bold;
      text-align: center;
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
    }

    .cabo-144f-body {
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
export class Cabo144FIntComponent implements OnInit {
  @Input() positionX: number = 100;
  @Input() positionY: number = 100;
  
  // Definindo as dimensões do cabo - mais alto para acomodar 36 fibras
  width: number = 100;
  height: number = 2200;

  // Define as cores para os ports - usando cores específicas para cada tubo
  portColors144F = ["#4169E1", "#f67828", "#008000", "#964b00", "gray", "white", "red", "black", "yellow","#6b3fa0","#ff58ae","cyan"];
  
  // Método para obter a definição do modelo para usar no GoJS com identificador único
  getModelDefinition() {
    return {
      key: "cabo144FINT",
      width: this.width,
      height: this.height,
      category: "cabo144FINT",
      positionX: this.positionX,
      positionY: this.positionY,
      radius: 55,
      resizable: true,
      rotatable: true,
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
          name: "cabo72F_background"                   
        })
          .bind("width", "width")
          .bind("height", "height")
      )
      .add(new go.TextBlock("", {  // texto inicial vazio
        name: "LABEL_72F",  // nome único para referência
        font: "bold 15px arial",
        angle: -90,
                                position: new go.Point(0, 0),
                                alignment: go.Spot.Left,
                                stroke: "#424242",
                                alignmentFocus: go.Spot.Right,
      })
      .bind("text", "labelText")  // bind com a propriedade labelText do node data
      )
      .add(
        new go.Panel(go.Panel.Position)
          .add(
            // Tubo 1 - Verde (Fibras 1-12)
            new go.Shape("RoundedRectangle", {
              fill: "#71AFE5",
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 12,
              position: new go.Point(this.width / 2, 0),
              name: "cabo144F_tube1"
            })
          )
          .add(
            // Tubo 2 - Amarelo (Fibras 13-24)
            new go.Shape("RoundedRectangle", {
              fill: "#ff9c4a",  // Laranja Tubo
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 12,
              position: new go.Point(this.width / 2, this.height / 12),
              name: "cabo144F_tube2"
            })
          )
          .add(
            // Tubo 3 - Branco 3 (Fibras 24-36)
            new go.Shape("RoundedRectangle", {
              fill: "#73c883",  // Verde tubo
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 12,
              position: new go.Point(this.width / 2, 2 * this.height / 12),
              name: "cabo144F_tube3"
            })
          )
          .add(
            // Tubo 4 - Branco 4 (Fibras 37-48)
            new go.Shape("RoundedRectangle", {
              fill: "#aa7444",  // Marrom Tubo
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 12,
              position: new go.Point(this.width / 2, 3 * this.height / 12),
              name: "cabo144F_tube4"
            })
          )

          .add(
            // Tubo 5 - Branco 5 (Fibras 49-60)
            new go.Shape("RoundedRectangle", {
              fill: "#aaaaaa",  // Cinza Tubo
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 12,
              position: new go.Point(this.width / 2, 4 * this.height / 12),
              name: "cabo144F_tube5"
            })
          )

          .add(
            // Tubo 6 - Branco 6 (Fibras 61-72)
            new go.Shape("RoundedRectangle", {
              fill: "#FFFFFF",  // Branco puro
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 12,
              position: new go.Point(this.width / 2, 5 * this.height / 12),
              name: "cabo144F_tube6"
            })
          )

          .add(
            // Tubo 7 - Branco 7 (Fibras 61-72)
            new go.Shape("RoundedRectangle", {
              fill: "#ff6961",  // tubo vermelho
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 12,
              position: new go.Point(this.width / 2, 6 * this.height / 12),
              name: "cabo144F_tube7"
            })
          )

          .add(
            // Tubo 8 - Branco 8 (Fibras 61-72)
            new go.Shape("RoundedRectangle", {
              fill: "#5e5e5e",  // tubo preto
              stroke: "#2196F3",
              
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 12,
              position: new go.Point(this.width / 2, 7 * this.height / 12),
              name: "cabo144F_tube8"
            })
          )

          .add(
            // Tubo 9 - Branco 9 (Fibras 73-84)
            new go.Shape("RoundedRectangle", {
              fill: "#FFFF81",  // tubo amarelo
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 12,
              position: new go.Point(this.width / 2, 8 * this.height / 12),
              name: "cabo144F_tube9"
            })
          )

          .add(
            // Tubo 10 - Branco 10 
            new go.Shape("RoundedRectangle", {
              fill: "#aa46db",  // tubo violeta
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 12,
              position: new go.Point(this.width / 2, 9 * this.height / 12),
              name: "cabo144F_tube10"
            })
          )

          .add(
            // Tubo 11 - Branco 11 
            new go.Shape("RoundedRectangle", {
              fill: "#FFcbdb",  // rosa
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 12,
              position: new go.Point(this.width / 2, 10 * this.height / 12),
              name: "cabo144F_tube11"
            })
          )

          .add(
            // Tubo 12 - Branco 12 
            new go.Shape("RoundedRectangle", {
              fill: "#71FFFF",  // ciano
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 12,
              position: new go.Point(this.width / 2, 11 * this.height / 12),
              name: "cabo144F_tube12"
            })
          )
          
          // Adicionar os ports F1-F6 no tubo verde
          .add(this.createPortsPanel144F(1, 12, this.width / 2, 0, this.height / 12))
          // Adicionar os ports F7-F12 no tubo amarelo
          .add(this.createPortsPanel144F(13, 24, this.width / 2, this.height / 12, this.height / 12))
          // Adicionar os ports F13-F18 no primeiro tubo branco
          .add(this.createPortsPanel144F(25, 36, this.width / 2, 2 * this.height / 12, this.height / 12))
          // Adicionar os ports F19-F24 no segundo tubo branco
          .add(this.createPortsPanel144F(37, 48, this.width / 2, 3 * this.height / 12, this.height / 12))
          // Adicionar os ports F19-F24 no segundo tubo branco
          .add(this.createPortsPanel144F(49, 60, this.width / 2, 4 * this.height / 12, this.height / 12))
          // Adicionar os ports F19-F24 no segundo tubo branco
          .add(this.createPortsPanel144F(61, 72, this.width / 2, 5 * this.height / 12, this.height / 12))
          // Adicionar os ports F1-F6 no tubo verde
          .add(this.createPortsPanel144F(73, 84, this.width / 2, 6 * this.height / 12, this.height / 12))
          // Adicionar os ports F7-F12 no tubo amarelo
          .add(this.createPortsPanel144F(85, 96, this.width / 2, 7 * this.height / 12, this.height / 12))
          // Adicionar os ports F13-F18 no primeiro tubo branco
          .add(this.createPortsPanel144F(97, 108, this.width / 2, 8 * this.height / 12, this.height / 12))
          // Adicionar os ports F19-F24 no segundo tubo branco
          .add(this.createPortsPanel144F(109, 120, this.width / 2, 9 * this.height / 12, this.height / 12))
          // Adicionar os ports F19-F24 no segundo tubo branco
          .add(this.createPortsPanel144F(121, 132, this.width / 2, 10 * this.height / 12, this.height / 12))
          // Adicionar os ports F19-F24 no segundo tubo branco
          .add(this.createPortsPanel144F(133, 144, this.width / 2, 11 * this.height / 12, this.height / 12))
          
      );
  }

  // Método auxiliar específico para 36F para criar um painel de ports
  private createPortsPanel144F(startFiber: number, endFiber: number, panelX: number, panelY: number, panelHeight: number): go.Panel {
    const panel = new go.Panel(go.Panel.Position);
    const portHeight = panelHeight / (endFiber - startFiber + 1);
    const portWidth = 20;
    const portMargin = 1;

    for (let i = startFiber; i <= endFiber; i++) {
      const index = Math.floor((i - 1)) % this.portColors144F.length;
      const yPosition = panelY + ((i - startFiber) * (panelHeight / (endFiber - startFiber + 1))) + (portHeight / 2) - (portHeight / 4);
      
      // Adicionar o label (F1, F2, etc.) com nome único
      panel.add(
        new go.TextBlock(`F${i}`, {
          font: "10px sans-serif",
          position: new go.Point(panelX + portMargin + 2, yPosition),
          textAlign: "right",
          name: `cabo144F_label_F${i}`
        })
      );
      
      // Adicionar o port colorido sobre o retângulo correspondente com nome único
      panel.add(
        new go.Shape("Circle", {
          fill: this.portColors144F[index],
          stroke: "black",
          strokeWidth: 1.5,
          width: portWidth,
          height: portHeight / 1.5,
          position: new go.Point(panelX + this.width / 3, yPosition),
          portId: `F${i}`,  // Identificador do port
          fromSpot: go.Spot.RightSide,  // Conexões saem pela direita
          toSpot: go.Spot.RightSide,    // Conexões entram pela direita
          cursor: "pointer",
          fromLinkable: true,
          toLinkable: true,
          fromLinkableSelfNode: true,
          toLinkableSelfNode: true,
          alignment: go.Spot.Center,
          toMaxLinks: 1,
          fromMaxLinks: 1,
          contextClick: buildPortPowerMeterContextClick(`F${i}`),
          name: `cabo144F_port_F${i}`
        })
      );
    }

    return panel;
  }
  
  constructor() { }

  ngOnInit(): void {
    console.log('Cabo 144F NAC Component inicializado');
  }
}


