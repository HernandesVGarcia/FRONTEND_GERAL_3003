# Solução: Modal GoJS DIO (diagrama, bandejas e fusões `/conex_dio`)

## Contexto

O modal **GoJS DIO** (`app-gojs-dio`) desenha a face do DIO e até seis bandejas de cabo (**C1** … **C6**), com dados de `bandejas.service` e tipos de cabo. Depois de montar o diagrama e o layout, a aplicação carrega a **conectividade** gravada no servidor e desenha **links** (fusões) entre a fibra correta em cada cabo e o conector correspondente na face do DIO.

Este fluxo é independente da rota de **escrita** que liga um cabo a uma bandeja (`/conexao_bandeja`). A **leitura** da conectividade para desenhar o diagrama usa outra rota e outro serviço.

## API de leitura: `POST /conex_dio`

- **Serviço:** [`angular-google-maps/src/app/servico/dio-conex-dio.service.ts`](../../app/servico/dio-conex-dio.service.ts)
- **Corpo:** `{ capacidade: number, idmeta: number }` — `capacidade` é o número de fibras da face do DIO (ex.: 12, 36); `idmeta` identifica o DIO.
- **Resposta:** objeto com `response` como array; usa-se a **primeira linha** `response[0]` como um mapa de campos string (pares **Fk** / **FNk**).

Não confundir com **`/conexao_bandeja`**, que persiste a ligação física do cabo à bandeja.

## Ordem no frontend (como no gojs-demo)

1. Carregar bandejas e tipos de cabo.
2. Criar o `Diagram`, nós (`dioFace`, cabos em **C1**…**C6** conforme ocupação), `GraphLinksModel` com `linkFromPortIdProperty` / `linkToPortIdProperty` = `fromPort` / `toPort`.
3. `applyVerticalCableLayout` e `zoomToFit`.
4. Após um **atraso (~200 ms)** — igual à ideia de [`gojs-demo`](../../app/gojs-demo/gojs-demo.component.ts) para as conexões a correrem depois do layout — chama-se a rotina que consulta `/conex_dio` e adiciona os links com `addLinkDataCollection` dentro de uma transação GoJS.

Ficheiro principal: [`gojs-dio.component.ts`](../../app/gojs-dio/gojs-dio.component.ts) (métodos `loadAndApplyDioFusoes`, `buildLinkDataFromConexRow`, `extractFirstConexRow`).

## Contrato dos campos Fk e FNk

Para cada índice **k** de **1** até **capacidade** (número de conectores da face):

| Campo   | Significado |
|--------|-------------|
| **Fk**  | Valor no formato **`diocN`** ou **`diocN_tX`** — indica o cabo na **bandeja CN** (N entre 1 e 6). |
| **FNk** | Número da **fibra** nesse cabo → porto **`F{n}`** no stencil (ex.: `2` → **`F2`**). |

### Erro de conceito corrigido: `_tX` não é porto D na face

O sufixo **`_tX`** em `dioc1_t1` **não** indica qual conector **D** na face do DIO. Indica **qual tabela** o backend usa para resolver a fibra. No frontend **ignora-se** o `_tX` para desenhar portos.

Quem define **qual conector na face** é o **nome do campo**:

- Par **F1** / **FN1** → conector **1** na face → porto **`D1`** em `dioFace`.
- Par **F3** / **FN3** → conector **3** → **`D3`**.

Assim mantém-se a regra: **uma fibra do cabo ↔ um conector**; não se concentram dezenas de fibras no mesmo **`Dk`** por culpa do sufixo `_tX`.

### Mapeamento GoJS

- **`from`:** nó **CN** (bandeja) extraída de **Fk** com regex `^dioc(\d+)(?:_t\d+)?$` → só **N** validado (1–6).
- **`fromPort`:** **`F{fibra}`** a partir de **FNk** (número da fibra).
- **`to`:** **`dioFace`**.
- **`toPort`:** **`D{k}`** — o **k** do par **Fk**/**FNk**, não o dígito após `_t` no valor **Fk**.

Sentido do link: do cabo para a face (**C*** → **dioFace**), alinhado ao uso habitual no diagrama DIO.

## Validações adicionais

- Se a fibra indicada em **FNk** for **maior** que a capacidade do cabo na bandeja (quando o tipo de cabo está carregado), esse par é **ignorado**.

## Referência rápida de exemplo

```text
"F1": "dioc1_t1",   "FN1": "2"
```

- Conector **1** da face → **D1**.
- Cabo na bandeja **C1** (valor `dioc1…`).
- Fibra **2** → porto **F2** no cabo.

O `_t1` não entra no cálculo do porto **D** na face.

## Arquivos relacionados

- `angular-google-maps/src/app/gojs-dio/gojs-dio.component.ts`
- `angular-google-maps/src/app/servico/dio-conex-dio.service.ts`
- `angular-google-maps/src/app/servico/conexao-bandeja.service.ts` (escrita; rota diferente)
