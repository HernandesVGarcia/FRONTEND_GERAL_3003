export interface RackStencilPoint {
  x: number;
  y: number;
}

export interface RackStencilPath {
  closed: boolean;
  points: RackStencilPoint[];
}

export interface RackStencilJson {
  version: number;
  source: string;
  block: string;
  extractFrom?: string;
  note?: string;
  width: number | null;
  height: number | null;
  pathCount: number;
  paths: RackStencilPath[];
}
