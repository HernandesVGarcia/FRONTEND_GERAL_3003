import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaCaixasComponent } from '../lista-caixas/lista-caixas.component';
import { ListaCtosComponent } from '../lista-ctos/lista-ctos.component';
import { GoogleMapsComponent } from '../google-maps/google-maps.component';
import { ListaCabos12fComponent } from '../lista-cabos12f/lista-cabos12f.component';
import { ListaCabos8fComponent } from '../lista-cabos8f/lista-cabos8f.component';
import { ListaCabos24fComponent} from '../lista-cabos24f/lista-cabos24f.component';
import { Cabos12f } from '../modelo/Cabos12f';
import { Cabos24f } from '../modelo/Cabos24f';
import { Cabos8f } from '../modelo/Cabos8f';


@Component({
  selector: 'app-fiber-map',
  templateUrl: './fiber-map.component.html',
  styleUrls: ['./fiber-map.component.css'],
  standalone: true,
  imports: [CommonModule, ListaCaixasComponent, ListaCtosComponent, GoogleMapsComponent, ListaCabos12fComponent, ListaCabos24fComponent, ListaCabos8fComponent]
})
export class FiberMapComponent {
  caixasCEO: any[] = [];
  caixasCTO: any[] = [];
  cabos12f: Cabos12f[]=[];
  cabos8f: Cabos8f []=[];
  cabos24f: Cabos24f []=[];


  onCaixaSelecionada(caixas: any[]) {
    this.caixasCEO = caixas;
  }

  onCTOSelecionada(ctos: any[]) {
    this.caixasCTO = ctos;
  }

  onCabosSelecionada(cabos: Cabos12f[]) {
    this.cabos12f = cabos;
  }

  onCabos8fSelecionada(cabos: Cabos8f[]) {
    this.cabos8f = cabos;

}

  onCabos24fSelecionada(cabos: Cabos24f[]) {
      this.cabos24f = cabos;

  }



}
