# 📋 Documentação do Projeto - Sistema de Rastreamento de Fibras Ópticas

## 🎯 **Visão Geral do Projeto**

Este é um sistema Angular para visualização e rastreamento de fibras ópticas em DIOs (Distribuidores Internos Ópticos), baseado em um sistema desktop existente em VB6. O objetivo é migrar a funcionalidade de rastreamento de fibras para uma aplicação web moderna.

## 🏗️ **Arquitetura do Sistema**

### **Frontend (Angular)**
- **Componente Principal**: `visualiza-dio` - Modal para visualização de DIOs
- **Serviços**: 
  - `dio-equipamento.service` - Consulta dados dos equipamentos DIO
  - `fiber-trace.service` - (Planejado) Rastreamento de fibras
- **Modelos**: `DioEquip` - Interface para dados dos equipamentos

### **Backend (API)**
- **Endpoint Principal**: `/dio_equipamento` - Retorna dados dos equipamentos
- **Estrutura de Resposta**: `{ "response": [DioEquip[]] }`

## 📁 **Estrutura de Arquivos Importantes**

```
src/app/
├── visualiza-dio/
│   ├── visualiza-dio.component.ts    # Componente principal
│   ├── visualiza-dio.component.html  # Template do modal
│   └── visualiza-dio.component.css   # Estilos
├── visualiza-cabo/
│   ├── visualiza-cabo.component.ts   # Modal para visualização de cabos
│   ├── visualiza-cabo.component.html # Template do flexgrid
│   ├── visualiza-cabo.component.css  # Estilos responsivos
│   └── visualiza-cabo.service.ts     # Serviço para dados de cabos
├── servico/
│   ├── dio-equipamento.service.ts    # Serviço para equipamentos DIO
│   └── fiber-trace.service.ts        # Rastreamento de fibras
├── modelo/
│   ├── dioEquipamento.ts             # Interface DioEquip
│   └── VisualizaCaboData.ts          # Interface para dados de cabos
└── assets/
    └── le_conex                       # Módulo VB6 original
```

## 🔧 **Funcionalidades Implementadas**

### ✅ **1. Visualização de DIOs**
- **Modal responsivo** com grupos de fibras (1-12, 13-24, 25-36)
- **Campos de texto** para equipamentos e níveis dBm
- **Carregamento automático** dos dados da API
- **Navegação por grupos** via option buttons

### ✅ **2. Integração com API**
- **Serviço `DioEquipamentoService`** implementado
- **Mapeamento correto** da estrutura `response` da API
- **Tratamento de erros** e loading states
- **Logs de debug** para monitoramento

### ✅ **3. Modal Visualiza-cabo**
- **Modal dedicado** para visualização de fibras internas de cabos
- **FlexGrid com 7 colunas** (índices 0-6) e 12 linhas (F1-F12)
- **Títulos das pontas** "PONTA A" e "PONTA B" centralizados
- **Coluna central colorida** (índice 3) com fibras F1-F12
- **Layout responsivo** com altura de 40vh
- **Integração com Google Maps** via double-click em cabos

## 🎨 **Modal Visualiza-cabo - Detalhes Técnicos**

### **Estrutura do FlexGrid**
```
Coluna 0 (1fr)    | Coluna 1 (0.25fr) | Coluna 2 (1.5fr) | Coluna 3 (60px) | Coluna 4 (1.5fr) | Coluna 5 (0.25fr) | Coluna 6 (1fr)
                  |                   |                  | F1-F12 COLORIDA |                  |                   |
PONTA A           |                   |                  |                 |                  |                   | PONTA B
```

### **Configurações de Layout**
- **Altura do modal**: 40vh (40% da viewport)
- **Largura**: 90vw com máximo de 1200px
- **Grid template**: `1fr 0.25fr 1.5fr 60px 1.5fr 0.25fr 1fr`
- **Altura das linhas**: 13px (+30% do original)
- **Cores das fibras**: Verde, Amarelo, Branco, Azul, Vermelho, Lilás (repetindo a cada 6 linhas)

### **Integração com Google Maps**
- **Trigger**: Double-click em polylines (cabos) no mapa
- **Dados passados**: `id_meta` do cabo e `tipoFibra`
- **Configuração**: Modal configurado via `MAT_DIALOG_DATA`

### **Responsividade**
- **1600px**: Altura mantida em 40vh
- **1366px**: Altura mantida em 40vh
- **1024px**: Altura mantida em 40vh
- **Grid adaptativo**: Larguras proporcionais mantidas em todas as resoluções

### ✅ **4. Estrutura de Dados**
- **Interface `DioEquip`** com campos `obs1-obs144` e `N1-N144`
- **Interface `VisualizaCaboData`** para dados de cabos
- **Interface `FiberRow`** para linhas do flexgrid
- **Mapeamento dinâmico** baseado no grupo selecionado
- **Tratamento de campos vazios** e valores "OFF"

## 📊 **Interfaces de Dados**

### **VisualizaCaboData**
```typescript
interface VisualizaCaboData {
  id_meta: number;
  nome_cabo: string;
  tipo_cabo: string;
  fibras: {
    numero: number;
    status: string;
    destino: string;
    observacoes: string;
    cor: string;
    tubo: number;
  }[];
}
```

### **FiberRow**
```typescript
interface FiberRow {
  value: string;
  editable: boolean;
}
```

### **VisualizaCaboConfig**
```typescript
interface VisualizaCaboConfig {
  title: string;
  isEditable: boolean;
  showAllFields: boolean;
}
```

## 🚀 **Funcionalidades Planejadas**

### 🔄 **1. Sistema de Rastreamento de Fibras**
- **API dinâmica** para consultas SQL flexíveis
- **Algoritmo de rastreamento** baseado no módulo VB6 `LE_CONEX`
- **Serviço `FiberTraceService`** para geração de rotas
- **Funcionalidade "Tracer"** nos botões de fibra

### 🔄 **2. Geração de Diagramas**
- **Diagramas unifilares** da rota da fibra
- **Visualização interativa** do caminho
- **Exportação** de diagramas

## 📊 **Estrutura de Dados da API**

### **Request para DIO Equipamentos**
```json
{
  "IDMETA": 298816,
  "capacidade": 36
}
```

### **Response da API**
```json
{
  "response": [
    {
      "obs1": "OLT_1_1_1",
      "N1": "5",
      "obs2": "OLT_1_1_2", 
      "N2": "5",
      "obs3": "OLT_1_1_3",
      "N3": "3",
      // ... até obs36, N36
    }
  ],
  "info": {
    "capacidade": 36,
    "numTabelas": 3,
    "camposConsultados": 36,
    "query": "SELECT obs1,N1,obs2,N2..."
  }
}
```

## 🔍 **Algoritmo de Rastreamento (VB6)**

### **3 Consultas SQL Dinâmicas Principais**

1. **Buscar IDMETA por nome visual**:
   ```sql
   SELECT ID_META from {TABELACABO} where id_VISIO = '{NOMECABO}'
   ```

2. **Buscar registro por IDMETA**:
   ```sql
   SELECT {regist} as registro from {TABELA} where idmeta = {idmeta}
   ```

3. **Buscar fibra conectada**:
   ```sql
   SELECT FN{FIBER} as fiber from {TABELA} where idmeta = {idmeta}
   ```

