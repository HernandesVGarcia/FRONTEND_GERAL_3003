# Solução: Modais de Splitter Independentes

## Problema Identificado

### 1. Modal do Splitter não abria no segundo clique
**Sintoma:** 
- Primeiro clique: Modal abria normalmente ✅
- Segundo clique: Detectava o clique mas não abria o modal ❌

**Causa:** O `graphviz-splitter-modal.component.ts` estava sobrescrevendo a função global `onSplitterClick` com um método vazio.

**Solução:** Remover a sobrescrita da função global no modal do splitter.

### 2. Modais se moviam juntos ao arrastar
**Sintoma:**
- Ao arrastar o modal do splitter, o modal do DIO "colava" por baixo
- Ao arrastar o modal do DIO, ambos se moviam juntos

**Causa:** Ambos os modais usavam `document.addEventListener('mousedown', ...)` criando listeners globais conflitantes.

**Solução:** Usar a estratégia do `visualiza-dio` com listeners específicos no header de cada modal.

## Correções Implementadas

### 1. Correção da Função Global onSplitterClick

**Arquivo:** `src/app/graphviz-splitter-modal/graphviz-splitter-modal.component.ts`

**Removido:**
```typescript
// ❌ PROBLEMA: Sobrescrevia a função global
private setupInteractivity(): void {
  (window as any).onSplitterClick = (idmeta: number, capacidade: number, label: string) => {
    console.log(`🔀 [SPLITTER-CLICK] IDMETA: ${idmeta}, Capacidade: ${capacidade}F, Label: ${label}`);
    this.handleSplitterClick(idmeta, capacidade, label);
  };
}

private handleSplitterClick(idmeta: number, capacidade: number, label: string): void {
  // Método vazio - apenas comentários
}
```

**Resultado:** A função global `onSplitterClick` agora permanece sempre apontando para o `graphviz-modal.component.ts`, permitindo que o modal abra em todos os cliques.

### 2. Correção dos IDs Únicos dos Containers

**Arquivo:** `src/app/graphviz-splitter-modal/graphviz-splitter-modal.component.html`

**Antes:**
```html
<div id="graphviz-splitter-container" ...>
```

**Depois:**
```html
<div [id]="'graphviz-splitter-container-' + data.idmeta" ...>
```

**Arquivo:** `src/app/graphviz-splitter-modal/graphviz-splitter-modal.component.ts`

**Adicionado:**
```typescript
containerId: string = ''; // ID único do container baseado no IDMETA

ngOnInit() {
  // Gerar ID único do container baseado no IDMETA
  this.containerId = `graphviz-splitter-container-${this.data.idmeta}`;
  console.log('🔍 [SPLITTER-MODAL] Container ID:', this.containerId);
  // ...
}
```

**Resultado:** Cada modal de splitter tem seu próprio container único, evitando conflitos quando múltiplos modais estão abertos.

### 3. Correção dos Event Listeners para Independência

**Arquivo:** `src/app/graphviz-modal/graphviz-modal.component.ts`

**Antes:**
```typescript
// ❌ PROBLEMA: Listener global no document
document.addEventListener('mousedown', (e: MouseEvent) => {
  // Verificava se clicou no header
  // MAS executava para TODOS os cliques no documento
});
```

**Depois:**
```typescript
// ✅ CORREÇÃO: Listener apenas no header específico
this.modalHeaderElement.addEventListener('mousedown', (e: MouseEvent) => this.dragStart(e));
document.addEventListener('mousemove', (e: MouseEvent) => this.dragMove(e));
document.addEventListener('mouseup', (e: MouseEvent) => this.dragEnd(e));
```

**Arquivo:** `src/app/graphviz-splitter-modal/graphviz-splitter-modal.component.ts`

**Mesma correção aplicada:**
```typescript
// ✅ CORREÇÃO: Listener apenas no header específico
this.modalHeaderElement.addEventListener('mousedown', (e: MouseEvent) => this.dragStart(e));
document.addEventListener('mousemove', (e: MouseEvent) => this.dragMove(e));
document.addEventListener('mouseup', (e: MouseEvent) => this.dragEnd(e));
```

**Resultado:** Cada modal escuta apenas cliques no seu próprio header, tornando-os completamente independentes no movimento.

## Estratégia Utilizada

### Padrão do Visualiza-DIO
A solução foi baseada na estratégia já funcionando do `visualiza-dio.component.ts`:

```typescript
// ✅ ESTRATÉGIA CORRETA (visualiza-dio):
this.modalHeaderElement.addEventListener('mousedown', (e: MouseEvent) => this.dragStart(e));
document.addEventListener('mousemove', (e: MouseEvent) => this.dragMove(e));
document.addEventListener('mouseup', (e: MouseEvent) => this.dragEnd(e));
```

### Por que Funciona
1. **Listener específico**: Cada modal escuta apenas cliques no seu próprio header
2. **Sem conflitos**: Não há listeners globais competindo
3. **Independência total**: Cada modal funciona isoladamente

## Resultado Final

### ✅ Funcionalidades Implementadas
1. **Clique no splitter**: Abre modal de mapeamento em todos os cliques
2. **IDs únicos**: Cada modal tem container único baseado no IDMETA
3. **Modais independentes**: Cada modal se move independentemente
4. **Múltiplos modais**: Suporte a vários modais abertos simultaneamente
5. **Navegação aninhada**: Splitter dentro de splitter funciona perfeitamente

### ✅ Comportamento Esperado
- **Primeiro clique**: Abre modal do splitter ✅
- **Segundo clique**: Abre modal do splitter ✅
- **Terceiro clique**: Abre modal do splitter ✅
- **Arrastar modal DIO**: Move apenas o modal DIO ✅
- **Arrastar modal Splitter**: Move apenas o modal Splitter ✅
- **Sem interferência**: Modais não "colam" um no outro ✅

## Arquivos Modificados

1. `src/app/graphviz-splitter-modal/graphviz-splitter-modal.component.ts`
2. `src/app/graphviz-splitter-modal/graphviz-splitter-modal.component.html`
3. `src/app/graphviz-modal/graphviz-modal.component.ts`

## Data da Implementação
Janeiro 2025

## Status
✅ **RESOLVIDO** - Todos os problemas foram corrigidos e testados com sucesso.
