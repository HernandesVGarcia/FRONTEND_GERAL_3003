# Solução: Problema de Coordenadas ao Criar Caixas Após Conectar Cabos

## 📋 Resumo do Problema

Após conectar um cabo a uma caixa, ao tentar criar uma nova caixa através do context menu do mapa, a caixa era plotada na coordenada da última caixa criada, em vez da coordenada do clique com botão direito no mapa.

### Sintomas
- ✅ Funcionava corretamente antes de conectar cabos
- ❌ Após conectar um cabo, novas caixas eram plotadas na coordenada errada
- ❌ Mensagem de erro: "Erro: Coordenada do mapa não encontrada. Clique novamente no mapa."
- ❌ Coordenadas no modal não eram atualizadas ao abrir múltiplas vezes

---

## 🔍 Análise da Causa Raiz

### Problema 1: Coordenadas não reinitializadas no modal
- O componente `PlotaCaixaComponent` não detectava mudanças no `@Input() data`
- `ngOnInit()` só executa uma vez, então coordenadas antigas permaneciam no formulário

### Problema 2: Coordenada reutilizada após criar caixa
- A variável `ultimaCoordenadaContextMenu` não era limpa após ser usada
- Coordenada antiga era reutilizada em criações subsequentes

### Problema 3: Listener recriado não armazenava coordenada
- Quando um cabo era conectado, o listener do mapa era removido durante a edição
- Após finalizar a edição, um novo listener era criado via `recriarListenerRightClickMapa()`
- O listener recriado **não armazenava** `event.latLng` em `ultimaCoordenadaContextMenu`
- O listener original (criado por `setupContextMenuListener()`) armazenava corretamente

---

## ✅ Soluções Implementadas

### 1. Reinitialização do Formulário no Modal
**Arquivo:** `angular-google-maps/src/app/plota-caixa/plota-caixa.component.ts`

**Modificações:**
- Adicionado `OnChanges` e `SimpleChanges` aos imports
- Implementado `OnChanges` na classe do componente
- Criado método privado `atualizarFormulario()` para centralizar a inicialização
- `ngOnInit()` e `ngOnChanges()` agora chamam `atualizarFormulario()`

**Código:**
```typescript
import { Component, Input, OnInit, OnChanges, SimpleChanges, ... } from '@angular/core';

export class PlotaCaixaComponent implements OnInit, OnChanges {
  
  ngOnChanges(changes: SimpleChanges): void {
    // Atualizar formulário quando o data mudar (quando modal for reaberto com novas coordenadas)
    if (changes['data'] && changes['data'].currentValue) {
      console.log('🔄 [PLOTA-CAIXA] Dados atualizados:', changes['data'].currentValue);
      this.atualizarFormulario();
    }
  }

  ngOnInit(): void {
    this.carregarTiposCaixa();
    this.atualizarFormulario(); // Chamar método de inicialização
  }

  /**
   * Atualiza o formulário com os dados recebidos
   */
  private atualizarFormulario(): void {
    if (this.data) {
      this.form.tipagem = this.data.tipagem || 'INDEFINIDO';
      this.form.lat = this.data.lat?.toString().replace('.', ',') || '';
      this.form.lng = this.data.lng?.toString().replace('.', ',') || '';
      this.form.labelCaixa = ''; // Sempre vazio
      // ... outros campos
    } else {
      this.form.tipagem = 'INDEFINIDO';
      this.form.labelCaixa = '';
      this.form.lat = '';
      this.form.lng = '';
    }
  }
}
```

**Resultado:** Modal sempre exibe as coordenadas corretas ao ser reaberto.

---

### 2. Limpeza Imediata da Coordenada Após Uso
**Arquivo:** `angular-google-maps/src/app/google-maps/google-maps.component.ts`

**Método:** `criarCaixa()` (linha ~662)

**Modificação:**
- Capturar `lat` e `lng` imediatamente
- Limpar `ultimaCoordenadaContextMenu` logo após capturar os valores

