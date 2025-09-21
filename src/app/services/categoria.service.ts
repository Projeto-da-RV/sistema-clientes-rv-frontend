import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Categoria } from '../models/categoria.model';
import { BaseCrudService } from '../shared/services/base-crud.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService extends BaseCrudService<Categoria> {
  protected readonly resourcePath = 'categorias';

  constructor(http: HttpClient) {
    super(http);
  }

  buscarAtivas(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/ativas`)
      .pipe(catchError(this.handleError));
  }

  override buscarPorNome(nome: string): Observable<Categoria[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<Categoria[]>(`${this.apiUrl}/buscar`, { params })
      .pipe(catchError(this.handleError));
  }
}