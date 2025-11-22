import { Component, EventEmitter, Input, Output, OnChanges, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Cliente } from '../../../models/cliente.model';

@Component({
  selector: 'app-cliente-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente-modal.component.html',
  styleUrls: ['./cliente-modal.component.scss']
})
export class ClienteModalComponent implements OnChanges, OnDestroy {
  @Input() aberto: boolean = false;
  @Input() cliente: Cliente | null = null;
  @Input() modo: 'criar' | 'editar' = 'criar';

  @Output() fecharModal = new EventEmitter<void>();
  @Output() salvarCliente = new EventEmitter<Cliente>();

  form: FormGroup;
  carregando: boolean = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required]],
      cpf: ['', [Validators.required]],
      dataNascimento: ['', [Validators.required]],
      ativo: [true, [Validators.required]]
    });
  }

  ngOnChanges(): void {
    if (this.aberto) {
      // Bloquear scroll da página
      document.body.style.overflow = 'hidden';

      if (this.modo === 'editar' && this.cliente) {
        this.form.patchValue({
          nome: this.cliente.nome,
          email: this.cliente.email,
          telefone: this.cliente.telefone,
          cpf: this.cliente.cpf,
          dataNascimento: this.cliente.dataNascimento,
          ativo: this.cliente.ativo
        });
      } else {
        this.form.reset({ ativo: true });
      }
    } else {
      // Restaurar scroll da página
      document.body.style.overflow = '';
    }
  }

  ngOnDestroy(): void {
    // Garantir que o scroll seja restaurado
    document.body.style.overflow = '';
  }

  // Fechar com ESC
  @HostListener('document:keydown.escape')
  onEscPress(): void {
    if (this.aberto) {
      this.fechar();
    }
  }

  fechar(): void {
    this.fecharModal.emit();
    this.form.reset({ ativo: true });
    this.carregando = false;
  }

  salvar(): void {
    if (this.form.valid) {
      this.carregando = true;
      const dados: Cliente = {
        ...(this.cliente || {}),
        ...this.form.value
      };
      this.salvarCliente.emit(dados);
      // O componente pai será responsável por fechar o modal após salvar
    } else {
      this.form.markAllAsTouched();
    }
  }

  // Fechar ao clicar no overlay
  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.fechar();
    }
  }

  get titulo(): string {
    return this.modo === 'criar' ? 'Novo Cliente' : 'Editar Cliente';
  }

  get descricao(): string {
    return this.modo === 'criar'
      ? 'Preencha os dados para cadastrar um novo cliente.'
      : 'Atualize as informações do cliente.';
  }

  get labelBotaoSalvar(): string {
    return this.modo === 'criar' ? 'Cadastrar Cliente' : 'Salvar Alterações';
  }
}
