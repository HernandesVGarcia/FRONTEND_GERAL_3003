import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Cabos6f } from '../modelo/Cabos6f'
import { CaboService } from '../servico/cabo.service';

@Component({
  selector: 'app-lista-cabos6f',
  imports: [CommonModule],
  templateUrl: './lista-cabos6f.component.html',
  styleUrl: './lista-cabos6f.component.css'
})
export class ListaCabos6fComponent {
  vetorCabos: Cabos6f[] = [];
      @Output() caboSelecionada = new EventEmitter<any[]>();
      
      constructor(private servicoCabos: CaboService) {
        console.log('ListaCabosComponent construído');
      }
    
      ngOnInit() {
        console.log('inicialização do app-lista-cabos-ok');
        this.selecionar(210,6);
      }
    
      selecionar(idCidade:number,capacidade:number) {
        console.log('Iniciando seleção de cabos...');
    
        
        this.servicoCabos.selecionar(idCidade, capacidade).subscribe({
          next: (retorno) => {
            console.log('Dados recebidos:', retorno);
            if ('response' in retorno) {
              this.vetorCabos = (retorno as any).response;
            } else {
              this.vetorCabos = retorno as Cabos6f[];
            }
            this.caboSelecionada.emit(this.vetorCabos);
          },
          error: (erro) => {
            console.error('Erro ao carregar cabos:', erro);
          }
        });
      }

}
