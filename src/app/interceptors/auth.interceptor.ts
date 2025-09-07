import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

/**
 * Interceptador HTTP responsável por:
 * - Adicionar token JWT automaticamente em todas as requisições para a API
 * - Tratar erros de autenticação globalmente (401, 403)
 * - Redirecionar para login quando token expirar
 * - Configurar headers padrão para requisições
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  /**
   * Intercepta todas as requisições HTTP saindo da aplicação.
   * Adiciona token JWT automaticamente e trata erros de autenticação.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    console.log(`AuthInterceptor: Interceptando requisição para ${request.url}`);
    
    // Obter token do AuthService
    const token = this.authService.getToken();
    
    // Clonar requisição e adicionar headers necessários
    const modifiedRequest = this.adicionarHeadersRequisicao(request, token);
    
    // Processar requisição e tratar erros de autenticação
    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.tratarErroAutenticacao(error, request.url);
      })
    );
  }
  
  /**
   * Adiciona headers necessários na requisição (Authorization, Content-Type).
   * Clona a requisição original para não modificar a original.
   */
  private adicionarHeadersRequisicao(request: HttpRequest<any>, token: string | null): HttpRequest<any> {
    
    // Headers básicos para todas as requisições
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };
    
    // Adicionar Authorization header apenas se token existir e for requisição para API
    if (token && this.deveAdicionarToken(request.url)) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('AuthInterceptor: Token JWT adicionado na requisição');
    }
    
    // Clonar requisição com novos headers
    return request.clone({
      setHeaders: headers
    });
  }
  
  /**
   * Verifica se deve adicionar token na requisição.
   * Evita adicionar token em requisições externas ou públicas.
   */
  private deveAdicionarToken(url: string): boolean {
    // Não adicionar token em requisições de login
    if (url.includes('/auth/login')) {
      return false;
    }
    
    // Não adicionar token em requisições para APIs externas
    if (url.startsWith('http') && !url.includes('localhost') && !url.includes('rvdigital')) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Trata erros relacionados à autenticação e autorização.
   * Intercepta erros HTTP específicos e toma ações apropriadas.
   */
  private tratarErroAutenticacao(error: HttpErrorResponse, url: string): Observable<never> {
    
    console.error(`AuthInterceptor: Erro HTTP ${error.status} na URL ${url}:`, error);
    
    switch (error.status) {
      case 401:
        // Token inválido, expirado ou não fornecido
        this.tratarTokenInvalido();
        break;
        
      case 403:
        // Acesso negado - usuário não tem permissão
        this.tratarAcessoNegado();
        break;
        
      case 0:
        // Erro de conexão com servidor (CORS, rede, etc.)
        this.tratarErroConexao();
        break;
        
      default:
        // Outros erros HTTP - deixar para BaseService tratar
        console.log('AuthInterceptor: Erro não relacionado à autenticação, repassando...');
        break;
    }
    
    return throwError(() => error);
  }
  
  /**
   * Trata erro 401 - Token inválido ou expirado.
   * Faz logout automático e redireciona para login.
   */
  private tratarTokenInvalido(): void {
    console.log('AuthInterceptor: Token inválido ou expirado detectado');
    
    // Verificar se não estamos já na página de login para evitar loop
    if (!this.router.url.includes('/login')) {
      
      // Fazer logout silencioso (sem mostrar mensagem de sucesso)
      localStorage.removeItem('rv_token');
      localStorage.removeItem('rv_usuario');
      
      // Redirecionar para login
      this.router.navigate(['/login']);
      
      // Mostrar mensagem explicativa
      Swal.fire({
        icon: 'warning',
        title: 'Sessão Expirada',
        text: 'Sua sessão expirou. Por favor, faça login novamente.',
        confirmButtonColor: '#0066cc',
        allowOutsideClick: false,
        confirmButtonText: 'Fazer Login'
      });
    }
  }
  
  /**
   * Trata erro 403 - Acesso negado.
   * Usuário autenticado mas sem permissão para o recurso.
   */
  private tratarAcessoNegado(): void {
    console.log('AuthInterceptor: Acesso negado - permissões insuficientes');
    
    Swal.fire({
      icon: 'error',
      title: 'Acesso Negado',
      text: 'Você não tem permissão para acessar este recurso ou realizar esta operação.',
      confirmButtonColor: '#0066cc',
      confirmButtonText: 'Entendido'
    });
  }
  
  /**
   * Trata erro de conexão com servidor (status 0).
   * Geralmente indica que o backend está fora do ar ou problemas de CORS.
   */
  private tratarErroConexao(): void {
    console.log('AuthInterceptor: Erro de conexão com servidor detectado');
    
    Swal.fire({
      icon: 'error',
      title: 'Erro de Conexão',
      text: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet ou tente novamente mais tarde.',
      confirmButtonColor: '#0066cc',
      confirmButtonText: 'Tentar Novamente'
    });
  }
}