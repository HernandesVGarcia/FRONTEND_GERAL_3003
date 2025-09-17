import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { Cabos1f } from '../modelo/Cabos1f';
import { Cabos2f } from '../modelo/Cabos2f';
import { Cabos4f } from '../modelo/Cabos4f';
import { Cabos6f } from '../modelo/Cabos6f';
import { Cabos8f } from '../modelo/Cabos8f';
import { Cabos12f } from '../modelo/Cabos12f';
import { Cabos24f } from '../modelo/Cabos24f';
import { Cabos36f } from '../modelo/Cabos36f';
import { Cabos48f } from '../modelo/Cabos48f';
import { Cabos72f } from '../modelo/Cabos72f';
import { Cabos144f } from '../modelo/Cabos144f';
import { Caixa } from '../modelo/Caixa';
import { Cto } from '../modelo/Cto';
import { Cto_SP } from '../modelo/Cto_SP';
import { PopsCli } from '../modelo/PopsCli';
import { PopsEst } from '../modelo/popsEst';
import { Condominios } from '../modelo/Condominios';
import { Dios } from '../modelo/dios';

//import { CaixaInternaComponent } from '../caixa-interna/caixa-interna.component';
import { ChangeDetectorRef } from '@angular/core'; /// ============novo
import { GoJSDemoComponent } from '../gojs-demo/gojs-demo.component';
import { AuthService } from '../servico/auth.service';
import { animate, animation } from '@angular/animations';

import { MapSearchButtonsComponent } from '../map-search-buttons/map-search-buttons.component';
import { CompartilhamentoService, CaixaData, ClienteData } from '../servico/compartilhamento.service';
import { Subject, takeUntil } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { PopInfoModalComponent } from '../pop-info-modal/pop-info-modal.component';
import { VisualizaDioComponent } from '../visualiza-dio/visualiza-dio.component';

//import { Cto_SP } from '../modelo/Cto_SP';
//import { GoogleInfoWindowComponent } from '../google-infowindow/google-infowindow.component';

@Component({
  selector: 'app-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.css'],
  standalone: true,
  imports: [CommonModule, GoogleMapsModule,GoJSDemoComponent,MapSearchButtonsComponent],
})
export class GoogleMapsComponent implements OnInit, OnChanges {
  @Input() destinoCondominios: Condominios[]=[];
  @Input() destinoDios: Dios[] = [];
  @Input() destinoPopsCli: PopsCli[] = [];
  @Input() destinoPopsCliDes: PopsCli[] = [];
  @Input() destinoPopsCliAtv: PopsCli[] = [];
  @Input() destinoPopsEst: PopsEst[] = [];
  @Input() destino: Caixa[] = [];
  @Input() destinoCTO: Cto[] = [];
  @Input() destinoCTOSP: Cto_SP[] = [];
  @Input() destinoCabos1f: Cabos1f[] = [];
  @Input() destinoCabos2f: Cabos2f[] = [];
  @Input() destinoCabos4f: Cabos4f[] = [];
  @Input() destinoCabos6f: Cabos6f[] = [];
  @Input() destinoCabos8f: Cabos8f[] = [];
  @Input() destinoCabos12f: Cabos12f[] = [];
  @Input() destinoCabos24f: Cabos24f[] = [];
  @Input() destinoCabos36f: Cabos36f[] = [];
  @Input() destinoCabos48f: Cabos48f[] = [];
  @Input() destinoCabos72f: Cabos72f[] = [];
  @Input() destinoCabos144f: Cabos144f[] = [];

  isGoJSModalOpen = false;
 // private isMapFullyInitialized = false;
 // private isInfoWindowsSetup = false;

  constructor(
     private cdr: ChangeDetectorRef,
     private authService : AuthService,
     private compartilhamentoService: CompartilhamentoService,
     private dialog: MatDialog) {
  
    
  };
  

  caixaSelecionada: string | null = null;

  

  title: string = "Fiberworks";
  center: google.maps.LatLngLiteral = { lat: -23.326803, lng: -52.114882 };
  //center: google.maps.LatLngLiteral = { lat: authService.getLat, lng: this.authService.lng };
  zoom = 13;

  mapOptions: google.maps.MapOptions = {
  mapId : "My Project Angular",};


  // Marcador da posição atual do usuário
  currentLocationMarker: google.maps.LatLngLiteral | null = null;
  currentLocationMarkerOptions: any = {
    icon: {
      path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
      scale: 4,
      fillColor: '#4285f4',
      fillOpacity: 0.2,
      strokeColor: '#4285f4',
      strokeWeight: 3,
      strokeOpacity: 0.3,
      
    },
    
    title: 'Sua localização atual',
    animation: google.maps.Animation.BOUNCE,
    
    
    
  };
  markerDios: google.maps.Marker[] = [];
  markerCondominios: google.maps.Marker[] = [];
  markerPopsCli: google.maps.Marker[] = [];
  markerPopsCliAtv: google.maps.Marker[] = [];
  markerPopsCliDes: google.maps.Marker[] = [];
  markerPopsEst: google.maps.Marker[] = [];
  markerCaixas: google.maps.Marker[] = [];
  markerCtos:google.maps.Marker[]=[];
  markerCtosSP:google.maps.Marker[]=[];
  //markerCtos: google.maps.LatLngLiteral[] = [];
  markerOptions: google.maps.MarkerOptions[] = [];
  markerOptionsCTO: google.maps.MarkerOptions[] = [];
  markerOptionsCTOSP: google.maps.MarkerOptions[] = [];
  polylinePaths1f: google.maps.LatLngLiteral[][] = [];
  polylinePaths2f: google.maps.LatLngLiteral[][] = [];
  polylinePaths4f: google.maps.LatLngLiteral[][] = [];
  polylinePaths6f: google.maps.LatLngLiteral[][] = [];
  polylinePaths8f: google.maps.LatLngLiteral[][] = [];
  polylinePaths12f: google.maps.LatLngLiteral[][] = [];
  polylinePaths24f: google.maps.LatLngLiteral[][] = [];
  polylinePaths36f: google.maps.LatLngLiteral[][] = [];
  polylinePaths48f: google.maps.LatLngLiteral[][] = [];
  polylinePaths72f: google.maps.LatLngLiteral[][] = [];
  polylinePaths144f: google.maps.LatLngLiteral[][] = [];

  
  

  // 🔥 INFOWINDOW: Array para armazenar as polylines 6f com InfoWindow
  // Arrays para armazenar as polylines criadas programaticamente
  polylines1f: google.maps.Polyline[] = [];
  polylines2f: google.maps.Polyline[] = [];
  polylines4f: google.maps.Polyline[] = [];
  polylines6f: google.maps.Polyline[] = [];
  polylines8f: google.maps.Polyline[] = [];
  polylines12f: google.maps.Polyline[] = [];
  polylines24f: google.maps.Polyline[] = [];
  polylines36f: google.maps.Polyline[] = [];
  polylines48f: google.maps.Polyline[] = [];
  polylines72f: google.maps.Polyline[] = [];
  polylines144f: google.maps.Polyline[] = [];

  // Arrays para armazenar os InfoWindows
  infoWindows1f: google.maps.InfoWindow[] = [];
  infoWindows2f: google.maps.InfoWindow[] = [];
  infoWindows4f: google.maps.InfoWindow[] = [];
  infoWindows6f: google.maps.InfoWindow[] = [];
  infoWindows8f: google.maps.InfoWindow[] = [];
  infoWindows12f: google.maps.InfoWindow[] = [];
  infoWindows24f: google.maps.InfoWindow[] = [];
  infoWindows36f: google.maps.InfoWindow[] = [];
  infoWindows48f: google.maps.InfoWindow[] = [];
  infoWindows72f: google.maps.InfoWindow[] = [];
  infoWindows144f: google.maps.InfoWindow[] = [];

  
  // Propriedades que estavam faltando
  isMapFullyInitialized: boolean = false;
  isInfoWindowsSetup: boolean = false;


private ZOOM_LEVEL_CAIXAS = 15; // Caixas CEO visíveis em zoom >= 14
private ZOOM_LEVEL_CTOS = 16;   // CTOs visíveis em zoom >= 16
private ZOOM_LEVEL_CTOSSP = 16;   // CTOs visíveis em zoom >= 16
private ZOOM_LEVEL_POPS = 14;   // pops visíveis em zoom >= 13
private ZOOM_LEVEL_CLIENTES = 18;   // pops visíveis em zoom >= 18
private ZOOM_LEVEL_CLIENTES_DISABLES = 19;   // pops visíveis em zoom >= 19
private ZOOM_LEVEL_CLIENTES_ATIVOS = 17;   // pops visíveis em zoom >= 17
private ZOOM_LEVEL_CONDOMINIOS = 17;   // CTOs visíveis em zoom >= 17
private ZOOM_LEVEL_DIOS = 18;   // DIOS visíveis em zoom >= 117

private destroy$ = new Subject<void>();


private map?: (google.maps.Map);
  isMapReady: any;

 

