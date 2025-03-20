import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly DEFAULT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjoxMiwiZW1haWwiOiJzdXBvcnRlQGZpYmVyd29ya3MuY29tLmJyIiwiaWF0IjoxNzQyNTAxMjM5LCJleHAiOjE3NzQwMzcyMzl9.aohk_Mck3DMaSaxmXWuE9q1r1l79sHO1cJ2zEKiHvYs';

  constructor() {
    // Inicializar o token no localStorage
    this.setToken(this.DEFAULT_TOKEN);
  }

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
    this.setToken(this.DEFAULT_TOKEN);
  }
}
