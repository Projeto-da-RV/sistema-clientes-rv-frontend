import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MetodoPagamento, GerarQRCodePIXRequest, TipoMetodoPagamento, StatusMetodoPagamento } from '../models/metodo-pagamento.model';
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
   * Busca todos os métodos de pagamento de um cliente específico
   * @param clienteId ID do cliente
   * @returns Observable com lista de MetodoPagamento
   */
  buscarPorCliente(clienteId: number): Observable<MetodoPagamento[]> {
    return this.http.get<MetodoPagamento[]>(`${this.apiUrl}/cliente/${clienteId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Busca métodos de pagamento por tipo
   * @param tipo Tipo do método de pagamento (PIX, BOLETO, CARTAO_CREDITO, CARTAO_DEBITO)
   * @returns Observable com lista de MetodoPagamento
   */
  buscarPorTipo(tipo: TipoMetodoPagamento): Observable<MetodoPagamento[]> {
    return this.http.get<MetodoPagamento[]>(`${this.apiUrl}/tipo/${tipo}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Busca métodos de pagamento por status
   * @param status Status do método de pagamento (ATIVO, INATIVO)
   * @returns Observable com lista de MetodoPagamento
   */
  buscarPorStatus(status: StatusMetodoPagamento): Observable<MetodoPagamento[]> {
    return this.http.get<MetodoPagamento[]>(`${this.apiUrl}/status/${status}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Busca todos os métodos PIX que possuem QR Code gerado
   * @returns Observable com lista de MetodoPagamento do tipo PIX com QR Code
   */
  buscarPIXComQRCode(): Observable<MetodoPagamento[]> {
    return this.http.get<MetodoPagamento[]>(`${this.apiUrl}/pix-com-qrcode`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gera QR Code PIX para um método de pagamento
   * @param id ID do método de pagamento (deve ser do tipo PIX)
   * @param request Dados para geração do QR Code (valor e descrição)
   * @returns Observable com MetodoPagamento atualizado contendo o QR Code
   */
  gerarQRCodePIX(id: number, request: GerarQRCodePIXRequest): Observable<MetodoPagamento> {
    return this.http.post<MetodoPagamento>(`${this.apiUrl}/${id}/gerar-qrcode-pix`, request)
      .pipe(catchError(this.handleError));
  }
}
