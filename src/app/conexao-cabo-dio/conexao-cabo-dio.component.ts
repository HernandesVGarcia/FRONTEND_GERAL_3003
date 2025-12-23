import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BandejasService } from '../servico/bandejas.service';
import { AuthService } from '../servico/auth.service';
import { ConexaoBandejaService } from '../servico/conexao-bandeja.service';
import { Bandejas } from '../modelo/Bandejas';
import { firstValueFrom } from 'rxjs';

export interface ConexaoCaboDioData {
  ponta: 'A' | 'B';
  numeroDio: string;
  idMetaDio?: number;
  idMetaCabo?: number;
  CapacidadeCabo?: number;
}

@Component({
  selector: 'app-conexao-cabo-dio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './conexao-cabo-dio.component.html',
  styleUrls: ['./conexao-cabo-dio.component.css']
})
export class ConexaoCaboDioComponent implements OnInit {
  bandejaSelecionada: string = '';
  bandejas: string[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
  bandejasEstado: boolean[] = []; // Array de 6 posições: true = livre, false = ocupada
  isLoading: boolean = false; // Flag para loading

  constructor(
    public dialogRef: MatDialogRef<ConexaoCaboDioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConexaoCaboDioData,
    private bandejasService: BandejasService,
    private authService: AuthService,
    private conexaoBandejaService: ConexaoBandejaService
  ) {
    // Inicializar todas as bandejas como livres (true)
    this.bandejasEstado = Array(6).fill(true);
  }

  async ngOnInit(): Promise<void> {
    console.log('🔌 [CONEXÃO-DIO-MODAL] Modal aberto com dados:', this.data);
    
    if (this.data.idMetaDio) {
      this.authService.setIDmetaDio(this.data.idMetaDio);
      await this.processarBandejas();
    }
  }

  /**
   * Processa as bandejas: lê do serviço, verifica quais estão livres/ocupadas
   * e preenche automaticamente a primeira bandeja livre
   */
  private async processarBandejas(): Promise<void> {
    try {
      const retorno = await firstValueFrom(this.bandejasService.selecionar());
      
      // Pegar o primeiro elemento do array retornado
      const bandejasData: Bandejas = Array.isArray(retorno) ? retorno[0] : (retorno as any).response?.[0] || retorno;
      
      if (!bandejasData) {
        console.warn('⚠️ [CONEXÃO-DIO-MODAL] Nenhum dado de bandeja retornado');
        return;
      }

      // Array com os valores das bandejas (C1, C2, ..., C6)
      const valoresBandejas: string[] = [];
      const bandejaKeys: (keyof Bandejas)[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
      
      bandejaKeys.forEach((key) => {
        valoresBandejas.push(bandejasData[key] || '');
      });

      // Processar cada bandeja: verificar se está livre (valor === "", " " ou "ZERO")
      let primeiraBandejaLivre = '';
      
      valoresBandejas.forEach((valor, index) => {
        const bandejaKey = this.bandejas[index];
        const valorLimpo = valor ? valor.trim().toUpperCase() : '';
        const estaLivre = valorLimpo === '' || valorLimpo === 'ZERO';
        
        this.bandejasEstado[index] = estaLivre;
        
        // Encontrar primeira bandeja livre
        if (estaLivre && primeiraBandejaLivre === '') {
          primeiraBandejaLivre = bandejaKey;
        }
      });

      // Preencher automaticamente a primeira bandeja livre
      if (primeiraBandejaLivre !== '') {
        this.bandejaSelecionada = primeiraBandejaLivre;
        console.log(`🔌 [CONEXÃO-DIO-MODAL] Primeira bandeja livre: ${this.bandejaSelecionada}`);
      } else {
        console.warn('⚠️ [CONEXÃO-DIO-MODAL] Todas as bandejas estão ocupadas!');
      }

    } catch (error) {
      console.error('❌ [CONEXÃO-DIO-MODAL] Erro ao processar bandejas:', error);
      alert('Erro ao carregar informações das bandejas do DIO.');
    }
  }

  /**
   * Verifica se uma bandeja está livre
   */
  isBandejaLivre(bandeja: string): boolean {
    const index = this.bandejas.indexOf(bandeja);
    return index >= 0 && this.bandejasEstado[index] === true;
  }

  /**
   * Seleciona uma bandeja e atualiza o campo de texto
   */
  selecionarBandeja(bandeja: string): void {
    if (!this.isBandejaLivre(bandeja)) {
      return; // Não permite selecionar bandeja ocupada
    }
    
    this.bandejaSelecionada = bandeja;
    console.log(`🔌 [CONEXÃO-DIO-MODAL] Bandeja selecionada: ${this.bandejaSelecionada}`);
  }

  /**
   * Confirma a conexão e chama a API
   */
  async confirmarConexao(): Promise<void> {
    if (!this.bandejaSelecionada || !this.bandejas.includes(this.bandejaSelecionada)) {
      alert('Por favor, selecione uma bandeja válida (C1-C6)');
      return;
    }
    
    if (!this.isBandejaLivre(this.bandejaSelecionada)) {
      alert('Esta bandeja já está ocupada. Por favor, selecione outra bandeja.');
      return;
    }

    // Validar dados obrigatórios
    if (!this.data.idMetaDio || !this.data.idMetaCabo || !this.data.CapacidadeCabo) {
      alert('Erro: Dados do cabo ou DIO não encontrados. Não é possível conectar.');
      console.error('❌ [CONEXÃO-DIO-MODAL] Dados faltando:', {
        idMetaDio: this.data.idMetaDio,
        idMetaCabo: this.data.idMetaCabo,
        CapacidadeCabo: this.data.CapacidadeCabo
      });
      return;
    }

    // Preparar requisição
    const request = {
      numero_bandeja: this.bandejaSelecionada,
      idmeta_dio: this.data.idMetaDio,
      idmeta_cabo: this.data.idMetaCabo,
      Ponta_cabo: this.data.ponta,
      Capacidade_cabo: this.data.CapacidadeCabo
    };

    console.log('🔌 [CONEXÃO-DIO-MODAL] Enviando requisição de conexão:', request);

    // Ativar loading
    this.isLoading = true;

    try {
      const response = await firstValueFrom(this.conexaoBandejaService.conectar(request));
      
      console.log('✅ [CONEXÃO-DIO-MODAL] Conexão realizada com sucesso:', response);
      
      // Fechar modal com sucesso
      const resultado = {
        ponta: this.data.ponta,
        numeroDio: this.data.numeroDio,
        idMetaDio: this.data.idMetaDio,
        bandeja: this.bandejaSelecionada,
        confirmado: true,
        response: response
      };

      this.dialogRef.close(resultado);
      
      // Mostrar mensagem de sucesso
      alert(`✅ Conexão realizada com sucesso!\n\n${response.message}`);
      
    } catch (error: any) {
      console.error('❌ [CONEXÃO-DIO-MODAL] Erro ao conectar:', error);
      alert(`❌ Erro ao conectar o cabo:\n\n${error.message || error}`);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Cancela a conexão e fecha o modal
   */
  cancelarConexao(): void {
    console.log('❌ [CONEXÃO-DIO-MODAL] Conexão cancelada');
    this.dialogRef.close({ confirmado: false });
  }
}

