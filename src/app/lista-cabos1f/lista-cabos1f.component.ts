import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Cabos1f } from '../modelo/Cabos1f'
import { CaboService } from '../servico/cabo.service';
import { AuthService} from '../servico/auth.service'

@Component({
  selector: 'app-lista-cabos1f',
  imports: [CommonModule],
  templateUrl: './lista-cabos1f.component.html',
  styleUrl: './lista-cabos1f.component.css'
})
export class ListaCabos1fComponent implements OnInit{
  vetorCabos: Cabos1f[] = [];
      @Output() caboSelecionada = new EventEmitter<any[]>();
      
      constructor(private servicoCabos: CaboService, private authService: AuthService) {
        
        console.log('ListaCabosComponent construído');
      }
    
      ngOnInit() {
        console.log('inicialização do app-lista-cabos1F-ok');
        const id_cidade = this.authService.getIdCity();
        if(id_cidade){
        this.selecionar(id_cidade,1)};
      }
    
      selecionar(idCidade:number,capacidade:number) {
        console.log('Iniciando seleção de cabos 1F...');
    
        
        this.servicoCabos.selecionar(idCidade, capacidade).subscribe({
          next: (retorno) => {
            console.log('Dados recebidos:', retorno);
            if ('response' in retorno) {
              this.vetorCabos = (retorno as any).response;
            } else {
              this.vetorCabos = retorno as Cabos1f[];
            }
            this.caboSelecionada.emit(this.vetorCabos);
          },
          error: (erro) => {
            console.error('Erro ao carregar cabos:', erro);
          }
        }
      );
      }

}
