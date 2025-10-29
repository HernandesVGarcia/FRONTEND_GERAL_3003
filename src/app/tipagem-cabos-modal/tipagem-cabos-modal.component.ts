import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';

export interface TipagemCabosData {
  capacidade: string;
  fibrasPorTubo: string;
  codigoCores: 'TIA/EIA 598' | 'Telebras';
  label: string;
}

@Component({
  selector: 'app-tipagem-cabos-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatRadioModule
  ],
  templateUrl: './tipagem-cabos-modal.component.html',
  styleUrls: ['./tipagem-cabos-modal.component.css']
})
export class TipagemCabosModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() caboTypeConfirmed = new EventEmitter<TipagemCabosData>();
  @Output() modalClosed = new EventEmitter<void>();

  // Opções de Capacidade
  capacidades: string[] = ['1F', '2F', '4F', '8F', '12F', '18F', '24F', '36F', '48F', '72F', '144F'];
  
  // Opções de Fibras por Tubo
  fibrasPorTubo: string[] = ['2F', '6F', '8F', '12F', '24F'];
  
  // Opções de Código de Cores
  codigosCores: ('TIA/EIA 598' | 'Telebras')[] = ['TIA/EIA 598', 'Telebras'];

  // Valores do formulário
  selectedCapacidade: string = '';
  selectedFibrasPorTubo: string = '';
  selectedCodigoCores: 'TIA/EIA 598' | 'Telebras' = 'TIA/EIA 598';
  labelCabo: string = '';

  ngOnInit(): void {
    // Inicializar valores padrão se necessário
  }

  confirmarTipagem(): void {
    // Validar se todos os campos obrigatórios estão preenchidos
    if (!this.selectedCapacidade || !this.selectedFibrasPorTubo || !this.selectedCodigoCores) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const tipagemData: TipagemCabosData = {
      capacidade: this.selectedCapacidade,
      fibrasPorTubo: this.selectedFibrasPorTubo,
      codigoCores: this.selectedCodigoCores,
      label: this.labelCabo || `Cabo ${this.selectedCapacidade}`
    };

    console.log('✅ Tipagem confirmada:', tipagemData);
    this.caboTypeConfirmed.emit(tipagemData);
    this.limparFormulario();
  }

  fecharModal(): void {
    console.log('❌ Fechando modal de tipagem');
    this.modalClosed.emit();
    this.limparFormulario();
  }

  private limparFormulario(): void {
    this.selectedCapacidade = '';
    this.selectedFibrasPorTubo = '';
    this.selectedCodigoCores = 'TIA/EIA 598';
    this.labelCabo = '';
  }
}

