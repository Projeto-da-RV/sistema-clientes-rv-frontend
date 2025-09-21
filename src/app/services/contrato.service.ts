import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Contrato } from '../models/contrato.model';
import { BaseCrudService } from '../shared/services/base-crud.service';

@Injectable({
  providedIn: 'root'
})
export class ContratoService extends BaseCrudService<Contrato> {
  protected readonly resourcePath = 'contratos';

  constructor(http: HttpClient) {
    super(http);
  }

  buscarPorCliente(clienteId: number): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(`${this.apiUrl}/cliente/${clienteId}`)
      .pipe(catchError(this.handleError));
  }

  buscarPorStatus(status: string): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(`${this.apiUrl}/status/${status}`)
      .pipe(catchError(this.handleError));
  }
}