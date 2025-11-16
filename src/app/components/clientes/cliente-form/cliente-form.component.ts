import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Cliente } from '../../../models/cliente.model';
import { ClienteService } from '../../../services/cliente.service';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { gsap } from 'gsap';

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
export class ClienteFormComponent implements OnInit, AfterViewInit {

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
    private route: ActivatedRoute,
    private elementRef: ElementRef
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

  ngAfterViewInit(): void {
    // Aguarda um frame para garantir que o DOM está pronto
    setTimeout(() => {
      this.initAnimations();
    }, 50);
  }

  private initAnimations(): void {
    const nativeElement = this.elementRef.nativeElement;

    // 1. Animação de entrada do header
    gsap.from(nativeElement.querySelector('.page-header'), {
      opacity: 0,
      y: -30,
      duration: 0.6,
      ease: 'power3.out'
    });

    // 2. Animação de entrada do breadcrumb
    gsap.from(nativeElement.querySelector('.breadcrumb'), {
      opacity: 0,
      x: -20,
      duration: 0.5,
      delay: 0.2,
      ease: 'power2.out'
    });

    // 3. Animação sequencial dos form cards (stagger)
    const formCards = nativeElement.querySelectorAll('.form-card, .metadata-card');
    gsap.from(formCards, {
      opacity: 0,
      y: 40,
      duration: 0.7,
      stagger: 0.15,
      delay: 0.3,
      ease: 'power3.out'
    });

    // 4. Animação dos campos dentro de cada card (stagger)
    const formGroups = nativeElement.querySelectorAll('.form-group');
    gsap.from(formGroups, {
      opacity: 0,
      x: -20,
      duration: 0.5,
      stagger: 0.08,
      delay: 0.6,
      ease: 'power2.out'
    });

    // 5. Animação dos botões de ação
    gsap.from(nativeElement.querySelector('.form-actions'), {
      opacity: 0,
      y: 30,
      duration: 0.6,
      delay: 0.8,
      ease: 'power3.out'
    });

    // 6. Adicionar listeners para animações de focus
    this.setupInputFocusAnimations(nativeElement);
  }

  private setupInputFocusAnimations(nativeElement: any): void {
    const inputs = nativeElement.querySelectorAll('.form-control');

    inputs.forEach((input: HTMLElement) => {
      // Animação no focus
      input.addEventListener('focus', () => {
        gsap.to(input, {
          scale: 1.01,
          duration: 0.2,
          ease: 'power1.inOut'
        });
      });

      // Reverter animação no blur
      input.addEventListener('blur', () => {
        gsap.to(input, {
          scale: 1,
          duration: 0.2,
          ease: 'power1.inOut'
        });
      });
    });
  }

  private animateError(fieldName: string): void {
    const nativeElement = this.elementRef.nativeElement;
    const field = nativeElement.querySelector(`#${fieldName}`);

    if (field) {
      // Shake animation para campo com erro
      gsap.fromTo(field,
        { x: -10 },
        {
          x: 10,
          repeat: 3,
          yoyo: true,
          duration: 0.1,
          ease: 'power1.inOut',
          onComplete: () => {
            gsap.set(field, { x: 0 });
          }
        }
      );
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

      // Animar campos com erro
      Object.keys(this.clienteForm.controls).forEach(key => {
        const control = this.clienteForm.get(key);
        if (control && control.invalid && (control.dirty || control.touched)) {
          this.animateError(key);
        }
      });

      return;
    }

    // Verificar senhas se não for edição
    if (!this.isEdicao && this.clienteForm.get('senha')?.value !== this.clienteForm.get('confirmarSenha')?.value) {
      this.notificationService.showError('As senhas não conferem');
      this.animateError('senha');
      this.animateError('confirmarSenha');
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

        // Animação de sucesso antes de voltar
        this.animateSuccess(() => {
          this.voltar();
        });
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

  private animateSuccess(callback: () => void): void {
    const nativeElement = this.elementRef.nativeElement;
    const formContainer = nativeElement.querySelector('.form-container');

    if (formContainer) {
      // Fade out suave
      gsap.to(formContainer, {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: callback
      });
    } else {
      callback();
    }
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