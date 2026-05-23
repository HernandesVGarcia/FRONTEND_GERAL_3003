import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';

/** Valores aceitos por `coresPoligonoPorTipo` no mapa (+ fallback cinza). */
export type TipagemPoligonoTipoCor =
  | 'verde'
  | 'amarelo'
  | 'branco'
  | 'vermelho'
  | 'azul'
  | 'lilás'
  | 'cinza';

export interface TipagemPoligonoData {
  tipoCor: TipagemPoligonoTipoCor;
  label: string;
}

@Component({
  selector: 'app-tipagem-poligono',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
  ],
  templateUrl: './tipagem-poligono.component.html',
  styleUrls: ['./tipagem-poligono.component.css'],
})
export class TipagemPoligonoComponent implements OnChanges {
  @Input() visible = false;
  @Output() polygonConfirmed = new EventEmitter<TipagemPoligonoData>();
  @Output() modalClosed = new EventEmitter<void>();

  readonly opcoesCor: { valor: TipagemPoligonoTipoCor; rotulo: string }[] = [
    { valor: 'verde', rotulo: 'Verde' },
    { valor: 'amarelo', rotulo: 'Amarelo' },
    { valor: 'branco', rotulo: 'Branco' },
    { valor: 'vermelho', rotulo: 'Vermelho' },
    { valor: 'azul', rotulo: 'Azul' },
    { valor: 'lilás', rotulo: 'Lilás' },
    { valor: 'cinza', rotulo: 'Cinza (padrão)' },
  ];

  selectedTipoCor: TipagemPoligonoTipoCor = 'cinza';
  labelPoligono = '';

  private readonly storagePrefix = 'tipagemPoligono.last.';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.carregarUltimasSelecoes();
    }
  }

  private salvarSelecoes(): void {
    try {
      localStorage.setItem(this.storagePrefix + 'tipoCor', this.selectedTipoCor);
      localStorage.setItem(this.storagePrefix + 'label', this.labelPoligono ?? '');
    } catch {
      /* ignore */
    }
  }

  private carregarUltimasSelecoes(): void {
    try {
      const tc = localStorage.getItem(this.storagePrefix + 'tipoCor') as TipagemPoligonoTipoCor | null;
      const lb = localStorage.getItem(this.storagePrefix + 'label');
      if (tc && this.opcoesCor.some((o) => o.valor === tc)) {
        this.selectedTipoCor = tc;
      }
      if (lb !== null) {
        this.labelPoligono = lb;
      }
    } catch {
      /* ignore */
    }
  }

  confirmar(): void {
    const data: TipagemPoligonoData = {
      tipoCor: this.selectedTipoCor,
      label: (this.labelPoligono ?? '').trim(),
    };
    this.salvarSelecoes();
    this.polygonConfirmed.emit(data);
  }

  fecharModal(): void {
    this.modalClosed.emit();
  }
}
