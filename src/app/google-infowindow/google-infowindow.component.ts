import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-google-infowindow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './google-infowindow.component.html',
  styleUrls: ['./google-infowindow.component.css']
})
export class GoogleInfoWindowComponent implements OnInit, OnDestroy {
  @Input() map?: google.maps.Map;
  @Input() position?: google.maps.LatLngLiteral;
  @Input() title: string = '';
  @Input() content: string = '';
  @Input() caboId: string = '';
  @Input() caboType: string = '';
  @Input() isVisible: boolean = false;
  @Input() zoomThreshold: number = 18;
  @Input() currentZoom: number = 0;
  
  @Output() onLongPress = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();

  private infoWindow?: google.maps.InfoWindow;
  private marker?: google.maps.Marker;

  ngOnInit(): void {
    this.setupInfoWindow();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private setupInfoWindow(): void {
    if (!this.map || !this.position) return;

    // Criar marker invisível para posicionar o InfoWindow
    this.marker = new google.maps.Marker({
      position: this.position,
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 0,
        strokeOpacity: 0,
        fillOpacity: 0
      },
      visible: this.shouldShowInfoWindow()
    });

    // Criar InfoWindow
    this.infoWindow = new google.maps.InfoWindow({
      content: this.getInfoWindowContent(),
      position: this.position
    });

    // Adicionar listeners para long press
    this.addLongPressListeners();
  }

  private getInfoWindowContent(): string {
    return `
      <div style="padding: 8px; font-family: Arial, sans-serif;">
        <h4 style="margin: 0 0 5px 0; color: #333;">${this.title}</h4>
        <p style="margin: 0; font-size: 12px; color: #666;">${this.content}</p>
        <small style="color: #999;">Toque e segure para abrir detalhes</small>
      </div>
    `;
  }

  private addLongPressListeners(): void {
    if (!this.marker) return;

    let pressTimer: any;
    let isLongPress = false;

    this.marker.addListener('mousedown', () => {
      isLongPress = false;
      pressTimer = setTimeout(() => {
        isLongPress = true;
        this.onLongPress.emit({
          caboId: this.caboId,
          caboType: this.caboType,
          position: this.position
        });
      }, 600);
    });

    this.marker.addListener('mouseup', () => {
      clearTimeout(pressTimer);
    });

    this.marker.addListener('click', () => {
      if (this.infoWindow && this.shouldShowInfoWindow()) {
        this.infoWindow.open(this.map, this.marker);
      }
    });
  }

  private shouldShowInfoWindow(): boolean {
    return this.isVisible && this.currentZoom >= this.zoomThreshold;
  }

  public updateVisibility(): void {
    const shouldShow = this.shouldShowInfoWindow();
    
    if (this.marker) {
      this.marker.setVisible(shouldShow);
    }
    
    if (!shouldShow && this.infoWindow) {
      this.infoWindow.close();
    }
  }

  public updatePosition(newPosition: google.maps.LatLngLiteral): void {
    this.position = newPosition;
    
    if (this.marker) {
      this.marker.setPosition(newPosition);
    }
    
    if (this.infoWindow) {
      this.infoWindow.setPosition(newPosition);
    }
  }

  public openInfoWindow(): void {
    if (this.infoWindow && this.marker && this.shouldShowInfoWindow()) {
      this.infoWindow.open(this.map, this.marker);
    }
  }

  public closeInfoWindow(): void {
    if (this.infoWindow) {
      this.infoWindow.close();
      this.onClose.emit();
    }
  }

  private cleanup(): void {
    if (this.infoWindow) {
      this.infoWindow.close();
    }
    
    if (this.marker) {
      this.marker.setMap(null);
    }
  }
}

