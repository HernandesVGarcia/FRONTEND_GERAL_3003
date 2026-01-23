# 📝 Edição de Cabos - Instruções de Uso

## 🎯 Funcionalidade Implementada

Sistema completo de edição de geometria de cabos com persistência na base de dados.

---

## 🔧 Componentes Criados/Modificados

### 1️⃣ **API - update_geometria_cabo.ts**
- **Localização**: `src/assets/update_geometria_cabo.ts`
- **Rota**: `POST /update_geometria_cabo`
- **Função**: Atualiza geometria (coordenadas e comprimento) de um cabo na base de dados

### 2️⃣ **Serviço Angular - update-cabo.service.ts**
- **Localização**: `src/app/servico/update-cabo.service.ts`
- **Função**: Comunica com a API para atualizar cabos
- **Métodos principais**:
  - `atualizarCabo()` - Envia dados para API
  - `extrairCoordenadasPolyline()` - Extrai coordenadas de uma polyline
  - `calcularComprimentoPolyline()` - Calcula comprimento usando Google Maps Geometry

### 3️⃣ **Componente - google-maps.component.ts**
- **Modificações**:
  - Import e injeção do `UpdateCaboService`
  - Método `finalizarEdicaoCabo()` atualizado para salvar na API
  - Novo método `cancelarEdicaoCabo()` para cancelar edição

---

## 📋 Fluxo de Uso

### Passo 1: Selecionar Cabo
1. Clique com botão direito em um cabo no mapa
2. Context menu aparece com opção "Editar Cabo"

### Passo 2: Editar Geometria
1. Clique em "Editar Cabo"
2. Cabo fica **vermelho** e **editável**
3. **Arraste os pontos** (vértices vermelhos) para ajustar
4. **Adicione pontos** clicando na linha entre vértices
5. **Remova pontos** clicando com **botão direito** sobre vértices → "Delete vertex"

### Passo 3: Finalizar Edição
1. Clique em qualquer lugar do mapa (fora do cabo)
2. Sistema automaticamente:
   - 📍 Extrai novas coordenadas
   - 📏 Calcula novo comprimento
   - 💾 Salva na base de dados via API
   - ✅ Mostra mensagem de sucesso

---

## 🎨 Indicadores Visuais

| Estado | Cor | Descrição |
|--------|-----|-----------|
| Normal | Cor da capacidade | Cabo em estado normal |
| Editando | 🔴 Vermelho | Cabo em modo de edição |
| Sucesso | Cor da capacidade | Edição salva com sucesso |

---

## 📊 Dados Enviados para API

```json
{
  "id_meta": 755673,
  "length": 145.67,
  "GOOGLE_LATLNG": [
    {"lng": -51.945968, "lat": -23.400325},
    {"lng": -51.943215, "lat": -23.400584},
    {"lng": -51.942437, "lat": -23.400846}
  ]
}
```

---

## ✅ Respostas da API

### Sucesso (200)
```json
{
  "success": true,
  "id_meta": 755673,
  "message": "Cabo id_meta 755673 editado com sucesso",
  "affectedRows": 1,
  "length": 145.67,
  "totalPontos": 3
}
```

### Erro - Cabo não encontrado (404)
```json
{
  "error": "Cabo não encontrado",
  "message": "Nenhum cabo encontrado com id_meta 755673"
}
```

---

## 🔄 Tratamento de Erros

### Cenário 1: Erro ao salvar na API
- ❌ Mostra mensagem de erro
- ❓ Pergunta se deseja **cancelar** ou **manter** alterações locais
- 🔄 Se cancelar: recarrega página (restaura estado original)
- 💾 Se manter: mantém alterações locais (não salvas na API)

### Cenário 2: ID do cabo não encontrado
- ❌ Não permite salvar
- 🔄 Cancela edição automaticamente
- 📄 Recarrega página

---

## 🧪 Testando a Funcionalidade

