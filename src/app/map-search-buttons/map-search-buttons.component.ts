import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CaixaSearchModalComponent } from '../caixa-search-modal/caixa-search-modal.component';
import { ClienteSearchModalComponent } from '../cliente-search-modal/cliente-search-modal.component';

@Component({
  selector: 'app-map-search-buttons',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule,MatDialogModule],
  templateUrl: './map-search-buttons.component.html',
  styleUrls: ['./map-search-buttons.component.css']
})
export class MapSearchButtonsComponent {

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

    // Seleção será propagada via CompartilhamentoService dentro do modal

    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal fechado');
      // Não precisamos fazer nada aqui pois já estamos tratando as seleções via @Output
    });
  }

  onPesquisarCliente(): void {
    console.log('Pesquisar Cliente clicado');
    const dialogRef = this.dialog.open(ClienteSearchModalComponent, {
      width: '800px',
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '80vh',
      disableClose: false,
      data: {}
    });

    // Seleção será propagada via CompartilhamentoService dentro do modal

    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal fechado');
      // Não precisamos fazer nada aqui pois já estamos tratando as seleções via @Output
    });
  }

  onPesquisarEstacao(): void {
    console.log('Pesquisar Estação clicado');
    // Abrir modal quando implementado; comunicação via service
  }

  onPesquisarLogradouro(): void {
    console.log('Pesquisar Logradouro clicado');
    // Abrir modal quando implementado; comunicação via service
  }

  onVerificarViabilidade(): void {
    console.log('Verificar Viabilidade clicado');
    // Abrir modal quando implementado; comunicação via service
  }
}