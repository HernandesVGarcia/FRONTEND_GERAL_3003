# Tutorial: Permitir clicar no Google Maps com o modal aberto

## Resumo do problema

Por padrão, quando um modal ng-bootstrap está aberto, o **backdrop** (fundo escuro) bloqueia todos os cliques na tela, incluindo o mapa do Google. O usuário não consegue fazer zoom, arrastar ou interagir com o mapa enquanto o modal está visível.

## Solução implementada

A solução consiste em três partes:

1. **Remover o backdrop** – `backdrop: false` na abertura do modal
2. **Definir uma classe única** – `windowClass` para identificar o modal
3. **Regras CSS globais** – `pointer-events: none` no container do modal e `pointer-events: auto` apenas no conteúdo visível

## Arquivos envolvidos

- **Onde o modal é aberto** – Ex.: `map-search-buttons.component.ts`, `google-maps.component.ts`
- **`styles.css`** – Regras globais de `pointer-events`
- **Template do componente** – Estrutura HTML com `modal-dialog` e `modal-content`

---

## Passo a passo: aplicar em um novo modal

### 1. Configurar a abertura do modal

Quando chamar `ngbModal.open()`, use:

```typescript
const modalRef = this.ngbModal.open(MeuModalComponent, {
  size: 'lg',
  backdrop: false,           // ← IMPORTANTE: sem backdrop
  centered: true,
  windowClass: 'meu-modal-window'  // ← Classe única para este modal
});
```

### 2. Adicionar regras em styles.css

Adicione no arquivo `angular-google-maps/src/styles.css` (dentro da seção de modais de pesquisa):

```css
/* Meu Modal */
.meu-modal-window,
.meu-modal-window * { pointer-events: none !important; }
.meu-modal-window .modal-dialog > .modal-content { pointer-events: none !important; }
.meu-modal-window app-meu-modal .modal-content,
.meu-modal-window app-meu-modal .modal-content * { pointer-events: auto !important; }
.meu-modal-window app-meu-modal .modal-content { user-select: none !important; }
```

**Substitua:**
- `meu-modal-window` → nome da classe que você passou em `windowClass`
- `app-meu-modal` → seletor do componente (ex.: `app-caixa-search-modal`)

### 3. Estrutura HTML do componente

O componente deve ter esta estrutura:

```html
<div class="modal-dialog modal-lg" #modalDialog>
  <div class="modal-content shadow-lg">
    <div class="modal-header bg-primary text-white" (mousedown)="onMouseDown($event)" style="cursor: move;">
      <h5 class="modal-title fw-bold">Título</h5>
      <button type="button" class="btn-close btn-close-white" (click)="fechar()"></button>
    </div>
    <div class="modal-body">
      <!-- Conteúdo -->
    </div>
    <div class="modal-footer bg-light">
      <!-- Botões -->
    </div>
  </div>
</div>
```

O ponto importante é que o **`.modal-content`** interno do componente (o que contém header, body e footer) é o que recebe `pointer-events: auto`. O resto do modal (container do ng-bootstrap) fica com `pointer-events: none`, deixando os cliques passarem para o mapa.

### 4. Conflito com body.modal-open

O arquivo `styles.css` contém:

```css
body.modal-open .modal-content {
  pointer-events: auto !important;
}
```

Essa regra aplica `pointer-events: auto` a todo `.modal-content` quando o modal está aberto. Por isso precisamos de uma regra mais específica para o **modal-content do ng-bootstrap** (que envolve o componente) ficar com `pointer-events: none`:

```css
.meu-modal-window .modal-dialog > .modal-content { pointer-events: none !important; }
```

Assim, apenas o `.modal-content` interno do seu componente (dentro de `app-meu-modal`) recebe cliques.

---

## Modais que usam esta solução

| Modal | windowClass | Arquivo que abre |
|-------|-------------|------------------|
| Caixa Search | `caixa-search-modal-window` | map-search-buttons.component.ts |
| Cliente Search | `cliente-search-modal-window` | map-search-buttons.component.ts |
| Estação Search | `estacao-search-modal-window` | map-search-buttons.component.ts |
| Cadastro Cliente | `cadastro-cliente-modal-window` | google-maps.component.ts |

---

## Modais que bloqueiam o mapa

Estes modais usam `backdrop: 'static'` e **não** permitem interação com o mapa:

- Plota Cliente
- Plota Caixa
- Plota Estação
- Plota DIO
- Detalhes Caixa
- Pop Info Modal
- Pop Estação Info Modal

Se quiser que o mapa fique interativo nesses modais, basta seguir o tutorial acima e trocar `backdrop: 'static'` por `backdrop: false` e adicionar `windowClass` + regras em `styles.css`.

---

## Diagrama da estrutura

```
ngb-modal-window.meu-modal-window     ← pointer-events: none (tudo)
  └── div.modal-dialog
        └── div.modal-content        ← pointer-events: none (ng-bootstrap)
              └── app-meu-modal
                    └── div.modal-dialog
                          └── div.modal-content  ← pointer-events: auto (só aqui)
                                ├── modal-header
                                ├── modal-body
                                └── modal-footer
```

## Arrastar o modal

Os modais com mapa interativo podem ser arrastados pelo header. O componente precisa de:

- `@ViewChild('modalDialog')` com `#modalDialog` no template
- `onMouseDown`, `onMouseMove`, `onMouseUp` com `@HostListener`

Consulte `caixa-search-modal.component.ts` ou `cadastro-cliente.component.ts` como referência.
