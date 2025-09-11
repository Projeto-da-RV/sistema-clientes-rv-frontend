import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  // Alias for compatibility with existing code
  listarTodas(): Observable<Categoria[]> {
    return this.listarTodos();
  }

  // GET /categorias/ativas
  buscarAtivas(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/ativas`)
      .pipe(catchError(this.handleError));
  }
}