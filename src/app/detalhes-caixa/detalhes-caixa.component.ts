import { Component, Input, OnInit, OnChanges, SimpleChanges, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TiposService } from '../servico/tipos.service';
import { UpdateTipagemCaixaService, UpdateTipagemCaixaRequest } from '../servico/update-tipagem-caixa.service';
import { AuthService } from '../servico/auth.service';

export interface DetalhesCaixaData {
  id_meta: number;
  tipagem?: string;
  ID_TIPO?: string;
  lat?: number;
  lng?: number;
  labelCaixa?: string;
  endereco?: string;
  obs?: string;
  
}

@Component({
  selector: 'app-detalhes-caixa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbModule
  ],
  templateUrl: './detalhes-caixa.component.html',
  styleUrls: ['./detalhes-caixa.component.css']
})
export class DetalhesCaixaComponent implements OnInit, OnChanges {
  tipagens: string[] = [];
  carregandoTipos: boolean = false;
  salvando: boolean = false;

  form = {
    tipagem: 'INDEFINIDO',
    lat: '',
    lng: '',
    labelCaixa: '',
    endereco: '',
    obs: ''
  };

  @Input() data: DetalhesCaixaData = { id_meta: 0 };

  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;

  @ViewChild('modalDialog', { static: false }) modalDialog!: ElementRef;

