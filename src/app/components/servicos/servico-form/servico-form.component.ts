import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Servico } from '../../../models/servico.model';
import { ServicoService } from '../../../services/servico.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-servico-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './servico-form.component.html',
  styleUrl: './servico-form.component.scss',
  changeDetection: ChangeDetectionStrategy.Default // Força estratégia padrão
})
export class ServicoFormComponent implements OnInit {
  
  servicoForm!: FormGroup;
  loading = false;
  isEdicao = false;
  servico: Servico | null = null;
  servicoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private servicoService: ServicoService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone // Adiciona NgZone para forçar detecção
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.servicoId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdicao = !!this.servicoId && !isNaN(this.servicoId);

    if (this.isEdicao) {
      this.carregarServico();
    }
  }

  private initializeForm(): void {
    this.servicoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      categoria: ['', [Validators.required, Validators.maxLength(50)]],
      valor: ['', [Validators.required, Validators.min(0.01)]],
      descricao: ['', [Validators.required, Validators.maxLength(500)]],
      ativo: [true]
    });
  }

  private carregarServico(): void {
    if (!this.servicoId) return;

    this.loading = true;
    
    this.servicoService.buscarPorId(this.servicoId).subscribe({
      next: (servico) => {
        // Força execução dentro da zona do Angular
        this.ngZone.run(() => {
          this.servico = servico;
          this.preencherFormulario(servico);
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Erro ao carregar serviço:', error);
        this.ngZone.run(() => {
          this.notificationService.showError('Erro ao carregar serviço');
          this.loading = false;
          this.voltar();
        });
      }
    });
  }

  private preencherFormulario(servico: Servico): void {
    this.servicoForm.patchValue({
      nome: servico.nome,
      categoria: servico.categoria || '',
      valor: servico.valor,
      descricao: servico.descricao,
      ativo: servico.ativo
    });
  }

  onSubmit(): void {
    if (this.servicoForm.invalid) {
      this.markAllFieldsAsTouched();
      this.notificationService.showError('Por favor, corrija os erros no formulário');
      return;
    }

    this.loading = true;
    const servicoData = this.prepareServicoData();

    const operation = this.isEdicao 
      ? this.servicoService.atualizar(this.servicoId!, servicoData)
      : this.servicoService.criar(servicoData);

    operation.subscribe({
      next: (resultado) => {
        const mensagem = this.isEdicao 
          ? 'Serviço atualizado com sucesso!' 
          : 'Serviço cadastrado com sucesso!';
        
        this.notificationService.showSuccess(mensagem);
        this.loading = false;
        this.voltar();
      },
      error: (error) => {
        console.error('Erro ao salvar serviço:', error);
        const mensagem = this.isEdicao 
          ? 'Erro ao atualizar serviço' 
          : 'Erro ao cadastrar serviço';
        
        this.notificationService.showError(mensagem);
        this.loading = false;
      }
    });
  }

  private prepareServicoData(): Servico {
    const formValue = this.servicoForm.value;
    
    const servico: Servico = {
      nome: formValue.nome.trim(),
      categoria: formValue.categoria ? formValue.categoria.trim() : undefined,
      valor: parseFloat(formValue.valor),
      descricao: formValue.descricao.trim(),
      ativo: formValue.ativo
    };

    if (this.isEdicao && this.servicoId) {
      servico.id = this.servicoId;
    }

    return servico;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.servicoForm.controls).forEach(key => {
      const control = this.servicoForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.servicoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Método para debug - verificar estado do formulário
  debugFormulario(): void {
    console.log('=== DEBUG FORMULÁRIO ===');
    console.log('Formulário válido:', this.servicoForm.valid);
    console.log('Formulário inválido:', this.servicoForm.invalid);
    console.log('Loading:', this.loading);
    console.log('Errors:', this.servicoForm.errors);
    
    // Verificar cada campo
    Object.keys(this.servicoForm.controls).forEach(key => {
      const control = this.servicoForm.get(key);
      if (control && control.invalid) {
        console.log(`Campo ${key} inválido:`, control.errors);
      }
    });
    console.log('========================');
  }

  voltar(): void {
    this.router.navigate(['/servicos']);
  }
}