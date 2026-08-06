import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Segmento } from '../modelo/segmento';
import { SegmentoService } from '../servico/segmento.service';

@Component({
  selector: 'app-lista-segmentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-segmentos.component.html',
  styleUrls: ['./lista-segmentos.component.css'],
})
export class ListaSegmentosComponent implements OnInit {
  vetorSegmentos: Segmento[] = [];
  @Output() SegmentosSelecionados = new EventEmitter<Segmento[]>();

  constructor(private servicoSegmento: SegmentoService) {
    console.log('ListaSegmentosComponent construído');
  }

  ngOnInit() {
    console.log('inicialização do app-lista-segmentos');
    this.selecionar();
  }

  selecionar() {
    console.log('Iniciando seleção de Segmentos (SOBRA)...');
    this.servicoSegmento.selecionarSobras().subscribe({
      next: (retorno) => {
        console.log('Dados dos Segmentos recebidos:', retorno);
        if ('response' in retorno) {
          this.vetorSegmentos = (retorno as any).response;
        } else {
          this.vetorSegmentos = retorno as Segmento[];
        }
        this.SegmentosSelecionados.emit(this.vetorSegmentos);
      },
      error: (erro) => {
        console.error('Erro ao carregar Segmentos:', erro);
      },
    });
  }
}
