# Solução: Espelhar splitter (persistir e recuperar estado)

## Objetivo

Permitir que o usuário **espelhe** um splitter no diagrama GoJS (inverter visualmente entrada/saídas) e que esse estado seja **salvo na API** e **recuperado** ao reabrir a caixa, além de ser mantido quando o usuário **move** o splitter.

---

## Visão geral

- **Modelo:** o splitter tem um campo `espelhado` no diagrama (boolean) e a API usa `ESPELHAR` (0 ou 1).
- **Stencils:** cada template de splitter tem no context menu a opção "⇄ Espelhar", que inverte `node.data.espelhado` no modelo e dispara um evento para o gojs-demo salvar na API.
- **gojs-demo:** escuta o evento, chama a rota de update com X, Y, IDMETA e ESPELHAR; ao carregar o diagrama, preenche `espelhado` a partir de `splitter.ESPELHAR`; ao mover o splitter, envia também o ESPELHAR atual.

---

## 1. Modelo (Splitter)

**Arquivo:** `src/app/modelo/Splitter.ts`

- Adicionado campo `ESPELHAR: boolean | undefined` (a API pode devolver 0/1 como número; no modelo pode ficar como boolean para uso no front).
- A rota `/splitter` passa a retornar esse campo para cada splitter.

---

## 2. Backend / API

- **Rota de listagem:** `POST /splitter` — retorna os splitters da caixa, incluindo o campo **ESPELHAR** (0 ou 1).
- **Rota de atualização:** `POST /update_splitterxy` (ou a rota que sua API usa para atualizar coordenadas do splitter) — passa a aceitar no body:
  - `IDMETA`, `X`, `Y`, **ESPELHAR** (opcional; quando não enviado, o backend pode tratar como 0).

Ordem dos parâmetros na query de update, por exemplo:

- `UPDATE splitter_e SET X = ?, Y = ?, ESPELHAR = ? WHERE IDMETA = ?`
- Array de parâmetros: `[X, Y, ESPELHAR, IDMETA]`.

---

## 3. Serviço de atualização (UpdateSplitterXYService)

**Arquivo:** `src/app/servico/update-splitter-xy.service.ts`

- **Assinatura:** `atualizar(BCX: number, BCY: number, IDMETASP: number, ESPELHAR?: number)`.
- **Corpo da requisição:**
  - `IDMETA`, `X`, `Y`, **ESPELHAR**.
  - Se `ESPELHAR` não for passado, usa `0`: `const espelhar = ESPELHAR ?? 0`.

Assim, toda chamada de update (tanto ao espelhar quanto ao mover) envia o estado atual de espelhamento.

---

## 4. Stencils de splitter (templates GoJS)

**Arquivos:** todos os componentes de splitter em `src/app/Stencil/`:

- `spliter-1-p2`, `spliter-1-p4`, `spliter-1-p8`, `spliter-1-p16`, `spliter-1-p32`, `spliter-1-p64`, `spliter-1-p128`, `spliter-desbalanceado`.

Em cada um, no **context menu** do nó (template):

1. **Botão "⇄ Espelhar"**
   - No `click` do `ContextMenuButton`:
     - Obter o nó: `const adorno = obj.part as go.Adornment`, `const node = adorno?.adornedPart`.
     - Inverter o estado: `const esp = !node.data.espelhado`.
     - Atualizar o modelo: `diagram.model.commit((m) => (m as go.GraphLinksModel).setDataProperty(node.data, 'espelhado', esp), 'espelhar')`.
     - Disparar evento para o gojs-demo salvar na API:  
       `window.dispatchEvent(new CustomEvent('splitterContextMenu', { detail: { action: 'espelhar', data: node.data, node } }))`.
   - O `data` já contém o novo valor de `espelhado` (após o commit).

2. **Visual ligado a `espelhado`**
   - Cada stencil vincula a forma do splitter a `data.espelhado`:
     - **Splitters com geometria (1-p4, 1-p8, 1-p16, etc.):** `.bind("geometry", "espelhado", (esp) => esp ? geoEspelhado : geoNormal)`.
     - **Splitter desbalanceado (triângulo):** mantém `angle: -90` e usa `.bind("scale", "espelhado", (esp) => esp ? new go.Size(-1, 1) : new go.Size(1, 1))` para espelhar na horizontal.
   - Portas (ENTRADA, F1, F2, …) podem usar `.bind("alignment", "espelhado", ...)` para trocar de lado quando espelhado.

