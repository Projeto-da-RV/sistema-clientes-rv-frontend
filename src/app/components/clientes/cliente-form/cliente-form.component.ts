import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, UserPlus, Mail, Phone, CalendarDays, User, Save, X, Lock } from 'lucide-angular';
import { BaseCrudFormComponent } from '../../../shared/components/base-crud-form.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { Cliente } from '../../../models/cliente.model';
import { ClienteService } from '../../../services/cliente.service';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria.model';
import { FormConfig, FormFieldType, CrudFormService } from '../../../shared/interfaces/form-config.interface';

// Validador customizado para confirmar senha
function confirmPasswordValidator(control: AbstractControl) {
  const senha = control.get('senha');
  const confirmarSenha = control.get('confirmarSenha');
  
  if (senha && confirmarSenha && senha.value !== confirmarSenha.value) {
    confirmarSenha.setErrors({ senhasDiferentes: true });
  } else if (confirmarSenha && confirmarSenha.hasError('senhasDiferentes')) {
    confirmarSenha.setErrors(null);
  }
  
  return null;
}

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
  validators: [
    Validators.required, 
    Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/) // ✅ Aceitar CPF com ou sem formatação
  ]
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
        key: 'senha',
        label: 'Senha',
        type: FormFieldType.PASSWORD,
        required: true,
        validators: [Validators.required, Validators.minLength(6)]
      },
      {
        key: 'confirmarSenha',
        label: 'Confirmar Senha',
        type: FormFieldType.PASSWORD,
        required: true,
        validators: [Validators.required]
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
        'cpf': 'CPF deve ter 11 dígitos numéricos',
        'senha': 'Senha deve ter no mínimo 6 caracteres',
        'confirmarSenha': 'Senhas não conferem'
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
    this.loadCategorias();
    this.setupFormValidation();
  }

  protected override buildForm(): void {
    super.buildForm();
    
    // Adicionar validador customizado para confirmar senha apenas em modo criação
    if (!this.isEditMode) {
      this.entityForm.addValidators(confirmPasswordValidator);
    } else {
      // Em modo edição, remover campos de senha
      this.entityForm.removeControl('senha');
      this.entityForm.removeControl('confirmarSenha');
    }
  }

  private setupFormValidation(): void {
    // Validação em tempo real para confirmação de senha
    if (!this.isEditMode) {
      this.entityForm.get('confirmarSenha')?.valueChanges.subscribe(() => {
        this.entityForm.updateValueAndValidity();
      });
    }
  }

  protected override saveEntity(): void {
    this.loading = true;
    this.cdr.markForCheck();

    let formValue = this.entityForm.value;
    
    // Preparar dados para envio
    if (!this.isEditMode) {
      // Em modo criação, incluir senha mas remover confirmação
      const { confirmarSenha, ...clienteData } = formValue;
      formValue = clienteData;
    }
    
    // Processar categoria se selecionada
    if (formValue.categoria && typeof formValue.categoria === 'object') {
      formValue.categoria = { id: formValue.categoria.id };
    }

    const request = this.isEditMode && this.entityId
      ? this.entityService.atualizar(this.entityId, formValue)
      : this.entityService.criar(formValue);

    request.subscribe({
      next: (entity) => {
        this.loading = false;
        const message = `${this.config.entityName} ${this.isEditMode ? 'atualizado' : 'cadastrado'} com sucesso`;
        
        this.notificationService.success(message).then(() => {
          this.navigateToList();
        });
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error(
          error.message || `Erro ao salvar ${this.config.entityName.toLowerCase()}`
        );
        this.cdr.markForCheck();
      }
    });
  }

  override getFieldError(fieldName: string): string {
    const field = this.entityForm.get(fieldName);
    if (!field || !field.errors) {
      return '';
    }

    const errors = field.errors;
    
    // Erro específico para confirmação de senha
    if (fieldName === 'confirmarSenha' && errors['senhasDiferentes']) {
      return 'As senhas não conferem';
    }

    // Outros erros padrão
    return super.getFieldError(fieldName);
  }

  // Keep this method for template compatibility  
  private loadCategorias(): void {
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