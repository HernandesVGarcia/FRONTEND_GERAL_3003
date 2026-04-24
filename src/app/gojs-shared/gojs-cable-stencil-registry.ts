/**
 * Catálogo de stencils GoJS (cabos + splitters) e seleção de modelo por capacidade.
 * Espelha a lógica de gojs-demo sem alterar esse ficheiro.
 */
import * as go from 'gojs';

import { Cabo1FNacComponent } from '../Stencil/cabo-drop/cabo-drop.component';
import { Cabo1FNacDComponent } from '../Stencil/cabo-drop-d/cabo-drop-d.component';
import { Cabo1FIntComponent } from '../Stencil/cabo-1-f-int/cabo-1-f-int.component';
import { Cabo1FIntDComponent } from '../Stencil/cabo-1-f-int-d/cabo-1-f-int-d.component';

import { Cabo2FNacComponent } from '../Stencil/cabo-2-f-nac/cabo-2-f-nac.component';
import { Cabo2FNacDComponent } from '../Stencil/cabo-2-f-nac-d/cabo-2-f-nac-d.component';
import { Cabo2FIntComponent } from '../Stencil/cabo-2-f-int/cabo-2-f-int.component';
import { Cabo2FIntDComponent } from '../Stencil/cabo-2-f-int-d/cabo-2-f-int-d.component';

import { Cabo4FNacDComponent } from '../Stencil/cabo-4-f-nac-d/cabo-4-f-nac-d.component';
import { Cabo4FNacComponent } from '../Stencil/cabo-4-f-nac/cabo-4-f-nac.component';
import { Cabo4FIntComponent } from '../Stencil/cabo-4-f-int/cabo-4-f-int.component';
import { Cabo4FIntDComponent } from '../Stencil/cabo-4-f-int-d/cabo-4-f-int-d.component';

import { Cabo6FNacDComponent } from '../Stencil/cabo-6-f-nac-d/cabo-6-f-nac-d.component';
import { Cabo6FNacComponent } from '../Stencil/cabo-6-f-nac/cabo-6-f-nac.component';
import { Cabo6FIntComponent } from '../Stencil/cabo-6-f-int/cabo-6-f-int.component';
import { Cabo6FIntDComponent } from '../Stencil/cabo-6-f-int-d/cabo-6-f-int-d.component';

import { Cabo8FNacDComponent } from '../Stencil/cabo-8-f-nac-d/cabo-8-f-nac-d.component';
import { Cabo8FNacComponent } from '../Stencil/cabo-8-f-nac/cabo-8-f-nac.component';
import { Cabo8FIntComponent } from '../Stencil/cabo-8-f-int/cabo-8-f-int.component';
import { Cabo8FIntDComponent } from '../Stencil/cabo-8-f-int-d/cabo-8-f-int-d.component';

import { Cabo12FNacComponent } from '../Stencil/cabo-12-f-nac/cabo-12-f-nac.component';
import { Cabo12FNacDComponent } from '../Stencil/cabo-12-f-nac-d/cabo-12-f-nac-d.component';
import { Cabo12FIntComponent } from '../Stencil/cabo-12-f-int/cabo-12-f-int.component';
import { Cabo12FIntDComponent } from '../Stencil/cabo-12-f-int-d/cabo-12-f-int-d.component';
import { Cabo12FNacTb12Component } from '../Stencil/cabo-12-f-nac-tb12/cabo-12-f-nac-tb12.component';
import { Cabo12FNacDTb12Component } from '../Stencil/cabo-12-f-nac-d-tb12/cabo-12-f-nac-d-tb12.component';
import { Cabo12FIntTb12Component } from '../Stencil/cabo-12-f-int-tb12/cabo-12-f-int-tb12.component';
import { Cabo12FIntDTb12Component } from '../Stencil/cabo-12-f-int-d-tb12/cabo-12-f-int-d-tb12.component';
import { Cabo12FNacTb2Component } from '../Stencil/cabo-12-f-nac-tb2/cabo-12-f-nac-tb2.component';
import { Cabo12FNacDTb2Component } from '../Stencil/cabo-12-f-nac-d-tb2/cabo-12-f-nac-d-tb2.component';
import { Cabo12FIntTb2Component } from '../Stencil/cabo-12-f-int-tb2/cabo-12-f-int-tb2.component';
import { Cabo12FIntDTb2Component } from '../Stencil/cabo-12-f-int-d-tb2/cabo-12-f-int-d-tb2.component';

