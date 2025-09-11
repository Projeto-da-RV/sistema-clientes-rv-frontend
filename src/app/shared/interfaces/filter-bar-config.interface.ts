/**
 * Configuration for individual filter fields
 */
export interface FilterFieldConfig {
  /** Field key/name */
  key: string;
  
  /** Field label */
  label: string;
  
  /** Field type */
  type: 'text' | 'select' | 'date' | 'daterange' | 'number' | 'checkbox' | 'search';
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Options for select fields */
  options?: FilterOption[];
  
  /** Default value */
  defaultValue?: any;
  
  /** Whether the field is required */
  required?: boolean;
  
  /** Whether the field is disabled */
  disabled?: boolean;
  
  /** Field width (CSS value) */
  width?: string;
  
  /** Custom CSS class */
  cssClass?: string;
  
  /** Search on enter key (for text/search fields) */
  searchOnEnter?: boolean;
  
  /** Debounce time in ms for auto-search */
  debounceTime?: number;
  
  /** Custom validator function */
  validator?: (value: any) => string | null;
  
  /** Show condition function */
  showCondition?: (allFilters: Record<string, any>) => boolean;
  
  /** Options loader function (for dynamic options) */
  optionsLoader?: () => Promise<FilterOption[]> | FilterOption[];
  
  /** Format display value function */
  formatter?: (value: any) => string;
}

/**
 * Filter option for select fields
 */
export interface FilterOption {
  /** Option value */
  value: any;
  
  /** Option display label */
  label: string;
  
  /** Whether option is disabled */
  disabled?: boolean;
  
  /** Option group */
  group?: string;
}

/**
 * Configuration for FilterBarComponent
 */
export interface FilterBarConfig {
  /** List of filter fields */
  fields: FilterFieldConfig[];
  
  /** Layout direction */
  layout?: 'horizontal' | 'vertical' | 'grid';
  
  /** Grid columns (when layout is grid) */
  gridColumns?: number;
  
  /** Show filter actions (apply/clear buttons) */
  showActions?: boolean;
  
  /** Show results count */
  showResultsCount?: boolean;
  
  /** Results count text template */
  resultsCountTemplate?: string;
  
  /** Show collapse/expand toggle */
  collapsible?: boolean;
  
  /** Initially collapsed */
  initiallyCollapsed?: boolean;
  
  /** Apply filters automatically on change */
  autoApply?: boolean;
  
  /** Debounce time for auto-apply */
  autoApplyDebounce?: number;
  
  /** Custom CSS class */
  customClass?: string;
  
  /** Loading state */
  loading?: boolean;
  
  /** Compact mode (smaller padding) */
  compact?: boolean;
}

/**
 * Filter event data
 */
export interface FilterEvent {
  /** All current filter values */
  filters: Record<string, any>;
  
  /** Changed field key (if specific field triggered event) */
  changedField?: string;
  
  /** Previous filters state */
  previousFilters?: Record<string, any>;
  
  /** Event type */
  type: 'apply' | 'clear' | 'change' | 'search';
}

/**
 * Filter validation result
 */
export interface FilterValidation {
  /** Whether all filters are valid */
  valid: boolean;
  
  /** Validation errors by field */
  errors: Record<string, string>;
}

/**
 * Predefined filter field configurations
 */
export const COMMON_FILTER_FIELDS = {
  SEARCH: {
    key: 'search',
    type: 'search' as const,
    label: 'Buscar',
    placeholder: 'Digite para buscar...',
    searchOnEnter: true,
    debounceTime: 500,
    width: '300px'
  },
  
  STATUS: {
    key: 'status',
    type: 'select' as const,
    label: 'Status',
    options: [
      { value: 'active', label: 'Ativo' },
      { value: 'inactive', label: 'Inativo' }
    ]
  },
  
  DATE_CREATED: {
    key: 'dateCreated',
    type: 'date' as const,
    label: 'Data de Criação'
  },
  
  DATE_RANGE: {
    key: 'dateRange',
    type: 'daterange' as const,
    label: 'Período'
  },
  
  CATEGORY: {
    key: 'categoryId',
    type: 'select' as const,
    label: 'Categoria'
  },
  
  CLIENT: {
    key: 'clientId',
    type: 'select' as const,
    label: 'Cliente'
  }
} as const;

/**
 * Default configuration
 */
export const DEFAULT_FILTER_BAR_CONFIG: Partial<FilterBarConfig> = {
  layout: 'horizontal',
  showActions: true,
  showResultsCount: false,
  collapsible: false,
  initiallyCollapsed: false,
  autoApply: false,
  autoApplyDebounce: 500,
  loading: false,
  compact: false
};