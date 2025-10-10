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
  @Output() action = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  // Controla qual submenu está aberto
  activeSubmenu: string | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Fecha o menu se clicar fora dele
    if (this.visible) {
      this.hide();
    }
  }

  @HostListener('document:contextmenu', ['$event'])
  onDocumentRightClick(event: MouseEvent) {
    // Fecha o menu se clicar com botão direito em outro lugar
    if (this.visible) {
      this.hide();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
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
  }

  /**
   * ❌ Esconde o context menu
   */
  hide(): void {
    this.visible = false;
    this.activeSubmenu = null;
    this.close.emit();
    
    // 🎯 Forçar detecção de mudanças
    this.cdr.detectChanges();
  }

  /**
   * 🎯 Executa uma ação do menu
   */
  onAction(action: string): void {
    this.action.emit(action);
    this.hide();
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
