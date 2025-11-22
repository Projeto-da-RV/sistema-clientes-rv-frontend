import { BaseEntity } from '../shared/interfaces/base-entity.interface';
import { Cliente } from './cliente.model';

export type TipoMetodoPagamento = 'PIX' | 'BOLETO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO';
export type StatusMetodoPagamento = 'ATIVO' | 'INATIVO';

export interface MetodoPagamento extends BaseEntity {
  tipo: TipoMetodoPagamento;
  apelido?: string;
  informacao?: string;
  qrCode?: string;
  status: StatusMetodoPagamento;
  principal: boolean;
  createdAt?: string;
  updatedAt?: string;
  cliente: Cliente | { id: number };
}

export interface GerarQRCodePIXRequest {
  valor: number;
  descricao: string;
}
