/**
 * Configuration for individual table actions
 */
export interface TableActionConfig {
  /** Action type identifier */
  type: 'edit' | 'delete' | 'view' | 'custom';
  
  /** Icon name (Lucide icon) */
  icon: string;
  
  /** Action label/tooltip */
  label: string;
  
  /** CSS class for styling */
  cssClass?: string;
  
  /** Whether the action is disabled */
  disabled?: boolean;
  
  /** Show condition function */
  showCondition?: (item: any) => boolean;
  
  /** Disable condition function */
  disableCondition?: (item: any) => boolean;
  
  /** Custom click handler (for custom actions) */
  handler?: (item: any) => void;
  
  /** Route template for navigation actions (e.g., '/clientes/edit/:id') */
  routeTemplate?: string;
  
  /** Confirmation required before action */
  requiresConfirmation?: boolean;
  
  /** Confirmation message */
  confirmationMessage?: string;
}

/**
 * Configuration for TableActionsComponent
 */
export interface TableActionsConfig {
  /** List of actions to display */
  actions: TableActionConfig[];
  
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  
  /** Maximum actions before showing dropdown */
  maxVisibleActions?: number;
  
  /** Show action labels */
  showLabels?: boolean;
  
  /** Custom CSS class */
  customClass?: string;
  
  /** Loading state */
  loading?: boolean;
}

/**
 * Predefined common actions
 */
export const COMMON_TABLE_ACTIONS = {
  EDIT: {
    type: 'edit' as const,
    icon: 'edit',
    label: 'Editar',
    cssClass: 'btn-edit'
  },
  
  DELETE: {
    type: 'delete' as const,
    icon: 'trash2',
    label: 'Excluir',
    cssClass: 'btn-delete',
    requiresConfirmation: true,
    confirmationMessage: 'Tem certeza que deseja excluir este item?'
  },
  
  VIEW: {
    type: 'view' as const,
    icon: 'eye',
    label: 'Visualizar',
    cssClass: 'btn-view'
  },
  
  DUPLICATE: {
    type: 'custom' as const,
    icon: 'copy',
    label: 'Duplicar',
    cssClass: 'btn-duplicate'
  },
  
  ACTIVATE: {
    type: 'custom' as const,
    icon: 'check',
    label: 'Ativar',
    cssClass: 'btn-activate'
  },
  
  DEACTIVATE: {
    type: 'custom' as const,
    icon: 'x',
    label: 'Desativar',
    cssClass: 'btn-deactivate'
  }
} as const;

/**
 * Default configuration
 */
export const DEFAULT_TABLE_ACTIONS_CONFIG: Partial<TableActionsConfig> = {
  size: 'medium',
  direction: 'horizontal',
  maxVisibleActions: 3,
  showLabels: false,
  loading: false
};

/**
 * Event data emitted by table actions
 */
export interface TableActionEvent {
  /** Action that was triggered */
  action: TableActionConfig;
  
  /** Item data */
  item: any;
  
  /** Original event */
  event?: Event;
}