export interface FibraDestino {
  id_meta: string;
  tipo_objeto: string;
  fibra: string;
  obs_dio?: string; // OBS do DIO para popular grid
}

export interface ConsultaFibra {
  tabela_cabo: string;
  id_meta_cabo: number;
  chave_user: string;
  registro: string;
}

export interface CaboInfo {
  id_meta: number;
  capacidade: number;
  grupos: number;
  label: string;
}
