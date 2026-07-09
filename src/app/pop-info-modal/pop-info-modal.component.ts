import { Component, HostListener, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
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
    NgbModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './pop-info-modal.component.html',
  styleUrls: ['./pop-info-modal.component.css']
})
export class PopInfoModalComponent implements OnInit {
  private _data: PopInfoModalData = { id_meta: 0 };
  get data(): PopInfoModalData { return this._data; }
  set data(val: PopInfoModalData) {
    this._data = val || { id_meta: 0 };
    if (this._data.id_meta && !this.popInfo && !this.isLoading) {
      this.loadPopInfo();
    }
  }

  popInfo: PopsInfo | null = null;
  isLoading = false;
  isEditing = false;
  errorMessage = '';

  editForm = {
    SIGLA: '',
    CONTRATO_GPON: '',
    id_contrato: '',
    CNPJ: '',
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
        console.error('Erro ao carregar informações do POP:', error);
        this.errorMessage = typeof error === 'string' ? error : 'Erro ao carregar informações';
        this.isLoading = false;
      }
    });
  }

  populateEditForm(info: PopsInfo): void {
    this.editForm = {
      SIGLA: info.SIGLA || '',
      CONTRATO_GPON: info.CONTRATO_GPON || '',
      id_contrato: String(info.id_contrato ?? 0),
      CNPJ: info.CNPJ || '',
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

    const { USUARIO, data, ...payload } = this.editForm;
    this.popInfoUpdateService.updatePopInfo(this.data.id_meta, payload).subscribe({
      next: (response) => {
        if (response.data) {
          this.popInfo = response.data;
          this.populateEditForm(response.data);
        }
        const novaSigla = response?.data?.SIGLA ?? payload.SIGLA ?? this.editForm.SIGLA;
        if (novaSigla !== undefined && novaSigla !== '') {
          this.popInfoUpdateService.emitClienteAtualizado({
            id_meta: this.data.id_meta,
            sigla: novaSigla
          });
        }
        this.isEditing = false;
        this.activeModal.close(); // Fecha o modal após salvar as alterações 27022026
      },
      error: (error) => {
        console.error('Erro ao salvar alterações:', error);
        this.errorMessage = typeof error === 'string' ? error : 'Erro ao salvar alterações';
      }
    }
  );
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
