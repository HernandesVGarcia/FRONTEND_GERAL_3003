import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CidadesService } from '../servico/cidades.service';
import { Cidades } from '../modelo/Cidades';
import { AuthService } from '../servico/auth.service';
import { InsertLogService } from '../servico/insert-log.service';

@Component({
  selector: 'app-city-select-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './city-select-modal.component.html',
  styleUrls: ['./city-select-modal.component.css']
})
export class CitySelectModalComponent implements OnInit {
  @Output() citySelected = new EventEmitter<number>();
  @Output() modalClosed = new EventEmitter<void>();

  idCidadeSelecionado: number | null = null;
  listaCidades: Cidades[] = [];
  cidadeSelecionada: Cidades | null = null;
  loading = false;
  error = '';

  constructor(
    private cidadesService: CidadesService,
    private authService: AuthService,
    private insertLogService: InsertLogService
  ) {}

  ngOnInit() {
    console.log('Modal de cidade inicializado');
    this.carregarCidades();
  }

  onCidadeChange(id: number | string | null) {
    if (id == null) {
      this.cidadeSelecionada = null;
      return;
    }
    const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
    this.cidadeSelecionada = this.listaCidades.find(c => c.IDCIDADES === idNum) ?? null;
  }

  carregarCidades() {
    this.loading = true;
    this.error = '';
    
    console.log('Carregando lista de cidades...');
    this.cidadesService.selecionar().subscribe({
      next: (retorno: any) => {
        if ('response' in retorno) {
          this.listaCidades = (retorno as any).response;
        } else {
          this.listaCidades = retorno as Cidades[];
        }
        this.listaCidades.sort((a, b) => (a.CIDADE || '').localeCompare(b.CIDADE || ''));
        console.log('Cidades carregadas:', this.listaCidades.length);
        this.loading = false;

        if (this.listaCidades.length === 1) {
          this.emitirSelecaoCidade(this.listaCidades[0]);
          return;
        }
      },
      error: (erro: any) => {
        console.error('Erro ao carregar cidades:', erro);
        this.error = 'Erro ao carregar cidades. Por favor, tente novamente.';
        this.loading = false;
      }
    });
  }

  confirmarSelecao() {
    this.emitirSelecaoCidade(this.cidadeSelecionada);
  }

  private emitirSelecaoCidade(cidade: Cidades | null): void {
    if (!cidade?.IDCIDADES) {
      console.warn('Tentativa de confirmar seleção sem cidade válida');
      return;
    }
    console.log('Confirmando seleção da cidade:', cidade.CIDADE, 'ID:', cidade.IDCIDADES);
    if (cidade.POSTES_LISTA?.length) {
      this.authService.setPostesTabelas(cidade.POSTES_LISTA);
    } else {
      this.authService.setPostesTabela(cidade.POSTES ?? 'Indefinido');
    }
    this.citySelected.emit(cidade.IDCIDADES);

    const idUsuario = this.authService.getIdUser();
    if (idUsuario) {
      console.log('🔄 Inserindo log de seleção de cidade...');
      this.insertLogService.inserirLog({
        id_usuario: idUsuario,
        id_evento: 27,
        id_city: cidade.IDCIDADES,
        id_meta_objeto: 0,
        descricao: 'Carrega cidade bem-sucedida',
        VERSION: 'Fiberworks WEB 1.0.0'
      }).subscribe({
        next: (logResponse) => {
          console.log('✅ Log de seleção de cidade inserido com sucesso:', logResponse);
        },
        error: (error) => {
          console.error('❌ Erro ao inserir log de seleção de cidade:', error);
        }
      });
    } else {
      console.warn('⚠️ ID do usuário não encontrado, log de seleção de cidade não será inserido');
    }
  }

  fecharModal() {
    console.log('Fechando modal sem seleção');
    this.modalClosed.emit();
  }
}
