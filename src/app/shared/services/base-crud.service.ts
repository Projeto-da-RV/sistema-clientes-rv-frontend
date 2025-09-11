import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BaseEntity, SearchConfig } from '../interfaces/base-entity.interface';

/**
 * Serviço base genérico para operações CRUD
 * Elimina duplicação de código entre todos os serviços de entidade
 * 
 * @template T - Tipo da entidade que estende BaseEntity
 */
@Injectable()
export abstract class BaseCrudService<T extends BaseEntity> {
  protected abstract readonly resourcePath: string;

  constructor(protected http: HttpClient) {}

  /**
   * URL base da API para este recurso
   */
  protected get apiUrl(): string {
    return `${environment.apiBaseUrl}/${this.resourcePath}`;
  }

  /**
   * Lista todas as entidades
   */
  listarTodos(): Observable<T[]> {
    return this.http.get<T[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Busca entidade por ID
   */
  buscarPorId(id: number): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Cria nova entidade
   */
  criar(entity: T): Observable<T> {
    return this.http.post<T>(this.apiUrl, entity)
      .pipe(catchError(this.handleError));
  }

  /**
   * Atualiza entidade existente
   */
  atualizar(id: number, entity: T): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${id}`, entity)
      .pipe(catchError(this.handleError));
  }

  /**
   * Deleta entidade por ID
   */
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Busca genérica com parâmetros
   */
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

  /**
   * Busca simples por nome (padrão comum)
   */
  buscarPorNome(nome: string): Observable<T[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<T[]>(`${this.apiUrl}/buscar`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Tratamento centralizado de erros HTTP
   */
  protected handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Erro desconhecido';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Dados inválidos';
          break;
        case 401:
          errorMessage = 'Não autorizado';
          break;
        case 403:
          errorMessage = 'Acesso negado';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }

    console.error('Erro HTTP:', error);
    return throwError(() => new Error(errorMessage));
  };
}