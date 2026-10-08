# Importação KML — cabos

**Arquivos e diagrama em blocos:** [KML-IMPORT-REFERENCIA.md](./KML-IMPORT-REFERENCIA.md).

## Importação unificada

Cabos usam o **mesmo modal** e o **mesmo `.kml`** que caixas/CTOs (toolbar **Imp**). Não há aba separada: pastas **CABO1F** … **CABO144F** aparecem na lista junto com **CEO** / **CTO** quando existirem no arquivo. Detalhes de caixas: [KML-IMPORT-CAIXAS-CTO.md](./KML-IMPORT-CAIXAS-CTO.md).

## Pastas KML

Cada trecho deve ser um `Placemark` com **LineString** dentro de uma pasta reconhecida:

| Capacidade | Nomes aceitos (exemplos) |
|------------|-------------------------|
| 1F … 144F | `CABO12F`, `Cabo 12F`, `Cabos 12f` (como no export Fiberworks) |

Capacidades suportadas: **1, 2, 4, 6, 8, 12, 24, 36, 48, 72, 144** fibras.

- Trechos fora dessas pastas → erro na leitura (se o arquivo tiver só cabos, rejeita; se tiver caixas válidas, preview parcial + aviso).
- `Point` / `Polygon` ignorados na contagem (até aviso no resumo).
- Limite: **200** cabos por arquivo.

## Opções por pasta

Para cada capacidade presente no KML:

| Controle | Efeito na API |
|----------|----------------|
| Importar pasta | Inclui ou não os trechos na implantação |
| **Nacional** | Código de cores **Telebras** (`Codigo: 2`) |
| **Internacional** | **TIA/EIA 598** (`Codigo: 1`) |
| **Fibras por tubo** | Campo `tubo` (2, 6, 8, 12 ou 24 fibras) — igual ao plot manual |

## Label do cabo

- Preferência: `<name>` do Placemark.
- Se o nome for só `Cabo {id}`, tenta extrair `Label:` da `<description>` (export KML).
- Fallback: `Cabo_{capacidade}F_{n}`.

## Implantação

- `InsertCaboService.inserirCabo` — mesmo fluxo do desenho no mapa (`capacidade`, `tubo`, `Codigo`, `Label_cabo`, `length`, `GOOGLE_LATLNG`). No KML, `id_importacao` é enviado em `POST /insert_idmeta` (0 no primeiro sucesso do lote, depois o id âncora); ver lote em [KML-IMPORT-CAIXAS-CTO.md](./KML-IMPORT-CAIXAS-CTO.md).
- **Duplicatas:** o import **não** consulta labels existentes nem bloqueia trechos repetidos; cada seleção chama a API. Label já usado ou inválido pode resultar em **Erro** na linha (resposta do backend).
- Após sucesso: evento `reloadMapCabos`; modal **permanece aberto** (resumo + status por trecho).

## KMZ

Não suportado nesta versão — use `.kml` puro.
