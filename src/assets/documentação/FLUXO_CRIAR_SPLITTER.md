# Fluxo de Criação de Splitter

## Diagrama Simplificado - Chamadas de Métodos

```mermaid
flowchart TD
    Start([Usuário: Clique botão direito<br/>em área em branco]) --> GoJSListener[GoJS: BackgroundContextClicked<br/>Listener]
    
    GoJSListener --> ShowMenu[gojs-demo.component.ts<br/>showBlankAreaContextMenu<br/>screenX, screenY, docX, docY]
    
    ShowMenu --> HandleAction[gojs-demo.component.ts<br/>handleBlankAreaMenuAction<br/>action, docX, docY]
    
    HandleAction --> OpenModal[gojs-demo.component.ts<br/>abrirModalSelecionarSplitter<br/>docX, docY]
    
    OpenModal --> ModalInit[plota-splitter.component.ts<br/>ngOnInit]
    
    ModalInit --> LoadTypes[plota-splitter.component.ts<br/>carregarSplittersBalanceados]
    
    LoadTypes --> TiposService[tipos.service.ts<br/>buscarTiposSplitter]
    
    TiposService --> API1[HTTP GET<br/>/tipos/splitter]
    
    API1 --> FilterTypes[plota-splitter.component.ts<br/>Filtra BALANCEADO]
    
    FilterTypes --> UserPlot[Usuário: Seleciona tipo<br/>e clica Plotar]
    
    UserPlot --> OnPlotar[plota-splitter.component.ts<br/>onPlotar]
    
    OnPlotar --> CloseModal[plota-splitter.component.ts<br/>dialogRef.close<br/>PlotaSplitterResult]
    
    CloseModal --> AfterClosed[gojs-demo.component.ts<br/>dialogRef.afterClosed<br/>subscribe]
    
    AfterClosed --> CreateSplitter[gojs-demo.component.ts<br/>criarSplitter<br/>result, docX, docY]
    
    CreateSplitter --> GetIDMeta[gojs-demo.component.ts<br/>authService.getIDmetaCaixa]
    
    CreateSplitter --> GetNumCX[gojs-demo.component.ts<br/>this.caixaNumerocx]
    
    CreateSplitter --> GetCity[gojs-demo.component.ts<br/>authService.getIdCity]
    
    CreateSplitter --> GetCapacity[gojs-demo.component.ts<br/>getCapacidadeFromTipo<br/>tipoSplitter.id]
    
    GetIDMeta --> BuildRequest[gojs-demo.component.ts<br/>Monta InsertSplitterRequest]
    GetNumCX --> BuildRequest
    GetCity --> BuildRequest
    GetCapacity --> BuildRequest
    
    BuildRequest --> CallService[gojs-demo.component.ts<br/>insertSplitterService<br/>.inserirSplitter request]
    
    CallService --> ServiceMethod[insert-splitter.service.ts<br/>inserirSplitter<br/>InsertSplitterRequest]
    
    ServiceMethod --> GetToken[insert-splitter.service.ts<br/>authService.getToken]
    
    GetToken --> HTTPPost[insert-splitter.service.ts<br/>HTTP POST /insert_splitter<br/>Authorization Bearer]
    
    HTTPPost --> APIValidate[insert_splitter.js<br/>validarDadosEntrada<br/>body]
    
    APIValidate --> StartTrans[insert_splitter.js<br/>conn.beginTransaction]
    
    StartTrans --> InsertIDs[insert_splitter.js<br/>executarQuery<br/>INSERT tstmeta.ids]
    
    InsertIDs --> InsertSplitterE[insert_splitter.js<br/>executarQuery<br/>INSERT tstmeta.splitter_e]
    
    InsertSplitterE --> GetTubos[insert_splitter.js<br/>getTubosParaCapacidade<br/>CAPACIDADE]
    
    GetTubos --> LoopTubos[insert_splitter.js<br/>Loop: executarQuery<br/>INSERT splitter_t1 até splitter_tN]
    
    LoopTubos --> LoopFibras[insert_splitter.js<br/>Loop: executarQuery<br/>UPDATE splitter_tX SET FNL]
    
    LoopFibras --> Commit[insert_splitter.js<br/>conn.commit]
    
    Commit --> ReturnSuccess[insert_splitter.js<br/>res.status 200<br/>InsertSplitterResponse]
    
    ReturnSuccess --> ServiceNext[insert-splitter.service.ts<br/>Observable next<br/>InsertSplitterResponse]
    
    ServiceNext --> AddToDiagram[gojs-demo.component.ts<br/>adicionarSplitterAoDiagrama<br/>splitterData]
    
    AddToDiagram --> GetModel[gojs-demo.component.ts<br/>splitter12/14/18/116<br/>.getModelDefinition]
    
    GetModel --> AddNode[gojs-demo.component.ts<br/>model.addNodeData<br/>splitterNode]
    
    AddNode --> SetTimeout[gojs-demo.component.ts<br/>setTimeout 10ms]
    
    SetTimeout --> FindNode[gojs-demo.component.ts<br/>diagram.findNodeForKey<br/>Splitter{id_meta}]
    
    FindNode --> ConfigProps[gojs-demo.component.ts<br/>node.resizable = true<br/>node.rotatable = true<br/>node.movable = true<br/>node.position = Point]
    
    ConfigProps --> End([✅ Splitter criado<br/>e desenhado])
    
    APIValidate -->|Erro| APIError[insert_splitter.js<br/>res.status 400/500<br/>Error Response]
    
    APIError --> ServiceError[insert-splitter.service.ts<br/>handleError]
    
    ServiceError --> ShowError[gojs-demo.component.ts<br/>alert Erro]
    
    ShowError --> EndError([❌ Erro])
    
    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style EndError fill:#ffcdd2
    style GoJSListener fill:#fff9c4
    style API1 fill:#fff9c4
    style HTTPPost fill:#fff9c4
```

