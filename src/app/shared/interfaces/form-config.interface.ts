import { ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { BaseEntity } from './base-entity.interface';

/**
 * Tipos de campo suportados no formulário
 */
export enum FormFieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PASSWORD = 'password',
  NUMBER = 'number',
  DATE = 'date',
  DATETIME = 'datetime-local',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  CURRENCY = 'currency',
  CPF = 'cpf',
  PHONE = 'phone'
}

/**
 * Configuração de opções para campos select/radio
 */
export interface FieldOption {
  value: any;
  label: string;
  disabled?: boolean;
}

/**
 * Configuração de um campo do formulário
 */
export interface FieldConfig {
  /** Nome do campo (chave no FormGroup) */
  key: string;
  /** Label exibido para o usuário */
  label: string;
  /** Tipo do campo */
  type: FormFieldType;
  /** Valor padrão */
  defaultValue?: any;
  /** Placeholder do campo */
  placeholder?: string;
  /** Array de validadores do Angular */
  validators?: ValidatorFn[];
  /** Se o campo é obrigatório (adiciona visual de asterisco) */
  required?: boolean;
  /** Se o campo está desabilitado */
  disabled?: boolean;
  /** Opções para campos select/radio */
  options?: FieldOption[] | Observable<FieldOption[]>;
  /** Função customizada para formatar valor antes de exibir */
  formatter?: (value: any) => string;
  /** Função customizada para processar valor antes de salvar */
  parser?: (value: any) => any;
  /** Classes CSS adicionais */
  cssClass?: string;
  /** Atributos HTML adicionais */
  attributes?: { [key: string]: any };
  /** Se deve aplicar máscara automática baseada no tipo */
  applyMask?: boolean;
  /** Configuração específica do campo */
  fieldSpecificConfig?: {
    /** Para campos number */
    min?: number;
    max?: number;
    step?: number;
    /** Para campos text */
    minLength?: number;
    maxLength?: number;
    /** Para campos textarea */
    rows?: number;
    cols?: number;
  };
}

/**
 * Configuração para carregamento de dados relacionados
 */
export interface RelatedDataConfig {
  /** Nome da propriedade onde os dados serão armazenados */
  propertyName: string;
  /** Função que retorna os dados */
  loadFunction: () => Observable<any[]>;
  /** Se deve carregar no ngOnInit */
  loadOnInit?: boolean;
}

/**
 * Configuração principal do formulário
 */
export interface FormConfig<T extends BaseEntity> {
  /** Nome da entidade (singular) */
  entityName: string;
  /** Nome da entidade no plural */
  entityNamePlural: string;
  /** Rota base para navegação (ex: '/clientes') */
  baseRoute: string;
  /** Configurações dos campos */
  fields: FieldConfig[];
  /** Configurações de dados relacionados (ex: categorias, clientes) */
  relatedData?: RelatedDataConfig[];
  /** Título customizado para modo criação */
  createTitle?: string;
  /** Título customizado para modo edição */
  editTitle?: string;
  /** Função customizada para preparar dados antes de salvar */
  beforeSave?: (formValue: any, isEditMode: boolean) => Partial<T>;
  /** Função customizada para preparar dados depois de carregar */
  afterLoad?: (entity: T) => any;
  /** Se deve usar ChangeDetectionStrategy.OnPush */
  useOnPush?: boolean;
  /** Configuração de validação customizada */
  customValidation?: {
    /** Função que retorna erros customizados */
    validator?: (formValue: any) => { [key: string]: any } | null;
    /** Mensagens de erro customizadas */
    errorMessages?: { [key: string]: string };
  };
}

/**
 * Interface que serviços devem implementar para funcionar com BaseCrudFormComponent
 */
export interface CrudFormService<T extends BaseEntity> {
  buscarPorId(id: number): Observable<T>;
  criar(entity: T): Observable<T>;
  atualizar(id: number, entity: T): Observable<T>;
}

/**
 * Configuração de eventos do formulário
 */
export interface FormEventConfig {
  /** Executado antes da submissão */
  beforeSubmit?: () => boolean;
  /** Executado após sucesso na submissão */
  afterSuccess?: (entity: any, isEditMode: boolean) => void;
  /** Executado após erro na submissão */
  afterError?: (error: any) => void;
  /** Executado no cancelamento */
  onCancel?: () => void;
}

/**
 * Estado do formulário para componentes filhos
 */
export interface FormState {
  loading: boolean;
  isEditMode: boolean;
  entityId: number | null;
  hasUnsavedChanges: boolean;
}