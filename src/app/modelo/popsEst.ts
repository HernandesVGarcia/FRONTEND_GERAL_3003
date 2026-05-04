export interface PopsEst {

    id_meta:number| undefined;
    sigla: string|undefined;
    LAT:Location | undefined;
    LNG:Location | undefined;
    /** Opcional: se a API de clientes/estações devolver recursos de rede. */
    recurso_caixa?: number | undefined;
    recurso_sp?: number | undefined;
    recurso_sp_saida?: number | undefined;
                   
    }