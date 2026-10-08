# Importação KML — caixas e CTOs

**Arquivos e diagrama em blocos:** [KML-IMPORT-REFERENCIA.md](./KML-IMPORT-REFERENCIA.md) (inventário completo frontend + API Node).

## Importação unificada

O mesmo modal e o **mesmo arquivo `.kml`** do export Fiberworks podem trazer **caixas/CTOs** (pastas CAIXAS/CEO e CTOS) e **cabos** (pastas CABO*nF) juntos. Veja também [KML-IMPORT-CABOS.md](./KML-IMPORT-CABOS.md). Um único **Implantar** grava caixas e cabos selecionados (caixas primeiro, depois cabos).

## Fluxo

1. Toolbar **Imp** → modal com mapa **isolado** (não altera o mapa principal durante a revisão).
2. Upload de `.kml` com pontos em pastas válidas (pode ser o KML completo da cidade).
3. Revisão: painel com pastas **CEO** e **CTO** (e, se houver, **CABO*nF** na mesma lista) + mapa de preview.
   - Checkbox **por pasta** para incluir ou não na implantação.
   - **Uma tipagem por pasta** (aplica a todos os pontos daquela pasta).
   - Lista read-only de pontos (nome/número e coordenadas do KML).
4. **Implantar** → confere duplicatas na cidade, depois `POST /insert_caixa` (mesmo contrato do plot manual, com `id_importacao` opcional no lote KML).
5. Após sucesso, o modal **permanece aberto** (resumo na tela); dispara `reloadMapCaixas` para atualizar o mapa principal. Feche com **Fechar** quando quiser.

## Lote `id_importacao`

Cada clique em **Implantar** (caixas e/ou cabos no mesmo fluxo) grava em `tstmeta.ids` o campo **`id_importacao`**:

- Valor do lote = **`id_meta` do primeiro objeto implantado com sucesso** nesse clique.
- Todos os demais CEO/CTO/cabos implantados no mesmo clique recebem o mesmo `id_importacao`.
- O primeiro registro também é atualizado via `POST /update_id_importacao` para `id_importacao = id_meta`.
- Plot manual e inserts sem KML: **0** (default).
- Reversão futura na base: `SELECT id_meta FROM tstmeta.ids WHERE id_importacao = ?` (somente `id_meta` principais de caixa/cabo importados; ids auxiliares gerados dentro de `insert_caixa` permanecem 0).

## Duplicatas na implantação

Antes de criar cada ponto, o modal carrega CEOs (`POST /caixas`) e CTOs (`POST /ctos`) da **cidade da sessão**, lê o array em `{ response: [...] }` (mesmo formato das listas do mapa) e monta um conjunto a partir do campo **`numero`** de cada linha (fallback `NUMEROCX` só se vier no JSON).

| Regra | Detalhe |
|-------|---------|
| Escopo | **Toda a cidade** — CEO e CTO compartilham a mesma unicidade de `NUMERO` |
| Comparação | `NUMERO` sanitizado (`chaveNumeroUnicoCidade`), **case-insensitive** |
| Já existe | Não chama `insert_caixa`; linha com status **Duplicada** |
| Mesmo arquivo | O segundo ponto com o mesmo número sanitizado também é bloqueado (após o primeiro implantar com sucesso) |
| Nome vazio (`NUMERO = 0`) | Não há checagem prévia; após insert, o `id_meta` entra no conjunto |

Lista **Caixas duplicadas não implantadas** no modal, com o **NUMERO** sanitizado e, quando diferente, o nome original do KML. O modal não fecha sozinho após implantar — use **Fechar** após revisar OK/duplicatas/erros.

Falha ao carregar caixas/CTOs da cidade **cancela** a implantação (sem inserts).

## Pastas obrigatórias

Todo `Placemark` com `Point` deve estar dentro de uma pasta KML reconhecida:

| Tipo        | Nomes aceitos (`<name>` da pasta, case-insensitive) |
|------|-----------------------------------------------------       |
| Caixa / CEO | `CAIXAS`, `Caixas (CEO)`, `Caixas`, `CEO`           |
| CTO         | `CTOS`, `CTOs`                                      |

- Pontos fora dessas pastas → arquivo **rejeitado** (sem preview).
- CTO-SP **não** é importado (KML não indica splitter).
- Geometrias que não são `Point` são ignoradas na contagem, desde que nenhum ponto fique fora das pastas.
- Limite: 500 pontos por arquivo.

## Formato compatível com export

O export Fiberworks (`KML` na toolbar) gera pastas `Caixas (CEO)` e `CTOs` — arquivos exportados podem ser reimportados após edição externa, desde que a estrutura de pastas seja mantida.

## Interface no modal

| Pasta UI | Origem no KML | Controles |
|----------|---------------|-----------|
| CEOs (Caixas) | Pontos em pastas CAIXAS / Caixas (CEO) / etc. | Importar pasta + tipagem CEO (ID_TIPO ≤ 9) |
| CTOs | Pontos em pastas CTOS / CTOs | Importar pasta + tipagem CTO (ID_TIPO > 9) |

- Pastas desmarcadas não entram no **Implantar**; no mapa de preview os marcadores ficam ocultos.
- Números/nomes dos pontos **não são editáveis** no modal (vêm do KML).

## Campo NUMERO (label da caixa)

O `<name>` de cada Placemark vira `NUMERO` na API com a **mesma regra** de **Plotar caixa** e **Detalhes caixa** (`sanitizarLabelCaixa` em `util/caixa-label.util.ts`):

- Apenas letras e dígitos permanecem; espaços e caracteres especiais viram `_` (underscore).
- Underscores duplicados são colapsados; `_` no início/fim são removidos.
- Ex.: `CEO 101` → `CEO_101`; `CTO-01/A` → `CTO_01_A`.
- Se após sanitizar ficar vazio (nome vazio ou só símbolos), envia `NUMERO = 0` e a API grava o **`id_meta`** como número final (igual ao plot manual sem label).

Na lista do modal aparece o **número sanitizado**; passe o mouse na linha para ver o texto original do KML quando diferente.

## KMZ

Fase 2: suporte `.kmz` via `jszip`. Na v1 atual, use `.kml` puro.

## Exemplo mínimo

```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Folder>
      <name>CAIXAS</name>
      <Placemark>
        <name>101</name>
        <Point><coordinates>-52.11,-23.32,0</coordinates></Point>
      </Placemark>
    </Folder>
    <Folder>
      <name>CTOS</name>
      <Placemark>
        <name>CTO-01</name>
        <Point><coordinates>-52.12,-23.33,0</coordinates></Point>
      </Placemark>
    </Folder>
  </Document>
</kml>
```
