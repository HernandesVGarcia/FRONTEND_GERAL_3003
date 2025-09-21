export interface VisualizaCaboData {
  id_meta: number;
  nome_cabo: string;
  tipo_cabo: string;
  fibras: CaboFiberData[];
}

export interface CaboFiberData {
  fibra_numero: number;
  cor: string;
  status: string;
  destino: string;
  observacoes: string;
}

export interface VisualizaCaboConfig {
  title: string;
  isEditable: boolean;
  showAllFields: boolean;
}

export interface VisualizaCaboResponse {
  success: boolean;
  data?: VisualizaCaboData;
  message?: string;
}

export interface FlexGridCell {
  value: string;
  editable: boolean;
}

