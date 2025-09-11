import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef,
  inject 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import {
  FilterBarConfig,
  FilterFieldConfig,
  FilterEvent,
  FilterValidation,
  FilterOption,
  DEFAULT_FILTER_BAR_CONFIG,
  COMMON_FILTER_FIELDS
} from '../interfaces/filter-bar-config.interface';

/**
 * Componente reutilizável para barra de filtros
 * Fornece interface padronizada para filtros em listas
 * 
 * @example
 * <!-- Barra de filtros básica -->
 * <app-filter-bar 
 *   [config]="{
 *     fields: [
 *       COMMON_FILTER_FIELDS.SEARCH,
 *       COMMON_FILTER_FIELDS.STATUS
 *     ]
 *   }"
 *   (filterChange)="onFiltersChange($event)">
 * </app-filter-bar>
 * 
 * @example
 * <!-- Filtros com layout grid -->
 * <app-filter-bar 
 *   [config]="{
 *     fields: filterFields,
 *     layout: 'grid',
 *     gridColumns: 3,
 *     autoApply: true,
 *     collapsible: true
 *   }"
 *   [resultsCount]="totalItems"
 *   (filterApply)="applyFilters($event)">
 * </app-filter-bar>
 */
@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter-bar" 
         [class]="getFilterBarClasses()"
         [attr.data-testid]="'filter-bar'">
      
      <!-- Header with toggle -->
      @if (effectiveConfig.collapsible) {
        <div class="filter-header" (click)="toggleCollapse()">
          <h4 class="filter-title">
            <lucide-icon name="filter" size="18"></lucide-icon>
            Filtros
          </h4>
          <button type="button" class="toggle-btn" [attr.data-testid]="'filter-toggle'">
            <lucide-icon 
              [name]="collapsed ? 'chevron-down' : 'chevron-up'" 
              size="16">
            </lucide-icon>
          </button>
        </div>
      }
      
      <!-- Filter Content -->
      <div class="filter-content" [class.collapsed]="collapsed">
        @if (!collapsed) {
          <form [formGroup]="filterForm" class="filter-form">
            <div class="filter-fields" [class]="getFieldsLayoutClass()">
              @for (field of visibleFields; track field.key) {
                <div class="filter-field" 
                     [class]="getFieldClasses(field)"
                     [style.width]="field.width">
                  
                  <!-- Field Label -->
                  @if (field.label) {
                    <label class="field-label" [for]="'filter-' + field.key">
                      {{ field.label }}
                      @if (field.required) {
                        <span class="required">*</span>
                      }
                    </label>
                  }
                  
                  <!-- Field Input -->
                  <div class="field-input">
                    @switch (field.type) {
                      @case ('text') {
                        <input 
                          type="text"
                          class="form-control"
                          [id]="'filter-' + field.key"
                          [placeholder]="field.placeholder || ''"
                          [disabled]="!!(field.disabled || effectiveConfig.loading)"
                          [formControlName]="field.key"
                          [attr.data-testid]="'filter-' + field.key"
                          (keyup.enter)="field.searchOnEnter ? handleEnterSearch(field) : null">
                      }
                      
                      @case ('search') {
                        <div class="search-field">
                          <input 
                            type="search"
                            class="form-control search-input"
                            [id]="'filter-' + field.key"
                            [placeholder]="field.placeholder || ''"
                            [disabled]="!!(field.disabled || effectiveConfig.loading)"
                            [formControlName]="field.key"
                            [attr.data-testid]="'filter-' + field.key"
                            (keyup.enter)="handleEnterSearch(field)">
                          <lucide-icon 
                            name="search" 
                            size="16" 
                            class="search-icon">
                          </lucide-icon>
                        </div>
                      }
                      
                      @case ('select') {
                        <select 
                          class="form-control"
                          [id]="'filter-' + field.key"
                          [disabled]="!!(field.disabled || effectiveConfig.loading)"
                          [formControlName]="field.key"
                          [attr.data-testid]="'filter-' + field.key">
                          <option value="">
                            {{ field.placeholder || 'Todos' }}
                          </option>
                          @for (option of getFieldOptions(field); track option.value) {
                            <option 
                              [value]="option.value"
                              [disabled]="option.disabled">
                              {{ option.label }}
                            </option>
                          }
                        </select>
                      }
                      
                      @case ('date') {
                        <input 
                          type="date"
                          class="form-control"
                          [id]="'filter-' + field.key"
                          [disabled]="!!(field.disabled || effectiveConfig.loading)"
                          [formControlName]="field.key"
                          [attr.data-testid]="'filter-' + field.key">
                      }
                      
                      @case ('daterange') {
                        <div class="date-range-field">
                          <input 
                            type="date"
                            class="form-control date-start"
                            placeholder="Data inicial"
                            [disabled]="!!(field.disabled || effectiveConfig.loading)"
                            [formControlName]="field.key + '_start'"
                            [attr.data-testid]="'filter-' + field.key + '-start'">
                          <span class="date-separator">até</span>
                          <input 
                            type="date"
                            class="form-control date-end"
                            placeholder="Data final"
                            [disabled]="!!(field.disabled || effectiveConfig.loading)"
                            [formControlName]="field.key + '_end'"
                            [attr.data-testid]="'filter-' + field.key + '-end'">
                        </div>
                      }
                      
                      @case ('number') {
                        <input 
                          type="number"
                          class="form-control"
                          [id]="'filter-' + field.key"
                          [placeholder]="field.placeholder || ''"
                          [disabled]="!!(field.disabled || effectiveConfig.loading)"
                          [formControlName]="field.key"
                          [attr.data-testid]="'filter-' + field.key">
                      }
                      
                      @case ('checkbox') {
                        <label class="checkbox-field">
                          <input 
                            type="checkbox"
                            [disabled]="!!(field.disabled || effectiveConfig.loading)"
                            [formControlName]="field.key"
                            [attr.data-testid]="'filter-' + field.key">
                          <span class="checkmark"></span>
                        </label>
                      }
                    }
                    
                    <!-- Field Error -->
                    @if (getFieldError(field.key)) {
                      <div class="field-error">
                        {{ getFieldError(field.key) }}
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
            
            <!-- Filter Actions -->
            @if (effectiveConfig.showActions && !effectiveConfig.autoApply) {
              <div class="filter-actions">
                <button 
                  type="button"
                  class="btn btn-primary"
                  [disabled]="effectiveConfig.loading"
                  [attr.data-testid]="'filter-apply'"
                  (click)="applyFilters()">
                  @if (effectiveConfig.loading) {
                    <div class="spinner-small"></div>
                  } @else {
                    <lucide-icon name="filter" size="16"></lucide-icon>
                  }
                  Filtrar
                </button>
                
                <button 
                  type="button"
                  class="btn btn-secondary"
                  [disabled]="effectiveConfig.loading"
                  [attr.data-testid]="'filter-clear'"
                  (click)="clearFilters()">
                  <lucide-icon name="x" size="16"></lucide-icon>
                  Limpar
                </button>
              </div>
            }
          </form>
          
          <!-- Results Count -->
          @if (effectiveConfig.showResultsCount && resultsCount !== undefined) {
            <div class="results-count" [attr.data-testid]="'filter-results-count'">
              <lucide-icon name="info" size="16"></lucide-icon>
              {{ getResultsCountText() }}
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .filter-bar {
      background-color: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: 12px;
      margin-bottom: 1.5rem;
      transition: all var(--transition-normal);
    }
    
    .compact {
      margin-bottom: 1rem;
    }
    
    /* Header */
    .filter-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      cursor: pointer;
      border-bottom: 1px solid var(--border-light);
      transition: background-color var(--transition-fast);
    }
    
    .filter-header:hover {
      background-color: var(--bg-hover);
    }
    
    .filter-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: color var(--transition-fast);
    }
    
    .toggle-btn:hover {
      color: var(--text-primary);
    }
    
    /* Content */
    .filter-content {
      overflow: hidden;
      transition: max-height var(--transition-normal), padding var(--transition-normal);
    }
    
    .filter-content:not(.collapsed) {
      padding: 1.25rem;
    }
    
    .filter-content.collapsed {
      max-height: 0;
      padding: 0 1.25rem;
    }
    
    .compact .filter-content:not(.collapsed) {
      padding: 1rem;
    }
    
    /* Form */
    .filter-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .compact .filter-form {
      gap: 1rem;
    }
    
    /* Fields Layout */
    .filter-fields {
      display: flex;
      gap: 1rem;
      align-items: end;
    }
    
    .layout-vertical .filter-fields {
      flex-direction: column;
      align-items: stretch;
    }
    
    .layout-grid .filter-fields {
      display: grid;
      gap: 1rem;
    }
    
    .grid-2 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(3, 1fr); }
    .grid-4 { grid-template-columns: repeat(4, 1fr); }
    .grid-5 { grid-template-columns: repeat(5, 1fr); }
    
    /* Individual Fields */
    .filter-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 0;
    }
    
    .field-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin: 0;
    }
    
    .required {
      color: var(--danger);
      margin-left: 0.25rem;
    }
    
    .field-input {
      position: relative;
    }
    
    /* Form Controls */
    .form-control {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid var(--border-light);
      border-radius: 8px;
      background-color: var(--bg-card);
      color: var(--text-primary);
      font-size: 0.875rem;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }
    
    .form-control:focus {
      outline: none;
      border-color: var(--primary-blue);
      box-shadow: 0 0 0 3px rgba(2, 0, 150, 0.1);
    }
    
    .form-control:disabled {
      background-color: var(--bg-light);
      color: var(--text-muted);
      cursor: not-allowed;
    }
    
    /* Search Field */
    .search-field {
      position: relative;
    }
    
    .search-input {
      padding-right: 2.5rem;
    }
    
    .search-icon {
      position: absolute;
      right: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-tertiary);
      pointer-events: none;
    }
    
    /* Date Range Field */
    .date-range-field {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .date-separator {
      font-size: 0.875rem;
      color: var(--text-tertiary);
      white-space: nowrap;
    }
    
    .date-start,
    .date-end {
      flex: 1;
    }
    
    /* Checkbox Field */
    .checkbox-field {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;
    }
    
    .checkbox-field input[type="checkbox"] {
      width: auto;
      margin: 0;
    }
    
    /* Error Messages */
    .field-error {
      font-size: 0.75rem;
      color: var(--danger);
      margin-top: 0.25rem;
    }
    
    /* Actions */
    .filter-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-light);
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border: 1px solid transparent;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      user-select: none;
    }
    
    .btn-primary {
      background-color: var(--primary-orange);
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: var(--primary-orange-hover);
    }
    
    .btn-secondary {
      background-color: transparent;
      color: var(--text-secondary);
      border-color: var(--border-medium);
    }
    
    .btn-secondary:hover:not(:disabled) {
      background-color: var(--bg-hover);
      color: var(--text-primary);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    /* Results Count */
    .results-count {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      margin-top: 1rem;
      background-color: var(--bg-light);
      border-radius: 8px;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    
    /* Loading Spinner */
    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .filter-fields:not(.layout-vertical) {
        flex-direction: column;
        align-items: stretch;
      }
      
      .layout-grid .filter-fields {
        grid-template-columns: 1fr;
      }
      
      .date-range-field {
        flex-direction: column;
        align-items: stretch;
      }
      
      .date-separator {
        text-align: center;
        padding: 0.25rem 0;
      }
      
      .filter-actions {
        justify-content: stretch;
      }
      
      .filter-actions .btn {
        flex: 1;
      }
    }
    
    /* Animation */
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Accessibility */
    @media (prefers-reduced-motion: reduce) {
      .filter-bar,
      .filter-content,
      .form-control,
      .btn,
      .spinner-small {
        transition: none;
        animation: none;
      }
    }
    
    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .filter-header:hover {
        background-color: #404040;
      }
      
      .form-control {
        background-color: #2a2a2a;
        border-color: #404040;
        color: #f0f0f0;
      }
      
      .form-control:disabled {
        background-color: #404040;
        color: #808080;
      }
      
      .results-count {
        background-color: #404040;
      }
    }
  `]
})
export class FilterBarComponent implements OnInit, OnDestroy {
  /**
   * Configuration for the filter bar
   */
  @Input() config!: FilterBarConfig;

  /**
   * Initial filter values
   */
  @Input() initialValues: Record<string, any> = {};

  /**
   * Results count for display
   */
  @Input() resultsCount?: number;

  /**
   * Event emitted when filters change (if autoApply is enabled)
   */
  @Output() filterChange = new EventEmitter<FilterEvent>();

  /**
   * Event emitted when apply button is clicked
   */
  @Output() filterApply = new EventEmitter<FilterEvent>();

  /**
   * Event emitted when clear button is clicked
   */
  @Output() filterClear = new EventEmitter<FilterEvent>();

  /**
   * Event emitted when enter key is pressed on search fields
   */
  @Output() filterSearch = new EventEmitter<FilterEvent>();

  // Dependencies
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // Component state
  filterForm!: FormGroup;
  collapsed = false;
  fieldErrors: Record<string, string> = {};
  fieldOptions: Record<string, FilterOption[]> = {};
  private destroy$ = new Subject<void>();

  /**
   * Static reference to common fields for use in templates
   */
  static readonly COMMON_FIELDS = COMMON_FILTER_FIELDS;

  /**
   * Gets the effective configuration by merging with defaults
   */
  get effectiveConfig(): FilterBarConfig {
    return {
      ...DEFAULT_FILTER_BAR_CONFIG,
      ...this.config
    } as FilterBarConfig;
  }

  /**
   * Gets visible fields based on show conditions
   */
  get visibleFields(): FilterFieldConfig[] {
    return this.effectiveConfig.fields.filter(field => {
      if (field.showCondition) {
        return field.showCondition(this.filterForm?.value || {});
      }
      return true;
    });
  }

  ngOnInit(): void {
    this.collapsed = this.effectiveConfig.initiallyCollapsed || false;
    this.buildForm();
    this.loadFieldOptions();
    this.setupAutoApply();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Builds the reactive form based on field configuration
   */
  private buildForm(): void {
    const formControls: Record<string, any> = {};

    this.effectiveConfig.fields.forEach(field => {
      const initialValue = this.initialValues[field.key] !== undefined 
        ? this.initialValues[field.key] 
        : (field.defaultValue !== undefined ? field.defaultValue : '');
      
      formControls[field.key] = [initialValue];

      // Add additional controls for date range
      if (field.type === 'daterange') {
        formControls[field.key + '_start'] = [this.initialValues[field.key + '_start'] || ''];
        formControls[field.key + '_end'] = [this.initialValues[field.key + '_end'] || ''];
      }
    });

    this.filterForm = this.fb.group(formControls);
    this.cdr.markForCheck();
  }

  /**
   * Loads options for select fields
   */
  private async loadFieldOptions(): Promise<void> {
    const loadPromises = this.effectiveConfig.fields
      .filter(field => field.type === 'select' && field.optionsLoader)
      .map(async field => {
        try {
          const options = await field.optionsLoader!();
          this.fieldOptions[field.key] = options;
        } catch (error) {
          console.error(`Error loading options for field ${field.key}:`, error);
          this.fieldOptions[field.key] = [];
        }
      });

    if (loadPromises.length > 0) {
      await Promise.all(loadPromises);
      this.cdr.markForCheck();
    }
  }

  /**
   * Sets up auto-apply functionality
   */
  private setupAutoApply(): void {
    if (this.effectiveConfig.autoApply) {
      this.filterForm.valueChanges
        .pipe(
          takeUntil(this.destroy$),
          debounceTime(this.effectiveConfig.autoApplyDebounce || 500),
          distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
        )
        .subscribe(values => {
          this.emitFilterChange();
        });
    }
  }

  /**
   * Gets CSS classes for the filter bar
   */
  getFilterBarClasses(): string {
    const classes = ['filter-bar'];
    
    if (this.effectiveConfig.compact) {
      classes.push('compact');
    }
    
    if (this.effectiveConfig.customClass) {
      classes.push(this.effectiveConfig.customClass);
    }
    
    return classes.join(' ');
  }

  /**
   * Gets CSS classes for field layout
   */
  getFieldsLayoutClass(): string {
    const classes = ['filter-fields'];
    
    if (this.effectiveConfig.layout) {
      classes.push(`layout-${this.effectiveConfig.layout}`);
    }
    
    if (this.effectiveConfig.layout === 'grid' && this.effectiveConfig.gridColumns) {
      classes.push(`grid-${this.effectiveConfig.gridColumns}`);
    }
    
    return classes.join(' ');
  }

  /**
   * Gets CSS classes for individual fields
   */
  getFieldClasses(field: FilterFieldConfig): string {
    const classes = ['filter-field'];
    
    if (field.cssClass) {
      classes.push(field.cssClass);
    }
    
    return classes.join(' ');
  }

  /**
   * Gets options for a select field
   */
  getFieldOptions(field: FilterFieldConfig): FilterOption[] {
    if (field.optionsLoader && this.fieldOptions[field.key]) {
      return this.fieldOptions[field.key];
    }
    
    return field.options || [];
  }

  /**
   * Gets error message for a field
   */
  getFieldError(fieldKey: string): string {
    return this.fieldErrors[fieldKey] || '';
  }

  /**
   * Gets results count text
   */
  getResultsCountText(): string {
    if (this.effectiveConfig.resultsCountTemplate && this.resultsCount !== undefined) {
      return this.effectiveConfig.resultsCountTemplate.replace('{count}', this.resultsCount.toString());
    }
    
    const count = this.resultsCount || 0;
    return `${count} resultado${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
  }

  /**
   * Handles enter key search
   */
  handleEnterSearch(field: FilterFieldConfig): void {
    this.emitFilterEvent('search', field.key);
  }

  /**
   * Applies filters
   */
  applyFilters(): void {
    if (this.validateFilters()) {
      this.emitFilterEvent('apply');
    }
  }

  /**
   * Clears all filters
   */
  clearFilters(): void {
    this.filterForm.reset();
    this.fieldErrors = {};
    this.emitFilterEvent('clear');
    this.cdr.markForCheck();
  }

  /**
   * Toggles collapse state
   */
  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.cdr.markForCheck();
  }

  /**
   * Validates all filters
   */
  private validateFilters(): FilterValidation {
    const errors: Record<string, string> = {};
    const values = this.filterForm.value;

    this.effectiveConfig.fields.forEach(field => {
      if (field.validator) {
        const error = field.validator(values[field.key]);
        if (error) {
          errors[field.key] = error;
        }
      }

      if (field.required && !values[field.key]) {
        errors[field.key] = `${field.label} é obrigatório`;
      }
    });

    this.fieldErrors = errors;
    this.cdr.markForCheck();

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Emits filter change event
   */
  private emitFilterChange(changedField?: string): void {
    const eventData = this.buildFilterEvent('change', changedField);
    this.filterChange.emit(eventData);
  }

  /**
   * Emits filter event based on type
   */
  private emitFilterEvent(type: 'apply' | 'clear' | 'search' | 'change', changedField?: string): void {
    const eventData = this.buildFilterEvent(type, changedField);

    switch (type) {
      case 'apply':
        this.filterApply.emit(eventData);
        break;
      case 'clear':
        this.filterClear.emit(eventData);
        break;
      case 'search':
        this.filterSearch.emit(eventData);
        break;
      case 'change':
        this.filterChange.emit(eventData);
        break;
    }
  }

  /**
   * Builds filter event data
   */
  private buildFilterEvent(type: 'apply' | 'clear' | 'change' | 'search', changedField?: string): FilterEvent {
    return {
      type,
      filters: this.filterForm.value,
      changedField,
      previousFilters: this.initialValues
    };
  }
}

// Export common filter fields for use in other components
export { COMMON_FILTER_FIELDS };