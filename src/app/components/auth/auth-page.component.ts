import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss'
})
export class AuthPageComponent implements OnInit {
  modalLoginAberto: boolean = false;
  modalRegistroAberto: boolean = false;

  mostrarSenhaLogin: boolean = false;
  mostrarSenhaRegistro: boolean = false;
  mostrarConfirmarSenha: boolean = false;

  carregandoLogin: boolean = false;
  carregandoRegistro: boolean = false;

  loginForm: FormGroup;
  registroForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registroForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.minLength(11)]],
      dataNascimento: ['', [Validators.required]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Redireciona para dashboard se já estiver logado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Modais
  abrirModalLogin(): void {
    this.modalLoginAberto = true;
    document.body.style.overflow = 'hidden';
  }

  fecharModalLogin(): void {
    this.modalLoginAberto = false;
    document.body.style.overflow = '';
    this.loginForm.reset();
  }

  abrirModalRegistro(): void {
    this.modalRegistroAberto = true;
    document.body.style.overflow = 'hidden';
  }

  fecharModalRegistro(): void {
    this.modalRegistroAberto = false;
    document.body.style.overflow = '';
    this.registroForm.reset();
  }

  trocarParaRegistro(): void {
    this.fecharModalLogin();
    setTimeout(() => this.abrirModalRegistro(), 300);
  }

  trocarParaLogin(): void {
    this.fecharModalRegistro();
    setTimeout(() => this.abrirModalLogin(), 300);
  }

  // Validação
  senhasNaoCoincidem(): boolean {
    const senha = this.registroForm.get('senha')?.value;
    const confirmar = this.registroForm.get('confirmarSenha')?.value;
    const touched = this.registroForm.get('confirmarSenha')?.touched;
    return touched && confirmar && senha !== confirmar;
  }

  // Login
  fazerLogin(): void {
    if (this.loginForm.valid) {
      this.carregandoLogin = true;

      const { username, password } = this.loginForm.value;

      this.authService.login({ username, password }).subscribe({
        next: (response) => {
          this.carregandoLogin = false;
          this.fecharModalLogin();
          this.notificationService.showSuccess('Login realizado com sucesso!');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.carregandoLogin = false;
          this.notificationService.showError(error.message || 'Email ou senha incorretos');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  // Registro
  fazerRegistro(): void {
    if (this.registroForm.valid && !this.senhasNaoCoincidem()) {
      this.carregandoRegistro = true;

      const { nome, email, cpf, dataNascimento, senha } = this.registroForm.value;

      // TODO: Implementar endpoint de registro no backend
      // Por enquanto, vamos simular o registro
      console.log('Dados de registro:', { nome, email, cpf, dataNascimento });

      setTimeout(() => {
        this.carregandoRegistro = false;
        this.fecharModalRegistro();
        this.notificationService.showSuccess('Conta criada com sucesso! Faça login para continuar.');
        this.abrirModalLogin();
      }, 1500);
    } else {
      this.registroForm.markAllAsTouched();
    }
  }

  // Formatação
  formatarCPF(event: any): void {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.substring(0, 11);

    if (valor.length > 9) {
      valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (valor.length > 6) {
      valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (valor.length > 3) {
      valor = valor.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }

    this.registroForm.patchValue({ cpf: valor });
  }
}
