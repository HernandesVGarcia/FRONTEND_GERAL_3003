# Solução: Modal GoJS não exclui o link (linha da fusão) da tela

## Problema

Ao excluir uma fusão (cabo-cabo, cabo-splitter, cabo-saída-splitter ou saída-entrada-splitter) pelo context menu "Excluir Fusão", a API removia a fusão da base com sucesso e o código logava "Link removido do diagrama", mas **a linha do link continuava visível** no diagrama. O problema ocorria de forma intermitente: às vezes o link sumia, às vezes não. Abrir e fechar o modal não resolvia; era necessário sair e entrar no sistema (recarregar a página) para o desenho voltar ao normal.

## Causa

O listener do evento `linkContextMenu` é registrado **apenas uma vez** (flag estática) e fica vinculado à **primeira** instância do componente que abre o modal do diagrama.

Quando o usuário fecha o modal e abre novamente, uma **nova** instância do componente é criada com um **novo** diagrama. O listener continua sendo o da primeira instância. Ao clicar em "Excluir Fusão" no diagrama **atual** (novo):

- O evento traz o `link` do **novo** diagrama (o que está na tela).
- O handler roda com `this` da **primeira** instância.
- O código usava `this.diagram` e `this.diagram.model` para remover o link.

Assim, a remoção era feita no **diagrama da primeira instância** (antigo ou já destruído), e não no diagrama em que o link está visível. O link do diagrama atual nunca era removido.

## Solução

Passar a usar o **diagrama ao qual o link pertence** em vez do diagrama do componente (`this.diagram`). Em GoJS, todo `Part` (incluindo `Link`) possui a propriedade `.diagram`, que referencia o diagrama em que ele está.

Em todos os trechos que removem o link após exclusão de fusão (cabo-cabo, cabo-splitter, cabo-saída-splitter, saída-entrada-splitter), no `gojs-demo.component.ts`:

- **Antes:** `if (this.diagram && this.diagram.model && link)` e `this.diagram.model.removeLinkData(link.data)` / `this.diagram.clearSelection()`.
- **Depois:** `if (link.diagram && link.diagram.model && link.data)`, `link.diagram.model.removeLinkData(link.data)` e `link.diagram.clearSelection()`.

Assim o link é sempre removido do **mesmo** diagrama em que ele está (o que está na tela), independentemente de qual instância do componente registrou o listener.

## Arquivos alterados

- `angular-google-maps/src/app/gojs-demo/gojs-demo.component.ts`: nos quatro fluxos de exclusão de fusão (cabo-cabo, cabo-splitter, cabo-saída-splitter, saída-entrada-splitter), uso de `link.diagram` e `link.diagram.model` em vez de `this.diagram` e `this.diagram.model` para remover o link e limpar a seleção.
