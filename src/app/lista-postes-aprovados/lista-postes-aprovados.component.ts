import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PosteAprovado } from '../modelo/poste-aprovado';
import { PostesAprovadosService } from '../servico/postes-aprovados.service';

@Component({
  selector: 'app-lista-postes-aprovados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-postes-aprovados.component.html',
  styleUrls: ['./lista-postes-aprovados.component.css'],
})
export class ListaPostesAprovadosComponent implements OnInit {
  vetorPostesAP: PosteAprovado[] = [];
  @Output() PostesAPSelecionados = new EventEmitter<PosteAprovado[]>();

  constructor(private servicoPostesAP: PostesAprovadosService) {
    console.log('ListaPostesAprovadosComponent construído');
  }

  ngOnInit() {
    console.log('inicialização do app-lista-postes-aprovados');
    this.selecionar();
  }

  selecionar() {
    console.log('Iniciando seleção de Postes Aprovados...');
    this.servicoPostesAP.selecionar().subscribe({
      next: (retorno) => {
        console.log('Dados dos Postes Aprovados recebidos:', retorno);
        if ('response' in retorno) {
          this.vetorPostesAP = (retorno as any).response;
        } else {
          this.vetorPostesAP = retorno as PosteAprovado[];
        }
        this.PostesAPSelecionados.emit(this.vetorPostesAP);
      },
      error: (erro) => {
        console.error('Erro ao carregar Postes Aprovados:', erro);
      },
    });
  }
}
