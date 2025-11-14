import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Cliente } from '../models/cliente.model';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

export interface LoginResponse {
  sucesso: boolean;
  mensagem: string;
  cliente: Cliente;
  token?: string; // Token JWT do backend
}

export interface LoginRequest {
  cpfOuEmail: string;
  senha: string;
}

export interface JwtPayload {
  sub: string;
  roles?: string[];
  exp: number;
  iat?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiBaseUrl}/clientes`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user';

  private currentUserSubject = new BehaviorSubject<Cliente | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Carregar usuário do token ao iniciar
    this.loadUserFromToken();
  }

  /**
   * Realiza login do usuário
   */
  login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          if (response.sucesso && response.cliente) {
            // Salvar usuário no localStorage (compatibilidade)
            this.setCurrentUser(response.cliente);

            // Salvar token JWT se fornecido pelo backend
            if (response.token) {
              this.saveToken(response.token);
              this.loadUserFromToken();
            }
          }
        }),
        catchError(error => {
          console.error('Erro no login:', error);
          let errorMessage = 'Erro ao fazer login';

          if (error.error && error.error.erro) {
            errorMessage = error.error.erro;
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Realiza logout do usuário
   */
  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('userToken'); // Manter compatibilidade
    this.currentUserSubject.next(null);
  }

  /**
   * Verifica se o usuário está logado (compatibilidade)
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Verifica se o usuário está autenticado e o token é válido
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return this.getCurrentUser() !== null; // Fallback para autenticação sem JWT
    }

    try {
      const decoded: JwtPayload = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        // Token expirado - fazer logout
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao decodificar token JWT:', error);
      // Token inválido - fazer logout
      this.logout();
      return false;
    }
  }

  /**
   * Obtém o usuário atual
   */
  getCurrentUser(): Cliente | null {
    return this.currentUserSubject.value;
  }

  /**
   * Define o usuário atual
   */
  private setCurrentUser(user: Cliente): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Recupera o usuário do localStorage
   */
  private getUserFromStorage(): Cliente | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Erro ao recuperar dados do usuário:', error);
        localStorage.removeItem(this.USER_KEY);
      }
    }
    return null;
  }

  /**
   * Obtém o token JWT do localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Salva o token JWT no localStorage
   */
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Verifica se o usuário possui uma role específica
   */
  hasRole(role: string): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: JwtPayload = jwtDecode(token);
      return decoded.roles?.includes(role) || false;
    } catch (error) {
      console.error('Erro ao verificar role:', error);
      return false;
    }
  }

  /**
   * Carrega informações do usuário a partir do token JWT
   */
  private loadUserFromToken(): void {
    const token = this.getToken();
    if (!token) return;

    try {
      const decoded: JwtPayload = jwtDecode(token);

      // Verificar se o token está expirado
      const isExpired = decoded.exp * 1000 < Date.now();
      if (isExpired) {
        this.logout();
        return;
      }

      // Se já temos o usuário no localStorage, não precisamos fazer nada
      // O token é usado principalmente para autorização e validação
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.currentUserSubject.next(currentUser);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário do token:', error);
      this.logout();
    }
  }

  /**
   * Verifica se CPF ou email já existe
   */
  verificarCpfEmail(cpfOuEmail: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar-cpf-email`, { cpfOuEmail })
      .pipe(
        catchError(error => {
          console.error('Erro ao verificar CPF/Email:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Altera senha do usuário logado
   */
  alterarSenha(senhaAtual: string, novaSenha: string): Observable<any> {
    const user = this.getCurrentUser();
    if (!user || !user.id) {
      return throwError(() => new Error('Usuário não está logado'));
    }

    return this.http.put(`${this.apiUrl}/${user.id}/alterar-senha`, {
      senhaAtual,
      novaSenha
    }).pipe(
      catchError(error => {
        console.error('Erro ao alterar senha:', error);
        let errorMessage = 'Erro ao alterar senha';
        
        if (error.error && error.error.erro) {
          errorMessage = error.error.erro;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}