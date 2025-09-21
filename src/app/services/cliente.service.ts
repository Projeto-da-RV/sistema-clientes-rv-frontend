import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Cliente } from '../models/cliente.model';
import { BaseCrudService } from '../shared/services/base-crud.service';

@Injectable({
  providedIn: 'root'
})
export class ClienteService extends BaseCrudService<Cliente> {
  protected readonly resourcePath = 'clientes';

  constructor(http: HttpClient) {
    super(http);
  }

  override buscarPorNome(nome: string): Observable<Cliente[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<Cliente[]>(`${this.apiUrl}/buscar`, { params })
      .pipe(catchError(this.handleError));
  }

  buscarPorCpf(cpf: string): Observable<Cliente> {
    const params = new HttpParams().set('cpf', cpf);
    return this.http.get<Cliente>(`${this.apiUrl}/cpf`, { params })
      .pipe(catchError(this.handleError));
  }

  buscarPorCategoria(categoriaId: number): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/categoria/${categoriaId}`)
      .pipe(catchError(this.handleError));
  }
}