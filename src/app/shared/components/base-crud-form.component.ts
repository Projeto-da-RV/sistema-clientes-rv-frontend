import { Injectable, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { NotificationService } from '../services/notification.service';
import { BaseEntity } from '../interfaces/base-entity.interface';
import { 
  FormConfig, 
  FieldConfig, 
  CrudFormService, 
  FormEventConfig, 
  FormState,
  RelatedDataConfig,
  FormFieldType 
} from '../interfaces/form-config.interface';

/**
 * Classe base abstrata para formulários CRUD
 * Elimina duplicação de código entre todos os componentes de formulário
 * 
 * @template T - Tipo da entidade que estende BaseEntity
 * 
 * Uso:
 * export class ClienteFormComponent extends BaseCrudFormComponent<Cliente> {
 *   protected buildFormConfig(): FormConfig<Cliente> { ... }
 *   protected get entityService(): CrudFormService<Cliente> { ... }
 * }
 */
@Injectable()
export abstract class BaseCrudFormComponent<T extends BaseEntity> implements OnInit, OnDestroy {
  // Configuration provided by child classes
  protected abstract config: FormConfig<T>;
  protected eventConfig?: FormEventConfig;

  // Protected dependencies (injected via constructor)
  protected fb: FormBuilder;
  protected router: Router;
  protected route: ActivatedRoute;
  protected cdr: ChangeDetectorRef;
  protected notificationService: NotificationService;

  /**
   * Base constructor that must be called by child classes
   */
  constructor(
    fb: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    cdr: ChangeDetectorRef,
    notificationService: NotificationService
  ) {
    this.fb = fb;
    this.router = router;
    this.route = route;
    this.cdr = cdr;
    this.notificationService = notificationService;
  }
  
  // Subscription management
  private destroy$ = new Subject<void>();
  
  // Form state
  entityForm!: FormGroup;
  loading = false;
  isEditMode = false;
  entityId: number | null = null;
  
  // Related data storage
  protected relatedDataMap: { [key: string]: any[] } = {};

  // Expose FormFieldType to child components
  protected readonly FormFieldType = FormFieldType;

  /**
   * Computed properties
   */
  get formTitle(): string {
    if (this.isEditMode) {
      return this.config?.editTitle || `Editar ${this.config?.entityName}`;
    }
    return this.config?.createTitle || `Novo ${this.config?.entityName}`;
  }

  get formState(): FormState {
    return {
      loading: this.loading,
      isEditMode: this.isEditMode,
      entityId: this.entityId,
      hasUnsavedChanges: this.entityForm?.dirty || false
    };
  }

  /**
   * Abstract methods that must be implemented by child components
   */
  protected abstract get entityService(): CrudFormService<T>;

  ngOnInit(): void {
    this.validateConfig();
    this.buildForm();
    this.loadRelatedData();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Validates that required configuration is provided
   */
  private validateConfig(): void {
    if (!this.config) {
      throw new Error('FormConfig is required');
    }
    if (!this.config.fields || this.config.fields.length === 0) {
      throw new Error('At least one field configuration is required');
    }
    if (!this.entityService) {
      throw new Error('Entity service must be provided');
    }
  }

  /**
   * Builds the reactive form based on configuration
   */
  protected buildForm(): void {
    const formControls: { [key: string]: any } = {};

    this.config.fields.forEach(field => {
      const validators = field.validators || [];
      const defaultValue = field.defaultValue !== undefined ? field.defaultValue : '';
      
      formControls[field.key] = [
        { value: defaultValue, disabled: field.disabled || false },
        validators
      ];
    });

    this.entityForm = this.fb.group(formControls);
    this.cdr.markForCheck();
  }

  /**
   * Loads related data (like categories, clients, etc.)
   */
  protected loadRelatedData(): void {
    if (!this.config.relatedData || this.config.relatedData.length === 0) {
      return;
    }

    const loadOperations = this.config.relatedData
      .filter(rd => rd.loadOnInit !== false)
      .map(relatedData => relatedData.loadFunction());

    if (loadOperations.length > 0) {
      forkJoin(loadOperations).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (results) => {
          this.config.relatedData?.forEach((relatedData, index) => {
            if (relatedData.loadOnInit !== false) {
              this.relatedDataMap[relatedData.propertyName] = results[index];
            }
          });
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading related data:', error);
          this.notificationService.error('Erro ao carregar dados relacionados');
        }
      });
    }
  }

  /**
   * Checks if we're in edit mode and loads the entity
   */
  protected checkEditMode(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.entityId = +params['id'];
        this.loadEntity();
      }
    });
  }

  /**
   * Loads entity by ID for editing
   */
  protected loadEntity(): void {
    if (!this.entityId) return;

    this.loading = true;
    this.cdr.markForCheck();

    this.entityService.buscarPorId(this.entityId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (entity) => {
        this.populateForm(entity);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error(
          error.message || `Erro ao carregar ${this.config.entityName.toLowerCase()}`
        );
        this.navigateToList();
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Populates form with entity data
   */
  protected populateForm(entity: T): void {
    const formData = this.config.afterLoad ? this.config.afterLoad(entity) : entity;
    this.entityForm.patchValue(formData);
  }

  /**
   * Form submission handler
   */
  onSubmit(): void {
    if (this.eventConfig?.beforeSubmit && !this.eventConfig.beforeSubmit()) {
      return;
    }

    if (!this.entityForm.valid) {
      this.markAllFieldsAsTouched();
      this.notificationService.warning('Por favor, preencha todos os campos obrigatórios corretamente');
      return;
    }

    this.saveEntity();
  }

  /**
   * Saves the entity (create or update)
   */
  protected saveEntity(): void {
    this.loading = true;
    this.cdr.markForCheck();

    let formValue = this.entityForm.value;
    
    // Apply beforeSave transformation if configured
    if (this.config.beforeSave) {
      formValue = { ...formValue, ...this.config.beforeSave(formValue, this.isEditMode) };
    }

    const request = this.isEditMode && this.entityId
      ? this.entityService.atualizar(this.entityId, formValue)
      : this.entityService.criar(formValue);

    request.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (entity) => {
        this.loading = false;
        const message = `${this.config.entityName} ${this.isEditMode ? 'atualizado' : 'cadastrado'} com sucesso`;
        
        this.notificationService.success(message).then(() => {
          if (this.eventConfig?.afterSuccess) {
            this.eventConfig.afterSuccess(entity, this.isEditMode);
          } else {
            this.navigateToList();
          }
        });
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error(
          error.message || `Erro ao salvar ${this.config.entityName.toLowerCase()}`
        );
        
        if (this.eventConfig?.afterError) {
          this.eventConfig.afterError(error);
        }
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Cancels form and navigates back
   */
  cancelar(): void {
    if (this.eventConfig?.onCancel) {
      this.eventConfig.onCancel();
    } else {
      this.navigateToList();
    }
  }

  /**
   * Navigates to entity list
   */
  protected navigateToList(): void {
    this.router.navigate([this.config.baseRoute]);
  }

  /**
   * Marks all form fields as touched to show validation errors
   */
  protected markAllFieldsAsTouched(): void {
    Object.keys(this.entityForm.controls).forEach(key => {
      const control = this.entityForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  /**
   * Checks if a field is invalid and should show error
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.entityForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Gets error message for a specific field
   */
  getFieldError(fieldName: string): string {
    const field = this.entityForm.get(fieldName);
    if (!field || !field.errors) {
      return '';
    }

    // Check custom error messages first
    if (this.config.customValidation?.errorMessages) {
      const customMessage = this.config.customValidation.errorMessages[fieldName];
      if (customMessage) {
        return customMessage;
      }
    }

    // Standard error messages
    const errors = field.errors;
    if (errors['required']) {
      return 'Campo obrigatório';
    }
    if (errors['email']) {
      return 'Email inválido';
    }
    if (errors['pattern']) {
      return 'Formato inválido';
    }
    if (errors['minlength']) {
      return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['maxlength']) {
      return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors['min']) {
      return `Valor mínimo é ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `Valor máximo é ${errors['max'].max}`;
    }

    return 'Campo inválido';
  }

  /**
   * Gets options for select fields from related data
   */
  getOptionsForField(fieldKey: string): any[] {
    for (const relatedData of this.config.relatedData || []) {
      if (this.relatedDataMap[relatedData.propertyName]) {
        return this.relatedDataMap[relatedData.propertyName].map((item: any) => ({
          value: item.id || item,
          label: item.nome || item.name || item.toString()
        }));
      }
    }
    return [];
  }

  /**
   * Utility method for formatting CPF
   */
  protected formatCPF(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    event.target.value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    this.entityForm.get('cpf')?.setValue(value);
  }

  /**
   * Utility method for formatting phone
   */
  protected formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    if (value.length <= 10) {
      event.target.value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      event.target.value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    this.entityForm.get('telefone')?.setValue(value);
  }

  /**
   * Utility method for formatting currency values
   */
  protected formatCurrency(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    value = (parseInt(value) / 100).toFixed(2);
    this.entityForm.get(event.target.name)?.setValue(parseFloat(value));
  }
}