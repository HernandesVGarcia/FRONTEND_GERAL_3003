# Postes Concessionária no mapa

## 1. Objetivo

Permitir ao usuário **carregar postes da concessionária** (rede elétrica) na área visível do mapa, exibir marcadores coloridos conforme a **situação** do poste e controlar a visibilidade pela camada **Postes Concessionária** — independente de **Postes Aprovados**.

Uma cidade pode ter **uma ou várias tabelas** de postes (multi-concessionária). Cada poste retornado traz o campo **`ORIGEM`** com o nome da tabela de onde veio.

Diferença em relação a **Postes Aprovados**:

| Aspecto | Postes Aprovados | Postes Concessionária |
|---------|------------------|------------------------|
| Origem dos dados | Lista lateral (`lista-postes-aprovados`) | Botão no mapa + extent visível |
| API | `POST /postes_aprovados_coordenadas` | `POST /postes_coordenadas` |
| Camada no combobox | `postes_aprovados` | `postes_concessionaria` |
| Carregamento | Selecionados na sidebar | Sob demanda pelo usuário |
| Multi-fonte | Não | Sim — N tabelas por cidade (`POSTES` CSV) |

---

## 2. Fluxo geral

```mermaid
flowchart TD
  cidades["POST /cidades retorna POSTES e POSTES_LISTA"]
  select["Usuario seleciona cidade"]
  auth["AuthService auth_postes_tabelas"]
  user[Usuario aproxima mapa] --> btn{POSTES_LISTA nao vazia e extent ok?}
  cidades --> select --> auth --> btn
  btn -->|Nao| oculto[Botao oculto]
  btn -->|Sim| click[Clique no botao signpost]
  click --> guard{Extent dentro do limite?}
  guard -->|Nao| alert[Alerta area ampla]
  guard -->|Sim| api["POST postes_coordenadas com POSTES_TABELAS"]
  api --> lookup["Backend consulta N tabelas tstmeta em paralelo"]
  lookup --> merge["Merge com ORIGEM por poste"]
  merge --> destino[destinoPostesConcessionaria]
  destino --> markers[updateMarkersPostesConcessionaria]
  markers --> layer{Camada postes_concessionaria ativa?}
  layer -->|Sim| mapa[Marcadores no Google Maps]
  layer -->|Nao| ocultoMarcadores[Marcadores nao desenhados]
```

---

## 3. API

### Configuração por cidade — `POST /cidades`

Ao listar cidades do polo, a API retorna o campo **`POSTES`** (texto CSV em `TST.cidades`) e o array parseado **`POSTES_LISTA`**.

```json
{
  "response": [
    {
      "IDCIDADES": 210,
      "CIDADE": "Maringá_LATLONG",
      "POSTES": "postes_parana, postes_wkt_cemig",
      "POSTES_LISTA": ["postes_parana", "postes_wkt_cemig"]
    },
    {
      "IDCIDADES": 646,
      "CIDADE": "MARINGA_PR_DEMONSTRA",
      "POSTES": "Indefinido",
      "POSTES_LISTA": []
    }
  ]
}
```

| Valor em `POSTES` | Efeito |
|-------------------|--------|
| `"postes_parana"` | Uma tabela — botão visível |
| `"postes_parana, postes_wkt_cemig"` | Duas tabelas — consulta paralela, merge no front |
| `"Indefinido"` ou vazio | Botão **Postes Concessionária** oculto |

No front, ao confirmar cidade no modal:

- `AuthService.setPostesTabelas(POSTES_LISTA)` persiste em `localStorage`:
  - `auth_postes_tabelas` — JSON array
  - `auth_postes_tabela` — CSV legado (`"postes_parana, postes_wkt_cemig"`)
- `AuthService.hasPostesConcessionaria()` retorna `true` quando `POSTES_LISTA` tem ao menos uma tabela válida.

### Endpoint de carga — `POST /postes_coordenadas`

`POST {apiUrlAbsolute}/postes_coordenadas`

**Headers:** `Authorization: Bearer {token}`, `Content-Type: application/json`

**Body (multi-concessionária):**

