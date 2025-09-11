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
  ativo: boolean;
  statusCadastro?: string;
  categoria?: Categoria;
  enderecos?: Endereco[];
  contratos?: Contrato[];
}