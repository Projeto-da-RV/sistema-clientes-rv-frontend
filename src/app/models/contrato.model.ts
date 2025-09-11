import { BaseEntity } from '../shared/interfaces/base-entity.interface';
import { Cliente } from './cliente.model';
import { Item } from './item.model';

export interface Contrato extends BaseEntity {
  dataInicio: string; // formato YYYY-MM-DD
  dataFim?: string;
  status?: string;
  valorTotal?: number;
  observacoes?: string;
  cliente: Cliente | { id: number };
  itens?: Item[];
}