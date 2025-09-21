import { BaseEntity } from '../shared/interfaces/base-entity.interface';
import { Cliente } from './cliente.model';

export interface Endereco extends BaseEntity {
  rua: string;
  numero: string;
  cidade: string;
  estado: string;
  cep: string;
  principal: boolean;
  createdAt?: string;
  cliente?: Cliente | { id: number };
}