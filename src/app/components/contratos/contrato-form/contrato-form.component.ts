import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, FileText, Save, ArrowLeft } from 'lucide-angular';
import { BaseCrudFormComponent } from '../../../shared/components/base-crud-form.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { Contrato } from '../../../models/contrato.model';
import { ContratoService } from '../../../services/contrato.service';
import { ClienteService } from '../../../services/cliente.service';
import { FormConfig, FormFieldType, CrudFormService } from '../../../shared/interfaces/form-config.interface';

/**
 * Componente de formulário de contratos
 * Refatorado para usar BaseCrudFormComponent eliminando duplicação de código
 * Redução de ~80% no código comparado à versão anterior
 */
@Component({
  selector: 'app-contrato-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './contrato-form.component.html',
  styleUrl: './contrato-form.component.scss'
})
export class ContratoFormComponent extends BaseCrudFormComponent<Contrato> implements OnInit {
  
  // Required implementation of abstract config property
  protected config: FormConfig<Contrato> = {
    entityName: 'Contrato',
    entityNamePlural: 'Contratos',
    baseRoute: '/contratos',
    fields: [
      {
        key: 'cliente',
        label: 'Cliente',
        type: FormFieldType.SELECT,
        required: true,
        validators: [Validators.required]
      },
      {
        key: 'dataInicio',
        label: 'Data de Início',
        type: FormFieldType.DATE,
        required: true,
        validators: [Validators.required]
      },
      {
        key: 'dataFim',
        label: 'Data de Fim',
        type: FormFieldType.DATE
      },
      {
        key: 'status',
        label: 'Status',
        type: FormFieldType.SELECT,
        defaultValue: 'PENDENTE',
        options: [
          { value: 'PENDENTE', label: 'Pendente' },
          { value: 'ATIVO', label: 'Ativo' },
          { value: 'CONCLUIDO', label: 'Concluído' },
          { value: 'CANCELADO', label: 'Cancelado' }
        ]
      },
      {
        key: 'observacoes',
        label: 'Observações',
        type: FormFieldType.TEXTAREA,
        placeholder: 'Digite suas observações',
        fieldSpecificConfig: {
          rows: 3
        }
      }
    ],
    relatedData: [
      {
        propertyName: 'clientes',
        loadFunction: () => this.clienteService.listarTodos(),
        loadOnInit: true
      }
    ],
    beforeSave: (formValue, isEditMode) => {
      return {
        ...formValue,
        cliente: { id: formValue.cliente.id || formValue.cliente }
      };
    },
    createTitle: 'Novo Contrato',
    editTitle: 'Editar Contrato'
  };

  // Legacy properties for template compatibility
  clientes: any[] = [];
  get contratoForm() { return this.entityForm; }
  get contratoId() { return this.entityId; }

  constructor(
    private contratoService: ContratoService,
    private clienteService: ClienteService,
    fb: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    cdr: ChangeDetectorRef,
    notificationService: NotificationService
  ) {
    super(fb, router, route, cdr, notificationService);
  }

  protected get entityService(): CrudFormService<Contrato> {
    return this.contratoService;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    // Load clientes for template compatibility
    this.loadClientes();
  }

  private loadClientes(): void {
    this.clienteService.listarTodos().subscribe({
      next: (data) => {
        this.clientes = data;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erro ao carregar clientes', error);
      }
    });
  }

  // Legacy methods for template compatibility
  marcarCamposInvalidos(): void {
    this.markAllFieldsAsTouched();
  }
}