import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { GoogleGpsComponent } from '../google-gps/google-gps.component';
import { AuthService } from '../servico/auth.service';
import { CitySelectModalComponent } from '../city-select-modal/city-select-modal.component';
import { CidadesService } from '../servico/cidades.service';

@Component({
  selector: 'app-map-tracer-buttons',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, GoogleGpsComponent, CitySelectModalComponent],
  templateUrl: './map-tracer-buttons.component.html',
  styleUrls: ['./map-tracer-buttons.component.css']
})
export class MapTracerButtonsComponent implements OnInit {

  @ViewChild('gpsComponent') gpsComponent!: GoogleGpsComponent;

  showCityModal = false;

  constructor(
    private authService: AuthService,
    private cidadesService: CidadesService
  ) { }

  ngOnInit(): void {
  }

  /**
   * 🗺️ Limpa todos os destaques de tracer no mapa
   */
  onLimpaTracer(): void {
    console.log('🗺️ [TRACER-BUTTONS] Limpa Tracer clicado');
    
    // Disparar evento customizado para limpar highlights
    const event = new CustomEvent('clearCabosHighlight');
    window.dispatchEvent(event);
    
    // Disparar evento para cancelar desenho de cabo se houver
    const cancelEvent = new CustomEvent('cancelarDesenhoCabo');
    window.dispatchEvent(cancelEvent);
    
    console.log('🗺️ [TRACER-BUTTONS] Evento clearCabosHighlight disparado');
  }

  /**
   * 📏 Inicia modo de desenho de cabo
   */
  onDesenhaCabo(): void {
    console.log('🗺️ [TRACER-BUTTONS] Desenha Cabo clicado');
    
    // Disparar evento customizado para o Google Maps component
    const event = new CustomEvent('startDesenhoCabo');
    window.dispatchEvent(event);
    
    console.log('🗺️ [TRACER-BUTTONS] Evento startDesenhoCabo disparado');
  }

  /**
   * ✅ Finaliza o desenho do cabo atual
   */
  onFinalizaCabo(): void {
    console.log('🗺️ [TRACER-BUTTONS] Finaliza Cabo clicado');
    
    // Disparar evento customizado para o Google Maps component
    const event = new CustomEvent('finalizarDesenhoCabo');
    window.dispatchEvent(event);
    
    console.log('🗺️ [TRACER-BUTTONS] Evento finalizarDesenhoCabo disparado');
  }

  /**
   * 🔷 Inicia modo de desenho de polígono
   */
  onDesenhaPoligono(): void {
    console.log('🗺️ [TRACER-BUTTONS] Desenha Polígono clicado');
    
    // TODO: Implementar modo de desenho de polígono
    alert('Funcionalidade de desenho de polígono será implementada em breve!');
  }

  /**
   * ✅ Finaliza o desenho do polígono atual
   */
  onFinalizaPoligono(): void {
    console.log('🗺️ [TRACER-BUTTONS] Finaliza Polígono clicado');
    
    // TODO: Implementar finalização de polígono
    alert('Funcionalidade de finalização de polígono será implementada em breve!');
  }

  /**
   * 📍 Obtém a localização atual do usuário
   */
  onMinhaLocalizacao(): void {
    console.log('🗺️ [TRACER-BUTTONS] Minha Localização clicado');
    
    if (this.gpsComponent) {
      this.gpsComponent.getCurrentLocation();
    } else {
      console.error('🗺️ [TRACER-BUTTONS] GoogleGpsComponent não encontrado');
      alert('Erro: Componente GPS não disponível');
    }
  }

  /**
   * 📍 Callback quando a localização é encontrada
   */
  onLocationFound(location: {lat: number, lng: number, accuracy: number}): void {
    console.log('🗺️ [TRACER-BUTTONS] Localização encontrada:', location);
    
    // Armazenar a localização atual no AuthService
    this.authService.setLat(location.lat.toString());
    this.authService.setLng(location.lng.toString());
    
    // Recarregar a página para centralizar o mapa na localização atual
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  /**
   * ❌ Callback quando há erro na localização
   */
  onLocationError(error: string): void {
    console.error('🗺️ [TRACER-BUTTONS] Erro de localização:', error);
    alert(`Erro ao obter localização: ${error}`);
  }

  /**
   * 🏙️ Abre o modal de seleção de cidades
   */
  onSelecionarCidades(): void {
    console.log('🗺️ [TRACER-BUTTONS] Selecionar Cidades clicado');
    this.showCityModal = true;
    
  }

  /**
   * 🏙️ Callback quando uma cidade é selecionada
   */
  onCitySelected(idCidade: number): void {
    console.log('🗺️ [TRACER-BUTTONS] Cidade selecionada:', idCidade);
    this.authService.setIdCity(idCidade);
    this.showCityModal = false;
    // Recarregar a página atual para refletir a mudança
    window.location.reload();
  }

  /**
   * 🏙️ Callback quando o modal é fechado sem seleção
   */
  onModalClosed(): void {
    console.log('🗺️ [TRACER-BUTTONS] Modal fechado sem seleção');
    this.showCityModal = false;
    window.location.reload();
  }

  /**
   * 🔧 Método helper para detectar se está em dispositivo mobile
   */
  isMobile(): boolean {
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 || 
           window.innerWidth <= 768;
  }
}