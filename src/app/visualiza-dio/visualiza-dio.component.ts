import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VisualizaDioData, VisualizaDioConfig } from '../modelo/VisualizaDioData';
import { VisualizaDioService } from '../servico/visualiza-dio.service';

export interface VisualizaDioDialogData {
  id_meta: number;
  config?: VisualizaDioConfig;
  capacity?: number;
}

@Component({
  selector: 'app-visualiza-dio',
  templateUrl: './visualiza-dio.component.html',
  styleUrls: ['./visualiza-dio.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ]
})
export class VisualizaDioComponent implements OnInit, OnDestroy {
  visualizaDioData: VisualizaDioData | null = null;
  isEditing = false;
  isLoading = false;
  errorMessage = '';
  
  // Formulário reativo
  visualizaDioForm: FormGroup;
  
  // Configurações
  config: VisualizaDioConfig;
  visibleFields: string[] = [];
  
  // Controle de grupos de fibras
  selectedGroup = 1; // Grupo selecionado
  fiberGroups: any[] = [];
  capacity = 144; // Capacidade padrão
  
  // Dados do FlexGrid (4 colunas x 12 linhas)
  flexGridData: any[][] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<VisualizaDioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VisualizaDioDialogData,
    private visualizaDioService: VisualizaDioService,
    private fb: FormBuilder
  ) {
    // Configuração padrão
    this.config = {
      title: `Visualiza DIO - ${data.capacity || 144}F`,
      isEditable: true,
      showAllFields: false,
      ...data.config
    };

    // Definir capacidade
    this.capacity = data.capacity || 144;
    
    // Gerar grupos de fibras baseados na capacidade
    this.generateFiberGroups();
    
    // Gerar campos visíveis baseado na capacidade
    this.visibleFields = this.visualizaDioService.generateFieldsByCapacity(this.capacity);

    // Inicializar formulário
    this.visualizaDioForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadVisualizaDioData();
    this.updateFlexGridData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    const formControls: any = {};
    
    // Criar controles para todos os campos visíveis
    this.visibleFields.forEach(field => {
      formControls[field] = [''];
    });

    return this.fb.group(formControls);
  }

  private loadVisualizaDioData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Simular dados de um DIO com 144 fibras para teste
    setTimeout(() => {
      const mockData: VisualizaDioData = {
        id_meta: this.data.id_meta,
        F1: 'Cliente 1 - João Silva',
        F2: 'Cliente 2 - Maria Santos',
        F3: 'Cliente 3 - Pedro Costa',
        F4: 'Cliente 4 - Ana Oliveira',
        F5: 'Cliente 5 - Carlos Lima',
        F6: 'Cliente 6 - Fernanda Rocha',
        F7: 'Cliente 7 - Roberto Alves',
        F8: 'Cliente 8 - Juliana Ferreira',
        F9: 'Cliente 9 - Marcos Souza',
        F10: 'Cliente 10 - Patricia Mendes',
        F11: 'Cliente 11 - Rafael Gomes',
        F12: 'Cliente 12 - Camila Dias',
        F13: 'Cliente 13 - Diego Martins',
        F14: 'Cliente 14 - Larissa Nunes',
        F15: 'Cliente 15 - Thiago Barbosa',
        F16: 'Cliente 16 - Beatriz Castro',
        F17: 'Cliente 17 - Gabriel Silva',
        F18: 'Cliente 18 - Marina Costa',
        F19: 'Cliente 19 - Lucas Pereira',
        F20: 'Cliente 20 - Isabella Santos',
        F21: 'Cliente 21 - Bruno Oliveira',
        F22: 'Cliente 22 - Gabriela Lima',
        F23: 'Cliente 23 - Felipe Rocha',
        F24: 'Cliente 24 - Amanda Alves',
        F25: 'Cliente 25 - Vinicius Ferreira',
        F26: 'Cliente 26 - Carolina Souza',
        F27: 'Cliente 27 - André Mendes',
        F28: 'Cliente 28 - Renata Gomes',
        F29: 'Cliente 29 - Daniel Dias',
        F30: 'Cliente 30 - Natália Martins',
        F31: 'Cliente 31 - Gustavo Nunes',
        F32: 'Cliente 32 - Priscila Barbosa',
        F33: 'Cliente 33 - Henrique Castro',
        F34: 'Cliente 34 - Débora Silva',
        F35: 'Cliente 35 - Leandro Costa',
        F36: 'Cliente 36 - Tatiana Pereira',
        F37: 'Cliente 37 - Rodrigo Santos',
        F38: 'Cliente 38 - Vanessa Oliveira',
        F39: 'Cliente 39 - Marcelo Lima',
        F40: 'Cliente 40 - Simone Rocha',
        F41: 'Cliente 41 - Alexandre Alves',
        F42: 'Cliente 42 - Cristiane Ferreira',
        F43: 'Cliente 43 - Fabio Souza',
        F44: 'Cliente 44 - Adriana Mendes',
        F45: 'Cliente 45 - Ricardo Gomes',
        F46: 'Cliente 46 - Mônica Dias',
        F47: 'Cliente 47 - Sérgio Martins',
        F48: 'Cliente 48 - Elaine Nunes',
        F49: 'Cliente 49 - César Barbosa',
        F50: 'Cliente 50 - Rosana Castro',
        F51: 'Cliente 51 - Antonio Silva',
        F52: 'Cliente 52 - Sandra Costa',
        F53: 'Cliente 53 - José Pereira',
        F54: 'Cliente 54 - Lucia Santos',
        F55: 'Cliente 55 - Francisco Oliveira',
        F56: 'Cliente 56 - Rita Lima',
        F57: 'Cliente 57 - João Rocha',
        F58: 'Cliente 58 - Maria Alves',
        F59: 'Cliente 59 - Pedro Ferreira',
        F60: 'Cliente 60 - Ana Souza',
        F61: 'Cliente 61 - Carlos Mendes',
        F62: 'Cliente 62 - Fernanda Gomes',
        F63: 'Cliente 63 - Roberto Dias',
        F64: 'Cliente 64 - Juliana Martins',
        F65: 'Cliente 65 - Marcos Nunes',
        F66: 'Cliente 66 - Patricia Barbosa',
        F67: 'Cliente 67 - Rafael Castro',
        F68: 'Cliente 68 - Camila Silva',
        F69: 'Cliente 69 - Diego Costa',
        F70: 'Cliente 70 - Larissa Pereira',
        F71: 'Cliente 71 - Thiago Santos',
        F72: 'Cliente 72 - Beatriz Oliveira',
        F73: 'Cliente 73 - Gabriel Lima',
        F74: 'Cliente 74 - Marina Rocha',
        F75: 'Cliente 75 - Lucas Alves',
        F76: 'Cliente 76 - Isabella Ferreira',
        F77: 'Cliente 77 - Bruno Souza',
        F78: 'Cliente 78 - Gabriela Mendes',
        F79: 'Cliente 79 - Felipe Gomes',
        F80: 'Cliente 80 - Amanda Dias',
        F81: 'Cliente 81 - Vinicius Martins',
        F82: 'Cliente 82 - Carolina Nunes',
        F83: 'Cliente 83 - André Barbosa',
        F84: 'Cliente 84 - Renata Castro',
        F85: 'Cliente 85 - Daniel Silva',
        F86: 'Cliente 86 - Natália Costa',
        F87: 'Cliente 87 - Gustavo Pereira',
        F88: 'Cliente 88 - Priscila Santos',
        F89: 'Cliente 89 - Henrique Oliveira',
        F90: 'Cliente 90 - Débora Lima',
        F91: 'Cliente 91 - Leandro Rocha',
        F92: 'Cliente 92 - Tatiana Alves',
        F93: 'Cliente 93 - Rodrigo Ferreira',
        F94: 'Cliente 94 - Vanessa Souza',
        F95: 'Cliente 95 - Marcelo Mendes',
        F96: 'Cliente 96 - Simone Gomes',
        F97: 'Cliente 97 - Alexandre Dias',
        F98: 'Cliente 98 - Cristiane Martins',
        F99: 'Cliente 99 - Fabio Nunes',
        F100: 'Cliente 100 - Adriana Barbosa',
        F101: 'Cliente 101 - Ricardo Castro',
        F102: 'Cliente 102 - Mônica Silva',
        F103: 'Cliente 103 - Sérgio Costa',
        F104: 'Cliente 104 - Elaine Pereira',
        F105: 'Cliente 105 - César Santos',
        F106: 'Cliente 106 - Rosana Oliveira',
        F107: 'Cliente 107 - Antonio Lima',
        F108: 'Cliente 108 - Sandra Rocha',
        F109: 'Cliente 109 - José Alves',
        F110: 'Cliente 110 - Lucia Ferreira',
        F111: 'Cliente 111 - Francisco Souza',
        F112: 'Cliente 112 - Rita Mendes',
        F113: 'Cliente 113 - João Gomes',
        F114: 'Cliente 114 - Maria Dias',
        F115: 'Cliente 115 - Pedro Martins',
        F116: 'Cliente 116 - Ana Nunes',
        F117: 'Cliente 117 - Carlos Barbosa',
        F118: 'Cliente 118 - Fernanda Castro',
        F119: 'Cliente 119 - Roberto Silva',
        F120: 'Cliente 120 - Juliana Costa',
        F121: 'Cliente 121 - Marcos Pereira',
        F122: 'Cliente 122 - Patricia Santos',
        F123: 'Cliente 123 - Rafael Oliveira',
        F124: 'Cliente 124 - Camila Lima',
        F125: 'Cliente 125 - Diego Rocha',
        F126: 'Cliente 126 - Larissa Alves',
        F127: 'Cliente 127 - Thiago Ferreira',
        F128: 'Cliente 128 - Beatriz Souza',
        F129: 'Cliente 129 - Gabriel Mendes',
        F130: 'Cliente 130 - Marina Gomes',
        F131: 'Cliente 131 - Lucas Dias',
        F132: 'Cliente 132 - Isabella Martins',
        F133: 'Cliente 133 - Bruno Nunes',
        F134: 'Cliente 134 - Gabriela Barbosa',
        F135: 'Cliente 135 - Felipe Castro',
        F136: 'Cliente 136 - Amanda Silva',
        F137: 'Cliente 137 - Vinicius Costa',
        F138: 'Cliente 138 - Carolina Pereira',
        F139: 'Cliente 139 - André Santos',
        F140: 'Cliente 140 - Renata Oliveira',
        F141: 'Cliente 141 - Daniel Lima',
        F142: 'Cliente 142 - Natália Rocha',
        F143: 'Cliente 143 - Gustavo Alves',
        F144: 'Cliente 144 - Priscila Ferreira'
      };

      this.visualizaDioData = mockData;
      this.populateForm(mockData);
      this.isLoading = false;
    }, 1000); // Simular delay de carregamento
  }

  private populateForm(data: VisualizaDioData): void {
    const formData: any = {};
    
    this.visibleFields.forEach(field => {
      formData[field] = (data as any)[field] || '';
    });

    this.visualizaDioForm.patchValue(formData);
  }

  toggleEdit(): void {
    if (!this.config.isEditable) return;
    
    this.isEditing = !this.isEditing;
    
    if (this.isEditing) {
      this.visualizaDioForm.enable();
    } else {
      this.visualizaDioForm.disable();
    }
  }

  saveChanges(): void {
    if (!this.visualizaDioData || !this.visualizaDioForm.valid) return;

    const formData = this.visualizaDioForm.value;
    const updateData: Partial<VisualizaDioData> = {};

    // Preparar dados para atualização
    this.visibleFields.forEach(field => {
      const value = formData[field];
      if (value && value.trim() !== '') {
        (updateData as any)[field] = value.trim();
      }
    });

    this.isLoading = true;

    // Simular salvamento para teste
    setTimeout(() => {
      console.log('Dados salvos (simulado):', updateData);
      
      // Atualizar dados locais
      if (this.visualizaDioData) {
        Object.assign(this.visualizaDioData, updateData);
        this.populateForm(this.visualizaDioData);
      }
      
      this.isEditing = false;
      this.visualizaDioForm.disable();
      this.isLoading = false;
    }, 1500); // Simular delay de salvamento
  }

  cancelEdit(): void {
    if (this.visualizaDioData) {
      this.populateForm(this.visualizaDioData);
    }
    this.isEditing = false;
    this.visualizaDioForm.disable();
  }

  getFieldValue(field: string): string {
    if (!this.visualizaDioData) return '';
    return (this.visualizaDioData as any)[field] || '';
  }

  isFieldFilled(field: string): boolean {
    const value = this.getFieldValue(field);
    return this.visualizaDioService.isFieldValid(value);
  }

  getFilledFieldsCount(): number {
    if (!this.visualizaDioData) return 0;
    return this.visualizaDioService.countFilledFields(this.visualizaDioData, this.visibleFields);
  }

  getTotalFieldsCount(): number {
    return this.visibleFields.length;
  }

  getProgressPercentage(): number {
    const filled = this.getFilledFieldsCount();
    const total = this.getTotalFieldsCount();
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  }

  close(): void {
    this.dialogRef.close();
  }

  // Métodos para controle de grupos de fibras
  selectGroup(groupId: number): void {
    this.selectedGroup = groupId;
    this.updateFlexGridData();
    console.log('Grupo selecionado:', this.selectedGroup);
  }

  getCurrentGroup() {
    return this.fiberGroups.find(g => g.id === this.selectedGroup);
  }

  generateFiberGroups(): void {
    this.fiberGroups = [];
    let groupId = 1;
    
    // Gerar grupos de 12 fibras cada
    for (let start = 1; start <= this.capacity; start += 12) {
      const end = Math.min(start + 11, this.capacity);
      this.fiberGroups.push({
        id: groupId,
        label: `${start} a ${end}`,
        start: start,
        end: end
      });
      groupId++;
    }
    
    // Selecionar o primeiro grupo por padrão
    this.selectedGroup = 1;
  }

  getConnectorNumbers(): number[] {
    const group = this.getCurrentGroup();
    if (group) {
      const numbers = [];
      for (let i = group.start; i <= group.end; i++) {
        numbers.push(i);
      }
      return numbers;
    }
    return [];
  }

  updateFlexGridData(): void {
    const group = this.getCurrentGroup();
    if (!group) return;
    
    // Calcular número de linhas baseado no grupo selecionado
    const fibersInGroup = group.end - group.start + 1;
    const rowsNeeded = Math.min(fibersInGroup, 12); // Máximo 12 linhas
    
    this.flexGridData = [];
    for (let row = 0; row < rowsNeeded; row++) {
      this.flexGridData[row] = [];
      for (let col = 0; col < 4; col++) {
        this.flexGridData[row][col] = {
          value: '',
          editable: true
        };
      }
    }
  }

  onConnectorClick(connectorNumber: number): void {
    console.log('Conector clicado:', connectorNumber);
    // Aqui você pode adicionar lógica específica para cada conector
  }

  onFlexGridCellChange(row: number, col: number, value: string): void {
    if (this.flexGridData[row] && this.flexGridData[row][col]) {
      this.flexGridData[row][col].value = value;
      console.log(`FlexGrid [${row}][${col}] = ${value}`);
    }
  }

  getCurrentFiberNumber(rowIndex: number): number {
    const group = this.getCurrentGroup();
    if (group) {
      return group.start + rowIndex;
    }
    return rowIndex + 1;
  }

  onTracerClick(fiberNumber: number): void {
    console.log('Tracer clicado para fibra:', fiberNumber);
    // Aqui você pode implementar a lógica para acionar o tracer da rota
    // e gerar diagramas unifilares
    alert(`Tracer acionado para fibra ${fiberNumber}`);
  }
}