### **Tipos de Equipamentos Suportados**
- **CABOS**: `cabo` (A e B)
- **CAIXAS**: `cxboca1-18` (1-18 bocas)
- **POPs**: `POP` (Pontos de presença)
- **RABICHOS**: `RABICHO` (Cabos de derivação)

## 🗄️ **Estrutura Detalhada das Tabelas da Base `tstmeta`**

### **🔌 Cabos (Pontas A e B)**
- **`cabopa`**: Tabela principal da ponta A dos cabos (busca IDMETA por `id_VISIO`)
- **`cabopb`**: Tabela principal da ponta B dos cabos (busca IDMETA por `id_VISIO`)
- **`caboa_t1` a `caboa_t12`**: Dados das fibras da ponta A (organizadas por tubo)
- **`cabob_t1` a `cabob_t12`**: Dados das fibras da ponta B (organizadas por tubo)
- **Conceito**: Cada cabo tem duas pontas (A e B), cada uma com suas próprias tabelas

### **📦 Caixas de Distribuição (Bocas)**
- **`cxboca1_t1` a `cxboca18_t12`**: Caixas de 1 a 18 bocas (cada uma com 12 tubos)
- **`cxboca97_t1` a `cxboca99_t6`**: Caixas especiais (97, 98, 99)
- **Estrutura**: `cxboca{NUMERO_BOCA}_t{TUBO}`
- **Exemplo**: `cxboca5_t3` = Caixa de 5 bocas, tubo 3

### **🏢 DIOs (Distribuidores Internos Ópticos)**
- **`dio`**: Tabela principal dos DIOs (dados gerais)
- **`dio_t1` a `dio_t12`**: Dados das fibras dos DIOs (organizadas por tubo)
- **`dioc1_t1` a `dioc6_t12`**: 6 bandejas de cabo (c1 a c6)
  - **Cada bandeja** pode receber 1 cabo de até 144 fibras
  - **Fibras podem se fundir** em qualquer posição dos conectores
  - **Capacidade total**: 6 × 144 = 864 fibras por DIO
- **Estrutura**: `dioc{BANDEJA}_t{TUBO}`

### **🔀 Splitters (Divisores Ópticos)**
- **`splitter_e`**: Tabela de entrada dos splitters
- **`splitter_t1` a `splitter_t16`**: Saídas dos splitters (organizadas por tubo)
- **Capacidade**: Até 16 saídas por splitter

### **🏢 Outras Tabelas Importantes**
- **`pop`**: Pontos de presença
- **`caixa`**: Caixas gerais
- **`poste`**, **`postes`**: Postes
- **`condominio`**: Condomínios
- **`conexões`**, **`conexao`**: Conexões
- **`connect_01`**: Conexões específicas

### **📊 Padrão de Organização por Tubos**
- **Cabos**: 12 tubos (`_t1` a `_t12`)
- **Caixas**: 12 tubos por boca
- **DIOs**: 12 tubos + 6 bandejas
- **Splitters**: 16 saídas (`_t1` a `_t16`)

### **🔍 Consultas Típicas por Tipo**
- **Buscar IDMETA**: `cabopa` ou `cabopb` por `id_VISIO`
- **Buscar Fibras**: `caboa_t{N}` ou `cabob_t{N}` por `idmeta`
- **Buscar Caixas**: `cxboca{N}_t{T}` por `idmeta`
- **Buscar DIOs**: `dio_t{N}` ou `dioc{N}_t{T}` por `idmeta`
- **Buscar Splitters**: `splitter_t{N}` por `idmeta`

## 🛠️ **Implementações Técnicas**

### **Mapeamento de Grupos de Fibras**
```typescript
// Grupo 1: obs1-N1 até obs12-N12 (fibras 1-12)
// Grupo 2: obs13-N13 até obs24-N24 (fibras 13-24)  
// Grupo 3: obs25-N25 até obs36-N36 (fibras 25-36)
```

### **Método de Mapeamento de Dados**
```typescript
getEquipamentoData(fiberIndex: number): { equipamento: string, dbm: string } {
  const realFiberIndex = group.start + fiberIndex - 1;
  const obsField = `obs${realFiberIndex}` as keyof DioEquip;
  const nField = `N${realFiberIndex}` as keyof DioEquip;
  
  return {
    equipamento: this.dioEquipData[obsField] || '',
    dbm: this.dioEquipData[nField] && this.dioEquipData[nField] !== 'OFF' 
         ? this.dioEquipData[nField].toString() : ''
  };
}
```

## 🚨 **Problemas Resolvidos**

### **1. Estrutura da API**
- **Problema**: API retorna `{ "response": [...] }` mas código tentava acessar diretamente
- **Solução**: Alterado para `response.response[0]`

### **2. Tipos de Parâmetros**
- **Problema**: API esperava números mas recebia strings
- **Solução**: Adicionado `Number()` na conversão dos parâmetros

### **3. Nome do Campo**
- **Problema**: Confusão entre `capacidade` vs `CAPACIDADE`
- **Solução**: Confirmado que API espera `capacidade` (minúsculo)

## 📋 **Próximos Passos**

### **Fase 1: API Dinâmica**
- [ ] Implementar rota `/api/query_conex` no backend
- [x] Criar serviço `FiberTraceService` no frontend
- [x] Implementar as 3 consultas SQL dinâmicas

### **Fase 2: Algoritmo de Rastreamento**
- [ ] Converter lógica VB6 para TypeScript
- [ ] Implementar identificação de tipos de equipamentos
- [ ] Implementar mapeamento de tubos por fibra

### **Fase 3: Interface de Rastreamento**
- [ ] Conectar botões "Tracer" ao serviço
- [ ] Implementar visualização da rota
- [ ] Adicionar loading states e tratamento de erros

### **Fase 4: Diagramas Unifilares**
- [ ] Implementar geração de diagramas
- [ ] Adicionar visualização interativa
- [ ] Implementar exportação

## 🔧 **Comandos Úteis**

### **Para continuar o desenvolvimento:**
```bash
# Verificar erros de linting
ng lint

# Executar testes
ng test

# Build do projeto
ng build
```

### **Para debug:**
- Verificar console do navegador para logs de debug
- Usar Network tab para monitorar requisições da API
- Verificar se `IDMETA` e `capacidade` estão sendo enviados corretamente

## 📞 **Contato e Suporte**

- **Arquivo de referência**: `src/assets/le_conex` (módulo VB6 original)
- **Logs de debug**: Console do navegador mostra valores enviados para API
- **Estrutura de dados**: Interface `DioEquip` em `src/app/modelo/dioEquipamento.ts`

---

## 📋 **Estrutura Detalhada das Colunas das Tabelas**

