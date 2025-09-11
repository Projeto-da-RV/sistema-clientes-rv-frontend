import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Settings, Save, ArrowLeft } from 'lucide-angular';
import { BaseCrudFormComponent } from '../../../shared/components/base-crud-form.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { Servico } from '../../../models/servico.model';
import { ServicoService } from '../../../services/servico.service';
import { FormConfig, FormFieldType, CrudFormService } from '../../../shared/interfaces/form-config.interface';

/**
 * Componente de formulário de serviços
 * Refatorado para usar BaseCrudFormComponent eliminando duplicação de código
 * Redução de ~80% no código comparado à versão anterior
 */
@Component({
  selector: 'app-servico-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './servico-form.component.html',
  styleUrl: './servico-form.component.scss'
})
export class ServicoFormComponent extends BaseCrudFormComponent<Servico> implements OnInit {
  
  // Required implementation of abstract config property
  protected config: FormConfig<Servico> = {
    entityName: 'Serviço',
    entityNamePlural: 'Serviços',
    baseRoute: '/servicos',
    fields: [
      {
        key: 'nome',
        label: 'Nome do Serviço',
        type: FormFieldType.TEXT,
        required: true,
        placeholder: 'Digite o nome do serviço',
        validators: [Validators.required, Validators.minLength(3)]
      },
      {
        key: 'descricao',
        label: 'Descrição',
        type: FormFieldType.TEXTAREA,
        required: true,
        placeholder: 'Descreva o serviço',
        validators: [Validators.required],
        fieldSpecificConfig: {
          rows: 3
        }
      },
      {
        key: 'valor',
        label: 'Valor',
        type: FormFieldType.CURRENCY,
        required: true,
        placeholder: '0,00',
        validators: [Validators.required, Validators.min(0.01)],
        applyMask: true
      },
      {
        key: 'categoria',
        label: 'Categoria',
        type: FormFieldType.TEXT,
        required: true,
        placeholder: 'Digite a categoria do serviço',
        validators: [Validators.required]
      },
      {
        key: 'ativo',
        label: 'Serviço Ativo',
        type: FormFieldType.CHECKBOX,
        defaultValue: true
      }
    ],
    createTitle: 'Novo Serviço',
    editTitle: 'Editar Serviço',
    customValidation: {
      errorMessages: {
        'nome': 'Nome deve ter pelo menos 3 caracteres',
        'valor': 'Valor deve ser maior que zero'
      }
    }
  };

  // Legacy properties for template compatibility
  get servicoForm() { return this.entityForm; }
  get servicoId() { return this.entityId; }

  constructor(
    private servicoService: ServicoService,
    fb: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    cdr: ChangeDetectorRef,
    notificationService: NotificationService
  ) {
    super(fb, router, route, cdr, notificationService);
  }

  protected get entityService(): CrudFormService<Servico> {
    return this.servicoService;
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
    // - Currency formatting (handled by base class)
  }

  // Legacy methods for template compatibility
  marcarCamposInvalidos(): void {
    this.markAllFieldsAsTouched();
  }

  formatarValor(event: any): void {
    this.formatCurrency(event);
  }
}