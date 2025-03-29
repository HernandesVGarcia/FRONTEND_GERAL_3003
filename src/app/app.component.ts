import { Component, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import {MatToolbarModule} from '@angular/material/toolbar'
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';

import { RotasComponent } from "./rotas/rotas.component";


@Component({
  selector: 'app-root',
  templateUrl:'./app.component.html',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, MatToolbarModule, MatIconModule, MatMenuModule,RotasComponent],
  styleUrls:['./app.component.css'],
  
  
  
})
export class AppComponent  {
  title:string="Fiberworks"
}