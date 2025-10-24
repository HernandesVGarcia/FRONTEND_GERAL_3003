import {Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import { MapPageComponent } from './map-page/map-page.component';

import {MenusComponent} from './menus/menus.component';
import { FiberMapComponent } from './fiber-map/fiber-map.component';
//import { CaixaInternaSyncComponent } from './caixa-interna-sync/caixa-interna-sync.component';
////comentei em 10072025 import { CaixaInternaComponent } from './caixa-interna/caixa-interna.component';
import {GoJSDemoComponent}from './gojs-demo/gojs-demo.component'
import {GoJSPopupComponent} from './gojs-popup/gojs-popup.component'

export const routes: Routes =[
{path:'login', component:LoginComponent},
{path:'mapa', component:MapPageComponent},
{path:'fibermap', component: FiberMapComponent },
//comentei em 10072025{path:'caixaInterna', component: CaixaInternaComponent },
//{path:'go',component:GoJSDemoComponent},
{path:'gojs-popup', component: GoJSPopupComponent}, // 🆕 NOVO: Rota para popup do GoJS
{path:'', redirectTo:'/login', pathMatch:'full'},
{path:'**', component:MenusComponent}


];