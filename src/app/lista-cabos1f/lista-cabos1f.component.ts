import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Cabos1f } from '../modelo/Cabos1f'
import { CaboService } from '../servico/cabo.service';
import { AuthService} from '../servico/auth.service'

@Component({
  selector: 'app-lista-cabos1f',
  imports: [CommonModule],
  templateUrl: './lista-cabos1f.component.html',
  styleUrl: './lista-cabos1f.component.css'
})
export class ListaCabos1fComponent implements OnInit, OnDestroy {
  vetorCabos: Cabos1f[] = [];
      @Output() caboSelecionada = new EventEmitter<any[]>();

      private readonly capacidade = 1;
      private readonly onReloadMapCabos = (): void => {
        const id_cidade = this.authService.getIdCity();
        if (id_cidade) {
          this.selecionar(id_cidade, this.capacidade);
        }
      };
      
      constructor(private servicoCabos: CaboService, private authService: AuthService) {
        
        console.log('ListaCabosComponent construído');
      }
    
      ngOnInit() {
        console.log('inicialização do app-lista-cabos1F-ok');
        const id_cidade = this.authService.getIdCity();
        if(id_cidade){
        this.selecionar(id_cidade,1)};
        window.addEventListener('reloadMapCabos', this.onReloadMapCabos);
      }

      ngOnDestroy(): void {
        window.removeEventListener('reloadMapCabos', this.onReloadMapCabos);
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
