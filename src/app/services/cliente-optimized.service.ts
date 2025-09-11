import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService } from '../shared/services/base-crud.service';
import { Cliente } from '../models/cliente.model';
import { SearchConfig } from '../shared/interfaces/base-entity.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

/**
 * Serviço otimizado para Clientes usando BaseCrudService
 * Elimina duplicação e fornece métodos específicos quando necessário
 */
@Injectable({
  providedIn: 'root'
})
export class ClienteOptimizedService extends BaseCrudService<Cliente> {
  protected readonly resourcePath = 'clientes';

  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Busca cliente por CPF (método específico)
   */
  buscarPorCpf(cpf: string): Observable<Cliente> {
    const params = new HttpParams().set('cpf', cpf);
    return this.http.get<Cliente>(`${this.apiUrl}/cpf`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Busca clientes por categoria (método específico)
   */
  buscarPorCategoria(categoriaId: number): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/categoria/${categoriaId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Busca clientes ativos (usando busca genérica)
   */
  buscarAtivos(): Observable<Cliente[]> {
    const searchConfig: SearchConfig = {
      endpoint: 'buscar',
      params: { ativo: true }
    };
    return this.buscar(searchConfig);
  }

  /**
   * Busca clientes com filtros múltiplos (usando busca genérica)
   */
  buscarComFiltros(filtros: {
    nome?: string;
    cpf?: string;
    ativo?: boolean;
    categoriaId?: number;
  }): Observable<Cliente[]> {
    const searchConfig: SearchConfig = {
      endpoint: 'buscar',
      params: filtros
    };
    return this.buscar(searchConfig);
  }

  /**
   * Método conveniência: Lista todos (override para melhor nomenclatura)
   */
  override listarTodos(): Observable<Cliente[]> {
    return super.listarTodos();
  }
}