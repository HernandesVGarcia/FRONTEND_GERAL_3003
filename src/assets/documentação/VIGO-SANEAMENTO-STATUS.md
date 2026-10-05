# VIGO — saneamento de STATUS (situacao ≠ L)

Zera **`tstmeta.pop.STATUS`** dos clientes inativos no VIGO (**`situacao` diferente de `L`**, ex. cancelados **`X`**, bloqueados **`B`**), a partir de um JSON exportado do ERP. Corrige registros antigos (integração anterior) que ficaram com `STATUS = 1` no mapa.

O sync de clientes no login **não** altera `STATUS` de quem já existe — só insere clientes novos (regra em `inserir-cliente-vigo.service.ts`: `situacao = L` grava `1`, qualquer outra grava `0`).

## Como usar

1. Login no polo VIGO (`ID_ERP = 9`) e cidade correta selecionada — o saneamento roda **só na cidade logada**.
2. Toolbar → botão **Stat**.
3. Selecionar o arquivo JSON (pode ser export só de `X`, só de `B`, ou misto desde que traga `situacao`).
4. **Pré-visualizar** (nada é gravado) e conferir os totais.
5. **Aplicar STATUS = 0**.

## Formato do JSON

Array direto ou envelope (`clientes`, `response`, `data`, `result`):

```json
[
  { "id": 1234, "situacao": "X" },
  { "id": 1240, "situacao": "B" }
]
```

- **`id`** = `CONTRATO_GPON` no Fiberworks (aceita `id`, `ID`, `Id`).
- **`situacao`**: entram no saneamento todos os itens com valor **≠ `L`** (maiúsculo/minúsculo e espaços tolerados). Itens com `L` são ignorados.
- Se nenhum item tiver `situacao`, o modal usa todos os `id` e mostra aviso em tela.
- Contratos repetidos ou inválidos são descartados; limite de 20000 por execução.

## De-para

| VIGO | Fiberworks |
|------|------------|
| `id` | `tst.estações.CONTRATO_GPON` (com `M` = `idCIDADES`, `POP_ESTACAO = 0`) |
| `situacao` ≠ `L` (ex. `X`, `B`) | `tstmeta.pop.STATUS = '0'` (`tamanho = 1`) |

## API

```http
POST https://<host>:3001/consulta-vigo/sanear-status-clientes
Authorization: Bearer <JWT Fiberworks>
Content-Type: application/json

{
  "idCIDADES": 210,
  "contratos": [1234, 1240],
  "dryRun": true
}
```

Resposta: `totalValidos`, `totalEncontrados`, `totalJaZerados`, `totalParaAtualizar`, `totalAtualizados`, `totalNaoEncontrados` e `naoEncontrados` (primeiros 200 contratos).

Com `dryRun: true` nada é gravado. Consultas e updates rodam em lotes de 500 contratos.

## Arquivos

- `services/vigo-sanear-status.js` — classificação e `UPDATE` em lotes
- `routes/api_consulta_vigo.js` — rota acima
- `servico/consulta-api-vigo.service.ts` — `sanearStatusClientes(contratos, dryRun)`
- `vigo-sanear-status-modal/` — upload do JSON, prévia e aplicação
