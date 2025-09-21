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
  cpfOuEmail: string = '';
  senha: string = '';
  loading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  onLogin() {
    if (!this.cpfOuEmail || !this.senha) {
      this.notificationService.error('Por favor, preencha todos os campos');
      return;
    }

    this.loading = true;
    this.cdr.markForCheck(); // ✅ Forçar atualização da UI

    this.authService.login({
      cpfOuEmail: this.cpfOuEmail,
      senha: this.senha
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.cdr.markForCheck(); // ✅ Forçar atualização da UI
        this.notificationService.success('Login realizado com sucesso!').then(() => {
          this.router.navigate(['/dashboard']);
        });
      },
      error: (error) => {
        this.loading = false;
        this.cdr.markForCheck(); // ✅ Forçar atualização da UI
        // A mensagem de erro já vem tratada do BaseCrudService
        this.notificationService.error(error.message);
      }
    });
  }
}