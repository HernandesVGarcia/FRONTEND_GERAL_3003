import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HeartbeatService } from './heartbeat.service';
import { AuthService } from './auth.service';
import { InsertLogService } from './insert-log.service';

@Injectable({
  providedIn: 'root'
})
export class AppLifecycleService {

  constructor(
    private heartbeatService: HeartbeatService,
    private authService: AuthService,
    private router: Router,
    private insertLogService: InsertLogService,
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

  /** Limpa localStorage auth_* e redireciona para login. */
  logout(): void {
    this.endUserSession();

    const idUser = this.authService.getIdUser();
    if (idUser && this.authService.getToken()) {
      console.log('🔄 Inserindo log de logout...');
      this.insertLogService.inserirLog({
        id_usuario: idUser,
        id_evento: 2,
        id_city: this.authService.getIdCity(),
        id_meta_objeto: 0,
        descricao: 'Logout bem-sucedido',
        VERSION: 'Fiberworks WEB 1.0.0',
      }).subscribe({
        next: (logResponse) => {
          console.log('✅ Log de logout inserido com sucesso:', logResponse);
        },
        error: (error) => {
          console.error('❌ Erro ao inserir log de logout:', error);
        },
      });
    }

    this.authService.clearToken();
    void this.router.navigate(['/login']);
  }
}