import { Cabo24FNacComponent } from '../Stencil/cabo-24-f-nac/cabo-24-f-nac.component';
import { Cabo24FNacDComponent } from '../Stencil/cabo-24-f-nac-d/cabo-24-f-nac-d.component';
import { Cabo24FIntComponent } from '../Stencil/cabo-24-f-int/cabo-24-f-int.component';
import { Cabo24FIntDComponent } from '../Stencil/cabo-24-f-int-d/cabo-24-f-int-d.component';
import { Cabo24FNacTb24Component } from '../Stencil/cabo-24-f-nac-tb24/cabo-24-f-nac-tb24.component';
import { Cabo24FNacDTb24Component } from '../Stencil/cabo-24-f-nac-d-tb24/cabo-24-f-nac-d-tb24.component';
import { Cabo24FIntTb24Component } from '../Stencil/cabo-24-f-int-tb24/cabo-24-f-int-tb24.component';
import { Cabo24FIntDTb24Component } from '../Stencil/cabo-24-f-int-d-tb24/cabo-24-f-int-d-tb24.component';

import { Cabo36FNacComponent } from '../Stencil/cabo-36-f-nac/cabo-36-f-nac.component';
import { Cabo36FNacDComponent } from '../Stencil/cabo-36-f-nac-d/cabo-36-f-nac-d.component';
import { Cabo36FIntComponent } from '../Stencil/cabo-36-f-int/cabo-36-f-int.component';
import { Cabo36FIntDComponent } from '../Stencil/cabo-36-f-int-d/cabo-36-f-int-d.component';

import { Cabo48FNacDComponent } from '../Stencil/cabo-48-f-nac-d/cabo-48-f-nac-d.component';
import { Cabo48FNacComponent } from '../Stencil/cabo-48-f-nac/cabo-48-f-nac.component';
import { Cabo48FIntComponent } from '../Stencil/cabo-48-f-int/cabo-48-f-int.component';
import { Cabo48FIntDComponent } from '../Stencil/cabo-48-f-int-d/cabo-48-f-int-d.component';

import { Cabo72FNacDComponent } from '../Stencil/cabo-72-f-nac-d/cabo-72-f-nac-d.component';
import { Cabo72FNacComponent } from '../Stencil/cabo-72-f-nac/cabo-72-f-nac.component';
import { Cabo72FIntComponent } from '../Stencil/cabo-72-f-int/cabo-72-f-int.component';
import { Cabo72FIntDComponent } from '../Stencil/cabo-72-f-int-d/cabo-72-f-int-d.component';

import { Cabo144FNacComponent } from '../Stencil/cabo-144-f-nac/cabo-144-f-nac.component';
import { Cabo144FNacDComponent } from '../Stencil/cabo-144-f-nac-d/cabo-144-f-nac-d.component';
import { Cabo144FIntComponent } from '../Stencil/cabo-144-f-int/cabo-144-f-int.component';
import { Cabo144FIntDComponent } from '../Stencil/cabo-144-f-int-d/cabo-144-f-int-d.component';

import { Splitter12Component } from '../Stencil/spliter-1-p2/spliter-1-p2.component';
import { Splitter14Component } from '../Stencil/spliter-1-p4/spliter-1-p4.component';
import { Splitter18Component } from '../Stencil/spliter-1-p8/spliter-1-p8.component';
import { Splitter116Component } from '../Stencil/spliter-1-p16/spliter-1-p16.component';
import { Splitter132Component } from '../Stencil/spliter-1-p32/spliter-1-p32.component';
import { Splitter164Component } from '../Stencil/spliter-1-p64/spliter-1-p64.component';
import { Splitter1128Component } from '../Stencil/spliter-1-p128/spliter-1-p128.component';
import { SplitterDesbComponent } from '../Stencil/spliter-desbalanceado/spliter-desbalanceado.component';
import { Dio6FComponent } from '../Stencil/dio-6-f/dio-6-f.component';
import { Dio8FComponent } from '../Stencil/dio-8-f/dio-8-f.component';
import { Dio12FComponent } from '../Stencil/dio-12-f/dio-12-f.component';
import { Dio24FComponent } from '../Stencil/dio-24-f/dio-24-f.component';
import { Dio36FComponent } from '../Stencil/dio-36-f/dio-36-f.component';
import { Dio48FComponent } from '../Stencil/dio-48-f/dio-48-f.component';
import { Dio72FComponent } from '../Stencil/dio-72-f/dio-72-f.component';
import { Dio84FComponent } from '../Stencil/dio-84-f/dio-84-f.component';
import { Dio144FComponent } from '../Stencil/dio-144-f/dio-144-f.component';

