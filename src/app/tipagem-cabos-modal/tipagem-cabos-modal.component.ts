import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class TipagemCabosModalComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Output() caboTypeConfirmed = new EventEmitter<TipagemCabosData>();
  @Output() modalClosed = new EventEmitter<void>();

  // Opções de Capacidade
  capacidades: string[] = ['1F', '2F', '4F', '6F','8F', '12F', '18F', '24F', '36F', '48F', '72F', '144F'];
  
  // Opções de Fibras por Tubo
  fibrasPorTubo: string[] = ['2F', '6F', '8F', '12F', '24F'];
  
  // Opções de Código de Cores
  codigosCores: ('TIA/EIA 598' | 'Telebras')[] = ['TIA/EIA 598', 'Telebras'];

  // Valores do formulário
  selectedCapacidade: string = '';
  selectedFibrasPorTubo: string = '';
  selectedCodigoCores: 'TIA/EIA 598' | 'Telebras' = 'TIA/EIA 598';
  labelCabo: string = '';

  // Persistência local das últimas seleções
  private storagePrefix = 'tipagemCabos.last.';

  ngOnInit(): void {
    // Inicializar valores padrão se necessário
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.loadLastSelections();
    }
  }

  private saveLastSelections(): void {
    try {
      localStorage.setItem(this.storagePrefix + 'capacidade', this.selectedCapacidade || '');
      localStorage.setItem(this.storagePrefix + 'fibrasPorTubo', this.selectedFibrasPorTubo || '');
      localStorage.setItem(this.storagePrefix + 'codigoCores', this.selectedCodigoCores || 'TIA/EIA 598');
      localStorage.setItem(this.storagePrefix + 'label', this.labelCabo || '');
    } catch {}
  }

  private loadLastSelections(): void {
    try {
      const cap = localStorage.getItem(this.storagePrefix + 'capacidade');
      const fpt = localStorage.getItem(this.storagePrefix + 'fibrasPorTubo');
      const cc = localStorage.getItem(this.storagePrefix + 'codigoCores') as ('TIA/EIA 598' | 'Telebras') | null;
      const label = localStorage.getItem(this.storagePrefix + 'label');

      if (cap) this.selectedCapacidade = cap;
      if (fpt) this.selectedFibrasPorTubo = fpt;
      if (cc === 'TIA/EIA 598' || cc === 'Telebras') this.selectedCodigoCores = cc;
      if (label !== null) this.labelCabo = label;
    } catch {}
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
    // Salvar escolhas para a próxima abertura
    this.saveLastSelections();
    this.caboTypeConfirmed.emit(tipagemData);
  }

  fecharModal(): void {
    console.log('❌ Fechando modal de tipagem');
    this.modalClosed.emit();
    // Mantém seleções para agilizar próxima criação
  }

  private limparFormulario(): void {
    this.selectedCapacidade = '';
    this.selectedFibrasPorTubo = '';
    this.selectedCodigoCores = 'TIA/EIA 598';
    this.labelCabo = '';
  }
}