## Métodos Chamados

### gojs-demo.component.ts (Componente Principal)
1. `showBlankAreaContextMenu(screenX, screenY, docX, docY)` - Mostra context menu
2. `handleBlankAreaMenuAction(action, docX, docY)` - Processa ação do menu
3. `abrirModalSelecionarSplitter(docX, docY)` - Abre modal de seleção
4. `criarSplitter(result, x, y)` - Cria splitter no banco
5. `getCapacidadeFromTipo(tipoSplitter)` - Mapeia tipo para capacidade
6. `adicionarSplitterAoDiagrama(splitterData)` - Adiciona splitter ao GoJS

### plota-splitter.component.ts (Modal)
1. `ngOnInit()` - Inicializa componente
2. `carregarSplittersBalanceados()` - Carrega tipos de splitter
3. `onPlotar()` - Processa clique em Plotar
4. `onCancelar()` - Processa clique em Cancelar

### insert-splitter.service.ts (Serviço)
1. `inserirSplitter(request)` - Envia POST para API
2. `handleError(error)` - Trata erros HTTP

### tipos.service.ts (Serviço)
1. `buscarTiposSplitter()` - Busca tipos via API

### auth.service.ts (Serviço)
1. `getIDmetaCaixa()` - Obtém ID da caixa
2. `getIdCity()` - Obtém ID da cidade
3. `getToken()` - Obtém token de autenticação

### insert_splitter.js (API Backend)
1. `validarDadosEntrada(body)` - Valida campos obrigatórios
2. `executarQuery(conn, query, params)` - Executa query MySQL
3. `getTubosParaCapacidade(capacidade)` - Calcula tubos necessários
4. `conn.beginTransaction()` - Inicia transação
5. `conn.commit()` - Confirma transação
6. `conn.rollback()` - Reverte transação (em caso de erro)

## Fluxo de Dados

**Entrada:**
- Coordenadas do documento GoJS (docX, docY)
- Tipo de splitter selecionado (tipoSplitter.id)
- Label opcional (string ou "")

**Processamento:**
- Validações frontend
- Montagem do request
- Validações backend
- Inserções no banco (transação)

**Saída:**
- Splitter desenhado no diagrama GoJS
- Splitter salvo no banco de dados
