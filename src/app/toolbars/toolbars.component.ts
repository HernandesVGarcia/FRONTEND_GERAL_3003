import { Component, OnInit } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {FormControl,  ReactiveFormsModule} from '@angular/forms';
import {CidadesService} from '../servico/cidades.service';
import { AuthService } from '../servico/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CitySelectModalComponent } from '../city-select-modal/city-select-modal.component';
import { LogCidadeComponent } from '../log-cidade/log-cidade.component';
import { VigoCtoSyncModalComponent } from '../vigo-cto-sync-modal/vigo-cto-sync-modal.component';
import { VigoSanearStatusModalComponent } from '../vigo-sanear-status-modal/vigo-sanear-status-modal.component';
import { ERP_VIGO } from '../servico/erp.constants';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-toolbars',
  imports: [CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    CitySelectModalComponent,
    MatTooltipModule],
  templateUrl: './toolbars.component.html',
  styleUrls: ['./toolbars.component.css'],
  standalone: true
})
export class ToolbarsComponent implements OnInit {
  cities: any[] = [];
  selectedCity: any;
  cityModalOpen = false;
  showCityModal = false;
  showCaixaInterna=false;

  get mostrarBotaoVigo(): boolean {
    return !environment.production && this.authService.getIdErp() === ERP_VIGO;
  }
 
   
  constructor(
    private cidadesService: CidadesService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
  ) {
    console.log('Toolbar construída');
  }
 
  ngOnInit() {
    this.loadCities();
    
    const cityId = this.authService.getIdCity();
    if (cityId) {
      this.selectedCity = cityId;
    }
  }

  loadCities() {
    const polo = this.authService.getPolo();
    
    if (!polo) {
      console.error('Nenhum polo encontrado no storage');
      return;
    }
    
    this.cidadesService.selecionar().subscribe({
      next: (response: any) => {
        if (response && response.response) {
          this.cities = response.response;
          console.log('Cidades carregadas:', this.cities);
        } else {
          this.cities = response;
          console.log('Cidades carregadas (formato alternativo):', this.cities);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar cidades:', error);
      }
    });
  }


  openCityModal() {
    console.log('Abrindo modal de seleção de cidade na toolbar');
    this.showCityModal = true;
  }

  closeCityModal() {
    console.log('Fechando modal de seleção de cidade na toolbar');
    this.showCityModal = false;
  }
    
  openCaixaModal() {
    this.showCaixaInterna=false;
    console.log('Abrindo modal caixa toolbar');
    this.showCaixaInterna=true;
      
  }

  closeCaixaModal() {

    console.log('Fecha modal caixa toolbar');
    this.showCaixaInterna=false;
      
  }

  onCitySelected(idCidade: number): void {
    console.log('Cidade selecionada na toolbar:', idCidade);
    this.authService.setIdCity(idCidade);
    this.showCityModal = false;
    window.location.reload();

      }
      onModalClosed(): void {
        console.log('Modal fechado sem seleção na toolbar');
        this.showCityModal = false;
        window.location.reload();
      }

  onExportKML(): void {
    console.log('🗺️ [TOOLBAR] Botão Exportar KML clicado');
    const event = new CustomEvent('exportKML');
    window.dispatchEvent(event);
  }

  onOpenMapReport(): void {
    console.log('📊 [TOOLBAR] Botão Relatório geral clicado');
    window.dispatchEvent(new CustomEvent('openMapReport'));
  }

  abrirLogCidade(): void {
    const idCidade = this.authService.getIdCity();
    const cidade = this.cities?.find((c: any) => c.id_cidade === idCidade || c.id === idCidade);
    this.dialog.open(LogCidadeComponent, {
      width: '1000px',
      maxWidth: '100vw',
      data: {
        idCidade: idCidade ?? undefined,
        nomeCidade: cidade?.nome ?? cidade?.nome_cidade
      },
      disableClose: false
    });
  }

  abrirSyncVigoCto(): void {
    const idCidade = this.authService.getIdCity();
    if (!idCidade) {
      window.alert('Selecione a cidade antes de sincronizar conectividade VIGO.');
      return;
    }

    this.dialog.open(VigoCtoSyncModalComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: { idCidade },
      disableClose: false,
    });
  }

  abrirSanearStatusVigo(): void {
    const idCidade = this.authService.getIdCity();
    if (!idCidade) {
      window.alert('Selecione a cidade antes de sanear o STATUS dos clientes.');
      return;
    }

    this.dialog.open(VigoSanearStatusModalComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: { idCidade },
      disableClose: false,
    });
  }
}
