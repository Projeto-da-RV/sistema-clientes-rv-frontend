import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

/**
 * Interceptor funcional para gerenciamento automático de autenticação JWT
 *
 * Funcionalidades:
 * - Anexa automaticamente o token JWT no header Authorization de todas as requisições
 * - Formato: Authorization: Bearer {token}
 * - Ignora rotas públicas (login, register, etc.)
 * - Trata erros 401 (não autorizado) fazendo logout automático
 * - Trata erros 403 (acesso negado) redirecionando para /access-denied
 *
 * @param req - Requisição HTTP
 * @param next - Próximo handler na cadeia
 * @returns Observable com a resposta HTTP ou erro tratado
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // URLs públicas que NÃO precisam de token JWT
  const publicUrls = ['/login', '/register', '/verificar-cpf-email', '/forgot-password'];
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));

  // POST /api/clientes também é público (registro de novo usuário)
  const isPublicClienteRegistration = req.method === 'POST' && req.url.includes('/api/clientes');

  // Clonar requisição e adicionar header Authorization se não for URL pública
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

  // Processar requisição e tratar erros de autenticação/autorização
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Tratar erros de autenticação e autorização
      if (error.status === 401) {
        // Token inválido/expirado - fazer logout e redirecionar para login
        console.error('Sessão expirada ou token inválido');
        authService.logout();
        router.navigate(['/login']);
      } else if (error.status === 403) {
        // Acesso negado - mas não redirecionar se for tentativa de registro público
        if (!isPublicUrl && !isPublicClienteRegistration) {
          console.error('Acesso negado');
          router.navigate(['/access-denied']);
        } else {
          // Deixar o componente tratar o erro de registro
          console.error('Erro ao criar conta:', error.error?.erro || error.message);
        }
      }

      // Re-lançar o erro para que outros interceptors possam tratar (ex: httpErrorInterceptor)
      return throwError(() => error);
    })
  );
};
