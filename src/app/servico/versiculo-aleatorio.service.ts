import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface VersiculoAleatorio {
  id: number;
  vers: string;
  endereco: string;
}

@Injectable({
  providedIn: 'root',
})
export class VersiculoAleatorioService {
  private readonly baseUrl = environment.apiUrlAbsolute;

  constructor(private http: HttpClient) {}

  obterAleatorio(): Observable<VersiculoAleatorio> {
    return this.http.get<VersiculoAleatorio>(`${this.baseUrl}/versiculo-aleatorio`);
  }
}
