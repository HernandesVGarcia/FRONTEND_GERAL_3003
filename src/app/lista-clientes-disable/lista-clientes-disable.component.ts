


import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { PopsCli } from '../modelo/PopsCli';
import { PopsCliService } from '../servico/pops-cli.service';


@Component({
  selector: 'app-lista-clientes-disable',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-clientes-disable.component.html',
  styleUrls: ['./lista-clientes-disable.component.css']
})
export class ListaPopsCLIDesComponent implements OnInit, OnDestroy {
  vetorPOPSCLIDes: PopsCli[] = [];
  @Output() popsCliDesSelecionada = new EventEmitter<any[]>(); //emite evento para fibermap

  private readonly onReloadMapClientes = (): void => {
    this.selecionar();
  };
  
  constructor(private servicoPopsCliDes: PopsCliService) {
    console.log('ListaPopsCliDesComponent construído');
  }

  ngOnInit() {
    console.log('inicialização do app-lista-clientes-disable');
    this.selecionar();
    window.addEventListener('reloadMapClientes', this.onReloadMapClientes);
  }

  ngOnDestroy(): void {
    window.removeEventListener('reloadMapClientes', this.onReloadMapClientes);
  }

  selecionar() {
    console.log('Iniciando seleção de Clientes Desabilitado.../id_condominio=0/status=0/filtro_olt=zero');
    this.servicoPopsCliDes.selecionar(0, 0,"zero").subscribe({
      next: (retorno) => {
        console.log('==================================>Dados recebidos Clientes Desativado:', retorno);
        if ('response' in retorno) {
          this.vetorPOPSCLIDes = (retorno as unknown as { response: PopsCli[] }).response;
        } else {
          this.vetorPOPSCLIDes = retorno as PopsCli[];
        }
        this.popsCliDesSelecionada.emit(this.vetorPOPSCLIDes);
      },
      error: (erro) => {
        console.error('Erro ao carregar Clientes Desabilitados:', erro);
      }
    });
  }

  //selecionarCTO(cto: Cto) {
  //  this.ctoSelecionada.emit([cto]);
 // }
}


