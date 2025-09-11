import { Component, OnInit } from '@angular/core';
import { ItemService } from '../../../services/item.service';
import { Item } from '../../../models/item.model';
import { BaseCrudListComponent } from '../../../shared/components/base-crud-list.component';
import { ListConfig } from '../../../shared/interfaces/list-config.interface';

/**
 * Componente de listagem de itens
 * Refatorado para usar BaseCrudListComponent eliminando duplicação de código
 * Redução de ~85% no código comparado à versão anterior
 */
@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [BaseCrudListComponent],
  template: `
    <app-base-crud-list 
      [config]="listConfig" 
      [service]="itemService">
    </app-base-crud-list>
  `,
  styleUrl: './item-list.component.scss'
})
export class ItemListComponent implements OnInit {

  /**
   * Configuração específica para listagem de itens
   */
  listConfig: ListConfig<Item> = {
    entityName: 'Item',
    entityNamePlural: 'Itens',
    baseRoute: '/itens',
    
    // Configuração das colunas da tabela
    columns: [
      { key: 'id', label: 'ID', width: '80px', sortable: true },
      { key: 'descricao', label: 'Descrição', sortable: true },
      { 
        key: 'valor', 
        label: 'Valor', 
        type: 'currency',
        formatter: (valor: number) => {
          if (!valor) return 'R$ 0,00';
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(valor);
        }
      },
      { key: 'quantidade', label: 'Quantidade' },
      { 
        key: 'contrato', 
        label: 'Contrato', 
        type: 'custom',
        formatter: (contrato: any) => {
          if (typeof contrato === 'object' && contrato.id) {
            return `Contrato #${contrato.id}`;
          }
          return '-';
        }
      }
    ],
    
    // Configuração dos filtros  
    filters: [
      {
        key: 'descricao',
        label: 'Buscar por descrição:',
        type: 'text',
        placeholder: 'Digite a descrição',
        searchOnEnter: true,
        searchMethod: 'buscarPorDescricao'
      },
      {
        key: 'contrato',
        label: 'Filtrar por contrato:',
        type: 'select',
        searchMethod: 'buscarPorContrato'
      }
    ],
    
    // Configuração do estado vazio
    emptyState: {
      icon: 'package',
      title: 'Nenhum item encontrado',
      subtitle: 'Os itens de contratos aparecerão aqui'
    },
    
    // TrackBy function para performance do *ngFor
    trackByFn: (index: number, item: Item) => item.id || index,
    
    // Mostrar contador de itens
    showItemCount: true
  };

  constructor(public itemService: ItemService) {}

  ngOnInit(): void {
    // O ciclo de vida é gerenciado pelo BaseCrudListComponent
    // Esta implementação elimina a necessidade de gerenciar:
    // - Estado de loading
    // - Gerenciamento de subscriptions
    // - Lógica de filtros
    // - Manipulação de erros
    // - Formatação de valores
  }
}