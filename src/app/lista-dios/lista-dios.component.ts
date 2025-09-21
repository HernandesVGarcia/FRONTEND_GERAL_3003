


import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Dios } from '../modelo/dios';
import { DiosService } from '../servico/dios.service';


@Component({
  selector: 'app-lista-dios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-dios.component.html',
  styleUrls: ['./lista-dios.component.css']
})
export class ListaDiosComponent implements OnInit {
  vetorDios: Dios[] = [];
  @Output() DiosSelecionada = new EventEmitter<any[]>();
  
  constructor(private servicoDios: DiosService) {
    console.log('ListaDiosComponent construído');
  }

  ngOnInit() {
    console.log('inicialização do app-lista-dios');
    this.selecionar();
  }

  selecionar() {
    console.log('Iniciando seleção de Dios...');
    this.servicoDios.selecionar().subscribe({
      next: (retorno) => {
        console.log('Dados do Dios recebidos:', retorno);
        if ('response' in retorno) {
          this.vetorDios = (retorno as any).response;
        } else {
          this.vetorDios = retorno as Dios[];
        }
        this.DiosSelecionada.emit(this.vetorDios);
      },
      error: (erro) => {
        console.error('Erro ao carregar Dios:', erro);
      }
    });
  }

  //selecionarCTO(cto: Cto) {
  //  this.ctoSelecionada.emit([cto]);
 // }
}


