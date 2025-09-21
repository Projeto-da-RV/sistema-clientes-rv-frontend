import { BaseEntity } from '../shared/interfaces/base-entity.interface';

export interface Categoria extends BaseEntity {
  nome: string;
  descricao: string;
  beneficios?: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}