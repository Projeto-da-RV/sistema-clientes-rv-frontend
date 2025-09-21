import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Item } from '../models/item.model';
import { BaseCrudService } from '../shared/services/base-crud.service';

@Injectable({
  providedIn: 'root'
})
export class ItemService extends BaseCrudService<Item> {
  protected readonly resourcePath = 'itens';

  constructor(http: HttpClient) {
    super(http);
  }

  buscarPorContrato(contratoId: number): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/contrato/${contratoId}`)
      .pipe(catchError(this.handleError));
  }

  buscarPorServico(servicoId: number): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/servico/${servicoId}`)
      .pipe(catchError(this.handleError));
  }
}