import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Caixa } from '../modelo/Caixa';
import { CaixaService } from '../servico/caixa.service';


@Component({
  selector: 'app-lista-caixas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-caixas.component.html',
  styleUrls: ['./lista-caixas.component.css']
})
export class ListaCaixasComponent implements OnInit, OnDestroy {
  vetor: Caixa[] = [];
  @Output() caixaSelecionada = new EventEmitter<any[]>();

  private readonly onReloadMapCaixas = (): void => {
    this.selecionar();
  };
  
  
  constructor(private servico: CaixaService) {
    
  console.log('ListaCaixasComponent construído');
  }

  


  ngOnInit() {
    console.log('inicialização do app-lista-caixa1-ok');
    this.selecionar();
    window.addEventListener('reloadMapCaixas', this.onReloadMapCaixas);
  }

  ngOnDestroy(): void {
    window.removeEventListener('reloadMapCaixas', this.onReloadMapCaixas);
  }

  

  selecionar() {
   console.log('Iniciando seleção de caixas...');
   this.servico.selecionar().subscribe({
   next: (retorno) => {
   console.log('Dados recebidos:', retorno);
   if ('response' in retorno) {
   this.vetor = (retorno as any).response;
   } else {
   this.vetor = retorno as Caixa[];
   }
   this.caixaSelecionada.emit(this.vetor);
   },
   
      error: (erro) => {
        console.error('Erro ao carregar caixas:', erro);
      }
    });
  }

  //selecionarCaixa(vetor: Caixa) {
  //  this.caixaSelecionada.emit([this.vetor]);
 // }
}
