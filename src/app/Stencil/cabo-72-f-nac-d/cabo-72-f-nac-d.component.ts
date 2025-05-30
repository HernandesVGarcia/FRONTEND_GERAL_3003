import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';

@Component({
  selector: 'app-cabo-72f-nac-d',
  template: `
    <div class="cabo-72f-d-container" [style.width.px]="width" [style.height.px]="height">
      <div class="cabo-72f-d-header">
        <span>Cabo 72F NAC D</span>
      </div>
      <div class="cabo-72f-d-body">
        <!-- As portas/conexões serão adicionadas aqui posteriormente -->
      </div>
    </div>
  `,
  styles: [`
    .cabo-72f-d-container {
      position: relative;
      border: 2px solid #2196F3;
      border-radius: 5px;
      background-color: #e3f2fd;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      user-select: none;
    }

    .cabo-72f-d-header {
      background-color: #2196F3;
      color: white;
      padding: 8px;
      font-weight: bold;
      text-align: center;
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
    }

    .cabo-72f-d-body {
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
export class Cabo72FNacDComponent implements OnInit {
  @Input() positionX: number = 100;
  @Input() positionY: number = 100;
  
  // Definindo as dimensões do cabo - mais alto para acomodar 36 fibras
  width: number = 100;
  height: number = 1100;

  // Define as cores para os ports - usando as mesmas cores do modelo não-D
  portColors72F_D = ["green", "yellow", "white", "blue", "red", "#7a68d2", "brown", "pink", "black", "gray", "orange", "cyan"];
  
  // Método para obter a definição do modelo para usar no GoJS com identificador único
  getModelDefinition() {
    return {
      key: "cabo72F_D",
      width: this.width,
      height: this.height,
      category: "cabo72F_D",
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
          name: "cabo72F_D_background"                   
        })
          .bind("width", "width")
          .bind("height", "height")
      )
      .add(new go.TextBlock("", {  // texto inicial vazio
        name: "LABEL_72F_D",  // nome único para referência
        font: "15px sans-serif",
        angle: -90,
        position: new go.Point(-100, 0),
        alignment: go.Spot.Right,
        stroke:"white"
      })
      .bind("text", "labelText")  // bind com a propriedade labelText do node data
      )
      .add(
        new go.Panel(go.Panel.Position)
          .add(
            // Tubo 1 - Verde (Fibras 1-6) - posicionado à esquerda
            new go.Shape("RoundedRectangle", {
              fill: "#229A00",  // Verde escuro
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 6,
              position: new go.Point(-0, 0),
              name: "cabo72F_D_tube1"
            })
          )
          .add(
            // Tubo 2 - Amarelo (Fibras 7-12) - posicionado à esquerda
            new go.Shape("RoundedRectangle", {
              fill: "#FFD700",  // Amarelo dourado
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 6,
              position: new go.Point(-0, this.height / 6),
              name: "cabo72F_D_tube2"
            })
          )
          .add(
            // Tubo 3 - Branco 1 (Fibras 13-18) - posicionado à esquerda
            new go.Shape("RoundedRectangle", {
              fill: "#F5F5F5",  // Branco
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 6,
              position: new go.Point(-0, 2 * this.height / 6),
              name: "cabo72F_D_tube3"
            })
          )
          .add(
            // Tubo 4 - Branco 2 (Fibras 19-24) - posicionado à esquerda
            new go.Shape("RoundedRectangle", {
              fill: "#FFFFFF",  // Branco puro
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 6,
              position: new go.Point(-0, 3 * this.height / 6),
              name: "cabo72F_D_tube4"
            })
          )

          .add(
            // Tubo 5 - Branco 2 (Fibras 19-24) - posicionado à esquerda
            new go.Shape("RoundedRectangle", {
              fill: "#FFFFFF",  // Branco puro
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 6,
              position: new go.Point(-0, 4 * this.height / 6),
              name: "cabo72F_D_tube5"
            })
          )

          .add(
            // Tubo 6 - Branco 2 (Fibras 19-24) - posicionado à esquerda
            new go.Shape("RoundedRectangle", {
              fill: "#FFFFFF",  // Branco puro
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 6,
              position: new go.Point(-0, 5 * this.height / 4),
              name: "cabo72F_D_tube6"
            })
          )
          
          // Adicionar os ports F1-F6 no tubo verde - direção invertida
          .add(this.createPortsPanel72F_D(1, 12, 0, 0, this.height / 6))
          // Adicionar os ports F7-F12 no tubo amarelo - direção invertida
          .add(this.createPortsPanel72F_D(13, 24, 0, this.height / 6, this.height / 6))
          // Adicionar os ports F13-F18 no primeiro tubo branco - direção invertida
          .add(this.createPortsPanel72F_D(25, 36, 0, 2 * this.height / 6, this.height / 6))
          // Adicionar os ports F19-F24 no segundo tubo branco - direção invertida
          .add(this.createPortsPanel72F_D(37, 48, 0, 3 * this.height / 6, this.height / 6))
          // Adicionar os ports F13-F18 no primeiro tubo branco - direção invertida
          .add(this.createPortsPanel72F_D(49, 60, 0, 4 * this.height / 6, this.height / 6))
          // Adicionar os ports F19-F24 no segundo tubo branco - direção invertida
          .add(this.createPortsPanel72F_D(61, 72, 0, 5 * this.height / 6, this.height / 6))
          
      );
  }

  // Método auxiliar específico para 36F_D para criar um painel de ports na direção invertida
  private createPortsPanel72F_D(startFiber: number, endFiber: number, panelX: number, panelY: number, panelHeight: number): go.Panel {
    const panel = new go.Panel(go.Panel.Position);
    const portHeight = panelHeight / (endFiber - startFiber + 1);
    const portWidth = 78; // ajuste igual ao do Cabo24F_D
    const portMargin = 2;

    for (let i = startFiber; i <= endFiber; i++) {
      const index = Math.floor((i - 1) ) % this.portColors72F_D.length;
      const yPosition = panelY + ((i - startFiber) * (panelHeight / (endFiber - startFiber + 1))) + (portHeight / 2) - (portHeight / 4);
      
      // Adicionar o label (F1, F2, etc.) - agora à direita do port
      panel.add(
        new go.TextBlock(`F${i}`, {
          font: "10px sans-serif",
          position: new go.Point(panelX - 70, yPosition), // ajuste igual ao do Cabo24F_D
          textAlign: "right",
          name: `cabo72F_D_label_F${i}`
        })
      );
      
      // Adicionar o port colorido - agora à esquerda do retângulo correspondente
      panel.add(
        new go.Shape("Circle", {
          fill: this.portColors72F_D[index],
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
          alignment: go.Spot.Center,
          toMaxLinks: 1,
          fromMaxLinks: 1,
          name: `cabo72F_D_port_F${i}`
        })
      );
    }

    return panel;
  }
  
  constructor() { }

  ngOnInit(): void {
    console.log('Cabo 72F NAC D Component inicializado');
  }
}