### **🔌 Tabelas de Cabos (`caboa_tX` / `cabob_tX`)**
```sql
-- Campos principais
ID_C6A (int, PK, auto_increment)
IDMETA (int, MUL)
CAPACIDADE (varchar)

-- Campos de fibras (F1-F12)
F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12 (varchar)

-- Campos de jumpers (JP1-JP12)
JP1, JP2, JP3, JP4, JP5, JP6, JP7, JP8, JP9, JP10, JP11, JP12 (varchar)

-- Campos de conectores (CN1-CN12)
CN1, CN2, CN3, CN4, CN5, CN6, CN7, CN8, CN9, CN10, CN11, CN12 (varchar)

-- Campos de aplicação (AP1-AP12)
AP1, AP2, AP3, AP4, AP5, AP6, AP7, AP8, AP9, AP10, AP11, AP12 (varchar)

-- Campos de observações (obs1-obs12)
obs1, obs2, obs3, obs4, obs5, obs6, obs7, obs8, obs9, obs10, obs11, obs12 (varchar)

-- Campos de fibras conectadas (FN1-FN12)
FN1, FN2, FN3, FN4, FN5, FN6, FN7, FN8, FN9, FN10, FN11, FN12 (varchar)

-- Campos de níveis (N1-N12)
N1, N2, N3, N4, N5, N6, N7, N8, N9, N10, N11, N12 (varchar)

-- Campos de fibras com label (FIBRA_1LABEL - FIBRA_12LABEL)
FIBRA_1LABEL, FIBRA_2LABEL, FIBRA_3LABEL, FIBRA_4LABEL, FIBRA_5LABEL, FIBRA_6LABEL,
FIBRA_7LABEL, FIBRA_8LABEL, FIBRA_9LABEL, FIBRA_10LABEL, FIBRA_11LABEL, FIBRA_12LABEL (varchar)

-- Campos de fibras conectadas com label (FN_1LABEL - FN_12LABEL)
FN_1LABEL, FN_2LABEL, FN_3LABEL, FN_4LABEL, FN_5LABEL, FN_6LABEL,
FN_7LABEL, FN_8LABEL, FN_9LABEL, FN_10LABEL, FN_11LABEL, FN_12LABEL (varchar)

-- Campos de fibras conectadas (FN_1 - FN_12)
FN_1, FN_2, FN_3, FN_4, FN_5, FN_6, FN_7, FN_8, FN_9, FN_10, FN_11, FN_12 (varchar)
```

### **🏢 Tabelas de DIOs (`dio_tX`)**
```sql
-- Campos principais
ID (int, PK, auto_increment)
IDMETA (int, MUL)

-- Campos de fibras (F1-F12) - Valores padrão '=id()'
F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12 (varchar, default '=id()')

-- Campos de fibras com label (F1L-F12L)
F1L, F2L, F3L, F4L, F5L, F6L, F7L, F8L, F9L, F10L, F11L, F12L (varchar)

-- Campos de fibras conectadas (FN1-FN12)
FN1, FN2, FN3, FN4, FN5, FN6, FN7, FN8, FN9, FN10, FN11, FN12 (varchar)

-- Campos de fibras conectadas com label (FN1L-FN12L)
FN1L, FN2L, FN3L, FN4L, FN5L, FN6L, FN7L, FN8L, FN9L, FN10L, FN11L, FN12L (varchar)
```

### **📦 Tabelas de Caixas (`cxbocaX_tX`)**
```sql
-- Campos principais
ID (int, PK, auto_increment)
IDMETA (int, MUL)

-- Campos de fibras (F1-F12) - Valores padrão '=id()'
F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12 (varchar, default '=id()')

-- Campos de fibras com label (F1L-F12L)
F1L, F2L, F3L, F4L, F5L, F6L, F7L, F8L, F9L, F10L, F11L, F12L (varchar)

-- Campos de fibras conectadas (FN1-FN12)
FN1, FN2, FN3, FN4, FN5, FN6, FN7, FN8, FN9, FN10, FN11, FN12 (varchar)

-- Campos de fibras conectadas com label (FN1L-FN12L)
FN1L, FN2L, FN3L, FN4L, FN5L, FN6L, FN7L, FN8L, FN9L, FN10L, FN11L, FN12L (varchar)
```

### **🔍 Nomenclatura das Colunas por Tipo de Tabela**

| Tipo de Tabela | Colunas de Fibra | Colunas de Label | Colunas FN |
|---|---|---|---|
| **`dio_tX`** | `F1-F12` | `F1L-F12L` | `FN1-FN12`, `FN1L-FN12L` |
| **`cxbocaX_tX`** | `F1-F12` | `F1L-F12L` | `FN1-FN12`, `FN1L-FN12L` |
| **`caboa_tX`/`cabob_tX`** | `F1-F12` | `FIBRA_1LABEL-FIBRA_12LABEL` | `FN1-FN12`, `FN_1LABEL-FN_12LABEL`, `FN_1-FN_12` |

### **🎯 Consultas SQL Corretas**

#### **Para Tabelas DIO (`dio_tX`)**
```sql
-- Buscar fibra específica
SELECT F1 FROM tstmeta.dio_t1 WHERE IDMETA = ?

-- Buscar fibra conectada
SELECT FN1 FROM tstmeta.dio_t1 WHERE IDMETA = ?
```

#### **Para Tabelas de Cabos (`caboa_tX`/`cabob_tX`)**
```sql
-- Buscar fibra específica
SELECT FIBRA_1LABEL FROM tstmeta.caboa_t1 WHERE IDMETA = ?

-- Buscar fibra conectada
SELECT FN1 FROM tstmeta.caboa_t1 WHERE IDMETA = ?
```

#### **Para Tabelas de Caixas (`cxbocaX_tX`)**
```sql
-- Buscar fibra específica
SELECT F1 FROM tstmeta.cxboca1_t1 WHERE IDMETA = ?

-- Buscar fibra conectada
SELECT FN1 FROM tstmeta.cxboca1_t1 WHERE IDMETA = ?
```

## 🔗 **Algoritmo de Rastreamento de Conexões**

### **Visão Geral**
O sistema implementa um algoritmo de rastreamento de fibras ópticas que segue a lógica do módulo VB6 `le_conex`. O algoritmo percorre as conexões entre diferentes equipamentos (DIOs, cabos, caixas, splitters, POPs) seguindo as referências armazenadas nas tabelas de conectividade.

### **Fluxo do Algoritmo**

#### **1. Início do Rastreamento**
- **Tabela inicial**: `dio_tX` (onde X é o tubo calculado pela fibra)
- **Registro inicial**: `FX` (onde X é o número da fibra)
- **IDMETA inicial**: ID do DIO sendo analisado

#### **2. Tipos de Conexões e Padrões**

| **Tipo de Equipamento** | **Padrão de Conteúdo** | **Ação** | **Próxima Tabela** |
|---|---|---|---|
| **DIO com Bandeja** | `diocX_tY` | **PARTICULARIDADE**: Consultar campo `cX` na tabela `dio` | `dio` (campo `cX`) |
| **Cabo Ponta A** | `=cabo{ID}A!Prop.Fibra_{N}.Label` | Ir para ponta A do cabo | `caboa_tX` |
| **Cabo Ponta B** | `=cabo{ID}B!Prop.Fibra_{N}.VALUE` | Ir para ponta B do cabo | `cabob_tX` |
| **Caixa Externa** | `=TST{ID}!PROP.BOCA{X}_{Y}.VALUE` | Ir para caixa externa | `cxbocaX_tY` |
| **Caixa Interna** | `prop.boca{X}_{Y}.label` | Conexão interna na caixa | `cxbocaX_tY` |
| **DIO Final** | `=DIO{ID}!PROP.ROW_5.LABEL` | **PARAR** - Destino final | - |
| **POP Final** | `=TST{ID}!PROP.ROW_5.LABEL` | **PARAR** - Destino final | - |
| **Splitter Entrada** | `splitter_e` ou `splitter_E` | **PARAR** - Entrada de splitter | - |
| **Caixa Atual** | `=id()` | **PARAR** - Parou na própria caixa | - |

#### **3. Regra Especial - TST + ROW_5 = POP**

