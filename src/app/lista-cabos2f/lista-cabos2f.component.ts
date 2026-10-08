import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Cabos2f } from '../modelo/Cabos2f'
import { CaboService } from '../servico/cabo.service';
import { AuthService} from '../servico/auth.service'

@Component({
  selector: 'app-lista-cabos2f',
  imports: [CommonModule],
  templateUrl: './lista-cabos2f.component.html',
  styleUrl: './lista-cabos2f.component.css'
})
export class ListaCabos2fComponent implements OnInit, OnDestroy {
  vetorCabos: Cabos2f[] = [];
      @Output() caboSelecionada = new EventEmitter<any[]>();

      private readonly capacidade = 2;
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
        console.log('inicialização do app-lista-cabos2F-ok');
        const id_cidade = this.authService.getIdCity();
        if(id_cidade){
        this.selecionar(id_cidade,2)};
        window.addEventListener('reloadMapCabos', this.onReloadMapCabos);
      }

      ngOnDestroy(): void {
        window.removeEventListener('reloadMapCabos', this.onReloadMapCabos);
      }
    
      selecionar(idCidade:number,capacidade:number) {
        console.log('Iniciando seleção de cabos 2F...');
    
        
        this.servicoCabos.selecionar(idCidade, capacidade).subscribe({
          next: (retorno) => {
            console.log('Dados recebidos:', retorno);
            if ('response' in retorno) {
              this.vetorCabos = (retorno as any).response;
            } else {
              this.vetorCabos = retorno as Cabos2f[];
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
