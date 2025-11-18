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

//import { CaixaInternaComponent } from '../caixa-interna/caixa-interna.component';
import { ChangeDetectorRef } from '@angular/core'; /// ============novo
import { GoJSDemoComponent } from '../gojs-demo/gojs-demo.component';
import { AuthService } from '../servico/auth.service';
import { animate, animation } from '@angular/animations';

import { MapSearchButtonsComponent } from '../map-search-buttons/map-search-buttons.component';
import { MapTracerButtonsComponent } from '../map-tracer-buttons/map-tracer-buttons.component';
import { MapContextMenuComponent } from '../map-context-menu/map-context-menu.component';
import { TipagemCabosModalComponent, TipagemCabosData } from '../tipagem-cabos-modal/tipagem-cabos-modal.component';
import { CompartilhamentoService, CaixaData, ClienteData } from '../servico/compartilhamento.service';
import { KmlExportService } from '../servico/kml-export.service';
import { InsertCaboService } from '../servico/insert-cabo.service';
import { UpdateCaboService } from '../servico/update-cabo.service';
import { Subject, takeUntil } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { PopInfoModalComponent } from '../pop-info-modal/pop-info-modal.component';
import { VisualizaDioComponent } from '../visualiza-dio/visualiza-dio.component';
import { VisualizaCaboComponent } from '../visualiza-cabo/visualiza-cabo.component';
import { GraphvizModalComponent } from '../graphviz-modal/graphviz-modal.component';
import { ConexaoCaboCaixaEmendaComponent, ConexaoCaboCaixaEmendaData } from '../conexao-cabo-caixa-emenda/conexao-cabo-caixa-emenda.component';

//import { Cto_SP } from '../modelo/Cto_SP';
//import { GoogleInfoWindowComponent } from '../google-infowindow/google-infowindow.component';

/**
 * ============================================================================
 * ÍNDICE DE SEÇÕES DO COMPONENTE GOOGLE MAPS
 * ============================================================================
 * 
 * PROPRIEDADES:
 * - Linha ~59:  @Input() - Dados de entrada (destinos, cabos, caixas, etc)
 * - Linha ~95:  Propriedades do Mapa (center, zoom, title, etc)
 * - Linha ~109: Marcadores (markerCaixas, markerCtos, markerPopsCli, etc)
 * - Linha ~142: Paths de Polylines (polylinePaths1f, polylinePaths2f, etc)
 * - Linha ~159: Polylines (polylines1f, polylines2f, etc)
 * - Linha ~171: InfoWindows (infoWindows1f, infoWindows2f, etc)
 * - Linha ~184: Controle de Destaque de Cabos
 * - Linha ~188: Context Menu
 * - Linha ~192: EDIÇÃO DE CABOS (clickedPolyline, isEditingCabo, pontasOriginais, etc)
 * - Linha ~214: DESENHO DE CABOS (isDesenhandoCabo, caboEmDesenho, etc)
 * - Linha ~222: Modal de Tipagem
 * 
 * MÉTODOS:
 * - Linha ~226: CONTEXT MENU
 *   - setupContextMenuListener()
 *   - showContextMenu()
 *   - hideContextMenu()
 *   - onContextMenuAction()
 * 
 * - Linha ~354: AÇÕES DO CONTEXT MENU (criarCaixa, criarDIO, etc)
 * 
 * - Linha ~390: EDIÇÃO DE CABOS
 *   - editarCabo()
 *   - verificarConexoesPontas()
 *   - iniciarEdicaoCabo()
 *   - finalizarEdicaoCabo()
 *   - cancelarEdicaoCabo()
 *   - adicionarListenerProtecaoPontas()
 *   - adicionarListenerRemoverVertice()
 * 
 * - Linha ~977: DETECÇÃO DE CONEXÃO CABO-CAIXA
 *   - verificarConexaoPontasComCaixas()
 *   - abrirModalConexao()
 *   - encontrarCaixaProxima()
 * 
 * - Linha ~1085: GESTÃO DE EVENTOS DE CABOS
 *   - processarRightClickCabo()
 *   - recriarListenerRightClick()
 *   - recriarListenerRightClickMapa()
 * 
 * - Linha ~1362: AÇÕES DE CABOS (liberarCabo, excluirCabo)
 * 
 * - Linha ~1386: DESTAQUE DE CABOS
 *   - setupCabosHighlightListeners()
 *   - highlightCabos()
 *   - highlightCabosInArray()
 *   - clearCabosHighlight()
 * 
 * - Linha ~2237: GESTÃO DE MARCADORES
 *   - updateMarkers()
 *   - updateMarkersCTO()
 *   - updateMarkersCTOSP()
 *   - updateMarkersDios()
 *   - updateMarkersCondominios()
 *   - updateMarkersPopsCli()
 *   - etc...
 * 
 * - Linha ~2861: GESTÃO DE POLYLINES
 *   - updatePolylinesCabos1f()
 *   - updatePolylinesCabos2f()
 *   - etc...
 * 
 * - Linha ~4186: CRIAÇÃO DE POLYLINES
 *   - createCaboPolylines()
 *   - createCabo1fPolylines()
 *   - etc...
 * 
 * - Linha ~4810: CRIAÇÃO DE CABOS
 *   - criarCaboComTipagem()
 *   - criarCaboComTipagemEIdMeta()
 * 
 * ============================================================================
 */

