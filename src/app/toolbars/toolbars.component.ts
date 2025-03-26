import { Component } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar'
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import {MatInputModule} from '@angular/material/input';
import {AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {FormControl,  ReactiveFormsModule} from '@angular/forms';



@Component({
  selector: 'app-toolbars',
  imports: [MatToolbarModule,MatIconModule,MatFormFieldModule,MatSelectModule,FormsModule,MatInputModule,AsyncPipe,MatAutocompleteModule,ReactiveFormsModule],
  templateUrl: './toolbars.component.html',
  styleUrl: './toolbars.component.css'
})
export class ToolbarsComponent {

 myControl = new FormControl('');
   options: string[] = ['Maringá', 'Sarandi', 'Umuarama'];
   filteredOptions: Observable<string[]> | undefined;
   
   
   
 
   ngOnInit() {
     this.filteredOptions = this.myControl.valueChanges.pipe(
       startWith(''),
       map(value => this._filter(value || '')),
     );
   }
 
   private _filter(value: string): string[] {
     const filterValue = value.toLowerCase();
 
     return this.options.filter(option => option.toLowerCase().includes(filterValue));
   }
 }
 
 console.log ("teste");



