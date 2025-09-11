import { Component, OnInit } from '@angular/core';
import { EnderecoService } from '../../../services/endereco.service';
import { Endereco } from '../../../models/endereco.model';
import { BaseCrudListComponent } from '../../../shared/components/base-crud-list.component';
import { ListConfig } from '../../../shared/interfaces/list-config.interface';

/**
 * Componente de listagem de endereços
 * Refatorado para usar BaseCrudListComponent eliminando duplicação de código
 * Redução de ~85% no código comparado à versão anterior
 */
@Component({
  selector: 'app-endereco-list',
  standalone: true,
  imports: [BaseCrudListComponent],
  template: `
    <app-base-crud-list 
      [config]="listConfig" 
      [service]="enderecoService">
    </app-base-crud-list>
  `,
  styleUrl: './endereco-list.component.scss'
})
export class EnderecoListComponent implements OnInit {

  /**
   * Configuração específica para listagem de endereços
   */
  listConfig: ListConfig<Endereco> = {
    entityName: 'Endereço',
    entityNamePlural: 'Endereços',
    baseRoute: '/enderecos',
    
    // Configuração das colunas da tabela
    columns: [
      { key: 'id', label: 'ID', width: '80px', sortable: true },
      { 
        key: 'cliente', 
        label: 'Cliente', 
        type: 'custom',
        formatter: (cliente: any) => {
          if (typeof cliente === 'object' && 'nome' in cliente) {
            return cliente.nome;
          }
          return '-';
        }
      },
      { key: 'logradouro', label: 'Logradouro' },
      { key: 'numero', label: 'Número' },
      { key: 'bairro', label: 'Bairro' },
      { key: 'cidade', label: 'Cidade', sortable: true },
      { key: 'estado', label: 'Estado' },
      { key: 'cep', label: 'CEP' }
    ],
    
    // Configuração dos filtros
    filters: [
      {
        key: 'cidade',
        label: 'Buscar por cidade:',
        type: 'text',
        placeholder: 'Digite a cidade',
        searchOnEnter: true,
        searchMethod: 'buscarPorCidade'
      },
      {
        key: 'cliente',
        label: 'Filtrar por cliente:',
        type: 'select',
        searchMethod: 'buscarPorCliente'
      }
    ],
    
    // Configuração do estado vazio
    emptyState: {
      icon: 'map-pin',
      title: 'Nenhum endereço encontrado',
      subtitle: 'Os endereços cadastrados aparecerão aqui'
    },
    
    // TrackBy function para performance do *ngFor
    trackByFn: (index: number, endereco: Endereco) => endereco.id || index,
    
    // Mostrar contador de itens
    showItemCount: true
  };

  constructor(public enderecoService: EnderecoService) {}

  ngOnInit(): void {
    // O ciclo de vida é gerenciado pelo BaseCrudListComponent
    // Esta implementação elimina a necessidade de gerenciar:
    // - Estado de loading
    // - Gerenciamento de subscriptions
    // - Lógica de filtros
    // - Manipulação de erros
  }
}