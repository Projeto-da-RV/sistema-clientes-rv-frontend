import { BaseEntity } from '../shared/interfaces/base-entity.interface';

export type TipoFormaPagamento = 'TRANSFERENCIA' | 'BOLETO' | 'CARTAO' | 'DEBITO_CONTA';

/**
 * Servico agora representa uma Forma de Pagamento disponível
 * (PIX, TED, Boleto, Cartão de Crédito, etc)
 */
export interface Servico extends BaseEntity {
  nome: string;                    // "PIX", "TED", "Boleto"
  descricao: string;               // Descrição da forma de pagamento
  taxa: number;                    // Taxa cobrada (antes era "valor")
  tipo: TipoFormaPagamento;        // TRANSFERENCIA, BOLETO, CARTAO, DEBITO_CONTA
  ativo: boolean;
  tempoProcessamento?: string;     // "Instantâneo", "1 dia útil", "1-2 dias úteis"
  createdAt?: string;
  updatedAt?: string;
}