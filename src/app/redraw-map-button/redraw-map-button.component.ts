import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../servico/auth.service';

@Component({
  selector: 'app-redraw-map-button',
  standalone: true,
  imports: [MatButtonModule, MatTooltipModule],
  template: `
    <button
      mat-raised-button
      type="button"
      class="toolbar-glass-btn toolbar-glass-btn--blue map-corner-btn"
      (click)="onRedraw()"
      aria-label="Recarregar camadas da cidade no mapa"
      matTooltipPosition="above"
      matTooltip="Recarregar camadas no mapa">
      Redraw
    </button>
  `,
  styleUrl: './redraw-map-button.component.css',
})
export class RedrawMapButtonComponent {
  constructor(private auth: AuthService) {}

  onRedraw(): void {
    if (!this.auth.getIdCity()) {
      window.alert('Selecione a cidade antes de recarregar o mapa.');
      return;
    }
    window.dispatchEvent(new CustomEvent('reloadMapCaixas'));
    window.dispatchEvent(new CustomEvent('reloadMapCabos'));
    window.dispatchEvent(new CustomEvent('reloadMapPopsEst'));
    window.dispatchEvent(new CustomEvent('reloadMapDios'));
    window.dispatchEvent(new CustomEvent('reloadMapPoligonos'));
    window.dispatchEvent(new CustomEvent('reloadMapClientes'));
    window.dispatchEvent(new CustomEvent('reloadMapAnotacoes'));
    window.dispatchEvent(new CustomEvent('reloadMapCondominios'));
    window.dispatchEvent(new CustomEvent('reloadMapSegmentos'));
  }
}
