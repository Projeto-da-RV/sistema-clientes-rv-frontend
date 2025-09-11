import { Component, OnInit } from '@angular/core';
import { ContratoService } from '../../../services/contrato.service';
import { Contrato } from '../../../models/contrato.model';
import { BaseCrudListComponent } from '../../../shared/components/base-crud-list.component';
import { ListConfig } from '../../../shared/interfaces/list-config.interface';

/**
 * Componente de listagem de contratos
 * Refatorado para usar BaseCrudListComponent eliminando duplicação de código
 * Redução de ~85% no código comparado à versão anterior
 */
@Component({
  selector: 'app-contrato-list',
  standalone: true,
  imports: [BaseCrudListComponent],
  template: `
    <app-base-crud-list 
      [config]="listConfig" 
      [service]="contratoService">
    </app-base-crud-list>
  `,
  styleUrl: './contrato-list.component.scss'
})
export class ContratoListComponent implements OnInit {

  /**
   * Configuração específica para listagem de contratos
   */
  listConfig: ListConfig<Contrato> = {
    entityName: 'Contrato',
    entityNamePlural: 'Contratos',
    baseRoute: '/contratos',
    
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
      { key: 'dataInicio', label: 'Data Início', type: 'date' },
      { key: 'dataFim', label: 'Data Fim', type: 'date' },
      { key: 'status', label: 'Status' },
      { 
        key: 'valorTotal', 
        label: 'Valor Total', 
        type: 'currency',
        formatter: (valor: number) => {
          if (!valor) return 'R$ 0,00';
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(valor);
        }
      }
    ],
    
    // Configuração dos filtros
    filters: [
      {
        key: 'status',
        label: 'Filtrar por status:',
        type: 'select',
        options: [
          { value: '', label: 'Todos os status' },
          { value: 'PENDENTE', label: 'Pendente' },
          { value: 'ATIVO', label: 'Ativo' },
          { value: 'CONCLUIDO', label: 'Concluído' },
          { value: 'CANCELADO', label: 'Cancelado' }
        ],
        searchMethod: 'buscarPorStatus'
      }
    ],
    
    // Configuração do estado vazio
    emptyState: {
      icon: 'file-text',
      title: 'Nenhum contrato encontrado',
      subtitle: 'Comece criando um novo contrato'
    },
    
    // TrackBy function para performance do *ngFor
    trackByFn: (index: number, contrato: Contrato) => contrato.id || index,
    
    // Mostrar contador de itens
    showItemCount: true
  };

  constructor(public contratoService: ContratoService) {}

  ngOnInit(): void {
    // O ciclo de vida é gerenciado pelo BaseCrudListComponent
    // Esta implementação elimina a necessidade de gerenciar:
    // - Estado de loading
    // - Gerenciamento de subscriptions
    // - Lógica de filtros
    // - Confirmação de exclusão
    // - Manipulação de erros
    // - Formatação de valores e datas
  }
}