### Teste Básico
1. Faça login no sistema
2. Selecione uma cidade
3. Localize um cabo no mapa
4. Clique com botão direito → "Editar Cabo"
5. Mova alguns pontos
6. Clique no mapa para finalizar
7. Verifique mensagem de sucesso

### Teste com Erro (sem API rodando)
1. Desligue o servidor da API
2. Tente editar um cabo
3. Verifique que erro é tratado corretamente
4. Escolha cancelar ou manter alterações

---

## 📝 Tabelas Atualizadas

A rota API atualiza a tabela:
- **tstmeta.cabopa**
  - Campo `GOOGLE_LATLNG` (JSON)
  - Campo `GEOMETRIA_LAT_LONG` (MapWinGIS)
  - Campo `length` (metros)

---

## 🚀 Melhorias Futuras (Sugestões)

- [ ] Botão ESC para cancelar edição
- [ ] Preview do comprimento durante edição
- [ ] Desfazer (Ctrl+Z) durante edição
- [ ] Snap to roads (ajustar para ruas)
- [ ] Salvar histórico de edições
- [ ] Edição em lote (múltiplos cabos)

---

## 🎨 Melhorias Visuais

### InfoWindows Durante Edição
- ✅ **InfoWindows são automaticamente desabilitados** durante a edição do cabo
- 🚫 Evita que janelas de informação apareçam ao clicar nos vértices
- ✅ **InfoWindows são reabilitados** automaticamente ao finalizar a edição
- 📍 Melhora significativa na experiência de edição
- 🔧 **Listeners são preservados** - não são removidos, apenas temporariamente desabilitados

### Como Funciona
1. Ao entrar em modo de edição:
   - `clickable: false` - Desabilita cliques na polyline
   - **Listeners são mantidos** (não removidos)
   - Console: "🚫 Cliques desabilitados durante edição (listeners preservados)"

2. Ao finalizar edição:
   - `clickable: true` - Reabilita cliques
   - **Listeners voltam a funcionar automaticamente**
   - Console: "✅ InfoWindows reabilitados"

### Por que isso funciona?
- Quando `clickable: false`, os eventos de clique não são disparados
- Os listeners continuam existindo, apenas não são acionados
- Ao voltar para `clickable: true`, tudo volta a funcionar normalmente
- **Não há perda de funcionalidade** após a edição

### Remover Pontos (Vértices) Durante Edição
- ✅ **Listener de rightclick é removido** durante edição
- 🗑️ Menu nativo do Google Maps fica disponível
- 📍 **Botão direito sobre vértice** → "Delete vertex"
- 🔄 **Listener é recriado** automaticamente ao finalizar
- ✅ Context menu volta a funcionar normalmente

**Como funciona:**
1. Durante edição:
   - `clearListeners(polyline, 'rightclick')` - Remove listener customizado da polyline
   - `removeListener(listenerMapaRightClick)` - Remove listener customizado do mapa
   - Menu nativo do Google Maps funciona nos vértices
   - Context menu do mapa não aparece mais
   
2. Ao finalizar:
   - `recriarListenerRightClick()` - Recria listener da polyline
   - `recriarListenerRightClickMapa()` - Recria listener do mapa
   - Context menu volta a funcionar no cabo
   - Context menu volta a funcionar no mapa

## 🔧 Arquivos Modificados

```
src/
├── assets/
│   ├── update_geometria_cabo.ts (NOVO)
│   └── update_geometria_cabo_INSTRUCOES.txt (NOVO)
├── app/
│   ├── servico/
│   │   └── update-cabo.service.ts (NOVO)
│   └── google-maps/
│       └── google-maps.component.ts (MODIFICADO)
```

---

## ⚠️ Observações Importantes

1. **Biblioteca Geometry**: Certifique-se que `geometry` está no index.html
2. **Autenticação**: Token válido é necessário
3. **Permissões**: Usuário deve ter permissão para editar cabos
4. **ID do cabo**: Deve existir na base de dados

---

**Desenvolvido em**: Novembro 2025
**Versão**: 1.0