 currentZoom: number = 18;



 // **********************************************************************************************inserido
 private boundsChangeTimeout: any;
 private allCaixas: Caixa[] = [];
 private allCTOs: Cto[] = [];

 // Propriedade para controlar o limiar de densidade
 private MAX_VISIBLE_MARKERS_CEO = 200; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_CTO = 150; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_CTOSP = 150; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_CLIENTES = 100; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_CLIENTES_DISABLES = 100; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_CLIENTES_ATIVOS = 100; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_POPs = 30; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_CONDOMINIOS = 100; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_DIOS = 100; // Ajuste este valor conforme necessário
 
// **********************************************************************************************inserido

  polylineOptions1f: google.maps.PolylineOptions = {
    strokeColor: 'blue',
    strokeOpacity: 0.7,
    strokeWeight: 0.5,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false,
    //traceja linha
    icons: [{
    icon: {
      path: 'M 0,-1 0,1',
      strokeOpacity: 0.7,
      scale: 2
    },
    offset: '0',
    repeat: '10px'
  }]

  }

  polylineOptions2f: google.maps.PolylineOptions = {
    strokeColor: ' #00FFFF ',
    strokeOpacity: 0.7,
    strokeWeight: 0.5,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false,
    //traceja linha
    icons: [{
    icon: {
      path: 'M 0,-1 0,1',
      strokeOpacity: 0.7,
      scale: 3
    },
    offset: '0',
    repeat: '10px'
  }]

  }

  polylineOptions4f: google.maps.PolylineOptions = {
    strokeColor: 'rgb(41, 161, 216) ',
    strokeOpacity: 0.7,
    strokeWeight: 0.5,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false,
    //traceja linha
    icons: [{
    icon: {
      path: 'M 0,-1 0,1',
      strokeOpacity: 0.7,
      scale: 3
    },
    offset: '0',
    repeat: '10px'
  }] 

  }


  polylineOptions6f: google.maps.PolylineOptions = {
    strokeColor: 'black',
    strokeOpacity: 0.7,
    strokeWeight: 3,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false

     

  }

  polylineOptions8f: google.maps.PolylineOptions = {
    strokeColor: 'blue',
    strokeOpacity: 0.8,
    strokeWeight: 3,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false

  }

  polylineOptions12f: google.maps.PolylineOptions = {
    strokeColor: 'green',
    strokeOpacity: 0.8,
    strokeWeight: 3.5,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false

  }

    polylineOptions24f: google.maps.PolylineOptions = {
      strokeColor: 'violet',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      clickable: true,
      visible: true,
      zIndex: 1,
      draggable: false,
      editable: false

     


  }

  polylineOptions36f: google.maps.PolylineOptions = {
    strokeColor: 'blue',
    strokeOpacity: 0.8,
    strokeWeight: 4.5,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false

   


}

polylineOptions48f: google.maps.PolylineOptions = {
  strokeColor: 'red',
  strokeOpacity: 0.8,
  strokeWeight: 5,
  clickable: true,
  visible: true,
  zIndex: 1,
  draggable: false,
  editable: false
 

}

polylineOptions72f: google.maps.PolylineOptions = {
  strokeColor: 'purple',
  strokeOpacity: 0.8,
  strokeWeight: 5.5,
  clickable: true,
  visible: true,
  zIndex: 1,
  draggable: false,
  editable: false

  


}


polylineOptions144f: google.maps.PolylineOptions = {
  strokeColor: ' #FFAE42 ',
  strokeOpacity: 0.8,
  strokeWeight: 6,
  clickable: true,
  visible: true,
  zIndex: 1,
  draggable: false,
  editable: false

  


}


// Novo array para controlar os InfoWindows dos cabos
  caboInfoWindows: Array<{
    map: google.maps.Map | undefined;
    position: google.maps.LatLngLiteral;
    title: string;
    content: string;
    caboId: string;
    caboType: string;
    isVisible: boolean;
    zoomThreshold: number;
    currentZoom: number;
  }> = [];

  



  ngOnInit() {
    console.log('GoogleMapsComponent initialized');
    this.checkGoogleMapsAPI();
    this.checkForGPSLocation();
    
    
    //const lat= this.authService.getLat
    //const lng= this.authService.getLng
    //center:google.maps.LatLngLiteral = { lat: lat, lng: lng};


    // Subscription para escutar dados de caixa selecionada
    this.compartilhamentoService.caixa$.pipe(takeUntil(this.destroy$)).subscribe((caixaData: CaixaData | null) => {
      if (caixaData) {
        console.log('Dados da caixa recebidos no GoogleMaps:', caixaData);
        this.centralizarNaCaixa(caixaData);
      }
    });

    // Subscription para escutar dados de caixa selecionada
    this.compartilhamentoService.cliente$.pipe(takeUntil(this.destroy$)).subscribe((clienteData: ClienteData | null) => {
      if (clienteData) {
        console.log('Dados da caixa recebidos no GoogleMaps:', clienteData);
        this.centralizarNoCliente(clienteData);
      }
    });

  }

