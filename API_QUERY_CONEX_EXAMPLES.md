# 📋 Exemplos de Uso da API /api/query_conex

## 🗄️ **Base de Dados**

**IMPORTANTE**: Todas as consultas desta API são executadas na base `tstmeta` por padrão.

- **Base `tst`**: Dados puros (não usada nesta API)
- **Base `tstmeta`**: Dados de conectividade (usada por esta API)

A API automaticamente adiciona o prefixo `tstmeta.` em todas as tabelas das consultas.

### **Estrutura das Tabelas de Conectividade:**

#### **🔌 Cabos (Pontas A e B)**
- **`cabopa`** / **`cabopb`**: Tabelas principais para buscar IDMETA por `id_VISIO`
- **`caboa_t1` a `caboa_t12`**: Dados das fibras da ponta A (por tubo)
- **`cabob_t1` a `cabob_t12`**: Dados das fibras da ponta B (por tubo)

#### **📦 Caixas (Bocas)**
- **`cxboca1_t1` a `cxboca18_t12`**: Caixas de 1 a 18 bocas (por tubo)
- **`cxboca97_t1` a `cxboca99_t6`**: Caixas especiais

#### **🏢 DIOs (Distribuidores Internos Ópticos)**
- **`dio`**: Tabela principal dos DIOs
- **`dio_t1` a `dio_t12`**: Dados das fibras dos DIOs (por tubo)
- **`dioc1_t1` a `dioc6_t12`**: 6 bandejas de cabo (c1 a c6)
  - Cada bandeja pode receber **1 cabo de até 144 fibras**
  - As fibras podem se **fundir em qualquer posição** dos conectores do DIO
  - **Capacidade total**: Até 6 cabos de 144 fibras = 864 fibras por DIO

#### **🔀 Splitters**
- **`splitter_e`**: Entrada dos splitters
- **`splitter_t1` a `splitter_t16`**: Saídas dos splitters (por tubo)

## 🚀 **Rota Principal: Consulta Dinâmica**

### **POST** `/api/query_conex`

Executa consultas SQL dinâmicas com parâmetros, baseadas no módulo VB6 LE_CONEX.

#### **Request Body:**
```json
{
  "query": "SELECT {regist} as registro from {TABELA} where idmeta = {idmeta}",
  "params": {
    "regist": "Fibra_1.Label",
    "TABELA": "caboa_t1",
    "idmeta": 12345
  }
}
```

#### **Response:**
```json
{
  "success": true,
  "data": [
    {
      "registro": "Cliente João Silva"
    }
  ],
  "query": "SELECT Fibra_1.Label as registro from tstmeta.caboa_t1 where idmeta = 12345",
  "params": ["Cliente João Silva"]
}
```

---

## 🔍 **Rotas Específicas**

### **1. Buscar IDMETA por Nome Visual**

#### **POST** `/api/query_conex/idmeta-visual`

#### **Request Body:**
```json
{
  "tabelaCabo": "cabopa",
  "nomeCabo": "cabo3B"
}
```

**Nota**: Use `cabopa` para ponta A ou `cabopb` para ponta B dos cabos.

#### **Response:**
```json
{
  "success": true,
  "idmeta": 12345,
  "found": true
}
```

---

### **2. Buscar Registro por IDMETA**

#### **POST** `/api/query_conex/registro-idmeta`

#### **Request Body:**
```json
{
  "tabela": "caboa_t1",
  "idmeta": 12345,
  "registro": "Fibra_1.Label"
}
```

#### **Response:**
```json
{
  "success": true,
  "valor": "Cliente João Silva",
  "found": true
}
```

---

### **3. Buscar Fibra Conectada**

#### **POST** `/api/query_conex/fiber-connected`

#### **Request Body:**
```json
{
  "tabela": "dio",
  "idmeta": 298816,
  "fiber": 1
}
```

#### **Response:**
```json
{
  "success": true,
  "fiber": 25,
  "found": true
}
```

---

## 🧪 **Exemplos para Testar no Postman**

### **Exemplo 1: Consulta Dinâmica Completa**
```json
POST /api/query_conex
Content-Type: application/json
Authorization: Bearer {seu_token}

{
  "query": "SELECT {regist} as registro from {TABELA} where idmeta = {idmeta}",
  "params": {
    "regist": "obs1",
    "TABELA": "dio_t1",
    "idmeta": 298816
  }
}
```

### **Exemplo 2: Buscar IDMETA de Cabo**
```json
POST /api/query_conex/idmeta-visual
Content-Type: application/json
Authorization: Bearer {seu_token}

{
  "tabelaCabo": "caboa",
  "nomeCabo": "cabo3B"
}
```

### **Exemplo 3: Buscar Equipamento no DIO**
```json
POST /api/query_conex/registro-idmeta
Content-Type: application/json
Authorization: Bearer {seu_token}

{
  "tabela": "dio_t1",
  "idmeta": 298816,
  "registro": "obs1"
}
```

### **Exemplo 4: Buscar Fibra Conectada no DIO**
```json
POST /api/query_conex/fiber-connected
Content-Type: application/json
Authorization: Bearer {seu_token}

{
  "tabela": "dio",
  "idmeta": 298816,
  "fiber": 1
}
```

---

## 🔧 **Configuração no Postman**

### **Headers Obrigatórios:**
```
Content-Type: application/json
Authorization: Bearer {seu_token_jwt}
```

### **URL Base:**
```
https://www.fiberworks-api.com:3001/api/query_conex
```

---

## 📊 **Códigos de Resposta**

- **200**: Sucesso
- **400**: Parâmetros inválidos
- **401**: Não autorizado (token inválido)
- **500**: Erro interno do servidor

---

## 🚨 **Tratamento de Erros**

### **Erro de Parâmetros:**
```json
{
  "success": false,
  "error": "Query SQL é obrigatória"
}
```

### **Erro de Banco de Dados:**
```json
{
  "success": false,
  "error": "Erro na execução da consulta SQL",
  "details": "Table 'tstmeta.tabela_inexistente' doesn't exist"
}
```

---

## 💡 **Dicas para Testes**

1. **Use o token JWT** válido no header Authorization
2. **Teste primeiro** as rotas específicas antes da consulta dinâmica
3. **Verifique os logs** do servidor para debug
4. **Use dados reais** do banco para testes mais precisos
5. **Teste casos de erro** (tabelas inexistentes, IDs inválidos)

---

**Arquivo criado para**: Implementação da API de consultas dinâmicas baseada no módulo VB6 LE_CONEX
