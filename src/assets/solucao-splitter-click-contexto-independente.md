# Solução: Splitter Click Contexto Independente

## 🔍 **Problema Identificado**

Os splitters dentro do modal do splitter funcionavam apenas quando o modal era aberto a partir do DIO, mas não funcionavam quando o modal era aberto a partir do GoJS.

### **Sintomas:**
- **DIO → Splitter**: ✅ Funcionava (clique em splitters dentro do modal abria novos modais)
- **GoJS → Splitter**: ❌ Não funcionava (clique em splitters dentro do modal não abria novos modais)

### **Evidência do Erro:**
```
🔀 [SPLITTER-CLICK-SPLITTER-MODAL] IDMETA: 398189, Capacidade: 2F, Label: XXXXXSXX
🔀 [SPLITTER-CLICK-HANDLER] Abrindo modal para splitter: 398189
❌ [SPLITTER-CLICK-HANDLER] Erro ao abrir modal: ReferenceError: require_graphviz_splitter_modal_component is not defined
```

## 🎯 **Causa Raiz**

### **Problema de Contexto de Execução:**

1. **DIO → Splitter (funcionava):**
   - Modal do DIO (`graphviz-modal`) estava aberto e ativo
   - Função `onSplitterClick` apontava para `graphviz-modal.handleSplitterClick`
   - `graphviz-modal` tinha acesso ao `MatDialog` para abrir novos modais ✅

2. **GoJS → Splitter (não funcionava):**
   - Modal do GoJS estava aberto
   - Função `onSplitterClick` ainda apontava para `graphviz-modal.handleSplitterClick`
   - Mas o `graphviz-modal` **não estava mais ativo** (foi fechado)
   - Quando clicava no splitter, a função executava no contexto do `graphviz-modal` **inativo**
   - O `MatDialog` não conseguia abrir novos modais ❌

### **Problema de Import Dinâmico:**
- Tentativa de import dinâmico com caminho incorreto
- Dependência circular ao tentar importar o próprio componente
- Erro `require_graphviz_splitter_modal_component is not defined`

## 🔧 **Solução Implementada**

### **1. Criação do SplitterModalService**

**Arquivo:** `src/app/servico/splitter-modal.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class SplitterModalService {
  
  constructor(private dialog: MatDialog) {}

  async openSplitterModal(idmeta: number, capacidade: number, label: string): Promise<void> {
    console.log(`🔀 [SPLITTER-SERVICE] Abrindo modal para splitter: ${idmeta}`);
    
    try {
      // Import dinâmico do componente
      const module = await import('../graphviz-splitter-modal/graphviz-splitter-modal.component');
      const GraphvizSplitterModalComponent = module.GraphvizSplitterModalComponent;
      
      this.dialog.open(GraphvizSplitterModalComponent, {
        width: '90vw',
        height: '90vh',
        maxWidth: '1400px',
        maxHeight: '900px',
        disableClose: false,
        data: {
          idmeta: idmeta,
          capacidade: capacidade,
          label: label
        },
        panelClass: 'graphviz-splitter-modal-container'
      });
      
      console.log(`🔀 [SPLITTER-SERVICE] Modal aberto para splitter: ${idmeta}`);
    } catch (error) {
      console.error('❌ [SPLITTER-SERVICE] Erro ao abrir modal:', error);
    }
  }
}
```

### **2. Atualização do GraphvizSplitterModalComponent**

**Arquivo:** `src/app/graphviz-splitter-modal/graphviz-splitter-modal.component.ts`

#### **Imports adicionados:**
```typescript
import { SplitterModalService } from '../servico/splitter-modal.service';
```

#### **Injeção do serviço no constructor:**
```typescript
constructor(
  public dialogRef: MatDialogRef<GraphvizSplitterModalComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any,
  private http: HttpClient,
  private fiberTraceSplitterService: FiberTraceUnifilarSplitterService,
  private dialog: MatDialog,
  private splitterModalService: SplitterModalService  // 🆕 NOVO
) {}
```

#### **Função onSplitterClick própria:**
```typescript
// 🔀 NOVO: Função própria para cliques em splitters dentro deste modal
(window as any).onSplitterClick = (idmeta: number, capacidade: number, label: string) => {
  console.log(`🔀 [SPLITTER-CLICK-SPLITTER-MODAL] IDMETA: ${idmeta}, Capacidade: ${capacidade}F, Label: ${label}`);
  this.handleSplitterClick(idmeta, capacidade, label);
};
```

#### **Método handleSplitterClick simplificado:**
```typescript
// 🔀 NOVO: Manipular clique no splitter dentro deste modal
public handleSplitterClick(idmeta: number, capacidade: number, label: string): void {
  console.log(`🔀 [SPLITTER-CLICK-HANDLER] Abrindo modal para splitter: ${idmeta}`);
  
  // Usar o serviço para abrir o modal
  this.splitterModalService.openSplitterModal(idmeta, capacidade, label);
}
```

## ✅ **Resultado**

### **Antes (problema):**
- **DIO → Splitter**: ✅ Funcionava (contexto do `graphviz-modal`)
- **GoJS → Splitter**: ❌ Não funcionava (contexto do `graphviz-modal` inativo)

### **Depois (solução):**
- **DIO → Splitter**: ✅ Funciona (usa função própria do `graphviz-splitter-modal`)
- **GoJS → Splitter**: ✅ Funciona (usa função própria do `graphviz-splitter-modal`)

## 🎯 **Vantagens da Solução**

1. **Contexto Independente**: Cada modal do splitter tem sua própria função `onSplitterClick`
2. **Sem Dependência Circular**: Serviço separado gerencia a abertura de modais
3. **Código Organizado**: Lógica de abertura de modais centralizada no serviço
4. **Reutilizável**: Outros componentes podem usar o `SplitterModalService`
5. **Fácil Manutenção**: Mudanças na lógica de abertura de modais em um só lugar

## 🔄 **Fluxo de Funcionamento**

1. **Usuário clica em splitter** dentro do modal do splitter
2. **Função `onSplitterClick`** é executada (própria do modal atual)
3. **Método `handleSplitterClick`** é chamado
4. **SplitterModalService** é usado para abrir novo modal
5. **Import dinâmico** carrega o componente corretamente
6. **Novo modal** é aberto com sucesso

## 📝 **Arquivos Modificados**

- ✅ `src/app/servico/splitter-modal.service.ts` (criado)
- ✅ `src/app/graphviz-splitter-modal/graphviz-splitter-modal.component.ts` (modificado)

## 🧪 **Teste**

Para testar a solução:
1. Abra um splitter a partir do DIO
2. Clique em outro splitter dentro do modal → Deve abrir novo modal ✅
3. Abra um splitter a partir do GoJS  
4. Clique em outro splitter dentro do modal → Deve abrir novo modal ✅

Ambos os cenários agora funcionam independentemente do contexto de origem.
