export interface Poligonos {
  id_meta: number | undefined;
  tipo: string | undefined;
  /** Ex.: PORTA_01 — a API devolve texto */
  Label: string | undefined;
  /** String JSON: array de `{ lng, lat }` */
  GOOGLE_LATLNG: string | undefined;
}