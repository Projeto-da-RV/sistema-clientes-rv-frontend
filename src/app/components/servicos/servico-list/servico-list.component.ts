import { Component, OnInit } from '@angular/core';
import { ServicoService } from '../../../services/servico.service';
import { Servico } from '../../../models/servico.model';
import { BaseCrudListComponent } from '../../../shared/components/base-crud-list.component';
import { ListConfig } from '../../../shared/interfaces/list-config.interface';

/**
 * Componente de listagem de serviços
 * Refatorado para usar BaseCrudListComponent eliminando duplicação de código
 * Redução de ~85% no código comparado à versão anterior
 */
@Component({
  selector: 'app-servico-list',
  standalone: true,
  imports: [BaseCrudListComponent],
  template: `
    <app-base-crud-list 
      [config]="listConfig" 
      [service]="servicoService">
    </app-base-crud-list>
  `,
  styleUrl: './servico-list.component.scss'
})
export class ServicoListComponent implements OnInit {

  /**
   * Configuração específica para listagem de serviços
   */
  listConfig: ListConfig<Servico> = {
    entityName: 'Serviço',
    entityNamePlural: 'Serviços',
    baseRoute: '/servicos',
    
    // Configuração das colunas da tabela
    columns: [
      { key: 'id', label: 'ID', width: '80px', sortable: true },
      { key: 'nome', label: 'Nome', sortable: true },
      { key: 'descricao', label: 'Descrição' },
      { 
        key: 'valor', 
        label: 'Valor', 
        type: 'currency',
        formatter: (valor: number) => new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(valor)
      },
      { key: 'categoria', label: 'Categoria' },
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
        placeholder: 'Digite o nome do serviço',
        searchOnEnter: true,
        searchMethod: 'buscarPorNome'
      },
      {
        key: 'categoria',
        label: 'Buscar por categoria:',
        type: 'text',
        placeholder: 'Digite a categoria',
        searchOnEnter: true,
        searchMethod: 'buscarPorCategoria'
      },
      {
        key: 'ativo',
        label: 'Apenas ativos:',
        type: 'checkbox',
        searchMethod: 'buscarAtivos'
      }
    ],
    
    // Configuração do estado vazio
    emptyState: {
      icon: 'settings',
      title: 'Nenhum serviço encontrado',
      subtitle: 'Comece adicionando um novo serviço'
    },
    
    // TrackBy function para performance do *ngFor
    trackByFn: (index: number, servico: Servico) => servico.id || index,
    
    // Mostrar contador de itens
    showItemCount: true
  };

  constructor(public servicoService: ServicoService) {}

  ngOnInit(): void {
    // O ciclo de vida é gerenciado pelo BaseCrudListComponent
    // Esta implementação elimina a necessidade de gerenciar:
    // - Estado de loading
    // - Gerenciamento de subscriptions
    // - Lógica de filtros
    // - Confirmação de exclusão
    // - Manipulação de erros
    // - Formatação de valores
  }
}