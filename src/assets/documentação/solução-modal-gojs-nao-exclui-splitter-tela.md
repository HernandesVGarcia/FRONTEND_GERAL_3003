# Solução: Modal GoJS não exclui o splitter da tela

## Problema

Ao excluir um splitter pelo context menu "Excluir Splitter", a API removia o splitter da base com sucesso, mas **o desenho do splitter podia continuar visível** no diagrama após fechar e reabrir o modal. O mesmo tipo de falha que ocorria com a exclusão de links (fusões): o elemento some na base, mas não some na tela do diagrama atual.

## Causa

A mesma do caso do link: o listener do evento `splitterContextMenu` é registrado **apenas uma vez** (flag estática) e fica vinculado à **primeira** instância do componente. Ao fechar e reabrir o modal, um **novo** diagrama é criado. O handler continua usando `this.diagram` da primeira instância para localizar e remover o nó do splitter (`this.diagram.findNodeForKey(nodeKey)` e `this.diagram.model.removeNodeData(node.data)`). Assim, a remoção era feita no diagrama **antigo**, e não no diagrama que o usuário está vendo.

Além disso, no context menu do splitter só era enviado no evento o **dado** do nó (`splitterData`), e não a referência ao **Part** (nó) nem ao diagrama. Sem a referência ao nó/diagrama correto, o componente não conseguia remover do diagrama certo.

## Solução

1. **Passar o nó (Part) no evento**  
   Nos componentes do stencil de splitter (spliter-1-p2, spliter-1-p4, spliter-1-p8, spliter-1-p16, spliter-desbalanceado), ao disparar o evento "Excluir Splitter", obter o nó adornado a partir do context menu do GoJS e incluí-lo no `detail` do evento. Em GoJS, o context menu é exibido dentro de um `Adornment`; o nó que foi clicado é `contextmenu.part.adornedPart`. Assim, no `detail` passa a ir `{ action: 'excluir', data: splitterData, node }`.

2. **Usar o diagrama do nó no componente**  
   No `gojs-demo.component.ts`, o handler de `splitterContextMenu` passa o `node` recebido do evento para `excluirSplitter(data, nodeRef)`. Em `excluirSplitter(splitterData, nodeRef?)`:
   - Usa `diagramToUse = nodeRef?.diagram ?? this.diagram` (diagrama do nó quando disponível).
   - Usa o próprio `nodeRef` quando existir; caso contrário, faz fallback para `diagramToUse.findNodeForKey(nodeKey)`.
   - Remove com `diagramToUse.model.removeNodeData(node.data)`.

Assim, após fechar e reabrir o modal, o splitter é removido do **diagrama ao qual o nó pertence** (o que está na tela). Se o `node` não vier no evento (ex.: versão diferente do GoJS), o comportamento permanece o anterior (`this.diagram` e `findNodeForKey`).

## Arquivos alterados

- **gojs-demo.component.ts**
  - `handleSplitterContextMenu`: extrai `node` do `event.detail` e chama `this.excluirSplitter(data, nodeRef)`.
  - `excluirSplitter(splitterData, nodeRef?)`: segundo parâmetro opcional; usa `nodeRef?.diagram` e `nodeRef` para remover do diagrama correto quando `nodeRef` estiver presente.

- **Stencil (5 componentes):** spliter-1-p2, spliter-1-p4, spliter-1-p8, spliter-1-p16, spliter-desbalanceado  
  No botão "Excluir Splitter", obtenção do nó adornado (`contextmenu.part` como `go.Adornment`, então `adornedPart`) e envio no evento: `detail: { action: 'excluir', data: splitterData, node }`.