export class GojsCableStencilRegistry {
  private readonly cabo1FNAC = new Cabo1FNacComponent();
  private readonly cabo1FNAC_D = new Cabo1FNacDComponent();
  private readonly cabo1FINT = new Cabo1FIntComponent();
  private readonly cabo1FINT_D = new Cabo1FIntDComponent();

  private readonly cabo2FNAC_D = new Cabo2FNacDComponent();
  private readonly cabo2FNAC = new Cabo2FNacComponent();
  private readonly cabo2FINT = new Cabo2FIntComponent();
  private readonly cabo2FINT_D = new Cabo2FIntDComponent();

  private readonly cabo4FNAC_D = new Cabo4FNacDComponent();
  private readonly cabo4FNAC = new Cabo4FNacComponent();
  private readonly cabo4FINT = new Cabo4FIntComponent();
  private readonly cabo4FINT_D = new Cabo4FIntDComponent();

  private readonly cabo6FNAC_D = new Cabo6FNacDComponent();
  private readonly cabo6FNAC = new Cabo6FNacComponent();
  private readonly cabo6FINT = new Cabo6FIntComponent();
  private readonly cabo6FINT_D = new Cabo6FIntDComponent();

  private readonly cabo8FNAC_D = new Cabo8FNacDComponent();
  private readonly cabo8FNAC = new Cabo8FNacComponent();
  private readonly cabo8FINT = new Cabo8FIntComponent();
  private readonly cabo8FINT_D = new Cabo8FIntDComponent();

  private readonly cabo12F_NAC = new Cabo12FNacComponent();
  private readonly cabo12F_NAC_D = new Cabo12FNacDComponent();
  private readonly cabo12FINT = new Cabo12FIntComponent();
  private readonly cabo12FINT_D = new Cabo12FIntDComponent();
  private readonly cabo12FINT_TB2 = new Cabo12FIntTb2Component();
  private readonly cabo12FINT_D_TB2 = new Cabo12FIntDTb2Component();
  private readonly cabo12FNAC_TB2 = new Cabo12FNacTb2Component();
  private readonly cabo12FNAC_D_TB2 = new Cabo12FNacDTb2Component();
  private readonly cabo12FINT_TB12 = new Cabo12FIntTb12Component();
  private readonly cabo12FINT_D_TB12 = new Cabo12FIntDTb12Component();
  private readonly cabo12FNAC_TB12 = new Cabo12FNacTb12Component();
  private readonly cabo12FNAC_D_TB12 = new Cabo12FNacDTb12Component();

  private readonly cabo24FNAC = new Cabo24FNacComponent();
  private readonly cabo24FNAC_D = new Cabo24FNacDComponent();
  private readonly cabo24FINT = new Cabo24FIntComponent();
  private readonly cabo24FINT_D = new Cabo24FIntDComponent();
  private readonly cabo24FNAC_TB24 = new Cabo24FNacTb24Component();
  private readonly cabo24FNAC_D_TB24 = new Cabo24FNacDTb24Component();
  private readonly cabo24FINT_TB24 = new Cabo24FIntTb24Component();
  private readonly cabo24FINT_D_TB24 = new Cabo24FIntDTb24Component();

  private readonly cabo36FNAC = new Cabo36FNacComponent();
  private readonly cabo36FNAC_D = new Cabo36FNacDComponent();
  private readonly cabo36FINT = new Cabo36FIntComponent();
  private readonly cabo36FINT_D = new Cabo36FIntDComponent();

  private readonly cabo48FNAC_D = new Cabo48FNacDComponent();
  private readonly cabo48FNAC = new Cabo48FNacComponent();
  private readonly cabo48FINT_D = new Cabo48FIntDComponent();
  private readonly cabo48FINT = new Cabo48FIntComponent();

  private readonly cabo72FNAC_D = new Cabo72FNacDComponent();
  private readonly cabo72FNAC = new Cabo72FNacComponent();
  private readonly cabo72FINT_D = new Cabo72FIntDComponent();
  private readonly cabo72FINT = new Cabo72FIntComponent();

