import { Injectable } from '@angular/core';
import * as go from 'gojs';
import { ConexaoBoca } from '../modelo/ConexaoBoca';
import { Cabo1FNacComponent } from '../Stencil/cabo-drop/cabo-drop.component';
import { Cabo1FNacDComponent } from '../Stencil/cabo-drop-d/cabo-drop-d.component';
import { PopClienteService } from '../servico/pop-cliente.service';

@Injectable({
  providedIn: 'root'
})
export class GojsDropComponent {
  private cabo1FNAC: Cabo1FNacComponent = new Cabo1FNacComponent();
  private cabo1FNAC_D: Cabo1FNacDComponent = new Cabo1FNacDComponent();

  // Propriedades para controlar o estado
  private dropsInicializados = false;
  private VetorDropsSp: ConexaoBoca[] = [];
  private VetorPopsCli: string[] = [];
  private VetorDadosPops: any[] = [];

  constructor(
    public servicePop: PopClienteService
  ) {}

  // 🆕 NOVO - Função para carregamento assíncrono dos drops
  async carregarDadosDropsAsync(vetorBocas: any[], serviceCabo99: any): Promise<void> {
    try {
      this.resetarEstado();
      console.log('💧 Carregando dados dos drops...');
      
      // 1. Carregar conexões do cabo 99 (drops)
      await this.carregarConexoesCabo99Async(vetorBocas, serviceCabo99);
      
      // 2. Carregar dados dos POPs para os drops
      if (this.VetorPopsCli.length > 0) {
        const apenasIdsPop = this.VetorPopsCli.map(item => item.replace('Drop',''));
        console.log('📊 Carregando dados dos POPs...');
        this.VetorDadosPops = await this.servicePop.selecionarMultiplosAsync(apenasIdsPop);
        console.log('✅ Dados dos POPs carregados:', this.VetorDadosPops.length, 'POPs');
      }
      
      console.log('✅ Carregamento dos drops concluído com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro durante o carregamento dos drops:', error);
    }
  }

  // Método para carregar conexões do cabo 99
  private async carregarConexoesCabo99Async(vetorBocas: any[], serviceCabo99: any): Promise<void> {
    if (vetorBocas[0]?.BOCA99) {  
      console.log('📋 Carregando conexões CABO99 para boca:', vetorBocas[0].BOCA99);
      
      try {
        this.VetorDropsSp = await serviceCabo99.selecionarAsync(vetorBocas[0].BOCA99);
        console.log(`=====> Resposta da API CONEXOES CABO BOCA99 ${vetorBocas[0].BOCA99}:`, this.VetorDropsSp);

        // Extrair lista de POPs
        this.VetorPopsCli = [];
        this.VetorDropsSp.forEach((conexao: any) => {
          this.VetorPopsCli.push(conexao.bocaOrigem);
        });

        console.log('📋 Lista de POPs extraída:', this.VetorPopsCli);
      } catch (error) {
        console.error('❌ Erro ao carregar conexões CABO99:', error);
      }
    }
  }

  // Método para adicionar drops ao diagrama
  adicionarDropsAoDiagrama(diagram: go.Diagram | null): void {
    if (!diagram || this.dropsInicializados || this.VetorPopsCli.length === 0) {
      console.log('❌ Não é possível adicionar drops: diagrama não inicializado, drops já adicionados ou sem dados');
      return;
    }

    console.log('🎨 Adicionando drops ao diagrama...');
    
    // Desenhar os drops
    const posicoesDrops = this.desenharDrops(diagram, this.VetorPopsCli, this.VetorDadosPops);
    
    // Configurar propriedades dos drops
    this.configurarPropriedadesDrops(diagram, posicoesDrops);
    
    // Criar conexões dos drops
    this.criarConexoesDrops(diagram, this.VetorDropsSp);
    
    this.dropsInicializados = true;
    console.log('✅ Drops adicionados ao diagrama com sucesso!');
  }

  // 🆕 NOVO - Método para registrar templates dos drops
  registerDropTemplates(templateMap: go.Map<string, go.Node>): void {
    templateMap.add("cabo1F", this.cabo1FNAC.getNodeTemplate());
    templateMap.add("cabo1F_D", this.cabo1FNAC_D.getNodeTemplate());
  }

  async selecionarCabo99(
    vetorBocas: any[],
    serviceCabo99: any,
    callback: (vetorDropsSp: ConexaoBoca[], vetorPopsCli: string[]) => void
  ): Promise<void> {
    if (vetorBocas[0]?.BOCA99) {  
      let i = -1;
      const vetorDropsSp = await serviceCabo99.selecionarAsync(vetorBocas[0].BOCA99);
      console.log(`=====> Resposta da API CONEXOES CABO BOCA99 ${vetorBocas[0].BOCA99}:`, vetorDropsSp);

      const vetorPopsCli: string[] = [];
      vetorDropsSp.forEach((index: any) => {
        i++;
        vetorPopsCli.push(vetorDropsSp[i].bocaOrigem);
      });

      console.log(vetorPopsCli);
      callback(vetorDropsSp, vetorPopsCli);
    }
  }

  desenharDrops(
    diagram: go.Diagram | null,
    vetorPopsCli: string[],
    dadosPops: any[] = []
  ): {id: string, x: number, y: number}[] {
    if (!diagram || vetorPopsCli.length === 0) {
      console.log('--->Não foi possível desenhar drops: diagrama não inicializado ou não há drops');
      return [];
    }
    
    console.log('--->Desenhando drops no diagrama:', vetorPopsCli);
    console.log('--->Dados dos POPs:', dadosPops);
    
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
      
      // Usa os dados dos POPs se disponíveis
      let labelText = 'drop';
      if (dadosPops && dadosPops[index]) {
        labelText = `${dadosPops[index].SIGLA}___Contrato: ${dadosPops[index].CONTRATO_GPON}`;
      }
      
      const dropNode: go.ObjectData = {
        ...dropModelDefinition,
        key: `${vetorPopsCli[index] || index}`,
        labelText: labelText,
        loc: `${posX} ${posY}`,
      };
      
      dropsNodes.push(dropNode);
    });
    
    model.addNodeDataCollection(dropsNodes);
    
    return posicoesDrops;
  }

  configurarPropriedadesDrops(
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

  criarConexoesDrops(
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
        routing: go.Routing.AvoidsNodes,//go.Link.Orthogonal,
        curve: go.Link.None,
        corner: 1
      };

      console.log('desenhando conexoes drop a splitter', linkData);
      linkDataArray.push(linkData);
    });

    const model = diagram.model as go.GraphLinksModel;
    model.addLinkDataCollection(linkDataArray);
  }

  // Getters para acessar os dados
  get vetorDropsSp(): ConexaoBoca[] {
    return this.VetorDropsSp;
  }

  get vetorPopsCli(): string[] {
    return this.VetorPopsCli;
  }

  get vetorDadosPops(): any[] {
    return this.VetorDadosPops;
  }

  get isDropsInicializados(): boolean {
    return this.dropsInicializados;
  }

  // Método para resetar o estado
  resetarEstado(): void {
    this.dropsInicializados = false;
    this.VetorDropsSp = [];
    this.VetorPopsCli = [];
    this.VetorDadosPops = [];
  }
}
