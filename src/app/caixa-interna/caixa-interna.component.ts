import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as draw2d from 'draw2d';

@Component({
  selector: 'app-caixa-interna',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './caixa-interna.component.html',
  styleUrls: ['./caixa-interna.component.css']
})
export class CaixaInternaComponent implements OnInit {
  @Input() numeroCaixa: string = '';
  @Output() onClose = new EventEmitter<void>();
  canvas: any;

  ngOnInit() {
    setTimeout(() => {
      this.initializeCanvas();
    }, 100);
  }

  fecharCaixa() {
    this.onClose.emit();
  }

  initializeCanvas() {
   try{
    console.log('Iniciando canvas...');
      const canvasElement = document.getElementById('desenhoCanvas');
      
      if (!canvasElement) {
        console.error('Elemento do canvas não encontrado');
        return;
      }
      // Obter as dimensões reais do container
      const containerWidth = canvasElement.clientWidth;
      const containerHeight = canvasElement.clientHeight;
      
      console.log('Dimensões do container:', containerWidth, containerHeight);

    this.canvas = new draw2d.Canvas('desenhoCanvas');
    
    // Ajustar as coordenadas com base nas dimensões do container
    const figure1 = new draw2d.shape.basic.Rectangle({
      //x: Math.min(200, containerWidth * 0.25),
      //y: Math.min(100, containerHeight * 0.25),
      x:500,
      y:100,
      //width: Math.min(100, containerWidth * 0.125),
      //height: Math.min(100, containerHeight * 0.25),
      width:200,
      height:100,
      color: "#00A8F0",
      radius: 5,
       draggable: true 
    });


    // Ajustar as coordenadas da linha para ficar dentro do canvas
    const linha = new draw2d.shape.basic.Line({
      //x1: Math.min(100, containerWidth * 0.125),
      //y1: Math.min(200, containerHeight * 0.5),
      //x2: Math.min(300, containerWidth * 0.375),
      //y2: Math.min(200, containerHeight * 0.5),
      x1: 1000,
      x2: 2000,
      y1: 500,
      y2: 500,
      

      stroke: 2,
      color: "#FF0000",
      draggable: true 
      
    });


    this.canvas.add(figure1);
    this.canvas.add(linha);

    console.log('Canvas inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar o canvas:', error);
  }
}
}