  //MÉTODOS========================================================
  checkForGPSLocation(): void {
    // Verifica se há coordenadas GPS salvas no AuthService
    const lat = this.authService.getLat();
    const lng = this.authService.getLng();
    
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (!isNaN(latitude) && !isNaN(longitude)) {
        this.centerMapOnLocation(latitude, longitude);
      }
    }
  }

  centerMapOnLocation(lat: number, lng: number): void {
    // Centraliza o mapa na localização
    this.center = { lat, lng };
    this.zoom = 14; // Zoom mais próximo para localização GPS
    
    // Define o marcador da posição atual
    this.currentLocationMarker = { lat, lng };
    
    

console.log(`Mapa centralizado na posição: ${lat}, ${lng}`);
}





  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges detectou mudança em destino:', changes['destino']);

    console.log('CaixaInterna - ngOnChanges recebeu:', changes);
  if (changes['numeroCaixa']) {
    console.log('Número da caixa alterado para');
  }
     

    if (changes['destinoDios'] && changes['destinoDios'].currentValue) {
      console.log('Atualizando marcadores de Dios ',this.destinoDios);
      this.updateMarkersDios();
    }

    if (changes['destinoCondominios'] && changes['destinoCondominios'].currentValue) {
      console.log('Atualizando marcadores de Condominios ',this.destinoCondominios);
      this.updateMarkersCondominios();
    }

    if (changes['destinoPopsCli'] && changes['destinoPopsCli'].currentValue) {
      console.log('Atualizando marcadores de Clientes ',this.destinoPopsCli);
      this.updateMarkersPopsCli();
    }

    if (changes['destinoPopsCliDes'] && changes['destinoPopsCliDes'].currentValue) {
      console.log('Atualizando marcadores de Clientes Desativados',this.destinoPopsCliDes);
      this.updateMarkersPopsCliDes();
    }

    if (changes['destinoPopsCliAtv'] && changes['destinoPopsCliAtv'].currentValue) {
      console.log('Atualizando marcadores de Clientes Ativados',this.destinoPopsCliAtv);
      this.updateMarkersPopsCliAtv();
    }

    if (changes['destinoPopsEst'] && changes['destinoPopsEst'].currentValue) {
      console.log('Atualizando marcadores de Estações ',this.destinoPopsEst);
      this.updateMarkersPopsEst();
    }
    
    if (changes['destino'] && changes['destino'].currentValue) {
      console.log('Atualizando marcadores de caixas ',this.destino);
      this.updateMarkers();
    }
      
    if (changes['destinoCTO'] && changes['destinoCTO'].currentValue) {
      console.log('Atualizando marcadores de CTOs',this.destinoCTO);
      this.updateMarkersCTO();
    }

    if (changes['destinoCTOSP'] && changes['destinoCTOSP'].currentValue) {
      console.log('Atualizando marcadores de CTOs COM SP',this.destinoCTOSP);
      this.updateMarkersCTOSP();
    }

    if (changes['destinoCabos1f'] && changes['destinoCabos1f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 1f ',this.destinoCabos1f);
      this.updatePolylinesCabos1f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo1fPolylines();
      }, 1);
     
    }

    if (changes['destinoCabos2f'] && changes['destinoCabos2f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 2f ',this.destinoCabos2f);
      this.updatePolylinesCabos2f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo2fPolylines();
      }, 1);
    
    }

    if (changes['destinoCabos4f'] && changes['destinoCabos4f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 4f ',this.destinoCabos4f);
      this.updatePolylinesCabos4f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo4fPolylines();
      }, 1);
     
    }

    if (changes['destinoCabos6f'] && changes['destinoCabos6f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 6f ',this.destinoCabos6f);
      this.updatePolylinesCabos6f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo6fPolylines();
      }, 1);
      
                
      
    }

    if (changes['destinoCabos8f'] && changes['destinoCabos8f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 8f ',this.destinoCabos8f);
      this.updatePolylinesCabos8f();
      setTimeout(() => {
        this.createCabo8fPolylines();
      }, 1);
      
    }

    if (changes['destinoCabos12f'] && changes['destinoCabos12f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 12f ',this.destinoCabos12f);
      this.updatePolylinesCabos12f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo12fPolylines();
      }, 1);

      
    }

    if (changes['destinoCabos24f'] && changes['destinoCabos24f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 24f ',this.destinoCabos24f);
      this.updatePolylinesCabos24f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo24fPolylines();
      }, 1);
      
    }    

    if (changes['destinoCabos36f'] && changes['destinoCabos36f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 36f ',this.destinoCabos36f);
      this.updatePolylinesCabos36f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo36fPolylines();
      }, 1);
      
    } 
    
    if (changes['destinoCabos48f'] && changes['destinoCabos48f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 48f ',this.destinoCabos48f);
      this.updatePolylinesCabos48f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo48fPolylines();
      }, 1);
      
    }   

    if (changes['destinoCabos72f'] && changes['destinoCabos72f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 72f ',this.destinoCabos72f);
      this.updatePolylinesCabos72f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo72fPolylines();
      }, 1);
      
    }   

    if (changes['destinoCabos144f'] && changes['destinoCabos144f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 144f ',this.destinoCabos144f);
      this.updatePolylinesCabos144f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo144fPolylines();
      }, 1);
      
    }   
        
      
  }


  getVisibleMarkerCaixas(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_CAIXAS) {
      return this.markerCaixas;
    }
    return [];
  }
           
  getVisibleMarkerCtos(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_CTOS) {
      return this.markerCtos;
    }
    return [];
  }  

  getVisibleMarkerCtosSP(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_CTOSSP) {
      return this.markerCtosSP;
    }
    return [];
  }  

  getVisibleMarkerPOPCLI(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_CLIENTES) {
      return this.markerPopsCli;
    }
    return [];
  }  

  getVisibleMarkerPOPCLIAtv(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_CLIENTES_ATIVOS) {
      return this.markerPopsCliAtv;
    }
    return [];
  }  

  getVisibleMarkerPOPCLIDes(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_CLIENTES_DISABLES) {
      return this.markerPopsCliDes;
    }
    
    return [];
  }  

  getVisibleMarkerDios(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_DIOS) {
      return this.markerDios;
    }
    return [];
  }   




  private updateMarkersDios() {
    if (this.destinoDios && this.destinoDios.length > 0 && this.map) {
      this.markerDios.forEach(marker => marker.setMap(null));
      this.markerDios = [];
    }
    
    this.destinoDios.forEach(location => {
      const position = {
        lat: Number(location.LAT),
        lng: Number(location.LNG)
      };
      
      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.sigla || 'Sem nome',
        draggable: false,
        opacity:10,
        label: {
          text: 'DIO: ' + location.sigla || 'S/N',
          color: 'blue',
          fontSize: '12px'
        } as google.maps.MarkerLabel,
      icon: {
        url: '/assets/dioV2.png',
        labelOrigin: new google.maps.Point(50, 30),
        scaledSize: new google.maps.Size(120, 21.6),
      },
      visible: this.currentZoom >= this.ZOOM_LEVEL_DIOS
      ///visible: false
      };

      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }
      
      // Adicionar listener de duplo clique para abrir o modal Visualiza DIO
      marker.addListener('dblclick', () => {
        console.log('DIO clicado duas vezes:', location);
        if (location.id_meta) {
          this.openVisualizaDioModal(location.id_meta, location.CAPACIDADE);
        }
      });
      
      this.markerDios.push(marker);
      });

    console.log('Dios atualizados:', this.markerDios);    
  }




  //=====================================função para carregar as POPs na Tela================================
  private updateMarkersCondominios() {
    

      if (this.destinoCondominios && this.destinoCondominios.length > 0 && this.map) {
        this.markerCondominios.forEach(marker => marker.setMap(null));
        this.markerCondominios = [];
        
        this.destinoCondominios.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LNG)
          };

    

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.sigla || 'Sem nome',
        draggable: false,
        opacity:0.8,
        label: {
          text: location.sigla || 'S/N',
          color: 'blue',
          fontSize: '9px'
          
        } as google.maps.MarkerLabel,
        icon: {
          url: '/assets/BLOCO5.png',
          labelOrigin: new google.maps.Point(50, 0),
          scaledSize: new google.maps.Size(50, 50),
                 
          
        },

        visible: this.currentZoom >= this.ZOOM_LEVEL_CONDOMINIOS
        ///visible: false

      };
      
      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }
      
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const index = this.markerCondominios.indexOf(marker);
        if (index !== -1) {
          this.onMarkerDragEnd(event, index, true);
        }
      });

      //this.addMarkerEventListeners(marker, true);
      
      this.markerCondominios.push(marker);
    });
      
      console.log('Condominios atualizadas:', this.markerCondominios);
    }
  }

//=====================================função para carregar as POPs na Tela================================
  private updateMarkersPopsCli() {
    

      if (this.destinoPopsCli && this.destinoPopsCli.length > 0 && this.map) {
        this.markerPopsCli.forEach(marker => marker.setMap(null));
        this.markerPopsCli = [];
        
        this.destinoPopsCli.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LNG)
          };

    

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.sigla || 'Sem nome',
        draggable: true,
        opacity:20,
        label: {
          text: location.sigla || 'S/N',
          color: 'gray',
          fontSize: '10px'
        } as google.maps.MarkerLabel,
        icon: {
          //url: '/assets/TORRE4.png',
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: 'red', // Cor de preenchimento vermelha
          fillOpacity: 0.7, // Opacidade do preenchimento
          strokeColor: 'darkred', // Cor da borda
          strokeWeight: 2, // Espessura da borda
          scale: 4, // Tamanho do círculo
          labelOrigin: new google.maps.Point(0, -2),
          //scaledSize: new google.maps.Size(10, 10),
          
          
          
        },

        visible: this.currentZoom >= this.ZOOM_LEVEL_CLIENTES
        ///visible: false

      };
      
      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }
      
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const index = this.markerPopsCli.indexOf(marker);
        if (index !== -1) {
          this.onMarkerDragEnd(event, index, true);
        }
      });

      //this.addMarkerEventListeners(marker, true);//260825

      this.addMarkerEventListeners(marker, false,false,true,false,false);
      
      this.markerPopsCli.push(marker);
    });
      
      console.log('Clientes atualizados:', this.markerPopsCli);
    }
  }


