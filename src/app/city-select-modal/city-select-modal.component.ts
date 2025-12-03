import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CidadesService } from '../servico/cidades.service';
import { Cidades } from '../modelo/Cidades';
import { AuthService } from '../servico/auth.service';
import { InsertLogService } from '../servico/insert-log.service';

@Component({
  selector: 'app-city-select-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    AsyncPipe
  ],
  templateUrl: './city-select-modal.component.html',
  styleUrls: ['./city-select-modal.component.css']
})
export class CitySelectModalComponent implements OnInit {
  @Output() citySelected = new EventEmitter<number>();
  @Output() modalClosed = new EventEmitter<void>();

  myControl = new FormControl<Cidades | string>('');
  listaCidades: Cidades[] = [];
  filteredOptions: Observable<Cidades[]> | undefined;
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
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.CIDADE || '';
        return this._filter(name);
      }),
    );

    // Adicionando um listener para capturar quando uma cidade é selecionada
    this.myControl.valueChanges.subscribe(value => {
      if (value && typeof value === 'object') {
        this.cidadeSelecionada = value as Cidades;
      }
    });
  }

  private _filter(value: string): Cidades[] {
    const filterValue = value.toLowerCase();
    return this.listaCidades.filter(cidade => cidade.CIDADE?.toLowerCase().includes(filterValue));
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
        console.log('Cidades carregadas:', this.listaCidades.length);
        this.loading = false;
      },
      error: (erro: any) => {
        console.error('Erro ao carregar cidades:', erro);
        this.error = 'Erro ao carregar cidades. Por favor, tente novamente.';
        this.loading = false;
      }
    });
  }

  confirmarSelecao() {
    if (this.cidadeSelecionada && this.cidadeSelecionada.IDCIDADES !== undefined) {
      if (this.cidadeSelecionada.IDCIDADES !== null) {
       
        console.log('Confirmando seleção da cidade:', this.cidadeSelecionada.CIDADE, 'ID:', this.cidadeSelecionada.IDCIDADES);
        this.citySelected.emit(this.cidadeSelecionada.IDCIDADES);

        // Inserir log de seleção de cidade com id_evento 27
        const idUsuario = this.authService.getIdUser();
        if (idUsuario) {
          console.log('🔄 Inserindo log de seleção de cidade...');
          this.insertLogService.inserirLog({
            id_usuario: idUsuario,
            id_evento: 27,
            id_city: this.cidadeSelecionada.IDCIDADES,
            id_meta_objeto: 0,
            descricao: 'Carrega cidade bem-sucedida',
            VERSION: 'Fiberworks WEB 1.0.0'
          }).subscribe({
            next: (logResponse) => {
              console.log('✅ Log de seleção de cidade inserido com sucesso:', logResponse);
            },
            error: (error) => {
              console.error('❌ Erro ao inserir log de seleção de cidade:', error);
              // Não bloquear o fluxo da seleção de cidade se o log falhar
            }
          });
        } else {
          console.warn('⚠️ ID do usuário não encontrado, log de seleção de cidade não será inserido');
        }
      }
    } else {
      console.warn('Tentativa de confirmar seleção sem cidade válida');
    }

    
  }

  fecharModal() {
    console.log('Fechando modal sem seleção');
    this.modalClosed.emit();
  }

  displayFn(cidade: Cidades): string {
    return cidade && cidade.CIDADE ? cidade.CIDADE : '';
  }
}