**⚠️ ATENÇÃO**: Quando o conteúdo contém `TST` E `ROW_5` juntos (ex: `=TST714932!PROP.ROW_5.LABEL`):

1. **NÃO** é uma caixa TST normal
2. **SIM** é um POP (Point of Presence)
3. **Lógica VB6**: `If (InStr(1, tabel, "ROW_5") * InStr(1, tabel, "TST")) Then DESTINO_TAB = "POP"`
4. **Extrair IDMETA**: `=TST714932!PROP.ROW_5.LABEL` → `714932`
5. **Status**: **PARAR** - Destino final

**Implementação TypeScript:**
```typescript
// Verificar se é POP: TST + ROW_5 = POP
if (conteudo.includes('TST') && conteudo.includes('ROW_5')) {
  return 'pop';
}

// Extrair IDMETA do POP
const matchTST = conteudo.match(/=TST(\d+)!/);
if (matchTST) {
  const popIdmeta = parseInt(matchTST[1]); // 714932
  return { idmeta: popIdmeta, status: 'fim' };
}
```

#### **4. Regra Especial - Conexões Diretas de Cabo (Sem Sufixo)**

**⚠️ ATENÇÃO**: Existem conexões diretas entre cabos através do segmento "sobra" onde o sufixo `.VALUE` pode não aparecer:

**Padrões de Conexão Direta:**
- **Maiúsculo**: `=cabo596806B!PROP.FIBRA_12` (sem `.VALUE`)
- **Minúsculo**: `=cabo{ID}{A/B}!Prop.Fibra_{N}` (sem sufixo)

**Problema Identificado:**
- ❌ **Antes**: Sistema parava como tipo "unknown" 
- ❌ **Resultado**: Fibras não chegavam ao destino final
- ❌ **Causa**: Regex não reconhecia padrões sem sufixo

**Solução Implementada:**
```typescript
// 1. Detecção de tipos (identificarTipoPeloConteudo)
// Padrão original (mantém)
=cabo{ID}{A/B}!Prop.Fibra_{N}.{Label|VALUE}

// 🆕 NOVO: Conexão direta (maiúsculo)
=cabo{ID}{A/B}!PROP.FIBRA_{N}

// 🆕 NOVO: Conexão direta (minúsculo)  
=cabo{ID}{A/B}!Prop.Fibra_{N}

// 2. Regex flexível (processarCabo)
let match = conteudo.match(/=cabo(\d+)([AB])!Prop\.Fibra_(\d+)\.(Label|VALUE)/);

// Se não encontrou, tentar conexão direta (maiúsculo)
if (!match) {
  match = conteudo.match(/=cabo(\d+)([AB])!PROP\.FIBRA_(\d+)$/);
}

// Se ainda não encontrou, tentar conexão direta (minúsculo)
if (!match) {
  match = conteudo.match(/=cabo(\d+)([AB])!Prop\.Fibra_(\d+)$/);
}

// 3. Processamento como VALUE (padrão)
const tipo = match[4] || 'VALUE'; // Se não tiver sufixo, assume VALUE
```

**Resultado:**
- ✅ **Agora reconhece** conexões diretas como "cabo"
- ✅ **Processa como VALUE** automaticamente
- ✅ **Continua rastreamento** até destino final
- ✅ **Mantém compatibilidade** com padrões existentes

**Exemplo de Fluxo Corrigido:**
```
1. =cabo596806B!PROP.FIBRA_12 (conexão direta)
   └── Reconhece como "cabo" (não mais "unknown")
   └── Processa como VALUE → cabob_t1 + FIBRA_12
   └── Continua rastreamento normalmente

2. =cabo601380B!Prop.Fibra_2.VALUE (padrão normal)
   └── Continua funcionando como antes
```

#### **5. Particularidade Importante - DIO com Bandeja**

**⚠️ ATENÇÃO**: Quando o conteúdo é `diocX_tY` (ex: `dioc1_t2`):

1. **NÃO** consulta a tabela `dioc1_t2`
2. **SIM** consulta a tabela `dio` no campo `cX` (ex: `c1`)
3. **Query**: `SELECT c1 FROM dio WHERE id_meta = {idmeta}`
4. **Resultado**: `cabo674427A` (formato do cabo)
5. **Continua**: Rastreia a partir do cabo encontrado

**Exemplo VB6:**
```vb
' Embora o valor de tabel seja dioc1_t2, ele não consulta essa tabela
' Ele vai para tabela dio e olha no campo C1 para obter o cabo
If InStr(1, tabel, "c1") Then Set rs = frmLogin.connMETA.Execute("select c1 as cabo from dio where id_meta = " & idmeta & ";")
```

**Implementação TypeScript:**
```typescript
// Extrair conector do formato dioc2_t1 → 2 (do CONTEÚDO, não da tabela)
const match = conteudo.match(/dioc(\d+)_t/);
const conector = match ? parseInt(match[1]) : 1;

// Consultar campo específico na tabela dio
const caboResponse = await this.fiberApiService.executeDynamicQuery(
  `SELECT c${conector} as cabo FROM tstmeta.dio WHERE id_meta = {idmeta}`,
  { idmeta: idmeta }
).toPromise();
```

#### **6. Exemplo Prático de Rastreamento**

```
FIBRA 1 do DIO 298816 (Tubo 1)
├── dio_t1.F1 = "dioc2_t1"
│   └── Processar bandeja c2 do DIO
├── dioc2_t1.FN1 = "cabo350807A"
│   └── Buscar cabo na bandeja c2
├── dio.c2 = "cabo350807A"
│   └── Extrair IDMETA: 350807
├── caboa_t1.FIBRA_1 = "=cabo350807B!Prop.Fibra_1.Label"
│   └── Ir para ponta B do cabo
├── cabob_t1.FIBRA_1_LABEL = "=TST350814!PROP.BOCA2_1.VALUE"
│   └── Ir para caixa TST350814, boca 2, fibra 1
├── cxboca2_t1.F1 = "prop.boca1_1.label"
│   └── Conexão interna na caixa (boca 2 → boca 1)
├── cxboca1_t1.F1L = "=cabo350808A!Prop.Fibra_1.VALUE"
│   └── Ir para cabo 350808A, fibra 1
├── caboa_t1.FIBRA_1 = "=cabo350808B!Prop.Fibra_1.Label"
│   └── Ir para ponta B do cabo 350808B
└── cabob_t1.FIBRA_1LABEL = "=TST350817!PROP.BOCA2_1.VALUE"
    └── **DESTINO FINAL**: Caixa TST350817, boca 2, fibra 1
```

#### **7. Exemplo Real de Dados do Banco (Cabo 674187)**

**Dados reais extraídos do banco `tstmeta` para debug do algoritmo:**

| Tabela | Campo | Conteúdo | ID_META | Tipo |
|--------|-------|----------|---------|------|
| `tstmeta.cabob_t1` | `FIBRA_11LABEL` | `=TST674295!PROP.BOCA1_11.VALUE` | 685654 | CABO |
| `tstmeta.cxboca1_t1` | `F11` | `prop.boca2_11.label` | 674295 | CAIXA |
| `tstmeta.cxboca2_t1` | `F11L` | `=cabo674187B!Prop.Fibra_11.VALUE` | 674295 | CAIXA |
| `tstmeta.cabob_t1` | `FIBRA_11` | `=cabo674187A!Prop.Fibra_11.Label` | 674187 | CABO |
| `tstmeta.caboa_t1` | `FIBRA_11LABEL` | `=TST685230!PROP.BOCA1_11.VALUE` | 674187 | CABO |
| `tstmeta.cxboca2_t1` | `F11` | `prop.boca1_11.label` | 685230 | CAIXA |