//=====================================função para carregar as POPs na Tela================================
  private updateMarkersPopsCliDes() {
    

      if (this.destinoPopsCliDes && this.destinoPopsCliDes.length > 0 && this.map) {
        this.markerPopsCliDes.forEach(marker => marker.setMap(null));
        this.markerPopsCliDes = [];
        
        this.destinoPopsCliDes.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LNG)
          };

    

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.sigla || 'Sem nome',
        draggable: true,
        opacity:20,
        label: {
          text: location.sigla || 'S/N',
          color: 'gray',
          fontSize: '10px'
        } as google.maps.MarkerLabel,
        icon: {
          
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: 'gray', // Cor de preenchimento vermelha
          fillOpacity: 0.7, // Opacidade do preenchimento
          strokeColor: 'black', // Cor da borda
          strokeWeight: 2, // Espessura da borda
          scale: 4, // Tamanho do círculo
          labelOrigin: new google.maps.Point(0, -2),
          
          
          
          
        },

        visible: this.currentZoom >= this.ZOOM_LEVEL_CLIENTES_DISABLES
        ///visible: false

      };
      
      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }
      
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const index = this.markerPopsCliDes.indexOf(marker);
        if (index !== -1) {
          this.onMarkerDragEnd(event, index, true);
        }
      });

      this.addMarkerEventListeners(marker, false,false,false,false,true);
      
      this.markerPopsCliDes.push(marker);
    });
      
      console.log('Clientes Desativados atualizados:', this.markerPopsCliDes);
    }
  }



//=====================================função para carregar Clientes Ativos na Tela================================
  private updateMarkersPopsCliAtv() {
    

      if (this.destinoPopsCliAtv && this.destinoPopsCliAtv.length > 0 && this.map) {
        this.markerPopsCliAtv.forEach(marker => marker.setMap(null));
        this.markerPopsCliAtv = [];
        
        this.destinoPopsCliAtv.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LNG)
          };

    

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.sigla || 'Sem nome',
        draggable: true,
        opacity:20,
        label: {
          text: location.sigla || 'S/N',
          color: 'blue',
          fontSize: '10px'
        } as google.maps.MarkerLabel,
        icon: {
          
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: 'cyan', // Cor de preenchimento vermelha
          fillOpacity: 0.7, // Opacidade do preenchimento
          strokeColor: 'blue', // Cor da borda
          strokeWeight: 2, // Espessura da borda
          scale: 4, // Tamanho do círculo
          labelOrigin: new google.maps.Point(0, -2),
          
          
          
          
        },

        visible: this.currentZoom >= this.ZOOM_LEVEL_CLIENTES_ATIVOS
        ///visible: false

      };
      
      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }
      
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const index = this.markerPopsCliAtv.indexOf(marker);
        if (index !== -1) {
          this.onMarkerDragEnd(event, index, true);
        }
      });

      this.addMarkerEventListeners(marker, false,false,false,true,false);
      
      this.markerPopsCliAtv.push(marker);
    });
      
      console.log('Clientes Ativados atualizados:', this.markerPopsCliAtv);
    }
  }






//=====================================função para carregar as POPs na Tela================================
  private updateMarkersPopsEst() {
    

      if (this.destinoPopsEst && this.destinoPopsEst.length > 0 && this.map) {
        this.markerPopsEst.forEach(marker => marker.setMap(null));
        this.markerPopsEst = [];
        
        this.destinoPopsEst.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LNG)
          };

    

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.sigla || 'Sem nome',
        draggable: false,
        opacity:0.8,
        label: {
          text: location.sigla || 'S/N',
          color: 'red',
          fontSize: '13px'
        } as google.maps.MarkerLabel,
        icon: {
          url: '/assets/TORRE4.png',
          labelOrigin: new google.maps.Point(50, 0),
          scaledSize: new google.maps.Size(25, 25),
          
          
          
        },

        visible: this.currentZoom >= this.ZOOM_LEVEL_POPS
        ///visible: false

      };
      
      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }
      
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const index = this.markerPopsEst.indexOf(marker);
        if (index !== -1) {
          this.onMarkerDragEnd(event, index, true);
        }
      });

      //this.addMarkerEventListeners(marker, true);
      
      this.markerPopsEst.push(marker);
    });
      
      console.log('Estações atualizadas:', this.markerPopsEst);
    }
  }









    // =============================== função para carregar o marcadores Caixas na tela =========
    private updateMarkers() {

    const ceo_layer= this.authService.getceo_layer();
    if(ceo_layer == '0')  {return} // flag visualiza CEO
    if (this.destino && this.destino.length > 0 && this.map) {
      this.markerCaixas.forEach(marker => marker.setMap(null));
      this.markerCaixas = [];
      
      this.destino.forEach(location => {
        const position = {
          lat: Number(location.LAT),
          lng: Number(location.LONGI)
        };
        
        
          
          const markerOptions: google.maps.MarkerOptions = {
            position: position,
            title: location.numero || 'Sem número',
            draggable: false,
            label: {
              text: location.numero || 'S/N',
              color: 'blue',
              fontSize: '12px'
            } as google.maps.MarkerLabel,
            icon: {
              //url: '/assets/caixa_plp_15.png',
              url: '/assets/fosc ama.png',
              labelOrigin: new google.maps.Point(70, 10),
              scaledSize: new google.maps.Size(20, 40)
            },
            visible: this.currentZoom >= this.ZOOM_LEVEL_CAIXAS
            ///visible:false
          };
          
          const marker = new google.maps.Marker(markerOptions);
          
          if (this.map) {
            marker.setMap(this.map);
          }
          
          // substituido pela funçõa addmarkereventlistener ************************************************
          //marker.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
          //  const index = this.markerCaixas.indexOf(marker);
           // if (index !== -1) {
           //   this.onMarkerClick(event, index);
           // }
         // });
          
          //marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
          //  const index = this.markerCaixas.indexOf(marker);
          //  if (index !== -1) {
          //    this.onMarkerDragEnd(event, index, false);
          //  }
          //});
          // substituido pela funçõa addmarkereventlistener ************************************************

          this.addMarkerEventListeners(marker, false, false, false, false, false);
          
          this.markerCaixas.push(marker);
        });
      
      console.log('Marcadores CEO atualizados:', this.markerCaixas);
    }
  }  //======================================================================================================

  
  onMarkerDragEnd(event: google.maps.MapMouseEvent, index: number, isCTO: boolean = false) {
    if (event.latLng) {
      const newLat = event.latLng.lat();
      const newLng = event.latLng.lng();
      console.log(`Marcador movido para: Lat ${newLat}, Lng ${newLng}`);
      
      if (isCTO) {
        this.markerCtos[index].setPosition({ lat: newLat, lng: newLng });
      } else {
        this.markerCaixas[index].setPosition({ lat: newLat, lng: newLng });
      }
    }
  }


  //=====================================função para carregar as CTOs na Tela================================
  private updateMarkersCTO() {
    

      if (this.destinoCTO && this.destinoCTO.length > 0 && this.map) {
        this.markerCtos.forEach(marker => marker.setMap(null));
        this.markerCtos = [];
        
        this.destinoCTO.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LONGI)
          };

    

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.numero || 'Sem número',
        draggable: false,
        label: {
          text: location.numero || 'S/N',
          color: 'blue',
          fontSize: '10px'
        } as google.maps.MarkerLabel,
        icon: {
          url: '/assets/CTO80.png',
          labelOrigin: new google.maps.Point(50, 10),
          scaledSize: new google.maps.Size(18, 22)
        },
        visible: this.currentZoom >= this.ZOOM_LEVEL_CTOS
        ///visible: false

      };
      
      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }
      
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const index = this.markerCtos.indexOf(marker);
        if (index !== -1) {
          this.onMarkerDragEnd(event, index, true);
        }
      });

      this.addMarkerEventListeners(marker, true, false,false,false,false);
      
      this.markerCtos.push(marker);
    });
      
      console.log('CTOs atualizados:', this.markerCtos);
    }
  }

  //=============================================CONVERSAO==============================

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
      console.error('Erro ao converter coordenadas:', e ,coordString);
      return [];
    }
  }


