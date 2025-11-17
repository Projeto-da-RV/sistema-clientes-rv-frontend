import { Component, OnInit, AfterViewInit, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Categoria } from '../../../models/categoria.model';
import { CategoriaService } from '../../../services/categoria.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './categoria-form.component.html',
  styleUrl: './categoria-form.component.scss',
  changeDetection: ChangeDetectionStrategy.Default // Força estratégia padrão
})
export class CategoriaFormComponent implements OnInit, AfterViewInit {
  
  categoriaForm!: FormGroup;
  loading = false;
  isEdicao = false;
  categoria: Categoria | null = null;
  categoriaId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone // Adiciona NgZone para forçar detecção
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.categoriaId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdicao = !!this.categoriaId && !isNaN(this.categoriaId);

    if (this.isEdicao) {
      this.carregarCategoria();
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
      ease: 'power3.out',
      clearProps: 'all' // ✓ Limpa props inline após animação
    });

    // 2. Animação de entrada do breadcrumb
    gsap.from(nativeElement.querySelector('.breadcrumb'), {
      opacity: 0,
      x: -20,
      duration: 0.5,
      delay: 0.2,
      ease: 'power2.out',
      clearProps: 'all' // ✓ Limpa props inline após animação
    });

    // 3. Animação sequencial dos form cards (stagger)
    const formCards = nativeElement.querySelectorAll('.form-card, .metadata-card');
    gsap.from(formCards, {
      opacity: 0,
      y: 40,
      duration: 0.7,
      stagger: 0.15,
      delay: 0.3,
      ease: 'power3.out',
      clearProps: 'all' // ✓ Limpa props inline após animação
    });

    // 4. Animação dos campos dentro de cada card (stagger)
    const formGroups = nativeElement.querySelectorAll('.form-group');
    gsap.from(formGroups, {
      opacity: 0,
      x: -20,
      duration: 0.5,
      stagger: 0.08,
      delay: 0.6,
      ease: 'power2.out',
      clearProps: 'all' // ✓ Limpa props inline após animação
    });

    // 5. Animação dos botões de ação
    gsap.from(nativeElement.querySelector('.form-actions'), {
      opacity: 0,
      y: 30,
      duration: 0.6,
      delay: 0.8,
      ease: 'power3.out',
      clearProps: 'all' // ✓ Limpa props inline após animação
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
    this.categoriaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descricao: ['', [Validators.required, Validators.maxLength(500)]],
      beneficios: ['', [Validators.maxLength(300)]],
      ativo: [true]
    });
  }

  private carregarCategoria(): void {
    if (!this.categoriaId) return;

    this.loading = true;
    
    this.categoriaService.buscarPorId(this.categoriaId).subscribe({
      next: (categoria) => {
        // Força execução dentro da zona do Angular
        this.ngZone.run(() => {
          this.categoria = categoria;
          this.preencherFormulario(categoria);
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Erro ao carregar categoria:', error);
        this.ngZone.run(() => {
          this.notificationService.showError('Erro ao carregar categoria');
          this.loading = false;
          this.voltar();
        });
      }
    });
  }

  private preencherFormulario(categoria: Categoria): void {
    this.categoriaForm.patchValue({
      nome: categoria.nome,
      descricao: categoria.descricao,
      beneficios: categoria.beneficios || '',
      ativo: categoria.ativo
    });
  }

  onSubmit(): void {
    if (this.categoriaForm.invalid) {
      this.markAllFieldsAsTouched();
      this.notificationService.showError('Por favor, corrija os erros no formulário');

      // Animar campos com erro
      Object.keys(this.categoriaForm.controls).forEach(key => {
        const control = this.categoriaForm.get(key);
        if (control && control.invalid && (control.dirty || control.touched)) {
          this.animateError(key);
        }
      });

      return;
    }

    this.loading = true;
    const categoriaData = this.prepareCategoriaData();

    const operation = this.isEdicao
      ? this.categoriaService.atualizar(this.categoriaId!, categoriaData)
      : this.categoriaService.criar(categoriaData);

    operation.subscribe({
      next: (resultado) => {
        const mensagem = this.isEdicao
          ? 'Categoria atualizada com sucesso!'
          : 'Categoria cadastrada com sucesso!';

        this.notificationService.showSuccess(mensagem);
        this.loading = false;

        // Animação de sucesso antes de voltar
        this.animateSuccess(() => {
          this.voltar();
        });
      },
      error: (error) => {
        console.error('Erro ao salvar categoria:', error);
        const mensagem = this.isEdicao
          ? 'Erro ao atualizar categoria'
          : 'Erro ao cadastrar categoria';

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

  private prepareCategoriaData(): Categoria {
    const formValue = this.categoriaForm.value;
    
    const categoria: Categoria = {
      nome: formValue.nome.trim(),
      descricao: formValue.descricao.trim(),
      beneficios: formValue.beneficios ? formValue.beneficios.trim() : undefined,
      ativo: formValue.ativo
    };

    if (this.isEdicao && this.categoriaId) {
      categoria.id = this.categoriaId;
    }

    return categoria;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.categoriaForm.controls).forEach(key => {
      const control = this.categoriaForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoriaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Método para debug - verificar estado do formulário
  debugFormulario(): void {
    console.log('=== DEBUG FORMULÁRIO ===');
    console.log('Formulário válido:', this.categoriaForm.valid);
    console.log('Formulário inválido:', this.categoriaForm.invalid);
    console.log('Loading:', this.loading);
    console.log('Errors:', this.categoriaForm.errors);
    
    // Verificar cada campo
    Object.keys(this.categoriaForm.controls).forEach(key => {
      const control = this.categoriaForm.get(key);
      if (control && control.invalid) {
        console.log(`Campo ${key} inválido:`, control.errors);
      }
    });
    console.log('========================');
  }

  voltar(): void {
    this.router.navigate(['/categorias']);
  }
}
