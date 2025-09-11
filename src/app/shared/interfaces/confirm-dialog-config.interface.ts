import { SweetAlertIcon } from 'sweetalert2';

/**
 * Configuration for ConfirmDialogComponent
 */
export interface ConfirmDialogConfig {
  /** Dialog title */
  title: string;
  
  /** Dialog message/content */
  message: string;
  
  /** Dialog icon */
  icon?: SweetAlertIcon;
  
  /** Confirm button text */
  confirmText?: string;
  
  /** Cancel button text */
  cancelText?: string;
  
  /** Confirm button color/theme */
  confirmColor?: 'primary' | 'danger' | 'warning' | 'success' | 'info';
  
  /** Whether to reverse button order */
  reverseButtons?: boolean;
  
  /** Show cancel button */
  showCancelButton?: boolean;
  
  /** Show close button (X) */
  showCloseButton?: boolean;
  
  /** Allow click outside to close */
  allowOutsideClick?: boolean;
  
  /** Allow escape key to close */
  allowEscapeKey?: boolean;
  
  /** Custom CSS class */
  customClass?: string;
  
  /** Auto-close timer in milliseconds */
  timer?: number;
  
  /** Show timer progress bar */
  timerProgressBar?: boolean;
  
  /** Additional HTML content */
  html?: string;
  
  /** Input field configuration (for prompt dialogs) */
  input?: ConfirmDialogInputConfig;
}

/**
 * Input configuration for prompt dialogs
 */
export interface ConfirmDialogInputConfig {
  /** Input type */
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select';
  
  /** Input placeholder */
  placeholder?: string;
  
  /** Default input value */
  value?: string;
  
  /** Select options (for select type) */
  options?: Record<string, string> | string[];
  
  /** Input validator function */
  validator?: (value: string) => Promise<string | null> | string | null;
  
  /** Input attributes */
  attributes?: Record<string, string>;
}

/**
 * Result from confirm dialog
 */
export interface ConfirmDialogResult {
  /** Whether dialog was confirmed */
  confirmed: boolean;
  
  /** Whether dialog was dismissed */
  dismissed: boolean;
  
  /** Input value (for prompt dialogs) */
  value?: string;
  
  /** Dismiss reason */
  dismissReason?: 'cancel' | 'backdrop' | 'close' | 'esc' | 'timer';
}

/**
 * Predefined dialog configurations
 */
export const CONFIRM_DIALOG_PRESETS = {
  DELETE: {
    title: 'Confirmar Exclusão',
    message: 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
    icon: 'warning' as const,
    confirmText: 'Excluir',
    confirmColor: 'danger' as const,
    cancelText: 'Cancelar'
  },
  
  SAVE: {
    title: 'Salvar Alterações',
    message: 'Deseja salvar as alterações realizadas?',
    icon: 'question' as const,
    confirmText: 'Salvar',
    confirmColor: 'primary' as const,
    cancelText: 'Cancelar'
  },
  
  DISCARD: {
    title: 'Descartar Alterações',
    message: 'Você possui alterações não salvas. Deseja descartar as alterações?',
    icon: 'warning' as const,
    confirmText: 'Descartar',
    confirmColor: 'warning' as const,
    cancelText: 'Continuar Editando'
  },
  
  LOGOUT: {
    title: 'Sair do Sistema',
    message: 'Deseja realmente sair do sistema?',
    icon: 'question' as const,
    confirmText: 'Sair',
    confirmColor: 'warning' as const,
    cancelText: 'Cancelar'
  },
  
  ACTIVATE: {
    title: 'Ativar Item',
    message: 'Deseja ativar este item?',
    icon: 'question' as const,
    confirmText: 'Ativar',
    confirmColor: 'success' as const,
    cancelText: 'Cancelar'
  },
  
  DEACTIVATE: {
    title: 'Desativar Item',
    message: 'Deseja desativar este item?',
    icon: 'warning' as const,
    confirmText: 'Desativar',
    confirmColor: 'warning' as const,
    cancelText: 'Cancelar'
  },
  
  RESET: {
    title: 'Redefinir Dados',
    message: 'Isso irá redefinir todos os dados para os valores padrão. Continuar?',
    icon: 'warning' as const,
    confirmText: 'Redefinir',
    confirmColor: 'warning' as const,
    cancelText: 'Cancelar'
  },
  
  IMPORT: {
    title: 'Importar Dados',
    message: 'Isso pode sobrescrever dados existentes. Deseja continuar?',
    icon: 'info' as const,
    confirmText: 'Importar',
    confirmColor: 'info' as const,
    cancelText: 'Cancelar'
  }
} as const;

/**
 * Default configuration
 */
export const DEFAULT_CONFIRM_DIALOG_CONFIG: Partial<ConfirmDialogConfig> = {
  icon: 'question',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  confirmColor: 'primary',
  showCancelButton: true,
  reverseButtons: true,
  showCloseButton: false,
  allowOutsideClick: false,
  allowEscapeKey: true,
  timerProgressBar: false
};