**Fluxo correto esperado:**
```
1. cxboca2_t1.F11L = "=cabo674187B!Prop.Fibra_11.VALUE" (IDMETA: 674295)
   └── Vai para ponta B do cabo 674187

2. cabob_t1.FIBRA_11 = "=cabo674187A!Prop.Fibra_11.Label" (IDMETA: 674187)
   └── Vai para ponta A do cabo 674187

3. caboa_t1.FIBRA_11LABEL = "=TST685230!PROP.BOCA1_11.VALUE" (IDMETA: 674187)
   └── Vai para caixa TST685230
```

**Problema identificado no algoritmo:**
- ❌ **Errado**: Consulta `FIBRA_11LABEL` na ponta B → retorna `=cabo674187B!Prop.Fibra_11.VALUE`
- ✅ **Correto**: Deveria consultar `FIBRA_11` na ponta B → retorna `=cabo674187A!Prop.Fibra_11.Label`

#### **8. Regras de Nomenclatura das Colunas**

| **Tabela** | **Colunas de Fibra** | **Colunas de Label** | **Colunas FN** |
|---|---|---|---|
| `dio_tX` | `F1-F12` | `F1L-F12L` | `FN1-FN12`, `FN1L-FN12L` |
| `caboa_tX` | `FIBRA_1-FIBRA_144` | `FIBRA_1LABEL-FIBRA_144LABEL` | - |
| `cabob_tX` | `FIBRA_1-FIBRA_144` | `FIBRA_1_LABEL-FIBRA_144_LABEL` | - |
| `cxbocaX_tX` | `F1-F12` | `F1L-F12L` | `FN1-FN12`, `FN1L-FN12L` |

#### **9. Cálculo de Tubos**
- **Fibras 1-12**: Tubo 1
- **Fibras 13-24**: Tubo 2
- **Fibras 25-36**: Tubo 3
- **E assim por diante...**

#### **10. Condições de Parada**
1. **DIO Final**: `=DIO{ID}!PROP.ROW_5.LABEL`
2. **Splitter Entrada**: `splitter_e` ou `splitter_E`
3. **Caixa Atual**: `=id()`
4. **Campo Vazio**: Conteúdo vazio ou nulo
5. **Erro de Conexão**: Falha na consulta ou dados inválidos

#### **11. Logs de Debug**
O sistema gera logs detalhados para cada etapa:
- `🔍 [RASTREIO]` - Início do rastreamento
- `📋 [CONSULTA]` - Consulta na tabela
- `✅ [CONEXÃO]` - Conexão encontrada
- `🔄 [CONTINUA]` - Continua para próxima etapa
- `🏁 [DIO]` - Chegou no DIO final
- `🔀 [SPLITTER]` - Chegou no splitter
- `🏠 [CAIXA]` - Parou na caixa atual
- `❌ [FIM]` - Fim do rastreamento

### **Implementação Técnica**

#### **Arquivos Principais**
- `src/app/servico/fiber-trace.service.ts` - Lógica de rastreamento
- `src/app/visualiza-dio/visualiza-dio.component.ts` - Interface e controle
- `api_query_conex.js` - API de consultas dinâmicas

#### **Métodos Principais**
- `ANALISA_TABELA_INI()` - Função principal de rastreamento
- `processContent()` - Processa conteúdo das conexões
- `extractInfoFromContent()` - Extrai informações do conteúdo
- `performTrace()` - Executa o rastreamento sequencial

## 🔬 **Algoritmo de Rastreamento de Fibras - Especificação Técnica Completa**

### **📅 Data**: 11/09/2025
### **🎯 Objetivo**: Implementar algoritmo de rastreamento de fibras dinâmico baseado em ponteiros

### **🧠 Conceito Fundamental:**
O algoritmo implementa um sistema de **ponteiros dinâmicos** onde cada conteúdo lido determina o próximo campo a ser consultado, baseado em:
1. **Tipo de equipamento** (cabo, caixa, DIO, etc.)
2. **Ponta do cabo** (A ou B)
3. **Tipo de campo anterior** (Label = com LABEL, Value = sem LABEL)

### **🔄 Fluxo de Execução:**
```
FIBRA INICIAL → CONSULTA REGISTRO → ANALISA CONTEÚDO → IDENTIFICA TIPO → EXECUTA LÓGICA ESPECÍFICA → PRÓXIMO PASSO
```

### **📋 Tipos de Equipamentos Suportados:**

#### **1. CABOS**
- **Padrão A**: `=cabo{ID}A!Prop.Fibra_{N}.Label`
- **Padrão B**: `=cabo{ID}B!Prop.Fibra_{N}.VALUE`
- **Ação**: Determinar ponta (A/B) e tipo (Label/VALUE)
- **Próxima Tabela**: `caboa_tX` ou `cabob_tX`
- **Próximo Registro**: `FIBRA_X` ou `FIBRA_XLABEL`

#### **2. CAIXAS**
- **Caixa Externa**: `=TST{ID}!PROP.BOCA{X}_{Y}.VALUE`
- **Caixa Interna**: `prop.boca{X}_{Y}.label`
- **Ação**: Extrair IDMETA, boca e fibra
- **Próxima Tabela**: `cxbocaX_tY`
- **Próximo Registro**: `FX` ou `FXL`

#### **3. DIOs (Distribuidores Internos Ópticos)**
- **DIO Simples**: `=DIO{ID}!PROP.ROW_5.LABEL`
- **DIO com Bandeja**: `diocX_tY`
- **Ação DIO Simples**: **PARAR** - Destino final
- **Ação DIO com Bandeja**: Consultar campo `cX` na tabela `dio`

#### **4. POPs (Point of Presence)**
- **POP TST**: `=TST{ID}!PROP.ROW_5.LABEL` (regra especial)
- **POP Normal**: `=POP{ID}!PROP.F1.VALUE`
- **Ação**: **PARAR** - Destino final

#### **5. SPLITTERS**

##### **🔀 Particularidades dos Splitters:**

**Splitter Entrada:**
- **Padrão**: `prop.splitter_e{ID}.label`
- **Exemplo**: `prop.splitter_e299315.label`
- **Retorno**: `fiber: "E"`
- **Lógica**: Splitters têm apenas **uma entrada**, identificada pelo sufixo `_e`
- **Ação**: **PARAR** - Destino final

**Splitter Saída:**
- **Padrão**: `prop.splitter{ID}_{N}.label`
- **Exemplo**: `prop.splitter750062_1.label`, `prop.splitter750062_2.label`
- **Retorno**: `fiber: "S{N}"` (onde N é o número da saída)
- **Exemplos de retorno**: `"S1"`, `"S2"`, `"S3"`, etc.
- **Lógica**: Splitters podem ter **múltiplas saídas**, identificadas pelo sufixo `_{N}`
- **Ação**: **PARAR** - Destino final

**Splitter Complexo:**
- **Padrão**: `=SPLITTER{ID}!PROP.F1.VALUE`
- **Retorno**: `fiber: "E"` (tratado como entrada)
- **Ação**: **PARAR** - Destino final

