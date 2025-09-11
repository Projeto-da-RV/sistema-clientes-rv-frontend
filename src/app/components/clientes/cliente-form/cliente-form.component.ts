import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, UserPlus, Mail, Phone, CalendarDays, User, Save, X } from 'lucide-angular';
import { BaseCrudFormComponent } from '../../../shared/components/base-crud-form.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { Cliente } from '../../../models/cliente.model';
import { ClienteService } from '../../../services/cliente.service';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria.model';
import { FormConfig, FormFieldType, CrudFormService } from '../../../shared/interfaces/form-config.interface';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.scss'
})
export class ClienteFormComponent extends BaseCrudFormComponent<Cliente> implements OnInit {
  
  // Required implementation of abstract config property
  protected config: FormConfig<Cliente> = {
    entityName: 'Cliente',
    entityNamePlural: 'Clientes',
    baseRoute: '/clientes',
    fields: [
      {
        key: 'nome',
        label: 'Nome Completo',
        type: FormFieldType.TEXT,
        required: true,
        placeholder: 'Digite o nome completo',
        validators: [Validators.required, Validators.minLength(3)]
      },
      {
        key: 'cpf',
        label: 'CPF',
        type: FormFieldType.CPF,
        required: true,
        validators: [Validators.required, Validators.pattern(/^\d{11}$/)]
      },
      {
        key: 'email',
        label: 'E-mail',
        type: FormFieldType.EMAIL,
        placeholder: 'usuario@exemplo.com',
        validators: [Validators.email]
      },
      {
        key: 'telefone',
        label: 'Telefone',
        type: FormFieldType.PHONE,
        placeholder: '(00) 00000-0000'
      },
      {
        key: 'dataNascimento',
        label: 'Data de Nascimento',
        type: FormFieldType.DATE,
        required: true,
        validators: [Validators.required]
      },
      {
        key: 'categoria',
        label: 'Categoria',
        type: FormFieldType.SELECT,
        placeholder: 'Selecione uma categoria'
      },
      {
        key: 'ativo',
        label: 'Cliente Ativo',
        type: FormFieldType.CHECKBOX,
        defaultValue: true
      }
    ],
    relatedData: [
      {
        propertyName: 'categorias',
        loadFunction: () => this.categoriaService.buscarAtivas(),
        loadOnInit: true
      }
    ],
    createTitle: 'Novo Cliente',
    editTitle: 'Editar Cliente',
    customValidation: {
      errorMessages: {
        'cpf': 'CPF deve ter 11 dígitos numéricos'
      }
    }
  };

  // Legacy properties for template compatibility
  categorias: Categoria[] = [];
  get clienteForm() { return this.entityForm; }
  get clienteId() { return this.entityId; }

  constructor(
    private clienteService: ClienteService,
    private categoriaService: CategoriaService,
    fb: FormBuilder,
    router: Router,
    route: ActivatedRoute,
    cdr: ChangeDetectorRef,
    notificationService: NotificationService
  ) {
    super(fb, router, route, cdr, notificationService);
  }

  protected get entityService(): CrudFormService<Cliente> {
    return this.clienteService;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    // Load categories to keep template compatibility
    this.loadCategorias();
  }

  // Keep this method for template compatibility  
  private loadCategorias(): void {
    // This component extends BaseCrudFormComponent which already handles subscription management
    // The subscription is handled by the base component's destroy$ pattern
    this.categoriaService.buscarAtivas().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erro ao carregar categorias', error);
      }
    });
  }

  // Legacy method for template compatibility
  formatarCPF(event: any): void {
    this.formatCPF(event);
  }
}