import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  UpdatePoligonoService,
  AtualizarGeometriaPoligonoPayload,
} from '../servico/update-poligono.service';

export interface LabelPoligonoDialogData {
  id_meta: number;
  Label: string;
  GOOGLE_LATLNG: Array<{ lat: number; lng: number }>;
  anchorX?: number;
  anchorY?: number;
}

@Component({
  selector: 'app-label-poligono-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './label-poligono-dialog.component.html',
  styleUrls: ['./label-poligono-dialog.component.css'],
})
export class LabelPoligonoDialogComponent implements AfterViewInit {
  private _data: LabelPoligonoDialogData = { id_meta: 0, Label: '', GOOGLE_LATLNG: [] };

  @Input()
  set data(value: LabelPoligonoDialogData) {
    this._data = value ?? { id_meta: 0, Label: '', GOOGLE_LATLNG: [] };
    const raw = this._data.Label;
    const s = raw === null || raw === undefined ? '' : String(raw).trim();
    this.texto = s === '(_)' ? '' : s;
  }
  get data(): LabelPoligonoDialogData {
    return this._data;
  }

  texto = '';
  salvando = false;
  erro: string | null = null;

  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;

  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef<HTMLElement>;

  constructor(
    public activeModal: NgbActiveModal,
    private updatePoligonoService: UpdatePoligonoService,
    private el: ElementRef<HTMLElement>,
  ) {}

  ngAfterViewInit(): void {
    this.schedulePositionAtAnchor();
  }

  private schedulePositionAtAnchor(): void {
    const ax = this._data.anchorX;
    const ay = this._data.anchorY;
    if (typeof ax !== 'number' || typeof ay !== 'number' || Number.isNaN(ax) || Number.isNaN(ay)) {
      return;
    }
    const run = () => {
      const host = this.el.nativeElement.closest('ngb-modal-window');
      if (!host) {
        return;
      }
      const outer = host.querySelector(':scope > .modal-dialog') as HTMLElement | null;
      if (!outer) {
        return;
      }
      const pad = 8;
      const inner = this.el.nativeElement.querySelector(':scope > .modal-dialog') as HTMLElement | null;
      let w = inner?.getBoundingClientRect().width ?? 0;
      if (w < 1) {
        w = 450;
      }
      let h = outer.getBoundingClientRect().height;
      if (h < 1) {
        h = 320;
      }
      outer.style.setProperty('max-width', `${w}px`, 'important');
      outer.style.setProperty('width', `${w}px`, 'important');
      const maxLeft = Math.max(pad, window.innerWidth - w - pad);
      const maxTop = Math.max(pad, window.innerHeight - h - pad);
      const left = Math.min(Math.max(ax, pad), maxLeft);
      const top = Math.min(Math.max(ay, pad), maxTop);
      outer.style.setProperty('position', 'fixed', 'important');
      outer.style.setProperty('margin', '0', 'important');
      outer.style.setProperty('left', `${left}px`, 'important');
      outer.style.setProperty('right', 'auto', 'important');
      outer.style.setProperty('top', `${top}px`, 'important');
      outer.style.setProperty('transform', 'none', 'important');
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
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

  cancelar(): void {
    this.activeModal.dismiss();
  }

  guardar(): void {
    const id_meta = this.data?.id_meta;
    if (!id_meta || id_meta <= 0) {
      this.erro = 'ID do polígono inválido.';
      return;
    }
    const coords = this.data?.GOOGLE_LATLNG;
    if (!coords || coords.length < 3) {
      this.erro = 'Geometria do polígono inválida (menos de 3 vértices).';
      return;
    }

    const trimmed = (this.texto ?? '').trim();
    const Label = trimmed !== '' ? trimmed : '(_)';
    this.erro = null;
    this.salvando = true;

    const body: AtualizarGeometriaPoligonoPayload = {
      id_meta,
      Label,
      GOOGLE_LATLNG: coords,
    };

    this.updatePoligonoService.atualizarGeometria(body).subscribe({
      next: () => {
        this.salvando = false;
        this.activeModal.close(trimmed);
      },
      error: (msg: string) => {
        this.salvando = false;
        this.erro = typeof msg === 'string' ? msg : 'Erro ao salvar.';
      },
    });
  }
}
