import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly POLO_KEY = 'auth_polo';
  private readonly IDCIDADE_KEY = 'auth_idcidade';

  constructor() {}

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
    return localStorage.getItem(this.POLO_KEY);
  }

  setIdCity(idcity: number | null): void {
    if (idcity) {
      localStorage.setItem(this.IDCIDADE_KEY, idcity.toString());
    } else {
      localStorage.removeItem(this.IDCIDADE_KEY);
    }
  }

  getIdCity(): string | null {
    return localStorage.getItem(this.IDCIDADE_KEY);
  }

  setPolo(polo: string | null): void {
    if (polo) {
      localStorage.setItem(this.POLO_KEY, polo);
    } else {
      localStorage.removeItem(this.POLO_KEY);
    }
  }

  getPolo(): string | null {
    return localStorage.getItem(this.POLO_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.POLO_KEY); // Também limpar o polo quando sair
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
