import { Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { GoogleMapsModule } from '@angular/google-maps';
import { firstValueFrom } from 'rxjs';
import {
  KmlFolderKind,
  KmlImportItem,
  KmlImportService,
  KmlParseResult,
} from '../servico/kml-import.service';
import { TiposService } from '../servico/tipos.service';
import {
  InsertCaixaService,
  InsertCaixaRequest,
} from '../servico/insert-caixa.service';
import { AuthService } from '../servico/auth.service';
import { CaixaService } from '../servico/caixa.service';
import { CtoService } from '../servico/cto.service';
import {
  chaveNumeroUnicoCidade,
  rotulosNumeroApiRow,
} from '../util/caixa-label.util';
import {
  KmlCaboCapacity,
  KmlCaboParseResult,
  KmlImportCabosService,
  KmlImportCaboItem,
} from '../servico/kml-import-cabos.service';
import {
  InsertCaboService,
  InsertCaboData,
} from '../servico/insert-cabo.service';
import { UpdateIdImportacaoService } from '../servico/update-id-importacao.service';

export interface KmlImportModalData {
  idCidade: number;
}

interface TipoCaixaRow {
  idTipo: number;
  label: string;
}

export interface KmlImportFolderUi {
  kind: KmlFolderKind;
  titulo: string;
  importar: boolean;
  idTipo: string;
  tipagem: string;
  items: KmlImportItem[];
}

export type CodigoCaboScopeUi = 'nacional' | 'internacional';

export interface KmlImportCaboFolderUi {
  capacidadeF: KmlCaboCapacity;
  titulo: string;
  importar: boolean;
  codigoScope: CodigoCaboScopeUi;
  fibrasPorTubo: string;
  items: KmlImportCaboItem[];
}

export interface KmlImportModalResult {
  implantados: number;
  falhas: number;
  duplicados?: number;
  duplicadosRotulos?: string[];
}

@Component({
  selector: 'app-kml-import-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatRadioModule,
    GoogleMapsModule,
  ],
  templateUrl: './kml-import-modal.component.html',
  styleUrls: ['./kml-import-modal.component.css'],
})
export class KmlImportModalComponent implements OnDestroy {
  nomeArquivo = '';
  parseResult: KmlParseResult | null = null;
  items: KmlImportItem[] = [];
  pastasUi: KmlImportFolderUi[] = [];
  ignoredNonPoints = 0;
  carregandoTipos = false;
  implantando = false;
  progressoImplant = '';
  duplicadosNaoImplantados: string[] = [];
  resumoImplantacao: string | null = null;

  parseResultCabos: KmlCaboParseResult | null = null;
  itemsCabos: KmlImportCaboItem[] = [];
  pastasCabosUi: KmlImportCaboFolderUi[] = [];
  ignoredNonLines = 0;
  erroParseFatal: string | null = null;
  avisosParse: string[] = [];
  resumoImplantacaoCabos: string | null = null;
  idImportacaoLote: number | null = null;
  readonly opcoesFibrasPorTubo = ['2F', '6F', '8F', '12F', '24F'];

  private idImportacaoLoteAtual: number | null = null;

  previewCenter: google.maps.LatLngLiteral = {
    lat: -23.326803,
    lng: -52.114882,
  };
  previewZoom = 13;
  previewMapOptions: google.maps.MapOptions = {
    mapId: '2fa2a1283852882f399d9dde',
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
  };

  tiposCaixa: TipoCaixaRow[] = [];
  tiposCto: TipoCaixaRow[] = [];
  private map: google.maps.Map | null = null;
  private markers: google.maps.Marker[] = [];
  private polylines: google.maps.Polyline[] = [];

