import { Component, OnInit, ViewChild } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {FormControl,  ReactiveFormsModule} from '@angular/forms';
import {CidadesService} from '../servico/cidades.service';
import {Cidades} from '../modelo/Cidades';
import { AuthService } from '../servico/auth.service';
import { Router } from '@angular/router';
import { CitySelectModalComponent } from '../city-select-modal/city-select-modal.component';
//import { CaixaInternasyncComponent } from '../caixa-internasync/caixa-internasync.component';
//import { AppComponent } from '../app.component';
//import {CaixaInternaSyncComponent} from '../caixa-interna-sync/caixa-interna-sync.component'
//import { GoogleGpsComponent } from '../google-gps/google-gps.component';

@Component({
  selector: 'app-toolbars',
  imports: [CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    CitySelectModalComponent,
    MatSelectModule,
    //CaixaInternaSyncComponent,
    //GoogleGpsComponent,
    MatTooltipModule],
  templateUrl: './toolbars.component.html',
  styleUrls: ['./toolbars.component.css'],
  standalone: true
})
export class ToolbarsComponent {
  //@ViewChild('gpsComponent') gpsComponent!: GoogleGpsComponent;

  cities: any[] = [];
  selectedCity: any;
  cityModalOpen = false;
  showCityModal = false;
  showCaixaInterna=false;
 
   
  constructor(
    private cidadesService: CidadesService,
    private authService: AuthService,
    private router: Router,
    
  ) {
    console.log('Toolbar construída');
  }
 
  ngOnInit() {
    // Carrega as cidades quando o componente inicializa
    this.loadCities();
    
    // Obtém a cidade selecionada do authService
    const cityId = this.authService.getIdCity();
    if (cityId) {
      this.selectedCity = cityId;
    }
  }

  loadCities() {
    // Obter o valor do polo do AuthService
    const polo = this.authService.getPolo();
    
    if (!polo) {
      console.error('Nenhum polo encontrado no storage');
      return;
    }
    
    // Fazer a chamada à API com o polo
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
    // Recarregar a página atual para refletir a mudança
    window.location.reload();

      }
      onModalClosed(): void {
        console.log('Modal fechado sem seleção na toolbar');
        this.showCityModal = false;
        window.location.reload();
      }


      /* Métodos GPS
  getCurrentLocation(): void {
    console.log('Botão GPS clicado na toolbar');
    this.gpsComponent.getCurrentLocation();
  }

  onLocationFound(location: {lat: number, lng: number, accuracy: number}): void {
    console.log('Localização encontrada na toolbar:', location);
    
    // Armazenar a localização atual no AuthService
    this.authService.setLat(location.lat.toString());
    this.authService.setLng(location.lng.toString());
    
    // Aqui você pode adicionar lógica para centralizar o mapa na localização atual
    // Por exemplo, emitir um evento para o componente do mapa
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    //alert(`Localização encontrada!\nLat: ${location.lat.toFixed(6)}\nLng: ${location.lng.toFixed(6)}\nPrecisão: ~${location.accuracy}m`);
  }

  onLocationError(error: string): void {
    console.error('Erro de localização na toolbar:', error);
    alert(`Erro ao obter localização: ${error}`);
  }

  */
  


    }

    