import { BaseEntity } from '../shared/interfaces/base-entity.interface';
import { Categoria } from './categoria.model';
import { Endereco } from './endereco.model';
import { Contrato } from './contrato.model';

export interface Cliente extends BaseEntity {
  nome: string;
  cpf: string;
  email?: string;
  telefone?: string;
  dataNascimento: string; // formato YYYY-MM-DD
  senha?: string; // Apenas para criação/edição
  ativo: boolean;
  statusCadastro?: string; // COMPLETO, INCOMPLETO
  tentativasLogin?: number;
  contaBloqueada?: boolean;
  ultimoLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  categoria?: Categoria;
  enderecos?: Endereco[];
  contratos?: Contrato[];
}