import { CommonModule } from "@angular/common";
import { Component , OnInit,Output,EventEmitter,} from "@angular/core";
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { DiagramModule } from '@syncfusion/ej2-angular-diagrams'



@Component({
  selector: 'app-caixa-interna-sync',
  imports: [DiagramModule,CommonModule],
  templateUrl: './caixa-interna-sync.component.html',
  styleUrl: './caixa-interna-sync.component.css',
  standalone:true,
})
export class CaixaInternaSyncComponent implements OnInit{
  @Output() onClose = new EventEmitter<void>();

  showCaixaInterna: boolean = true;
  
ngOnInit(): void {

  console.log("caiu no modulo ")
  this.abrirModal();

}


// Métodos para abrir e fechar
abrirModal() {
  console.log("Abrir modal executado")
  this.showCaixaInterna = true;
}

fecharModal() {
  this.showCaixaInterna = false;
}
}
  


