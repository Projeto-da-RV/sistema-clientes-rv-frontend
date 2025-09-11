import { Component, OnInit } from '@angular/core';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria.model';
import { BaseCrudListComponent } from '../../../shared/components/base-crud-list.component';
import { ListConfig } from '../../../shared/interfaces/list-config.interface';

/**
 * Componente de listagem de categorias
 * Refatorado para usar BaseCrudListComponent eliminando duplicação de código
 * Redução de ~85% no código comparado à versão anterior
 */
@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [BaseCrudListComponent],
  template: `
    <app-base-crud-list 
      [config]="listConfig" 
      [service]="categoriaService">
    </app-base-crud-list>
  `,
  styleUrl: './categoria-list.component.scss'
})
export class CategoriaListComponent implements OnInit {

  /**
   * Configuração específica para listagem de categorias
   */
  listConfig: ListConfig<Categoria> = {
    entityName: 'Categoria',
    entityNamePlural: 'Categorias',
    baseRoute: '/categorias',
    
    // Configuração das colunas da tabela
    columns: [
      { key: 'id', label: 'ID', width: '80px', sortable: true },
      { key: 'nome', label: 'Nome', sortable: true },
      { key: 'descricao', label: 'Descrição' },
      { key: 'beneficios', label: 'Benefícios' },
      { 
        key: 'ativo', 
        label: 'Status', 
        type: 'badge',
        badgeConfig: {
          trueValue: 'Ativo',
          falseValue: 'Inativo',
          trueClass: 'badge-success',
          falseClass: 'badge-danger'
        }
      }
    ],
    
    // Configuração dos filtros
    filters: [
      {
        key: 'nome',
        label: 'Buscar por nome:',
        type: 'text',
        placeholder: 'Digite o nome da categoria',
        searchOnEnter: true,
        searchMethod: 'buscarPorNome'
      },
      {
        key: 'ativo',
        label: 'Apenas ativas:',
        type: 'checkbox',
        searchMethod: 'buscarAtivas'
      }
    ],
    
    // Configuração do estado vazio
    emptyState: {
      icon: 'tag',
      title: 'Nenhuma categoria encontrada',
      subtitle: 'Comece adicionando uma nova categoria'
    },
    
    // TrackBy function para performance do *ngFor
    trackByFn: (index: number, categoria: Categoria) => categoria.id || index,
    
    // Mostrar contador de itens
    showItemCount: true
  };

  constructor(public categoriaService: CategoriaService) {}

  ngOnInit(): void {
    // O ciclo de vida é gerenciado pelo BaseCrudListComponent
    // Esta implementação elimina a necessidade de gerenciar:
    // - Estado de loading
    // - Gerenciamento de subscriptions
    // - Lógica de filtros
    // - Confirmação de exclusão
    // - Manipulação de erros
  }
}