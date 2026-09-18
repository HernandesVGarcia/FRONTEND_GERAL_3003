import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HeartbeatService {
  private apiUrl = environment.apiUrlAbsolute || 'http://localhost:3002';
  private heartbeatInterval: any;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 segundos

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  startHeartbeat(): void {
    console.log('🔄 Iniciando heartbeat...');
    
    // Limpar qualquer heartbeat anterior
    this.stopHeartbeat();
    
    // Enviar heartbeat imediatamente
    this.sendHeartbeat();
    
    // Configurar heartbeat automático
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, this.HEARTBEAT_INTERVAL);
  }

  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      console.log('⏹️ Parando heartbeat...');
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private sendHeartbeat(): void {
    const token = this.authService.getToken();
    
    if (!token) {
      console.log('❌ Token não encontrado, parando heartbeat');
      this.stopHeartbeat();
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.post(`${this.apiUrl}/heartbeat`, {}, { headers }).subscribe({
      next: (response) => {
        console.log('💓 Heartbeat enviado:', response);
      },
      error: (error) => {
        console.error('❌ Erro no heartbeat:', error);
        
        // Se token inválido, encerrar sessão e limpar storage
        if (error.status === 401) {
          console.log('Token inválido, encerrando sessão');
          this.authService.clearToken();
          this.stopHeartbeat();
          void this.router.navigate(['/login']);
        }
      }
    });
  }
}
