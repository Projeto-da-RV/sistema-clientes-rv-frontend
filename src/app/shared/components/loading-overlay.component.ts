import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingConfig, DEFAULT_LOADING_CONFIG } from '../interfaces/loading-config.interface';

/**
 * Componente reutilizável de overlay de loading
 * Fornece uma experiência consistente de carregamento em todo o sistema
 * 
 * @example
 * <app-loading-overlay 
 *   [config]="{ show: loading, message: 'Carregando dados...', size: 'large' }">
 * </app-loading-overlay>
 * 
 * @example
 * <!-- Loading simples -->
 * <app-loading-overlay [show]="loading"></app-loading-overlay>
 */
@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (effectiveConfig.show) {
      <div class="loading-overlay" 
           [class]="getOverlayClasses()"
           [attr.data-testid]="'loading-overlay'">
        @if (effectiveConfig.backdrop) {
          <div class="loading-backdrop"></div>
        }
        
        <div class="loading-content" [class]="'loading-' + effectiveConfig.size">
          <!-- Spinner -->
          <div class="loading-spinner" [attr.data-size]="effectiveConfig.size">
            <div class="spinner-circle"></div>
          </div>
          
          <!-- Message -->
          @if (effectiveConfig.message) {
            <p class="loading-message" [attr.data-testid]="'loading-message'">
              {{ effectiveConfig.message }}
            </p>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .loading-overlay.position-absolute {
      position: absolute;
    }
    
    .loading-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
    }
    
    .loading-content {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      background-color: var(--bg-card);
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-light);
    }
    
    .loading-small {
      padding: 1rem;
      gap: 0.5rem;
    }
    
    .loading-large {
      padding: 3rem;
      gap: 1.5rem;
    }
    
    .loading-spinner {
      position: relative;
    }
    
    .spinner-circle {
      border: 3px solid var(--border-light);
      border-top: 3px solid var(--primary-blue);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .loading-spinner[data-size="small"] .spinner-circle {
      width: 24px;
      height: 24px;
      border-width: 2px;
    }
    
    .loading-spinner[data-size="medium"] .spinner-circle {
      width: 32px;
      height: 32px;
      border-width: 3px;
    }
    
    .loading-spinner[data-size="large"] .spinner-circle {
      width: 48px;
      height: 48px;
      border-width: 4px;
    }
    
    .loading-message {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      text-align: center;
      user-select: none;
    }
    
    .loading-small .loading-message {
      font-size: 0.8rem;
    }
    
    .loading-large .loading-message {
      font-size: 1rem;
    }
    
    @keyframes spin {
      0% { 
        transform: rotate(0deg); 
      }
      100% { 
        transform: rotate(360deg); 
      }
    }
    
    /* Accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
      .spinner-circle {
        animation: pulse 2s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0%, 100% { 
          opacity: 1; 
        }
        50% { 
          opacity: 0.5; 
        }
      }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .loading-backdrop {
        background-color: rgba(26, 26, 26, 0.85);
      }
      
      .loading-content {
        background-color: #2a2a2a;
        border-color: #404040;
      }
      
      .loading-message {
        color: #e0e0e0;
      }
      
      .spinner-circle {
        border-color: #404040;
        border-top-color: var(--primary-blue);
      }
    }
  `]
})
export class LoadingOverlayComponent {
  /**
   * Configuration object for the loading overlay
   * Can be a boolean for simple show/hide or full config object
   */
  @Input() config: LoadingConfig | boolean = false;

  /**
   * Simple show/hide input for backward compatibility
   * @deprecated Use config input instead
   */
  @Input() show: boolean = false;

  /**
   * Loading message
   * @deprecated Use config input instead
   */
  @Input() message?: string;

  /**
   * Spinner size
   * @deprecated Use config input instead
   */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * Gets the effective configuration by merging inputs and defaults
   */
  get effectiveConfig(): LoadingConfig {
    // Handle boolean config
    if (typeof this.config === 'boolean') {
      return {
        show: this.config || this.show,
        message: this.message || DEFAULT_LOADING_CONFIG.message,
        size: this.size || DEFAULT_LOADING_CONFIG.size,
        backdrop: DEFAULT_LOADING_CONFIG.backdrop,
        position: DEFAULT_LOADING_CONFIG.position
      } as LoadingConfig;
    }

    // Handle object config
    if (this.config && typeof this.config === 'object') {
      return {
        ...DEFAULT_LOADING_CONFIG,
        ...this.config
      } as LoadingConfig;
    }

    // Fallback to legacy inputs
    return {
      show: this.show,
      message: this.message || DEFAULT_LOADING_CONFIG.message,
      size: this.size || DEFAULT_LOADING_CONFIG.size,
      backdrop: DEFAULT_LOADING_CONFIG.backdrop,
      position: DEFAULT_LOADING_CONFIG.position
    } as LoadingConfig;
  }

  /**
   * Gets CSS classes for the overlay container
   */
  getOverlayClasses(): string {
    const classes = ['loading-overlay'];
    
    if (this.effectiveConfig.position === 'absolute') {
      classes.push('position-absolute');
    }
    
    if (this.effectiveConfig.customClass) {
      classes.push(this.effectiveConfig.customClass);
    }
    
    return classes.join(' ');
  }
}