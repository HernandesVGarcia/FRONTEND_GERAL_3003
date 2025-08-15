import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-map-search-buttons',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './map-search-buttons.component.html',
  styleUrls: ['./map-search-buttons.component.css']
})
export class MapSearchButtonsComponent {
  @Output() pesquisarCaixa = new EventEmitter<void>();
  @Output() pesquisarCliente = new EventEmitter<void>();
  @Output() pesquisarEstacao = new EventEmitter<void>();
  @Output() pesquisarLogradouro = new EventEmitter<void>();
  @Output() verificarViabilidade = new EventEmitter<void>();

  onPesquisarCaixa(): void {
    console.log('Pesquisar Caixa clicado');
    this.pesquisarCaixa.emit();
  }

  onPesquisarCliente(): void {
    console.log('Pesquisar Cliente clicado');
    this.pesquisarCliente.emit();
  }

  onPesquisarEstacao(): void {
    console.log('Pesquisar Estação clicado');
    this.pesquisarEstacao.emit();
  }

  onPesquisarLogradouro(): void {
    console.log('Pesquisar Logradouro clicado');
    this.pesquisarLogradouro.emit();
  }

  onVerificarViabilidade(): void {
    console.log('Verificar Viabilidade clicado');
    this.verificarViabilidade.emit();
  }
}