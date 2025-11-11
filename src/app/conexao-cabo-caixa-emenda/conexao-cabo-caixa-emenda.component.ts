import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { BocasService } from '../servico/bocas.service';
import { AuthService } from '../servico/auth.service';
import { Bocas } from '../modelo/Bocas';
import { firstValueFrom } from 'rxjs';

export interface ConexaoCaboCaixaEmendaData {
  ponta: 'A' | 'B';
  numeroCaixa: string;
  idMetaCaixa?: number;
}

@Component({
  selector: 'app-conexao-cabo-caixa-emenda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule
  ],
  templateUrl: './conexao-cabo-caixa-emenda.component.html',
  styleUrls: ['./conexao-cabo-caixa-emenda.component.css']
})
export class ConexaoCaboCaixaEmendaComponent implements OnInit {
  bocaSelecionada: string = '';
  bocas: number[] = [];
  bocasEstado: boolean[] = []; // Array de 18 posições: true = livre, false = ocupada

  constructor(
    public dialogRef: MatDialogRef<ConexaoCaboCaixaEmendaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConexaoCaboCaixaEmendaData,
    private bocasService: BocasService,
    private authService: AuthService
  ) {
    // Gerar array de bocas de 1 a 18
    this.bocas = Array.from({ length: 18 }, (_, i) => i + 1);
    // Inicializar todas as bocas como livres (true)
    this.bocasEstado = Array(18).fill(true);
  }

  async ngOnInit(): Promise<void> {
    console.log('🔌 [CONEXÃO-MODAL] Modal aberto com dados:', this.data);
    
    if (this.data.idMetaCaixa) {
      this.authService.setIDmetaCaixa(this.data.idMetaCaixa);
      await this.processarBocas();
    }
  }

  /**
   * Processa as bocas: lê do serviço, verifica quais estão livres/ocupadas
   * e preenche automaticamente a primeira boca livre
   */
  private async processarBocas(): Promise<void> {
    try {
      const retorno = await firstValueFrom(this.bocasService.selecionar());
      
      // Pegar o primeiro elemento do array retornado
      const bocasData: Bocas = Array.isArray(retorno) ? retorno[0] : (retorno as any).response?.[0] || retorno;
      
      if (!bocasData) {
        console.warn('⚠️ [CONEXÃO-MODAL] Nenhum dado de boca retornado');
        return;
      }

      // Array com os valores das bocas (BOCA1, BOCA2, ..., BOCA18)
      const valoresBocas: string[] = [];
      for (let i = 1; i <= 18; i++) {
        const bocaKey = `BOCA${i}` as keyof Bocas;
        valoresBocas.push(bocasData[bocaKey] || '');
      }

      // Processar cada boca: verificar se está livre (valor === " ") ou ocupada
      let primeiraBocaLivre = 0;
      
      valoresBocas.forEach((valor, index) => {
        const numeroBoca = index + 1;
        const estaLivre = valor.trim() === '' || valor.trim() === ' ';
        
        this.bocasEstado[index] = estaLivre;
        
        // Encontrar primeira boca livre
        if (estaLivre && primeiraBocaLivre === 0) {
          primeiraBocaLivre = numeroBoca;
        }
      });

      // Preencher automaticamente a primeira boca livre
      if (primeiraBocaLivre > 0) {
        this.bocaSelecionada = primeiraBocaLivre.toString().padStart(2, '0');
        console.log(`🔌 [CONEXÃO-MODAL] Primeira boca livre: ${this.bocaSelecionada}`);
      } else {
        console.warn('⚠️ [CONEXÃO-MODAL] Todas as bocas estão ocupadas!');
      }

    } catch (error) {
      console.error('❌ [CONEXÃO-MODAL] Erro ao processar bocas:', error);
      alert('Erro ao carregar informações das bocas da caixa.');
    }
  }

  /**
   * Verifica se uma boca está livre
   */
  isBocaLivre(numeroBoca: number): boolean {
    return this.bocasEstado[numeroBoca - 1] === true;
  }

  /**
   * Seleciona uma boca e atualiza o campo de texto
   */
  selecionarBoca(numeroBoca: number): void {
    if (!this.isBocaLivre(numeroBoca)) {
      return; // Não permite selecionar boca ocupada
    }
    
    this.bocaSelecionada = numeroBoca.toString().padStart(2, '0');
    console.log(`🔌 [CONEXÃO-MODAL] Boca selecionada: ${this.bocaSelecionada}`);
  }

  /**
   * Confirma a conexão e fecha o modal retornando os dados
   */
  confirmarConexao(): void {
    if (!this.bocaSelecionada || this.bocaSelecionada.length !== 2) {
      alert('Por favor, selecione uma boca válida (01-18)');
      return;
    }

    const bocaNumero = parseInt(this.bocaSelecionada, 10);
    
    if (!this.isBocaLivre(bocaNumero)) {
      alert('Esta boca já está ocupada. Por favor, selecione outra boca.');
      return;
    }

    const resultado = {
      ponta: this.data.ponta,
      numeroCaixa: this.data.numeroCaixa,
      idMetaCaixa: this.data.idMetaCaixa,
      boca: bocaNumero,
      confirmado: true
    };

    console.log('✅ [CONEXÃO-MODAL] Conexão confirmada:', resultado);
    this.dialogRef.close(resultado);
  }

  /**
   * Cancela a conexão e fecha o modal
   */
  cancelarConexao(): void {
    console.log('❌ [CONEXÃO-MODAL] Conexão cancelada');
    this.dialogRef.close({ confirmado: false });
  }
}