//=====================================função para carregar as CTOs COM SPLITTER na Tela================================
  private updateMarkersCTOSP() {
    

      if (this.destinoCTOSP && this.destinoCTOSP.length > 0 && this.map) {
        this.markerCtosSP.forEach(marker => marker.setMap(null));
        this.markerCtosSP = [];
        
        this.destinoCTOSP.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LONGI)
          };

    

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.numero || 'Sem número',
        draggable: false,
        label: {
          text: location.numero || 'S/N',
          color: 'blue',
          fontSize: '10px'
        } as google.maps.MarkerLabel,
        icon: {
          url: '/assets/CTOSP.png',
          labelOrigin: new google.maps.Point(50, 10),
          scaledSize: new google.maps.Size(18, 22)
        },
        visible: this.currentZoom >= this.ZOOM_LEVEL_CTOSSP
        ///visible: false

      };
      
      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }
      
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const index = this.markerCtosSP.indexOf(marker);
        if (index !== -1) {
          this.onMarkerDragEnd(event, index, true);
        }
      });

      this.addMarkerEventListeners(marker, false, true, false, false, false);
      
      this.markerCtosSP.push(marker);
    });
      
      console.log('CTOs COM SPLITTER atualizados:', this.markerCtosSP);
    }
  }

  


  //==================================================CABOS=====================================

  private updatePolylinesCabos1f() {

    const cabo_layer= this.authService.getcabos_layer();
    console.log(' cabos layer = ', cabo_layer);
    if (cabo_layer =='0') return;



    if (!this.destinoCabos1f?.length) return;
    
    try {
      this.polylinePaths1f = [];
      
      this.destinoCabos1f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths1f.push(coords);
            //console.log(`Cabo 6f  ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths1f.length > 0) {
        const firstPoint = this.polylinePaths1f[0][0];
        
      }

      console.log(`Total de ${this.polylinePaths1f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths1f = [];
    }

     


  }

  private updatePolylinesCabos2f() {

    const cabo_layer= this.authService.getcabos_layer();
    console.log(' cabos layer = ', cabo_layer);
    if (cabo_layer =='0') return;



    if (!this.destinoCabos2f?.length) return;
    
    try {
      this.polylinePaths2f = [];
      
      this.destinoCabos2f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
                    
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths2f.push(coords);
            
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths2f.length > 0) {
        const firstPoint = this.polylinePaths2f[0][0];
        
      }

      console.log(`Total de ${this.polylinePaths2f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths2f = [];
    }
  }


  private updatePolylinesCabos4f() {

    const cabo_layer= this.authService.getcabos_layer();
    console.log(' cabos layer = ', cabo_layer);
    if (cabo_layer =='0') return;



    if (!this.destinoCabos4f?.length) return;
    
    try {
      this.polylinePaths4f = [];
      
      this.destinoCabos4f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
                    
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths4f.push(coords);
            
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths4f.length > 0) {
        const firstPoint = this.polylinePaths4f[0][0];
        
      }

      console.log(`Total de ${this.polylinePaths4f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths2f = [];
    }
  }

  private updatePolylinesCabos6f() {

    const cabo_layer= this.authService.getcabos_layer();
    console.log(' cabos layer = ', cabo_layer);
    if (cabo_layer =='0') return;



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
            //console.log(`Cabo 6f  ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths6f.length > 0) {
        const firstPoint = this.polylinePaths6f[0][0];
        //if (firstPoint) {
         // this.center = { lat: firstPoint.lat, lng: firstPoint.lng };
         // console.log('Mapa centralizado em:', this.center);
        //}
      }

      console.log(`Total de ${this.polylinePaths6f.length} cabos processados`);

      

      

      

    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths6f = [];
    }






  }




  private updatePolylinesCabos8f() {

    const cabo_layer= this.authService.getcabos_layer();
    if (cabo_layer =='0') return;

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
            //console.log(`Cabo 8f  ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths8f.length > 0) {
        const firstPoint = this.polylinePaths8f[0][0];
        //if (firstPoint) {
        //  this.center = { lat: firstPoint.lat, lng: firstPoint.lng };
        //  console.log('Mapa centralizado em:', this.center);
        //}
      }

      console.log(`Total de ${this.polylinePaths8f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths8f = [];
    }
  }






  private updatePolylinesCabos12f() {

    const cabo_layer= this.authService.getcabos_layer();
    if (cabo_layer =='0') return;


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
           //console.log(`Cabo 12f  ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths12f.length > 0) {
        const firstPoint = this.polylinePaths12f[0][0];
        //if (firstPoint) {
         // this.center = { lat: firstPoint.lat, lng: firstPoint.lng };
        //  console.log('Mapa centralizado em:', this.center);
        //}
      }

      console.log(`Total de ${this.polylinePaths12f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths12f = [];
    }
  }



  private updatePolylinesCabos24f() {

    const cabo_layer= this.authService.getcabos_layer();
    if (cabo_layer =='0') return;

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
            //console.log(`Cabo 24f ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths24f.length > 0) {
        const firstPoint = this.polylinePaths24f[0][0];
        //if (firstPoint) {
        //  this.center = { lat: firstPoint.lat, lng: firstPoint.lng };
        //  console.log('Mapa centralizado em:', this.center);
        //}
      }

      console.log(`Total de ${this.polylinePaths24f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths24f = [];
    }
  }


  private updatePolylinesCabos36f() {
    
    const cabo_layer= this.authService.getcabos_layer();
    if (cabo_layer =='0') return;


    if (!this.destinoCabos36f?.length) return;
    
    try {
      this.polylinePaths36f = [];
      
      this.destinoCabos36f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths36f.push(coords);
            //console.log(`Cabo 36f ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths36f.length > 0) {
        const firstPoint = this.polylinePaths36f[0][0];
        
      }

      console.log(`Total de ${this.polylinePaths36f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths36f = [];
    }
  }


  private updatePolylinesCabos48f() {

    const cabo_layer= this.authService.getcabos_layer();
    if (cabo_layer =='0') return;

    if (!this.destinoCabos48f?.length) return;
    
    try {
      this.polylinePaths48f = [];
      
      this.destinoCabos48f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths48f.push(coords);
            //console.log(`Cabo 36f ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths48f.length > 0) {
        const firstPoint = this.polylinePaths48f[0][0];
        
      }

      console.log(`Total de ${this.polylinePaths48f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths48f = [];
    }
  }

  private updatePolylinesCabos72f() {

    const cabo_layer= this.authService.getcabos_layer();
    if (cabo_layer =='0') return;


    if (!this.destinoCabos72f?.length) return;
    
    try {
      this.polylinePaths72f = [];
      
      this.destinoCabos72f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths72f.push(coords);
            //console.log(`Cabo 72f ${cabo.id_meta} processado com sucesso:`, coords);
          }





        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths72f.length > 0) {
        const firstPoint = this.polylinePaths72f[0][0];
        
      }

      console.log(`Total de ${this.polylinePaths72f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths72f = [];
    }
  }

  private updatePolylinesCabos144f() {

    const cabo_layer= this.authService.getcabos_layer();
    if (cabo_layer =='0') return;


    if (!this.destinoCabos144f?.length) return;
    
    try {
      this.polylinePaths144f = [];
      
      
      this.destinoCabos144f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths144f.push(coords);
            //console.log(`Cabo 72f ${cabo.id_meta} processado com sucesso:`, coords);
          }

          



        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths144f.length > 0) {
        const firstPoint = this.polylinePaths144f[0][0];
        
      }

      console.log(`Total de ${this.polylinePaths144f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths144f = [];
    }
  }




  //==========================================================================================================================
  //==1 dispara o evento que monitora o zoom para executar o callback de visible markers======================================
  //==2 dispara o evento para monitorar os boundsChange para executar o callback de visible markers===========================

  onMapInitialized(map: google.maps.Map) {

    //==========================================================para mobile
    if (window.innerWidth < 768) {
    map.setOptions({
      gestureHandling: 'greedy', // Permite zoom com um dedo
      disableDoubleClickZoom: false,
      scrollwheel: true
    });
  } //===========================================================

  // Configurar controles responsivos
  map.setOptions({
    zoomControlOptions: {
      position: window.innerWidth < 768 ? 
        google.maps.ControlPosition.RIGHT_BOTTOM : 
        google.maps.ControlPosition.RIGHT_TOP
    },
    mapTypeControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT,
      style: window.innerWidth < 768 ? 
        google.maps.MapTypeControlStyle.DROPDOWN_MENU :
        google.maps.MapTypeControlStyle.HORIZONTAL_BAR
    }
  });
  //=========================================================== 

    console.log('===================================>Map initialized successfully');
    this.map=map;
    let lati:  string | null ;
    let lngi:  string | null ;
    
    


    lati=this.authService.getLat() ;
    lngi=this.authService.getLng() ;

    console.log('====================================>coordenadas da cidade ===================================>', lati,lngi)

    
    if (lati && lngi ){
    this.map.setCenter({lat:Number(lati), lng:Number(lngi)})
    }
    this.map.addListener('zoom_changed', () => {
      if (!this.map) return;
      
      this.currentZoom = this.map.getZoom() || 0;
      console.log('Zoom changed to:', this.currentZoom);

      ///this.updateMarkersVisibility();
      this.updateVisibleMarkers();

    });

    // Adiciona o evento bounds_changed para carregamento sob demanda
    this.map.addListener('bounds_changed', () => {
      // Usar debounce para evitar atualizações frequentes
      if (this.boundsChangeTimeout) {
        clearTimeout(this.boundsChangeTimeout);
      }
      
      this.boundsChangeTimeout = setTimeout(() => {
        this.updateVisibleMarkers();
      }, 200); // Pequeno delay para evitar muitas atualizações
    });

    if (this.map) {
      this.currentZoom = this.map.getZoom() || 0;
      this.updateVisibleMarkers();


    
    
    // Criar polylines programaticamente após mapa inicializado
    //setTimeout(() => {
    //  this.createCabo1fPolylines();
    //  this.createCabo2fPolylines();
    //  this.createCabo4fPolylines();
    //  this.createCabo6fPolylines();
    //  this.createCabo8fPolylines();
    //  this.createCabo12fPolylines();
    //  this.createCabo24fPolylines();
    //  this.createCabo36fPolylines();
    //  this.createCabo48fPolylines();
    //  this.createCabo72fPolylines();

    //}, 1000);
    







      
    }

    //setTimeout(() => {
     // if (this.destinoCabos6f && this.destinoCabos6f.length > 0) {
     //   console.log('🔥 Configurando InfoWindows após inicialização do mapa');
     //   this.setupCabo6fInfoWindows();
     // }
    //}, 1000);

    


  }//================================================================================================

 
//*************************************************************************************************** */ 
// verifica se o marcador existe ====================================================================
// verifica se o marador tem uma posição geografica valida===========================================
// verifica bounds.contains(position)se o marcador está dentro dos limites visíveis do mapa atual

private updateVisibleMarkers() {

  

    if (!this.map) return;
  
    const bounds = this.map.getBounds();
    if (!bounds) return;


    
  
    console.log('Atualizando marcadores visíveis com base nos limites do mapa');


  const ceo_layer= this.authService.getceo_layer(); //----------------- Visibilidade das Caixas ----------------------------
  if (ceo_layer == '1') {
  
    // Atualizar visibilidade das caixas
    let visibleCaixasCount = 0;
    this.markerCaixas.forEach(marker => {
      if (marker) {
       const position = marker.getPosition();
       if (position && 
            bounds.contains(position) && 
            this.currentZoom >= this.ZOOM_LEVEL_CAIXAS &&
            visibleCaixasCount < this.MAX_VISIBLE_MARKERS_CEO) {
        
          if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          marker.setVisible(true);

          // Readicionar os event listeners para garantir que funcionem
          this.addMarkerEventListeners(marker, false,false, false,false);
          //console.log("ADICIONANDO LISTERNER MARKER DLBCLICK")

          visibleCaixasCount++;
        } else {
         marker.setVisible(false);
          marker.setMap(null);//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          //console.log("retirando LISTERNER MARKER DLBCLICK")
        }

        console.log(`Caixas visíveis: ${visibleCaixasCount}`)
      }
    });

   

}
  

 const cto_layer= this.authService.getcto_layer(); //----------------- Visibilidade das CTOS SEM SPLITTER ----------------------------
  if (cto_layer == '1') {
  
  // Atualizar visibilidade de CTOs
  let visibleCTOsCount = 0;
  console.log ('atualiza ctos visibles')
  this.markerCtos.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_CTOS &&
          visibleCTOsCount < this.MAX_VISIBLE_MARKERS_CTO) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visibleCTOsCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      //console.log ('caixas visiveis', visibleCTOsCount)
    }
  });

  console.log(` CTOs visíveis: ${visibleCTOsCount}`);

  }

  const ctoSP_layer= this.authService.getcto_layer(); //----------------- Visibilidade das CTOS COM SPLITTER----------------------------
  if (ctoSP_layer == '1') {
  
  // Atualizar visibilidade de CTOs
  let visibleCTOsSPCount = 0;
  console.log ('atualiza ctos visibles')
  this.markerCtosSP.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_CTOSSP &&
          visibleCTOsSPCount < this.MAX_VISIBLE_MARKERS_CTOSP) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visibleCTOsSPCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      //console.log ('caixas visiveis', visibleCTOsCount)
    }
  });

  console.log(` CTOs COM SP visíveis: ${visibleCTOsSPCount}`);

  }

  // Atualizar visibilidade de Estações  //----------------- Visibilidade de Estações ----------------------------
  let visiblePOPsCount = 0;
  console.log ('atualiza Estações visibles')
  this.markerPopsEst.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_POPS &&
          visiblePOPsCount < this.MAX_VISIBLE_MARKERS_POPs) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visiblePOPsCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      //console.log ('caixas visiveis', visibleCTOsCount)
    }
  });

  console.log(` Estações visíveis: ${visiblePOPsCount}`);
   

// Atualizar visibilidade de Clientes  //----------------- Visibilidade de Clientes ----------------------------
  let visiblePOPsCLICount = 0;
  console.log ('atualiza Clientes visibles')
  this.markerPopsCli.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_CLIENTES &&
          visiblePOPsCLICount < this.MAX_VISIBLE_MARKERS_CLIENTES) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visiblePOPsCLICount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      
    }
  });

  console.log(` Clientes visíveis: ${visiblePOPsCLICount}`);

  // Atualizar visibilidade de Clientes DESATIVADOS   //----------------- Visibilidade de Clientes DESATIVADOS ----------------------------
  let visiblePOPsCLIDesCount = 0;
  console.log ('atualiza Clientes Desabilitados visibles')
  this.markerPopsCliDes.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_CLIENTES_DISABLES &&
          visiblePOPsCLIDesCount < this.MAX_VISIBLE_MARKERS_CLIENTES_DISABLES) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visiblePOPsCLIDesCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      
    }
  });

  console.log(` Clientes Desativados visíveis: ${visiblePOPsCLIDesCount}`);


// Atualizar visibilidade de Clientes DESATIVADOS   //----------------- Visibilidade de Clientes DESATIVADOS ----------------------------
  let visiblePOPsCLIAtvCount = 0;
  console.log ('atualiza Clientes Ativos visibles')
  this.markerPopsCliAtv.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_CLIENTES_ATIVOS &&
          visiblePOPsCLIAtvCount < this.MAX_VISIBLE_MARKERS_CLIENTES_ATIVOS) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visiblePOPsCLIAtvCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      
    }
  });

  console.log(` Clientes Desativados visíveis: ${visiblePOPsCLIDesCount}`);

// Atualizar visibilidade de Condominios  //----------------- Visibilidade de Condominios ----------------------------
  let visibleCondominiosCount = 0;
  console.log ('atualiza Condominios visibles')
  this.markerCondominios.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_CONDOMINIOS &&
          visibleCondominiosCount < this.MAX_VISIBLE_MARKERS_CONDOMINIOS) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visibleCondominiosCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      //console.log ('caixas visiveis', visibleCTOsCount)
    }
  });

  console.log(` Condominios visíveis: ${visibleCondominiosCount}`);
   


  // Atualizar visibilidade de Condominios  //----------------- Visibilidade de Condominios ----------------------------
  let visibleDiosCount = 0;
  console.log ('atualiza Dios visibles')
  this.markerDios.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_DIOS &&
          visibleDiosCount < this.MAX_VISIBLE_MARKERS_DIOS) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visibleDiosCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      //console.log ('caixas visiveis', visibleCTOsCount)
    }
  });

  console.log(` Dios visíveis: ${visibleDiosCount}`);

} 








// *****************************************************************************************************




// Novo método para adicionar event listeners a um marcador
private addMarkerEventListeners(marker: google.maps.Marker, isCTO: boolean = false, isCTOSP:boolean = false, isCLI:boolean = false, isCLIAT:boolean = false, isCLIDES:boolean = false) {
  // Remover listeners existentes primeiro (caso já existam)
  google.maps.event.clearInstanceListeners(marker);
  
  
  
    // Eventos para marcadores de Caixas
    
    marker.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
      
      if (isCTO) {
      const index = this.markerCtos.indexOf(marker);
      if (index !== -1) {
        this.onMarkerClick(event, index,true,false,false,false,false);        
      }}

      else if (isCTOSP) {      
      const index = this.markerCtosSP.indexOf(marker);
      if (index !== -1) {
        this.onMarkerClick(event, index,false,true,false,false,false);
      }}
      
      else if (isCLI) {      
        const index = this.markerPopsCli.indexOf(marker);
        if (index !== -1) {
          this.onMarkerClick(event, index,false,false,true,false,false);
        }} 
        
      else if (isCLIAT) {      
          const index = this.markerPopsCliAtv.indexOf(marker);
          if (index !== -1) {
            this.onMarkerClick(event, index,false,false,false,true,false);
          }}
          
      else if (isCLIDES) {      
            const index = this.markerPopsCliDes.indexOf(marker);
            if (index !== -1) {
              this.onMarkerClick(event, index,false,false,false,false,true);
            }}        

      else {
      const index = this.markerCaixas.indexOf(marker);
      if (index !== -1) {
        this.onMarkerClick(event, index,false,false,false,false,false);} }

        
    });

    /*
    marker.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
      console.log('duplo click');
  if (isCTO) {
    const index = marker.get('index'); // índice setado na criação
    this.onMarkerClick(event, index, true);
  } else if (isCTOSP) {
    const index = marker.get('index');
    this.onMarkerClick(event, index, true); // ou false, dependendo do que CTOSP representa
  } else {
    const index = marker.get('index');
    this.onMarkerClick(event, index, false);
  }
});
  
  */
  
  // Evento dragend para ambos tipos de marcadores

  
  marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
    if (isCTO) {
      const index = this.markerCtos.indexOf(marker);
      if (index !== -1) {
        this.onMarkerDragEnd(event, index, true);
      }
    } else if(isCTOSP) {
      const index = this.markerCtosSP.indexOf(marker);
      if (index !== -1) {
        this.onMarkerDragEnd(event, index, false);
      }}
      else {
      const index = this.markerCaixas.indexOf(marker);
      if (index !== -1) {
        this.onMarkerDragEnd(event, index, false);
      }
    }
  });

  
}



  private checkGoogleMapsAPI() {
    if ((window as any).google && (window as any).google.maps) {
      console.log('Google Maps API loaded successfully');
    } else {
      console.warn('Google Maps API not loaded yet. Waiting...');
      setTimeout(() => this.checkGoogleMapsAPI(), 1000);
    }
  }

  onMarkerClick(event: google.maps.MapMouseEvent, index: number, isCTO: boolean = false, isCTOSP: boolean=false, isCLI: boolean=false, isCLIAT: boolean=false, isCLIDES: boolean=false) {
    if (isCTO) {
      if (this.destinoCTO[index]) {
        console.log('CTO clicada', this.destinoCTO[index].numero);
        this.authService.setIDmetaCaixa(this.destinoCTO[index].id_meta)//<---escrevo idmeta da cto no storage
        this.isGoJSModalOpen = true;
        this.cdr.detectChanges();
      }
    }else if (isCTOSP) {
          if (this.destinoCTOSP[index]) {
        console.log('CTO SP clicada', this.destinoCTOSP[index].numero);
        this.authService.setIDmetaCaixa(this.destinoCTOSP[index].id_meta)//<---escrevo idmeta da cto no storage
        this.isGoJSModalOpen = true;
        this.cdr.detectChanges();
    }

    }else if (isCLI) {
      if (this.destinoPopsCli[index]) {
    console.log('Cliente clicado', this.destinoPopsCli[index].sigla);
    this.openPopInfoModal(this.destinoPopsCli[index].id_meta)
    this.cdr.detectChanges();

  }

  }else if (isCLIAT) {
    if (this.destinoPopsCliAtv[index]) {
  console.log('Cliente Ativo clicado', this.destinoPopsCliAtv[index].sigla);
  this.openPopInfoModal(this.destinoPopsCliAtv[index].id_meta)
  this.cdr.detectChanges();

  }


  }else if (isCLIDES) {
   if (this.destinoPopsCliDes[index]) {
  console.log('Cliente Desativado clicado', this.destinoPopsCliDes[index].sigla);
  this.openPopInfoModal(this.destinoPopsCliDes[index].id_meta)
  this.cdr.detectChanges();
  }  
    //this.authService.setIDmetaCliente(this.destinoPopsCli[index].id_meta)//<---escrevo idmeta da cto no storage
    //this.isGoJSModalOpen = true;
    //this.cdr.detectChanges();
  

  } else {
      if (this.destino[index]) {
        console.log('caixa clicada', this.destino[index].numero);
        this.authService.setIDmetaCaixa(this.destino[index].id_meta)//<---escrevo idmeta da caixa no storage
        this.isGoJSModalOpen = true;
        this.cdr.detectChanges();
  }
  }
}
  



openPopInfoModal(id_meta: number|undefined) {
  const dialogRef = this.dialog.open(PopInfoModalComponent, {
    width: '600px',
    data: { id_meta }
  });

}

openVisualizaDioModal(id_meta: number, capacity?: number) {
  const dialogRef = this.dialog.open(VisualizaDioComponent, {
    width: '80vw', // muda o tamanho do modal
    maxWidth: '1000px',
    height: '65vh', // muda o tamanho do modal
    data: { 
      id_meta,
      capacity,
      config: {
        title: 'Visualiza DIO',
        isEditable: true,
        showAllFields: false
      }
    }
  });
}
  

  onCaixaInternaClose() {
    console.log('Evento de fechamento recebido no GoogleMapsComponent');
    this.caixaSelecionada = null;
    console.log('caixaSelecionada definida como null');
    this.cdr.detectChanges();
  }


// Métodos para controlar o modal GoJS
openGoJSModal() {
  this.isGoJSModalOpen = true;
}

closeGoJSModal() {
  this.isGoJSModalOpen = false;
}


// Método para criar polylines 1f programaticamente
  private createCabo1fPolylines(): void {
    this.createCaboPolylines('1f', this.destinoCabos1f, this.polylinePaths1f,  this.polylines1f, this.infoWindows1f, this.polylineOptions1f);
  }

   //Método para criar polylines 2f programaticamente
 private createCabo2fPolylines(): void {
    this.createCaboPolylines('2f', this.destinoCabos2f, this.polylinePaths2f,  this.polylines2f, this.infoWindows2f, this.polylineOptions2f);
  }

  // Método para criar polylines 4f programaticamente
  private createCabo4fPolylines(): void {
    this.createCaboPolylines('4f', this.destinoCabos4f, this.polylinePaths4f,  this.polylines4f, this.infoWindows4f, this.polylineOptions4f);
  }

  // Método para criar polylines 6f programaticamente com clique simples e duplo clique
  private createCabo6fPolylines(): void {
    this.createCaboPolylines('6f', this.destinoCabos6f, this.polylinePaths6f,  this.polylines6f, this.infoWindows6f, this.polylineOptions6f);
  }

  // Método para criar polylines 8f programaticamente
  private createCabo8fPolylines(): void {
    this.createCaboPolylines('8f', this.destinoCabos8f, this.polylinePaths8f,  this.polylines8f, this.infoWindows8f, this.polylineOptions8f);
  }

   //Método para criar polylines 12f programaticamente
  private createCabo12fPolylines(): void {
    this.createCaboPolylines('12f', this.destinoCabos12f, this.polylinePaths12f,  this.polylines12f, this.infoWindows12f, this.polylineOptions12f);
  }

  // Método para criar polylines 24f programaticamente
  private createCabo24fPolylines(): void {
    this.createCaboPolylines('24f', this.destinoCabos24f, this.polylinePaths24f,  this.polylines24f, this.infoWindows24f, this.polylineOptions24f);
  }

  // Método para criar polylines 36f programaticamente
  private createCabo36fPolylines(): void {
    this.createCaboPolylines('36f', this.destinoCabos36f, this.polylinePaths36f,  this.polylines36f, this.infoWindows36f, this.polylineOptions36f);
  }

  // Método para criar polylines 48f programaticamente
  private createCabo48fPolylines(): void {
    this.createCaboPolylines('48f', this.destinoCabos48f, this.polylinePaths48f, this.polylines48f, this.infoWindows48f, this.polylineOptions48f);
  }

  // Método para criar polylines 72f programaticamente
  private createCabo72fPolylines(): void {
    this.createCaboPolylines('72f', this.destinoCabos72f, this.polylinePaths72f,   this.polylines72f, this.infoWindows72f, this.polylineOptions72f);
  } 

  // Método para criar polylines 72f programaticamente
  private createCabo144fPolylines(): void {
    this.createCaboPolylines('144f', this.destinoCabos144f, this.polylinePaths144f, this.polylines144f, this.infoWindows144f, this.polylineOptions144f);
  } 

 

  //=============================================================================================================================
// Método genérico para criar polylines com clique simples e duplo clique
  private createCaboPolylines(
    tipoFibra: string,
    cabos: any[],
    paths: google.maps.LatLngLiteral[][],
    polylinesArray: google.maps.Polyline[],
    infoWindowsArray: google.maps.InfoWindow[],
    options: google.maps.PolylineOptions
  ): void {
    if (!this.map) {
      console.log('Mapa não inicializado ainda, aguardando...');
      return;
    }

    // Limpar polylines e InfoWindows anteriores
    console.log('Limpando', polylinesArray.length, `polylines ${tipoFibra} anteriores...`);
    polylinesArray.forEach(polyline => {
      google.maps.event.clearInstanceListeners(polyline);
      polyline.setMap(null);
    });
    polylinesArray.length = 0;

    // Limpar InfoWindows anteriores
    infoWindowsArray.forEach(infoWindow => {
      infoWindow.close();
    });
    infoWindowsArray.length = 0;

    if (!cabos || cabos.length === 0 || !paths || paths.length === 0) {
      console.log(`Dados dos cabos ${tipoFibra} não disponíveis ainda`);
      return;
    }

    console.log('Criando', paths.length, `polylines de cabos ${tipoFibra} com clique simples e duplo`);

    // Criar novas polylines com eventos de clique simples e duplo clique
    paths.forEach((path, index) => {
      if (path.length > 0) {
        const polyline = new google.maps.Polyline({
          path: path,
          ...options,
          map: this.map
        });

        const cabo = cabos[index];
        
        // Criar InfoWindow para este cabo
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h4 style="margin: 0 0 8px 0; color: #333;">Cabo ${tipoFibra.toUpperCase()}</h4>
              <p style="margin: 4px 0;"><strong>ID:</strong> ${cabo.id_meta || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Fibras:</strong> ${tipoFibra.replace('f', '')}</p>
              <p style="margin: 4px 0;"><strong>Label:</strong> ${cabo.Label_cabo}</p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">Duplo-clique para abrir diagrama</p>
              
            </div>
          `
        });

        // Variáveis para controlar cliques
        let clickTimeout: any;

        // Adicionar evento de clique (simples e duplo)
        polyline.addListener('click', (event: google.maps.MapMouseEvent) => {
          // Limpar timeout anterior se existir
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
          }

          // Definir timeout para clique simples
          clickTimeout = setTimeout(() => {
            // Clique simples - mostrar InfoWindow
            console.log(`Clique simples detectado no cabo ${tipoFibra}:`, cabo.id_meta);
            if (event.latLng) {
              infoWindow.setPosition(event.latLng);
              infoWindow.open(this.map);
            }
          }, 300); // Delay de 300ms para distinguir de duplo clique
        });

        // Adicionar evento de duplo clique
        polyline.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
          console.log(`Double-click detectado no cabo ${tipoFibra}:`, cabo.id_meta);
          
          // Cancelar clique simples se estiver pendente
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
          }
          
          // Fechar InfoWindow se estiver aberto
          infoWindow.close();
          
          // Abrir modal GoJS
          const idMetaString = cabo.id_meta?.toString() || '';
          this.authService.setIDmetaCaixa(idMetaString);
          this.isGoJSModalOpen = true;
          this.cdr.detectChanges();
        });

        // Adicionar evento para fechar InfoWindow quando clicar fora
        this.map?.addListener('click', () => {
          infoWindow.close();
        });

        polylinesArray.push(polyline);
        infoWindowsArray.push(infoWindow);
      }
    });

    console.log(`Polylines de cabos ${tipoFibra} criadas:`, polylinesArray.length);
    console.log(`InfoWindows de cabos ${tipoFibra} criados:`, infoWindowsArray.length);
  }

