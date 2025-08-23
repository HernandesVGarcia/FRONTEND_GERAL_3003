import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Interface para dados de caixa
export interface CaixaData {
  LAT: number;
  LONGI: number;
  NUMERO: string;
  LOCALIZACAO: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class CompartilhamentoService {

  // Subject para dados de caixas
  private caixaSubject = new BehaviorSubject<CaixaData | null>(null);
  public caixa$: Observable<CaixaData | null> = this.caixaSubject.asObservable();

  constructor() {
    console.log('CompartilhamentoService inicializado');
  }

  // Métodos para Caixa
  compartilharCaixa(caixa: CaixaData): void {
    console.log('Compartilhando dados da caixa:', caixa);
    this.caixaSubject.next(caixa);
  }

  obterCaixaAtual(): CaixaData | null {
    return this.caixaSubject.value;
  }

  limparCaixa(): void {
    console.log('Limpando dados da caixa');
    this.caixaSubject.next(null);
  }

  // Método para debug - mostrar estado atual
  mostrarEstadoAtual(): void {
    console.log('=== Estado Atual do CompartilhamentoService ===');
    console.log('Caixa atual:', this.obterCaixaAtual());
    console.log('===============================================');
  }
}
