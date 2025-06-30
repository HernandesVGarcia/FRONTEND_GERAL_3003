import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiberMapComponent } from '../fiber-map/fiber-map.component';
import { ToolbarsComponent} from '../toolbars/toolbars.component';
import { MenusComponent } from '../menus/menus.component';
import { AuthService} from '../servico/auth.service'
//import { CaixaInternaSyncComponent } from '../caixa-interna-sync/caixa-interna-sync.component';



@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [CommonModule, FiberMapComponent, ToolbarsComponent, MenusComponent],
  templateUrl: './map-page.component.html',   
  styleUrls: ['./map-page.component.css']
})
export class MapPageComponent {

constructor( 
  public authService:AuthService
){}

ngOnInit(){

  console.log ('---------------------->valor de menu_on ' , this.authService.getmenus_on())
}
}