  private readonly cabo144FNAC_D = new Cabo144FNacDComponent();
  private readonly cabo144FNAC = new Cabo144FNacComponent();
  private readonly cabo144FINT_D = new Cabo144FIntDComponent();
  private readonly cabo144FINT = new Cabo144FIntComponent();

  private readonly splitter12 = new Splitter12Component();
  private readonly splitter14 = new Splitter14Component();
  private readonly splitter18 = new Splitter18Component();
  private readonly splitter116 = new Splitter116Component();
  private readonly splitter132 = new Splitter132Component();
  private readonly splitter164 = new Splitter164Component();
  private readonly splitter1128 = new Splitter1128Component();
  private readonly splitterDesb = new SplitterDesbComponent();
  private readonly dio6F = new Dio6FComponent();
  private readonly dio8F = new Dio8FComponent();
  private readonly dio12F = new Dio12FComponent();
  private readonly dio24F = new Dio24FComponent();
  private readonly dio36F = new Dio36FComponent();
  private readonly dio48F = new Dio48FComponent();
  private readonly dio72F = new Dio72FComponent();
  private readonly dio84F = new Dio84FComponent();
  private readonly dio144F = new Dio144FComponent();

  /** Capacidades com stencil dedicado (ordem crescente). */
  private static readonly DIO_STENCIL_CAPS = [
    6, 8, 12, 24, 36, 48, 72, 84, 144,
  ] as const;

  getDio12FModelDefinition(): go.ObjectData {
    return this.dio12F.getModelDefinition();
  }

  getDio36FModelDefinition(): go.ObjectData {
    return this.dio36F.getModelDefinition();
  }

  /**
   * Escolhe o menor stencil com capacidade &gt;= pedida; pedidas &gt; 144 usam 144F.
   */
  private resolveDioStencilCapacity(requested: number): number {
    if (requested > 144) {
      return 144;
    }
    const exact = GojsCableStencilRegistry.DIO_STENCIL_CAPS.find(
      (x) => x === requested,
    );
    if (exact != null) {
      return exact;
    }
    const next = GojsCableStencilRegistry.DIO_STENCIL_CAPS.find(
      (x) => x >= requested,
    );
    return next ?? 144;
  }

  /**
   * Face de conectorização do DIO (sempre um stencil à esquerda no gojs-dio).
   * Stencils: 6, 8, 12, 24, 36, 48, 72, 84, 144 fibras; outras capacidades usam o menor stencil que cubra.
   */
  getDioFaceModelDefinitionForCapacity(capacidade: number): go.ObjectData {
    const c = Number.isFinite(capacidade) && capacidade > 0 ? Math.round(capacidade) : 12;
    const cap = this.resolveDioStencilCapacity(c);
    switch (cap) {
      case 6:
        return this.dio6F.getModelDefinition();
      case 8:
        return this.dio8F.getModelDefinition();
      case 12:
        return this.dio12F.getModelDefinition();
      case 24:
        return this.dio24F.getModelDefinition();
      case 36:
        return this.dio36F.getModelDefinition();
      case 48:
        return this.dio48F.getModelDefinition();
      case 72:
        return this.dio72F.getModelDefinition();
      case 84:
        return this.dio84F.getModelDefinition();
      case 144:
        return this.dio144F.getModelDefinition();
      default:
        return this.dio12F.getModelDefinition();
    }
  }

