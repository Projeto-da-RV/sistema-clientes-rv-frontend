import { Component, EventEmitter, Input, Output, OnChanges, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Categoria } from '../../../models/categoria.model';

@Component({
  selector: 'app-categoria-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<!-- Overlay -->
<div
  *ngIf="aberto"
  (click)="onOverlayClick($event)"
  class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
>
  <!-- Modal Card -->
  <div
    class="relative w-full max-w-xl rounded-2xl border border-[#3b394e] bg-[#1a1a24] shadow-2xl"
    (click)="$event.stopPropagation()"
  >
    <!-- Header -->
    <div class="flex items-start justify-between border-b border-[#3b394e] p-6">
      <div>
        <h2 class="text-xl font-semibold text-white">{{ titulo }}</h2>
        <p class="mt-1 text-sm text-[#bbb6c6]">{{ descricao }}</p>
      </div>
      <button
        (click)="fechar()"
        class="flex h-10 w-10 items-center justify-center rounded-lg text-[#bbb6c6] transition-colors hover:bg-[#252434] hover:text-white"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Body -->
    <div class="p-6">
      <form [formGroup]="form" class="space-y-5">

        <!-- Nome -->
        <div class="form-field">
          <label class="form-label">
            Nome <span class="text-danger">*</span>
          </label>
          <input
            type="text"
            formControlName="nome"
            placeholder="Nome da categoria"
            class="form-input"
            [class.input-error]="form.get('nome')?.invalid && form.get('nome')?.touched"
          />
          <p *ngIf="form.get('nome')?.invalid && form.get('nome')?.touched" class="error-message">
            Nome é obrigatório (mínimo 2 caracteres)
          </p>
        </div>

        <!-- Descrição -->
        <div class="form-field">
          <label class="form-label">
            Descrição <span class="text-danger">*</span>
          </label>
          <textarea
            formControlName="descricao"
            placeholder="Descrição da categoria"
            rows="3"
            class="form-input resize-none"
            [class.input-error]="form.get('descricao')?.invalid && form.get('descricao')?.touched"
          ></textarea>
          <p *ngIf="form.get('descricao')?.invalid && form.get('descricao')?.touched" class="error-message">
            Descrição é obrigatória
          </p>
        </div>

        <!-- Benefícios -->
        <div class="form-field">
          <label class="form-label">
            Benefícios
          </label>
          <textarea
            formControlName="beneficios"
            placeholder="Benefícios desta categoria (opcional)"
            rows="2"
            class="form-input resize-none"
          ></textarea>
        </div>

        <!-- Status -->
        <div class="form-field">
          <label class="form-label">
            Status <span class="text-danger">*</span>
          </label>
          <select
            formControlName="ativo"
            class="form-select"
          >
            <option [value]="true">Ativo</option>
            <option [value]="false">Inativo</option>
          </select>
        </div>

      </form>
    </div>

    <!-- Footer -->
    <div class="modal-footer">
      <button
        (click)="fechar()"
        class="btn-secondary"
      >
        Cancelar
      </button>
      <button
        (click)="salvar()"
        [disabled]="carregando || form.invalid"
        class="btn-primary"
      >
        <svg *ngIf="carregando" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        {{ modo === 'criar' ? 'Cadastrar Categoria' : 'Salvar Alterações' }}
      </button>
    </div>
  </div>
</div>
  `,
  styles: [`
    .form-field {
      @apply flex flex-col gap-2;
    }

    .form-label {
      @apply text-sm font-medium text-white;
    }

    .form-input {
      @apply h-11 w-full rounded-lg border border-[#3b394e] bg-[#252434] px-4 text-white placeholder:text-[#6b6b7b] focus:border-[#565add] focus:outline-none focus:ring-2 focus:ring-[#565add]/20;
    }

    .form-input.input-error {
      @apply border-[#ef4444];
    }

    .form-select {
      @apply h-11 w-full rounded-lg border border-[#3b394e] bg-[#252434] px-4 text-white focus:border-[#565add] focus:outline-none;
    }

    .error-message {
      @apply text-xs text-[#ef4444];
    }

    .text-danger {
      @apply text-[#ef4444];
    }

    .modal-footer {
      @apply flex items-center justify-end gap-3 border-t border-[#3b394e] p-6;
    }

    .btn-secondary {
      @apply h-11 rounded-lg border border-[#3b394e] px-6 text-sm font-medium text-white transition hover:bg-[#252434];
    }

    .btn-primary {
      @apply flex h-11 items-center gap-2 rounded-lg bg-[#565add] px-6 text-sm font-medium text-white transition hover:bg-[#6b6fe8] disabled:cursor-not-allowed disabled:opacity-50;
    }
  `]
})
export class CategoriaModalComponent implements OnChanges, OnDestroy {
  @Input() aberto: boolean = false;
  @Input() categoria: Categoria | null = null;
  @Input() modo: 'criar' | 'editar' = 'criar';

  @Output() fecharModal = new EventEmitter<void>();
  @Output() salvarCategoria = new EventEmitter<Categoria>();

  form: FormGroup;
  carregando: boolean = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      descricao: ['', [Validators.required]],
      beneficios: [''],
      ativo: [true, [Validators.required]]
    });
  }

  ngOnChanges(): void {
    if (this.aberto) {
      // Bloquear scroll da página
      document.body.style.overflow = 'hidden';

      if (this.modo === 'editar' && this.categoria) {
        this.form.patchValue({
          nome: this.categoria.nome,
          descricao: this.categoria.descricao,
          beneficios: this.categoria.beneficios || '',
          ativo: this.categoria.ativo
        });
      } else {
        this.form.reset({ ativo: true, beneficios: '' });
      }
      // Resetar estado de carregamento
      this.carregando = false;
    } else {
      // Restaurar scroll da página e resetar estado
      document.body.style.overflow = '';
      this.carregando = false;
      this.form.reset({ ativo: true, beneficios: '' });
    }
  }

  ngOnDestroy(): void {
    // Garantir que o scroll seja restaurado
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscPress(): void {
    if (this.aberto) this.fechar();
  }

  get titulo(): string {
    return this.modo === 'criar' ? 'Nova Categoria' : 'Editar Categoria';
  }

  get descricao(): string {
    return this.modo === 'criar'
      ? 'Preencha os dados para criar uma nova categoria.'
      : 'Atualize as informações da categoria.';
  }

  fechar(): void {
    document.body.style.overflow = '';
    this.fecharModal.emit();
  }

  salvar(): void {
    if (this.form.valid) {
      this.carregando = true;
      const dados: Categoria = {
        ...(this.categoria?.id ? { id: this.categoria.id } : {}),
        ...this.form.value
      };
      this.salvarCategoria.emit(dados);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.fechar();
    }
  }
}
