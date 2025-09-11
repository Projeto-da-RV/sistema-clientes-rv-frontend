/**
 * Interface base para todas as entidades do sistema
 * Garante que todas tenham um ID opcional para operações CRUD
 */
export interface BaseEntity {
  id?: number;
}

/**
 * Interface para configuração de busca personalizada
 */
export interface SearchConfig {
  endpoint: string;
  params: Record<string, any>;
}

/**
 * Interface para resposta de lista paginada (futura implementação)
 */
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}