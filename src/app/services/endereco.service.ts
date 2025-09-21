import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Endereco } from '../models/endereco.model';
import { BaseCrudService } from '../shared/services/base-crud.service';

@Injectable({
  providedIn: 'root'
})
export class EnderecoService extends BaseCrudService<Endereco> {
  protected readonly resourcePath = 'enderecos';

  constructor(http: HttpClient) {
    super(http);
  }

  buscarPorCliente(clienteId: number): Observable<Endereco[]> {
    return this.http.get<Endereco[]>(`${this.apiUrl}/cliente/${clienteId}`)
      .pipe(catchError(this.handleError));
  }

  buscarPorCidade(cidade: string): Observable<Endereco[]> {
    const params = new HttpParams().set('cidade', cidade);
    return this.http.get<Endereco[]>(`${this.apiUrl}/buscar`, { params })
      .pipe(catchError(this.handleError));
  }
}