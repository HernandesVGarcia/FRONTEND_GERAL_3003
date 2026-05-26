import { Component, Input, Output, EventEmitter, HostListener, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-map-context-menu',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './map-context-menu.component.html',
  styleUrls: ['./map-context-menu.component.css']
})
export class MapContextMenuComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() position = { x: 0, y: 0 };
  @Input() contextType: 'caixa' | 'map' | 'cabo' | 'dio' | 'cliente' | 'estacao' | 'vertice' | 'poligono' = 'map'; // 🆕 Define o tipo de contexto
  @Output() action = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  // Controla qual submenu está aberto
  activeSubmenu: string | null = null;
  
  // 🆕 Proteção contra click após right-click
  private lastRightClickTime: number = 0;
  private isOpeningMenu: boolean = false; // Flag para indicar que o menu está abrindo

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 🆕 Quando o menu fica visível, registrar timestamp para proteção
    if (changes['visible'] && this.visible) {
      this.lastRightClickTime = Date.now();
      this.isOpeningMenu = true; // Marcar que está abrindo
      console.log('🕐 Timestamp registrado:', this.lastRightClickTime);
      
      // Remover a flag após 500ms
      setTimeout(() => {
        this.isOpeningMenu = false;
        console.log('✅ Proteção removida - clicks agora podem fechar o menu');
      }, 500);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Fecha o menu se clicar fora dele
    if (this.visible) {
      // 🆕 Ignorar se o menu está abrindo (primeiros 500ms)
      if (this.isOpeningMenu) {
        console.log('👆 [CONTEXT-MENU] Ignorando clique (menu está abrindo)');
        return;
      }
      
      // 🆕 Ignorar clicks que ocorrem dentro de 500ms após um right-click
      const timeSinceLastRightClick = Date.now() - this.lastRightClickTime;
      if (timeSinceLastRightClick < 500) {
        console.log('👆 [CONTEXT-MENU] Ignorando clique (provavelmente após right-click, ' + timeSinceLastRightClick + 'ms atrás)');
        return;
      }
      
      console.log('👆 [CONTEXT-MENU] Clique no documento detectado - fechando menu (após ' + timeSinceLastRightClick + 'ms)');
      this.hide();
    }
  }

  @HostListener('document:contextmenu', ['$event'])
  onDocumentRightClick(event: MouseEvent) {
    // 🆕 Ignorar se o menu está abrindo
    if (this.visible && this.isOpeningMenu) {
      console.log('🔴 [CONTEXT-MENU] Ignorando contextmenu (menu está abrindo)');
      return;
    }
    
    // Fecha o menu se clicar com botão direito em outro lugar
    if (this.visible) {
      this.hide();
    }
    // 🆕 Registrar o momento do right-click
    this.lastRightClickTime = Date.now();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    if (this.visible) {
      this.hide();
    }
  }

  /**
   * 🎯 Mostra o context menu na posição especificada
   */
  show(x: number, y: number): void {
    this.position = { x, y };
    this.visible = true;
    this.activeSubmenu = null;
    // 🆕 Registrar timestamp para proteger contra clicks após mostrar o menu
    this.lastRightClickTime = Date.now();
  }

  /**
   * ❌ Esconde o context menu
   */
  hide(): void {
    console.log('❌ [CONTEXT-MENU] hide() chamado');
    this.visible = false;
    this.activeSubmenu = null;
    this.close.emit();
    
    // 🎯 Forçar detecção de mudanças
    this.cdr.detectChanges();
  }

  /**
   * 🎯 Executa uma ação do menu
   * Usa setTimeout(0) para garantir que o parent processe a ação e capture a coordenada
   * antes do hide() emitir close e o parent limpar ultimaCoordenadaContextMenu
   * PAI é o Google-maps.component.ts
   */
  onAction(action: string): void {
    this.action.emit(action);
    setTimeout(() => this.hide(), 0);
  }

  /**
   * 📂 Toggle do submenu
   */
  toggleSubmenu(submenu: string): void {
    if (this.activeSubmenu === submenu) {
      this.activeSubmenu = null;
    } else {
      this.activeSubmenu = submenu;
    }
    
    // 🎯 Forçar detecção de mudanças imediatamente
    this.cdr.detectChanges();
  }

  /**
   * 🎯 Verifica se um submenu está ativo
   */
  isSubmenuActive(submenu: string): boolean {
    return this.activeSubmenu === submenu;
  }

  /**
   * 🎯 Ajusta a posição do menu para não sair da tela
   */
  getAdjustedPosition(): { x: number, y: number } {
    const menuWidth = 200; // Largura aproximada do menu
    const menuHeight = 300; // Altura aproximada do menu
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let x = this.position.x;
    let y = this.position.y;

    // Ajusta horizontalmente
    if (x + menuWidth > windowWidth) {
      x = windowWidth - menuWidth - 10;
    }

    // Ajusta verticalmente
    if (y + menuHeight > windowHeight) {
      y = windowHeight - menuHeight - 10;
    }

    return { x: Math.max(10, x), y: Math.max(10, y) };
  }
}
