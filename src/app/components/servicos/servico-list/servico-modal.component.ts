import { Component, EventEmitter, Input, Output, OnChanges, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Servico } from '../../../models/servico.model';
import { Categoria } from '../../../models/categoria.model';

@Component({
  selector: 'app-servico-modal',
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
    class="relative w-full max-w-2xl rounded-2xl border border-[#3b394e] bg-[#1a1a24] shadow-2xl"
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
    <div class="max-h-[60vh] overflow-y-auto p-6">
      <form [formGroup]="form" class="space-y-5">

        <!-- Nome -->
        <div class="form-field">
          <label class="form-label">
            Nome do Serviço <span class="text-danger">*</span>
          </label>
          <input
            type="text"
            formControlName="nome"
            placeholder="Ex: Corte de Cabelo"
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
            placeholder="Descrição detalhada do serviço"
            rows="3"
            class="form-input resize-none"
            [class.input-error]="form.get('descricao')?.invalid && form.get('descricao')?.touched"
          ></textarea>
          <p *ngIf="form.get('descricao')?.invalid && form.get('descricao')?.touched" class="error-message">
            Descrição é obrigatória
          </p>
        </div>

        <!-- Categoria e Valor -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <!-- Categoria -->
          <div class="form-field">
            <label class="form-label">
              Categoria <span class="text-danger">*</span>
            </label>
            <select
              formControlName="categoria"
              class="form-select"
              [class.input-error]="form.get('categoria')?.invalid && form.get('categoria')?.touched"
            >
              <option value="">Selecione uma categoria</option>
              <option *ngFor="let cat of categorias" [value]="cat.nome">{{ cat.nome }}</option>
            </select>
            <p *ngIf="form.get('categoria')?.invalid && form.get('categoria')?.touched" class="error-message">
              Categoria é obrigatória
            </p>
          </div>

          <!-- Valor -->
          <div class="form-field">
            <label class="form-label">
              Valor <span class="text-danger">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b7b]">R$</span>
              <input
                type="number"
                formControlName="valor"
                placeholder="0,00"
                step="0.01"
                min="0"
                class="form-input pl-12"
                [class.input-error]="form.get('valor')?.invalid && form.get('valor')?.touched"
              />
            </div>
            <p *ngIf="form.get('valor')?.invalid && form.get('valor')?.touched" class="error-message">
              Valor deve ser maior ou igual a zero
            </p>
          </div>
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
        {{ modo === 'criar' ? 'Cadastrar Serviço' : 'Salvar Alterações' }}
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
export class ServicoModalComponent implements OnChanges, OnDestroy {
  @Input() aberto: boolean = false;
  @Input() servico: Servico | null = null;
  @Input() modo: 'criar' | 'editar' = 'criar';
  @Input() categorias: Categoria[] = [];

  @Output() fecharModal = new EventEmitter<void>();
  @Output() salvarServico = new EventEmitter<Servico>();

  form: FormGroup;
  carregando: boolean = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      descricao: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      valor: [0, [Validators.required, Validators.min(0)]],
      ativo: [true, [Validators.required]]
    });
  }

  ngOnChanges(): void {
    if (this.aberto) {
      // Bloquear scroll da página
      document.body.style.overflow = 'hidden';

      if (this.modo === 'editar' && this.servico) {
        this.form.patchValue({
          nome: this.servico.nome,
          descricao: this.servico.descricao,
          categoria: this.servico.tipo,
          valor: this.servico.taxa,
          ativo: this.servico.ativo
        });
      } else {
        this.form.reset({ valor: 0, ativo: true, categoria: '' });
      }
      // Resetar estado de carregamento
      this.carregando = false;
    } else {
      // Restaurar scroll da página e resetar estado
      document.body.style.overflow = '';
      this.carregando = false;
      this.form.reset({ valor: 0, ativo: true, categoria: '' });
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
    return this.modo === 'criar' ? 'Novo Serviço' : 'Editar Serviço';
  }

  get descricao(): string {
    return this.modo === 'criar'
      ? 'Preencha os dados para cadastrar um novo serviço.'
      : 'Atualize as informações do serviço.';
  }

  fechar(): void {
    document.body.style.overflow = '';
    this.fecharModal.emit();
  }

  salvar(): void {
    if (this.form.valid) {
      this.carregando = true;
      const dados: Servico = {
        ...(this.servico?.id ? { id: this.servico.id } : {}),
        ...this.form.value
      };
      this.salvarServico.emit(dados);
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
