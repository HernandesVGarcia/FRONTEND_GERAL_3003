import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Caixa} from '../modelo/Caixa';
import {Observable} from 'rxjs';


console.log('inicialização do app-lista-caixa2-ok')

@Injectable({
  providedIn: 'root'
})



export class CaixaService {

  
  
  url:string = 'http://127.0.0.1:3001/caixas'

  constructor(private http:HttpClient) { }

  // Método para Selecionar Caixa

  
  selecionar():Observable<Caixa[]>{
    return this.http.get<Caixa[]>(this.url);
    
}

   

}
