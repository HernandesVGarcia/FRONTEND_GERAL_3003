import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';

@Component({
  selector: 'app-cabo-48f-nac',
  template: `
    <div class="cabo-48f-container" [style.width.px]="width" [style.height.px]="height">
      <div class="cabo-48f-header">
        <span>Cabo 48F NAC</span>
      </div>
      <div class="cabo-48f-body">
        <!-- As portas/conexões serão adicionadas aqui posteriormente -->
      </div>
    </div>
  `,
  styles: [`
    .cabo-48f-container {
      position: relative;
      border: 2px solid #2196F3;
      border-radius: 5px;
      background-color: #e3f2fd;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      user-select: none;
    }

    .cabo-48f-header {
      background-color: #2196F3;
      color: white;
      padding: 8px;
      font-weight: bold;
      text-align: center;
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
    }

    .cabo-48f-body {
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
export class Cabo48FNacComponent implements OnInit {
  @Input() positionX: number = 100;
  @Input() positionY: number = 100;
  
  // Definindo as dimensões do cabo - mais alto para acomodar 36 fibras
  width: number = 100;
  height: number = 800;

  // Define as cores para os ports - usando cores específicas para cada tubo
  portColors48F = ["green", "yellow", "white", "blue", "red", "#7a68d2", "brown", "pink", "black", "gray", "orange", "cyan"];
  
  // Método para obter a definição do modelo para usar no GoJS com identificador único
  getModelDefinition() {
    return {
      key: "cabo48F",
      width: this.width,
      height: this.height,
      category: "cabo48F",
      positionX: this.positionX,
      positionY: this.positionY,
      radius: 55,
      resizable: true,
      rotatable: true,
    };
  }

  // Método para obter a definição do nodeTemplate
  getNodeTemplate() {
    return new go.Node(go.Panel.Auto)
      .add(
        new go.Shape("RoundedRectangle", {
          fill: "#666666", 
          stroke: "#2196F3",
          strokeWidth: 2,
          name: "cabo48F_background"                   
        })
          .bind("width", "width")
          .bind("height", "height")
      )
      .add(new go.TextBlock("", {  // texto inicial vazio
        name: "LABEL_48F",  // nome único para referência
        font: "15px sans-serif",
        angle: -90,
        position: new go.Point(-100, 0),
        alignment: go.Spot.Left,
        stroke:"white"
      })
      .bind("text", "labelText")  // bind com a propriedade labelText do node data
      )
      .add(
        new go.Panel(go.Panel.Position)
          .add(
            // Tubo 1 - Verde (Fibras 1-6)
            new go.Shape("RoundedRectangle", {
              fill: "#229A00",  // Verde escuro
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 4,
              position: new go.Point(this.width / 2, 0),
              name: "cabo48F_tube1"
            })
          )
          .add(
            // Tubo 2 - Amarelo (Fibras 7-12)
            new go.Shape("RoundedRectangle", {
              fill: "#FFD700",  // Amarelo dourado
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 4,
              position: new go.Point(this.width / 2, this.height / 4),
              name: "cabo48F_tube2"
            })
          )
          .add(
            // Tubo 3 - Branco 1 (Fibras 13-18)
            new go.Shape("RoundedRectangle", {
              fill: "#F5F5F5",  // Branco
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 4,
              position: new go.Point(this.width / 2, 2 * this.height / 4),
              name: "cabo48F_tube3"
            })
          )
          .add(
            // Tubo 4 - Branco 2 (Fibras 19-24)
            new go.Shape("RoundedRectangle", {
              fill: "#FFFFFF",  // Branco puro
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 4,
              position: new go.Point(this.width / 2, 3 * this.height / 4),
              name: "cabo48F_tube4"
            })
          )
          
          // Adicionar os ports F1-F6 no tubo verde
          .add(this.createPortsPanel48F(1, 12, this.width / 2, 0, this.height / 4))
          // Adicionar os ports F7-F12 no tubo amarelo
          .add(this.createPortsPanel48F(13, 24, this.width / 2, this.height / 4, this.height / 4))
          // Adicionar os ports F13-F18 no primeiro tubo branco
          .add(this.createPortsPanel48F(25, 36, this.width / 2, 2 * this.height / 4, this.height / 4))
          // Adicionar os ports F19-F24 no segundo tubo branco
          .add(this.createPortsPanel48F(37, 48, this.width / 2, 3 * this.height / 4, this.height / 4))
          
      );
  }

  // Método auxiliar específico para 36F para criar um painel de ports
  private createPortsPanel48F(startFiber: number, endFiber: number, panelX: number, panelY: number, panelHeight: number): go.Panel {
    const panel = new go.Panel(go.Panel.Position);
    const portHeight = panelHeight / (endFiber - startFiber + 1);
    const portWidth = 20;
    const portMargin = 1;

    for (let i = startFiber; i <= endFiber; i++) {
      const index = Math.floor((i - 1)) % this.portColors48F.length;
      const yPosition = panelY + ((i - startFiber) * (panelHeight / (endFiber - startFiber + 1))) + (portHeight / 2) - (portHeight / 4);
      
      // Adicionar o label (F1, F2, etc.) com nome único
      panel.add(
        new go.TextBlock(`F${i}`, {
          font: "10px sans-serif",
          position: new go.Point(panelX + portMargin + 2, yPosition),
          textAlign: "right",
          name: `cabo48F_label_F${i}`
        })
      );
      
      // Adicionar o port colorido sobre o retângulo correspondente com nome único
      panel.add(
        new go.Shape("Circle", {
          fill: this.portColors48F[index],
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
          alignment: go.Spot.Center,
          toMaxLinks: 1,
          fromMaxLinks: 1,
          name: `cabo48F_port_F${i}`
        })
      );
    }

    return panel;
  }
  
  constructor() { }

  ngOnInit(): void {
    console.log('Cabo 48F NAC Component inicializado');
  }
}
