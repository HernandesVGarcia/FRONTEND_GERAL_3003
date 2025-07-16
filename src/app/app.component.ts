import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import {MatToolbarModule} from '@angular/material/toolbar'
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';

import { RotasComponent } from "./rotas/rotas.component";
import { AppLifecycleService } from './servico/app-lifecycle.service';




@Component({
  selector: 'app-root',
  templateUrl:'./app.component.html',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, MatToolbarModule, MatIconModule, MatMenuModule,RotasComponent],
  styleUrls:['./app.component.css'],
  
  
  
})
export class AppComponent implements OnInit {
  //title:string="Fiberworks"

  constructor(private appLifecycleService: AppLifecycleService) {}

  title = 'Sistema de Documentação de Redes Ópticas';

   ngOnInit(): void {
    // O AppLifecycleService já configura tudo automaticamente no constructor
    console.log('🚀 App inicializado com gerenciamento de heartbeat');
  }
  
  }




