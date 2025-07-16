import { Injectable } from '@angular/core';
import { HeartbeatService } from './heartbeat.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppLifecycleService {

  constructor(
    private heartbeatService: HeartbeatService,
    private authService: AuthService
  ) {
    this.setupLifecycleEvents();
  }

  private setupLifecycleEvents(): void {
    // Verificar se usuário já está logado ao iniciar app
    if (this.authService.getToken()) {
      console.log('🔄 Usuário já logado, iniciando heartbeat...');
      this.heartbeatService.startHeartbeat();
    }

    // Detectar quando usuário fecha aba/navegador
    window.addEventListener('beforeunload', () => {
      console.log('🔄 Usuário fechando aba/navegador, parando heartbeat...');
      this.heartbeatService.stopHeartbeat();
    });

    // Detectar quando aba perde/ganha foco
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('🔄 Aba perdeu foco, mantendo heartbeat...');
        // Manter heartbeat mesmo quando aba não está visível
      } else {
        console.log('🔄 Aba ganhou foco, garantindo heartbeat...');
        if (this.authService.getToken()) {
          this.heartbeatService.startHeartbeat();
        }
      }
    });
  }

  startUserSession(): void {
    console.log('🔄 Iniciando sessão do usuário...');
    this.heartbeatService.startHeartbeat();
  }

  endUserSession(): void {
    console.log('🔄 Encerrando sessão do usuário...');
    this.heartbeatService.stopHeartbeat();
  }
}
