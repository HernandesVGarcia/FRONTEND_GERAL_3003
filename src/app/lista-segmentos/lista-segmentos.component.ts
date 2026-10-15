import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Segmento } from '../modelo/segmento';
import { SegmentoService } from '../servico/segmento.service';

@Component({
  selector: 'app-lista-segmentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-segmentos.component.html',
  styleUrls: ['./lista-segmentos.component.css'],
})
export class ListaSegmentosComponent implements OnInit, OnDestroy {
  vetorSegmentos: Segmento[] = [];
  @Output() SegmentosSelecionados = new EventEmitter<Segmento[]>();

  private readonly onReloadMapSegmentos = (): void => {
    this.selecionar();
  };

  constructor(private servicoSegmento: SegmentoService) {
    console.log('ListaSegmentosComponent construído');
  }

  ngOnInit() {
    console.log('inicialização do app-lista-segmentos');
    this.selecionar();
    window.addEventListener('reloadMapSegmentos', this.onReloadMapSegmentos);
  }

  ngOnDestroy(): void {
    window.removeEventListener('reloadMapSegmentos', this.onReloadMapSegmentos);
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
