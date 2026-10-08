import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Cabos1f } from '../modelo/Cabos1f';
import { Cabos2f } from '../modelo/Cabos2f';
import { Cabos4f } from '../modelo/Cabos4f';
import { Cabos6f } from '../modelo/Cabos6f';
import { Cabos8f } from '../modelo/Cabos8f';
import { Cabos12f } from '../modelo/Cabos12f';
import { Cabos24f } from '../modelo/Cabos24f';
import { Cabos36f } from '../modelo/Cabos36f';
import { Cabos48f } from '../modelo/Cabos48f';
import { Cabos72f } from '../modelo/Cabos72f';
import { Cabos144f } from '../modelo/Cabos144f';
import { Caixa } from '../modelo/Caixa';
import { Cto } from '../modelo/Cto';
import { Cto_SP } from '../modelo/Cto_SP';
import { PopsCli } from '../modelo/PopsCli';
import { PopsEst } from '../modelo/popsEst';
import { Condominios } from '../modelo/Condominios';
import { Dios } from '../modelo/dios';
import { PosteAprovado } from '../modelo/poste-aprovado';
import { PosteConcessionaria } from '../modelo/poste-concessionaria';
import { Segmento } from '../modelo/segmento';
import { Anotacoes } from '../modelo/Anotacoes';
import { Poligonos } from '../modelo/poligonos';

//import { CaixaInternaComponent } from '../caixa-interna/caixa-interna.component';
import { ChangeDetectorRef } from '@angular/core'; /// ============novo
import { GoJSDemoComponent } from '../gojs-demo/gojs-demo.component';
import type { CondominioInternoModalData } from '../condominio-interno-modal/condominio-interno-modal.data';
import { AuthService } from '../servico/auth.service';
import { MapLayerVisibilityService } from '../servico/map-layer-visibility.service';
import { animate, animation } from '@angular/animations';

import { MapLayersDrawerComponent } from '../map-layers-drawer/map-layers-drawer.component';
import { MapSearchButtonsComponent } from '../map-search-buttons/map-search-buttons.component';
import { MapTracerButtonsComponent } from '../map-tracer-buttons/map-tracer-buttons.component';
import { MapContextMenuComponent } from '../map-context-menu/map-context-menu.component';
import { TipagemCabosModalComponent, TipagemCabosData } from '../tipagem-cabos-modal/tipagem-cabos-modal.component';
import { TipagemPoligonoComponent, TipagemPoligonoData } from '../tipagem-poligono/tipagem-poligono.component';
import {
  CompartilhamentoService,
  CaixaData,
  ClienteData,
  EstacaoData,
  LogradouroPesquisaData,
  ViabilidadePontoMapaData,
  ViabilidadeCentrarEquipamentoData,
  ViabilidadeCirculoCaixaData,
} from '../servico/compartilhamento.service';
import { KmlExportService } from '../servico/kml-export.service';
import {
  KmlPolygonExportService,
  PolygonMapExportData,
} from '../servico/kml-polygon-export.service';
import { PoligonoDashboardService } from '../servico/poligono-dashboard.service';
import { InsertCaboService } from '../servico/insert-cabo.service';
import { PoligonosService, InserirPoligonoPayload } from '../servico/poligonos.service';
import {
  UpdatePoligonoService,
  AtualizarGeometriaPoligonoPayload,
} from '../servico/update-poligono.service';
import { UpdateCaboService } from '../servico/update-cabo.service';
import { UpdateCaixaService } from '../servico/update-caixa.service';
import { UpdateDioService, UpdateDioData, UpdateDioResponse } from '../servico/update-dio.service';
import { UpdateEstacaoService } from '../servico/update-estacao.service';
import { UpdateClienteService } from '../servico/update-cliente.service';
import {
  LabelCaboDialogComponent,
  LabelCaboDialogData,
} from '../label-cabo-dialog/label-cabo-dialog.component';
import {
  LabelPoligonoDialogComponent,
  LabelPoligonoDialogData,
} from '../label-poligono-dialog/label-poligono-dialog.component';
import type { DashboardPoligonoData } from '../dashboard-poligono/dashboard-poligono.component';
import { InsertLogService } from '../servico/insert-log.service';
import { ExcluiCaboService } from '../servico/exclui-cabo.service';
import { DivideCaboService } from '../servico/divide-cabo.service';
import { ExcluiCaixaService, ExcluiCaixaRequest, ExcluiCaixaResponse } from '../servico/exclui-caixa.service';
import { ExcluiDioService, ExcluiDioRequest, ExcluiDioResponse } from '../servico/exclui-dio.service';
import { SegmentoService } from '../servico/segmento.service';
import { PostesConcessionariaService } from '../servico/postes-concessionaria.service';
import { InsertPosteAprovadoService } from '../servico/insert-poste-aprovado.service';
import { ExcluiPosteAprovadoService } from '../servico/exclui-poste-aprovado.service';
import { AprovarPostesModalComponent, AprovarPostesConfirmacao } from '../aprovar-postes-modal/aprovar-postes-modal.component';
import { ExcluiEstacaoService, ExcluiEstacaoRequest, ExcluiEstacaoResponse } from '../servico/exclui-estacao.service';
import { ExcluiCondominioService, ExcluiCondominioRequest, ExcluiCondominioResponse } from '../servico/exclui-condominio.service';
import { ExcluiPoligonoService, ExcluiPoligonoRequest, ExcluiPoligonoResponse } from '../servico/exclui-poligono.service';
import { ExcluiClienteService, ExcluiClienteRequest, ExcluiClienteResponse } from '../servico/exclui-cliente.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { take } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PopInfoModalComponent } from '../pop-info-modal/pop-info-modal.component';
import { PopInfoAtivacaoModalComponent } from '../pop-info-ativacao-modal/pop-info-ativacao-modal.component';
import { UpdateClienteAtivacaoResponse } from '../servico/update-cliente-ativacao.service';
import { PopInfoUpdateService } from '../servico/pop-info-update.service';
import { PopInfoEstacaoUpdateService } from '../servico/pop-info-estacao-update.service';
import { PopInfoService } from '../servico/pop-info.service';
import { PopsInfo } from '../modelo/PopsInfo';
import { PopEstacaoInfoModalComponent } from '../pop-estacao-info-modal/pop-estacao-info-modal.component';
import { VisualizaDioComponent } from '../visualiza-dio/visualiza-dio.component';
import { VisualizaCaboComponent } from '../visualiza-cabo/visualiza-cabo.component';
import { GraphvizModalComponent } from '../graphviz-modal/graphviz-modal.component';
import { ConexaoCaboCaixaEmendaComponent, ConexaoCaboCaixaEmendaData } from '../conexao-cabo-caixa-emenda/conexao-cabo-caixa-emenda.component';
import { ConexaoCaboDioComponent, ConexaoCaboDioData } from '../conexao-cabo-dio/conexao-cabo-dio.component';
import { PlotaCaixaComponent, PlotaCaixaData } from '../plota-caixa/plota-caixa.component';
import { DetalhesCaixaComponent, DetalhesCaixaData } from '../detalhes-caixa/detalhes-caixa.component';
import { PlotaDioComponent, PlotaDioData } from '../plota-dio/plota-dio.component';
import { PlotaEstacaoComponent, PlotaEstacaoData } from '../plota-estacao/plota-estacao.component';
import { PlotaClienteComponent, PlotaClienteData } from '../plota-cliente/plota-cliente.component';
import { CadastroClienteComponent } from '../cadastro-cliente/cadastro-cliente.component';
import { BocasService } from '../servico/bocas.service';
import { Bocas } from '../modelo/Bocas';
import { BandejasService } from '../servico/bandejas.service';
import { Bandejas } from '../modelo/Bandejas';
import { firstValueFrom } from 'rxjs';
import { BuscaObjetoConexPontaService, ObjetoConectado } from '../servico/busca-objeto-conex-ponta.service';

//import { Cto_SP } from '../modelo/Cto_SP';
//import { GoogleInfoWindowComponent } from '../google-infowindow/google-infowindow.component';

/**
 * ============================================================================
 * ÍNDICE DE SEÇÕES DO COMPONENTE GOOGLE MAPS
 * ============================================================================
 * (Atualizar linhas ao mover blocos grandes de código.)
 *
 * PROPRIEDADES:
 * - Linha ~262: @Input() — Dados de entrada (destinos, cabos, caixas, etc.)
 * - Linha ~290: Propriedades do Mapa (center, zoom, title, mapOptions, etc.)
 * - Linha ~308: Marcadores (markerCaixas, polígonos, modoEdicaoPoligono, etc.)
 * - Linha ~350: Postes Concessionária (markerPostesConcessionaria, destinoPostesConcessionaria, carregandoPostesConcessionaria)
 * - Linha ~367: Paths de Polylines (polylinePaths1f, polylinePaths2f, etc.)
 * - Linha ~384: Polylines (polylines1f, polylines2f, etc.)
 * - Linha ~397: InfoWindows (infoWindows1f, infoWindows2f, etc.)
 * - Linha ~409: Destaque Tracer Mapa (highlightedPolylines, labels, splitters)
 * - Linha ~415: Context Menu e dados de clique (caixa, cabo, DIO, cliente, etc.)
 * - Linha ~455: Edição de posição (caixa/CTO/DIO/estação/cliente no mapa)
 * - Linha ~493: Edição de Cabos (isEditingCabo, pontasOriginais, pontasProtegidas, etc.)
 * - Linha ~512: Desenho de Cabos (isDesenhandoCabo, caboEmDesenho, tipagem, etc.)
 * - Linha ~527: Desenho de Polígonos (isDesenhandoPoligono, preview, tipagem, etc.)
 * - Linha ~538: Medição de Distância / Régua (modoMedicao, pontosMedicao, etc.)
 * - Linha ~4635: Limites de zoom / visibilidade (ZOOM_LEVEL_*, MAX_VISIBLE_MARKERS_*)
 * - Linha ~4676: Opções de Polylines (polylineOptions1f, polylineOptions2f, etc.)
 *
 * MÉTODOS:
 * - Linha ~550: Constructor
 *
 * - Linha ~588: CONTEXT MENU
 *   - setupContextMenuListener()
 *   - showContextMenu()
 *   - hideContextMenu()
 *   - onContextMenuAction()
 *
 * - Linha ~939: AÇÕES DO CONTEXT MENU (criarCaixa, criarDIO, editar/excluir, etc.)
 *   - abrirDetalhesCaixa() — modal Detalhes Caixa (checkbox INSTALADA)
 *
 * - Linha ~1935: EDIÇÃO DE CABOS
 *   - editarCabo()
 *   - verificarConexoesPontas()
 *   - iniciarEdicaoCabo()
 *   - finalizarEdicaoCabo()
 *   - cancelarEdicaoCabo()
 *   - adicionarListenerProtecaoPontas()
 *
 * - Linha ~2166: DIVISÃO DE CABOS (context menu no vértice)
 *   - adicionarListenerRemoverVertice()
 *   - removerVertice()
 *   - dividirCaboNoVertice()
 *
 * - Linha ~2357: AUXILIARES DE CABOS
 *   - normalizarTipoFibra()
 *   - getArraysPorCapacidade()
 *   - adicionarListenersCaboPolyline()
 *
 * - Linha ~2880: DETECÇÃO DE CONEXÃO CABO-CAIXA / DIO
 *   - abrirModalConexao()
 *   - abrirModalConexaoDio()
 *   - encontrarCaixaProxima()
 *   - (Verificação de conexão no listener set_at em tempo real)
 *
 * - Linha ~3483: GESTÃO DE EVENTOS DE CABOS
 *   - processarRightClickCabo()
 *   - recriarListenerRightClick()
 *   - recriarListenerRightClickMapa()
 *
 * - Linha ~3776: AÇÕES DE CABOS (context menu)
 *   - liberarCabo()
 *   - excluirCabo()
 *
 * - Linha ~4169: DESTAQUE TRACER MAPA
 *   - setupCabosHighlightListeners()
 *   - setupGoJSModalListener()
 *   - highlightCabosComCapacidade()
 *   - highlightTraceSplitters()
 *   - highlightCabos() / highlightCabosInArray()
 *   - addTraceHighlightLabel()
 *   - clearCabosHighlight()
 *
 * - Linha ~4840: Lifecycle do componente
 *   - ngAfterViewInit()
 *   - ngOnInit() — inclui layersChanged$ (camada postes_concessionaria ~4927)
 *   - ngOnChanges()
 *   - ngOnDestroy()
 *   - onMapInitialized() (~7869)
 *
 * - Linha ~5495: POSTES NO MAPA
 *   - updateMarkersPostesAP()
 *   - onCarregarPostesConcessionaria() — busca por extent visível
 *   - updateMarkersPostesConcessionaria() — cores por SITUACAO, camada postes_concessionaria
 *
 * - Linha ~6923: GESTÃO DE MARCADORES
 *   - updateMarkers()
 *   - adicionarMarcadorCaixa()
 *   - updateMarkersCTO() / updateMarkersCTOSP()
 *   - updateMarkersDios() / updateMarkersCondominios()
 *   - updateMarkersPopsCli() / updatePoligonos()
 *   - updateVisibleMarkers() (~8042)
 *
 * - Linha ~6343: CAIXAS — INSTALADA (ícones CEO/CTO/CTOSP)
 *   - aplicarInstaladaCaixaNoMapa()
 *   - caixaEstaInstalada()
 *   - obterIconeCaixaPorTipo()
 *
 * - Linha ~7396: GESTÃO DE POLYLINES (atualização por capacidade)
 *   - updatePolylinesCabos1f()
 *   - updatePolylinesCabos2f()
 *   - etc.
 *
 * - Linha ~9250: EDIÇÃO DE DIO / CAIXA / ESTAÇÃO / CLIENTE (posição no mapa)
 *   - habilitarEdicaoDio(), habilitarEdicaoCaixa(), etc.
 *
 * - Linha ~10778: MODAIS (Visualiza DIO, Visualiza Cabo, GoJS)
 *   - openVisualizaDioModal()
 *   - openVisualizaCaboModal()
 *   - openGoJSModal()
 *
 * - Linha ~11625: CRIAÇÃO DE POLYLINES
 *   - createCaboPolylines()
 *   - createCabo1fPolylines() … createCabo144fPolylines()
 *
 * - Linha ~12708: DESENHO DE CABOS (toolbar / eventos window)
 *   - startDesenhoCabo()
 *   - finalizarDesenhoCabo() / cancelarDesenhoCabo()
 *
 * - Linha ~12917: CRIAÇÃO DE CABOS COM TIPAGEM
 *   - criarCaboComTipagemEIdMeta()
 *
 * - Linha ~13377: DESENHO DE POLÍGONOS
 *   - startDesenhoPoligono()
 *   - finalizarDesenhoPoligono() / cancelarDesenhoPoligono()
 *
 * - Linha ~13631: MEDIÇÃO DE DISTÂNCIA (Régua)
 *   - ativarModoMedicao()
 *   - desativarModoMedicao()
 *
 * - Linha ~13862: EDIÇÃO DE POLÍGONOS (modo toolbar)
 *   - ativarModoEdicaoPoligonoDoToolbar() / desativarModoEdicaoPoligonoCompleto()
 *   - context menu e vértices arrastáveis
 *
 * ============================================================================
 */

@Component({
  selector: 'app-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.css'],
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, MapLayersDrawerComponent, MapSearchButtonsComponent, MapTracerButtonsComponent, MapContextMenuComponent, TipagemCabosModalComponent, TipagemPoligonoComponent, MatIconModule, MatButtonModule, NgbModalModule],
})
export class GoogleMapsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  
  // ============================================================================
  // 📥 SEÇÃO: INPUTS - Dados de entrada do componente
  // ============================================================================
  @Input() destinoAnotacoes: Anotacoes[]=[];
  @Input() destinoPoligonos: Poligonos[]=[];
  @Input() destinoCondominios: Condominios[]=[];
  @Input() destinoDios: Dios[] = [];
  @Input() destinoPostesAP: PosteAprovado[] = [];
  @Input() destinoSegmentos: Segmento[] = [];
  @Input() destinoPopsCli: PopsCli[] = [];
  @Input() destinoPopsCliDes: PopsCli[] = [];
  @Input() destinoPopsCliAtv: PopsCli[] = [];
  @Input() destinoPopsEst: PopsEst[] = [];
  @Input() destino: Caixa[] = [];
  @Input() destinoCTO: Cto[] = [];
  @Input() destinoCTOSP: Cto_SP[] = [];
  @Input() destinoCabos1f: Cabos1f[] = [];
  @Input() destinoCabos2f: Cabos2f[] = [];
  @Input() destinoCabos4f: Cabos4f[] = [];
  @Input() destinoCabos6f: Cabos6f[] = [];
  @Input() destinoCabos8f: Cabos8f[] = [];
  @Input() destinoCabos12f: Cabos12f[] = [];
  @Input() destinoCabos24f: Cabos24f[] = [];
  @Input() destinoCabos36f: Cabos36f[] = [];
  @Input() destinoCabos48f: Cabos48f[] = [];
  @Input() destinoCabos72f: Cabos72f[] = [];
  @Input() destinoCabos144f: Cabos144f[] = [];

  // ============================================================================
  // 🗺️ SEÇÃO: PROPRIEDADES DO MAPA
  // ============================================================================
  title: string = "Fiberworks";
  center: google.maps.LatLngLiteral = { lat: -23.326803, lng: -52.114882 };
  zoom = 13;
  // mapId: trocar junto com a chave API no index.html ao publicar no Amplify
  //   LOCAL:  8c572a391e3b7eb1f8127118  (My Project Angular)
  //   DEPLOY: 3b6c6c1a321f468a743f09d0  (My First Project)
  mapOptions: google.maps.MapOptions = {
    //mapId: '8c572a391e3b7eb1f8127118', //local
    mapId: '2fa2a1283852882f399d9dde', //deploy

  };
  @ViewChild('mapContainer', { read: ElementRef }) mapContainerRef!: ElementRef;
  caixaSelecionada: string | null = null;


  // ============================================================================
  // 📍 SEÇÃO: MARCADORES (MARKERS)
  // ============================================================================
  // Marcador da posição atual do usuário
  currentLocationMarker: google.maps.LatLngLiteral | null = null;
  currentLocationMarkerOptions: any = {
    icon: {
      path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
      scale: 4,
      fillColor: '#4285f4',
      fillOpacity: 0.2,
      strokeColor: '#4285f4',
      strokeWeight: 3,
      strokeOpacity: 0.3,
    },
    title: 'Sua localização atual',
    animation: google.maps.Animation.BOUNCE,
  };

  // Arrays de marcadores
  markerAnotacoes: google.maps.Marker[] = [];
  /** Polígonos de portas / áreas (`destinoPoligonos`) — não são `Marker`. */
  poligonosMapa: google.maps.Polygon[] = [];
  /** Rótulos de `Label` ao centro de cada polígono (ícone invisível + `label`). */
  poligonosLabelMarkers: google.maps.Marker[] = [];
  /** Polígonos desenhados nesta sessão (fora do ciclo `updatePoligonos`). */
  poligonosMapaLocais: google.maps.Polygon[] = [];
  poligonosLabelMarkersLocais: google.maps.Marker[] = [];

  /**
   * Quando verdadeiro, duplo clique num polígono inicia edição de vértices (comportamento tipo cabo).
   * Fora deste modo, polígonos permanecem `clickable: false` para não interferir no mapa.
   */
  modoEdicaoPoligonoArmado = false;
  /** Polígono cuja edição está ativa (vértices arrastáveis). */
  private poligonoEmEdicao: google.maps.Polygon | null = null;
  private poligonosEdicaoDuploListeners: google.maps.MapsEventListener[] = [];
  private poligonosEdicaoRightClickListeners: google.maps.MapsEventListener[] = [];
  /** Listeners MVC no `paths` durante edição (atualização do marcador do rótulo). */
  private poligonoEmEdicaoPathHandles: google.maps.MapsEventListener[] = [];
  private listenerEscModoPoligono: ((ev: KeyboardEvent) => void) | null = null;
  markerDios: google.maps.Marker[] = [];
  markerPostesAP: google.maps.Marker[] = [];
  markerPostesConcessionaria: google.maps.Marker[] = [];
  destinoPostesConcessionaria: PosteConcessionaria[] = [];
  carregandoPostesConcessionaria = false;
  postesConcessionariaBotaoVisivel = false;
  modoAprovarPostesAtivo = false;
  private selecaoPostesInicio: google.maps.LatLng | null = null;
  private selecaoPostesArrastando = false;
  private retanguloSelecaoPostes: google.maps.Rectangle | null = null;
  private listenersAprovarPostes: google.maps.MapsEventListener[] = [];
  private listenerEscAprovarPostes: ((ev: KeyboardEvent) => void) | null = null;
  private aprovarPostesOverlay: google.maps.OverlayView | null = null;
  private aprovarPostesModalRef: NgbModalRef | null = null;
  markerSegmentos: google.maps.Marker[] = [];
  markerCondominios: google.maps.Marker[] = [];
  markerPopsCli: google.maps.Marker[] = [];
  markerPopsCliAtv: google.maps.Marker[] = [];
  markerPopsCliDes: google.maps.Marker[] = [];
  markerPopsEst: google.maps.Marker[] = [];
  markerCaixas: google.maps.Marker[] = [];
  markerCtos: google.maps.Marker[] = [];
  markerCtosSP: google.maps.Marker[] = [];
  
  // Opções de marcadores
  markerOptions: google.maps.MarkerOptions[] = [];
  markerOptionsCTO: google.maps.MarkerOptions[] = [];
  markerOptionsCTOSP: google.maps.MarkerOptions[] = [];
  polylinePaths1f: google.maps.LatLngLiteral[][] = [];
  polylinePaths2f: google.maps.LatLngLiteral[][] = [];
  polylinePaths4f: google.maps.LatLngLiteral[][] = [];
  polylinePaths6f: google.maps.LatLngLiteral[][] = [];
  polylinePaths8f: google.maps.LatLngLiteral[][] = [];
  polylinePaths12f: google.maps.LatLngLiteral[][] = [];
  polylinePaths24f: google.maps.LatLngLiteral[][] = [];
  polylinePaths36f: google.maps.LatLngLiteral[][] = [];
  polylinePaths48f: google.maps.LatLngLiteral[][] = [];
  polylinePaths72f: google.maps.LatLngLiteral[][] = [];
  polylinePaths144f: google.maps.LatLngLiteral[][] = [];

  
  

  // 🔥 INFOWINDOW: Array para armazenar as polylines 6f com InfoWindow
  // Arrays para armazenar as polylines criadas programaticamente
  polylines1f: google.maps.Polyline[] = [];
  polylines2f: google.maps.Polyline[] = [];
  polylines4f: google.maps.Polyline[] = [];
  polylines6f: google.maps.Polyline[] = [];
  polylines8f: google.maps.Polyline[] = [];
  polylines12f: google.maps.Polyline[] = [];
  polylines24f: google.maps.Polyline[] = [];
  polylines36f: google.maps.Polyline[] = [];
  polylines48f: google.maps.Polyline[] = [];
  polylines72f: google.maps.Polyline[] = [];
  polylines144f: google.maps.Polyline[] = [];

  // Arrays para armazenar os InfoWindows
  infoWindows1f: google.maps.InfoWindow[] = [];
  infoWindows2f: google.maps.InfoWindow[] = [];
  infoWindows4f: google.maps.InfoWindow[] = [];
  infoWindows6f: google.maps.InfoWindow[] = [];
  infoWindows8f: google.maps.InfoWindow[] = [];
  infoWindows12f: google.maps.InfoWindow[] = [];
  infoWindows24f: google.maps.InfoWindow[] = [];
  infoWindows36f: google.maps.InfoWindow[] = [];
  infoWindows48f: google.maps.InfoWindow[] = [];
  infoWindows72f: google.maps.InfoWindow[] = [];
  infoWindows144f: google.maps.InfoWindow[] = [];

  // 🗺️ NOVO: Controle de destaque dos cabos
  highlightedPolylines: google.maps.Polyline[] = [];
  highlightedTraceLabelMarkers: google.maps.Marker[] = [];
  highlightedTraceSplitterMarkers: google.maps.Marker[] = [];
  originalPolylineOptions: Map<google.maps.Polyline, google.maps.PolylineOptions> = new Map();

  // 🎯 Propriedades para context menu
  contextMenuVisible = false;
  contextMenuPosition = { x: 0, y: 0 };
  contextMenuType: 'caixa' | 'map' | 'cabo' | 'dio' | 'cliente' | 'estacao' | 'condominio' | 'vertice' | 'poligono' | 'sobra' | 'poste_aprovado' = 'map'; // 🆕 Tipo de contexto do menu
  private clickedPoligono: google.maps.Polygon | null = null;
  private clickedVertexIndex: number | null = null; // 🆕 Índice do vértice clicado (para menu vertice)
  private contextMenuListenerAdded = false; // Flag para evitar listeners duplicados
  private clickedCaboData: any = null; // 🆕 Armazena dados do cabo clicado
  private clickedCaixaData: any = null; // 🆕 Armazena dados da caixa clicada
  private clickedCTOData: any = null; // 🆕 Armazena dados da CTO clicada
  private clickedCTOSPData: any = null; // 🆕 Armazena dados da CTO_SP clicada
  private clickedDioData: any = null; // 🆕 Armazena dados do DIO clicado
  private clickedSobraData: Segmento | null = null;
  private clickedPosteAprovadoData: PosteAprovado | null = null;
  private clickedCliData: any = null; // 🆕 Armazena dados do cliente clicado
  private clickedCliAtData: any = null; // 🆕 Armazena dados do cliente ativado clicado
  private clickedCliDesData: any = null; // 🆕 Armazena dados do cliente desativado clicado
  /**
   * Referência ao marcador do cliente no último menu de contexto (CLI / CLIAT / CLIDES).
   * Usada para `extrairRecursosDoMarcadorCliente` (recurso_* e portas_olt) na abertura do modal de ativação.
   * Zera em `hideContextMenu` (normalmente após abrir o modal — os valores já foram lidos),
   * no menu de estação, após excluir cliente, ou é substituída ao clicar noutro marcador de cliente.
   */
  private clickedClienteMarker: google.maps.Marker | null = null;
  /** Cópia da ref do marcador ao abrir o modal de ativação (hideContextMenu zera clickedClienteMarker). */
  private marcadorClienteAtivacaoModal: google.maps.Marker | null = null;
  private clickedEstacaoData: any = null; // 🆕 Armazena dados da estação clicada
  private clickedCondominioData: Condominios | null = null; // 🆕 Armazena dados do condomínio clicado
  /** Cópia da ref do marcador ao abrir ações do condomínio (hideContextMenu zera clickedCondominioMarker). */
  private clickedCondominioMarker: google.maps.Marker | null = null;
  private clickedPolyline: google.maps.Polyline | null = null; // 🆕 Armazena a polyline clicada
  private ultimaCoordenadaClique: google.maps.LatLng | null = null; // 🆕 Armazena coordenada do último clique para identificar ponta
  private ultimaCoordenadaContextMenu: google.maps.LatLng | null = null; // 🆕 Armazena coordenada do context menu do mapa
  /** Marcador temporário no ponto da pesquisa de logradouro (endereço) */
  private marcadorLogradouroPesquisa: google.maps.Marker | null = null;
  private infoWindowLogradouroPesquisa: google.maps.InfoWindow | null = null;
  /** Marcador da pesquisa de viabilidade (cruz verde) */
  private marcadorViabilidadePesquisa: google.maps.Marker | null = null;
  /** Contorno fino azul em cada CEO/CTO-SP da lista de viabilidade (metros no terreno). */
  private static readonly VIABILIDADE_CIRCULO_RAIO_METROS = 14;
  private circulosViabilidadeCaixas: google.maps.Circle[] = [];
  // 🔧 Propriedades para edição de caixa/CTO/CTO_SP
  private caixaEmEdicao: google.maps.Marker | null = null; // Marcador em edição (caixa, CTO ou CTO_SP)
  private caixaEmEdicaoIndex: number | null = null; // Índice do item em edição
  private caixaEmEdicaoTipo: 'caixa' | 'cto' | 'ctosp' | null = null; // Tipo do item em edição
  private caixaEmEdicaoOriginalPosition: { lat: number, lng: number } | null = null; // Posição original para cancelar
  private caixaEmEdicaoOriginalIcon: google.maps.Icon | null = null; // Ícone original para restaurar
  private listenerMapaSalvarCaixa: google.maps.MapsEventListener | null = null; // Listener para salvar ao clicar no mapa
  private listenerEscCancelarCaixa: any = null; // Listener para cancelar com ESC
  // Edição de sobra (segmento)
  private sobraEmEdicao: google.maps.Marker | null = null;
  private sobraEmEdicaoIndex: number | null = null;
  private sobraEmEdicaoOriginalPosition: { lat: number; lng: number } | null = null;
  private listenerMapaSalvarSobra: google.maps.MapsEventListener | null = null;
  private listenerEscCancelarSobra: ((event: KeyboardEvent) => void) | null = null;
  // 🔧 Propriedades para edição de DIO
  private dioEmEdicao: google.maps.Marker | null = null; // Marcador DIO em edição
  private dioEmEdicaoIndex: number | null = null; // Índice do DIO em edição
  private dioEmEdicaoOriginalPosition: { lat: number, lng: number } | null = null; // Posição original para cancelar
  private dioEmEdicaoOriginalIcon: google.maps.Icon | null = null; // Ícone original para restaurar

  // Variáveis para edição de estação
  private estacaoEmEdicao: google.maps.Marker | null = null; // Marcador estação em edição
  private estacaoEmEdicaoIndex: number | null = null; // Índice da estação em edição
  private estacaoEmEdicaoOriginalPosition: { lat: number, lng: number } | null = null; // Posição original para cancelar
  private estacaoEmEdicaoOriginalIcon: google.maps.Icon | null = null; // Ícone original para restaurar
  private listenerMapaSalvarEstacao: google.maps.MapsEventListener | null = null; // Listener para salvar ao clicar no mapa
  private listenerEscCancelarEstacao: ((event: KeyboardEvent) => void) | null = null; // Listener para cancelar com ESC
  private clienteEmEdicao: google.maps.Marker | null = null;
  private clienteEmEdicaoIndex: number | null = null;
  private clienteEmEdicaoTipo: 'cli' | 'cliat' | 'clides' | null = null;
  private clienteEmEdicaoOriginalPosition: { lat: number, lng: number } | null = null;
  private clienteEmEdicaoOriginalIcon: google.maps.Icon | null = null;
  private listenerMapaSalvarCliente: google.maps.MapsEventListener | null = null;
  private listenerEscCancelarCliente: ((event: KeyboardEvent) => void) | null = null;
  private listenerMapaSalvarDio: google.maps.MapsEventListener | null = null; // Listener para salvar ao clicar no mapa
  private listenerEscCancelarDio: any = null; // Listener para cancelar com ESC
  // 🔧 Propriedades para detectar long press (mobile)
  private touchStartTime: number = 0;
  private touchStartPosition: { x: number, y: number } | null = null;
  private longPressTimer: any = null;
  private readonly LONG_PRESS_DURATION = 500; // 500ms para considerar long press
  private longPressMarker: google.maps.Marker | null = null; // Marcador em long press
  private longPressPolyline: google.maps.Polyline | null = null; // Polyline em long press
  private isCaboClicked = false; // 🆕 Flag para saber se foi clique em cabo
  private isEditingCabo: boolean = false; // 🆕 Flag para saber se está editando um cabo
  private isIniciandoEdicao: boolean = false; // 🆕 Flag para saber se está iniciando edição (protege clickedPolyline)
  private isFinalizandoEdicao: boolean = false; // 🛡️ Flag para saber se está finalizando edição (proteção adicional)
  private clickedPolylineOriginalColor: string = ''; // 🆕 Para restaurar a cor original
  private clickedPolylineOriginalStrokeWeight = 3;
  private clickedPolylineOriginalStrokeOpacity = 0.7;
  private listenerMapaFinalizarEdicao: google.maps.MapsEventListener | null = null; // 🆕 Listener para finalizar edição
  private listenerMapaRightClick: google.maps.MapsEventListener | null = null; // 🆕 Listener de rightclick do mapa
  private pontasOriginais: { // 🛡️ Armazena pontas originais para proteção
    pontaA: {lat: number, lng: number} | null,
    pontaB: {lat: number, lng: number} | null
  } = { pontaA: null, pontaB: null };
  private listenerPathSetAt: google.maps.MapsEventListener | null = null; // 🛡️ Listener para detectar movimento de vértices
  private pontasProtegidas: { // 🔌 Controla quais pontas estão protegidas (conectadas)
    pontaA: boolean,
    pontaB: boolean
  } = { pontaA: false, pontaB: false };
  private pathOriginal: google.maps.LatLng[] | null = null; // 💾 Armazena path original para restaurar se cancelar

  // 🗺️ Propriedades para desenho de cabo =============================================
  isDesenhandoCabo = false;
  caboEmDesenho: google.maps.Polyline | null = null;
  pontosCaboEmDesenho: google.maps.LatLng[] = [];
  caboDesenhado: google.maps.Polyline | null = null;
  listenerMapaDesenho: google.maps.MapsEventListener | null = null;
  listenerRightClickDesenho: google.maps.MapsEventListener | null = null;
  
  // 🛡️ Listener para prevenir menu do navegador no elemento do mapa
  private listenerContextMenuDOM: (() => void) | null = null;
  
  // 🆕 Propriedades para modal de tipagem
  tipagemCabosModalVisible = false;
  pontosCaboAguardandoTipagem: google.maps.LatLng[] = []; // Guarda pontos enquanto modal está aberto

  // 🔷 DESENHO DE POLÍGONO =============================================================
  isDesenhandoPoligono = false;
  pontosPoligonoEmDesenho: google.maps.LatLng[] = [];
  poligonoPreviewPolyline: google.maps.Polyline | null = null;
  poligonoPreviewPolygon: google.maps.Polygon | null = null;
  listenerMapaDesenhoPoligono: google.maps.MapsEventListener | null = null;
  listenerRightClickDesenhoPoligono: google.maps.MapsEventListener | null = null;
  tipagemPoligonoModalVisible = false;
  pontosPoligonoAguardandoTipagem: google.maps.LatLng[] = [];

  // ============================================================================
  // 📏 SEÇÃO: PROPRIEDADES PARA MEDIÇÃO DE DISTÂNCIA (RÉGUA)
  // ============================================================================
  modoMedicao = false;
  pontosMedicao: google.maps.LatLng[] = [];
  linhaMedicao: google.maps.Polyline | null = null;
  marcadoresMedicao: google.maps.Marker[] = [];
  labelsMedicao: google.maps.Marker[] = [];
  listenerMapaMedicao: google.maps.MapsEventListener | null = null;

  // ============================================================================
  // 🏗️ CONSTRUCTOR
  // ============================================================================
  constructor(
    private cdr: ChangeDetectorRef,
    private authService : AuthService,
    private layerVisibilityService: MapLayerVisibilityService,
    private compartilhamentoService: CompartilhamentoService,
    private kmlExportService: KmlExportService,
    private kmlPolygonExportService: KmlPolygonExportService,
    private poligonoDashboardService: PoligonoDashboardService,
    private insertCaboService: InsertCaboService,
    private poligonosService: PoligonosService,
    private updatePoligonoService: UpdatePoligonoService,
    private updateCaboService: UpdateCaboService,
    private updateCaixaService: UpdateCaixaService,
    private updateDioService: UpdateDioService,
    private updateEstacaoService: UpdateEstacaoService,
    private bocasService: BocasService,
    private bandejasService: BandejasService,
    private dialog: MatDialog,
    private ngbModal: NgbModal,
    private insertLogService: InsertLogService,
    private excluiCaboService: ExcluiCaboService,
    private divideCaboService: DivideCaboService,
    private excluiCaixaService: ExcluiCaixaService,
    private excluiDioService: ExcluiDioService,
    private excluiEstacaoService: ExcluiEstacaoService,
    private excluiCondominioService: ExcluiCondominioService,
    private excluiPoligonoService: ExcluiPoligonoService,
    private excluiClienteService: ExcluiClienteService,
    private buscaObjetoConexPontaService: BuscaObjetoConexPontaService,
    private popInfoUpdateService: PopInfoUpdateService,
    private popInfoEstacaoUpdateService: PopInfoEstacaoUpdateService,
    private popInfoService: PopInfoService,
    private updateClienteService: UpdateClienteService,
    private segmentoService: SegmentoService,
    private postesConcessionariaService: PostesConcessionariaService,
    private insertPosteAprovadoService: InsertPosteAprovadoService,
    private excluiPosteAprovadoService: ExcluiPosteAprovadoService,
  ) {}

  // ============================================================================
  // 🎯 SEÇÃO: CONTEXT MENU
  // ============================================================================

  /**
   * 🎯 Configura o listener do context menu no mapa
   */
  private setupContextMenuListener(): void {
    // Verificar se já foi adicionado
    if (this.contextMenuListenerAdded) {
      console.log('🗺️ [CONTEXT-MENU] Listener já foi adicionado, retornando...');
      return;
    }
    
    if (this.map) {
      console.log('🗺️ [CONTEXT-MENU] Adicionando listener de rightclick no mapa...');
      // Listener para clique com botão direito no mapa (não nos elementos)
      this.listenerMapaRightClick = this.map.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
        console.log('🗺️ [CONTEXT-MENU] ⚡ Right-click detectado no mapa!', event);
        
        // Verificar se o clique foi no mapa mesmo (não em elementos)
        if (event.domEvent && event.domEvent.target) {
          const target = event.domEvent.target as HTMLElement;
          console.log('🗺️ [CONTEXT-MENU] Target:', {
            tagName: target.tagName,
            className: target.className,
            id: target.id
          });
          
          // Verificar se o clique foi no mapa (mais amplo)
          const isMapClick = target.tagName === 'CANVAS' || 
                           target.classList.contains('gm-style') ||
                           target.closest('.gm-style') !== null ||
                           target.closest('google-map') !== null;
          
          console.log('🗺️ [CONTEXT-MENU] isMapClick:', isMapClick);
          
          // 🚫 Bloquear context menu no GoJS-demo
          const isInGoJSModal = target.closest('.gojs-container') !== null ||
                               target.closest('.diagram-container') !== null ||
                               target.closest('.diagram-div') !== null ||
                               target.closest('#gojsDiagram') !== null;
          
          console.log('🗺️ [CONTEXT-MENU] isInGoJSModal:', isInGoJSModal);
          
          if (isMapClick && !isInGoJSModal) {
            console.log('🗺️ [CONTEXT-MENU] ✅ Condições atendidas, mostrando menu...');
            // 🛡️ Verificar se há edição em andamento e cancelar
            if (this.isEditingCabo || this.isIniciandoEdicao) {
              console.log('⚠️ [EDITAR-CABO] Context menu do mapa detectado durante edição. Cancelando edição...');
              this.cancelarEdicaoCabo();
              return; // Não mostrar menu do mapa após cancelar
            }
            
            const mouseEvent = event.domEvent as MouseEvent;
            // Prevenir menu padrão do navegador
            mouseEvent.preventDefault();
            mouseEvent.stopPropagation();
            
            // 🆕 Armazenar coordenada do clique para usar no modal de criar caixa
            if (event.latLng) {
              this.ultimaCoordenadaContextMenu = event.latLng;
              console.log('🗺️ [CONTEXT-MENU] Coordenada armazenada:', event.latLng.lat(), event.latLng.lng());
            }
            
            // 🔧 CORREÇÃO: Garantir que o tipo seja 'map'
            this.contextMenuType = 'map';
            console.log('🗺️ [CONTEXT-MENU] Chamando showContextMenu com tipo "map"');
            this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
          } else {
            console.log('🗺️ [CONTEXT-MENU] ❌ Condições não atendidas - isMapClick:', isMapClick, 'isInGoJSModal:', isInGoJSModal);
          }
        } else {
          console.log('🗺️ [CONTEXT-MENU] ⚠️ Evento sem domEvent ou target');
        }
      });
      
      // 🔧 NOVO: Adicionar touch events para mobile (long press = right-click) no mapa
      this.map.addListener('touchstart', (event: google.maps.MapMouseEvent) => {
        if (event.domEvent) {
          const touchEvent = event.domEvent as TouchEvent;
          if (touchEvent.touches && touchEvent.touches.length > 0) {
            const touch = touchEvent.touches[0];
            this.touchStartTime = Date.now();
            this.touchStartPosition = { x: touch.clientX, y: touch.clientY };

            this.longPressTimer = setTimeout(() => {
              console.log('📱 [MOBILE] Long press no mapa detectado - context menu desabilitado no mobile');
              
              // Verificar se o toque foi no mapa mesmo
              if (event.domEvent && event.domEvent.target) {
                const target = event.domEvent.target as HTMLElement;
                const isMapClick = target.tagName === 'CANVAS' || 
                                 target.classList.contains('gm-style') ||
                                 target.closest('.gm-style') !== null ||
                                 target.closest('google-map') !== null;
                const isInGoJSModal = target.closest('.gojs-container') !== null ||
                                   target.closest('.diagram-container') !== null ||
                                   target.closest('.diagram-div') !== null ||
                                   target.closest('#gojsDiagram') !== null;

                if (isMapClick && !isInGoJSModal) {
                  // 🛡️ Verificar se há edição em andamento e cancelar
                  if (this.isEditingCabo || this.isIniciandoEdicao) {
                    console.log('⚠️ [EDITAR-CABO] Long press no mapa durante edição. Cancelando edição...');
                    this.cancelarEdicaoCabo();
                    return;
                  }
                  
                  // 🔧 Context menu do mapa desabilitado no mobile - não abrir
                  // this.contextMenuType = 'map';
                  // this.showContextMenu(touch.clientX, touch.clientY);
                }
              }
            }, this.LONG_PRESS_DURATION);
          }
        }
      });

      this.map.addListener('touchend', () => {
        if (this.longPressTimer) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
        }
        this.touchStartTime = 0;
        this.touchStartPosition = null;
      });

      this.map.addListener('touchmove', () => {
        if (this.longPressTimer) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
        }
      });
      
      console.log('🗺️ [CONTEXT-MENU] Listener adicionado com sucesso!');
    } else {
      console.log('🗺️ [CONTEXT-MENU] ⚠️ Map não está disponível ainda');
    }

    // Marcar como adicionado
    this.contextMenuListenerAdded = true;
    console.log('🗺️ [CONTEXT-MENU] Flag contextMenuListenerAdded definida como true');
  }


  /**
   * 🎯 Mostra o context menu na posição especificada
   */
  private showContextMenu(x: number, y: number): void {
    console.log('🎯 showContextMenu chamado:', { x, y, contextType: this.contextMenuType });
    this.contextMenuPosition = { x, y };
    this.contextMenuVisible = true;
    
    console.log('🎯 Context menu definido como visível:', this.contextMenuVisible);
    
    // 🎯 Forçar detecção de mudanças
    this.cdr.detectChanges();
  }

  /**
   * 🎯 Esconde o context menu
   */
  public hideContextMenu(): void {
    this.contextMenuVisible = false;
    if (this.contextMenuType === 'vertice') {
      this.clickedVertexIndex = null;
    }
    this.contextMenuType = 'map'; // 🔄 Reseta para tipo 'map'
    
    // 🆕 Não limpar se estiver em modo de edição ou iniciando edição (deixar editar)
    if (!this.isEditingCabo && !this.isIniciandoEdicao) {
      this.clickedCaboData = null;
      this.clickedPolyline = null; // 🔄 Reseta a polyline clicada
      this.clickedCaixaData = null;
      this.clickedCTOData = null; // 🔧 NOVO: Limpar dados de CTO
      this.clickedCTOSPData = null; // 🔧 NOVO: Limpar dados de CTO_SP
      this.clickedDioData = null; // 🔧 NOVO: Limpar dados de DIO
      this.clickedCliData = null; // 🆕 Limpar dados de cliente
      this.clickedCliAtData = null; // 🆕 Limpar dados de cliente ativado
      this.clickedCliDesData = null; // 🆕 Limpar dados de cliente desativado
      this.clickedClienteMarker = null; // marcador cliente: só válido enquanto o menu está ativo
      this.clickedDioData = null; // 🆕 Limpar dados do DIO
      this.clickedEstacaoData = null; // 🆕 Limpar dados da estação
      this.clickedCondominioData = null; // 🆕 Limpar dados do condomínio
      this.clickedCondominioMarker = null;
      this.clickedPoligono = null;
      this.clickedSobraData = null;
      this.clickedPosteAprovadoData = null;
      // 🆕 NOVO: Limpar coordenada do context menu quando não estiver em edição
      // Isso garante que a próxima vez que o usuário clicar com botão direito,
      // a coordenada será atualizada corretamente
      if (this.ultimaCoordenadaContextMenu) {
        console.log('🗺️ [CONTEXT-MENU] Limpando coordenada antiga do context menu');
        this.ultimaCoordenadaContextMenu = null;
      }
    }
    
    this.isCaboClicked = false; // 🔄 Reseta flag

    
    
    // 🎯 Forçar detecção de mudanças
    this.cdr.detectChanges();
  }

  /**
   * 🎯 Executa uma ação do context menu
   */
  onContextMenuAction(action: string): void {
    console.log('🗺️ [CONTEXT-MENU] Ação executada:', action);
    
    switch (action) {
      case 'cria-caixa':
        this.criarCaixa();
        break;
      case 'cria-cliente':
        this.criarCliente();
        break;
      case 'cria-estacao':
        this.criarEstacao();
        break;
      case 'cadastra-cliente':
        this.abrirCadastroCliente();
        break;
      case 'cria-condominio':
        this.criarCondominio();
        break;
      case 'cria-anotacao':
        this.criarAnotacao();
        break;
      case 'cria-sobra':
        this.criarSobra();
        break;
      case 'aprovar-postes':
        this.iniciarModoAprovarPostes();
        break;
      // 🆕 Ações para CABOS
      case 'visualizar-cabo':
        this.visualizarCabo();
        break;
      case 'label-cabo':
        this.abrirLabelCaboDialog();
        break;
      case 'liberar-cabo':
        this.liberarCabo();
        break;
      case 'excluir-cabo':
        this.excluirCabo();
        break;

      // 🆕 Ações para VÉRTICE (durante edição de cabo)
      case 'remover-vertice':
        this.removerVertice();
        break;
      case 'dividir-cabo':
        this.dividirCaboNoVertice();
        break;
        case 'visualizar-caixa':
          // 🔧 NOVO: Abrir gojs-demo quando selecionar "Visualizar Conectividade"
          // Pode ser caixa, CTO ou CTO_SP
          let idMeta: number | undefined;
          let tipoObjeto: string = '';
          
          if (this.clickedCaixaData && this.clickedCaixaData.id_meta) {
            idMeta = this.clickedCaixaData.id_meta;
            tipoObjeto = 'caixa';
          } else if (this.clickedCTOData && this.clickedCTOData.id_meta) {
            idMeta = this.clickedCTOData.id_meta;
            tipoObjeto = 'CTO';
          } else if (this.clickedCTOSPData && this.clickedCTOSPData.id_meta) {
            idMeta = this.clickedCTOSPData.id_meta;
            tipoObjeto = 'CTO_SP';
          }
          
          if (idMeta) {
            console.log(`🔴 [CONTEXT-MENU] Abrindo gojs-demo para ${tipoObjeto} com id_meta:`, idMeta);
            this.authService.setIDmetaCaixa(idMeta);
            this.openGoJSModal();
          } else {
            console.error('❌ [CONTEXT-MENU] Dados não disponíveis');
            alert('Erro: Dados não disponíveis');
          }
        break;
        case 'detalhes-caixa':
          this.abrirDetalhesCaixa();
          break;
        case 'excluir-caixa':
          this.excluirCaixa();
          break;

      // 🆕 Ações para DIO
      case 'visualizar-dio':
        this.visualizarDio();
        break;
      case 'excluir-dio':
        this.excluirDio();
        break;

      case 'libera-sobra':
        this.liberaSobra();
        break;
      case 'exclui-sobra':
        this.excluirSobra();
        break;

      // 🆕 Ações para Clientes
      case 'visualizar-cliente':
        this.visualizarCliente();
        break;
      case 'ativacao-cliente':
        this.abrirAtivacaoClienteModal();
        break;
      case 'excluir-cliente':
        this.excluirCliente();
        break;

      // 🆕 Ações para Estação
      case 'visualizar-estacao':
        this.visualizarEstacao();
        break;
      case 'incluir-dio-estacao':
        this.criarDIO();
        break;
      case 'excluir-estacao':
        this.excluirEstacao();
        break;

      // 🆕 Ações para Condomínio
      case 'visualizacao-interna-condominio':
        this.visualizarCondominioInterno();
        break;
      case 'excluir-condominio':
        this.excluirCondominio();
        break;

      // 🔷 Ações para POLÍGONO (modo edição armado)
      case 'editar-label-poligono':
        this.abrirLabelPoligonoDialog();
        break;
      case 'relatorio-poligono':
        this.abrirDashboardPoligono();
        break;
      case 'exportar-kml-poligono':
        this.exportarKmlPoligonoContextMenu();
        break;
      case 'excluir-poligono':
        this.excluirPoligonoContextMenu();
        break;

      case 'excluir-poste-aprovado':
        this.excluirPosteAprovado();
        break;

      default:
        console.warn('🗺️ [CONTEXT-MENU] Ação não reconhecida:', action);
    }
  }

  // Métodos placeholder para as ações do context menu
  private criarCaixa(): void {
    console.log('🗺️ [CONTEXT-MENU] Criando caixa...');
    
    // Verificar se há coordenada do context menu
    if (!this.ultimaCoordenadaContextMenu) {
      alert('Erro: Coordenada do mapa não encontrada. Clique novamente no mapa.');
      this.hideContextMenu();
      return;
    }

    // 🆕 Capturar coordenadas e limpar imediatamente para evitar reutilização
    const lat = this.ultimaCoordenadaContextMenu.lat();
    const lng = this.ultimaCoordenadaContextMenu.lng();
    this.ultimaCoordenadaContextMenu = null; // Limpar coordenada após capturar valores
    console.log('🗺️ [CONTEXT-MENU] Coordenada capturada e limpa:', { lat, lng });

    // Preparar dados para o modal
    const data: PlotaCaixaData = {
      tipagem: 'INDEFINIDO',
      lat: lat,
      lng: lng,
      labelCaixa: '', // Sempre vazio
      endereco: '',
      obs: ''
    };

    // Abrir modal com ng-bootstrap
    const modalRef = this.ngbModal.open(PlotaCaixaComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
    
    // Passar dados para o modal
    modalRef.componentInstance.data = data;

    // Fechar context menu
    this.hideContextMenu();

    // Processar resultado do modal
    modalRef.result.then(
      (result) => {
        if (result) {
          console.log('📦 [PLOTA-CAIXA] Resultado do modal:', result);
          // Adicionar marcador da caixa criada ao mapa
          // O método adicionarMarcadorCaixa já adiciona ao array correto (destino, destinoCTO ou destinoCTOSP)
          // baseado no ID_TIPO
          this.adicionarMarcadorCaixa({
            id_meta: result.id_meta,
            numero: result.labelCaixa,
            LAT: result.lat,
            LONGI: result.lng,
            ID_TIPO: result.ID_TIPO || '1' // Usar ID_TIPO do resultado ou padrão
          });
          
          console.log('✅ [PLOTA-CAIXA] Caixa adicionada ao mapa');

          // 🆕 NOVO: Inserir log de plotagem de caixa com id_evento 4
          const idUsuario = this.authService.getIdUser();
          const idCity = this.authService.getIdCity();
          if (idUsuario && idCity) {
            console.log('🔄 Inserindo log de plotagem de caixa...');
            
            // Determinar tipo de caixa para a descrição
            let tipoCaixa = 'Caixa';
            if (result.tipagem) {
              // Verificar se é CTO ou CTO_SP baseado na tipagem
              const tipagemUpper = result.tipagem.toUpperCase();
              if (tipagemUpper.includes('CTO') && tipagemUpper.includes('SP')) {
                tipoCaixa = 'CTO_SP';
              } else if (tipagemUpper.includes('CTO')) {
                tipoCaixa = 'CTO';
              } else {
                tipoCaixa = 'Caixa';
              }
            }
            
            this.insertLogService.inserirLog({
              id_usuario: idUsuario,
              id_evento: 4, // ID do evento para plotagem de caixa
              id_city: idCity,
              id_meta_objeto: result.id_meta,
              descricao: `Plota ${tipoCaixa}: ${result.labelCaixa || result.id_meta}, Tipagem: ${result.tipagem || 'N/A'}, ID_META: ${result.id_meta}`,
              VERSION: 'Fiberworks WEB 1.0.0'
            }).subscribe({
              next: (logResponse) => {
                console.log('✅ Log de plotagem de caixa inserido com sucesso:', logResponse);
              },
              error: (error) => {
                console.error('❌ Erro ao inserir log de plotagem de caixa:', error);
              }
            });
          }
        }
      },
      (dismissReason) => {
        // Modal foi fechado sem resultado (cancelado)
        console.log('📦 [PLOTA-CAIXA] Modal fechado:', dismissReason);
      }
    );
  }

  private criarCliente(): void {
    console.log('🗺️ [CONTEXT-MENU] Plotando cliente...');

    if (!this.ultimaCoordenadaContextMenu) {
      alert('Erro: Coordenada do mapa não encontrada. Clique novamente no mapa.');
      this.hideContextMenu();
      return;
    }

    const lat = this.ultimaCoordenadaContextMenu.lat();
    const lng = this.ultimaCoordenadaContextMenu.lng();
    this.ultimaCoordenadaContextMenu = null;
    console.log('🗺️ [CONTEXT-MENU] Coordenada capturada para cliente:', { lat, lng });

    const data: PlotaClienteData = { lat, lng };

    try {
      const modalRef = this.ngbModal.open(PlotaClienteComponent, {
        size: 'lg',
        backdrop: 'static',
        keyboard: false
      });

      modalRef.componentInstance.data = data;
      this.hideContextMenu();

      modalRef.result.then(
        (result: { id_meta?: number; id_estacao?: number; sigla: string; lat: number; lng: number }) => {
          if (result && result.id_meta) {
            console.log('📡 [PLOTA-CLIENTE] Cliente plotado:', result);

            this.destinoPopsCli.push({
              id_meta: result.id_meta,
              sigla: result.sigla || 'S/N',
              LAT: result.lat as any,
              LNG: result.lng as any
            } as any);
            this.updateMarkersPopsCli();

            console.log('✅ [PLOTA-CLIENTE] Cliente adicionado ao mapa');

            const idUsuario = this.authService.getIdUser();
            const idCity = this.authService.getIdCity();
            if (idUsuario && idCity) {
              this.insertLogService.inserirLog({
                id_usuario: idUsuario,
                id_evento: 6,
                id_city: idCity,
                id_meta_objeto: result.id_meta,
                descricao: `Plota Cliente: ${result.sigla || result.id_meta}, ID_META: ${result.id_meta}`,
                VERSION: 'Fiberworks WEB 1.0.0'
              }).subscribe({
                next: (logResponse) => {
                  console.log('✅ Log de plotagem de cliente inserido com sucesso:', logResponse);
                },
                error: (error) => {
                  console.error('❌ Erro ao inserir log de plotagem de cliente:', error);
                }
              });
            }
          }
        },
        (dismissReason) => {
          console.log('📡 [PLOTA-CLIENTE] Modal fechado:', dismissReason);
        }
      );
    } catch (err) {
      console.error('❌ [PLOTA-CLIENTE] Erro ao abrir modal:', err);
      alert('Erro ao abrir modal de plotar cliente. Verifique o console.');
    }
  }

  private criarEstacao(): void {
    console.log('🗺️ [CONTEXT-MENU] Criando estação...');

    if (!this.ultimaCoordenadaContextMenu) {
      alert('Erro: Coordenada do mapa não encontrada. Clique novamente no mapa.');
      this.hideContextMenu();
      return;
    }

    const lat = this.ultimaCoordenadaContextMenu.lat();
    const lng = this.ultimaCoordenadaContextMenu.lng();
    this.ultimaCoordenadaContextMenu = null;
    console.log('🗺️ [CONTEXT-MENU] Coordenada capturada para estação:', { lat, lng });

    const data: PlotaEstacaoData = {
      lat,
      lng,
      nome: '',
      logradouro: '',
      complemento: '',
      numero: '',
      bairro: '',
      cidade: '',
      telefone: '',
      observacoes: ''
    };

    try {
      const modalRef = this.ngbModal.open(PlotaEstacaoComponent, {
        size: 'lg',
        backdrop: 'static',
        keyboard: false
      });

      modalRef.componentInstance.data = data;
      this.hideContextMenu();

      modalRef.result.then(
        (result: PlotaEstacaoData) => {
          if (result && result.id_meta) {
            console.log('📡 [PLOTA-ESTAÇÃO] Estação criada:', result);

            this.destinoPopsEst.push({
              id_meta: result.id_meta,
              sigla: result.nome || 'S/N',
              LAT: result.lat as any,
              LNG: result.lng as any
            } as any);
            this.updateMarkersPopsEst();

            console.log('✅ [PLOTA-ESTAÇÃO] Estação adicionada ao mapa');

            const idUsuario = this.authService.getIdUser();
            const idCity = this.authService.getIdCity();
            if (idUsuario && idCity) {
              this.insertLogService.inserirLog({
                id_usuario: idUsuario,
                id_evento: 6,
                id_city: idCity,
                id_meta_objeto: result.id_meta,
                descricao: `Plota Estação: ${result.nome || result.id_meta}, ID_META: ${result.id_meta}`,
                VERSION: 'Fiberworks WEB 1.0.0'
              }).subscribe({
                next: (logResponse) => {
                  console.log('✅ Log de plotagem de estação inserido com sucesso:', logResponse);
                },
                error: (error) => {
                  console.error('❌ Erro ao inserir log de plotagem de estação:', error);
                }
              });
            }
          }
        },
        (dismissReason) => {
          console.log('📡 [PLOTA-ESTAÇÃO] Modal fechado:', dismissReason);
        }
      );
    } catch (err) {
      console.error('❌ [PLOTA-ESTAÇÃO] Erro ao abrir modal:', err);
      alert('Erro ao abrir modal de plotar estação. Verifique o console.');
    }
  }

  private criarCondominio(): void {
    console.log('🗺️ [CONTEXT-MENU] Criando condomínio...');
    alert('Funcionalidade de criar condomínio será implementada em breve!');
  }

  private visualizarCondominioInterno(): void {
    console.log('🔍 [CONTEXT-MENU] Visualização interna do condomínio...', this.clickedCondominioData);

    if (!this.clickedCondominioData) {
      alert('❌ Erro: Dados do condomínio não encontrados.');
      this.hideContextMenu();
      return;
    }

    let idMeta: number | undefined = this.clickedCondominioData.id_meta;
    if (!idMeta && this.clickedCondominioMarker) {
      const idMetaDoMarcador = this.clickedCondominioMarker.get('id_meta');
      if (idMetaDoMarcador) {
        idMeta = Number(idMetaDoMarcador);
      }
    }

    if (!idMeta || isNaN(idMeta) || idMeta <= 0) {
      alert('❌ Erro: Não foi possível identificar o ID do condomínio.');
      this.hideContextMenu();
      return;
    }

    const latRaw = this.clickedCondominioData.LAT;
    const lngRaw = this.clickedCondominioData.LNG;
    const lat = latRaw != null ? Number(latRaw) : undefined;
    const lng = lngRaw != null ? Number(lngRaw) : undefined;

    const numPavim = this.resolverNumPavimCondominio(this.clickedCondominioData);

    const dialogData: CondominioInternoModalData = {
      id_meta: idMeta,
      sigla: this.clickedCondominioData.sigla,
      lat: Number.isFinite(lat) ? lat : undefined,
      lng: Number.isFinite(lng) ? lng : undefined,
      qtdAndares: numPavim,
    };

    this.hideContextMenu();

    import('../condominio-interno-modal/condominio-interno-modal.component').then(
      ({ CondominioInternoModalComponent }) => {
        this.dialog.open(CondominioInternoModalComponent, {
          width: '95vw',
          height: '90vh',
          maxWidth: 'none',
          maxHeight: 'none',
          hasBackdrop: true,
          disableClose: false,
          panelClass: 'condominio-interno-modal-container',
          data: dialogData,
        });
      },
    );
  }

  private excluirCondominio(): void {
    console.log('🗑️ [CONTEXT-MENU] Excluindo condomínio...', this.clickedCondominioData);

    if (!this.clickedCondominioData) {
      alert('❌ Erro: Dados do condomínio não encontrados.');
      return;
    }

    let idMeta: number | undefined = this.clickedCondominioData.id_meta;
    if (!idMeta && this.clickedCondominioMarker) {
      const idMetaDoMarcador = this.clickedCondominioMarker.get('id_meta');
      if (idMetaDoMarcador) {
        idMeta = Number(idMetaDoMarcador);
      }
    }

    if (!idMeta || isNaN(idMeta) || idMeta <= 0) {
      alert('❌ Erro: Não foi possível identificar o ID do condomínio.');
      return;
    }

    const idCity = this.authService.getIdCity();
    if (!idCity) {
      alert('❌ Erro: ID da cidade não encontrado. Selecione uma cidade no workspace.');
      return;
    }

    const sigla = this.clickedCondominioData.sigla || 'N/A';
    const confirmacao = confirm(`Tem certeza que deseja excluir este condomínio?\n\n📋 Sigla: ${sigla}`);

    if (!confirmacao) {
      return;
    }

    const request: ExcluiCondominioRequest = {
      id_meta: idMeta,
      id_city: idCity
    };

    this.excluiCondominioService.excluirCondominio(request).subscribe({
      next: (response: ExcluiCondominioResponse) => {
        console.log('✅ [EXCLUI-CONDOMINIO] Resposta da API:', response);

        if (response.success) {
          const index = this.destinoCondominios.findIndex(c => c.id_meta === idMeta);
          if (index !== -1) {
            const markerParaRemover = this.markerCondominios[index];
            if (markerParaRemover) {
              markerParaRemover.setMap(null);
              this.markerCondominios.splice(index, 1);
            }
            this.destinoCondominios.splice(index, 1);
            console.log('🗑️ [EXCLUI-CONDOMINIO] Condomínio removido do mapa');
          }

          this.clickedCondominioData = null;
          this.hideContextMenu();
        }
      },
      error: (error: any) => {
        const msg = typeof error === 'string' ? error : error?.message || 'Erro ao excluir condomínio';
        console.error('❌ [EXCLUI-CONDOMINIO] Erro na requisição:', error);
        alert(`❌ Operação não realizada: ${msg}`);
      }
    });
  }

  private abrirCadastroCliente(): void {
    console.log('🗺️ [CONTEXT-MENU] Abrindo cadastro de cliente...');
    this.hideContextMenu();

    try {
      const modalRef = this.ngbModal.open(CadastroClienteComponent, {
        size: 'lg',
        backdrop: false,
        centered: true,
        keyboard: false,
        windowClass: 'cadastro-cliente-modal-window'
      });

      modalRef.result.then(
        (result) => {
          if (result?.success) {
            console.log('✅ [CADASTRO-CLIENTE] Cliente cadastrado com sucesso:', result);
            alert('Cliente cadastrado com sucesso!');
          }
        },
        (dismissReason) => {
          console.log('📡 [CADASTRO-CLIENTE] Modal fechado:', dismissReason);
        }
      );
    } catch (err) {
      console.error('❌ [CADASTRO-CLIENTE] Erro ao abrir modal:', err);
      alert('Erro ao abrir modal de cadastro de cliente. Verifique o console.');
    }
  }

  private criarAnotacao(): void {
    console.log('🗺️ [CONTEXT-MENU] Criando anotação...');
    alert('Funcionalidade de criar anotação será implementada em breve!');
  }

  private criarSobra(): void {
    console.log('🗺️ [CONTEXT-MENU] Criando sobra...');
    alert('Funcionalidade de criar sobra será implementada em breve!');
  }

  private visualizarCaixa(): void {
    if (!this.clickedCaixaData) {
      console.warn('🗺️ [CONTEXT-MENU] Nenhuma caixa selecionada');
      return;
    }
    console.log('🗺️ [CONTEXT-MENU] Visualizando caixa:', this.clickedCaixaData);
    // Implementar lógica de visualização
  }
  
  private abrirDetalhesCaixa(): void {
    const caixa = this.clickedCTOSPData || this.clickedCTOData || this.clickedCaixaData;//caixa recebe qual nao for false
    if (!caixa || !caixa.id_meta) {
      console.warn('🗺️ [CONTEXT-MENU] Nenhuma caixa selecionada');
      alert('Erro: Dados da caixa não encontrados.');
      return;
    }

    // Capturar tipo ANTES de hideContextMenu (que limpa clickedCTOSPData/clickedCTOData/clickedCaixaData)
    const tipoCaixa: 'ceo' | 'cto' | 'ctosp' = this.clickedCTOSPData ? 'ctosp' : this.clickedCTOData ? 'cto' : 'ceo';

    const idCity = this.authService.getIdCity();
    if (!idCity) {
      alert('Cidade não encontrada. Selecione uma cidade no workspace.');
      return;
    }

    const lat = caixa.LAT != null ? Number(caixa.LAT) : undefined;
    const lng = caixa.LONGI != null ? Number(caixa.LONGI) : undefined;

    const data: DetalhesCaixaData = {
      id_meta: caixa.id_meta,
      tipagem: caixa.tipagem || 'INDEFINIDO',
      ID_TIPO: caixa.ID_TIPO || undefined,
      lat,
      lng,
      labelCaixa: caixa.numero || caixa.labelCaixa || '',
      endereco: caixa.endereco || caixa.LOCALIZACAO || '',
      obs: caixa.obs || caixa.OBSERVACAO || '',
      INSTALADA: (caixa as Caixa).INSTALADA,
    };

    const modalRef = this.ngbModal.open(DetalhesCaixaComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.data = data;
    modalRef.componentInstance.onInstaladaChanged = (idMeta: number, instalada: 0 | 1) => {
      this.aplicarInstaladaCaixaNoMapa(idMeta, instalada);
    };
    this.hideContextMenu();

    modalRef.result.then(
      (result: DetalhesCaixaData & { tipagem?: string; labelCaixa?: string; endereco?: string; obs?: string; ID_TIPO?: string; INSTALADA?: number | string }) => {
        if (result && result.id_meta) {
          const idMeta = result.id_meta;
          const updateItem = (item: any) => {
            if (item.id_meta === idMeta) {
              item.numero = result.labelCaixa ?? item.numero;
              item.tipagem = result.tipagem ?? item.tipagem;
              item.ID_TIPO = result.ID_TIPO ?? item.ID_TIPO;
              item.endereco = result.endereco ?? item.endereco;
              item.obs = result.obs ?? item.obs;
              if (result.INSTALADA !== undefined) {
                item.INSTALADA = result.INSTALADA;
              }
            }
          };

          const idTipoNovo = parseInt(result.ID_TIPO || '1', 10);
          const getArray = (t: 'ceo' | 'cto' | 'ctosp') =>
            t === 'ctosp' ? this.destinoCTOSP : t === 'cto' ? this.destinoCTO : this.destino;
          const itemAtual = getArray(tipoCaixa).find((c: any) => c.id_meta === idMeta);
          const contaSplitter = Number(
            (result as any).conta_splitter ?? itemAtual?.conta_splitter ?? 0,
          );
          const tipoNovo = this.classificarTipoCaixa(idTipoNovo, contaSplitter);
          
          
          if (tipoCaixa === 'ctosp') {
            this.destinoCTOSP.forEach(updateItem);
          } else if (tipoCaixa === 'cto') {
            this.destinoCTO.forEach(updateItem);
          } else {
            this.destino.forEach(updateItem);
          }

          if (tipoNovo !== tipoCaixa) {
            const idx = getArray(tipoCaixa).findIndex((c: any) => c.id_meta === idMeta);
            if (idx !== -1) {
              const [item] = getArray(tipoCaixa).splice(idx, 1);
              getArray(tipoNovo).push(item);
            }
          }

          // redesenha todos os marcadores de caixa e ctos
          this.updateMarkers();
          this.updateMarkersCTO();
          this.updateMarkersCTOSP();

          this.cdr.detectChanges();

          this.clickedCaixaData = null;
          this.clickedCTOData = null;
          this.clickedCTOSPData = null;
        }
      },
      () => {}
    );
  }

  private excluirCaixa(): void {
    console.log('🔴 [CONTEXT-MENU] Excluindo caixa...', this.clickedCaixaData);
    
    // 🆕 Verificar se é CTO primeiro (CTOs usam o mesmo menu de caixa)
    if (this.clickedCTOData) {
      console.log('🔴 [CONTEXT-MENU] É uma CTO, redirecionando para excluirCTO()');
      this.excluirCTO();
      return;
    }
    
    // 🆕 Verificar se é CTO_SP
    if (this.clickedCTOSPData) {
      console.log('🔴 [CONTEXT-MENU] É uma CTO_SP, redirecionando para excluirCTOSP()');
      this.excluirCTOSP();
      return;
    }
    
    if (!this.clickedCaixaData) {
      console.warn('⚠️ [EXCLUI-CAIXA] Nenhuma caixa selecionada');
      return;
    }

    // Obter dados da caixa
    const idMeta = this.clickedCaixaData.id_meta;
    const idCity = this.authService.getIdCity();
    
    if (!idMeta) {
      alert('Erro: ID da caixa não encontrado');
      return;
    }

    if (!idCity) {
      alert('Erro: ID da cidade não encontrado');
      return;
    }

    // id_condominio padrão é 0 (fora de condomínio)
    const idCondominio = this.clickedCaixaData.id_condominio || 0;

    // Confirmação antes de excluir
    const confirmacao = confirm(`Tem certeza que deseja excluir esta caixa?\n\n🆔 ID: ${idMeta}`);
    
    if (!confirmacao) {
      return;
    }

    // Preparar requisição
    const request: ExcluiCaixaRequest = {
      id_meta: idMeta,
      id_city: idCity,
      id_condominio: idCondominio
    };

    // Fazer a requisição usando o serviço
    this.excluiCaixaService.excluirCaixa(request).subscribe({
      next: (response: ExcluiCaixaResponse) => {
        console.log('✅ [EXCLUI-CAIXA] Resposta da API:', response);
        
        if (response.success) {
          console.log('🗑️ [EXCLUI-CAIXA] Iniciando remoção do marcador do mapa...');
          console.log('🗑️ [EXCLUI-CAIXA] id_meta:', idMeta);
          
          // Buscar marcador pelo id_meta
          const markerParaRemover = this.buscarMarcadorCaixaPorIdMeta(idMeta);
          
          // Remover o marcador do mapa
          if (markerParaRemover) {
            console.log('🗑️ [EXCLUI-CAIXA] Chamando setMap(null)...');
            markerParaRemover.setMap(null);
            console.log('🗑️ [EXCLUI-CAIXA] setMap(null) executado');
            
            // Remover também do array markerCaixas
            const index = this.markerCaixas.indexOf(markerParaRemover);
            if (index !== -1) {
              this.markerCaixas.splice(index, 1);
              console.log('🗑️ [EXCLUI-CAIXA] Marcador removido do array');
            }
            
            // Remover também do array destino
            const indexDestino = this.destino.findIndex(caixa => caixa.id_meta === idMeta);
            if (indexDestino !== -1) {
              this.destino.splice(indexDestino, 1);
              console.log('🗑️ [EXCLUI-CAIXA] Item removido do array destino');
            }
          } else {
            console.warn('⚠️ [EXCLUI-CAIXA] Não foi possível encontrar o marcador para remover!');
          }

          // Limpar dados da caixa
          this.clickedCaixaData = null;
          
          // Fechar context menu
          this.hideContextMenu();

          // Inserir log de exclusão de caixa
          const idUsuario = this.authService.getIdUser();
          if (idUsuario && idCity) {
            console.log('🔄 Inserindo log de exclusão de caixa...');
            this.insertLogService.inserirLog({
              id_usuario: idUsuario,
              id_evento: 19, // Usando o mesmo id_evento de exclusão de cabo (verificar se precisa ser diferente)
              id_city: idCity,
              id_meta_objeto: request.id_meta,
              descricao: `Exclusão de Caixa: ${request.id_meta}`,
              VERSION: 'Fiberworks WEB 1.0.0'
            }).subscribe({
              next: (logResponse) => {
                console.log('✅ Log de exclusão de caixa:', logResponse);
              },
              error: (error) => {
                console.error('❌ Erro ao inserir log de exclusão de caixa:', error);
              }
            });
          }
        } else {
          // Tratar erros específicos baseados no motivo
          let mensagemErro = response.error || response.message || 'Erro desconhecido';
          
          if (response.motivo) {
            switch (response.motivo) {
              case 'cabos_conectados':
                mensagemErro = `⚠️ Caixa possui cabos conectados!\n\nDesconecte todos os cabos antes de excluir.`;
                break;
              case 'splitters':
                mensagemErro = `⚠️ Caixa possui ${response.totalSplitters || 0} splitter(s)!\n\nRemova todos os splitters antes de excluir.`;
                break;
              case 'cabos_conectados_e_splitters':
                mensagemErro = `⚠️ Caixa possui cabos conectados e ${response.totalSplitters || 0} splitter(s)!\n\nDesconecte os cabos e remova os splitters antes de excluir.`;
                break;
            }
          }
          
          alert(mensagemErro);
        }
      },
      error: (error: string) => {
        console.error('❌ [EXCLUI-CAIXA] Erro na requisição:', error);
        alert(`❌ Operação não realizada: ${error}`);
      }
    });
  }

  /************************************
   * 🔍 Busca um marcador de caixa pelo id_meta
   */
  private buscarMarcadorCaixaPorIdMeta(idMeta: number): google.maps.Marker | null {
    // Buscar o índice da caixa no array destino pelo id_meta
    const index = this.destino.findIndex(caixa => caixa.id_meta === idMeta);
    
    if (index !== -1 && index < this.markerCaixas.length) {
      return this.markerCaixas[index];
    }
    
    console.warn(`⚠️ [EXCLUI-CAIXA] Marcador não encontrado para id_meta: ${idMeta}`);
    return null;
  }

  /************************************
   * 🔍 Busca um marcador de DIO pelo id_meta
   */
  private buscarMarcadorDioPorIdMeta(idMeta: number): google.maps.Marker | null {
    // Buscar o índice do DIO no array destinoDios pelo id_meta
    const index = this.destinoDios.findIndex(dio => dio.id_meta === idMeta);
    
    if (index !== -1 && index < this.markerDios.length) {
      return this.markerDios[index];
    }
    
    console.warn(`⚠️ [EXCLUI-DIO] Marcador não encontrado para id_meta: ${idMeta}`);
    return null;
  }

  private excluirCTO(): void {
    console.log('🔴 [CONTEXT-MENU] Excluindo CTO...', this.clickedCTOData);
    
    if (!this.clickedCTOData) {
      console.warn('⚠️ [EXCLUI-CTO] Nenhuma CTO selecionada');
      return;
    }

    // Obter dados da CTO
    const idMeta = this.clickedCTOData.id_meta;
    const idCity = this.authService.getIdCity();
    
    if (!idMeta) {
      alert('Erro: ID da CTO não encontrado');
      return;
    }

    if (!idCity) {
      alert('Erro: ID da cidade não encontrado');
      return;
    }

    // id_condominio padrão é 0 (fora de condomínio)
    const idCondominio = this.clickedCTOData.id_condominio || 0;

    // Confirmação antes de excluir
    const confirmacao = confirm(`Tem certeza que deseja excluir esta CTO?\n\n🆔 ID: ${idMeta}`);
    
    if (!confirmacao) {
      return;
    }

    // Preparar requisição
    const request: ExcluiCaixaRequest = {
      id_meta: idMeta,
      id_city: idCity,
      id_condominio: idCondominio
    };

    // Fazer a requisição usando o serviço (mesmo serviço usado para caixas)
    this.excluiCaixaService.excluirCaixa(request).subscribe({
      next: (response: ExcluiCaixaResponse) => {
        console.log('✅ [EXCLUI-CTO] Resposta da API:', response);
        
        if (response.success) {
          console.log('🗑️ [EXCLUI-CTO] Iniciando remoção do marcador do mapa...');
          console.log('🗑️ [EXCLUI-CTO] id_meta:', idMeta);
          
          // Buscar marcador pelo id_meta
          const markerParaRemover = this.buscarMarcadorCtoPorIdMeta(idMeta);
          
          // Remover o marcador do mapa
          if (markerParaRemover) {
            console.log('🗑️ [EXCLUI-CTO] Chamando setMap(null)...');
            markerParaRemover.setMap(null);
            console.log('🗑️ [EXCLUI-CTO] setMap(null) executado');
            
            // Remover também do array markerCtos
            const index = this.markerCtos.indexOf(markerParaRemover);
            if (index !== -1) {
              this.markerCtos.splice(index, 1);
              console.log('🗑️ [EXCLUI-CTO] Marcador removido do array');
            }
            
            // Remover também do array destinoCTO
            const indexDestino = this.destinoCTO.findIndex(cto => cto.id_meta === idMeta);
            if (indexDestino !== -1) {
              this.destinoCTO.splice(indexDestino, 1);
              console.log('🗑️ [EXCLUI-CTO] Item removido do array destinoCTO');
            }
          } else {
            console.warn('⚠️ [EXCLUI-CTO] Não foi possível encontrar o marcador para remover!');
          }

          // Limpar dados da CTO
          this.clickedCTOData = null;
          
          // Fechar context menu
          this.hideContextMenu();

          // Inserir log de exclusão de CTO
          const idUsuario = this.authService.getIdUser();
          if (idUsuario && idCity) {
            console.log('🔄 Inserindo log de exclusão de CTO...');
            this.insertLogService.inserirLog({
              id_usuario: idUsuario,
              id_evento: 19, // Usando o mesmo id_evento de exclusão de cabo/caixa
              id_city: idCity,
              id_meta_objeto: request.id_meta,
              descricao: `Exclusão de CTO: ${request.id_meta}`,
              VERSION: 'Fiberworks WEB 1.0.0'
            }).subscribe({
              next: (logResponse) => {
                console.log('✅ Log de exclusão de CTO:', logResponse);
              },
              error: (error) => {
                console.error('❌ Erro ao inserir log de exclusão de CTO:', error);
              }
            });
          }
        } else {
          // Tratar erros específicos baseados no motivo
          let mensagemErro = response.error || response.message || 'Erro desconhecido';
          
          if (response.motivo) {
            switch (response.motivo) {
              case 'cabos_conectados':
                mensagemErro = `⚠️ CTO possui cabos conectados!\n\nDesconecte todos os cabos antes de excluir.`;
                break;
              case 'splitters':
                mensagemErro = `⚠️ CTO possui ${response.totalSplitters || 0} splitter(s)!\n\nRemova todos os splitters antes de excluir.`;
                break;
              case 'cabos_conectados_e_splitters':
                mensagemErro = `⚠️ CTO possui cabos conectados e ${response.totalSplitters || 0} splitter(s)!\n\nDesconecte os cabos e remova os splitters antes de excluir.`;
                break;
            }
          }
          
          alert(mensagemErro);
        }
      },
      error: (error: string) => {
        console.error('❌ [EXCLUI-CTO] Erro na requisição:', error);
        alert(`❌ Operação não realizada: ${error}`);
      }
    });
  }

  private excluirCTOSP(): void {
    console.log('🔴 [CONTEXT-MENU] Excluindo CTO_SP...', this.clickedCTOSPData);
    
    if (!this.clickedCTOSPData) {
      console.warn('⚠️ [EXCLUI-CTOSP] Nenhuma CTO_SP selecionada');
      return;
    }

    // Obter dados da CTO_SP
    const idMeta = this.clickedCTOSPData.id_meta;
    const idCity = this.authService.getIdCity();
    
    if (!idMeta) {
      alert('Erro: ID da CTO_SP não encontrado');
      return;
    }

    if (!idCity) {
      alert('Erro: ID da cidade não encontrado');
      return;
    }

    // id_condominio padrão é 0 (fora de condomínio)
    const idCondominio = this.clickedCTOSPData.id_condominio || 0;

    // Confirmação antes de excluir
    const confirmacao = confirm(`Tem certeza que deseja excluir esta CTO_SP?\n\n🆔 ID: ${idMeta}`);
    
    if (!confirmacao) {
      return;
    }

    // Preparar requisição
    const request: ExcluiCaixaRequest = {
      id_meta: idMeta,
      id_city: idCity,
      id_condominio: idCondominio
    };

    // Fazer a requisição usando o serviço (mesmo serviço usado para caixas)
    this.excluiCaixaService.excluirCaixa(request).subscribe({
      next: (response: ExcluiCaixaResponse) => {
        console.log('✅ [EXCLUI-CTOSP] Resposta da API:', response);
        
        if (response.success) {
          console.log('🗑️ [EXCLUI-CTOSP] Iniciando remoção do marcador do mapa...');
          console.log('🗑️ [EXCLUI-CTOSP] id_meta:', idMeta);
          
          // Buscar marcador pelo id_meta
          const markerParaRemover = this.buscarMarcadorCtoSPPorIdMeta(idMeta);
          
          // Remover o marcador do mapa
          if (markerParaRemover) {
            console.log('🗑️ [EXCLUI-CTOSP] Chamando setMap(null)...');
            markerParaRemover.setMap(null);
            console.log('🗑️ [EXCLUI-CTOSP] setMap(null) executado');
            
            // Remover também do array markerCtosSP
            const index = this.markerCtosSP.indexOf(markerParaRemover);
            if (index !== -1) {
              this.markerCtosSP.splice(index, 1);
              console.log('🗑️ [EXCLUI-CTOSP] Marcador removido do array');
            }
            
            // Remover também do array destinoCTOSP
            const indexDestino = this.destinoCTOSP.findIndex(ctosp => ctosp.id_meta === idMeta);
            if (indexDestino !== -1) {
              this.destinoCTOSP.splice(indexDestino, 1);
              console.log('🗑️ [EXCLUI-CTOSP] Item removido do array destinoCTOSP');
            }
          } else {
            console.warn('⚠️ [EXCLUI-CTOSP] Não foi possível encontrar o marcador para remover!');
          }

          // Limpar dados da CTO_SP
          this.clickedCTOSPData = null;
          
          // Fechar context menu
          this.hideContextMenu();

          // Inserir log de exclusão de CTO_SP
          const idUsuario = this.authService.getIdUser();
          if (idUsuario && idCity) {
            console.log('🔄 Inserindo log de exclusão de CTO_SP...');
            this.insertLogService.inserirLog({
              id_usuario: idUsuario,
              id_evento: 19, // Usando o mesmo id_evento de exclusão de cabo/caixa
              id_city: idCity,
              id_meta_objeto: request.id_meta,
              descricao: `Exclusão de CTO_SP: ${request.id_meta}`,
              VERSION: 'Fiberworks WEB 1.0.0'
            }).subscribe({
              next: (logResponse) => {
                console.log('✅ Log de exclusão de CTO_SP:', logResponse);
              },
              error: (error) => {
                console.error('❌ Erro ao inserir log de exclusão de CTO_SP:', error);
              }
            });
          }
        } else {
          // Tratar erros específicos baseados no motivo
          let mensagemErro = response.error || response.message || 'Erro desconhecido';
          
          if (response.motivo) {
            switch (response.motivo) {
              case 'cabos_conectados':
                mensagemErro = `⚠️ CTO_SP possui cabos conectados!\n\nDesconecte todos os cabos antes de excluir.`;
                break;
              case 'splitters':
                mensagemErro = `⚠️ CTO_SP possui ${response.totalSplitters || 0} splitter(s)!\n\nRemova todos os splitters antes de excluir.`;
                break;
              case 'cabos_conectados_e_splitters':
                mensagemErro = `⚠️ CTO_SP possui cabos conectados e ${response.totalSplitters || 0} splitter(s)!\n\nDesconecte os cabos e remova os splitters antes de excluir.`;
                break;
            }
          }
          
          alert(mensagemErro);
        }
      },
      error: (error: string) => {
        console.error('❌ [EXCLUI-CTOSP] Erro na requisição:', error);
        alert(`❌ Operação não realizada: ${error}`);
      }
    });
  }

  /************************************
   * 🔍 Busca um marcador de CTO pelo id_meta
   */
  private buscarMarcadorCtoPorIdMeta(idMeta: number): google.maps.Marker | null {
    // Buscar o índice da CTO no array destinoCTO pelo id_meta
    const index = this.destinoCTO.findIndex(cto => cto.id_meta === idMeta);
    
    if (index !== -1 && index < this.markerCtos.length) {
      return this.markerCtos[index];
    }
    
    console.warn(`⚠️ [EXCLUI-CTO] Marcador não encontrado para id_meta: ${idMeta}`);
    return null;
  }

  /************************************
   * 🔍 Busca um marcador de CTO_SP pelo id_meta
   */
  private buscarMarcadorCtoSPPorIdMeta(idMeta: number): google.maps.Marker | null {
    // Buscar o índice da CTO_SP no array destinoCTOSP pelo id_meta
    const index = this.destinoCTOSP.findIndex(ctosp => ctosp.id_meta === idMeta);
    
    if (index !== -1 && index < this.markerCtosSP.length) {
      return this.markerCtosSP[index];
    }
    
    console.warn(`⚠️ [EXCLUI-CAIXA] Marcador CTO_SP não encontrado para id_meta: ${idMeta}`);
    return null;
  }

  // ============================================================================
  // 🔧 SEÇÃO: EDIÇÃO DE CABOS
  // ============================================================================
  
  private editarCabo(): void {
    console.log('🔴 [CONTEXT-MENU] Editando cabo...', this.clickedCaboData);
    
    if (this.clickedPolyline) {
      console.log('Dados do cabo clicado:', this.clickedCaboData);
      
      // 🛡️ Marcar que estamos iniciando edição (protege clickedPolyline)
      this.isIniciandoEdicao = true;
      
      // 💾 SALVAR PATH ORIGINAL PARA PODER RESTAURAR SE CANCELAR
      const path = this.clickedPolyline.getPath();
      this.pathOriginal = [];
      for (let i = 0; i < path.getLength(); i++) {
        this.pathOriginal.push(path.getAt(i));
      }
      console.log('💾 [EDITAR-CABO] Path original salvo:', this.pathOriginal.length, 'pontos');
      
      // Obter id_meta do cabo
      const idMeta = this.clickedPolyline.get('id_meta') || this.clickedCaboData.id_meta;
      
      if (!idMeta) {
        console.error('❌ [EDITAR-CABO] ID do cabo não encontrado');
        alert('❌ Erro: ID do cabo não encontrado. Não é possível editar.');
        return;
      }
      
      const idMetaNumero = typeof idMeta === 'string' ? parseInt(idMeta, 10) : idMeta;
      
      // 📍 SALVAR PONTAS ORIGINAIS ANTES DA EDIÇÃO
      const coordenadasOriginais = this.updateCaboService.extrairCoordenadasPolyline(this.clickedPolyline);
      const pontas = this.updateCaboService.extrairPontasCabo(coordenadasOriginais);
      this.pontasOriginais = {
        pontaA: { lat: pontas.pontaA.lat, lng: pontas.pontaA.lng },
        pontaB: { lat: pontas.pontaB.lat, lng: pontas.pontaB.lng }
      };
      console.log('📍 [EDITAR-CABO] Pontas originais salvas:', this.pontasOriginais);
      
      // 🔌 VERIFICAR CONEXÕES NAS PONTAS ANTES DE APLICAR PROTEÇÃO
      this.verificarConexoesPontas(idMetaNumero);
    } else {
      alert('❌ Não foi possível editar o cabo. Polyline não encontrada.');
    }
  }

  /**
   * 🔌 Verifica se as pontas A e B têm fibras conectadas
   * Só aplica proteção se houver conexões
   */
  private verificarConexoesPontas(idMeta: number): void {
    console.log('🔌 [VERIFICAR-CONEXÕES] Verificando conexões das pontas...');
    
    // Resetar proteções
    this.pontasProtegidas = { pontaA: false, pontaB: false };
    
    // Verificar Ponta A
    this.updateCaboService.verificarPontaConectada(idMeta, 'A').subscribe({
      next: (response) => {
        console.log('🔌 [VERIFICAR-CONEXÕES] Resposta Ponta A:', response);
        
        // Verificar se há fibras conectadas (similar ao VB6)
        const temFibras = response.response && 
                         response.response.length > 0 && 
                         response.response.some((item: any) => 
                           item.fibra_1label && 
                           item.fibra_1label !== '' && 
                           item.fibra_1label !== null
                         );
        
        if (temFibras) {
          console.log('🛡️ [PROTEÇÃO] Ponta A tem fibras conectadas - aplicando proteção');
          this.pontasProtegidas.pontaA = true;
        } else {
          console.log('✅ [PROTEÇÃO] Ponta A não tem fibras conectadas - sem proteção');
        }
        
        // Verificar Ponta B
        this.updateCaboService.verificarPontaConectada(idMeta, 'B').subscribe({
          next: (responseB) => {
            console.log('🔌 [VERIFICAR-CONEXÕES] Resposta Ponta B:', responseB);
            
            // Verificar se há fibras conectadas
            const temFibrasB = responseB.response && 
                              responseB.response.length > 0 && 
                              responseB.response.some((item: any) => 
                                item.fibra_1label && 
                                item.fibra_1label !== '' && 
                                item.fibra_1label !== null
                              );
            
            if (temFibrasB) {
              console.log('🛡️ [PROTEÇÃO] Ponta B tem fibras conectadas - aplicando proteção');
              this.pontasProtegidas.pontaB = true;
            } else {
              console.log('✅ [PROTEÇÃO] Ponta B não tem fibras conectadas - sem proteção');
            }
            
            // Após verificar ambas as pontas, iniciar edição com proteção condicional
            console.log('🔌 [VERIFICAR-CONEXÕES] Ambas as pontas verificadas. Chamando iniciarEdicaoCabo()...');
            console.log('🔌 [VERIFICAR-CONEXÕES] Estado atual - clickedPolyline:', this.clickedPolyline);
            this.iniciarEdicaoCabo();
          },
          error: (error) => {
            console.error('❌ [VERIFICAR-CONEXÕES] Erro ao verificar Ponta B:', error);
            // Em caso de erro, não proteger (permitir edição)
            this.pontasProtegidas.pontaB = false;
            // Se clickedPolyline foi perdido, tentar restaurar
            if (!this.clickedPolyline && this.clickedCaboData) {
              console.warn('⚠️ [VERIFICAR-CONEXÕES] clickedPolyline perdido durante verificação');
            }
            this.iniciarEdicaoCabo();
          }
        });
      },
      error: (error) => {
        console.error('❌ [VERIFICAR-CONEXÕES] Erro ao verificar Ponta A:', error);
        // Em caso de erro, não proteger (permitir edição)
        this.pontasProtegidas.pontaA = false;
        
        // Verificar Ponta B mesmo com erro na A
        this.updateCaboService.verificarPontaConectada(idMeta, 'B').subscribe({
          next: (responseB) => {
            const temFibrasB = responseB.response && 
                              responseB.response.length > 0 && 
                              responseB.response.some((item: any) => 
                                item.fibra_1label && 
                                item.fibra_1label !== '' && 
                                item.fibra_1label !== null
                              );
            this.pontasProtegidas.pontaB = temFibrasB;
            this.iniciarEdicaoCabo();
          },
          error: () => {
            this.pontasProtegidas.pontaB = false;
            this.iniciarEdicaoCabo();
          }
        });
      }
    });
  }

  /************************************************************************
   * 🎯 Inicia a edição do cabo após verificar conexões
   */
  private iniciarEdicaoCabo(): void {
    console.log('🎯 [INICIAR-EDIÇÃO] Método iniciarEdicaoCabo chamado');
    console.log('🎯 [INICIAR-EDIÇÃO] clickedPolyline:', this.clickedPolyline);
    
    if (!this.clickedPolyline) {
      console.error('❌ [INICIAR-EDIÇÃO] clickedPolyline é null! Não é possível iniciar edição.');
      // Limpar flag de iniciando edição
      this.isIniciandoEdicao = false;
      alert('❌ Erro: Não foi possível iniciar a edição do cabo. Tente novamente.');
      return;
    }
    
    console.log('🎯 [INICIAR-EDIÇÃO] Iniciando configuração da edição...');
    
    // Salvar estilo original (cor, espessura, opacidade) — evita perder transparência do 1f etc. após edição
    const capEdicao = this.normalizarTipoFibra(
      this.clickedPolyline.get('capacidade') ?? this.clickedCaboData?.capacidade ?? '12',
    );
    const defStroke = this.getDefaultPolylineOptions(capEdicao);
    const cor = this.clickedPolyline.get('strokeColor');
    this.clickedPolylineOriginalColor =
      cor != null && String(cor) !== '' ? String(cor) : String(defStroke.strokeColor ?? '#808080');
    const w0 = Number(this.clickedPolyline.get('strokeWeight'));
    this.clickedPolylineOriginalStrokeWeight = Number.isFinite(w0)
      ? w0
      : Number(defStroke.strokeWeight ?? 3);
    const o0 = Number(this.clickedPolyline.get('strokeOpacity'));
    this.clickedPolylineOriginalStrokeOpacity = Number.isFinite(o0)
      ? o0
      : Number(defStroke.strokeOpacity ?? 0.7);
    
    // 🆕 Remover listener de rightclick da polyline
    google.maps.event.clearListeners(this.clickedPolyline, 'rightclick');
    
    // 🆕 Remover listener de rightclick do MAPA para não interferir
    if (this.listenerMapaRightClick) {
      google.maps.event.removeListener(this.listenerMapaRightClick);
      this.listenerMapaRightClick = null;
      console.log('🚫 Listener de rightclick do mapa desabilitado');
    }
    
    // Desabilitar clickable (mantém listeners de click e dblclick)
    this.clickedPolyline.setOptions({
      editable: true,
      draggable: true,
      clickable: false // 🆕 Desabilitar cliques para não abrir InfoWindow
    });
    
    // Destacar visualmente que está em modo de edição
    this.clickedPolyline.setOptions({
      strokeColor: '#FF0000', // Vermelho para indicar edição
      strokeWeight: 5,
      strokeOpacity: 1.0
    });
    
    // 🆕 Marcar que está em modo de edição
    this.isEditingCabo = true;
    // 🛡️ Desmarcar flag de iniciando (agora está em edição)
    this.isIniciandoEdicao = false;
    
    // 🆕 Adicionar listener customizado para remover vértices
    this.adicionarListenerRemoverVertice();
    
    // 🛡️ Adicionar listener para detectar movimento de vértices
    // Sempre adicionar o listener para detectar quando pontas são soltas sobre caixas
    // e também para proteger pontas A e B (se conectadas)
    console.log('🛡️ [PROTEÇÃO] Adicionando listener de detecção de conexão e proteção de pontas');
      this.adicionarListenerProtecaoPontas();
    
    console.log('✅ Cabo agora está editável!');
    console.log('🚫 Cliques desabilitados durante edição');
    console.log('✅ Menu customizado habilitado - use botão direito nos vértices para remover pontos');
    
    // 🆕 Adicionar listener para finalizar quando clicar no mapa
    this.setupFinishEditingListener();
    
    // Fechar o context menu APENAS DEPOIS de configurar tudo
    this.hideContextMenu();
    
    console.log('✅ [INICIAR-EDIÇÃO] Edição iniciada com sucesso!');
  }
  
  /**
   * 🆕 Adiciona listener customizado para remover vértices durante edição
   */
  private adicionarListenerRemoverVertice(): void {
    if (!this.clickedPolyline || !this.map) return;
    
    // Listener de rightclick na polyline durante edição
    const listenerRightClick = this.clickedPolyline.addListener('rightclick', (event: google.maps.PolyMouseEvent) => {
      if (event.vertex !== undefined) {
        // Clique em um vértice - mostrar menu com opções
        console.log('🎯 Right-click em vértice:', event.vertex);
        
        if (event.domEvent) {
          event.domEvent.preventDefault();
          event.domEvent.stopPropagation();
        }
        
        this.clickedVertexIndex = event.vertex;
        this.contextMenuType = 'vertice';
        const domEv = event.domEvent as MouseEvent | undefined;
        const x = domEv?.clientX ?? 0;
        const y = domEv?.clientY ?? 0;
        this.showContextMenu(x, y);
      } else {
        // Clique na linha (não em vértice)
        console.log('🎯 Right-click na linha (não é vértice)');
        
        if (event.domEvent) {
          event.domEvent.preventDefault();
        }
      }
    });
    
    // Armazenar o listener para remover depois (opcional)
    this.clickedPolyline.set('listenerRemoverVertice', listenerRightClick);
    
    // Adicionar listener temporário no MAPA durante edição
    this.adicionarListenerMapaTempEdicao();
  }

  /**
   * 🗑️ Remove o vértice clicado (chamado pelo context menu)
   */
  private removerVertice(): void {
    if (this.clickedVertexIndex === null || !this.clickedPolyline) return;
    
    const path = this.clickedPolyline.getPath();
    if (path.getLength() > 2) {
      path.removeAt(this.clickedVertexIndex);
      console.log('✅ Vértice removido:', this.clickedVertexIndex);
    } else {
      alert('⚠️ Não é possível remover. O cabo precisa ter no mínimo 2 pontos.');
    }
    this.clickedVertexIndex = null;
  }
  /*2026_03_09*********************************************************** */
  /* inicio do bloco de dividir cabos  */

  /**
   * ✂️ Divide o cabo no vértice clicado (chamado pelo context menu)
   */
  private dividirCaboNoVertice(): void {
    if (this.clickedVertexIndex === null || !this.clickedPolyline || !this.map) return;
    
    const vertexIndex = this.clickedVertexIndex;
    const path = this.clickedPolyline.getPath();
    const totalPontos = path.getLength();
    
    // Validar: vértice não pode ser 0 nem último (mín. 3 pontos em cada parte)
    if (vertexIndex <= 0 || vertexIndex >= totalPontos - 1) {
      alert('⚠️ Para dividir, escolha um vértice intermediário (não o primeiro nem o último).');
      this.clickedVertexIndex = null;
      return;
    }
    if (vertexIndex < 2 || (totalPontos - vertexIndex) < 2) {
      alert('⚠️ Cada parte do cabo precisa ter no mínimo 2 pontos. Use um vértice mais ao centro.');
      this.clickedVertexIndex = null;
      return;
    }
    
    const idMeta = this.clickedPolyline.get('id_meta') || this.clickedCaboData?.id_meta;
    if (!idMeta) {
      alert('❌ Erro: ID do cabo não encontrado.');
      this.clickedVertexIndex = null;
      return;
    }
    
    const parte1: { lat: number; lng: number }[] = [];
    const parte2: { lat: number; lng: number }[] = [];
    
    for (let i = 0; i <= vertexIndex; i++) {
      const p = path.getAt(i);
      parte1.push({ lat: p.lat(), lng: p.lng() });
    }
    for (let i = vertexIndex; i < totalPontos; i++) {
      const p = path.getAt(i);
      parte2.push({ lat: p.lat(), lng: p.lng() });
    }

    // Gap de 1m na ponta cortada: encurtar parte1 para dar impressão visual de corte
    if (parte1.length >= 2) {
      const pontoCorte = new google.maps.LatLng(parte1[parte1.length - 1].lat, parte1[parte1.length - 1].lng);
      const pontoAnterior = new google.maps.LatLng(parte1[parte1.length - 2].lat, parte1[parte1.length - 2].lng);
      const dist = google.maps.geometry.spherical.computeDistanceBetween(pontoAnterior, pontoCorte);
      const offsetMetros = Math.min(1, Math.max(0, dist - 0.1));
      if (offsetMetros > 0) {
        const heading = google.maps.geometry.spherical.computeHeading(pontoCorte, pontoAnterior);
        const novoPonto = google.maps.geometry.spherical.computeOffset(pontoCorte, offsetMetros, heading);
        parte1[parte1.length - 1] = { lat: novoPonto.lat(), lng: novoPonto.lng() };
      }
    }

    this.divideCaboService.dividirCabo({
      id_meta_original: typeof idMeta === 'string' ? parseInt(idMeta, 10) : idMeta,
      GOOGLE_LATLNG_parte1: parte1,
      GOOGLE_LATLNG_parte2: parte2
    }).subscribe({
      next: (response) => {
        if (response.success && response.id_meta_novo && this.clickedPolyline) {
          // Atualizar path da polyline original (parte 1)
          path.clear();
          parte1.forEach(pt => path.push(new google.maps.LatLng(pt.lat, pt.lng)));
          
          // Criar nova polyline (parte 2) e adicionar ao array correto
          const tipoFibraNorm = this.normalizarTipoFibra(
            this.clickedPolyline.get('capacidade') || this.clickedCaboData?.capacidade || '12f'
          );
          const opts = this.getDefaultPolylineOptions(tipoFibraNorm);
          
          const novaPolyline = new google.maps.Polyline({
            path: parte2.map(pt => ({ lat: pt.lat, lng: pt.lng })),
            ...opts,
            map: this.map,
            editable: false,
            draggable: false,
            clickable: true
          });
          
          novaPolyline.set('id_meta', response.id_meta_novo);
          novaPolyline.set('capacidade', tipoFibraNorm);
          novaPolyline.set('label', this.clickedCaboData?.Label_cabo || '');
          novaPolyline.set('tipo', this.clickedCaboData?.tipo || 'CABO');
          novaPolyline.set('GOOGLE_LATLNG', parte2);
          novaPolyline.set('cabo_data', {
            ...this.clickedCaboData,
            id_meta: response.id_meta_novo,
            GOOGLE_LATLNG: parte2
          });
          
          const { polylinesArray, pathsArray, destinoArray, infoWindowsArray } = this.getArraysPorCapacidade(tipoFibraNorm);
          if (polylinesArray && pathsArray) {
            polylinesArray.push(novaPolyline);
            pathsArray.push(parte2);
            if (destinoArray) {
              destinoArray.push({
                id_meta: response.id_meta_novo,
                capacidade: tipoFibraNorm,
                Label_cabo: this.clickedCaboData?.Label_cabo,
                GOOGLE_LATLNG: parte2
              });
            }
          }
          
          // InfoWindow + click/dblclick (editar) + rightclick (context menu)
          this.adicionarListenersCaboPolyline(novaPolyline, tipoFibraNorm, {
            id_meta: response.id_meta_novo,
            Label_cabo: this.clickedCaboData?.Label_cabo,
            capacidade: tipoFibraNorm,
            tipo: this.clickedCaboData?.tipo || 'CABO',
            GOOGLE_LATLNG: parte2,
            cabo_data: { ...this.clickedCaboData, id_meta: response.id_meta_novo, GOOGLE_LATLNG: parte2 }
          }, infoWindowsArray);
          this.recriarListenerRightClick(novaPolyline);
          
          this.cdr.detectChanges();
          alert(`✅ Cabo dividido com sucesso!\n\nOriginal (parte 1): ${response.id_meta_original}\nNovo (parte 2): ${response.id_meta_novo}`);
          
          // Finalizar edição e sair do modo de edição
          this.finalizarEdicaoCabo();
        }
        this.clickedVertexIndex = null;
      },
      error: (err) => {
        console.error('❌ [DIVIDE-CABO] Erro:', err);
        alert('❌ Erro ao dividir cabo. Verifique o console.');
        this.clickedVertexIndex = null;
      }
    });
  }

  /**
   * Normaliza string de capacidade para formato 'Xf' (ex: '12F' ou '12' -> '12f').
   * O modal de tipagem retorna '12F' (uppercase); o resto do código espera '12f'.
   */
  private normalizarTipoFibra(capacidade: string | number): string {
    const str = String(capacidade ?? '12').trim();
    const num = str.match(/(\d+)/)?.[1] || '12';
    return `${num}f`;
  }

  /**
   * Retorna arrays (polylines, paths, destino, infoWindows) conforme capacidade
   */
  private getArraysPorCapacidade(capacidade: string | number): {
    polylinesArray: google.maps.Polyline[];
    pathsArray: google.maps.LatLngLiteral[][];
    destinoArray: any[] | null;
    infoWindowsArray: google.maps.InfoWindow[];
  } {
    const cap = typeof capacidade === 'number' ? `${capacidade}f` : capacidade;
    switch (cap) {
      case '1f': return { polylinesArray: this.polylines1f, pathsArray: this.polylinePaths1f, destinoArray: this.destinoCabos1f, infoWindowsArray: this.infoWindows1f };
      case '2f': return { polylinesArray: this.polylines2f, pathsArray: this.polylinePaths2f, destinoArray: this.destinoCabos2f, infoWindowsArray: this.infoWindows2f };
      case '4f': return { polylinesArray: this.polylines4f, pathsArray: this.polylinePaths4f, destinoArray: this.destinoCabos4f, infoWindowsArray: this.infoWindows4f };
      case '6f': return { polylinesArray: this.polylines6f, pathsArray: this.polylinePaths6f, destinoArray: this.destinoCabos6f, infoWindowsArray: this.infoWindows6f };
      case '8f': return { polylinesArray: this.polylines8f, pathsArray: this.polylinePaths8f, destinoArray: this.destinoCabos8f, infoWindowsArray: this.infoWindows8f };
      case '12f': return { polylinesArray: this.polylines12f, pathsArray: this.polylinePaths12f, destinoArray: this.destinoCabos12f, infoWindowsArray: this.infoWindows12f };
      case '24f': return { polylinesArray: this.polylines24f, pathsArray: this.polylinePaths24f, destinoArray: this.destinoCabos24f, infoWindowsArray: this.infoWindows24f };
      case '36f': return { polylinesArray: this.polylines36f, pathsArray: this.polylinePaths36f, destinoArray: this.destinoCabos36f, infoWindowsArray: this.infoWindows36f };
      case '48f': return { polylinesArray: this.polylines48f, pathsArray: this.polylinePaths48f, destinoArray: this.destinoCabos48f, infoWindowsArray: this.infoWindows48f };
      case '72f': return { polylinesArray: this.polylines72f, pathsArray: this.polylinePaths72f, destinoArray: this.destinoCabos72f, infoWindowsArray: this.infoWindows72f };
      case '144f': return { polylinesArray: this.polylines144f, pathsArray: this.polylinePaths144f, destinoArray: this.destinoCabos144f, infoWindowsArray: this.infoWindows144f };
      default: return { polylinesArray: this.polylines12f, pathsArray: this.polylinePaths12f, destinoArray: this.destinoCabos12f, infoWindowsArray: this.infoWindows12f };
    }
  }

  /**
   * Adiciona InfoWindow e listeners de click/dblclick a uma polyline de cabo (ex.: trecho criado ao dividir)
   * esse trecho é usado só na divisao de cabos, para nao confundir com os listeners de cabos do banco de dados
   */
  private adicionarListenersCaboPolyline(
    polyline: google.maps.Polyline,
    tipoFibra: string,
    caboData: { id_meta: number; Label_cabo?: string; capacidade?: string; tipo?: string; GOOGLE_LATLNG?: any; cabo_data?: any },
    infoWindowsArray?: google.maps.InfoWindow[]
  ): void {
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <h4 style="margin: 0 0 8px 0; color: #333;">Cabo ${tipoFibra.toUpperCase()}</h4>
          <p style="margin: 4px 0;"><strong>ID:</strong> ${caboData.id_meta || 'N/A'}</p>
          <p style="margin: 4px 0;"><strong>Fibras:</strong> ${tipoFibra.replace('f', '')}</p>
          <p style="margin: 4px 0;"><strong>Label:</strong> ${caboData.Label_cabo || 'N/A'}</p>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">Duplo-clique para editar</p>
        </div>
      `
    });

    let clickTimeout: any;
    polyline.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }
      clickTimeout = setTimeout(() => {
        if (event.latLng && this.map) {
          infoWindow.setPosition(event.latLng);
          infoWindow.open(this.map);
        }
      }, 300);
    });

    polyline.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }
      infoWindow.close();
      if (this.isMobile()) {
        this.contextMenuType = 'cabo';
        this.clickedPolyline = polyline;
        this.clickedCaboData = {
          id_meta: caboData.id_meta,
          capacidade: caboData.capacidade || polyline.get('capacidade'),
          tipo: caboData.tipo || polyline.get('tipo') || tipoFibra,
          Label_cabo: caboData.Label_cabo || polyline.get('label') || polyline.get('Label_cabo'),
          GOOGLE_LATLNG: caboData.GOOGLE_LATLNG || polyline.get('GOOGLE_LATLNG'),
          cabo_data: caboData.cabo_data || polyline.get('cabo_data')
        };
        const domEv = event.domEvent as MouseEvent | undefined;
        if (domEv) this.showContextMenu(domEv.clientX, domEv.clientY);
        return;
      }
      if (this.isEditingCabo || this.isIniciandoEdicao) {
        const caboEmEdicaoId = this.clickedPolyline?.get('id_meta');
        const novoCaboId = caboData.id_meta;
        if (caboEmEdicaoId !== novoCaboId) {
          this.finalizarEdicaoCabo();
          setTimeout(() => {
            this.isFinalizandoEdicao = false;
            this.clickedPolyline = polyline;
            this.clickedCaboData = {
              id_meta: caboData.id_meta,
              capacidade: caboData.capacidade || polyline.get('capacidade'),
              tipo: caboData.tipo || polyline.get('tipo') || tipoFibra,
              Label_cabo: caboData.Label_cabo || polyline.get('label') || polyline.get('Label_cabo'),
              GOOGLE_LATLNG: caboData.GOOGLE_LATLNG || polyline.get('GOOGLE_LATLNG'),
              cabo_data: caboData.cabo_data || polyline.get('cabo_data')
            };
            this.editarCabo();
          }, 100);
          return;
        }
      }
      this.clickedPolyline = polyline;
      this.clickedCaboData = {
        id_meta: caboData.id_meta,
        capacidade: caboData.capacidade || polyline.get('capacidade'),
        tipo: caboData.tipo || polyline.get('tipo') || tipoFibra,
        Label_cabo: caboData.Label_cabo || polyline.get('label') || polyline.get('Label_cabo'),
        GOOGLE_LATLNG: caboData.GOOGLE_LATLNG || polyline.get('GOOGLE_LATLNG'),
        cabo_data: caboData.cabo_data || polyline.get('cabo_data')
      };
      this.editarCabo();
    });

    if (infoWindowsArray) {
      infoWindowsArray.push(infoWindow);
    }
  }

  /* até aqui bloco de edição de dividir cabos  */
  /***2026_03_09********************************************************************************************/

  private adicionarListenerMapaTempEdicao(): void {
    if (this.map) {
      const listenerMapaTemp = this.map.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
        console.log('🚫 Right-click no mapa durante edição');
        
        // Prevenir menu padrão
        if (event.domEvent) {
          event.domEvent.preventDefault();
        }
        
        // NÃO mostrar nosso menu customizado
      });
      
      // Armazenar para remover depois
      if (this.clickedPolyline) {
        this.clickedPolyline.set('listenerMapaTempEdicao', listenerMapaTemp);
      }
    }
  }

  /******************************************************************************************************
   * 🛡️ Adiciona listener para proteger as pontas A e B durante a edição
   * Detecta quando um vértice é movido e restaura se for ponta A ou B (se conectadas)
   */
  private adicionarListenerProtecaoPontas(): void {
    if (!this.clickedPolyline) return;
    
    const path = this.clickedPolyline.getPath();
    
    // Listener para detectar quando um vértice é movido (set_at)
    this.listenerPathSetAt = google.maps.event.addListener(path, 'set_at', (index: number) => {
      console.log('📍 [PROTEÇÃO-PONTAS] Vértice movido no índice:', index);
      
      const totalPontos = path.getLength();
      const isPontaA = index === 0;
      const isPontaB = index === totalPontos - 1;
      
      // 🔍 NOVO: Verificar se ponta A ou B foi solta sobre uma caixa
      // MAS: só verificar se a ponta NÃO estiver protegida (já conectada)
      // Se estiver protegida, estamos apenas restaurando a posição, não conectando
      if ((isPontaA || isPontaB) && 
          !(isPontaA && this.pontasProtegidas.pontaA) && 
          !(isPontaB && this.pontasProtegidas.pontaB)) {
        const pontoAtual = path.getAt(index);
        const qualPonta = isPontaA ? 'A' : 'B';
        
        console.log(`🔍 [CONEXÃO] Verificando se Ponta ${qualPonta} está sobre uma caixa ou DIO...`, {
          lat: pontoAtual.lat(),
          lng: pontoAtual.lng()
        });
        
        const caixaProxima = this.encontrarCaixaProxima(pontoAtual);
        
        if (caixaProxima) {
          console.log(`🔌 [CONEXÃO] Ponta ${qualPonta} solta sobre a caixa ${caixaProxima.numero}`);
          // Abrir modal de conexão
          this.abrirModalConexao(qualPonta as 'A' | 'B', caixaProxima);
          return; // Não continuar com a proteção se detectou conexão
        } else {
          console.log(`❌ [CONEXÃO] Ponta ${qualPonta} não está sobre nenhuma caixa próxima`);
          
          // 🆕 NOVO: Verificar CTO
          const ctoProxima = this.encontrarCTOProximo(pontoAtual);
          if (ctoProxima) {
            console.log(`🔌 [CONEXÃO-CTO] Ponta ${qualPonta} solta sobre a CTO ${ctoProxima.numero}`);
            // Converter CTO para formato de Caixa para usar o mesmo modal
            const caixaFormatada: Caixa = {
              id_meta: ctoProxima.id_meta,
              numero: ctoProxima.numero,
              LAT: ctoProxima.LAT,
              LONGI: ctoProxima.LONGI,
              ID_TIPO: ctoProxima.ID_TIPO,
              
            };
            this.abrirModalConexao(qualPonta as 'A' | 'B', caixaFormatada);
            return; // Não continuar com a proteção se detectou conexão
          } else {
            console.log(`❌ [CONEXÃO-CTO] Ponta ${qualPonta} não está sobre nenhuma CTO próxima`);
            
            // 🆕 NOVO: Verificar CTO_SP
            const ctospProxima = this.encontrarCTOSPProximo(pontoAtual);
            if (ctospProxima) {
              console.log(`🔌 [CONEXÃO-CTOSP] Ponta ${qualPonta} solta sobre a CTO_SP ${ctospProxima.numero}`);
              // Converter CTO_SP para formato de Caixa para usar o mesmo modal
              const caixaFormatada: Caixa = {
                id_meta: ctospProxima.id_meta,
                numero: ctospProxima.numero,
                LAT: ctospProxima.LAT,
                LONGI: ctospProxima.LONGI,
                ID_TIPO: ctospProxima.ID_TIPO
              };
              this.abrirModalConexao(qualPonta as 'A' | 'B', caixaFormatada);
              return; // Não continuar com a proteção se detectou conexão
            } else {
              console.log(`❌ [CONEXÃO-CTOSP] Ponta ${qualPonta} não está sobre nenhuma CTO_SP próxima`);
              
              // 🆕 NOVO: Verificar DIO
              const dioProximo = this.encontrarDioProximo(pontoAtual);
              if (dioProximo) {
                console.log(`🔌 [CONEXÃO-DIO] Ponta ${qualPonta} solta sobre o DIO ${dioProximo.sigla || 'N/A'}`);
                // Abrir modal de conexão DIO
                this.abrirModalConexaoDio(qualPonta as 'A' | 'B', dioProximo);
                return; // Não continuar com a proteção se detectou conexão
              } else {
                console.log(`❌ [CONEXÃO-DIO] Ponta ${qualPonta} não está sobre nenhum DIO próximo`);
              }
            }
          }
        }
      }
      
      // Só proteger se a ponta estiver conectada
      if ((isPontaA && this.pontasProtegidas.pontaA) || (isPontaB && this.pontasProtegidas.pontaB)) {
        // Obter a posição atual do vértice movido
        const pontoAtual = path.getAt(index);
        const pontoAtualCoords = {
          lat: pontoAtual.lat(),
          lng: pontoAtual.lng()
        };
        
        // Verificar se a posição mudou significativamente
        let deveRestaurar = false;
        let qualPonta = '';
        
        if (isPontaA && this.pontasProtegidas.pontaA && this.pontasOriginais.pontaA) {
          const distanciaLat = Math.abs(this.pontasOriginais.pontaA.lat - pontoAtualCoords.lat);
          const distanciaLng = Math.abs(this.pontasOriginais.pontaA.lng - pontoAtualCoords.lng);
          const distanciaTotal = Math.sqrt(distanciaLat * distanciaLat + distanciaLng * distanciaLng);
          
          if (distanciaTotal > 0.000001) { // Threshold: ~0.11 metros
            deveRestaurar = true;
            qualPonta = 'A';
          }
        }
        
        if (isPontaB && this.pontasProtegidas.pontaB && this.pontasOriginais.pontaB) {
          const distanciaLat = Math.abs(this.pontasOriginais.pontaB.lat - pontoAtualCoords.lat);
          const distanciaLng = Math.abs(this.pontasOriginais.pontaB.lng - pontoAtualCoords.lng);
          const distanciaTotal = Math.sqrt(distanciaLat * distanciaLat + distanciaLng * distanciaLng);
          
          if (distanciaTotal > 0.000001) { // Threshold: ~0.11 metros
            deveRestaurar = true;
            qualPonta = 'B';
          }
        }
        
        if (deveRestaurar) {
          console.log(`⚠️ [PROTEÇÃO-PONTAS] Tentativa de mover Ponta ${qualPonta} conectada detectada! Restaurando posição...`);
          
          // Restaurar posição original
          const pontoOriginal = qualPonta === 'A' && this.pontasOriginais.pontaA
            ? new google.maps.LatLng(this.pontasOriginais.pontaA.lat, this.pontasOriginais.pontaA.lng)
            : qualPonta === 'B' && this.pontasOriginais.pontaB
            ? new google.maps.LatLng(this.pontasOriginais.pontaB.lat, this.pontasOriginais.pontaB.lng)
            : null;
          
          if (pontoOriginal) {
            // Usar setTimeout para garantir que a restauração aconteça após o movimento
            setTimeout(() => {
              path.setAt(index, pontoOriginal);
              console.log(`↩️ [PROTEÇÃO-PONTAS] Ponta ${qualPonta} restaurada para posição original`);
              
              // Mostrar alerta
              alert(`⚠️ Ponta ${qualPonta} conectada!\n\nPara desfazer a conexão libere primeiro o cabo.`);
            }, 10);
          }
        }
      }
    });
    
    console.log('🛡️ [PROTEÇÃO-PONTAS] Listener de proteção de pontas adicionado');
  }

  /*******************************************************************************************************/

  // 🆕 Método para configurar listener que finaliza a edição do cabo
  private setupFinishEditingListener(): void {
    // Remover listener anterior se existir
    if (this.listenerMapaFinalizarEdicao) {
      google.maps.event.removeListener(this.listenerMapaFinalizarEdicao);
    }
    
    // Adicionar novo listener
    if (this.map) {
      this.listenerMapaFinalizarEdicao = this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (this.isEditingCabo && this.clickedPolyline) {
          console.log('🗺️ Click no mapa detectado - finalizando edição');
          this.finalizarEdicaoCabo();
        }
      });
    }
  }

  /******************************************************************************************************/

  // 🆕 Método para finalizar a edição
  private finalizarEdicaoCabo(): void {
    // 🛡️ Marcar que estamos finalizando edição (proteção adicional)
    this.isFinalizandoEdicao = true;
    
    if (this.clickedPolyline && this.clickedCaboData) {
      console.log('🗺️ [EDITAR-CABO] Finalizando edição e salvando na API...');
      
      // 🛡️ Remover listener de proteção de pontas
      if (this.listenerPathSetAt) {
        google.maps.event.removeListener(this.listenerPathSetAt);
        this.listenerPathSetAt = null;
        console.log('🛡️ [PROTEÇÃO-PONTAS] Listener de proteção removido');
      }
      
      // Extrair coordenadas atualizadas
      const coordenadasAtualizadas = this.updateCaboService.extrairCoordenadasPolyline(this.clickedPolyline);
      
      // Calcular novo comprimento
      const novoComprimento = this.updateCaboService.calcularComprimentoPolyline(this.clickedPolyline);
      
      // Obter id_meta do cabo
      const idMeta = this.clickedPolyline.get('id_meta') || this.clickedCaboData.id_meta;
      
      if (!idMeta) {
        console.error('❌ [EDITAR-CABO] ID do cabo não encontrado');
        alert('❌ Erro: ID do cabo não encontrado. Não é possível salvar.');
        this.cancelarEdicaoCabo();
        return;
      }
      
      // Converter id_meta para número se for string
      const idMetaNumero = typeof idMeta === 'string' ? parseInt(idMeta, 10) : idMeta;
      
      console.log('📊 [EDITAR-CABO] Dados para atualização:', {
        id_meta: idMetaNumero,
        comprimento: novoComprimento,
        totalPontos: coordenadasAtualizadas.length
      });
      
      // Preparar dados para API
      const caboData = {
        id_meta: idMetaNumero,
        length: novoComprimento,
        GOOGLE_LATLNG: coordenadasAtualizadas
      };
      
      // Chamar API para atualizar
      this.updateCaboService.atualizarCabo(caboData).subscribe({
        next: (response) => {
          console.log('✅ [EDITAR-CABO] Cabo atualizado com sucesso na API!', response);

          // Inserir log de atualização de cabo com id_evento 31
          const idUsuario = this.authService.getIdUser();
          const idCity = this.authService.getIdCity();
          if (idUsuario && idCity) {
            console.log('🔄 Inserindo log de atualização de cabo...');
            this.insertLogService.inserirLog({
              id_usuario: idUsuario,
              id_evento: 31,
              id_city: idCity,
              id_meta_objeto: idMetaNumero,
              descricao: `Move Cabo idmeta: ${idMetaNumero}`,
              VERSION: 'Fiberworks WEB 1.0.0'
            }).subscribe({
              next: (logResponse) => {
                console.log('✅ Log de atualização de cabo inserido com sucesso:', logResponse);
              },
              error: (error) => {
                console.error('❌ Erro ao inserir log de atualização de cabo:', error);
              }
            });
          }
          
          // Remover modo de edição e reabilitar clickable
          this.clickedPolyline!.setOptions({
            editable: false,
            draggable: false,
            clickable: true, // 🆕 Reabilitar cliques
            strokeColor: this.clickedPolylineOriginalColor, // Restaurar cor original
            strokeWeight: this.clickedPolylineOriginalStrokeWeight,
            strokeOpacity: this.clickedPolylineOriginalStrokeOpacity,
          });
          
          // 🆕 Remover listeners temporários de edição
          const listenerRemoverVertice = this.clickedPolyline!.get('listenerRemoverVertice');
          if (listenerRemoverVertice) {
            google.maps.event.removeListener(listenerRemoverVertice);
            console.log('🗑️ Listener de remover vértice removido');
          }
          
          const listenerMapaTempEdicao = this.clickedPolyline!.get('listenerMapaTempEdicao');
          if (listenerMapaTempEdicao) {
            google.maps.event.removeListener(listenerMapaTempEdicao);
            console.log('🗑️ Listener temporário do mapa removido');
          }
          
          // 🆕 Recriar listener de rightclick da polyline
          this.recriarListenerRightClick(this.clickedPolyline!);
          
          // 🆕 Recriar listener de rightclick do MAPA
          this.recriarListenerRightClickMapa();
          
          console.log('✅ InfoWindows e context menu reabilitados');
          
          // alert(`✅ Cabo atualizado com sucesso!\n\n🆔 ID: ${idMetaNumero}\n📏 Novo comprimento: ${novoComprimento.toFixed(2)}m\n📍 Total de pontos: ${coordenadasAtualizadas.length}`);
          
          // Limpar flags
          this.isEditingCabo = false;
          this.clickedPolyline = null;
          this.clickedCaboData = null;
          
          // Remover listener
          if (this.listenerMapaFinalizarEdicao) {
            google.maps.event.removeListener(this.listenerMapaFinalizarEdicao);
            this.listenerMapaFinalizarEdicao = null;
          }
          
          // Limpar pontas originais e protegidas após finalizar com sucesso
          this.pontasOriginais = { pontaA: null, pontaB: null };
          this.pontasProtegidas = { pontaA: false, pontaB: false };
          this.pathOriginal = null; // Limpar path original também
          
          // Limpar flag de finalização
          this.isFinalizandoEdicao = false;
          console.log('🛡️ [EDITAR-CABO] Flag isFinalizandoEdicao limpa após finalização');
        },
        error: (error) => {
          console.error('❌ [EDITAR-CABO] Erro ao atualizar cabo na API:', error);
          
          const confirmar = confirm(`❌ Erro ao salvar cabo na base de dados:\n\n${error.message}\n\n⚠️ Deseja cancelar as alterações?`);
          
          if (confirmar) {
            // Cancelar edição (não salvar alterações locais)
            this.cancelarEdicaoCabo();
          } else {
            // Manter alterações locais mesmo sem salvar na API
            this.clickedPolyline!.setOptions({
              editable: false,
              draggable: false,
              clickable: true, // 🆕 Reabilitar cliques
              strokeColor: this.clickedPolylineOriginalColor,
              strokeWeight: this.clickedPolylineOriginalStrokeWeight,
              strokeOpacity: this.clickedPolylineOriginalStrokeOpacity,
            });
            
            // 🛡️ Remover listener de proteção de pontas
            if (this.listenerPathSetAt) {
              google.maps.event.removeListener(this.listenerPathSetAt);
              this.listenerPathSetAt = null;
              console.log('🛡️ [PROTEÇÃO-PONTAS] Listener de proteção removido (erro)');
            }
            
            // 🆕 Remover listeners temporários de edição
            const listenerRemoverVertice = this.clickedPolyline!.get('listenerRemoverVertice');
            if (listenerRemoverVertice) {
              google.maps.event.removeListener(listenerRemoverVertice);
              console.log('🗑️ Listener de remover vértice removido (erro)');
            }
            
            const listenerMapaTempEdicao = this.clickedPolyline!.get('listenerMapaTempEdicao');
            if (listenerMapaTempEdicao) {
              google.maps.event.removeListener(listenerMapaTempEdicao);
              console.log('🗑️ Listener temporário do mapa removido (erro)');
            }
            
            // 🆕 Recriar listener de rightclick da polyline
            this.recriarListenerRightClick(this.clickedPolyline!);
            
            // 🆕 Recriar listener de rightclick do MAPA
            this.recriarListenerRightClickMapa();
            
            console.log('✅ InfoWindows e context menu reabilitados (mesmo sem salvar)');
            
            alert('⚠️ Alterações mantidas localmente, mas NÃO foram salvas na base de dados.');
            
            // Limpar flags
            this.isEditingCabo = false;
            this.clickedPolyline = null;
            this.clickedCaboData = null;
            
            // Remover listener
            if (this.listenerMapaFinalizarEdicao) {
              google.maps.event.removeListener(this.listenerMapaFinalizarEdicao);
              this.listenerMapaFinalizarEdicao = null;
            }
            
            // Limpar pontas originais e protegidas
            this.pontasOriginais = { pontaA: null, pontaB: null };
            this.pontasProtegidas = { pontaA: false, pontaB: false };
            this.pathOriginal = null; // Limpar path original também
          }
        }
      });
    }
  }

  // ============================================================================
  // 🔌 SEÇÃO: DETECÇÃO DE CONEXÃO CABO-CAIXA
  // ============================================================================
  
  /**
   * 🔌 Abre o modal de conexão cabo-caixa-emenda
   */
  private abrirModalConexao(ponta: 'A' | 'B', caixa: Caixa): void {
    // ✅ Obter id_meta do cabo (já está disponível)
    const idMetaCabo = this.clickedPolyline?.get('id_meta') || this.clickedCaboData?.id_meta;
    
    // ✅ Obter capacidade e extrair número da string (ex: "48f" → 48)
    const capacidadeStr = this.clickedPolyline?.get('capacidade') || this.clickedCaboData?.capacidade;
    let capacidadeNum: number;
    
    if (typeof capacidadeStr === 'string') {
      // Extrair número de "48f" → 48
      const match = capacidadeStr.match(/(\d+)/);
      capacidadeNum = match ? parseInt(match[1], 10) : 12; // fallback para 12 se não encontrar
    } else if (typeof capacidadeStr === 'number') {
      capacidadeNum = capacidadeStr;
    } else {
      console.warn('⚠️ [CONEXÃO] Capacidade não encontrada, usando fallback 12');
      capacidadeNum = 12; // fallback
    }

    if (!idMetaCabo) {
      console.error('❌ [CONEXÃO] ID do cabo não encontrado:', {
        clickedPolyline: this.clickedPolyline,
        clickedCaboData: this.clickedCaboData
      });
      alert('Erro: Não foi possível obter o ID do cabo. Tente novamente.');
      return;
    }

    const dialogData: ConexaoCaboCaixaEmendaData = {
      ponta: ponta,
      numeroCaixa: caixa.numero || 'N/A',
      idMetaCaixa: caixa.id_meta,
      idMetaCabo: idMetaCabo,           // ✅ Já disponível
      CapacidadeCabo: capacidadeNum      // ✅ Extraído da string
    };

    console.log('🔌 [CONEXÃO] Abrindo modal com dados:', dialogData);

    const dialogRef = this.dialog.open(ConexaoCaboCaixaEmendaComponent, {
      width: '450px',
      maxWidth: '90vw',
      disableClose: false,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.confirmado) {
        console.log('✅ [CONEXÃO] Conexão confirmada e salva:', result);
        
        // 🔧 NOVO: Mover ponta do cabo para coordenadas da caixa e salvar
        this.moverPontaParaCaixaEPersistir(ponta, caixa);

        // Inserir log de conexão de cabo na caixa evento 15
        const idUsuario = this.authService.getIdUser();
        const idCity = this.authService.getIdCity();
        if (idUsuario && idCity && caixa.id_meta) {
          console.log('🔄 Inserindo log de conexão de cabo na caixa...');
          this.insertLogService.inserirLog({
            id_usuario: idUsuario,
            id_evento: 15, // ID do evento para conexão cabo-caixa 
            id_city: idCity,
            id_meta_objeto: caixa.id_meta,
            descricao: `Conexão de cabo : Ponta ${ponta}, Caixa ${caixa.numero || 'N/A'}, Boca ${result.boca || 'N/A'}, ID Cabo: ${idMetaCabo}`,
            VERSION: 'Fiberworks WEB 1.0.0'
          }).subscribe({
            next: (logResponse) => {
              console.log('✅ Log de conexão de cabo na caixa inserido com sucesso:', logResponse);
            },
            error: (error) => {
              console.error('❌ Erro ao inserir log de conexão de cabo na caixa:', error);
            }
          });
        }


      } else {
        console.log('❌ [CONEXÃO] Conexão cancelada');
      }
    });
  }

  /**
   * 🔌 Abre o modal de conexão cabo-DIO
   */
  private abrirModalConexaoDio(ponta: 'A' | 'B', dio: Dios): void {
    // ✅ Obter id_meta do cabo (já está disponível)
    const idMetaCabo = this.clickedPolyline?.get('id_meta') || this.clickedCaboData?.id_meta;
    
    // ✅ Obter capacidade e extrair número da string (ex: "48f" → 48)
    const capacidadeStr = this.clickedPolyline?.get('capacidade') || this.clickedCaboData?.capacidade;
    let capacidadeNum: number;
    
    if (typeof capacidadeStr === 'string') {
      // Extrair número de "48f" → 48
      const match = capacidadeStr.match(/(\d+)/);
      capacidadeNum = match ? parseInt(match[1], 10) : 12; // fallback para 12 se não encontrar
    } else if (typeof capacidadeStr === 'number') {
      capacidadeNum = capacidadeStr;
    } else {
      console.warn('⚠️ [CONEXÃO-DIO] Capacidade não encontrada, usando fallback 12');
      capacidadeNum = 12; // fallback
    }

    if (!idMetaCabo) {
      console.error('❌ [CONEXÃO-DIO] ID do cabo não encontrado:', {
        clickedPolyline: this.clickedPolyline,
        clickedCaboData: this.clickedCaboData
      });
      alert('Erro: Não foi possível obter o ID do cabo. Tente novamente.');
      return;
    }

    const dialogData: ConexaoCaboDioData = {
      ponta: ponta,
      numeroDio: dio.sigla || 'N/A',
      idMetaDio: dio.id_meta,
      idMetaCabo: idMetaCabo,           // ✅ Já disponível
      CapacidadeCabo: capacidadeNum      // ✅ Extraído da string
    };

    console.log('🔌 [CONEXÃO-DIO] Abrindo modal com dados:', dialogData);

    const dialogRef = this.dialog.open(ConexaoCaboDioComponent, {
      width: '450px',
      maxWidth: '90vw',
      disableClose: false,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.confirmado) {
        console.log('✅ [CONEXÃO-DIO] Conexão confirmada e salva:', result);
        
        // 🔧 NOVO: Mover ponta do cabo para coordenadas do DIO e salvar
        this.moverPontaParaDioEPersistir(ponta, dio);

        // Inserir log de conexão de cabo no DIO evento 15
        const idUsuario = this.authService.getIdUser();
        const idCity = this.authService.getIdCity();
        if (idUsuario && idCity && idMetaCabo) {
          console.log('🔄 Inserindo log de conexão de cabo no DIO...');
          this.insertLogService.inserirLog({
            id_usuario: idUsuario,
            id_evento: 15, // ID do evento para conexão cabo-DIO 
            id_city: idCity,
            id_meta_objeto: idMetaCabo,
            descricao: `Conexão de cabo : Ponta ${ponta}, DIO ${dio.sigla || 'N/A'}, Bandeja ${result.bandeja || 'N/A'}, ID DIO: ${dio.id_meta}`,
            VERSION: 'Fiberworks WEB 1.0.0'
          }).subscribe({
            next: (logResponse) => {
              console.log('✅ Log de conexão de cabo no DIO inserido com sucesso:', logResponse);
            },
            error: (error) => {
              console.error('❌ Erro ao inserir log de conexão de cabo no DIO:', error);
            }
          });
        }


      } else {
        console.log('❌ [CONEXÃO-DIO] Conexão cancelada');
      }
    });
  }

  /**
   * 🔧 NOVO: Move a ponta do cabo para as coordenadas da caixa e salva no banco
   */
  private moverPontaParaCaixaEPersistir(ponta: 'A' | 'B', caixa: Caixa): void {
    if (!this.clickedPolyline || !caixa.LAT || !caixa.LONGI) {
      console.error('❌ [CONEXÃO] Dados insuficientes para mover ponta:', {
        clickedPolyline: this.clickedPolyline,
        caixa: caixa
      });
      return;
    }

    const path = this.clickedPolyline.getPath();
    if (!path || path.getLength() < 2) {
      console.error('❌ [CONEXÃO] Path inválido');
      return;
    }

    // Obter coordenadas da caixa
    const latCaixa = typeof caixa.LAT === 'number' ? caixa.LAT : Number(caixa.LAT);
    const lngCaixa = typeof caixa.LONGI === 'number' ? caixa.LONGI : Number(caixa.LONGI);
    
    const coordenadaCaixa = new google.maps.LatLng(latCaixa, lngCaixa);
    
    console.log(`🔧 [CONEXÃO] Movendo Ponta ${ponta} para coordenadas da caixa:`, {
      lat: latCaixa,
      lng: lngCaixa
    });

    // 🔧 CORREÇÃO: Marcar ponta como conectada (protegida) ANTES de mover
    // Isso evita que o listener set_at tente detectar conexão novamente
    if (ponta === 'A') {
      this.pontasProtegidas.pontaA = true;
      this.pontasOriginais.pontaA = { lat: latCaixa, lng: lngCaixa };
    } else {
      this.pontasProtegidas.pontaB = true;
      this.pontasOriginais.pontaB = { lat: latCaixa, lng: lngCaixa };
    }

    console.log(`🛡️ [CONEXÃO] Ponta ${ponta} marcada como conectada e protegida ANTES de mover`);

    // Determinar índice da ponta (0 = A, último = B)
    const indexPonta = ponta === 'A' ? 0 : path.getLength() - 1;
    
    // Mover a ponta para as coordenadas da caixa
    // Agora quando o evento set_at for disparado, a ponta já estará marcada como protegida
    path.setAt(indexPonta, coordenadaCaixa);
    
    console.log(`✅ [CONEXÃO] Ponta ${ponta} movida para coordenadas da caixa`);

    // Extrair coordenadas atualizadas da polyline
    const coordenadasAtualizadas = this.updateCaboService.extrairCoordenadasPolyline(this.clickedPolyline);
    
    // Calcular novo comprimento
    const novoComprimento = this.updateCaboService.calcularComprimentoPolyline(this.clickedPolyline);
    
    // Obter id_meta do cabo
    const idMetaCabo = this.clickedPolyline.get('id_meta') || this.clickedCaboData?.id_meta;
    
    if (!idMetaCabo) {
      console.error('❌ [CONEXÃO] ID do cabo não encontrado para salvar');
      return;
    }

    // Preparar dados para atualização
    const caboData = {
      id_meta: idMetaCabo,
      length: novoComprimento,
      GOOGLE_LATLNG: coordenadasAtualizadas
    };

    console.log('💾 [CONEXÃO] Salvando coordenadas atualizadas no banco...', caboData);

    // Salvar no banco
    this.updateCaboService.atualizarCabo(caboData).subscribe({
      next: (response) => {
        console.log('✅ [CONEXÃO] Coordenadas salvas com sucesso:', response);
        //20251210 alert(`✅ Conexão realizada e coordenadas atualizadas!\n\nPonta ${ponta} agora está conectada à caixa ${caixa.numero}`);
      },
      error: (error) => {
        console.error('❌ [CONEXÃO] Erro ao salvar coordenadas:', error);
        alert(`⚠️ Conexão realizada, mas houve erro ao salvar coordenadas:\n\n${error.message || error}`);
      }
    });
  }

  /**
   * 🔧 NOVO: Move a ponta do cabo para as coordenadas do DIO e salva no banco
   */
  private moverPontaParaDioEPersistir(ponta: 'A' | 'B', dio: Dios): void {
    if (!this.clickedPolyline || !dio.LAT || !dio.LNG) {
      console.error('❌ [CONEXÃO-DIO] Dados insuficientes para mover ponta:', {
        clickedPolyline: this.clickedPolyline,
        dio: dio
      });
      return;
    }

    const path = this.clickedPolyline.getPath();
    if (!path || path.getLength() < 2) {
      console.error('❌ [CONEXÃO-DIO] Path inválido');
      return;
    }

    // Obter coordenadas do DIO
    const latDio = typeof dio.LAT === 'number' ? dio.LAT : Number(dio.LAT);
    const lngDio = typeof dio.LNG === 'number' ? dio.LNG : Number(dio.LNG);
    
    const coordenadaDio = new google.maps.LatLng(latDio, lngDio);
    
    console.log(`🔧 [CONEXÃO-DIO] Movendo Ponta ${ponta} para coordenadas do DIO:`, {
      lat: latDio,
      lng: lngDio
    });

    // 🔧 CORREÇÃO: Marcar ponta como conectada (protegida) ANTES de mover
    // Isso evita que o listener set_at tente detectar conexão novamente
    if (ponta === 'A') {
      this.pontasProtegidas.pontaA = true;
      this.pontasOriginais.pontaA = { lat: latDio, lng: lngDio };
    } else {
      this.pontasProtegidas.pontaB = true;
      this.pontasOriginais.pontaB = { lat: latDio, lng: lngDio };
    }

    console.log(`🛡️ [CONEXÃO-DIO] Ponta ${ponta} marcada como conectada e protegida ANTES de mover`);

    // Determinar índice da ponta (0 = A, último = B)
    const indexPonta = ponta === 'A' ? 0 : path.getLength() - 1;
    
    // Mover a ponta para as coordenadas do DIO
    // Agora quando o evento set_at for disparado, a ponta já estará marcada como protegida
    path.setAt(indexPonta, coordenadaDio);
    
    console.log(`✅ [CONEXÃO-DIO] Ponta ${ponta} movida para coordenadas do DIO`);

    // Extrair coordenadas atualizadas da polyline
    const coordenadasAtualizadas = this.updateCaboService.extrairCoordenadasPolyline(this.clickedPolyline);
    
    // Calcular novo comprimento
    const novoComprimento = this.updateCaboService.calcularComprimentoPolyline(this.clickedPolyline);
    
    // Obter id_meta do cabo
    const idMetaCabo = this.clickedPolyline.get('id_meta') || this.clickedCaboData?.id_meta;
    
    if (!idMetaCabo) {
      console.error('❌ [CONEXÃO-DIO] ID do cabo não encontrado para salvar');
      return;
    }

    // Preparar dados para atualização
    const caboData = {
      id_meta: idMetaCabo,
      length: novoComprimento,
      GOOGLE_LATLNG: coordenadasAtualizadas
    };

    console.log('💾 [CONEXÃO-DIO] Salvando coordenadas atualizadas no banco...', caboData);

    // Salvar no banco
    this.updateCaboService.atualizarCabo(caboData).subscribe({
      next: (response) => {
        console.log('✅ [CONEXÃO-DIO] Coordenadas salvas com sucesso:', response);
        //20251210 alert(`✅ Conexão realizada e coordenadas atualizadas!\n\nPonta ${ponta} agora está conectada ao DIO ${dio.sigla}`);
      },
      error: (error) => {
        console.error('❌ [CONEXÃO-DIO] Erro ao salvar coordenadas:', error);
        alert(`⚠️ Conexão realizada, mas houve erro ao salvar coordenadas:\n\n${error.message || error}`);
      }
    });
  }

  /**
   * 📍 Encontra a caixa mais próxima de uma coordenada usando distância real do Google Maps
   * @param ponto - Coordenada da ponta do cabo
   * @returns Caixa mais próxima se estiver dentro do threshold, null caso contrário
   */
  private encontrarCaixaProxima(ponto: google.maps.LatLng): Caixa | null {
    if (!this.destino || this.destino.length === 0) {
      console.warn('⚠️ [CONEXÃO] Array destino está vazio ou não existe');
      return null;
    }

    console.log(`🔍 [CONEXÃO] Verificando ${this.destino.length} caixas...`);

    const THRESHOLD_DISTANCIA_METROS = 3; // 5 metros
    let caixaMaisProxima: Caixa | null = null;
    let menorDistancia = Infinity;

    this.destino.forEach((caixa, index) => {
      if (!caixa.LAT || !caixa.LONGI) {
        return;
      }

      const latCaixa = typeof caixa.LAT === 'number' ? caixa.LAT : Number(caixa.LAT);
      const lngCaixa = typeof caixa.LONGI === 'number' ? caixa.LONGI : Number(caixa.LONGI);
      
      const posicaoCaixa = new google.maps.LatLng(latCaixa, lngCaixa);
      
      // Usar função do Google Maps para calcular distância real em metros
      const distancia = google.maps.geometry.spherical.computeDistanceBetween(
        ponto,
        posicaoCaixa
      );

      if (distancia < THRESHOLD_DISTANCIA_METROS && distancia < menorDistancia) {
        menorDistancia = distancia;
        caixaMaisProxima = caixa;
        console.log(`✅ [CONEXÃO] Caixa ${caixa.numero} encontrada a ${distancia.toFixed(2)}m`);
      }
    });

    if (!caixaMaisProxima) {
      console.log(`❌ [CONEXÃO] Nenhuma caixa encontrada dentro de ${THRESHOLD_DISTANCIA_METROS}m`);
    }

    return caixaMaisProxima;
  }

  /**
   * 📍 Encontra o DIO mais próximo de uma coordenada usando distância real do Google Maps
   * @param ponto - Coordenada da ponta do cabo
   * @returns DIO mais próximo se estiver dentro do threshold, null caso contrário
   */
  private encontrarDioProximo(ponto: google.maps.LatLng): Dios | null {
    if (!this.destinoDios || this.destinoDios.length === 0) {
      console.warn('⚠️ [CONEXÃO-DIO] Array destinoDios está vazio ou não existe');
      return null;
    }

    console.log(`🔍 [CONEXÃO-DIO] Verificando ${this.destinoDios.length} DIOs...`);

    const THRESHOLD_DISTANCIA_METROS = 1; // 1 metro
    let dioMaisProximo: Dios | null = null;
    let menorDistancia = Infinity;

    this.destinoDios.forEach((dio, index) => {
      if (!dio.LAT || !dio.LNG) {
        return;
      }

      const latDio = typeof dio.LAT === 'number' ? dio.LAT : Number(dio.LAT);
      const lngDio = typeof dio.LNG === 'number' ? dio.LNG : Number(dio.LNG);
      
      const posicaoDio = new google.maps.LatLng(latDio, lngDio);
      
      // Usar função do Google Maps para calcular distância real em metros
      const distancia = google.maps.geometry.spherical.computeDistanceBetween(
        ponto,
        posicaoDio
      );

      if (distancia < THRESHOLD_DISTANCIA_METROS && distancia < menorDistancia) {
        menorDistancia = distancia;
        dioMaisProximo = dio;
        console.log(`✅ [CONEXÃO-DIO] DIO ${dio.sigla || 'N/A'} encontrado a ${distancia.toFixed(2)}m`);
      }
    });

    if (!dioMaisProximo) {
      console.log(`❌ [CONEXÃO-DIO] Nenhum DIO encontrado dentro de ${THRESHOLD_DISTANCIA_METROS}m`);
    }

    return dioMaisProximo;
  }

  /**
   * 📍 Encontra a CTO mais próxima de uma coordenada usando distância real do Google Maps
   * @param ponto - Coordenada da ponta do cabo
   * @returns CTO mais próxima se estiver dentro do threshold, null caso contrário
   */
  private encontrarCTOProximo(ponto: google.maps.LatLng): Cto | null {
    if (!this.destinoCTO || this.destinoCTO.length === 0) {
      console.warn('⚠️ [CONEXÃO-CTO] Array destinoCTO está vazio ou não existe');
      return null;
    }

    console.log(`🔍 [CONEXÃO-CTO] Verificando ${this.destinoCTO.length} CTOs...`);

    const THRESHOLD_DISTANCIA_METROS = 3; // 3 metros
    let ctoMaisProxima: Cto | null = null;
    let menorDistancia = Infinity;

    this.destinoCTO.forEach((cto, index) => {
      if (!cto.LAT || !cto.LONGI) {
        return;
      }

      const latCTO = typeof cto.LAT === 'number' ? cto.LAT : Number(cto.LAT);
      const lngCTO = typeof cto.LONGI === 'number' ? cto.LONGI : Number(cto.LONGI);
      
      const posicaoCTO = new google.maps.LatLng(latCTO, lngCTO);
      
      // Usar função do Google Maps para calcular distância real em metros
      const distancia = google.maps.geometry.spherical.computeDistanceBetween(
        ponto,
        posicaoCTO
      );

      if (distancia < THRESHOLD_DISTANCIA_METROS && distancia < menorDistancia) {
        menorDistancia = distancia;
        ctoMaisProxima = cto;
        console.log(`✅ [CONEXÃO-CTO] CTO ${cto.numero} encontrada a ${distancia.toFixed(2)}m`);
      }
    });

    if (!ctoMaisProxima) {
      console.log(`❌ [CONEXÃO-CTO] Nenhuma CTO encontrada dentro de ${THRESHOLD_DISTANCIA_METROS}m`);
    }

    return ctoMaisProxima;
  }

  /**
   * 📍 Encontra a CTO_SP mais próxima de uma coordenada usando distância real do Google Maps
   * @param ponto - Coordenada da ponta do cabo
   * @returns CTO_SP mais próxima se estiver dentro do threshold, null caso contrário
   */
  private encontrarCTOSPProximo(ponto: google.maps.LatLng): Cto_SP | null {
    if (!this.destinoCTOSP || this.destinoCTOSP.length === 0) {
      console.warn('⚠️ [CONEXÃO-CTOSP] Array destinoCTOSP está vazio ou não existe');
      return null;
    }

    console.log(`🔍 [CONEXÃO-CTOSP] Verificando ${this.destinoCTOSP.length} CTOs_SP...`);

    const THRESHOLD_DISTANCIA_METROS = 3; // 3 metros
    let ctospMaisProxima: Cto_SP | null = null;
    let menorDistancia = Infinity;

    this.destinoCTOSP.forEach((ctosp, index) => {
      if (!ctosp.LAT || !ctosp.LONGI) {
        return;
      }

      const latCTOSP = typeof ctosp.LAT === 'number' ? ctosp.LAT : Number(ctosp.LAT);
      const lngCTOSP = typeof ctosp.LONGI === 'number' ? ctosp.LONGI : Number(ctosp.LONGI);
      
      const posicaoCTOSP = new google.maps.LatLng(latCTOSP, lngCTOSP);
      
      // Usar função do Google Maps para calcular distância real em metros
      const distancia = google.maps.geometry.spherical.computeDistanceBetween(
        ponto,
        posicaoCTOSP
      );

      if (distancia < THRESHOLD_DISTANCIA_METROS && distancia < menorDistancia) {
        menorDistancia = distancia;
        ctospMaisProxima = ctosp;
        console.log(`✅ [CONEXÃO-CTOSP] CTO_SP ${ctosp.numero} encontrada a ${distancia.toFixed(2)}m`);
      }
    });

    if (!ctospMaisProxima) {
      console.log(`❌ [CONEXÃO-CTOSP] Nenhuma CTO_SP encontrada dentro de ${THRESHOLD_DISTANCIA_METROS}m`);
    }

    return ctospMaisProxima;
  }

  /**
   * 📍 Identifica qual ponta do cabo foi clicada baseado na posição do clique
   * Calcula o tamanho total do cabo, divide ao meio, e verifica se o clique
   * está mais próximo da ponta A (início) ou da ponta B (fim)
   * 
   * @param path - Path da polyline do cabo
   * @param pontoClique - Coordenada do ponto clicado
   * @returns 'A' se mais próximo da ponta A, 'B' se mais próximo da ponta B
   */
  private identificarPontaClicada(
    path: google.maps.MVCArray<google.maps.LatLng>,
    pontoClique: google.maps.LatLng
  ): 'A' | 'B' {
    if (path.getLength() < 2) {
      console.warn('⚠️ [IDENTIFICAR-PONTA] Path muito curto, usando ponta A como padrão');
      return 'A';
    }

    // 1. Calcular o tamanho total do cabo (soma das distâncias entre todos os pontos)
    let tamanhoTotal = 0;
    const distancias: number[] = [0]; // Primeira distância é 0 (início)
    
    for (let i = 0; i < path.getLength() - 1; i++) {
      const pontoAtual = path.getAt(i);
      const proximoPonto = path.getAt(i + 1);
      const distancia = google.maps.geometry.spherical.computeDistanceBetween(
        pontoAtual,
        proximoPonto
      );
      tamanhoTotal += distancia;
      distancias.push(tamanhoTotal); // Distância acumulada até este ponto
    }

    console.log(`📏 [IDENTIFICAR-PONTA] Tamanho total do cabo: ${tamanhoTotal.toFixed(2)}m`);

    // 2. Encontrar o ponto do path mais próximo do clique
    let pontoMaisProximoIndex = 0;
    let menorDistanciaAoClique = Infinity;

    for (let i = 0; i < path.getLength(); i++) {
      const pontoPath = path.getAt(i);
      const distanciaAoClique = google.maps.geometry.spherical.computeDistanceBetween(
        pontoPath,
        pontoClique
      );
      
      if (distanciaAoClique < menorDistanciaAoClique) {
        menorDistanciaAoClique = distanciaAoClique;
        pontoMaisProximoIndex = i;
      }
    }

    // 3. Calcular a distância acumulada até o ponto mais próximo do clique
    const distanciaAcumuladaAteClique = distancias[pontoMaisProximoIndex];
    
    // 4. Dividir o tamanho total ao meio
    const metadeTamanho = tamanhoTotal / 2;

    console.log(`📍 [IDENTIFICAR-PONTA] Distância acumulada até clique: ${distanciaAcumuladaAteClique.toFixed(2)}m`);
    console.log(`📍 [IDENTIFICAR-PONTA] Metade do tamanho: ${metadeTamanho.toFixed(2)}m`);

    // 5. Se a distância acumulada for menor que metade → ponta A, senão → ponta B
    const ponta = distanciaAcumuladaAteClique < metadeTamanho ? 'A' : 'B';
    
    console.log(`✅ [IDENTIFICAR-PONTA] Ponta identificada: ${ponta}`);
    
    return ponta;
  }
  
  /**
   * 🎯 Processa o rightclick em um cabo (método auxiliar)
   */
  private processarRightClickCabo(
    event: google.maps.MapMouseEvent, 
    polyline: google.maps.Polyline, 
    cabo: any, 
    infoWindow?: google.maps.InfoWindow
  ): void {
    // Prevenir menu padrão do navegador
    if (event.domEvent) {
      event.domEvent.preventDefault();
      event.domEvent.stopPropagation();
    }
    
    // Marcar flag ANTES do preventDefault
    this.isCaboClicked = true;
    
    // Parar propagação do evento do Google Maps
    event.stop();
    
    // Fechar InfoWindow se estiver aberto
    if (infoWindow) {
      infoWindow.close();
    }
    
    // Obter dados do cabo da polyline (se não foram fornecidos)
    if (!cabo) {
      cabo = {
        id_meta: polyline.get('id_meta'),
        capacidade: polyline.get('capacidade'),
        tipo: polyline.get('tipo'),
        Label_cabo: polyline.get('label') || polyline.get('Label_cabo'),
        GOOGLE_LATLNG: polyline.get('GOOGLE_LATLNG'),
        cabo_data: polyline.get('cabo_data')
      };
    }
    
    // Armazenar dados do cabo clicado
    this.clickedCaboData = cabo;
    // 🆕 Armazenar a polyline clicada para poder editá-la
    this.clickedPolyline = polyline;
    
    // 🆕 Armazenar coordenada do clique para identificar ponta depois
    if (event.latLng) {
      this.ultimaCoordenadaClique = event.latLng;
      console.log('📍 [RIGHT-CLICK-CABO] Coordenada do clique armazenada:', event.latLng.lat(), event.latLng.lng());
    }
    
    // Definir tipo de contexto como 'cabo'
    this.contextMenuType = 'cabo';
    
    // Mostrar context menu na posição do clique
    if (event.domEvent) {
      const mouseEvent = event.domEvent as MouseEvent;
      console.log('🔴 Mostrando context menu para cabo em:', mouseEvent.clientX, mouseEvent.clientY);
      this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
    }
  }

  /**
   * 🆕 Método auxiliar para recriar listener de rightclick da polyline
   */
  private recriarListenerRightClick(polyline: google.maps.Polyline): void {
    console.log('🔄 [EDITAR-CABO] Recriando listener de rightclick da polyline...');
    
    polyline.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
      console.log('🔴 RIGHT-CLICK no cabo (listener recriado)');
      
      // 🛑 IMPORTANTE: Prevenir menu padrão do navegador PRIMEIRO
      if (event.domEvent) {
        event.domEvent.preventDefault();
        event.domEvent.stopPropagation();
      }
      
      // 🛡️ Verificar se já existe uma edição em andamento
      if (this.isEditingCabo || this.isIniciandoEdicao) {
        console.log('⚠️ [EDITAR-CABO] Edição em andamento detectada. Finalizando edição anterior...');
        
        // Se o cabo clicado é diferente do que está sendo editado, finalizar edição anterior
        const caboEmEdicaoId = this.clickedPolyline?.get('id_meta');
        const novoCaboId = polyline.get('id_meta');
        
        if (caboEmEdicaoId !== novoCaboId) {
          console.log('🔄 [EDITAR-CABO] Novo cabo clicado durante edição. Finalizando edição anterior...');
          
          // 🛡️ CRÍTICO: Prevenir menu ANTES de QUALQUER processamento assíncrono
          if (event.domEvent) {
            const domEvent = event.domEvent as MouseEvent;
            domEvent.preventDefault();
            domEvent.stopPropagation();
            domEvent.stopImmediatePropagation();
            
            // 🆕 BACKUP: Prevenir também no próximo tick (caso o preventDefault não tenha funcionado)
            requestAnimationFrame(() => {
              if (!domEvent.defaultPrevented) {
                domEvent.preventDefault();
                domEvent.stopPropagation();
                domEvent.stopImmediatePropagation();
              }
            });
          }
          
          // Finalizar edição do cabo anterior (salvar automaticamente)
          this.finalizarEdicaoCabo();
          // Aguardar um pouco para garantir que a finalização foi processada
          setTimeout(() => {
            // 🛡️ Limpar flag de finalização após o timeout
            this.isFinalizandoEdicao = false;
            
            // Obter dados do cabo da polyline
            const caboData = {
              id_meta: polyline.get('id_meta'),
              capacidade: polyline.get('capacidade'),
              tipo: polyline.get('tipo'),
              Label_cabo: polyline.get('label') || polyline.get('Label_cabo'),
              GOOGLE_LATLNG: polyline.get('GOOGLE_LATLNG'),
              cabo_data: polyline.get('cabo_data')
            };
            this.processarRightClickCabo(event, polyline, caboData);
          }, 100);
          return;
        } else {
          // Mesmo cabo - apenas mostrar menu
          console.log('✅ [EDITAR-CABO] Mesmo cabo clicado durante edição');
        }
      }
      
      // Obter dados do cabo da polyline
      const caboData = {
        id_meta: polyline.get('id_meta'),
        capacidade: polyline.get('capacidade'),
        tipo: polyline.get('tipo'),
        Label_cabo: polyline.get('label') || polyline.get('Label_cabo'),
        GOOGLE_LATLNG: polyline.get('GOOGLE_LATLNG'),
        cabo_data: polyline.get('cabo_data')
      };
      
      this.processarRightClickCabo(event, polyline, caboData);
    });
    
    console.log('✅ [EDITAR-CABO] Listener de rightclick da polyline recriado com sucesso');
  }

  /**
   * 🆕 Método auxiliar para recriar listener de rightclick do mapa
   */
  private recriarListenerRightClickMapa(): void {
    console.log('🔄 [EDITAR-CABO] Recriando listener de rightclick do mapa...');
    
    // 🛡️ Remover listener anterior se existir (para evitar duplicatas)
    if (this.listenerMapaRightClick) {
      google.maps.event.removeListener(this.listenerMapaRightClick);
      this.listenerMapaRightClick = null;
    }
    
    if (this.map) {
      this.listenerMapaRightClick = this.map.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
        // Verificar se o clique foi no mapa mesmo (não em elementos)
        if (event.domEvent && event.domEvent.target) {
          const target = event.domEvent.target as HTMLElement;
          
          // Verificar se o clique foi no mapa (mais amplo)
          const isMapClick = target.tagName === 'CANVAS' || 
                           target.classList.contains('gm-style') ||
                           target.closest('.gm-style') !== null ||
                           target.closest('google-map') !== null;
          
          if (isMapClick && !this.isCaboClicked) {
            console.log('🗺️ [MAP] Right-click detectado no mapa (recriado)');
            
            // Prevenir menu padrão do navegador
            if (event.domEvent) {
              const domEvent = event.domEvent as MouseEvent;
              domEvent.preventDefault();
              domEvent.stopPropagation();
            }
            
            // 🛡️ Verificar se há edição em andamento e cancelar
            if (this.isEditingCabo || this.isIniciandoEdicao) {
              console.log('⚠️ [EDITAR-CABO] Context menu do mapa detectado durante edição. Cancelando edição...');
              this.cancelarEdicaoCabo();
              return; // Não mostrar menu do mapa após cancelar
            }
            
            // 🆕 CORREÇÃO: Armazenar coordenada do clique para usar no modal de criar caixa
            if (event.latLng) {
              this.ultimaCoordenadaContextMenu = event.latLng;
              console.log('🗺️ [MAP] Coordenada armazenada (recriado):', event.latLng.lat(), event.latLng.lng());
            }
            
            // Mostrar context menu do mapa
            this.contextMenuType = 'map';
            
            if (event.domEvent) {
              const mouseEvent = event.domEvent as MouseEvent;
              this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
            }
          }
        }
        
        // Reset da flag de cabo clicado
        this.isCaboClicked = false;
      });
      
      console.log('✅ [EDITAR-CABO] Listener de rightclick do mapa recriado com sucesso');
    }
  }

  /**
   * 🆕 Método para cancelar a edição (restaurar estado original sem recarregar página)
   */
  private cancelarEdicaoCabo(): void {
    console.log('❌ [EDITAR-CABO] Cancelando edição...');
    
    // 🛡️ Desmarcar flags
    this.isEditingCabo = false;
    this.isIniciandoEdicao = false;
    this.isFinalizandoEdicao = false; // 🛡️ Limpar flag de finalização
    
    // 🛡️ Remover listener de proteção de pontas
    if (this.listenerPathSetAt) {
      google.maps.event.removeListener(this.listenerPathSetAt);
      this.listenerPathSetAt = null;
      console.log('🛡️ [PROTEÇÃO-PONTAS] Listener de proteção removido');
    }
    
    // 🔄 RESTAURAR ESTADO ORIGINAL DO CABO (SEM RECARREGAR PÁGINA)
    if (this.clickedPolyline) {
      // Restaurar path original se foi salvo
      if (this.pathOriginal && this.pathOriginal.length > 0) {
        console.log('🔄 [EDITAR-CABO] Restaurando path original do cabo...');
        const path = this.clickedPolyline.getPath();
        path.clear();
        this.pathOriginal.forEach(ponto => {
          path.push(ponto);
        });
        console.log('✅ [EDITAR-CABO] Path original restaurado');
      }
      
      // Remover modo de edição e reabilitar clickable
      this.clickedPolyline.setOptions({
        editable: false,
        draggable: false,
        clickable: true, // Reabilitar cliques
        strokeColor: this.clickedPolylineOriginalColor, // Restaurar cor original
        strokeWeight: this.clickedPolylineOriginalStrokeWeight,
        strokeOpacity: this.clickedPolylineOriginalStrokeOpacity,
      });
      
      // 🆕 Remover listeners temporários de edição
      const listenerRemoverVertice = this.clickedPolyline.get('listenerRemoverVertice');
      if (listenerRemoverVertice) {
        google.maps.event.removeListener(listenerRemoverVertice);
        console.log('🗑️ Listener de remover vértice removido');
      }
      
      const listenerMapaTempEdicao = this.clickedPolyline.get('listenerMapaTempEdicao');
      if (listenerMapaTempEdicao) {
        google.maps.event.removeListener(listenerMapaTempEdicao);
        console.log('🗑️ Listener temporário do mapa removido');
      }
      
      // 🆕 Recriar listener de rightclick da polyline
      this.recriarListenerRightClick(this.clickedPolyline);
      
      // 🆕 Recriar listener de rightclick do MAPA
      this.recriarListenerRightClickMapa();
      
      console.log('✅ [EDITAR-CABO] Estado do cabo restaurado sem recarregar página');
    }
    
    // Limpar flags
    this.clickedPolyline = null;
    this.clickedCaboData = null;
    
    // Remover listener
    if (this.listenerMapaFinalizarEdicao) {
      google.maps.event.removeListener(this.listenerMapaFinalizarEdicao);
      this.listenerMapaFinalizarEdicao = null;
    }
    
    // Limpar pontas originais e protegidas
    this.pontasOriginais = { pontaA: null, pontaB: null };
    this.pontasProtegidas = { pontaA: false, pontaB: false };
    
    // Limpar path original
    this.pathOriginal = null;
    
    console.log('✅ [EDITAR-CABO] Edição cancelada e estado restaurado');
  }


  //********************************************************************************** */
  //liberar cabo do context MENU
  //********************************************************************************** */
  private async liberarCabo(): Promise<void> {
    console.log('🔴 [CONTEXT-MENU] Liberando cabo...', this.clickedCaboData);
    
    if (!this.clickedCaboData && !this.clickedPolyline) {
      console.warn('⚠️ [LIBERAR-CABO] Nenhum cabo selecionado');
      alert('Erro: Nenhum cabo selecionado.');
      return;
    }

    // Obter dados do cabo
    const idMetaCabo = this.clickedPolyline?.get('id_meta') || this.clickedCaboData?.id_meta;
    const capacidadeStr = this.clickedPolyline?.get('capacidade') || this.clickedCaboData?.capacidade;
    
    // Extrair capacidade numérica
    let capacidadeNum: number;
    if (typeof capacidadeStr === 'string') {
      const match = capacidadeStr.match(/(\d+)/);
      capacidadeNum = match ? parseInt(match[1], 10) : 12;
    } else if (typeof capacidadeStr === 'number') {
      capacidadeNum = capacidadeStr;
    } else {
      console.warn('⚠️ [LIBERAR-CABO] Capacidade não encontrada, usando fallback 12');
      capacidadeNum = 12;
    }

    if (!idMetaCabo) {
      console.error('❌ [LIBERAR-CABO] ID do cabo não encontrado');
      alert('Erro: Não foi possível obter o ID do cabo.');
      return;
    }

    // Obter coordenadas das pontas do cabo
    const path = this.clickedPolyline?.getPath();
    if (!path || path.getLength() < 2) {
      console.error('❌ [LIBERAR-CABO] Path do cabo inválido');
      alert('Erro: Não foi possível obter as coordenadas do cabo.');
      return;
    }

    const pontaA = path.getAt(0);
    const pontaB = path.getAt(path.getLength() - 1);

    // 🆕 NOVO: Identificar qual ponta foi clicada baseado na posição do clique
    let pontaCabo: 'A' | 'B' = 'A';
    
    if (this.ultimaCoordenadaClique) {
      // Usar a lógica de identificação baseada na distância acumulada
      pontaCabo = this.identificarPontaClicada(path, this.ultimaCoordenadaClique);
      console.log(`✅ [LIBERAR-CABO] Ponta identificada pelo clique: ${pontaCabo}`);
    } else {
      // Fallback: tentar pela ponta A primeiro
      console.warn('⚠️ [LIBERAR-CABO] Coordenada do clique não disponível, tentando ponta A primeiro');
    }

    // 🆕 NOVO: Buscar objeto conectado usando o serviço (substitui busca por proximidade)
    let objetoConectado: ObjetoConectado | null = null;
    
    try {
      objetoConectado = await firstValueFrom(
        this.buscaObjetoConexPontaService.buscarObjetoConectado(idMetaCabo, pontaCabo)
      );
    } catch (error) {
      console.error('❌ [LIBERAR-CABO] Erro ao buscar objeto conectado:', error);
    }

    // Validar se encontrou um objeto conectado suportado (CAIXA ou DIO) na ponta clicada
    if (!objetoConectado || (objetoConectado.tipo !== 'CAIXA' && objetoConectado.tipo !== 'DIO')) {
      console.error(`❌ [LIBERAR-CABO] Nenhum objeto conectado encontrado na ponta ${pontaCabo}`);
      alert(`A ponta ${pontaCabo} do cabo não esta conectada. Verifique se clicou próximo à conexão.`);
      return;
    }

    console.log(`✅ [LIBERAR-CABO] Objeto encontrado: ${objetoConectado.tipo} (ID: ${objetoConectado.idMeta}), Ponta: ${pontaCabo}`);

    // 🆕 Chamar método unificado de desconexão (suporta CAIXA e DIO)
    // A validação de bocas para CAIXA é feita internamente no serviço busca-objeto-conex-ponta.service.ts
    console.log('🔌 [LIBERAR-CABO] Enviando requisição de desconexão...');

    this.buscaObjetoConexPontaService.desconectarCabo(
      objetoConectado,
      idMetaCabo,
      pontaCabo,
      capacidadeNum
    ).subscribe({
      next: (response) => {
        console.log('✅ [LIBERAR-CABO] Desconexão realizada com sucesso:', response);
        
        if (response.ja_desconectado) {
          alert(`O cabo já estava desconectado. ${response.message}`);
        } else {
          alert(`Cabo desconectado com sucesso! ${response.message}`);

          if (objetoConectado.tipo === 'CAIXA') {
            const idUsuario = this.authService.getIdUser();
            const idCity = this.authService.getIdCity();
            const caixaEncontrada = [
              ...this.destino,
              ...this.destinoCTO,
              ...this.destinoCTOSP
            ].find(c => c.id_meta === objetoConectado.idMeta);
            const numeroCaixa = caixaEncontrada?.numero || 'N/A';

            if (idUsuario && idCity && objetoConectado.idMeta) {
              console.log('🔄 Inserindo log de desconexão de cabo na caixa...');
              this.insertLogService.inserirLog({
                id_usuario: idUsuario,
                id_evento: 32,
                id_city: idCity,
                id_meta_objeto: objetoConectado.idMeta,
                descricao: `Desconexão de cabo : Ponta ${pontaCabo}, Caixa ${numeroCaixa}, Boca ${objetoConectado.numeroConexao}, ID Cabo: ${idMetaCabo}`,
                VERSION: 'Fiberworks WEB 1.0.0'
              }).subscribe({
                next: (logResponse) => {
                  console.log('✅ Log de desconexão de cabo na caixa inserido com sucesso:', logResponse);
                },
                error: (error) => {
                  console.error('❌ Erro ao inserir log de desconexão de cabo na caixa:', error);
                }
              });
            }
          }
          
          // Recarregar o mapa ou atualizar as conexões
          // Você pode adicionar lógica aqui para atualizar o mapa
        }
      },
      error: (error) => {
        console.error('❌ [LIBERAR-CABO] Erro ao desconectar:', error);
        alert(`Erro ao desconectar o cabo: ${error}`);
      }
    });
  }

  private excluirCabo(): void {
    console.log('🔴 [CONTEXT-MENU] Excluindo cabo...', this.clickedCaboData);
    
    if (!this.clickedCaboData) {
      console.warn('⚠️ [EXCLUI-CABO] Nenhum cabo selecionado');
      return;
    }

    // Obter dados do cabo
    const idMeta = this.clickedPolyline?.get('id_meta') || this.clickedCaboData.id_meta;
    const idCity = this.authService.getIdCity();
    
    if (!idMeta) {
      alert('Erro: ID do cabo não encontrado');
      return;
    }

    if (!idCity) {
      alert('Erro: ID da cidade não encontrado');
      return;
    }

    // id_condominio padrão é 0 (fora de condomínio)
    const idCondominio = this.clickedCaboData.id_condominio || 0;

    // Confirmação antes de excluir
    const confirmacao = confirm(`Tem certeza que deseja excluir este cabo?\n\n🆔 ID: ${idMeta}`);
    
    if (!confirmacao) {
      return;
    }

    // Preparar requisição
    const request = {
      id_meta: idMeta,
      id_city: idCity,
      id_condominio: idCondominio
    };

    // Fazer a requisição usando o serviço
    this.excluiCaboService.excluirCabo(request).subscribe({
      next: (response) => {
        console.log('✅ [EXCLUI-CABO] Resposta da API:', response);
        
        if (response.success) {
          console.log('🗑️ [EXCLUI-CABO] Iniciando remoção da polyline do mapa...');
          console.log('🗑️ [EXCLUI-CABO] clickedPolyline existe?', !!this.clickedPolyline);
          console.log('🗑️ [EXCLUI-CABO] id_meta:', idMeta);
          
          // Se clickedPolyline estiver null, buscar pelos arrays usando id_meta
          let polylineParaRemover = this.clickedPolyline;
          
          if (!polylineParaRemover) {
            console.log('🔍 [EXCLUI-CABO] clickedPolyline é null, buscando pelos arrays...');
            polylineParaRemover = this.buscarPolylinePorIdMeta(idMeta);
            console.log('🔍 [EXCLUI-CABO] Polyline encontrada?', !!polylineParaRemover);
          }
          
          // Remover a polyline do mapa
          if (polylineParaRemover) {
            console.log('🗑️ [EXCLUI-CABO] Chamando setMap(null)...');
            polylineParaRemover.setMap(null);
            console.log('🗑️ [EXCLUI-CABO] setMap(null) executado');
            
            // Verificar se ainda está no mapa
            const map = polylineParaRemover.getMap();
            console.log('🗑️ [EXCLUI-CABO] Polyline ainda está no mapa?', map !== null);
            
            // Remover também dos arrays de polylines
            this.removerPolylineDosArrays(polylineParaRemover);
          } else {
            console.warn('⚠️ [EXCLUI-CABO] Não foi possível encontrar a polyline para remover!');
          }

          // Limpar dados do cabo
          this.clickedPolyline = null;
          this.clickedCaboData = null;
          
          // Fechar context menu
          this.hideContextMenu();

      // Inserir log de exclusao de cabo com id_evento 19
      const idUsuario = this.authService.getIdUser();
      const idCity = this.authService.getIdCity();
      if (idUsuario && idCity) {
        console.log('🔄 Inserindo log de exclusão de cabo...');
        this.insertLogService.inserirLog({
          id_usuario: idUsuario,
          id_evento: 19,
          id_city: idCity,
          id_meta_objeto: request.id_meta,
          descricao: `Exclusão de Cabo: ${request.id_meta} `,
          VERSION: 'Fiberworks WEB 1.0.0'
        }).subscribe({
        next: (logResponse) => {
          console.log('✅ Log de move de caixa:', logResponse);
        },
        error: (error) => {
          console.error('❌ Erro ao inserir log exclusao de cabo:', error);
        }
      });
      }




          
          //alert(`✅ Cabo excluído com sucesso!\n\n🆔 ID: ${idMeta}`);
        } else {
          alert(`❌ Erro ao excluir cabo: ${response.error || 'Erro desconhecido'}`);
        }
      },
      error: (error: string) => {
        console.error('❌ [EXCLUI-CABO] Erro na requisição:', error);
        
        // Verificar se é erro de cabo conectado
        if (error.includes('Cabo Conectado') || error.includes('conectado')) {
          alert(`⚠️ ${error}`);
        } else {
          alert(`❌ Erro ao excluir cabo: ${error}`);
        }
      }
    });
  }

  /**
   * 🔍 Busca uma polyline pelos arrays usando id_meta
   */
  private buscarPolylinePorIdMeta(idMeta: number): google.maps.Polyline | null {
    const arrays = [
      this.polylines1f, this.polylines2f, this.polylines4f, 
      this.polylines6f, this.polylines8f, this.polylines12f,
      this.polylines24f, this.polylines36f, this.polylines48f,
      this.polylines72f, this.polylines144f
    ];

    for (const array of arrays) {
      const polyline = array.find((p: google.maps.Polyline) => {
        const polylineIdMeta = p.get('id_meta');
        return polylineIdMeta === idMeta;
      });
      
      if (polyline) {
        console.log('✅ [EXCLUI-CABO] Polyline encontrada no array');
        return polyline;
      }
    }
    
    console.warn('⚠️ [EXCLUI-CABO] Polyline não encontrada em nenhum array');
    return null;
  }
 //====================================================================================================================== 
// inserido na implementação visualização de camadas ====================================================================
  private getAllCaboPolylineArrays(): google.maps.Polyline[][] {
    return [
      this.polylines1f,
      this.polylines2f,
      this.polylines4f,
      this.polylines6f,
      this.polylines8f,
      this.polylines12f,
      this.polylines24f,
      this.polylines36f,
      this.polylines48f,
      this.polylines72f,
      this.polylines144f,
    ];
  }

  private updateVisibleCabos(): void {
    const mapRef = this.layerVisibilityService.isVisible('cabos') ? this.map : null;
    for (const arr of this.getAllCaboPolylineArrays()) {
      arr.forEach((polyline) => polyline.setMap(mapRef ?? null));
    }
  }

  private updateVisiblePoligonos(): void {
    const mapRef = this.layerVisibilityService.isVisible('poligonos') ? this.map : null;
    for (const p of [...this.poligonosMapa, ...this.poligonosMapaLocais]) {
      p.setMap(mapRef ?? null);
    }
    this.refreshPoligonosLabelMarkersVisibility();
  }

  private recriarCabosSeLayerAtiva(): void {
    if (!this.layerVisibilityService.isVisible('cabos')) {
      return;
    }

    if (this.destinoCabos1f?.length) {
      this.updatePolylinesCabos1f();
      this.createCabo1fPolylines();
    }
    if (this.destinoCabos2f?.length) {
      this.updatePolylinesCabos2f();
      this.createCabo2fPolylines();
    }
    if (this.destinoCabos4f?.length) {
      this.updatePolylinesCabos4f();
      this.createCabo4fPolylines();
    }
    if (this.destinoCabos6f?.length) {
      this.updatePolylinesCabos6f();
      this.createCabo6fPolylines();
    }
    if (this.destinoCabos8f?.length) {
      this.updatePolylinesCabos8f();
      this.createCabo8fPolylines();
    }
    if (this.destinoCabos12f?.length) {
      this.updatePolylinesCabos12f();
      this.createCabo12fPolylines();
    }
    if (this.destinoCabos24f?.length) {
      this.updatePolylinesCabos24f();
      this.createCabo24fPolylines();
    }
    if (this.destinoCabos36f?.length) {
      this.updatePolylinesCabos36f();
      this.createCabo36fPolylines();
    }
    if (this.destinoCabos48f?.length) {
      this.updatePolylinesCabos48f();
      this.createCabo48fPolylines();
    }
    if (this.destinoCabos72f?.length) {
      this.updatePolylinesCabos72f();
      this.createCabo72fPolylines();
    }
    if (this.destinoCabos144f?.length) {
      this.updatePolylinesCabos144f();
      this.createCabo144fPolylines();
    }
  } //até aqui inserido na implementação visualização de camadas ====================================================================
    //=======================================================================================================================
  
    /**
   * 🗑️ Remove a polyline dos arrays de controle
   */
  private removerPolylineDosArrays(polyline: google.maps.Polyline): void {
    const arrays = [
      this.polylines1f, this.polylines2f, this.polylines4f, 
      this.polylines6f, this.polylines8f, this.polylines12f,
      this.polylines24f, this.polylines36f, this.polylines48f,
      this.polylines72f, this.polylines144f
    ];

    for (const array of arrays) {
      const index = array.indexOf(polyline);
      if (index > -1) {
        array.splice(index, 1);
        console.log('🗑️ [EXCLUI-CABO] Polyline removida do array');
        break;
      }
    }
  }

  /*********************************************************************************************************************
   * 🗺️ NOVO: Configura listeners para eventos de destaque de cabos
   */
  private setupCabosHighlightListeners(): void {
    // Listener para destacar cabos
    window.addEventListener('highlightCabos', (event: Event) => {
      const customEvent = event as CustomEvent;
      const cabosPercorridos = customEvent.detail.cabosPercorridos;
      console.log('🗺️ [LISTENER] Evento highlightCabos recebido:', cabosPercorridos);
      this.highlightCabos(cabosPercorridos);
    });

    // Listener para destacar cabos com capacidade (otimizado)
    window.addEventListener('highlightCabosComCapacidade', (event: Event) => {
      const customEvent = event as CustomEvent;
      const { cabosInfo, splittersInfo = [] } = customEvent.detail;
      console.log('🗺️ [LISTENER] Evento highlightCabosComCapacidade recebido:', cabosInfo, splittersInfo);
      this.highlightCabosComCapacidade(cabosInfo, splittersInfo);
    });

    // Listener para limpar destaque
    window.addEventListener('clearCabosHighlight', () => {
      console.log('🗺️ [LISTENER] Evento clearCabosHighlight recebido');
      this.clearCabosHighlight();
    });
  }

  // 🏠 NOVO: Configurar listener para abrir GoJS modal a partir do GraphViz
  private setupGoJSModalListener(): void {
    window.addEventListener('openGoJSModal', (event: Event) => {
      const customEvent = event as CustomEvent;
      const { idmeta, numerocx, label_cx } = customEvent.detail;
      
      console.log('🗺️ [GOOGLE-MAPS] Recebendo solicitação para abrir GoJS modal:', { idmeta, numerocx, label_cx });
      
      // Salvar idmeta no storage (igual ao clique no mapa)
      this.authService.setIDmetaCaixa(idmeta);
      
      // 🚀 CORREÇÃO: Usar MatDialog
      this.openGoJSModal();
      
      console.log('🗺️ [GOOGLE-MAPS] GoJS modal aberto com idmeta:', idmeta);
    });
  }

  /**
   * 🗺️ NOVO: Destaca cabos no mapa baseado nas informações de capacidade (otimizado)
   */
  private highlightCabosComCapacidade(
    cabosInfo: Array<{ id: number; capacidade: string; fibra?: number }>,
    splittersInfo: Array<{
      idMetaSplitter: number;
      idMetaCaixa: number;
      saida: number;
      acoplamento: string;
      tipoSplitter: number;
      lat: number;
      lng: number;
      numeroCaixa?: string;
    }> = [],
  ): void {
    console.log('🗺️ [HIGHLIGHT-OTIMIZADO] ===== INICIANDO DESTAQUE =====');
    console.log('🗺️ [HIGHLIGHT-OTIMIZADO] Cabos para destacar:', cabosInfo);
    console.log('🗺️ [HIGHLIGHT-OTIMIZADO] Estado ANTES da limpeza - highlightedPolylines:', this.highlightedPolylines.length);
    
    // 🗺️ CORREÇÃO: Limpar destaque anterior ANTES de destacar novos cabos
    this.clearCabosHighlight();
    
    console.log('🗺️ [HIGHLIGHT-OTIMIZADO] Estado APÓS a limpeza - highlightedPolylines:', this.highlightedPolylines.length);
    
    // Agrupar cabos por capacidade (preservando fibra quando disponível)
    const cabosPorCapacidade = new Map<string, Array<{ id: number; fibra?: number }>>();
    cabosInfo.forEach(cabo => {
      if (!cabosPorCapacidade.has(cabo.capacidade)) {
        cabosPorCapacidade.set(cabo.capacidade, []);
      }
      cabosPorCapacidade.get(cabo.capacidade)!.push({ id: cabo.id, fibra: cabo.fibra });
    });
    
    console.log('🗺️ [HIGHLIGHT-OTIMIZADO] Cabos agrupados por capacidade:', cabosPorCapacidade);
    
    // Destacar apenas nos arrays correspondentes à capacidade
    cabosPorCapacidade.forEach((entries, capacidade) => {
      console.log(`🗺️ [HIGHLIGHT-OTIMIZADO] Processando capacidade ${capacidade} com ${entries.length} cabos`);
      
      switch (capacidade) {
        case '1':
        case '1f':
          this.highlightCabosInArray(this.polylines1f, entries, this.destinoCabos1f);
          break;
        case '2':
        case '2f':
          this.highlightCabosInArray(this.polylines2f, entries, this.destinoCabos2f);
          break;
        case '4':
        case '4f':
          this.highlightCabosInArray(this.polylines4f, entries, this.destinoCabos4f);
          break;
        case '6':
        case '6f':
          this.highlightCabosInArray(this.polylines6f, entries, this.destinoCabos6f);
          break;
        case '8':
        case '8f':
          this.highlightCabosInArray(this.polylines8f, entries, this.destinoCabos8f);
          break;
        case '12':
        case '12f':
          this.highlightCabosInArray(this.polylines12f, entries, this.destinoCabos12f);
          break;
        case '24':
        case '24f':
          this.highlightCabosInArray(this.polylines24f, entries, this.destinoCabos24f);
          break;
        case '36':
        case '36f':
          this.highlightCabosInArray(this.polylines36f, entries, this.destinoCabos36f);
          break;
        case '48':
        case '48f':
          this.highlightCabosInArray(this.polylines48f, entries, this.destinoCabos48f);
          break;
        case '72':
        case '72f':
          this.highlightCabosInArray(this.polylines72f, entries, this.destinoCabos72f);
          break;
        case '144':
        case '144f':
          this.highlightCabosInArray(this.polylines144f, entries, this.destinoCabos144f);
          break;
        default:
          console.warn(`🗺️ [HIGHLIGHT-OTIMIZADO] Capacidade desconhecida: ${capacidade}`);
          this.highlightCabosInAllArrays(entries);
      }
    });
    
    console.log('🗺️ [HIGHLIGHT-OTIMIZADO] Destaque otimizado concluído. Total de polylines destacadas:', this.highlightedPolylines.length);
    this.highlightTraceSplitters(splittersInfo);
  }

  /**
   * 🗺️ NOVO: Destaca cabos no mapa baseado nos IDs fornecidos (método original)
   */
  private highlightCabos(cabosPercorridos: number[]): void {
    console.log('🗺️ [HIGHLIGHT] Destacando cabos:', cabosPercorridos);
    
    // Limpar destaque anterior
    this.clearCabosHighlight();

    const entries = cabosPercorridos.map(id => ({ id }));
    this.highlightCabosInAllArrays(entries);
    
    console.log('🗺️ [HIGHLIGHT] Destaque concluído. Total de polylines destacadas:', this.highlightedPolylines.length);
  }

  private highlightCabosInAllArrays(caboEntries: Array<{ id: number; fibra?: number }>): void {
    console.log(`🗺️ [HIGHLIGHT] Verificando array 1f (${this.polylines1f.length} polylines, ${this.destinoCabos1f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines1f, caboEntries, this.destinoCabos1f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 2f (${this.polylines2f.length} polylines, ${this.destinoCabos2f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines2f, caboEntries, this.destinoCabos2f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 4f (${this.polylines4f.length} polylines, ${this.destinoCabos4f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines4f, caboEntries, this.destinoCabos4f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 6f (${this.polylines6f.length} polylines, ${this.destinoCabos6f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines6f, caboEntries, this.destinoCabos6f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 8f (${this.polylines8f.length} polylines, ${this.destinoCabos8f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines8f, caboEntries, this.destinoCabos8f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 12f (${this.polylines12f.length} polylines, ${this.destinoCabos12f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines12f, caboEntries, this.destinoCabos12f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 24f (${this.polylines24f.length} polylines, ${this.destinoCabos24f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines24f, caboEntries, this.destinoCabos24f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 36f (${this.polylines36f.length} polylines, ${this.destinoCabos36f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines36f, caboEntries, this.destinoCabos36f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 48f (${this.polylines48f.length} polylines, ${this.destinoCabos48f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines48f, caboEntries, this.destinoCabos48f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 72f (${this.polylines72f.length} polylines, ${this.destinoCabos72f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines72f, caboEntries, this.destinoCabos72f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 144f (${this.polylines144f.length} polylines, ${this.destinoCabos144f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines144f, caboEntries, this.destinoCabos144f);
  }

  /**
   * 🗺️ NOVO: Destaca cabos em um array específico de polylines (OTIMIZADO)
   */
  private highlightCabosInArray(
    polylines: google.maps.Polyline[],
    caboEntries: Array<{ id: number; fibra?: number }>,
    cabos: any[]
  ): void {
    if (!polylines) return;

    const caboIds = caboEntries.map(entry => entry.id);
    const fibraById = new Map<number, number>();
    caboEntries.forEach(entry => {
      if (entry.fibra != null) {
        fibraById.set(entry.id, entry.fibra);
      }
    });
    
    console.log(`🗺️ [HIGHLIGHT-OTIMIZADO] Verificando ${polylines.length} polylines`);
    console.log(`🗺️ [HIGHLIGHT-OTIMIZADO] Cabos procurados: [${caboIds.join(', ')}]`);
    
    // 🗺️ OTIMIZAÇÃO: Buscar diretamente nas polylines por propriedade
    polylines.forEach((polyline, index) => {
      const idMeta = polyline.get('id_meta');
      const capacidade = polyline.get('capacidade');
      const tipo = polyline.get('tipo');
      
      console.log(`🗺️ [HIGHLIGHT-OTIMIZADO] Polyline ${index}: ID=${idMeta}, Capacidade=${capacidade}, Tipo=${tipo}`);
      
      if (idMeta && caboIds.includes(idMeta)) {
        console.log(`🗺️ [HIGHLIGHT-OTIMIZADO] ✅ MATCH! Destacando cabo ${idMeta} (índice ${index})`);
        
        // 🗺️ OTIMIZAÇÃO: Usar dados da própria polyline para opções originais
        const caboData = polyline.get('cabo_data');
        const originalOptions = caboData ? this.getOriginalPolylineOptions(caboData) : this.getDefaultPolylineOptions(capacidade);
        this.originalPolylineOptions.set(polyline, originalOptions);
        
        // Aplicar destaque (amarelo, mais espesso, z-index alto)
        polyline.setOptions({
          strokeColor: 'yellow',
          strokeWeight: 8,
          strokeOpacity: 0.9,
          zIndex: 1000
        });

        const fibra = fibraById.get(idMeta);
        if (fibra != null) {
          this.addTraceHighlightLabel(polyline, idMeta, fibra);
        }
        
        // Adicionar à lista de destacados
        console.log(`🗺️ [HIGHLIGHT-OTIMIZADO] Adicionando polyline ${idMeta} à lista de destacados`);
        console.log(`🗺️ [HIGHLIGHT-OTIMIZADO] Polyline já existe na lista?`, this.highlightedPolylines.includes(polyline));
        
        if (!this.highlightedPolylines.includes(polyline)) {
          this.highlightedPolylines.push(polyline);
          console.log(`🗺️ [HIGHLIGHT-OTIMIZADO] ✅ Polyline adicionada. Total: ${this.highlightedPolylines.length}`);
        } else {
          console.warn(`🗺️ [HIGHLIGHT-OTIMIZADO] ⚠️ Polyline ${idMeta} já existe na lista! Pulando...`);
        }
      }
    });
  }

   // COLOCAM PONTOS nos tracers do cabo, triangulos nos splitters e labels
  // utilizado no tracer map para highligth do tracer colocando ponto
  private getPolylineMidpoint(path: google.maps.MVCArray<google.maps.LatLng>): google.maps.LatLng | null {
    if (!path || path.getLength() === 0) {
      return null;
    }
    if (path.getLength() === 1) {
      return path.getAt(0);
    }

    let totalLength = 0;
    const segments: Array<{ start: google.maps.LatLng; end: google.maps.LatLng; length: number }> = [];

    for (let i = 0; i < path.getLength() - 1; i++) {
      const start = path.getAt(i);
      const end = path.getAt(i + 1);
      const length = google.maps.geometry.spherical.computeDistanceBetween(start, end);
      segments.push({ start, end, length });
      totalLength += length;
    }

    if (totalLength === 0) {
      return path.getAt(0);
    }

    let remaining = totalLength / 2;
    for (const segment of segments) {
      if (remaining <= segment.length) {
        const fraction = remaining / segment.length;
        return google.maps.geometry.spherical.interpolate(segment.start, segment.end, fraction);
      }
      remaining -= segment.length;
    }

    return path.getAt(path.getLength() - 1);
  }

  // utilizado no tracer map para highligth do tracer
  private addTraceHighlightLabel(polyline: google.maps.Polyline, idMeta: number, fibra: number): void {
    if (!this.map) {
      return;
    }

    const path = polyline.getPath();
    const position = this.getPolylineMidpoint(path);
    if (!position) {
      return;
    }

    const marker = new google.maps.Marker({
      position,
      map: this.map,
      clickable: false,
      zIndex: google.maps.Marker.MAX_ZINDEX + 2,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#2563eb',
        fillOpacity: 0.30,
        strokeColor: '#1d4ed8',
        strokeOpacity: 0.60,
        scale: 8,
        labelOrigin: new google.maps.Point(0, 2),
      },
      label: {
        text: `Tracer cabo: fibra ${fibra}`,
        color: '#2563eb',
        fontSize: '17px',
        fontWeight: 'bold',
      } as google.maps.MarkerLabel,
    });

    this.highlightedTraceLabelMarkers.push(marker);
  }

  private highlightTraceSplitters(
    splittersInfo: Array<{
      idMetaSplitter: number;
      idMetaCaixa: number;
      saida: number;
      acoplamento: string;
      tipoSplitter: number;
      lat: number;
      lng: number;
      numeroCaixa?: string;
    }>,
  ): void {
    if (!this.map || !splittersInfo?.length) {
      return;
    }

    splittersInfo.forEach((splitter) => {
      if (!Number.isFinite(splitter.lat) || !Number.isFinite(splitter.lng)) {
        console.warn(
          `🗺️ [SPLITTER-HIGHLIGHT] Coordenadas inválidas para splitter ${splitter.idMetaSplitter} S${splitter.saida}`,
        );
        return;
      }

      const marker = new google.maps.Marker({
        position: { lat: splitter.lat, lng: splitter.lng },
        map: this.map,
        clickable: false,
        zIndex: google.maps.Marker.MAX_ZINDEX + 3,
        icon: {
          path: 'M 0,-1 1,1 -1,1 z',
          fillColor: '#2563eb',
          fillOpacity: 0.45,
          strokeColor: '#1d4ed8',
          strokeOpacity: 1,
          strokeWeight: 1,
          scale: 15,
          labelOrigin: new google.maps.Point(0, 2),
        },
        label: {
          text: `Splitter ${splitter.acoplamento} - Saída:${splitter.saida} `,
          color: '#2563eb',
          fontSize: '15px',
          fontWeight: 'bold',
        } as google.maps.MarkerLabel,
      });

      this.highlightedTraceSplitterMarkers.push(marker);
    });
  } // utilizado no tracer map para highligth do tracer colocando ponto até aqui

  /**
   * 🗺️ NOVO: Retorna opções padrão baseadas na capacidade
   */
  private getDefaultPolylineOptions(capacidade: string): google.maps.PolylineOptions {
    switch (capacidade) {
      case '1f': return this.polylineOptions1f;
      case '2f': return this.polylineOptions2f;
      case '4f': return this.polylineOptions4f;
      case '6f': return this.polylineOptions6f;
      case '8f': return this.polylineOptions8f;
      case '12f': return this.polylineOptions12f;
      case '24f': return this.polylineOptions24f;
      case '36f': return this.polylineOptions36f;
      case '48f': return this.polylineOptions48f;
      case '72f': return this.polylineOptions72f;
      case '144f': return this.polylineOptions144f;
      default: return this.polylineOptions1f; // Fallback
    }
  }

  /**
   * 🗺️ NOVO: Retorna opções originais baseadas no tipo de cabo
   */
  private getOriginalPolylineOptions(cabo: any): google.maps.PolylineOptions {
    // Determinar tipo de cabo baseado no array de origem
    if (this.destinoCabos1f?.includes(cabo)) return this.polylineOptions1f;
    if (this.destinoCabos2f?.includes(cabo)) return this.polylineOptions2f;
    if (this.destinoCabos4f?.includes(cabo)) return this.polylineOptions4f;
    if (this.destinoCabos6f?.includes(cabo)) return this.polylineOptions6f;
    if (this.destinoCabos8f?.includes(cabo)) return this.polylineOptions8f;
    if (this.destinoCabos12f?.includes(cabo)) return this.polylineOptions12f;
    if (this.destinoCabos24f?.includes(cabo)) return this.polylineOptions24f;
    if (this.destinoCabos36f?.includes(cabo)) return this.polylineOptions36f;
    if (this.destinoCabos48f?.includes(cabo)) return this.polylineOptions48f;
    if (this.destinoCabos72f?.includes(cabo)) return this.polylineOptions72f;
    if (this.destinoCabos144f?.includes(cabo)) return this.polylineOptions144f;
    
    // 2026_03_09Fallback: usar capacidade do cabo (ex.: trecho novo após dividir não está em destinoCabos por referência)
    return this.getDefaultPolylineOptions(cabo?.capacidade || '12f');
  }

  /**
   * 🗺️ NOVO: Limpa destaque de todos os cabos
   */
  public clearCabosHighlight(): void {
    console.log('🗺️ [CLEAR] ===== INICIANDO LIMPEZA =====');
    console.log('🗺️ [CLEAR] Polylines destacadas antes da limpeza:', this.highlightedPolylines.length);
    console.log('🗺️ [CLEAR] Opções originais armazenadas:', this.originalPolylineOptions.size);
    
    this.highlightedPolylines.forEach((polyline, index) => {
      console.log(`🗺️ [CLEAR] Processando polyline ${index}:`, polyline);
      const originalOptions = this.originalPolylineOptions.get(polyline);
      if (originalOptions) {
        console.log(`🗺️ [CLEAR] Restaurando opções originais para polyline ${index}:`, originalOptions);
        polyline.setOptions(originalOptions);
      } else {
        console.warn(`🗺️ [CLEAR] ⚠️ Nenhuma opção original encontrada para polyline ${index}`);
      }
    });
    
    console.log('🗺️ [CLEAR] Limpando arrays...');
    this.highlightedPolylines = [];
    this.originalPolylineOptions.clear();

    this.highlightedTraceLabelMarkers.forEach(marker => marker.setMap(null));
    this.highlightedTraceLabelMarkers = [];

    this.highlightedTraceSplitterMarkers.forEach(marker => marker.setMap(null));
    this.highlightedTraceSplitterMarkers = [];
    
    console.log('🗺️ [CLEAR] Arrays limpos - highlightedPolylines:', this.highlightedPolylines.length, 'originalPolylineOptions:', this.originalPolylineOptions.size);
    console.log('🗺️ [CLEAR] ===== LIMPEZA CONCLUÍDA =====');
  }

  // InfoWindows para marcadores (caixas e CTOs)
  currentMarkerInfoWindow: google.maps.InfoWindow | null = null;

  
  // Propriedades que estavam faltando
  isMapFullyInitialized: boolean = false;
  isInfoWindowsSetup: boolean = false;


private ZOOM_LEVEL_CAIXAS = 15; // Caixas CEO visíveis em zoom >= 14
private ZOOM_LEVEL_CTOS = 16;   // CTOs visíveis em zoom >= 16
private ZOOM_LEVEL_CTOSSP = 16;   // CTOs visíveis em zoom >= 16
private ZOOM_LEVEL_POPS = 14;   // pops visíveis em zoom >= 13
private ZOOM_LEVEL_CLIENTES = 18;   // pops visíveis em zoom >= 18
private ZOOM_LEVEL_CLIENTES_DISABLES = 19;   // pops visíveis em zoom >= 19
private ZOOM_LEVEL_CLIENTES_ATIVOS = 17;   // pops visíveis em zoom >= 17
private ZOOM_LEVEL_CONDOMINIOS = 17;   // CTOs visíveis em zoom >= 17
private ZOOM_LEVEL_DIOS = 18;   // DIOS visíveis em zoom >= 117
private ZOOM_LEVEL_ANOTACOES = 18;   // DIOS visíveis em zoom >= 117
private ZOOM_LEVEL_POSTES_AP = 18;
private ZOOM_LEVEL_POSTES_CONCESSIONARIA = 18;
private readonly MAX_EXTENT_LAT_POSTES_CONCESSIONARIA = 0.05;
private readonly MAX_EXTENT_LNG_POSTES_CONCESSIONARIA = 0.05;
private ZOOM_LEVEL_SEGMENTOS = 15;

private destroy$ = new Subject<void>();


private map?: (google.maps.Map);
  isMapReady: any;

 

 currentZoom: number = 18;



 // **********************************************************************************************inserido
 private boundsChangeTimeout: any;
 private allCaixas: Caixa[] = [];
 private allCTOs: Cto[] = [];

 // Propriedade para controlar o limiar de densidade
 private MAX_VISIBLE_MARKERS_CEO = 200; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_CTO = 150; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_CTOSP = 150; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_CLIENTES = 100; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_CLIENTES_DISABLES = 100; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_CLIENTES_ATIVOS = 100; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_POPs = 30; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_CONDOMINIOS = 100; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_DIOS = 100; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_ANOTACOES = 100; // Ajuste este valor conforme necessário
 private MAX_VISIBLE_MARKERS_POSTES_AP = 200;
 private MAX_VISIBLE_MARKERS_POSTES_CONCESSIONARIA = 3000;
 private MAX_VISIBLE_MARKERS_SEGMENTOS = 200;
 
// **********************************************************************************************inserido

  polylineOptions1f: google.maps.PolylineOptions = {
    strokeColor: 'blue',
    strokeOpacity: 0.45,
    strokeWeight: 3,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false,
  }

  polylineOptions2f: google.maps.PolylineOptions = {
    strokeColor: ' #00FFFF ',
    strokeOpacity: 0.7,
    strokeWeight: 3,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false,
  }

  polylineOptions4f: google.maps.PolylineOptions = {
    strokeColor: 'rgb(41, 161, 216) ',
    strokeOpacity: 0.7,
    strokeWeight: 3,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false,
  }


  polylineOptions6f: google.maps.PolylineOptions = {
    strokeColor: 'black',
    strokeOpacity: 0.7,
    strokeWeight: 3,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false

     

  }

  polylineOptions8f: google.maps.PolylineOptions = {
    strokeColor: 'blue',
    strokeOpacity: 0.8,
    strokeWeight: 3,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false

  }

  polylineOptions12f: google.maps.PolylineOptions = {
    strokeColor: 'green',
    strokeOpacity: 0.8,
    strokeWeight: 3.5,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false

  }

    polylineOptions24f: google.maps.PolylineOptions = {
      strokeColor: 'violet',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      clickable: true,
      visible: true,
      zIndex: 1,
      draggable: false,
      editable: false

     


  }

  polylineOptions36f: google.maps.PolylineOptions = {
    strokeColor: 'blue',
    strokeOpacity: 0.8,
    strokeWeight: 4.5,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false

   


}

polylineOptions48f: google.maps.PolylineOptions = {
  strokeColor: 'red',
  strokeOpacity: 0.8,
  strokeWeight: 5,
  clickable: true,
  visible: true,
  zIndex: 1,
  draggable: false,
  editable: false
 

}

polylineOptions72f: google.maps.PolylineOptions = {
  strokeColor: 'purple',
  strokeOpacity: 0.8,
  strokeWeight: 5.5,
  clickable: true,
  visible: true,
  zIndex: 1,
  draggable: false,
  editable: false

  


}


polylineOptions144f: google.maps.PolylineOptions = {
  strokeColor: ' #FFAE42 ',
  strokeOpacity: 0.8,
  strokeWeight: 6,
  clickable: true,
  visible: true,
  zIndex: 1,
  draggable: false,
  editable: false

  


}


// Novo array para controlar os InfoWindows dos cabos
  caboInfoWindows: Array<{
    map: google.maps.Map | undefined;
    position: google.maps.LatLngLiteral;
    title: string;
    content: string;
    caboId: string;
    caboType: string;
    isVisible: boolean;
    zoomThreshold: number;
    currentZoom: number;
  }> = [];

  



  ngAfterViewInit(): void {
    // Método vazio - pode ser usado no futuro se necessário
  }

  ngOnInit() {
    console.log('GoogleMapsComponent initialized');
    
    this.checkGoogleMapsAPI();
    this.checkForGPSLocation();
    // Removido setupMapClickListener() daqui - será chamado em onMapInitialized()
    
    // 🗺️ NOVO: Escutar eventos de destaque de cabos
    this.setupCabosHighlightListeners();
    
    // 🏠 NOVO: Escutar eventos para abrir GoJS modal a partir do GraphViz
    this.setupGoJSModalListener();
    
    // 🗺️ NOVO: Listener para exportar KML a partir da toolbar
    window.addEventListener('exportKML', () => {
      console.log('🗺️ [GOOGLE-MAPS] Recebendo evento de exportar KML da toolbar');
      this.exportMapToKML();
    });

    window.addEventListener('reloadMapCaixas', () => {
      console.log(
        '🗺️ [GOOGLE-MAPS] Recarga de caixas/CTOs solicitada (listas reconsultam API; ngOnChanges atualiza marcadores).',
      );
    });

    window.addEventListener('reloadMapCabos', () => {
      console.log(
        '🗺️ [GOOGLE-MAPS] Recarga de cabos solicitada (listas por capacidade reconsultam API).',
      );
    });

    window.addEventListener('openMapReport', () => {// para relatorio geral do mapa
      console.log('📊 [GOOGLE-MAPS] Recebendo evento de relatório geral da toolbar');
      this.abrirDashboardMapa();
    });

    // 🗺️ NOVO: Listeners para desenho de cabo
    window.addEventListener('startDesenhoCabo', () => {
      console.log('🗺️ [GOOGLE-MAPS] Iniciando desenho de cabo');
      this.startDesenhoCabo();
    });

    window.addEventListener('finalizarDesenhoCabo', () => {
      console.log('🗺️ [GOOGLE-MAPS] Finalizando desenho de cabo');
      this.finalizarDesenhoCabo();
    });

    window.addEventListener('cancelarDesenhoCabo', () => {
      console.log('🗺️ [GOOGLE-MAPS] Cancelando desenho de cabo');
      this.cancelarDesenhoCabo();
    });

    window.addEventListener('startDesenhoPoligono', () => {
      console.log('🗺️ [GOOGLE-MAPS] Iniciando desenho de polígono');
      this.startDesenhoPoligono();
    });

    window.addEventListener('finalizarDesenhoPoligono', () => {
      console.log('🗺️ [GOOGLE-MAPS] Finalizando desenho de polígono');
      this.finalizarDesenhoPoligono();
    });

    window.addEventListener('cancelarDesenhoPoligono', () => {
      console.log('🗺️ [GOOGLE-MAPS] Cancelando desenho de polígono');
      this.cancelarDesenhoPoligono();
    });

    // 📏 NOVO: Listeners para medição de distância (régua)
    window.addEventListener('startModoMedicao', () => {
      console.log('📏 [GOOGLE-MAPS] Ativando modo de medição');
      this.ativarModoMedicao();
    });

    window.addEventListener('stopModoMedicao', () => {
      console.log('📏 [GOOGLE-MAPS] Desativando modo de medição');
      this.desativarModoMedicao();
    });

    window.addEventListener('startModoEdicaoPoligono', () => {
      console.log('🔷 [GOOGLE-MAPS] Ativando modo de edição de polígonos (duplo clique)');
      this.ativarModoEdicaoPoligonoDoToolbar();
    });

    window.addEventListener('stopModoEdicaoPoligono', (ev: Event) => {
      const ce = ev as CustomEvent<{ salvarGeometria?: boolean }>;
      const salvarGeometria = ce.detail?.salvarGeometria === true;
      console.log('🔷 [GOOGLE-MAPS] Desativando modo de edição de polígonos', {
        salvarGeometria,
      });
      this.desativarModoEdicaoPoligonoCompleto({
        salvarGeometriaSePoligonoEmEdicao: salvarGeometria,
      });
    });
    
    
    this.layerVisibilityService.layersChanged$.pipe(takeUntil(this.destroy$)).subscribe((layers) => {
      if (layers.poligonos && this.poligonosMapa.length === 0 && this.destinoPoligonos?.length) {
        this.updatePoligonos();
      }
      if (layers.ceo && this.markerCaixas.length === 0 && this.destino?.length) {
        this.updateMarkers();
      }
      if (layers.cto && this.markerCtos.length === 0 && this.destinoCTO?.length) {
        this.updateMarkersCTO();
      }
      if (layers.ctosp && this.markerCtosSP.length === 0 && this.destinoCTOSP?.length) {
        this.updateMarkersCTOSP();
      }
      if (layers.cabos && this.getAllCaboPolylineArrays().every((arr) => arr.length === 0)) {
        this.recriarCabosSeLayerAtiva();
      }
      if (layers.cabos && this.markerSegmentos.length === 0 && this.destinoSegmentos?.length) {
        this.updateMarkersSegmentos();
      }
      if (layers.condominios && this.markerCondominios.length === 0 && this.destinoCondominios?.length) {
        this.updateMarkersCondominios();
      }
      if (layers.clientes && this.markerPopsCli.length === 0 && this.destinoPopsCli?.length) {
        this.updateMarkersPopsCli();
      }
      if (layers.clientes_ativos && this.markerPopsCliAtv.length === 0 && this.destinoPopsCliAtv?.length) {
        this.updateMarkersPopsCliAtv();
      }
      if (layers.clientes_cancelados && this.markerPopsCliDes.length === 0 && this.destinoPopsCliDes?.length) {
        this.updateMarkersPopsCliDes();
      }
      if (layers.estacoes && this.markerPopsEst.length === 0 && this.destinoPopsEst?.length) {
        this.updateMarkersPopsEst();
      }
      if (layers.estacoes && this.markerDios.length === 0 && this.destinoDios?.length) {
        this.updateMarkersDios();
      }
      if (layers.postes_aprovados && this.markerPostesAP.length === 0 && this.destinoPostesAP?.length) {
        this.updateMarkersPostesAP();
      }
      if (
        layers.postes_concessionaria &&
        this.markerPostesConcessionaria.length === 0 &&
        this.destinoPostesConcessionaria?.length
      ) {
        this.updateMarkersPostesConcessionaria();
      }
      this.updateVisibleMarkers();
    });

    //const lat= this.authService.getLat
    //const lng= this.authService.getLng
    //center:google.maps.LatLngLiteral = { lat: lat, lng: lng};


    // Subscription para escutar dados de caixa selecionada
    this.compartilhamentoService.caixa$.pipe(takeUntil(this.destroy$)).subscribe((caixaData: CaixaData | null) => {
      if (caixaData) {
        console.log('Dados da caixa recebidos no GoogleMaps:', caixaData);
        this.centralizarNaCaixa(caixaData);
      }
    });

    // Subscription para escutar dados de caixa selecionada
    this.compartilhamentoService.cliente$.pipe(takeUntil(this.destroy$)).subscribe((clienteData: ClienteData | null) => {
      if (clienteData) {
        console.log('Dados da caixa recebidos no GoogleMaps:', clienteData);
        this.centralizarNoCliente(clienteData);
      }
    });

    // Subscription para escutar dados de estação selecionada
    this.compartilhamentoService.estacao$.pipe(takeUntil(this.destroy$)).subscribe((estacaoData: EstacaoData | null) => {
      if (estacaoData) {
        console.log('Dados da estação recebidos no GoogleMaps:', estacaoData);
        this.centralizarNaEstacao(estacaoData);
      }
    });

    this.compartilhamentoService.logradouroPesquisa$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ponto: LogradouroPesquisaData | null) => {
        if (ponto && this.map) {
          const center = new google.maps.LatLng(ponto.lat, ponto.lng);
          this.map.setCenter(center);
          this.map.setZoom(18);
          this.exibirMarcadorLogradouroPesquisa(ponto);
          console.log(
            'Mapa centralizado (logradouro):',
            ponto.endereco,
            ponto.lat,
            ponto.lng,
          );
        } else if (ponto === null) {
          this.limparMarcadorLogradouroPesquisa();
        }
      });

    this.compartilhamentoService.viabilidadePontoMapa$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ponto: ViabilidadePontoMapaData | null) => {
        if (ponto && this.map) {
          const center = new google.maps.LatLng(ponto.lat, ponto.lng);
          this.map.setCenter(center);
          this.map.setZoom(18);
          this.exibirMarcadorViabilidadePesquisa(ponto);
        } else if (ponto === null) {
          this.limparMarcadorViabilidadePesquisa();
          this.limparCirculosViabilidadeCaixas();
        }
      });

    this.compartilhamentoService.viabilidadeCirculosCaixas$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pontos: ViabilidadeCirculoCaixaData[] | null) => {
        if (!this.map) {
          return;
        }
        if (pontos == null || pontos.length === 0) {
          this.limparCirculosViabilidadeCaixas();
          return;
        }
        this.exibirCirculosViabilidadeCaixas(pontos);
      });

    this.compartilhamentoService.viabilidadeCentrarEquipamento$
      .pipe(takeUntil(this.destroy$))
      .subscribe((dados: ViabilidadeCentrarEquipamentoData) => {
        if (!this.map) {
          return;
        }
        const center = new google.maps.LatLng(dados.lat, dados.lng);
        this.map.panTo(center);
        this.map.setZoom(dados.zoom ?? 19);
      });
    //**************************** */
      // trabalha em conjunto com pop-info-modal.component.ts
     // quando o usuário salva as alterações na Sigla no pop-info-modal, o serviço popInfoUpdateService emite um evento com o id_meta e a sigla do cliente
    // Subscription para atualizar marcador quando SIGLA do cliente é alterada no pop-info-modal
    this.popInfoUpdateService.onClienteAtualizado.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      const idEvent = Number(event.id_meta);
      const idMatch = (c: any) => Number(c?.id_meta ?? c?.ID_META ?? 0) === idEvent;
      const siglaAtual = (c: any) => (c?.sigla ?? c?.SIGLA ?? '').toString().trim();

      // destinoPopsCli
      const idxCli = this.destinoPopsCli?.findIndex(idMatch) ?? -1;
      if (idxCli >= 0) {
        const cliente = this.destinoPopsCli![idxCli];
        if (siglaAtual(cliente) !== event.sigla?.trim()) {
          cliente.sigla = event.sigla;
          (cliente as any).SIGLA = event.sigla;
          const marker = this.markerPopsCli[idxCli];
          if (marker) marker.setLabel({ text: event.sigla || 'S/N', color: 'gray', fontSize: '10px' });
        }
        return;
      }

      // destinoPopsCliDes
      const idxDes = this.destinoPopsCliDes?.findIndex(idMatch) ?? -1;
      if (idxDes >= 0) {
        const cliente = this.destinoPopsCliDes![idxDes];
        if (siglaAtual(cliente) !== event.sigla?.trim()) {
          cliente.sigla = event.sigla;
          (cliente as any).SIGLA = event.sigla;
          const marker = this.markerPopsCliDes[idxDes];
          if (marker) marker.setLabel({ text: event.sigla || 'S/N', color: 'gray', fontSize: '10px' });
        }
        return;
      }

      // destinoPopsCliAtv
      const idxAtv = this.destinoPopsCliAtv?.findIndex(idMatch) ?? -1;
      if (idxAtv >= 0) {
        const cliente = this.destinoPopsCliAtv![idxAtv];
        if (siglaAtual(cliente) !== event.sigla?.trim()) {
          cliente.sigla = event.sigla;
          (cliente as any).SIGLA = event.sigla;
          const marker = this.markerPopsCliAtv[idxAtv];
          if (marker) marker.setLabel({ text: event.sigla || 'S/N', color: 'blue', fontSize: '10px' });
        }
      }
    });

    // Subscription para atualizar marcador quando SIGLA da estação é alterada no pop-estacao-info-modal
    this.popInfoEstacaoUpdateService.onEstacaoAtualizado.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      const idx = this.destinoPopsEst?.findIndex(e => Number(e?.id_meta ?? 0) === Number(event.id_meta)) ?? -1;
      if (idx >= 0) {
        const estacao = this.destinoPopsEst![idx];
        if ((estacao.sigla ?? (estacao as any).SIGLA ?? '').toString().trim() !== event.sigla?.trim()) {
          estacao.sigla = event.sigla;
          (estacao as any).SIGLA = event.sigla;
          const marker = this.markerPopsEst[idx];
          if (marker) marker.setLabel({ text: event.sigla || 'S/N', color: 'red', fontSize: '13px' });
        }
      }
    });

  }

  //MÉTODOS========================================================
  checkForGPSLocation(): void {
    // Verifica se há coordenadas GPS salvas no AuthService
    const lat = this.authService.getLat();
    const lng = this.authService.getLng();
    
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (!isNaN(latitude) && !isNaN(longitude)) {
        this.centerMapOnLocation(latitude, longitude);
      }
    }
  }

  centerMapOnLocation(lat: number, lng: number): void {
    // Centraliza o mapa na localização
    this.center = { lat, lng };
    this.zoom = 14; // Zoom mais próximo para localização GPS
    
    // Define o marcador da posição atual
    this.currentLocationMarker = { lat, lng };
    
    

console.log(`Mapa centralizado na posição: ${lat}, ${lng}`);
}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges detectou mudança em destino:', changes['destino']);

    console.log('CaixaInterna - ngOnChanges recebeu:', changes);
  if (changes['numeroCaixa']) {
    console.log('Número da caixa alterado para');
  }
     
    if (changes['destinoAnotacoes'] && changes['destinoAnotacoes'].currentValue) {
      console.log('Atualizando marcadores de Anotacoes ',this.destinoAnotacoes);
      this.updateMarkersAnotacoes();
    }

    if (changes['destinoPoligonos'] && changes['destinoPoligonos'].currentValue) {
      console.log('Atualizando poligonos no mapa ', this.destinoPoligonos);
      this.updatePoligonos();
    }

    if (changes['destinoDios'] && changes['destinoDios'].currentValue) {
      console.log('Atualizando marcadores de Dios ',this.destinoDios);
      this.updateMarkersDios();
    }

    if (changes['destinoPostesAP'] && changes['destinoPostesAP'].currentValue) {
      console.log('Atualizando marcadores de Postes Aprovados ', this.destinoPostesAP);
      this.updateMarkersPostesAP();
    }

    if (changes['destinoSegmentos'] && changes['destinoSegmentos'].currentValue) {
      console.log('Atualizando marcadores de Segmentos (Sobras) ', this.destinoSegmentos);
      this.updateMarkersSegmentos();
    }

    if (changes['destinoCondominios'] && changes['destinoCondominios'].currentValue) {
      console.log('Atualizando marcadores de Condominios ',this.destinoCondominios);
      this.updateMarkersCondominios();
    }

    if (changes['destinoPopsCli'] && changes['destinoPopsCli'].currentValue) {
      console.log('Atualizando marcadores de Clientes ',this.destinoPopsCli);
      this.updateMarkersPopsCli();
    }

    if (changes['destinoPopsCliDes'] && changes['destinoPopsCliDes'].currentValue) {
      console.log('Atualizando marcadores de Clientes Desativados',this.destinoPopsCliDes);
      this.updateMarkersPopsCliDes();
    }

    if (changes['destinoPopsCliAtv'] && changes['destinoPopsCliAtv'].currentValue) {
      console.log('Atualizando marcadores de Clientes Ativados',this.destinoPopsCliAtv);
      this.updateMarkersPopsCliAtv();
    }

    if (changes['destinoPopsEst'] && changes['destinoPopsEst'].currentValue) {
      console.log('Atualizando marcadores de Estações ',this.destinoPopsEst);
      this.updateMarkersPopsEst();
    }
    
    if (changes['destino'] && changes['destino'].currentValue) {
      console.log('Atualizando marcadores de caixas ',this.destino);
      this.updateMarkers();
    }
      
    if (changes['destinoCTO'] && changes['destinoCTO'].currentValue) {
      console.log('Atualizando marcadores de CTOs',this.destinoCTO);
      this.updateMarkersCTO();
    }

    if (changes['destinoCTOSP'] && changes['destinoCTOSP'].currentValue) {
      console.log('Atualizando marcadores de CTOs COM SP',this.destinoCTOSP);
      this.updateMarkersCTOSP();
    }

    if (changes['destinoCabos1f'] && changes['destinoCabos1f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 1f ',this.destinoCabos1f);
      this.updatePolylinesCabos1f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo1fPolylines();
      }, 1);
     
    }

    if (changes['destinoCabos2f'] && changes['destinoCabos2f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 2f ',this.destinoCabos2f);
      this.updatePolylinesCabos2f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo2fPolylines();
      }, 1);
    
    }

    if (changes['destinoCabos4f'] && changes['destinoCabos4f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 4f ',this.destinoCabos4f);
      this.updatePolylinesCabos4f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo4fPolylines();
      }, 1);
     
    }

    if (changes['destinoCabos6f'] && changes['destinoCabos6f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 6f ',this.destinoCabos6f);
      this.updatePolylinesCabos6f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo6fPolylines();
      }, 1);
      
                
      
    }

    if (changes['destinoCabos8f'] && changes['destinoCabos8f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 8f ',this.destinoCabos8f);
      this.updatePolylinesCabos8f();
      setTimeout(() => {
        this.createCabo8fPolylines();
      }, 1);
      
    }

    if (changes['destinoCabos12f'] && changes['destinoCabos12f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 12f ',this.destinoCabos12f);
      this.updatePolylinesCabos12f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo12fPolylines();
      }, 1);

      
    }

    if (changes['destinoCabos24f'] && changes['destinoCabos24f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 24f ',this.destinoCabos24f);
      this.updatePolylinesCabos24f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo24fPolylines();
      }, 1);
      
    }    

    if (changes['destinoCabos36f'] && changes['destinoCabos36f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 36f ',this.destinoCabos36f);
      this.updatePolylinesCabos36f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo36fPolylines();
      }, 1);
      
    } 
    
    if (changes['destinoCabos48f'] && changes['destinoCabos48f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 48f ',this.destinoCabos48f);
      this.updatePolylinesCabos48f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo48fPolylines();
      }, 1);
      
    }   

    if (changes['destinoCabos72f'] && changes['destinoCabos72f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 72f ',this.destinoCabos72f);
      this.updatePolylinesCabos72f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo72fPolylines();
      }, 1);
      
    }   

    if (changes['destinoCabos144f'] && changes['destinoCabos144f'].currentValue) {
      console.log('Atualizando polilinhas de cabos 144f ',this.destinoCabos144f);
      this.updatePolylinesCabos144f();
      // Criar polylines programaticamente quando os dados mudarem
      setTimeout(() => {
        this.createCabo144fPolylines();
      }, 1);
      
    }   
        
      
  }


  getVisibleMarkerCaixas(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_CAIXAS) {
      return this.markerCaixas;
    }
    return [];
  }
           
  getVisibleMarkerCtos(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_CTOS) {
      return this.markerCtos;
    }
    return [];
  }  

  getVisibleMarkerCtosSP(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_CTOSSP) {
      return this.markerCtosSP;
    }
    return [];
  }  

  getVisibleMarkerPOPCLI(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_CLIENTES) {
      return this.markerPopsCli;
    }
    return [];
  }  

  getVisibleMarkerPOPCLIAtv(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_CLIENTES_ATIVOS) {
      return this.markerPopsCliAtv;
    }
    return [];
  }  

  getVisibleMarkerPOPCLIDes(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_CLIENTES_DISABLES) {
      return this.markerPopsCliDes;
    }
    
    return [];
  }  

  getVisibleMarkerDios(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_DIOS) {
      return this.markerDios;
    }
    return [];
  }  
  
  getVisibleMarkerAnotacoes(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_ANOTACOES) {
      return this.markerAnotacoes;
    }
    return [];
  }

  getVisibleMarkerPostesAP(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_POSTES_AP) {
      return this.markerPostesAP;
    }
    return [];
  }

  getVisibleMarkerPostesConcessionaria(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_POSTES_CONCESSIONARIA) {
      return this.markerPostesConcessionaria;
    }
    return [];
  }

  getVisibleMarkerSegmentos(): google.maps.Marker[] {
    if (this.currentZoom >= this.ZOOM_LEVEL_SEGMENTOS) {
      return this.markerSegmentos;
    }
    return [];
  }


// função para carregar anotacoes no mapa==============================
  private updateMarkersAnotacoes() {
    if (this.destinoAnotacoes && this.destinoAnotacoes.length > 0 && this.map) {
      this.markerAnotacoes.forEach(marker => marker.setMap(null));
      this.markerAnotacoes = [];
    }
    
    this.destinoAnotacoes.forEach(location => {
      const position = {
        lat: Number(location.LAT),
        lng: Number(location.LNG)
      };

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.label_rabicho || 'Sem nome',
        draggable: false,
        opacity: 1,
        label: {
          text: 'Obs: ' + (location.label_rabicho || 'S/N'),
          color: 'black',
          fontSize: '12px'
        } as google.maps.MarkerLabel,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#000000',
          fillOpacity: 1,
          strokeColor: '#000000',
          strokeWeight: 1,
          scale: 5,
          labelOrigin: new google.maps.Point(0, -2),
        },
        visible: this.currentZoom >= this.ZOOM_LEVEL_ANOTACOES
        ///visible: false
      };

      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }
      
      // Variáveis para controlar cliques
      let clickTimeout: any;
      
      // Adicionar listener de clique simples para abrir InfoWindow
      marker.addListener('click', (event: google.maps.MapMouseEvent) => {
        // Limpar timeout anterior se existir
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }
        
        // Definir timeout para clique simples
        clickTimeout = setTimeout(() => {
          // Clique simples - mostrar InfoWindow
          console.log('🔍 [Anotacao] Clique simples detectada na Anotacao:', location.label_rabicho);
          this.showMarkerInfoWindow(marker, event, 'anotacao', location);
        }, 300); // Delay de 300ms para distinguir de duplo clique
      }); 

      
      //this.markerAnotacoes.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
       // console.log('🔴 [Anotacao] Right-click na Anotacao:', location.label);
      //});

      this.markerAnotacoes.push(marker);
    });
    console.log('Anotacoes atualizadas final:', this.markerAnotacoes);
    }


// função para carregar postes aprovados no mapa==============================
  private updateMarkersPostesAP() {
    if (!this.layerVisibilityService.isVisible('postes_aprovados')) {
      return;
    }

    if (this.destinoPostesAP && this.destinoPostesAP.length > 0 && this.map) {
      this.markerPostesAP.forEach(marker => marker.setMap(null));
      this.markerPostesAP = [];
    }

    this.destinoPostesAP.forEach(location => {
      const position = {
        lat: Number(location.LATI),
        lng: Number(location.LONGI),
      };

      const titleParts = [`Poste ${location.NUM_SEQ_GEO}`];
      if (location.obs) {
        titleParts.push(location.obs);
      }

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: titleParts.join(' - '),
        draggable: false,
        opacity: 1,
        icon: this.iconeMarcadorPosteAprovado(),
        visible: this.currentZoom >= this.ZOOM_LEVEL_POSTES_AP,
      };

      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }

      marker.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
        this.clickedPosteAprovadoData = location;
        this.contextMenuType = 'poste_aprovado';

        if (event.domEvent) {
          const mouseEvent = event.domEvent as MouseEvent;
          this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
        }
      });

      this.markerPostesAP.push(marker);
    });

    console.log('Postes Aprovados atualizados:', this.markerPostesAP);
  }

  private iconeMarcadorPosteAprovado(): google.maps.Symbol {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#898989',
      fillOpacity: 0.85,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 8,
    };
  }

  private excluirPosteAprovado(): void {
    const poste = this.clickedPosteAprovadoData;

    if (!poste?.ID) {
      alert('Erro: poste aprovado sem ID. Recarregue a lista lateral e tente novamente.');
      this.hideContextMenu();
      return;
    }

    const idCity = this.authService.getIdCity();
    if (!idCity) {
      alert('Erro: ID da cidade não encontrado. Selecione uma cidade no workspace.');
      this.hideContextMenu();
      return;
    }

    const confirmacao = confirm(
      `Tem certeza que deseja excluir este poste aprovado?\n\nNUM_SEQ_GEO: ${poste.NUM_SEQ_GEO}`,
    );

    if (!confirmacao) {
      return;
    }

    this.excluiPosteAprovadoService.excluirPosteAprovado({
      id: poste.ID,
      id_city: idCity,
    }).subscribe({
      next: (response) => {
        if (response.success) {
          const index = (this.destinoPostesAP ?? []).findIndex((item) => item.ID === poste.ID);
          if (index !== -1) {
            const markerParaRemover = this.markerPostesAP[index];
            if (markerParaRemover) {
              markerParaRemover.setMap(null);
            }
            this.markerPostesAP.splice(index, 1);
            this.destinoPostesAP = this.destinoPostesAP.filter((item) => item.ID !== poste.ID);
          }

          this.clickedPosteAprovadoData = null;
          this.updateVisibleMarkers();
          this.hideContextMenu();
          this.cdr.detectChanges();
        } else {
          alert(response.message || response.error || 'Erro ao excluir poste aprovado');
        }
      },
      error: (err: unknown) => {
        console.error('[EXCLUI-POSTE-APROVADO] Erro:', err);
        const errorObj = err as { message?: string };
        alert(errorObj?.message || 'Erro ao excluir poste aprovado');
        this.clickedPosteAprovadoData = null;
      },
    });
  }

  private extentPermiteCarregarPostesConcessionaria(): boolean {
    if (!this.authService.hasPostesConcessionaria()) {
      return false;
    }

    const bounds = this.map?.getBounds();
    if (!bounds) {
      return false;
    }

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const latSpan = Math.abs(ne.lat() - sw.lat());
    const lngSpan = Math.abs(ne.lng() - sw.lng());

    return latSpan <= this.MAX_EXTENT_LAT_POSTES_CONCESSIONARIA
      && lngSpan <= this.MAX_EXTENT_LNG_POSTES_CONCESSIONARIA;
  }

  private atualizarVisibilidadeBotaoPostesConcessionaria(): void {
    const next = this.extentPermiteCarregarPostesConcessionaria();
    if (next !== this.postesConcessionariaBotaoVisivel) {
      this.postesConcessionariaBotaoVisivel = next;
      this.cdr.detectChanges();
    }
  }

  onCarregarPostesConcessionaria(): void {
    if (!this.map) {
      alert('Mapa ainda não está pronto. Aguarde o carregamento.');
      return;
    }

    if (!this.authService.hasPostesConcessionaria()) {
      alert('Esta cidade não possui tabela de postes da concessionária configurada.');
      return;
    }

    if (!this.extentPermiteCarregarPostesConcessionaria()) {
      alert('Aproxime o mapa (área muito ampla) para carregar postes da concessionária.');
      return;
    }

    const bounds = this.map.getBounds();
    if (!bounds) {
      alert('Não foi possível obter a área visível do mapa.');
      return;
    }

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const extent = {
      LAT_MAX: String(ne.lat()),
      LAT_MIN: String(sw.lat()),
      LONG_MAX: String(ne.lng()),
      LONG_MIN: String(sw.lng()),
    };

    this.carregandoPostesConcessionaria = true;
    this.postesConcessionariaService.buscarPorExtent(extent).subscribe({
      next: (postes) => {
        this.carregandoPostesConcessionaria = false;
        this.destinoPostesConcessionaria = postes ?? [];
        this.updateMarkersPostesConcessionaria();
        this.updateVisibleMarkers();
        this.cdr.detectChanges();
        console.log(
          `Postes Concessionária carregados: ${this.destinoPostesConcessionaria.length}`,
        );
      },
      error: (err) => {
        this.carregandoPostesConcessionaria = false;
        this.cdr.detectChanges();
        alert(typeof err === 'string' ? err : err?.message ?? 'Erro ao carregar postes da concessionária.');
      },
    });
  }

  private updateMarkersPostesConcessionaria(): void {
    if (!this.layerVisibilityService.isVisible('postes_concessionaria')) {
      return;
    }

    this.markerPostesConcessionaria.forEach((marker) => marker.setMap(null));
    this.markerPostesConcessionaria = [];

    if (!this.map || !this.destinoPostesConcessionaria?.length) {
      return;
    }

    this.destinoPostesConcessionaria.forEach((poste) => {
      const lat = Number(poste.LATITUDE);
      const lng = Number(poste.LONGITUDE);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return;
      }

      const markerOptions: google.maps.MarkerOptions = {
        position: { lat, lng },
        title: `Poste ${poste.NUM_SEQ_GEO}${poste.ORIGEM ? ` (${poste.ORIGEM})` : ''} — ${poste.SITUACAO ?? ''}`,
        draggable: false,
        opacity: 1,
        icon: this.iconeMarcadorPosteConcessionaria(poste.SITUACAO),
        visible: this.currentZoom >= this.ZOOM_LEVEL_POSTES_CONCESSIONARIA,
      };

      const marker = new google.maps.Marker(markerOptions);
      marker.setMap(this.map ?? null);
      this.markerPostesConcessionaria.push(marker);
    });

    console.log('Postes Concessionária atualizados:', this.markerPostesConcessionaria.length);
  }

  private iconeMarcadorPosteConcessionaria(situacao: string): google.maps.Symbol {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: this.corMarcadorPosteConcessionaria(situacao),
      fillOpacity: 0.7,
      strokeColor: '#ffffff',
      strokeWeight: 1.5,
      scale: 4,
    };
  }

  /** Indisponível → vermelho; Possível → laranja; Disponível → verde; Indefinido/vazio → cinza. */
  private corMarcadorPosteConcessionaria(situacao: string): string {
    const s = (situacao ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (s.includes('indispon')) {
      return '#dc3545';
    }
    if (s.includes('possiv')) {
      return '#fd7e14';
    }
    if (s.includes('dispon')) {
      return '#28a745';
    }
    if (!s || s.includes('indefin')) {
      return '#6c757d';
    }
    return '#6c757d';
  }

  iniciarModoAprovarPostes(): void {
    if (!this.map) {
      alert('Mapa ainda não está pronto. Aguarde o carregamento.');
      return;
    }

    if (!this.destinoPostesConcessionaria?.length) {
      alert('Carregue os postes da concessionária antes de aprovar (botão Postes Concessionária).');
      this.hideContextMenu();
      return;
    }

    if (this.modoAprovarPostesAtivo) {
      this.cancelarModoAprovarPostes();
    }

    this.desativarModoEdicaoPoligonoCompleto();
    this.cancelarDesenhoPoligono();
    this.cancelarDesenhoCabo();
    if (this.modoMedicao) {
      this.desativarModoMedicao();
    }

    this.hideContextMenu();
    this.modoAprovarPostesAtivo = true;
    this.selecaoPostesInicio = null;
    this.selecaoPostesArrastando = false;

    this.map.setOptions({
      draggable: false,
      draggableCursor: 'crosshair',
      draggingCursor: 'crosshair',
      disableDoubleClickZoom: true,
      clickableIcons: false,
    });

    this.ensureAprovarPostesOverlay();
    this.registrarListenersModoAprovarPostes();
  }

  private ensureAprovarPostesOverlay(): void {
    if (this.aprovarPostesOverlay || !this.map) {
      return;
    }

    const overlay = new google.maps.OverlayView();
    overlay.onAdd = () => {};
    overlay.draw = () => {};
    overlay.onRemove = () => {};
    overlay.setMap(this.map);
    this.aprovarPostesOverlay = overlay;
  }

  private latLngFromDomMouseEvent(event: MouseEvent): google.maps.LatLng | null {
    if (!this.map) {
      return null;
    }

    const projection = this.aprovarPostesOverlay?.getProjection();
    if (!projection) {
      return null;
    }

    const rect = this.map.getDiv().getBoundingClientRect();
    const point = new google.maps.Point(
      event.clientX - rect.left,
      event.clientY - rect.top,
    );
    return projection.fromContainerPixelToLatLng(point);
  }

  private registrarListenersModoAprovarPostes(): void {
    if (!this.map) {
      return;
    }

    this.teardownListenersAprovarPostes();

    const mapDiv = this.map.getDiv();

    this.listenersAprovarPostes.push(
      google.maps.event.addDomListener(mapDiv, 'mousedown', (event: MouseEvent) => {
        if (!this.modoAprovarPostesAtivo || event.button !== 0) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const latLng = this.latLngFromDomMouseEvent(event);
        if (!latLng) {
          return;
        }

        this.selecaoPostesInicio = latLng;
        this.selecaoPostesArrastando = true;
        this.atualizarRetanguloSelecaoPostes(latLng, latLng);
      }),
    );

    this.listenersAprovarPostes.push(
      this.map.addListener('mousemove', (event: google.maps.MapMouseEvent) => {
        if (!this.modoAprovarPostesAtivo || !this.selecaoPostesArrastando || !this.selecaoPostesInicio || !event.latLng) {
          return;
        }

        this.atualizarRetanguloSelecaoPostes(this.selecaoPostesInicio, event.latLng);
      }),
    );

    this.listenersAprovarPostes.push(
      google.maps.event.addDomListener(document, 'mouseup', (event: MouseEvent) => {
        if (!this.modoAprovarPostesAtivo || !this.selecaoPostesArrastando || event.button !== 0) {
          return;
        }

        const fim = this.latLngFromDomMouseEvent(event);
        if (!fim || !this.selecaoPostesInicio) {
          this.resetarArrasteSelecaoPostes();
          return;
        }

        this.finalizarSelecaoAprovarPostes(this.selecaoPostesInicio, fim);
      }),
    );

    this.listenersAprovarPostes.push(
      this.map.addListener('rightclick', () => {
        if (this.modoAprovarPostesAtivo) {
          this.cancelarModoAprovarPostes();
        }
      }),
    );

    this.listenerEscAprovarPostes = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.modoAprovarPostesAtivo) {
        this.cancelarModoAprovarPostes();
      }
    };
    document.addEventListener('keydown', this.listenerEscAprovarPostes);
  }

  private atualizarRetanguloSelecaoPostes(
    inicio: google.maps.LatLng,
    fim: google.maps.LatLng,
  ): void {
    if (!this.map) {
      return;
    }

    const bounds = new google.maps.LatLngBounds(inicio, fim);

    if (!this.retanguloSelecaoPostes) {
      this.retanguloSelecaoPostes = new google.maps.Rectangle({
        map: this.map,
        bounds,
        strokeColor: '#15803d',
        strokeWeight: 2,
        strokeOpacity: 0.9,
        fillColor: '#15803d',
        fillOpacity: 0.15,
        clickable: false,
        zIndex: 1000,
      });
      return;
    }

    this.retanguloSelecaoPostes.setBounds(bounds);
  }

  private postesDentroDoRetangulo(
    inicio: google.maps.LatLng,
    fim: google.maps.LatLng,
  ): PosteConcessionaria[] {
    const latMin = Math.min(inicio.lat(), fim.lat());
    const latMax = Math.max(inicio.lat(), fim.lat());
    const lngMin = Math.min(inicio.lng(), fim.lng());
    const lngMax = Math.max(inicio.lng(), fim.lng());

    return (this.destinoPostesConcessionaria ?? []).filter((poste) => {
      const lat = Number(poste.LATITUDE);
      const lng = Number(poste.LONGITUDE);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return false;
      }
      return lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax;
    });
  }

  private finalizarSelecaoAprovarPostes(
    inicio: google.maps.LatLng,
    fim: google.maps.LatLng,
  ): void {
    const selecionados = this.postesDentroDoRetangulo(inicio, fim);
    this.resetarArrasteSelecaoPostes();

    if (!selecionados.length) {
      alert('Nenhum poste da concessionária na área selecionada.');
      return;
    }

    this.atualizarModalAprovarPostes(selecionados);
  }

  private resetarArrasteSelecaoPostes(): void {
    this.selecaoPostesInicio = null;
    this.selecaoPostesArrastando = false;

    if (this.retanguloSelecaoPostes) {
      this.retanguloSelecaoPostes.setMap(null);
      this.retanguloSelecaoPostes = null;
    }
  }

  private reforcarCursorSelecaoPostes(): void {
    if (!this.map || !this.modoAprovarPostesAtivo) {
      return;
    }

    this.map.setOptions({
      draggable: false,
      draggableCursor: 'crosshair',
      draggingCursor: 'crosshair',
      disableDoubleClickZoom: true,
      clickableIcons: false,
    });
  }

  private atualizarModalAprovarPostes(novosPostes: PosteConcessionaria[]): void {
    if (this.aprovarPostesModalRef) {
      const modal = this.aprovarPostesModalRef.componentInstance as AprovarPostesModalComponent;
      modal.adicionarPostes(novosPostes);
      this.reforcarCursorSelecaoPostes();
      return;
    }

    const modalRef = this.ngbModal.open(AprovarPostesModalComponent, {
      size: 'sm',
      backdrop: false,
      keyboard: false,
      windowClass: 'aprovar-postes-modal-window',
    });

    this.aprovarPostesModalRef = modalRef;
    modalRef.componentInstance.postes = [...novosPostes];
    this.reforcarCursorSelecaoPostes();

    modalRef.result.then(
      (result: AprovarPostesConfirmacao) => {
        this.aprovarPostesModalRef = null;
        this.cancelarModoAprovarPostes(false);
        if (result?.postes?.length) {
          void this.processarConfirmacaoAprovarPostes(result);
        }
      },
      () => {
        this.aprovarPostesModalRef = null;
        this.cancelarModoAprovarPostes(false);
      },
    );
  }

  private normalizarNumSeqGeo(valor: string | number): string {
    return String(valor).trim();
  }

  private chavePosteConcessionaria(poste: PosteConcessionaria): string {
    const numSeq = this.normalizarNumSeqGeo(poste.NUM_SEQ_GEO);
    const origem = String(poste.ORIGEM ?? '').trim();
    return origem ? `${origem}|${numSeq}` : numSeq;
  }

  private chavePosteAprovado(poste: { NUM_SEQ_GEO: string | number; ORIGEM?: string }): string {
    const numSeq = this.normalizarNumSeqGeo(poste.NUM_SEQ_GEO);
    const origem = String(poste.ORIGEM ?? '').trim();
    return origem ? `${origem}|${numSeq}` : numSeq;
  }

  private async processarConfirmacaoAprovarPostes(resultado: AprovarPostesConfirmacao): Promise<void> {
    const idCity = this.authService.getIdCity();

    if (!idCity) {
      alert('Cidade não selecionada. Selecione a cidade e tente novamente.');
      return;
    }

    const aprovadosExistentes = new Set(
      (this.destinoPostesAP ?? []).map((poste) => this.chavePosteAprovado(poste)),
    );

    const postesParaInserir = resultado.postes.filter((poste) => {
      const chave = this.chavePosteConcessionaria(poste);
      return !aprovadosExistentes.has(chave);
    });

    const duplicados = resultado.postes.length - postesParaInserir.length;

    if (postesParaInserir.length === 0) {
      alert(
        duplicados > 0
          ? 'Todos os postes selecionados já estão aprovados para este provedor.'
          : 'Nenhum poste selecionado para aprovar.',
      );
      return;
    }

    let sucesso = 0;
    let falhas = 0;
    const erros: string[] = [];

    for (const poste of postesParaInserir) {
      const origem = String(poste.ORIGEM ?? '').trim();
      if (!origem) {
        falhas += 1;
        erros.push(`Poste ${poste.NUM_SEQ_GEO}: origem (tabela) não informada.`);
        continue;
      }

      try {
        const response = await this.insertPosteAprovadoService.inserirPosteAsync({
          NUM_SEQ_GEO: poste.NUM_SEQ_GEO,
          obs: resultado.obs,
          LATI: Number(poste.LATITUDE),
          LONG: Number(poste.LONGITUDE),
          ORIGEM: origem,
        });

        if (response.success && response.insertId != null) {
          sucesso += 1;
          this.destinoPostesAP = [
            ...(this.destinoPostesAP ?? []),
            {
              ID: Number(response.insertId),
              NUM_SEQ_GEO: Number(poste.NUM_SEQ_GEO),
              obs: resultado.obs,
              LATI: Number(poste.LATITUDE),
              LONGI: Number(poste.LONGITUDE),
              ORIGEM: origem,
            },
          ];
        } else {
          falhas += 1;
          erros.push(`Poste ${poste.NUM_SEQ_GEO}: ${response.message || response.error || 'Erro desconhecido'}`);
        }
      } catch (error: unknown) {
        falhas += 1;
        const msg = error instanceof Error ? error.message : String(error);
        erros.push(`Poste ${poste.NUM_SEQ_GEO}: ${msg}`);
      }
    }

    if (sucesso > 0) {
      this.updateMarkersPostesAP();
      this.updateVisibleMarkers();
      this.cdr.detectChanges();
    }

    let mensagem = `${sucesso} poste(s) aprovado(s) com sucesso.`;
    if (duplicados > 0) {
      mensagem += `\n${duplicados} poste(s) ignorado(s) por já estarem aprovados.`;
    }
    if (falhas > 0) {
      mensagem += `\n${falhas} poste(s) com falha.`;
      if (erros.length > 0) {
        mensagem += `\n\n${erros.slice(0, 5).join('\n')}`;
        if (erros.length > 5) {
          mensagem += `\n... e mais ${erros.length - 5} erro(s).`;
        }
      }
    }

    alert(mensagem);
  }

  private cancelarModoAprovarPostes(fecharModal = true): void {
    this.modoAprovarPostesAtivo = false;
    this.resetarArrasteSelecaoPostes();

    if (this.aprovarPostesOverlay) {
      this.aprovarPostesOverlay.setMap(null);
      this.aprovarPostesOverlay = null;
    }

    this.teardownListenersAprovarPostes();

    if (fecharModal && this.aprovarPostesModalRef) {
      const modalRef = this.aprovarPostesModalRef;
      this.aprovarPostesModalRef = null;
      modalRef.dismiss('cancelar-selecao');
    }

    if (this.map) {
      this.map.setOptions({
        draggable: true,
        draggableCursor: null,
        draggingCursor: null,
        disableDoubleClickZoom: false,
        clickableIcons: true,
      });
    }
  }

  private teardownListenersAprovarPostes(): void {
    this.listenersAprovarPostes.forEach((listener) => {
      google.maps.event.removeListener(listener);
    });
    this.listenersAprovarPostes = [];

    if (this.listenerEscAprovarPostes) {
      document.removeEventListener('keydown', this.listenerEscAprovarPostes);
      this.listenerEscAprovarPostes = null;
    }
  }


// função para carregar segmentos (sobras) no mapa==============================
  private updateMarkersSegmentos() {
    if (!this.layerVisibilityService.isVisible('cabos')) {
      return;
    }

    if (this.destinoSegmentos && this.destinoSegmentos.length > 0 && this.map) {
      this.markerSegmentos.forEach(marker => marker.setMap(null));
      this.markerSegmentos = [];
    }

    this.destinoSegmentos.forEach((location, index) => {
      const position = {
        lat: Number(location.LAT),
        lng: Number(location.LNG),
      };

      const titleParts = [
        `Sobra ${location.id_meta}`,
        `${location.Caboxd} / ${location.Caboxe}`,
      ];
      if (location.METRAGEM > 0) {
        titleParts.push(`${location.METRAGEM}m`);
      }

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: titleParts.join(' — '),
        draggable: false,
        opacity: 100,
        icon: this.iconeMarcadorSobraAsterisco(),
        visible: this.currentZoom >= this.ZOOM_LEVEL_SEGMENTOS,
      };

      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }

      let clickTimeout: any;
      marker.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }
        clickTimeout = setTimeout(() => {
          console.log('🔍 [Sobra] Clique simples detectado na Sobra:', location.id_meta);
          this.showSobraInfoWindow(marker, event, location);
        }, 300);
      });

      marker.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
        console.log('🖱️ [Sobra] Double-click na Sobra:', location.id_meta);

        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }

        if (this.currentMarkerInfoWindow) {
          this.currentMarkerInfoWindow.close();
        }

        if (event.domEvent) {
          event.domEvent.preventDefault?.();
          event.domEvent.stopPropagation?.();
        }

        this.habilitarEdicaoSobra(index);
      });

      marker.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
        console.log('🔴 [Sobra] Right-click na Sobra:', location);

        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }

        if (this.currentMarkerInfoWindow) {
          this.currentMarkerInfoWindow.close();
        }

        this.clickedSobraData = location;
        this.contextMenuType = 'sobra';

        if (event.domEvent) {
          const mouseEvent = event.domEvent as MouseEvent;
          this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
        }
      });

      this.markerSegmentos.push(marker);
    });

    console.log('Segmentos (Sobras) atualizados:', this.markerSegmentos);
  }


  /** Parse de `GOOGLE_LATLNG` (JSON string de `{ lng, lat }[]`) para `paths` do Polygon.
   * parseGoogleLatLng() , CentroPoligonoPontos() , CoresPoligonoPorTipo() , UpdatePoligonos() , RefreshPoligonosLabelMarkersVisibility()
   * fazem parte da construção dos Poligonos
  **/
  private parseGoogleLatLng(raw: string | undefined): google.maps.LatLngLiteral[] | null {
    const s = (raw ?? '').trim();
    if (!s) {
      return null;
    }
    try {
      const parsed = JSON.parse(s) as unknown;
      if (!Array.isArray(parsed) || parsed.length < 3) {
        return null;
      }
      const out: google.maps.LatLngLiteral[] = [];
      for (const p of parsed) {
        if (p == null || typeof p !== 'object') {
          return null;
        }
        const lat = Number((p as { lat?: unknown }).lat);
        const lng = Number((p as { lng?: unknown }).lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return null;
        }
        out.push({ lat, lng });
      }
      return out.length >= 3 ? out : null;
    } catch (e) {
      console.warn('[poligonos] GOOGLE_LATLNG inválido', e);
      return null;
    }
  }

  private centroPoligonoPontos(path: google.maps.LatLngLiteral[]): google.maps.LatLngLiteral {
    const n = path.length;
    if (n === 0) {
      return { lat: 0, lng: 0 };
    }
    let lat = 0;
    let lng = 0;
    for (const p of path) {
      lat += p.lat;
      lng += p.lng;
    }
    return { lat: lat / n, lng: lng / n };
  }

  private coresPoligonoPorTipo(tipo: string | undefined): {
    fillColor: string;
    strokeColor: string;
    fillOpacity: number;
    strokeOpacity: number;
  } {
    const t = (tipo ?? '').trim().toLowerCase();
    if (t === 'verde') {
      return {
        fillColor: '#22c55e',
        strokeColor: '#15803d',
        fillOpacity: 0.35,
        strokeOpacity: 0.9,
      };
    }
    if (t === 'amarelo') {
      return {
        fillColor: '#eab308',
        strokeColor: '#a16207',
        fillOpacity: 0.35,
        strokeOpacity: 0.9,
      };
    }
    if (t === 'branco') {
      return {
        fillColor: '#ffffff',
        strokeColor: '#64748b',
        fillOpacity: 0.45,
        strokeOpacity: 0.95,
      };
    }
    if (t === 'vermelho') {
      return {
        fillColor: '#ef4444',
        strokeColor: '#b91c1c',
        fillOpacity: 0.35,
        strokeOpacity: 0.9,
      };
    }
    if (t === 'azul') {
      return {
        fillColor: '#3b82f6',
        strokeColor: '#1d4ed8',
        fillOpacity: 0.35,
        strokeOpacity: 0.9,
      };
    }
    if (t === 'lilás' || t === 'lilas' || t === 'lilaz') {
      return {
        fillColor: '#a855f7',
        strokeColor: '#7e22ce',
        fillOpacity: 0.35,
        strokeOpacity: 0.9,
      };
    }
    return {
      fillColor: '#94a3b8',
      strokeColor: '#475569',
      fillOpacity: 0.3,
      strokeOpacity: 0.85,
    };
  }

  private updatePoligonos(): void {
    if (!this.map) {
      return;
    }
    if (!this.layerVisibilityService.isVisible('poligonos')) { // inserido na implementação visualização de camadas
      return;
    }
    /** Recriação substitui instâncias: encerrar edição se polígono atual vinha dos dados servidor. */
    if (this.poligonoEmEdicao && this.poligonosMapa.includes(this.poligonoEmEdicao)) {
      this.sairVisualEdicaoPoligonoAtual();
    }
    this.poligonosMapa.forEach((p) => p.setMap(null));
    this.poligonosMapa = [];
    this.poligonosLabelMarkers.forEach((m) => m.setMap(null));
    this.poligonosLabelMarkers = [];

    const lista = this.destinoPoligonos ?? [];
    for (const item of lista) {
      const paths = this.parseGoogleLatLng(item.GOOGLE_LATLNG);
      if (!paths) {
        console.warn('[poligonos] ignorado id_meta=', item.id_meta, 'sem paths válidos');
        continue;
      }
      const estilo = this.coresPoligonoPorTipo(item.tipo);
      const poly = new google.maps.Polygon({
        paths,
        map: this.map,
        strokeWeight: 2,
        clickable: false,
        ...estilo,
      });
      if (item.id_meta != null && Number.isFinite(Number(item.id_meta)) && Number(item.id_meta) > 0) {
        poly.set('id_meta', item.id_meta);
      }
      if (item.tipo != null) {
        poly.set('tipo', item.tipo);
        poly.set('tipoPoligono', item.tipo);
      }
      const lab = item.Label != null ? String(item.Label).trim() : '';
      if (lab) {
        poly.set('labelPoligono', lab);
        const pos = this.centroPoligonoPontos(paths);
        const labelMarker = new google.maps.Marker({
          position: pos,
          map: this.map,
          clickable: false,
          zIndex: google.maps.Marker.MAX_ZINDEX + 1,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillOpacity: 0,
            strokeOpacity: 0,
            scale: 1,
          },
          label: {
            text: lab,
            color: 'rgba(15, 23, 42, 0.72)',
            fontSize: '22px',
            fontWeight: 'bold',
          },
        });
        poly.set('labelMarker', labelMarker);
        this.poligonosLabelMarkers.push(labelMarker);
      }
      this.poligonosMapa.push(poly);
    }
    this.updateVisiblePoligonos(); // inserido na implementação de visualiza camada
    if (this.modoEdicaoPoligonoArmado) {
      this.reinstalarDuploCliquePoligonosModoArmado();
    }
    console.log('Polígonos atualizados:', this.poligonosMapa.length);
  }

  /** Rótulos no centro do polígono: mesmo limiar de zoom que as CEO (`ZOOM_LEVEL_CAIXAS`). */
  private refreshPoligonosLabelMarkersVisibility(): void {
    if (!this.map) {
      return;
    }
    const mapRef = this.map;
    const show = this.layerVisibilityService.isVisible('poligonos') && this.currentZoom >= this.ZOOM_LEVEL_CAIXAS; // inserido na implementação visualização de camadas
    const aplicarVisibilidade = (markers: google.maps.Marker[]) => {
      for (const m of markers) {
        if (!m) {
          continue;
        }
        if (show) {
          m.setMap(mapRef);
          m.setVisible(true);
        } else {
          m.setVisible(false);
          m.setMap(null);
        }
      }
    };
    aplicarVisibilidade(this.poligonosLabelMarkers);
    aplicarVisibilidade(this.poligonosLabelMarkersLocais);
  } // até aqui construção dos poligono ===================================================================================


// função para carregar dios no mapa==============================
  private updateMarkersDios() {
    if (!this.layerVisibilityService.isVisible('estacoes')) {
      return;
    }

    if (this.destinoDios && this.destinoDios.length > 0 && this.map) {
      this.markerDios.forEach(marker => marker.setMap(null));
      this.markerDios = [];
    }
    
    this.destinoDios.forEach(location => {
      const position = {
        lat: Number(location.LAT),
        lng: Number(location.LNG)
      };
      
      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.sigla || 'Sem nome',
        draggable: false,
        opacity:10,
        label: {
          text: 'DIO: ' + location.sigla || 'S/N',
          color: 'blue',
          fontSize: '12px'
        } as google.maps.MarkerLabel,
      icon: {
        url: '/assets/dioV2.png',
        labelOrigin: new google.maps.Point(50, 30),
        scaledSize: new google.maps.Size(120, 21.6),
      },
      visible: this.currentZoom >= this.ZOOM_LEVEL_DIOS
      ///visible: false
      };

      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }

      this.gravarCamposDioNoMarcador(marker, location);
      
      // Variáveis para controlar cliques
      let clickTimeout: any;
      
      // Adicionar listener de clique simples para abrir InfoWindow
      marker.addListener('click', (event: google.maps.MapMouseEvent) => {
        // Limpar timeout anterior se existir
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }

        // Definir timeout para clique simples
        clickTimeout = setTimeout(() => {
          // Clique simples - mostrar InfoWindow
          console.log('🔍 [DIO] Clique simples detectado no DIO:', location.id_meta);
          this.showMarkerInfoWindow(marker, event, 'dio', location);
        }, 300); // Delay de 300ms para distinguir de duplo clique
      });
      
      // Adicionar listener de duplo clique para EDITAR DIO (movimentar)
      marker.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
        console.log('🖱️ [DIO] Double-click no DIO:', location);
        
        // Cancelar clique simples se estiver pendente
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }
        
        // Fechar InfoWindow se estiver aberto
        if (this.currentMarkerInfoWindow) {
          this.currentMarkerInfoWindow.close();
        }
        
        const index = this.markerDios.indexOf(marker);
        if (index !== -1) {
          this.habilitarEdicaoDio(index);
        }
      });

      // 🆕 Adicionar listener de rightclick para context menu do DIO
      marker.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
        console.log('🔴 [DIO] Right-click no DIO:', location);
        
        // Cancelar clique simples se estiver pendente
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }
        
        // Fechar InfoWindow se estiver aberto
        if (this.currentMarkerInfoWindow) {
          this.currentMarkerInfoWindow.close();
        }
        
        this.clickedDioData = location;
        this.contextMenuType = 'dio';
        
        if (event.domEvent) {
          const mouseEvent = event.domEvent as MouseEvent;
          this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
        }
      });
      
      this.markerDios.push(marker);
      });

    console.log('Dios atualizados:', this.markerDios);    
  }




  //=====================================função para carregar as POPs na Tela================================
  private updateMarkersCondominios() {
    
    if (!this.layerVisibilityService.isVisible('condominios')) {
      return;
    }

      if (this.destinoCondominios && this.destinoCondominios.length > 0 && this.map) {
        this.markerCondominios.forEach(marker => marker.setMap(null));
        this.markerCondominios = [];
        
        this.destinoCondominios.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LNG)
          };

    

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.sigla || 'Sem nome',
        draggable: false,
        opacity:0.8,
        label: {
          text: location.sigla || 'S/N',
          color: 'blue',
          fontSize: '9px'
          
        } as google.maps.MarkerLabel,
        icon: {
          url: '/assets/BLOCO5.png',
          labelOrigin: new google.maps.Point(50, 0),
          scaledSize: new google.maps.Size(50, 50),
                 
          
        },

        visible: this.currentZoom >= this.ZOOM_LEVEL_CONDOMINIOS
        ///visible: false

      };
      
      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }

      this.gravarCamposCondominioNoMarcador(marker, location);
      
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const index = this.markerCondominios.indexOf(marker);
        if (index !== -1) {
          this.onMarkerDragEnd(event, index, true);
        }
      });

      marker.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
        const condominioData =
          (marker.get('condominio_data') as Condominios | undefined) ?? location;

        if (!condominioData) {
          return;
        }

        console.log('🔴 [CONDOMINIO] Right-click no condomínio:', condominioData);

        this.clickedCondominioData = condominioData;
        this.clickedCondominioMarker = marker;
        this.clickedCaixaData = null;
        this.clickedCTOData = null;
        this.clickedCTOSPData = null;
        this.clickedDioData = null;
        this.clickedCliData = null;
        this.clickedCliAtData = null;
        this.clickedCliDesData = null;
        this.clickedClienteMarker = null;
        this.clickedEstacaoData = null;
        this.contextMenuType = 'condominio';

        if (event.domEvent) {
          const mouseEvent = event.domEvent as MouseEvent;
          this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
        }
      });

      //this.addMarkerEventListeners(marker, true);
      
      this.markerCondominios.push(marker);
    });
      
      console.log('Condominios atualizadas:', this.markerCondominios);
    }
  }

  /** id_meta, sigla, NUM_PAVIM e condominio_data no MVCObject do Marker (Google Maps). */
  private gravarCamposCondominioNoMarcador(
    marker: google.maps.Marker,
    location: Condominios,
  ): void {
    if (location.id_meta != null && Number(location.id_meta) > 0) {
      marker.set('id_meta', Number(location.id_meta));
    }
    if (location.sigla != null && String(location.sigla).trim() !== '') {
      marker.set('sigla', String(location.sigla).trim());
    }
    const numPavim = this.normalizarNumPavim(location.NUM_PAVIM);
    if (numPavim != null) {
      marker.set('NUM_PAVIM', numPavim);
    }
    marker.set('condominio_data', location);
  }

  private normalizarNumPavim(valor: unknown): number | undefined {
    if (valor === undefined || valor === null) {
      return undefined;
    }
    const n = typeof valor === 'number' ? valor : Number(valor);
    if (!Number.isFinite(n) || n <= 0) {
      return undefined;
    }
    return Math.floor(n);
  }

  private resolverNumPavimCondominio(condominio: Condominios): number | undefined {
    return this.normalizarNumPavim(condominio.NUM_PAVIM);
  }

  /** id_meta, CAPACIDADE, sigla e dio_data no MVCObject do Marker (Google Maps). */
  private gravarCamposDioNoMarcador(
    marker: google.maps.Marker,
    dio: { id_meta?: number; sigla?: string; CAPACIDADE?: number }
  ): void {
    if (dio.id_meta != null && Number(dio.id_meta) > 0) {
      marker.set('id_meta', dio.id_meta);
    }
    if (dio.CAPACIDADE != null && Number.isFinite(Number(dio.CAPACIDADE))) {
      marker.set('CAPACIDADE', Number(dio.CAPACIDADE));
    }
    if (dio.sigla != null && String(dio.sigla).trim() !== '') {
      marker.set('sigla', String(dio.sigla).trim());
    }
    marker.set('dio_data', dio);
  }

  /** id_meta, recurso_* e portas_olt no MVCObject do Marker (Google Maps). */
  private gravarCamposClienteNoMarcador(marker: google.maps.Marker, location: PopsCli): void {
    const idMeta = location.id_meta;
    if (idMeta != null && Number.isFinite(Number(idMeta)) && Number(idMeta) > 0) {
      marker.set('id_meta', idMeta);
    }
    this.marcarRecursosClienteNoMarcador(marker, {
      recurso_caixa: location.recurso_caixa,
      recurso_sp: location.recurso_sp,
      recurso_sp_saida: location.recurso_sp_saida,
      portas_olt: location.portas_olt,
    });
  }

  /** Grava recurso_caixa / recurso_sp / recurso_sp_saida / portas_olt (números finitos >= 0). */
  private marcarRecursosClienteNoMarcador(
    marker: google.maps.Marker,
    r: {
      recurso_caixa?: number | null;
      recurso_sp?: number | null;
      recurso_sp_saida?: number | null;
      portas_olt?: number | null;
    },
  ): void {
    const setRecurso = (
      chave: 'recurso_caixa' | 'recurso_sp' | 'recurso_sp_saida' | 'portas_olt',
      v: number | undefined | null,
    ): void => {
      if (v === undefined || v === null) {
        return;
      }
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isFinite(n) || n < 0) {
        return;
      }
      marker.set(chave, n);
    };
    setRecurso('recurso_caixa', r.recurso_caixa);
    setRecurso('recurso_sp', r.recurso_sp);
    setRecurso('recurso_sp_saida', r.recurso_sp_saida);
    setRecurso('portas_olt', r.portas_olt);
  }

  /** Une o PopsCli do vetor com recurso_* e portas_olt lidos do marcador (marker.get). */
  private popsCliMesclandoRecursosMarcador(marker: google.maps.Marker, base: PopsCli): PopsCli {
    const lerMarcadorNum = (k: string): number | undefined => {
      const raw = marker.get(k);
      if (raw === undefined || raw === null) {
        return undefined;
      }
      const n = typeof raw === 'number' ? raw : Number(raw);
      return Number.isFinite(n) && n >= 0 ? n : undefined;
    };
    const rc = lerMarcadorNum('recurso_caixa');
    const rsp = lerMarcadorNum('recurso_sp');
    const rsa = lerMarcadorNum('recurso_sp_saida');
    const po = lerMarcadorNum('portas_olt');
    return {
      ...base,
      recurso_caixa: rc !== undefined ? rc : base.recurso_caixa,
      recurso_sp: rsp !== undefined ? rsp : base.recurso_sp,
      recurso_sp_saida: rsa !== undefined ? rsa : base.recurso_sp_saida,
      portas_olt: po !== undefined ? po : base.portas_olt,
    };
  }

  /** Lê recurso_* e portas_olt do MVCObject do marcador (fonte fiável quando o vetor destino atrasa). */
  private extrairRecursosDoMarcadorCliente(marker: google.maps.Marker | null): {
    recurso_caixa?: number;
    recurso_sp?: number;
    recurso_sp_saida?: number;
    portas_olt?: number;
  } {
    if (!marker) {
      return {};
    }
    const num = (k: string): number | undefined => {
      const raw = marker.get(k);
      if (raw === undefined || raw === null) {
        return undefined;
      }
      const n = typeof raw === 'number' ? raw : Number(raw);
      return Number.isFinite(n) && n >= 0 ? n : undefined;
    };
    const out: {
      recurso_caixa?: number;
      recurso_sp?: number;
      recurso_sp_saida?: number;
      portas_olt?: number;
    } = {};
    const rc = num('recurso_caixa');
    const rsp = num('recurso_sp');
    const rsa = num('recurso_sp_saida');
    const po = num('portas_olt');
    if (rc !== undefined) {
      out.recurso_caixa = rc;
    }
    if (rsp !== undefined) {
      out.recurso_sp = rsp;
    }
    if (rsa !== undefined) {
      out.recurso_sp_saida = rsa;
    }
    if (po !== undefined) {
      out.portas_olt = po;
    }
    return out;
  }

  private findMarcadorClientePorIdMeta(idMeta: number): google.maps.Marker | null {
    if (!Number.isFinite(idMeta) || idMeta <= 0) {
      return null;
    }
    const pares: readonly (readonly [PopsCli[], google.maps.Marker[]])[] = [
      [this.destinoPopsCli ?? [], this.markerPopsCli],
      [this.destinoPopsCliAtv ?? [], this.markerPopsCliAtv],
      [this.destinoPopsCliDes ?? [], this.markerPopsCliDes],
    ];
    for (const [dest, markers] of pares) {
      const i = dest.findIndex((c) => c?.id_meta === idMeta);
      if (i !== -1 && markers[i]) {
        return markers[i];
      }
    }
    return null;
  }

  private findMarcadorCaixaPorIdMeta(idMeta: number): { marker: google.maps.Marker; tipo: 'ceo' | 'cto' | 'ctosp' } | null {
    if (!Number.isFinite(idMeta) || idMeta <= 0) {
      return null;
    }
    const pares: readonly (readonly ['ceo' | 'cto' | 'ctosp', { id_meta?: number }[], google.maps.Marker[]])[] = [
      ['ceo', this.destino ?? [], this.markerCaixas],
      ['cto', this.destinoCTO ?? [], this.markerCtos],
      ['ctosp', this.destinoCTOSP ?? [], this.markerCtosSP],
    ];
    for (const [tipo, dest, markers] of pares) {
      const i = dest.findIndex((c) => c?.id_meta === idMeta);
      if (i !== -1 && markers[i]) {
        return { marker: markers[i], tipo };
      }
    }
    return null;
  }

  private aplicarInstaladaCaixaNoMapa(idMeta: number, instalada: 0 | 1): void {
    const arrays: { dest: { id_meta?: number; INSTALADA?: number | string }[] }[] = [
      { dest: this.destino ?? [] },
      { dest: this.destinoCTO ?? [] },
      { dest: this.destinoCTOSP ?? [] },
    ];
    for (const { dest } of arrays) {
      const item = dest.find((c) => c?.id_meta === idMeta);
      if (item) {
        item.INSTALADA = instalada;
        break;
      }
    }

    const found = this.findMarcadorCaixaPorIdMeta(idMeta);
    if (found) {
      found.marker.setIcon(this.obterIconeCaixaPorTipo(found.tipo, instalada));
    }
  }

  private resolverMarcadorAtivacaoCliente(idMetaCliente: number | undefined): google.maps.Marker | null {
    const guardado = this.marcadorClienteAtivacaoModal;
    if (guardado != null && idMetaCliente != null) {
      const mId = guardado.get('id_meta');
      const n = typeof mId === 'number' ? mId : Number(mId);
      if (Number.isFinite(n) && n === idMetaCliente) {
        return guardado;
      }
    }
    if (idMetaCliente != null) {
      return this.findMarcadorClientePorIdMeta(idMetaCliente);
    }
    return guardado;
  }

  private aplicarRecursosAtivacaoNoMarcadorCliente(result: {
    payload: UpdateClienteAtivacaoResponse;
    idMetaCliente?: number;
    recursoFormulario?: { caixa?: number; sp?: number; saida?: number };
  }): void {
    const marker = this.resolverMarcadorAtivacaoCliente(result.idMetaCliente);
    if (!marker) {
      console.warn('[ativacao-cliente] Marcador não encontrado para id_meta', result.idMetaCliente);
      return;
    }
    const p = result.payload;
    const form = result.recursoFormulario;
    const numApi = (v: unknown): number | undefined => {
      if (v === undefined || v === null) {
        return undefined;
      }
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isFinite(n) || n < 0) {
        return undefined;
      }
      return n;
    };
    const pick = (apiRaw: unknown, formVal: number | undefined): number | undefined => {
      const fromApi = numApi(apiRaw);
      if (fromApi !== undefined) {
        return fromApi;
      }
      if (formVal != null && Number.isFinite(formVal) && formVal >= 0) {
        return formVal;
      }
      return undefined;
    };
    this.marcarRecursosClienteNoMarcador(marker, {
      recurso_caixa: pick(p.recurso_caixa, form?.caixa),
      recurso_sp: pick(p.recurso_sp, form?.sp),
      recurso_sp_saida: pick(p.recurso_sp_saida, form?.saida),
      portas_olt: pick(p.portas_olt, undefined),
    });
    marker.setIcon(this.iconeMarcadorClienteCirculoAtivo());
    const textAtv = this.obterTextoLabelMarcadorCliente(marker);
    marker.setLabel({ text: textAtv, color: 'blue', fontSize: '10px' });
  }

  private aplicarDesativacaoClienteNoMarcadorCliente(idMetaCliente?: number): void {
    const marker = this.resolverMarcadorAtivacaoCliente(idMetaCliente);
    if (!marker) {
      console.warn('[ativacao-cliente] Marcador não encontrado para desativação id_meta', idMetaCliente);
      return;
    }
    this.marcarRecursosClienteNoMarcador(marker, {
      recurso_caixa: 0,
      recurso_sp: 0,
      recurso_sp_saida: 0,
      portas_olt: 0,
    });
    marker.setIcon(this.iconeMarcadorClienteCirculoPadrao());
    const text = this.obterTextoLabelMarcadorCliente(marker);
    marker.setLabel({ text, color: 'gray', fontSize: '10px' });
  }

  private aplicarPortasOltOcupacaoNoMarcadorCliente(
    portasOltId: number,
    idMetaCliente?: number,
  ): void {
    if (!Number.isFinite(portasOltId) || portasOltId <= 0 || !Number.isInteger(portasOltId)) {
      return;
    }
    const marker = this.resolverMarcadorAtivacaoCliente(idMetaCliente);
    if (!marker) {
      console.warn('[ativacao-cliente] Marcador não encontrado para portas_olt id_meta', idMetaCliente);
      return;
    }
    this.marcarRecursosClienteNoMarcador(marker, { portas_olt: portasOltId });
  }

  /** 1 = instalada, 0 = não instalada (default instalada se ausente). */
  private caixaEstaInstalada(instalada: unknown): boolean {
    if (instalada == null || instalada === '') {
      return true;
    }
    return Number(instalada) === 1;
  }

  /** CEO / CTO / CTOSP: ID_TIPO > 9 = CTO; conta_splitter > 0 = CTOSP. */
  private classificarTipoCaixa(
    idTipo: number,
    contaSplitter?: number | string | null,
  ): 'ceo' | 'cto' | 'ctosp' {
    if (idTipo > 9) {
      return Number(contaSplitter ?? 0) > 0 ? 'ctosp' : 'cto';
    }
    return 'ceo';
  }

  /** Ícone por tipo de marcador e INSTALADA. */
  private obterIconeCaixaPorTipo(
    tipo: 'ceo' | 'cto' | 'ctosp',
    instalada: unknown,
  ): google.maps.Icon {
    const ok = this.caixaEstaInstalada(instalada);

    if (tipo === 'ctosp') {
      return {
        url: ok ? '/assets/CTOSP.png' : '/assets/CTOSP_VERMELHA.png',
        labelOrigin: new google.maps.Point(50, 10),
        scaledSize: new google.maps.Size(18, 22),
      };
    }

    if (tipo === 'cto') {
      return {
        url: ok ? '/assets/CTO80.png' : '/assets/CTO80_VERMELHA.png',
        labelOrigin: new google.maps.Point(50, 10),
        scaledSize: new google.maps.Size(18, 22),
      };
    }

    return {
      url: ok ? '/assets/fosc amarela.png' : '/assets/fosc vermelha.png',
      labelOrigin: new google.maps.Point(70, 10),
      scaledSize: new google.maps.Size(20, 40),
    };
  }

  /** Ícone CEO / CTO / CTOSP conforme ID_TIPO, conta_splitter e INSTALADA. */
  private obterIconeCaixa(
    idTipo: number,
    instalada: unknown,
    contaSplitter?: number | string | null,
  ): google.maps.Icon {
    return this.obterIconeCaixaPorTipo(
      this.classificarTipoCaixa(idTipo, contaSplitter),
      instalada,
    );
  }

  /** Ícone ampliado para modo edição (preserva variant instalada/não instalada). */
  private obterIconeCaixaEdicao(
    idTipo: number,
    instalada: unknown,
    contaSplitter?: number | string | null,
  ): google.maps.Icon {
    const tipo = this.classificarTipoCaixa(idTipo, contaSplitter);
    const icon = this.obterIconeCaixaPorTipo(tipo, instalada);
    if (tipo === 'ceo') {
      return { ...icon, scaledSize: new google.maps.Size(25, 45) };
    }
    return { ...icon, scaledSize: new google.maps.Size(22, 26) };
  }

  /** Asterisco amarelo com contorno preto — sobras (`updateMarkersSegmentos`). */
  private iconeMarcadorSobraAsterisco(): google.maps.Icon {
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">',
      '<text x="30" y="30" text-anchor="middle" dominant-baseline="central"',
      ' font-family="Arial,sans-serif" font-size="48" font-weight="bold"',
      ' fill="#FFD700" stroke="#000000" stroke-width="2.5" paint-order="stroke fill">*</text>',
      '</svg>',
    ].join('');
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(40, 40),
      // Ajuste fino: glifo "*" do Arial fica ligeiramente NW do centro geométrico
      anchor: new google.maps.Point(17, 17),
    };
  }

  /** Círculo vermelho padrão de `updateMarkersPopsCli` — reutilizado pós-desactivação no mapa. */
  private iconeMarcadorClienteCirculoPadrao(): google.maps.Symbol {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: 'red',
      fillOpacity: 0.7,
      strokeColor: 'darkred',
      strokeWeight: 2,
      scale: 4,
      labelOrigin: new google.maps.Point(0, -2),
    };
  }

  /** Cliente com saída de splitter (`tstmeta.pop.recurso_sp` ≠ 0). */
  private clienteConectadoSplitter(location: PopsCli | Record<string, unknown>): boolean {
    const raw =
      (location as PopsCli).recurso_sp ??
      (location as Record<string, unknown>)['recurso_sp'];
    const n = Number.parseInt(String(raw ?? 0), 10);
    return Number.isFinite(n) && n !== 0;
  }

  private estiloMarcadorClientePorRecursoSp(location: PopsCli | Record<string, unknown>): {
    icon: google.maps.Symbol;
    labelColor: string;
  } {
    if (this.clienteConectadoSplitter(location)) {
      return {
        icon: this.iconeMarcadorClienteCirculoAtivo(),
        labelColor: 'blue',
      };
    }
    return {
      icon: this.iconeMarcadorClienteCirculoPadrao(),
      labelColor: 'gray',
    };
  }

  /** Círculo cyan/azul de `updateMarkersPopsCliAtv` — reutilizado pós-activação no modal. */
  private iconeMarcadorClienteCirculoAtivo(): google.maps.Symbol {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: 'cyan',
      fillOpacity: 0.7,
      strokeColor: 'blue',
      strokeWeight: 2,
      scale: 4,
      labelOrigin: new google.maps.Point(0, -2),
    };
  }

  /** Texto do rótulo do marcador cliente (para manter sigla ao mudar para estilo «base»). */
  private obterTextoLabelMarcadorCliente(marker: google.maps.Marker): string {
    const lbl = marker.getLabel();
    if (typeof lbl === 'string' && lbl.trim()) {
      return lbl.trim();
    }
    if (lbl != null && typeof lbl === 'object') {
      const t = String((lbl as google.maps.MarkerLabel).text ?? '').trim();
      if (t) {
        return t;
      }
    }
    const title = marker.getTitle?.();
    if (typeof title === 'string' && title.trim()) {
      return title.trim();
    }
    return 'S/N';
  }

//=====================================função para carregar as POPs na Tela================================
  private updateMarkersPopsCli() {
    
    if (!this.layerVisibilityService.isVisible('clientes')) { //inserido na implementação visualização de camadas
      return;
    }

      if (this.destinoPopsCli && this.destinoPopsCli.length > 0 && this.map) {
        this.markerPopsCli.forEach(marker => marker.setMap(null));
        this.markerPopsCli = [];
        
        this.destinoPopsCli.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LNG)
          };

    

      const siglaTexto = (location as any).sigla || (location as any).SIGLA || 'S/N';
      const estiloCli = this.estiloMarcadorClientePorRecursoSp(location);
      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: siglaTexto,
        draggable: false,
        opacity: 0.8,
        label: {
          text: siglaTexto,
          color: estiloCli.labelColor,
          fontSize: '10px'
        } as google.maps.MarkerLabel,
        icon: estiloCli.icon,

        visible: this.currentZoom >= this.ZOOM_LEVEL_CLIENTES
        ///visible: false

      };
      
      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }

      this.gravarCamposClienteNoMarcador(marker, location);

      this.addMarkerEventListeners(marker, false, false, true, false, false);

      this.markerPopsCli.push(marker);
    });

      console.log('Clientes atualizados:', this.markerPopsCli);
    }
  }


//=====================================função para carregar as POPs na Tela================================
  private updateMarkersPopsCliDes() {
    
    if (!this.layerVisibilityService.isVisible('clientes_cancelados')) {// implementação visualização de camadas
      return;
    }

      if (this.destinoPopsCliDes && this.destinoPopsCliDes.length > 0 && this.map) {
        this.markerPopsCliDes.forEach(marker => marker.setMap(null));
        this.markerPopsCliDes = [];
        
        this.destinoPopsCliDes.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LNG)
          };

    

      const siglaTexto = (location as any).sigla || (location as any).SIGLA || 'S/N';
      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: siglaTexto,
        draggable: false,
        opacity: 0.8,
        label: {
          text: siglaTexto,
          color: 'gray',
          fontSize: '10px'
        } as google.maps.MarkerLabel,
        icon: {
          
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: 'gray', // Cor de preenchimento vermelha
          fillOpacity: 0.7, // Opacidade do preenchimento
          strokeColor: 'black', // Cor da borda
          strokeWeight: 2, // Espessura da borda
          scale: 4, // Tamanho do círculo
          labelOrigin: new google.maps.Point(0, -2),
          
          
          
          
        },

        visible: this.currentZoom >= this.ZOOM_LEVEL_CLIENTES_DISABLES
        ///visible: false

      };
      
      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }

      this.gravarCamposClienteNoMarcador(marker, location);

      this.addMarkerEventListeners(marker, false, false, false, false, true);

      this.markerPopsCliDes.push(marker);
    });

      console.log('Clientes Desativados atualizados:', this.markerPopsCliDes);
    }
  }



//=====================================função para carregar Clientes Ativos na Tela================================
  private updateMarkersPopsCliAtv() {
    
    if (!this.layerVisibilityService.isVisible('clientes_ativos')) {// implementação visualização de camadas
      return;
    }

      if (this.destinoPopsCliAtv && this.destinoPopsCliAtv.length > 0 && this.map) {
        this.markerPopsCliAtv.forEach(marker => marker.setMap(null));
        this.markerPopsCliAtv = [];
        
        this.destinoPopsCliAtv.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LNG)
          };

    

      const siglaTexto = (location as any).sigla || (location as any).SIGLA || 'S/N';
      const estiloAtv = this.estiloMarcadorClientePorRecursoSp(location);
      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: siglaTexto,
        draggable: false,
        opacity: 0.8,
        label: {
          text: siglaTexto,
          color: estiloAtv.labelColor,
          fontSize: '10px'
        } as google.maps.MarkerLabel,
        icon: estiloAtv.icon,

        visible: this.currentZoom >= this.ZOOM_LEVEL_CLIENTES_ATIVOS
        ///visible: false

      };
      
      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }

      this.gravarCamposClienteNoMarcador(marker, location);

      this.addMarkerEventListeners(marker, false, false, false, true, false);

      this.markerPopsCliAtv.push(marker);
    });

      console.log('Clientes Ativados atualizados:', this.markerPopsCliAtv);
    }
  }






//=====================================função para carregar as POPs na Tela================================
  private updateMarkersPopsEst() {
    
    if (!this.layerVisibilityService.isVisible('estacoes')) {//inserido na implementação visualização de camadas
      return;
    }

      if (this.destinoPopsEst && this.destinoPopsEst.length > 0 && this.map) {
        this.markerPopsEst.forEach(marker => marker.setMap(null));
        this.markerPopsEst = [];
        
        this.destinoPopsEst.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LNG)
          };

    

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.sigla || 'Sem nome',
        draggable: false,
        opacity:0.8,
        label: {
          text: location.sigla || 'S/N',
          color: 'red',
          fontSize: '13px'
        } as google.maps.MarkerLabel,
        icon: {
          url: '/assets/TORRE4.png',
          labelOrigin: new google.maps.Point(50, 0),
          scaledSize: new google.maps.Size(25, 25),
          
          
          
        },

        visible: this.currentZoom >= this.ZOOM_LEVEL_POPS
        ///visible: false

      };
      
      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }
      
      // 🆕 Armazenar id_meta no marcador (se disponível) - igual aos cabos
      // Agora usando location.id_meta diretamente (tipado na interface PopsEst)
      if (location.id_meta) {
        marker.set('id_meta', location.id_meta);
        marker.set('estacao_data', location); // Armazenar objeto completo (seguindo padrão dos cabos)
        console.log('🔴 [MARKER] id_meta armazenado no marcador:', location.id_meta);
        console.log('🔴 [MARKER] Objeto completo da estação armazenado no marcador');
      } else {
        console.warn('⚠️ [MARKER] id_meta não encontrado no objeto location:', location);
      }
      
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const index = this.markerPopsEst.indexOf(marker);
        if (index !== -1) {
          this.onMarkerDragEnd(event, index, true);
        }
      });

      // 🆕 Adicionar listener de right-click para context menu da estação
      marker.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
        console.log('🔴 [CONTEXT-MENU] Right-click detectado no marcador de estação');
        
        // Prevenir menu padrão do navegador
        if (event.domEvent) {
          event.domEvent.preventDefault();
          event.domEvent.stopPropagation();
        }

        const index = this.markerPopsEst.indexOf(marker);
        if (index !== -1) {
          const estacao = this.destinoPopsEst[index];
          
          // 🆕 Recuperar id_meta do marcador (prioridade sobre o objeto estacao)
          const idMetaDoMarcador = marker.get('id_meta');
          if (idMetaDoMarcador) {
            estacao.id_meta = idMetaDoMarcador; // Agora tipado na interface
            console.log('🔴 [CONTEXT-MENU] id_meta recuperado do marcador:', idMetaDoMarcador);
          } else if (estacao.id_meta) {
            // Se não estiver no marcador, usar do objeto estacao diretamente (agora tipado)
            console.log('🔴 [CONTEXT-MENU] id_meta obtido do objeto estacao:', estacao.id_meta);
          } else {
            console.warn('⚠️ [CONTEXT-MENU] id_meta não encontrado no marcador nem no objeto estacao');
          }
          
          console.log('🔴 [CONTEXT-MENU] Estação encontrada no índice:', index);
          console.log('🔴 [CONTEXT-MENU] Dados da estação:', estacao);
          console.log('🔴 [CONTEXT-MENU] id_meta da estação:', estacao.id_meta);
          
          // Armazenar dados da estação clicada
          this.clickedEstacaoData = estacao;
          this.clickedCaixaData = null;
          this.clickedCTOData = null;
          this.clickedCTOSPData = null;
          this.clickedDioData = null;
          this.clickedCliData = null;
          this.clickedCliAtData = null;
          this.clickedCliDesData = null;
          // Não misturar cliente/marcador anterior com o menu da estação.
          this.clickedClienteMarker = null;
          
          // Definir tipo de contexto como 'estacao'
          this.contextMenuType = 'estacao';
          
          // Mostrar context menu na posição do clique
          if (event.domEvent) {
            const mouseEvent = event.domEvent as MouseEvent;
            console.log('🔴 [CONTEXT-MENU] Mostrando context menu para estação em:', mouseEvent.clientX, mouseEvent.clientY);
            this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
          }
        }
      });

      // Adicionar listener de duplo clique para EDITAR ESTAÇÃO (movimentar)
      marker.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
        console.log('🖱️ [ESTAÇÃO] Double-click na estação:', location);
        
        // Fechar InfoWindow se estiver aberto
        if (this.currentMarkerInfoWindow) {
          this.currentMarkerInfoWindow.close();
        }
        
        const index = this.markerPopsEst.indexOf(marker);
        if (index !== -1) {
          this.habilitarEdicaoEstacao(index);
        }
      });

      //this.addMarkerEventListeners(marker, true);
      
      this.markerPopsEst.push(marker);
    });
      
      console.log('Estações atualizadas:', this.markerPopsEst);
    }
  }









    // =============================== função para carregar o marcadores Caixas na tela =========
    private updateMarkers() {

    const ceo_layer = this.layerVisibilityService.isVisible('ceo'); //inserido na implementação visualização de camadas
    if (!ceo_layer) {
      return;
    } // flag visualiza CEO
    if (this.destino && this.destino.length > 0 && this.map) {
      this.markerCaixas.forEach(marker => marker.setMap(null));
      this.markerCaixas = [];
      
      this.destino.forEach(location => {
        const position = {
          lat: Number(location.LAT),
          lng: Number(location.LONGI)
        };
        
        
          
          const markerOptions: google.maps.MarkerOptions = {
            position: position,
            title: location.numero || 'Sem número',
            draggable: false,
            label: {
              text: location.numero || 'S/N',
              color: 'blue',
              fontSize: '12px'
            } as google.maps.MarkerLabel,
            icon: this.obterIconeCaixaPorTipo('ceo', (location as Caixa).INSTALADA),            
            visible: this.currentZoom >= this.ZOOM_LEVEL_CAIXAS
            ///visible:false
          };
          
          const marker = new google.maps.Marker(markerOptions);
          
          if (this.map) {
            marker.setMap(this.map);
          }
          
          // substituido pela funçõa addmarkereventlistener ************************************************
          //marker.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
          //  const index = this.markerCaixas.indexOf(marker);
           // if (index !== -1) {
           //   this.onMarkerClick(event, index);
           // }
         // });
          
          //marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
          //  const index = this.markerCaixas.indexOf(marker);
          //  if (index !== -1) {
          //    this.onMarkerDragEnd(event, index, false);
          //  }
          //});
          // substituido pela funçõa addmarkereventlistener ************************************************

          this.addMarkerEventListeners(marker, false, false, false, false, false);
          
          this.markerCaixas.push(marker);
        });
      
      console.log('Marcadores CEO atualizados:', this.markerCaixas);
    }
  }  //======================================================================================================

  /**
   * Adiciona um marcador de caixa individual ao mapa
   * @param caixa Objeto com dados da caixa (id_meta, numero, LAT, LONGI, ID_TIPO)
   */
  private adicionarMarcadorCaixa(caixa: {
    id_meta?: number;
    numero?: string;
    LAT: number;
    LONGI: number;
    ID_TIPO?: string;
    INSTALADA?: number | string;
    conta_splitter?: number | string;
  }): void {
    if (!this.map) {
      console.warn('⚠️ [ADICIONAR-MARCADOR-CAIXA] Mapa não está inicializado');
      return;
    }

    const position = { lat: Number(caixa.LAT), lng: Number(caixa.LONGI) };
    
    // Determinar ícone baseado no ID_TIPO
    const idTipo = parseInt(caixa.ID_TIPO || '1', 10);
    const contaSplitter = Number(caixa.conta_splitter ?? 0);
    const tipoMarcador = this.classificarTipoCaixa(idTipo, contaSplitter);
    let isCTO = tipoMarcador === 'cto';
    let isCTOSP = tipoMarcador === 'ctosp';

    if (isCTO) {
      if (!this.layerVisibilityService.isVisible('cto')) {
        return;
      }
    } else if (isCTOSP) {
      if (!this.layerVisibilityService.isVisible('ctosp')) {
        return;
      }
    } else {
      if (!this.layerVisibilityService.isVisible('ceo')) {
        return;
      }
    }

    const zoomLevel = isCTO ? this.ZOOM_LEVEL_CTOS : (isCTOSP ? this.ZOOM_LEVEL_CTOSSP : this.ZOOM_LEVEL_CAIXAS);
    const icon = this.obterIconeCaixa(idTipo, caixa.INSTALADA, contaSplitter);

    const markerOptions: google.maps.MarkerOptions = {
      position: position,
      title: caixa.numero || 'Sem número',
      draggable: false,
      label: {
        text: caixa.numero || 'S/N',
        color: 'blue',
        fontSize: '12px'
      } as google.maps.MarkerLabel,
      icon,
      visible: this.currentZoom >= zoomLevel
    };

    const marker = new google.maps.Marker(markerOptions);
    marker.setMap(this.map);
    
    // Adicionar event listeners com os parâmetros corretos baseado no tipo
    this.addMarkerEventListeners(marker, isCTO, isCTOSP, false, false, false);
    
    // Adicionar ao array correto baseado no tipo
    if (isCTO) {
      this.markerCtos.push(marker);
      // Adicionar ao destinoCTO
      this.destinoCTO.push({
        id_meta: caixa.id_meta,
        numero: caixa.numero,
        LAT: caixa.LAT,
        LONGI: caixa.LONGI,
        ID_TIPO: caixa.ID_TIPO || String(idTipo),
        INSTALADA: caixa.INSTALADA,
        conta_splitter: 0,
      } as any);
    } else if (isCTOSP) {
      this.markerCtosSP.push(marker);
      this.destinoCTOSP.push({
        id_meta: caixa.id_meta,
        numero: caixa.numero,
        LAT: caixa.LAT,
        LONGI: caixa.LONGI,
        ID_TIPO: caixa.ID_TIPO || String(idTipo),
        INSTALADA: caixa.INSTALADA,
        conta_splitter: contaSplitter || 1,
      } as any);
    } else {
      this.markerCaixas.push(marker);
      this.destino.push({
        id_meta: caixa.id_meta,
        numero: caixa.numero,
        LAT: caixa.LAT,
        LONGI: caixa.LONGI,
        ID_TIPO: caixa.ID_TIPO || '1',
        INSTALADA: caixa.INSTALADA,
      } as any);
    }
    
    console.log('✅ [ADICIONAR-MARCADOR-CAIXA] Marcador criado:', { 
      id_meta: caixa.id_meta, 
      numero: caixa.numero, 
      position: position, 
      ID_TIPO: idTipo,
      INSTALADA: caixa.INSTALADA,
      tipo: isCTO ? 'CTO' : (isCTOSP ? 'CTO_SP' : 'CEO')
    });
  }

  /**
   * Adiciona um marcador de DIO ao mapa e ao array destinoDios
   * Similar ao adicionarMarcadorCaixa(), mas para DIOs
   */
  private adicionarMarcadorDio(dio: { id_meta?: number; sigla?: string; CAPACIDADE?: number; LAT: number; LNG: number }): void {
    if (!this.map) {
      console.warn('⚠️ [ADICIONAR-MARCADOR-DIO] Mapa não está inicializado');
      return;
    }

    if (!dio.id_meta || dio.id_meta <= 0) {
      console.warn('⚠️ [ADICIONAR-MARCADOR-DIO] id_meta inválido:', dio.id_meta);
      return;
    }

    const position = { lat: Number(dio.LAT), lng: Number(dio.LNG) };
    
    // Validar coordenadas
    if (isNaN(position.lat) || isNaN(position.lng)) {
      console.warn('⚠️ [ADICIONAR-MARCADOR-DIO] Coordenadas inválidas:', position);
      return;
    }

    const markerOptions: google.maps.MarkerOptions = {
      position: position,
      title: dio.sigla || 'Sem nome',
      draggable: false,
      opacity: 10,
      
      label: {
        text: 'DIO: ' + (dio.sigla || 'S/N'),
        color: 'blue',
        fontSize: '12px'
      } as google.maps.MarkerLabel,
      icon: {
        url: '/assets/dioV2.png',
        labelOrigin: new google.maps.Point(50, 30),
        scaledSize: new google.maps.Size(120, 21.6),
      },
      visible: this.currentZoom >= this.ZOOM_LEVEL_DIOS
    };

    const marker = new google.maps.Marker(markerOptions);
    if (this.layerVisibilityService.isVisible('estacoes')) { //inserido na implementação visualização de camadas
      marker.setMap(this.map);
    }

    this.gravarCamposDioNoMarcador(marker, dio);
    
    // Variáveis para controlar cliques
    let clickTimeout: any;
    
    // Adicionar listener de clique simples para abrir InfoWindow
    marker.addListener('click', (event: google.maps.MapMouseEvent) => {
      // Limpar timeout anterior se existir
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }

      // Definir timeout para clique simples
      clickTimeout = setTimeout(() => {
        // Clique simples - mostrar InfoWindow
        console.log('🔍 [DIO] Clique simples detectado no DIO:', dio.id_meta);
        this.showMarkerInfoWindow(marker, event, 'dio', dio as any);
      }, 300); // Delay de 300ms para distinguir de duplo clique
    });
    
    // Adicionar listener de duplo clique para EDITAR DIO (movimentar)
    marker.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
      console.log('🖱️ [DIO] Double-click no DIO:', dio);
      
      // Cancelar clique simples se estiver pendente
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }
      
      // Fechar InfoWindow se estiver aberto
      if (this.currentMarkerInfoWindow) {
        this.currentMarkerInfoWindow.close();
      }
      
      const index = this.markerDios.indexOf(marker);
      if (index !== -1) {
        this.habilitarEdicaoDio(index);
      }
    });

    // Adicionar listener de rightclick para context menu do DIO
    marker.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
      console.log('🔴 [DIO] Right-click no DIO:', dio);
      
      // Cancelar clique simples se estiver pendente
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }
      
      // Fechar InfoWindow se estiver aberto
      if (this.currentMarkerInfoWindow) {
        this.currentMarkerInfoWindow.close();
      }
      
      this.clickedDioData = dio as any;
      this.contextMenuType = 'dio';
      
      if (event.domEvent) {
        const mouseEvent = event.domEvent as MouseEvent;
        this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
      }
    });
    
    // Adicionar ao array de marcadores
    this.markerDios.push(marker);
    
    // Adicionar ao array destinoDios
    this.destinoDios.push({
      id_meta: dio.id_meta,
      sigla: dio.sigla,
      CAPACIDADE: dio.CAPACIDADE,
      LAT: dio.LAT,
      LNG: dio.LNG
    } as any);
    
    console.log('✅ [ADICIONAR-MARCADOR-DIO] Marcador criado:', { 
      id_meta: dio.id_meta, 
      sigla: dio.sigla, 
      position: position,
      capacidade: dio.CAPACIDADE
    });
    console.log('✅ [ADICIONAR-MARCADOR-DIO] DIO adicionado ao array destinoDios. Total de DIOs:', this.destinoDios.length);
  }

  
  onMarkerDragEnd(event: google.maps.MapMouseEvent, index: number, isCTO: boolean = false) {
    if (event.latLng) {
      const newLat = event.latLng.lat();
      const newLng = event.latLng.lng();
      console.log(`Marcador movido para: Lat ${newLat}, Lng ${newLng}`);
      
      // 🔧 NOVO: Se for um item em edição, apenas atualizar visualmente (salvar será no clique no mapa)
      if (this.caixaEmEdicao && this.caixaEmEdicaoIndex === index) {
        if (this.caixaEmEdicaoTipo === 'cto') {
          console.log('📍 [EDITAR-CTO] CTO arrastada para nova posição');
        } else if (this.caixaEmEdicaoTipo === 'ctosp') {
          console.log('📍 [EDITAR-CTOSP] CTO_SP arrastada para nova posição');
        } else if (this.caixaEmEdicaoTipo === 'caixa') {
          console.log('📍 [EDITAR-CAIXA] Caixa arrastada para nova posição');
        }
        // A posição já foi atualizada pelo Google Maps, não precisa fazer nada aqui
        return;
      }
      
      if (isCTO) {
        this.markerCtos[index].setPosition({ lat: newLat, lng: newLng });
      } else {
        this.markerCaixas[index].setPosition({ lat: newLat, lng: newLng });
      }
    }
  }


  //=====================================função para carregar as CTOs na Tela================================
  private updateMarkersCTO() {
    

      if (this.destinoCTO && this.destinoCTO.length > 0 && this.map) {
        this.markerCtos.forEach(marker => marker.setMap(null));
        this.markerCtos = [];
        
        this.destinoCTO.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LONGI)
          };

    

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.numero || 'Sem número',
        draggable: false,
        label: {
          text: location.numero || 'S/N',
          color: 'blue',
          fontSize: '10px'
        } as google.maps.MarkerLabel,
        icon: this.obterIconeCaixaPorTipo('cto', (location as Cto).INSTALADA),
        visible: this.currentZoom >= this.ZOOM_LEVEL_CTOS
        ///visible: false

      };
      
      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }
      
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const index = this.markerCtos.indexOf(marker);
        if (index !== -1) {
          this.onMarkerDragEnd(event, index, true);
        }
      });

      this.addMarkerEventListeners(marker, true, false,false,false,false);
      
      this.markerCtos.push(marker);
    });
      
      console.log('CTOs atualizados:', this.markerCtos);
    }
  }

  //=============================================CONVERSAO==============================

  private convertStringToCoords(coordString: string): google.maps.LatLngLiteral[] {
    try {
      // Se já for um array, retorna diretamente
      if (Array.isArray(coordString)) {
        return coordString.map(coord => ({
          lat: parseFloat(String(coord.lat)),
          lng: parseFloat(String(coord.lng))
        }));
      }

      // Se for uma string, tentar fazer o parse
      const coords = typeof coordString === 'string' ? JSON.parse(coordString) : coordString;
      
      if (Array.isArray(coords)) {
        return coords.map(coord => ({
          lat: parseFloat(String(coord.lat)),
          lng: parseFloat(String(coord.lng))
        }));
      }

      return [];
    } catch (e) {
      console.error('Erro ao converter coordenadas:', e ,coordString);
      return [];
    }
  }


//=====================================função para carregar as CTOs COM SPLITTER na Tela================================
  private updateMarkersCTOSP() {
    

      if (this.destinoCTOSP && this.destinoCTOSP.length > 0 && this.map) {
        this.markerCtosSP.forEach(marker => marker.setMap(null));
        this.markerCtosSP = [];
        
        this.destinoCTOSP.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LONGI)
          };

    

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.numero || 'Sem número',
        draggable: false,
        label: {
          text: location.numero || 'S/N',
          color: 'blue',
          fontSize: '10px'
        } as google.maps.MarkerLabel,
        icon: this.obterIconeCaixaPorTipo('ctosp', (location as Cto_SP).INSTALADA),
        visible: this.currentZoom >= this.ZOOM_LEVEL_CTOSSP
        ///visible: false

      };
      
      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }
      
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const index = this.markerCtosSP.indexOf(marker);
        if (index !== -1) {
          this.onMarkerDragEnd(event, index, true);
        }
      });

      this.addMarkerEventListeners(marker, false, true, false, false, false);
      
      this.markerCtosSP.push(marker);
    });
      
      console.log('CTOs COM SPLITTER atualizados:', this.markerCtosSP);
    }
  }

  


  //==================================================CABOS=====================================

  private updatePolylinesCabos1f() {

    if (!this.layerVisibilityService.isVisible('cabos')) return; //inserido na implementação visualização de camadas


    if (!this.destinoCabos1f?.length) return;
    
    try {
      this.polylinePaths1f = [];
      
      this.destinoCabos1f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths1f.push(coords);
            //console.log(`Cabo 6f  ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths1f.length > 0) {
        const firstPoint = this.polylinePaths1f[0][0];
        
      }

      console.log(`Total de ${this.polylinePaths1f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths1f = [];
    }

     


  }

  private updatePolylinesCabos2f() {

    if (!this.layerVisibilityService.isVisible('cabos')) return; //inserido na implementação visualização de camadas


    if (!this.destinoCabos2f?.length) return;
    
    try {
      this.polylinePaths2f = [];
      
      this.destinoCabos2f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
                    
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths2f.push(coords);
            
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths2f.length > 0) {
        const firstPoint = this.polylinePaths2f[0][0];
        
      }

      console.log(`Total de ${this.polylinePaths2f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths2f = [];
    }
  }


  private updatePolylinesCabos4f() {

    if (!this.layerVisibilityService.isVisible('cabos')) return; //inserido na implementação visualização de camadas


    if (!this.destinoCabos4f?.length) return;
    
    try {
      this.polylinePaths4f = [];
      
      this.destinoCabos4f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
                    
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths4f.push(coords);
            
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths4f.length > 0) {
        const firstPoint = this.polylinePaths4f[0][0];
        
      }

      console.log(`Total de ${this.polylinePaths4f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths2f = [];
    }
  }

  private updatePolylinesCabos6f() {

    if (!this.layerVisibilityService.isVisible('cabos')) return; //inserido na implementação visualização de camadas


    if (!this.destinoCabos6f?.length) return;
    
    try {
      this.polylinePaths6f = [];
      
      this.destinoCabos6f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths6f.push(coords);
            //console.log(`Cabo 6f  ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths6f.length > 0) {
        const firstPoint = this.polylinePaths6f[0][0];
        //if (firstPoint) {
         // this.center = { lat: firstPoint.lat, lng: firstPoint.lng };
         // console.log('Mapa centralizado em:', this.center);
        //}
      }

      console.log(`Total de ${this.polylinePaths6f.length} cabos processados`);

      

      

      

    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths6f = [];
    }






  }




  private updatePolylinesCabos8f() {

    if (!this.layerVisibilityService.isVisible('cabos')) return; //inserido na implementação visualização de camadas

    if (!this.destinoCabos8f?.length) return;
    
    try {
      this.polylinePaths8f = [];
      
      this.destinoCabos8f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths8f.push(coords);
            //console.log(`Cabo 8f  ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths8f.length > 0) {
        const firstPoint = this.polylinePaths8f[0][0];
        //if (firstPoint) {
        //  this.center = { lat: firstPoint.lat, lng: firstPoint.lng };
        //  console.log('Mapa centralizado em:', this.center);
        //}
      }

      console.log(`Total de ${this.polylinePaths8f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths8f = [];
    }
  }






  private updatePolylinesCabos12f() {

    if (!this.layerVisibilityService.isVisible('cabos')) return; //inserido na implementação visualização de camadas


    if (!this.destinoCabos12f?.length) return;
    
    try {
      this.polylinePaths12f = [];
      
      this.destinoCabos12f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths12f.push(coords);
           //console.log(`Cabo 12f  ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths12f.length > 0) {
        const firstPoint = this.polylinePaths12f[0][0];
        //if (firstPoint) {
         // this.center = { lat: firstPoint.lat, lng: firstPoint.lng };
        //  console.log('Mapa centralizado em:', this.center);
        //}
      }

      console.log(`Total de ${this.polylinePaths12f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths12f = [];
    }
  }



  private updatePolylinesCabos24f() {

    if (!this.layerVisibilityService.isVisible('cabos')) return; //inserido na implementação visualização de camadas

    if (!this.destinoCabos24f?.length) return;
    
    try {
      this.polylinePaths24f = [];
      
      this.destinoCabos24f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths24f.push(coords);
            //console.log(`Cabo 24f ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths24f.length > 0) {
        const firstPoint = this.polylinePaths24f[0][0];
        //if (firstPoint) {
        //  this.center = { lat: firstPoint.lat, lng: firstPoint.lng };
        //  console.log('Mapa centralizado em:', this.center);
        //}
      }

      console.log(`Total de ${this.polylinePaths24f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths24f = [];
    }
  }


  private updatePolylinesCabos36f() {
    
    if (!this.layerVisibilityService.isVisible('cabos')) return; //inserido na implementação visualização de camadas


    if (!this.destinoCabos36f?.length) return;
    
    try {
      this.polylinePaths36f = [];
      
      this.destinoCabos36f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths36f.push(coords);
            //console.log(`Cabo 36f ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths36f.length > 0) {
        const firstPoint = this.polylinePaths36f[0][0];
        
      }

      console.log(`Total de ${this.polylinePaths36f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths36f = [];
    }
  }


  private updatePolylinesCabos48f() {

    if (!this.layerVisibilityService.isVisible('cabos')) return; //inserido na implementação visualização de camadas

    if (!this.destinoCabos48f?.length) return;
    
    try {
      this.polylinePaths48f = [];
      
      this.destinoCabos48f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths48f.push(coords);
            //console.log(`Cabo 36f ${cabo.id_meta} processado com sucesso:`, coords);
          }
        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths48f.length > 0) {
        const firstPoint = this.polylinePaths48f[0][0];
        
      }

      console.log(`Total de ${this.polylinePaths48f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths48f = [];
    }
  }

  private updatePolylinesCabos72f() {

    if (!this.layerVisibilityService.isVisible('cabos')) return; //inserido na implementação visualização de camadas


    if (!this.destinoCabos72f?.length) return;
    
    try {
      this.polylinePaths72f = [];
      
      this.destinoCabos72f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths72f.push(coords);
            //console.log(`Cabo 72f ${cabo.id_meta} processado com sucesso:`, coords);
          }





        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths72f.length > 0) {
        const firstPoint = this.polylinePaths72f[0][0];
        
      }

      console.log(`Total de ${this.polylinePaths72f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths72f = [];
    }
  }

  private updatePolylinesCabos144f() {

    if (!this.layerVisibilityService.isVisible('cabos')) return; //inserido na implementação visualização de camadas


    if (!this.destinoCabos144f?.length) return;
    
    try {
      this.polylinePaths144f = [];
      
      
      this.destinoCabos144f.forEach(cabo => {
        try {
          if (!cabo.GOOGLE_LATLNG) return;
          //console.log('valor de Google_latlng antes da conversão: ', cabo.GOOGLE_LATLNG);
          
          const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
          
          if (coords.length > 0) {
            this.polylinePaths144f.push(coords);
            //console.log(`Cabo 72f ${cabo.id_meta} processado com sucesso:`, coords);
          }

          



        } catch (e) {
          console.error(`Erro ao processar cabo ${cabo.id_meta}:`, e);
        }
      });

      if (this.polylinePaths144f.length > 0) {
        const firstPoint = this.polylinePaths144f[0][0];
        
      }

      console.log(`Total de ${this.polylinePaths144f.length} cabos processados`);
    } catch (e) {
      console.error('Erro ao processar cabos:', e);
      this.polylinePaths144f = [];
    }
  }




  //==========================================================================================================================
  //==1 dispara o evento que monitora o zoom para executar o callback de visible markers======================================
  //==2 dispara o evento para monitorar os boundsChange para executar o callback de visible markers===========================

  onMapInitialized(map: google.maps.Map) {
    console.log('🗺️ [MAP-INIT] ===== MAPA INICIALIZADO =====');
    console.log('🗺️ [MAP-INIT] Map object:', map);

    // 🔧 CORREÇÃO: Atribuir this.map ANTES de configurar o context menu
    this.map = map;
    console.log('🗺️ [MAP-INIT] this.map atribuído:', this.map);

    // 🛡️ Prevenir menu do navegador apenas quando clicar no mapa
    // Usa verificação baseada em coordenadas (não depende do elemento clicado)
    const preventContextMenuGlobal = (e: Event) => {
      if (!this.mapContainerRef?.nativeElement) return true;
      
      const mouseEvent = e as MouseEvent;
      if (!mouseEvent || mouseEvent.clientX === undefined || mouseEvent.clientY === undefined) return true;
      
      const mapElement = this.mapContainerRef.nativeElement;
      const mapRect = mapElement.getBoundingClientRect();
      
      // Verificar se as coordenadas do clique estão dentro dos limites visuais do mapa
      const isWithinMapBounds = 
        mouseEvent.clientX >= mapRect.left &&
        mouseEvent.clientX <= mapRect.right &&
        mouseEvent.clientY >= mapRect.top &&
        mouseEvent.clientY <= mapRect.bottom;
      
      if (isWithinMapBounds) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      
      return true;
    };

    document.addEventListener('contextmenu', preventContextMenuGlobal, true);

    // Armazenar função para remover depois
    this.listenerContextMenuDOM = () => {
      document.removeEventListener('contextmenu', preventContextMenuGlobal, true);
    };

    console.log('🛡️ [MAP-INIT] Listener de contextmenu adicionado no document (verificação por coordenadas)');

    //==========================================================para mobile
    if (window.innerWidth < 768) {
    map.setOptions({
      gestureHandling: 'greedy', // Permite zoom com um dedo
      disableDoubleClickZoom: false,
      scrollwheel: true
    });
  } //===========================================================

    // 🎯 Configurar context menu
    console.log('🗺️ [MAP-INIT] Chamando setupContextMenuListener...');
    this.setupContextMenuListener();
    console.log('🗺️ [MAP-INIT] setupContextMenuListener chamado!');


  // Configurar controles responsivos
  map.setOptions({
    zoomControlOptions: {
      position: window.innerWidth < 768 ? 
        google.maps.ControlPosition.RIGHT_BOTTOM : 
        google.maps.ControlPosition.RIGHT_TOP
    },
    mapTypeControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT,
      style: window.innerWidth < 768 ? 
        google.maps.MapTypeControlStyle.DROPDOWN_MENU :
        google.maps.MapTypeControlStyle.HORIZONTAL_BAR
    }
  });
  //=========================================================== 

    console.log('===================================>Map initialized successfully');
    // 🔧 CORREÇÃO: this.map já foi atribuído acima, removendo duplicação
    let lati:  string | null ;
    let lngi:  string | null ;
    
    
    

    lati=this.authService.getLat() ;
    lngi=this.authService.getLng() ;

    console.log('====================================>coordenadas da cidade ===================================>', lati,lngi)

    
    if (lati && lngi ){
    this.map.setCenter({lat:Number(lati), lng:Number(lngi)})
    }
    
    // Configurar listener para fechar InfoWindow ao clicar no mapa (agora que o mapa está inicializado)
    this.setupMapClickListener();
    this.map.addListener('zoom_changed', () => {
      if (!this.map) return;
      
      this.currentZoom = this.map.getZoom() || 0;
      console.log('Zoom changed to:', this.currentZoom);

      ///this.updateMarkersVisibility();
      this.updateVisibleMarkers();
      this.atualizarVisibilidadeBotaoPostesConcessionaria();

    });

    // Adiciona o evento bounds_changed para carregamento sob demanda
    this.map.addListener('bounds_changed', () => {
      // Usar debounce para evitar atualizações frequentes
      if (this.boundsChangeTimeout) {
        clearTimeout(this.boundsChangeTimeout);
      }
      
      this.boundsChangeTimeout = setTimeout(() => {
        this.updateVisibleMarkers();
        this.atualizarVisibilidadeBotaoPostesConcessionaria();
      }, 200); // Pequeno delay para evitar muitas atualizações
    });

    if (this.map) {
      this.currentZoom = this.map.getZoom() || 0;
      this.updateVisibleMarkers();
      this.atualizarVisibilidadeBotaoPostesConcessionaria();

      if ((this.destinoPoligonos?.length ?? 0) > 0) {
        this.updatePoligonos();
      }


    
    
    // Criar polylines programaticamente após mapa inicializado
    //setTimeout(() => {
    //  this.createCabo1fPolylines();
    //  this.createCabo2fPolylines();
    //  this.createCabo4fPolylines();
    //  this.createCabo6fPolylines();
    //  this.createCabo8fPolylines();
    //  this.createCabo12fPolylines();
    //  this.createCabo24fPolylines();
    //  this.createCabo36fPolylines();
    //  this.createCabo48fPolylines();
    //  this.createCabo72fPolylines();

    //}, 1000);
    







      
    }

    //setTimeout(() => {
     // if (this.destinoCabos6f && this.destinoCabos6f.length > 0) {
     //   console.log('🔥 Configurando InfoWindows após inicialização do mapa');
     //   this.setupCabo6fInfoWindows();
     // }
    //}, 1000);

    


  }//================================================================================================

 
//*************************************************************************************************** */ 
// verifica se o marcador existe ====================================================================
// verifica se o marador tem uma posição geografica valida===========================================
// verifica bounds.contains(position)se o marcador está dentro dos limites visíveis do mapa atual

private updateVisibleMarkers() {

  

    if (!this.map) return;
  
    const bounds = this.map.getBounds();
    if (!bounds) {
      this.updateVisiblePoligonos(); // inserido na implementação visualização de camadas
      return;
    }


    
  
    console.log('Atualizando marcadores visíveis com base nos limites do mapa');


  const ceoVisible = this.layerVisibilityService.isVisible('ceo'); //inserido na implementação visualização de camadas----------------- Visibilidade das Caixas ----------------------------
  if (ceoVisible) {
  
    // Atualizar visibilidade das caixas
    let visibleCaixasCount = 0;
    this.markerCaixas.forEach(marker => {
      if (marker) {
       const position = marker.getPosition();
       if (position && 
            bounds.contains(position) && 
            this.currentZoom >= this.ZOOM_LEVEL_CAIXAS &&
            visibleCaixasCount < this.MAX_VISIBLE_MARKERS_CEO) {
        
          if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          marker.setVisible(true);

          // Readicionar os event listeners para garantir que funcionem
          this.addMarkerEventListeners(marker, false,false, false,false);
          //console.log("ADICIONANDO LISTERNER MARKER DLBCLICK")

          visibleCaixasCount++;
        } else {
         marker.setVisible(false);
          marker.setMap(null);//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          //console.log("retirando LISTERNER MARKER DLBCLICK")
        }

        console.log(`Caixas visíveis: ${visibleCaixasCount}`)
      }
    });

   

} else { //inserido na implementação visualização de camadas
  this.markerCaixas.forEach((marker) => {
    if (marker) {
      marker.setVisible(false);
      marker.setMap(null);
    }
  });
}
  

 const ctoVisible = this.layerVisibilityService.isVisible('cto'); //inserido na implementação visualização de camadas----------------- Visibilidade das CTOS SEM SPLITTER ----------------------------
  if (ctoVisible) {
  
  // Atualizar visibilidade de CTOs
  let visibleCTOsCount = 0;
  console.log ('atualiza ctos visibles')
  this.markerCtos.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_CTOS &&
          visibleCTOsCount < this.MAX_VISIBLE_MARKERS_CTO) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visibleCTOsCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      //console.log ('caixas visiveis', visibleCTOsCount)
    }
  });

  console.log(` CTOs visíveis: ${visibleCTOsCount}`);

  } else {//inserido na implementação visualização de camadas
    this.markerCtos.forEach((marker) => {
      if (marker) {
        marker.setVisible(false);
        marker.setMap(null);
      }
    });
  }

  const ctospVisible = this.layerVisibilityService.isVisible('ctosp'); //inserido na implementação visualização de camadas----------------- Visibilidade das CTOS COM SPLITTER----------------------------
  if (ctospVisible) {
  
  // Atualizar visibilidade de CTOs
  let visibleCTOsSPCount = 0;
  console.log ('atualiza ctos visibles')
  this.markerCtosSP.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_CTOSSP &&
          visibleCTOsSPCount < this.MAX_VISIBLE_MARKERS_CTOSP) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visibleCTOsSPCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      //console.log ('caixas visiveis', visibleCTOsCount)
    }
  });

  console.log(` CTOs COM SP visíveis: ${visibleCTOsSPCount}`);

  } else {//inserido na implementação visualização de camadas
    this.markerCtosSP.forEach((marker) => {
      if (marker) {
        marker.setVisible(false);
        marker.setMap(null);
      }
    });
  }

  // Atualizar visibilidade de Estações  //----------------- Visibilidade de Estações ----------------------------
  const estacoesVisible = this.layerVisibilityService.isVisible('estacoes'); //inserido na implementação visualização de camadas
  if (estacoesVisible) {
  let visiblePOPsCount = 0;
  console.log ('atualiza Estações visibles')
  this.markerPopsEst.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_POPS &&
          visiblePOPsCount < this.MAX_VISIBLE_MARKERS_POPs) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visiblePOPsCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      //console.log ('caixas visiveis', visibleCTOsCount)
    }
  });

  console.log(` Estações visíveis: ${visiblePOPsCount}`);
  } else {
    this.markerPopsEst.forEach((marker) => {//inserido na implementação visualização de camadas
      if (marker) {
        marker.setVisible(false);
        marker.setMap(null);
      }
    });
    this.markerDios.forEach((marker) => {//inserido na implementação visualização de camadas
      if (marker) {
        marker.setVisible(false);
        marker.setMap(null);
      }
    });
  }
   

// Atualizar visibilidade de Clientes  //----------------- Visibilidade de Clientes ----------------------------
  const clientesVisible = this.layerVisibilityService.isVisible('clientes'); //inserido na implementação visualização de camadas
  if (clientesVisible) {
  let visiblePOPsCLICount = 0;
  console.log ('atualiza Clientes visibles')
  this.markerPopsCli.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_CLIENTES &&
          visiblePOPsCLICount < this.MAX_VISIBLE_MARKERS_CLIENTES) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visiblePOPsCLICount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      
    }
  });

  console.log(` Clientes visíveis: ${visiblePOPsCLICount}`);
  } else {
    this.markerPopsCli.forEach((marker) => {//inserido na implementação visualização de camadas
      if (marker) {
        marker.setVisible(false);
        marker.setMap(null);
      }
    });
  }

  // Atualizar visibilidade de Clientes DESATIVADOS   //----------------- Visibilidade de Clientes DESATIVADOS ----------------------------
  const clientesCanceladosVisible = this.layerVisibilityService.isVisible('clientes_cancelados'); //inserido na implementação visualização de camadas
  if (clientesCanceladosVisible) {
  let visiblePOPsCLIDesCount = 0;
  console.log ('atualiza Clientes Desabilitados visibles')
  this.markerPopsCliDes.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_CLIENTES_DISABLES &&
          visiblePOPsCLIDesCount < this.MAX_VISIBLE_MARKERS_CLIENTES_DISABLES) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visiblePOPsCLIDesCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      
    }
  });

  console.log(` Clientes Desativados visíveis: ${visiblePOPsCLIDesCount}`);
  } else {
    this.markerPopsCliDes.forEach((marker) => {//
      if (marker) {
        marker.setVisible(false);
        marker.setMap(null);
      }
    });
  }


// Atualizar visibilidade de Clientes Ativos   //----------------- Visibilidade de Clientes Ativos ----------------------------
  const clientesAtivosVisible = this.layerVisibilityService.isVisible('clientes_ativos');
  if (clientesAtivosVisible) {
  let visiblePOPsCLIAtvCount = 0;
  console.log ('atualiza Clientes Ativos visibles')
  this.markerPopsCliAtv.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_CLIENTES_ATIVOS &&
          visiblePOPsCLIAtvCount < this.MAX_VISIBLE_MARKERS_CLIENTES_ATIVOS) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visiblePOPsCLIAtvCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      
    }
  });

  console.log(` Clientes Ativos visíveis: ${visiblePOPsCLIAtvCount}`);
  } else {//inserido na implementação visualização de camadas
    this.markerPopsCliAtv.forEach((marker) => {
      if (marker) {
        marker.setVisible(false);
        marker.setMap(null);
      }
    });
  }

// Atualizar visibilidade de Condominios  //----------------- Visibilidade de Condominios ----------------------------
  const condominiosVisible = this.layerVisibilityService.isVisible('condominios'); //inserido na implementação visualização de camadas
  if (condominiosVisible) {
  let visibleCondominiosCount = 0;
  console.log ('atualiza Condominios visibles')
  this.markerCondominios.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_CONDOMINIOS &&
          visibleCondominiosCount < this.MAX_VISIBLE_MARKERS_CONDOMINIOS) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visibleCondominiosCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      //console.log ('caixas visiveis', visibleCTOsCount)
    }
  });

  console.log(` Condominios visíveis: ${visibleCondominiosCount}`);
  } else {//inserido na implementação visualização de camadas
    this.markerCondominios.forEach((marker) => {
      if (marker) {
        marker.setVisible(false);
        marker.setMap(null);
      }
    });
  }
   


  // Atualizar visibilidade de dios  //----------------- Visibilidade de dios ----------------------------
  if (estacoesVisible) {//inserido na implementação visualização de camadas
  let visibleDiosCount = 0;
  console.log ('atualiza Dios visibles')
  this.markerDios.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_DIOS &&
          visibleDiosCount < this.MAX_VISIBLE_MARKERS_DIOS) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visibleDiosCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      //console.log ('caixas visiveis', visibleCTOsCount)
    }
  });

  console.log(` Dios visíveis: ${visibleDiosCount}`);
  }


  // Atualizar visibilidade de dios  //----------------- Visibilidade de dios ----------------------------
  let visibleAnotacoesCount = 0;
  console.log ('atualiza Anotacoes visibles')
  this.markerAnotacoes.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position && 
          bounds.contains(position) && 
          this.currentZoom >= this.ZOOM_LEVEL_ANOTACOES &&
          visibleAnotacoesCount < this.MAX_VISIBLE_MARKERS_ANOTACOES) {
        
        if (this.map) {marker.setMap(this.map)};//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        marker.setVisible(true);
        visibleAnotacoesCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }

      //console.log ('caixas visiveis', visibleCTOsCount)
    }
  });

  console.log(` Anotações visíveis: ${visibleAnotacoesCount}`);

  const postesAPVisible = this.layerVisibilityService.isVisible('postes_aprovados');
  if (postesAPVisible) {
  let visiblePostesAPCount = 0;
  console.log('atualiza Postes Aprovados visibles');
  this.markerPostesAP.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position &&
          bounds.contains(position) &&
          this.currentZoom >= this.ZOOM_LEVEL_POSTES_AP &&
          visiblePostesAPCount < this.MAX_VISIBLE_MARKERS_POSTES_AP) {
        if (this.map) { marker.setMap(this.map); }
        marker.setVisible(true);
        visiblePostesAPCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }
    }
  });

  console.log(` Postes Aprovados visíveis: ${visiblePostesAPCount}`);
  } else {
    this.markerPostesAP.forEach((marker) => {
      if (marker) {
        marker.setVisible(false);
        marker.setMap(null);
      }
    });
  }

  const postesConcessionariaVisible = this.layerVisibilityService.isVisible('postes_concessionaria');
  if (postesConcessionariaVisible) {
  let visiblePostesConcessionariaCount = 0;
  this.markerPostesConcessionaria.forEach((marker) => {
    if (marker) {
      const position = marker.getPosition();
      if (
        position &&
        bounds.contains(position) &&
        this.currentZoom >= this.ZOOM_LEVEL_POSTES_CONCESSIONARIA &&
        visiblePostesConcessionariaCount < this.MAX_VISIBLE_MARKERS_POSTES_CONCESSIONARIA
      ) {
        if (this.map) {
          marker.setMap(this.map);
        }
        marker.setVisible(true);
        visiblePostesConcessionariaCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }
    }
  });

  console.log(` Postes Concessionária visíveis: ${visiblePostesConcessionariaCount}`);
  } else {
    this.markerPostesConcessionaria.forEach((marker) => {
      if (marker) {
        marker.setVisible(false);
        marker.setMap(null);
      }
    });
  }

  const segmentosVisible = this.layerVisibilityService.isVisible('cabos');
  if (segmentosVisible) {
  let visibleSegmentosCount = 0;
  console.log('atualiza Segmentos (Sobras) visibles');
  this.markerSegmentos.forEach(marker => {
    if (marker) {
      const position = marker.getPosition();
      if (position &&
          bounds.contains(position) &&
          this.currentZoom >= this.ZOOM_LEVEL_SEGMENTOS &&
          visibleSegmentosCount < this.MAX_VISIBLE_MARKERS_SEGMENTOS) {
        if (this.map) { marker.setMap(this.map); }
        marker.setVisible(true);
        visibleSegmentosCount++;
      } else {
        marker.setVisible(false);
        marker.setMap(null);
      }
    }
  });

  console.log(` Segmentos (Sobras) visíveis: ${visibleSegmentosCount}`);
  } else {
    this.markerSegmentos.forEach((marker) => {
      if (marker) {
        marker.setVisible(false);
        marker.setMap(null);
      }
    });
  }

  this.updateVisiblePoligonos(); // inserido na implementação visualização de camadas
  this.updateVisibleCabos(); //inserido na implementação visualização de camadas

} 








// *****************************************************************************************************




// Método para gerar conteúdo HTML dos InfoWindows de marcadores
private generateMarkerInfoWindowContent(tipo: string, dados: any): string {
  const lat = dados.LAT || dados.lat;
  const lng = dados.LONGI || dados.lng || dados.LNG;
  const id = dados.id_meta || dados.ID_META;
  const numero = dados.numero || dados.NUMERO || dados.sigla || 'S/N';
  
  let titulo = '';
  let cor = '';
  let icone = '';
  
  switch (tipo) {
    case 'caixa':
      titulo = `📦 CEO ${numero}`;
      cor = '#3498db';
      icone = '📦';
      break;
    case 'cto':
      titulo = `🏗️ CTO ${numero}`;
      cor = '#27ae60';
      icone = '🏗️';
      break;
    case 'ctosp':
      titulo = `🔧 CTO SP ${numero}`;
      cor = '#e67e22';
      icone = '🔧';
      break;
    case 'dio':
      titulo = `🔌 DIO ${numero}`;
      cor = '#9b59b6';
      icone = '🔌';
      break;
    default:
      titulo = `📍 ${numero}`;
      cor = '#95a5a6';
      icone = '📍';
  }

  return `
    <div style="padding: 12px; min-width: 220px; font-family: Arial, sans-serif; max-width: 300px;">
      <h4 style="margin: 0 0 10px 0; color: #2c3e50; border-bottom: 2px solid ${cor}; padding-bottom: 5px;">
        ${titulo}
      </h4>
      <p style="margin: 6px 0; color: #34495e;"><strong>ID:</strong> ${id}</p>
      ${tipo === 'dio' && dados.CAPACIDADE ? `<p style="margin: 6px 0; color: #34495e;"><strong>Capacidade:</strong> ${dados.CAPACIDADE}</p>` : ''}
      <div style="margin: 10px 0; padding: 8px; background: #ecf0f1; border-radius: 5px;">
        <p style="margin: 0 0 5px 0; font-weight: bold; color: #2c3e50;">Coordenadas:</p>
        <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 13px; color: #2c3e50;">
          Lat: ${lat}<br>
          Lng: ${lng}
        </p>
      </div>
      <button onclick="navigator.clipboard.writeText('${lat}, ${lng}')" 
              style="width: 100%; margin-top: 8px; padding: 8px; background: ${cor}; color: white; 
                     border: none; border-radius: 5px; cursor: pointer; font-weight: bold;"
              onmouseover="this.style.background='${this.darkenColor(cor)}'" 
              onmouseout="this.style.background='${cor}'">
        📋 Copiar Coordenadas
      </button>
      <p style="margin: 8px 0 0 0; font-size: 11px; color: #7f8c8d; text-align: center;">
        Duplo-clique para abrir diagrama
      </p>
    </div>
  `;
}

// Método auxiliar para escurecer cores
private darkenColor(color: string): string {
  const colorMap: { [key: string]: string } = {
    '#3498db': '#2980b9', // Azul
    '#27ae60': '#229954', // Verde
    '#e67e22': '#d35400', // Laranja
    '#9b59b6': '#8e44ad', // Roxo (DIO)
    '#95a5a6': '#7f8c8d', // Cinza
    '#e74c3c': '#c0392b', // Vermelho (cliente desativado)
  };
  return colorMap[color] || color;
}

private formatIntegracaoId(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '0';
  }
  return String(value);
}

private getClienteInfoWindowStyle(tipo: string): { titulo: string; cor: string } {
  switch (tipo) {
    case 'cliat':
      return { titulo: 'Cliente Ativo', cor: '#27ae60' };
    case 'clides':
      return { titulo: 'Cliente Desativado', cor: '#e74c3c' };
    default:
      return { titulo: 'Cliente', cor: '#3498db' };
  }
}

private generateClienteInfoWindowContent(
  tipo: string,
  dados: PopsCli,
  popInfo: PopsInfo | null,
  options?: { loading?: boolean; apiError?: string },
): string {
  const lat = dados.LAT ?? (dados as any).lat;
  const lng = dados.LNG ?? (dados as any).lng;
  const { titulo, cor } = this.getClienteInfoWindowStyle(tipo);
  const sigla = popInfo?.SIGLA || dados.sigla || 'S/N';
  const idMeta = this.formatIntegracaoId(dados.id_meta ?? popInfo?.id_meta);
  const idCliente = this.formatIntegracaoId(popInfo?.CONTRATO_GPON);
  const idContrato = this.formatIntegracaoId(popInfo?.id_contrato);
  const idAutenticacao = this.formatIntegracaoId(popInfo?.id_autenticacao);

  const loadingHtml = options?.loading
    ? '<p style="margin: 6px 0; color: #7f8c8d; font-style: italic;">Carregando dados...</p>'
    : '';
  const errorHtml = options?.apiError
    ? `<p style="margin: 6px 0; color: #c0392b; font-size: 12px;">${options.apiError}</p>`
    : '';

  return `
    <div style="padding: 12px; min-width: 240px; font-family: Arial, sans-serif; max-width: 320px;">
      <h4 style="margin: 0 0 10px 0; color: #2c3e50; border-bottom: 2px solid ${cor}; padding-bottom: 5px;">
        ${titulo}: ${sigla}
      </h4>
      ${loadingHtml}
      ${errorHtml}
      <p style="margin: 6px 0; color: #34495e;"><strong>id_meta:</strong> ${idMeta}</p>
      <p style="margin: 6px 0; color: #34495e;"><strong>id_cliente:</strong> ${idCliente}</p>
      <p style="margin: 6px 0; color: #34495e;"><strong>id_contrato:</strong> ${idContrato}</p>
      <p style="margin: 6px 0; color: #34495e;"><strong>id_autenticacao:</strong> ${idAutenticacao}</p>
      <div style="margin: 10px 0; padding: 8px; background: #ecf0f1; border-radius: 5px;">
        <p style="margin: 0 0 5px 0; font-weight: bold; color: #2c3e50;">Coordenadas:</p>
        <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 13px; color: #2c3e50;">
          Lat: ${lat}<br>
          Lng: ${lng}
        </p>
      </div>
      <button onclick="navigator.clipboard.writeText('${lat}, ${lng}')"
              style="width: 100%; margin-top: 8px; padding: 8px; background: ${cor}; color: white;
                     border: none; border-radius: 5px; cursor: pointer; font-weight: bold;"
              onmouseover="this.style.background='${this.darkenColor(cor)}'"
              onmouseout="this.style.background='${cor}'">
        📋 Copiar Coordenadas
      </button>
      <p style="margin: 8px 0 0 0; font-size: 11px; color: #7f8c8d; text-align: center;">
        Duplo-clique para abrir menu
      </p>
    </div>
  `;
}

private showClienteInfoWindow(
  marker: google.maps.Marker,
  event: google.maps.MapMouseEvent,
  tipo: string,
  dados: PopsCli,
): void {
  console.log(`🔧 [INFO] Mostrando infowindow de cliente (${tipo}):`, dados.sigla || dados.id_meta);

  if (this.currentMarkerInfoWindow) {
    this.currentMarkerInfoWindow.close();
  }

  this.currentMarkerInfoWindow = new google.maps.InfoWindow({
    content: this.generateClienteInfoWindowContent(tipo, dados, null, { loading: true }),
    position: event.latLng,
  });
  this.currentMarkerInfoWindow.open(this.map, marker);

  const idMeta = Number(dados.id_meta);
  if (!Number.isFinite(idMeta) || idMeta <= 0) {
    this.currentMarkerInfoWindow.setContent(
      this.generateClienteInfoWindowContent(tipo, dados, null, { apiError: 'id_meta inválido' }),
    );
    return;
  }

  this.popInfoService.getPopInfo(idMeta).subscribe({
    next: (info) => {
      if (this.currentMarkerInfoWindow) {
        this.currentMarkerInfoWindow.setContent(
          this.generateClienteInfoWindowContent(tipo, dados, info),
        );
      }
    },
    error: () => {
      if (this.currentMarkerInfoWindow) {
        this.currentMarkerInfoWindow.setContent(
          this.generateClienteInfoWindowContent(tipo, dados, null, {
            apiError: 'Não foi possível carregar dados do cliente',
          }),
        );
      }
    },
  });
}

private infoview_para_sobras(dados: Segmento): string {
  const cor = '#FFD700';
  const idMeta = dados.id_meta ?? '—';
  const metragem = dados.METRAGEM ?? 0;
  const metragemTexto = metragem > 0 ? `${metragem} m` : '0';
  const caboxd = dados.Caboxd ?? '—';
  const caboxe = dados.Caboxe ?? '—';

  return `
    <div style="padding: 12px; min-width: 220px; font-family: Arial, sans-serif; max-width: 300px;">
      <h4 style="margin: 0 0 10px 0; color: #2c3e50; border-bottom: 2px solid ${cor}; padding-bottom: 5px;">
        Sobra
      </h4>
      <p style="margin: 6px 0; color: #34495e;"><strong>id_meta:</strong> ${idMeta}</p>
      <p style="margin: 6px 0; color: #34495e;"><strong>Metragem:</strong> ${metragemTexto}</p>
      <p style="margin: 6px 0; color: #7f8c8d; font-size: 12px;"><strong>Cabos:</strong> ${caboxd} / ${caboxe}</p>
    </div>
  `;
}

private showSobraInfoWindow(
  marker: google.maps.Marker,
  event: google.maps.MapMouseEvent,
  dados: Segmento,
): void {
  console.log('🔧 [INFO] Mostrando infowindow de sobra:', dados.id_meta);

  if (this.currentMarkerInfoWindow) {
    this.currentMarkerInfoWindow.close();
  }

  this.currentMarkerInfoWindow = new google.maps.InfoWindow({
    content: this.infoview_para_sobras(dados),
    position: event.latLng,
  });
  this.currentMarkerInfoWindow.open(this.map, marker);
}

// Método para mostrar InfoWindow de marcador
private showMarkerInfoWindow(marker: google.maps.Marker, event: google.maps.MapMouseEvent, tipo: string, dados: any) {
  console.log(`🔧 [INFO] Mostrando infowindow para ${tipo}:`, dados.numero || dados.sigla || 'N/A');
  
  // Fechar InfoWindow anterior se existir
  if (this.currentMarkerInfoWindow) {
    console.log('🔧 [INFO] Fechando infowindow anterior');
    this.currentMarkerInfoWindow.close();
  }

  // Criar novo InfoWindow
  this.currentMarkerInfoWindow = new google.maps.InfoWindow({
    content: this.generateMarkerInfoWindowContent(tipo, dados),
    position: event.latLng
  });

  // Abrir InfoWindow
  this.currentMarkerInfoWindow.open(this.map, marker);
  console.log('🔧 [INFO] Infowindow aberto com sucesso');
}

// Configurar listener para fechar InfoWindow ao clicar no mapa
private setupMapClickListener() {
  if (this.map) {
    console.log('🔧 [MAP] Adicionando listener de clique no mapa para fechar infowindow');
    this.map.addListener('click', () => {
      console.log('🔧 [MAP] Clique no mapa detectado');
      if (this.currentMarkerInfoWindow) {
        console.log('🔧 [MAP] Fechando infowindow das caixas');
        this.currentMarkerInfoWindow.close();
        this.currentMarkerInfoWindow = null;
      } else {
        console.log('🔧 [MAP] Nenhum infowindow de caixa para fechar');
      }
    });
  } else {
    console.log('🔧 [MAP] Mapa não disponível para adicionar listener');
  }
}

// Novo método para adicionar event listeners a um marcador
private addMarkerEventListeners(marker: google.maps.Marker, isCTO: boolean = false, isCTOSP:boolean = false, isCLI:boolean = false, isCLIAT:boolean = false, isCLIDES:boolean = false) {
  // Remover listeners existentes primeiro (caso já existam)
  google.maps.event.clearInstanceListeners(marker);
  
  // Variáveis para controlar cliques (debounce)
  let clickTimeout: any;
  
  // Clique simples - mostrar InfoWindow com debounce
  marker.addListener('click', (event: google.maps.MapMouseEvent) => {
    // Limpar timeout anterior se existir
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }

    // Definir timeout para clique simples (debounce de 300ms)
    clickTimeout = setTimeout(() => {
      let tipo = '';
      let dados: any = {};
      
      if (isCTO) {
        const index = this.markerCtos.indexOf(marker);
        if (index !== -1) {
          tipo = 'cto';
          dados = this.destinoCTO[index];
        }
      } else if (isCTOSP) {
        const index = this.markerCtosSP.indexOf(marker);
        if (index !== -1) {
          tipo = 'ctosp';
          dados = this.destinoCTOSP[index];
        }
      } else if (isCLI) {
        const index = this.markerPopsCli.indexOf(marker);
        if (index !== -1) {
          tipo = 'cli';
          dados = this.destinoPopsCli[index];
        }
      } else if (isCLIAT) {
        const index = this.markerPopsCliAtv.indexOf(marker);
        if (index !== -1) {
          tipo = 'cliat';
          dados = this.destinoPopsCliAtv[index];
        }
      } else if (isCLIDES) {
        const index = this.markerPopsCliDes.indexOf(marker);
        if (index !== -1) {
          tipo = 'clides';
          dados = this.destinoPopsCliDes[index];
        }
      } else {
        const index = this.markerCaixas.indexOf(marker);
        if (index !== -1) {
          tipo = 'caixa';
          dados = this.destino[index];
        }
      }
      
      if (tipo && dados) {
        console.log(`Clique simples detectado em ${tipo}:`, dados.numero || dados.sigla || 'N/A');
        if (tipo === 'cli' || tipo === 'cliat' || tipo === 'clides') {
          this.showClienteInfoWindow(marker, event, tipo, dados);
        } else {
          this.showMarkerInfoWindow(marker, event, tipo, dados);
        }
      }
    }, 300); // Delay de 300ms para distinguir de duplo clique
  });
  
  // Duplo clique - abrir modal/diagrama
  marker.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
    // Cancelar timeout do clique simples se existir
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }
      
    if (isCTO) {
      const index = this.markerCtos.indexOf(marker);
      if (index !== -1) {
        // 🔧 NOVO: Em mobile, abrir context menu em vez da ação padrão
        if (this.isMobile()) {
          console.log('📱 [MOBILE] Double tap em CTO - abrindo context menu');
          const cto = this.destinoCTO[index];
          this.clickedCTOData = cto;
          this.clickedCaixaData = null;
          this.clickedCTOSPData = null;
          this.contextMenuType = 'caixa'; // CTOs usam o mesmo menu de caixa
          
          if (event.domEvent) {
            const mouseEvent = event.domEvent as MouseEvent;
            this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
          }
        } else {
          // Desktop: comportamento padrão
          this.onMarkerClick(event, index, true, false, false, false, false);
        }
      }
    } else if (isCTOSP) {
      const index = this.markerCtosSP.indexOf(marker);
      if (index !== -1) {
        // 🔧 NOVO: Em mobile, abrir context menu em vez da ação padrão
        if (this.isMobile()) {
          console.log('📱 [MOBILE] Double tap em CTO_SP - abrindo context menu');
          const ctosp = this.destinoCTOSP[index];
          this.clickedCTOSPData = ctosp;
          this.clickedCaixaData = null;
          this.clickedCTOData = null;
          this.contextMenuType = 'caixa'; // CTOs_SP usam o mesmo menu de caixa
          
          if (event.domEvent) {
            const mouseEvent = event.domEvent as MouseEvent;
            this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
          }
        } else {
          // Desktop: comportamento padrão
          this.onMarkerClick(event, index, false, true, false, false, false);
        }
      }
    } else if (isCLI) {
      const index = this.markerPopsCli.indexOf(marker);
      if (index !== -1) {
        if (this.currentMarkerInfoWindow) this.currentMarkerInfoWindow.close();
        this.habilitarEdicaoCliente(index, 'cli');
      }
    } else if (isCLIAT) {
      const index = this.markerPopsCliAtv.indexOf(marker);
      if (index !== -1) {
        if (this.currentMarkerInfoWindow) this.currentMarkerInfoWindow.close();
        this.habilitarEdicaoCliente(index, 'cliat');
      }
    } else if (isCLIDES) {
      const index = this.markerPopsCliDes.indexOf(marker);
      if (index !== -1) {
        if (this.currentMarkerInfoWindow) this.currentMarkerInfoWindow.close();
        this.habilitarEdicaoCliente(index, 'clides');
      }
    } else {
      // É uma caixa
      const index = this.markerCaixas.indexOf(marker);
      if (index !== -1) {
        // 🔧 NOVO: Em mobile, abrir context menu em vez da ação padrão
        if (this.isMobile()) {
          console.log('📱 [MOBILE] Double tap em caixa - abrindo context menu');
          const caixa = this.destino[index];
          this.clickedCaixaData = caixa;
          this.clickedCTOData = null;
          this.clickedCTOSPData = null;
          this.contextMenuType = 'caixa';
          
          if (event.domEvent) {
            const mouseEvent = event.domEvent as MouseEvent;
            this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
          }
        } else {
          // Desktop: comportamento padrão
          this.onMarkerClick(event, index, false, false, false, false, false);
        }
      }
    }

        
    });

    /*
    marker.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
      console.log('duplo click');
  if (isCTO) {
    const index = marker.get('index'); // índice setado na criação
    this.onMarkerClick(event, index, true);
  } else if (isCTOSP) {
    const index = marker.get('index');
    this.onMarkerClick(event, index, true); // ou false, dependendo do que CTOSP representa
  } else {
    const index = marker.get('index');
    this.onMarkerClick(event, index, false);
  }
});
  
  */
  
  // Evento dragend para ambos tipos de marcadores

  
  marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
    if (isCTO) {
      const index = this.markerCtos.indexOf(marker);
      if (index !== -1) {
        this.onMarkerDragEnd(event, index, true);
      }
    } else if(isCTOSP) {
      const index = this.markerCtosSP.indexOf(marker);
      if (index !== -1) {
        this.onMarkerDragEnd(event, index, false);
      }}
      else {
      const index = this.markerCaixas.indexOf(marker);
      if (index !== -1) {
        this.onMarkerDragEnd(event, index, false);
      }
    }
  });

  // 🔧 CORREÇÃO: Listener de right-click para caixas, CTOs e CTOs_SP (no mesmo nível dos outros listeners)
  marker.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
    console.log('🔴 [CONTEXT-MENU] Right-click detectado no marcador');
    
    // Prevenir menu padrão do navegador
    if (event.domEvent) {
      event.domEvent.preventDefault();
      event.domEvent.stopPropagation();
    }  

    // Verificar se é uma CTO
    if (isCTO) {
      const index = this.markerCtos.indexOf(marker);
      if (index !== -1) {
        const cto = this.destinoCTO[index];
        
        console.log('🔴 [CONTEXT-MENU] CTO encontrada no índice:', index);
        console.log('🔴 [CONTEXT-MENU] Dados da CTO:', cto);
        
        // Armazenar dados da CTO clicada
        this.clickedCTOData = cto;
        this.clickedCaixaData = null; // Limpar dados de caixa
        this.clickedCTOSPData = null; // Limpar dados de CTO_SP
        
        // Definir tipo de contexto como 'caixa' (mesmo menu)
        this.contextMenuType = 'caixa';
        
        // Mostrar context menu na posição do clique
        if (event.domEvent) {
          const mouseEvent = event.domEvent as MouseEvent;
          console.log('🔴 [CONTEXT-MENU] Mostrando context menu para CTO em:', mouseEvent.clientX, mouseEvent.clientY);
          this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
        }
      }
    }
    // Verificar se é uma CTO_SP
    else if (isCTOSP) {
      const index = this.markerCtosSP.indexOf(marker);
      if (index !== -1) {
        const ctosp = this.destinoCTOSP[index];
        
        console.log('🔴 [CONTEXT-MENU] CTO_SP encontrada no índice:', index);
        console.log('🔴 [CONTEXT-MENU] Dados da CTO_SP:', ctosp);
        
        // Armazenar dados da CTO_SP clicada
        this.clickedCTOSPData = ctosp;
        this.clickedCaixaData = null; // Limpar dados de caixa
        this.clickedCTOData = null; // Limpar dados de CTO
        
        // Definir tipo de contexto como 'caixa' (mesmo menu)
        this.contextMenuType = 'caixa';
        
        // Mostrar context menu na posição do clique
        if (event.domEvent) {
          const mouseEvent = event.domEvent as MouseEvent;
          console.log('🔴 [CONTEXT-MENU] Mostrando context menu para CTO_SP em:', mouseEvent.clientX, mouseEvent.clientY);
          this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
        }
      }
    }
    // Verificar se é uma caixa (não CTO, CTO_SP, CLI, etc)
    else if (!isCLI && !isCLIAT && !isCLIDES) {
      const index = this.markerCaixas.indexOf(marker);
      if (index !== -1) {
        const caixa = this.destino[index];
        
        console.log('🔴 [CONTEXT-MENU] Caixa encontrada no índice:', index);
        console.log('🔴 [CONTEXT-MENU] Dados da caixa:', caixa);
        
        // Armazenar dados da caixa clicada
        this.clickedCaixaData = caixa;
        this.clickedCTOData = null; // Limpar dados de CTO
        this.clickedCTOSPData = null; // Limpar dados de CTO_SP
        
        // Definir tipo de contexto como 'caixa'
        this.contextMenuType = 'caixa';
        
        // Mostrar context menu na posição do clique
        if (event.domEvent) {
          const mouseEvent = event.domEvent as MouseEvent;
          console.log('🔴 [CONTEXT-MENU] Mostrando context menu para caixa em:', mouseEvent.clientX, mouseEvent.clientY);
          this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
        }
      } else {
        console.log('🔴 [CONTEXT-MENU] Marcador não encontrado em markerCaixas');
      }
    }
    // 🆕 Verificar se é um cliente
    else if (isCLI) {
      const index = this.markerPopsCli.indexOf(marker);
      if (index !== -1) {
        const cliente = this.destinoPopsCli[index];
        
        const clienteComMarcador =
          cliente != null ? this.popsCliMesclandoRecursosMarcador(marker, cliente) : cliente;

        console.log('🔴 [CONTEXT-MENU] Cliente encontrado no índice:', index);
        console.log('🔴 [CONTEXT-MENU] Dados do cliente:', clienteComMarcador);

        // Armazenar dados do cliente clicado (recurso_* preferindo valores no Marker)
        this.clickedCliData = clienteComMarcador;
        this.clickedCliAtData = null; // Limpar dados de outros tipos
        this.clickedCliDesData = null;
        this.clickedClienteMarker = marker;
        this.clickedCaixaData = null;
        this.clickedCTOData = null;
        this.clickedCTOSPData = null;
        
        // Definir tipo de contexto como 'cliente'
        this.contextMenuType = 'cliente';
        
        // Mostrar context menu na posição do clique
        if (event.domEvent) {
          const mouseEvent = event.domEvent as MouseEvent;
          console.log('🔴 [CONTEXT-MENU] Mostrando context menu para cliente em:', mouseEvent.clientX, mouseEvent.clientY);
          this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
        }
      }
    }
    // 🆕 Verificar se é um cliente ativado
    else if (isCLIAT) {
      const index = this.markerPopsCliAtv.indexOf(marker);
      if (index !== -1) {
        const clienteAt = this.destinoPopsCliAtv[index];
        
        const clienteAtComMarcador =
          clienteAt != null
            ? this.popsCliMesclandoRecursosMarcador(marker, clienteAt)
            : clienteAt;

        console.log('🔴 [CONTEXT-MENU] Cliente Ativado encontrado no índice:', index);
        console.log('🔴 [CONTEXT-MENU] Dados do cliente ativado:', clienteAtComMarcador);

        // Armazenar dados do cliente ativado clicado
        this.clickedCliAtData = clienteAtComMarcador;
        this.clickedCliData = null; // Limpar dados de outros tipos
        this.clickedCliDesData = null;
        this.clickedClienteMarker = marker;
        this.clickedCaixaData = null;
        this.clickedCTOData = null;
        this.clickedCTOSPData = null;
        
        // Definir tipo de contexto como 'cliente'
        this.contextMenuType = 'cliente';
        
        // Mostrar context menu na posição do clique
        if (event.domEvent) {
          const mouseEvent = event.domEvent as MouseEvent;
          console.log('🔴 [CONTEXT-MENU] Mostrando context menu para cliente ativado em:', mouseEvent.clientX, mouseEvent.clientY);
          this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
        }
      }
    }
    // 🆕 Verificar se é um cliente desativado
    else if (isCLIDES) {
      const index = this.markerPopsCliDes.indexOf(marker);
      if (index !== -1) {
        const clienteDes = this.destinoPopsCliDes[index];
        
        const clienteDesComMarcador =
          clienteDes != null
            ? this.popsCliMesclandoRecursosMarcador(marker, clienteDes)
            : clienteDes;

        console.log('🔴 [CONTEXT-MENU] Cliente Desativado encontrado no índice:', index);
        console.log('🔴 [CONTEXT-MENU] Dados do cliente desativado:', clienteDesComMarcador);

        // Armazenar dados do cliente desativado clicado
        this.clickedCliDesData = clienteDesComMarcador;
        this.clickedCliData = null; // Limpar dados de outros tipos
        this.clickedCliAtData = null;
        this.clickedClienteMarker = marker;
        this.clickedCaixaData = null;
        this.clickedCTOData = null;
        this.clickedCTOSPData = null;
        
        // Definir tipo de contexto como 'cliente'
        this.contextMenuType = 'cliente';
        
        // Mostrar context menu na posição do clique
        if (event.domEvent) {
          const mouseEvent = event.domEvent as MouseEvent;
          console.log('🔴 [CONTEXT-MENU] Mostrando context menu para cliente desativado em:', mouseEvent.clientX, mouseEvent.clientY);
          this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
        }
      }
    } else {
      console.log('🔴 [CONTEXT-MENU] Tipo de marcador não reconhecido:', { isCTO, isCTOSP, isCLI, isCLIAT, isCLIDES });
    }
  });

  // 🔧 NOTA: Touch events para caixas são tratados no listener global do mapa (setupContextMenuListener)
  // Isso permite detectar toques próximos a caixas usando coordenadas geográficas
}

  /**
   * 🔧 Método helper para detectar se está em dispositivo mobile
   */
  private isMobile(): boolean {
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 || 
           window.innerWidth <= 768;
  }

  private checkGoogleMapsAPI() {
    if ((window as any).google && (window as any).google.maps) {
      console.log('Google Maps API loaded successfully');
    } else {
      console.warn('Google Maps API not loaded yet. Waiting...');
      setTimeout(() => this.checkGoogleMapsAPI(), 1000);
    }
  }

  onMarkerClick(event: google.maps.MapMouseEvent, index: number, isCTO: boolean = false, isCTOSP: boolean=false, isCLI: boolean=false, isCLIAT: boolean=false, isCLIDES: boolean=false) {
    if (isCTO) {
      if (this.destinoCTO[index]) {
        console.log('CTO clicada', this.destinoCTO[index].numero);
        // 🔧 NOVO: Habilitar edição da CTO (tornar arrastável)
        this.habilitarEdicaoCTO(index);
      }
    }else if (isCTOSP) {
          if (this.destinoCTOSP[index]) {
        console.log('CTO SP clicada', this.destinoCTOSP[index].numero);
        // 🔧 NOVO: Habilitar edição da CTO_SP (tornar arrastável)
        this.habilitarEdicaoCTOSP(index);
    }

    // 🔧 REMOVIDO: Duplo clique em clientes não abre mais o modal
    // O modal agora é aberto apenas através do context menu (opção "Visualiza Cliente")
    // Blocos removidos: else if (isCLI), else if (isCLIAT), else if (isCLIDES)

  } else {
      if (this.destino[index]) {
        console.log('caixa clicada', this.destino[index].numero);
        // 🔧 NOVO: Habilitar edição da caixa (tornar arrastável)
        this.habilitarEdicaoCaixa(index);
  }
  }
}

  /**
   * 🔧 NOVO: Habilita a edição de uma caixa (torna arrastável)
   */
  private habilitarEdicaoCaixa(index: number): void {
    if (index < 0 || index >= this.markerCaixas.length) {
      console.error('❌ [EDITAR-CAIXA] Índice inválido:', index);
      return;
    }

    const marker = this.markerCaixas[index];
    const caixa = this.destino[index];

    if (!marker || !caixa) {
      console.error('❌ [EDITAR-CAIXA] Marcador ou caixa não encontrados');
      return;
    }

    // Se já há uma caixa em edição, desabilitar a anterior
    if (this.caixaEmEdicao) {
      this.desabilitarEdicaoCaixa();
    }
    if (this.sobraEmEdicao) {
      this.desabilitarEdicaoSobra();
    }

    // Salvar posição original para poder cancelar
    const position = marker.getPosition();
    if (position) {
      this.caixaEmEdicaoOriginalPosition = {
        lat: position.lat(),
        lng: position.lng()
      };
    }

    // 🔧 CORREÇÃO: Salvar ícone original ANTES de modificar
    this.caixaEmEdicaoOriginalIcon = marker.getIcon() as google.maps.Icon;

    // Tornar marcador arrastável
    marker.setDraggable(true);
    
    // Mudar aparência visual para indicar modo de edição
    marker.setOpacity(0.7);
    marker.setIcon(this.obterIconeCaixaEdicao(1, caixa.INSTALADA, 0));

    // Armazenar referências
    this.caixaEmEdicao = marker;
    this.caixaEmEdicaoIndex = index;
    this.caixaEmEdicaoTipo = 'caixa';

    // 🆕 Salvar id_meta da caixa no authService para buscar cabos conectados
    if (caixa.id_meta) {
      this.authService.setIDmetaCaixa(caixa.id_meta);
      console.log('💾 [EDITAR-CAIXA] ID_META salvo no authService:', caixa.id_meta);
    }

    console.log('✅ [EDITAR-CAIXA] Edição habilitada para caixa:', caixa.numero);
    //alert(`✅ Modo de edição ativado!\n\nCaixa: ${caixa.numero}\n\nArraste a caixa para mover.\nClique no mapa para salvar ou pressione ESC para cancelar.`);

    // Adicionar listener para salvar ao clicar no mapa
    if (this.map && !this.listenerMapaSalvarCaixa) {
      this.listenerMapaSalvarCaixa = this.map.addListener('click', () => {
        if (this.caixaEmEdicao) {
          this.salvarEdicaoCaixa();
        }
      });
    }

    // Adicionar listener para cancelar com ESC
    if (!this.listenerEscCancelarCaixa) {
      this.listenerEscCancelarCaixa = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.caixaEmEdicao) {
          this.cancelarEdicaoCaixa();
        }
      };
      document.addEventListener('keydown', this.listenerEscCancelarCaixa);
    }
  }

  /**
   * 🔧 NOVO: Habilita a edição de uma CTO (torna arrastável)
   */
  private habilitarEdicaoCTO(index: number): void {
    if (index < 0 || index >= this.markerCtos.length) {
      console.error('❌ [EDITAR-CTO] Índice inválido:', index);
      return;
    }

    const marker = this.markerCtos[index];
    const cto = this.destinoCTO[index];

    if (!marker || !cto) {
      console.error('❌ [EDITAR-CTO] Marcador ou CTO não encontrados');
      return;
    }

    // Se já há um item em edição, desabilitar o anterior
    if (this.caixaEmEdicao) {
      this.desabilitarEdicaoCaixa();
    }
    if (this.sobraEmEdicao) {
      this.desabilitarEdicaoSobra();
    }

    // Salvar posição original para poder cancelar
    const position = marker.getPosition();
    if (position) {
      this.caixaEmEdicaoOriginalPosition = {
        lat: position.lat(),
        lng: position.lng()
      };
    }

    // 🔧 CORREÇÃO: Salvar ícone original ANTES de modificar
    this.caixaEmEdicaoOriginalIcon = marker.getIcon() as google.maps.Icon;

    // Tornar marcador arrastável
    marker.setDraggable(true);
    
    // Mudar aparência visual para indicar modo de edição
    marker.setOpacity(0.7);
    marker.setIcon(
      this.obterIconeCaixaEdicao(
        parseInt(String(cto.ID_TIPO || '10'), 10),
        cto.INSTALADA,
        cto.conta_splitter ?? 0,
      ),
    );

    // Armazenar referências
    this.caixaEmEdicao = marker;
    this.caixaEmEdicaoIndex = index;
    this.caixaEmEdicaoTipo = 'cto';

    // 🆕 Salvar id_meta da CTO no authService para buscar cabos conectados
    if (cto.id_meta) {
      this.authService.setIDmetaCaixa(cto.id_meta);
      console.log('💾 [EDITAR-CTO] ID_META salvo no authService:', cto.id_meta);
    }

    console.log('✅ [EDITAR-CTO] Edição habilitada para CTO:', cto.numero);
    //alert(`✅ Modo de edição ativado!\n\nCTO: ${cto.numero}\n\nArraste a CTO para mover.\nClique no mapa para salvar ou pressione ESC para cancelar.`);

    // Adicionar listener para salvar ao clicar no mapa
    if (this.map && !this.listenerMapaSalvarCaixa) {
      this.listenerMapaSalvarCaixa = this.map.addListener('click', () => {
        if (this.caixaEmEdicao) {
          this.salvarEdicaoCaixa();
        }
      });
    }

    // Adicionar listener para cancelar com ESC
    if (!this.listenerEscCancelarCaixa) {
      this.listenerEscCancelarCaixa = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.caixaEmEdicao) {
          this.cancelarEdicaoCaixa();
        }
      };
      document.addEventListener('keydown', this.listenerEscCancelarCaixa);
    }
  }

  /**
   * 🔧 NOVO: Habilita a edição de uma CTO_SP (torna arrastável)
   */
  private habilitarEdicaoCTOSP(index: number): void {
    if (index < 0 || index >= this.markerCtosSP.length) {
      console.error('❌ [EDITAR-CTOSP] Índice inválido:', index);
      return;
    }

    const marker = this.markerCtosSP[index];
    const ctosp = this.destinoCTOSP[index];

    if (!marker || !ctosp) {
      console.error('❌ [EDITAR-CTOSP] Marcador ou CTO_SP não encontrados');
      return;
    }

    // Se já há um item em edição, desabilitar o anterior
    if (this.caixaEmEdicao) {
      this.desabilitarEdicaoCaixa();
    }
    if (this.sobraEmEdicao) {
      this.desabilitarEdicaoSobra();
    }

    // Salvar posição original para poder cancelar
    const position = marker.getPosition();
    if (position) {
      this.caixaEmEdicaoOriginalPosition = {
        lat: position.lat(),
        lng: position.lng()
      };
    }

    // 🔧 CORREÇÃO: Salvar ícone original ANTES de modificar
    this.caixaEmEdicaoOriginalIcon = marker.getIcon() as google.maps.Icon;

    // Tornar marcador arrastável
    marker.setDraggable(true);
    
    // Mudar aparência visual para indicar modo de edição
    marker.setOpacity(0.7);
    marker.setIcon(
      this.obterIconeCaixaEdicao(
        parseInt(String(ctosp.ID_TIPO || '10'), 10),
        ctosp.INSTALADA,
        ctosp.conta_splitter ?? 1,
      ),
    );

    // Armazenar referências
    this.caixaEmEdicao = marker;
    this.caixaEmEdicaoIndex = index;
    this.caixaEmEdicaoTipo = 'ctosp';

    // 🆕 Salvar id_meta da CTO_SP no authService para buscar cabos conectados
    if (ctosp.id_meta) {
      this.authService.setIDmetaCaixa(ctosp.id_meta);
      console.log('💾 [EDITAR-CTOSP] ID_META salvo no authService:', ctosp.id_meta);
    }

    console.log('✅ [EDITAR-CTOSP] Edição habilitada para CTO_SP:', ctosp.numero);
    //alert(`✅ Modo de edição ativado!\n\nCTO_SP: ${ctosp.numero}\n\nArraste a CTO_SP para mover.\nClique no mapa para salvar ou pressione ESC para cancelar.`);

    // Adicionar listener para salvar ao clicar no mapa
    if (this.map && !this.listenerMapaSalvarCaixa) {
      this.listenerMapaSalvarCaixa = this.map.addListener('click', () => {
        if (this.caixaEmEdicao) {
          this.salvarEdicaoCaixa();
        }
      });
    }

    // Adicionar listener para cancelar com ESC
    if (!this.listenerEscCancelarCaixa) {
      this.listenerEscCancelarCaixa = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.caixaEmEdicao) {
          this.cancelarEdicaoCaixa();
        }
      };
      document.addEventListener('keydown', this.listenerEscCancelarCaixa);
    }
  }

  /**
   * 🔧 NOVO: Desabilita a edição (genérico para caixa, CTO ou CTO_SP)
   */
  private desabilitarEdicaoCaixa(): void {
    if (this.caixaEmEdicao) {
      this.caixaEmEdicao.setDraggable(false);
      this.caixaEmEdicao.setOpacity(1.0);
      
      // Restaurar ícone original
      if (this.caixaEmEdicaoOriginalIcon) {
        this.caixaEmEdicao.setIcon(this.caixaEmEdicaoOriginalIcon);
      }
    }

    // Remover listeners
    if (this.listenerMapaSalvarCaixa) {
      google.maps.event.removeListener(this.listenerMapaSalvarCaixa);
      this.listenerMapaSalvarCaixa = null;
    }

    if (this.listenerEscCancelarCaixa) {
      document.removeEventListener('keydown', this.listenerEscCancelarCaixa);
      this.listenerEscCancelarCaixa = null;
    }

    this.caixaEmEdicao = null;
    this.caixaEmEdicaoIndex = null;
    this.caixaEmEdicaoTipo = null;
    this.caixaEmEdicaoOriginalPosition = null;
    this.caixaEmEdicaoOriginalIcon = null;
  }

  /**
   * 🔧 NOVO: Salva a edição (genérico para caixa, CTO ou CTO_SP)
   */
  private salvarEdicaoCaixa(): void {
    if (!this.caixaEmEdicao || this.caixaEmEdicaoIndex === null || !this.caixaEmEdicaoTipo) {
      return;
    }

    const position = this.caixaEmEdicao.getPosition();
    if (!position) {
      console.error('❌ [EDITAR] Posição não disponível');
      return;
    }

    const newLat = position.lat();
    const newLng = position.lng();

    console.log(`💾 [EDITAR-${this.caixaEmEdicaoTipo.toUpperCase()}] Salvando nova posição:`, { lat: newLat, lng: newLng });

    // Atualizar baseado no tipo
    if (this.caixaEmEdicaoTipo === 'caixa') {
      const caixa = this.destino[this.caixaEmEdicaoIndex];
            
      // Verificar se tem id_meta
      if (!caixa.id_meta) {
        console.error('❌ [EDITAR-CAIXA] ID_META não encontrado na caixa');
        alert('❌ Erro: ID_META da caixa não encontrado!');
        return;
      }

      // Atualizar coordenadas localmente
      caixa.LAT = newLat as any;
      caixa.LONGI = newLng as any;
      
    // Chamar serviço para atualizar coordenadas no banco
    this.updateCaixaService.atualizarCoordenadas({
      ID_META: caixa.id_meta,
      lat: newLat,
      lng: newLng
    }).subscribe({
      next: (response) => {
        console.log('✅ [EDITAR-CAIXA] Coordenadas atualizadas com sucesso:', response);
        
        // 🆕 Atualizar cabos conectados à caixa (apenas se tiver id_meta)
        if (caixa.id_meta) {
          const novaCoordenada = new google.maps.LatLng(newLat, newLng);
          this.atualizarCabosConectadosACaixa(caixa.id_meta, novaCoordenada)
            .then(() => {
              console.log('✅ [EDITAR-CAIXA] Cabos conectados atualizados');
            })
            .catch((error) => {
              console.error('❌ [EDITAR-CAIXA] Erro ao atualizar cabos:', error);
            });
        }
        
        // Mostrar alerta com id_meta quando a caixa for movimentada
       // alert(`📦 Caixa movimentada!\n\n🆔 ID_META: ${caixa.id_meta}\n\n✅ ${response.message}`);
        // Desabilitar edição após sucesso
        this.desabilitarEdicaoCaixa();
      },
      error: (error) => {
        console.error('❌ [EDITAR-CAIXA] Erro ao atualizar coordenadas:', error);
        // Reverter coordenadas em caso de erro
        if (this.caixaEmEdicao) {
          const originalPos = this.caixaEmEdicaoOriginalPosition;
          if (originalPos) {
            this.caixaEmEdicao.setPosition({
              lat: originalPos.lat,
              lng: originalPos.lng
            });
            caixa.LAT = originalPos.lat as any;
            caixa.LONGI = originalPos.lng as any;
          }
        }
        alert(`❌ Erro ao atualizar coordenadas da caixa!\n\n🆔 ID_META: ${caixa.id_meta}\n\nErro: ${error.message}`);
        // Desabilitar edição mesmo em caso de erro (para não ficar travado)
        this.desabilitarEdicaoCaixa();
      }
    });

      
    
    // Retornar aqui para não desabilitar edição antes da requisição terminar
    return;
    } else if (this.caixaEmEdicaoTipo === 'cto') {
      const cto = this.destinoCTO[this.caixaEmEdicaoIndex];
      
      // Verificar se tem id_meta
      if (!cto.id_meta) {
        console.error('❌ [EDITAR-CTO] ID_META não encontrado na CTO');
        alert('❌ Erro: ID_META da CTO não encontrado!');
        return;
      }

      // Atualizar coordenadas localmente
      cto.LAT = newLat as any;
      cto.LONGI = newLng as any;
      
      // Chamar serviço para atualizar coordenadas no banco
      this.updateCaixaService.atualizarCoordenadas({
        ID_META: cto.id_meta,
        lat: newLat,
        lng: newLng
      }).subscribe({
        next: (response) => {
          console.log('✅ [EDITAR-CTO] Coordenadas atualizadas com sucesso:', response);
          
          // 🆕 Atualizar cabos conectados à CTO (apenas se tiver id_meta)
          if (cto.id_meta) {
            const novaCoordenada = new google.maps.LatLng(newLat, newLng);
            this.atualizarCabosConectadosACaixa(cto.id_meta, novaCoordenada)
              .then(() => {
                console.log('✅ [EDITAR-CTO] Cabos conectados atualizados');
              })
              .catch((error) => {
                console.error('❌ [EDITAR-CTO] Erro ao atualizar cabos:', error);
              });
          }
          
          // Mostrar alerta com id_meta quando a CTO for movimentada
          // alert(`📦 CTO movimentada!\n\n🆔 ID_META: ${cto.id_meta}\n\n✅ ${response.message}`);
          // Desabilitar edição após sucesso
          this.desabilitarEdicaoCaixa();
        },
        error: (error) => {
          console.error('❌ [EDITAR-CTO] Erro ao atualizar coordenadas:', error);
          // Reverter coordenadas em caso de erro
          if (this.caixaEmEdicao) {
            const originalPos = this.caixaEmEdicaoOriginalPosition;
            if (originalPos) {
              this.caixaEmEdicao.setPosition({
                lat: originalPos.lat,
                lng: originalPos.lng
              });
              cto.LAT = originalPos.lat as any;
              cto.LONGI = originalPos.lng as any;
            }
          }
          alert(`❌ Erro ao atualizar coordenadas da CTO!\n\n🆔 ID_META: ${cto.id_meta}\n\nErro: ${error.message}`);
          // Desabilitar edição mesmo em caso de erro (para não ficar travado)
          this.desabilitarEdicaoCaixa();
        }
      });

        // Inserir log de atualização de caixa com id_evento 31
    const idUsuario = this.authService.getIdUser();
    const idCity = this.authService.getIdCity();
    if (idUsuario && idCity) {
      console.log('🔄 Inserindo log de move de caixa...');
      this.insertLogService.inserirLog({
        id_usuario: idUsuario,
        id_evento: 31,
        id_city: idCity,
        id_meta_objeto: cto.id_meta,
        descricao: `Move Caixa CTO numero: ${cto.numero}  idmeta: ${cto.id_meta} `,
        VERSION: 'Fiberworks WEB 1.0.0'
      }).subscribe({
      next: (logResponse) => {
        console.log('✅ Log de move de caixa:', logResponse);
      },
      error: (error) => {
        console.error('❌ Erro ao inserir log de move de caixa:', error);
      }
    });
    }
      
      // Retornar aqui para não desabilitar edição antes da requisição terminar
      return;
    } else if (this.caixaEmEdicaoTipo === 'ctosp') {
      const ctosp = this.destinoCTOSP[this.caixaEmEdicaoIndex];
      
      // Verificar se tem id_meta
      if (!ctosp.id_meta) {
        console.error('❌ [EDITAR-CTOSP] ID_META não encontrado na CTO_SP');
        alert('❌ Erro: ID_META da CTO_SP não encontrado!');
        return;
      }

      // Atualizar coordenadas localmente
      ctosp.LAT = newLat as any;
      ctosp.LONGI = newLng as any;
      
      // Chamar serviço para atualizar coordenadas no banco
      this.updateCaixaService.atualizarCoordenadas({
        ID_META: ctosp.id_meta,
        lat: newLat,
        lng: newLng
      }).subscribe({
        next: (response) => {
          console.log('✅ [EDITAR-CTOSP] Coordenadas atualizadas com sucesso:', response);
          
          // 🆕 Atualizar cabos conectados à CTO_SP (apenas se tiver id_meta)
          if (ctosp.id_meta) {
            const novaCoordenada = new google.maps.LatLng(newLat, newLng);
            this.atualizarCabosConectadosACaixa(ctosp.id_meta, novaCoordenada)
              .then(() => {
                console.log('✅ [EDITAR-CTOSP] Cabos conectados atualizados');
              })
              .catch((error) => {
                console.error('❌ [EDITAR-CTOSP] Erro ao atualizar cabos:', error);
              });
          }
          
          // Mostrar alerta com id_meta quando a CTO_SP for movimentada
          // alert(`📦 CTO_SP movimentada!\n\n🆔 ID_META: ${ctosp.id_meta}\n\n✅ ${response.message}`);
          // Desabilitar edição após sucesso
          this.desabilitarEdicaoCaixa();
        },
        error: (error) => {
          console.error('❌ [EDITAR-CTOSP] Erro ao atualizar coordenadas:', error);
          // Reverter coordenadas em caso de erro
          if (this.caixaEmEdicao) {
            const originalPos = this.caixaEmEdicaoOriginalPosition;
            if (originalPos) {
              this.caixaEmEdicao.setPosition({
                lat: originalPos.lat,
                lng: originalPos.lng
              });
              ctosp.LAT = originalPos.lat as any;
              ctosp.LONGI = originalPos.lng as any;
            }
          }
          alert(`❌ Erro ao atualizar coordenadas da CTO_SP!\n\n🆔 ID_META: ${ctosp.id_meta}\n\nErro: ${error.message}`);
          // Desabilitar edição mesmo em caso de erro (para não ficar travado)
          this.desabilitarEdicaoCaixa();
        }
      });



       // Inserir log de atualização de caixa com id_evento 31
    const idUsuario = this.authService.getIdUser();
    const idCity = this.authService.getIdCity();
    if (idUsuario && idCity) {
      console.log('🔄 Inserindo log de move de caixa...');
      this.insertLogService.inserirLog({
        id_usuario: idUsuario,
        id_evento: 31,
        id_city: idCity,
        id_meta_objeto: ctosp.id_meta,
        descricao: `Move Caixa CTO numero: ${ctosp.numero}  idmeta: ${ctosp.id_meta} `,
        VERSION: 'Fiberworks WEB 1.0.0'
      }).subscribe({
      next: (logResponse) => {
        console.log('✅ Log de move de caixa:', logResponse);
      },
      error: (error) => {
        console.error('❌ Erro ao inserir log de move de caixa:', error);
      }
    });
    }

    
      
      // Retornar aqui para não desabilitar edição antes da requisição terminar
      return;
    }

    // Desabilitar edição (caso não entre em nenhum dos ifs acima)
    this.desabilitarEdicaoCaixa();


    
  }

  /**
   * 🔍 Encontra uma polyline pelo id_meta em todos os arrays de cabos
   * @param idMeta - ID do cabo a ser encontrado
   * @returns Polyline encontrada ou null
   */
  private encontrarPolylinePorIdMeta(idMeta: number): google.maps.Polyline | null {
    // Buscar em todos os arrays de polylines
    const todosArraysPolylines = [
      this.polylines1f,
      this.polylines2f,
      this.polylines4f,
      this.polylines6f,
      this.polylines8f,
      this.polylines12f,
      this.polylines24f,
      this.polylines36f,
      this.polylines48f,
      this.polylines72f,
      this.polylines144f
    ];

    console.log(`🔍 [BUSCAR-CABO] Procurando cabo com id_meta: ${idMeta}`);

    for (const arrayPolylines of todosArraysPolylines) {
      for (const polyline of arrayPolylines) {
        const idMetaPolyline = polyline.get('id_meta');
        // Comparar como número ou string
        if (idMetaPolyline === idMeta || 
            idMetaPolyline === idMeta.toString() || 
            Number(idMetaPolyline) === idMeta) {
          console.log(`✅ [BUSCAR-CABO] Cabo encontrado! id_meta: ${idMeta}`);
          return polyline;
        }
      }
    }
    
    console.warn(`⚠️ [BUSCAR-CABO] Cabo não encontrado com id_meta: ${idMeta}`);
    return null;
  }

  /**
   * 🔧 Atualiza a ponta (A ou B) de um cabo para uma nova coordenada
   * @param polyline - Polyline do cabo
   * @param ponta - 'A' (primeiro ponto) ou 'B' (último ponto)
   * @param novaCoordenada - Nova coordenada da ponta
   */
  private atualizarPontaCabo(
    polyline: google.maps.Polyline, 
    ponta: 'A' | 'B', 
    novaCoordenada: google.maps.LatLng
  ): void {
    const path = polyline.getPath();
    if (!path || path.getLength() < 2) {
      console.error('❌ [ATUALIZAR-PONTA] Path inválido');
      return;
    }

    // Determinar índice da ponta (0 = A, último = B)
    const indexPonta = ponta === 'A' ? 0 : path.getLength() - 1;
    
    // Atualizar a ponta
    path.setAt(indexPonta, novaCoordenada);
    
    console.log(`✅ [ATUALIZAR-PONTA] Ponta ${ponta} atualizada para:`, {
      lat: novaCoordenada.lat(),
      lng: novaCoordenada.lng()
    });
  }

  /** Caboxd/Caboxe da sobra: `cabo` + id_meta + `A`|`B`; `Z` ou vazio = desconectado. */
  private parseReferenciaCaboSobra(
    ref: string | undefined | null,
  ): { idMetaCabo: number; ponta: 'A' | 'B' } | null {
    const trimmed = String(ref ?? '').trim();
    if (!trimmed || trimmed.toUpperCase() === 'Z') {
      return null;
    }
    const match = trimmed.match(/^cabo(\d+)([AB])$/i);
    if (!match) {
      return null;
    }
    return {
      idMetaCabo: parseInt(match[1], 10),
      ponta: match[2].toUpperCase() as 'A' | 'B',
    };
  }

  private persistirPolylineCabo(
    polyline: google.maps.Polyline,
    idMetaCabo: number,
    logPrefix: string,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const coordenadasAtualizadas = this.updateCaboService.extrairCoordenadasPolyline(polyline);
      const novoComprimento = this.updateCaboService.calcularComprimentoPolyline(polyline);
      const caboData = {
        id_meta: idMetaCabo,
        length: novoComprimento,
        GOOGLE_LATLNG: coordenadasAtualizadas,
      };

      console.log(`${logPrefix} Salvando cabo ${idMetaCabo} no banco...`, caboData);

      this.updateCaboService.atualizarCabo(caboData).subscribe({
        next: (response) => {
          console.log(`${logPrefix} Cabo ${idMetaCabo} salvo com sucesso:`, response);
          resolve();
        },
        error: (error) => {
          console.error(`${logPrefix} Erro ao salvar cabo ${idMetaCabo}:`, error);
          resolve();
        },
      });
    });
  }

  /**
   * Atualiza pontas dos cabos referenciados em Caboxd/Caboxe ao mover a sobra.
   */
  private async atualizarCabosConectadosASobra(
    caboxd: string,
    caboxe: string,
    novaCoordenada: google.maps.LatLng,
  ): Promise<void> {
    const logPrefix = '🔌 [CABOS-CONECTADOS-SOBRA]';
    try {
      const refs = [
        { campo: 'Caboxd', parsed: this.parseReferenciaCaboSobra(caboxd) },
        { campo: 'Caboxe', parsed: this.parseReferenciaCaboSobra(caboxe) },
      ];

      const promessasSalvamento: Promise<void>[] = [];

      for (const { campo, parsed } of refs) {
        if (!parsed) {
          continue;
        }

        const { idMetaCabo, ponta } = parsed;
        console.log(`${logPrefix} ${campo}: cabo ${idMetaCabo}, ponta ${ponta}`);

        const polyline = this.encontrarPolylinePorIdMeta(idMetaCabo);
        if (!polyline) {
          console.warn(`${logPrefix} Polyline não encontrada para cabo ${idMetaCabo}`);
          continue;
        }

        this.atualizarPontaCabo(polyline, ponta, novaCoordenada);
        promessasSalvamento.push(
          this.persistirPolylineCabo(polyline, idMetaCabo, logPrefix),
        );
      }

      await Promise.allSettled(promessasSalvamento);
      console.log(
        `${logPrefix} Processamento concluído. ${promessasSalvamento.length} cabo(s) processado(s)`,
      );
    } catch (error) {
      console.error(`${logPrefix} Erro ao atualizar cabos conectados:`, error);
    }
  }

  /**
   * 🔌 Busca e atualiza todas as pontas dos cabos conectados à caixa
   * @param idMetaCaixa - ID da caixa
   * @param novaCoordenada - Nova coordenada da caixa
   */
  private async atualizarCabosConectadosACaixa(
    idMetaCaixa: number, 
    novaCoordenada: google.maps.LatLng
  ): Promise<void> {
    try {
      console.log(`🔌 [CABOS-CONECTADOS] Buscando cabos conectados à caixa ${idMetaCaixa}`);
      
      // Buscar bocas da caixa
      const retorno = await firstValueFrom(this.bocasService.selecionar());
      
      // Processar resposta (pode vir como {response: Bocas[]} ou Bocas[] direto)
      let bocasData: Bocas | null = null;
      if ('response' in retorno && Array.isArray((retorno as any).response)) {
        bocasData = (retorno as any).response[0];
      } else if (Array.isArray(retorno) && retorno.length > 0) {
        bocasData = retorno[0];
      } else {
        bocasData = retorno as any;
      }

      if (!bocasData) {
        console.warn('⚠️ [CABOS-CONECTADOS] Nenhum dado de boca retornado');
        return;
      }

      console.log('📋 [CABOS-CONECTADOS] Dados das bocas:', bocasData);

      // Processar cada boca (BOCA1 a BOCA18)
      const promessasSalvamento: Promise<void>[] = [];
      
      for (let i = 1; i <= 18; i++) {
        const bocaKey = `BOCA${i}` as keyof Bocas;
        const valorBoca = bocasData[bocaKey];
        
        // Verificar se a boca tem cabo conectado (não está vazia)
        if (!valorBoca || valorBoca.trim() === '' || valorBoca.trim() === ' ') {
          continue; // Boca vazia, pular
        }

        // Extrair id_meta e ponta do formato "cabo387414B"
        // Formato: "cabo" + número (id_meta) + letra (A ou B)
        const match = valorBoca.match(/^cabo(\d+)([AB])$/i);
        
        if (!match) {
          console.warn(`⚠️ [CABOS-CONECTADOS] Formato inválido na BOCA${i}: ${valorBoca}`);
          continue;
        }

        const idMetaCabo = parseInt(match[1], 10);
        const ponta = match[2].toUpperCase() as 'A' | 'B';

        console.log(`🔍 [CABOS-CONECTADOS] BOCA${i}: cabo ${idMetaCabo}, ponta ${ponta}`);

        // Encontrar a polyline do cabo
        const polyline = this.encontrarPolylinePorIdMeta(idMetaCabo);
        
        if (!polyline) {
          console.warn(`⚠️ [CABOS-CONECTADOS] Polyline não encontrada para cabo ${idMetaCabo}`);
          continue;
        }

        // Atualizar a ponta do cabo visualmente
        this.atualizarPontaCabo(polyline, ponta, novaCoordenada);
        
        // 🆕 Salvar no banco após atualizar visualmente
        const promessaSalvamento = new Promise<void>((resolve) => {
          // Extrair coordenadas atualizadas da polyline
          const coordenadasAtualizadas = this.updateCaboService.extrairCoordenadasPolyline(polyline);
          
          // Calcular novo comprimento
          const novoComprimento = this.updateCaboService.calcularComprimentoPolyline(polyline);
          
          // Preparar dados para atualização
          const caboData = {
            id_meta: idMetaCabo,
            length: novoComprimento,
            GOOGLE_LATLNG: coordenadasAtualizadas
          };

          console.log(`💾 [CABOS-CONECTADOS] Salvando cabo ${idMetaCabo} no banco...`, caboData);

          // Salvar no banco
          this.updateCaboService.atualizarCabo(caboData).subscribe({
            next: (response) => {
              console.log(`✅ [CABOS-CONECTADOS] Cabo ${idMetaCabo} salvo com sucesso:`, response);
              resolve();
            },
            error: (error) => {
              console.error(`❌ [CABOS-CONECTADOS] Erro ao salvar cabo ${idMetaCabo}:`, error);
              // Resolve mesmo com erro para não bloquear outros cabos
              resolve();
            }
          });
        });

        promessasSalvamento.push(promessaSalvamento);
      }

      // Aguardar todos os salvamentos (mas não bloquear se algum falhar)
      await Promise.allSettled(promessasSalvamento);
      
      console.log(`✅ [CABOS-CONECTADOS] Processamento concluído. ${promessasSalvamento.length} cabo(s) processado(s)`);
      
    } catch (error) {
      console.error('❌ [CABOS-CONECTADOS] Erro ao atualizar cabos conectados:', error);
      // Não mostrar alerta para não interromper o fluxo de edição
    }
  }

  /**
   * 🔌 Busca e atualiza todas as pontas dos cabos conectados ao DIO
   * @param idMetaDio - ID do DIO
   * @param novaCoordenada - Nova coordenada do DIO
   */
  private async atualizarCabosConectadosADio(
    idMetaDio: number, 
    novaCoordenada: google.maps.LatLng
  ): Promise<void> {
    try {
      console.log(`🔌 [CABOS-CONECTADOS-DIO] Buscando cabos conectados ao DIO ${idMetaDio}`);
      
      // Buscar bandejas do DIO
      const retorno = await firstValueFrom(this.bandejasService.selecionar());
      
      // Processar resposta (pode vir como {response: Bandejas[]} ou Bandejas[] direto)
      let bandejasData: Bandejas | null = null;
      if ('response' in retorno && Array.isArray((retorno as any).response)) {
        bandejasData = (retorno as any).response[0];
      } else if (Array.isArray(retorno) && retorno.length > 0) {
        bandejasData = retorno[0];
      } else {
        bandejasData = retorno as any;
      }

      if (!bandejasData) {
        console.warn('⚠️ [CABOS-CONECTADOS-DIO] Nenhum dado de bandeja retornado');
        return;
      }

      console.log('📋 [CABOS-CONECTADOS-DIO] Dados das bandejas:', bandejasData);

      // Processar cada bandeja (C1 a C6)
      const promessasSalvamento: Promise<void>[] = [];
      
      for (let i = 1; i <= 6; i++) {
        const bandejaKey = `C${i}` as keyof Bandejas;
        const valorBandeja = bandejasData[bandejaKey];
        
        // Verificar se a bandeja tem cabo conectado (não está vazia ou 'ZERO')
        if (!valorBandeja) {
          continue; // Bandeja vazia, pular
        }
        
        const valorBandejaLimpo = valorBandeja.trim().toUpperCase();
        if (valorBandejaLimpo === '' || valorBandejaLimpo === 'ZERO') {
          continue; // Bandeja sem cabo, pular
        }

        // Extrair id_meta e ponta do formato "cabo387414B"
        // Formato: "cabo" + número (id_meta) + letra (A ou B)
        const match = valorBandeja.match(/^cabo(\d+)([AB])$/i);
        
        if (!match) {
          console.warn(`⚠️ [CABOS-CONECTADOS-DIO] Formato inválido na C${i}: ${valorBandeja}`);
          continue;
        }

        const idMetaCabo = parseInt(match[1], 10);
        const ponta = match[2].toUpperCase() as 'A' | 'B';

        console.log(`🔍 [CABOS-CONECTADOS-DIO] C${i}: cabo ${idMetaCabo}, ponta ${ponta}`);

        // Encontrar a polyline do cabo
        const polyline = this.encontrarPolylinePorIdMeta(idMetaCabo);
        
        if (!polyline) {
          console.warn(`⚠️ [CABOS-CONECTADOS-DIO] Polyline não encontrada para cabo ${idMetaCabo}`);
          continue;
        }

        // Atualizar a ponta do cabo visualmente
        this.atualizarPontaCabo(polyline, ponta, novaCoordenada);
        
        // 🆕 Salvar no banco após atualizar visualmente
        const promessaSalvamento = new Promise<void>((resolve) => {
          // Extrair coordenadas atualizadas da polyline
          const coordenadasAtualizadas = this.updateCaboService.extrairCoordenadasPolyline(polyline);
          
          // Calcular novo comprimento
          const novoComprimento = this.updateCaboService.calcularComprimentoPolyline(polyline);
          
          // Preparar dados para atualização
          const caboData = {
            id_meta: idMetaCabo,
            length: novoComprimento,
            GOOGLE_LATLNG: coordenadasAtualizadas
          };

          console.log(`💾 [CABOS-CONECTADOS-DIO] Salvando cabo ${idMetaCabo} no banco...`, caboData);

          // Salvar no banco
          this.updateCaboService.atualizarCabo(caboData).subscribe({
            next: (response) => {
              console.log(`✅ [CABOS-CONECTADOS-DIO] Cabo ${idMetaCabo} salvo com sucesso:`, response);
              resolve();
            },
            error: (error) => {
              console.error(`❌ [CABOS-CONECTADOS-DIO] Erro ao salvar cabo ${idMetaCabo}:`, error);
              // Resolve mesmo com erro para não bloquear outros cabos
              resolve();
            }
          });
        });

        promessasSalvamento.push(promessaSalvamento);
      }

      // Aguardar todos os salvamentos (mas não bloquear se algum falhar)
      await Promise.allSettled(promessasSalvamento);
      
      console.log(`✅ [CABOS-CONECTADOS-DIO] Processamento concluído. ${promessasSalvamento.length} cabo(s) processado(s)`);
      
    } catch (error) {
      console.error('❌ [CABOS-CONECTADOS-DIO] Erro ao atualizar cabos conectados:', error);
      // Não mostrar alerta para não interromper o fluxo de edição
    }
  }

  /**
   * 🔧 NOVO: Cancela a edição da caixa (restaura posição original)
   */
  private cancelarEdicaoCaixa(): void {
    if (!this.caixaEmEdicao || !this.caixaEmEdicaoOriginalPosition) {
      return;
    }

    // Restaurar posição original
    this.caixaEmEdicao.setPosition({
      lat: this.caixaEmEdicaoOriginalPosition.lat,
      lng: this.caixaEmEdicaoOriginalPosition.lng
    });

    // Desabilitar edição
    this.desabilitarEdicaoCaixa();

    console.log('❌ [EDITAR-CAIXA] Edição cancelada, posição restaurada');
    alert('Edição cancelada. Posição original restaurada.');
  }

  // ============================================================================
  // 🔧 MÉTODOS DE EDIÇÃO DE DIO
  // ============================================================================

  /**
   * 🔧 Habilita a edição de um DIO (torna arrastável)
   */
  private habilitarEdicaoDio(index: number): void {
    if (index < 0 || index >= this.markerDios.length) {
      console.error('❌ [EDITAR-DIO] Índice inválido:', index);
      return;
    }

    const marker = this.markerDios[index];
    const dio = this.destinoDios[index];

    if (!marker || !dio) {
      console.error('❌ [EDITAR-DIO] Marcador ou DIO não encontrados');
      return;
    }

    // Se já há um DIO em edição, desabilitar o anterior
    if (this.dioEmEdicao) {
      this.desabilitarEdicaoDio();
    }

    // Salvar posição original para poder cancelar
    const position = marker.getPosition();
    if (position) {
      this.dioEmEdicaoOriginalPosition = {
        lat: position.lat(),
        lng: position.lng()
      };
    }

    // Salvar ícone original
    this.dioEmEdicaoOriginalIcon = marker.getIcon() as google.maps.Icon;

    // Tornar marcador arrastável
    marker.setDraggable(true);
    
    // Mudar aparência visual para indicar modo de edição
    marker.setOpacity(0.7);
    marker.setIcon({
      url: '/assets/dioV2.png',
      labelOrigin: new google.maps.Point(58, 35),
      scaledSize: new google.maps.Size(140, 25.2) // Ligeiramente maior (original: 120, 21.6)
    });

    // Armazenar referências
    this.dioEmEdicao = marker;
    this.dioEmEdicaoIndex = index;

    // 🆕 Salvar id_meta do DIO no authService para buscar bandejas conectadas
    if (dio.id_meta) {
      this.authService.setIDmetaDio(dio.id_meta);
      console.log('💾 [EDITAR-DIO] ID_META salvo no authService:', dio.id_meta);
    }

    console.log('✅ [EDITAR-DIO] Edição habilitada para DIO:', dio.sigla);

    // Adicionar listener para salvar ao clicar no mapa
    if (this.map && !this.listenerMapaSalvarDio) {
      this.listenerMapaSalvarDio = this.map.addListener('click', () => {
        if (this.dioEmEdicao) {
          this.salvarEdicaoDio();
        }
      });
    }

    // Adicionar listener para cancelar com ESC
    if (!this.listenerEscCancelarDio) {
      this.listenerEscCancelarDio = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.dioEmEdicao) {
          this.cancelarEdicaoDio();
        }
      };
      document.addEventListener('keydown', this.listenerEscCancelarDio);
    }
  }

  /**
   * Habilita a edição de uma estação (torna arrastável)
   */
  private habilitarEdicaoEstacao(index: number): void {
    if (index < 0 || index >= this.markerPopsEst.length) {
      console.error('❌ [EDITAR-ESTAÇÃO] Índice inválido:', index);
      return;
    }

    const marker = this.markerPopsEst[index];
    const estacao = this.destinoPopsEst[index];

    if (!marker || !estacao) {
      console.error('❌ [EDITAR-ESTAÇÃO] Marcador ou estação não encontrados');
      return;
    }

    // Se já há uma estação em edição, desabilitar a anterior
    if (this.estacaoEmEdicao) {
      this.desabilitarEdicaoEstacao();
    }

    // Salvar posição original para poder cancelar
    const position = marker.getPosition();
    if (position) {
      this.estacaoEmEdicaoOriginalPosition = {
        lat: position.lat(),
        lng: position.lng()
      };
    }

    // Salvar ícone original ANTES de modificar
    this.estacaoEmEdicaoOriginalIcon = marker.getIcon() as google.maps.Icon;

    // Tornar marcador arrastável
    marker.setDraggable(true);
    
    // Mudar aparência visual para indicar modo de edição
    marker.setOpacity(0.7);
    marker.setIcon({
      url: '/assets/TORRE4.png',
      labelOrigin: new google.maps.Point(50, 0),
      scaledSize: new google.maps.Size(30, 30) // Ligeiramente maior (original: 25, 25)
    });

    // Armazenar referências
    this.estacaoEmEdicao = marker;
    this.estacaoEmEdicaoIndex = index;

    console.log('✅ [EDITAR-ESTAÇÃO] Edição habilitada para estação:', estacao.sigla);

    // Adicionar listener para salvar ao clicar no mapa
    if (this.map && !this.listenerMapaSalvarEstacao) {
      this.listenerMapaSalvarEstacao = this.map.addListener('click', () => {
        if (this.estacaoEmEdicao) {
          this.salvarEdicaoEstacao();
        }
      });
    }

    // Adicionar listener para cancelar com ESC
    if (!this.listenerEscCancelarEstacao) {
      this.listenerEscCancelarEstacao = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.estacaoEmEdicao) {
          this.cancelarEdicaoEstacao();
        }
      };
      document.addEventListener('keydown', this.listenerEscCancelarEstacao);
    }
  }

  /**
   * Desabilita a edição da estação
   */
  private desabilitarEdicaoEstacao(): void {
    if (this.estacaoEmEdicao) {
      this.estacaoEmEdicao.setDraggable(false);
      this.estacaoEmEdicao.setOpacity(1.0);
      
      // Restaurar ícone original
      if (this.estacaoEmEdicaoOriginalIcon) {
        this.estacaoEmEdicao.setIcon(this.estacaoEmEdicaoOriginalIcon);
      }
    }

    // Remover listeners
    if (this.listenerMapaSalvarEstacao) {
      google.maps.event.removeListener(this.listenerMapaSalvarEstacao);
      this.listenerMapaSalvarEstacao = null;
    }

    if (this.listenerEscCancelarEstacao) {
      document.removeEventListener('keydown', this.listenerEscCancelarEstacao);
      this.listenerEscCancelarEstacao = null;
    }

    this.estacaoEmEdicao = null;
    this.estacaoEmEdicaoIndex = null;
    this.estacaoEmEdicaoOriginalPosition = null;
    this.estacaoEmEdicaoOriginalIcon = null;
  }
   /***********************conjunto de funções para edição cliente no mapa ************************ */
   /* -> habilitaEdiçãoCliente 
      -> desabilitaEdicaoCliente
      -> salvarEdicaoCliente
      -> cancelarEdicaoCliente  */
  /**
   * Habilita a edição de um cliente (torna arrastável)
   */
  private habilitarEdicaoCliente(index: number, tipo: 'cli' | 'cliat' | 'clides'): void {
    const arrays = {
      cli: { markers: this.markerPopsCli, destinos: this.destinoPopsCli },
      cliat: { markers: this.markerPopsCliAtv, destinos: this.destinoPopsCliAtv },
      clides: { markers: this.markerPopsCliDes, destinos: this.destinoPopsCliDes }
    };
    const arr = arrays[tipo];
    if (!arr || index < 0 || index >= arr.markers.length) {
      console.error('❌ [EDITAR-CLIENTE] Índice ou tipo inválido:', index, tipo);
      return;
    }

    const marker = arr.markers[index];
    const cliente = arr.destinos?.[index];

    if (!marker || !cliente) {
      console.error('❌ [EDITAR-CLIENTE] Marcador ou cliente não encontrados');
      return;
    }

    if (this.clienteEmEdicao) {
      this.desabilitarEdicaoCliente();
    }

    const position = marker.getPosition();
    if (position) {
      this.clienteEmEdicaoOriginalPosition = { lat: position.lat(), lng: position.lng() };
    }
    this.clienteEmEdicaoOriginalIcon = marker.getIcon() as google.maps.Icon;

    const origIcon = marker.getIcon() as google.maps.Symbol;
    const editIcon: google.maps.Symbol = {
      ...origIcon,
      scale: 6,
      fillOpacity: 1.0
    };
    marker.setIcon(editIcon);
    marker.setOpacity(1.0);
    marker.setDraggable(true);

    this.clienteEmEdicao = marker;
    this.clienteEmEdicaoIndex = index;
    this.clienteEmEdicaoTipo = tipo;

    const sigla = (cliente as any).sigla || (cliente as any).SIGLA || 'N/A';
    console.log('✅ [EDITAR-CLIENTE] Edição habilitada para cliente:', sigla);

    if (this.map && !this.listenerMapaSalvarCliente) {
      this.listenerMapaSalvarCliente = this.map.addListener('click', () => {
        if (this.clienteEmEdicao) {
          this.salvarEdicaoCliente();
        }
      });
    }

    if (!this.listenerEscCancelarCliente) {
      this.listenerEscCancelarCliente = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.clienteEmEdicao) {
          this.cancelarEdicaoCliente();
        }
      };
      document.addEventListener('keydown', this.listenerEscCancelarCliente);
    }
  }

  /**
   * Desabilita a edição do cliente
   */
  private desabilitarEdicaoCliente(): void {
    if (this.clienteEmEdicao) {
      this.clienteEmEdicao.setDraggable(false);
      this.clienteEmEdicao.setOpacity(0.8);
      if (this.clienteEmEdicaoOriginalIcon) {
        this.clienteEmEdicao.setIcon(this.clienteEmEdicaoOriginalIcon);
      }
    }

    if (this.listenerMapaSalvarCliente) {
      google.maps.event.removeListener(this.listenerMapaSalvarCliente);
      this.listenerMapaSalvarCliente = null;
    }

    if (this.listenerEscCancelarCliente) {
      document.removeEventListener('keydown', this.listenerEscCancelarCliente);
      this.listenerEscCancelarCliente = null;
    }

    this.clienteEmEdicao = null;
    this.clienteEmEdicaoIndex = null;
    this.clienteEmEdicaoTipo = null;
    this.clienteEmEdicaoOriginalPosition = null;
    this.clienteEmEdicaoOriginalIcon = null;
  }

  /**
   * Salva a edição do cliente
   */
  private salvarEdicaoCliente(): void {
    if (!this.clienteEmEdicao || this.clienteEmEdicaoIndex === null || !this.clienteEmEdicaoTipo) {
      return;
    }

    const position = this.clienteEmEdicao.getPosition();
    if (!position) {
      console.error('❌ [EDITAR-CLIENTE] Posição não disponível');
      return;
    }

    const newLat = position.lat();
    const newLng = position.lng();

    const arrays = {
      cli: { markers: this.markerPopsCli, destinos: this.destinoPopsCli },
      cliat: { markers: this.markerPopsCliAtv, destinos: this.destinoPopsCliAtv },
      clides: { markers: this.markerPopsCliDes, destinos: this.destinoPopsCliDes }
    };
    const arr = arrays[this.clienteEmEdicaoTipo];
    const cliente = arr.destinos?.[this.clienteEmEdicaoIndex];

    if (!cliente) {
      console.error('❌ [EDITAR-CLIENTE] Cliente não encontrado');
      return;
    }

    const idMeta = (cliente as any).id_meta ?? (cliente as any).ID_META;
    if (!idMeta) {
      console.error('❌ [EDITAR-CLIENTE] ID_META não encontrado no cliente');
      alert('❌ Erro: ID_META do cliente não encontrado!');
      return;
    }

    (cliente as any).LAT = newLat;
    (cliente as any).LNG = newLng;

    this.updateClienteService.atualizarCoordenadas({
      ID_META: idMeta,
      lat: newLat,
      lng: newLng
    }).subscribe({
      next: (response) => {
        console.log('✅ [EDITAR-CLIENTE] Coordenadas atualizadas com sucesso:', response);

        const idUsuario = this.authService.getIdUser();
        const idCity = this.authService.getIdCity();
        const sigla = (cliente as any).sigla || (cliente as any).SIGLA || 'N/A';
        if (idUsuario && idCity && idMeta) {
          this.insertLogService.inserirLog({
            id_usuario: idUsuario,
            id_evento: 31,
            id_city: idCity,
            id_meta_objeto: idMeta,
            descricao: `Move Cliente sigla: ${sigla} idmeta: ${idMeta}`,
            VERSION: 'Fiberworks WEB 1.0.0'
          }).subscribe({
            next: (logResponse) => console.log('✅ Log de move cliente:', logResponse),
            error: (error) => console.error('❌ Erro ao inserir log:', error)
          });
        }

        this.desabilitarEdicaoCliente();
      },
      error: (error) => {
        console.error('❌ [EDITAR-CLIENTE] Erro ao atualizar coordenadas:', error);
        if (this.clienteEmEdicao && this.clienteEmEdicaoOriginalPosition) {
          this.clienteEmEdicao.setPosition({
            lat: this.clienteEmEdicaoOriginalPosition.lat,
            lng: this.clienteEmEdicaoOriginalPosition.lng
          });
          (cliente as any).LAT = this.clienteEmEdicaoOriginalPosition.lat;
          (cliente as any).LNG = this.clienteEmEdicaoOriginalPosition.lng;
        }
        alert(`❌ Erro ao atualizar coordenadas do cliente!\n\n🆔 ID_META: ${idMeta}\n\nErro: ${error.message}`);
        this.desabilitarEdicaoCliente();
      }
    });
  }

  /**
   * Cancela a edição do cliente
   */
  private cancelarEdicaoCliente(): void {
    if (!this.clienteEmEdicao || !this.clienteEmEdicaoOriginalPosition) {
      return;
    }

    this.clienteEmEdicao.setPosition({
      lat: this.clienteEmEdicaoOriginalPosition.lat,
      lng: this.clienteEmEdicaoOriginalPosition.lng
    });

    this.desabilitarEdicaoCliente();

    console.log('❌ [EDITAR-CLIENTE] Edição cancelada, posição restaurada');
    alert('Edição cancelada. Posição original restaurada.');
  }
    /**************************************************ate aqui edição cliente no mapa*********** */
  /**
   * 🔧 Desabilita a edição do DIO
   */
  private desabilitarEdicaoDio(): void {
    if (this.dioEmEdicao) {
      this.dioEmEdicao.setDraggable(false);
      this.dioEmEdicao.setOpacity(1.0);
      
      // Restaurar ícone original
      if (this.dioEmEdicaoOriginalIcon) {
        this.dioEmEdicao.setIcon(this.dioEmEdicaoOriginalIcon);
      }
    }

    // Remover listeners
    if (this.listenerMapaSalvarDio) {
      google.maps.event.removeListener(this.listenerMapaSalvarDio);
      this.listenerMapaSalvarDio = null;
    }

    if (this.listenerEscCancelarDio) {
      document.removeEventListener('keydown', this.listenerEscCancelarDio);
      this.listenerEscCancelarDio = null;
    }

    // 🆕 Limpar id_meta do DIO do storage
    this.authService.setIDmetaDio(undefined);

    this.dioEmEdicao = null;
    this.dioEmEdicaoIndex = null;
    this.dioEmEdicaoOriginalPosition = null;
    this.dioEmEdicaoOriginalIcon = null;
  }

  /**
   * 🔧 Salva a edição do DIO
   */
  private salvarEdicaoDio(): void {
    if (!this.dioEmEdicao || this.dioEmEdicaoIndex === null) {
      return;
    }

    const position = this.dioEmEdicao.getPosition();
    if (!position) {
      console.error('❌ [EDITAR-DIO] Posição não disponível');
      return;
    }

    const newLat = position.lat();
    const newLng = position.lng();

    console.log(`💾 [EDITAR-DIO] Salvando nova posição:`, { lat: newLat, lng: newLng });

    const dio = this.destinoDios[this.dioEmEdicaoIndex];
    
    // Verificar se tem id_meta
    if (!dio.id_meta) {
      console.error('❌ [EDITAR-DIO] ID_META não encontrado no DIO');
      alert('❌ Erro: ID_META do DIO não encontrado!');
      return;
    }

    // Atualizar coordenadas localmente
    dio.LAT = newLat as any;
    dio.LNG = newLng as any;
    
    // Chamar serviço para atualizar coordenadas no banco
    this.updateDioService.atualizarCoordenadas({
      ID_META: dio.id_meta,
      lat: newLat,
      lng: newLng
    }).subscribe({
      next: (response) => {
        console.log('✅ [EDITAR-DIO] Coordenadas atualizadas com sucesso:', response);
        
        // 🆕 Atualizar cabos conectados ao DIO (apenas se tiver id_meta)
        if (dio.id_meta) {
          const novaCoordenada = new google.maps.LatLng(newLat, newLng);
          this.atualizarCabosConectadosADio(dio.id_meta, novaCoordenada)
            .then(() => {
              console.log('✅ [EDITAR-DIO] Cabos conectados atualizados');
            })
            .catch((error) => {
              console.error('❌ [EDITAR-DIO] Erro ao atualizar cabos:', error);
            });
        }
        
        // Inserir log de atualização de DIO com id_evento 31
        const idUsuario = this.authService.getIdUser();
        const idCity = this.authService.getIdCity();
        if (idUsuario && idCity && dio.id_meta) {
          console.log('🔄 Inserindo log de move de DIO...');
          this.insertLogService.inserirLog({
            id_usuario: idUsuario,
            id_evento: 31,
            id_city: idCity,
            id_meta_objeto: dio.id_meta,
            descricao: `Move DIO sigla: ${dio.sigla}  idmeta: ${dio.id_meta} `,
            VERSION: 'Fiberworks WEB 1.0.0'
          }).subscribe({
            next: (logResponse) => {
              console.log('✅ Log de move de DIO:', logResponse);
            },
            error: (error) => {
              console.error('❌ Erro ao inserir log de move de DIO:', error);
            }
          });
        }
        
        // Desabilitar edição após sucesso
        this.desabilitarEdicaoDio();
      },
      error: (error) => {
        console.error('❌ [EDITAR-DIO] Erro ao atualizar coordenadas:', error);
        // Reverter coordenadas em caso de erro
        if (this.dioEmEdicao) {
          const originalPos = this.dioEmEdicaoOriginalPosition;
          if (originalPos) {
            this.dioEmEdicao.setPosition({
              lat: originalPos.lat,
              lng: originalPos.lng
            });
            dio.LAT = originalPos.lat as any;
            dio.LNG = originalPos.lng as any;
          }
        }
        alert(`❌ Erro ao atualizar coordenadas do DIO!\n\n🆔 ID_META: ${dio.id_meta}\n\nErro: ${error.message}`);
        // Desabilitar edição mesmo em caso de erro (para não ficar travado)
        this.desabilitarEdicaoDio();
      }
    });
    
    // Retornar aqui para não desabilitar edição antes da requisição terminar
    return;
  }

  /**
   * 🔧 Cancela a edição do DIO (restaura posição original)
   */
  private cancelarEdicaoDio(): void {
    if (!this.dioEmEdicao || !this.dioEmEdicaoOriginalPosition) {
      return;
    }

    // Restaurar posição original
    this.dioEmEdicao.setPosition({
      lat: this.dioEmEdicaoOriginalPosition.lat,
      lng: this.dioEmEdicaoOriginalPosition.lng
    });

    // Desabilitar edição
    this.desabilitarEdicaoDio();

    console.log('❌ [EDITAR-DIO] Edição cancelada, posição restaurada');
    alert('Edição cancelada. Posição original restaurada.');
  }

  /**
   * Salva a edição da estação
   */
  private salvarEdicaoEstacao(): void {
    if (!this.estacaoEmEdicao || this.estacaoEmEdicaoIndex === null) {
      return;
    }

    const position = this.estacaoEmEdicao.getPosition();
    if (!position) {
      console.error('❌ [EDITAR-ESTAÇÃO] Posição não disponível');
      return;
    }

    const newLat = position.lat();
    const newLng = position.lng();

    console.log(`💾 [EDITAR-ESTAÇÃO] Salvando nova posição:`, { lat: newLat, lng: newLng });

    const estacao = this.destinoPopsEst[this.estacaoEmEdicaoIndex];
    
    // Verificar se tem id_meta
    if (!estacao.id_meta) {
      console.error('❌ [EDITAR-ESTAÇÃO] ID_META não encontrado na estação');
      alert('❌ Erro: ID_META da estação não encontrado!');
      return;
    }

    // Atualizar coordenadas localmente
    estacao.LAT = newLat as any;
    estacao.LNG = newLng as any;
    
    // Chamar serviço para atualizar coordenadas no banco
    this.updateEstacaoService.atualizarCoordenadas({
      ID_META: estacao.id_meta,
      lat: newLat,
      lng: newLng
    }).subscribe({
      next: (response) => {
        console.log('✅ [EDITAR-ESTAÇÃO] Coordenadas atualizadas com sucesso:', response);
        
        // Inserir log de atualização de estação
        const idUsuario = this.authService.getIdUser();
        const idCity = this.authService.getIdCity();
        if (idUsuario && idCity && estacao.id_meta) {
          console.log('🔄 Inserindo log de move de estação...');
          this.insertLogService.inserirLog({
            id_usuario: idUsuario,
            id_evento: 31, // Usando o mesmo id_evento de move de DIO (ajustar se necessário)
            id_city: idCity,
            id_meta_objeto: estacao.id_meta,
            descricao: `Move Estação sigla: ${estacao.sigla}  idmeta: ${estacao.id_meta} `,
            VERSION: 'Fiberworks WEB 1.0.0'
          }).subscribe({
            next: (logResponse) => {
              console.log('✅ Log de move de estação:', logResponse);
            },
            error: (error) => {
              console.error('❌ Erro ao inserir log de move de estação:', error);
            }
          });
        }
        
        // Desabilitar edição após sucesso
        this.desabilitarEdicaoEstacao();
      },
      error: (error) => {
        console.error('❌ [EDITAR-ESTAÇÃO] Erro ao atualizar coordenadas:', error);
        // Reverter coordenadas em caso de erro
        if (this.estacaoEmEdicao) {
          const originalPos = this.estacaoEmEdicaoOriginalPosition;
          if (originalPos) {
            this.estacaoEmEdicao.setPosition({
              lat: originalPos.lat,
              lng: originalPos.lng
            });
            estacao.LAT = originalPos.lat as any;
            estacao.LNG = originalPos.lng as any;
          }
        }
        alert(`❌ Erro ao atualizar coordenadas da estação!\n\n🆔 ID_META: ${estacao.id_meta}\n\nErro: ${error.message}`);
        // Desabilitar edição mesmo em caso de erro (para não ficar travado)
        this.desabilitarEdicaoEstacao();
      }
    });
    
    // Retornar aqui para não desabilitar edição antes da requisição terminar
    return;
  }

  /**
   * Cancela a edição da estação
   */
  private cancelarEdicaoEstacao(): void {
    if (!this.estacaoEmEdicao || !this.estacaoEmEdicaoOriginalPosition) {
      return;
    }

    // Restaurar posição original
    this.estacaoEmEdicao.setPosition({
      lat: this.estacaoEmEdicaoOriginalPosition.lat,
      lng: this.estacaoEmEdicaoOriginalPosition.lng
    });

    // Desabilitar edição
    this.desabilitarEdicaoEstacao();

    console.log('❌ [EDITAR-ESTAÇÃO] Edição cancelada, posição restaurada');
    alert('Edição cancelada. Posição original restaurada.');
  }

openPopInfoModal(id_meta: number|undefined) {
  if (id_meta == null) return;
  const modalRef = this.ngbModal.open(PopInfoModalComponent, {
    size: 'lg',
    backdrop: 'static',
    centered: true
  });
  modalRef.componentInstance.data = { id_meta };
}

openPopEstacaoInfoModal(id_meta: number|undefined) {
  if (id_meta == null) return;
  const modalRef = this.ngbModal.open(PopEstacaoInfoModalComponent, {
    size: 'lg',
    backdrop: 'static',
    centered: true
  });
  modalRef.componentInstance.data = { id_meta };
}

openVisualizaDioModal(id_meta: number, capacity?: number) {
  const dialogRef = this.dialog.open(VisualizaDioComponent, {
    width: '80vw',
    maxWidth: '1000px',
    height: 'auto', // Deixa o CSS controlar a altura
    maxHeight: '95vh', // Altura máxima para não sair da tela
    data: { 
      id_meta,
      capacity,
      config: {
        title: 'Visualiza DIO',
        isEditable: true,
        showAllFields: false
      }
    }
  });
}

openVisualizaCaboModal(id_meta: number, tipoFibra?: string) {
  const dialogRef = this.dialog.open(VisualizaCaboComponent, {
    width: '90vw',
    maxWidth: '1200px',
    height: '40vh', // Alterado para 50vh
    maxHeight: '40vh',
    hasBackdrop: false,
    panelClass: 'visualiza-cabo-modal-container',
    data: {
      id_meta,
      config: {
        title: `Visualiza Cabo ${id_meta} - ${tipoFibra || 'Cabo Óptico'}`,
        isEditable: true,
        showAllFields: true
      }
    }
  });
}

/**
 * 🔍 Visualiza um cabo (abre o modal de visualização)
 */
private visualizarCabo(): void {
  console.log('🔍 [CONTEXT-MENU] Visualizando cabo...', this.clickedCaboData);
  
  if (this.clickedCaboData && this.clickedCaboData.id_meta) {
    // Obter tipoFibra do cabo (pode estar em diferentes lugares)
    const tipoFibra = this.clickedCaboData.tipo || 
                      this.clickedPolyline?.get('tipo') || 
                      'Cabo Óptico';
    
    this.openVisualizaCaboModal(this.clickedCaboData.id_meta, tipoFibra);
    this.hideContextMenu();
  } else {
    alert('❌ Erro: Dados do cabo não encontrados.');
    this.hideContextMenu();
  }
}

/**
 * 🔍 Visualiza um DIO (abre o modal de visualização)
 */
private visualizarDio(): void {
  console.log('🔍 [CONTEXT-MENU] Visualizando DIO...', this.clickedDioData);
  
  if (this.clickedDioData && this.clickedDioData.id_meta) {
    this.openVisualizaDioModal(this.clickedDioData.id_meta, this.clickedDioData.CAPACIDADE);
    this.hideContextMenu();
  } else {
    alert('❌ Erro: Dados do DIO não encontrados.');
    this.hideContextMenu();
  }
}

/**
 * 🔍 Visualiza um cliente (abre o modal PopInfoModalComponent)
 */
private visualizarCliente(): void {
  console.log('🔍 [CONTEXT-MENU] Visualizando Cliente...');
  let idMeta: number | undefined;

  if (this.clickedCliData) {
    idMeta = this.clickedCliData.id_meta;
  } else if (this.clickedCliAtData) {
    idMeta = this.clickedCliAtData.id_meta;
  } else if (this.clickedCliDesData) {
    idMeta = this.clickedCliDesData.id_meta;
  }

  if (idMeta) {
    this.openPopInfoModal(idMeta);
    this.hideContextMenu();
  } else {
    alert('❌ Erro: Dados do cliente não encontrados.');
    this.hideContextMenu();
  }
}

/**
 * Caixas com splitters num raio desde a posição do cliente (menu contexto).
 */
private abrirAtivacaoClienteModal(): void {
  let cliente: PopsCli | undefined;
  if (this.clickedCliData) {
    cliente = this.clickedCliData;
  } else if (this.clickedCliAtData) {
    cliente = this.clickedCliAtData;
  } else if (this.clickedCliDesData) {
    cliente = this.clickedCliDesData;
  }

  if (!cliente) {
    alert('❌ Erro: Dados do cliente não encontrados.');
    this.hideContextMenu();
    return;
  }

  const lat = Number(cliente.LAT);
  const lng = Number(cliente.LNG);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    alert('❌ Erro: Coordenadas do cliente inválidas.');
    this.hideContextMenu();
    return;
  }

  const rotulo =
    (cliente.sigla && String(cliente.sigla).trim()) ||
    (cliente.id_meta != null ? `Cliente #${cliente.id_meta}` : 'Cliente');

  const modalRef = this.ngbModal.open(PopInfoAtivacaoModalComponent, {
    size: 'lg',
    backdrop: false,
    centered: true,
    windowClass: 'pop-info-ativacao-modal-window',
  });

  modalRef.componentInstance.caixas = this.destino;
  modalRef.componentInstance.ctosSP = this.destinoCTOSP;
  modalRef.componentInstance.clienteLat = lat;
  modalRef.componentInstance.clienteLng = lng;
  modalRef.componentInstance.clienteRotulo = rotulo;
  modalRef.componentInstance.clienteNome =
    (cliente.sigla && String(cliente.sigla).trim()) || '';
  modalRef.componentInstance.clienteIdMeta = cliente.id_meta;
  // Ler recurso_* do MVCObject antes de hideContextMenu() (que zera clickedClienteMarker).
  const r = this.extrairRecursosDoMarcadorCliente(this.clickedClienteMarker);
  modalRef.componentInstance.recursoCaixaMarcador = r.recurso_caixa;
  modalRef.componentInstance.recursoSpMarcador = r.recurso_sp;
  modalRef.componentInstance.recursoSpSaidaMarcador = r.recurso_sp_saida;
  modalRef.componentInstance.portasOltMarcador = r.portas_olt;

  let subPortasOlt: Subscription | undefined;
  subPortasOlt = modalRef.componentInstance.portasOltOcupacaoRegistada.subscribe((portasOltId: number) => {
    this.aplicarPortasOltOcupacaoNoMarcadorCliente(portasOltId, cliente.id_meta);
    modalRef.componentInstance.portasOltMarcador = portasOltId;
  });

  this.marcadorClienteAtivacaoModal = this.clickedClienteMarker;

  const limparEstadoPosModalAtivacao = (): void => {
    subPortasOlt?.unsubscribe();
    subPortasOlt = undefined;
    this.marcadorClienteAtivacaoModal = null;
    this.compartilhamentoService.limparViabilidadeCirculosCaixas();
    this.compartilhamentoService.limparViabilidadePontoMapa();
  };

  modalRef.closed.pipe(take(1)).subscribe((result: unknown) => {
    if (
      result != null &&
      typeof result === 'object' &&
      'ativar' in result &&
      (result as { ativar?: boolean }).ativar === true &&
      'payload' in result &&
      (result as { payload?: unknown }).payload != null
    ) {
      const r = result as {
        payload: UpdateClienteAtivacaoResponse;
        idMetaCliente?: number;
        recursoFormulario?: { caixa?: number; sp?: number; saida?: number };
      };
      this.aplicarRecursosAtivacaoNoMarcadorCliente(r);
    } else if (
      result != null &&
      typeof result === 'object' &&
      'desativar' in result &&
      (result as { desativar?: boolean }).desativar === true
    ) {
      const dr = result as { idMetaCliente?: number };
      this.aplicarDesativacaoClienteNoMarcadorCliente(dr.idMetaCliente);
    }
    limparEstadoPosModalAtivacao();
  });

  modalRef.dismissed.pipe(take(1)).subscribe(() => {
    limparEstadoPosModalAtivacao();
  });

  this.hideContextMenu();
}

/**
 * 🗑️ Exclui um cliente
 */
private excluirCliente(): void {
  console.log('🗑️ [CONTEXT-MENU] Excluindo Cliente...');

  let cliente: PopsCli | undefined;
  let tipoCliente: 'cli' | 'cliat' | 'clides' | null = null;

  if (this.clickedCliData) {
    cliente = this.clickedCliData;
    tipoCliente = 'cli';
  } else if (this.clickedCliAtData) {
    cliente = this.clickedCliAtData;
    tipoCliente = 'cliat';
  } else if (this.clickedCliDesData) {
    cliente = this.clickedCliDesData;
    tipoCliente = 'clides';
  }

  if (!cliente || !tipoCliente) {
    console.warn('⚠️ [EXCLUI-CLIENTE] Nenhum cliente selecionado');
    alert('❌ Erro: Dados do cliente não encontrados.');
    this.hideContextMenu();
    return;
  }

  let idMeta: number | undefined = cliente.id_meta;
  if (!idMeta || isNaN(idMeta) || idMeta <= 0) {
    alert('❌ Erro: Não foi possível identificar o ID do cliente.');
    this.hideContextMenu();
    return;
  }

  const idCity = this.authService.getIdCity();
  if (!idCity) {
    alert('❌ Erro: ID da cidade não encontrado. Selecione uma cidade no workspace.');
    this.hideContextMenu();
    return;
  }

  const sigla = (cliente as any).sigla || (cliente as any).SIGLA || 'N/A';

  const confirmacao = confirm(`Tem certeza que deseja excluir este cliente?\n\n📋 Sigla: ${sigla}`);

  if (!confirmacao) {
    return;
  }

  const request: ExcluiClienteRequest = {
    id_meta: idMeta,
    id_city: idCity
  };

  this.excluiClienteService.excluirCliente(request).subscribe({
    next: (response: ExcluiClienteResponse) => {
      console.log('✅ [EXCLUI-CLIENTE] Resposta da API:', response);

      if (response.success) {
        let index = -1;
        let markers: google.maps.Marker[];
        let destinos: PopsCli[];

        if (tipoCliente === 'cli') {
          index = this.destinoPopsCli.findIndex(c => c.id_meta === idMeta);
          markers = this.markerPopsCli;
          destinos = this.destinoPopsCli;
        } else if (tipoCliente === 'cliat') {
          index = this.destinoPopsCliAtv.findIndex(c => c.id_meta === idMeta);
          markers = this.markerPopsCliAtv;
          destinos = this.destinoPopsCliAtv;
        } else {
          index = this.destinoPopsCliDes.findIndex(c => c.id_meta === idMeta);
          markers = this.markerPopsCliDes;
          destinos = this.destinoPopsCliDes;
        }

        if (index !== -1) {
          const markerParaRemover = markers[index];
          if (markerParaRemover) {
            markerParaRemover.setMap(null);
            markers.splice(index, 1);
          }
          destinos.splice(index, 1);
          console.log('🗑️ [EXCLUI-CLIENTE] Cliente removido do mapa');
        }

        this.clickedCliData = null;
        this.clickedCliAtData = null;
        this.clickedCliDesData = null;
        this.clickedClienteMarker = null; // marcador já removido do mapa acima
        this.hideContextMenu();

        const idUsuario = this.authService.getIdUser();
        if (idUsuario && idCity) {
          this.insertLogService.inserirLog({
            id_usuario: idUsuario,
            id_evento: 22,
            id_city: idCity,
            id_meta_objeto: idMeta,
            descricao: `Excluído Cliente: ${sigla}, ID_META: ${idMeta}`,
            VERSION: 'Fiberworks WEB 1.0.0'
          }).subscribe({
            next: (logResponse) => {
              console.log('✅ Log de exclusão de cliente inserido com sucesso:', logResponse);
            },
            error: (err) => {
              console.error('❌ Erro ao inserir log de exclusão de cliente:', err);
            }
          });
        }
      }
    },
    error: (err: any) => {
      const errorObj = typeof err === 'object' ? err : {};
      const flagConectada = errorObj?.error?.flagConectada;
      const errorMsg = errorObj?.message || (typeof err === 'string' ? err : 'Erro ao excluir cliente.');

      if (flagConectada || (errorMsg && (errorMsg.includes('DIO') || errorMsg.includes('cabo') || errorMsg.includes('OLT') || errorMsg.includes('referenciado')))) {
        alert('Cliente possui DIO, cabo ou recurso OLT referenciado. Remova as conexões antes de excluir.');
      } else {
        alert(`Erro ao excluir cliente: ${errorMsg}`);
      }
      this.hideContextMenu();
    }
  });
}

/** Habilita edição da sobra (duplo clique): arrastar, clique no mapa salva, ESC cancela. */
private habilitarEdicaoSobra(index: number): void {
  if (index < 0 || index >= this.markerSegmentos.length) {
    console.error('❌ [EDITAR-SOBRA] Índice inválido:', index);
    return;
  }

  const marker = this.markerSegmentos[index];
  const segmento = this.destinoSegmentos[index];

  if (!marker || !segmento) {
    console.error('❌ [EDITAR-SOBRA] Marcador ou segmento não encontrados');
    return;
  }

  if (this.sobraEmEdicao) {
    this.desabilitarEdicaoSobra();
  }
  if (this.caixaEmEdicao) {
    this.desabilitarEdicaoCaixa();
  }

  const position = marker.getPosition();
  if (position) {
    this.sobraEmEdicaoOriginalPosition = {
      lat: position.lat(),
      lng: position.lng(),
    };
  }

  marker.setDraggable(true);
  marker.setOpacity(0.7);

  this.sobraEmEdicao = marker;
  this.sobraEmEdicaoIndex = index;

  console.log('✅ [EDITAR-SOBRA] Edição habilitada para id_meta:', segmento.id_meta);

  if (this.map && !this.listenerMapaSalvarSobra) {
    this.listenerMapaSalvarSobra = this.map.addListener('click', () => {
      if (this.sobraEmEdicao) {
        this.salvarEdicaoSobra();
      }
    });
  }

  if (!this.listenerEscCancelarSobra) {
    this.listenerEscCancelarSobra = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.sobraEmEdicao) {
        this.cancelarEdicaoSobra();
      }
    };
    document.addEventListener('keydown', this.listenerEscCancelarSobra);
  }
}

private desabilitarEdicaoSobra(): void {
  if (this.sobraEmEdicao) {
    this.sobraEmEdicao.setDraggable(false);
    this.sobraEmEdicao.setOpacity(1.0);
  }

  if (this.listenerMapaSalvarSobra) {
    google.maps.event.removeListener(this.listenerMapaSalvarSobra);
    this.listenerMapaSalvarSobra = null;
  }

  if (this.listenerEscCancelarSobra) {
    document.removeEventListener('keydown', this.listenerEscCancelarSobra);
    this.listenerEscCancelarSobra = null;
  }

  this.sobraEmEdicao = null;
  this.sobraEmEdicaoIndex = null;
  this.sobraEmEdicaoOriginalPosition = null;
}

private salvarEdicaoSobra(): void {
  if (!this.sobraEmEdicao || this.sobraEmEdicaoIndex === null) {
    return;
  }

  const position = this.sobraEmEdicao.getPosition();
  if (!position) {
    console.error('❌ [EDITAR-SOBRA] Posição não disponível');
    return;
  }

  const segmento = this.destinoSegmentos[this.sobraEmEdicaoIndex];
  if (!segmento?.id_meta) {
    alert('❌ Erro: id_meta da sobra não encontrado');
    return;
  }

  const newLat = position.lat();
  const newLng = position.lng();

  console.log('💾 [EDITAR-SOBRA] Salvando nova posição:', {
    id_meta: segmento.id_meta,
    lat: newLat,
    lng: newLng,
  });

  this.segmentoService
    .atualizarCoordenadas({
      id_meta: segmento.id_meta,
      lat: newLat,
      lng: newLng,
    })
    .subscribe({
      next: (response) => {
        if (response?.success) {
          segmento.LAT = newLat;
          segmento.LNG = newLng;
          console.log('✅ [EDITAR-SOBRA] Coordenadas atualizadas:', response.message);

          const novaCoordenada = new google.maps.LatLng(newLat, newLng);
          this.atualizarCabosConectadosASobra(
            segmento.Caboxd,
            segmento.Caboxe,
            novaCoordenada,
          )
            .then(() => {
              console.log('✅ [EDITAR-SOBRA] Cabos conectados atualizados');
            })
            .catch((err) => {
              console.error('❌ [EDITAR-SOBRA] Erro ao atualizar cabos:', err);
            });

          this.desabilitarEdicaoSobra();
        } else {
          alert(response?.message || 'Erro ao atualizar coordenadas da sobra');
        }
      },
      error: (error) => {
        console.error('❌ [EDITAR-SOBRA] Erro ao atualizar coordenadas:', error);
        const originalPos = this.sobraEmEdicaoOriginalPosition;
        if (this.sobraEmEdicao && originalPos) {
          this.sobraEmEdicao.setPosition({
            lat: originalPos.lat,
            lng: originalPos.lng,
          });
          segmento.LAT = originalPos.lat;
          segmento.LNG = originalPos.lng;
        }
        alert(`❌ Erro ao atualizar coordenadas da sobra!\n\n${error}`);
        this.desabilitarEdicaoSobra();
      },
    });
}

private cancelarEdicaoSobra(): void {
  if (!this.sobraEmEdicao || !this.sobraEmEdicaoOriginalPosition) {
    return;
  }

  this.sobraEmEdicao.setPosition({
    lat: this.sobraEmEdicaoOriginalPosition.lat,
    lng: this.sobraEmEdicaoOriginalPosition.lng,
  });

  this.desabilitarEdicaoSobra();
  console.log('❌ [EDITAR-SOBRA] Edição cancelada, posição restaurada');
}

private liberaSobra(): void {
  console.log('🔓 [CONTEXT-MENU] Liberando sobra...', this.clickedSobraData);

  if (!this.clickedSobraData?.id_meta) {
    alert('Erro: Sobra não selecionada');
    return;
  }

  const idMeta = this.clickedSobraData.id_meta;
  const confirmacao = confirm(
    `Liberar sobra ${idMeta}?\n\nIsso desconecta os cabos e define Caboxd/Caboxe como Z.`,
  );
  if (!confirmacao) {
    return;
  }

  this.segmentoService.liberaSegmento(idMeta).subscribe({
    next: (response: any) => {
      if (response?.success) {
        alert(response.message || 'Sobra liberada do cabo');
        const idx = this.destinoSegmentos.findIndex((s) => s.id_meta === idMeta);
        if (idx !== -1) {
          this.destinoSegmentos[idx] = {
            ...this.destinoSegmentos[idx],
            Caboxd: 'Z',
            Caboxe: 'Z',
          };
          this.updateMarkersSegmentos();
        }
      } else {
        alert(response?.error || response?.message || 'Erro ao liberar sobra');
      }
      this.clickedSobraData = null;
    },
    error: (err) => {
      console.error('❌ [LIBERA-SOBRA] Erro:', err);
      alert(typeof err === 'string' ? err : 'Erro ao liberar sobra');
      this.clickedSobraData = null;
    },
  });
}

/**
 * 🗑️ Exclui sobra (segmento desconectado)
 */
private excluirSobra(): void {
  console.log('🗑️ [CONTEXT-MENU] Excluindo sobra...', this.clickedSobraData);

  if (!this.clickedSobraData?.id_meta) {
    alert('Erro: Sobra não selecionada');
    return;
  }

  const idMeta = this.clickedSobraData.id_meta;
  const confirmacao = confirm(
    `Excluir sobra ${idMeta}?\n\nA sobra deve estar desconectada (Caboxd/Caboxe = Z).`,
  );
  if (!confirmacao) {
    return;
  }

  this.segmentoService.excluiSegmento(idMeta).subscribe({
    next: (response: any) => {
      if (response?.success) {
        alert(response.message || 'Segmento excluído');

        if (this.currentMarkerInfoWindow) {
          this.currentMarkerInfoWindow.close();
        }

        const idxDestino = this.destinoSegmentos.findIndex((s) => s.id_meta === idMeta);
        if (idxDestino !== -1) {
          this.destinoSegmentos.splice(idxDestino, 1);
        }

        this.updateMarkersSegmentos();
        this.hideContextMenu();
      } else {
        alert(response?.error || response?.message || 'Erro ao excluir sobra');
      }
      this.clickedSobraData = null;
    },
    error: (err) => {
      console.error('❌ [EXCLUI-SOBRA] Erro:', err);
      alert(typeof err === 'string' ? err : 'Erro ao excluir sobra');
      this.clickedSobraData = null;
    },
  });
}

/**
 * 🗑️ Exclui um DIO
 */
private excluirDio(): void {
  console.log('🗑️ [CONTEXT-MENU] Excluindo DIO...', this.clickedDioData);
  
  if (!this.clickedDioData) {
    console.warn('⚠️ [EXCLUI-DIO] Nenhum DIO selecionado');
    return;
  }

  // Obter dados do DIO
  const idMeta = this.clickedDioData.id_meta;
  const idCity = this.authService.getIdCity();
  const sigla = this.clickedDioData.sigla || 'DIO';
  
  if (!idMeta) {
    alert('Erro: ID do DIO não encontrado');
    return;
  }

  if (!idCity) {
    alert('Erro: ID da cidade não encontrado');
    return;
  }

  // id_condominio padrão é 0 (fora de condomínio)
  const idCondominio = this.clickedDioData.id_condominio || 0;

  // Confirmação antes de excluir
  const confirmacao = confirm(`Tem certeza que deseja excluir este DIO?\n\n🆔 ID: ${idMeta}\n📋 Sigla: ${sigla}`);
  
  if (!confirmacao) {
    return;
  }

  // Preparar requisição
  const request: ExcluiDioRequest = {
    id_meta: idMeta,
    id_city: idCity,
    id_condominio: idCondominio
  };

  // Fazer a requisição usando o serviço
  this.excluiDioService.excluirDio(request).subscribe({
    next: (response: ExcluiDioResponse) => {
      console.log('✅ [EXCLUI-DIO] Resposta da API:', response);
      
      if (response.success) {
        console.log('🗑️ [EXCLUI-DIO] Iniciando remoção do marcador do mapa...');
        console.log('🗑️ [EXCLUI-DIO] id_meta:', idMeta);
        
        // Buscar marcador pelo id_meta
        const markerParaRemover = this.buscarMarcadorDioPorIdMeta(idMeta);
        
        // Remover o marcador do mapa
        if (markerParaRemover) {
          console.log('🗑️ [EXCLUI-DIO] Chamando setMap(null)...');
          markerParaRemover.setMap(null);
          console.log('🗑️ [EXCLUI-DIO] setMap(null) executado');
          
          // Remover também do array markerDios
          const index = this.markerDios.indexOf(markerParaRemover);
          if (index !== -1) {
            this.markerDios.splice(index, 1);
            console.log('🗑️ [EXCLUI-DIO] Marcador removido do array');
          }
          
          // Remover também do array destinoDios
          const indexDestino = this.destinoDios.findIndex(dio => dio.id_meta === idMeta);
          if (indexDestino !== -1) {
            this.destinoDios.splice(indexDestino, 1);
            console.log('🗑️ [EXCLUI-DIO] Item removido do array destinoDios');
          }
        } else {
          console.warn('⚠️ [EXCLUI-DIO] Não foi possível encontrar o marcador para remover!');
        }

        // Limpar dados do DIO
        this.clickedDioData = null;
        
        // Fechar context menu
        this.hideContextMenu();

        // Inserir log de exclusão de DIO
        const idUsuario = this.authService.getIdUser();
        if (idUsuario && idCity) {
          console.log('🔄 Inserindo log de exclusão de DIO...');
          this.insertLogService.inserirLog({
            id_usuario: idUsuario,
            id_evento: 19, // Usando o mesmo id_evento de exclusão de cabo/caixa
            id_city: idCity,
            id_meta_objeto: request.id_meta,
            descricao: `Exclusão de DIO: ${request.id_meta}`,
            VERSION: 'Fiberworks WEB 1.0.0'
          }).subscribe({
            next: (logResponse) => {
              console.log('✅ Log de exclusão de DIO:', logResponse);
            },
            error: (error) => {
              console.error('❌ Erro ao inserir log de exclusão de DIO:', error);
            }
          });
        }
      } else {
        // Tratar erros específicos baseados no motivo
        let mensagemErro = response.error || response.message || 'Erro desconhecido';
        
        if (response.motivo) {
          switch (response.motivo) {
            case 'cabos_conectados':
              mensagemErro = `⚠️ DIO possui cabos conectados!\n\nDesconecte todos os cabos antes de excluir.`;
              break;
            case 'splitters':
              mensagemErro = `⚠️ DIO possui ${response.totalSplitters || 0} splitter(s)!\n\nRemova todos os splitters antes de excluir.`;
              break;
            case 'cabos_conectados_e_splitters':
              mensagemErro = `⚠️ DIO possui cabos conectados e ${response.totalSplitters || 0} splitter(s)!\n\nDesconecte os cabos e remova os splitters antes de excluir.`;
              break;
          }
        }
        
        alert(mensagemErro);
      }
    },
    error: (error: string) => {
      console.error('❌ [EXCLUI-DIO] Erro na requisição:', error);
      alert(`❌ Operação não realizada: ${error}`);
    }
  });
}

/**
 * 🔍 Visualiza uma estação
 */
private visualizarEstacao(): void {
  console.log('🔍 [CONTEXT-MENU] Visualizando estação...', this.clickedEstacaoData);
  
  if (!this.clickedEstacaoData) {
    alert('❌ Erro: Dados da estação não encontrados.');
    this.hideContextMenu();
    return;
  }

  // 🆕 Obter id_meta de múltiplas fontes (prioridade: objeto estacao > marcador)
  let idMeta: number | undefined;

  if (this.clickedEstacaoData.id_meta) {
    idMeta = Number(this.clickedEstacaoData.id_meta);
    console.log('✅ [VISUALIZAR-ESTAÇÃO] id_meta obtido do objeto estacao:', idMeta);
  } else {
    const index = this.destinoPopsEst.indexOf(this.clickedEstacaoData);
    if (index !== -1 && this.markerPopsEst[index]) {
      const idMetaDoMarcador = this.markerPopsEst[index].get('id_meta');
      if (idMetaDoMarcador) {
        idMeta = Number(idMetaDoMarcador);
        console.log('✅ [VISUALIZAR-ESTAÇÃO] id_meta obtido do marcador:', idMeta);
      }
    }
  }

  if (!idMeta || isNaN(idMeta) || idMeta <= 0) {
    console.error('❌ [VISUALIZAR-ESTAÇÃO] id_meta inválido ou não encontrado:', idMeta);
    console.error('❌ [VISUALIZAR-ESTAÇÃO] Dados da estação:', this.clickedEstacaoData);
    alert('❌ Erro: Não foi possível identificar o ID da estação. Verifique os logs do console.');
    this.hideContextMenu();
    return;
  }

  this.openPopEstacaoInfoModal(idMeta);
  this.hideContextMenu();
}

/**
 * Cria DIO na estação (DIOs sempre são criados vinculados a uma estação)
 */
private criarDIO(): void {
  console.log('➕ [CONTEXT-MENU] Criando DIO na estação...', this.clickedEstacaoData);
  
  if (!this.clickedEstacaoData) {
    alert('❌ Erro: Dados da estação não encontrados.');
    this.hideContextMenu();
    return;
  }

  // Usar coordenadas da estação
  const lat = Number(this.clickedEstacaoData.LAT);
  const lng = Number(this.clickedEstacaoData.LNG);
  
  if (!lat || !lng) {
    alert('❌ Erro: Coordenadas da estação não encontradas.');
    this.hideContextMenu();
    return;
  }

  // 🆕 Obter id_meta de múltiplas fontes (prioridade: objeto estacao > marcador)
  let idMeta: number | undefined;
  
  // Primeiro tentar obter do objeto estacao (agora tipado na interface)
  if (this.clickedEstacaoData.id_meta) {
    idMeta = this.clickedEstacaoData.id_meta;
      console.log('✅ [CRIAR-DIO] id_meta obtido do objeto estacao:', idMeta);
  } else {
    // Se não estiver no objeto, tentar buscar do marcador usando o índice
    const index = this.destinoPopsEst.indexOf(this.clickedEstacaoData);
    if (index !== -1 && this.markerPopsEst[index]) {
      const idMetaDoMarcador = this.markerPopsEst[index].get('id_meta');
      if (idMetaDoMarcador) {
        idMeta = idMetaDoMarcador;
        console.log('✅ [CRIAR-DIO] id_meta obtido do marcador:', idMeta);
      }
    }
  }
  
  // Validar que id_meta seja um número válido
  if (!idMeta || (typeof idMeta !== 'number') || isNaN(idMeta) || idMeta <= 0) {
    console.error('❌ [INCLUIR-DIO] id_meta inválido ou não encontrado:', idMeta);
    console.error('❌ [INCLUIR-DIO] Dados da estação:', this.clickedEstacaoData);
    alert('❌ Erro: Não foi possível identificar o ID da estação. Verifique os logs do console.');
    this.hideContextMenu();
    return;
  }

  console.log('✅ [CRIAR-DIO] id_meta válido encontrado:', idMeta);

  // Preparar dados para o modal
  const data: PlotaDioData = {
    lat: lat,
    lng: lng,
    estacaoSelecionada: this.clickedEstacaoData,
    sigla: this.clickedEstacaoData.sigla,
    id_meta: idMeta // Passar o id_meta encontrado e validado
  };
  
  console.log('📦 [INCLUIR-DIO] Dados preparados para o modal:', data);

  // Abrir modal com ng-bootstrap
  const modalRef = this.ngbModal.open(PlotaDioComponent, {
    size: 'lg',
    backdrop: 'static',
    keyboard: false
  });
  
  // Passar dados para o modal
  modalRef.componentInstance.data = data;

  // Fechar context menu
  this.hideContextMenu();

  // Processar resultado do modal
  modalRef.result.then(
    (result) => {
      if (result && result.id_meta) {
        console.log('🔌 [PLOTA-DIO] DIO criado na estação:', result);
        // Adicionar marcador do DIO criado ao mapa
        this.adicionarMarcadorDio({
          id_meta: result.id_meta,
          sigla: result.sigla,
          CAPACIDADE: result.CAPACIDADE,
          LAT: result.LAT,
          LNG: result.LNG
        });
        console.log('✅ [PLOTA-DIO] DIO adicionado ao mapa e ao array destinoDios');

        // Inserir log de plotagem de DIO com id_evento 5
        const idUsuario = this.authService.getIdUser();
        const idCity = this.authService.getIdCity();
        if (idUsuario && idCity && result.id_meta) {
          console.log('🔄 Inserindo log de plotagem de DIO...');
          const idMetaEstacao = result.id_estacao || 'N/A';
          this.insertLogService.inserirLog({
            id_usuario: idUsuario,
            id_evento: 5, // ID do evento para plotagem de DIO
            id_city: idCity,
            id_meta_objeto: result.id_meta,
            descricao: `Plota DIO: ${result.sigla || result.id_meta}, Capacidade: ${result.CAPACIDADE || 'N/A'}, ID_POP: ${idMetaEstacao}, ID_DIO: ${result.id_meta}`,
            VERSION: 'Fiberworks WEB 1.0.0'
          }).subscribe({
            next: (logResponse) => {
              console.log('✅ Log de plotagem de DIO inserido com sucesso:', logResponse);
            },
            error: (error) => {
              console.error('❌ Erro ao inserir log de plotagem de DIO:', error);
            }
          });
        }
      } else {
        console.warn('⚠️ [PLOTA-DIO] Resultado do modal não contém id_meta válido:', result);
      }
    },
    (dismissReason) => {
      console.log('🔌 [PLOTA-DIO] Modal fechado:', dismissReason);
    }
  );
}

/**
 * 🗑️ Exclui uma estação
 */
private excluirEstacao(): void {
  console.log('🗑️ [CONTEXT-MENU] Excluindo estação...', this.clickedEstacaoData);

  if (!this.clickedEstacaoData) {
    console.warn('⚠️ [EXCLUI-ESTACAO] Nenhuma estação selecionada');
    alert('❌ Erro: Dados da estação não encontrados.');
    return;
  }

  let idMeta: number | undefined = this.clickedEstacaoData.id_meta;
  if (!idMeta) {
    const index = this.destinoPopsEst.indexOf(this.clickedEstacaoData);
    if (index !== -1 && this.markerPopsEst[index]) {
      const idMetaDoMarcador = this.markerPopsEst[index].get('id_meta');
      if (idMetaDoMarcador) {
        idMeta = Number(idMetaDoMarcador);
      }
    }
  }
  if (!idMeta || isNaN(idMeta) || idMeta <= 0) {
    alert('❌ Erro: Não foi possível identificar o ID da estação.');
    return;
  }

  const idCity = this.authService.getIdCity();
  if (!idCity) {
    alert('❌ Erro: ID da cidade não encontrado. Selecione uma cidade no workspace.');
    return;
  }

  const sigla = this.clickedEstacaoData.sigla || 'N/A';

  const confirmacao = confirm(`Tem certeza que deseja excluir esta estação?\n\n📋 Sigla: ${sigla}`);

  if (!confirmacao) {
    return;
  }

  const request: ExcluiEstacaoRequest = {
    id_meta: idMeta,
    id_city: idCity
  };

  this.excluiEstacaoService.excluirEstacao(request).subscribe({
    next: (response: ExcluiEstacaoResponse) => {
      console.log('✅ [EXCLUI-ESTACAO] Resposta da API:', response);

      if (response.success) {
        const index = this.destinoPopsEst.findIndex(e => e.id_meta === idMeta);
        if (index !== -1) {
          const markerParaRemover = this.markerPopsEst[index];
          if (markerParaRemover) {
            markerParaRemover.setMap(null);
            this.markerPopsEst.splice(index, 1);
          }
          this.destinoPopsEst.splice(index, 1);
          console.log('🗑️ [EXCLUI-ESTACAO] Estação removida do mapa');
        }

        this.clickedEstacaoData = null;
        this.hideContextMenu();

        const idUsuario = this.authService.getIdUser();
        if (idUsuario && idCity) {
          this.insertLogService.inserirLog({
            id_usuario: idUsuario,
            id_evento: 48,
            id_city: idCity,
            id_meta_objeto: idMeta,
            descricao: `Excluída Estação: ${sigla}, ID_META: ${idMeta}`,
            VERSION: 'Fiberworks WEB 1.0.0'
          }).subscribe({
            next: (logResponse) => {
              console.log('✅ Log de exclusão de estação inserido com sucesso:', logResponse);
            },
            error: (err) => {
              console.error('❌ Erro ao inserir log de exclusão de estação:', err);
            }
          });
        }
      }
    },
    error: (err: any) => {
      const errorObj = typeof err === 'object' ? err : {};
      const flagConectada = errorObj?.error?.flagConectada;
      const errorMsg = errorObj?.message || (typeof err === 'string' ? err : 'Erro ao excluir estação.');

      if (flagConectada || (errorMsg && (errorMsg.includes('DIO') || errorMsg.includes('referenciado')))) {
        alert('Estação possui DIO referenciado. Remova os DIOs antes de excluir.');
      } else {
        alert(`Erro ao excluir estação: ${errorMsg}`);
      }
    }
  });
}

  onCaixaInternaClose() {
    console.log('Evento de fechamento recebido no GoogleMapsComponent');
    this.caixaSelecionada = null;
    console.log('caixaSelecionada definida como null');
    this.cdr.detectChanges();
  }


// Métodos para controlar o modal GoJS
openGoJSModal() {
  const idmeta = this.authService.getIDmetaCaixa();
  
  if (!idmeta) {
    console.error('❌ [GOOGLE-MAPS] IDMETA não encontrado');
    return;
  }

  console.log('🔀 [GOOGLE-MAPS] Abrindo modal GoJS para IDMETA:', idmeta);

  this.dialog.open(GoJSDemoComponent, {
    width: '95vw',
    height: '95vh',
    maxWidth: 'none',
    maxHeight: 'none',
    disableClose: false,
    hasBackdrop: false, // Sem backdrop para permitir interação com o mapa
    panelClass: 'gojs-modal-container'
  });
}


// Método para criar polylines 1f programaticamente
  private createCabo1fPolylines(): void {
    this.createCaboPolylines('1f', this.destinoCabos1f, this.polylinePaths1f,  this.polylines1f, this.infoWindows1f, this.polylineOptions1f);
  }

   //Método para criar polylines 2f programaticamente
 private createCabo2fPolylines(): void {
    this.createCaboPolylines('2f', this.destinoCabos2f, this.polylinePaths2f,  this.polylines2f, this.infoWindows2f, this.polylineOptions2f);
  }

  // Método para criar polylines 4f programaticamente
  private createCabo4fPolylines(): void {
    this.createCaboPolylines('4f', this.destinoCabos4f, this.polylinePaths4f,  this.polylines4f, this.infoWindows4f, this.polylineOptions4f);
  }

  // Método para criar polylines 6f programaticamente com clique simples e duplo clique
  private createCabo6fPolylines(): void {
    this.createCaboPolylines('6f', this.destinoCabos6f, this.polylinePaths6f,  this.polylines6f, this.infoWindows6f, this.polylineOptions6f);
  }

  // Método para criar polylines 8f programaticamente
  private createCabo8fPolylines(): void {
    this.createCaboPolylines('8f', this.destinoCabos8f, this.polylinePaths8f,  this.polylines8f, this.infoWindows8f, this.polylineOptions8f);
  }

   //Método para criar polylines 12f programaticamente
  private createCabo12fPolylines(): void {
    this.createCaboPolylines('12f', this.destinoCabos12f, this.polylinePaths12f,  this.polylines12f, this.infoWindows12f, this.polylineOptions12f);
  }

  // Método para criar polylines 24f programaticamente
  private createCabo24fPolylines(): void {
    this.createCaboPolylines('24f', this.destinoCabos24f, this.polylinePaths24f,  this.polylines24f, this.infoWindows24f, this.polylineOptions24f);
  }

  // Método para criar polylines 36f programaticamente
  private createCabo36fPolylines(): void {
    this.createCaboPolylines('36f', this.destinoCabos36f, this.polylinePaths36f,  this.polylines36f, this.infoWindows36f, this.polylineOptions36f);
  }

  // Método para criar polylines 48f programaticamente
  private createCabo48fPolylines(): void {
    this.createCaboPolylines('48f', this.destinoCabos48f, this.polylinePaths48f, this.polylines48f, this.infoWindows48f, this.polylineOptions48f);
  }

  // Método para criar polylines 72f programaticamente
  private createCabo72fPolylines(): void {
    this.createCaboPolylines('72f', this.destinoCabos72f, this.polylinePaths72f,   this.polylines72f, this.infoWindows72f, this.polylineOptions72f);
  } 

  // Método para criar polylines 72f programaticamente
  private createCabo144fPolylines(): void {
    this.createCaboPolylines('144f', this.destinoCabos144f, this.polylinePaths144f, this.polylines144f, this.infoWindows144f, this.polylineOptions144f);
  } 

 

  /** HTML do InfoWindow do cabo (mapa); reutilizado após atualizar label. */
  private buildCaboInfoWindowHtml(
    tipoFibra: string,
    cabo: { id_meta: number; Label_cabo?: string },
  ): string {
    const label = cabo.Label_cabo ?? '';
    return `
            <div style="padding: 10px;">
              <h4 style="margin: 0 0 8px 0; color: #333;">Cabo ${tipoFibra.toUpperCase()}</h4>
              <p style="margin: 4px 0;"><strong>ID:</strong> ${cabo.id_meta ?? 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Fibras:</strong> ${tipoFibra.replace('f', '')}</p>
              <p style="margin: 4px 0;"><strong>Label:</strong> ${label}</p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">Duplo-clique para abrir diagrama</p>
            </div>
          `;
  }

  private atualizarLabelCaboEmDestinos(id_meta: number, novoLabel: string): void {
    const listas: { id_meta?: number; Label_cabo?: string }[][] = [
      this.destinoCabos1f,
      this.destinoCabos2f,
      this.destinoCabos4f,
      this.destinoCabos6f,
      this.destinoCabos8f,
      this.destinoCabos12f,
      this.destinoCabos24f,
      this.destinoCabos36f,
      this.destinoCabos48f,
      this.destinoCabos72f,
      this.destinoCabos144f,
    ];
    for (const arr of listas) {
      if (!arr?.length) {
        continue;
      }
      const c = arr.find((x) => x?.id_meta === id_meta);
      if (c) {
        c.Label_cabo = novoLabel;
        break;
      }
    }
  }

  private aplicarNovoLabelCaboNoMapa(
    polyline: google.maps.Polyline | null,
    id_meta: number,
    novoLabel: string,
  ): void {
    this.atualizarLabelCaboEmDestinos(id_meta, novoLabel);
    if (polyline) {
      polyline.set('label', novoLabel);
      polyline.set('Label_cabo', novoLabel);
      const caboData = polyline.get('cabo_data');
      if (caboData && typeof caboData === 'object') {
        (caboData as { Label_cabo?: string }).Label_cabo = novoLabel;
      }
      const iw = polyline.get('infoWindow') as google.maps.InfoWindow | undefined;
      if (iw) {
        const tipoFibra = String(polyline.get('capacidade') || '12f');
        iw.setContent(
          this.buildCaboInfoWindowHtml(tipoFibra, { id_meta, Label_cabo: novoLabel }),
        );
      }
    }
    if (this.clickedCaboData?.id_meta === id_meta) {
      this.clickedCaboData.Label_cabo = novoLabel;
    }
    this.cdr.detectChanges();
  }

  private abrirLabelCaboDialog(): void {
    if (!this.clickedCaboData?.id_meta) {
      alert('Erro: dados do cabo não encontrados.');
      this.hideContextMenu();
      return;
    }
    const id_meta = this.clickedCaboData.id_meta as number;
    const Label_cabo =
      this.clickedCaboData.Label_cabo ??
      this.clickedPolyline?.get('label') ??
      this.clickedPolyline?.get('Label_cabo') ??
      '';
    const polyRef = this.clickedPolyline;
    const anchorX = this.contextMenuPosition.x;
    const anchorY = this.contextMenuPosition.y;
    this.hideContextMenu();
    const data: LabelCaboDialogData = { id_meta, Label_cabo, anchorX, anchorY };
    const ref = this.ngbModal.open(LabelCaboDialogComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'label-cabo-modal-window',
    });
    ref.componentInstance.data = data;
    ref.result.then(
      (result) => {
        if (typeof result === 'string') {
          this.aplicarNovoLabelCaboNoMapa(polyRef, id_meta, result);
        }
      },
      () => {
        /* dismissed */
      },
    );
  }

  //=============================================================================================================================
// Método genérico para criar polylines com clique simples e duplo clique
  private createCaboPolylines(
    tipoFibra: string,
    cabos: any[],
    paths: google.maps.LatLngLiteral[][],
    polylinesArray: google.maps.Polyline[],
    infoWindowsArray: google.maps.InfoWindow[],
    options: google.maps.PolylineOptions
  ): void {
    if (!this.map) {
      console.log('Mapa não inicializado ainda, aguardando...');
      return;
    }

    // Limpar polylines e InfoWindows anteriores
    console.log('Limpando', polylinesArray.length, `polylines ${tipoFibra} anteriores...`);
    polylinesArray.forEach(polyline => {
      google.maps.event.clearInstanceListeners(polyline);
      polyline.setMap(null);
    });
    polylinesArray.length = 0;

    // Limpar InfoWindows anteriores
    infoWindowsArray.forEach(infoWindow => {
      infoWindow.close();
    });
    infoWindowsArray.length = 0;

    if (!cabos || cabos.length === 0 || !paths || paths.length === 0) {
      console.log(`Dados dos cabos ${tipoFibra} não disponíveis ainda`);
      return;
    }

    console.log('Criando', paths.length, `polylines de cabos ${tipoFibra} com clique simples e duplo`);

    // Criar array de índices correspondentes entre paths e cabos
    const indicesValidos: number[] = [];
    cabos.forEach((cabo, index) => {
      if (cabo.GOOGLE_LATLNG) {
        const coords = this.convertStringToCoords(cabo.GOOGLE_LATLNG);
        if (coords.length > 0) {
          indicesValidos.push(index);
        }
      }
    });

    // Criar novas polylines com eventos de clique simples e duplo clique
    paths.forEach((path, pathIndex) => {
      if (path.length > 0) {
        const polyline = new google.maps.Polyline({
          path: path,
          ...options,
          map: this.layerVisibilityService.isVisible('cabos') ? this.map : null, //inserido na implementação visualização de camadas
        });

        // Usar o índice correto do array de cabos
        const caboIndex = indicesValidos[pathIndex];
        const cabo = cabos[caboIndex];
        
        // 🗺️ NOVO: Armazenar dados na polyline (como no Visio)
        polyline.set('id_meta', cabo.id_meta);
        polyline.set('capacidade', tipoFibra);
        polyline.set('tipo', cabo.tipo || 'CABO');
        polyline.set('label', cabo.Label_cabo || '');
        polyline.set('Label_cabo', cabo.Label_cabo || '');
        polyline.set('cabo_data', cabo); // Dados completos do cabo
        
        /*console.log(`🗺️ [POLYLINE-DATA] Armazenando dados na polyline ${tipoFibra}:`, {
          id_meta: cabo.id_meta,
          capacidade: tipoFibra,
          tipo: cabo.tipo,
          label: cabo.Label_cabo
        });*/
        
        // Criar InfoWindow para este cabo
        const infoWindow = new google.maps.InfoWindow({
          content: this.buildCaboInfoWindowHtml(tipoFibra, {
            id_meta: cabo.id_meta,
            Label_cabo: cabo.Label_cabo,
          }),
        });
        polyline.set('infoWindow', infoWindow);

        // Variáveis para controlar cliques
        let clickTimeout: any;

        // Adicionar evento de clique (simples e duplo)
        polyline.addListener('click', (event: google.maps.MapMouseEvent) => {
          // Limpar timeout anterior se existir
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
          }

          // Definir timeout para clique simples
          clickTimeout = setTimeout(() => {
            // Clique simples - mostrar InfoWindow
            console.log(`Clique simples detectado no cabo ${tipoFibra}:`, cabo.id_meta);
            if (event.latLng) {
              infoWindow.setPosition(event.latLng);
              infoWindow.open(this.map);
            }
          }, 300); // Delay de 300ms para distinguir de duplo clique
        });

        // Adicionar evento de duplo clique
        polyline.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
          console.log(`🔴 CABO DOUBLE-CLICK - Editando cabo ${tipoFibra}:`, cabo.id_meta);
          
          // Cancelar clique simples se estiver pendente
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
          }
          
          // Fechar InfoWindow se estiver aberto
          infoWindow.close();
          
          // 🔧 NOVO: Em mobile, abrir context menu em vez de editar
          if (this.isMobile()) {
            console.log('📱 [MOBILE] Double tap no cabo - abrindo context menu');
            this.contextMenuType = 'cabo';
            this.clickedPolyline = polyline;
            this.clickedCaboData = {
              id_meta: cabo.id_meta,
              capacidade: cabo.capacidade || polyline.get('capacidade'),
              tipo: cabo.tipo || polyline.get('tipo') || tipoFibra,
              Label_cabo: cabo.Label_cabo || polyline.get('label') || polyline.get('Label_cabo'),
              GOOGLE_LATLNG: cabo.GOOGLE_LATLNG || polyline.get('GOOGLE_LATLNG'),
              cabo_data: cabo.cabo_data || polyline.get('cabo_data')
            };
            
            if (event.domEvent) {
              const mouseEvent = event.domEvent as MouseEvent;
              this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
            }
            return;
          }
          
          // Desktop: comportamento padrão (editar cabo)
          // 🛡️ Verificar se já existe uma edição em andamento
          if (this.isEditingCabo || this.isIniciandoEdicao) {
            console.log('⚠️ [EDITAR-CABO] Edição em andamento detectada no dblclick. Finalizando edição anterior...');
            
            // Se o cabo clicado é diferente do que está sendo editado, finalizar edição anterior
            const caboEmEdicaoId = this.clickedPolyline?.get('id_meta');
            const novoCaboId = cabo.id_meta;
            
            if (caboEmEdicaoId !== novoCaboId) {
              console.log('🔄 [EDITAR-CABO] Novo cabo clicado durante edição (dblclick). Finalizando edição anterior...');
              
              // Finalizar edição do cabo anterior (salvar automaticamente)
              this.finalizarEdicaoCabo();
              
              // Aguardar um pouco para garantir que a finalização foi processada
              setTimeout(() => {
                // 🛡️ Limpar flag de finalização
                this.isFinalizandoEdicao = false;
                
                // 🆕 Setar dados do novo cabo para edição
                this.clickedPolyline = polyline;
                this.clickedCaboData = {
                  id_meta: cabo.id_meta,
                  capacidade: cabo.capacidade || polyline.get('capacidade'),
                  tipo: cabo.tipo || polyline.get('tipo') || tipoFibra,
                  Label_cabo: cabo.Label_cabo || polyline.get('label') || polyline.get('Label_cabo'),
                  GOOGLE_LATLNG: cabo.GOOGLE_LATLNG || polyline.get('GOOGLE_LATLNG'),
                  cabo_data: cabo.cabo_data || polyline.get('cabo_data')
                };
                
                // 🆕 Chamar editarCabo() para o novo cabo
                this.editarCabo();
              }, 100);
              return;
            } else {
              // Mesmo cabo - apenas continuar edição
              console.log('✅ [EDITAR-CABO] Mesmo cabo clicado durante edição (dblclick) - continuando edição');
              return;
            }
          }
          
          // 🆕 Setar dados do cabo para edição (similar ao right-click)
          this.clickedPolyline = polyline;
          this.clickedCaboData = {
            id_meta: cabo.id_meta,
            capacidade: cabo.capacidade || polyline.get('capacidade'),
            tipo: cabo.tipo || polyline.get('tipo') || tipoFibra,
            Label_cabo: cabo.Label_cabo || polyline.get('label') || polyline.get('Label_cabo'),
            GOOGLE_LATLNG: cabo.GOOGLE_LATLNG || polyline.get('GOOGLE_LATLNG'),
            cabo_data: cabo.cabo_data || polyline.get('cabo_data')
          };
          
          // 🆕 Chamar editarCabo() em vez de openVisualizaCaboModal()
          this.editarCabo();
        });

        // 🆕 Adicionar evento de right-click (botão direito) nos cabos
        polyline.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
          console.log('🔴 RIGHT-CLICK no cabo:', cabo.id_meta, tipoFibra);
          
          // 🛑 IMPORTANTE: Prevenir menu padrão do navegador PRIMEIRO
          if (event.domEvent) {
            event.domEvent.preventDefault();
            event.domEvent.stopPropagation();
          }
          
          // 🛡️ Verificar se já existe uma edição em andamento
          if (this.isEditingCabo || this.isIniciandoEdicao) {
            console.log('⚠️ [EDITAR-CABO] Edição em andamento detectada. Finalizando edição anterior...');
            
            // Se o cabo clicado é diferente do que está sendo editado, finalizar edição anterior
            const caboEmEdicaoId = this.clickedPolyline?.get('id_meta');
            const novoCaboId = cabo.id_meta;
            
            if (caboEmEdicaoId !== novoCaboId) {
              console.log('🔄 [EDITAR-CABO] Novo cabo clicado durante edição. Finalizando edição anterior...');
              
              // 🛡️ CRÍTICO: Prevenir menu ANTES de QUALQUER processamento assíncrono
              if (event.domEvent) {
                const domEvent = event.domEvent as MouseEvent;
                domEvent.preventDefault();
                domEvent.stopPropagation();
                domEvent.stopImmediatePropagation();
                
                // 🆕 BACKUP: Prevenir também no próximo tick (caso o preventDefault não tenha funcionado)
                requestAnimationFrame(() => {
                  if (!domEvent.defaultPrevented) {
                    domEvent.preventDefault();
                    domEvent.stopPropagation();
                    domEvent.stopImmediatePropagation();
                  }
                });
              }
              
              // Finalizar edição do cabo anterior (salvar automaticamente)
              this.finalizarEdicaoCabo();
              // Aguardar um pouco para garantir que a finalização foi processada
              setTimeout(() => {
                // 🛡️ Limpar flag de finalização imediatamente após processar o novo cabo
                this.isFinalizandoEdicao = false;
                
                this.processarRightClickCabo(event, polyline, cabo, infoWindow);
              }, 100);
              return;
            } else {
              // Mesmo cabo - apenas mostrar menu
              console.log('✅ [EDITAR-CABO] Mesmo cabo clicado durante edição');
            }
          }
          
          this.processarRightClickCabo(event, polyline, cabo, infoWindow);
        });

        // 🔧 NOVO: Adicionar suporte a touch events para mobile (long press = right-click) nas polylines
        polyline.addListener('touchstart', (event: google.maps.MapMouseEvent) => {
          if (event.domEvent) {
            const touchEvent = event.domEvent as TouchEvent;
            if (touchEvent.touches && touchEvent.touches.length > 0) {
              const touch = touchEvent.touches[0];
              this.touchStartTime = Date.now();
              this.touchStartPosition = {
                x: touch.clientX,
                y: touch.clientY
              };
              this.longPressPolyline = polyline;

              // Iniciar timer para long press
              this.longPressTimer = setTimeout(() => {
                // Long press detectado - simular right-click
                console.log('📱 [MOBILE] Long press detectado no cabo - simulando right-click');
                
                // Criar evento de mouse simulado
                const simulatedEvent = {
                  ...event,
                  domEvent: {
                    ...event.domEvent,
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    preventDefault: () => {},
                    stopPropagation: () => {}
                  } as any
                } as google.maps.MapMouseEvent;

                // Obter dados do cabo
                const caboData = {
                  id_meta: polyline.get('id_meta'),
                  capacidade: polyline.get('capacidade'),
                  tipo: polyline.get('tipo'),
                  Label_cabo: polyline.get('label') || polyline.get('Label_cabo'),
                  GOOGLE_LATLNG: polyline.get('GOOGLE_LATLNG'),
                  cabo_data: polyline.get('cabo_data')
                };

                // Chamar o handler de right-click
                this.processarRightClickCabo(simulatedEvent, polyline, caboData, infoWindow);
              }, this.LONG_PRESS_DURATION);
            }
          }
        });

        polyline.addListener('touchend', (event: google.maps.MapMouseEvent) => {
          // Cancelar long press se o toque terminou antes do tempo
          if (this.longPressTimer && this.longPressPolyline === polyline) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
            this.longPressPolyline = null;
          }
          this.touchStartTime = 0;
          this.touchStartPosition = null;
        });

        polyline.addListener('touchmove', (event: google.maps.MapMouseEvent) => {
          // Cancelar long press se o usuário moveu o dedo
          if (this.longPressTimer && this.longPressPolyline === polyline) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
            this.longPressPolyline = null;
          }
        });

        // Adicionar evento para fechar InfoWindow quando clicar fora
        const clickListener = this.map?.addListener('click', () => {
          console.log('🔧 [POLYLINE] Clique detectado - fechando InfoWindow');
          infoWindow.close();
        });
        
        // Guardar listener para poder removê-lo depois se necessário
        if (clickListener) {
          polyline.set('infoWindowClickListener', clickListener);
        }

        polylinesArray.push(polyline);
        infoWindowsArray.push(infoWindow);
      }
    });

    console.log(`Polylines de cabos ${tipoFibra} criadas:`, polylinesArray.length);
    console.log(`InfoWindows de cabos ${tipoFibra} criados:`, infoWindowsArray.length);
  }

// BOTOES DE PESQUISA NO MAPA==================================================================================================
// Novos métodos para os botões de pesquisa
  pesquisarCaixa(dadosCaixa?: any): void {
    console.log('Pesquisar Caixa executado no GoogleMapsComponent');
    console.log('Dados recebidos - dadosCaixa:', dadosCaixa);
    console.log('Tipo de dadosCaixa:', typeof dadosCaixa);
    console.log('dadosCaixa é undefined?', dadosCaixa === undefined);
    
    if (dadosCaixa && dadosCaixa.LAT && dadosCaixa.LONGI) {
    
      
      // Centralizar mapa na localização da caixa com zoom máximo

      //this.centerMapOnLocation(dadosCaixa.LAT,dadosCaixa.LONGI)
      this.center = { 
        lat: parseFloat(dadosCaixa.LAT), 
        lng: parseFloat(dadosCaixa.LONGI) 
      };
      this.zoom = 20;
      
      console.log(`Mapa centralizado na caixa ${dadosCaixa.NUMERO}: ${dadosCaixa.LAT}, ${dadosCaixa.LONGI}`);
    } else {
      console.log('Dados de caixa incompletos ou não fornecidos');
      console.log('Funcionalidade de Pesquisa Caixa será implementada');
    }
  }

  pesquisarCliente(dadosCliente?: any): void {
    console.log('Pesquisar Cliente executado no GoogleMapsComponent');
    console.log('Dados recebidos - dadosCliente:', dadosCliente);
    console.log('Tipo de dadosCliente:', typeof dadosCliente);
    console.log('dadosCliente é undefined?', dadosCliente === undefined);
    
    if (dadosCliente && dadosCliente.LAT && dadosCliente.LONGI) {
    
      
      // Centralizar mapa na localização da caixa com zoom máximo

      //this.centerMapOnLocation(dadosCaixa.LAT,dadosCaixa.LONGI)
      this.center = { 
        lat: parseFloat(dadosCliente.LAT), 
        lng: parseFloat(dadosCliente.LNG) 
      };
      this.zoom = 20;
      
      console.log(`Mapa centralizado no Cliente ${dadosCliente.SIGLA}: ${dadosCliente.LAT}, ${dadosCliente.LNG}`);
    } else {
      console.log('Dados do Cliente incompletos ou não fornecidos');
      console.log('Funcionalidade de Pesquisa Cliente será implementada');
    }
  }

  pesquisarEstacao(): void {
    console.log('Pesquisar Estação clicado');
    // Implementar lógica de pesquisa de estação
    alert('Funcionalidade de Pesquisa Estação será implementada');
  }

  verificarViabilidade(): void {
    console.log('Verificar Viabilidade clicado');
    // Implementar lógica de verificação de viabilidade
    alert('Funcionalidade de Viabilidade será implementada');
  }



    
   // Método para centralizar o mapa na caixa selecionada
  centralizarNaCaixa(caixaData: CaixaData): void {
    if (caixaData.LAT && caixaData.LONGI && this.map) {
      const center = new google.maps.LatLng(caixaData.LAT, caixaData.LONGI);
      this.map.setCenter(center);
      this.map.setZoom(18); // Zoom próximo para visualizar a caixa
      console.log(`Mapa centralizado na caixa ${caixaData.NUMERO} - Coordenadas: ${caixaData.LAT}, ${caixaData.LONGI}`);
    } 
    
  }

   // Método para centralizar o mapa no cliente selecionado
  centralizarNoCliente(clienteData: ClienteData): void {
    if (clienteData.LAT && clienteData.LNG && this.map) {
      const center = new google.maps.LatLng(clienteData.LAT, clienteData.LNG);
      this.map.setCenter(center);
      this.map.setZoom(20); // Zoom próximo para visualizar a caixa
      console.log(`Mapa centralizado na caixa ${clienteData.SIGLA} - Coordenadas: ${clienteData.LAT}, ${clienteData.LNG}`);
    } 
    
  }

  // Método para centralizar o mapa na estação selecionada
  centralizarNaEstacao(estacaoData: EstacaoData): void {
    if (estacaoData.LAT && estacaoData.LNG && this.map) {
      const center = new google.maps.LatLng(estacaoData.LAT, estacaoData.LNG);
      this.map.setCenter(center);
      this.map.setZoom(20); // Zoom próximo para visualizar a estação
      console.log(`Mapa centralizado na estação ${estacaoData.SIGLA} - Coordenadas: ${estacaoData.LAT}, ${estacaoData.LNG}`);
    } 
    
  }

  private limparMarcadorLogradouroPesquisa(): void {
    if (this.marcadorLogradouroPesquisa) {
      this.marcadorLogradouroPesquisa.setMap(null);
      this.marcadorLogradouroPesquisa = null;
    }
    if (this.infoWindowLogradouroPesquisa) {
      this.infoWindowLogradouroPesquisa.close();
      this.infoWindowLogradouroPesquisa = null;
    }
  }

  private limparMarcadorViabilidadePesquisa(): void {
    if (this.marcadorViabilidadePesquisa) {
      this.marcadorViabilidadePesquisa.setMap(null);
      this.marcadorViabilidadePesquisa = null;
    }
  }

  private limparCirculosViabilidadeCaixas(): void {
    for (const c of this.circulosViabilidadeCaixas) {
      c.setMap(null);
    }
    this.circulosViabilidadeCaixas = [];
  }

  private exibirCirculosViabilidadeCaixas(pontos: ViabilidadeCirculoCaixaData[]): void {
    if (!this.map) {
      return;
    }
    this.limparCirculosViabilidadeCaixas();
    const r = GoogleMapsComponent.VIABILIDADE_CIRCULO_RAIO_METROS;
    for (const p of pontos) {
      const circle = new google.maps.Circle({
        map: this.map,
        center: { lat: p.lat, lng: p.lng },
        radius: r,
        strokeColor: '#1e88e5',
        strokeOpacity: 1,
        strokeWeight: 1,
        fillOpacity: 0,
        zIndex: 4999,
      });
      this.circulosViabilidadeCaixas.push(circle);
    }
  }

  private iconeCruzVerdeViabilidade(): google.maps.Icon {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">' +
      '<path stroke="#1b5e20" stroke-width="3" stroke-linecap="round" fill="none" d="M16 4v24M4 16h24"/>' +
      '</svg>';
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 16),
    };
  }

  private exibirMarcadorViabilidadePesquisa(ponto: ViabilidadePontoMapaData): void {
    if (!this.map) {
      return;
    }
    this.limparMarcadorViabilidadePesquisa();
    this.marcadorViabilidadePesquisa = new google.maps.Marker({
      position: { lat: ponto.lat, lng: ponto.lng },
      map: this.map,
      title: ponto.endereco,
      zIndex: 5001,
      icon: this.iconeCruzVerdeViabilidade(),
      animation: google.maps.Animation.DROP,
    });
  }

  private exibirMarcadorLogradouroPesquisa(ponto: LogradouroPesquisaData): void {
    if (!this.map) {
      return;
    }
    this.limparMarcadorLogradouroPesquisa();
    this.marcadorLogradouroPesquisa = new google.maps.Marker({
      position: { lat: ponto.lat, lng: ponto.lng },
      map: this.map,
      title: ponto.endereco,
      zIndex: 5000,
      animation: google.maps.Animation.DROP,
    });
    const el = document.createElement('div');
    el.style.maxWidth = '280px';
    el.style.padding = '6px 8px';
    el.style.fontSize = '12px';
    el.style.lineHeight = '1.4';
    el.textContent = ponto.endereco;
    this.infoWindowLogradouroPesquisa = new google.maps.InfoWindow({ content: el });
    this.infoWindowLogradouroPesquisa.open({
      map: this.map,
      anchor: this.marcadorLogradouroPesquisa,
    });
  }

  /**
   * Monta payload de exportação KML com todos os destinos carregados no mapa.
   */
  private montarMapExportData(): PolygonMapExportData {
    return {
      caixas: this.destino,
      ctos: this.destinoCTO,
      ctosSP: this.destinoCTOSP,
      clientes: this.destinoPopsCli,
      clientesAtivados: this.destinoPopsCliAtv,
      clientesDesativados: this.destinoPopsCliDes,
      estacoes: this.destinoPopsEst,
      condominios: this.destinoCondominios,
      dios: this.destinoDios,
      cabos1f: this.destinoCabos1f,
      cabos2f: this.destinoCabos2f,
      cabos4f: this.destinoCabos4f,
      cabos6f: this.destinoCabos6f,
      cabos8f: this.destinoCabos8f,
      cabos12f: this.destinoCabos12f,
      cabos24f: this.destinoCabos24f,
      cabos36f: this.destinoCabos36f,
      cabos48f: this.destinoCabos48f,
      cabos72f: this.destinoCabos72f,
      cabos144f: this.destinoCabos144f,
    };
  }

  private exportarKmlPoligonoContextMenu(): void {
    const poly = this.clickedPoligono;
    if (!poly) {
      alert('Erro: polígono não identificado. Clique novamente com o botão direito no polígono.');
      return;
    }

    const result = this.kmlPolygonExportService.exportPolygonContentsToKML(
      poly,
      this.montarMapExportData()
    );

    if (!result.exported) {
      alert('Não foi possível exportar: polígono inválido (menos de 3 vértices).');
      return;
    }

    if (result.boundaryOnly) {
      alert('Nenhum objeto encontrado dentro deste polígono. Exportado apenas o contorno.');
    }
  }
  
  private async abrirDashboardModal(
    data: DashboardPoligonoData,
    loadSplitters: () => ReturnType<PoligonoDashboardService['loadSplittersPorTipo']>,
  ): Promise<void> {
    const { DashboardPoligonoComponent } = await import(
      '../dashboard-poligono/dashboard-poligono.component'
    );
    const ref = this.ngbModal.open(DashboardPoligonoComponent, {
      size: 'xl',
      backdrop: 'static',
      keyboard: true,
      windowClass: 'dashboard-poligono-modal-window',
    });
    ref.componentInstance.data = data;

    loadSplitters()
      .pipe(take(1))
      .subscribe({
        next: (splittersTipo) => {
          ref.componentInstance.data = {
            ...ref.componentInstance.data,
            splittersTipo,
            splittersLoading: false,
          };
        },
        error: () => {
          ref.componentInstance.data = {
            ...ref.componentInstance.data,
            splittersTipo: [],
            splittersLoading: false,
          };
        },
      });
  }

  private abrirDashboardPoligono(): void {
    const poly = this.clickedPoligono;
    if (!poly) {
      alert('Erro: polígono não identificado. Clique novamente com o botão direito no polígono.');
      this.hideContextMenu();
      return;
    }

    const idRaw = poly.get('id_meta'); // pega o id_meta do polígono do marcador
    const idMetaNum = typeof idRaw === 'string' ? parseInt(idRaw, 10) : Number(idRaw);
    const id_meta =
      Number.isFinite(idMetaNum) && Number.isInteger(idMetaNum) && idMetaNum > 0
        ? idMetaNum
        : undefined;

    const labelRaw = poly.get('labelPoligono');
    const label =
      labelRaw != null && String(labelRaw).trim() !== '' ? String(labelRaw).trim() : undefined;

    this.hideContextMenu();

    const mapData = this.montarMapExportData(); // monta o payload de exportação KML com todos os destinos carregados no mapa.
    const report = this.poligonoDashboardService.buildReport(poly, mapData); // constroi o relatório do polígono

    const data: DashboardPoligonoData = {
      id_meta,
      label,
      ...report,
      splittersTipo: [],
      splittersLoading: true,
    };
    void this.abrirDashboardModal(data, () =>
      this.poligonoDashboardService.loadSplittersPorTipo(poly, mapData),
    );
  }

  private abrirDashboardMapa(): void {
    const mapData = this.montarMapExportData();
    const report = this.poligonoDashboardService.buildMapReport(mapData);

    const data: DashboardPoligonoData = {
      label: 'Relatório geral',
      modoGeral: true,
      ...report,
      splittersTipo: [],
      splittersLoading: true,
    };
    void this.abrirDashboardModal(data, () =>
      this.poligonoDashboardService.loadSplittersPorTipoFromData(mapData),
    );
  }

  private aplicarNovoLabelPoligonoNoMapa(
    poly: google.maps.Polygon | null,
    id_meta: number,
    novoLabel: string,
  ): void {
    if (!poly) {
      return;
    }

    const displayText = (novoLabel ?? '').trim();
    const labelPersistido = displayText !== '' ? displayText : '(_)';

    const idxDestino = this.destinoPoligonos.findIndex((p) => p.id_meta === id_meta);
    if (idxDestino !== -1) {
      this.destinoPoligonos[idxDestino].Label = labelPersistido;
    }

    if (displayText) {
      poly.set('labelPoligono', displayText);
      const paths = this.primeiroAnelParaLiterais(poly);
      const pos = this.centroPoligonoPontos(paths);
      const labelStyle: google.maps.MarkerLabel = {
        text: displayText,
        color: 'rgba(15, 23, 42, 0.72)',
        fontSize: '22px',
        fontWeight: 'bold',
      };
      let marker = poly.get('labelMarker') as google.maps.Marker | undefined;
      if (marker) {
        marker.setLabel(labelStyle);
        marker.setPosition(pos);
      } else if (this.map) {
        marker = new google.maps.Marker({
          position: pos,
          map: this.map,
          clickable: false,
          zIndex: google.maps.Marker.MAX_ZINDEX + 1,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillOpacity: 0,
            strokeOpacity: 0,
            scale: 1,
          },
          label: labelStyle,
        });
        poly.set('labelMarker', marker);
        if (this.poligonosMapaLocais.includes(poly)) {
          this.poligonosLabelMarkersLocais.push(marker);
        } else {
          this.poligonosLabelMarkers.push(marker);
        }
      }
    } else {
      poly.set('labelPoligono', '');
      const marker = poly.get('labelMarker') as google.maps.Marker | undefined;
      if (marker) {
        marker.setMap(null);
        const idxLabel = this.poligonosLabelMarkers.indexOf(marker);
        if (idxLabel !== -1) {
          this.poligonosLabelMarkers.splice(idxLabel, 1);
        } else {
          const idxLabelLocal = this.poligonosLabelMarkersLocais.indexOf(marker);
          if (idxLabelLocal !== -1) {
            this.poligonosLabelMarkersLocais.splice(idxLabelLocal, 1);
          }
        }
        poly.set('labelMarker', null);
      }
    }

    this.updateVisiblePoligonos(); // inserido na implementação visualização de camadas
    this.cdr.detectChanges();//inserido na implementação visualização de camadas
  }

  private abrirLabelPoligonoDialog(): void {
    const poly = this.clickedPoligono;
    if (!poly) {
      alert('Erro: polígono não identificado. Clique novamente com o botão direito no polígono.');
      this.hideContextMenu();
      return;
    }

    const idRaw = poly.get('id_meta');
    const id_meta = typeof idRaw === 'string' ? parseInt(idRaw, 10) : Number(idRaw);
    if (!Number.isFinite(id_meta) || !Number.isInteger(id_meta) || id_meta <= 0) {
      alert('Não foi possível editar o label: polígono ainda não persistido (id_meta ausente ou inválido).');
      this.hideContextMenu();
      return;
    }

    const coords = this.primeiroAnelParaLiterais(poly);
    if (coords.length < 3) {
      alert('Polígono inválido (menos de 3 vértices).');
      this.hideContextMenu();
      return;
    }

    const labelRaw = poly.get('labelPoligono');
    const Label =
      labelRaw != null && String(labelRaw).trim() !== '' ? String(labelRaw).trim() : '';

    const polyRef = poly;
    const anchorX = this.contextMenuPosition.x;
    const anchorY = this.contextMenuPosition.y;
    this.hideContextMenu();

    const data: LabelPoligonoDialogData = {
      id_meta,
      Label,
      GOOGLE_LATLNG: coords,
      anchorX,
      anchorY,
    };

    const ref = this.ngbModal.open(LabelPoligonoDialogComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'label-poligono-modal-window',
    });
    ref.componentInstance.data = data;
    ref.result.then(
      (result) => {
        if (typeof result === 'string') {
          this.aplicarNovoLabelPoligonoNoMapa(polyRef, id_meta, result);
        }
      },
      () => {
        /* dismissed */
      },
    );
  }

  private excluirPoligonoContextMenu(): void {
    const poly = this.clickedPoligono;
    if (!poly) {
      alert('Erro: polígono não identificado. Clique novamente com o botão direito no polígono.');
      return;
    }

    const idRaw = poly.get('id_meta');
    const idMetaNum = typeof idRaw === 'string' ? parseInt(idRaw, 10) : Number(idRaw);
    if (!Number.isFinite(idMetaNum) || !Number.isInteger(idMetaNum) || idMetaNum <= 0) {
      alert('Não foi possível excluir: polígono ainda não persistido (id_meta ausente ou inválido).');
      return;
    }

    const idCity = this.authService.getIdCity();
    if (!idCity) {
      alert('Erro: ID da cidade não encontrado. Selecione uma cidade no workspace.');
      return;
    }

    const labelRaw = poly.get('labelPoligono');
    const label = labelRaw != null && String(labelRaw).trim() !== '' ? String(labelRaw).trim() : 'N/A';
    const confirmacao = confirm(
      `Tem certeza que deseja excluir este polígono?\n\nLabel: ${label}\nID_META: ${idMetaNum}`
    );
    if (!confirmacao) {
      return;
    }

    const request: ExcluiPoligonoRequest = {
      id_meta: idMetaNum,
      id_city: idCity,
    };

    this.excluiPoligonoService.excluirPoligono(request).subscribe({
      next: (response: ExcluiPoligonoResponse) => {
        console.log('✅ [EXCLUI-POLIGONO] Resposta da API:', response);
        if (response.success) {
          this.removerPoligonoDoMapa(poly, idMetaNum);
        }
      },
      error: (err: any) => {
        const errorObj = typeof err === 'object' ? err : {};
        const errorMsg = errorObj?.message || (typeof err === 'string' ? err : 'Erro ao excluir polígono.');
        alert(`Erro ao excluir polígono: ${errorMsg}`);
      },
    });
  }

  private removerPoligonoDoMapa(poly: google.maps.Polygon, idMeta: number): void {
    if (this.poligonoEmEdicao === poly) {
      this.sairVisualEdicaoPoligonoAtual();
    }

    poly.setMap(null);

    const labelMarker = poly.get('labelMarker') as google.maps.Marker | undefined;
    if (labelMarker) {
      labelMarker.setMap(null);
      const idxLabel = this.poligonosLabelMarkers.indexOf(labelMarker);
      if (idxLabel !== -1) {
        this.poligonosLabelMarkers.splice(idxLabel, 1);
      } else {
        const idxLabelLocal = this.poligonosLabelMarkersLocais.indexOf(labelMarker);
        if (idxLabelLocal !== -1) {
          this.poligonosLabelMarkersLocais.splice(idxLabelLocal, 1);
        }
      }
    }

    const idxMapa = this.poligonosMapa.indexOf(poly);
    if (idxMapa !== -1) {
      this.poligonosMapa.splice(idxMapa, 1);
    } else {
      const idxLocal = this.poligonosMapaLocais.indexOf(poly);
      if (idxLocal !== -1) {
        this.poligonosMapaLocais.splice(idxLocal, 1);
      }
    }

    const idxDestino = this.destinoPoligonos.findIndex((p) => p.id_meta === idMeta);
    if (idxDestino !== -1) {
      this.destinoPoligonos.splice(idxDestino, 1);
    }

    this.clickedPoligono = null;
    this.hideContextMenu();

    if (this.modoEdicaoPoligonoArmado) {
      this.reinstalarDuploCliquePoligonosModoArmado();
    }

    console.log('🗑️ [EXCLUI-POLIGONO] Polígono removido do mapa, id_meta:', idMeta);
  }

  /**
   * 📤 EXPORT: Exporta o mapa para KML
   */
  exportMapToKML(): void {
    console.log('🗺️ [GOOGLE-MAPS] Iniciando exportação de mapa para KML...');

    this.kmlExportService.exportMapToKML({
      ...this.montarMapExportData(),
      clientes: this.destinoPopsCli,
      clientesAtivados: this.destinoPopsCliAtv,
      clientesDesativados: this.destinoPopsCliDes,
    });
  }

  /***********************************************************************************************************
   * 🗺️ DESENHO CABO: Inicia o modo de desenho de cabo
   **********************************************************************************************************/
  startDesenhoCabo(): void {
    console.log('🗺️ [DESENHO-CABO] Iniciando modo de desenho...');

    this.desativarModoEdicaoPoligonoCompleto();
    this.cancelarDesenhoPoligono();
    
    // Cancelar desenho anterior se existir
    if (this.isDesenhandoCabo) {
      this.cancelarDesenhoCabo();
    }

    this.isDesenhandoCabo = true;
    this.pontosCaboEmDesenho = [];
    this.caboEmDesenho = null;
    this.caboDesenhado = null;

    if (!this.map) {
      console.error('🗺️ [DESENHO-CABO] Mapa não está inicializado');
      this.isDesenhandoCabo = false;
      return;
    }

    // Mudar cursor do mapa
    this.map.setOptions({ 
      draggableCursor: 'crosshair',
      clickableIcons: false 
    });

    // Adicionar listener de clique no mapa
    this.listenerMapaDesenho = this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      this.addPontoCabo(event);
    });

    // Adicionar listener de clique direito para cancelar
    this.listenerRightClickDesenho = this.map.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
      this.cancelarDesenhoCabo();
    });

    //alert('🗺️ Modo de desenho ativado:\n• Clique no mapa para adicionar pontos\n• Clique com botão direito para cancelar\n• Pressione "Finaliza Cabo" quando terminar');
  }

  /**
   * 🗺️ DESENHO CABO: Adiciona um ponto ao cabo em desenho
   */
  addPontoCabo(event: google.maps.MapMouseEvent): void {
    if (!this.isDesenhandoCabo || !event.latLng) {
      return;
    }

    console.log('🗺️ [DESENHO-CABO] Adicionando ponto:', event.latLng);
    this.pontosCaboEmDesenho.push(event.latLng);

    // Remover polyline anterior se existir
    if (this.caboEmDesenho) {
      this.caboEmDesenho.setMap(null);
    }

    // Criar/atualizar a polyline temporária (apenas quando há mais de 1 ponto)
    if (this.pontosCaboEmDesenho.length > 1) {
      this.caboEmDesenho = new google.maps.Polyline({
        path: this.pontosCaboEmDesenho,
        map: this.map,
        strokeColor: '#808080', // Cinza
        strokeWeight: 3,
        strokeOpacity: 0.8,
        zIndex: 1000,
        clickable: false,
        geodesic: true
      });
    }
    // Removido: marcador cinza no primeiro ponto (não era removido após finalizar/cancelar)
  }

  /**
   * 🗺️ DESENHO CABO: Finaliza o desenho do cabo e abre modal de tipagem
   */
  finalizarDesenhoCabo(): void {
    console.log('🗺️ [DESENHO-CABO] Finalizando desenho...');
    
    if (!this.isDesenhandoCabo || this.pontosCaboEmDesenho.length < 2) {
      alert('❌ Desenhe pelo menos 2 pontos antes de finalizar!');
      return;
    }

    const totalPontos = this.pontosCaboEmDesenho.length;
    console.log('🗺️ [DESENHO-CABO] Total de pontos coletados:', totalPontos);
    console.log('🗺️ [DESENHO-CABO] Pontos:', this.pontosCaboEmDesenho);

    // Remover listeners
    if (this.listenerMapaDesenho) {
      google.maps.event.removeListener(this.listenerMapaDesenho);
      this.listenerMapaDesenho = null;
    }

    if (this.listenerRightClickDesenho) {
      google.maps.event.removeListener(this.listenerRightClickDesenho);
      this.listenerRightClickDesenho = null;
    }

    // Remover polyline temporária
    if (this.caboEmDesenho) {
      this.caboEmDesenho.setMap(null);
    }

    // 🆕 Guardar pontos antes de limpar e abrir modal de tipagem
    this.pontosCaboAguardandoTipagem = [...this.pontosCaboEmDesenho];
    
    // Parar modo de desenho
    this.isDesenhandoCabo = false;
    
    // Limpar array de pontos (será usado depois no criarCaboComTipagemEIdMeta)
    this.pontosCaboEmDesenho = [];
    
    // 🆕 Abrir modal de tipagem
    this.tipagemCabosModalVisible = true;
    console.log('🗺️ [DESENHO-CABO] Modal de tipagem aberto. Aguardando seleção do tipo de cabo...');
    
    // Restaurar cursor
    if (this.map) {
      this.map.setOptions({ 
        draggableCursor: null,
        clickableIcons: true 
      });
    }
  }

  /**
   * 🎨 Retorna as opções de polyline baseadas na capacidade do cabo
   */
  private getPolylineOptionsPorCapacidade(capacidadeStr: string): google.maps.PolylineOptions {
    const capacidade = InsertCaboService.converterCapacidadeParaNumero(capacidadeStr);
    
    switch(capacidade) {
      case 1:
        return this.polylineOptions1f;
      case 2:
        return this.polylineOptions2f;
      case 4:
        return this.polylineOptions4f;
      case 6:
        return this.polylineOptions6f;
      case 8:
        return this.polylineOptions8f;
      case 12:
        return this.polylineOptions12f;
      case 24:
        return this.polylineOptions24f;
      case 36:
        return this.polylineOptions36f;
      case 48:
        return this.polylineOptions48f;
      case 72:
        return this.polylineOptions72f;
      case 144:
        return this.polylineOptions144f;
      default:
        // Padrão para capacidades não previstas
        return {
          strokeColor: '#808080',
          strokeOpacity: 0.8,
          strokeWeight: 4,
          clickable: true,
          visible: true,
          zIndex: 1,
          draggable: false,
          editable: false
        };
    }
  }

  /**
   * 🆕 Retorna o array de polylines correto baseado na capacidade do cabo
   */
  private getPolylinesArrayPorCapacidade(capacidadeStr: string): google.maps.Polyline[] {
    const capacidade = InsertCaboService.converterCapacidadeParaNumero(capacidadeStr);
    
    switch(capacidade) {
      case 1:
        return this.polylines1f;
      case 2:
        return this.polylines2f;
      case 4:
        return this.polylines4f;
      case 6:
        return this.polylines6f;
      case 8:
        return this.polylines8f;
      case 12:
        return this.polylines12f;
      case 24:
        return this.polylines24f;
      case 36:
        return this.polylines36f;
      case 48:
        return this.polylines48f;
      case 72:
        return this.polylines72f;
      case 144:
        return this.polylines144f;
      default:
        // Fallback para polylines1f se capacidade não reconhecida
        console.warn(`⚠️ [CABO] Capacidade ${capacidadeStr} não reconhecida, usando array padrão (1f)`);
        return this.polylines1f;
    }
  }

  /**
   * 🆕 Método auxiliar: Cria o cabo final com os dados de tipagem e ID real da base de dados
   */
  private criarCaboComTipagemEIdMeta(tipagemData: TipagemCabosData, idMeta: number, comprimento: number): void {
    console.log('🗺️ [TIPAGEM] Criando cabo no mapa com ID real:', idMeta);
    
    if (!this.map || this.pontosCaboAguardandoTipagem.length < 2) {
      console.error('🗺️ [TIPAGEM] Erro: Mapa ou pontos não disponíveis');
      return;
    }

    // Fazer cópia dos pontos que foram guardados
    const pontosFinais = this.pontosCaboAguardandoTipagem.map(p => ({
      lat: p.lat(),
      lng: p.lng()
    }));

    console.log('🗺️ [TIPAGEM] Criando polyline final com pontos:', pontosFinais);
    
    // Normalizar capacidade para 'Xf' (modal retorna '12F' - uppercase; resto do código usa '12f')
    const capacidadeNorm = this.normalizarTipoFibra(tipagemData.capacidade);
    // Criar objeto com dados completos do cabo (igual aos outros cabos)
    const caboData = {
      id_meta: idMeta.toString(),
      capacidade: capacidadeNorm,
      tipo: 'CABO_DESENHADO',
      Label_cabo: tipagemData.label,
      fibrasPorTubo: tipagemData.fibrasPorTubo,
      codigoCores: tipagemData.codigoCores,
      comprimento: comprimento,
      GOOGLE_LATLNG: pontosFinais.map(p => `${p.lat},${p.lng}`).join(' ')
    };
    
    // 🎨 Obter opções de polyline baseadas na capacidade
    const polylineOptions = this.getPolylineOptionsPorCapacidade(capacidadeNorm);
    
    // Criar polyline final com as opções corretas da capacidade
    this.caboDesenhado = new google.maps.Polyline({
      ...polylineOptions,  // 🎨 Usar as opções da capacidade
      path: pontosFinais,
      map: this.map,
      geodesic: true,
      clickable: true,
      editable: false // Não editável após finalizar
    });
    
    // 🆕 Criar variável local para capturar no closure (igual aos cabos do banco)
    // Isso garante que cada cabo tenha sua própria referência, mesmo quando this.caboDesenhado é sobrescrito
    const polylineAtual = this.caboDesenhado;
    
    // 🆕 Salvar atributos na polyline (igual aos outros cabos)
    this.caboDesenhado.set('id_meta', idMeta);
    this.caboDesenhado.set('capacidade', capacidadeNorm);
    this.caboDesenhado.set('tipo', 'CABO_DESENHADO');
    this.caboDesenhado.set('label', tipagemData.label);
    this.caboDesenhado.set('fibrasPorTubo', tipagemData.fibrasPorTubo);
    this.caboDesenhado.set('codigoCores', tipagemData.codigoCores);
    this.caboDesenhado.set('comprimento', comprimento);
    this.caboDesenhado.set('cabo_data', caboData); // Dados completos do cabo
    
    // 🆕 Adicionar cabo ao array correto baseado na capacidade
    const arrayPolylines = this.getPolylinesArrayPorCapacidade(capacidadeNorm);
    arrayPolylines.push(this.caboDesenhado);
    console.log(`✅ [TIPAGEM] Cabo adicionado ao array de polylines (${capacidadeNorm})`);
    
    console.log('🗺️ [TIPAGEM] Polyline criada com atributos:', {
      id_meta: idMeta,
      capacidade: capacidadeNorm,
      label: tipagemData.label,
      fibrasPorTubo: tipagemData.fibrasPorTubo,
      codigoCores: tipagemData.codigoCores,
      comprimento: comprimento.toFixed(2) + 'm',
      cor: polylineOptions.strokeColor  // 🎨 Mostrar a cor usada
    });
    
    // 🆕 ADICIONAR LISTENERS IGUAIS AOS CABOS CARREGADOS DO BANCO
    
    // Listener de click simples (para InfoWindow)
    let clickTimeout: ReturnType<typeof setTimeout> | null = null;
    polylineAtual.addListener('click', (event: google.maps.MapMouseEvent) => {
      console.log(`🔵 Clique simples detectado no cabo desenhado:`, idMeta);
      
      // Cancelar timeout anterior se existir
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }
      
      // Definir timeout para clique simples (InfoWindow será mostrado se não houver dblclick)
      clickTimeout = setTimeout(() => {
        console.log(`Clique simples confirmado no cabo desenhado:`, idMeta);
        // InfoWindow pode ser adicionado aqui se necessário
      }, 300);
    });
    
    // Listener de duplo clique (para editar diretamente)
    polylineAtual.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
      console.log(`🔴 CABO DOUBLE-CLICK - Editando cabo desenhado:`, idMeta);
      
      // Cancelar clique simples se estiver pendente
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }
      
      // 🔧 NOVO: Em mobile, abrir context menu em vez de editar
      if (this.isMobile()) {
        console.log('📱 [MOBILE] Double tap no cabo desenhado - abrindo context menu');
        this.contextMenuType = 'cabo';
        this.clickedPolyline = polylineAtual;
        this.clickedCaboData = caboData;
        
        if (event.domEvent) {
          const mouseEvent = event.domEvent as MouseEvent;
          this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
        }
        return;
      }
      
      // Desktop: comportamento padrão (editar cabo)
      // 🛡️ Verificar se já existe uma edição em andamento
      if (this.isEditingCabo || this.isIniciandoEdicao) {
        console.log('⚠️ [EDITAR-CABO] Edição em andamento detectada no dblclick. Finalizando edição anterior...');
        
        // Se o cabo clicado é diferente do que está sendo editado, finalizar edição anterior
        const caboEmEdicaoId = this.clickedPolyline?.get('id_meta');
        const novoCaboId = idMeta;
        
        if (caboEmEdicaoId !== novoCaboId) {
          console.log('🔄 [EDITAR-CABO] Novo cabo clicado durante edição (dblclick). Finalizando edição anterior...');
          
          // Finalizar edição do cabo anterior (salvar automaticamente)
          this.finalizarEdicaoCabo();
          
          // Aguardar um pouco para garantir que a finalização foi processada
          setTimeout(() => {
            // 🛡️ Limpar flag de finalização
            this.isFinalizandoEdicao = false;
            
            // 🆕 Setar dados do novo cabo para edição
            this.clickedPolyline = polylineAtual;
            this.clickedCaboData = caboData;
            
            // 🆕 Chamar editarCabo() para o novo cabo
            this.editarCabo();
          }, 100);
          return;
        } else {
          // Mesmo cabo - apenas continuar edição
          console.log('✅ [EDITAR-CABO] Mesmo cabo clicado durante edição (dblclick) - continuando edição');
          return;
        }
      }
      
      // 🆕 Setar dados do cabo para edição
      this.clickedPolyline = polylineAtual;
      this.clickedCaboData = caboData;
      
      // 🆕 Chamar editarCabo() diretamente
      this.editarCabo();
    });
    
    // Listener de right-click (para menu de contexto)
    polylineAtual.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
      console.log('🔴 RIGHT-CLICK no CABO DESENHADO');
      
      // 🛑 IMPORTANTE: Prevenir menu padrão do navegador PRIMEIRO
      if (event.domEvent) {
        event.domEvent.preventDefault();
        event.domEvent.stopPropagation();
      }
      
      // 🛡️ Verificar se já existe uma edição em andamento
      if (this.isEditingCabo || this.isIniciandoEdicao) {
        console.log('⚠️ [EDITAR-CABO] Edição em andamento detectada. Finalizando edição anterior...');
        
        // Se o cabo clicado é diferente do que está sendo editado, finalizar edição anterior
        const caboEmEdicaoId = this.clickedPolyline?.get('id_meta');
        const novoCaboId = idMeta;
        
        if (caboEmEdicaoId !== novoCaboId) {
          console.log('🔄 [EDITAR-CABO] Novo cabo clicado durante edição. Finalizando edição anterior...');
          
          // 🛡️ CRÍTICO: Prevenir menu ANTES de QUALQUER processamento assíncrono
          if (event.domEvent) {
            const domEvent = event.domEvent as MouseEvent;
            domEvent.preventDefault();
            domEvent.stopPropagation();
            domEvent.stopImmediatePropagation();
            
            // 🆕 BACKUP: Prevenir também no próximo tick (caso o preventDefault não tenha funcionado)
            requestAnimationFrame(() => {
              if (!domEvent.defaultPrevented) {
                domEvent.preventDefault();
                domEvent.stopPropagation();
                domEvent.stopImmediatePropagation();
              }
            });
          }
          
          // Finalizar edição do cabo anterior (salvar automaticamente)
          this.finalizarEdicaoCabo();
          // Aguardar um pouco para garantir que a finalização foi processada
          setTimeout(() => {
            // 🛡️ Limpar flag de finalização imediatamente após processar o novo cabo
            this.isFinalizandoEdicao = false;
            
            this.processarRightClickCabo(event, polylineAtual, caboData);
          }, 100);
          return;
        } else {
          // Mesmo cabo - apenas mostrar menu
          console.log('✅ [EDITAR-CABO] Mesmo cabo clicado durante edição');
        }
      }
      
      if (polylineAtual) {
        this.processarRightClickCabo(event, polylineAtual, caboData);
      }
    });

    // 🔧 NOVO: Adicionar suporte a touch events para mobile (long press = right-click) no cabo desenhado
    polylineAtual.addListener('touchstart', (event: google.maps.MapMouseEvent) => {
        if (event.domEvent) {
          const touchEvent = event.domEvent as TouchEvent;
          if (touchEvent.touches && touchEvent.touches.length > 0) {
            const touch = touchEvent.touches[0];
            this.touchStartTime = Date.now();
            this.touchStartPosition = {
              x: touch.clientX,
              y: touch.clientY
            };
            this.longPressPolyline = polylineAtual;

            // Iniciar timer para long press
            this.longPressTimer = setTimeout(() => {
              // Long press detectado - simular right-click
              console.log('📱 [MOBILE] Long press detectado no cabo desenhado - simulando right-click');
              
              // Criar evento de mouse simulado
              const simulatedEvent = {
                ...event,
                domEvent: {
                  ...event.domEvent,
                  clientX: touch.clientX,
                  clientY: touch.clientY,
                  preventDefault: () => {},
                  stopPropagation: () => {}
                } as any
              } as google.maps.MapMouseEvent;

              // Obter dados do cabo
              const caboDataTemp = {
                id_meta: polylineAtual.get('id_meta'),
                capacidade: polylineAtual.get('capacidade'),
                tipo: polylineAtual.get('tipo'),
                Label_cabo: polylineAtual.get('label') || polylineAtual.get('Label_cabo'),
                GOOGLE_LATLNG: polylineAtual.get('GOOGLE_LATLNG'),
                cabo_data: polylineAtual.get('cabo_data')
              };

              // Chamar o handler de right-click
              this.processarRightClickCabo(simulatedEvent, polylineAtual, caboDataTemp);
            }, this.LONG_PRESS_DURATION);
          }
        }
      });

      polylineAtual.addListener('touchend', (event: google.maps.MapMouseEvent) => {
        // Cancelar long press se o toque terminou antes do tempo
        if (this.longPressTimer && this.longPressPolyline === polylineAtual) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
          this.longPressPolyline = null;
        }
        this.touchStartTime = 0;
        this.touchStartPosition = null;
      });

      polylineAtual.addListener('touchmove', (event: google.maps.MapMouseEvent) => {
        // Cancelar long press se o usuário moveu o dedo
        if (this.longPressTimer && this.longPressPolyline === polylineAtual) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
          this.longPressPolyline = null;
        }
      });
    
    // Limpar pontos aguardando tipagem
    this.pontosCaboAguardandoTipagem = [];
    
    console.log('🗺️ [TIPAGEM] Desenho finalizado com ID real da base de dados. Estado final:', {
      caboDesenhado: this.caboDesenhado,
      id_meta: idMeta,
      map: this.map
    });
  }

  /**
   * 🆕 Handler quando tipagem é confirmada pelo modal
   */
  onCaboTypeConfirmed(tipagemData: TipagemCabosData): void {
    console.log('🗺️ [TIPAGEM] Tipagem confirmada:', tipagemData);
    this.tipagemCabosModalVisible = false;
    
    // Preparar dados para inserção
    const pontosFinais = this.pontosCaboAguardandoTipagem.map(p => ({
      lat: p.lat(),
      lng: p.lng()
    }));

    // 📏 Calcular comprimento usando Google Maps Geometry
    const comprimento = google.maps.geometry.spherical.computeLength(
      this.pontosCaboAguardandoTipagem
    );
    
    console.log('📏 [TIPAGEM] Comprimento da polyline:', comprimento.toFixed(2), 'metros');

    // Converter dados do modal
    const capacidade = InsertCaboService.converterCapacidadeParaNumero(tipagemData.capacidade);
    const tubo = InsertCaboService.converterFibrasPorTuboParaNumero(tipagemData.fibrasPorTubo);
    const codigo = InsertCaboService.determinarCodigo(tipagemData.codigoCores);

    // Preparar dados para inserção
    const caboData = {
      capacidade: capacidade,
      tubo: tubo,
      Codigo: codigo,
      Label_cabo: tipagemData.label,
      length: Math.round(comprimento * 100) / 100, // Arredondar para 2 casas decimais
      GOOGLE_LATLNG: pontosFinais,
      id_condominio: 0 // Fora de condomínio
    };

    console.log('🗺️ [TIPAGEM] Inserindo cabo na base de dados...', caboData);

    // Inserir cabo na base de dados
    this.insertCaboService.inserirCabo(caboData).subscribe({
      next: (response) => {
        console.log('✅ [TIPAGEM] Cabo inserido com sucesso!', response);
        
        // Criar cabo no mapa com o id_meta real
        const idMetaReal = response.id_meta;
        this.criarCaboComTipagemEIdMeta(tipagemData, idMetaReal, comprimento);
        
        // Inserir log de tipagem de cabo com id_meta
        const idUsuario = this.authService.getIdUser();
        const idCity = this.authService.getIdCity();
        if (idUsuario && idCity) {
          console.log('🔄 Inserindo log de tipagem de cabo...');
          this.insertLogService.inserirLog({
            id_usuario: idUsuario,
            id_evento: 3,
            id_city: idCity,
            id_meta_objeto: idMetaReal,
            descricao: `Plotagem de Cabo: ${tipagemData.capacidade}, ${tipagemData.fibrasPorTubo} por tubo, codigo de cores: ${tipagemData.codigoCores}`,
            VERSION: 'Fiberworks WEB 1.0.0'
          }).subscribe({
            next: (logResponse) => {
              console.log('✅ Log de tipagem de cabo inserido com sucesso:', logResponse);
            },
            error: (error) => {
              console.error('❌ Erro ao inserir log de tipagem de cabo:', error);
            }
          });
        }
        
        //20251210 alert(`✅ Cabo inserido com sucesso!\n🆔 ID: ${idMetaReal}\n📏 Comprimento: ${comprimento.toFixed(2)}m\n📊 Capacidade: ${tipagemData.capacidade}\n🏷️ Label: ${tipagemData.label}`);
      },
      error: (error) => {
        console.error('❌ [TIPAGEM] Erro ao inserir cabo:', error);
        alert(`❌ Erro ao inserir cabo na base de dados:\n${error.message}\n\nO cabo não foi criado. Por favor, tente novamente.`);
        
        // Não criar cabo se não houver ID real
        // O usuário precisará tentar novamente
      }
    });
  }

  /**
   * 🧹 Limpa listeners quando o componente é destruído
   */
  ngOnDestroy(): void {
    this.cancelarModoAprovarPostes();
    this.limparMarcadorLogradouroPesquisa();
    this.limparMarcadorViabilidadePesquisa();
    this.limparCirculosViabilidadeCaixas();

    this.cancelarDesenhoPoligono();
    this.tipagemPoligonoModalVisible = false;
    this.pontosPoligonoAguardandoTipagem = [];
    this.poligonosMapaLocais.forEach((p) => p.setMap(null));
    this.poligonosMapaLocais = [];
    this.poligonosLabelMarkersLocais.forEach((m) => m.setMap(null));
    this.poligonosLabelMarkersLocais = [];

    this.destroy$.next();
    this.destroy$.complete();
    // 🛡️ Remover listener de contextmenu do elemento do mapa
    if (this.listenerContextMenuDOM) {
      this.listenerContextMenuDOM();
      this.listenerContextMenuDOM = null;
      console.log('🛡️ [DESTROY] Listener de contextmenu removido do elemento do mapa');
    }
    
    // Limpeza de outros listeners será feita aqui se necessário no futuro
  }

  /**
   * 🆕 Handler quando modal de tipagem é fechado sem confirmar
   */
  fecharTipagemCabosModal(): void {
    console.log('🗺️ [TIPAGEM] Modal fechado sem confirmar');
    this.tipagemCabosModalVisible = false;
    // Limpar pontos se cancelar
    this.pontosCaboAguardandoTipagem = [];
  }

  /**
   * 🗺️ DESENHO CABO: Cancela o desenho atual
   */
  cancelarDesenhoCabo(): void {
    console.log('🗺️ [DESENHO-CABO] Cancelando desenho...');

    // Remover listeners
    if (this.listenerMapaDesenho) {
      google.maps.event.removeListener(this.listenerMapaDesenho);
      this.listenerMapaDesenho = null;
    }

    if (this.listenerRightClickDesenho) {
      google.maps.event.removeListener(this.listenerRightClickDesenho);
      this.listenerRightClickDesenho = null;
    }

    // Remover polyline temporária
    if (this.caboEmDesenho) {
      this.caboEmDesenho.setMap(null);
      this.caboEmDesenho = null;
    }

    // Remover cabo finalizado se existir
    if (this.caboDesenhado) {
      this.caboDesenhado.setMap(null);
      this.caboDesenhado = null;
    }

    // Restaurar cursor
    if (this.map) {
      this.map.setOptions({ 
        draggableCursor: null,
        clickableIcons: true 
      });
    }

    this.isDesenhandoCabo = false;
    this.pontosCaboEmDesenho = [];

    // 311025 alert('❌ Desenho cancelado');
  }

  /***********************************************************************************************************
   * 🔷 DESENHO POLÍGONO
   **********************************************************************************************************/
  startDesenhoPoligono(): void {
    console.log('🔷 [DESENHO-POLIGONO] Iniciando modo...');

    this.desativarModoEdicaoPoligonoCompleto();
    this.cancelarDesenhoCabo();
    if (this.modoMedicao) {
      this.desativarModoMedicao();
    }

    if (this.isDesenhandoPoligono) {
      this.cancelarDesenhoPoligono();
    }

    this.isDesenhandoPoligono = true;
    this.pontosPoligonoEmDesenho = [];
    this.removerPreviewPoligonoEmDesenho();

    if (!this.map) {
      console.error('🔷 [DESENHO-POLIGONO] Mapa não inicializado');
      this.isDesenhandoPoligono = false;
      return;
    }

    this.map.setOptions({
      draggableCursor: 'crosshair',
      clickableIcons: false,
    });

    this.listenerMapaDesenhoPoligono = this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      this.addPontoPoligonoEmDesenho(event);
    });

    this.listenerRightClickDesenhoPoligono = this.map.addListener('rightclick', () => {
      this.cancelarDesenhoPoligono();
    });
  }

  private removerPreviewPoligonoEmDesenho(): void {
    if (this.poligonoPreviewPolyline) {
      this.poligonoPreviewPolyline.setMap(null);
      this.poligonoPreviewPolyline = null;
    }
    if (this.poligonoPreviewPolygon) {
      this.poligonoPreviewPolygon.setMap(null);
      this.poligonoPreviewPolygon = null;
    }
  }

  private addPontoPoligonoEmDesenho(event: google.maps.MapMouseEvent): void {
    if (!this.isDesenhandoPoligono || !event.latLng || !this.map) {
      return;
    }

    this.pontosPoligonoEmDesenho.push(event.latLng);
    this.removerPreviewPoligonoEmDesenho();

    /*Pontos (n) 1  Só apaga e não desenha nada (return em n < 2)
   2 Desenha uma linha (Polyline), não polígono
   3 ou mais Desenha um polígono (Polygon)*/

    const n = this.pontosPoligonoEmDesenho.length;
    if (n < 2) {
      return;
    }

    if (n === 2) {
      this.poligonoPreviewPolyline = new google.maps.Polyline({
        path: this.pontosPoligonoEmDesenho,
        map: this.map,
        strokeColor: '#808080',
        strokeWeight: 3,
        strokeOpacity: 0.85,
        zIndex: 1000,
        clickable: false,
        geodesic: true,
      });
      return;
    }

    const pathLiterais = this.pontosPoligonoEmDesenho.map((p) => ({ lat: p.lat(), lng: p.lng() }));
    this.poligonoPreviewPolygon = new google.maps.Polygon({
      paths: pathLiterais,
      map: this.map,
      strokeColor: '#808080',
      strokeWeight: 2,
      strokeOpacity: 0.9,
      fillColor: '#94a3b8',
      fillOpacity: 0.25,
      clickable: false,
      zIndex: 999,
    });
  }

  finalizarDesenhoPoligono(): void {
    console.log('🔷 [DESENHO-POLIGONO] Finalizando...');

    if (!this.isDesenhandoPoligono || this.pontosPoligonoEmDesenho.length < 3) {
      alert('❌ Desenhe pelo menos 3 pontos antes de finalizar o polígono!');
      return;
    }

    if (this.listenerMapaDesenhoPoligono) {
      google.maps.event.removeListener(this.listenerMapaDesenhoPoligono);
      this.listenerMapaDesenhoPoligono = null;
    }
    if (this.listenerRightClickDesenhoPoligono) {
      google.maps.event.removeListener(this.listenerRightClickDesenhoPoligono);
      this.listenerRightClickDesenhoPoligono = null;
    }

    this.removerPreviewPoligonoEmDesenho();

    this.pontosPoligonoAguardandoTipagem = [...this.pontosPoligonoEmDesenho]; // faz copia do array de pontos do polígono em desenho
    this.isDesenhandoPoligono = false; // desliga o modo de desenho de polígono
    this.pontosPoligonoEmDesenho = []; // limpa o array de pontos do polígono em desenho

    this.tipagemPoligonoModalVisible = true; // abre o modal de tipagem de polígono

    if (this.map) {
      this.map.setOptions({ // restaura o cursor do mapa
        draggableCursor: null,
        clickableIcons: true,
      });
    }
  }

  onPoligonoTipagemConfirmada(data: TipagemPoligonoData): void {
    console.log('🔷 [TIPAGEM-POLIGONO] Confirmado:', data);
    this.tipagemPoligonoModalVisible = false;

    if (!this.map || this.pontosPoligonoAguardandoTipagem.length < 3) {
      this.pontosPoligonoAguardandoTipagem = [];
      return;
    }

    const idCity = this.authService.getIdCity();
    if (idCity === null || idCity <= 0) {
      alert('Selecione uma cidade antes de gravar o polígono.');
      this.tipagemPoligonoModalVisible = true;
      return;
    }

    const paths: google.maps.LatLngLiteral[] = this.pontosPoligonoAguardandoTipagem.map((p) => ({
      lat: p.lat(),
      lng: p.lng(),
    }));

    const tipoParaEstilo = data.tipoCor === 'cinza' ? '' : data.tipoCor;
    /** Tipo textual persistido na API (coresPoligonoPorTipo espera estes valores / cinza como string). */
    const tipoPersistido =
      tipoParaEstilo === '' ? 'cinza' : data.tipoCor;

    const lab = data.label.trim();
    const labelPersistido = lab || '(_)';

    const payload: InserirPoligonoPayload = {
      id_city: idCity,
      Label: labelPersistido,
      tipo: tipoPersistido,
      GOOGLE_LATLNG: paths,
    };

    this.poligonosService.inserirPoligono(payload).subscribe({
      next: (resp) => {
        const idMetaResp = resp.id_meta ?? resp.idmeta_poligono;
        console.log('✅ [TIPAGEM-POLIGONO] Inserção na API concluída:', resp);

        const estilo = this.coresPoligonoPorTipo(tipoParaEstilo);
        const poly = new google.maps.Polygon({
          paths,
          map: this.map!,
          strokeWeight: 2,
          clickable: false,
          ...estilo,
        });
        poly.set('tipoPoligono', tipoParaEstilo || 'cinza');
        poly.set('desenhoLocal', true);
        if (idMetaResp != null && Number.isFinite(Number(idMetaResp))) {
          poly.set('id_meta', Number(idMetaResp));
        }

        this.poligonosMapaLocais.push(poly);

        if (lab) {
          poly.set('labelPoligono', lab);
          const pos = this.centroPoligonoPontos(paths);
          const labelMarker = new google.maps.Marker({
            position: pos,
            map: this.map,
            clickable: false,
            zIndex: google.maps.Marker.MAX_ZINDEX + 1,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillOpacity: 0,
              strokeOpacity: 0,
              scale: 1,
            },
            label: {
              text: lab,
              color: 'rgba(15, 23, 42, 0.72)',
              fontSize: '22px',
              fontWeight: 'bold',
            },
          });
          poly.set('labelMarker', labelMarker);
          this.poligonosLabelMarkersLocais.push(labelMarker);
        }

        this.pontosPoligonoAguardandoTipagem = [];
        this.updateVisiblePoligonos();// inserido na implementação visualização de camadas
        if (this.modoEdicaoPoligonoArmado) {
          this.reinstalarDuploCliquePoligonosModoArmado();
        }
      },
      error: (msg: string) => {
        console.error('❌ [TIPAGEM-POLIGONO] Falha ao inserir:', msg);
        alert(`❌ Não foi possível gravar o polígono:\n${msg}`);
        this.tipagemPoligonoModalVisible = true;
      },
    });
  }

  fecharTipagemPoligonoModal(): void {
    console.log('🔷 [TIPAGEM-POLIGONO] Modal fechado sem confirmar');
    this.tipagemPoligonoModalVisible = false;
    this.pontosPoligonoAguardandoTipagem = [];
  }

  cancelarDesenhoPoligono(): void {
    console.log('🔷 [DESENHO-POLIGONO] Cancelando...');

    if (this.listenerMapaDesenhoPoligono) {
      google.maps.event.removeListener(this.listenerMapaDesenhoPoligono);
      this.listenerMapaDesenhoPoligono = null;
    }
    if (this.listenerRightClickDesenhoPoligono) {
      google.maps.event.removeListener(this.listenerRightClickDesenhoPoligono);
      this.listenerRightClickDesenhoPoligono = null;
    }

    this.removerPreviewPoligonoEmDesenho();

    if (this.map) {
      this.map.setOptions({
        draggableCursor: null,
        clickableIcons: true,
      });
    }

    this.isDesenhandoPoligono = false;
    this.pontosPoligonoEmDesenho = [];
  }

  // ============================================================================
  // 📏 SEÇÃO: MÉTODOS PARA MEDIÇÃO DE DISTÂNCIA (RÉGUA)
  // ============================================================================

  /**
   * 📏 Ativa o modo de medição de distância
   */
  ativarModoMedicao(): void {
    console.log('📏 [MEDICAO] Ativando modo de medição...');

    this.desativarModoEdicaoPoligonoCompleto();

    // Se já estiver em modo de medição, apenas retorna
    if (this.modoMedicao) {
      console.log('📏 [MEDICAO] Modo de medição já está ativo');
      return;
    }

    // Cancelar outros modos se estiverem ativos
    if (this.isDesenhandoCabo) {
      this.cancelarDesenhoCabo();
    }
    this.cancelarDesenhoPoligono();

    this.modoMedicao = true;
    this.pontosMedicao = [];
    this.linhaMedicao = null;

    if (!this.map) {
      console.error('📏 [MEDICAO] Mapa não está inicializado');
      this.modoMedicao = false;
      return;
    }

    // Mudar cursor do mapa
    this.map.setOptions({
      draggableCursor: 'crosshair',
      clickableIcons: false
    });

    // Adicionar listener de clique no mapa para medição
    this.listenerMapaMedicao = this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      this.adicionarPontoMedicao(event);
    });

    // Adicionar listener de tecla ESC para desativar
    this.setupMedicaoEscListener();

    console.log('📏 [MEDICAO] Modo de medição ativado. Clique no mapa para adicionar pontos.');
  }

  /**
   * 📏 Desativa o modo de medição e limpa tudo
   */
  desativarModoMedicao(): void {
    console.log('📏 [MEDICAO] Desativando modo de medição...');

    // Remover listener de clique
    if (this.listenerMapaMedicao) {
      google.maps.event.removeListener(this.listenerMapaMedicao);
      this.listenerMapaMedicao = null;
    }

    // Remover listener ESC
    if (this.listenerEscMedicao) {
      document.removeEventListener('keydown', this.listenerEscMedicao);
      this.listenerEscMedicao = null;
    }

    // Remover linha de medição
    if (this.linhaMedicao) {
      this.linhaMedicao.setMap(null);
      this.linhaMedicao = null;
    }

    // Remover todos os marcadores de vértices
    this.marcadoresMedicao.forEach(marker => marker.setMap(null));
    this.marcadoresMedicao = [];

    // Remover todos os labels de distância
    this.labelsMedicao.forEach(label => label.setMap(null));
    this.labelsMedicao = [];

    // Limpar pontos
    this.pontosMedicao = [];

    // Restaurar cursor
    if (this.map) {
      this.map.setOptions({
        draggableCursor: null,
        clickableIcons: true
      });
    }

    this.modoMedicao = false;
    console.log('📏 [MEDICAO] Modo de medição desativado');
  }

  /**
   * 📏 Adiciona um ponto à medição
   */
  private adicionarPontoMedicao(event: google.maps.MapMouseEvent): void {
    if (!this.modoMedicao || !event.latLng) {
      return;
    }

    console.log('📏 [MEDICAO] Adicionando ponto:', event.latLng.lat(), event.latLng.lng());
    this.pontosMedicao.push(event.latLng);

    // Criar marcador de vértice
    const marcador = new google.maps.Marker({
      position: event.latLng,
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: '#0891b2',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      zIndex: 1001
    });
    this.marcadoresMedicao.push(marcador);

    // Atualizar ou criar a linha de medição
    this.atualizarLinhaMedicao();

    // Se tiver mais de um ponto, calcular e exibir distância do segmento
    if (this.pontosMedicao.length > 1) {
      this.adicionarLabelDistancia();
    }
  }

  /**
   * 📏 Atualiza a linha de medição no mapa
   */
  private atualizarLinhaMedicao(): void {
    // Remover linha anterior se existir
    if (this.linhaMedicao) {
      this.linhaMedicao.setMap(null);
    }

    if (this.pontosMedicao.length < 2) {
      return;
    }

    // Criar nova linha
    this.linhaMedicao = new google.maps.Polyline({
      path: this.pontosMedicao,
      map: this.map,
      strokeColor: '#0891b2',
      strokeWeight: 3,
      strokeOpacity: 1,
      zIndex: 1000,
      clickable: false,
      geodesic: true,
      icons: [{
        icon: {
          path: 'M 0,-1 0,1',
          strokeOpacity: 1,
          scale: 3
        },
        offset: '0',
        repeat: '15px'
      }]
    });
  }

  /**
   * 📏 Adiciona label com distância do último segmento e total acumulado
   */
  private adicionarLabelDistancia(): void {
    const totalPontos = this.pontosMedicao.length;
    if (totalPontos < 2) return;

    const pontoA = this.pontosMedicao[totalPontos - 2];
    const pontoB = this.pontosMedicao[totalPontos - 1];

    // Calcular distância do segmento
    const distanciaSegmento = google.maps.geometry.spherical.computeDistanceBetween(pontoA, pontoB);

    // Calcular distância total acumulada
    const distanciaTotal = google.maps.geometry.spherical.computeLength(this.pontosMedicao);

    // Calcular ponto médio do segmento para posicionar o label
    const pontoMedio = new google.maps.LatLng(
      (pontoA.lat() + pontoB.lat()) / 2,
      (pontoA.lng() + pontoB.lng()) / 2
    );

    // Formatar distâncias
    const textoSegmento = this.formatarDistancia(distanciaSegmento);
    const textoTotal = this.formatarDistancia(distanciaTotal);

    // Montar texto do label: "segmento (total)"
    const textoLabel = `${textoSegmento} (${textoTotal})`;

    // Criar label como um Marker com ícone customizado (usando label)
    const labelMarker = new google.maps.Marker({
      position: pontoMedio,
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 0 // Invisível
      },
      label: {
        text: textoLabel,
        color: '#000000',
        fontSize: '12px',
        fontWeight: 'bold',
        className: 'label-medicao'
      },
      zIndex: 1002
    });
    this.labelsMedicao.push(labelMarker);

    console.log(`📏 [MEDICAO] Segmento: ${textoSegmento}, Total: ${textoTotal}`);
  }

  /**
   * 📏 Formata distância em metros
   */
  private formatarDistancia(metros: number): string {
    if (metros < 1000) {
      return `${Math.round(metros)}m`;
    } else {
      return `${(metros / 1000).toFixed(2)}km`;
    }
  }

  // ============================================================================
  // 🔷 Edição de polígonos: armar modo na toolbar → duplo clique (comportamento tipo cabo)
  // ============================================================================

  private aplicarEstiloTipoPoligono(poly: google.maps.Polygon): void {
    const tipoRaw = poly.get('tipoPoligono') ?? poly.get('tipo');
    const tipoStr = tipoRaw != null && String(tipoRaw) !== '' ? String(tipoRaw) : undefined;
    const estilo = this.coresPoligonoPorTipo(tipoStr);
    poly.setOptions({
      strokeWeight: 2,
      ...estilo,
    });
  }

  private primeiroAnelParaLiterais(poly: google.maps.Polygon): google.maps.LatLngLiteral[] {
    const path = poly.getPath();
    const out: google.maps.LatLngLiteral[] = [];
    const n = path.getLength();
    for (let i = 0; i < n; i++) {
      const p = path.getAt(i);
      out.push({ lat: p.lat(), lng: p.lng() });
    }
    return out;
  }

  /** Move o marcador de rótulo para a média dos vértices do primeiro anel (em tempo real ao editar). */
  private atualizarMarcadorRotuloCentroPoligono(poly: google.maps.Polygon): void {
    const marker = poly.get('labelMarker') as google.maps.Marker | undefined | null;
    if (!marker) {
      return;
    }
    const lit = this.primeiroAnelParaLiterais(poly);
    if (lit.length === 0) {
      return;
    }
    marker.setPosition(this.centroPoligonoPontos(lit));
    this.updateVisiblePoligonos(); //
  }

  private removerHandlesPathPoligonoEmEdicao(): void {
    for (const h of this.poligonoEmEdicaoPathHandles) {
      google.maps.event.removeListener(h);
    }
    this.poligonoEmEdicaoPathHandles = [];
  }

  /** Encerra apenas o modo “vértices vermelhos” do polígono atual (modo toolbar pode permanecer armado). */
  private sairVisualEdicaoPoligonoAtual(): void {
    this.removerHandlesPathPoligonoEmEdicao();
    const poly = this.poligonoEmEdicao;
    if (!poly) {
      return;
    }
    this.aplicarEstiloTipoPoligono(poly);
    poly.setOptions({
      editable: false,
      draggable: false,
      strokeWeight: 2,
    });
    this.poligonoEmEdicao = null;
  }

  private removerListenersDuploCliqueModoPoligono(): void {
    for (const h of this.poligonosEdicaoDuploListeners) {
      google.maps.event.removeListener(h);
    }
    this.poligonosEdicaoDuploListeners = [];
    for (const h of this.poligonosEdicaoRightClickListeners) {
      google.maps.event.removeListener(h);
    }
    this.poligonosEdicaoRightClickListeners = [];
  }

  /** Context menu de polígono (botão direito) — só com modo de edição armado. */
  private processarRightClickPoligono(
    poly: google.maps.Polygon,
    event: google.maps.MapMouseEvent
  ): void {
    if (!this.modoEdicaoPoligonoArmado) {
      return;
    }

    if (event.domEvent) {
      event.domEvent.preventDefault();
      event.domEvent.stopPropagation();
    }
    event.stop?.();

    this.clickedPoligono = poly;
    this.contextMenuType = 'poligono';

    if (event.domEvent) {
      const mouseEvent = event.domEvent as MouseEvent;
      this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
    }
  }

  /** Polígonos clicáveis no modo armado (duplo clique + botão direito). */
  private reinstalarDuploCliquePoligonosModoArmado(): void {
    this.removerListenersDuploCliqueModoPoligono();
    if (!this.map || !this.modoEdicaoPoligonoArmado) {
      return;
    }
    const todos = [...this.poligonosMapa, ...this.poligonosMapaLocais];
    for (const poly of todos) {
      poly.setOptions({ clickable: true });
      const hDbl = poly.addListener('dblclick', (ev: google.maps.MapMouseEvent) => {
        this.onDuploClickPoligonoModoArmado(poly, ev);
      });
      this.poligonosEdicaoDuploListeners.push(hDbl);
      const hRight = poly.addListener('rightclick', (ev: google.maps.MapMouseEvent) => {
        this.processarRightClickPoligono(poly, ev);
      });
      this.poligonosEdicaoRightClickListeners.push(hRight);
    }
  }

  private onDuploClickPoligonoModoArmado(poly: google.maps.Polygon, ev: google.maps.MapMouseEvent): void {
    if (!this.modoEdicaoPoligonoArmado) {
      return;
    }

    // Cabo já bloqueado ao armar modo; igual cabo desktop: segundo duplo no mesmo objeto não faz nada
    if (this.poligonoEmEdicao === poly) {
      return;
    }

    if (ev.domEvent) {
      const d = ev.domEvent as MouseEvent;
      d.stopPropagation?.();
      d.preventDefault?.();
    }

    if (this.poligonoEmEdicao) {
      this.sairVisualEdicaoPoligonoAtual();
    }

    this.poligonoEmEdicao = poly;
    poly.setOptions({
      editable: true,
      draggable: false,
      clickable: true,
      strokeColor: '#FF0000',
      strokeWeight: 5,
      strokeOpacity: 1.0,
    });

    const path = poly.getPath();
    const atualizarMarcador = () => this.atualizarMarcadorRotuloCentroPoligono(poly);
    this.poligonoEmEdicaoPathHandles.push(
      google.maps.event.addListener(path, 'set_at', atualizarMarcador),
      google.maps.event.addListener(path, 'insert_at', atualizarMarcador),
      google.maps.event.addListener(path, 'remove_at', atualizarMarcador),
    );

    atualizarMarcador();
    this.reinstalarDuploCliquePoligonosModoArmado();
    console.log('🔷 [EDITAR-POLIGONO] Edição de vértices iniciada');
  }

  private registrarEscModoEdicaoPoligono(): void {
    this.teardownEscModoEdicaoPoligono();
    this.listenerEscModoPoligono = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.modoEdicaoPoligonoArmado) {
        console.log('🔷 [EDITAR-POLIGONO] ESC — modo de edição de polígonos desativado');
        this.desativarModoEdicaoPoligonoCompleto({
          salvarGeometriaSePoligonoEmEdicao: false,
        });
      }
    };
    document.addEventListener('keydown', this.listenerEscModoPoligono);
  }

  private teardownEscModoEdicaoPoligono(): void {
    if (this.listenerEscModoPoligono) {
      document.removeEventListener('keydown', this.listenerEscModoPoligono);
      this.listenerEscModoPoligono = null;
    }
  }

  /** Chamado quando o usuário arma o modo na toolbar ou via `window` (após já ter alternado estado no botão). */
  private ativarModoEdicaoPoligonoDoToolbar(): void {
    if (this.isEditingCabo || this.isIniciandoEdicao) {
      alert(
        'Finalize ou cancele a edição do cabo antes de usar o modo de edição de polígonos.',
      );
      window.dispatchEvent(new CustomEvent('edicaoPoligonoDesativada'));
      return;
    }

    if (this.isDesenhandoCabo) {
      this.cancelarDesenhoCabo();
    }
    if (this.isDesenhandoPoligono) {
      this.cancelarDesenhoPoligono();
    }

    if (this.modoMedicao) {
      this.desativarModoMedicao();
      window.dispatchEvent(new CustomEvent('medicaoDesativada'));
    }

    if (this.modoEdicaoPoligonoArmado) {
      return;
    }

    this.modoEdicaoPoligonoArmado = true;
    this.registrarEscModoEdicaoPoligono();
    this.reinstalarDuploCliquePoligonosModoArmado();
    console.log('🔷 [EDITAR-POLIGONO] Modo armado: dê duplo clique num polígono para editar vértices.');
  }

  /**
   * Monta o corpo POST para `update_geopoligono` a partir do polígono no mapa.
   * Retorna null se não houver id_meta persistido (polígono só em memória / inválido para update).
   */
  private montarPayloadAtualizarGeometriaPoligono(
    poly: google.maps.Polygon
  ): AtualizarGeometriaPoligonoPayload | null {
    const idRaw = poly.get('id_meta');
    const idMetaNum = typeof idRaw === 'string' ? parseInt(idRaw, 10) : Number(idRaw);
    if (!Number.isFinite(idMetaNum) || !Number.isInteger(idMetaNum) || idMetaNum <= 0) {
      return null;
    }
    const coords = this.primeiroAnelParaLiterais(poly);
    if (coords.length < 3) {
      return null;
    }
    const lb = poly.get('labelPoligono');
    const Label =
      lb != null && String(lb).trim() !== '' ? String(lb).trim() : '(_)';
    return { id_meta: idMetaNum, Label, GOOGLE_LATLNG: coords };
  }

  /** Desativa o modo da toolbar e o estado visual do polígono em edição. */
  desativarModoEdicaoPoligonoCompleto(opcoes?: {
    salvarGeometriaSePoligonoEmEdicao?: boolean;
  }): void {
    const salvarGeo = opcoes?.salvarGeometriaSePoligonoEmEdicao === true;

    const estavaArmado = this.modoEdicaoPoligonoArmado;
    if (!estavaArmado && !this.poligonoEmEdicao && this.poligonosEdicaoDuploListeners.length === 0) {
      return;
    }

    let payloadPersistencia: AtualizarGeometriaPoligonoPayload | null = null;
    if (salvarGeo && this.poligonoEmEdicao) {
      payloadPersistencia = this.montarPayloadAtualizarGeometriaPoligono(
        this.poligonoEmEdicao
      );
      if (!payloadPersistencia) {
        console.warn(
          '[EDITAR-POLIGONO] Geometria não gravada: id_meta ausente ou inválido neste polígono.'
        );
        alert(
          'Não foi possível gravar o polígono editado porque não há id_meta válido (ainda não persistido?).'
        );
      }
    }

    this.teardownEscModoEdicaoPoligono();
    this.sairVisualEdicaoPoligonoAtual();
    this.removerListenersDuploCliqueModoPoligono();

    for (const p of [...this.poligonosMapa, ...this.poligonosMapaLocais]) {
      if (this.map && p && p.getMap()) {
        p.setOptions({
          clickable: false,
          editable: false,
          draggable: false,
        });
        this.aplicarEstiloTipoPoligono(p);
        p.setOptions({ strokeWeight: 2 });
      }
    }

    this.modoEdicaoPoligonoArmado = false;

    if (estavaArmado) {
      window.dispatchEvent(new CustomEvent('edicaoPoligonoDesativada'));
    }

    if (payloadPersistencia) {
      this.updatePoligonoService
        .atualizarGeometria(payloadPersistencia)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (resp) => {
            console.log(
              '✅ [EDITAR-POLIGONO] Geometria atualizada na API, id_meta:',
              resp?.id_meta
            );
          },
          error: (msg: string) => {
            alert(`Erro ao gravar geometria do polígono na base de dados:\n${msg}`);
          },
        });
    }
  }

  /**
   * 📏 Configura listener de tecla ESC para desativar medição
   */
  private listenerEscMedicao: ((e: KeyboardEvent) => void) | null = null;

  private setupMedicaoEscListener(): void {
    this.listenerEscMedicao = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.modoMedicao) {
        console.log('📏 [MEDICAO] ESC pressionado - desativando medição');
        this.desativarModoMedicao();
        
        // Disparar evento para atualizar botão na toolbar
        const event = new CustomEvent('medicaoDesativada');
        window.dispatchEvent(event);
      }
    };
    document.addEventListener('keydown', this.listenerEscMedicao);
  }

}