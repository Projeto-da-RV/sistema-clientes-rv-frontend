import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './services/auth.service';

/**
 * Guard de autenticação que protege rotas requerendo autenticação válida
 *
 * Funcionalidades:
 * - Verifica se o usuário possui token JWT válido
 * - Valida se o token não está expirado
 * - Redireciona para /login se não autenticado ou token inválido
 * - Bloqueia acesso direto por URL sem autenticação
 *
 * @param route - Rota que está sendo ativada
 * @param state - Estado atual do router
 * @returns true se autenticado, false e redireciona para /login caso contrário
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // isLoggedIn() agora valida token JWT e expiração através de isAuthenticated()
  if (authService.isLoggedIn()) {
    return true;
  } else {
    // Usuário não autenticado ou token expirado - redirecionar para login
    router.navigate(['/login']);
    return false;
  }
};