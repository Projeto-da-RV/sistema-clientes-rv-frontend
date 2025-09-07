import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

/**
 * Serviço responsável pela autenticação e gerenciamento de sessão dos usuários.
 * Controla login, logout, verificação de autenticação e armazenamento de tokens.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // URL base da API de autenticação - ajustar quando backend tiver endpoint real
  private baseUrl = 'http://localhost:8080/auth';
  
  // Subject para controlar o estado de autenticação em tempo real
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<any>(null);
  
  constructor(private http: HttpClient) {
    // Verificar se há token salvo no localStorage ao inicializar o serviço
    this.verificarTokenSalvo();
  }
  
  /**
   * Verifica se existe token válido salvo no localStorage
   * e atualiza o estado de autenticação correspondente
   */
  private verificarTokenSalvo(): void {
    const token = this.getToken();
    const usuario = this.getUsuario();
    
    if (token && usuario) {
      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(usuario);
      console.log('AuthService: Token encontrado, usuário autenticado');
    } else {
      this.limparDadosAutenticacao();
      console.log('AuthService: Nenhum token válido encontrado');
    }
  }
  
  /**
   * Realiza o login do usuário com email e senha
   * Por enquanto simula login, depois integrar com backend real
   */
  login(email: string, senha: string): Observable<boolean> {
    console.log('AuthService: Tentativa de login para:', email);
    
    // SIMULAÇÃO - Remover quando integrar com backend
    return new Observable(observer => {
      // Simular delay de requisição
      setTimeout(() => {
        // Credenciais válidas para demonstração
        if (email === 'admin@rvdigital.com.br' && senha === '123456') {
          const usuario = {
            id: 1,
            nome: 'Administrador RV Digital',
            email: email,
            perfil: 'ADMIN',
            dataLogin: new Date()
          };
          
          const token = 'fake-jwt-token-' + Date.now();
          
          // Salvar dados no localStorage
          this.salvarDadosAutenticacao(token, usuario);
          
          // Atualizar states
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(usuario);
          
          console.log('AuthService: Login realizado com sucesso');
          observer.next(true);
        } else {
          console.log('AuthService: Credenciais inválidas');
          observer.error('Email ou senha inválidos');
        }
        observer.complete();
      }, 1000);
    });
  }
  
  /**
   * Realiza o logout do usuário
   * Remove token e dados do localStorage e atualiza estados
   */
  logout(): void {
    console.log('AuthService: Realizando logout');
    
    this.limparDadosAutenticacao();
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    
    Swal.fire({
      icon: 'success',
      title: 'Logout realizado!',
      text: 'Você foi desconectado com sucesso.',
      timer: 2000,
      showConfirmButton: false,
      confirmButtonColor: '#0066cc'
    });
  }
  
  /**
   * Retorna observable do estado de autenticação
   * Usado pelos componentes para reagir a mudanças de autenticação
   */
  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }
  
  /**
   * Retorna observable com dados do usuário atual
   * Usado pelos componentes para exibir informações do usuário
   */
  getCurrentUser(): Observable<any> {
    return this.currentUserSubject.asObservable();
  }
  
  /**
   * Retorna o token JWT salvo no localStorage
   * Usado pelo interceptor para adicionar em requisições
   */
  getToken(): string | null {
    return localStorage.getItem('rv_token');
  }
  
  /**
   * Retorna os dados do usuário salvos no localStorage
   */
  getUsuario(): any {
    const usuario = localStorage.getItem('rv_usuario');
    return usuario ? JSON.parse(usuario) : null;
  }
  
  /**
   * Verifica se o usuário está autenticado de forma síncrona
   * Útil para guards e validações rápidas
   */
  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }
  
  /**
   * Salva token e dados do usuário no localStorage
   */
  private salvarDadosAutenticacao(token: string, usuario: any): void {
    localStorage.setItem('rv_token', token);
    localStorage.setItem('rv_usuario', JSON.stringify(usuario));
    console.log('AuthService: Dados de autenticação salvos no localStorage');
  }
  
  /**
   * Remove todos os dados de autenticação do localStorage
   */
  private limparDadosAutenticacao(): void {
    localStorage.removeItem('rv_token');
    localStorage.removeItem('rv_usuario');
    console.log('AuthService: Dados de autenticação removidos do localStorage');
  }
  
  /**
   * Tratamento de erros das requisições HTTP de autenticação
   */
  private handleError = (error: any): Observable<never> => {
    console.error('AuthService: Erro na autenticação:', error);
    
    let mensagem = 'Erro interno do servidor';
    
    if (error.error) {
      if (typeof error.error === 'string') {
        mensagem = error.error;
      } else if (error.error.message) {
        mensagem = error.error.message;
      } else if (typeof error.error === 'object') {
        // Tratar erros de validação do backend
        const erros = Object.values(error.error).join(', ');
        mensagem = erros;
      }
    }
    
    return throwError(() => error);
  };
}