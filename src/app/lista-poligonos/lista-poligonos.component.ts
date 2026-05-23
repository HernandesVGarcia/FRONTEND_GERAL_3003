import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Poligonos } from '../modelo/poligonos';
import { PoligonosService } from '../servico/poligonos.service';


@Component({
  selector: 'app-lista-poligonos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-poligonos.component.html',
  styleUrls: ['./lista-poligonos.component.css']
})
export class ListaPoligonosComponent implements OnInit {
  vetorPoligonos: Poligonos[] = [];
  @Output() PoligonosSelecionada = new EventEmitter<any[]>();
  
  constructor(private servicoPoligonos: PoligonosService) {
    console.log('ListaPoligonosComponent construído');
  }

  ngOnInit() {
    console.log('inicialização do app-lista-poligonos');
    this.selecionar();
  }

  selecionar() {
    console.log('Iniciando seleção de Poligonos...');
    this.servicoPoligonos.selecionar().subscribe({
      next: (retorno) => {
        console.log('Dados do Poligonos recebidos:', retorno);
        if ('response' in retorno) {
          this.vetorPoligonos = (retorno as any).response;
        } else {
          this.vetorPoligonos = retorno as Poligonos[];
        }
        this.PoligonosSelecionada.emit(this.vetorPoligonos);
      },
      error: (erro) => {
        console.error('Erro ao carregar Poligonos:', erro);
      }
    });
  }

  //selecionarCTO(cto: Cto) {
  //  this.ctoSelecionada.emit([cto]);
 // }
}


