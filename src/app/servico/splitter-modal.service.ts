import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class SplitterModalService {
  
  constructor(private dialog: MatDialog) {}

  async openSplitterModal(idmeta: number, capacidade: number, label: string): Promise<void> {
    console.log(`🔀 [SPLITTER-SERVICE] Abrindo modal para splitter: ${idmeta}`);
    
    try {
      // Import dinâmico do componente
      const module = await import('../graphviz-splitter-modal/graphviz-splitter-modal.component');
      const GraphvizSplitterModalComponent = module.GraphvizSplitterModalComponent;
      
      this.dialog.open(GraphvizSplitterModalComponent, {
        width: '90vw',
        height: '90vh',
        maxWidth: '1400px',
        maxHeight: '900px',
        disableClose: false,
        data: {
          idmeta: idmeta,
          capacidade: capacidade,
          label: label
        },
        panelClass: 'graphviz-splitter-modal-container'
      });
      
      console.log(`🔀 [SPLITTER-SERVICE] Modal aberto para splitter: ${idmeta}`);
    } catch (error) {
      console.error('❌ [SPLITTER-SERVICE] Erro ao abrir modal:', error);
    }
  }
}
