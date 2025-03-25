import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';

  constructor() {}

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
  
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Verificação básica do formato do token (3 partes separadas por ponto)
    const parts = token.split('.');
    return parts.length === 3;
  }
  
  refreshToken(): void {
    // Mantém a função, mas não define um token padrão
    // Os serviços que utilizam essa função agora devem
    // se certificar que há um token válido disponível
    const token = this.getToken();
    if (token) {
      // Redefine o mesmo token
      this.setToken(token);
    }
  }
}
