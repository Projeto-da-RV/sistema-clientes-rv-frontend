/**
 * Configuration interface for LoadingOverlayComponent
 */
export interface LoadingConfig {
  /** Whether the loading overlay is visible */
  show: boolean;
  
  /** Loading message to display */
  message?: string;
  
  /** Size of the spinner */
  size?: 'small' | 'medium' | 'large';
  
  /** Whether to show backdrop blur */
  backdrop?: boolean;
  
  /** Custom CSS class for styling */
  customClass?: string;
  
  /** Position of the overlay */
  position?: 'fixed' | 'absolute';
}

/**
 * Default loading configuration
 */
export const DEFAULT_LOADING_CONFIG: Partial<LoadingConfig> = {
  message: 'Carregando...',
  size: 'medium',
  backdrop: true,
  position: 'fixed'
};