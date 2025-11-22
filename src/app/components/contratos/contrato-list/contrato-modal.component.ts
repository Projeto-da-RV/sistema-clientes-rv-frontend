import { Component, EventEmitter, Input, Output, OnChanges, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Contrato } from '../../../models/contrato.model';
import { Cliente } from '../../../models/cliente.model';

@Component({
  selector: 'app-contrato-modal',
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

        <!-- Cliente -->
        <div class="form-field">
          <label class="form-label">
            Cliente <span class="text-danger">*</span>
          </label>
          <select
            formControlName="clienteId"
            class="form-select"
            [class.input-error]="form.get('clienteId')?.invalid && form.get('clienteId')?.touched"
          >
            <option value="">Selecione um cliente</option>
            <option *ngFor="let cliente of clientes" [value]="cliente.id">{{ cliente.nome }}</option>
          </select>
          <p *ngIf="form.get('clienteId')?.invalid && form.get('clienteId')?.touched" class="error-message">
            Cliente é obrigatório
          </p>
        </div>

        <!-- Data Início e Data Fim -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <!-- Data Início -->
          <div class="form-field">
            <label class="form-label">
              Data de Início <span class="text-danger">*</span>
            </label>
            <input
              type="date"
              formControlName="dataVencimento"
              class="form-input"
              [class.input-error]="form.get('dataVencimento')?.invalid && form.get('dataVencimento')?.touched"
            />
            <p *ngIf="form.get('dataVencimento')?.invalid && form.get('dataVencimento')?.touched" class="error-message">
              Data de início é obrigatória
            </p>
          </div>

          <!-- Data Fim -->
          <div class="form-field">
            <label class="form-label">
              Data de Término
            </label>
            <input
              type="date"
              formControlName="dataPagamento"
              class="form-input"
            />
          </div>
        </div>

        <!-- Valor e Status -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <!-- Valor Total -->
          <div class="form-field">
            <label class="form-label">
              Valor Total
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
              />
            </div>
          </div>

          <!-- Status -->
          <div class="form-field">
            <label class="form-label">
              Status
            </label>
            <select
              formControlName="status"
              class="form-select"
            >
              <option value="PENDENTE">Pendente</option>
              <option value="ATIVO">Ativo</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>

        <!-- Observações -->
        <div class="form-field">
          <label class="form-label">
            Observações
          </label>
          <textarea
            formControlName="observacoes"
            placeholder="Observações adicionais sobre o contrato"
            rows="3"
            class="form-input resize-none"
          ></textarea>
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
        {{ modo === 'criar' ? 'Cadastrar Contrato' : 'Salvar Alterações' }}
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
export class ContratoModalComponent implements OnChanges, OnDestroy {
  @Input() aberto: boolean = false;
  @Input() contrato: Contrato | null = null;
  @Input() modo: 'criar' | 'editar' = 'criar';
  @Input() clientes: Cliente[] = [];

  @Output() fecharModal = new EventEmitter<void>();
  @Output() salvarContrato = new EventEmitter<Contrato>();

  form: FormGroup;
  carregando: boolean = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      clienteId: ['', [Validators.required]],
      dataVencimento: ['', [Validators.required]],
      dataPagamento: [''],
      valor: [0],
      status: ['PENDENTE'],
      observacoes: ['']
    });
  }

  ngOnChanges(): void {
    if (this.aberto) {
      // Bloquear scroll da página
      document.body.style.overflow = 'hidden';

      if (this.modo === 'editar' && this.contrato) {
        const clienteId = typeof this.contrato.cliente === 'object' && this.contrato.cliente
          ? this.contrato.cliente.id
          : this.contrato.cliente;

        this.form.patchValue({
          clienteId: clienteId,
          dataVencimento: this.contrato.dataVencimento,
          dataPagamento: this.contrato.dataPagamento || '',
          valor: this.contrato.valor || 0,
          status: this.contrato.status || 'PENDENTE',
          observacoes: this.contrato.observacoes || ''
        });
      } else {
        this.form.reset({ valor: 0, status: 'PENDENTE', clienteId: '', dataVencimento: '', dataPagamento: '', observacoes: '' });
      }
      // Resetar estado de carregamento
      this.carregando = false;
    } else {
      // Restaurar scroll da página e resetar estado
      document.body.style.overflow = '';
      this.carregando = false;
      this.form.reset({ valor: 0, status: 'PENDENTE', clienteId: '', dataVencimento: '', dataPagamento: '', observacoes: '' });
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
    return this.modo === 'criar' ? 'Novo Contrato' : 'Editar Contrato';
  }

  get descricao(): string {
    return this.modo === 'criar'
      ? 'Preencha os dados para cadastrar um novo contrato.'
      : 'Atualize as informações do contrato.';
  }

  fechar(): void {
    document.body.style.overflow = '';
    this.fecharModal.emit();
  }

  salvar(): void {
    if (this.form.valid) {
      this.carregando = true;
      const dados: Contrato = {
        ...(this.contrato?.id ? { id: this.contrato.id } : {}),
        descricao: this.form.value.descricao || this.contrato?.descricao || 'Conta',
        dataVencimento: this.form.value.dataVencimento,
        dataPagamento: this.form.value.dataPagamento || undefined,
        valor: this.form.value.valor || undefined,
        status: this.form.value.status,
        categoria: this.form.value.categoria || this.contrato?.categoria || 'ENERGIA',
        observacoes: this.form.value.observacoes || undefined,
        cliente: { id: Number(this.form.value.clienteId) }
      };
      this.salvarContrato.emit(dados);
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
