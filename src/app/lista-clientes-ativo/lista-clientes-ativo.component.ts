

import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { PopsCli } from '../modelo/PopsCli';
import { PopsCliService } from '../servico/pops-cli.service';


@Component({
  selector: 'app-lista-clientes-ativo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-clientes-ativo.component.html',
  styleUrls: ['./lista-clientes-ativo.component.css']
})
export class ListaPopsCLIAtvComponent implements OnInit, OnDestroy {
  vetorPOPSCLIAtv: PopsCli[] = [];
  @Output() popsCliAtvSelecionada = new EventEmitter<any[]>(); //emite evento para fibermap

  private readonly onReloadMapClientes = (): void => {
    this.selecionar();
  };
  
  constructor(private servicoPopsCliAtv: PopsCliService) {
    console.log('ListaPopsCliAtvComponent construído');
  }

  ngOnInit() {
    console.log('inicialização do app-lista-clientes-ativo');
    this.selecionar();
    window.addEventListener('reloadMapClientes', this.onReloadMapClientes);
  }

  ngOnDestroy(): void {
    window.removeEventListener('reloadMapClientes', this.onReloadMapClientes);
  }

  selecionar() {
    console.log('Iniciando seleção de Clientes Ativo.../id_condominio=0/status=1/recurso_sp=nao_zero');
    this.servicoPopsCliAtv.selecionar(0, 1, undefined, 'nao_zero').subscribe({
      next: (retorno) => {
        console.log('==================================>Dados recebidos Clientes Ativos:', retorno);
        if ('response' in retorno) {
          this.vetorPOPSCLIAtv = (retorno as unknown as { response: PopsCli[] }).response;
        } else {
          this.vetorPOPSCLIAtv = retorno as PopsCli[];
        }
        this.popsCliAtvSelecionada.emit(this.vetorPOPSCLIAtv);
      },
      error: (erro) => {
        console.error('Erro ao carregar Clientes Ativados:', erro);
      }
    });
  }

  //selecionarCTO(cto: Cto) {
  //  this.ctoSelecionada.emit([cto]);
 // }
}



