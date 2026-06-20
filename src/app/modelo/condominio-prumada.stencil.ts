export interface CondominioPrumadaPointM {
  x: number;
  y: number;
}

export interface CondominioPrumadaShape {
  layer: string;
  verticesM: CondominioPrumadaPointM[];
}

export interface CondominioPrumadaStencil {
  version: number;
  source?: string;
  maxAndares: number;
  shapes: CondominioPrumadaShape[];
}
