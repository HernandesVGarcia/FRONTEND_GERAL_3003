import { Component } from '@angular/core';
import { AppLifecycleService } from '../servico/app-lifecycle.service';
import { AuthService } from '../servico/auth.service';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  template: `
    <button
      type="button"
      class="logout-btn"
      (click)="onLogout()"
      aria-label="Sair do sistema"
      [title]="usuario ? 'Sair (' + usuario + ')' : 'Sair'">
      Logout
    </button>
  `,
  styleUrl: './logout-button.component.css',
})
export class LogoutButtonComponent {
  usuario: string | null = null;

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
