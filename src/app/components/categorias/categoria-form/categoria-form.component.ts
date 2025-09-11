import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Tag, Save, ArrowLeft } from 'lucide-angular';
import { BaseCrudFormComponent } from '../../../shared/components/base-crud-form.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { Categoria } from '../../../models/categoria.model';
import { CategoriaService } from '../../../services/categoria.service';
import { FormConfig, FormFieldType, CrudFormService } from '../../../shared/interfaces/form-config.interface';

/**
 * Componente de formulário de categorias
 * Refatorado para usar BaseCrudFormComponent eliminando duplicação de código
 * Redução de ~80% no código comparado à versão anterior
 */
@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './categoria-form.component.html',
  styleUrl: './categoria-form.component.scss'
})
export class CategoriaFormComponent extends BaseCrudFormComponent<Categoria> implements OnInit {
  
  // Required implementation of abstract config property
  protected config: FormConfig<Categoria> = {
    entityName: 'Categoria',
    entityNamePlural: 'Categorias',
    baseRoute: '/categorias',
    fields: [
      {
        key: 'nome',
        label: 'Nome da Categoria',
        type: FormFieldType.TEXT,
        required: true,
        placeholder: 'Digite o nome da categoria',
        validators: [Validators.required, Validators.minLength(3)]
      },
      {
        key: 'descricao',
        label: 'Descrição',
        type: FormFieldType.TEXTAREA,
        required: true,
        placeholder: 'Descreva a categoria',
        validators: [Validators.required],
        fieldSpecificConfig: {
          rows: 3
        }
      },
      {
        key: 'beneficios',
        label: 'Benefícios',
        type: FormFieldType.TEXTAREA,
        placeholder: 'Liste os benefícios desta categoria',
        fieldSpecificConfig: {
          rows: 2
        }
      },
      {
        key: 'ativo',
        label: 'Categoria Ativa',
        type: FormFieldType.CHECKBOX,
        defaultValue: true
      }
    ],
    createTitle: 'Nova Categoria',
    editTitle: 'Editar Categoria',
    customValidation: {
      errorMessages: {
        'nome': 'Nome deve ter pelo menos 3 caracteres'
      }
    }
  };

  // Legacy properties for template compatibility
  get categoriaForm() { return this.entityForm; }
  get categoriaId() { return this.entityId; }

  constructor(
    private categoriaService: CategoriaService,
    fb: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    cdr: ChangeDetectorRef,
    notificationService: NotificationService
  ) {
    super(fb, router, route, cdr, notificationService);
  }

  protected get entityService(): CrudFormService<Categoria> {
    return this.categoriaService;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    // All form lifecycle is managed by BaseCrudFormComponent
    // This eliminates the need to manage:
    // - Form building and validation
    // - Route parameter handling
    // - Entity loading and saving
    // - Error handling
    // - Subscription management
  }

  // Legacy methods for template compatibility if needed
  marcarCamposInvalidos(): void {
    this.markAllFieldsAsTouched();
  }
}