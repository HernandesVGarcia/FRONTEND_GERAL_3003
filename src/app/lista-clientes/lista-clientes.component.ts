


import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PopsCli } from '../modelo/PopsCli';
import { PopsCliService } from '../servico/pops-cli.service';


@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.css']
})
export class ListaPopsCLIComponent implements OnInit {
  vetorPOPSCLI: PopsCli[] = [];
  @Output() popsCliSelecionada = new EventEmitter<any[]>(); //emite evento para fibermap
  
  constructor(private servicoPopsCli: PopsCliService) {
    console.log('ListaPopsCliComponent construído');
  }

  ngOnInit() {
    console.log('inicialização do app-lista-clientes');
    this.selecionar();
  }

  selecionar() {
    console.log('Iniciando seleção de Clientes.../id_condominio=0/status=1/filtro_olt=zero');
    this.servicoPopsCli.selecionar(0, 1, 'zero').subscribe({
      next: (retorno) => {
        console.log('========================>Dados Clientes recebidos:', retorno);
        if ('response' in retorno) {
          this.vetorPOPSCLI = (retorno as unknown as { response: PopsCli[] }).response;
        } else {
          this.vetorPOPSCLI = retorno as PopsCli[];
        }
        this.popsCliSelecionada.emit(this.vetorPOPSCLI);
      },
      error: (erro) => {
        console.error('Erro ao carregar Clientes:', erro);
      }
    });
  }

  //selecionarCTO(cto: Cto) {
  //  this.ctoSelecionada.emit([cto]);
 // }
}

