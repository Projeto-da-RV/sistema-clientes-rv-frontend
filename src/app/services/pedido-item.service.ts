import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PedidoItem } from '../models/pedido-item.model';
import { BaseCrudService } from '../shared/services/base-crud.service';

@Injectable({
  providedIn: 'root'
})
export class PedidoItemService extends BaseCrudService<PedidoItem> {
  protected readonly resourcePath = 'pedido-itens';

  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Busca todos os itens de um contrato específico
   * @param contratoId ID do contrato
   * @returns Observable com lista de PedidoItem
   */
  buscarPorContrato(contratoId: number): Observable<PedidoItem[]> {
    return this.http.get<PedidoItem[]>(`${this.apiUrl}/contrato/${contratoId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Busca todos os itens relacionados a um serviço específico
   * @param servicoId ID do serviço
   * @returns Observable com lista de PedidoItem
   */
  buscarPorServico(servicoId: number): Observable<PedidoItem[]> {
    return this.http.get<PedidoItem[]>(`${this.apiUrl}/servico/${servicoId}`)
      .pipe(catchError(this.handleError));
  }
}
