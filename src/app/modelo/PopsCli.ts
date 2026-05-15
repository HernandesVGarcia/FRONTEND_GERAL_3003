export interface PopsCli {

    id_meta:number| undefined;
    sigla: string|undefined;
    LAT:Location | undefined;
    LNG:Location | undefined;
    recurso_caixa:number|undefined;
    recurso_sp:number|undefined;
    recurso_sp_saida:number|undefined;

    /** Vindo de `POST /clientes_coordenadas`; sempre numérico na API (0 quando vazio). Objetos locais podem omitir. */
    portas_olt?: number;

    }