@Component({
  selector: 'app-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.css'],
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, MapSearchButtonsComponent, MapTracerButtonsComponent, MapContextMenuComponent, TipagemCabosModalComponent, MatIconModule, MatButtonModule],
})
export class GoogleMapsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  
  // ============================================================================
  // 📥 SEÇÃO: INPUTS - Dados de entrada do componente
  // ============================================================================
  @Input() destinoCondominios: Condominios[]=[];
  @Input() destinoDios: Dios[] = [];
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
  mapOptions: google.maps.MapOptions = {
    mapId : "My Project Angular",
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
  markerDios: google.maps.Marker[] = [];
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
  originalPolylineOptions: Map<google.maps.Polyline, google.maps.PolylineOptions> = new Map();

  // 🎯 Propriedades para context menu
  contextMenuVisible = false;
  contextMenuPosition = { x: 0, y: 0 };
  contextMenuType: 'caixa' |'map' | 'cabo' = 'map'; // 🆕 Tipo de contexto do menu
  private contextMenuListenerAdded = false; // Flag para evitar listeners duplicados
  private clickedCaboData: any = null; // 🆕 Armazena dados do cabo clicado
  private clickedCaixaData: any = null; // 🆕 Armazena dados da caixa clicada
  private clickedCTOData: any = null; // 🆕 Armazena dados da CTO clicada
  private clickedCTOSPData: any = null; // 🆕 Armazena dados da CTO_SP clicada
  private clickedPolyline: google.maps.Polyline | null = null; // 🆕 Armazena a polyline clicada
  // 🔧 Propriedades para edição de caixa/CTO/CTO_SP
  private caixaEmEdicao: google.maps.Marker | null = null; // Marcador em edição (caixa, CTO ou CTO_SP)
  private caixaEmEdicaoIndex: number | null = null; // Índice do item em edição
  private caixaEmEdicaoTipo: 'caixa' | 'cto' | 'ctosp' | null = null; // Tipo do item em edição
  private caixaEmEdicaoOriginalPosition: { lat: number, lng: number } | null = null; // Posição original para cancelar
  private caixaEmEdicaoOriginalIcon: google.maps.Icon | null = null; // Ícone original para restaurar
  private listenerMapaSalvarCaixa: google.maps.MapsEventListener | null = null; // Listener para salvar ao clicar no mapa
  private listenerEscCancelarCaixa: any = null; // Listener para cancelar com ESC
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
  
  // 🆕 Propriedades para modal de tipagem
  tipagemCabosModalVisible = false;
  pontosCaboAguardandoTipagem: google.maps.LatLng[] = []; // Guarda pontos enquanto modal está aberto

  // ============================================================================
  // 🏗️ CONSTRUCTOR
  // ============================================================================
  constructor(
    private cdr: ChangeDetectorRef,
    private authService : AuthService,
    private compartilhamentoService: CompartilhamentoService,
    private kmlExportService: KmlExportService,
    private insertCaboService: InsertCaboService,
    private updateCaboService: UpdateCaboService,
    private dialog: MatDialog
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
              console.log('📱 [MOBILE] Long press no mapa - simulando right-click');
              
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
                    console.log('⚠️ [EDITAR-CABO] Context menu do mapa detectado durante edição. Cancelando edição...');
                    this.cancelarEdicaoCabo();
                    return;
                  }
                  
                  // Chamar handler de right-click do mapa
                  this.contextMenuType = 'map';
                  this.showContextMenu(touch.clientX, touch.clientY);
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
    this.contextMenuType = 'map'; // 🔄 Reseta para tipo 'map'
    
    // 🆕 Não limpar se estiver em modo de edição ou iniciando edição (deixar editar)
    if (!this.isEditingCabo && !this.isIniciandoEdicao) {
      this.clickedCaboData = null;
      this.clickedPolyline = null; // 🔄 Reseta a polyline clicada
      this.clickedCaixaData = null;
      this.clickedCTOData = null; // 🔧 NOVO: Limpar dados de CTO
      this.clickedCTOSPData = null; // 🔧 NOVO: Limpar dados de CTO_SP
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
      case 'cria-dio':
        this.criarDIO();
        break;
      case 'cria-cliente':
        this.criarCliente();
        break;
      case 'cria-estacao':
        this.criarEstacao();
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
      // 🆕 Ações para CABOS
      case 'visualizar-cabo':
        this.visualizarCabo();
        break;
      case 'liberar-cabo':
        this.liberarCabo();
        break;
      case 'excluir-cabo':
        this.excluirCabo();
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
        case 'editar-caixa':
      //this.editarCaixa();
        break;
        case 'excluir-caixa':
      //this.excluirCaixa();
        break;




      default:
        console.warn('🗺️ [CONTEXT-MENU] Ação não reconhecida:', action);
    }
  }

  // Métodos placeholder para as ações do context menu
  private criarCaixa(): void {
    console.log('🗺️ [CONTEXT-MENU] Criando caixa...');
    alert('Funcionalidade de criar caixa será implementada em breve!');
  }

  private criarDIO(): void {
    console.log('🗺️ [CONTEXT-MENU] Criando DIO...');
    alert('Funcionalidade de criar DIO será implementada em breve!');
  }

  private criarCliente(): void {
    console.log('🗺️ [CONTEXT-MENU] Criando cliente...');
    alert('Funcionalidade de criar cliente será implementada em breve!');
  }

  private criarEstacao(): void {
    console.log('🗺️ [CONTEXT-MENU] Criando estação...');
    alert('Funcionalidade de criar estação será implementada em breve!');
  }

  private criarCondominio(): void {
    console.log('🗺️ [CONTEXT-MENU] Criando condomínio...');
    alert('Funcionalidade de criar condomínio será implementada em breve!');
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
  
  private editarCaixa(): void {
    if (!this.clickedCaixaData) {
      console.warn('🗺️ [CONTEXT-MENU] Nenhuma caixa selecionada');
      return;
    }
    console.log('🗺️ [CONTEXT-MENU] Editando caixa:', this.clickedCaixaData);
    // Implementar lógica de edição
  }
  
  private excluirCaixa(): void {
    if (!this.clickedCaixaData) {
      console.warn('🗺️ [CONTEXT-MENU] Nenhuma caixa selecionada');
      return;
    }
    console.log('🗺️ [CONTEXT-MENU] Excluindo caixa:', this.clickedCaixaData);
    // Implementar lógica de exclusão
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
    
    // Salvar a cor original
    this.clickedPolylineOriginalColor = this.clickedPolyline.get('strokeColor') || '#808080';
    
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
        // Clique em um vértice
        console.log('🎯 Right-click em vértice:', event.vertex);
        
        // Prevenir menu do navegador
        if (event.domEvent) {
          event.domEvent.preventDefault();
          event.domEvent.stopPropagation();
        }
        
        // Confirmar remoção
        const confirmar = confirm(`🗑️ Remover este ponto?\n\nVértice: ${event.vertex + 1}`);
        
        if (confirmar && this.clickedPolyline) {
          const path = this.clickedPolyline.getPath();
          
          // Verificar se tem pontos suficientes (mínimo 2)
          if (path.getLength() > 2) {
            path.removeAt(event.vertex);
            console.log('✅ Vértice removido:', event.vertex);
          } else {
            alert('⚠️ Não é possível remover. O cabo precisa ter no mínimo 2 pontos.');
          }
        }
      } else {
        // Clique na linha (não em vértice)
        console.log('🎯 Right-click na linha (não é vértice)');
        
        // Prevenir menu do navegador
        if (event.domEvent) {
          event.domEvent.preventDefault();
        }
      }
    });
    
    // Armazenar o listener para remover depois (opcional)
    this.clickedPolyline.set('listenerRemoverVertice', listenerRightClick);
    
    // 🆕 Adicionar listener temporário no MAPA durante edição
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
        
        console.log(`🔍 [CONEXÃO] Verificando se Ponta ${qualPonta} está sobre uma caixa...`, {
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
      
      // ❌ REMOVIDO: this.verificarConexaoPontasComCaixas(); 
      // A verificação agora é feita no listener set_at quando a ponta é movida e solta sobre uma caixa
      
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
          
          // Remover modo de edição e reabilitar clickable
          this.clickedPolyline!.setOptions({
            editable: false,
            draggable: false,
            clickable: true, // 🆕 Reabilitar cliques
            strokeColor: this.clickedPolylineOriginalColor, // Restaurar cor original
            strokeWeight: 4, // Restaurar largura
            strokeOpacity: 0.9
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
              strokeWeight: 4,
              strokeOpacity: 0.9
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

  /**
   * 🔍 Verifica se as pontas A ou B do cabo foram soltas sobre uma caixa
   * Abre modal de conexão quando detecta conexão
   */
  private verificarConexaoPontasComCaixas(): void {
    if (!this.clickedPolyline || !this.map) {
      return;
    }

    const path = this.clickedPolyline.getPath();
    if (!path || path.getLength() < 2) {
      return;
    }

    // Obter coordenadas das pontas A e B
    const pontaA = path.getAt(0);
    const pontaB = path.getAt(path.getLength() - 1);

    // Verificar ponta A
    const caixaPontaA = this.encontrarCaixaProxima(pontaA);
    if (caixaPontaA) {
      console.log(`🔌 [CONEXÃO] Ponta A conectada na caixa ${caixaPontaA.numero}`);
      this.abrirModalConexao('A', caixaPontaA);
      return; // Só processa uma ponta por vez
    }

    // Verificar ponta B
    const caixaPontaB = this.encontrarCaixaProxima(pontaB);
    if (caixaPontaB) {
      console.log(`🔌 [CONEXÃO] Ponta B conectada na caixa ${caixaPontaB.numero}`);
      this.abrirModalConexao('B', caixaPontaB);
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
      } else {
        console.log('❌ [CONEXÃO] Conexão cancelada');
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
        alert(`✅ Conexão realizada e coordenadas atualizadas!\n\nPonta ${ponta} agora está conectada à caixa ${caixa.numero}`);
      },
      error: (error) => {
        console.error('❌ [CONEXÃO] Erro ao salvar coordenadas:', error);
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

    const THRESHOLD_DISTANCIA_METROS = 5; // 5 metros
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
        strokeWeight: 4, // Restaurar largura
        strokeOpacity: 0.9
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

  private liberarCabo(): void {
    console.log('🔴 [CONTEXT-MENU] Liberando cabo...', this.clickedCaboData);
    if (this.clickedCaboData) {
      console.log('Dados do cabo clicado:', this.clickedCaboData);
      // TODO: Implementar lógica de liberação do cabo
      alert(`Funcionalidade de liberar cabo será implementada em breve!`);
    }
  }

  private excluirCabo(): void {
    console.log('🔴 [CONTEXT-MENU] Excluindo cabo...', this.clickedCaboData);
    if (this.clickedCaboData) {
      console.log('Dados do cabo clicado:', this.clickedCaboData);
      // TODO: Implementar lógica de exclusão do cabo
      const confirmacao = confirm(`Tem certeza que deseja excluir este cabo?`);
      if (confirmacao) {
        alert(`Funcionalidade de excluir cabo será implementada em breve!`);
      }
    }
  }

  /**
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
      const cabosInfo = customEvent.detail.cabosInfo;
      console.log('🗺️ [LISTENER] Evento highlightCabosComCapacidade recebido:', cabosInfo);
      this.highlightCabosComCapacidade(cabosInfo);
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
  private highlightCabosComCapacidade(cabosInfo: Array<{id: number, capacidade: string}>): void {
    console.log('🗺️ [HIGHLIGHT-OTIMIZADO] ===== INICIANDO DESTAQUE =====');
    console.log('🗺️ [HIGHLIGHT-OTIMIZADO] Cabos para destacar:', cabosInfo);
    console.log('🗺️ [HIGHLIGHT-OTIMIZADO] Estado ANTES da limpeza - highlightedPolylines:', this.highlightedPolylines.length);
    
    // 🗺️ CORREÇÃO: Limpar destaque anterior ANTES de destacar novos cabos
    this.clearCabosHighlight();
    
    console.log('🗺️ [HIGHLIGHT-OTIMIZADO] Estado APÓS a limpeza - highlightedPolylines:', this.highlightedPolylines.length);
    
    // Agrupar cabos por capacidade
    const cabosPorCapacidade = new Map<string, number[]>();
    cabosInfo.forEach(cabo => {
      if (!cabosPorCapacidade.has(cabo.capacidade)) {
        cabosPorCapacidade.set(cabo.capacidade, []);
      }
      cabosPorCapacidade.get(cabo.capacidade)!.push(cabo.id);
    });
    
    console.log('🗺️ [HIGHLIGHT-OTIMIZADO] Cabos agrupados por capacidade:', cabosPorCapacidade);
    
    // Destacar apenas nos arrays correspondentes à capacidade
    cabosPorCapacidade.forEach((ids, capacidade) => {
      console.log(`🗺️ [HIGHLIGHT-OTIMIZADO] Processando capacidade ${capacidade} com ${ids.length} cabos`);
      
      switch (capacidade) {
        case '1':
        case '1f':
          this.highlightCabosInArray(this.polylines1f, ids, this.destinoCabos1f);
          break;
        case '2':
        case '2f':
          this.highlightCabosInArray(this.polylines2f, ids, this.destinoCabos2f);
          break;
        case '4':
        case '4f':
          this.highlightCabosInArray(this.polylines4f, ids, this.destinoCabos4f);
          break;
        case '6':
        case '6f':
          this.highlightCabosInArray(this.polylines6f, ids, this.destinoCabos6f);
          break;
        case '8':
        case '8f':
          this.highlightCabosInArray(this.polylines8f, ids, this.destinoCabos8f);
          break;
        case '12':
        case '12f':
          this.highlightCabosInArray(this.polylines12f, ids, this.destinoCabos12f);
          break;
        case '24':
        case '24f':
          this.highlightCabosInArray(this.polylines24f, ids, this.destinoCabos24f);
          break;
        case '36':
        case '36f':
          this.highlightCabosInArray(this.polylines36f, ids, this.destinoCabos36f);
          break;
        case '48':
        case '48f':
          this.highlightCabosInArray(this.polylines48f, ids, this.destinoCabos48f);
          break;
        case '72':
        case '72f':
          this.highlightCabosInArray(this.polylines72f, ids, this.destinoCabos72f);
          break;
        case '144':
        case '144f':
          this.highlightCabosInArray(this.polylines144f, ids, this.destinoCabos144f);
          break;
        default:
          console.warn(`🗺️ [HIGHLIGHT-OTIMIZADO] Capacidade desconhecida: ${capacidade}`);
          // Fallback: buscar em todos os arrays
          this.highlightCabos(ids);
      }
    });
    
    console.log('🗺️ [HIGHLIGHT-OTIMIZADO] Destaque otimizado concluído. Total de polylines destacadas:', this.highlightedPolylines.length);
  }

  /**
   * 🗺️ NOVO: Destaca cabos no mapa baseado nos IDs fornecidos (método original)
   */
  private highlightCabos(cabosPercorridos: number[]): void {
    console.log('🗺️ [HIGHLIGHT] Destacando cabos:', cabosPercorridos);
    
    // Limpar destaque anterior
    this.clearCabosHighlight();
    
    // Destacar cabos em todos os arrays de polylines
    console.log(`🗺️ [HIGHLIGHT] Verificando array 1f (${this.polylines1f.length} polylines, ${this.destinoCabos1f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines1f, cabosPercorridos, this.destinoCabos1f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 2f (${this.polylines2f.length} polylines, ${this.destinoCabos2f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines2f, cabosPercorridos, this.destinoCabos2f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 4f (${this.polylines4f.length} polylines, ${this.destinoCabos4f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines4f, cabosPercorridos, this.destinoCabos4f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 6f (${this.polylines6f.length} polylines, ${this.destinoCabos6f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines6f, cabosPercorridos, this.destinoCabos6f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 8f (${this.polylines8f.length} polylines, ${this.destinoCabos8f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines8f, cabosPercorridos, this.destinoCabos8f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 12f (${this.polylines12f.length} polylines, ${this.destinoCabos12f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines12f, cabosPercorridos, this.destinoCabos12f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 24f (${this.polylines24f.length} polylines, ${this.destinoCabos24f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines24f, cabosPercorridos, this.destinoCabos24f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 36f (${this.polylines36f.length} polylines, ${this.destinoCabos36f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines36f, cabosPercorridos, this.destinoCabos36f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 48f (${this.polylines48f.length} polylines, ${this.destinoCabos48f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines48f, cabosPercorridos, this.destinoCabos48f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 72f (${this.polylines72f.length} polylines, ${this.destinoCabos72f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines72f, cabosPercorridos, this.destinoCabos72f);
    
    console.log(`🗺️ [HIGHLIGHT] Verificando array 144f (${this.polylines144f.length} polylines, ${this.destinoCabos144f?.length || 0} cabos)`);
    this.highlightCabosInArray(this.polylines144f, cabosPercorridos, this.destinoCabos144f);
    
    console.log('🗺️ [HIGHLIGHT] Destaque concluído. Total de polylines destacadas:', this.highlightedPolylines.length);
  }

  /**
   * 🗺️ NOVO: Destaca cabos em um array específico de polylines (OTIMIZADO)
   */
  private highlightCabosInArray(polylines: google.maps.Polyline[], cabosPercorridos: number[], cabos: any[]): void {
    if (!polylines) return;
    
    console.log(`🗺️ [HIGHLIGHT-OTIMIZADO] Verificando ${polylines.length} polylines`);
    console.log(`🗺️ [HIGHLIGHT-OTIMIZADO] Cabos procurados: [${cabosPercorridos.join(', ')}]`);
    
    // 🗺️ OTIMIZAÇÃO: Buscar diretamente nas polylines por propriedade
    polylines.forEach((polyline, index) => {
      const idMeta = polyline.get('id_meta');
      const capacidade = polyline.get('capacidade');
      const tipo = polyline.get('tipo');
      
      console.log(`🗺️ [HIGHLIGHT-OTIMIZADO] Polyline ${index}: ID=${idMeta}, Capacidade=${capacidade}, Tipo=${tipo}`);
      
      if (idMeta && cabosPercorridos.includes(idMeta)) {
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
    
    // Fallback para opções padrão
    return this.polylineOptions12f;
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
 
// **********************************************************************************************inserido

  polylineOptions1f: google.maps.PolylineOptions = {
    strokeColor: 'blue',
    strokeOpacity: 0.7,
    strokeWeight: 0.5,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false,
    //traceja linha
    icons: [{
    icon: {
      path: 'M 0,-1 0,1',
      strokeOpacity: 0.7,
      scale: 2
    },
    offset: '0',
    repeat: '10px'
  }]

  }

  polylineOptions2f: google.maps.PolylineOptions = {
    strokeColor: ' #00FFFF ',
    strokeOpacity: 0.7,
    strokeWeight: 0.5,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false,
    //traceja linha
    icons: [{
    icon: {
      path: 'M 0,-1 0,1',
      strokeOpacity: 0.7,
      scale: 3
    },
    offset: '0',
    repeat: '10px'
  }]

  }

  polylineOptions4f: google.maps.PolylineOptions = {
    strokeColor: 'rgb(41, 161, 216) ',
    strokeOpacity: 0.7,
    strokeWeight: 0.5,
    clickable: true,
    visible: true,
    zIndex: 1,
    draggable: false,
    editable: false,
    //traceja linha
    icons: [{
    icon: {
      path: 'M 0,-1 0,1',
      strokeOpacity: 0.7,
      scale: 3
    },
    offset: '0',
    repeat: '10px'
  }] 

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
     

    if (changes['destinoDios'] && changes['destinoDios'].currentValue) {
      console.log('Atualizando marcadores de Dios ',this.destinoDios);
      this.updateMarkersDios();
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




  private updateMarkersDios() {
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
      
      // Adicionar listener de duplo clique para abrir o modal Visualiza DIO
      marker.addListener('dblclick', () => {
        console.log('DIO clicado duas vezes:', location);
        if (location.id_meta) {
          this.openVisualizaDioModal(location.id_meta, location.CAPACIDADE);
        }
      });
      
      this.markerDios.push(marker);
      });

    console.log('Dios atualizados:', this.markerDios);    
  }




  //=====================================função para carregar as POPs na Tela================================
  private updateMarkersCondominios() {
    

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
      
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const index = this.markerCondominios.indexOf(marker);
        if (index !== -1) {
          this.onMarkerDragEnd(event, index, true);
        }
      });

      //this.addMarkerEventListeners(marker, true);
      
      this.markerCondominios.push(marker);
    });
      
      console.log('Condominios atualizadas:', this.markerCondominios);
    }
  }

//=====================================função para carregar as POPs na Tela================================
  private updateMarkersPopsCli() {
    

      if (this.destinoPopsCli && this.destinoPopsCli.length > 0 && this.map) {
        this.markerPopsCli.forEach(marker => marker.setMap(null));
        this.markerPopsCli = [];
        
        this.destinoPopsCli.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LNG)
          };

    

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.sigla || 'Sem nome',
        draggable: true,
        opacity:20,
        label: {
          text: location.sigla || 'S/N',
          color: 'gray',
          fontSize: '10px'
        } as google.maps.MarkerLabel,
        icon: {
          //url: '/assets/TORRE4.png',
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: 'red', // Cor de preenchimento vermelha
          fillOpacity: 0.7, // Opacidade do preenchimento
          strokeColor: 'darkred', // Cor da borda
          strokeWeight: 2, // Espessura da borda
          scale: 4, // Tamanho do círculo
          labelOrigin: new google.maps.Point(0, -2),
          //scaledSize: new google.maps.Size(10, 10),
          
          
          
        },

        visible: this.currentZoom >= this.ZOOM_LEVEL_CLIENTES
        ///visible: false

      };
      
      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }
      
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const index = this.markerPopsCli.indexOf(marker);
        if (index !== -1) {
          this.onMarkerDragEnd(event, index, true);
        }
      });

      //this.addMarkerEventListeners(marker, true);//260825

      this.addMarkerEventListeners(marker, false,false,true,false,false);
      
      this.markerPopsCli.push(marker);
    });
      
      console.log('Clientes atualizados:', this.markerPopsCli);
    }
  }


//=====================================função para carregar as POPs na Tela================================
  private updateMarkersPopsCliDes() {
    

      if (this.destinoPopsCliDes && this.destinoPopsCliDes.length > 0 && this.map) {
        this.markerPopsCliDes.forEach(marker => marker.setMap(null));
        this.markerPopsCliDes = [];
        
        this.destinoPopsCliDes.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LNG)
          };

    

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.sigla || 'Sem nome',
        draggable: true,
        opacity:20,
        label: {
          text: location.sigla || 'S/N',
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
      
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const index = this.markerPopsCliDes.indexOf(marker);
        if (index !== -1) {
          this.onMarkerDragEnd(event, index, true);
        }
      });

      this.addMarkerEventListeners(marker, false,false,false,false,true);
      
      this.markerPopsCliDes.push(marker);
    });
      
      console.log('Clientes Desativados atualizados:', this.markerPopsCliDes);
    }
  }



//=====================================função para carregar Clientes Ativos na Tela================================
  private updateMarkersPopsCliAtv() {
    

      if (this.destinoPopsCliAtv && this.destinoPopsCliAtv.length > 0 && this.map) {
        this.markerPopsCliAtv.forEach(marker => marker.setMap(null));
        this.markerPopsCliAtv = [];
        
        this.destinoPopsCliAtv.forEach(location => {
          const position = {
            lat: Number(location.LAT),
            lng: Number(location.LNG)
          };

    

      const markerOptions: google.maps.MarkerOptions = {
        position: position,
        title: location.sigla || 'Sem nome',
        draggable: true,
        opacity:20,
        label: {
          text: location.sigla || 'S/N',
          color: 'blue',
          fontSize: '10px'
        } as google.maps.MarkerLabel,
        icon: {
          
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: 'cyan', // Cor de preenchimento vermelha
          fillOpacity: 0.7, // Opacidade do preenchimento
          strokeColor: 'blue', // Cor da borda
          strokeWeight: 2, // Espessura da borda
          scale: 4, // Tamanho do círculo
          labelOrigin: new google.maps.Point(0, -2),
          
          
          
          
        },

        visible: this.currentZoom >= this.ZOOM_LEVEL_CLIENTES_ATIVOS
        ///visible: false

      };
      
      const marker = new google.maps.Marker(markerOptions);
      if (this.map) {
        marker.setMap(this.map);
      }
      
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const index = this.markerPopsCliAtv.indexOf(marker);
        if (index !== -1) {
          this.onMarkerDragEnd(event, index, true);
        }
      });

      this.addMarkerEventListeners(marker, false,false,false,true,false);
      
      this.markerPopsCliAtv.push(marker);
    });
      
      console.log('Clientes Ativados atualizados:', this.markerPopsCliAtv);
    }
  }






//=====================================função para carregar as POPs na Tela================================
  private updateMarkersPopsEst() {
    

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
      
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const index = this.markerPopsEst.indexOf(marker);
        if (index !== -1) {
          this.onMarkerDragEnd(event, index, true);
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

    const ceo_layer= this.authService.getceo_layer();
    if(ceo_layer == '0')  {return} // flag visualiza CEO
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
            icon: {
              //url: '/assets/caixa_plp_15.png',
              url: '/assets/fosc ama.png',
              labelOrigin: new google.maps.Point(70, 10),
              scaledSize: new google.maps.Size(20, 40)
            },
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
        icon: {
          url: '/assets/CTO80.png',
          labelOrigin: new google.maps.Point(50, 10),
          scaledSize: new google.maps.Size(18, 22)
        },
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
        icon: {
          url: '/assets/CTOSP.png',
          labelOrigin: new google.maps.Point(50, 10),
          scaledSize: new google.maps.Size(18, 22)
        },
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

    const cabo_layer= this.authService.getcabos_layer();
    console.log(' cabos layer = ', cabo_layer);
    if (cabo_layer =='0') return;



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

    const cabo_layer= this.authService.getcabos_layer();
    console.log(' cabos layer = ', cabo_layer);
    if (cabo_layer =='0') return;



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

    const cabo_layer= this.authService.getcabos_layer();
    console.log(' cabos layer = ', cabo_layer);
    if (cabo_layer =='0') return;



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

    const cabo_layer= this.authService.getcabos_layer();
    console.log(' cabos layer = ', cabo_layer);
    if (cabo_layer =='0') return;



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

    const cabo_layer= this.authService.getcabos_layer();
    if (cabo_layer =='0') return;

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

    const cabo_layer= this.authService.getcabos_layer();
    if (cabo_layer =='0') return;


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

    const cabo_layer= this.authService.getcabos_layer();
    if (cabo_layer =='0') return;

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
    
    const cabo_layer= this.authService.getcabos_layer();
    if (cabo_layer =='0') return;


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

    const cabo_layer= this.authService.getcabos_layer();
    if (cabo_layer =='0') return;

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

    const cabo_layer= this.authService.getcabos_layer();
    if (cabo_layer =='0') return;


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

    const cabo_layer= this.authService.getcabos_layer();
    if (cabo_layer =='0') return;


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

    });

    // Adiciona o evento bounds_changed para carregamento sob demanda
    this.map.addListener('bounds_changed', () => {
      // Usar debounce para evitar atualizações frequentes
      if (this.boundsChangeTimeout) {
        clearTimeout(this.boundsChangeTimeout);
      }
      
      this.boundsChangeTimeout = setTimeout(() => {
        this.updateVisibleMarkers();
      }, 200); // Pequeno delay para evitar muitas atualizações
    });

    if (this.map) {
      this.currentZoom = this.map.getZoom() || 0;
      this.updateVisibleMarkers();


    
    
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
    if (!bounds) return;


    
  
    console.log('Atualizando marcadores visíveis com base nos limites do mapa');


  const ceo_layer= this.authService.getceo_layer(); //----------------- Visibilidade das Caixas ----------------------------
  if (ceo_layer == '1') {
  
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

   

}
  

 const cto_layer= this.authService.getcto_layer(); //----------------- Visibilidade das CTOS SEM SPLITTER ----------------------------
  if (cto_layer == '1') {
  
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

  }

  const ctoSP_layer= this.authService.getcto_layer(); //----------------- Visibilidade das CTOS COM SPLITTER----------------------------
  if (ctoSP_layer == '1') {
  
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

  }

  // Atualizar visibilidade de Estações  //----------------- Visibilidade de Estações ----------------------------
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
   

// Atualizar visibilidade de Clientes  //----------------- Visibilidade de Clientes ----------------------------
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

  // Atualizar visibilidade de Clientes DESATIVADOS   //----------------- Visibilidade de Clientes DESATIVADOS ----------------------------
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


// Atualizar visibilidade de Clientes DESATIVADOS   //----------------- Visibilidade de Clientes DESATIVADOS ----------------------------
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

  console.log(` Clientes Desativados visíveis: ${visiblePOPsCLIDesCount}`);

// Atualizar visibilidade de Condominios  //----------------- Visibilidade de Condominios ----------------------------
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
   


  // Atualizar visibilidade de Condominios  //----------------- Visibilidade de Condominios ----------------------------
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
    '#95a5a6': '#7f8c8d'  // Cinza
  };
  return colorMap[color] || color;
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
        this.showMarkerInfoWindow(marker, event, tipo, dados);
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
        this.onMarkerClick(event, index,true,false,false,false,false);        
      }}

      else if (isCTOSP) {      
      const index = this.markerCtosSP.indexOf(marker);
      if (index !== -1) {
        this.onMarkerClick(event, index,false,true,false,false,false);
      }}
      
      else if (isCLI) {      
        const index = this.markerPopsCli.indexOf(marker);
        if (index !== -1) {
          this.onMarkerClick(event, index,false,false,true,false,false);
        }} 
        
      else if (isCLIAT) {      
          const index = this.markerPopsCliAtv.indexOf(marker);
          if (index !== -1) {
            this.onMarkerClick(event, index,false,false,false,true,false);
          }}
          
      else if (isCLIDES) {      
            const index = this.markerPopsCliDes.indexOf(marker);
            if (index !== -1) {
              this.onMarkerClick(event, index,false,false,false,false,true);
            }}        

      else {
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
    } else {
      console.log('🔴 [CONTEXT-MENU] Não é uma caixa/CTO, é:', { isCTO, isCTOSP, isCLI, isCLIAT, isCLIDES });
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

  /**
   * 🔧 NOVO: Método auxiliar para tratar right-click em markers (reutilizável para desktop e mobile)
   */
  private handleRightClickOnMarker(
    event: google.maps.MapMouseEvent, 
    marker: google.maps.Marker,
    isCTO: boolean,
    isCTOSP: boolean,
    isCLI: boolean,
    isCLIAT: boolean,
    isCLIDES: boolean
  ): void {
    console.log('🔴 [CONTEXT-MENU] Right-click detectado no marcador (desktop ou mobile)');
    
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
        this.clickedCTOData = cto;
        this.clickedCaixaData = null;
        this.clickedCTOSPData = null;
        this.contextMenuType = 'caixa';
        
        if (event.domEvent) {
          const mouseEvent = event.domEvent as any;
          this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
        }
      }
    }
    // Verificar se é uma CTO_SP
    else if (isCTOSP) {
      const index = this.markerCtosSP.indexOf(marker);
      if (index !== -1) {
        const ctosp = this.destinoCTOSP[index];
        this.clickedCTOSPData = ctosp;
        this.clickedCaixaData = null;
        this.clickedCTOData = null;
        this.contextMenuType = 'caixa';
        
        if (event.domEvent) {
          const mouseEvent = event.domEvent as any;
          this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
        }
      }
    }
    // Verificar se é uma caixa
    else if (!isCLI && !isCLIAT && !isCLIDES) {
      const index = this.markerCaixas.indexOf(marker);
      if (index !== -1) {
        const caixa = this.destino[index];
        this.clickedCaixaData = caixa;
        this.clickedCTOData = null;
        this.clickedCTOSPData = null;
        this.contextMenuType = 'caixa';
        
        if (event.domEvent) {
          const mouseEvent = event.domEvent as any;
          this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
        }
      }
    }
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

    }else if (isCLI) {
      if (this.destinoPopsCli[index]) {
    console.log('Cliente clicado', this.destinoPopsCli[index].sigla);
    this.openPopInfoModal(this.destinoPopsCli[index].id_meta)
    this.cdr.detectChanges();

  }

  }else if (isCLIAT) {
    if (this.destinoPopsCliAtv[index]) {
  console.log('Cliente Ativo clicado', this.destinoPopsCliAtv[index].sigla);
  this.openPopInfoModal(this.destinoPopsCliAtv[index].id_meta)
  this.cdr.detectChanges();

  }


  }else if (isCLIDES) {
   if (this.destinoPopsCliDes[index]) {
  console.log('Cliente Desativado clicado', this.destinoPopsCliDes[index].sigla);
  this.openPopInfoModal(this.destinoPopsCliDes[index].id_meta)
  this.cdr.detectChanges();
  }  
    //this.authService.setIDmetaCliente(this.destinoPopsCli[index].id_meta)//<---escrevo idmeta da cto no storage
    //this.isGoJSModalOpen = true;
    //this.cdr.detectChanges();
  

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
    marker.setIcon({
      url: '/assets/fosc ama.png',
      labelOrigin: new google.maps.Point(70, 10),
      scaledSize: new google.maps.Size(25, 45) // Ligeiramente maior
    });

    // Armazenar referências
    this.caixaEmEdicao = marker;
    this.caixaEmEdicaoIndex = index;
    this.caixaEmEdicaoTipo = 'caixa';

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
    marker.setIcon({
      url: '/assets/CTO80.png',
      labelOrigin: new google.maps.Point(50, 10),
      scaledSize: new google.maps.Size(22, 26) // Ligeiramente maior
    });

    // Armazenar referências
    this.caixaEmEdicao = marker;
    this.caixaEmEdicaoIndex = index;
    this.caixaEmEdicaoTipo = 'cto';

    console.log('✅ [EDITAR-CTO] Edição habilitada para CTO:', cto.numero);
    alert(`✅ Modo de edição ativado!\n\nCTO: ${cto.numero}\n\nArraste a CTO para mover.\nClique no mapa para salvar ou pressione ESC para cancelar.`);

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
    marker.setIcon({
      url: '/assets/CTOSP.png',
      labelOrigin: new google.maps.Point(50, 10),
      scaledSize: new google.maps.Size(22, 26) // Ligeiramente maior
    });

    // Armazenar referências
    this.caixaEmEdicao = marker;
    this.caixaEmEdicaoIndex = index;
    this.caixaEmEdicaoTipo = 'ctosp';

    console.log('✅ [EDITAR-CTOSP] Edição habilitada para CTO_SP:', ctosp.numero);
    alert(`✅ Modo de edição ativado!\n\nCTO_SP: ${ctosp.numero}\n\nArraste a CTO_SP para mover.\nClique no mapa para salvar ou pressione ESC para cancelar.`);

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
      caixa.LAT = newLat as any;
      caixa.LONGI = newLng as any;
      
      // TODO: Chamar serviço para atualizar coordenadas no banco
      // Exemplo: this.caixaService.atualizarCoordenadas(caixa.id_meta, newLat, newLng)
      
      //alert(`✅ Posição da caixa ${caixa.numero} atualizada!\n\nLat: ${newLat.toFixed(6)}\nLng: ${newLng.toFixed(6)}`);
    } else if (this.caixaEmEdicaoTipo === 'cto') {
      const cto = this.destinoCTO[this.caixaEmEdicaoIndex];
      cto.LAT = newLat as any;
      cto.LONGI = newLng as any;
      
      // TODO: Chamar serviço para atualizar coordenadas no banco
      // Exemplo: this.ctoService.atualizarCoordenadas(cto.id_meta, newLat, newLng)
      
      //alert(`✅ Posição da CTO ${cto.numero} atualizada!\n\nLat: ${newLat.toFixed(6)}\nLng: ${newLng.toFixed(6)}`);
    } else if (this.caixaEmEdicaoTipo === 'ctosp') {
      const ctosp = this.destinoCTOSP[this.caixaEmEdicaoIndex];
      ctosp.LAT = newLat as any;
      ctosp.LONGI = newLng as any;
      
      // TODO: Chamar serviço para atualizar coordenadas no banco
      // Exemplo: this.ctospService.atualizarCoordenadas(ctosp.id_meta, newLat, newLng)
      
      //alert(`✅ Posição da CTO_SP ${ctosp.numero} atualizada!\n\nLat: ${newLat.toFixed(6)}\nLng: ${newLng.toFixed(6)}`);
    }

    // Desabilitar edição
    this.desabilitarEdicaoCaixa();
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
  



openPopInfoModal(id_meta: number|undefined) {
  const dialogRef = this.dialog.open(PopInfoModalComponent, {
    width: '600px',
    data: { id_meta }
  });

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
          map: this.map
        });

        // Usar o índice correto do array de cabos
        const caboIndex = indicesValidos[pathIndex];
        const cabo = cabos[caboIndex];
        
        // 🗺️ NOVO: Armazenar dados na polyline (como no Visio)
        polyline.set('id_meta', cabo.id_meta);
        polyline.set('capacidade', tipoFibra);
        polyline.set('tipo', cabo.tipo || 'CABO');
        polyline.set('label', cabo.Label_cabo || '');
        polyline.set('cabo_data', cabo); // Dados completos do cabo
        
        console.log(`🗺️ [POLYLINE-DATA] Armazenando dados na polyline ${tipoFibra}:`, {
          id_meta: cabo.id_meta,
          capacidade: tipoFibra,
          tipo: cabo.tipo,
          label: cabo.Label_cabo
        });
        
        // Criar InfoWindow para este cabo
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h4 style="margin: 0 0 8px 0; color: #333;">Cabo ${tipoFibra.toUpperCase()}</h4>
              <p style="margin: 4px 0;"><strong>ID:</strong> ${cabo.id_meta || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Fibras:</strong> ${tipoFibra.replace('f', '')}</p>
              <p style="margin: 4px 0;"><strong>Label:</strong> ${cabo.Label_cabo}</p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">Duplo-clique para abrir diagrama</p>
              
            </div>
          `
        });

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

  pesquisarLogradouro(): void {
    console.log('Pesquisar Logradouro clicado');
    // Implementar lógica de pesquisa de logradouro
    alert('Funcionalidade de Pesquisa Logradouro será implementada');
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

  /**
   * 📤 EXPORT: Exporta o mapa para KML
   */
  exportMapToKML(): void {
    console.log('🗺️ [GOOGLE-MAPS] Iniciando exportação de mapa para KML...');
    
    this.kmlExportService.exportMapToKML({
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
      cabos144f: this.destinoCabos144f
    });
  }

  /***********************************************************************************************************
   * 🗺️ DESENHO CABO: Inicia o modo de desenho de cabo
   **********************************************************************************************************/
  startDesenhoCabo(): void {
    console.log('🗺️ [DESENHO-CABO] Iniciando modo de desenho...');
    
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

    // Criar/atualizar a polyline temporária
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
    } else if (this.pontosCaboEmDesenho.length === 1) {
      // Marcar o primeiro ponto com um marcador pequeno
      new google.maps.Marker({
        position: event.latLng,
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 4,
          fillColor: '#808080',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        title: 'Início do cabo'
      });
    }
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
    
    // Limpar array de pontos (será usado depois no criarCaboComTipagem)
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
   * 🆕 Método auxiliar: Cria o cabo final com os dados de tipagem
   */
  private criarCaboComTipagem(tipagemData: TipagemCabosData): void {
    console.log('🗺️ [TIPAGEM] Criando cabo com tipagem:', tipagemData);
    
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
    
    // Gerar ID temporário
    const idMetaTemp = `TEMP_${Date.now()}`;
    
    // Criar objeto com dados completos do cabo (igual aos outros cabos)
    const caboData = {
      id_meta: idMetaTemp,
      capacidade: tipagemData.capacidade,
      tipo: 'CABO_DESENHADO',
      Label_cabo: tipagemData.label,
      fibrasPorTubo: tipagemData.fibrasPorTubo,
      codigoCores: tipagemData.codigoCores,
      GOOGLE_LATLNG: pontosFinais.map(p => `${p.lat},${p.lng}`).join(' ')
    };
    
    //********************************************************************************************
    // cria cabos no mapa 03112025 *********************************************************
    // 🎨 Obter opções de polyline baseadas na capacidade  
    const polylineOptions = this.getPolylineOptionsPorCapacidade(tipagemData.capacidade);
    
    // Criar polyline final com as opções corretas da capacidade
    this.caboDesenhado = new google.maps.Polyline({
      ...polylineOptions,  // 🎨 Usar as opções da capacidade
      path: pontosFinais,
      map: this.map,
      geodesic: true,
      clickable: true,
      editable: false // Não editável após finalizar
    });
    
    // 🆕 Salvar atributos na polyline (igual aos outros cabos)
    this.caboDesenhado.set('id_meta', idMetaTemp);
    this.caboDesenhado.set('capacidade', tipagemData.capacidade);
    this.caboDesenhado.set('tipo', 'CABO_DESENHADO');
    this.caboDesenhado.set('label', tipagemData.label);
    this.caboDesenhado.set('fibrasPorTubo', tipagemData.fibrasPorTubo);
    this.caboDesenhado.set('codigoCores', tipagemData.codigoCores);
    this.caboDesenhado.set('cabo_data', caboData); // Dados completos do cabo
    
    console.log('🗺️ [TIPAGEM] Polyline criada com atributos:', {
      id_meta: idMetaTemp,
      capacidade: tipagemData.capacidade,
      label: tipagemData.label,
      fibrasPorTubo: tipagemData.fibrasPorTubo,
      codigoCores: tipagemData.codigoCores,
      cor: polylineOptions.strokeColor  // 🎨 Mostrar a cor usada
    });
    
    // 🆕 ADICIONAR LISTENERS IGUAIS AOS CABOS CARREGADOS DO BANCO
    
    // Listener de click simples (para InfoWindow)
    let clickTimeout: ReturnType<typeof setTimeout> | null = null;
    this.caboDesenhado.addListener('click', (event: google.maps.MapMouseEvent) => {
      console.log(`🔵 Clique simples detectado no cabo desenhado (temp):`, idMetaTemp);
      
      // Cancelar timeout anterior se existir
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }
      
      // Definir timeout para clique simples (InfoWindow será mostrado se não houver dblclick)
      clickTimeout = setTimeout(() => {
        console.log(`Clique simples confirmado no cabo desenhado (temp):`, idMetaTemp);
        // InfoWindow pode ser adicionado aqui se necessário
      }, 300);
    });
    
    // Listener de duplo clique (para editar diretamente)
    this.caboDesenhado.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
      console.log(`🔴 CABO DOUBLE-CLICK - Editando cabo desenhado (temp):`, idMetaTemp);
      
      // Cancelar clique simples se estiver pendente
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }
      
      // 🛡️ Verificar se já existe uma edição em andamento
      if (this.isEditingCabo || this.isIniciandoEdicao) {
        console.log('⚠️ [EDITAR-CABO] Edição em andamento detectada no dblclick. Finalizando edição anterior...');
        
        // Se o cabo clicado é diferente do que está sendo editado, finalizar edição anterior
        const caboEmEdicaoId = this.clickedPolyline?.get('id_meta');
        const novoCaboId = idMetaTemp;
        
        if (caboEmEdicaoId !== novoCaboId) {
          console.log('🔄 [EDITAR-CABO] Novo cabo clicado durante edição (dblclick). Finalizando edição anterior...');
          
          // Finalizar edição do cabo anterior (salvar automaticamente)
          this.finalizarEdicaoCabo();
          
          // Aguardar um pouco para garantir que a finalização foi processada
          setTimeout(() => {
            // 🛡️ Limpar flag de finalização
            this.isFinalizandoEdicao = false;
            
            // 🆕 Setar dados do novo cabo para edição
            this.clickedPolyline = this.caboDesenhado;
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
      this.clickedPolyline = this.caboDesenhado;
      this.clickedCaboData = caboData;
      
      // 🆕 Chamar editarCabo() diretamente
      this.editarCabo();
    });
    
    // Listener de right-click (para menu de contexto)
    this.caboDesenhado.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
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
        const novoCaboId = idMetaTemp;
        
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
            
            if (this.caboDesenhado) {
              this.processarRightClickCabo(event, this.caboDesenhado, caboData);
            }
          }, 100);
          return;
        } else {
          // Mesmo cabo - apenas mostrar menu
          console.log('✅ [EDITAR-CABO] Mesmo cabo clicado durante edição');
        }
      }
      
      if (this.caboDesenhado) {
        this.processarRightClickCabo(event, this.caboDesenhado, caboData);
      }
    });

    // 🔧 NOVO: Adicionar suporte a touch events para mobile (long press = right-click) no cabo desenhado
    if (this.caboDesenhado) {
      this.caboDesenhado.addListener('touchstart', (event: google.maps.MapMouseEvent) => {
        if (event.domEvent) {
          const touchEvent = event.domEvent as TouchEvent;
          if (touchEvent.touches && touchEvent.touches.length > 0) {
            const touch = touchEvent.touches[0];
            this.touchStartTime = Date.now();
            this.touchStartPosition = {
              x: touch.clientX,
              y: touch.clientY
            };
            this.longPressPolyline = this.caboDesenhado;

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
              if (this.caboDesenhado) {
                const caboDataTemp = {
                  id_meta: this.caboDesenhado.get('id_meta'),
                  capacidade: this.caboDesenhado.get('capacidade'),
                  tipo: this.caboDesenhado.get('tipo'),
                  Label_cabo: this.caboDesenhado.get('label') || this.caboDesenhado.get('Label_cabo'),
                  GOOGLE_LATLNG: this.caboDesenhado.get('GOOGLE_LATLNG'),
                  cabo_data: this.caboDesenhado.get('cabo_data')
                };

                // Chamar o handler de right-click
                this.processarRightClickCabo(simulatedEvent, this.caboDesenhado, caboDataTemp);
              }
            }, this.LONG_PRESS_DURATION);
          }
        }
      });

      this.caboDesenhado.addListener('touchend', (event: google.maps.MapMouseEvent) => {
        // Cancelar long press se o toque terminou antes do tempo
        if (this.longPressTimer && this.longPressPolyline === this.caboDesenhado) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
          this.longPressPolyline = null;
        }
        this.touchStartTime = 0;
        this.touchStartPosition = null;
      });

      this.caboDesenhado.addListener('touchmove', (event: google.maps.MapMouseEvent) => {
        // Cancelar long press se o usuário moveu o dedo
        if (this.longPressTimer && this.longPressPolyline === this.caboDesenhado) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
          this.longPressPolyline = null;
        }
      });
    }
    
    // Limpar pontos aguardando tipagem
    this.pontosCaboAguardandoTipagem = [];
    
    const totalPontos = pontosFinais.length;
    alert(`✅ Cabo desenhado com sucesso!\n📊 Total de pontos: ${totalPontos}\n📋 Capacidade: ${tipagemData.capacidade}\n🏷️ Label: ${tipagemData.label}`);
    
    console.log('🗺️ [TIPAGEM] Desenho finalizado. Estado final:', {
      caboDesenhado: this.caboDesenhado,
      map: this.map,
      isDesenhandoCabo: this.isDesenhandoCabo
    });
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
    
    // Criar objeto com dados completos do cabo (igual aos outros cabos)
    const caboData = {
      id_meta: idMeta.toString(),
      capacidade: tipagemData.capacidade,
      tipo: 'CABO_DESENHADO',
      Label_cabo: tipagemData.label,
      fibrasPorTubo: tipagemData.fibrasPorTubo,
      codigoCores: tipagemData.codigoCores,
      comprimento: comprimento,
      GOOGLE_LATLNG: pontosFinais.map(p => `${p.lat},${p.lng}`).join(' ')
    };
    
    // 🎨 Obter opções de polyline baseadas na capacidade
    const polylineOptions = this.getPolylineOptionsPorCapacidade(tipagemData.capacidade);
    
    // Criar polyline final com as opções corretas da capacidade
    this.caboDesenhado = new google.maps.Polyline({
      ...polylineOptions,  // 🎨 Usar as opções da capacidade
      path: pontosFinais,
      map: this.map,
      geodesic: true,
      clickable: true,
      editable: false // Não editável após finalizar
    });
    
    // 🆕 Salvar atributos na polyline (igual aos outros cabos)
    this.caboDesenhado.set('id_meta', idMeta);
    this.caboDesenhado.set('capacidade', tipagemData.capacidade);
    this.caboDesenhado.set('tipo', 'CABO_DESENHADO');
    this.caboDesenhado.set('label', tipagemData.label);
    this.caboDesenhado.set('fibrasPorTubo', tipagemData.fibrasPorTubo);
    this.caboDesenhado.set('codigoCores', tipagemData.codigoCores);
    this.caboDesenhado.set('comprimento', comprimento);
    this.caboDesenhado.set('cabo_data', caboData); // Dados completos do cabo
    
    console.log('🗺️ [TIPAGEM] Polyline criada com atributos:', {
      id_meta: idMeta,
      capacidade: tipagemData.capacidade,
      label: tipagemData.label,
      fibrasPorTubo: tipagemData.fibrasPorTubo,
      codigoCores: tipagemData.codigoCores,
      comprimento: comprimento.toFixed(2) + 'm',
      cor: polylineOptions.strokeColor  // 🎨 Mostrar a cor usada
    });
    
    // 🆕 ADICIONAR LISTENERS IGUAIS AOS CABOS CARREGADOS DO BANCO
    
    // Listener de click simples (para InfoWindow)
    let clickTimeout: ReturnType<typeof setTimeout> | null = null;
    this.caboDesenhado.addListener('click', (event: google.maps.MapMouseEvent) => {
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
    this.caboDesenhado.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
      console.log(`🔴 CABO DOUBLE-CLICK - Editando cabo desenhado:`, idMeta);
      
      // Cancelar clique simples se estiver pendente
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }
      
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
            this.clickedPolyline = this.caboDesenhado;
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
      this.clickedPolyline = this.caboDesenhado;
      this.clickedCaboData = caboData;
      
      // 🆕 Chamar editarCabo() diretamente
      this.editarCabo();
    });
    
    // Listener de right-click (para menu de contexto)
    this.caboDesenhado.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
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
            
            if (this.caboDesenhado) {
              this.processarRightClickCabo(event, this.caboDesenhado, caboData);
            }
          }, 100);
          return;
        } else {
          // Mesmo cabo - apenas mostrar menu
          console.log('✅ [EDITAR-CABO] Mesmo cabo clicado durante edição');
        }
      }
      
      if (this.caboDesenhado) {
        this.processarRightClickCabo(event, this.caboDesenhado, caboData);
      }
    });

    // 🔧 NOVO: Adicionar suporte a touch events para mobile (long press = right-click) no cabo desenhado (segunda ocorrência)
    if (this.caboDesenhado) {
      this.caboDesenhado.addListener('touchstart', (event: google.maps.MapMouseEvent) => {
        if (event.domEvent) {
          const touchEvent = event.domEvent as TouchEvent;
          if (touchEvent.touches && touchEvent.touches.length > 0) {
            const touch = touchEvent.touches[0];
            this.touchStartTime = Date.now();
            this.touchStartPosition = {
              x: touch.clientX,
              y: touch.clientY
            };
            this.longPressPolyline = this.caboDesenhado;

            // Iniciar timer para long press
            this.longPressTimer = setTimeout(() => {
              // Long press detectado - simular right-click
              console.log('📱 [MOBILE] Long press detectado no cabo desenhado (segunda ocorrência) - simulando right-click');
              
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
              if (this.caboDesenhado) {
                const caboDataTemp = {
                  id_meta: this.caboDesenhado.get('id_meta'),
                  capacidade: this.caboDesenhado.get('capacidade'),
                  tipo: this.caboDesenhado.get('tipo'),
                  Label_cabo: this.caboDesenhado.get('label') || this.caboDesenhado.get('Label_cabo'),
                  GOOGLE_LATLNG: this.caboDesenhado.get('GOOGLE_LATLNG'),
                  cabo_data: this.caboDesenhado.get('cabo_data')
                };

                // Chamar o handler de right-click
                this.processarRightClickCabo(simulatedEvent, this.caboDesenhado, caboDataTemp);
              }
            }, this.LONG_PRESS_DURATION);
          }
        }
      });

      this.caboDesenhado.addListener('touchend', (event: google.maps.MapMouseEvent) => {
        // Cancelar long press se o toque terminou antes do tempo
        if (this.longPressTimer && this.longPressPolyline === this.caboDesenhado) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
          this.longPressPolyline = null;
        }
        this.touchStartTime = 0;
        this.touchStartPosition = null;
      });

      this.caboDesenhado.addListener('touchmove', (event: google.maps.MapMouseEvent) => {
        // Cancelar long press se o usuário moveu o dedo
        if (this.longPressTimer && this.longPressPolyline === this.caboDesenhado) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
          this.longPressPolyline = null;
        }
      });
    }
    
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
        
        alert(`✅ Cabo inserido com sucesso!\n🆔 ID: ${idMetaReal}\n📏 Comprimento: ${comprimento.toFixed(2)}m\n📊 Capacidade: ${tipagemData.capacidade}\n🏷️ Label: ${tipagemData.label}`);
      },
      error: (error) => {
        console.error('❌ [TIPAGEM] Erro ao inserir cabo:', error);
        alert(`❌ Erro ao inserir cabo na base de dados:\n${error.message}\n\nO cabo será criado no mapa apenas localmente.`);
        
        // Ainda assim criar o cabo no mapa com ID temporário
        this.criarCaboComTipagem(tipagemData);
      }
    });
  }

  /**
   * 🧹 Limpa listeners quando o componente é destruído
   */
  ngOnDestroy(): void {
    // Limpeza de listeners será feita aqui se necessário no futuro
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
 /***********************************************************************************************************/
 //********************************************************************************************






}