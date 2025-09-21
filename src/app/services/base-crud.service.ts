import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BaseEntity, SearchConfig } from '../interfaces/base-entity.interface';

@Injectable()
export abstract class BaseCrudService<T extends BaseEntity> {
  protected abstract readonly resourcePath: string;

  constructor(protected http: HttpClient) {}

  protected get apiUrl(): string {
    return `${environment.apiBaseUrl}/${this.resourcePath}`;
  }

  listarTodos(): Observable<T[]> {
    return this.http.get<T[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  buscarPorId(id: number): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  criar(entity: T): Observable<T> {
    return this.http.post<T>(this.apiUrl, entity)
      .pipe(catchError(this.handleError));
  }

  atualizar(id: number, entity: T): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${id}`, entity)
      .pipe(catchError(this.handleError));
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  buscar(searchConfig: SearchConfig): Observable<T[]> {
    let params = new HttpParams();
    
    Object.keys(searchConfig.params).forEach(key => {
      if (searchConfig.params[key] !== null && searchConfig.params[key] !== undefined) {
        params = params.set(key, searchConfig.params[key].toString());
      }
    });

    return this.http.get<T[]>(`${this.apiUrl}/${searchConfig.endpoint}`, { params })
      .pipe(catchError(this.handleError));
  }

  buscarPorNome(nome: string): Observable<T[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<T[]>(`${this.apiUrl}/buscar`, { params })
      .pipe(catchError(this.handleError));
  }

  protected handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente ou de rede
      errorMessage = `Erro: ${error.error.message}`;
    } else if (error.error && typeof error.error.erro === 'string') {
      // Erro vindo da sua API Spring Boot (ex: Map.of("erro", "..."))
      errorMessage = error.error.erro;
    } else if (typeof error.error === 'string' && error.error.includes('</html>')) {
      // Erro genérico do Spring quando a rota não é encontrada
      errorMessage = `Recurso não encontrado no servidor (404). Verifique a URL da API.`;
    } else {
      // Outros erros do lado do servidor
      errorMessage = `Erro ${error.status}: ${error.statusText}`;
    }

    console.error('Erro na chamada da API:', error);
    return throwError(() => new Error(errorMessage));
  }
}