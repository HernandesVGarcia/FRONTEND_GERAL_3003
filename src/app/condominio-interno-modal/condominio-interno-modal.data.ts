export interface CondominioInternoModalData {
  id_meta: number;
  sigla?: string;
  lat?: number;
  lng?: number;
  /** Pavimentos tipo (ANDAR1..ANDARN); TERREO sempre incluído. Vem de NUM_PAVIM da API. Omitir = stencil completo. */
  qtdAndares?: number;
}
