import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Cabos72f } from '../modelo/Cabos72f';
import { CaboService } from '../servico/cabo.service';
import { AuthService} from '../servico/auth.service'


@Component({
  selector: 'app-lista-cabos72f',
  imports: [CommonModule],
  templateUrl: './lista-cabos72f.component.html',
  styleUrl: './lista-cabos72f.component.css'
})
export class ListaCabos72fComponent implements OnInit {
  vetorCabos: Cabos72f[] = [];
  @Output() caboSelecionada = new EventEmitter<any[]>();
  
  constructor(private servicoCabos: CaboService,private authService: AuthService) {
    console.log('ListaCabosComponent construído');
  }

  ngOnInit() {
    console.log('inicialização do app-lista-cabos-ok');
    const id_cidade = this.authService.getIdCity();
        if(id_cidade){
        this.selecionar(id_cidade,72)};
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
