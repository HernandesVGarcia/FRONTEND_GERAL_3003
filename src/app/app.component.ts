import { Component, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import {MatToolbarModule} from '@angular/material/toolbar'
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';

import { MenusComponent } from "./menus/menus.component";
import { ToolbarsComponent } from "./toolbars/toolbars.component";
import { FiberMapComponent } from "./fiber-map/fiber-map.component";
import { RotasComponent } from "./rotas/rotas.component";


@Component({
  selector: 'app-root',
  templateUrl:'./app.component.html',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, MatToolbarModule, MatIconModule, MatMenuModule,  MenusComponent, ToolbarsComponent, FiberMapComponent,RotasComponent],
  styleUrls:['./app.component.css'],
  
  
  
})
export class AppComponent  {
  title:string="Fiberworks"
}