import { Component, Inject, OnInit } from '@angular/core';
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
export class LogCaixaComponent implements OnInit {

  logs: LeIdmetaLogEntry[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<LogCaixaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LogCaixaData,
    private leIdmetaLogService: LeIdmetaLogService
  ) {}

  ngOnInit(): void {
    if (this.data?.idmetaCaixa) {
      this.carregarLogs();
    } else {
      this.errorMessage = 'ID da caixa não informado.';
    }
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
