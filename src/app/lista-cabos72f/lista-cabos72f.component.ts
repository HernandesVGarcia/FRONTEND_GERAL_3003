import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Cabos72f } from '../modelo/Cabos72f';
import { CaboService } from '../servico/cabo.service';
import { AuthService} from '../servico/auth.service'


@Component({
  selector: 'app-lista-cabos72f',
  imports: [CommonModule],
  templateUrl: './lista-cabos72f.component.html',
  styleUrl: './lista-cabos72f.component.css'
})
export class ListaCabos72fComponent implements OnInit, OnDestroy {
  vetorCabos: Cabos72f[] = [];
  @Output() caboSelecionada = new EventEmitter<any[]>();

  private readonly capacidade = 72;
  private readonly onReloadMapCabos = (): void => {
    const id_cidade = this.authService.getIdCity();
    if (id_cidade) {
      this.selecionar(id_cidade, this.capacidade);
    }
  };
  
  constructor(private servicoCabos: CaboService,private authService: AuthService) {
    console.log('ListaCabosComponent construído');
  }

  ngOnInit() {
    console.log('inicialização do app-lista-cabos-ok');
    const id_cidade = this.authService.getIdCity();
        if(id_cidade){
        this.selecionar(id_cidade,72)};
    window.addEventListener('reloadMapCabos', this.onReloadMapCabos);
  }

  ngOnDestroy(): void {
    window.removeEventListener('reloadMapCabos', this.onReloadMapCabos);
  }

  selecionar(idCidade:number,capacidade:number) {
    console.log('Iniciando seleção de cabos 72f...');

    
    this.servicoCabos.selecionar(idCidade, capacidade).subscribe({
      next: (retorno) => {
        console.log('Dados recebidos 72f:', retorno);
        if ('response' in retorno) {
          this.vetorCabos = (retorno as any).response;
        } else {
          this.vetorCabos = retorno as Cabos72f[];
        }
        this.caboSelecionada.emit(this.vetorCabos);
      },
      error: (erro) => {
        console.error('Erro ao carregar cabos:', erro);
      }
    });
  }

  
}
