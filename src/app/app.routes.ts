import {Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import { MapPageComponent } from './map-page/map-page.component';

import {MenusComponent} from './menus/menus.component';

export const routes: Routes =[
{path:'login', component:LoginComponent},
{path:'mapa', component:MapPageComponent},
{path:'', redirectTo:'/login', pathMatch:'full'},
{path:'**', component:MenusComponent}


];