import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = `${environment.apiBaseUrl}/clientes`;

  constructor(private http: HttpClient) {}

  // GET /clientes
  listarTodos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  // GET /clientes/{id}
  buscarPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  // POST /clientes
  criar(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  // PUT /clientes/{id}
  atualizar(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  // DELETE /clientes/{id}
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET /clientes/buscar?nome={string}
  buscarPorNome(nome: string): Observable<Cliente[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<Cliente[]>(`${this.apiUrl}/buscar`, { params });
  }

  // GET /clientes/cpf?cpf={string}
  buscarPorCpf(cpf: string): Observable<Cliente> {
    const params = new HttpParams().set('cpf', cpf);
    return this.http.get<Cliente>(`${this.apiUrl}/cpf`, { params });
  }

  // GET /clientes/categoria/{categoriaId}
  buscarPorCategoria(categoriaId: number): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/categoria/${categoriaId}`);
  }
}