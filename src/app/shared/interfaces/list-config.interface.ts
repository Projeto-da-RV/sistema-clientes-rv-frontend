/**
 * Interfaces de configuração para componentes de lista CRUD
 * Define como os componentes filhos devem configurar o comportamento base
 */

import { Type } from '@angular/core';

/**
 * Configuração de uma coluna da tabela
 */
export interface ColumnConfig {
  /** Chave da propriedade no objeto */
  key: string;
  /** Título exibido no header */
  label: string;
  /** Tipo de coluna para formatação especial */
  type?: 'text' | 'badge' | 'currency' | 'date' | 'custom';
  /** Se for badge, configurações específicas */
  badgeConfig?: {
    trueValue: string;
    falseValue: string;
    trueClass: string;
    falseClass: string;
  };
  /** Se for custom, função de formatação */
  formatter?: (value: any, item: any) => string;
  /** Largura da coluna (opcional) */
  width?: string;
  /** Se a coluna é ordenável */
  sortable?: boolean;
}

/**
 * Configuração de filtro
 */
export interface FilterConfig {
  /** Chave única do filtro */
  key: string;
  /** Label exibido */
  label: string;
  /** Tipo do input */
  type: 'text' | 'select' | 'checkbox' | 'date';
  /** Placeholder para inputs de texto */
  placeholder?: string;
  /** Opções para select */
  options?: { value: any; label: string }[];
  /** Evento Enter deve disparar busca? */
  searchOnEnter?: boolean;
  /** Método de busca específico (se diferente do filtro padrão) */
  searchMethod?: string;
}

/**
 * Configuração do estado vazio
 */
export interface EmptyStateConfig {
  /** Ícone Lucide */
  icon: string;
  /** Mensagem principal */
  title: string;
  /** Mensagem secundária */
  subtitle: string;
}

/**
 * Configuração geral da lista
 */
export interface ListConfig<T> {
  /** Nome da entidade (singular) */
  entityName: string;
  /** Nome da entidade (plural) */
  entityNamePlural: string;
  /** Rota base para navegação */
  baseRoute: string;
  /** Colunas da tabela */
  columns: ColumnConfig[];
  /** Configuração de filtros */
  filters: FilterConfig[];
  /** Configuração do estado vazio */
  emptyState: EmptyStateConfig;
  /** Função TrackBy para o *ngFor */
  trackByFn: (index: number, item: T) => any;
  /** Propriedades para busca de texto livre */
  searchableFields?: string[];
  /** Se deve mostrar contador de itens */
  showItemCount?: boolean;
}

/**
 * Interface para métodos que os serviços devem implementar
 */
export interface CrudListService<T> {
  listarTodos(): any;
  deletar(id: number): any;
  buscarPorNome?(nome: string): any;
  [key: string]: any; // Para métodos específicos como buscarPorCpf, buscarAtivos, etc.
}

/**
 * Eventos emitidos pelo componente base
 */
export interface ListEvents<T> {
  onItemDelete?: (item: T) => void;
  onItemEdit?: (item: T) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  onDataLoad?: (items: T[]) => void;
}