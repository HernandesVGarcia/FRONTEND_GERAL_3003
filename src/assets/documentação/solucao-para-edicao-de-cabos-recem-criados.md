# Solução para Edição de Cabos Recém-Criados

## Problema Identificado

Quando dois ou mais cabos eram criados em sequência, ao tentar editar o primeiro cabo criado (dando dois cliques nele), o sistema editava o último cabo criado em vez do cabo clicado.

### Causa Raiz

O problema ocorria porque os listeners de eventos (dblclick, rightclick, touchstart, etc.) dos cabos recém-criados utilizavam a variável de instância `this.caboDesenhado`, que sempre aponta para o **último cabo criado**.

**Exemplo do problema:**
```typescript
// Listener de dblclick no cabo recém-criado
this.caboDesenhado.addListener('dblclick', (event) => {
  this.clickedPolyline = this.caboDesenhado; // ❌ Sempre aponta para o último cabo!
  this.editarCabo();
});
```

Quando você criava:
1. **Cabo 1** → `this.caboDesenhado` aponta para Cabo 1
2. **Cabo 2** → `this.caboDesenhado` aponta para Cabo 2 (sobrescreve)
3. Ao clicar no **Cabo 1** → o listener ainda usa `this.caboDesenhado`, que agora aponta para **Cabo 2** ❌

## Solução Implementada

A solução foi criar uma **variável local** que captura a referência da polyline no **closure** do método, similar ao padrão usado nos cabos carregados do banco.

### Código da Solução

```typescript
private criarCaboComTipagemEIdMeta(tipagemData: TipagemCabosData, idMeta: number, comprimento: number): void {
  // ... código de criação da polyline ...
  
  // Criar polyline final
  this.caboDesenhado = new google.maps.Polyline({
    ...polylineOptions,
    path: pontosFinais,
    map: this.map,
    geodesic: true,
    clickable: true,
    editable: false
  });
  
  // 🆕 SOLUÇÃO: Criar variável local para capturar no closure
  // Isso garante que cada cabo tenha sua própria referência, 
  // mesmo quando this.caboDesenhado é sobrescrito
  const polylineAtual = this.caboDesenhado;
  
  // ... código de atributos ...
  
  // ✅ Agora usar polylineAtual nos listeners
  polylineAtual.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
    this.clickedPolyline = polylineAtual; // ✅ Usa a referência correta!
    this.editarCabo();
  });
  
  polylineAtual.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
    this.processarRightClickCabo(event, polylineAtual, caboData); // ✅ Referência correta
  });
  
  // ... outros listeners também usam polylineAtual ...
}
```

### Por que Funciona?

1. **Closure em JavaScript/TypeScript**: Quando você cria uma variável local (`const polylineAtual`) dentro de uma função e a usa dentro de um listener, o JavaScript captura essa variável no closure.

2. **Cada cabo tem sua própria referência**: Mesmo que `this.caboDesenhado` seja sobrescrito quando um novo cabo é criado, cada listener mantém sua própria referência através de `polylineAtual`.

3. **Padrão consistente**: Esta solução segue o mesmo padrão usado nos cabos carregados do banco, onde cada polyline tem sua própria referência capturada no closure do `forEach`.

## Locais Alterados

### Arquivo: `google-maps.component.ts`

**Método:** `criarCaboComTipagemEIdMeta`

**Alterações:**
- Linha ~6369: Adicionada variável local `const polylineAtual = this.caboDesenhado;`
- Todos os listeners foram atualizados para usar `polylineAtual` em vez de `this.caboDesenhado`:
  - Listener de `click`
  - Listener de `dblclick` (3 ocorrências)
  - Listener de `rightclick` (2 ocorrências)
  - Listener de `touchstart` (3 ocorrências)
  - Listener de `touchend`
  - Listener de `touchmove`

## Resultado

Agora, quando você:
1. Cria o **Cabo 1** → seu listener captura a referência do Cabo 1 em `polylineAtual`
2. Cria o **Cabo 2** → seu listener captura a referência do Cabo 2 em `polylineAtual`
3. Clica no **Cabo 1** → o listener do Cabo 1 usa sua própria referência e edita o **Cabo 1** corretamente ✅
4. Clica no **Cabo 2** → o listener do Cabo 2 usa sua própria referência e edita o **Cabo 2** corretamente ✅

## Comparação com Cabos do Banco

Os cabos carregados do banco já funcionavam corretamente porque usavam o mesmo padrão:

```typescript
// Cabos do banco (já funcionavam corretamente)
paths.forEach((path, pathIndex) => {
  const polyline = new google.maps.Polyline({...});
  
  polyline.addListener('dblclick', (event) => {
    this.clickedPolyline = polyline; // ✅ Usa variável local do closure
    this.editarCabo();
  });
});
```

A solução aplicada aos cabos recém-criados segue exatamente o mesmo padrão.

## Data da Implementação

Implementado em: [Data da implementação]

## Autor

Solução desenvolvida para corrigir o bug onde cabos recém-criados editavam o último cabo em vez do cabo clicado.

