import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MetodoPagamento, GerarQRCodePIXRequest, StatusTransacao } from '../models/metodo-pagamento.model';
import { BaseCrudService } from '../shared/services/base-crud.service';

@Injectable({
  providedIn: 'root'
})
export class MetodoPagamentoService extends BaseCrudService<MetodoPagamento> {
  protected readonly resourcePath = 'metodos-pagamento';

  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Busca todas as transações de um cliente específico
   * GET /api/metodos-pagamento/cliente/{clienteId}
   * @param clienteId ID do cliente
   * @returns Observable com lista de transações
   */
  buscarPorCliente(clienteId: number): Observable<MetodoPagamento[]> {
    return this.http.get<MetodoPagamento[]>(`${this.apiUrl}/cliente/${clienteId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Busca todas as transações de um contrato específico
   * GET /api/metodos-pagamento/contrato/{contratoId}
   * @param contratoId ID do contrato
   * @returns Observable com lista de transações
   */
  buscarPorContrato(contratoId: number): Observable<MetodoPagamento[]> {
    return this.http.get<MetodoPagamento[]>(`${this.apiUrl}/contrato/${contratoId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Busca todas as transações que usaram um serviço específico
   * GET /api/metodos-pagamento/servico/{servicoId}
   * @param servicoId ID do serviço (forma de pagamento)
   * @returns Observable com lista de transações
   */
  buscarPorServico(servicoId: number): Observable<MetodoPagamento[]> {
    return this.http.get<MetodoPagamento[]>(`${this.apiUrl}/servico/${servicoId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Busca transações por status
   * GET /api/metodos-pagamento/status/{status}
   * @param status Status da transação (PENDENTE ou CONCLUIDO)
   * @returns Observable com lista de transações
   */
  buscarPorStatus(status: StatusTransacao): Observable<MetodoPagamento[]> {
    return this.http.get<MetodoPagamento[]>(`${this.apiUrl}/status/${status}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Busca todas as transações PIX que possuem QR Code gerado
   * GET /api/metodos-pagamento/pix-com-qrcode
   * @returns Observable com lista de transações PIX com QR Code
   */
  buscarPIXComQRCode(): Observable<MetodoPagamento[]> {
    return this.http.get<MetodoPagamento[]>(`${this.apiUrl}/pix-com-qrcode`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gera QR Code PIX para uma transação
   * POST /api/metodos-pagamento/{id}/gerar-qrcode-pix
   * @param id ID da transação (deve usar serviço do tipo PIX)
   * @param request Dados para geração do QR Code (valor e descrição)
   * @returns Observable com transação atualizada contendo o QR Code
   */
  gerarQRCodePIX(id: number, request: GerarQRCodePIXRequest): Observable<MetodoPagamento> {
    return this.http.post<MetodoPagamento>(`${this.apiUrl}/${id}/gerar-qrcode-pix`, request)
      .pipe(catchError(this.handleError));
  }
}
