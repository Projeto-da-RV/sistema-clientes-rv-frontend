import { BaseEntity } from '../shared/interfaces/base-entity.interface';
import { Cliente } from './cliente.model';
import { MetodoPagamento } from './metodo-pagamento.model';

export type StatusConta = 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO';
export type CategoriaConta = 'ENERGIA' | 'AGUA' | 'TELEFONE' | 'INTERNET' | 'GAS' | 'ALUGUEL';

/**
 * Contrato agora representa uma Conta a Pagar
 * (luz, água, telefone, internet, gás, aluguel, etc)
 */
export interface Contrato extends BaseEntity {
  descricao: string;           // "Conta de Luz - CPFL"
  valor: number;               // Valor da conta
  dataVencimento: string;      // Data de vencimento (LocalDate)
  status: StatusConta;         // PENDENTE, PAGO, VENCIDO, CANCELADO
  categoria: CategoriaConta;   // ENERGIA, AGUA, TELEFONE, INTERNET, GAS, ALUGUEL
  codigoBarras?: string;       // Código de barras da conta
  dataPagamento?: string;      // Data em que foi paga (LocalDate)
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
  cliente: Cliente | { id: number };
  metodosPagamento?: MetodoPagamento[]; // Transações de pagamento desta conta
}