  buildNodeTemplateMap(): go.Map<string, go.Node> {
    const caboTemplateMap = new go.Map<string, go.Node>();

    caboTemplateMap.add('cabo1F', this.cabo1FNAC.getNodeTemplate());
    caboTemplateMap.add('cabo1F_D', this.cabo1FNAC_D.getNodeTemplate());
    caboTemplateMap.add('cabo1FINT', this.cabo1FINT.getNodeTemplate());
    caboTemplateMap.add('cabo1FINT_D', this.cabo1FINT_D.getNodeTemplate());

    caboTemplateMap.add('cabo2F', this.cabo2FNAC.getNodeTemplate());
    caboTemplateMap.add('cabo2F_D', this.cabo2FNAC_D.getNodeTemplate());
    caboTemplateMap.add('cabo2FINT', this.cabo2FINT.getNodeTemplate());
    caboTemplateMap.add('cabo2FINT_D', this.cabo2FINT_D.getNodeTemplate());

    caboTemplateMap.add('cabo4F_D', this.cabo4FNAC_D.getNodeTemplate());
    caboTemplateMap.add('cabo4F', this.cabo4FNAC.getNodeTemplate());
    caboTemplateMap.add('cabo4FINT_D', this.cabo4FINT_D.getNodeTemplate());
    caboTemplateMap.add('cabo4FINT', this.cabo4FINT.getNodeTemplate());

    caboTemplateMap.add('cabo6F_D', this.cabo6FNAC_D.getNodeTemplate());
    caboTemplateMap.add('cabo6F', this.cabo6FNAC.getNodeTemplate());
    caboTemplateMap.add('cabo6FINT_D', this.cabo6FINT_D.getNodeTemplate());
    caboTemplateMap.add('cabo6FINT', this.cabo6FINT.getNodeTemplate());

    caboTemplateMap.add('cabo8F_D', this.cabo8FNAC_D.getNodeTemplate());
    caboTemplateMap.add('cabo8F', this.cabo8FNAC.getNodeTemplate());
    caboTemplateMap.add('cabo8FINT_D', this.cabo8FINT_D.getNodeTemplate());
    caboTemplateMap.add('cabo8FINT', this.cabo8FINT.getNodeTemplate());

    caboTemplateMap.add('cabo12F_NAC', this.cabo12F_NAC.getNodeTemplate());
    caboTemplateMap.add('cabo12F_NAC_D', this.cabo12F_NAC_D.getNodeTemplate());
    caboTemplateMap.add('cabo12FINT', this.cabo12FINT.getNodeTemplate());
    caboTemplateMap.add('cabo12FINT_D', this.cabo12FINT_D.getNodeTemplate());
    caboTemplateMap.add('cabo12FNAC_TB12', this.cabo12FNAC_TB12.getNodeTemplate());
    caboTemplateMap.add('cabo12FNAC_D_TB12', this.cabo12FNAC_D_TB12.getNodeTemplate());
    caboTemplateMap.add('cabo12FINT_TB12', this.cabo12FINT_TB12.getNodeTemplate());
    caboTemplateMap.add('cabo12FINT_D_TB12', this.cabo12FINT_D_TB12.getNodeTemplate());
    caboTemplateMap.add('cabo12FNAC_TB2', this.cabo12FNAC_TB2.getNodeTemplate());
    caboTemplateMap.add('cabo12FNAC_D_TB2', this.cabo12FNAC_D_TB2.getNodeTemplate());
    caboTemplateMap.add('cabo12FINT_TB2', this.cabo12FINT_TB2.getNodeTemplate());
    caboTemplateMap.add('cabo12FINT_D_TB2', this.cabo12FINT_D_TB2.getNodeTemplate());

    caboTemplateMap.add('cabo24F', this.cabo24FNAC.getNodeTemplate());
    caboTemplateMap.add('cabo24F_D', this.cabo24FNAC_D.getNodeTemplate());
    caboTemplateMap.add('cabo24F_INT', this.cabo24FINT.getNodeTemplate());
    caboTemplateMap.add('cabo24F_INT_D', this.cabo24FINT_D.getNodeTemplate());
    caboTemplateMap.add('cabo24F_NAC_TB24', this.cabo24FNAC_TB24.getNodeTemplate());
    caboTemplateMap.add('cabo24F_NAC_D_TB24', this.cabo24FNAC_D_TB24.getNodeTemplate());
    caboTemplateMap.add('cabo24F_INT_TB24', this.cabo24FINT_TB24.getNodeTemplate());
    caboTemplateMap.add('cabo24F_INT_D_TB24', this.cabo24FINT_D_TB24.getNodeTemplate());

    caboTemplateMap.add('cabo36F', this.cabo36FNAC.getNodeTemplate());
    caboTemplateMap.add('cabo36F_D', this.cabo36FNAC_D.getNodeTemplate());
    caboTemplateMap.add('cabo36FINT', this.cabo36FINT.getNodeTemplate());
    caboTemplateMap.add('cabo36FINT_D', this.cabo36FINT_D.getNodeTemplate());

    caboTemplateMap.add('cabo48F_D', this.cabo48FNAC_D.getNodeTemplate());
    caboTemplateMap.add('cabo48F', this.cabo48FNAC.getNodeTemplate());
    caboTemplateMap.add('cabo48FINT_D', this.cabo48FINT_D.getNodeTemplate());
    caboTemplateMap.add('cabo48FINT', this.cabo48FINT.getNodeTemplate());

    caboTemplateMap.add('cabo72F_D', this.cabo72FNAC_D.getNodeTemplate());
    caboTemplateMap.add('cabo72F', this.cabo72FNAC.getNodeTemplate());
    caboTemplateMap.add('cabo72FINT_D', this.cabo72FINT_D.getNodeTemplate());
    caboTemplateMap.add('cabo72FINT', this.cabo72FINT.getNodeTemplate());

    caboTemplateMap.add('cabo144F_D', this.cabo144FNAC_D.getNodeTemplate());
    caboTemplateMap.add('cabo144F', this.cabo144FNAC.getNodeTemplate());
    caboTemplateMap.add('cabo144FINT_D', this.cabo144FINT_D.getNodeTemplate());
    caboTemplateMap.add('cabo144FINT', this.cabo144FINT.getNodeTemplate());

    caboTemplateMap.add('splitter12', this.splitter12.getNodeTemplate());
    caboTemplateMap.add('splitter14', this.splitter14.getNodeTemplate());
    caboTemplateMap.add('splitter18', this.splitter18.getNodeTemplate());
    caboTemplateMap.add('splitter116', this.splitter116.getNodeTemplate());
    caboTemplateMap.add('splitterDesb', this.splitterDesb.getNodeTemplate());
    caboTemplateMap.add('splitter132', this.splitter132.getNodeTemplate());
    caboTemplateMap.add('splitter164', this.splitter164.getNodeTemplate());
    caboTemplateMap.add('splitter1128', this.splitter1128.getNodeTemplate());
    caboTemplateMap.add('splitter1256', this.splitter116.getNodeTemplate());

    caboTemplateMap.add('dio6F', this.dio6F.getNodeTemplate());
    caboTemplateMap.add('dio8F', this.dio8F.getNodeTemplate());
    caboTemplateMap.add('dio12F', this.dio12F.getNodeTemplate());
    caboTemplateMap.add('dio24F', this.dio24F.getNodeTemplate());
    caboTemplateMap.add('dio36F', this.dio36F.getNodeTemplate());
    caboTemplateMap.add('dio48F', this.dio48F.getNodeTemplate());
    caboTemplateMap.add('dio72F', this.dio72F.getNodeTemplate());
    caboTemplateMap.add('dio84F', this.dio84F.getNodeTemplate());
    caboTemplateMap.add('dio144F', this.dio144F.getNodeTemplate());

    caboTemplateMap.add(
      'text',
      new go.Node('Spot').add(
        new go.TextBlock({
          font: 'bold 16pt sans-serif',
          stroke: 'white',
          margin: 10,
          editable: false,
        }).bind('text'),
      ).bind(new go.Binding('position', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify)),
    );

    return caboTemplateMap;
  }

