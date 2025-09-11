import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';

import { NotificationService } from '../services/notification.service';
import { ConfirmDialogService } from './confirm-dialog.component';
import { BaseEntity } from '../interfaces/base-entity.interface';
import { 
  ListConfig, 
  FilterConfig, 
  CrudListService
} from '../interfaces/list-config.interface';

// Import new reusable UI components
import { LoadingOverlayComponent } from './loading-overlay.component';
import { EmptyStateComponent } from './empty-state.component';
import { TableActionsComponent, COMMON_TABLE_ACTIONS } from './table-actions.component';
import { FilterBarComponent, COMMON_FILTER_FIELDS } from './filter-bar.component';

// Import component configurations
import { LoadingConfig } from '../interfaces/loading-config.interface';
import { EmptyStateConfig, EMPTY_STATE_PRESETS } from '../interfaces/empty-state-config.interface';
import { TableActionsConfig, TableActionEvent } from '../interfaces/table-actions-config.interface';
import { FilterBarConfig, FilterEvent } from '../interfaces/filter-bar-config.interface';

/**
 * Componente base concreto para listas CRUD
 * Utiliza configuração via Input para eliminar duplicação
 * 
 * Uso:
 * <app-base-crud-list 
 *   [config]="listConfig" 
 *   [service]="entityService">
 * </app-base-crud-list>
 */
