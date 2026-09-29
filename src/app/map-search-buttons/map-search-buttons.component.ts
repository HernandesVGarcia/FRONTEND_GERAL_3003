import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { merge } from 'rxjs';
import { take } from 'rxjs/operators';
import { CompartilhamentoService } from '../servico/compartilhamento.service';
import { CaixaSearchModalComponent } from '../caixa-search-modal/caixa-search-modal.component';
import { ClienteSearchModalComponent } from '../cliente-search-modal/cliente-search-modal.component';
import { EstacaoSearchModalComponent } from '../estacao-search-modal/estacao-search-modal.component';
import { LogradouroSearchModalComponent } from '../logradouro-search-modal/logradouro-search-modal.component';
import { CoordenadasSearchModalComponent } from '../coordenadas-search-modal/coordenadas-search-modal.component';
import { ViabilidadeModalComponent } from '../viabilidade-modal/viabilidade-modal.component';
import { Caixa } from '../modelo/Caixa';
import { Cto_SP } from '../modelo/Cto_SP';

@Component({
  selector: 'app-map-search-buttons',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, NgbModalModule],
  templateUrl: './map-search-buttons.component.html',
  styleUrls: ['./map-search-buttons.component.css']
})
export class MapSearchButtonsComponent {
  @Input() caixas: Caixa[] = [];
  @Input() ctosSP: Cto_SP[] = [];
  @Input() carregandoPostesConcessionaria = false;
  @Input() postesConcessionariaDisponivel = false;
  @Output() carregarPostesConcessionaria = new EventEmitter<void>();

  constructor(
    private ngbModal: NgbModal,
    private compartilhamentoService: CompartilhamentoService,
  ) {}

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
    this.ngbModal.open(LogradouroSearchModalComponent, {
      size: 'lg',
      backdrop: false,
      centered: true,
      windowClass: 'logradouro-search-modal-window',
    });
  }

  onPesquisarCoordenadas(): void {
    this.ngbModal.open(CoordenadasSearchModalComponent, {
      size: 'lg',
      backdrop: false,
      centered: true,
      windowClass: 'coordenadas-search-modal-window',
    });
  }

  onPostesConcessionaria(): void {
    this.carregarPostesConcessionaria.emit();
  }

  onVerificarViabilidade(): void {
    const modalRef = this.ngbModal.open(ViabilidadeModalComponent, {
      size: 'lg',
      backdrop: false,
      centered: true,
      windowClass: 'viabilidade-modal-window',
    });
    modalRef.componentInstance.caixas = this.caixas;
    modalRef.componentInstance.ctosSP = this.ctosSP;
    merge(modalRef.closed, modalRef.dismissed)
      .pipe(take(1))
      .subscribe(() => {
        this.compartilhamentoService.limparViabilidadeCirculosCaixas();
        this.compartilhamentoService.limparViabilidadePontoMapa();
      });
  }
}