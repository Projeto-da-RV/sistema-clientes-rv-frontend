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
    class="modal-card"
    (click)="$event.stopPropagation()"
  >
    <!-- Header -->
    <div class="modal-header">
      <div>
        <h2 class="text-xl font-semibold text-white">{{ titulo }}</h2>
        <p class="modal-description">{{ descricao }}</p>
      </div>
      <button
        (click)="fechar()"
        class="close-button"
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
              <span class="currency-symbol">R$</span>
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
    :host {
      --border-visible: #3b394e;
      --bg-input: #252434;
      --bg-card: #1a1a24;
      --text-placeholder: #6b6b7b;
      --text-muted: #bbb6c6;
      --primary: #565add;
      --primary-hover: #6b6fe8;
      --danger: #ef4444;
    }

    .modal-card {
      position: relative;
      width: 100%;
      max-width: 42rem;
      border-radius: 1rem;
      border: 1px solid var(--border-visible);
      background: var(--bg-card);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-visible);
      padding: 1.5rem;
    }

    .modal-description {
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .close-button {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 2.5rem;
      width: 2.5rem;
      border-radius: 0.5rem;
      color: var(--text-muted);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .close-button:hover {
      background: var(--bg-input);
      color: white;
    }

    .currency-symbol {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-placeholder);
    }

    .form-field {
      @apply flex flex-col gap-2;
    }

    .form-label {
      @apply text-sm font-medium text-white;
    }

    .form-input {
      height: 2.75rem;
      width: 100%;
      border-radius: 0.5rem;
      border: 1px solid var(--border-visible);
      background: var(--bg-input);
      padding: 0 1rem;
      color: white;
      outline: none;
      transition: all 0.2s;
    }

    .form-input::placeholder {
      color: var(--text-placeholder);
    }

    .form-input:focus {
      border-color: var(--primary);
      outline: none;
      box-shadow: 0 0 0 2px rgba(86, 90, 221, 0.2);
    }

    .form-input.input-error {
      border-color: var(--danger);
    }

    .form-select {
      height: 2.75rem;
      width: 100%;
      border-radius: 0.5rem;
      border: 1px solid var(--border-visible);
      background: var(--bg-input);
      padding: 0 1rem;
      color: white;
      outline: none;
    }

    .form-select:focus {
      border-color: var(--primary);
      outline: none;
    }

    .error-message {
      font-size: 0.75rem;
      color: var(--danger);
    }

    .text-danger {
      color: var(--danger);
    }

    .modal-footer {
      @apply flex items-center justify-end gap-3 p-6;
      border-top: 1px solid var(--border-visible);
    }

    .btn-secondary {
      height: 2.75rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border-visible);
      padding: 0 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
      background: transparent;
      transition: all 0.2s;
      cursor: pointer;
    }

    .btn-secondary:hover {
      background: var(--bg-input);
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      height: 2.75rem;
      border-radius: 0.5rem;
      background: var(--primary);
      padding: 0 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
      border: none;
      transition: all 0.2s;
      cursor: pointer;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-hover);
    }

    .btn-primary:disabled {
      cursor: not-allowed;
      opacity: 0.5;
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