```json
{
  "POSTES_TABELAS": ["postes_parana", "postes_wkt_cemig"],
  "POSTES": "postes_parana, postes_wkt_cemig",
  "LAT_MAX": "-23.32",
  "LAT_MIN": "-23.35",
  "LONG_MAX": "-52.10",
  "LONG_MIN": "-52.12"
}
```

- **`POSTES_TABELAS`** (preferencial): array de nomes de tabela.
- **`POSTES`** (compatibilidade): CSV com os mesmos nomes; o front envia os dois campos.
- Extent: strings numéricas obtidas de `map.getBounds()` no clique.

**Resolução no backend (`resolverTabelasPostes`):**

1. Se `POSTES_TABELAS` é array não vazio → usa esse array (deduplicado).
2. Senão, parseia `POSTES` como CSV.
3. Se CSV vazio ou `Indefinido` → fallback **`postes_parana`**.

**Limite por tabela:** `LIMITE_POSTES_EXTENT = 5000` — cada tabela recebe até **5000 postes** no extent (consultas em paralelo com `Promise.all`). O merge final pode ter até **5000 × N** postes. Não há divisão do limite entre tabelas (evita buracos de cobertura).

**Resposta:**

```json
{
  "response": [
    {
      "NUM_SEQ_GEO": 472253061,
      "LATITUDE": -23.42648,
      "LONGITUDE": -51.94863,
      "SITUACAO": "Disponível",
      "ORIGEM": "postes_parana"
    },
    {
      "NUM_SEQ_GEO": 123456789,
      "LATITUDE": -23.42701,
      "LONGITUDE": -51.94910,
      "SITUACAO": "Possível",
      "ORIGEM": "postes_wkt_cemig"
    }
  ]
}
```

**Erros relevantes:**

| HTTP | Situação |
|------|----------|
| 400 | Falta `POSTES`/`POSTES_TABELAS` ou extent inválido |
| 422 | Nome de tabela inválido (regex `^[a-zA-Z0-9_]+$`) |
| 500 | Erro de consulta MySQL |

### Campos utilizados no front

| Campo API | Uso |
|-----------|-----|
| `NUM_SEQ_GEO` | Identificador no tooltip e chave de aprovação |
| `LATITUDE` | Posição do marcador |
| `LONGITUDE` | Posição do marcador |
| `SITUACAO` | Cor do marcador (ver seção 6) |
| **`ORIGEM`** | Nome da tabela de origem — tooltip, modal aprovar, insert |

Tooltip: `Poste {NUM_SEQ_GEO} ({ORIGEM}) — {SITUACAO}`

**Modelo TypeScript:** `src/app/modelo/poste-concessionaria.ts`

---

## 4. Arquivos do Angular

| Ficheiro | Responsabilidade |
|----------|------------------|
| `src/app/servico/postes-concessionaria.service.ts` | HTTP POST, `POSTES_TABELAS`, token, timeout 60s, retry 1 |
| `src/app/servico/auth.service.ts` | `setPostesTabelas`, `getPostesTabelas`, `hasPostesConcessionaria` |
| `src/app/city-select-modal/city-select-modal.component.ts` | Usa `POSTES_LISTA` ao confirmar cidade |
| `src/app/modelo/poste-concessionaria.ts` | Interfaces `PosteConcessionaria`, `PostesConcessionariaExtent` |
| `src/app/modelo/Cidades.ts` | Campo opcional `POSTES_LISTA` |
| `src/app/map-search-buttons/map-search-buttons.component.*` | Botão toolbar (ícone `signpost`) |
| `src/app/aprovar-postes-modal/*` | Modal lista pós-seleção retangular (coluna ORIGEM) |
| `src/app/google-maps/google-maps.component.ts` | Carga, marcadores, cores, limite de extent, modo aprovar |
| `src/app/google-maps/google-maps.component.html` | Binding do botão com o mapa |
| `src/app/servico/map-layer-visibility.service.ts` | Camada `postes_concessionaria` no combobox |

### Índice de seções no componente mapa

