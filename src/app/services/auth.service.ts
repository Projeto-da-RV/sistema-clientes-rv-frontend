import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Cliente } from '../models/cliente.model';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  dataNascimento: string;
  ativo: boolean;
  statusCadastro?: string;
  tentativasLogin?: number;
  contaBloqueada?: boolean;
  ultimoLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  cpfOuEmail: string;
  senha: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiBaseUrl}/clientes`;
  private readonly USER_KEY = 'user';

  private currentUserSubject = new BehaviorSubject<Cliente | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }

  /**
   * Realiza login do usuário
   */
  login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          // Backend retorna o Cliente completo após login bem-sucedido
          const user: Cliente = {
            id: response.id,
            nome: response.nome,
            cpf: response.cpf,
            email: response.email || '',
            telefone: response.telefone,
            dataNascimento: response.dataNascimento,
            ativo: response.ativo,
            statusCadastro: response.statusCadastro,
            tentativasLogin: response.tentativasLogin,
            contaBloqueada: response.contaBloqueada,
            ultimoLogin: response.ultimoLogin,
            createdAt: response.createdAt,
            updatedAt: response.updatedAt
          };

          this.setCurrentUser(user);
        }),
        catchError(error => {
          console.error('Erro no login:', error);
          let errorMessage = 'Erro ao fazer login';

          if (error.status === 401 || error.status === 400) {
            errorMessage = error.error?.erro || 'CPF/Email ou senha inválidos';
          } else if (error.error?.erro) {
            errorMessage = error.error.erro;
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
   * Nota: Backend não usa JWT, apenas sessão/cookie
   */
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.id !== undefined;
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
   * Obtém o token (compatibilidade com auth interceptor)
   * Nota: Backend não usa JWT, retorna null
   */
  getToken(): string | null {
    return null;
  }

  /**
   * Carrega informações do usuário do localStorage
   */
  private loadUserFromToken(): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.currentUserSubject.next(currentUser);
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