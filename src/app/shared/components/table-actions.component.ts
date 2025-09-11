import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { 
  TableActionsConfig, 
  TableActionConfig, 
  TableActionEvent,
  DEFAULT_TABLE_ACTIONS_CONFIG,
  COMMON_TABLE_ACTIONS 
} from '../interfaces/table-actions-config.interface';
import { NotificationService } from '../services/notification.service';

/**
 * Componente reutilizável para ações de tabela
 * Fornece botões de ação padronizados (edit, delete, view, custom)
 * 
 * @example
 * <!-- Ações básicas (edit/delete) -->
 * <app-table-actions 
 *   [config]="{ actions: [COMMON_TABLE_ACTIONS.EDIT, COMMON_TABLE_ACTIONS.DELETE] }"
 *   [item]="item"
 *   [baseRoute]="'/clientes'"
 *   (actionClick)="onAction($event)">
 * </app-table-actions>
 * 
 * @example
 * <!-- Ações customizadas -->
 * <app-table-actions 
 *   [config]="{
 *     actions: [
 *       { type: 'view', icon: 'eye', label: 'Ver detalhes' },
 *       { type: 'custom', icon: 'download', label: 'Baixar', handler: downloadItem }
 *     ],
 *     showLabels: true
 *   }"
 *   [item]="item"
 *   (actionClick)="onAction($event)">
 * </app-table-actions>
 */