**Código:**
```typescript
private criarCaixa(): void {
  console.log('🗺️ [CONTEXT-MENU] Criando caixa...');
  
  if (!this.ultimaCoordenadaContextMenu) {
    alert('Erro: Coordenada do mapa não encontrada. Clique novamente no mapa.');
    this.hideContextMenu();
    return;
  }

  // 🆕 Capturar coordenadas e limpar imediatamente para evitar reutilização
  const lat = this.ultimaCoordenadaContextMenu.lat();
  const lng = this.ultimaCoordenadaContextMenu.lng();
  this.ultimaCoordenadaContextMenu = null; // Limpar coordenada após capturar valores
  console.log('🗺️ [CONTEXT-MENU] Coordenada capturada e limpa:', { lat, lng });

  // Preparar dados para o modal
  const data: PlotaCaixaData = {
    tipagem: 'INDEFINIDO',
    lat: lat,
    lng: lng,
    // ... outros campos
  };
  
  // ... resto do código
}
```

**Resultado:** Coordenada não é reutilizada em criações subsequentes.

---

### 3. Limpeza Adicional ao Fechar Context Menu
**Arquivo:** `angular-google-maps/src/app/google-maps/google-maps.component.ts`

**Método:** `hideContextMenu()` (linha ~535)

**Modificação:**
- Limpar `ultimaCoordenadaContextMenu` quando o context menu é fechado
- A limpeza só ocorre quando **não** está em edição de cabo (para não interferir no fluxo de edição)

**Código:**
```typescript
public hideContextMenu(): void {
  this.contextMenuVisible = false;
  this.contextMenuType = 'map';
  
  // Não limpar se estiver em modo de edição ou iniciando edição
  if (!this.isEditingCabo && !this.isIniciandoEdicao) {
    this.clickedCaboData = null;
    this.clickedPolyline = null;
    // ... outros dados limpos
    
    // 🆕 NOVO: Limpar coordenada do context menu quando não estiver em edição
    if (this.ultimaCoordenadaContextMenu) {
      console.log('🗺️ [CONTEXT-MENU] Limpando coordenada antiga do context menu');
      this.ultimaCoordenadaContextMenu = null;
    }
  }
  
  this.isCaboClicked = false;
}
```

**Resultado:** Coordenada antiga é limpa quando o menu é fechado, garantindo atualização na próxima abertura.

---

### 4. Armazenamento de Coordenada no Listener Recriado
**Arquivo:** `angular-google-maps/src/app/google-maps/google-maps.component.ts`

**Método:** `recriarListenerRightClickMapa()` (linha ~2505)

**Problema Específico:**
- Quando um cabo é conectado, o listener original do mapa é removido durante a edição
- Após finalizar a edição, um novo listener é criado, mas **não armazenava** a coordenada
- O listener original (criado por `setupContextMenuListener()`) armazenava corretamente

**Modificação:**
- Adicionar o armazenamento de `event.latLng` no listener recriado, igual ao listener original

**Código:**
```typescript
private recriarListenerRightClickMapa(): void {
  console.log('🔄 [EDITAR-CABO] Recriando listener de rightclick do mapa...');
  
  // Remover listener anterior se existir
  if (this.listenerMapaRightClick) {
    google.maps.event.removeListener(this.listenerMapaRightClick);
    this.listenerMapaRightClick = null;
  }
  
  if (this.map) {
    this.listenerMapaRightClick = this.map.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
      // ... validações ...
      
      if (isMapClick && !this.isCaboClicked) {
        // ... validações de edição ...
        
        // 🆕 CORREÇÃO: Armazenar coordenada do clique para usar no modal de criar caixa
        if (event.latLng) {
          this.ultimaCoordenadaContextMenu = event.latLng;
          console.log('🗺️ [MAP] Coordenada armazenada (recriado):', event.latLng.lat(), event.latLng.lng());
        }
        
        // Mostrar context menu do mapa
        this.contextMenuType = 'map';
        if (event.domEvent) {
          const mouseEvent = event.domEvent as MouseEvent;
          this.showContextMenu(mouseEvent.clientX, mouseEvent.clientY);
        }
      }
    });
  }
}
```

**Resultado:** Após conectar um cabo, o listener recriado também armazena a coordenada corretamente.

