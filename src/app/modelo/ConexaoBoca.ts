export interface ConexaoBoca {
    bocaOrigem: string;
    fibraOrigem: string;
    bocaDestino: string;
    fibraDestino: string;
    /** Destino cabo–cabo, entrada ou saída de splitter (painel / filtro de links) */
    tipoDestino?: 'boca' | 'splitter' | 'splitter_saida';
  }
  