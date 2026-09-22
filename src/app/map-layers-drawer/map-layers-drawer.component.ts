import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subscription } from 'rxjs';
import {
  MAP_LAYER_OPTIONS,
  MapLayerId,
  MapLayerVisibilityService,
} from '../servico/map-layer-visibility.service';

@Component({
  selector: 'app-map-layers-drawer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCheckboxModule],
  templateUrl: './map-layers-drawer.component.html',
  styleUrls: ['./map-layers-drawer.component.css'],
})
export class MapLayersDrawerComponent implements OnInit, OnDestroy {
  panelOpen = false;
  layerOptions = MAP_LAYER_OPTIONS;
  selectedLayers: MapLayerId[] = [];

  private layersSub?: Subscription;

  constructor(private layerVisibilityService: MapLayerVisibilityService) {}

  ngOnInit(): void {
    this.syncFromService();
    this.layersSub = this.layerVisibilityService.layersChanged$.subscribe(() => {
      this.syncFromService();
    });
  }

  ngOnDestroy(): void {
    this.layersSub?.unsubscribe();
  }

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
    if (this.panelOpen) {
      this.syncFromService();
    }
  }

  closePanel(): void {
    this.panelOpen = false;
  }

  isLayerSelected(id: MapLayerId): boolean {
    return this.selectedLayers.includes(id);
  }

  onLayerChange(id: MapLayerId, checked: boolean): void {
    let next = [...this.selectedLayers];
    if (checked) {
      if (!next.includes(id)) {
        next.push(id);
      }
    } else {
      next = next.filter((layerId) => layerId !== id);
    }
    this.selectedLayers = next;
    this.layerVisibilityService.setFromSelection(next);
  }

  private syncFromService(): void {
    this.selectedLayers = this.layerVisibilityService.getVisibleLayerIds();
  }
}
