# Postes Concessionária no mapa

## 1. Objetivo

Permitir ao usuário **carregar postes da concessionária** (rede elétrica) na área visível do mapa, exibir marcadores coloridos conforme a **situação** do poste e controlar a visibilidade pela camada **Postes Concessionária** — independente de **Postes Aprovados**.

Diferença em relação a **Postes Aprovados**:

| Aspecto | Postes Aprovados | Postes Concessionária |
|---------|------------------|------------------------|
| Origem dos dados | Lista lateral (`lista-postes-aprovados`) | Botão no mapa + extent visível |
| API | `POST /postes_aprovados_coordenadas` | `POST /postes_coordenadas` |
| Camada no combobox | `postes_aprovados` | `postes_concessionaria` |
| Carregamento | Selecionados na sidebar | Sob demanda pelo usuário |

---

## 2. Fluxo geral

```mermaid
flowchart TD
  user[Usuario aproxima mapa] --> btn[Botao Postes Concessionaria visivel]
  btn --> click[Clique no botao signpost]
  click --> guard{Extent dentro do limite?}
  guard -->|Nao| alert[Alerta area ampla]
  guard -->|Sim| api[POST postes_coordenadas]
  api --> destino[destinoPostesConcessionaria]
  destino --> markers[updateMarkersPostesConcessionaria]
  markers --> layer{Camada postes_concessionaria ativa?}
  layer -->|Sim| mapa[Marcadores no Google Maps]
  layer -->|Nao| oculto[Marcadores nao desenhados]
```

---

## 3. API

### Endpoint

`POST {apiUrlAbsolute}/postes_coordenadas`

**Headers:** `Authorization: Bearer {token}`, `Content-Type: application/json`

**Body:**

```json
{
  "LAT_MAX": "-23.32",
  "LAT_MIN": "-23.35",
  "LONG_MAX": "-52.10",
  "LONG_MIN": "-52.12"
}
```

Valores enviados como **string**, obtidos do `map.getBounds()` no momento do clique.

**Resposta:** array de postes ou `{ response: [...] }`.

### Campos utilizados no front

| Campo API | Uso |
|-----------|-----|
| `NUM_SEQ_GEO` | Identificador no tooltip (`Poste {NUM_SEQ_GEO} — {SITUACAO}`) |
| `LATITUDE` | Posição do marcador |
| `LONGITUDE` | Posição do marcador |
| `SITUACAO` | Cor do marcador (ver seção 6) |

**Modelo TypeScript:** `src/app/modelo/poste-concessionaria.ts`

---

## 4. Arquivos do Angular

| Ficheiro | Responsabilidade |
|----------|------------------|
| `src/app/servico/postes-concessionaria.service.ts` | HTTP POST, token, timeout 15s, retry 2 |
| `src/app/modelo/poste-concessionaria.ts` | Interfaces `PosteConcessionaria`, `PostesConcessionariaExtent` |
| `src/app/map-search-buttons/map-search-buttons.component.*` | Botão toolbar (ícone `signpost`) |
| `src/app/aprovar-postes-modal/*` | Modal lista pós-seleção retangular |
| `src/app/google-maps/google-maps.component.ts` | Carga, marcadores, cores, limite de extent, modo aprovar |
| `src/app/google-maps/google-maps.component.html` | Binding do botão com o mapa |
| `src/app/servico/map-layer-visibility.service.ts` | Camada `postes_concessionaria` no combobox |

### Índice de seções no componente mapa

Comentário de índice em `google-maps.component.ts` (~linha 124): propriedades ~350, métodos POSTES NO MAPA ~5495, cores INSTALADA em caixas (seção distinta).

---

## 5. Botão na toolbar

**Local:** barra lateral de pesquisa (`app-map-search-buttons`).

**Ícone:** Material Icons `signpost`.

**Visibilidade:** o botão só aparece quando o **extent visível** está dentro do limite (não apenas zoom):

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
- `updateVisibleMarkers()` limita quantidade visível: `MAX_VISIBLE_MARKERS_POSTES_CONCESSIONARIA = 1000`

