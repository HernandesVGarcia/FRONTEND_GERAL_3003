import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiberMapComponent } from '../fiber-map/fiber-map.component';
import { ToolbarsComponent} from '../toolbars/toolbars.component';
import { MenusComponent } from '../menus/menus.component';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [CommonModule, FiberMapComponent, ToolbarsComponent,MenusComponent],
  templateUrl: './map-page.component.html',   
  styleUrls: ['./map-page.component.css']
})
export class MapPageComponent {}