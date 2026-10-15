import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RackPreviewModalComponent } from '../rack-preview-modal/rack-preview-modal.component';

@Component({
  selector: 'app-rack-preview-button',
  standalone: true,
  imports: [MatButtonModule, MatTooltipModule, MatDialogModule],
  template: `
    <button
      mat-raised-button
      type="button"
      class="toolbar-glass-btn toolbar-glass-btn--blue map-corner-btn"
      (click)="openPreview()"
      aria-label="Visualizar rack 42U"
      matTooltipPosition="above"
      matTooltip="Preview rack 42U (GoJS)">
      Rack
    </button>
  `,
  styleUrl: './rack-preview-button.component.css',
})
export class RackPreviewButtonComponent {
  constructor(private dialog: MatDialog) {}

  openPreview(): void {
    this.dialog.open(RackPreviewModalComponent, {
      width: '560px',
      maxWidth: '96vw',
      height: '92vh',
      maxHeight: '920px',
      panelClass: 'rack-preview-dialog-panel',
      autoFocus: false,
    });
  }
}
