import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private readonly TOKEN_KEY = 'jwt_token';
    // Token atualizado com o valor fornecido pelo usuário
    private readonly DEFAULT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjoxMiwiZW1haWwiOiJzdXBvcnRlQGZpYmVyd29ya3MuY29tLmJyIiwiaWF0IjoxNzQyNDE3NjkxLCJleHAiOjE3NDI0MjEyOTF9.2QIqI_fl75tIvm7iQXSnQpj9p0IBUCCzDtPnmfTSHl8';
  
    constructor() {
      console.log('AuthService iniciado');
      // Forçar a atualização do token para o valor padrão atualizado
      this.setToken(this.DEFAULT_TOKEN);
      console.log('Token atualizado para:', this.DEFAULT_TOKEN);
      
      // Verifica se o token foi realmente salvo
      const storedToken = this.getToken();
      console.log('Token armazenado no localStorage:', storedToken);
    }
  
    setToken(token: string): void {
      try {
        localStorage.setItem(this.TOKEN_KEY, token);
        console.log('Token definido com sucesso:', token.substring(0, 20) + '...');
      } catch (error) {
        console.error('Erro ao salvar token no localStorage:', error);
      }
    }
  
    getToken(): string | null {
      try {
        const token = localStorage.getItem(this.TOKEN_KEY);
        console.log('Token recuperado do localStorage:', token ? token.substring(0, 20) + '...' : 'Token não existe');
        return token;
      } catch (error) {
        console.error('Erro ao recuperar token do localStorage:', error);
        return null;
      }
    }
  
    isLoggedIn(): boolean {
      const isLogged = !!this.getToken();
      console.log('Status de login:', isLogged ? 'Usuário logado' : 'Usuário não logado');
      return isLogged;
    }
  
    clearToken(): void {
      try {
        localStorage.removeItem(this.TOKEN_KEY);
        console.log('Token removido do localStorage');
      } catch (error) {
        console.error('Erro ao remover token do localStorage:', error);
      }
    }
    
    // Método para verificar se o token é válido (pelo menos em formato)
    isTokenValid(): boolean {
      const token = this.getToken();
      if (!token) {
        console.log('Token não existe, considerado inválido');
        return false;
      }
      
      // Verificação básica se o token tem o formato esperado (3 partes separadas por ponto)
      const parts = token.split('.');
      const isValidFormat = parts.length === 3;
      
      console.log('Verificação de formato do token:', isValidFormat ? 'Formato válido' : 'Formato inválido');
      return isValidFormat;
    }
    
    // Método para forçar a atualização do token
    refreshToken(): void {
      this.setToken(this.DEFAULT_TOKEN);
      console.log('Token forçadamente atualizado para o padrão');
    }
  }