import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Contrato } from '../../../models/contrato.model';
import { ContratoService } from '../../../services/contrato.service';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../models/cliente.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-contrato-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './contrato-form.component.html',
  styleUrl: './contrato-form.component.scss',
  changeDetection: ChangeDetectionStrategy.Default // Força estratégia padrão
})
export class ContratoFormComponent implements OnInit {
  
  contratoForm!: FormGroup;
  loading = false;
  isEdicao = false;
  contrato: Contrato | null = null;
  contratoId: number | null = null;
  clientes: Cliente[] = [];

  constructor(
    private fb: FormBuilder,
    private contratoService: ContratoService,
    private clienteService: ClienteService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone // Adiciona NgZone para forçar detecção
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.contratoId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdicao = !!this.contratoId && !isNaN(this.contratoId);

    this.carregarClientes();
    
    if (this.isEdicao) {
      this.carregarContrato();
    }
  }

  private initializeForm(): void {
    this.contratoForm = this.fb.group({
      cliente: [null, [Validators.required]],
      dataInicio: ['', [Validators.required]],
      dataFim: [''],
      status: ['PENDENTE'],
      valorTotal: [''],
      observacoes: ['', [Validators.maxLength(1000)]]
    });
  }

  private carregarClientes(): void {
    this.clienteService.listarTodos().subscribe({
      next: (clientes) => {
        this.clientes = clientes.filter(cliente => cliente.ativo);
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
        this.notificationService.showError('Erro ao carregar clientes');
      }
    });
  }

  private carregarContrato(): void {
    if (!this.contratoId) return;

    this.loading = true;
    
    this.contratoService.buscarPorId(this.contratoId).subscribe({
      next: (contrato) => {
        // Força execução dentro da zona do Angular
        this.ngZone.run(() => {
          this.contrato = contrato;
          this.preencherFormulario(contrato);
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Erro ao carregar contrato:', error);
        this.ngZone.run(() => {
          this.notificationService.showError('Erro ao carregar contrato');
          this.loading = false;
          this.voltar();
        });
      }
    });
  }

  private preencherFormulario(contrato: Contrato): void {
    // Encontrar o cliente correspondente na lista carregada
    const clienteEncontrado = this.clientes.find(c => {
      if (typeof contrato.cliente === 'object' && contrato.cliente && 'id' in contrato.cliente) {
        return c.id === contrato.cliente.id;
      }
      return false;
    });

    this.contratoForm.patchValue({
      cliente: clienteEncontrado || null,
      dataInicio: contrato.dataInicio,
      dataFim: contrato.dataFim || '',
      status: contrato.status || 'PENDENTE',
      valorTotal: contrato.valorTotal || '',
      observacoes: contrato.observacoes || ''
    });
  }

  onSubmit(): void {
    if (this.contratoForm.invalid) {
      this.markAllFieldsAsTouched();
      this.notificationService.showError('Por favor, corrija os erros no formulário');
      return;
    }

    this.loading = true;
    const contratoData = this.prepareContratoData();

    const operation = this.isEdicao 
      ? this.contratoService.atualizar(this.contratoId!, contratoData)
      : this.contratoService.criar(contratoData);

    operation.subscribe({
      next: (resultado) => {
        const mensagem = this.isEdicao 
          ? 'Contrato atualizado com sucesso!' 
          : 'Contrato cadastrado com sucesso!';
        
        this.notificationService.showSuccess(mensagem);
        this.loading = false;
        this.voltar();
      },
      error: (error) => {
        console.error('Erro ao salvar contrato:', error);
        const mensagem = this.isEdicao 
          ? 'Erro ao atualizar contrato' 
          : 'Erro ao cadastrar contrato';
        
        this.notificationService.showError(mensagem);
        this.loading = false;
      }
    });
  }

  private prepareContratoData(): Contrato {
    const formValue = this.contratoForm.value;
    
    const contrato: Contrato = {
      cliente: formValue.cliente,
      dataInicio: formValue.dataInicio,
      dataFim: formValue.dataFim || undefined,
      status: formValue.status,
      valorTotal: formValue.valorTotal ? parseFloat(formValue.valorTotal) : undefined,
      observacoes: formValue.observacoes ? formValue.observacoes.trim() : undefined
    };

    if (this.isEdicao && this.contratoId) {
      contrato.id = this.contratoId;
    }

    return contrato;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.contratoForm.controls).forEach(key => {
      const control = this.contratoForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contratoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Método para debug - verificar estado do formulário
  debugFormulario(): void {
    console.log('=== DEBUG FORMULÁRIO ===');
    console.log('Formulário válido:', this.contratoForm.valid);
    console.log('Formulário inválido:', this.contratoForm.invalid);
    console.log('Loading:', this.loading);
    console.log('Errors:', this.contratoForm.errors);
    
    // Verificar cada campo
    Object.keys(this.contratoForm.controls).forEach(key => {
      const control = this.contratoForm.get(key);
      if (control && control.invalid) {
        console.log(`Campo ${key} inválido:`, control.errors);
      }
    });
    console.log('========================');
  }

  // Métodos auxiliares
  getStatusTexto(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDENTE': 'Pendente',
      'ATIVO': 'Ativo',
      'CONCLUIDO': 'Concluído',
      'CANCELADO': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  voltar(): void {
    this.router.navigate(['/contratos']);
  }
}