// BOTOES DE PESQUISA NO MAPA==================================================================================================
// Novos métodos para os botões de pesquisa
  pesquisarCaixa(dadosCaixa?: any): void {
    console.log('Pesquisar Caixa executado no GoogleMapsComponent');
    console.log('Dados recebidos - dadosCaixa:', dadosCaixa);
    console.log('Tipo de dadosCaixa:', typeof dadosCaixa);
    console.log('dadosCaixa é undefined?', dadosCaixa === undefined);
    
    if (dadosCaixa && dadosCaixa.LAT && dadosCaixa.LONGI) {
    
      
      // Centralizar mapa na localização da caixa com zoom máximo

      //this.centerMapOnLocation(dadosCaixa.LAT,dadosCaixa.LONGI)
      this.center = { 
        lat: parseFloat(dadosCaixa.LAT), 
        lng: parseFloat(dadosCaixa.LONGI) 
      };
      this.zoom = 20;
      
      console.log(`Mapa centralizado na caixa ${dadosCaixa.NUMERO}: ${dadosCaixa.LAT}, ${dadosCaixa.LONGI}`);
    } else {
      console.log('Dados de caixa incompletos ou não fornecidos');
      console.log('Funcionalidade de Pesquisa Caixa será implementada');
    }
  }

  pesquisarCliente(dadosCliente?: any): void {
    console.log('Pesquisar Cliente executado no GoogleMapsComponent');
    console.log('Dados recebidos - dadosCliente:', dadosCliente);
    console.log('Tipo de dadosCliente:', typeof dadosCliente);
    console.log('dadosCliente é undefined?', dadosCliente === undefined);
    
    if (dadosCliente && dadosCliente.LAT && dadosCliente.LONGI) {
    
      
      // Centralizar mapa na localização da caixa com zoom máximo

      //this.centerMapOnLocation(dadosCaixa.LAT,dadosCaixa.LONGI)
      this.center = { 
        lat: parseFloat(dadosCliente.LAT), 
        lng: parseFloat(dadosCliente.LNG) 
      };
      this.zoom = 20;
      
      console.log(`Mapa centralizado no Cliente ${dadosCliente.SIGLA}: ${dadosCliente.LAT}, ${dadosCliente.LNG}`);
    } else {
      console.log('Dados do Cliente incompletos ou não fornecidos');
      console.log('Funcionalidade de Pesquisa Cliente será implementada');
    }
  }

  pesquisarEstacao(): void {
    console.log('Pesquisar Estação clicado');
    // Implementar lógica de pesquisa de estação
    alert('Funcionalidade de Pesquisa Estação será implementada');
  }

  pesquisarLogradouro(): void {
    console.log('Pesquisar Logradouro clicado');
    // Implementar lógica de pesquisa de logradouro
    alert('Funcionalidade de Pesquisa Logradouro será implementada');
  }

  verificarViabilidade(): void {
    console.log('Verificar Viabilidade clicado');
    // Implementar lógica de verificação de viabilidade
    alert('Funcionalidade de Viabilidade será implementada');
  }



    
   // Método para centralizar o mapa na caixa selecionada
  centralizarNaCaixa(caixaData: CaixaData): void {
    if (caixaData.LAT && caixaData.LONGI && this.map) {
      const center = new google.maps.LatLng(caixaData.LAT, caixaData.LONGI);
      this.map.setCenter(center);
      this.map.setZoom(18); // Zoom próximo para visualizar a caixa
      console.log(`Mapa centralizado na caixa ${caixaData.NUMERO} - Coordenadas: ${caixaData.LAT}, ${caixaData.LONGI}`);
    } 
    
  }

   // Método para centralizar o mapa no cliente selecionado
  centralizarNoCliente(clienteData: ClienteData): void {
    if (clienteData.LAT && clienteData.LNG && this.map) {
      const center = new google.maps.LatLng(clienteData.LAT, clienteData.LNG);
      this.map.setCenter(center);
      this.map.setZoom(20); // Zoom próximo para visualizar a caixa
      console.log(`Mapa centralizado na caixa ${clienteData.SIGLA} - Coordenadas: ${clienteData.LAT}, ${clienteData.LNG}`);
    } 
    
  }







}