@Component({
  selector: 'app-table-actions',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-actions" 
         [class]="getActionsClasses()"
         [attr.data-testid]="'table-actions'">
      
      @if (effectiveConfig.loading) {
        <div class="actions-loading">
          <div class="spinner-small"></div>
        </div>
      } @else {
        <!-- Visible Actions -->
        @for (action of visibleActions; track action.type) {
          @if (shouldShowAction(action)) {
            <button type="button"
                    class="btn-action"
                    [class]="getActionClasses(action)"
                    [disabled]="isActionDisabled(action) || effectiveConfig.loading"
                    [title]="action.label"
                    [attr.data-testid]="'table-action-' + action.type"
                    (click)="handleActionClick(action, $event)">
              
              <!-- Icon -->
              <lucide-icon 
                [name]="action.icon" 
                [size]="getIconSize()"
                class="action-icon">
              </lucide-icon>
              
              <!-- Label (if enabled) -->
              @if (effectiveConfig.showLabels) {
                <span class="action-label">{{ action.label }}</span>
              }
            </button>
          }
        }
        
        <!-- Dropdown for additional actions -->
        @if (hiddenActions.length > 0) {
          <div class="dropdown" [class.dropdown-active]="dropdownOpen">
            <button type="button"
                    class="btn-action btn-dropdown"
                    [disabled]="effectiveConfig.loading"
                    [title]="'Mais ações'"
                    [attr.data-testid]="'table-actions-dropdown'"
                    (click)="toggleDropdown()">
              <lucide-icon 
                name="more-vertical" 
                [size]="getIconSize()"
                class="action-icon">
              </lucide-icon>
            </button>
            
            @if (dropdownOpen) {
              <div class="dropdown-menu" [attr.data-testid]="'table-actions-dropdown-menu'">
                @for (action of hiddenActions; track action.type) {
                  @if (shouldShowAction(action)) {
                    <button type="button"
                            class="dropdown-item"
                            [class]="getActionClasses(action)"
                            [disabled]="isActionDisabled(action)"
                            [attr.data-testid]="'dropdown-action-' + action.type"
                            (click)="handleActionClick(action, $event)">
                      
                      <lucide-icon 
                        [name]="action.icon" 
                        size="16"
                        class="action-icon">
                      </lucide-icon>
                      
                      <span class="action-label">{{ action.label }}</span>
                    </button>
                  }
                }
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .table-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      position: relative;
    }
    
    .direction-vertical {
      flex-direction: column;
    }
    
    .size-small {
      gap: 0.125rem;
    }
    
    .size-large {
      gap: 0.5rem;
    }
    
    /* Action buttons */
    .btn-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      padding: 0.5rem;
      border: 1px solid transparent;
      border-radius: 6px;
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      user-select: none;
      min-height: 32px;
      position: relative;
    }
    
    .size-small .btn-action {
      padding: 0.375rem;
      min-height: 28px;
    }
    
    .size-large .btn-action {
      padding: 0.625rem;
      min-height: 36px;
    }
    
    .btn-action:hover:not(:disabled) {
      background-color: var(--bg-hover);
      border-color: var(--border-light);
    }
    
    .btn-action:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* Action variants */
    .btn-edit {
      color: var(--primary-blue);
    }
    
    .btn-edit:hover:not(:disabled) {
      background-color: rgba(2, 0, 150, 0.08);
      border-color: rgba(2, 0, 150, 0.2);
    }
    
    .btn-delete {
      color: var(--danger);
    }
    
    .btn-delete:hover:not(:disabled) {
      background-color: var(--danger-light);
      border-color: rgba(220, 53, 69, 0.2);
    }
    
    .btn-view {
      color: var(--info);
    }
    
    .btn-view:hover:not(:disabled) {
      background-color: var(--info-light);
      border-color: rgba(0, 206, 255, 0.2);
    }
    
    .btn-duplicate {
      color: var(--warning);
    }
    
    .btn-duplicate:hover:not(:disabled) {
      background-color: var(--warning-light);
      border-color: rgba(255, 193, 7, 0.2);
    }
    
    .btn-activate {
      color: var(--success);
    }
    
    .btn-activate:hover:not(:disabled) {
      background-color: var(--success-light);
      border-color: rgba(40, 167, 69, 0.2);
    }
    
    .btn-deactivate {
      color: var(--text-tertiary);
    }
    
    .btn-deactivate:hover:not(:disabled) {
      background-color: var(--bg-light);
      border-color: var(--border-medium);
    }
    
    /* Loading state */
    .actions-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 32px;
      padding: 0.5rem;
    }
    
    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid var(--border-light);
      border-top: 2px solid var(--primary-blue);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    /* Dropdown */
    .dropdown {
      position: relative;
    }
    
    .btn-dropdown {
      color: var(--text-tertiary);
    }
    
    .btn-dropdown:hover:not(:disabled) {
      color: var(--text-secondary);
      background-color: var(--bg-hover);
    }
    
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      z-index: 1000;
      min-width: 160px;
      padding: 0.5rem 0;
      margin-top: 0.25rem;
      background-color: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: 8px;
      box-shadow: var(--shadow-md);
    }
    
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.875rem;
      text-align: left;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }
    
    .dropdown-item:hover:not(:disabled) {
      background-color: var(--bg-hover);
    }
    
    .dropdown-item:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* Labels */
    .action-label {
      white-space: nowrap;
    }
    
    .direction-vertical .action-label {
      font-size: 0.75rem;
    }
    
    /* Icon styles */
    .action-icon {
      flex-shrink: 0;
    }
    
    /* Responsive adjustments */
    @media (max-width: 640px) {
      .table-actions {
        gap: 0.125rem;
      }
      
      .btn-action {
        padding: 0.375rem;
        min-height: 28px;
      }
      
      .action-label {
        display: none;
      }
    }
    
    /* Animation */
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Accessibility */
    .btn-action:focus {
      outline: 2px solid var(--primary-blue);
      outline-offset: 2px;
    }
    
    @media (prefers-reduced-motion: reduce) {
      .btn-action,
      .spinner-small {
        transition: none;
        animation: none;
      }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .dropdown-menu {
        background-color: #2a2a2a;
        border-color: #404040;
      }
      
      .dropdown-item:hover:not(:disabled) {
        background-color: #404040;
      }
      
      .btn-action:hover:not(:disabled) {
        background-color: #404040;
      }
    }
  `]
})
export class TableActionsComponent {
  /**
   * Configuration for the actions
   */
  @Input() config!: TableActionsConfig;

  /**
   * Item data for the actions
   */
  @Input() item: any;

  /**
   * Base route for navigation actions (e.g., '/clientes')
   */
  @Input() baseRoute?: string;

  /**
   * Event emitted when an action is clicked
   */
  @Output() actionClick = new EventEmitter<TableActionEvent>();

  /**
   * Event emitted for edit actions
   */
  @Output() editClick = new EventEmitter<any>();

  /**
   * Event emitted for delete actions
   */
  @Output() deleteClick = new EventEmitter<any>();

  /**
   * Event emitted for view actions
   */
  @Output() viewClick = new EventEmitter<any>();

  // Dependencies
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // Component state
  dropdownOpen = false;

  /**
   * Static reference to common actions for use in templates
   */
  static readonly COMMON_ACTIONS = COMMON_TABLE_ACTIONS;

  /**
   * Gets the effective configuration by merging with defaults
   */
  get effectiveConfig(): TableActionsConfig {
    return {
      ...DEFAULT_TABLE_ACTIONS_CONFIG,
      ...this.config
    } as TableActionsConfig;
  }

  /**
   * Gets actions that should be visible (not in dropdown)
   */
  get visibleActions(): TableActionConfig[] {
    const maxVisible = this.effectiveConfig.maxVisibleActions || 3;
    return this.effectiveConfig.actions.slice(0, maxVisible);
  }

  /**
   * Gets actions that should be hidden in dropdown
   */
  get hiddenActions(): TableActionConfig[] {
    const maxVisible = this.effectiveConfig.maxVisibleActions || 3;
    return this.effectiveConfig.actions.slice(maxVisible);
  }

  /**
   * Gets CSS classes for the actions container
   */
  getActionsClasses(): string {
    const classes = ['table-actions'];
    
    if (this.effectiveConfig.size) {
      classes.push(`size-${this.effectiveConfig.size}`);
    }
    
    if (this.effectiveConfig.direction) {
      classes.push(`direction-${this.effectiveConfig.direction}`);
    }
    
    if (this.effectiveConfig.customClass) {
      classes.push(this.effectiveConfig.customClass);
    }
    
    return classes.join(' ');
  }

  /**
   * Gets CSS classes for individual actions
   */
  getActionClasses(action: TableActionConfig): string {
    const classes = ['btn-action'];
    
    if (action.cssClass) {
      classes.push(action.cssClass);
    }
    
    return classes.join(' ');
  }

  /**
   * Gets icon size based on component size
   */
  getIconSize(): number {
    switch (this.effectiveConfig.size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      case 'medium':
      default:
        return 16;
    }
  }

  /**
   * Checks if action should be shown
   */
  shouldShowAction(action: TableActionConfig): boolean {
    if (action.showCondition) {
      return action.showCondition(this.item);
    }
    return true;
  }

  /**
   * Checks if action should be disabled
   */
  isActionDisabled(action: TableActionConfig): boolean {
    if (action.disabled) {
      return true;
    }
    
    if (action.disableCondition) {
      return action.disableCondition(this.item);
    }
    
    return false;
  }

  /**
   * Handles action button clicks
   */
  async handleActionClick(action: TableActionConfig, event: Event): Promise<void> {
    event.stopPropagation();
    this.dropdownOpen = false;

    // Handle confirmation if required
    if (action.requiresConfirmation) {
      const message = action.confirmationMessage || 'Tem certeza que deseja executar esta ação?';
      const confirmed = await this.notificationService.confirmDelete(message);
      
      if (!confirmed) {
        return;
      }
    }

    // Build event data
    const eventData: TableActionEvent = {
      action,
      item: this.item,
      event
    };

    // Emit specific action events
    switch (action.type) {
      case 'edit':
        this.editClick.emit(this.item);
        this.handleNavigationAction(action, 'edit');
        break;
      case 'delete':
        this.deleteClick.emit(this.item);
        break;
      case 'view':
        this.viewClick.emit(this.item);
        this.handleNavigationAction(action, 'view');
        break;
      case 'custom':
        if (action.handler) {
          action.handler(this.item);
        }
        break;
    }

    // Always emit general action event
    this.actionClick.emit(eventData);
  }

  /**
   * Handles navigation actions (edit, view)
   */
  private handleNavigationAction(action: TableActionConfig, defaultAction: string): void {
    if (action.routeTemplate) {
      const route = action.routeTemplate.replace(':id', this.item.id);
      this.router.navigate([route]);
    } else if (this.baseRoute) {
      const route = `${this.baseRoute}/${defaultAction}/${this.item.id}`;
      this.router.navigate([route]);
    }
  }

  /**
   * Toggles dropdown menu
   */
  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  /**
   * Closes dropdown when clicking outside (can be called from parent)
   */
  closeDropdown(): void {
    this.dropdownOpen = false;
  }
}

// Export common actions for use in other components
export { COMMON_TABLE_ACTIONS };