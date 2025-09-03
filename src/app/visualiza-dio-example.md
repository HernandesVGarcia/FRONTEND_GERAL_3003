# Modal Visualiza DIO - Exemplo de Uso

## Como usar o Modal Visualiza DIO no seu sistema

### 1. Importar o componente no seu módulo

```typescript
import { VisualizaDioComponent } from './visualiza-dio/visualiza-dio.component';

@NgModule({
  declarations: [
    // ... outros componentes
    VisualizaDioComponent
  ],
  // ...
})
export class YourModule { }
```

### 2. Usar no seu componente

```typescript
import { MatDialog } from '@angular/material/dialog';
import { VisualizaDioComponent } from '../visualiza-dio/visualiza-dio.component';

export class YourComponent {
  constructor(private dialog: MatDialog) {}

  openVisualizaDioModal() {
    const dialogRef = this.dialog.open(VisualizaDioComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      data: { 
        id_meta: 12345,
        capacity: 36, // Opcional: número de campos F1-F36
        config: {
          title: 'Visualiza DIO',
          isEditable: true,
          showAllFields: false
        }
      }
    });
  }
}
```

### 3. Configurações disponíveis

#### VisualizaDioConfig
```typescript
interface VisualizaDioConfig {
  title: string;           // Título do modal
  isEditable: boolean;     // Se permite edição
  showAllFields: boolean;  // Se mostra todos os campos F1-F144
  visibleFields?: string[]; // Array com campos específicos para mostrar
}
```

#### VisualizaDioDialogData
```typescript
interface VisualizaDioDialogData {
  id_meta: number;         // ID da meta (obrigatório)
  config?: VisualizaDioConfig;  // Configurações do modal (opcional)
  capacity?: number;       // Capacidade para gerar campos F1-FX (opcional)
}
```

### 4. Exemplos de uso

#### Modal básico
```typescript
this.dialog.open(VisualizaDioComponent, {
  data: { id_meta: 12345 }
});
```

#### Modal com capacidade específica
```typescript
this.dialog.open(VisualizaDioComponent, {
  data: { 
    id_meta: 12345,
    capacity: 24  // Mostra apenas F1-F24
  }
});
```

#### Modal somente leitura
```typescript
this.dialog.open(VisualizaDioComponent, {
  data: { 
    id_meta: 12345,
    config: {
      title: 'Visualização DIO',
      isEditable: false,
      showAllFields: true
    }
  }
});
```

#### Modal com campos específicos
```typescript
this.dialog.open(VisualizaDioComponent, {
  data: { 
    id_meta: 12345,
    config: {
      title: 'Campos Específicos',
      isEditable: true,
      showAllFields: false,
      visibleFields: ['F1', 'F2', 'F3', 'F12', 'F24']
    }
  }
});
```

### 5. Integração com o GoogleMapsComponent

O modal já está integrado no `GoogleMapsComponent` com o método `openVisualizaDioModal()`:

```typescript
// Exemplo de uso no GoogleMapsComponent
openVisualizaDioModal(id_meta: number, capacity?: number) {
  const dialogRef = this.dialog.open(VisualizaDioComponent, {
    width: '90vw',
    maxWidth: '1200px',
    height: '90vh',
    data: { 
      id_meta,
      capacity,
      config: {
        title: 'Visualiza DIO',
        isEditable: true,
        showAllFields: false
      }
    }
  });
}
```

### 6. API Endpoints necessários

O modal espera que existam os seguintes endpoints na sua API:

- `POST /visualiza-dio-data` - Para buscar dados do modal
- `POST /visualiza-dio-update` - Para atualizar dados do modal

#### Exemplo de resposta da API:
```json
{
  "success": true,
  "data": {
    "id_meta": 12345,
    "F1": "Valor do campo F1",
    "F2": "Valor do campo F2",
    "F3": "Valor do campo F3",
    // ... outros campos F4-F144
  },
  "message": "Dados carregados com sucesso"
}
```

### 7. Recursos do Modal

- ✅ **Grid responsivo** - Campos organizados em grid que se adapta ao tamanho da tela
- ✅ **Indicadores visuais** - Campos preenchidos têm ícone verde, vazios têm ícone laranja
- ✅ **Barra de progresso** - Mostra quantos campos estão preenchidos
- ✅ **Modo edição** - Permite editar campos quando `isEditable: true`
- ✅ **Validação** - Valida campos antes de salvar
- ✅ **Loading states** - Mostra loading durante carregamento e salvamento
- ✅ **Tratamento de erros** - Exibe mensagens de erro quando necessário
- ✅ **Design responsivo** - Funciona bem em desktop e mobile

### 8. Personalização

Você pode personalizar o modal modificando:
- **CSS**: `src/app/visualiza-dio/visualiza-dio.component.css`
- **HTML**: `src/app/visualiza-dio/visualiza-dio.component.html`
- **Lógica**: `src/app/visualiza-dio/visualiza-dio.component.ts`
- **Serviço**: `src/app/servico/visualiza-dio.service.ts`
- **Interface**: `src/app/modelo/VisualizaDioData.ts`
