import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChildFn, CanActivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

/**
 * Guard responsável por proteger rotas que exigem autenticação.
 * Verifica se o usuário está logado antes de permitir acesso às rotas protegidas.
 * Redireciona para login caso não esteja autenticado e salva URL de retorno.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  /**
   * Verifica se o usuário pode ativar a rota solicitada.
   * Método principal do guard que é executado antes de carregar uma rota protegida.
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    
    console.log(`AuthGuard: Verificando acesso à rota: ${state.url}`);
    
    // Verificar estado de autenticação usando observable
    return this.authService.isAuthenticated().pipe(
      take(1), // Pega apenas o primeiro valor emitido para evitar múltiplas verificações
      map(isAuthenticated => {
        
        if (isAuthenticated) {
          // Usuário autenticado, permitir acesso à rota
          console.log('AuthGuard: Usuário autenticado, acesso permitido');
          return true;
          
        } else {
          // Usuário não autenticado, bloquear acesso
          console.log('AuthGuard: Usuário não autenticado, redirecionando para login');
          
          // Salvar URL de retorno para redirecionar após login
          const returnUrl = state.url;
          
          // Redirecionar para login com URL de retorno
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: returnUrl } 
          });
          
          // Mostrar mensagem explicativa se necessário
          if (returnUrl !== '/') {
            this.mostrarMensagemAcessoNegado();
          }
          
          return false;
        }
      })
    );
  }
  
  /**
   * Verifica se o usuário pode ativar rotas filhas.
   * Usa a mesma lógica do canActivate para rotas aninhadas.
   */
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    
    console.log(`AuthGuard: Verificando acesso à rota filha: ${state.url}`);
    return this.canActivate(childRoute, state);
  }
  
  /**
   * Exibe mensagem informativa quando acesso é negado.
   * Informa ao usuário que precisa fazer login para acessar a área solicitada.
   */
  private mostrarMensagemAcessoNegado(): void {
    Swal.fire({
      icon: 'info',
      title: 'Acesso Restrito',
      text: 'Você precisa fazer login para acessar esta área do sistema.',
      confirmButtonColor: '#0066cc',
      confirmButtonText: 'Entendido'
    });
  }
}

// Função funcional para usar com rotas
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.isAuthenticated().pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        const returnUrl = state.url;
        router.navigate(['/login'], { 
          queryParams: { returnUrl: returnUrl } 
        });
        return false;
      }
    })
  );
};

// Função funcional para rotas filhas
export const authChildGuard: CanActivateChildFn = (route, state) => {
  return authGuard(route, state);
};