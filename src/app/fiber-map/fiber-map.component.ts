import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaCaixasComponent } from '../lista-caixas/lista-caixas.component';
import { ListaCtosComponent } from '../lista-ctos/lista-ctos.component';
import { ListaCtosSpComponent } from '../lista-ctos-sp/lista-ctos-sp.component';
import { GoogleMapsComponent } from '../google-maps/google-maps.component';
import { ListaCabos1fComponent } from '../lista-cabos1f/lista-cabos1f.component';
import { ListaCabos2fComponent } from '../lista-cabos2f/lista-cabos2f.component';
import { ListaCabos4fComponent } from '../lista-cabos4f/lista-cabos4f.component';
import { ListaCabos6fComponent } from '../lista-cabos6f/lista-cabos6f.component';
import { ListaCabos8fComponent } from '../lista-cabos8f/lista-cabos8f.component';
import { ListaCabos12fComponent } from '../lista-cabos12f/lista-cabos12f.component';
import { ListaCabos24fComponent} from '../lista-cabos24f/lista-cabos24f.component';
import { ListaCabos36fComponent} from '../lista-cabos36f/lista-cabos36f.component';
import { ListaCabos48fComponent} from '../lista-cabos48f/lista-cabos48f.component';
import { ListaCabos72fComponent} from '../lista-cabos72f/lista-cabos72f.component';
import { ListaCabos144fComponent} from '../lista-cabos144f/lista-cabos144f.component';
import { ListaPopsESTComponent} from '../lista-pops-est/lista-pops-est.component';
import { ListaCondominiosComponent} from '../lista-condominios/lista-condominios.component';
import { Cabos1f } from '../modelo/Cabos1f';
import { Cabos2f } from '../modelo/Cabos2f';
import { Cabos4f } from '../modelo/Cabos4f';
import { Cabos6f } from '../modelo/Cabos6f';
import { Cabos8f } from '../modelo/Cabos8f';
import { Cabos12f } from '../modelo/Cabos12f';
import { Cabos24f } from '../modelo/Cabos24f';
import { Cabos36f } from '../modelo/Cabos36f';
import { Cabos48f } from '../modelo/Cabos48f';
import { Cabos72f } from '../modelo/Cabos72f';
import { Cabos144f } from '../modelo/Cabos144f';
import { Caixa} from '../modelo/Caixa';
import { Cto} from '../modelo/Cto';
import { PopsEst} from '../modelo/popsEst'
import { Condominios} from '../modelo/Condominios'
import { Cto_SP } from '../modelo/Cto_SP';




@Component({
  selector: 'app-fiber-map',
  templateUrl: './fiber-map.component.html',
  styleUrls: ['./fiber-map.component.css'],
  standalone: true,
  imports: [CommonModule, 
    ListaCaixasComponent, 
    ListaCtosComponent,
    ListaCtosSpComponent, 
    GoogleMapsComponent, 
    ListaCabos12fComponent, 
    ListaCabos24fComponent,
    ListaCabos36fComponent,
    ListaCabos48fComponent,
    ListaCabos72fComponent,
    ListaCabos144fComponent,
    ListaCabos8fComponent, 
    ListaCabos6fComponent,
    ListaCabos4fComponent,
    ListaCabos2fComponent,
    ListaCabos1fComponent,
    ListaPopsESTComponent,
    ListaCondominiosComponent

    ]
})
export class FiberMapComponent {
  caixasCEO: any[] = [];
  caixasCTO: any[] = [];
  caixasCTOSP: any[] = [];
  popEST: any[]=[];
  Condominios: any[]=[];

  cabos1f: Cabos1f []=[];
  cabos2f: Cabos2f []=[];
  cabos4f: Cabos4f []=[];
  cabos6f: Cabos6f []=[];
  cabos8f: Cabos8f []=[];
  cabos12f: Cabos12f[]=[];
  cabos24f: Cabos24f []=[];
  cabos36f: Cabos36f []=[];
  cabos48f: Cabos48f []=[];
  cabos72f: Cabos72f []=[];
  cabos144f: Cabos144f []=[];
   

  onCondominiosSelecionada(condominios: Condominios[]) { 
    this.Condominios = condominios;  
  }

  onPopsEstSelecionada(pops: PopsEst[]) { 
    this.popEST = pops;  
  }

  onCaixaSelecionada(caixas: Caixa[]) { //recebe caixas do template que recebe de lista caixa
    this.caixasCEO = caixas;  
  }

  onCTOSelecionada(ctos: Cto[]) {
    this.caixasCTO = ctos;
  }

  onCTOSPSelecionada(ctos_sp: Cto_SP[]) {
    this.caixasCTOSP = ctos_sp;
  }

  onCabosSelecionada(cabos: Cabos12f[]) {
    this.cabos12f = cabos;
  }

  onCabos1fSelecionada(cabos: Cabos1f[]) {
    this.cabos1f = cabos;
  }

  onCabos2fSelecionada(cabos: Cabos2f[]) {
    this.cabos2f = cabos;

  }

  onCabos4fSelecionada(cabos: Cabos4f[]) {
    this.cabos4f = cabos;

  }


  onCabos6fSelecionada(cabos: Cabos6f[]) {
    this.cabos6f = cabos;

}

  onCabos8fSelecionada(cabos: Cabos8f[]) {
    this.cabos8f = cabos;

}

  onCabos24fSelecionada(cabos: Cabos24f[]) {
      this.cabos24f = cabos;

  }

  onCabos36fSelecionada(cabos: Cabos36f[]) {
    this.cabos36f = cabos;

}

  onCabos48fSelecionada(cabos: Cabos48f[]) {
  this.cabos48f = cabos;

}

  onCabos72fSelecionada(cabos: Cabos72f[]) {
  this.cabos72f = cabos;

}

onCabos144fSelecionada(cabos: Cabos144f[]) {
  this.cabos144f = cabos;

}

  
}
