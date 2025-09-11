import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  // GET /servicos/ativos
  buscarAtivos(): Observable<Servico[]> {
    return this.http.get<Servico[]>(`${this.apiUrl}/ativos`)
      .pipe(catchError(this.handleError));
  }

  // GET /servicos/categoria/{categoria}
  buscarPorCategoria(categoria: string): Observable<Servico[]> {
    return this.http.get<Servico[]>(`${this.apiUrl}/categoria/${categoria}`)
      .pipe(catchError(this.handleError));
  }
}