##### **🔧 Implementação no Fiber-Trace:**

```typescript
// Identificação do tipo
if (conteudo.includes('prop.') && conteudo.includes('splitter_e') && conteudo.includes('label')) {
  return 'splitter'; // Entrada
}
if (conteudo.includes('prop.') && conteudo.includes('splitter') && conteudo.includes('_') && conteudo.includes('label')) {
  return 'splitter_saida'; // Saída
}

// Processamento - Entrada
private async processarSplitter(conteudo: string, ...): Promise<...> {
  // Extrair IDMETA: prop.splitter_e299315.label
  const match = conteudo.match(/splitter_e(\d+)/);
  const splitterIdmeta = parseInt(match[1]);
  
  return {
    idmeta: splitterIdmeta,
    fiber: "E" as any, // "E" para entrada
    status: 'fim'
  };
}

// Processamento - Saída
private async processarSplitterSaida(conteudo: string, ...): Promise<...> {
  // Extrair IDMETA e número da saída: prop.splitter750062_1.label
  const match = conteudo.match(/splitter(\d+)_(\d+)/);
  const splitterIdmeta = parseInt(match[1]);
  const saidaNumero = parseInt(match[2]);
  
  return {
    idmeta: splitterIdmeta,
    fiber: `S${saidaNumero}` as any, // "S1", "S2", etc.
    status: 'fim'
  };
}
```

##### **📊 Exemplos Práticos:**

| **Conteúdo** | **Tipo** | **IDMETA** | **Saída** | **Fiber** | **Significado** |
|---|---|---|---|---|---|
| `prop.splitter_e299315.label` | `splitter` | 299315 | - | `"E"` | Entrada do splitter 299315 |
| `prop.splitter750062_1.label` | `splitter_saida` | 750062 | 1 | `"S1"` | Saída 1 do splitter 750062 |
| `prop.splitter750062_2.label` | `splitter_saida` | 750062 | 2 | `"S2"` | Saída 2 do splitter 750062 |
| `prop.splitter750062_3.label` | `splitter_saida` | 750062 | 3 | `"S3"` | Saída 3 do splitter 750062 |

#### **6. RABICHOS**
- **Padrão**: `=RABICHO{ID}!PROP.F1.VALUE`
- **Ação**: **PARAR** - Destino final

#### **7. CAIXA ATUAL**
- **Padrão**: `=id()`
- **Ação**: **PARAR** - Parou na própria caixa

### **⚙️ Regras Especiais:**

#### **Regra 1: TST + ROW_5 = POP**
```typescript
// Quando conteúdo contém TST E ROW_5 juntos
if (conteudo.includes('TST') && conteudo.includes('ROW_5')) {
  return 'pop'; // Não é caixa, é POP
}
```

#### **Regra 2: DIO com Bandeja - Consulta Campo Específico**
```typescript
// Conteúdo: dioc2_t1 → Consultar campo c2 na tabela dio
const conector = extractConectorFromTabela(conteudo); // 2
const query = `SELECT c${conector} FROM dio WHERE id_meta = ${idmeta}`;
```

#### **Regra 3: Cálculo de Tubo por Fibra**
```typescript
// Fibras 1-12 → Tubo 1, Fibras 13-24 → Tubo 2, etc.
calculateTubo(fibra: number): number {
  if (fibra < 13) return 1;
  if (fibra > 12 && fibra <= 24) return 2;
  // ... até tubo 12
}
```

### **🔧 Implementação Técnica:**

#### **Arquitetura de Serviços:**
- **`FiberApiService`**: Responsável por todas as consultas HTTP
- **`FiberTraceService`**: Contém apenas a lógica de rastreamento
- **Separação de responsabilidades**: API vs. Lógica de negócio

#### **Métodos Principais:**
```typescript
// 1. Método principal de entrada
ANALISA_TABELA_INI(idmeta, fiber, tabela, registro): Observable<FiberTraceResult>

// 2. Execução recursiva do rastreamento
private performTrace(idmeta, fiber, tabela, registro, tracePath, observer, stepCount)

// 3. Identificação do tipo pelo conteúdo
private identificarTipoPeloConteudo(conteudo: string): string

// 4. Processamento por tipo específico
private processarPorTipo(tipoObjeto, conteudo, registro, idmeta, tabela, fiber)

// 5. Métodos específicos por tipo
private processarCabo(conteudo, registro, idmeta, tabela, fiber)
private processarCaixa(conteudo, registro, idmeta, tabela, fiber)
private processarDIO(conteudo, registro, idmeta, tabela, fiber)
private processarDIOCabo(conteudo, registro, idmeta, tabela, fiber)
private processarPOP(conteudo, registro, idmeta, tabela, fiber)
private processarSplitter(conteudo, registro, idmeta, tabela, fiber)
private processarRabicho(conteudo, registro, idmeta, tabela, fiber)
private processarCaixaAtual(conteudo, registro, idmeta, tabela, fiber)
```

### **📊 Estrutura de Dados:**

#### **FiberTraceStep:**
```typescript
interface FiberTraceStep {
  idmeta: number;        // ID do equipamento
  fiber: number | string; // Número da fibra ou código especial
  tabela: string;        // Tabela consultada
  registro: string;      // Registro consultado
  tipo: string;          // Tipo do equipamento
  status: 'processando' | 'fim' | 'continua' | 'erro';
}
```

#### **Códigos Especiais no Campo `fiber`:**
- **`"E"`**: Splitter Entrada (`prop.splitter_e{ID}.label`)
- **`"S1"`, `"S2"`, etc.**: Splitter Saída (`prop.splitter{ID}_{N}.label`) - onde N é o número da saída
- **Números**: Fibras normais (1, 2, 3, etc.)

#### **FiberTraceResult:**
```typescript
interface FiberTraceResult {
  success: boolean;      // Sucesso da operação
  trace: FiberTraceStep[]; // Caminho percorrido
  status: string;        // Status final
  error?: string;        // Mensagem de erro (se houver)
}
```

### **🛡️ Controles de Segurança:**

#### **Limite de Passos:**
- **Máximo**: 150 passos por rastreamento
- **Proteção**: Evita loops infinitos
- **Status**: `limite_atingido` quando excedido

#### **Validação de Conteúdo:**
- **Verificação**: Conteúdo não vazio e válido
- **Tratamento**: Erro se conteúdo inválido
- **Logs**: Debug detalhado para troubleshooting

#### **Tratamento de Erros:**
- **Timeout**: 10 segundos por requisição
- **Retry**: 2 tentativas automáticas
- **Cancelamento**: Possibilidade de cancelar operações

### **📈 Exemplo de Rastreamento Completo:**

```
FIBRA 1 do DIO 298816 (Tubo 1)
├── dio_t1.F1 = "dioc2_t1"
│   └── [DIO-CABO] Consultar campo c2 na tabela dio
│       └── Resultado: cabo298817A
├── caboa_t1.Fibra_1 = "=cabo298817B!Prop.Fibra_1.Label"
│   └── [CABO] Ir para ponta B do cabo
├── cabob_t1.FIBRA_1LABEL = "=TST298818!PROP.BOCA1_1.VALUE"
│   └── [CAIXA] Ir para caixa externa
├── cxboca1_t1.F1 = "prop.boca2_1.label"
│   └── [CAIXA] Conexão interna na caixa
├── cxboca2_t1.F1L = "prop.splitter_e299315.label"
│   └── [SPLITTER] DESTINO FINAL
└── Status: fim
```

