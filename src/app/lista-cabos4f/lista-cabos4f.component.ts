import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Cabos4f } from '../modelo/Cabos4f'
import { CaboService } from '../servico/cabo.service';
import { AuthService} from '../servico/auth.service'

@Component({
  selector: 'app-lista-cabos4f',
  imports: [CommonModule],
  templateUrl: './lista-cabos4f.component.html',
  styleUrl: './lista-cabos4f.component.css'
})
export class ListaCabos4fComponent implements OnInit{
  vetorCabos: Cabos4f[] = [];
      @Output() caboSelecionada = new EventEmitter<any[]>();
      
      constructor(private servicoCabos: CaboService, private authService: AuthService) {
        
        console.log('ListaCabosComponent construído');
      }
    
      ngOnInit() {
        console.log('inicialização do app-lista-cabos4F-ok');
        const id_cidade = this.authService.getIdCity();
        if(id_cidade){
        this.selecionar(id_cidade,4)};
      }
    
      selecionar(idCidade:number,capacidade:number) {
        console.log('Iniciando seleção de cabos 4F...');
    
        
        this.servicoCabos.selecionar(idCidade, capacidade).subscribe({
          next: (retorno) => {
            console.log('Dados recebidos:', retorno);
            if ('response' in retorno) {
              this.vetorCabos = (retorno as any).response;
            } else {
              this.vetorCabos = retorno as Cabos4f[];
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
