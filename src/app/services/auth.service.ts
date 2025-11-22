import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Cliente } from '../models/cliente.model';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

export interface JwtResponse {
  token: string;  // Backend retorna "token", não "jwt"
  type: string;
  username: string;
  email: string;
  roles: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
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
  private readonly AUTH_URL = `${environment.apiBaseUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user';
  private readonly ROLES_KEY = 'roles';

  private currentUserSubject = new BehaviorSubject<Cliente | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }

  /**
   * Realiza login do usuário
   */
  login(loginData: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.AUTH_URL}/login`, loginData)
      .pipe(
        tap(response => {
          console.log('✅ Login response:', response);
          console.log('🔑 Token recebido:', response.token);

          // Valida formato do token antes de salvar
          if (response.token) {
            const parts = response.token.split('.');
            console.log('📊 Token tem', parts.length, 'partes (esperado: 3)');
            if (parts.length !== 3) {
              console.error('❌ Token JWT inválido recebido do backend!');
              throw new Error('Token JWT mal formado recebido do servidor');
            }
          }

          this.saveToken(response.token);

          const user: Partial<Cliente> = {
            id: undefined,
            nome: response.username,
            email: response.email,
            cpf: '',
            dataNascimento: ''
          };

          this.setCurrentUser(user as Cliente);
          localStorage.setItem(this.ROLES_KEY, JSON.stringify(response.roles));

          console.log('✅ Usuário salvo:', user);
          console.log('✅ Roles salvas:', response.roles);
        }),
        catchError(error => {
          console.error('Erro no login:', error);
          let errorMessage = 'Erro ao fazer login';

          if (error.status === 401) {
            errorMessage = 'Usuário ou senha inválidos';
          } else if (error.error?.message) {
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
    localStorage.removeItem(this.ROLES_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Verifica se o usuário está logado
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Verifica se o usuário está autenticado
   * Verifica se existe token e usuário salvos
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();

    if (!token || !user) {
      return false;
    }

    // Valida formato do token JWT (deve ter 3 partes)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Token JWT mal formado no isAuthenticated');
      return false;
    }

    // Tenta validar o token, mas não faz logout em caso de erro
    // pois o backend vai rejeitar requests inválidas de qualquer forma
    try {
      const decoded: JwtPayload = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        console.warn('Token expirado');
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Erro ao validar token:', error);
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
        return JSON.parse(userData) as Cliente;
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
  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Verifica se o usuário possui uma role específica
   */
  hasRole(role: string): boolean {
    const roles = this.getRoles();
    return roles.includes(role);
  }

  /**
   * Verifica se o usuário é admin
   */
  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  /**
   * Obtém as roles do usuário
   */
  getRoles(): string[] {
    const rolesStr = localStorage.getItem(this.ROLES_KEY);
    if (!rolesStr) return [];

    try {
      return JSON.parse(rolesStr) as string[];
    } catch (error) {
      console.error('Erro ao parsear roles:', error);
      return [];
    }
  }

  /**
   * Carrega informações do usuário a partir do token JWT
   */
  private loadUserFromToken(): void {
    const token = this.getToken();
    if (!token) {
      return;
    }

    // Valida formato do token JWT (deve ter 3 partes: header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Token JWT mal formado (não tem 3 partes), limpando...');
      localStorage.removeItem(this.TOKEN_KEY);
      return;
    }

    try {
      const decoded: JwtPayload = jwtDecode(token);

      const isExpired = decoded.exp * 1000 < Date.now();
      if (isExpired) {
        console.warn('Token expirado, fazendo logout');
        this.logout();
        return;
      }

      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.currentUserSubject.next(currentUser);
      }
    } catch (error) {
      console.warn('Erro ao decodificar token, limpando:', error);
      localStorage.removeItem(this.TOKEN_KEY);
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
    if (!user?.id) {
      return throwError(() => new Error('Usuário não está logado'));
    }

    return this.http.put(`${this.apiUrl}/${user.id}/alterar-senha`, {
      senhaAtual,
      novaSenha
    }).pipe(
      catchError(error => {
        console.error('Erro ao alterar senha:', error);
        const errorMessage = error.error?.erro || 'Erro ao alterar senha';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
