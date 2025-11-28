import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

/**
 * Interceptor HTTP para gerenciamento automático de autenticação JWT
 *
 * Responsabilidades:
 * - Anexa token JWT no header Authorization de requisições autenticadas
 * - Gerencia rotas públicas que não exigem autenticação
 * - Trata erros de autenticação (401) e autorização (403)
 * - Redireciona para login ou página de acesso negado conforme necessário
 *
 * @param req Requisição HTTP a ser processada
 * @param next Próximo handler na cadeia de interceptors
 * @returns Observable com a resposta HTTP ou erro tratado
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const publicUrls = ['/login', '/register', '/verificar-cpf-email', '/forgot-password'];
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));
  const isPublicClienteRegistration = req.method === 'POST' && req.url.includes('/api/clientes');

  let authReq = req;
  if (!isPublicUrl && !isPublicClienteRegistration) {
    const token = authService.getToken();
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      } else if (error.status === 403) {
        if (!isPublicUrl && !isPublicClienteRegistration) {
          router.navigate(['/access-denied']);
        }
      }

      return throwError(() => error);
    })
  );
};