Comentário de índice em `google-maps.component.ts` (~linha 124): propriedades ~350, métodos POSTES NO MAPA ~5495, cores INSTALADA em caixas (seção distinta).

---

## 5. Botão na toolbar

**Local:** barra lateral de pesquisa (`app-map-search-buttons`).

**Ícone:** Material Icons `signpost`.

**Visibilidade:** o botão só aparece quando a cidade tem postes configurados (`hasPostesConcessionaria()`) **e** o extent visível está dentro do limite:

```typescript
MAX_EXTENT_LAT_POSTES_CONCESSIONARIA = 0.05  // ~5,5 km
MAX_EXTENT_LNG_POSTES_CONCESSIONARIA = 0.05  // ~5 km (Paraná)
```

**Atualização da flag** `postesConcessionariaBotaoVisivel`:

- `onMapInitialized`
- `zoom_changed`
- `bounds_changed` (debounce 200 ms)

**Defesa dupla:** mesmo que o botão fosse acionado, `onCarregarPostesConcessionaria()` valida o extent e exibe alerta se a área for ampla demais.

**Estado de carregamento:** `[disabled]="carregandoPostesConcessionaria"` enquanto a API responde.

---

## 6. Marcadores e cores (`SITUACAO`)

Funções em `google-maps.component.ts`:

- `updateMarkersPostesConcessionaria()` — cria marcadores circulares
- `iconeMarcadorPosteConcessionaria()` — símbolo `CIRCLE`, `scale: 4`
- `corMarcadorPosteConcessionaria()` — mapeamento por texto normalizado (minúsculas, sem acentos)

| Situação (contém no texto) | Cor fill | Hex |
|----------------------------|----------|-----|
| Indisponível (`indispon`) | Vermelho | `#dc3545` |
| Possível (`possiv`) | Laranja | `#fd7e14` |
| Disponível (`dispon`) | Verde | `#28a745` |
| Indefinido / vazio (`indefin` ou vazio) | Cinza | `#6c757d` |
| Outros valores desconhecidos | Cinza | `#6c757d` |

**Ordem das verificações:** `indispon` antes de `dispon` (evita falso positivo em "Indisponível").

**Estilo do símbolo:** `fillOpacity: 0.7`, `strokeColor: #ffffff`, `strokeWeight: 1.5`.

**Zoom mínimo para exibir marcadores:** `ZOOM_LEVEL_POSTES_CONCESSIONARIA = 18` (independente do botão de carga).

---

## 7. Camada de visibilidade

**ID:** `postes_concessionaria`  
**Label no combobox:** "Postes Concessionária"

- Default: visível (`true`) em `MapLayerVisibilityService`
- `updateMarkersPostesConcessionaria()` retorna cedo se a camada estiver desligada
- `layersChanged$` em `ngOnInit`: se o usuário reativar a camada e já existir `destinoPostesConcessionaria`, chama `updateMarkersPostesConcessionaria()` sem nova API
- `updateVisibleMarkers()` limita quantidade visível: `MAX_VISIBLE_MARKERS_POSTES_CONCESSIONARIA = 3000`

---

## 8. Backend / base de dados (referência)

### Multi-concessionária

- Coluna **`TST.cidades.POSTES`**: CSV de nomes de tabela, ex.: `"postes_parana, postes_wkt_cemig"`.
- Cada tabela em **`tstmeta.{nome}`** deve ter colunas `NUM_SEQ_GEO`, `LATITUDE`, `LONGITUDE`, `SITUACAO`.
- A rota valida cada nome (`^[a-zA-Z0-9_]+$`) e consulta em paralelo.
- Campo **`ORIGEM`** é injetado na query: `SELECT ..., ? AS ORIGEM` com o nome da tabela.

### Índices recomendados (por tabela)

| Índice | Colunas | Uso |
|--------|---------|-----|
| `idx_*_lat_long` | `LATITUDE`, `LONGITUDE` | Consulta por extent no mapa |
| `idx_*_num_seq_geo` | `NUM_SEQ_GEO` | Implantação / JOIN com `postes_wkt` |

### Carga em massa (exemplo)

