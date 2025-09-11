import { BaseEntity } from '../shared/interfaces/base-entity.interface';
import { Contrato } from './contrato.model';
import { Servico } from './servico.model';

export interface Item extends BaseEntity {
  quantidade: number;
  valor: number;
  desconto?: number;
  valorFinal?: number;
  contrato: Contrato | { id: number };
  servico: Servico | { id: number };
}