import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './services/auth.service';

/**
 * Guard de autorização que restringe acesso a rotas administrativas
 *
 * Funcionalidades:
 * - Verifica se o usuário possui a role 'ROLE_ADMIN' no token JWT
 * - Redireciona para /access-denied se não tiver permissão
 * - Deve ser usado em conjunto com authGuard para garantir autenticação
 *
 * Exemplo de uso:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [authGuard, adminGuard] // Ambos os guards
 * }
 *
 * @param route - Rota que está sendo ativada
 * @param state - Estado atual do router
 * @returns true se possui role de admin, false e redireciona para /access-denied caso contrário
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Verifica se o usuário possui a role de administrador
  if (authService.hasRole('ROLE_ADMIN')) {
    return true;
  } else {
    // Usuário sem permissão - redirecionar para página de acesso negado
    router.navigate(['/access-denied']);
    return false;
  }
};