Origem histórica: **`postes_wkt`** (coluna texto `wkt` no formato `POINT(lng lat)`).

| postes_wkt | postes_parana |
|------------|---------------|
| `COD_ID` | `NUM_SEQ_GEO` |
| `LATITUDE` / `LONGITUDE` | extraídos de `wkt` |
| `SITUACAO`, `ALT` → `ALTURA_PS`, etc. | demais colunas |

Carga incremental (só novos, sem UPDATE):

```sql
INSERT INTO tstmeta.postes_parana (OBJECTID, NUM_SEQ_GEO, LATITUDE, ...)
SELECT w.OBJECTID, w.COD_ID, w.LATITUDE, ...
FROM tstmeta.postes_wkt w
LEFT JOIN tstmeta.postes_parana p ON p.NUM_SEQ_GEO = w.COD_ID
WHERE p.NUM_SEQ_GEO IS NULL
  AND w.OBJECTID BETWEEN ... AND ...;
```

**Nota:** `postes_parana.OBJECTID` é obrigatório; incluir no INSERT ou usar `AUTO_INCREMENT`. `NUM_SEQ_GEO` pode ter duplicatas entre tabelas diferentes — por isso a chave lógica no front é **`(ORIGEM, NUM_SEQ_GEO)`**.

Rota Node: **`postes_coordenadas.js`** — exportar `module.exports = router`.

Espelho local: `documentação/rotas_api/postes_coordenadas.js`.

---

## 9. Constantes ajustáveis

Em `google-maps.component.ts`:

| Constante | Valor atual | Efeito |
|-----------|-------------|--------|
| `MAX_EXTENT_LAT_POSTES_CONCESSIONARIA` | 0.05 | Limite norte-sul para mostrar botão / permitir carga |
| `MAX_EXTENT_LNG_POSTES_CONCESSIONARIA` | 0.05 | Limite leste-oeste |
| `ZOOM_LEVEL_POSTES_CONCESSIONARIA` | 18 | Zoom mínimo para desenhar marcadores |
| `MAX_VISIBLE_MARKERS_POSTES_CONCESSIONARIA` | 3000 | Teto na rotina de visibilidade |

Em `postes-concessionaria.service.ts`:

| Constante | Valor | Efeito |
|-----------|-------|--------|
| `TIMEOUT` | 60000 ms | Timeout HTTP |
| `RETRY_ATTEMPTS` | 1 | Retentativas em falha |

Em `postes_coordenadas.js` (API):

| Constante | Valor | Efeito |
|-----------|-------|--------|
| `LIMITE_POSTES_EXTENT` | 5000 | Máximo de postes **por tabela** no extent |

---

## 10. Verificação manual

1. Mapa afastado (cidade inteira) → botão **Postes Concessionária** oculto.
2. Aproximar até bairro → botão **aparece** (ícone `signpost`) — só se cidade tem `POSTES_LISTA` não vazio.
3. Clicar → loading no botão → postes na área visível de **todas** as tabelas configuradas.
4. Tooltip mostra `ORIGEM` quando há multi-concessionária.
5. Cores conforme `SITUACAO` (verde / laranja / vermelho / cinza).
6. Desligar camada "Postes Concessionária" no combobox → marcadores somem; religar → reaparecem sem nova API se dados já carregados.
7. Zoom &lt; 18 → marcadores ocultos mesmo com camada ligada.
8. Cidade teste **210 Maringá** com `POSTES = "postes_parana, postes_wkt_cemig"`: console/network deve mostrar postes com duas ORIGEMs distintas.

---

## 11. Aprovar postes (seleção retangular)

Documentação completa de implantação: **[`APROVAR-POSTES-MAPA.md`](APROVAR-POSTES-MAPA.md)**.

Fluxo para selecionar postes Concessionária já carregados, revisar em modal e persistir via API.

### Pré-requisito

Carregar postes com o botão **Postes Concessionária** (`destinoPostesConcessionaria` não vazio).

### Passos

