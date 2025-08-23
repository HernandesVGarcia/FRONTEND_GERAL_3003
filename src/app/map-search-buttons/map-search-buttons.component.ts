import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CaixaSearchModalComponent } from '../caixa-search-modal/caixa-search-modal.component';

@Component({
  selector: 'app-map-search-buttons',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule,MatDialogModule],
  templateUrl: './map-search-buttons.component.html',
  styleUrls: ['./map-search-buttons.component.css']
})
export class MapSearchButtonsComponent {
  @Output() pesquisarCaixa = new EventEmitter<any>();
  @Output() pesquisarCliente = new EventEmitter<void>();
  @Output() pesquisarEstacao = new EventEmitter<void>();
  @Output() pesquisarLogradouro = new EventEmitter<void>();
  @Output() verificarViabilidade = new EventEmitter<void>();

  constructor(private dialog: MatDialog) {}

  onPesquisarCaixa(): void {
    console.log('Pesquisar Caixa clicado');
    const dialogRef = this.dialog.open(CaixaSearchModalComponent, {
      width: '800px',
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '80vh',
      disableClose: false,
      data: {}
    });

    // Conectar ao @Output do modal para receber caixas selecionadas
    dialogRef.componentInstance.caixaSelecionada.subscribe(caixa => {
      console.log('Caixa recebida do modal:', caixa);
      // Emitir a caixa selecionada para o GoogleMapsComponent
      this.pesquisarCaixa.emit(caixa);
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal fechado');
      // Não precisamos fazer nada aqui pois já estamos tratando as seleções via @Output
    });
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