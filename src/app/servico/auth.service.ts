import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly POLO_KEY = 'auth_polo';
  private readonly IDCIDADE_KEY = 'auth_idcidade';
  private readonly IDMETACX = 'auth_idmetacx'
  //constructor() {}

  // BehaviorSubject para monitorar mudanças no ID da cidade ***inserido*******/
  private idCidadeSubject = new BehaviorSubject<number | null>(this.getIdCity()); // mudei para string|null
  public idCidadeChanged$ = this.idCidadeSubject.asObservable();

  constructor() {
    console.log('AuthService inicializado');
  }//***************************************************************inserido*******/




  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
    return localStorage.getItem(this.POLO_KEY);
  }



  setIDmetaCaixa(idmetacx: number|undefined): void {

    if(idmetacx){
    localStorage.setItem(this.IDMETACX, idmetacx.toString());}
    else {
    localStorage.removeItem(this.IDMETACX);
    }
    
  }



  getIDmetaCaixa(): string | null {
    return localStorage.getItem(this.IDMETACX);
    
  }






  setIdCity(idcity: number | null): void {
  const idAnterior =this.getIdCity(); //**************inserido */

    if (idcity) {
      localStorage.setItem(this.IDCIDADE_KEY, idcity.toString());
    } else {
      localStorage.removeItem(this.IDCIDADE_KEY);
    }

    // Se o ID mudou, notificar observadores//***************inserido */
    if (idcity !== idAnterior) {
      console.log(`ID da cidade alterado: ${idAnterior} -> ${idcity}`);
      this.idCidadeSubject.next(idcity);
    //*******************************************************inserido */  
    }
  }

  getIdCity(): number | null {
    const idCityStr = localStorage.getItem(this.IDCIDADE_KEY);
    // Convertendo a string para número explicitamente ou retornando null
    return idCityStr ? Number(idCityStr) : null;
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
    localStorage.removeItem(this.IDCIDADE_KEY); // Também limpar o ID da cidade quando sair //***************inserido */
    this.idCidadeSubject.next(null); //***************inserido */
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