---

## 8. Backend / base de dados (referência)

Tabela de destino no MySQL: **`postes_parana`** (schema `tstmeta` no servidor).

Origem histórica de carga em massa: **`postes_wkt`** (coluna texto `wkt` no formato `POINT(lng lat)`).

Campos mapeados na migração INSERT (exemplo):

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

**Nota:** `postes_parana.OBJECTID` é obrigatório; incluir no INSERT ou usar `AUTO_INCREMENT`.

Rota Node no servidor: **`postes_coordenadas.js`** — deve exportar `module.exports = router` (não `{ router }`).

---

## 9. Constantes ajustáveis

Em `google-maps.component.ts`:

| Constante | Valor atual | Efeito |
|-----------|-------------|--------|
| `MAX_EXTENT_LAT_POSTES_CONCESSIONARIA` | 0.05 | Limite norte-sul para mostrar botão / permitir carga |
| `MAX_EXTENT_LNG_POSTES_CONCESSIONARIA` | 0.05 | Limite leste-oeste |
| `ZOOM_LEVEL_POSTES_CONCESSIONARIA` | 18 | Zoom mínimo para desenhar marcadores |
| `MAX_VISIBLE_MARKERS_POSTES_CONCESSIONARIA` | 1000 | Teto na rotina de visibilidade |

---

## 10. Verificação manual

1. Mapa afastado (cidade inteira) → botão **Postes Concessionária** oculto.
2. Aproximar até bairro → botão **aparece** (ícone `signpost`).
3. Clicar → loading no botão → postes na área visível.
4. Cores conforme `SITUACAO` (verde / laranja / vermelho / cinza).
5. Desligar camada "Postes Concessionária" no combobox → marcadores somem; religar → reaparecem sem nova API se dados já carregados.
6. Zoom &lt; 18 → marcadores ocultos mesmo com camada ligada.

---

## 11. Aprovar postes (seleção retangular)

Fluxo para selecionar postes Concessionária já carregados e revisar em formulário (sem gravação em API nesta fase).

### Pré-requisito

Carregar postes com o botão **Postes Concessionária** (`destinoPostesConcessionaria` não vazio).

### Passos

1. Botão direito no mapa (menu tipo `map`) → **Aprovar postes**.
2. Cursor muda para crosshair; arraste com botão esquerdo desenhando retângulo semi-transparente verde.
3. Ao soltar o mouse → modal **Aprovar postes** com tabela (`NUM_SEQ_GEO`, `SITUACAO`, `LATITUDE`, `LONGITUDE`).
4. Com o modal aberto, **continue arrastando retângulos no mapa** para incluir mais postes (lista acumula sem duplicar `NUM_SEQ_GEO`). O cursor permanece crosshair sobre o mapa.
5. **Confirmar** encerra seleção e fecha o modal (sem persistir). **Cancelar** descarta tudo.

O modal usa `backdrop: false` e `windowClass: 'aprovar-postes-modal-window'` (regras em `styles.css`) para o mapa continuar interativo — ver `TUTORIAL-MODAL-MAPA-INTERATIVO.md`.

### Cancelar seleção

- **ESC** ou botão direito no mapa encerra o modo e fecha o modal.
- Modos conflitantes (desenho cabo/polígono, régua, edição polígono) são encerrados ao iniciar.

### Arquivos

| Ficheiro | Função |
|----------|--------|
| `map-context-menu.component.html` | Item de menu `aprovar-postes` |
| `google-maps.component.ts` | `iniciarModoAprovarPostes()`, retângulo, filtro, modal |
| `aprovar-postes-modal/*` | Lista e botões Confirmar/Cancelar |

### Fase 2 (pendente)

- API POST para gravar postes aprovados na base.

---

## 12. Deploy

- Front: build Angular / Amplify (`amplify.yml`).
- API: copiar rota `postes_coordenadas` para `C:\optic-map-api\...` e reiniciar PM2 (portas 3001/3002).
- Garantir tabela `postes_parana` populada e índice em `NUM_SEQ_GEO` para consultas por extent.