  constructor(
    public dialogRef: MatDialogRef<
      KmlImportModalComponent,
      KmlImportModalResult | undefined
    >,
    @Inject(MAT_DIALOG_DATA) public data: KmlImportModalData,
    private kmlImportService: KmlImportService,
    private tiposService: TiposService,
    private insertCaixaService: InsertCaixaService,
    private authService: AuthService,
    private caixaService: CaixaService,
    private ctoService: CtoService,
    private kmlImportCabosService: KmlImportCabosService,
    private insertCaboService: InsertCaboService,
    private updateIdImportacaoService: UpdateIdImportacaoService,
  ) {
    const lat = parseFloat(this.authService.getLat() ?? '');
    const lng = parseFloat(this.authService.getLng() ?? '');
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      this.previewCenter = { lat, lng };
    }
    this.carregarTipos();
  }

  ngOnDestroy(): void {
    this.clearMarkers();
    this.clearPolylines();
    this.map = null;
  }

  get parseOk(): boolean {
    if (this.erroParseFatal) {
      return false;
    }
    return this.items.length > 0 || this.itemsCabos.length > 0;
  }

  get erroParse(): string | null {
    return this.erroParseFatal;
  }

  get totalSelecionados(): number {
    return this.items.filter((i) => i.selected).length;
  }

  get countCaixas(): number {
    return this.items.filter((i) => i.folderKind === 'caixa').length;
  }

  get countCtos(): number {
    return this.items.filter((i) => i.folderKind === 'cto').length;
  }

  get totalSelecionadosCabos(): number {
    return this.itemsCabos.filter((i) => i.selected).length;
  }

  get totalSelecionadosUnificado(): number {
    return this.totalSelecionados + this.totalSelecionadosCabos;
  }

  get podeImplantarUnificado(): boolean {
    if (!this.parseOk || this.implantando) {
      return false;
    }
    const temCaixa = this.items.some((i) => i.selected);
    const temCabo = this.itemsCabos.some((i) => i.selected);
    if (!temCaixa && !temCabo) {
      return false;
    }
    if (temCaixa && !this.validarPastasCaixas()) {
      return false;
    }
    if (temCabo && !this.validarPastasCabos()) {
      return false;
    }
    return true;
  }

  private validarPastasCaixas(): boolean {
    for (const pasta of this.pastasUi) {
      if (!pasta.importar) {
        continue;
      }
      if (!pasta.idTipo || !pasta.tipagem) {
        return false;
      }
    }
    return this.items.every(
      (i) => !i.selected || (i.tipagem && i.idTipo),
    );
  }

  private validarPastasCabos(): boolean {
    for (const pasta of this.pastasCabosUi) {
      if (!pasta.importar) {
        continue;
      }
      if (!pasta.fibrasPorTubo) {
        return false;
      }
    }
    return true;
  }

  tipagensParaPasta(pasta: KmlImportFolderUi): TipoCaixaRow[] {
    return pasta.kind === 'cto' ? this.tiposCto : this.tiposCaixa;
  }

  rotuloItem(item: KmlImportItem): string {
    if (item.numero && item.numero !== '0') {
      return item.numero;
    }
    return '(id_meta ao implantar)';
  }

  rotuloDuplicata(item: KmlImportItem): string {
    const numero =
      item.numero && item.numero !== '0' ? item.numero : this.rotuloItem(item);
    const raw = (item.name ?? '').trim();
    if (raw && raw !== item.numero) {
      return `${numero} (KML: ${raw})`;
    }
    return numero;
  }

  tituloKmlItem(item: KmlImportItem): string {
    const raw = (item.name ?? '').trim();
    if (!raw) {
      return '';
    }
    if (item.numero === '0') {
      return `KML: ${raw} → número gerado (id_meta) na gravação`;
    }
    if (raw !== item.numero) {
      return `KML: ${raw}`;
    }
    return '';
  }

  onPreviewMapInitialized(map: google.maps.Map): void {
    this.map = map;
    this.refreshMapView();
  }

  fechar(): void {
    if (this.implantando) {
      return;
    }
    this.dialogRef.close(undefined);
  }

  async onArquivoKmlSelecionado(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    this.limparPreview();

    if (!arquivo) {
      return;
    }

    this.nomeArquivo = arquivo.name;
    const lower = arquivo.name.toLowerCase();
    if (lower.endsWith('.kmz')) {
      this.erroParseFatal =
        'KMZ ainda não suportado nesta versão. Exporte ou salve como .kml.';
      return;
    }
    if (!lower.endsWith('.kml')) {
      this.erroParseFatal = 'Selecione um arquivo .kml';
      return;
    }

    const texto = await arquivo.text();
    const parseOpts = { allowNoItems: true as const };
    const resultCaixas = this.kmlImportService.parseKmlText(
      texto,
      arquivo.name,
      parseOpts,
    );
    const resultCabos = this.kmlImportCabosService.parseKmlText(
      texto,
      arquivo.name,
      parseOpts,
    );

    this.parseResult = resultCaixas;
    this.parseResultCabos = resultCabos;

    const caixasOk = resultCaixas.ok;
    const cabosOk = resultCabos.ok;

    if (!caixasOk && !cabosOk) {
      this.erroParseFatal = [resultCaixas.error, resultCabos.error]
        .filter(Boolean)
        .join('\n');
      return;
    }

    const itemsCaixas = caixasOk ? resultCaixas.items : [];
    const itemsCabos = cabosOk ? resultCabos.items : [];

    if (itemsCaixas.length === 0 && itemsCabos.length === 0) {
      this.erroParseFatal =
        'Nenhuma caixa/CTO (Point em CAIXAS/CTOS) nem cabo (LineString em CABO*nF) válido neste arquivo.';
      return;
    }

    this.avisosParse = [];
    if (!caixasOk) {
      this.avisosParse.push(resultCaixas.error);
    }
    if (!cabosOk) {
      this.avisosParse.push(resultCabos.error);
    }

    this.ignoredNonPoints = caixasOk ? resultCaixas.ignoredNonPoints : 0;
    this.ignoredNonLines = cabosOk ? resultCabos.ignoredNonLines : 0;
    this.items = itemsCaixas.map((item) => this.aplicarTipagemPadrao(item));
    this.itemsCabos = itemsCabos;
    this.montarPastas();
    this.montarPastasCabos();
    setTimeout(() => this.refreshMapView(), 0);
  }

  comprimentoCaboItem(item: KmlImportCaboItem): number {
    if (!item.path?.length || item.path.length < 2) {
      return 0;
    }
    const latLngs = item.path.map(
      (p) => new google.maps.LatLng(p.lat, p.lng),
    );
    return google.maps.geometry.spherical.computeLength(latLngs);
  }

  destacarCaboNoMapa(item: KmlImportCaboItem): void {
    if (!this.map || !item.path?.length) {
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    for (const p of item.path) {
      bounds.extend(p);
    }
    this.map.fitBounds(bounds, 64);
  }

  onPastaCaboImportarChange(pasta: KmlImportCaboFolderUi): void {
    for (const item of pasta.items) {
      item.selected = pasta.importar;
    }
    this.refreshMapView();
  }

  onPastaCaboCodigoChange(pasta: KmlImportCaboFolderUi): void {
    this.aplicarDefaultsPastaCaboToItems(pasta);
  }

  onPastaCaboTuboChange(pasta: KmlImportCaboFolderUi, fibras: string): void {
    pasta.fibrasPorTubo = fibras;
    this.aplicarDefaultsPastaCaboToItems(pasta);
  }

  onPastaImportarChange(pasta: KmlImportFolderUi): void {
    for (const item of pasta.items) {
      item.selected = pasta.importar;
    }
    this.refreshMapView();
  }

  onPastaTipagemChange(pasta: KmlImportFolderUi, idTipoStr: string): void {
    const lista = this.tipagensParaPasta(pasta);
    const row = lista.find((t) => t.idTipo.toString() === idTipoStr);
    if (!row) {
      return;
    }
    pasta.idTipo = row.idTipo.toString();
    pasta.tipagem = row.label;
    for (const item of pasta.items) {
      item.idTipo = pasta.idTipo;
      item.tipagem = pasta.tipagem;
    }
  }

  destacarNoMapa(item: KmlImportItem): void {
    if (!this.map) {
      return;
    }
    this.map.panTo({ lat: item.lat, lng: item.lng });
    this.map.setZoom(Math.max(this.map.getZoom() ?? 15, 16));
  }

  async implantarTudo(): Promise<void> {
    if (!this.podeImplantarUnificado) {
      return;
    }

    const nCaixa = this.items.filter((i) => i.selected).length;
    const nCabo = this.itemsCabos.filter((i) => i.selected).length;
    const partes: string[] = [];
    if (nCaixa > 0) {
      partes.push(`${nCaixa} caixa(s)/CTO(s)`);
    }
    if (nCabo > 0) {
      partes.push(`${nCabo} cabo(s)`);
    }
    const msg = `Criar ${partes.join(' e ')} na cidade ${this.data.idCidade}?`;
    if (!window.confirm(msg)) {
      return;
    }

    this.implantando = true;
    this.progressoImplant = '';
    this.idImportacaoLoteAtual = null;
    this.idImportacaoLote = null;

    if (nCaixa > 0 && this.validarPastasCaixas()) {
      await this.executarImplantacaoCaixas();
    }
    if (nCabo > 0 && this.validarPastasCabos()) {
      await this.executarImplantacaoCabos();
    }

    if (this.idImportacaoLoteAtual !== null) {
      this.idImportacaoLote = this.idImportacaoLoteAtual;
    }

    this.implantando = false;
    this.progressoImplant = '';
  }

  private async executarImplantacaoCaixas(): Promise<void> {
    const selecionados = this.items.filter((i) => i.selected);
    if (selecionados.length === 0) {
      return;
    }

    const user = this.authService.getUsuario();
    const idPolo = this.authService.getPolo();
    const idCity = this.authService.getIdCity();

    if (!user || !idPolo || !idCity) {
      window.alert(
        'Sessão incompleta (usuário, polo ou cidade). Faça login novamente.',
      );
      return;
    }

    this.duplicadosNaoImplantados = [];
    this.resumoImplantacao = null;

    for (const item of selecionados) {
      item.implantStatus = 'pending';
      item.implantMessage = undefined;
    }

    let numerosExistentes: Set<string>;
    let numerosIniciaisCidade: Set<string>;
    try {
      const [retornoCaixas, retornoCtos] = await Promise.all([
        firstValueFrom(this.caixaService.selecionar()),
        firstValueFrom(this.ctoService.selecionar()),
      ]);
      const caixas = this.normalizarListaApi<Record<string, unknown>>(
        retornoCaixas,
      );
      const ctos = this.normalizarListaApi<Record<string, unknown>>(
        retornoCtos,
      );
      numerosExistentes = this.montarSetNumerosCidade([...caixas, ...ctos]);
      numerosIniciaisCidade = new Set(numerosExistentes);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar caixas/CTOs da cidade.';
      window.alert(
        `Implantação de caixas cancelada: falha ao conferir duplicatas.\n${msg}`,
      );
      return;
    }

    let implantados = 0;
    let falhas = 0;
    let duplicados = 0;
    const total = selecionados.length;

    for (let i = 0; i < selecionados.length; i++) {
      const item = selecionados[i];
      this.progressoImplant = `Caixas ${i + 1}/${total}: ${item.name || item.numero}`;

      const numeroEnvio =
        !item.numero || item.numero === '0' ? '0' : item.numero;

      const chave = chaveNumeroUnicoCidade(numeroEnvio);
      if (chave && numerosExistentes.has(chave)) {
        const rotulo = this.rotuloDuplicata(item);
        const origem = numerosIniciaisCidade.has(chave)
          ? 'já existe na cidade'
          : 'repetido no arquivo';
        item.implantStatus = 'duplicate';
        item.implantMessage = `Duplicata (${origem}): ${rotulo}`;
        this.duplicadosNaoImplantados.push(rotulo);
        duplicados += 1;
        continue;
      }

      const payload: InsertCaixaRequest = {
        ID_TIPO: item.idTipo,
        NUMERO: numeroEnvio,
        LOCALIZACAO: ' ',
        TIPO: item.tipagem,
        OBSERVACAO: item.description?.slice(0, 500) ?? '',
        idCIDADES: idCity.toString(),
        USER: user,
        id_POLO: idPolo.toString(),
        LAT: item.lat.toString(),
        LNG: item.lng.toString(),
        id_condominio: 0,
        id_importacao: this.idImportacaoParaProximoInsert(),
      };

      try {
        const response = await firstValueFrom(
          this.insertCaixaService.criarCaixa(payload),
        );
        item.implantStatus = 'ok';
        if (numeroEnvio === '0' && response.id_meta) {
          item.numero = response.id_meta.toString();
        }
        item.implantMessage = `id_meta ${response.id_meta}`;
        implantados += 1;
        await this.registrarSucessoImportacao(response.id_meta);

        const chavePosInsert = chaveNumeroUnicoCidade(
          numeroEnvio === '0' && response.id_meta
            ? response.id_meta.toString()
            : numeroEnvio,
        );
        if (chavePosInsert) {
          numerosExistentes.add(chavePosInsert);
        }
      } catch (err: unknown) {
        item.implantStatus = 'error';
        item.implantMessage =
          err instanceof Error ? err.message : 'Erro ao criar caixa';
        falhas += 1;
      }
    }

    if (implantados > 0) {
      window.dispatchEvent(new CustomEvent('reloadMapCaixas'));
      this.resumoImplantacao = this.montarResumoImplantacao(
        implantados,
        falhas,
        duplicados,
      );
    } else if (duplicados > 0 && falhas === 0) {
      window.alert(
        'Nenhum ponto foi implantado — todos já existem na cidade ou estão repetidos no arquivo.',
      );
    } else if (falhas > 0) {
      window.alert('Nenhum ponto foi implantado. Verifique os erros na lista.');
    }
  }

  private async executarImplantacaoCabos(): Promise<void> {
    const selecionados = this.itemsCabos.filter((i) => i.selected);
    if (selecionados.length === 0) {
      return;
    }

    const idCity = this.authService.getIdCity();
    if (!idCity) {
      window.alert('Sessão incompleta (cidade). Faça login novamente.');
      return;
    }

    this.resumoImplantacaoCabos = null;

    for (const item of selecionados) {
      item.implantStatus = 'pending';
      item.implantMessage = undefined;
    }

    let implantados = 0;
    let falhas = 0;
    const total = selecionados.length;

    for (let i = 0; i < selecionados.length; i++) {
      const item = selecionados[i];
      this.progressoImplant = `Cabos ${i + 1}/${total}: ${item.label}`;

      const pasta = this.pastasCabosUi.find((p) =>
        p.items.some((it) => it.id === item.id),
      );
      const codigoCores = this.scopeToCodigoCores(
        pasta?.codigoScope ?? 'nacional',
      );
      const fibrasPorTubo = pasta?.fibrasPorTubo ?? item.fibrasPorTubo;
      item.codigoCores = codigoCores;
      item.fibrasPorTubo = fibrasPorTubo;

      const comprimento = this.comprimentoCaboItem(item);
      const caboData: InsertCaboData = {
        capacidade: item.capacidadeF,
        tubo: InsertCaboService.converterFibrasPorTuboParaNumero(fibrasPorTubo),
        Codigo: InsertCaboService.determinarCodigo(codigoCores),
        Label_cabo: item.label,
        length: Math.round(comprimento * 100) / 100,
        GOOGLE_LATLNG: item.path.map((p) => ({ lat: p.lat, lng: p.lng })),
        id_condominio: 0,
        id_importacao: this.idImportacaoParaProximoInsert(),
      };

      try {
        const response = await firstValueFrom(
          this.insertCaboService.inserirCabo(caboData),
        );
        item.implantStatus = 'ok';
        item.implantMessage = `id_meta ${response.id_meta}`;
        implantados += 1;
        await this.registrarSucessoImportacao(response.id_meta);
      } catch (err: unknown) {
        item.implantStatus = 'error';
        item.implantMessage =
          err instanceof Error ? err.message : 'Erro ao criar cabo';
        falhas += 1;
      }
    }

    if (implantados > 0) {
      window.dispatchEvent(new CustomEvent('reloadMapCabos'));
      this.resumoImplantacaoCabos = this.montarResumoImplantacaoCabos(
        implantados,
        falhas,
      );
    } else if (falhas > 0) {
      window.alert('Nenhum cabo foi implantado. Verifique os erros na lista.');
    }
  }

  private idImportacaoParaProximoInsert(): number {
    return this.idImportacaoLoteAtual ?? 0;
  }

  private async registrarSucessoImportacao(idMeta: number): Promise<void> {
    const idCity = this.authService.getIdCity();
    if (!idCity || !Number.isFinite(idMeta)) {
      return;
    }

    if (this.idImportacaoLoteAtual === null) {
      this.idImportacaoLoteAtual = idMeta;
      try {
        await firstValueFrom(
          this.updateIdImportacaoService.atualizar({
            id_meta: idMeta,
            id_importacao: idMeta,
            id_city: idCity,
          }),
        );
      } catch (err: unknown) {
        console.warn(
          '[KML-IMPORT] Falha ao gravar âncora id_importacao:',
          err,
        );
      }
    }
  }

  private montarResumoImplantacao(
    implantados: number,
    falhas: number,
    duplicados: number,
  ): string {
    const partes = [`${implantados} ponto(s) implantado(s).`];
    if (falhas > 0) {
      partes.push(`${falhas} erro(s).`);
    }
    if (duplicados > 0) {
      partes.push(`${duplicados} duplicata(s) não implantada(s).`);
    }
    partes.push('O mapa principal foi atualizado. Feche quando terminar a revisão.');
    return partes.join(' ');
  }

  private normalizarListaApi<T>(retorno: unknown): T[] {
    if (retorno != null && typeof retorno === 'object' && 'response' in retorno) {
      const rows = (retorno as { response: unknown }).response;
      return Array.isArray(rows) ? (rows as T[]) : [];
    }
    return Array.isArray(retorno) ? (retorno as T[]) : [];
  }

  private montarSetNumerosCidade(
    registros: Record<string, unknown>[],
  ): Set<string> {
    const set = new Set<string>();
    for (const r of registros) {
      for (const rotulo of rotulosNumeroApiRow(r)) {
        const chave = chaveNumeroUnicoCidade(rotulo);
        if (chave) {
          set.add(chave);
        }
      }
    }
    return set;
  }

  private limparPreview(): void {
    this.parseResult = null;
    this.parseResultCabos = null;
    this.erroParseFatal = null;
    this.avisosParse = [];
    this.items = [];
    this.itemsCabos = [];
    this.pastasUi = [];
    this.pastasCabosUi = [];
    this.ignoredNonPoints = 0;
    this.ignoredNonLines = 0;
    this.duplicadosNaoImplantados = [];
    this.resumoImplantacao = null;
    this.resumoImplantacaoCabos = null;
    this.clearMarkers();
    this.clearPolylines();
    this.map = null;
  }

  private montarPastasCabos(): void {
    const byCap = new Map<KmlCaboCapacity, KmlImportCaboItem[]>();
    for (const item of this.itemsCabos) {
      const list = byCap.get(item.capacidadeF) ?? [];
      list.push(item);
      byCap.set(item.capacidadeF, list);
    }
    this.pastasCabosUi = [];
    const caps = [...byCap.keys()].sort((a, b) => a - b);
    for (const cap of caps) {
      const items = byCap.get(cap) ?? [];
      this.pastasCabosUi.push(this.criarPastaCaboUi(cap, items));
    }
  }

  private criarPastaCaboUi(
    capacidadeF: KmlCaboCapacity,
    items: KmlImportCaboItem[],
  ): KmlImportCaboFolderUi {
    const pasta: KmlImportCaboFolderUi = {
      capacidadeF,
      titulo: `CABO${capacidadeF}F`,
      importar: true,
      codigoScope: 'nacional',
      fibrasPorTubo: '12F',
      items,
    };
    this.aplicarDefaultsPastaCaboToItems(pasta);
    return pasta;
  }

  private aplicarDefaultsPastaCaboToItems(pasta: KmlImportCaboFolderUi): void {
    const codigoCores = this.scopeToCodigoCores(pasta.codigoScope);
    for (const item of pasta.items) {
      item.selected = pasta.importar;
      item.fibrasPorTubo = pasta.fibrasPorTubo;
      item.codigoCores = codigoCores;
    }
  }

  private scopeToCodigoCores(
    scope: CodigoCaboScopeUi,
  ): 'Telebras' | 'TIA/EIA 598' {
    return scope === 'nacional' ? 'Telebras' : 'TIA/EIA 598';
  }

  private montarResumoImplantacaoCabos(
    implantados: number,
    falhas: number,
  ): string {
    const partes = [`${implantados} cabo(s) implantado(s).`];
    if (falhas > 0) {
      partes.push(`${falhas} erro(s).`);
    }
    partes.push('O mapa principal foi atualizado. Feche quando terminar a revisão.');
    return partes.join(' ');
  }

  private montarPastas(): void {
    const ceos = this.items.filter((i) => i.folderKind === 'caixa');
    const ctos = this.items.filter((i) => i.folderKind === 'cto');
    this.pastasUi = [];

    if (ceos.length > 0) {
      this.pastasUi.push(this.criarPastaUi('caixa', 'CEO', ceos));
    }
    if (ctos.length > 0) {
      this.pastasUi.push(this.criarPastaUi('cto', 'CTO', ctos));
    }
  }

  private criarPastaUi(
    kind: KmlFolderKind,
    titulo: string,
    items: KmlImportItem[],
  ): KmlImportFolderUi {
    const lista = kind === 'cto' ? this.tiposCto : this.tiposCaixa;
    const padrao = lista[0];
    const idTipo = padrao?.idTipo.toString() ?? items[0]?.idTipo ?? '';
    const tipagem = padrao?.label ?? items[0]?.tipagem ?? '';
    for (const item of items) {
      item.selected = true;
      item.idTipo = idTipo;
      item.tipagem = tipagem;
    }
    return {
      kind,
      titulo,
      importar: true,
      idTipo,
      tipagem,
      items,
    };
  }

  private carregarTipos(): void {
    this.carregandoTipos = true;
    this.tiposService.buscarTiposCaixa().subscribe({
      next: (response) => {
        const rows: TipoCaixaRow[] = [];
        if (response.success && response.data?.length) {
          for (const row of response.data) {
            const id =
              Number(row.id_tipocaixa ?? row.id ?? row.ID_TIPO) ||
              rows.length + 1;
            const label =
              row.tipocaixa || row.tipo || row.descrição || row.nome || '';
            if (label.trim()) {
              rows.push({ idTipo: id, label: label.trim() });
            }
          }
        }
        if (rows.length === 0) {
          rows.push({ idTipo: 1, label: 'INDEFINIDO' });
        }
        this.tiposCaixa = rows.filter((r) => r.idTipo <= 9);
        this.tiposCto = rows.filter((r) => r.idTipo > 9);
        if (this.tiposCaixa.length === 0) {
          this.tiposCaixa = rows.slice(0, 1);
        }
        if (this.tiposCto.length === 0 && rows.length > 0) {
          const fallback =
            rows.find((r) => r.idTipo > 9) ?? rows[rows.length - 1];
          this.tiposCto = [fallback];
        }
        if (this.items.length > 0) {
          this.items = this.items.map((item) =>
            this.aplicarTipagemPadrao(item),
          );
          this.montarPastas();
          this.refreshMapView();
        }
        this.carregandoTipos = false;
      },
      error: () => {
        this.tiposCaixa = [{ idTipo: 1, label: 'INDEFINIDO' }];
        this.tiposCto = [{ idTipo: 10, label: 'CTO' }];
        this.carregandoTipos = false;
      },
    });
  }

  private aplicarTipagemPadrao(item: KmlImportItem): KmlImportItem {
    const lista = item.folderKind === 'cto' ? this.tiposCto : this.tiposCaixa;
    const padrao = lista[0];
    if (padrao) {
      item.tipagem = padrao.label;
      item.idTipo = padrao.idTipo.toString();
    }
    return item;
  }

  private fitBoundsUnificado(): void {
    if (!this.map) {
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    for (const item of this.items) {
      if (!item.selected) {
        continue;
      }
      bounds.extend({ lat: item.lat, lng: item.lng });
    }
    for (const item of this.itemsCabos) {
      if (!item.selected) {
        continue;
      }
      for (const p of item.path) {
        bounds.extend(p);
      }
    }
    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds, 48);
    }
  }

  private syncPolylinesToCabos(): void {
    if (!this.map) {
      return;
    }
    this.clearPolylines();
    for (const item of this.itemsCabos) {
      if (!item.selected || item.path.length < 2) {
        continue;
      }
      const polyline = new google.maps.Polyline({
        map: this.map,
        path: item.path,
        strokeColor: '#1565c0',
        strokeOpacity: 0.9,
        strokeWeight: 3,
      });
      polyline.addListener('click', () => this.destacarCaboNoMapa(item));
      this.polylines.push(polyline);
    }
  }

  private clearPolylines(): void {
    for (const pl of this.polylines) {
      pl.setMap(null);
    }
    this.polylines = [];
  }

  private refreshMapView(): void {
    if (!this.map) {
      return;
    }
    if (this.items.length === 0 && this.itemsCabos.length === 0) {
      return;
    }
    this.syncMarkersToItems();
    this.syncPolylinesToCabos();
    this.fitBoundsUnificado();
    setTimeout(() => {
      if (!this.map) {
        return;
      }
      google.maps.event.trigger(this.map, 'resize');
      this.fitBoundsUnificado();
    }, 150);
  }

  private syncMarkersToItems(): void {
    if (!this.map) {
      return;
    }
    this.clearMarkers();
    for (const item of this.items) {
      const marker = new google.maps.Marker({
        map: this.map,
        position: { lat: item.lat, lng: item.lng },
        title: item.name || item.numero,
        visible: item.selected,
        icon: {
          url:
            item.folderKind === 'cto'
              ? '/assets/CTO80.png'
              : '/assets/fosc amarela.png',
          scaledSize: new google.maps.Size(18, 22),
        },
      });
      marker.addListener('click', () => this.destacarNoMapa(item));
      this.markers.push(marker);
    }
  }

  private clearMarkers(): void {
    for (const m of this.markers) {
      m.setMap(null);
    }
    this.markers = [];
  }
}
