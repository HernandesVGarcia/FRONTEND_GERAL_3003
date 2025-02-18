import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { Cabos6f } from '../modelo/Cabos6f';
import { Cabos8f } from '../modelo/Cabos8f';
import { Cabos12f } from '../modelo/Cabos12f';
import { Cabos24f } from '../modelo/Cabos24f';
import { Caixa } from '../modelo/Caixa';
import { Cto } from '../modelo/Cto';

@Component({
  selector: 'app-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.css'],
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
})
export class GoogleMapsComponent implements OnInit, OnChanges {
  @Input() destino: Caixa[] = [];
  @Input() destinoCTO: Cto[] = [];
  @Input() destinoCabos6f: Cabos6f[] = [];
  @Input() destinoCabos8f: Cabos8f[] = [];
  @Input() destinoCabos12f: Cabos12f[] = [];
  @Input() destinoCabos24f: Cabos24f[] = [];

  title: string = "Fiberworks";
  center: google.maps.LatLngLiteral = { lat: -23.326803, lng: -52.114882 };
  zoom = 18;
  mapID = "My Project Angular";

  markerCaixas: google.maps.LatLngLiteral[] = [];
  markerCtos: google.maps.LatLngLiteral[] = [];
  markerOptions: google.maps.MarkerOptions[] = [];
  markerOptionsCTO: google.maps.MarkerOptions[] = [];
  polylinePaths6f: google.maps.LatLngLiteral[][] = [];
  polylinePaths8f: google.maps.LatLngLiteral[][] = [];
  polylinePaths12f: google.maps.LatLngLiteral[][] = [];
  polylinePaths24f: google.maps.LatLngLiteral[][] = [];

  polylineOptions6f: google.maps.PolylineOptions = {
    strokeColor: 'black',
    strokeOpacity: 0.7,
    strokeWeight: 3,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: true,
    editable: false

  }

  polylineOptions8f: google.maps.PolylineOptions = {
    strokeColor: 'blue',
    strokeOpacity: 0.8,
    strokeWeight: 3,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: true,
    editable: false

  }

  polylineOptions12f: google.maps.PolylineOptions = {
    strokeColor: 'green',
    strokeOpacity: 0.8,
    strokeWeight: 4,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: true,
    editable: false

  }

    polylineOptions24f: google.maps.PolylineOptions = {
      strokeColor: 'violet',
      strokeOpacity: 0.8,
      strokeWeight: 5,
      clickable: true,
      visible: true,
      zIndex: 1,
      draggable: true,
      editable: false


  }

  ngOnInit() {
    console.log('GoogleMapsComponent initialized');
    this.checkGoogleMapsAPI();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges detectou mudança em destino:', changes['destino']);
    
    if ((changes['destino'] && changes['destino'].currentValue) ||
        (changes['destinoCTO'] && changes['destinoCTO'].currentValue) || 
        (changes['destinoCabos6f'] && changes['destinoCabos6f'].currentValue) ||
        (changes['destinoCabos8f'] && changes['destinoCabos8f'].currentValue) ||
        (changes['destinoCabos12f'] && changes['destinoCabos12f'].currentValue) ||
        (changes['destinoCabos24f'] && changes['destinoCabos24f'].currentValue)) {
      console.log('Novo valor de destino:', this.destino);
      this.updateMarkers();
      this.updateMarkersCTO();
      this.updatePolylinesCabos6f();
      this.updatePolylinesCabos8f();
      this.updatePolylinesCabos12f();
      this.updatePolylinesCabos24f();
    }
  }

  private updateMarkers() {
    if (this.destino && this.destino.length > 0) {
      console.log('Atualizando marcadores CEO com dados:', this.destino);
      
      this.markerCaixas = this.destino.map(location => ({
        lat: Number(location.LAT),
        lng: Number(location.LONGI)
      }));

      this.markerOptions = this.destino.map(location => ({
        title: location.numero || 'Sem número',
        draggable: true,
        label: {
          text: location.numero || 'S/N',
          color: 'blue',
          fontSize: '12px'
        } as google.maps.MarkerLabel,
        icon: {
          url: '/assets/caixa_plp_15.png',
          labelOrigin: new google.maps.Point(70, 10),
        }
      }));
      
      console.log('Marcadores CEO atualizados:', this.markerCaixas);
    }
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent, index: number, isCTO: boolean = false) {
    if (event.latLng) {
      const newLat = event.latLng.lat();
      const newLng = event.latLng.lng();
      console.log(`Marcador movido para: Lat ${newLat}, Lng ${newLng}`);
      
      if (isCTO) {
        this.markerCtos[index] = { lat: newLat, lng: newLng };
      } else {
        this.markerCaixas[index] = { lat: newLat, lng: newLng };
      }
    }
  }

