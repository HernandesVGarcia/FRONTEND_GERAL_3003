import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Condominios } from '../modelo/Condominios';
import { CondominiosService } from '../servico/condominios.service';


@Component({
  selector: 'app-lista-condominios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-condominios.component.html',
  styleUrls: ['./lista-condominios.component.css']
})
export class ListaCondominiosComponent implements OnInit {
  vetorCondominios: Condominios[] = [];
  @Output() CondominiosSelecionada = new EventEmitter<any[]>();
  
  constructor(private servicoCondominios: CondominiosService) {
    console.log('ListaCondominiosComponent construído');
  }

  ngOnInit() {
    console.log('inicialização do app-lista-cto1-ok');
    this.selecionar();
  }

  selecionar() {
    console.log('Iniciando seleção de Estações...');
    this.servicoCondominios.selecionar().subscribe({
      next: (retorno) => {
        console.log('Dados recebidos:', retorno);
        if ('response' in retorno) {
          this.vetorCondominios = (retorno as any).response;
        } else {
          this.vetorCondominios = retorno as Condominios[];
        }
        this.CondominiosSelecionada.emit(this.vetorCondominios);
      },
      error: (erro) => {
        console.error('Erro ao carregar Estações:', erro);
      }
    });
  }

  //selecionarCTO(cto: Cto) {
  //  this.ctoSelecionada.emit([cto]);
 // }
}


