import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VisualizaDioData, VisualizaDioConfig } from '../modelo/VisualizaDioData';
import { VisualizaDioService } from '../servico/visualiza-dio.service';
import { DioEquipamentoService } from '../servico/dio-equipamento.service';
import { FiberTraceService, FiberTraceResult, FiberTraceStep } from '../servico/fiber-trace.service';
import { FiberApiService } from '../servico/fiber-api.service';
import { DioEquip } from '../modelo/dioEquipamento';

export interface VisualizaDioDialogData {
  id_meta: number;
  config?: VisualizaDioConfig;
  capacity?: number;
}

@Component({
  selector: 'app-visualiza-dio',
  templateUrl: './visualiza-dio.component.html',
  styleUrls: ['./visualiza-dio.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ]
})
export class VisualizaDioComponent implements OnInit, OnDestroy {
  visualizaDioData: VisualizaDioData | null = null;
  isEditing = false;
  isLoading = false;
  errorMessage = '';
  
  // Formulário reativo
  visualizaDioForm: FormGroup;
  
  // Configurações
  config: VisualizaDioConfig;
  visibleFields: string[] = [];
  
  // Controle de grupos de fibras
  selectedGroup = 1; // Grupo selecionado
  fiberGroups: any[] = [];
  capacity = 144; // Capacidade padrão
  
  // Dados do FlexGrid (4 colunas x 12 linhas)
  flexGridData: any[][] = [];
  
  // Dados dos equipamentos DIO
  dioEquipData: DioEquip | null = null;
  
  // Dados de rastreamento das fibras
  fiberTraceResults: Map<number, FiberTraceResult> = new Map();
  fiberDestinations: Map<number, string> = new Map();
  fiberBdio: Map<number, string> = new Map();
  fiberFibre: Map<number, string> = new Map();
  
  // Controle de rastreamento
  isTracing = false;
  traceCancelled = false;
  
  // Propriedades para arrastar o modal (mesmo padrão do gojs-demo)
  isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private modalElement: HTMLElement | null = null;
  private modalContentElement: HTMLElement | null = null;
  private modalHeaderElement: HTMLElement | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<VisualizaDioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VisualizaDioDialogData,
    private visualizaDioService: VisualizaDioService,
    private dioEquipamentoService: DioEquipamentoService,
    private fiberTraceService: FiberTraceService,
    private fiberApiService: FiberApiService,
    private fb: FormBuilder
  ) {
    // Configuração padrão
    this.config = {
      title: `Visualiza DIO - ${data.capacity || 144}F`,
      isEditable: true,
      showAllFields: false,
      ...data.config
    };

    // Definir capacidade
    this.capacity = data.capacity || 144;
    
    // Gerar grupos de fibras baseados na capacidade
    this.generateFiberGroups();
    
    // Gerar campos visíveis baseado na capacidade
    this.visibleFields = this.visualizaDioService.generateFieldsByCapacity(this.capacity);

    // Inicializar formulário
    this.visualizaDioForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadVisualizaDioData();
    this.updateFlexGridData();
    this.setupDragFunctionality();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    const formControls: any = {};
    
    // Criar controles para todos os campos visíveis
    this.visibleFields.forEach(field => {
      formControls[field] = [''];
    });

    return this.fb.group(formControls);
  }

  private loadVisualizaDioData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Debug: verificar valores sendo enviados
    console.log('Carregando dados do DIO:');
    console.log('IDMETA:', this.data.id_meta, 'Tipo:', typeof this.data.id_meta);
    console.log('CAPACIDADE:', this.capacity, 'Tipo:', typeof this.capacity);

    // Carregar dados dos equipamentos DIO da API
    this.dioEquipamentoService.selecionar(this.data.id_meta, this.capacity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Resposta completa da API:', response);
          
          if (response && response.response && response.response.length > 0) {
            this.dioEquipData = response.response[0]; // Pegar o primeiro (e único) objeto do array response
            console.log('Dados do equipamento carregados:', this.dioEquipData);
            this.updateFlexGridData(); // Atualizar os campos baseado no grupo selecionado
            
            // Disparar rastreamento automático do primeiro grupo de fibras
            this.traceFirstGroup();
            
            this.isLoading = false;
          } else {
            this.errorMessage = 'Nenhum dado encontrado para este DIO';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Erro ao carregar dados do DIO:', error);
          this.errorMessage = 'Erro ao carregar dados: ' + error;
          this.isLoading = false;
        }
      });
  }

  private populateForm(data: VisualizaDioData): void {
    const formData: any = {};
    
    this.visibleFields.forEach(field => {
      formData[field] = (data as any)[field] || '';
    });

    this.visualizaDioForm.patchValue(formData);
  }

  toggleEdit(): void {
    if (!this.config.isEditable) return;
    
    this.isEditing = !this.isEditing;
    
    if (this.isEditing) {
      this.visualizaDioForm.enable();
    } else {
      this.visualizaDioForm.disable();
    }
  }

  saveChanges(): void {
    if (!this.visualizaDioData || !this.visualizaDioForm.valid) return;

    const formData = this.visualizaDioForm.value;
    const updateData: Partial<VisualizaDioData> = {};

    // Preparar dados para atualização
    this.visibleFields.forEach(field => {
      const value = formData[field];
      if (value && value.trim() !== '') {
        (updateData as any)[field] = value.trim();
      }
    });

    this.isLoading = true;

    // Simular salvamento para teste
    setTimeout(() => {
      console.log('Dados salvos (simulado):', updateData);
      
      // Atualizar dados locais
      if (this.visualizaDioData) {
        Object.assign(this.visualizaDioData, updateData);
        this.populateForm(this.visualizaDioData);
      }
      
      this.isEditing = false;
      this.visualizaDioForm.disable();
      this.isLoading = false;
    }, 1500); // Simular delay de salvamento
  }

  cancelEdit(): void {
    if (this.visualizaDioData) {
      this.populateForm(this.visualizaDioData);
    }
    this.isEditing = false;
    this.visualizaDioForm.disable();
  }

  getFieldValue(field: string): string {
    if (!this.visualizaDioData) return '';
    return (this.visualizaDioData as any)[field] || '';
  }

  isFieldFilled(field: string): boolean {
    const value = this.getFieldValue(field);
    return this.visualizaDioService.isFieldValid(value);
  }

  getFilledFieldsCount(): number {
    if (!this.visualizaDioData) return 0;
    return this.visualizaDioService.countFilledFields(this.visualizaDioData, this.visibleFields);
  }

  getTotalFieldsCount(): number {
    return this.visibleFields.length;
  }

  getProgressPercentage(): number {
    const filled = this.getFilledFieldsCount();
    const total = this.getTotalFieldsCount();
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  }

  close(): void {
    this.dialogRef.close();
  }

  // Métodos para controle de grupos de fibras
  selectGroup(groupId: number): void {
    this.selectedGroup = groupId;
    this.updateFlexGridData();
    console.log('Grupo selecionado:', this.selectedGroup);
    
    // Iniciar rastreamento das fibras do grupo selecionado
    this.traceAllFibersInGroup();
  }

  getCurrentGroup() {
    return this.fiberGroups.find(g => g.id === this.selectedGroup);
  }

  generateFiberGroups(): void {
    this.fiberGroups = [];
    let groupId = 1;
    
    // Gerar grupos de 12 fibras cada
    for (let start = 1; start <= this.capacity; start += 12) {
      const end = Math.min(start + 11, this.capacity);
      this.fiberGroups.push({
        id: groupId,
        label: `${start} a ${end}`,
        start: start,
        end: end
      });
      groupId++;
    }
    
    // Selecionar o primeiro grupo por padrão
    this.selectedGroup = 1;
    
    console.log('Grupos gerados:', this.fiberGroups);
    console.log('Capacidade do DIO:', this.capacity);
  }

  getConnectorNumbers(): number[] {
    const group = this.getCurrentGroup();
    if (group) {
      const numbers = [];
      for (let i = group.start; i <= group.end; i++) {
        numbers.push(i);
      }
      return numbers;
    }
    return [];
  }

  updateFlexGridData(): void {
    const group = this.getCurrentGroup();
    if (!group) return;
    
    // Calcular número de linhas baseado no grupo selecionado
    const fibersInGroup = group.end - group.start + 1;
    const rowsNeeded = Math.min(fibersInGroup, 12); // Máximo 12 linhas
    
    this.flexGridData = [];
    for (let row = 0; row < rowsNeeded; row++) {
      const fiberNumber = group.start + row;
      this.flexGridData[row] = [];
      
      // Coluna 0: Jumper (número da fibra)
      this.flexGridData[row][0] = {
        //value: fiberNumber.toString(),
        editable: false
      };
      
      // Coluna 1: Destino (resultado do rastreamento)
      this.flexGridData[row][1] = {
        value: this.getFiberDestination(fiberNumber),
        editable: false
      };
      
      // Coluna 2: Bdio (nome do DIO ou ---)
      this.flexGridData[row][2] = {
        value: this.fiberBdio.get(fiberNumber) || '---',
        editable: false
      };
      
      // Coluna 3: Fibre (fibra ou ---)
      this.flexGridData[row][3] = {
        value: this.fiberFibre.get(fiberNumber) || '---',
        editable: false
      };
    }
  }

  // Método para obter dados dos equipamentos baseado no grupo selecionado
  getEquipamentoData(fiberIndex: number): { equipamento: string, dbm: string } {
    if (!this.dioEquipData) {
      return { equipamento: '', dbm: '' };
    }

    const group = this.getCurrentGroup();
    if (!group) {
      return { equipamento: '', dbm: '' };
    }

    // Calcular o índice real da fibra (baseado no grupo)
    const realFiberIndex = group.start + fiberIndex - 1;
    
    // Mapear para os campos obs e N
    const obsField = `obs${realFiberIndex}` as keyof DioEquip;
    const nField = `N${realFiberIndex}` as keyof DioEquip;
    
    const equipamento = this.dioEquipData[obsField] || '';
    const dbm = this.dioEquipData[nField] || '';
    
    // Tratar campos vazios conforme especificado
    return {
      equipamento: equipamento ? equipamento.toString() : '',
      dbm: dbm && dbm !== 'OFF' ? dbm.toString() : ''
    };
  }

  onConnectorClick(connectorNumber: number): void {
    console.log('Conector clicado:', connectorNumber);
    // Aqui você pode adicionar lógica específica para cada conector
  }

  onFlexGridCellChange(row: number, col: number, value: string): void {
    if (this.flexGridData[row] && this.flexGridData[row][col]) {
      this.flexGridData[row][col].value = value;
      console.log(`FlexGrid [${row}][${col}] = ${value}`);
    }
  }

  getCurrentFiberNumber(rowIndex: number): number {
    const group = this.getCurrentGroup();
    if (group) {
      return group.start + rowIndex;
    }
    return rowIndex + 1;
  }

  onTracerClick(fiberNumber: number): void {
    console.log('Tracer clicado para fibra:', fiberNumber);
    // Aqui você pode implementar a lógica para acionar o tracer da rota
    // e gerar diagramas unifilares
    alert(`Tracer acionado para fibra ${fiberNumber}`);
  }

  /**
   * Rastreia todas as fibras do grupo atual e obtém os destinos (sequencialmente)
   */
  private async traceAllFibersInGroup(): Promise<void> {
    const group = this.getCurrentGroup();
    if (!group) return;

    console.log('Iniciando rastreamento das fibras do grupo:', group.label);
    this.isTracing = true;
    this.traceCancelled = false;

    // Rastrear cada fibra do grupo sequencialmente
    for (let fiberNumber = group.start; fiberNumber <= group.end; fiberNumber++) {
      // Verificar se foi cancelado
      if (this.traceCancelled) {
        console.log(`🛑 [CANCEL] Rastreamento cancelado na fibra ${fiberNumber}`);
        break;
      }
      
      console.log(`🔄 [SEQUENCIAL] Processando fibra ${fiberNumber} de ${group.end}`);
      await this.traceSingleFiber(fiberNumber);
    }
    
    this.isTracing = false;
    if (!this.traceCancelled) {
      console.log('✅ [SEQUENCIAL] Rastreamento de todas as fibras concluído');
    }
  }

  /**
   * Rastreia uma única fibra
   */
  private async traceSingleFiber(fiberNumber: number): Promise<void> {
    // Determinar a tabela e registro baseado no número da fibra (seguindo VB6)
    const tubo = this.fiberTraceService.calculateTubo(fiberNumber);
    const tabela = `dio_t${tubo}`;
    
    // Para tabelas dio_tX, o registro deve ser F{numero_da_fibra}
    // Fibra 13 no tubo 2 = F13, Fibra 1 no tubo 1 = F1, etc.
    const registro = `F${fiberNumber}`;

    console.log(`Rastreando fibra ${fiberNumber}:`, { tabela, registro, tubo });

    try {
      // Rastrear diretamente usando o ID do DIO (como no VB6)
      // O VB6 faz a consulta DENTRO do ANALISA_TABELA_INI
      const result = await this.fiberTraceService.ANALISA_TABELA_INI(this.data.id_meta, fiberNumber, tabela, registro)
        .pipe(takeUntil(this.destroy$)).toPromise();

      if (!result) {
        console.error(`Resultado do rastreamento da fibra ${fiberNumber} é undefined`);
        this.fiberDestinations.set(fiberNumber, 'ERRO - RESULTADO UNDEFINED');
        this.fiberBdio.set(fiberNumber, '---');
        this.fiberFibre.set(fiberNumber, '---');
        this.updateFlexGridData();
        return;
      }

      console.log(`Resultado do rastreamento da fibra ${fiberNumber}:`, result);
      
      // Armazenar resultado do rastreamento
      this.fiberTraceResults.set(fiberNumber, result);
      
      // Obter destino final (agora assíncrono)
      const destination = await this.getFinalDestination(result, fiberNumber);
      this.fiberDestinations.set(fiberNumber, destination);
      
      // As informações do objeto já são obtidas no getFinalDestination
      // Não precisamos chamar getObjectInfo novamente aqui
      
      // Atualizar flexgrid
      this.updateFlexGridData();
      
    } catch (error) {
      console.error(`Erro no rastreamento da fibra ${fiberNumber}:`, error);
      this.fiberDestinations.set(fiberNumber, 'ERRO');
      this.fiberBdio.set(fiberNumber, '---');
      this.fiberFibre.set(fiberNumber, '---');
      this.updateFlexGridData();
    }
  }

  /**======================================================================
   * pega o destino final da fibra vindo do serviço fiber-trace.service.ts
   *    * Obtém o destino final de um resultado de rastreamento
   ================================*/
  private async getFinalDestination(traceResult: FiberTraceResult, fiberNumber: number): Promise<string> {
    if (!traceResult.success || traceResult.trace.length === 0) {
      return 'ERRO';
    }

    const lastStep = traceResult.trace[traceResult.trace.length - 1];
    
    // Se parou em cabo aberto
    if (lastStep.tipo === 'cabo_aberto') {
      return 'CABO ABERTO';
    }

    // Se atingiu o limite de passos
    if (lastStep.tipo === 'limite_atingido') {
      return 'LIMITE ATINGIDO (150 passos)';
    }

    // Se chegou ao destino final, obter informações do objeto
    if (lastStep.status === 'fim') {
      try {
        // 🆕 NOVO: Capturar a fibra final do último step (campo fiber)
        let fibraFinal: string | undefined = undefined;
        if (typeof lastStep.fiber === 'number') {
          fibraFinal = lastStep.fiber.toString();
          console.log(`🔌 [FIBRA] Fibra final encontrada: ${fibraFinal}`);
        } else if (typeof lastStep.fiber === 'string') {
          fibraFinal = lastStep.fiber; // "E" para splitter entrada, "S" para splitter saída
          console.log(`🔌 [FIBRA] Fibra final encontrada: ${fibraFinal}`);
        }
        
        const objectInfo = await this.getObjectInfo(lastStep.idmeta, lastStep.tipo, fibraFinal);
        
        // 🆕 NOVO: Definir valores do bdio e fibre para o FlexGrid
        this.fiberBdio.set(fiberNumber, objectInfo.bdio);
        this.fiberFibre.set(fiberNumber, objectInfo.fibre);
        
        return objectInfo.destname;
      } catch (error) {
        console.error('Erro ao obter informações do objeto:', error);
        return 'ERRO';
      }
    }

    return 'EM PROCESSO';
  }

  /**
   * Obtém informações do objeto final usando a tabela ids
   * Baseado na função VB6 visualiza_campo_aplicacao()
   */
  private getObjectInfo(idmeta: number, tipo: string, fibraFinal?: string): Promise<{destname: string, bdio: string, fibre: string}> {
    return new Promise((resolve, reject) => {
      // Sempre consultar a tabela ids para obter o tipo do objeto (seguindo VB6)
      console.log(`Consultando tipo do objeto para IDMETA: ${idmeta}`);
      this.fiberApiService.executeDynamicQuery(
        'SELECT TIPO_OBJETO FROM tstmeta.ids WHERE id_meta = {idmeta}',
        { idmeta: idmeta }
      ).subscribe({
        next: (response) => {
          if (!response.success || !response.data || response.data.length === 0) {
            console.log(`Tipo do objeto não encontrado para IDMETA: ${idmeta}`);
            resolve({ destname: '-------SEM CONEXÃO------', bdio: '---', fibre: '---' });
            return;
          }

        const tipoObjeto = response.data[0].TIPO_OBJETO;
        console.log(`Tipo do objeto encontrado: ${tipoObjeto} para IDMETA: ${idmeta}`);
        console.log(`📊 [IDS] Dados completos:`, response.data[0]);
        
        // 🆕 NOVO: Usar fibraFinal diretamente se disponível
        this.getObjectNameByType(idmeta, tipoObjeto, fibraFinal).then(result => {
          // Se fibraFinal está disponível, usar diretamente
          if (fibraFinal) {
            result.fibre = fibraFinal;
            console.log(`🔌 [FIBRA] Usando fibraFinal diretamente: ${fibraFinal}`);
          }
          resolve(result);
        }).catch((error: any) => {
          console.error('Erro ao obter nome do objeto:', error);
          resolve({ destname: 'ERRO', bdio: '---', fibre: '---' });
        });
      },
      error: (error: any) => {
          console.error('Erro ao consultar tabela ids:', error);
          resolve({ destname: '-------SEM CONEXÃO------', bdio: '---', fibre: '---' });
        }
      });
    });
  }

  /**
   * Obtém o nome do objeto baseado no tipo
   * Implementa a lógica do VB6 para cada tipo de objeto
   */
  private async getObjectNameByType(idmeta: number, tipoObjeto: string, fibraFinal?: string): Promise<{destname: string, bdio: string, fibre: string}> {
    try {
      switch (tipoObjeto) {
        case 'CAIXA':
          const caixaResponse = await this.fiberApiService.executeDynamicQuery(
            'SELECT NUMEROCX AS NOME FROM tstmeta.caixa WHERE ID_META = {idmeta}',
            { idmeta: idmeta }
          ).toPromise();
          if (caixaResponse?.success && caixaResponse.data && caixaResponse.data.length > 0) {
            return {
              destname: `CAIXA ${caixaResponse.data[0].NOME}`,
              bdio: '---',
              fibre: '---'
            };
          }
          break;

        case 'POP':
          const popResponse = await this.fiberApiService.executeDynamicQuery(
            'SELECT SIGLA AS NOME FROM tst.estações WHERE ID_META = {idmeta}',
            { idmeta: idmeta }
          ).toPromise();
          if (popResponse?.success && popResponse.data && popResponse.data.length > 0) {
            return {
              destname: popResponse.data[0].NOME,
              bdio: '---',
              fibre: '---'
            };
          }
          break;

        case 'Rabicho':
          const rabichoResponse = await this.fiberApiService.executeDynamicQuery(
            'SELECT LABEL_RABICHO AS NOME FROM tstmeta.rabicho WHERE ID_META = {idmeta}',
            { idmeta: idmeta }
          ).toPromise();
          if (rabichoResponse?.success && rabichoResponse.data && rabichoResponse.data.length > 0) {
            return {
              destname: rabichoResponse.data[0].NOME,
              bdio: '---',
              fibre: '---'
            };
          }
          break;

        case 'DIO':
          console.log(`🔍 [DIO] Consultando DIO para IDMETA: ${idmeta}`);
          console.log(`🔌 [DIO] Fibra final recebida: ${fibraFinal}`);
          const dioResponse = await this.fiberApiService.executeDynamicQuery(
            'SELECT SIGLA AS NOME, ID_ESTACAO FROM tstmeta.dio WHERE id_meta = {idmeta}',
            { idmeta: idmeta }
          ).toPromise();
          console.log(`📊 [DIO] Resposta da consulta:`, dioResponse);
          if (dioResponse?.success && dioResponse.data && dioResponse.data.length > 0) {
            const bdio = dioResponse.data[0].NOME;
            const idEstacao = dioResponse.data[0].ID_ESTACAO;
            console.log(`🏠 [DIO] DIO encontrado: ${bdio}, Estação: ${idEstacao}`);
            
            // Buscar sigla da estação
            const estacaoResponse = await this.fiberApiService.executeDynamicQuery(
              'SELECT SIGLA FROM tst.estações WHERE ID_META = {idmeta}',
              { idmeta: idEstacao }
            ).toPromise();
            
            if (estacaoResponse?.success && estacaoResponse.data && estacaoResponse.data.length > 0) {
              const result = {
                destname: estacaoResponse.data[0].SIGLA,
                bdio: bdio,
                fibre: fibraFinal || '---' // 🆕 NOVO: Usar fibra final se disponível
              };
              console.log(`✅ [DIO] Resultado final:`, result);
              return result;
            }
          } else {
            console.log(`❌ [DIO] DIO não encontrado para IDMETA: ${idmeta}`);
          }
          break;

        case 'caixa':
          console.log(`🔍 [CAIXA] Consultando caixa para IDMETA: ${idmeta}`);
          const caixaResponse2 = await this.fiberApiService.executeDynamicQuery(
            'SELECT NUMERO AS NOME FROM tst.caixa WHERE ID_META = {idmeta}',
            { idmeta: idmeta }
          ).toPromise();
          console.log(`📊 [CAIXA] Resposta da consulta:`, caixaResponse2);
          if (caixaResponse2?.success && caixaResponse2.data && caixaResponse2.data.length > 0) {
            return {
              destname: `CAIXA ${caixaResponse2.data[0].NOME}`,
              bdio: '---',
              fibre: '---'
            };
          } else {
            console.log(`❌ [CAIXA] Caixa não encontrada para IDMETA: ${idmeta}`);
          }
          break;

        case 'cabo':
          return {
            destname: '- - - - - - - - - -',
            bdio: '---',
            fibre: '---'
          };

        case 'splitter':
          const splitterResponse = await this.fiberApiService.executeDynamicQuery(
            'SELECT numero_cx FROM tstmeta.splitter_e WHERE idmeta = {idmeta}',
            { idmeta: idmeta }
          ).toPromise();
          if (splitterResponse?.success && splitterResponse.data && splitterResponse.data.length > 0) {
            return {
              destname: `CX_${splitterResponse.data[0].numero_cx}:SPLITTER_${idmeta}`,
              bdio: '---',
              fibre: fibraFinal || 'E' // Usar fibraFinal se disponível, senão "E"
            };
          }
          break;

        case 'splitter_entrada':
          console.log(`🔀 [SPLITTER-ENTRADA] Consultando entrada do splitter para IDMETA: ${idmeta}`);
          const splitterEntradaResponse = await this.fiberApiService.executeDynamicQuery(
            'SELECT numero_cx FROM tstmeta.splitter_e WHERE idmeta = {idmeta}',
            { idmeta: idmeta }
          ).toPromise();
          console.log(`📊 [SPLITTER-ENTRADA] Resposta da consulta:`, splitterEntradaResponse);
          if (splitterEntradaResponse?.success && splitterEntradaResponse.data && splitterEntradaResponse.data.length > 0) {
            return {
              destname: `SPLITTER ${splitterEntradaResponse.data[0].numero_cx}`,
              bdio: '---',
              fibre: fibraFinal || 'E' // Usar fibraFinal se disponível, senão "E"
            };
          } else {
            console.log(`❌ [SPLITTER-ENTRADA] Splitter não encontrado para IDMETA: ${idmeta}`);
          }
          break;

        default:
          return {
            destname: '-------SEM CONEXÃO------',
            bdio: '---',
            fibre: '---'
          };
      }
    } catch (error) {
      console.error('Erro ao obter nome do objeto:', error);
    }

    return {
      destname: '-------SEM CONEXÃO------',
      bdio: '---',
      fibre: '---'
    };
  }

  /**
   * Obtém o destino de uma fibra específica
   */
  getFiberDestination(fiberNumber: number): string {
    return this.fiberDestinations.get(fiberNumber) || '---';
  }

  /**
   * Dispara rastreamento automático do primeiro grupo de fibras
   */
  private traceFirstGroup(): void {
    console.log('🚀 [AUTO-TRACE] Iniciando rastreamento automático do primeiro grupo');
    
    // Verificar se há grupos disponíveis
    if (this.fiberGroups.length === 0) {
      console.log('❌ [AUTO-TRACE] Nenhum grupo de fibras disponível');
      return;
    }

    // Selecionar o primeiro grupo
    const firstGroup = this.fiberGroups[0];
    this.selectedGroup = firstGroup;
    console.log(`📊 [AUTO-TRACE] Grupo selecionado: ${firstGroup.label} (fibras ${firstGroup.start}-${firstGroup.end})`);

    // Disparar rastreamento
    this.traceAllFibersInGroup();
  }

  /**
   * Cancela o rastreamento em andamento
   */
  cancelTracing(): void {
    console.log('🛑 [CANCEL] Cancelando rastreamento...');
    this.traceCancelled = true;
    this.isTracing = false;
    
    // Limpar dados parciais
    this.fiberTraceResults.clear();
    this.fiberDestinations.clear();
    this.fiberBdio.clear();
    this.fiberFibre.clear();
    this.updateFlexGridData();
    
    console.log('✅ [CANCEL] Rastreamento cancelado');
  }

  // ================================ Arrastar  Modal Drag Methods (mesmo padrão do gojs-demo) ================================
  
  private setupDragFunctionality(): void {
    setTimeout(() => {
      console.log('Configurando funcionalidade de arrastar modal');
      this.modalElement = document.querySelector('.cdk-dialog-container') as HTMLElement;
      this.modalContentElement = this.modalElement; // Mover o modal completo, não o conteúdo interno
      this.modalHeaderElement = document.querySelector('.modal-header') as HTMLElement;
      
      if (this.modalHeaderElement && this.modalContentElement) {
        console.log('Modal header encontrado para arrastar');
        // Adicionar listener apenas no cabeçalho, não no modal inteiro
        this.modalHeaderElement.addEventListener('mousedown', (e: MouseEvent) => this.dragStart(e));
        document.addEventListener('mousemove', (e: MouseEvent) => this.dragMove(e));
        document.addEventListener('mouseup', (e: MouseEvent) => this.dragEnd(e));
      } else {
        console.warn('Modal header não encontrado para configurar o arrastar');
      }
    }, 500);
  }

  private dragStart(event: MouseEvent): void {
    // Prevenir arrastar se clicou em um botão
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    console.log('Iniciando arrasto do modal');
    if (this.modalHeaderElement && 
        (event.target === this.modalHeaderElement || 
         this.modalHeaderElement.contains(event.target as Node))) {
      
      this.initialX = event.clientX - this.currentX;
      this.initialY = event.clientY - this.currentY;
      this.isDragging = true;
      
      if (this.modalContentElement) {
        this.modalContentElement.classList.add('dragging');
      }
    }
  }

  private dragMove(event: MouseEvent): void {
    if (this.isDragging && this.modalContentElement) {
      event.preventDefault();
      
      this.currentX = event.clientX - this.initialX;
      this.currentY = event.clientY - this.initialY;

      this.setTranslate(this.currentX, this.currentY, this.modalContentElement);
    }
  }

  private dragEnd(event: MouseEvent): void {
    if (this.isDragging) {
      this.initialX = this.currentX;
      this.initialY = this.currentY;
      
      this.isDragging = false;
      if (this.modalContentElement) {
        this.modalContentElement.classList.remove('dragging');
      }
    }
  }

  private setTranslate(xPos: number, yPos: number, el: HTMLElement): void {
    if (el) {
      el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
  }
}
