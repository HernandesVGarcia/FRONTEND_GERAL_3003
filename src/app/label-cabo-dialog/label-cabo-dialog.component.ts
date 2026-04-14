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
  UpdateLabelCaboService,
  UpdateLabelCaboBody,
} from '../servico/update-label-cabo.service';

export interface LabelCaboDialogData {
  id_meta: number;
  Label_cabo: string;
  /** Viewport: canto do modal junto ao menu de contexto */
  anchorX?: number;
  anchorY?: number;
}

@Component({
  selector: 'app-label-cabo-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './label-cabo-dialog.component.html',
  styleUrls: ['./label-cabo-dialog.component.css'],
})
export class LabelCaboDialogComponent implements AfterViewInit {
  private _data: LabelCaboDialogData = { id_meta: 0, Label_cabo: '' };

  /** Setter: o modal define `componentInstance.data` após o ciclo de vida; ngOnChanges nem sempre corre. */
  @Input()
  set data(value: LabelCaboDialogData) {
    this._data = value ?? { id_meta: 0, Label_cabo: '' };
    const raw = this._data.Label_cabo;
    this.texto =
      raw === null || raw === undefined ? '' : String(raw);
  }
  get data(): LabelCaboDialogData {
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
    private updateLabelCaboService: UpdateLabelCaboService,
    private el: ElementRef<HTMLElement>,
  ) {}

  ngAfterViewInit(): void {
    this.schedulePositionAtAnchor();
  }

  /** Posiciona o .modal-dialog exterior do ng-bootstrap junto a anchorX/Y (viewport), com clamp. */
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
      /* ng-bootstrap: o host é o .modal; o diálogo exterior é filho direto (não existe .modal.show filho). */
      const outer = host.querySelector(':scope > .modal-dialog') as HTMLElement | null;
      if (!outer) {
        return;
      }
      const pad = 8;
      /* O exterior vem com modal-lg (largo); se medirmos essa largura, maxLeft fica ~pad e left cola à esquerda.
         Clamp horizontal com a largura real do cartão (~450px no CSS interno). */
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
      this.erro = 'ID do cabo inválido.';
      return;
    }
    const Label_cabo = (this.texto ?? '').trim();
    this.erro = null;
    this.salvando = true;
    const body: UpdateLabelCaboBody = { id_meta, Label_cabo };
    this.updateLabelCaboService.atualizarLabel(body).subscribe({
      next: () => {
        this.salvando = false;
        this.activeModal.close(Label_cabo);
      },
      error: (e: Error) => {
        this.salvando = false;
        this.erro = e?.message ?? 'Erro ao salvar.';
      },
    });
  }
}
