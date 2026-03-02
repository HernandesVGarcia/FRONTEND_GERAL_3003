import { Component, HostListener, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { PopsInfo } from '../modelo/PopsInfo';
import { PopInfoService } from '../servico/pop-info.service';
import { PopInfoUpdateService } from '../servico/pop-info-update.service';

export interface PopEstacaoInfoModalData {
  id_meta: number;
}

@Component({
  selector: 'app-pop-estacao-info-modal',
  standalone: true,
  imports: [
    CommonModule,
    NgbModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './pop-estacao-info-modal.component.html',
  styleUrls: ['./pop-estacao-info-modal.component.css']
})
export class PopEstacaoInfoModalComponent implements OnInit {
  data: PopEstacaoInfoModalData = { id_meta: 0 };

  popInfo: PopsInfo | null = null;
  isLoading = false;
  isEditing = false;
  errorMessage = '';

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

  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;

  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef;

  constructor(
    public activeModal: NgbActiveModal,
    private popInfoService: PopInfoService,
    private popInfoUpdateService: PopInfoUpdateService
  ) {}

  ngOnInit(): void {
    if (this.data?.id_meta) {
      this.loadPopInfo();
    }
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
        console.error('Erro ao carregar informações do POP/estação:', error);
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
      this.saveChanges();
    } else {
      this.isEditing = true;
    }
  }

  saveChanges(): void {
    if (!this.popInfo) return;

    this.popInfoUpdateService.updatePopInfo(this.data.id_meta, this.editForm).subscribe({
      next: (response) => {
        if (response.data) {
          this.popInfo = response.data;
          this.populateEditForm(response.data);
        }
        this.isEditing = false;
      },
      error: (error) => {
        console.error('Erro ao salvar alterações:', error);
        this.errorMessage = typeof error === 'string' ? error : 'Erro ao salvar alterações';
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
    this.activeModal.dismiss();
  }

  onMouseDown(event: MouseEvent): void {
    if (event.target instanceof HTMLElement) {
      const header = event.target.closest('.modal-header');
      if (header && !event.target.closest('.btn-close')) {
        this.initialX = event.clientX - this.xOffset;
        this.initialY = event.clientY - this.yOffset;
        if (event.target === header || header.contains(event.target)) {
          this.isDragging = true;
          event.preventDefault();
        }
      }
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      event.preventDefault();
      this.currentX = event.clientX - this.initialX;
      this.currentY = event.clientY - this.initialY;
      this.xOffset = this.currentX;
      this.yOffset = this.currentY;
      if (this.modalDialog) {
        this.modalDialog.nativeElement.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.initialX = this.currentX;
    this.initialY = this.currentY;
    this.isDragging = false;
  }
}
