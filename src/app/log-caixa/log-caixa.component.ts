import { Component, Inject, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LeIdmetaLogService, LeIdmetaLogEntry } from '../servico/le-idmeta-log.service';

export interface LogCaixaData {
  idmetaCaixa?: number;
  numerocx?: string;
}

@Component({
  selector: 'app-log-caixa',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './log-caixa.component.html',
  styleUrls: ['./log-caixa.component.css']
})
export class LogCaixaComponent implements OnInit, OnDestroy {

  logs: LeIdmetaLogEntry[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  private dragListeners: (() => void)[] = [];

  constructor(
    public dialogRef: MatDialogRef<LogCaixaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LogCaixaData,
    private leIdmetaLogService: LeIdmetaLogService,
    private elementRef: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    if (this.data?.idmetaCaixa) {
      this.carregarLogs();
    } else {
      this.errorMessage = 'ID da caixa não informado.';
    }
  }

  ngOnDestroy(): void {
    this.removeDragListeners();
  }

  onHeaderMouseDown(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button')) return;
    const container = this.elementRef.nativeElement.closest('.mat-mdc-dialog-container') as HTMLElement;
    if (!container) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const rect = container.getBoundingClientRect();
    let currentLeft = rect.left;
    let currentTop = rect.top;

    const onMove = (e: MouseEvent): void => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      currentLeft = rect.left + dx;
      currentTop = rect.top + dy;
      container.style.position = 'fixed';
      container.style.left = `${currentLeft}px`;
      container.style.top = `${currentTop}px`;
      container.style.margin = '0';
      container.style.transform = 'none';
      container.style.width = `${rect.width}px`;
      container.style.height = `${rect.height}px`;
      container.style.maxWidth = `${rect.width}px`;
      container.style.maxHeight = `${rect.height}px`;
    };
    const onUp = (): void => {
      this.removeDragListeners();
    };

    this.dragListeners = [
      () => document.removeEventListener('mousemove', onMove),
      () => document.removeEventListener('mouseup', onUp)
    ];
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  private removeDragListeners(): void {
    this.dragListeners.forEach(remove => remove());
    this.dragListeners = [];
  }

  carregarLogs(): void {
    if (!this.data?.idmetaCaixa) return;
    this.isLoading = true;
    this.errorMessage = null;
    this.leIdmetaLogService.listar(this.data.idmetaCaixa).subscribe({
      next: (entries) => {
        this.logs = entries || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Erro ao carregar log.';
        this.isLoading = false;
      }
    });
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
