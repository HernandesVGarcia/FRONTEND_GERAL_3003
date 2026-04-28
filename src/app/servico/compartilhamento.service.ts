import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

// Interface para dados de caixa
export interface CaixaData {
  LAT: number;
  LONGI: number;
  NUMERO: string;
  LOCALIZACAO: string;
  [key: string]: any;
}

export interface ClienteData {
  LAT: number;
  LNG: number;
  SIGLA: string;
  ENDERECO: string;
  [key: string]: any;
}

export interface EstacaoData {
  LAT: number;
  LNG: number;
  SIGLA: string;
  ENDERECO: string;
  [key: string]: any;
}

export interface LogradouroPesquisaData {
  lat: number;
  lng: number;
  endereco: string;
}

/** Ponto da pesquisa de viabilidade a exibir no mapa (cruz verde). */
export interface ViabilidadePontoMapaData {
  lat: number;
  lng: number;
  endereco: string;
}

/** Centrar o mapa num CEO/CTO-SP escolhido na lista de viabilidade (não altera a cruz verde). */
export interface ViabilidadeCentrarEquipamentoData {
  lat: number;
  lng: number;
  /** Se omitido, o mapa usa 19. */
  zoom?: number;
}

/** Centro de cada caixa/CTO-SP listado na viabilidade (círculo azul no mapa). */
export interface ViabilidadeCirculoCaixaData {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompartilhamentoService {

  // Subject para dados de caixas
  private caixaSubject = new BehaviorSubject<CaixaData | null>(null);
  public caixa$: Observable<CaixaData | null> = this.caixaSubject.asObservable();

  private clienteSubject = new BehaviorSubject<ClienteData | null>(null);
  public cliente$: Observable<ClienteData | null> = this.clienteSubject.asObservable();

  private estacaoSubject = new BehaviorSubject<EstacaoData | null>(null);
  public estacao$: Observable<EstacaoData | null> = this.estacaoSubject.asObservable();

  private logradouroPesquisaSubject = new BehaviorSubject<LogradouroPesquisaData | null>(null);
  public logradouroPesquisa$: Observable<LogradouroPesquisaData | null> =
    this.logradouroPesquisaSubject.asObservable();

  private viabilidadePontoMapaSubject = new BehaviorSubject<ViabilidadePontoMapaData | null>(null);
  public viabilidadePontoMapa$: Observable<ViabilidadePontoMapaData | null> =
    this.viabilidadePontoMapaSubject.asObservable();

  private viabilidadeCentrarEquipamentoSubject = new Subject<ViabilidadeCentrarEquipamentoData>();
  public viabilidadeCentrarEquipamento$: Observable<ViabilidadeCentrarEquipamentoData> =
    this.viabilidadeCentrarEquipamentoSubject.asObservable();

  /** null ou [] = sem círculos (limpar mapa). */
  private viabilidadeCirculosCaixasSubject = new BehaviorSubject<ViabilidadeCirculoCaixaData[] | null>(null);
  public viabilidadeCirculosCaixas$: Observable<ViabilidadeCirculoCaixaData[] | null> =
    this.viabilidadeCirculosCaixasSubject.asObservable();

  constructor() {
    console.log('CompartilhamentoService inicializado');
  }

  // Métodos para Caixa ==============================================================================================
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
    console.log('===============================================');}


    //metodo para compartilhar cliente==========================================================================================
    compartilharCliente(cliente: ClienteData): void {
      console.log('Compartilhando dados da cliente:', cliente);
      this.clienteSubject.next(cliente);
    }
  
    obterClienteAtual(): ClienteData | null {
      return this.clienteSubject.value;
    }
  
    limparCliente(): void {
      console.log('Limpando dados da caixa');
      this.clienteSubject.next(null);
    }
  
    // Método para debug - mostrar estado atual
    mostrarEstadoAtualCliente(): void {
      console.log('=== Estado Atual do CompartilhamentoService ===');
      console.log('Caixa atual:', this.obterClienteAtual());
      console.log('===============================================');

  }

  // Métodos para Estação ==============================================================================================
  compartilharEstacao(estacao: EstacaoData): void {
    console.log('Compartilhando dados da estação:', estacao);
    this.estacaoSubject.next(estacao);
  }

  obterEstacaoAtual(): EstacaoData | null {
    return this.estacaoSubject.value;
  }

  limparEstacao(): void {
    console.log('Limpando dados da estação');
    this.estacaoSubject.next(null);
  }

  // Método para debug - mostrar estado atual
  mostrarEstadoAtualEstacao(): void {
    console.log('=== Estado Atual do CompartilhamentoService ===');
    console.log('Estação atual:', this.obterEstacaoAtual());
    console.log('===============================================');
  }

  compartilharLogradouroPesquisa(ponto: LogradouroPesquisaData): void {
    this.logradouroPesquisaSubject.next(ponto);
  }

  obterLogradouroPesquisaAtual(): LogradouroPesquisaData | null {
    return this.logradouroPesquisaSubject.value;
  }

  limparLogradouroPesquisa(): void {
    this.logradouroPesquisaSubject.next(null);
  }

  compartilharViabilidadePontoMapa(ponto: ViabilidadePontoMapaData): void {
    this.viabilidadePontoMapaSubject.next(ponto);
  }

  limparViabilidadePontoMapa(): void {
    this.viabilidadePontoMapaSubject.next(null);
  }

  compartilharViabilidadeCentrarEquipamento(dados: ViabilidadeCentrarEquipamentoData): void {
    this.viabilidadeCentrarEquipamentoSubject.next(dados);
  }

  compartilharViabilidadeCirculosCaixas(pontos: ViabilidadeCirculoCaixaData[]): void {
    this.viabilidadeCirculosCaixasSubject.next(pontos.length > 0 ? pontos : null);
  }

  limparViabilidadeCirculosCaixas(): void {
    this.viabilidadeCirculosCaixasSubject.next(null);
  }
}
