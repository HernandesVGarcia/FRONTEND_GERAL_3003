

import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Cto_SP } from '../modelo/Cto_SP';
import { CtoSPService } from '../servico/cto-sp.service';


@Component({
  selector: 'app-lista-ctos-sp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-ctos-sp.component.html',
  styleUrls: ['./lista-ctos-sp.component.css']
})
export class ListaCtosSpComponent implements OnInit, OnDestroy {
  vetorCTOSP: Cto_SP[] = [];
  @Output() ctoSPSelecionada = new EventEmitter<any[]>();

  private readonly onReloadMapCaixas = (): void => {
    this.selecionar();
  };

  constructor(private servicoCtoSP: CtoSPService) {
    console.log('ListaCtosComponent construído');
  }

  ngOnInit() {
    console.log('inicialização do app-lista-cto-SP-ok');
    this.selecionar();
    window.addEventListener('reloadMapCaixas', this.onReloadMapCaixas);
  }

  ngOnDestroy(): void {
    window.removeEventListener('reloadMapCaixas', this.onReloadMapCaixas);
  }

  selecionar() {
    console.log('Iniciando seleção de CTOs-sp...');
    this.servicoCtoSP.selecionar().subscribe({
      next: (retorno) => {
        console.log('Dados recebidos:', retorno);
        if ('response' in retorno) {
          this.vetorCTOSP = (retorno as any).response;
        } else {
          this.vetorCTOSP = retorno as Cto_SP[];
        }
        this.ctoSPSelecionada.emit(this.vetorCTOSP);
      },
      error: (erro) => {
        console.error('Erro ao carregar CTOsSP:', erro);
      }
    });
  }

  //selecionarCTO(cto: Cto) {
  //  this.ctoSelecionada.emit([cto]);
 // }
}
