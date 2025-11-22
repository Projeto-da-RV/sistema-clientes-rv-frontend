import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

  /**
   * Busca formas de pagamento ativas
   * GET /api/servicos/ativos
   * @returns Observable com lista de serviços ativos
   */
  buscarAtivos(): Observable<Servico[]> {
    return this.http.get<Servico[]>(`${this.apiUrl}/ativos`, this.httpOptions)
      .pipe(
        map(response => response || []),
        catchError(this.handleError)
      );
  }

  /**
   * Busca formas de pagamento por nome
   * GET /api/servicos/buscar?nome={nome}
   * @param nome Nome do serviço
   * @returns Observable com lista de serviços
   */
  override buscarPorNome(nome: string): Observable<Servico[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<Servico[]>(`${this.apiUrl}/buscar`, {
      params,
      headers: this.httpOptions.headers
    })
      .pipe(
        map(response => response || []),
        catchError(this.handleError)
      );
  }

  /**
   * Busca formas de pagamento por tipo
   * GET /api/servicos/tipo/{tipo}
   * @param tipo Tipo do serviço (TRANSFERENCIA, BOLETO, CARTAO, DEBITO_CONTA)
   * @returns Observable com lista de serviços
   */
  buscarPorTipo(tipo: string): Observable<Servico[]> {
    return this.http.get<Servico[]>(`${this.apiUrl}/tipo/${tipo}`, this.httpOptions)
      .pipe(
        map(response => response || []),
        catchError(this.handleError)
      );
  }
}