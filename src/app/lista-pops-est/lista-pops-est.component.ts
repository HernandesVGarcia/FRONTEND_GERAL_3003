

import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { PopsEst } from '../modelo/popsEst';
import { PopsEstService } from '../servico/pops-est.service';


@Component({
  selector: 'app-lista-pops-est',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-pops-est.component.html',
  styleUrls: ['./lista-pops-est.component.css']
})
export class ListaPopsESTComponent implements OnInit, OnDestroy {
  vetorPOPSEST: PopsEst[] = [];
  @Output() popsEstSelecionada = new EventEmitter<any[]>();

  private readonly onReloadMapPopsEst = (): void => {
    this.selecionar();
  };
  
  constructor(private servicoPopsEst: PopsEstService) {
    console.log('ListaPopsEstComponent construído');
  }

  ngOnInit() {
    console.log('inicialização do app-lista-cto1-ok');
    this.selecionar();
    window.addEventListener('reloadMapPopsEst', this.onReloadMapPopsEst);
  }

  ngOnDestroy(): void {
    window.removeEventListener('reloadMapPopsEst', this.onReloadMapPopsEst);
  }

  selecionar() {
    console.log('Iniciando seleção de Estações...');
    this.servicoPopsEst.selecionar().subscribe({
      next: (retorno) => {
        console.log('Dados recebidos:', retorno);
        if ('response' in retorno) {
          this.vetorPOPSEST = (retorno as any).response;
        } else {
          this.vetorPOPSEST = retorno as PopsEst[];
        }
        this.popsEstSelecionada.emit(this.vetorPOPSEST);
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

