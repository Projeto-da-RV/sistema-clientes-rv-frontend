import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Servico } from '../models/servico.model';
import { BaseCrudService } from '../shared/services/base-crud.service';

@Injectable({
  providedIn: 'root'
})
export class ServicoService extends BaseCrudService<Servico> {
  protected readonly resourcePath = 'servicos';

  constructor(http: HttpClient) {
    super(http);
  }

  buscarAtivos(): Observable<Servico[]> {
    return this.http.get<Servico[]>(`${this.apiUrl}/ativos`)
      .pipe(catchError(this.handleError));
  }

  override buscarPorNome(nome: string): Observable<Servico[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<Servico[]>(`${this.apiUrl}/buscar`, { params })
      .pipe(catchError(this.handleError));
  }

  buscarPorCategoria(categoria: string): Observable<Servico[]> {
    return this.http.get<Servico[]>(`${this.apiUrl}/categoria/${categoria}`)
      .pipe(catchError(this.handleError));
  }
}