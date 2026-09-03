# Solução: Tracer unifilar DIO — incremento errado no nó inicial

## Objetivo

Corrigir o rótulo do **primeiro nó** do diagrama unifilar quando o tracer é iniciado a partir do **DIO** (visualiza-DIO → botão Tracer em F1, F2, etc.). O restante do rastreamento já funcionava; apenas o ponto de partida no Graphviz aparecia com a fibra **+1**.

---

## Sintoma

| Ação do usuário | Comportamento incorreto | Comportamento esperado |
|-----------------|-------------------------|------------------------|
| Tracer na **fibra 1** | Nó inicial `B1C1_F2` | Nó inicial `B1C1_F1` |
| Tracer na **fibra 2** | Nó inicial `B1C1_F3` | Nó inicial `B1C1_F2` |
| Tracer na fibra N | Nó inicial `B1C1_F(N+1)` | Nó inicial `B1C1_FN` |

A partir do **segundo equipamento** (cabo, caixa, DIO destino, etc.) o diagrama e o rastreamento seguiam corretos — só o **primeiro quadradinho** (origem no DIO) estava deslocado.

---

## Causa raiz

### Entrada 1-based no visualiza-DIO

O componente [`visualiza-dio.component.ts`](../../app/visualiza-dio/visualiza-dio.component.ts) envia a fibra já **1-based**:

- `getCurrentFiberNumber()` → `rowIndex + 1` ou `group.start + rowIndex`
- `onTracerClick(fiberNumber)` → `fiber = fiberNumber`, `regist = F${fiberNumber}` (ex.: `F1` para fibra 1)

### Bug só no passo 0 do serviço unifilar

Em [`fiber-trace-unifilar.service.ts`](../../app/servico/fiber-trace-unifilar.service.ts), no bloco `stepCount === 0`, o nome do nó DOT era montado com **`fiber + 1`**, assumindo erroneamente que `fiber` vinha 0-based:

```typescript
// ANTES (incorreto):
this.Objeto_Atual = `${sigla}_F${fiber + 1}`;
```

Esse `+ 1` existia **apenas** nesse trecho. Os demais passos obtêm o número da fibra:

- do registro consultado no banco (`F1`, `F2`, …);
- do parse da string de conexão (`Prop.Fibra_1`, `BOCA2_1`, etc.);
- de consultas `FN_XLABEL` com o `fiber` já correto.

Por isso **só o nó inicial do DIO** ficava errado.

### Serviços já corretos (referência)

| Serviço | Nó inicial |
|---------|------------|
| `fiber-trace-unifilar-total.service.ts` | `${sigla}_F${fiber}` (sem +1) |
| `fiber-trace-unifilar-cabo.service.ts` | `${sigla}_F${fiber}` (sem +1) |
| `fiber-trace-unifilar.service.ts` | tinha `fiber + 1` **antes da correção** |

---

## Correção aplicada

**Arquivo:** `src/app/servico/fiber-trace-unifilar.service.ts`  
**Método:** `performTrace()` — bloco `if (stepCount === 0)`

```typescript
// DEPOIS (correto):
this.Objeto_Atual = `${sigla}_F${fiber}`;
```

Nenhuma alteração em `visualiza-dio.component.ts` — a origem já passava a fibra correta.

---

## Fluxo resumido

```mermaid
flowchart LR
  click["Tracer F1 no DIO"]
  params["fiber=1, regist=F1"]
  step0["stepCount=0: Objeto_Atual = sigla_F1"]
  db["Consulta dio_t1.F1"]
  rest["Demais passos: parse do banco"]

  click --> params --> step0 --> db --> rest
```

---

## Verificação manual

1. Abrir modal **Visualiza DIO** de um equipamento com sigla conhecida (ex.: `B1C1`).
2. Clicar **Tracer** na **fibra 1** (primeira linha do grupo 1–12).
3. Abrir diagrama Graphviz gerado.
4. Confirmar primeiro nó: **`B1C1_F1`** (não `B1C1_F2`).
5. Repetir para F2 → primeiro nó **`B1C1_F2`**.
6. Confirmar que cabos/caixas/destinos seguintes permanecem iguais ao comportamento anterior.

---

## Deploy

- **Somente front-end** — build Angular / Amplify.
- Nenhuma mudança de API ou banco.

---

## Documentação relacionada

- [`PROJECT_DOCUMENTATION.md`](../../PROJECT_DOCUMENTATION.md) — seção sistema de rastreamento unifilar
- [`solução-modal-gojs-dio.md`](solução-modal-gojs-dio.md) — modal GoJS do DIO (contexto diferente)

---

## Histórico

| Data | Alteração |
|------|-----------|
| 2026-08-31 | Removido `+ 1` em `Objeto_Atual` no passo inicial do tracer unifilar a partir do DIO |
