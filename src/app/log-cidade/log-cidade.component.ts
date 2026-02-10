import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LeCidadeLogService, LeCidadeLogEntry } from '../servico/le-cidade-log.service';

export interface LogCidadeData {
  idCidade?: number;
  nomeCidade?: string;
}

@Component({
  selector: 'app-log-cidade',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './log-cidade.component.html',
  styleUrls: ['./log-cidade.component.css']
})
export class LogCidadeComponent implements OnInit {

  logs: LeCidadeLogEntry[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<LogCidadeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LogCidadeData,
    private leCidadeLogService: LeCidadeLogService
  ) {}

  ngOnInit(): void {
    if (this.data?.idCidade) {
      this.carregarLogs();
    } else {
      this.errorMessage = 'ID da cidade não informado.';
    }
  }

  carregarLogs(): void {
    if (!this.data?.idCidade) return;
    this.isLoading = true;
    this.errorMessage = null;
    this.leCidadeLogService.listar(this.data.idCidade).subscribe({
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
