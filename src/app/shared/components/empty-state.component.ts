import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { 
  EmptyStateConfig, 
  DEFAULT_EMPTY_STATE_CONFIG, 
  EMPTY_STATE_PRESETS 
} from '../interfaces/empty-state-config.interface';

/**
 * Componente reutilizável para estados vazios
 * Fornece uma experiência consistente quando não há dados para exibir
 * 
 * @example
 * <!-- Configuração básica -->
 * <app-empty-state 
 *   [config]="{ 
 *     title: 'Nenhum cliente encontrado', 
 *     subtitle: 'Cadastre seu primeiro cliente' 
 *   }">
 * </app-empty-state>
 * 
 * @example
 * <!-- Usando preset predefinido -->
 * <app-empty-state 
 *   [config]="EMPTY_STATE_PRESETS.NO_CLIENTS"
 *   [actionRoute]="'/clientes/novo'">
 * </app-empty-state>
 * 
 * @example
 * <!-- Com ação customizada -->
 * <app-empty-state 
 *   [config]="{
 *     icon: 'plus',
 *     title: 'Comece agora',
 *     showAction: true,
 *     actionText: 'Criar item'
 *   }"
 *   (actionClick)="onCreate()">
 * </app-empty-state>
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state" 
         [class]="getStateClasses()"
         [attr.data-testid]="'empty-state'">
      <!-- Icon -->
      @if (effectiveConfig.icon) {
        <div class="empty-icon" [attr.data-size]="effectiveConfig.size">
          <lucide-icon 
            [name]="effectiveConfig.icon" 
            [size]="getIconSize()"
            class="icon">
          </lucide-icon>
        </div>
      }
      
      <!-- Content -->
      <div class="empty-content">
        <!-- Title -->
        <h3 class="empty-title" [attr.data-testid]="'empty-state-title'">
          {{ effectiveConfig.title }}
        </h3>
        
        <!-- Subtitle -->
        @if (effectiveConfig.subtitle) {
          <p class="empty-subtitle" [attr.data-testid]="'empty-state-subtitle'">
            {{ effectiveConfig.subtitle }}
          </p>
        }
      </div>
      
      <!-- Action -->
      @if (effectiveConfig.showAction && effectiveConfig.actionText) {
        <div class="empty-action">
          @if (actionRoute) {
            <a [routerLink]="actionRoute" 
               class="btn btn-primary"
               [attr.data-testid]="'empty-state-action'">
              {{ effectiveConfig.actionText }}
            </a>
          } @else {
            <button type="button" 
                    class="btn btn-primary"
                    [attr.data-testid]="'empty-state-action'"
                    (click)="handleActionClick()">
              {{ effectiveConfig.actionText }}
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 1.5rem;
      color: var(--text-secondary);
    }
    
    .empty-state.size-small {
      padding: 2rem 1rem;
    }
    
    .empty-state.size-large {
      padding: 4rem 2rem;
    }
    
    .empty-icon {
      margin-bottom: 1.5rem;
      opacity: 0.6;
      transition: opacity var(--transition-normal);
    }
    
    .empty-icon[data-size="small"] {
      margin-bottom: 1rem;
    }
    
    .empty-icon[data-size="large"] {
      margin-bottom: 2rem;
    }
    
    .empty-icon .icon {
      color: var(--text-tertiary);
    }
    
    .empty-content {
      max-width: 400px;
      margin-bottom: 1.5rem;
    }
    
    .empty-title {
      margin: 0 0 0.75rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.4;
    }
    
    .size-small .empty-title {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }
    
    .size-large .empty-title {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    
    .empty-subtitle {
      margin: 0;
      font-size: 0.95rem;
      color: var(--text-tertiary);
      line-height: 1.5;
    }
    
    .size-small .empty-subtitle {
      font-size: 0.85rem;
    }
    
    .size-large .empty-subtitle {
      font-size: 1.05rem;
    }
    
    .empty-action {
      margin-top: 0.5rem;
    }
    
    .size-small .empty-action {
      margin-top: 0.25rem;
    }
    
    .size-large .empty-action {
      margin-top: 1rem;
    }
    
    /* Theme variations */
    .theme-muted {
      opacity: 0.8;
    }
    
    .theme-muted .empty-title {
      color: var(--text-secondary);
    }
    
    .theme-muted .empty-icon .icon {
      color: var(--text-muted);
    }
    
    .theme-info .empty-icon .icon {
      color: var(--info);
    }
    
    .theme-info .empty-title {
      color: var(--info);
    }
    
    /* Button styling */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: all var(--transition-fast);
      user-select: none;
    }
    
    .btn-primary {
      background-color: var(--primary-orange);
      color: white;
    }
    
    .btn-primary:hover {
      background-color: var(--primary-orange-hover);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
    
    .btn-primary:active {
      transform: translateY(0);
    }
    
    /* Responsive adjustments */
    @media (max-width: 640px) {
      .empty-state {
        padding: 2rem 1rem;
      }
      
      .empty-title {
        font-size: 1.1rem;
      }
      
      .empty-subtitle {
        font-size: 0.9rem;
      }
      
      .empty-content {
        max-width: 300px;
      }
    }
    
    /* Accessibility improvements */
    .empty-state:focus-within .empty-icon {
      opacity: 1;
    }
    
    @media (prefers-reduced-motion: reduce) {
      .empty-icon,
      .btn {
        transition: none;
      }
      
      .btn-primary:hover {
        transform: none;
      }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .empty-title {
        color: #f0f0f0;
      }
      
      .empty-subtitle {
        color: #b0b0b0;
      }
      
      .empty-icon .icon {
        color: #808080;
      }
      
      .theme-muted .empty-title {
        color: #d0d0d0;
      }
      
      .theme-info .empty-title {
        color: var(--secondary-cyan);
      }
      
      .theme-info .empty-icon .icon {
        color: var(--secondary-cyan);
      }
    }
  `]
})
export class EmptyStateComponent {
  /**
   * Configuration object for the empty state
   */
  @Input() config!: EmptyStateConfig;

  /**
   * Action button route (takes precedence over actionClick)
   */
  @Input() actionRoute?: string;

  /**
   * Event emitted when action button is clicked
   */
  @Output() actionClick = new EventEmitter<void>();

  /**
   * Static reference to presets for use in templates
   */
  static readonly PRESETS = EMPTY_STATE_PRESETS;

  /**
   * Gets the effective configuration by merging with defaults
   */
  get effectiveConfig(): EmptyStateConfig {
    return {
      ...DEFAULT_EMPTY_STATE_CONFIG,
      ...this.config
    } as EmptyStateConfig;
  }

  /**
   * Gets CSS classes for the empty state container
   */
  getStateClasses(): string {
    const classes = ['empty-state'];
    
    if (this.effectiveConfig.size) {
      classes.push(`size-${this.effectiveConfig.size}`);
    }
    
    if (this.effectiveConfig.theme) {
      classes.push(`theme-${this.effectiveConfig.theme}`);
    }
    
    if (this.effectiveConfig.customClass) {
      classes.push(this.effectiveConfig.customClass);
    }
    
    return classes.join(' ');
  }

  /**
   * Gets the icon size based on component size
   */
  getIconSize(): number {
    switch (this.effectiveConfig.size) {
      case 'small':
        return 32;
      case 'large':
        return 64;
      case 'medium':
      default:
        return 48;
    }
  }

  /**
   * Handles action button click
   */
  handleActionClick(): void {
    if (this.effectiveConfig.actionHandler) {
      this.effectiveConfig.actionHandler();
    } else {
      this.actionClick.emit();
    }
  }
}