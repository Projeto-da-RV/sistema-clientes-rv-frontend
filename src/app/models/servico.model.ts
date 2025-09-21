import { BaseEntity } from '../shared/interfaces/base-entity.interface';

export interface Servico extends BaseEntity {
  nome: string;
  descricao: string;
  valor: number;
  categoria: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}