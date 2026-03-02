import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CaixaSearchModalComponent } from '../caixa-search-modal/caixa-search-modal.component';
import { ClienteSearchModalComponent } from '../cliente-search-modal/cliente-search-modal.component';
import { EstacaoSearchModalComponent } from '../estacao-search-modal/estacao-search-modal.component';

@Component({
  selector: 'app-map-search-buttons',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, NgbModalModule],
  templateUrl: './map-search-buttons.component.html',
  styleUrls: ['./map-search-buttons.component.css']
})
export class MapSearchButtonsComponent {

  constructor(private ngbModal: NgbModal) {}

  onPesquisarCaixa(): void {
    console.log('Pesquisar Caixa clicado');
    const modalRef = this.ngbModal.open(CaixaSearchModalComponent, {
      size: 'lg',
      backdrop: false,
      centered: true,
      windowClass: 'caixa-search-modal-window'
    });

    modalRef.closed.subscribe(() => {
      console.log('Modal fechado');
    });
  }

  onPesquisarCliente(): void {
    console.log('Pesquisar Cliente clicado');
    const modalRef = this.ngbModal.open(ClienteSearchModalComponent, {
      size: 'lg',
      backdrop: false,
      centered: true,
      windowClass: 'cliente-search-modal-window'
    });

    modalRef.closed.subscribe(() => {
      console.log('Modal fechado');
    });
  }

  onPesquisarEstacao(): void {
    console.log('Pesquisar Estação clicado');
    const modalRef = this.ngbModal.open(EstacaoSearchModalComponent, {
      size: 'lg',
      backdrop: false,
      centered: true,
      windowClass: 'estacao-search-modal-window'
    });

    modalRef.closed.subscribe(() => {
      console.log('Modal fechado');
    });
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