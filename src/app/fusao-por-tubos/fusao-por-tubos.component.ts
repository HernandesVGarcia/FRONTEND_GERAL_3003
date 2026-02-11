import { Component, Inject, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { UpdateFusaoTubosService } from '../servico/update-fusao-tubos.service';
import { LeFusaoTuboService } from '../servico/le-fusao-tubo.service';
import { AuthService } from '../servico/auth.service';
import { InsertLogService } from '../servico/insert-log.service';

export interface CaboItem {
  key: string;
  labelText?: string;
  capacidade?: number;
  fibras_portubo?: number;
}

export interface FusaoPorTubosData {
  cableData: { key: string; labelText?: string };
  listaCabos: CaboItem[];
  /** ID da caixa (id_meta_caixa) para a rota da API. */
  id_meta_caixa?: number;
  /** Chamado quando uma fusão por tubos é concluída (executa a mesma lógica do botão Redraw). */
  onFusaoConcluida?: () => void;
}

@Component({
  selector: 'app-fusao-por-tubos',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './fusao-por-tubos.component.html',
  styleUrls: ['./fusao-por-tubos.component.css']
})
export class FusaoPorTubosComponent implements OnInit, OnDestroy {

  caboOrigemKey: string;
  caboDestinoKey: string = '';

  tuboOrigemSelecionado: number | null = null;
  tuboDestinoSelecionado: number | null = null;

  /** true enquanto a requisição de fusão está em andamento. */
  fundindo = false;

  /** Números dos tubos que já possuem fusão (não podem ser escolhidos). */
  tubosOrigemBloqueados = new Set<number>();
  tubosDestinoBloqueados = new Set<number>();

  /** true enquanto verifica estado dos tubos origem/destino. */
  carregandoTubosOrigem = false;
  carregandoTubosDestino = false;

  private panelStyleEl: HTMLStyleElement | null = null;
  private dragListeners: (() => void)[] = [];

  constructor(
    public dialogRef: MatDialogRef<FusaoPorTubosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FusaoPorTubosData,
    private elementRef: ElementRef<HTMLElement>,
    private updateFusaoTubosService: UpdateFusaoTubosService,
    private leFusaoTuboService: LeFusaoTuboService,
    private authService: AuthService,
    private insertLogService: InsertLogService
  ) {
    this.caboOrigemKey = data.cableData?.key ?? '';
    if (!this.caboOrigemKey && data.listaCabos?.length) {
      this.caboOrigemKey = data.listaCabos[0].key;
    }
  }

  ngOnInit(): void {
    this.panelStyleEl = document.createElement('style');
    this.panelStyleEl.setAttribute('data-fusao-por-tubos', '');
    this.panelStyleEl.textContent = `
      .fusao-por-tubos-select-panel .mat-mdc-option,
      .fusao-por-tubos-select-panel .mat-mdc-option .mdc-list-item__primary-text {
        font-size: 0.75rem !important;
      }
      .fusao-por-tubos-dialog .mat-mdc-dialog-container {
        overflow: visible;
      }
    `;
    document.head.appendChild(this.panelStyleEl);
    this.verificarTubosOrigem();
  }

  ngOnDestroy(): void {
    this.removeDragListeners();
    if (this.panelStyleEl?.parentNode) {
      this.panelStyleEl.parentNode.removeChild(this.panelStyleEl);
    }
    this.panelStyleEl = null;
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

  /** No combo da esquerda: apenas o cabo que foi clicado no context menu. */
  get listaCabosOrigem(): CaboItem[] {
    const key = this.data.cableData?.key;
    if (!key || !this.data.listaCabos) return [];
    const cabo = this.data.listaCabos.find(c => c.key === key);
    return cabo ? [cabo] : [];
  }

  get listaCabosDestino(): CaboItem[] {
    if (!this.data.listaCabos) return [];
    return this.data.listaCabos.filter(c => c.key !== this.caboOrigemKey);
  }

  /** Número de tubos conforme capacidade e fibras por tubo do cabo origem. */
  get tubosOrigem(): number[] {
    const cabo = this.data.listaCabos?.find(c => c.key === this.caboOrigemKey);
    const cap = cabo?.capacidade ?? 12;
    const fpt = (cabo?.fibras_portubo && cabo.fibras_portubo > 0) ? cabo.fibras_portubo : 12;
    const n = Math.floor(cap / fpt) || 1;
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  /** Número de tubos conforme capacidade e fibras por tubo do cabo destino. */
  get tubosDestino(): number[] {
    const cabo = this.data.listaCabos?.find(c => c.key === this.caboDestinoKey);
    if (!this.caboDestinoKey?.trim()) return [];
    const cap = cabo?.capacidade ?? 12;
    const fpt = (cabo?.fibras_portubo && cabo.fibras_portubo > 0) ? cabo.fibras_portubo : 12;
    const n = Math.floor(cap / fpt) || 1;
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  get podeFundirTubos(): boolean {
    if ((this.caboDestinoKey?.trim() ?? '') === '') return false;
    if (this.tuboOrigemSelecionado == null || this.tuboDestinoSelecionado == null) return false;
    if (this.tubosOrigemBloqueados.has(this.tuboOrigemSelecionado)) return false;
    if (this.tubosDestinoBloqueados.has(this.tuboDestinoSelecionado)) return false;
    return this.tubosOrigem.includes(this.tuboOrigemSelecionado)
      && this.tubosDestino.includes(this.tuboDestinoSelecionado);
  }

  fundirTubos(): void {
    if (!this.podeFundirTubos || this.fundindo) return;
    const id_meta_caixa = this.data.id_meta_caixa;
    if (id_meta_caixa == null || id_meta_caixa <= 0) {
      alert('ID da caixa não disponível. Certifique-se de que a caixa está aberta.');
      return;
    }
    const bocaOrigem = this.bocaFromKey(this.caboOrigemKey);
    const bocaDestino = this.bocaFromKey(this.caboDestinoKey);
    const caboOrigem = this.data.listaCabos?.find(c => c.key === this.caboOrigemKey);
    const caboDestino = this.data.listaCabos?.find(c => c.key === this.caboDestinoKey);
    const fibras_portubo_origem = (caboOrigem?.fibras_portubo && caboOrigem.fibras_portubo > 0) ? caboOrigem.fibras_portubo : 12;
    const fibras_portubo_destino = (caboDestino?.fibras_portubo && caboDestino.fibras_portubo > 0) ? caboDestino.fibras_portubo : 12;

    const request = {
      boca_origem: bocaOrigem,
      fibras_portubo_origem,
      tubo_origem: this.tuboOrigemSelecionado!,
      boca_destino: bocaDestino,
      fibras_portubo_destino,
      tubo_destino: this.tuboDestinoSelecionado!,
      id_meta_caixa
    };

    this.fundindo = true;
    this.updateFusaoTubosService.fundirTubos(request).subscribe({
      next: (response) => {
        this.fundindo = false;
        console.log('✅ [FUSAO-POR-TUBOS] Fusão realizada:', response);
        this.data.onFusaoConcluida?.();

        // Log Fusão Tubo Caixa (evento 54), mesmo padrão do Fusão Caixa no gojs-demo
        const idUsuario = this.authService.getIdUser();
        const idCityLog = this.authService.getIdCity();
        if (idUsuario && id_meta_caixa != null) {
          const tuboOrigem = this.tuboOrigemSelecionado ?? request.tubo_origem;
          const tuboDestino = this.tuboDestinoSelecionado ?? request.tubo_destino;
          const descricao = `Fusão Tubo Caixa: Boca ${bocaOrigem} - Tubo ${tuboOrigem} -> Boca ${bocaDestino} - Tubo ${tuboDestino}`;
          this.insertLogService.inserirLog({
            id_usuario: idUsuario,
            id_evento: 54,
            id_city: idCityLog ?? null,
            id_meta_objeto: id_meta_caixa,
            descricao,
            VERSION: 'Fiberworks WEB 1.0.0'
          }).subscribe({
            next: (logResponse) => {
              console.log('✅ [INSERT-LOG] Log Fusão Tubo Caixa inserido:', logResponse);
            },
            error: (error) => {
              console.error('❌ [INSERT-LOG] Erro ao inserir log Fusão Tubo Caixa:', error);
            }
          });
        }

        // Modal permanece aberto para permitir fundir outros tubos
        this.tuboOrigemSelecionado = null;
        this.tuboDestinoSelecionado = null;
        this.verificarTubosOrigem();
        this.verificarTubosDestino();
      },
      error: (err) => {
        this.fundindo = false;
        const msg = typeof err === 'string' ? err : (err?.message || 'Erro ao realizar fusão por tubos.');
        alert(msg);
      }
    });
  }

  /** Extrai o número da boca do key (ex: "Boca1" -> 1). */
  private bocaFromKey(key: string): number {
    const n = parseInt((key || '').replace(/^Boca/i, ''), 10);
    return (n >= 1 && n <= 18) ? n : 1;
  }

  fechar(): void {
    this.dialogRef.close();
  }

  onCaboOrigemChange(): void {
    this.tuboOrigemSelecionado = null;
    this.tubosOrigemBloqueados.clear();
    this.verificarTubosOrigem();
  }

  onCaboDestinoChange(): void {
    this.tuboDestinoSelecionado = null;
    this.tubosDestinoBloqueados.clear();
    this.verificarTubosDestino();
  }

  /** Chama a API para cada tubo do cabo origem e preenche tubosOrigemBloqueados. */
  verificarTubosOrigem(): void {
    const id_meta_caixa = this.data.id_meta_caixa;
    const tubos = this.tubosOrigem;
    const cabo = this.data.listaCabos?.find(c => c.key === this.caboOrigemKey);
    const fibras_portubo = (cabo?.fibras_portubo && cabo.fibras_portubo > 0) ? cabo.fibras_portubo : 12;
    const boca = this.bocaFromKey(this.caboOrigemKey);

    if (id_meta_caixa == null || id_meta_caixa <= 0 || tubos.length === 0) {
      this.tubosOrigemBloqueados.clear();
      return;
    }

    this.carregandoTubosOrigem = true;
    forkJoin(
      tubos.map((tubo) =>
        this.leFusaoTuboService.verificarTuboLivre({
          id_meta_caixa,
          boca,
          tubo,
          fibras_portubo
        }).pipe(
          map((livre) => ({ tubo, livre }))
        )
      )
    ).subscribe({
      next: (results) => {
        this.carregandoTubosOrigem = false;
        const bloqueados = new Set<number>();
        results.forEach((r) => { if (!r.livre) bloqueados.add(r.tubo); });
        this.tubosOrigemBloqueados = bloqueados;
        if (this.tuboOrigemSelecionado != null && bloqueados.has(this.tuboOrigemSelecionado)) {
          this.tuboOrigemSelecionado = null;
        }
      },
      error: () => {
        this.carregandoTubosOrigem = false;
        this.tubosOrigemBloqueados.clear();
      }
    });
  }

  /** Chama a API para cada tubo do cabo destino e preenche tubosDestinoBloqueados. */
  verificarTubosDestino(): void {
    if (!this.caboDestinoKey?.trim()) {
      this.tubosDestinoBloqueados.clear();
      return;
    }
    const id_meta_caixa = this.data.id_meta_caixa;
    const tubos = this.tubosDestino;
    const cabo = this.data.listaCabos?.find(c => c.key === this.caboDestinoKey);
    const fibras_portubo = (cabo?.fibras_portubo && cabo.fibras_portubo > 0) ? cabo.fibras_portubo : 12;
    const boca = this.bocaFromKey(this.caboDestinoKey);

    if (id_meta_caixa == null || id_meta_caixa <= 0 || tubos.length === 0) {
      this.tubosDestinoBloqueados.clear();
      return;
    }

    this.carregandoTubosDestino = true;
    forkJoin(
      tubos.map((tubo) =>
        this.leFusaoTuboService.verificarTuboLivre({
          id_meta_caixa,
          boca,
          tubo,
          fibras_portubo
        }).pipe(
          map((livre) => ({ tubo, livre }))
        )
      )
    ).subscribe({
      next: (results) => {
        this.carregandoTubosDestino = false;
        const bloqueados = new Set<number>();
        results.forEach((r) => { if (!r.livre) bloqueados.add(r.tubo); });
        this.tubosDestinoBloqueados = bloqueados;
        if (this.tuboDestinoSelecionado != null && bloqueados.has(this.tuboDestinoSelecionado)) {
          this.tuboDestinoSelecionado = null;
        }
      },
      error: () => {
        this.carregandoTubosDestino = false;
        this.tubosDestinoBloqueados.clear();
      }
    });
  }

  onTuboOrigemClick(tubo: number): void {
    this.tuboOrigemSelecionado = this.tuboOrigemSelecionado === tubo ? null : tubo;
  }

  onTuboDestinoClick(tubo: number): void {
    this.tuboDestinoSelecionado = this.tuboDestinoSelecionado === tubo ? null : tubo;
  }
}
