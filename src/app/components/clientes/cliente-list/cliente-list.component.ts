import { Component, OnInit } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../models/cliente.model';
import { BaseCrudListComponent } from '../../../shared/components/base-crud-list.component';
import { ListConfig } from '../../../shared/interfaces/list-config.interface';

/**
 * Componente de listagem de clientes
 * Refatorado para usar BaseCrudListComponent eliminando duplicação de código
 * Redução de ~85% no código comparado à versão anterior
 */
@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [BaseCrudListComponent],
  template: `
    <app-base-crud-list 
      [config]="listConfig" 
      [service]="clienteService">
    </app-base-crud-list>
  `,
  styleUrl: './cliente-list.component.scss'
})
export class ClienteListComponent implements OnInit {

  /**
   * Configuração específica para listagem de clientes
   */
  listConfig: ListConfig<Cliente> = {
    entityName: 'Cliente',
    entityNamePlural: 'Clientes',
    baseRoute: '/clientes',
    
    // Configuração das colunas da tabela
    columns: [
      { key: 'id', label: 'ID', width: '80px', sortable: true },
      { key: 'nome', label: 'Nome', sortable: true },
      { key: 'cpf', label: 'CPF', sortable: true },
      { key: 'email', label: 'Email' },
      { key: 'telefone', label: 'Telefone' },
      { key: 'dataNascimento', label: 'Data Nascimento', type: 'date' },
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
        placeholder: 'Digite o nome',
        searchOnEnter: true,
        searchMethod: 'buscarPorNome'
      },
      {
        key: 'cpf',
        label: 'Buscar por CPF:',
        type: 'text',
        placeholder: 'Digite o CPF',
        searchOnEnter: true,
        searchMethod: 'buscarPorCpf'
      }
    ],
    
    // Configuração do estado vazio
    emptyState: {
      icon: 'user',
      title: 'Nenhum cliente encontrado',
      subtitle: 'Comece adicionando um novo cliente'
    },
    
    // TrackBy function para performance do *ngFor
    trackByFn: (index: number, cliente: Cliente) => cliente.id || index,
    
    // Mostrar contador de itens
    showItemCount: true
  };

  constructor(public clienteService: ClienteService) {}

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