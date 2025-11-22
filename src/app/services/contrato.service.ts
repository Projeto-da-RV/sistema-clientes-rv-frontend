import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

  /**
   * Busca contas de um cliente específico
   * GET /api/contratos/cliente/{clienteId}
   * @param clienteId ID do cliente
   * @returns Observable com lista de contas
   */
  buscarPorCliente(clienteId: number): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(`${this.apiUrl}/cliente/${clienteId}`, this.httpOptions)
      .pipe(
        map(response => response || []),
        catchError(this.handleError)
      );
  }

  /**
   * Busca contas por status
   * GET /api/contratos/status/{status}
   * @param status Status da conta (PENDENTE, PAGO, VENCIDO, CANCELADO)
   * @returns Observable com lista de contas
   */
  buscarPorStatus(status: string): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(`${this.apiUrl}/status/${status}`, this.httpOptions)
      .pipe(
        map(response => response || []),
        catchError(this.handleError)
      );
  }
}