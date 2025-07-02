import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-google-gps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './google-gps.component.html',
  styleUrls: ['./google-gps.component.css']
})
export class GoogleGpsComponent {
  @Output() locationFound = new EventEmitter<{lat: number, lng: number, accuracy: number}>();
  @Output() locationError = new EventEmitter<string>();
  
  loading = false;
  errorMessage = '';
  locationInfo: {lat: number, lng: number, accuracy: number} | null = null;

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.errorMessage = 'Geolocalização não é suportada pelo seu navegador';
      this.locationError.emit(this.errorMessage);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.locationInfo = null;

    console.log('Solicitando localização atual...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy);

        this.locationInfo = { lat, lng, accuracy };
        this.loading = false;

        console.log(`Localização encontrada: ${lat}, ${lng} (precisão: ~${accuracy}m)`);
        
        // Emitir evento para o componente pai
        this.locationFound.emit({ lat, lng, accuracy });
      },
      (error) => {
        this.loading = false;
        
        let errorMsg = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Permissão de localização negada pelo usuário';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Informações de localização não disponíveis';
            break;
          case error.TIMEOUT:
            errorMsg = 'Tempo limite para obter localização excedido';
            break;
          default:
            errorMsg = 'Erro desconhecido ao obter localização';
            break;
        }
        
        this.errorMessage = errorMsg;
        console.error('Erro de geolocalização:', errorMsg);
        this.locationError.emit(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }
}
