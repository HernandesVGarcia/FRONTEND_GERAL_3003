import {Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import { MapPageComponent } from './map-page/map-page.component';

import {MenusComponent} from './menus/menus.component';
import { FiberMapComponent } from './fiber-map/fiber-map.component';
import { authGuard } from './guards/auth.guard';
//import { CaixaInternaSyncComponent } from './caixa-interna-sync/caixa-interna-sync.component';
////comentei em 10072025 import { CaixaInternaComponent } from './caixa-interna/caixa-interna.component';
import {GoJSDemoComponent}from './gojs-demo/gojs-demo.component'

export const routes: Routes =[
{path:'login', component:LoginComponent}, //rota para login.component
{path:'mapa', component:MapPageComponent, canActivate: [authGuard]}, //rota para map-page.component
{path:'fibermap', component: FiberMapComponent, canActivate: [authGuard]}, //rota para fiber-map.component
//comentei em 10072025{path:'caixaInterna', component: CaixaInternaComponent },
//{path:'go',component:GoJSDemoComponent},
{path:'', redirectTo:'/login', pathMatch:'full'},
{path:'**', component:MenusComponent}


];