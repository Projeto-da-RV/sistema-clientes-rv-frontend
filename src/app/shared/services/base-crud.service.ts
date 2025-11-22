import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
   * Headers HTTP padrão para requisições JSON
   */
  protected get httpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
  }

  /**
   * Lista todas as entidades
   */
  listarTodos(): Observable<T[]> {
    return this.http.get<T[]>(this.apiUrl, this.httpOptions)
      .pipe(
        map(response => response || []), // Transforma null/undefined em array vazio
        catchError(this.handleError)
      );
  }

  /**
   * Busca entidade por ID
   */
  buscarPorId(id: number): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   * Cria nova entidade
   */
  criar(entity: T): Observable<T> {
    return this.http.post<T>(this.apiUrl, entity, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   * Atualiza entidade existente
   */
  atualizar(id: number, entity: T): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${id}`, entity, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   * Deleta entidade por ID
   */
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions)
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

    return this.http.get<T[]>(`${this.apiUrl}/${searchConfig.endpoint}`, {
      params,
      headers: this.httpOptions.headers
    })
      .pipe(
        map(response => response || []), // Transforma null/undefined em array vazio
        catchError(this.handleError)
      );
  }

  /**
   * Busca simples por nome (padrão comum)
   */
  buscarPorNome(nome: string): Observable<T[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<T[]>(`${this.apiUrl}/buscar`, {
      params,
      headers: this.httpOptions.headers
    })
      .pipe(
        map(response => response || []), // Transforma null/undefined em array vazio
        catchError(this.handleError)
      );
  }

  /**
   * Tratamento centralizado de erros HTTP
   */
  protected handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else if (error.error instanceof ProgressEvent) {
      // Erro de parsing (backend retornou vazio ou não-JSON)
      errorMessage = 'Erro ao processar resposta do servidor. Verifique se o backend está retornando JSON válido.';
      console.error('❌ Erro de parsing - Backend não retornou JSON válido');
      console.error('URL:', error.url);
      console.error('Status:', error.status);
      console.error('Mensagem:', error.message);

      // Tenta extrair o texto da resposta para debug
      if (error.error && typeof error.error === 'object') {
        console.error('Tipo do erro:', error.error.constructor.name);
        console.error('Erro completo:', error.error);
      }
    } else if (error.status === 200 && error.message.includes('parsing')) {
      // Status 200 mas erro de parsing = JSON malformado (geralmente referência circular)
      errorMessage = 'Backend retornou JSON inválido. Possível referência circular nos relacionamentos.';
      console.error('❌ Erro de parsing com status 200 - Provável referência circular!');
      console.error('URL:', error.url);
      console.error('Mensagem:', error.message);

      // Tenta mostrar parte do JSON problemático
      if (error.error && error.error.text) {
        const text = error.error.text;
        console.error('Tamanho da resposta:', text.length, 'caracteres');
        console.error('Início do JSON:', text.substring(0, 500));
        console.error('Fim do JSON:', text.substring(Math.max(0, text.length - 500)));

        // Tenta identificar o erro de sintaxe
        const match = error.message.match(/position (\d+)/);
        if (match) {
          const pos = parseInt(match[1]);
          console.error('Posição do erro:', pos);
          console.error('Contexto do erro:', text.substring(Math.max(0, pos - 100), Math.min(text.length, pos + 100)));
        }
      }
    } else {
      // Erro do lado do servidor
      switch (error.status) {
        case 0:
          errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
          break;
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