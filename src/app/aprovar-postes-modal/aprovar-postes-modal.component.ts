import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PosteConcessionaria } from '../modelo/poste-concessionaria';

export interface AprovarPostesConfirmacao {
  postes: PosteConcessionaria[];
  obs: string;
}

@Component({
  selector: 'app-aprovar-postes-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './aprovar-postes-modal.component.html',
  styleUrls: ['./aprovar-postes-modal.component.css'],
})
export class AprovarPostesModalComponent {
  @Input() postes: PosteConcessionaria[] = [];
  observacao = '';

  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;

  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef;

  constructor(public activeModal: NgbActiveModal) {}

  confirmar(): void {
    const obs = this.observacao.trim() !== '' ? this.observacao.trim() : '-';
    const resultado: AprovarPostesConfirmacao = {
      postes: this.postes,
      obs,
    };
    this.activeModal.close(resultado);
  }

  fechar(): void {
    this.activeModal.dismiss();
  }

  adicionarPostes(novos: PosteConcessionaria[]): void {
    if (!novos?.length) {
      return;
    }

    const existentes = new Set(
      this.postes.map((poste) => this.chavePoste(poste)),
    );
    const mesclados = [...this.postes];

    novos.forEach((poste) => {
      const chave = this.chavePoste(poste);
      if (!existentes.has(chave)) {
        mesclados.push(poste);
        existentes.add(chave);
      }
    });

    this.postes = mesclados;
  }

  private chavePoste(poste: PosteConcessionaria): string {
    const origem = String(poste.ORIGEM ?? '').trim();
    const numSeq = String(poste.NUM_SEQ_GEO).trim();
    return origem ? `${origem}|${numSeq}` : numSeq;
  }

  trackByPoste(_index: number, poste: PosteConcessionaria): string {
    return this.chavePoste(poste);
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
