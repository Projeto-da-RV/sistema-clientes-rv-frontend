import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  // Login
  username: string = '';
  password: string = '';
  loading: boolean = false;

  // Registro
  showRegister: boolean = false;
  registerLoading: boolean = false;
  registerData = {
    nome: '',
    email: '',
    cpf: '',
    dataNascimento: '',
    senha: '',
    confirmarSenha: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  onLogin() {
    if (!this.username || !this.password) {
      this.notificationService.error('Por favor, preencha todos os campos');
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.authService.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.cdr.markForCheck();
        this.notificationService.success(`Bem-vindo, ${response.username}!`).then(() => {
          this.router.navigate(['/dashboard']);
        });
      },
      error: (error) => {
        this.loading = false;
        this.cdr.markForCheck();
        const mensagem = error.error?.erro || error.message || 'Erro ao fazer login';
        this.notificationService.error(mensagem);
      }
    });
  }

  toggleRegister() {
    this.showRegister = !this.showRegister;
    this.cdr.markForCheck();
  }

  onRegister() {
    // Validações
    if (!this.registerData.nome || !this.registerData.email || !this.registerData.cpf ||
        !this.registerData.dataNascimento || !this.registerData.senha) {
      this.notificationService.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (this.registerData.senha !== this.registerData.confirmarSenha) {
      this.notificationService.error('As senhas não coincidem');
      return;
    }

    if (this.registerData.senha.length < 6) {
      this.notificationService.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    this.registerLoading = true;
    this.cdr.markForCheck();

    const registerPayload = {
      nome: this.registerData.nome,
      email: this.registerData.email,
      cpf: this.registerData.cpf.replace(/\D/g, ''),
      dataNascimento: this.registerData.dataNascimento,
      senha: this.registerData.senha
    };

    this.authService.register(registerPayload).subscribe({
      next: (response) => {
        this.registerLoading = false;
        this.cdr.markForCheck();

        this.notificationService.success('Conta criada com sucesso! Faça login para continuar.').then(() => {
          // Preencher campos de login com os dados do registro
          this.username = this.registerData.email;
          this.password = this.registerData.senha;

          // Voltar para tela de login
          this.showRegister = false;

          // Limpar formulário de registro
          this.registerData = {
            nome: '',
            email: '',
            cpf: '',
            dataNascimento: '',
            senha: '',
            confirmarSenha: ''
          };

          this.cdr.markForCheck();
        });
      },
      error: (error) => {
        this.registerLoading = false;
        this.cdr.markForCheck();
        const mensagem = error.error?.erro || error.error?.message || 'Erro ao criar conta';
        this.notificationService.error(mensagem);
      }
    });
  }

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

    this.registerData.cpf = valor;
    this.cdr.markForCheck();
  }
}