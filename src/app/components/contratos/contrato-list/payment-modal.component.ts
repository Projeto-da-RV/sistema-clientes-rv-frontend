import { Component, EventEmitter, Input, Output, OnChanges, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Contrato } from '../../../models/contrato.model';
import { Servico } from '../../../models/servico.model';
import { MetodoPagamento } from '../../../models/metodo-pagamento.model';
import { ServicoService } from '../../../services/servico.service';

@Component({
  selector: 'app-payment-modal',
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
        <h2 class="text-xl font-semibold text-white">💳 Pagar Conta</h2>
        <p class="modal-description">
          {{ contrato?.descricao || 'Conta' }} • {{ formatarValor(contrato?.valor) }}
        </p>
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
    <div class="modal-body">
      <!-- Loading State -->
      <div *ngIf="loadingServicos" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="text-muted">Carregando formas de pagamento...</p>
      </div>

      <!-- Payment Form -->
      <form *ngIf="!loadingServicos" [formGroup]="form" class="space-y-5">

        <!-- Valor da Conta -->
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Valor da conta:</span>
            <span class="info-value">{{ formatarValor(contrato?.valor) }}</span>
          </div>
        </div>

        <!-- Escolha da Forma de Pagamento -->
        <div class="form-field">
          <label class="form-label">
            Escolha a forma de pagamento <span class="text-danger">*</span>
          </label>

          <div class="payment-methods">
            <label
              *ngFor="let servico of servicos"
              class="payment-method"
              [class.selected]="form.get('servicoId')?.value === servico.id"
            >
              <input
                type="radio"
                [value]="servico.id"
                formControlName="servicoId"
                class="radio-input"
              />
              <div class="payment-method-content">
                <div class="payment-method-header">
                  <span class="payment-method-icon">{{ getServicoIcon(servico.tipo) }}</span>
                  <div class="payment-method-info">
                    <span class="payment-method-name">{{ servico.nome }}</span>
                    <span class="payment-method-time">{{ servico.tempoProcessamento }}</span>
                  </div>
                </div>
                <span class="payment-method-tax">
                  Taxa: {{ formatarValor(servico.taxa) }}
                </span>
              </div>
            </label>
          </div>
        </div>

        <!-- Campos específicos por tipo de pagamento -->
        <div *ngIf="servicoSelecionado" class="specific-fields">

          <!-- PIX -->
          <div *ngIf="servicoSelecionado.tipo === 'TRANSFERENCIA' && servicoSelecionado.nome.toUpperCase().includes('PIX')" class="form-field">
            <label class="form-label">Chave PIX</label>
            <input
              type="text"
              formControlName="chavePix"
              placeholder="Digite sua chave PIX"
              class="form-input"
            />
          </div>

          <!-- TED -->
          <div *ngIf="servicoSelecionado.tipo === 'TRANSFERENCIA' && !servicoSelecionado.nome.toUpperCase().includes('PIX')" class="ted-fields">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-field">
                <label class="form-label">Banco</label>
                <input type="text" formControlName="banco" placeholder="Ex: 001 - Banco do Brasil" class="form-input" />
              </div>
              <div class="form-field">
                <label class="form-label">Agência</label>
                <input type="text" formControlName="agencia" placeholder="Ex: 1234-5" class="form-input" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-field">
                <label class="form-label">Conta</label>
                <input type="text" formControlName="conta" placeholder="Ex: 12345-6" class="form-input" />
              </div>
              <div class="form-field">
                <label class="form-label">Tipo de Conta</label>
                <select formControlName="tipoConta" class="form-select">
                  <option value="">Selecione</option>
                  <option value="CORRENTE">Corrente</option>
                  <option value="POUPANCA">Poupança</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Boleto -->
          <div *ngIf="servicoSelecionado.tipo === 'BOLETO'" class="form-field">
            <label class="form-label">Código de Barras (opcional)</label>
            <input
              type="text"
              formControlName="codigoBarras"
              placeholder="Digite o código de barras"
              class="form-input"
            />
          </div>

          <!-- Cartão -->
          <div *ngIf="servicoSelecionado.tipo === 'CARTAO'" class="cartao-fields">
            <div class="form-field">
              <label class="form-label">Número do Cartão</label>
              <input type="text" formControlName="numeroCartao" placeholder="**** **** **** 1234" class="form-input" />
            </div>
            <div class="form-field">
              <label class="form-label">Bandeira</label>
              <select formControlName="bandeira" class="form-select">
                <option value="">Selecione</option>
                <option value="VISA">Visa</option>
                <option value="MASTERCARD">Mastercard</option>
                <option value="ELO">Elo</option>
                <option value="AMEX">American Express</option>
                <option value="HIPERCARD">Hipercard</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Total -->
        <div class="total-box">
          <div class="total-row">
            <span class="total-label">Valor total:</span>
            <span class="total-value">{{ formatarValor(calcularTotal()) }}</span>
          </div>
          <p class="total-detail">Valor: {{ formatarValor(contrato?.valor) }} + Taxa: {{ formatarValor(servicoSelecionado?.taxa || 0) }}</p>
        </div>

        <!-- Observações -->
        <div class="form-field">
          <label class="form-label">Observações (opcional)</label>
          <textarea
            formControlName="observacoes"
            placeholder="Observações adicionais sobre o pagamento"
            rows="2"
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
        (click)="confirmarPagamento()"
        [disabled]="carregando || form.invalid || !servicoSelecionado"
        class="btn-primary"
      >
        <svg *ngIf="carregando" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Confirmar Pagamento
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
      --success: #22c55e;
      --success-bg: rgba(34, 197, 94, 0.1);
      --danger: #ef4444;
    }

    .modal-card {
      position: relative;
      width: 100%;
      max-width: 48rem;
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

    .modal-body {
      max-height: 60vh;
      overflow-y: auto;
      padding: 1.5rem;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 1rem;
    }

    .loading-spinner {
      width: 2.5rem;
      height: 2.5rem;
      border: 3px solid var(--border-visible);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .text-muted {
      color: var(--text-muted);
    }

    .space-y-5 > * + * {
      margin-top: 1.25rem;
    }

    .info-box {
      background: var(--bg-input);
      border: 1px solid var(--border-visible);
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-label {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .info-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--success);
      font-family: 'Monaco', 'Consolas', monospace;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
    }

    .text-danger {
      color: var(--danger);
    }

    .payment-methods {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .payment-method {
      position: relative;
      cursor: pointer;
    }

    .radio-input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .payment-method-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 2px solid var(--border-visible);
      border-radius: 0.5rem;
      background: var(--bg-input);
      transition: all 0.2s;
    }

    .payment-method.selected .payment-method-content {
      border-color: var(--primary);
      background: rgba(86, 90, 221, 0.1);
    }

    .payment-method:hover .payment-method-content {
      border-color: var(--primary);
    }

    .payment-method-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .payment-method-icon {
      font-size: 1.5rem;
    }

    .payment-method-info {
      display: flex;
      flex-direction: column;
    }

    .payment-method-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: white;
    }

    .payment-method-time {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .payment-method-tax {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--success);
    }

    .specific-fields {
      padding-top: 0.5rem;
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

    textarea.form-input {
      height: auto;
      padding: 0.75rem 1rem;
    }

    .resize-none {
      resize: none;
    }

    .grid {
      display: grid;
    }

    .grid-cols-2 {
      grid-template-columns: repeat(2, 1fr);
    }

    .gap-4 {
      gap: 1rem;
    }

    .total-box {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid var(--success);
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .total-label {
      font-size: 1rem;
      font-weight: 600;
      color: white;
    }

    .total-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--success);
      font-family: 'Monaco', 'Consolas', monospace;
    }

    .total-detail {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 0;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      border-top: 1px solid var(--border-visible);
      padding: 1.5rem;
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
export class PaymentModalComponent implements OnChanges, OnInit {
  @Input() aberto: boolean = false;
  @Input() contrato: Contrato | null = null;

  @Output() fecharModal = new EventEmitter<void>();
  @Output() pagamentoConfirmado = new EventEmitter<MetodoPagamento>();

  form: FormGroup;
  carregando: boolean = false;
  loadingServicos: boolean = false;
  servicos: Servico[] = [];
  servicoSelecionado: Servico | null = null;

  constructor(
    private fb: FormBuilder,
    private servicoService: ServicoService
  ) {
    this.form = this.fb.group({
      servicoId: ['', [Validators.required]],
      chavePix: [''],
      banco: [''],
      agencia: [''],
      conta: [''],
      tipoConta: [''],
      codigoBarras: [''],
      numeroCartao: [''],
      bandeira: [''],
      observacoes: ['']
    });

    // Watch for service selection changes
    this.form.get('servicoId')?.valueChanges.subscribe(servicoId => {
      const servico = this.servicos.find(s => s.id === servicoId);
      this.servicoSelecionado = servico || null;
    });
  }

  ngOnInit(): void {
    this.carregarServicos();
  }

  ngOnChanges(): void {
    if (this.aberto) {
      document.body.style.overflow = 'hidden';
      this.form.reset();
      this.servicoSelecionado = null;
    } else {
      document.body.style.overflow = '';
      this.carregando = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscPress(): void {
    if (this.aberto) this.fechar();
  }

  carregarServicos(): void {
    this.loadingServicos = true;
    this.servicoService.listarTodos().subscribe({
      next: (servicos) => {
        this.servicos = servicos.filter(s => s.ativo);
        this.loadingServicos = false;
      },
      error: (error) => {
        console.error('Erro ao carregar formas de pagamento:', error);
        this.loadingServicos = false;
      }
    });
  }

  getServicoIcon(tipo: string): string {
    const icons: { [key: string]: string } = {
      'TRANSFERENCIA': '⚡',
      'BOLETO': '📄',
      'CARTAO': '💳',
      'DEBITO_CONTA': '🏦'
    };
    return icons[tipo] || '💰';
  }

  formatarValor(valor: number | undefined): string {
    if (!valor && valor !== 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  calcularTotal(): number {
    const valorConta = this.contrato?.valor || 0;
    const taxa = this.servicoSelecionado?.taxa || 0;
    return valorConta + taxa;
  }

  fechar(): void {
    document.body.style.overflow = '';
    this.fecharModal.emit();
  }

  confirmarPagamento(): void {
    if (this.form.valid && this.contrato && this.servicoSelecionado) {
      this.carregando = true;

      const metodoPagamento: MetodoPagamento = {
        valor: this.contrato.valor,
        valorTaxa: this.servicoSelecionado.taxa,
        valorTotal: this.calcularTotal(),
        dataTransacao: new Date().toISOString(),
        status: 'PENDENTE',
        cliente: this.contrato.cliente,
        contrato: { id: this.contrato.id! },
        servico: { id: this.servicoSelecionado.id! },
        chavePix: this.form.value.chavePix || undefined,
        banco: this.form.value.banco || undefined,
        agencia: this.form.value.agencia || undefined,
        conta: this.form.value.conta || undefined,
        tipoConta: this.form.value.tipoConta || undefined,
        codigoBarras: this.form.value.codigoBarras || undefined,
        numeroCartao: this.form.value.numeroCartao || undefined,
        bandeira: this.form.value.bandeira || undefined,
        observacoes: this.form.value.observacoes || undefined
      };

      this.pagamentoConfirmado.emit(metodoPagamento);
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
