import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Componente exibido quando o usuário tenta acessar uma rota sem permissão
 *
 * Cenários de uso:
 * - Usuário sem role de admin tenta acessar rota administrativa
 * - Erro 403 (Forbidden) retornado pela API
 * - AdminGuard bloqueia acesso
 */
@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.scss']
})
export class AccessDeniedComponent {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Volta para a página anterior ou dashboard
   */
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Faz logout e redireciona para login
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
