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
    this.initializeCanvas();
  }

  fecharCaixa() {
    this.onClose.emit();
  }

  initializeCanvas() {
    this.canvas = new draw2d.Canvas('desenhoCanvas');
    
    // Exemplo de criação de elementos no canvas
    const figure1 = new draw2d.shape.basic.Rectangle({
      x: 200,
      y: 100,
      width: 100,
      height: 100,
      color: "#00A8F0",
      radius: 5,
      //draggable: true
      
    });

    // Adicionando uma linha
    const linha = new draw2d.shape.basic.Line({
      x1: 1000,    // ponto inicial x
      y1: 400,    // ponto inicial y
      x2: 5000,   // ponto final x
      y2: 800,    // ponto final y
      stroke: 5,  // espessura da linha
      color: "#FF0000",  // cor vermelha
      //draggable: true
    });


    this.canvas.add(figure1);
    this.canvas.add(linha);

  }
}