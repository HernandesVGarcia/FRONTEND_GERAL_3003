import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { Cabos6f } from '../modelo/Cabos6f';
import { Cabos8f } from '../modelo/Cabos8f';
import { Cabos12f } from '../modelo/Cabos12f';
import { Cabos24f } from '../modelo/Cabos24f';
import { Cabos36f } from '../modelo/Cabos36f';
import { Cabos48f } from '../modelo/Cabos48f';
import { Cabos72f } from '../modelo/Cabos72f';
import { Caixa } from '../modelo/Caixa';
import { Cto } from '../modelo/Cto';
//import { CaixaInternaComponent } from '../caixa-interna/caixa-interna.component';
import { ChangeDetectorRef } from '@angular/core'; /// ============novo
import { GoJSDemoComponent } from '../gojs-demo/gojs-demo.component';
import { AuthService } from '../servico/auth.service';

@Component({
  selector: 'app-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.css'],
  standalone: true,
  imports: [CommonModule, GoogleMapsModule,GoJSDemoComponent],
})
export class GoogleMapsComponent implements OnInit, OnChanges {
  @Input() destino: Caixa[] = [];
  @Input() destinoCTO: Cto[] = [];
  @Input() destinoCabos6f: Cabos6f[] = [];
  @Input() destinoCabos8f: Cabos8f[] = [];
  @Input() destinoCabos12f: Cabos12f[] = [];
  @Input() destinoCabos24f: Cabos24f[] = [];
  @Input() destinoCabos36f: Cabos36f[] = [];
  @Input() destinoCabos48f: Cabos48f[] = [];
  @Input() destinoCabos72f: Cabos72f[] = [];

  isGoJSModalOpen = false;

  constructor(private cdr: ChangeDetectorRef, private authService : AuthService) {};

  caixaSelecionada: string | null = null;

  title: string = "Fiberworks";
  center: google.maps.LatLngLiteral = { lat: -23.326803, lng: -52.114882 };
  zoom = 15;
  mapID = "My Project Angular";

  markerCaixas: google.maps.Marker[] = [];
  markerCtos:google.maps.Marker[]=[];
  //markerCtos: google.maps.LatLngLiteral[] = [];
  markerOptions: google.maps.MarkerOptions[] = [];
  markerOptionsCTO: google.maps.MarkerOptions[] = [];
  polylinePaths6f: google.maps.LatLngLiteral[][] = [];
  polylinePaths8f: google.maps.LatLngLiteral[][] = [];
  polylinePaths12f: google.maps.LatLngLiteral[][] = [];
  polylinePaths24f: google.maps.LatLngLiteral[][] = [];
  polylinePaths36f: google.maps.LatLngLiteral[][] = [];
  polylinePaths48f: google.maps.LatLngLiteral[][] = [];
  polylinePaths72f: google.maps.LatLngLiteral[][] = [];


private ZOOM_LEVEL_CAIXAS = 11; // Caixas CEO visíveis em zoom >= 14
private ZOOM_LEVEL_CTOS = 15;   // CTOs visíveis em zoom >= 16

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
// **********************************************************************************************inserido




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

//isMapReady: any;

  ngOnInit() {
    console.log('GoogleMapsComponent initialized');
    this.checkGoogleMapsAPI();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges detectou mudança em destino:', changes['destino']);

    console.log('CaixaInterna - ngOnChanges recebeu:', changes);
  if (changes['numeroCaixa']) {
    console.log('Número da caixa alterado para');
  }

    
    if (changes['destino'] && changes['destino'].currentValue) {
      console.log('Atualizando marcadores de caixas ',this.destino);
      this.updateMarkers();
    }
      
    if (changes['destinoCTO'] && changes['destinoCTO'].currentValue) {
      console.log('Atualizando marcadores de CTOs',this.destinoCTO);
      this.updateMarkersCTO();
    }

    if (changes['destinoCabos6f'] && changes['destinoCabos6f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 6f ',this.destinoCabos6f);
      this.updatePolylinesCabos6f();
    }

    if (changes['destinoCabos8f'] && changes['destinoCabos8f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 8f ',this.destinoCabos8f);
      this.updatePolylinesCabos8f();
    }

    if (changes['destinoCabos12f'] && changes['destinoCabos12f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 12f ',this.destinoCabos12f);
      this.updatePolylinesCabos12f();
    }

    if (changes['destinoCabos24f'] && changes['destinoCabos24f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 24f ',this.destinoCabos24f);
      this.updatePolylinesCabos24f();
    }    

    if (changes['destinoCabos36f'] && changes['destinoCabos36f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 36f ',this.destinoCabos36f);
      this.updatePolylinesCabos36f();
    } 
    
    if (changes['destinoCabos48f'] && changes['destinoCabos48f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 48f ',this.destinoCabos48f);
      this.updatePolylinesCabos48f();
    }   

    if (changes['destinoCabos72f'] && changes['destinoCabos72f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 72f ',this.destinoCabos72f);
      this.updatePolylinesCabos72f();
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


    // =============================== função para carregar o marcadores Caixas na tela =========
    private updateMarkers() {
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
              url: '/assets/caixa_plp_15.png',
              labelOrigin: new google.maps.Point(70, 10),
              scaledSize: new google.maps.Size(15, 30)
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

          this.addMarkerEventListeners(marker, false);
          
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
          scaledSize: new google.maps.Size(10, 15)
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

      this.addMarkerEventListeners(marker, true);
      
      this.markerCtos.push(marker);
    });
      
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

    console.log('Map initialized successfully');
    this.map=map;

  
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
    }
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
        this.addMarkerEventListeners(marker, false);
        //console.log("ADICIONANDO LISTERNER MARKER DLBCLICK")

        visibleCaixasCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        //console.log("retirando LISTERNER MARKER DLBCLICK")
      }
    }
  });

  
  
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



  
  console.log(`Caixas visíveis: ${visibleCaixasCount}, CTOs visíveis: ${visibleCTOsCount}`);

} 
// *****************************************************************************************************




// Novo método para adicionar event listeners a um marcador
private addMarkerEventListeners(marker: google.maps.Marker, isCTO: boolean = false) {
  // Remover listeners existentes primeiro (caso já existam)
  google.maps.event.clearInstanceListeners(marker);
  
  
  
    // Eventos para marcadores de Caixas
    
    marker.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
      if (isCTO) {
      const index = this.markerCtos.indexOf(marker);
      if (index !== -1) {
        this.onMarkerClick(event, index,true);}}

      const index = this.markerCaixas.indexOf(marker);
      if (index !== -1) {
        this.onMarkerClick(event, index,false);}
    });
  
  
  
  // Evento dragend para ambos tipos de marcadores

  
  marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
    if (isCTO) {
      const index = this.markerCtos.indexOf(marker);
      if (index !== -1) {
        this.onMarkerDragEnd(event, index, true);
      }
    } else {
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

  onMarkerClick(event: google.maps.MapMouseEvent, index: number, isCTO: boolean = false) {
    if (isCTO) {
      if (this.destinoCTO[index]) {
        console.log('CTO clicada', this.destinoCTO[index].numero);
        this.authService.setIDmetaCaixa(this.destinoCTO[index].id_meta)//<---escrevo idmeta da cto no storage
        this.isGoJSModalOpen = true;
        this.cdr.detectChanges();
      }
    } else {
      if (this.destino[index]) {
        console.log('caixa clicada', this.destino[index].numero);
        this.authService.setIDmetaCaixa(this.destino[index].id_meta)//<---escrevo idmeta da caixa no storage
        this.isGoJSModalOpen = true;
        this.cdr.detectChanges();
      }
  }
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



}