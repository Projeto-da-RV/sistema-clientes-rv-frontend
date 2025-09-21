import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Cliente } from '../../../models/cliente.model';
import { ClienteService } from '../../../services/cliente.service';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.scss'
})
export class ClienteFormComponent implements OnInit {
  
  clienteForm!: FormGroup;
  loading = false;
  isEdicao = false;
  cliente: Cliente | null = null;
  clienteId: number | null = null;
  mostrarCamposSenha = false;
  categorias: Categoria[] = [];

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private categoriaService: CategoriaService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.clienteId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdicao = !!this.clienteId && !isNaN(this.clienteId);

    this.carregarCategorias();
    
    if (this.isEdicao) {
      this.carregarCliente();
    }
  }

  private initializeForm(): void {
    this.clienteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/)]],
      email: ['', [Validators.email]],
      telefone: [''],
      dataNascimento: ['', [Validators.required]],
      senha: [''],
      confirmarSenha: [''],
      categoria: [''],
      ativo: [true]
    });

    // Adicionar validações condicionais para senha apenas se não for edição
    if (!this.isEdicao) {
      this.clienteForm.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.clienteForm.get('confirmarSenha')?.setValidators([Validators.required]);
    }
  }

  private carregarCategorias(): void {
    this.categoriaService.listarTodos().subscribe({
      next: (categorias) => {
        this.categorias = categorias.filter(cat => cat.ativo);
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
      }
    });
  }

  private carregarCliente(): void {
    if (!this.clienteId) return;

    this.loading = true;
    this.clienteService.buscarPorId(this.clienteId).subscribe({
      next: (cliente) => {
        this.cliente = cliente;
        this.preencherFormulario(cliente);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cliente:', error);
        this.notificationService.showError('Erro ao carregar cliente');
        this.loading = false;
        this.voltar();
      }
    });
  }

  private preencherFormulario(cliente: Cliente): void {
    this.clienteForm.patchValue({
      nome: cliente.nome,
      cpf: cliente.cpf,
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      dataNascimento: cliente.dataNascimento,
      categoria: cliente.categoria?.id || '',
      ativo: cliente.ativo
    });
  }

  onSubmit(): void {
    if (this.clienteForm.invalid) {
      this.markAllFieldsAsTouched();
      this.notificationService.showError('Por favor, corrija os erros no formulário');
      return;
    }

    // Verificar senhas se não for edição
    if (!this.isEdicao && this.clienteForm.get('senha')?.value !== this.clienteForm.get('confirmarSenha')?.value) {
      this.notificationService.showError('As senhas não conferem');
      return;
    }

    this.loading = true;
    const clienteData = this.prepareClienteData();

    const operation = this.isEdicao 
      ? this.clienteService.atualizar(this.clienteId!, clienteData)
      : this.clienteService.criar(clienteData);

    operation.subscribe({
      next: (resultado) => {
        const mensagem = this.isEdicao 
          ? 'Cliente atualizado com sucesso!' 
          : 'Cliente cadastrado com sucesso!';
        
        this.notificationService.showSuccess(mensagem);
        this.loading = false;
        this.voltar();
      },
      error: (error) => {
        console.error('Erro ao salvar cliente:', error);
        const mensagem = this.isEdicao 
          ? 'Erro ao atualizar cliente' 
          : 'Erro ao cadastrar cliente';
        
        this.notificationService.showError(mensagem);
        this.loading = false;
      }
    });
  }

  private prepareClienteData(): Cliente {
    const formValue = this.clienteForm.value;
    
    const cliente: Cliente = {
      nome: formValue.nome.trim(),
      cpf: formValue.cpf,
      email: formValue.email ? formValue.email.trim() : undefined,
      telefone: formValue.telefone || undefined,
      dataNascimento: formValue.dataNascimento,
      ativo: formValue.ativo
    };

    // Adicionar senha apenas se não for edição ou se senha foi preenchida
    if (!this.isEdicao && formValue.senha) {
      cliente.senha = formValue.senha;
    }

    // Adicionar categoria se selecionada
    if (formValue.categoria) {
      const categoriaEncontrada = this.categorias.find(cat => cat.id === formValue.categoria);
      if (categoriaEncontrada) {
        cliente.categoria = categoriaEncontrada;
      }
    }

    if (this.isEdicao && this.clienteId) {
      cliente.id = this.clienteId;
    }

    return cliente;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.clienteForm.controls).forEach(key => {
      const control = this.clienteForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.clienteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Método para debug - verificar estado do formulário
  debugFormulario(): void {
    console.log('=== DEBUG FORMULÁRIO ===');
    console.log('Formulário válido:', this.clienteForm.valid);
    console.log('Formulário inválido:', this.clienteForm.invalid);
    console.log('Loading:', this.loading);
    console.log('Errors:', this.clienteForm.errors);
    
    // Verificar cada campo
    Object.keys(this.clienteForm.controls).forEach(key => {
      const control = this.clienteForm.get(key);
      if (control && control.invalid) {
        console.log(`Campo ${key} inválido:`, control.errors);
      }
    });
    console.log('========================');
  }

  voltar(): void {
    this.router.navigate(['/clientes']);
  }
}