@Component({
  selector: 'app-base-crud-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    LucideAngularModule,
    LoadingOverlayComponent,
    EmptyStateComponent,
    TableActionsComponent,
    FilterBarComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="crud-list-container" [attr.data-entity]="config?.entityNamePlural?.toLowerCase()">
      <!-- Page Header -->
      <div class="page-header">
        <h1>{{ config?.entityNamePlural }}</h1>
        <a [routerLink]="newItemRoute" class="btn btn-primary" [attr.title]="'Novo ' + config?.entityName">
          <lucide-icon name="plus" size="18"></lucide-icon>
          Novo {{ config?.entityName }}
        </a>
      </div>

      <!-- Filter Bar Component -->
      @if (config?.filters && config.filters.length > 0) {
        <app-filter-bar
          [config]="filterBarConfig"
          [initialValues]="filters"
          [resultsCount]="config.showItemCount ? filteredItems.length : undefined"
          (filterApply)="onFilterApply($event)"
          (filterClear)="onFilterClear($event)">
        </app-filter-bar>
      }

      <!-- Loading Overlay -->
      <app-loading-overlay [config]="loadingConfig"></app-loading-overlay>
      
      <!-- Table Card -->
      <div class="table-card">
        @if (!loading) {
          @if (filteredItems.length > 0) {
            <!-- Item Count -->
            @if (config?.showItemCount) {
              <div class="item-count">
                <p>{{ filteredItems.length }} {{ filteredItems.length === 1 ? config.entityName.toLowerCase() : config.entityNamePlural.toLowerCase() }} encontrado(s)</p>
              </div>
            }

            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    @for (column of config?.columns; track column.key) {
                      <th 
                        [style.width]="column.width"
                        [class.sortable]="column.sortable"
                        (click)="column.sortable ? sort(column.key) : null">
                        {{ column.label }}
                        @if (column.sortable && sortColumn === column.key) {
                          <lucide-icon 
                            [name]="sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'" 
                            size="14">
                          </lucide-icon>
                        }
                      </th>
                    }
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of filteredItems; track trackByFunction(0, item)) {
                    <tr>
                      @for (column of config?.columns; track column.key) {
                        <td>
                          @switch (column.type) {
                            @case ('badge') {
                              <span 
                                class="badge"
                                [class]="getBadgeClass(getItemValue(item, column.key), column.badgeConfig)">
                                {{ getBadgeText(getItemValue(item, column.key), column.badgeConfig) }}
                              </span>
                            }
                            @case ('currency') {
                              {{ formatCurrency(getItemValue(item, column.key)) }}
                            }
                            @case ('date') {
                              {{ formatDate(getItemValue(item, column.key)) }}
                            }
                            @case ('custom') {
                              {{ column.formatter ? column.formatter(getItemValue(item, column.key), item) : getItemValue(item, column.key) }}
                            }
                            @default {
                              {{ getItemValue(item, column.key) || '-' }}
                            }
                          }
                        </td>
                      }
                      <td>
                        <app-table-actions
                          [config]="tableActionsConfig"
                          [item]="item"
                          [baseRoute]="config?.baseRoute"
                          (editClick)="onEditItem($event)"
                          (deleteClick)="onDeleteItem($event)">
                        </app-table-actions>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <app-empty-state
              [config]="emptyStateConfig"
              [actionRoute]="newItemRoute">
            </app-empty-state>
          }
        }
      </div>
    </div>
  `
})
export class BaseCrudListComponent<T extends BaseEntity> implements OnInit, OnDestroy {
  @Input() config!: ListConfig<T>;
  @Input() service!: CrudListService<T>;

  // Protected dependencies
  private cdr = inject(ChangeDetectorRef);
  private notificationService = inject(NotificationService);
  private confirmDialog = inject(ConfirmDialogService);
  
  // Subscription management
  private destroy$ = new Subject<void>();
  
  // State
  items: T[] = [];
  filteredItems: T[] = [];
  filters: Record<string, any> = {};
  loading = false;
  
  // Sorting
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  
  /**
   * Route for new item creation
   */
  get newItemRoute(): string {
    return `${this.config?.baseRoute}/novo` || '/';
  }

  /**
   * TrackBy function from config
   */
  get trackByFunction() {
    return this.config?.trackByFn || ((index: number, item: T) => item.id || index);
  }

  /**
   * Configuration for LoadingOverlayComponent
   */
  get loadingConfig(): LoadingConfig {
    return {
      show: this.loading,
      message: `Carregando ${this.config?.entityNamePlural?.toLowerCase()}...`,
      size: 'medium'
    };
  }

  /**
   * Configuration for EmptyStateComponent
   */
  get emptyStateConfig(): EmptyStateConfig {
    const customConfig = this.config?.emptyState;
    return {
      icon: customConfig?.icon || 'inbox',
      title: customConfig?.title || 'Nenhum item encontrado',
      subtitle: customConfig?.subtitle || 'Comece adicionando um novo item',
      showAction: true,
      actionText: `Novo ${this.config?.entityName}`,
      size: 'medium'
    };
  }

  /**
   * Configuration for TableActionsComponent
   */
  get tableActionsConfig(): TableActionsConfig {
    return {
      actions: [
        COMMON_TABLE_ACTIONS.EDIT,
        COMMON_TABLE_ACTIONS.DELETE
      ],
      size: 'medium',
      loading: this.loading
    };
  }

  /**
   * Configuration for FilterBarComponent
   */
  get filterBarConfig(): FilterBarConfig {
    if (!this.config?.filters || this.config.filters.length === 0) {
      return { fields: [] };
    }

    const filterFields = this.config.filters.map(filter => ({
      key: filter.key,
      label: filter.label,
      type: filter.type as any,
      placeholder: filter.placeholder,
      options: filter.options?.map(opt => ({
        value: opt.value,
        label: opt.label
      })),
      searchOnEnter: filter.searchOnEnter,
      debounceTime: 500
    }));

    return {
      fields: filterFields,
      layout: 'horizontal',
      showActions: true,
      showResultsCount: this.config.showItemCount,
      autoApply: false,
      loading: this.loading
    };
  }

  ngOnInit(): void {
    this.initializeFilters();
    this.loadItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega todos os itens
   */
  loadItems(): void {
    if (!this.service) return;
    
    this.loading = true;
    this.cdr.markForCheck();
    
    this.service.listarTodos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: T[]) => {
          this.items = data;
          this.filteredItems = [...data];
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          this.loading = false;
          console.error(`Error loading ${this.config?.entityName}:`, error);
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Aplica filtros locais ou chama API específica
   * Updated to work with new FilterBarComponent
   */
  applyFilters(): void {
    const activeFilter = this.getActiveFilterWithSearchMethod();
    
    if (activeFilter) {
      this.executeSpecificSearch(activeFilter);
    } else {
      this.filteredItems = this.items.filter(item => {
        return Object.entries(this.filters).every(([key, value]) => {
          if (!value) return true;
          
          const itemValue = this.getItemValue(item, key);
          if (typeof value === 'boolean') {
            return itemValue === value;
          }
          if (typeof value === 'string') {
            return itemValue?.toString().toLowerCase().includes(value.toLowerCase());
          }
          return itemValue === value;
        });
      });
      this.cdr.markForCheck();
    }
  }

  /**
   * Executa busca específica via API
   */
  executeSpecificSearch(filter: FilterConfig): void {
    const searchMethod = filter.searchMethod;
    const searchValue = this.filters[filter.key];
    
    if (!searchMethod || !searchValue || !this.service) {
      this.applyFilters();
      return;
    }

    if (typeof (this.service as any)[searchMethod] === 'function') {
      this.loading = true;
      this.cdr.markForCheck();
      
      (this.service as any)[searchMethod](searchValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: T[] | T) => {
            this.filteredItems = Array.isArray(data) ? data : [data];
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: (error: any) => {
            this.loading = false;
            console.error(`Search error for ${this.config?.entityName}:`, error);
            this.cdr.markForCheck();
          }
        });
    }
  }

  /**
   * Limpa todos os filtros
   * Updated to work with new FilterBarComponent
   */
  clearFilters(): void {
    this.initializeFilters();
    this.filteredItems = [...this.items]; // Reset to show all items
    this.cdr.markForCheck();
  }

  /**
   * Confirma exclusão de item
   */
  async confirmDelete(item: T): Promise<void> {
    const itemName = this.getItemDisplayName(item);
    
    const confirmed = await this.confirmDialog.confirmDelete(itemName);
    if (confirmed && item.id) {
      this.deleteItem(item.id, itemName);
    }
  }

  /**
   * Executa exclusão do item
   */
  private deleteItem(id: number, itemName: string): void {
    if (!this.service) return;
    
    this.loading = true;
    this.cdr.markForCheck();
    
    this.service.deletar(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success(`${this.config?.entityName} "${itemName}" excluído com sucesso!`);
          this.loadItems();
        },
        error: (error: any) => {
          this.loading = false;
          console.error(`Delete error for ${this.config?.entityName}:`, error);
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Ordena por coluna
   */
  sort(columnKey: string): void {
    if (this.sortColumn === columnKey) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }

    this.filteredItems.sort((a, b) => {
      const aValue = this.getItemValue(a, columnKey);
      const bValue = this.getItemValue(b, columnKey);
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
    
    this.cdr.markForCheck();
  }

  /**
   * Obtém valor de propriedade aninhada
   */
  getItemValue(item: any, path: string): any {
    return path.split('.').reduce((obj, key) => obj?.[key], item);
  }

  /**
   * Obtém nome de exibição do item para confirmações
   */
  private getItemDisplayName(item: T): string {
    return (item as any).nome || (item as any).title || (item as any).name || `${this.config?.entityName} #${item.id}`;
  }

  /**
   * Obtém rota de edição
   */
  getEditRoute(item: T): string {
    return `${this.config?.baseRoute}/${item.id}/editar`;
  }

  /**
   * Inicializa filtros baseado na configuração
   */
  private initializeFilters(): void {
    this.filters = {};
    this.config?.filters?.forEach(filter => {
      this.filters[filter.key] = filter.type === 'checkbox' ? false : '';
    });
  }

  /**
   * Encontra filtro ativo com método de busca específico
   */
  private getActiveFilterWithSearchMethod(): FilterConfig | null {
    return this.config?.filters?.find(filter => 
      filter.searchMethod && this.filters[filter.key]
    ) || null;
  }

  /**
   * Handler para mudança em checkbox filters
   */
  onCheckboxFilterChange(filter: FilterConfig): void {
    if (filter.searchMethod) {
      this.loadItemsWithSpecialMethod(filter.searchMethod);
    }
  }

  /**
   * Carrega itens com método especial (ex: buscarAtivos)
   */
  private loadItemsWithSpecialMethod(method: string): void {
    if (!this.service || typeof (this.service as any)[method] !== 'function') return;
    
    this.loading = true;
    this.cdr.markForCheck();
    
    (this.service as any)[method]()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: T[]) => {
          this.items = data;
          this.filteredItems = [...data];
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          this.loading = false;
          console.error(`Special method error for ${this.config?.entityName}:`, error);
          this.cdr.markForCheck();
        }
      });
  }

  // Utility methods for template
  getBadgeClass(value: any, badgeConfig: any): string {
    return value ? badgeConfig?.trueClass || 'badge-success' : badgeConfig?.falseClass || 'badge-danger';
  }

  getBadgeText(value: any, badgeConfig: any): string {
    return value ? badgeConfig?.trueValue || 'Ativo' : badgeConfig?.falseValue || 'Inativo';
  }

  formatCurrency(value: number): string {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(value: string | Date): string {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('pt-BR');
  }

  // Event handlers for new components

  /**
   * Handles filter apply event from FilterBarComponent
   */
  onFilterApply(event: FilterEvent): void {
    this.filters = { ...event.filters };
    this.applyFilters();
  }

  /**
   * Handles filter clear event from FilterBarComponent
   */
  onFilterClear(event: FilterEvent): void {
    this.clearFilters();
  }

  /**
   * Handles edit action from TableActionsComponent
   */
  onEditItem(item: T): void {
    // Navigation is handled automatically by TableActionsComponent
    // This method can be overridden in child components for custom logic
  }

  /**
   * Handles delete action from TableActionsComponent
   */
  async onDeleteItem(item: T): Promise<void> {
    await this.confirmDelete(item);
  }
}