1. Botão direito no mapa (menu tipo `map`) → **Aprovar postes**.
2. Cursor muda para crosshair; arraste com botão esquerdo desenhando retângulo semi-transparente verde.
3. Ao soltar o mouse → modal **Aprovar postes** com tabela (`NUM_SEQ_GEO`, **`ORIGEM`**, `SITUACAO`, `LATITUDE`, `LONGITUDE`).
4. Com o modal aberto, **continue arrastando retângulos no mapa** para incluir mais postes (lista acumula sem duplicar **`(ORIGEM, NUM_SEQ_GEO)`**). O cursor permanece crosshair sobre o mapa.
5. Preencher **Observação** (aplicada a todos os postes; se vazio, salva `"-"`).
6. **Confirmar** persiste cada poste via `POST /insert_poste_aprovado` (um request por poste). **Cancelar** descarta tudo.

O modal usa `backdrop: false` e `windowClass: 'aprovar-postes-modal-window'` (regras em `styles.css`) para o mapa continuar interativo — ver `TUTORIAL-MODAL-MAPA-INTERATIVO.md`.

### Cancelar seleção

- **ESC** ou botão direito no mapa encerra o modo e fecha o modal.
- Modos conflitantes (desenho cabo/polígono, régua, edição polígono) são encerrados ao iniciar.

### Arquivos

| Ficheiro | Função |
|----------|--------|
| `map-context-menu.component.html` | Item de menu `aprovar-postes` |
| `google-maps.component.ts` | `iniciarModoAprovarPostes()`, retângulo, filtro, modal |
| `aprovar-postes-modal/*` | Lista (com ORIGEM), observação e botões Confirmar/Cancelar |
| `servico/insert-poste-aprovado.service.ts` | HTTP POST `/insert_poste_aprovado` (loop no Confirmar) |

### Fase 2 — API insert poste aprovado (integrado no front)

**Endpoint:** `POST /insert_poste_aprovado`  
**Arquivo:** `documentação/rotas_api/insert_poste_aprovado.js` (copiar para servidor PM2)  
**Tabela:** `tstmeta.postes_aprovados_parana`  
**Um poste por chamada** — o front faz loop N requests ao Confirmar.

**Headers:** `Authorization: Bearer {token}`, `Content-Type: application/json`

**Body (montado pelo serviço Angular):**

```json
{
  "id_city": 210,
  "NUM_SEQ_GEO": 472253061,
  "obs": "TESTE",
  "LATI": -23.42648,
  "LONG": -51.94863,
  "ORIGEM": "postes_parana"
}
```

- **`id_city`**: `AuthService.getIdCity()`
- **`ORIGEM`**: valor **`ORIGEM` do poste selecionado** (tabela de origem retornada por `/postes_coordenadas`), não o CSV completo da cidade
- **`obs`**: campo do modal (único para todos os postes da seleção)

**Duplicata:** antes de inserir, o front compara **`(ORIGEM, NUM_SEQ_GEO)`** com `destinoPostesAP` (postes já aprovados do provedor) e ignora repetidos.

**Resposta 200:** `{ "success": true, "insertId": 198, "NUM_SEQ_GEO": 774787707, "message": "..." }`

Após sucesso, os postes são adicionados a `destinoPostesAP` (com `ID` do `insertId`) e os marcadores de **Postes Aprovados** são atualizados no mapa. Para excluir um poste aprovado, ver [`EXCLUI-POSTES-APROVADOS-MAPA.md`](EXCLUI-POSTES-APROVADOS-MAPA.md).

---

## 12. Deploy

- **Front:** build Angular / Amplify (`amplify.yml`). Após deploy, **reselecionar a cidade** para gravar `auth_postes_tabelas` atualizado.
- **API:** copiar `routes/cidades.js`, `routes/postes_coordenadas.js` para o servidor PM2 (portas 3001/3002) e reiniciar.
- **MySQL:** coluna `POSTES` em `TST.cidades` (CSV); tabelas referenciadas em `tstmeta` com índices em `LATITUDE`/`LONGITUDE` e `NUM_SEQ_GEO`.
- **Espelhos locais:** `documentação/rotas_api/cidades.js`, `documentação/rotas_api/postes_coordenadas.js`.
