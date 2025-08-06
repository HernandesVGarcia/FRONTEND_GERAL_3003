import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';

@Component({
  selector: 'app-cabo-36f-int',
  template: `
    <div class="cabo-36f-container" [style.width.px]="width" [style.height.px]="height">
      <div class="cabo-36f-header">
        <span>Cabo 36F NAC</span>
      </div>
      <div class="cabo-36f-body">
        <!-- As portas/conexões serão adicionadas aqui posteriormente -->
      </div>
    </div>
  `,
  styles: [`
    .cabo-36f-container {
      position: relative;
      border: 2px solid #2196F3;
      border-radius: 5px;
      background-color: #e3f2fd;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      user-select: none;
    }

    .cabo-36f-header {
      background-color: #2196F3;
      color: white;
      padding: 8px;
      font-weight: bold;
      text-align: center;
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
    }

    .cabo-36f-body {
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
export class Cabo36FIntComponent implements OnInit {
  @Input() positionX: number = 100;
  @Input() positionY: number = 100;
  
  // Definindo as dimensões do cabo - mais alto para acomodar 36 fibras
  width: number = 100;
  height: number = 600;

  // Define as cores para os ports - usando cores específicas para cada tubo
  portColors36F = ["#4169E1", "#f67828", "#008000", "#964b00", "gray", "white"];
  
  // Método para obter a definição do modelo para usar no GoJS com identificador único
  getModelDefinition() {
    return {
      key: "cabo36FINT",
      width: this.width,
      height: this.height,
      category: "cabo36FINT",
      positionX: this.positionX,
      positionY: this.positionY,
      radius: 55,
      resizable: true,
      rotatable: true,
    };
  }

  // Método para obter a definição do nodeTemplate
  getNodeTemplate() {
    return new go.Node(go.Panel.Spot)
      .add(
        new go.Shape("RoundedRectangle", {
          fill: "#666666", 
          stroke: "#2196F3",
          strokeWidth: 2,
          name: "cabo36F_background"                   
        })
          .bind("width", "width")
          .bind("height", "height")
      )
      .add(new go.TextBlock("", {  // texto inicial vazio
        name: "LABEL_36F",  // nome único para referência
        font: "15px sans-serif",
        angle: -90,
                position: new go.Point(0, 0),
                alignment: go.Spot.Left,
                stroke: "black",
                alignmentFocus: go.Spot.Right,
      })
      .bind("text", "labelText")  // bind com a propriedade labelText do node data
      )
      .add(
        new go.Panel(go.Panel.Position)
          .add(
            // Tubo 1 - (Fibras 1-6)
            new go.Shape("RoundedRectangle", {
              fill: "#71afe5",  // azul para tubo
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 6,
              position: new go.Point(this.width / 2, 0),
              name: "cabo36F_tube1"
            })
          )
          .add(
            // Tubo 2 -  (Fibras 7-12)
            new go.Shape("RoundedRectangle", {
              fill: "#ff9c4a",  // Laranja para Tubo
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 6,
              position: new go.Point(this.width / 2, this.height / 6),
              name: "cabo36F_tube2"
            })
          )
          .add(
            // Tubo 3 -  (Fibras 13-18)
            new go.Shape("RoundedRectangle", {
              fill: "#73c883",  // Verde para tubo
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 6,
              position: new go.Point(this.width / 2, 2 * this.height / 6),
              name: "cabo36F_tube3"
            })
          )
          .add(
            // Tubo 4 -  (Fibras 19-24)
            new go.Shape("RoundedRectangle", {
              fill: "#aa7444",  // Marrom para tubo
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 6,
              position: new go.Point(this.width / 2, 3 * this.height / 6),
              name: "cabo36F_tube4"
            })
          )
          .add(
            // Tubo 5 -  (Fibras 25-30)
            new go.Shape("RoundedRectangle", {
              fill: "#aaaaaa",  // Cinza para tubo
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 6,
              position: new go.Point(this.width / 2, 4 * this.height / 6),
              name: "cabo36F_tube5"
            })
          )
          .add(
            // Tubo 6 - (Fibras 31-36)
            new go.Shape("RoundedRectangle", {
              fill: "white",  // Branco para tubo
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 6,
              position: new go.Point(this.width / 2, 5 * this.height / 6),
              name: "cabo36F_tube6"
            })
          )
          // Adicionar os ports F1-F6 no tubo verde
          .add(this.createPortsPanel36F(1, 6, this.width / 2, 0, this.height / 6))
          // Adicionar os ports F7-F12 no tubo amarelo
          .add(this.createPortsPanel36F(7, 12, this.width / 2, this.height / 6, this.height / 6))
          // Adicionar os ports F13-F18 no primeiro tubo branco
          .add(this.createPortsPanel36F(13, 18, this.width / 2, 2 * this.height / 6, this.height / 6))
          // Adicionar os ports F19-F24 no segundo tubo branco
          .add(this.createPortsPanel36F(19, 24, this.width / 2, 3 * this.height / 6, this.height / 6))
          // Adicionar os ports F25-F30 no terceiro tubo branco
          .add(this.createPortsPanel36F(25, 30, this.width / 2, 4 * this.height / 6, this.height / 6))
          // Adicionar os ports F31-F36 no quarto tubo branco
          .add(this.createPortsPanel36F(31, 36, this.width / 2, 5 * this.height / 6, this.height / 6))
      );
  }

  // Método auxiliar específico para 36F para criar um painel de ports
  private createPortsPanel36F(startFiber: number, endFiber: number, panelX: number, panelY: number, panelHeight: number): go.Panel {
    const panel = new go.Panel(go.Panel.Position);
    const portHeight = panelHeight / (endFiber - startFiber + 1);
    const portWidth = 20;
    const portMargin = 1;

    for (let i = startFiber; i <= endFiber; i++) {
      const index = Math.floor((i - 1)) % this.portColors36F.length;
      const yPosition = panelY + ((i - startFiber) * (panelHeight / (endFiber - startFiber + 1))) + (portHeight / 2) - (portHeight / 4);
      
      // Adicionar o label (F1, F2, etc.) com nome único
      panel.add(
        new go.TextBlock(`F${i}`, {
          margin:3,
          font: "10px sans-serif",
          position: new go.Point(panelX + portMargin + 2, yPosition),
          textAlign: "right",
          name: `cabo36F_label_F${i}`
        })
      );
      
      // Adicionar o port colorido sobre o retângulo correspondente com nome único
      panel.add(
        new go.Shape("Circle", {
          fill: this.portColors36F[index],
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
          name: `cabo36F_port_F${i}`
        })
      );
    }

    return panel;
  }
  
  constructor() { }

  ngOnInit(): void {
    console.log('Cabo 36F NAC Component inicializado');
  }
}