  private updateMarkersCTO() {
    if (this.destinoCTO && this.destinoCTO.length > 0) {
      console.log('Atualizando marcadores CTO com dados:', this.destinoCTO);
      
      this.markerCtos = this.destinoCTO.map(location => ({
        lat: Number(location.LAT),
        lng: Number(location.LONGI)
      }));

      this.markerOptionsCTO = this.destinoCTO.map(location => ({
        title: location.numero || 'Sem número',
        draggable: true,
        label: {
          text: location.numero || 'S/N',
          color: 'blue',
          fontSize: '10px'
        } as google.maps.MarkerLabel,
        icon: {
          url: '/assets/CTO80.png',
          labelOrigin: new google.maps.Point(50, 10),
        },
        customData: {
          tipo: 'cto',
          numero: location.id_meta,
          dadosOriginais: location
        }
      }));
      
      console.log('CTOs atualizados:', this.markerCtos);
    }
  }

  private convertStringToCoords(coordString: string): google.maps.LatLngLiteral[] {
    try {
      // Se já for um array, retorna diretamente
      if (Array.isArray(coordString)) {
        return coordString.map(coord => ({
          lat: parseFloat(String(coord.lat)),
          lng: parseFloat(String(coord.lng))
        }));
      }

      // Se for uma string, tentar fazer o parse
      const coords = typeof coordString === 'string' ? JSON.parse(coordString) : coordString;
      
      if (Array.isArray(coords)) {
        return coords.map(coord => ({
          lat: parseFloat(String(coord.lat)),
          lng: parseFloat(String(coord.lng))
        }));
      }

      return [];
    } catch (e) {
      console.error('Erro ao converter coordenadas:', e);
      return [];
    }
  }

  private updatePolylinesCabos6f() {
    if (!this.destinoCabos6f?.length) return;
    
    try {
      this.polylinePaths6f = [];
      
      this.destinoCabos6f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths6f.push(coords);
            console.log(`Cabo 6f  ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths6f.length > 0) {
        const firstPoint = this.polylinePaths6f[0][0];
        if (firstPoint) {
          this.center = { lat: firstPoint.lat, lng: firstPoint.lng };
          console.log('Mapa centralizado em:', this.center);
        }
      }

      console.log(`Total de ${this.polylinePaths6f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths6f = [];
    }
  }




  private updatePolylinesCabos8f() {
    if (!this.destinoCabos8f?.length) return;
    
    try {
      this.polylinePaths8f = [];
      
      this.destinoCabos8f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths8f.push(coords);
            console.log(`Cabo 8f  ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths8f.length > 0) {
        const firstPoint = this.polylinePaths8f[0][0];
        if (firstPoint) {
          this.center = { lat: firstPoint.lat, lng: firstPoint.lng };
          console.log('Mapa centralizado em:', this.center);
        }
      }

      console.log(`Total de ${this.polylinePaths8f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths8f = [];
    }
  }






  private updatePolylinesCabos12f() {
    if (!this.destinoCabos12f?.length) return;
    
    try {
      this.polylinePaths12f = [];
      
      this.destinoCabos12f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths12f.push(coords);
            console.log(`Cabo 12f  ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths12f.length > 0) {
        const firstPoint = this.polylinePaths12f[0][0];
        if (firstPoint) {
          this.center = { lat: firstPoint.lat, lng: firstPoint.lng };
          console.log('Mapa centralizado em:', this.center);
        }
      }

      console.log(`Total de ${this.polylinePaths12f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths12f = [];
    }
  }



  private updatePolylinesCabos24f() {
    if (!this.destinoCabos24f?.length) return;
    
    try {
      this.polylinePaths24f = [];
      
      this.destinoCabos24f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths24f.push(coords);
            console.log(`Cabo 24f ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths24f.length > 0) {
        const firstPoint = this.polylinePaths24f[0][0];
        if (firstPoint) {
          this.center = { lat: firstPoint.lat, lng: firstPoint.lng };
          console.log('Mapa centralizado em:', this.center);
        }
      }

      console.log(`Total de ${this.polylinePaths24f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths24f = [];
    }
  }


  

  onMapInitialized() {
    console.log('Map initialized successfully');
  }

  private checkGoogleMapsAPI() {
    if ((window as any).google && (window as any).google.maps) {
      console.log('Google Maps API loaded successfully');
    } else {
      console.warn('Google Maps API not loaded yet. Waiting...');
      setTimeout(() => this.checkGoogleMapsAPI(), 1000);
    }
  }
}