Com isso, o usuário vê o splitter inverter no diagrama e o evento leva o estado atual (e o nó) para o gojs-demo.

---

## 5. gojs-demo: interação com a solução

**Arquivo:** `src/app/gojs-demo/gojs-demo.component.ts`

### 5.1 Carregar diagrama (recuperar estado espelhado)

Ao montar os nós a partir da resposta da API (ex.: após abrir a caixa):

- Para cada splitter vindo do backend, ao montar o `splitterNode` (ObjectData do nó):
  - Definir **espelhado** a partir do campo da API:  
    `espelhado: !!splitter.ESPELHAR`
- Assim, splitters com `ESPELHAR === 1` aparecem já espelhados no diagrama.

### 5.2 Context menu: ação "espelhar"

O listener global de `splitterContextMenu` (adicionado uma vez, flag estática) trata a ação `'espelhar'`:

- Extrai `data` e `node` (nodeRef) do `event.detail`.
- Se existir `nodeRef`, `data` e `data.idmeta`:
  - Obtém posição: `x = nodeRef.position.x`, `y = nodeRef.position.y`.
  - Calcula valor para a API: `espelhar = data.espelhado ? 1 : 0` (já atualizado pelo stencil).
  - Chama: `this.UpdateSPXYService.atualizar(x, y, data.idmeta, espelhar).subscribe(...)`.

Assim, ao clicar em "Espelhar" no context menu, o estado é invertido no modelo (no stencil), o visual atualiza e a API persiste ESPELHAR 1 ou 0.

### 5.3 Mover splitter (manter ESPELHAR)

No listener de **PartMoved** (ou equivalente onde se detecta que o usuário arrastou o splitter):

- Ao identificar que o nó é um splitter (`node.data.key.startsWith("Splitter")`):
  - Obter `idmeta`: por exemplo `node.data.idmeta` ou, se não houver, `Number(apenasNumBoca)` a partir do `key`.
  - Obter estado atual: `espelhar = node.data.espelhado ? 1 : 0`.
  - Chamar: `this.UpdateSPXYService.atualizar(xboca, yboca, idmeta, espelhar).subscribe(...)`.

Assim, ao mover um splitter já espelhado, a requisição envia **ESPELHAR: 1** em vez de sempre 0, e o estado de espelhamento permanece correto na base.

---

## 6. Fluxo resumido

| Ação do usuário              | O que acontece |
|-----------------------------|----------------|
| Clica "⇄ Espelhar" no splitter | Stencil inverte `espelhado` no modelo e atualiza o visual; dispara `splitterContextMenu` com `action: 'espelhar'`. gojs-demo chama a API com X, Y, IDMETA e ESPELHAR (1 ou 0). |
| Move o splitter              | PartMoved no gojs-demo chama a API com X, Y, IDMETA e **ESPELHAR atual** (node.data.espelhado ? 1 : 0). |
| Abre/reabre a caixa          | GET/POST que traz os splitters retorna ESPELHAR; ao montar os nós, gojs-demo define `espelhado: !!splitter.ESPELHAR` para cada splitter, e o template desenha espelhado ou não conforme esse valor. |

---

## 7. Arquivos envolvidos

- **Modelo:** `src/app/modelo/Splitter.ts` — campo `ESPELHAR`.
- **Serviço:** `src/app/servico/update-splitter-xy.service.ts` — parâmetro e body `ESPELHAR`.
- **Stencils:** `spliter-1-p2`, `spliter-1-p4`, `spliter-1-p8`, `spliter-1-p16`, `spliter-1-p32`, `spliter-1-p64`, `spliter-1-p128`, `spliter-desbalanceado` — context menu "Espelhar", commit em `espelhado`, dispatch de `splitterContextMenu`, e bind do visual a `espelhado`.
- **Diagrama:** `src/app/gojs-demo/gojs-demo.component.ts` — preenchimento de `espelhado` ao carregar, caso `'espelhar'` no handleSplitterContextMenu e envio de ESPELHAR ao mover o splitter.

Com isso, o status de espelhamento do splitter é salvo e recuperado de forma consistente entre stencils, gojs-demo e API.
