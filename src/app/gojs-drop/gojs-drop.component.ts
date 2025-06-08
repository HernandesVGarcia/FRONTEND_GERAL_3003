import { Injectable } from '@angular/core';
import * as go from 'gojs';
import { ConexaoBoca } from '../modelo/ConexaoBoca';
import { Cabo1FNacComponent } from '../Stencil/cabo-drop/cabo-drop.component';
import { Cabo1FNacDComponent } from '../Stencil/cabo-drop-d/cabo-drop-d.component';


import { PopClienteService} from '../servico/pop-cliente.service';

@Injectable({
  providedIn: 'root'
})
export class GojsDropComponent {
  private cabo1FNAC: Cabo1FNacComponent = new Cabo1FNacComponent();
  private cabo1FNAC_D: Cabo1FNacDComponent = new Cabo1FNacDComponent();
  vetorPopsCli:string[]=[]
  vetorPopsCliNomes:any[]=[]

  constructor(
    private servicePop: PopClienteService,
    

  ) {}


  //=========================
  async selecionarCabo99(
  //=========================  
    vetorBocas: any[],
    serviceCabo99: any,
    
    callback: (vetorDropsSp: ConexaoBoca[], vetorPopsCli: string[]) => void  //callback só retorna quando obter os dois vetores
  ): Promise<void> {
    if (vetorBocas[0]?.BOCA99) {  
      let i = -1;
      const vetorDropsSp = await serviceCabo99.selecionarAsync(vetorBocas[0].BOCA99);
      console.log(`=====> Resposta da API CONEXOES CABO BOCA99 ${vetorBocas[0].BOCA99}:`, vetorDropsSp);

      //const vetorPopsCli: string[] = [];
      vetorDropsSp.forEach((index: any) => {
        i++;
        this.vetorPopsCli.push(vetorDropsSp[i].bocaOrigem); // joga em vetorPopsCli todos os id do cliente no drop
      });
      
      console.log('ids dos clientes: ==>',this.vetorPopsCli);
      callback(vetorDropsSp, this.vetorPopsCli); // so retorna os dados aqui, espera processar tudo antes.
    }
  }



//=========================
  async selecionarPOP(idmeta:number){
//=========================  
 
  const apenasIdsPop= this.vetorPopsCli.map(item=>item.replace('Drop',''))

  console.log('====> apenas ids dos pops :', apenasIdsPop )


  this.vetorPopsCliNomes = await this.servicePop.selecionarMultiplosAsync(apenasIdsPop)

  //const VetorPop = await this.servicePop.selecionarAsync(idmeta);


  console.log ('========> POP ' , this.vetorPopsCliNomes);






  }

  //=======================
  desenharDrops(
  //=======================  
    diagram: go.Diagram | null,
    vetorPopsCli: string[]
  ): {id: string, x: number, y: number}[] {
    if (!diagram || vetorPopsCli.length === 0) {
      console.log('--->Não foi possível desenhar drops: diagrama não inicializado ou não há drops');
      return [];
    }
    
    console.log('--->Desenhando drops no diagrama:', vetorPopsCli);
    
    diagram.layout = new go.Layout();
    const model = diagram.model as go.GraphLinksModel;
    const dropsNodes: go.ObjectData[] = [];
    const posicoesDrops: {id: string, x: number, y: number}[] = [];
    
    vetorPopsCli.forEach((drop, index) => {
      const isLadoEsquerdo = index % 2 === 0;
      const posX = isLadoEsquerdo ? -200 : 1200;
      const posY = 400 + (index * 200);
     
      posicoesDrops.push({
        id: `${drop || index}`,
        x: posX,
        y: posY
      });
      
      let dropModelDefinition: go.ObjectData;
      if (posX === -200) {
        dropModelDefinition = this.cabo1FNAC.getModelDefinition();
      } else {
        dropModelDefinition = this.cabo1FNAC_D.getModelDefinition();
      }
      
      const dropNode: go.ObjectData = {
        ...dropModelDefinition,
        key: `${vetorPopsCli[index] || index}`,
        labelText: `${this.vetorPopsCliNomes[index].SIGLA + "___Contrato: " + this.vetorPopsCliNomes[index].CONTRATO_GPON || 'drop'} `,
        loc: `${posX} ${posY}`,
      };
      
      dropsNodes.push(dropNode);
    });
    
    model.addNodeDataCollection(dropsNodes);
    
    this.vetorPopsCli.length=0;
    this.vetorPopsCliNomes.length=0;
    
    return posicoesDrops;
  }
  //==============================
  configurarPropriedadesDrops(
  //==============================  
    diagram: go.Diagram | null,
    posicoesDrops: {id: string, x: number, y: number}[]
  ): void {
    if (!diagram) return;

    posicoesDrops.forEach(posicao => {
      const node = diagram.findNodeForKey(posicao.id);
      if (node) {
        node.resizable = true;
        node.rotatable = true;
        node.movable = true;
        node.position = new go.Point(posicao.x, posicao.y);
      }
    });
  }
  //========================
  criarConexoesDrops(
  //========================  
    diagram: go.Diagram | null,
    vetorDropsSp: ConexaoBoca[]
  ): void {
    if (!diagram || !diagram.model) return;

    let i = -1;
    const linkDataArray: any[] = [];
    
    vetorDropsSp.forEach((conexao, index) => {
      i++;
      
      const linkData = {
        from: vetorDropsSp[i].bocaOrigem,
        fromPort: vetorDropsSp[i].fibraOrigem,
        to: vetorDropsSp[i].bocaDestino,
        toPort: vetorDropsSp[i].fibraDestino,
        routing: go.Link.Orthogonal,
        curve: go.Link.None,
        corner: 1
      };

      console.log('desenhando conexoes drop a splitter', linkData);
      linkDataArray.push(linkData);
    });

    const model = diagram.model as go.GraphLinksModel;
    model.addLinkDataCollection(linkDataArray);
  }
}