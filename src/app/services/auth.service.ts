import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Cliente } from '../models/cliente.model';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  sucesso: boolean;
  mensagem: string;
  cliente: Cliente;
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
  private currentUserSubject = new BehaviorSubject<Cliente | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Realiza login do usuário
   */
  login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          if (response.sucesso && response.cliente) {
            this.setCurrentUser(response.cliente);
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
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    this.currentUserSubject.next(null);
  }

  /**
   * Verifica se o usuário está logado
   */
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
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
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Recupera o usuário do localStorage
   */
  private getUserFromStorage(): Cliente | null {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Erro ao recuperar dados do usuário:', error);
        localStorage.removeItem('user');
      }
    }
    return null;
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