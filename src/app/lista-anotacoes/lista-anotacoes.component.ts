import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Anotacoes } from '../modelo/Anotacoes';
import { AnotacoesService } from '../servico/anotacoes.service';

@Component({
  selector: 'app-lista-anotacoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-anotacoes.component.html',
  styleUrl: './lista-anotacoes.component.css',
})
export class ListaAnotacoesComponent implements OnInit, OnDestroy {
  vetorAnotacoes: Anotacoes[] = [];
  @Output() AnotacoesSelecionada = new EventEmitter<any[]>();

  private readonly onReloadMapAnotacoes = (): void => {
    this.selecionar();
  };

  constructor(private servicoAnotacoes: AnotacoesService) {
    console.log('ListaAnotacoesComponent construído');
  }

  ngOnInit() {
    console.log('inicialização do app-lista-cto1-ok');
    this.selecionar();
    window.addEventListener('reloadMapAnotacoes', this.onReloadMapAnotacoes);
  }

  ngOnDestroy(): void {
    window.removeEventListener('reloadMapAnotacoes', this.onReloadMapAnotacoes);
  }

  selecionar() {
    console.log('Iniciando seleção de Estações...');
    this.servicoAnotacoes.selecionar().subscribe({
      next: (retorno) => {
        console.log('Dados recebidos:', retorno);
        this.vetorAnotacoes = Array.isArray(retorno) ? retorno : [];
        this.AnotacoesSelecionada.emit(this.vetorAnotacoes);
      },
      error: (erro) => {
        console.error('Erro ao carregar Estações:', erro);
      },
    });
  }
}
