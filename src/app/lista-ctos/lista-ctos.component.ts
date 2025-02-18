import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Cto } from '../modelo/Cto';
import { CtoService } from '../servico/cto.service';


@Component({
  selector: 'app-lista-ctos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-ctos.component.html',
  styleUrls: ['./lista-ctos.component.css']
})
export class ListaCtosComponent implements OnInit {
  vetorCTO: Cto[] = [];
  @Output() ctoSelecionada = new EventEmitter<any[]>();
  
  constructor(private servicoCTO: CtoService) {
    console.log('ListaCtosComponent construído');
  }

  ngOnInit() {
    console.log('inicialização do app-lista-cto1-ok');
    this.selecionar();
  }

  selecionar() {
    console.log('Iniciando seleção de CTOs...');
    this.servicoCTO.selecionar().subscribe({
      next: (retorno) => {
        console.log('Dados recebidos:', retorno);
        if ('response' in retorno) {
          this.vetorCTO = (retorno as any).response;
        } else {
          this.vetorCTO = retorno as Cto[];
        }
        this.ctoSelecionada.emit(this.vetorCTO);
      },
      error: (erro) => {
        console.error('Erro ao carregar CTOs:', erro);
      }
    });
  }

  //selecionarCTO(cto: Cto) {
  //  this.ctoSelecionada.emit([cto]);
 // }
}
