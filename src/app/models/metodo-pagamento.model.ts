import { BaseEntity } from '../shared/interfaces/base-entity.interface';
import { Cliente } from './cliente.model';
import { Contrato } from './contrato.model';
import { Servico } from './servico.model';

export type StatusTransacao = 'PENDENTE' | 'CONCLUIDO';
export type TipoConta = 'CORRENTE' | 'POUPANCA';
export type BandeiraCartao = 'VISA' | 'MASTERCARD' | 'ELO' | 'AMEX' | 'HIPERCARD';

/**
 * MetodoPagamento agora representa uma Transação de Pagamento
 * Registro de um pagamento de uma conta
 */
export interface MetodoPagamento extends BaseEntity {
  valor: number;                           // Valor da conta
  valorTaxa: number;                       // Taxa do serviço
  valorTotal: number;                      // valor + valorTaxa
  dataTransacao: string;                   // LocalDateTime
  status: StatusTransacao;                 // PENDENTE, PROCESSANDO, CONCLUIDO, FALHO, CANCELADO
  comprovante?: string;                    // Comprovante de pagamento

  // Relacionamentos
  cliente: Cliente | { id: number };
  contrato: Contrato | { id: number };     // Qual conta foi paga
  servico: Servico | { id: number };       // Qual forma de pagamento foi usada

  // Dados específicos de PIX
  chavePix?: string;
  qrCode?: string;

  // Dados específicos de TED
  banco?: string;
  agencia?: string;
  conta?: string;
  tipoConta?: TipoConta;                   // CORRENTE, POUPANCA

  // Dados específicos de Boleto
  codigoBarras?: string;
  linhaDigitavel?: string;

  // Dados específicos de Cartão
  numeroCartao?: string;                   // **** **** **** 1234 (mascarado)
  bandeira?: BandeiraCartao;               // VISA, MASTERCARD, ELO

  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request para gerar QR Code PIX
 */
export interface GerarQRCodePIXRequest {
  valor: number;
  descricao: string;
}