---

## 🔄 Fluxo Final (Como Funciona Agora)

1. **Usuário clica com botão direito no mapa**
   - Listener original ou recriado captura o evento
   - `ultimaCoordenadaContextMenu` é definido com `event.latLng` ✅

2. **Usuário escolhe "Criar Caixa"**
   - `criarCaixa()` captura `lat` e `lng` imediatamente
   - `ultimaCoordenadaContextMenu` é limpo imediatamente ✅
   - Modal abre com as coordenadas corretas ✅

3. **Modal é aberto**
   - `ngOnChanges()` detecta mudança em `data`
   - `atualizarFormulario()` atualiza os campos do formulário ✅
   - Coordenadas são exibidas corretamente ✅

4. **Context menu é fechado**
   - `hideContextMenu()` limpa `ultimaCoordenadaContextMenu` (se não estiver em edição) ✅

5. **Após conectar um cabo**
   - Listener é recriado via `recriarListenerRightClickMapa()`
   - O listener recriado **também armazena** a coordenada ✅
   - Próxima caixa usa a coordenada correta ✅

---

## 📊 Comparação: Listener Original vs Recriado

### Listener Original (`setupContextMenuListener()`)
```typescript
this.listenerMapaRightClick = this.map.addListener('rightclick', (event) => {
  // ✅ ARMAZENA COORDENADA
  if (event.latLng) {
    this.ultimaCoordenadaContextMenu = event.latLng;
  }
  this.showContextMenu(...);
});
```

### Listener Recriado (ANTES da correção)
```typescript
this.listenerMapaRightClick = this.map.addListener('rightclick', (event) => {
  // ❌ NÃO ARMAZENAVA COORDENADA
  this.showContextMenu(...);
});
```

### Listener Recriado (DEPOIS da correção)
```typescript
this.listenerMapaRightClick = this.map.addListener('rightclick', (event) => {
  // ✅ AGORA ARMAZENA COORDENADA
  if (event.latLng) {
    this.ultimaCoordenadaContextMenu = event.latLng;
  }
  this.showContextMenu(...);
});
```

---

## ✅ Resultado Final

- ✅ Coordenadas sempre atualizadas no modal
- ✅ Sem reutilização de coordenadas antigas
- ✅ Funciona antes e depois de conectar cabos
- ✅ Limpeza adequada de variáveis temporárias
- ✅ Comportamento consistente entre listener original e recriado

---

## 📝 Notas Técnicas

### Por que o listener é recriado?
- Durante a edição de um cabo, o listener do mapa é removido para evitar interferências
- Após finalizar a edição (ou conectar o cabo), o listener precisa ser recriado
- O método `recriarListenerRightClickMapa()` é chamado em:
  - `finalizarEdicaoCabo()` (sucesso)
  - `finalizarEdicaoCabo()` (erro)
  - `cancelarEdicaoCabo()`

### Variável `ultimaCoordenadaContextMenu`
- Tipo: `google.maps.LatLng | null`
- Propósito: Armazenar a coordenada do último clique com botão direito no mapa
- Usada em: `criarCaixa()` para passar coordenadas ao modal
- Limpeza: Imediata após uso + ao fechar context menu (se não estiver em edição)

---

## 🧪 Como Testar

1. ✅ Criar duas caixas em locais diferentes
2. ✅ Desenhar um cabo entre elas
3. ✅ Conectar o cabo a uma das caixas
4. ✅ Tentar criar uma terceira caixa em um novo local
5. ✅ Verificar se a caixa é plotada na coordenada correta

---

## 📅 Data da Implementação

**Data:** Janeiro 2025

**Arquivos Modificados:**
1. `angular-google-maps/src/app/plota-caixa/plota-caixa.component.ts`
2. `angular-google-maps/src/app/google-maps/google-maps.component.ts`

**Total de Modificações:** 4 alterações em 2 arquivos

---

## 🔗 Referências

- Angular Lifecycle Hooks: `OnChanges`, `SimpleChanges`
- Google Maps API: `MapMouseEvent`, `LatLng`
- Event Listeners: `addListener()`, `removeListener()`

