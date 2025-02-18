import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Cabos } from '../modelo/Cabos';
import { CaboService } from '../servico/cabo.service';


@Component({
  selector: 'app-lista-cabos',
  imports: [CommonModule],
  templateUrl: './lista-cabos12f.component.html',
  styleUrl: './lista-cabos12f.component.css'
})

export class ListaCabosComponent implements OnInit {
  vetorCabos: Cabos[] = [];
  @Output() caboSelecionada = new EventEmitter<any[]>();
  
  constructor(private servicoCabos: CaboService) {
    console.log('ListaCabosComponent construído');
  }

  ngOnInit() {
    console.log('inicialização do app-lista-cabos-ok');
    this.selecionar(210,12);
  }

  selecionar(idCidade:number,capacidade:number) {
    console.log('Iniciando seleção de cabos...');

    
    this.servicoCabos.selecionar(idCidade, capacidade).subscribe({
      next: (retorno) => {
        console.log('Dados recebidos:', retorno);
        if ('response' in retorno) {
          this.vetorCabos = (retorno as any).response;
        } else {
          this.vetorCabos = retorno as Cabos[];
        }
        this.caboSelecionada.emit(this.vetorCabos);
      },
      error: (erro) => {
        console.error('Erro ao carregar cabos:', erro);
      }
    });
  }

  selecionarCabo(vetorCabos: Cabos) {
    this.caboSelecionada.emit([this.vetorCabos]);
  }
}


