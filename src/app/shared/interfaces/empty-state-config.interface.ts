/**
 * Configuration interface for EmptyStateComponent
 */
export interface EmptyStateConfig {
  /** Icon to display (Lucide icon name) */
  icon?: string;
  
  /** Main title/heading */
  title: string;
  
  /** Subtitle or description */
  subtitle?: string;
  
  /** Show action button */
  showAction?: boolean;
  
  /** Action button text */
  actionText?: string;
  
  /** Action button click handler */
  actionHandler?: () => void;
  
  /** Action button route (alternative to handler) */
  actionRoute?: string;
  
  /** Custom CSS class */
  customClass?: string;
  
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  
  /** Color theme */
  theme?: 'default' | 'muted' | 'info';
}

/**
 * Predefined empty state configurations for common scenarios
 */
export const EMPTY_STATE_PRESETS = {
  NO_RESULTS: {
    icon: 'search',
    title: 'Nenhum resultado encontrado',
    subtitle: 'Tente ajustar seus filtros de busca',
    theme: 'muted' as const
  },
  
  NO_DATA: {
    icon: 'inbox',
    title: 'Nenhum item encontrado',
    subtitle: 'Comece adicionando um novo item',
    showAction: true,
    actionText: 'Adicionar primeiro item',
    theme: 'default' as const
  },
  
  NO_CLIENTS: {
    icon: 'users',
    title: 'Nenhum cliente cadastrado',
    subtitle: 'Cadastre seu primeiro cliente para começar',
    showAction: true,
    actionText: 'Cadastrar Cliente',
    theme: 'default' as const
  },
  
  NO_CONTRACTS: {
    icon: 'file-text',
    title: 'Nenhum contrato encontrado',
    subtitle: 'Crie contratos para seus clientes',
    showAction: true,
    actionText: 'Novo Contrato',
    theme: 'default' as const
  },
  
  NO_SERVICES: {
    icon: 'wrench',
    title: 'Nenhum serviço cadastrado',
    subtitle: 'Cadastre os serviços que você oferece',
    showAction: true,
    actionText: 'Cadastrar Serviço',
    theme: 'default' as const
  },
  
  ERROR: {
    icon: 'alert-circle',
    title: 'Erro ao carregar dados',
    subtitle: 'Ocorreu um problema. Tente novamente',
    showAction: true,
    actionText: 'Tentar novamente',
    theme: 'muted' as const
  }
} as const;

/**
 * Default empty state configuration
 */
export const DEFAULT_EMPTY_STATE_CONFIG: Partial<EmptyStateConfig> = {
  icon: 'inbox',
  size: 'medium',
  theme: 'default',
  showAction: false
};