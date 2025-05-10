import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';

@Component({
  selector: 'app-cabo-24f-nac',
  template: `
    <div class="cabo-24f-container" [style.width.px]="width" [style.height.px]="height">
      <div class="cabo-24f-header">
        <span>Cabo 24F NAC</span>
      </div>
      <div class="cabo-24f-body">
        <!-- As portas/conexões serão adicionadas aqui posteriormente -->
      </div>
    </div>
  `,
  styles: [`
    .cabo-24f-container {
      position: relative;
      border: 2px solid #2196F3;
      border-radius: 5px;
      background-color: #e3f2fd;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      user-select: none;
    }

    .cabo-24f-header {
      background-color: #2196F3;
      color: white;
      padding: 8px;
      font-weight: bold;
      text-align: center;
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
    }

    .cabo-24f-body {
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
export class Cabo24FNacComponent implements OnInit {
  @Input() positionX: number = 100;
  @Input() positionY: number = 100;
  
  // Definindo as dimensões do cabo - mais alto para acomodar 24 fibras
  width: number = 100;
  height: number = 400;

  // Define as cores para os ports - usando cores distintas do cabo 12F
  // Usando cores modificadas para evitar compartilhamento
  portColors24F = ["#006400", "#FFD700", "#F5F5F5", "#0000CD", "#cc1f36", "#7a68d2"];
  
  // Método para obter a definição do modelo para usar no GoJS com identificador único
  getModelDefinition() {
    return {
      key: "cabo24F",
      width: this.width,
      height: this.height,
      category: "cabo24F", // Mudando para categoria única
      positionX: this.positionX,
      positionY: this.positionY,
      radius: 55,
      resizable: true,
      rotatable: true,
    };
  }

  // Método para obter a definição do nodeTemplate com identificadores únicos para 24F
  getNodeTemplate() {
    // Criando um novo node para evitar referências compartilhadas
    return new go.Node(go.Panel.Auto)
      .add(
        new go.Shape("RoundedRectangle", {
          fill: "#666666", 
          stroke: "#2196F3",
          strokeWidth: 2,
          name: "cabo24F_background"                   
        })
          .bind("width", "width")
          .bind("height", "height")
      )
      .add(new go.TextBlock("", {  // texto inicial vazio
        name: "LABEL_24F",  // nome único para referência
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
            // Tubo 1 - Verde superior (Fibras 1-6)
            new go.Shape("RoundedRectangle", {
              fill: "#229A00",  // Verde escuro (diferente do 12F)
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 4,
              position: new go.Point(this.width / 2, 0),
              name: "cabo24F_tube1"
            })
          )
          .add(
            // Tubo 2 - Amarelo (Fibras 7-12)
            new go.Shape("RoundedRectangle", {
              fill: "#FFD700",  // Amarelo dourado (diferente do 12F)
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 4,
              position: new go.Point(this.width / 2, this.height / 4),
              name: "cabo24F_tube2"
            })
          )
          .add(
            // Tubo 3 - Branco (Fibras 13-18)
            new go.Shape("RoundedRectangle", {
              fill: "#F5F5F5",  // Branco levemente diferente
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 4,
              position: new go.Point(this.width / 2, this.height / 2),
              name: "cabo24F_tube3"
            })
          )
          .add(
            // Tubo 4 - Branco (Fibras 19-24)
            new go.Shape("RoundedRectangle", {
              fill: "#F0F8FF",  // Branco azulado (diferente)
              stroke: "#2196F3",
              strokeWidth: 1,
              width: this.width / 2,
              height: this.height / 4,
              position: new go.Point(this.width / 2, 3 * this.height / 4),
              name: "cabo24F_tube4"
            })
          )
          // Adicionar os ports F1-F6 no tubo verde (primeiro quarto) - com novo método
          .add(this.createPortsPanel24F(1, 6, this.width / 2, 0, this.height / 4))
          // Adicionar os ports F7-F12 no tubo amarelo (segundo quarto)
          .add(this.createPortsPanel24F(7, 12, this.width / 2, this.height / 4, this.height / 4))
          // Adicionar os ports F13-F18 no primeiro tubo branco (terceiro quarto)
          .add(this.createPortsPanel24F(13, 18, this.width / 2, this.height / 2, this.height / 4))
          // Adicionar os ports F19-F24 no segundo tubo branco (quarto quarto)
          .add(this.createPortsPanel24F(19, 24, this.width / 2, 3 * this.height / 4, this.height / 4))
      );
  }

  // Método auxiliar específico para 24F para criar um painel de ports
  private createPortsPanel24F(startFiber: number, endFiber: number, panelX: number, panelY: number, panelHeight: number): go.Panel {
    const panel = new go.Panel(go.Panel.Position);
    const portHeight = panelHeight / (endFiber - startFiber + 1);
    const portWidth = 20;
    const portMargin = 1;

    for (let i = startFiber; i <= endFiber; i++) {
      const index = (i - 1) % this.portColors24F.length;
      const yPosition = panelY + ((i - startFiber) * (panelHeight / (endFiber - startFiber + 1))) + (portHeight / 2) - (portHeight / 4);
      
      // Adicionar o label (F1, F2, etc.) com nome único
      panel.add(
        new go.TextBlock(`F${i}`, {
          font: "10px sans-serif",
          position: new go.Point(panelX + portMargin + 2, yPosition),
          textAlign: "right",
          name: `cabo24F_label_F${i}`
        })
      );
      
      // Adicionar o port colorido sobre o retângulo correspondente com nome único
      panel.add(
        new go.Shape("Circle", {
          fill: this.portColors24F[index],
          stroke: "black",
          strokeWidth: 1.5,
          width: portWidth,
          height: portHeight / 1.5,
          position: new go.Point(panelX + this.width / 3, yPosition),
          portId: `F${i}`,  // Identificador do port
          fromSpot: go.Spot.RightSide,  // Conexões saem pela direita
          toSpot: go.Spot.RightSide,     // Conexões entram pela direita
          cursor: "pointer",
          fromLinkable: true,
          toLinkable: true,
          alignment: go.Spot.Center,
          toMaxLinks: 1,
          fromMaxLinks: 1,
          name: `cabo24F_port_F${i}`
        })
      );
    }

    return panel;
  }
  
  constructor() { }

  ngOnInit(): void {
    console.log('Cabo 24F NAC Component inicializado');
  }
}