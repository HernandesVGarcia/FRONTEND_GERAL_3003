import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  ConsultaApiVigoService,
  ResumoSyncVigoCtoLote,
} from '../servico/consulta-api-vigo.service';

export interface VigoCtoSyncModalData {
  idCidade: number;
}

@Component({
  selector: 'app-vigo-cto-sync-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './vigo-cto-sync-modal.component.html',
  styleUrls: ['./vigo-cto-sync-modal.component.css'],
})
export class VigoCtoSyncModalComponent {
  processando = false;
  erro: string | null = null;
  resumo: ResumoSyncVigoCtoLote | null = null;

  constructor(
    public dialogRef: MatDialogRef<VigoCtoSyncModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VigoCtoSyncModalData,
    private consultaApiVigoService: ConsultaApiVigoService,
  ) {}

  fechar(): void {
    this.dialogRef.close(this.resumo);
  }

  async conectar(): Promise<void> {
    this.erro = null;
    this.resumo = null;
    this.processando = true;

    try {
      this.resumo = await this.consultaApiVigoService.aplicarOcupacaoTodasCaixas();
    } catch (e: unknown) {
      if (typeof e === 'string') {
        this.erro = e;
      } else if (e instanceof Error) {
        this.erro = e.message;
      } else {
        this.erro = 'Erro ao sincronizar conectividade VIGO.';
      }
    } finally {
      this.processando = false;
    }
  }
}