  selectCableModelByCapacity(
    capacidade: number,
    codigo: number,
    tubo: number,
    isLadoDireito: boolean,
  ): go.ObjectData {
    if (capacidade <= 1) {
      if (codigo === 2) {
        return isLadoDireito
          ? this.cabo1FNAC_D.getModelDefinition()
          : this.cabo1FNAC.getModelDefinition();
      }
      return isLadoDireito
        ? this.cabo1FINT_D.getModelDefinition()
        : this.cabo1FINT.getModelDefinition();
    }

    if (capacidade <= 2) {
      if (codigo === 2) {
        return isLadoDireito
          ? this.cabo2FNAC_D.getModelDefinition()
          : this.cabo2FNAC.getModelDefinition();
      }
      return isLadoDireito
        ? this.cabo2FINT_D.getModelDefinition()
        : this.cabo2FINT.getModelDefinition();
    }

    if (capacidade <= 4) {
      if (codigo === 2) {
        return isLadoDireito
          ? this.cabo4FNAC_D.getModelDefinition()
          : this.cabo4FNAC.getModelDefinition();
      }
      return isLadoDireito
        ? this.cabo4FINT_D.getModelDefinition()
        : this.cabo4FINT.getModelDefinition();
    }

    if (capacidade <= 6) {
      if (codigo === 2) {
        return isLadoDireito
          ? this.cabo6FNAC_D.getModelDefinition()
          : this.cabo6FNAC.getModelDefinition();
      }
      return isLadoDireito
        ? this.cabo6FINT_D.getModelDefinition()
        : this.cabo6FINT.getModelDefinition();
    }

    if (capacidade <= 8) {
      if (codigo === 2) {
        return isLadoDireito
          ? this.cabo8FNAC_D.getModelDefinition()
          : this.cabo8FNAC.getModelDefinition();
      }
      return isLadoDireito
        ? this.cabo8FINT_D.getModelDefinition()
        : this.cabo8FINT.getModelDefinition();
    }

    if (capacidade <= 12) {
      if (codigo === 2) {
        if (tubo === 2) {
          return isLadoDireito
            ? this.cabo12FNAC_D_TB2.getModelDefinition()
            : this.cabo12FNAC_TB2.getModelDefinition();
        }
        if (tubo === 6) {
          return isLadoDireito
            ? this.cabo12F_NAC_D.getModelDefinition()
            : this.cabo12F_NAC.getModelDefinition();
        }
        return isLadoDireito
          ? this.cabo12FNAC_D_TB12.getModelDefinition()
          : this.cabo12FNAC_TB12.getModelDefinition();
      }
      if (tubo === 2) {
        return isLadoDireito
          ? this.cabo12FINT_D_TB2.getModelDefinition()
          : this.cabo12FINT_TB2.getModelDefinition();
      }
      if (tubo === 6) {
        return isLadoDireito
          ? this.cabo12FINT_D.getModelDefinition()
          : this.cabo12FINT.getModelDefinition();
      }
      return isLadoDireito
        ? this.cabo12FINT_D_TB12.getModelDefinition()
        : this.cabo12FINT_TB12.getModelDefinition();
    }

    if (capacidade <= 24) {
      if (codigo === 2) {
        if (tubo === 6) {
          return isLadoDireito
            ? this.cabo24FNAC_D.getModelDefinition()
            : this.cabo24FNAC.getModelDefinition();
        }
        if (tubo === 24) {
          return isLadoDireito
            ? this.cabo24FNAC_D_TB24.getModelDefinition()
            : this.cabo24FNAC_TB24.getModelDefinition();
        }
        return isLadoDireito
          ? this.cabo24FNAC_D.getModelDefinition()
          : this.cabo24FNAC.getModelDefinition();
      }
      if (tubo === 6) {
        return isLadoDireito
          ? this.cabo24FINT_D.getModelDefinition()
          : this.cabo24FINT.getModelDefinition();
      }
      if (tubo === 24) {
        return isLadoDireito
          ? this.cabo24FINT_D_TB24.getModelDefinition()
          : this.cabo24FINT_TB24.getModelDefinition();
      }
      return isLadoDireito
        ? this.cabo24FINT_D.getModelDefinition()
        : this.cabo24FINT.getModelDefinition();
    }

    if (capacidade <= 36) {
      if (codigo === 2) {
        return isLadoDireito
          ? this.cabo36FNAC_D.getModelDefinition()
          : this.cabo36FNAC.getModelDefinition();
      }
      return isLadoDireito
        ? this.cabo36FINT_D.getModelDefinition()
        : this.cabo36FINT.getModelDefinition();
    }

    if (capacidade <= 48) {
      if (codigo === 2) {
        return isLadoDireito
          ? this.cabo48FNAC_D.getModelDefinition()
          : this.cabo48FNAC.getModelDefinition();
      }
      return isLadoDireito
        ? this.cabo48FINT_D.getModelDefinition()
        : this.cabo48FINT.getModelDefinition();
    }

    if (capacidade <= 72) {
      if (codigo === 2) {
        return isLadoDireito
          ? this.cabo72FNAC_D.getModelDefinition()
          : this.cabo72FNAC.getModelDefinition();
      }
      return isLadoDireito
        ? this.cabo72FINT_D.getModelDefinition()
        : this.cabo72FINT.getModelDefinition();
    }

    if (capacidade <= 144) {
      if (codigo === 2) {
        return isLadoDireito
          ? this.cabo144FNAC_D.getModelDefinition()
          : this.cabo144FNAC.getModelDefinition();
      }
      return isLadoDireito
        ? this.cabo144FINT_D.getModelDefinition()
        : this.cabo144FINT.getModelDefinition();
    }

    console.warn(
      `Condição não prevista: capacidade=${capacidade}, codigo=${codigo}, tubo=${tubo}`,
    );
    return isLadoDireito
      ? this.cabo12F_NAC_D.getModelDefinition()
      : this.cabo12F_NAC.getModelDefinition();
  }
}

export const gojsCableStencilRegistry = new GojsCableStencilRegistry();
