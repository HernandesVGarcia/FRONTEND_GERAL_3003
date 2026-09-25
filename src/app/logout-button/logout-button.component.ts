import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppLifecycleService } from '../servico/app-lifecycle.service';
import { AuthService } from '../servico/auth.service';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [MatButtonModule, MatTooltipModule],
  template: `
    <button
      mat-raised-button
      type="button"
      class="toolbar-glass-btn toolbar-glass-btn--blue logout-btn"
      (click)="onLogout()"
      aria-label="Sair do sistema"
      matTooltipPosition="above"
      [matTooltip]="tooltipText">
      Logout
    </button>
  `,
  styleUrl: './logout-button.component.css',
})
export class LogoutButtonComponent {
  usuario: string | null = null;

  get tooltipText(): string {
    return this.usuario ? `Sair (${this.usuario})` : 'Sair do sistema';
  }

  constructor(
    private appLifecycle: AppLifecycleService,
    private auth: AuthService,
  ) {
    this.usuario = this.auth.getUsuario();
  }

  onLogout(): void {
    this.appLifecycle.logout();
  }
}