  constructor(
    public activeModal: NgbActiveModal,
    private tiposService: TiposService,
    private updateTipagemCaixaService: UpdateTipagemCaixaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.carregarTiposCaixa();
    this.atualizarFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.atualizarFormulario();
    }
  }

  private atualizarFormulario(): void {
    if (this.data) {
      this.form.tipagem = this.data.tipagem || 'INDEFINIDO';
      this.form.lat = this.data.lat?.toString().replace('.', ',') || '';
      this.form.lng = this.data.lng?.toString().replace('.', ',') || '';
      this.form.labelCaixa = this.data.labelCaixa || '';
      this.form.endereco = this.data.endereco || '';
      this.form.obs = this.data.obs || '';
    }
  }

  carregarTiposCaixa(): void {
    this.carregandoTipos = true;

    this.tiposService.buscarTiposCaixa().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          this.tipagens = response.data.map((item: any) => item.tipocaixa || item.tipo || item.descrição || item.nome || '');
          this.tipagens = this.tipagens.filter(tipo => tipo && tipo.trim() !== '');
          // Resolver tipagem a partir de ID_TIPO quando tipagem não está definida
          const tipagemDefinida = this.data.tipagem && this.data.tipagem.trim() !== '' && this.data.tipagem !== 'INDEFINIDO';
          if (!tipagemDefinida && this.data.ID_TIPO && this.tipagens.length > 0) {
            const idx = parseInt(this.data.ID_TIPO, 10) - 1;
            if (idx >= 0 && idx < this.tipagens.length) {
              this.form.tipagem = this.tipagens[idx];
            } else if (!this.tipagens.includes(this.form.tipagem)) {
              this.form.tipagem = this.tipagens[0];
            }
          } else if (!this.tipagens.includes(this.form.tipagem)) {
            if (this.tipagens.length > 0) {
              this.form.tipagem = this.tipagens[0];
            }
          }
        } else {
          this.tipagens = ['INDEFINIDO'];
        }
        this.carregandoTipos = false;
      },
      error: () => {
        this.tipagens = ['FOSC', 'FIST CANINHOS', 'FIST SEM CANINHOS', 'PLP', 'TYCO QUADRADA', 'MINI-CEO FIBRACEM', 'INDEFINIDO', 'TERMINADOR', 'PLP FIBRACEM', 'NAP', 'NAP_C18', 'NAP_C10', 'NAP_C24'];
        this.carregandoTipos = false;
      }
    });
  }

  trackByOption(index: number, option: string): string {
    return option || `empty-${index}`;
  }

  getImagemCaixa(): string {
    if (!this.form.tipagem) return 'assets/BLOCO.png';
    const mapeamentoImagens: { [key: string]: string } = {
      'FOSC': 'assets/icones_tipos_caixas/figuras/1_FOSC.jpg',
      'FIST CANINHOS': 'assets/icones_tipos_caixas/figuras/2_FIST_CANINHOS.png',
      'FIST SEM CANINHOS': 'assets/icones_tipos_caixas/figuras/3_FIST_SEM_CANINHOS.jpg',
      'PLP': 'assets/icones_tipos_caixas/figuras/4_PLP.jpg',
      'TYCO QUADRADA': 'assets/icones_tipos_caixas/figuras/5_TYCO_QUADRADA.jpg',
      'MINI-CEO FIBRACEM': 'assets/icones_tipos_caixas/figuras/6_MINI_CEO.jpg',
      'INDEFINIDO': 'assets/icones_tipos_caixas/figuras/7_INDEFINIDO.jpg',
      'TERMINADOR': 'assets/icones_tipos_caixas/figuras/8_TERMINADOR.jpg',
      'PLP FIBRACEM': 'assets/icones_tipos_caixas/figuras/9_PLP_FIBRACEM.jpg',
      'NAP': 'assets/icones_tipos_caixas/figuras/10_NAP.jpg',
      'NAP_C18': 'assets/icones_tipos_caixas/figuras/11_NAP_C18.jpg',
      'NAP_C10': 'assets/icones_tipos_caixas/figuras/12_NAP_C10.jpg',
      'NAP_C24': 'assets/icones_tipos_caixas/figuras/13_NAP_C24.jpg'
    };
    const tipoNormalizado = this.form.tipagem.trim();
    const imagem = mapeamentoImagens[this.form.tipagem] ||
      Object.entries(mapeamentoImagens).find(([key]) =>
        key.toUpperCase().trim() === tipoNormalizado.toUpperCase()
      )?.[1];
    return imagem || 'assets/BLOCO.png';
  }

  onImagemError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.src = 'assets/BLOCO.png';
  }

  salvar(): void {
    if (!this.form.tipagem || this.form.tipagem.trim() === '') {
      alert('Por favor, selecione uma tipagem.');
      return;
    }
    
    const indiceTipagem = this.tipagens.indexOf(this.form.tipagem);
    if (indiceTipagem === -1) {
      alert('Tipo de caixa inválido. Selecione um tipo válido.');
      return;
    }
    const ID_TIPO = (indiceTipagem + 1).toString();

    const numeroLabel = this.form.labelCaixa?.trim() || this.data.id_meta?.toString() || '0';

    const request: UpdateTipagemCaixaRequest = {
      id_meta: this.data.id_meta,
      ID_TIPO: ID_TIPO,
      NUMERO: numeroLabel,
      LOCALIZACAO: this.form.endereco?.trim() || ' ',
      TIPO: this.form.tipagem,
      OBSERVACAO: this.form.obs?.trim() || '',
      
    };

    this.salvando = true;
    this.updateTipagemCaixaService.atualizarTipagem(request).subscribe({
      next: (response) => {
        this.salvando = false;
        if (response.success) {
          const resultado = {
            id_meta: this.data.id_meta,
            tipagem: this.form.tipagem,
            ID_TIPO,
            lat: this.data.lat,
            lng: this.data.lng,
            labelCaixa: numeroLabel,
            endereco: this.form.endereco || undefined,
            obs: this.form.obs || undefined
          };
          this.activeModal.close(resultado);
        } else {
          alert(response.error || 'Erro ao atualizar caixa.');
        }
      },
      error: (error) => {
        this.salvando = false;
        alert(`Erro ao atualizar caixa: ${error}`);
      }
    });
  }

  fechar(): void {
    this.activeModal.dismiss();
  }

  onMouseDown(event: MouseEvent): void {
    if (event.target instanceof HTMLElement) {
      const header = event.target.closest('.modal-header');
      if (header && !event.target.closest('.btn-close')) {
        this.initialX = event.clientX - this.xOffset;
        this.initialY = event.clientY - this.yOffset;
        if (event.target === header || header.contains(event.target)) {
          this.isDragging = true;
          event.preventDefault();
        }
      }
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      event.preventDefault();
      this.currentX = event.clientX - this.initialX;
      this.currentY = event.clientY - this.initialY;
      this.xOffset = this.currentX;
      this.yOffset = this.currentY;
      if (this.modalDialog) {
        this.modalDialog.nativeElement.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.initialX = this.currentX;
    this.initialY = this.currentY;
    this.isDragging = false;
  }
}