### **🎯 Vantagens da Implementação:**

1. **Modularidade**: Cada tipo de equipamento tem sua lógica específica
2. **Manutenibilidade**: Código organizado e bem documentado
3. **Extensibilidade**: Fácil adicionar novos tipos de equipamentos
4. **Debugging**: Logs detalhados para troubleshooting
5. **Performance**: Consultas otimizadas e controle de timeout
6. **Confiabilidade**: Tratamento robusto de erros

### **🔍 Padrões de Conteúdo e Identificação:**

#### **Tabela de Reconhecimento de Padrões:**
| **Padrão de Conteúdo** | **Regex de Identificação** | **Tipo Identificado** | **Prioridade** |
|---|---|---|---|
| `=TST{ID}!PROP.ROW_5.LABEL` | `TST.*ROW_5` | `pop` | **1** (especial) |
| `dioc{X}_t{Y}` | `dioc\d+_t` | `dio_cabo` | **2** |
| `=cabo{ID}A!Prop.Fibra_{N}.Label` | `cabo.*!.*Prop\.Fibra_` | `cabo` | **3** |
| `=TST{ID}!PROP.BOCA{X}_{Y}.VALUE` | `TST.*BOCA` | `caixa` | **4** |
| `prop.boca{X}_{Y}.label` | `prop\.boca.*label` | `caixa` | **5** |
| `=DIO{ID}!PROP.ROW_5.LABEL` | `DIO.*!.*PROP\.` | `dio` | **6** |
| `prop.splitter_e{ID}.label` | `prop\.splitter_e.*label` | `splitter` | **7** |
| `prop.splitter{ID}_{N}.label` | `prop\.splitter.*_.*label` | `splitter_saida` | **8** |
| `=POP{ID}!PROP.F1.VALUE` | `POP.*!.*PROP\.F` | `pop` | **8** |
| `=SPLITTER{ID}!PROP.F1.VALUE` | `SPLITTER.*!.*PROP\.F` | `splitter` | **9** |
| `=RABICHO{ID}!PROP.F1.VALUE` | `RABICHO.*!.*PROP\.F` | `rabicho` | **10** |
| `=id()` | `=id\(\)` | `caixa_atual` | **11** |

#### **Regras de Prioridade:**
1. **TST + ROW_5** tem prioridade máxima (é POP, não caixa)
2. **DIO com bandeja** tem prioridade sobre DIO simples
3. **Padrões específicos** têm prioridade sobre genéricos
4. **Ordem de verificação** segue a prioridade da tabela

#### **Exemplos de Identificação:**
```typescript
// ✅ CORRETO: TST + ROW_5 = POP (prioridade 1)
"=TST714932!PROP.ROW_5.LABEL" → pop

// ✅ CORRETO: DIO com bandeja (prioridade 2)  
"dioc2_t1" → dio_cabo

// ✅ CORRETO: Cabo ponta A (prioridade 3)
"=cabo298817A!Prop.Fibra_1.Label" → cabo

// ✅ CORRETO: Caixa externa (prioridade 4)
"=TST298818!PROP.BOCA1_1.VALUE" → caixa

// ✅ CORRETO: Caixa interna (prioridade 5)
"prop.boca2_1.label" → caixa

// ✅ CORRETO: DIO simples (prioridade 6)
"=DIO350833!PROP.ROW_5.LABEL" → dio

// ✅ CORRETO: Splitter simples (prioridade 7)
"prop.splitter_e299315.label" → splitter
```

### **🛠️ Métodos de Extração de Dados:**

#### **1. Extração de IDMETA:**
```typescript
// Padrão: =TST{ID}!PROP.BOCA{X}_{Y}.VALUE
const match = conteudo.match(/=TST(\d+)!/);
const idmeta = match ? parseInt(match[1]) : idmetaAtual;

// Padrão: =DIO{ID}!PROP.ROW_5.LABEL  
const match = conteudo.match(/=DIO(\d+)!/);
const idmeta = match ? parseInt(match[1]) : idmetaAtual;
```

#### **2. Extração de Conector DIO:**
```typescript
// Padrão: dioc2_t1 → conector = 2
const match = conteudo.match(/dioc(\d+)_t/);
const conector = match ? parseInt(match[1]) : 1;
const conectorLimitado = Math.min(Math.max(conector, 1), 6); // 1-6
```

#### **3. Extração de Boca e Fibra:**
```typescript
// Padrão: =TST298818!PROP.BOCA1_1.VALUE
const match = conteudo.match(/BOCA(\d+)_(\d+)\.VALUE/);
const boca = match ? parseInt(match[1]) : 1;
const fibra = match ? parseInt(match[2]) : 1;
```

#### **4. Extração de IDMETA do Cabo:**
```typescript
// Padrão: cabo350807A → idmeta = 350807
const posA = cabo.indexOf('A');
const posB = cabo.indexOf('B');
const pos = Math.max(posA, posB);
const idmeta = parseInt(cabo.substring(4, pos));
```

### **📊 Logs de Debug e Monitoramento:**

#### **Níveis de Log:**
- **🔍 [RASTREIO]**: Passo atual do rastreamento
- **✅ [CONEXÃO]**: Conexão encontrada
- **🎯 [TIPO]**: Tipo identificado
- **🔄 [PROCESSAR]**: Processamento por tipo
- **🔌 [CABO]**: Processamento de cabo
- **🏠 [CAIXA]**: Processamento de caixa
- **🔌 [DIO]**: Processamento de DIO
- **🔌 [DIO-CABO]**: Processamento de DIO com bandeja
- **🏢 [POP]**: Processamento de POP
- **🔀 [SPLITTER]**: Processamento de splitter
- **🔗 [RABICHO]**: Processamento de rabicho
- **🏁 [FIM]**: Rastreamento finalizado
- **❌ [ERRO]**: Erro encontrado

#### **Exemplo de Log Completo:**
```
🔍 [RASTREIO] Passo 1/150 - IDMETA: 298816, Fibra: 1, Tabela: dio_t1, Registro: F1
✅ [CONEXÃO] Encontrada conexão: dioc2_t1
🎯 [TIPO] Tipo identificado pelo conteúdo: dio_cabo
🔄 [PROCESSAR] Tipo: dio_cabo, Conteúdo: dioc2_t1
🔌 [DIO-CABO] Processando DIO com bandeja: dioc2_t1
🔍 [DIO-CABO] Consultando campo c2 para IDMETA 298816
✅ [DIO-CABO] Resultado - IDMETA: 298817, Fibra: 1, Tabela: caboa_t1
➡️ [CONTINUA] Próximo passo - IDMETA: 298817, Fibra: 1, Tabela: caboa_t1, Registro: Fibra_1
```

## 🚀 **Jornada de Desenvolvimento - Algoritmo de Conexão Dinâmico**

### **📅 Data**: 11/09/2025
### **🎯 Objetivo**: Implementar algoritmo de rastreamento de fibras dinâmico baseado em ponteiros

### **🔍 Descobertas Importantes:**

#### **1. O Algoritmo é Dinâmico como Ponteiros em C**
```
Conteúdo 1: =cabo674187B!Prop.Fibra_11.VALUE
           ↓ (aponta para)
Conteúdo 2: FIBRA_11 (sem LABEL porque anterior tinha VALUE)
           ↓ (aponta para)
Conteúdo 3: =cabo674187A!Prop.Fibra_11.Label
           ↓ (aponta para)
Conteúdo 4: FIBRA_11LABEL (com LABEL porque anterior tinha Label)
```

