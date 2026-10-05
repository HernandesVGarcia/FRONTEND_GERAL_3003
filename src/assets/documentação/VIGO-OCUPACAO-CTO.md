# VIGO — ocupação da CTO (mapear + conectar)

Consulta `app_getonus` no VIGO e devolve **conexões** (dados VIGO) + **payloads** (de-para Fiberworks para `/update_cliente_ativacao`).

## No mapa (Angular)

- **Login (polo VIGO):** sync automático de **clientes** (`sincronizar-clientes`) — inalterado.
- **Toolbar → botão Vigo** (só `ID_ERP = 9`): processa **todas as CTO-SP** da cidade (`conta_splitter > 0`, lista via **`POST /ctos_sp`**, ordem `NUMEROCX`) com `ID_INTEGRACAO` → por `id_cto`: `ocupacao-cto-mapear` → cada `payload` via **`POST /update_cliente_ativacao`**. CTO sem splitter (`POST /ctos`) e emenda (`POST /caixas`) ficam fora do lote.
- **`POST /update_cliente_ativacao`:** se `tstmeta.pop.recurso_sp` ≠ 0, a API responde **422** (`CLIENTE_JA_CONECTADO`) e **não** altera boca99/splitter. Re-sync Vigo trata isso como **ignorado** no resumo; ativação manual exibe a mesma mensagem.
- **Sync de caixas** (`ID_INTEGRACAO` + `portas`): **`POST /consulta-vigo/sincronizar-caixas`** (Postman ou sync no login).
- **Diagrama da caixa (`gojs-demo`)**, polo VIGO: ao abrir “Visualizar Conectividade”, o diagrama carrega primeiro as conexões **já gravadas** no Fiberworks; em seguida (background) consulta VIGO para o `ID_INTEGRACAO` da caixa e aplica `update_cliente_ativacao`; ao terminar, **Redraw** automático se houve conexão ou ignorado. Botão **Conectar VIGO** repete o fluxo manualmente.

## Pré-requisitos

- Polo VIGO (`ID_ERP = 9`), token válido.
- Caixa com `ID_INTEGRACAO` = `id_cto` VIGO e `portas` preenchido (`POST /consulta-vigo/sincronizar-caixas`).
- Clientes com `CONTRATO_GPON` = `id_cliente` VIGO.
- Splitter em `tstmeta.splitter_e` com `ID_META_CAIXA` e `CAPACIDADE` = `portas` da caixa.

## De-para

| VIGO | Fiberworks |
|------|------------|
| `id_cto` | `tstmeta.caixa.ID_INTEGRACAO` → `idmeta_caixa` |
| `id_cliente` | `tst.estações.CONTRATO_GPON` → `idmeta_cliente` |
| `portas` (caixa) | `splitter_e.CAPACIDADE` → `idmeta_splitter` |
| `porta_cto` | `saida_splitter` |

## Postman

```http
POST https://<host>:3001/consulta-vigo/ocupacao-cto-mapear
Authorization: Bearer <JWT Fiberworks>
Content-Type: application/json

{
  "idCIDADES": 210,
  "idCtoVigo": 3
}
```

## Resposta (200)

- **`conexoes`**: saídas ocupadas reportadas pelo VIGO (`id_cliente`, `porta_cto`, etc.).
- **`payloads`**: objetos prontos para `POST /update_cliente_ativacao` (fase 2).
- **`semCorrespondencia`**: ocupações VIGO sem cliente no Fiberworks.
- **`avisos`**: múltiplas caixas/splitters/clientes com mesmo critério.

## Arquivos

- `services/vigo-client.js` — `consultarOnusComRetry` → `/api/app_getonus`
- `services/vigo-ocupacao-cto.js` — `mapearOcupacaoCtoVigo`
- `routes/api_consulta_vigo.js` — rota acima
