import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { timeout, retry } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';
import { Cabo_destino_CX } from '../modelo/Cabo_destino_CX';
import { DestinoSigla } from '../modelo/DestinoSigla';

@Injectable({
  providedIn: 'root'
})
export class PesquisaSiglaService {

  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 3;

  // Mapeamento dos tipos para suas rotas correspondentes
  private readonly ROTAS_TIPO = {
    'CAIXA': '/pesquisa-caixa',
    'DIO': '/pesquisa-dio', 
    'POP': '/pesquisa-pop',
    'CABO': '/pesquisa-cabo'
  };

  // Mapeamento dos tipos para o campo de sigla na resposta
  private readonly CAMPO_SIGLA = {
    'CAIXA': 'NUMERO',
    'DIO': 'sigla',
    'POP': 'SIGLA', 
    'CABO': 'Label_cabo'
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Pesquisa a sigla de um objeto baseado no seu tipo e id_meta
   */
  async pesquisarSiglaAsync(id_meta: string, tipo_objeto: string): Promise<string> {
    try {
      const rota = this.ROTAS_TIPO[tipo_objeto as keyof typeof this.ROTAS_TIPO];
      const campoSigla = this.CAMPO_SIGLA[tipo_objeto as keyof typeof this.CAMPO_SIGLA];
      
      if (!rota || !campoSigla) {
        console.warn(`Tipo de objeto não suportado: ${tipo_objeto}`);
        return '';
      }

      const token = this.authService.getToken();
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`);

      const body = {
        ID_META: id_meta
      };

      const url = `${this.baseUrl}${rota}`;
      
      console.log(`Pesquisando sigla para ${tipo_objeto} id_meta=${id_meta} em ${url}`);
      
      const response = await firstValueFrom(
        this.http.post<any>(url, body, { headers }).pipe(
          timeout(this.TIMEOUT),
          retry(this.RETRY_ATTEMPTS)
        )
      );
      
      // Extrair dados da resposta
      let dados;
      if (response && response.response && Array.isArray(response.response) && response.response.length > 0) {
        dados = response.response[0];
      } else if (response && !response.response) {
        dados = response;
      } else {
        console.warn(`Nenhum dado encontrado para ${tipo_objeto} id_meta=${id_meta}`);
        return '';
      }

      // Extrair o campo de sigla específico
      const sigla = dados[campoSigla] || '';
      console.log(`Sigla encontrada para ${tipo_objeto} id_meta=${id_meta}: ${sigla}`);
      
      return sigla.toString();
      
    } catch (error) {
      console.error(`Erro ao pesquisar sigla para ${tipo_objeto} id_meta=${id_meta}:`, error);
      return '';
    }
  }

  /**
   * Cria um array de DestinoSigla baseado no VetorDestinoCabos
   * Mantém a mesma sequência para arrays paralelos
   */
  async criarVetorDestinoSiglasAsync(vetorDestinoCabos: Cabo_destino_CX[]): Promise<DestinoSigla[]> {
    const vetorSiglas: DestinoSigla[] = [];
    
    const promessas = vetorDestinoCabos.map(async (destino, index) => {
      if (destino.id_meta && destino.tipo_objeto) {
        const sigla = await this.pesquisarSiglaAsync(destino.id_meta, destino.tipo_objeto);//função aqui em cima nesse serviço
        return {
          tipo_objeto: destino.tipo_objeto,
          id_meta: destino.id_meta,
          sigla: sigla
        };
      } else {
        return {
          tipo_objeto: destino.tipo_objeto || '',
          id_meta: destino.id_meta || '',
          sigla: ''
        };
      }
    });

    const resultados = await Promise.all(promessas);
    vetorSiglas.push(...resultados);
    
    console.log('VetorDestinoSiglas criado:', vetorSiglas);
    return vetorSiglas;
  }
}