#### **2. Regra Fundamental:**
- **Cada conteúdo anterior determina o próximo campo**
- **Não há regras fixas** - tudo é baseado no que foi lido antes
- **Como ponteiros**: cada "conteúdo" aponta para o próximo "endereço"

#### **3. Lógica de Detecção de Campos:**
```typescript
// Analisar conteúdo anterior para determinar próximo campo
if (conteudo.includes('Label')) {
  proximoRegistro += 'LABEL';  // FIBRA_11LABEL
} else if (conteudo.includes('VALUE') || conteudo.includes('Value')) {
  // Mantém sem LABEL  // FIBRA_11
}
```

### **❌ Erros Cometidos Durante Desenvolvimento:**

#### **1. Tentativa 1 - Lógica Invertida:**
```typescript
// ERRADO - Regras fixas
if (isPontaB) {
  proximoRegistro = `FIBRA_${info.fibra}LABEL`; // Sempre com LABEL
} else if (isPontaA) {
  proximoRegistro = `FIBRA_${info.fibra}`; // Sempre sem LABEL
}
```
**Problema**: Não considerou o conteúdo anterior

#### **2. Tentativa 2 - Ordem de Declaração:**
```typescript
// ERRADO - Variável usada antes de declarar
if (isPontaB) {
  proximoRegistro = `FIBRA_${info.fibra}LABEL`; // ❌ Usado antes
} else {
  let proximoRegistro = `FIBRA_${info.fibra}`; // ❌ Declarado depois
}
```
**Problema**: Erro de compilação TypeScript

#### **3. Tentativa 3 - Return Prematuro:**
```typescript
// ERRADO - Return no meio da função
return {
  idmeta: proximoIdmeta,
  fiber: proximaFibra,
  tabela: proximaTabela,
  registro: proximoRegistro
};
```
**Problema**: Quebrava o fluxo de execução

### **✅ Solução Final Implementada:**

#### **1. Detecção de Variáveis:**
```typescript
const isPontaB = conteudo.includes('B!');
const isPontaA = conteudo.includes('A!');
const isLabel = conteudo.includes('Label');
const isValue = conteudo.includes('VALUE');
```

#### **2. Lógica de Combinação com `&&` (AND):**
```typescript
if (isPontaB && isLabel) {
  // Ponta B + Label → cabob_tX + FIBRA_XLABEL
  proximaTabela = `cabob_t${tubo}`;
  proximoRegistro = `FIBRA_${info.fibra}LABEL`;
} else if (isPontaA && isLabel) {
  // Ponta A + Label → caboa_tX + FIBRA_XLABEL
  proximaTabela = `caboa_t${tubo}`;
  proximoRegistro = `FIBRA_${info.fibra}LABEL`;
} else if (isPontaB && isValue) {
  // Ponta B + Value → cabob_tX + FIBRA_X
  proximaTabela = `cabob_t${tubo}`;
  proximoRegistro = `FIBRA_${info.fibra}`;
} else if (isPontaA && isValue) {
  // Ponta A + Value → caboa_tX + FIBRA_X
  proximaTabela = `caboa_t${tubo}`;
  proximoRegistro = `FIBRA_${info.fibra}`;
}
```

### **🔧 Algoritmo de Conexão Dinâmico - Especificação Técnica**

#### **Conceito Fundamental:**
O algoritmo implementa um sistema de **ponteiros dinâmicos** onde cada conteúdo lido determina o próximo campo a ser consultado, baseado em:

1. **Tipo de equipamento** (cabo, caixa, DIO, etc.)
2. **Ponta do cabo** (A ou B)
3. **Tipo de campo anterior** (Label = com LABEL, Value = sem LABEL)

#### **Fluxo de Execução:**
```
1. Lê conteúdo atual
2. Identifica tipo de equipamento
3. Se for cabo:
   a. Detecta ponta (A ou B)
   b. Detecta tipo de campo anterior (Label ou Value)
   c. Combina: ponta + tipo → próxima tabela + campo
4. Continua para próximo equipamento
```

#### **Padrões de Mapeamento:**

| Conteúdo Anterior | Ponta | Próxima Tabela | Próximo Campo |
|-------------------|-------|----------------|---------------|
| `=cabo123B!Prop.Fibra_11.Label` | B + Label | `cabob_t1` | `FIBRA_11LABEL` |
| `=cabo123A!Prop.Fibra_11.Label` | A + Label | `caboa_t1` | `FIBRA_11LABEL` |
| `=cabo123B!Prop.Fibra_11.VALUE` | B + Value | `cabob_t1` | `FIBRA_11` |
| `=cabo123A!Prop.Fibra_11.VALUE` | A + Value | `caboa_t1` | `FIBRA_11` |

#### **Implementação para Outros Componentes:**

```typescript
// Template para implementar em outros componentes
export class ConexaoDinamicaService {
  
  /**
   * Analisa conteúdo e determina próximo campo dinamicamente
   * @param conteudo Conteúdo lido anteriormente
   * @param tipoEquipamento Tipo do equipamento (cabo, caixa, dio, etc.)
   * @param fibra Número da fibra
   * @returns Próxima tabela e campo
   */
  analisarConexao(conteudo: string, tipoEquipamento: string, fibra: number): {
    proximaTabela: string,
    proximoCampo: string
  } {
    const isPontaB = conteudo.includes('B!');
    const isPontaA = conteudo.includes('A!');
    const isLabel = conteudo.includes('Label');
    const isValue = conteudo.includes('VALUE');
    const tubo = this.calculateTubo(fibra);
    
    if (tipoEquipamento === 'cabo') {
      if (isPontaB && isLabel) {
        return {
          proximaTabela: `cabob_t${tubo}`,
          proximoCampo: `FIBRA_${fibra}LABEL`
        };
      } else if (isPontaA && isLabel) {
        return {
          proximaTabela: `caboa_t${tubo}`,
          proximoCampo: `FIBRA_${fibra}LABEL`
        };
      } else if (isPontaB && isValue) {
        return {
          proximaTabela: `cabob_t${tubo}`,
          proximoCampo: `FIBRA_${fibra}`
        };
      } else if (isPontaA && isValue) {
        return {
          proximaTabela: `caboa_t${tubo}`,
          proximoCampo: `FIBRA_${fibra}`
        };
      }
    }
    
    // Implementar outros tipos de equipamento aqui
    throw new Error(`Tipo de equipamento não suportado: ${tipoEquipamento}`);
  }
}
```

### **📋 Lições Aprendidas:**

1. **Algoritmos dinâmicos** requerem análise do contexto anterior
2. **Ponteiros conceituais** são mais eficientes que regras fixas
3. **Combinações específicas** (`&&`) são melhores que condições genéricas (`||`)
4. **Ordem de declaração** é crítica em TypeScript
5. **Return prematuro** pode quebrar fluxos de execução

### **🎯 Próximos Passos:**

1. **Aplicar algoritmo** em outros componentes do sistema
2. **Criar serviço genérico** para reutilização
3. **Documentar padrões** para novos tipos de equipamentos
4. **Implementar testes unitários** para validação

**Última atualização**: 11/09/2025
**Status**: ✅ **ALGORITMO IMPLEMENTADO E FUNCIONANDO**
