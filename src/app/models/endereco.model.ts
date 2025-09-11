import { BaseEntity } from '../shared/interfaces/base-entity.interface';

export interface Endereco extends BaseEntity {
  rua: string;
  numero: string;
  cidade: string;
  estado: string;
  cep: string;
  principal: boolean;
  cliente?: { id: number };
}