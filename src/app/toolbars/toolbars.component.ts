import { Component } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar'
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-toolbars',
  imports: [MatToolbarModule,MatIconModule],
  templateUrl: './toolbars.component.html',
  styleUrl: './toolbars.component.css'
})
export class ToolbarsComponent {

}
