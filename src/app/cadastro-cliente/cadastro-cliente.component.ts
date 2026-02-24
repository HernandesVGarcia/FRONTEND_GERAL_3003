import { Component, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { InsertClienteService, InsertClienteRequest } from '../servico/insert-cliente.service';
import { AuthService } from '../servico/auth.service';

@Component({
  selector: 'app-cadastro-cliente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    MatIconModule
  ],
  templateUrl: './cadastro-cliente.component.html',
  styleUrls: ['./cadastro-cliente.component.css']
})
export class CadastroClienteComponent {
  salvando = false;

  form = {
    nome: '',
    numeroContrato: '',
    cnpjCpf: '',
    logradouro: '',
    complemento: '',
    numero: '',
    bairro: '',
    cep: '',
    telefone: '',
    observacoes: ''
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
    private insertClienteService: InsertClienteService,
    private authService: AuthService
  ) {}

  cadastrar(): void {
    if (!this.form.nome?.trim()) {
      alert('Por favor, preencha o campo Nome.');
      return;
    }
    if (!this.form.numeroContrato?.trim()) {
      alert('Por favor, preencha o campo Número/Contrato.');
      return;
    }

    const idCity = this.authService.getIdCity();
    if (!idCity) {
      alert('Cidade não encontrada. Selecione uma cidade no workspace.');
      return;
    }

    const dados: InsertClienteRequest = {
      CONTRATO_GPON: this.form.numeroContrato?.trim() || '0',
      CNPJ: this.form.cnpjCpf?.trim() || '',
      SIGLA: this.form.nome.trim(),
      ENDEREÇO: this.form.logradouro?.trim() || '',
      NUMERO: this.form.numero?.trim() || '',
      COMPLEMENTO: this.form.complemento?.trim() || '',
      BAIRRO: this.form.bairro?.trim() || '',
      CEP: this.form.cep?.trim() || '',
      TELEFONE: this.form.telefone?.trim() || '',
      id_city: idCity,
      id_condominio: 0,
      OBS: this.form.observacoes?.trim() || '',
      POP_ESTACAO: 0
    };

    this.salvando = true;
    this.insertClienteService.cadastrar(dados).subscribe({
      next: (response) => {
        this.salvando = false;
        if (response.success) {
          this.activeModal.close({ success: true, id_estacao: response.id_estacao });
        } else {
          alert(response.error || response.message || 'Erro ao cadastrar cliente.');
        }
      },
      error: (err) => {
        this.salvando = false;
        alert(typeof err === 'string' ? err : 'Erro ao cadastrar cliente. Tente novamente.');
      }
    });
  }

  fechar(): void {
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
