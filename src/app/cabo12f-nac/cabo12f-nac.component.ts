import { group } from '@angular/animations';
import { LabelRotateTool } from '@syncfusion/ej2-angular-diagrams';
//import * as draw2d from 'draw2d';

declare const draw2d: any;

// Classe para definir um cabo de 12 fibras com padrão nacional de cores:
// verde, amarelo, branco, azul, preto, vermelho, lilás e ciano
export class Cabo12F extends draw2d.shape.basic.Rectangle {
  


  constructor(x: number, y: number, portType: 'input' | 'output' | 'hybrid' = 'output') {
    super({
      x: x,
      y: y,
      width: 20,
      height: 100,
      radius: 1,
      
        
      
      color: portType === 'output' ? "#2196F3" : 
             portType === 'input' ? "#FF5722" : "#9C27B0", // Roxo para híbrido
      draggable: true
    });
    
    // Adicionar título ao cabo
    const label = new draw2d.shape.basic.Label({
      text: `Cabo 12F NAC (${portType})`,
      fontColor: "black",
      stroke: 0,
      fontSize:10,
      
      
     

  

    });
    //this.add(label, new draw2d.layout.locator.CenterLocator());
    // Rotacionar o label 90 graus
    
    
    // Posicionar o label no lado direito do cabo
    //this.add(label, new draw2d.layout.locator.RightLocator()); <*********************************************
    this['add'](label, new draw2d.layout.locator.RightLocator());
    
    // Criar as 12 portas de conexão (representando as fibras)
    this.criarPortasFibra(portType);

  }

  

  criarPortasFibra(portType: 'input' | 'output' | 'hybrid') {
    // Cores das fibras no padrão nacional brasileiro
    const cores = [
      "#008000", // verde (F1)
      "#FFFF00", // amarelo (F2)
      "#FFFFFF", // branco (F3)
      "#0000FF", // azul (F4)
      "#000000", // preto (F5)
      "#FF0000", // vermelho (F6)
      "#EE82EE", // lilás (F7)
      "#00FFFF", // ciano (F8)
      // Cores repetidas para fibras 9-12 (padrão com listra)
      "#008000", // verde (F9)
      "#FFFF00", // amarelo (F10)
      "#FFFFFF", // branco (F11)
      "#0000FF"  // azul (F12)
    ];
    
    // Adicionar portas representando as fibras
    //const altura = this.getHeight();<*********************************************
    const altura = this['getHeight']()
    const espacamento = altura / 13; // Espaçamento entre as portas (13 para ter espaço entre as bordas)

    for (let i = 0; i < 12; i++) {
      // Determinar tipo de porta a ser criada
      if (portType === 'hybrid') {
        // Para portas híbridas, criar portas que permitem conexões em ambas direções
        const port = this['createPort']("hybrid");
        port.setName("F" + (i + 1));
        port.setPosition(this['getWidth']() / 2, espacamento * (i + 1));
        // Não definimos direção específica para permitir conexão de qualquer lado
        port.setBackgroundColor(cores[i]);
        port.setRadius(1); // Raio maior para destacar que é uma porta híbrida
      } else if (portType === 'input' || portType === 'output') {
        // Criar porta do tipo especificado (input ou output)
        const port = this['createPort'](portType);
        port.setName("F" + (i + 1));
        //port.setDimension(10,20);
        
        // Posicionar a porta manualmente no lado correto
        const yPos = espacamento * (i + 1);
        
        // Se for output, posiciona no lado direito, se for input, no lado esquerdo
        if (portType === 'output') {
          port.setPosition(this['getWidth'](), yPos);
          port.setConnectionDirection(1); // Direção leste (direita)
        } else {
          port.setPosition(0, yPos);
          port.setConnectionDirection(3); // Direção oeste (esquerda)
        }
        
        // Configurar aspecto visual da porta
        port.setBackgroundColor(cores[i]); // Usar a cor correspondente à fibra
        port.setRadius(5);
      }
    }
  }
}