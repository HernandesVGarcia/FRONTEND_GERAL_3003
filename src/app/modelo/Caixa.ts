export class Caixa {

id_meta:number|undefined;
numero:string | undefined;
LAT:Location | undefined;
LONGI:Location | undefined;
ID_TIPO:string | undefined;
conta_splitter?:number | undefined;
/** 1 = instalada no local, 0 = não instalada */
INSTALADA?: number | string | undefined;
/** id_cto VIGO (de-para sync caixas) */
ID_INTEGRACAO?: number | string | undefined;
NUMEROCX?: string | undefined;




}