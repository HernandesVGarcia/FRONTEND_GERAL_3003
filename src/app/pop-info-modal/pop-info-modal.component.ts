import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { PopsInfo } from '../modelo/PopsInfo';
import { PopInfoService } from '../servico/pop-info.service';
import { PopInfoUpdateService } from '../servico/pop-info-update.service';

export interface PopInfoModalData {
  id_meta: number;
}

@Component({
  selector: 'app-pop-info-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './pop-info-modal.component.html',
  styleUrls: ['./pop-info-modal.component.css']
})
export class PopInfoModalComponent implements OnInit {
  popInfo: PopsInfo | null = null;
  isLoading = false;
  isEditing = false;
  errorMessage = '';

  // Campos editáveis
  editForm = {
    SIGLA: '',
    ENDERECO: '',
    NUMERO: '',
    BAIRRO: '',
    COMPLEMENTO: '',
    CONTATO: '',
    TELEFONE: '',
    OBS: '',
    USUARIO: '',
    data: ''
  };

  constructor(
    public dialogRef: MatDialogRef<PopInfoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopInfoModalData,
    private popInfoService: PopInfoService,
    private popInfoUpdateService: PopInfoUpdateService
  ) {}

  ngOnInit(): void {
    this.loadPopInfo();
  }

  loadPopInfo(): void {
    this.isLoading = true;
    this.errorMessage = '';



    this.popInfoService.getPopInfo(this.data.id_meta).subscribe({
      next: (info) => {
        this.popInfo = info;
        if (info) {
          this.populateEditForm(info);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar informações do POP:', error);
        this.errorMessage = typeof error === 'string' ? error : 'Erro ao carregar informações';
        this.isLoading = false;
      }
    });
  }

  populateEditForm(info: PopsInfo): void {

    this.editForm = {
      SIGLA: info.SIGLA || '',
      ENDERECO: info.ENDERECO || '',
      NUMERO: info.NUMERO || '',
      BAIRRO: info.BAIRRO || '',
      COMPLEMENTO: info.COMPLEMENTO || '',
      CONTATO: info.CONTATO || '',
      TELEFONE: info.TELEFONE || '',
      OBS: info.OBS || '',
      USUARIO: info.USUARIO || '',
      data: info.data || ''
    };
  }

  toggleEdit(): void {
    if (this.isEditing) {
      // Salvar alterações
      this.saveChanges();
    } else {
      // Entrar em modo de edição
      this.isEditing = true;
    }
  }

  saveChanges(): void {
    if (!this.popInfo) return;

    console.log('Salvando alterações:', this.editForm);
    
    // Chamar o serviço de atualização
    this.popInfoUpdateService.updatePopInfo(this.data.id_meta, this.editForm).subscribe({
      next: (response) => {
        console.log('Atualização realizada com sucesso:', response);
        
        // Atualizar os dados locais se a resposta incluir dados atualizados
        if (response.data) {
          this.popInfo = response.data;
          this.populateEditForm(response.data);
        }
        
        // Sair do modo de edição
        this.isEditing = false;
        
        // TODO: Mostrar mensagem de sucesso para o usuário
      },
      error: (error) => {
        console.error('Erro ao salvar alterações:', error);
        this.errorMessage = typeof error === 'string' ? error : 'Erro ao salvar alterações';
        
        // TODO: Mostrar mensagem de erro para o usuário
      }
    });
  }

  cancelEdit(): void {
    if (this.popInfo) {
      this.populateEditForm(this.popInfo);
    }
    this.isEditing = false;
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}
