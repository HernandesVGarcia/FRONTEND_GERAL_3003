import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Cabos8f } from '../modelo/Cabos8f'
import { CaboService } from '../servico/cabo.service';
import { AuthService} from '../servico/auth.service'

@Component({
  selector: 'app-lista-cabos8f',
  imports: [CommonModule],
  templateUrl: './lista-cabos8f.component.html',
  styleUrl: './lista-cabos8f.component.css'
  
})
export class ListaCabos8fComponent implements OnInit {
  vetorCabos: Cabos8f[] = [];
    @Output() caboSelecionada = new EventEmitter<any[]>();
    
    constructor(private servicoCabos: CaboService,private authService: AuthService) {
      console.log('ListaCabosComponent construído');
    }
  
    ngOnInit() {
      console.log('inicialização do app-lista-cabos-ok');
      const id_cidade = this.authService.getIdCity();
        if(id_cidade){
        this.selecionar(id_cidade,8)};
    }
  
    selecionar(idCidade:number,capacidade:number) {
      console.log('Iniciando seleção de cabos...');
  
      
      this.servicoCabos.selecionar(idCidade, capacidade).subscribe({
        next: (retorno) => {
          console.log('Dados recebidos:', retorno);
          if ('response' in retorno) {
            this.vetorCabos = (retorno as any).response;
          } else {
            this.vetorCabos = retorno as Cabos8f[];
          }
          this.caboSelecionada.emit(this.vetorCabos);
        },
        error: (erro) => {
          console.error('Erro ao carregar cabos:', erro);
        }
      });
    }
  
    //selecionarCabo(vetorCabos: Cabos) {
    //  this.caboSelecionada.emit([this.vetorCabos]);
   // }

}
