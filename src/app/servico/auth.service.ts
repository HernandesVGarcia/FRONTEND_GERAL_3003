import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  static getmenus_on() {
    throw new Error('Method not implemented.');
  }
  private readonly TOKEN_KEY = 'auth_token';
  private readonly POLO_KEY = 'auth_polo';
  private readonly IDCIDADE_KEY = 'auth_idcidade';
  private readonly POSTES_TABELA_KEY = 'auth_postes_tabela';
  private readonly IDMETACX = 'auth_idmetacx'
  private readonly USUARIO = 'auth_user'
  private readonly IDUSER = 'auth_iduser'

  private readonly LAT_PERFIL = 'auth_perfil_lat'
  private readonly LNG_PERFIL = 'auth_perfil_lng'
  private readonly CEO_PERFIL = 'auth_perfil_ceo'
  private readonly CTO_PERFIL = 'auth_perfil_cto'
  private readonly CLIENTES_PERFIL = 'auth_perfil_clientes'
  private readonly MENUS_PERFIL = 'auth_perfil_menus'
  private readonly CABOS_PERFIL = 'auth_perfil_cabos'

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
    //return localStorage.getItem(this.POLO_KEY);
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


  setIDmetaDio(idmetacx: number|undefined): void {

    if(idmetacx){
    localStorage.setItem(this.IDMETACX, idmetacx.toString());}
    else {
    localStorage.removeItem(this.IDMETACX);
    }
    
  }


  getIDmetaDio(): string | null {
    return localStorage.getItem(this.IDMETACX);
    
  }



  setUsuario(chave: string): void {
    //console.log('🔧 setUsuario chamado com valor:', chave);
    //console.log('🔧 Tipo do valor recebido:', typeof chave);
    //console.log('🔧 Valor é válido?', chave && chave.trim() !== '');
    
    if (chave && chave.trim() !== '') {
      localStorage.setItem(this.USUARIO, chave);
      //console.log('✅ Usuario armazenado no localStorage');
      //console.log('✅ Verificação imediata:', localStorage.getItem(this.USUARIO));
    } else {
      console.error('❌ Tentativa de salvar usuário com valor inválido:', chave);
    }
  }

 

  getUsuario(): string | null {
    const usuario = localStorage.getItem(this.USUARIO);
    //console.log('🔍 getUsuario - valor recuperado:', usuario);
    //console.log('🔍 Chave utilizada:', this.USUARIO);
    //console.log('🔍 LocalStorage completo para debug:', {
    //  auth_user: localStorage.getItem('auth_user'),
    //  auth_token: localStorage.getItem('auth_token'),
    //  auth_polo: localStorage.getItem('auth_polo')
    //});
    return usuario;
  }

  setIdUser(idUser: number | null): void {
    if (idUser) {
      localStorage.setItem(this.IDUSER, idUser.toString());
    } else {
      localStorage.removeItem(this.IDUSER);
    }
  }

  getIdUser(): number | null {
    const idUserStr = localStorage.getItem(this.IDUSER);
    return idUserStr ? Number(idUserStr) : null;
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

  setPostesTabela(valor: string | null): void {
    if (valor && valor.trim() !== '') {
      localStorage.setItem(this.POSTES_TABELA_KEY, valor.trim());
    } else {
      localStorage.removeItem(this.POSTES_TABELA_KEY);
    }
  }

  getPostesTabela(): string | null {
    return localStorage.getItem(this.POSTES_TABELA_KEY);
  }

  hasPostesConcessionaria(): boolean {
    const tabela = this.getPostesTabela();
    if (!tabela) {
      return false;
    }
    const normalizado = tabela.trim().toLowerCase();
    return normalizado !== '' && normalizado !== 'indefinido';
  }

  setPolo(polo: string | null): void {
    if (polo) {
      localStorage.setItem(this.POLO_KEY, polo);
    } else {
      localStorage.removeItem(this.POLO_KEY);
    }
  }




  setLat (lat:string |null): void {
    if (lat) {
      localStorage.setItem(this.LAT_PERFIL, lat);
    } else {
      localStorage.removeItem(this.LAT_PERFIL);
    }
  }

  setLng (lng:string |null): void {
    if (lng) {
      localStorage.setItem(this.LNG_PERFIL, lng);
    } else {
      localStorage.removeItem(this.LNG_PERFIL);
    }
  }

  setceo_layer (ceo_layer:string |null): void {
    if (ceo_layer) {
      localStorage.setItem(this.CEO_PERFIL, ceo_layer);
    } else {
      localStorage.removeItem(this.CEO_PERFIL);
    }
  }

  setcto_layer (cto_layer:string |null): void {
    if (cto_layer) {
      localStorage.setItem(this.CTO_PERFIL, cto_layer);
    } else {
      localStorage.removeItem(this.CTO_PERFIL);
    }
  }

  setclientes_layer (clientes_layer:string |null): void {
    if (clientes_layer) {
      localStorage.setItem(this.CLIENTES_PERFIL, clientes_layer);
    } else {
      localStorage.removeItem(this.CLIENTES_PERFIL);
    }
  }

  setmenu_on (menus_on:string |null): void {
    if (menus_on) {
      localStorage.setItem(this.MENUS_PERFIL, menus_on);
    } else {
      localStorage.removeItem(this.MENUS_PERFIL);
    }
  }

  setcabos_layer (cabos_layer:string |null): void {
    if (cabos_layer) {
      localStorage.setItem(this.CABOS_PERFIL, cabos_layer);
    } else {
      localStorage.removeItem(this.CABOS_PERFIL);
    }
  }


  

  getPolo(): string | null {
    return localStorage.getItem(this.POLO_KEY);
  }
 
  getLat(): string | null {
    return localStorage.getItem(this.LAT_PERFIL);
  }

  getLng(): string | null {
    return localStorage.getItem(this.LNG_PERFIL);
  }

  getceo_layer(): string | null {
    return localStorage.getItem(this.CEO_PERFIL);
  }

  getcto_layer(): string | null {
    return localStorage.getItem(this.CTO_PERFIL);
  }

  getclientes_layer(): string | null {
    return localStorage.getItem(this.CLIENTES_PERFIL);
  }

  getmenus_on(): string | null {
    return localStorage.getItem(this.MENUS_PERFIL);
  }

  getcabos_layer(): string | null {
    return localStorage.getItem(this.CABOS_PERFIL);
  }








  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.POLO_KEY); // Também limpar o polo quando sair
    localStorage.removeItem(this.IDCIDADE_KEY); // Também limpar o ID da cidade quando sair //***************inserido */
    localStorage.removeItem(this.POSTES_TABELA_KEY);
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
