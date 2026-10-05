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
  VigoSanearStatusResponse,
} from '../servico/consulta-api-vigo.service';

export interface VigoSanearStatusModalData {
  idCidade: number;
}

/** Mesma regra do sync VIGO na inserção: só `L` é ativo; demais (X, B, …) → STATUS 0. */
const SITUACAO_ATIVA_VIGO = 'L';

@Component({
  selector: 'app-vigo-sanear-status-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './vigo-sanear-status-modal.component.html',
  styleUrls: ['./vigo-sanear-status-modal.component.css'],
})
export class VigoSanearStatusModalComponent {
  nomeArquivo = '';
  totalItensArquivo = 0;
  contratos: number[] = [];
  semCampoSituacao = false;

  processando = false;
  erro: string | null = null;
  previa: VigoSanearStatusResponse | null = null;
  aplicado: VigoSanearStatusResponse | null = null;

  constructor(
    public dialogRef: MatDialogRef<VigoSanearStatusModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VigoSanearStatusModalData,
    private consultaApiVigoService: ConsultaApiVigoService,
  ) {}

  fechar(): void {
    this.dialogRef.close(this.aplicado);
  }

  async onArquivoSelecionado(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];

    this.limparEstado();

    if (!arquivo) {
      return;
    }

    this.nomeArquivo = arquivo.name;

    try {
      const texto = await arquivo.text();
      const conteudo: unknown = JSON.parse(texto);
      const itens = this.extrairItens(conteudo);

      if (itens.length === 0) {
        this.erro = 'JSON sem lista de clientes (esperado array ou { clientes: [...] }).';
        return;
      }

      this.totalItensArquivo = itens.length;

      const comSituacao = itens.filter((item) => this.lerSituacao(item) !== '');
      this.semCampoSituacao = comSituacao.length === 0;

      const alvo = this.semCampoSituacao
        ? itens
        : itens.filter((item) => this.situacaoIndicaInativo(item));

      this.contratos = this.extrairContratos(alvo);

      if (this.contratos.length === 0) {
        this.erro = this.semCampoSituacao
          ? 'Nenhum campo "id" válido encontrado no arquivo.'
          : 'Nenhum cliente com situacao diferente de L (ex.: X, B) e "id" válido no arquivo.';
      }
    } catch (e: unknown) {
      this.erro = e instanceof Error ? `JSON inválido: ${e.message}` : 'JSON inválido.';
    }
  }

  async preVisualizar(): Promise<void> {
    await this.executar(true);
  }

  async aplicar(): Promise<void> {
    await this.executar(false);
  }

  private async executar(dryRun: boolean): Promise<void> {
    if (this.contratos.length === 0 || this.processando) {
      return;
    }

    this.erro = null;
    this.processando = true;

    try {
      const resultado = await this.consultaApiVigoService.sanearStatusClientes(
        this.contratos,
        dryRun,
      );

      if (dryRun) {
        this.previa = resultado;
      } else {
        this.aplicado = resultado;
      }
    } catch (e: unknown) {
      if (typeof e === 'string') {
        this.erro = e;
      } else if (e instanceof Error) {
        this.erro = e.message;
      } else {
        this.erro = 'Erro ao sanear STATUS dos clientes.';
      }
    } finally {
      this.processando = false;
    }
  }

  private limparEstado(): void {
    this.nomeArquivo = '';
    this.totalItensArquivo = 0;
    this.contratos = [];
    this.semCampoSituacao = false;
    this.erro = null;
    this.previa = null;
    this.aplicado = null;
  }

  private extrairItens(conteudo: unknown): Record<string, unknown>[] {
    const lista = Array.isArray(conteudo)
      ? conteudo
      : this.listaDeObjetoEnvelope(conteudo);

    return lista.filter(
      (item): item is Record<string, unknown> =>
        item != null && typeof item === 'object',
    );
  }

  private listaDeObjetoEnvelope(conteudo: unknown): unknown[] {
    if (conteudo == null || typeof conteudo !== 'object') {
      return [];
    }

    const envelope = conteudo as Record<string, unknown>;

    for (const chave of ['clientes', 'response', 'data', 'result']) {
      const valor = envelope[chave];
      if (Array.isArray(valor)) {
        return valor;
      }
    }

    return [];
  }

  private lerSituacao(item: Record<string, unknown>): string {
    const raw = item['situacao'] ?? item['SITUACAO'] ?? item['Situacao'];
    return raw != null ? String(raw).trim().toUpperCase() : '';
  }

  /** Inclui cancelados (X), bloqueados (B) e demais não liberados. */
  private situacaoIndicaInativo(item: Record<string, unknown>): boolean {
    const situacao = this.lerSituacao(item);
    return situacao !== '' && situacao !== SITUACAO_ATIVA_VIGO;
  }

  private extrairContratos(itens: Record<string, unknown>[]): number[] {
    const unicos = new Set<number>();

    for (const item of itens) {
      const raw = item['id'] ?? item['ID'] ?? item['Id'];
      const contrato = Number.parseInt(String(raw ?? '').trim(), 10);

      if (Number.isFinite(contrato) && contrato > 0) {
        unicos.add(contrato);
      }
    }

    return [...unicos];
  }
}
