import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

/**
 * Serviço base abstrato para operações CRUD padrão.
 * Fornece métodos comuns para todos os serviços de entidades do sistema.
 * Implementa tratamento padronizado de erros com SweetAlert.
 */
@Injectable()
export abstract class BaseService<T> {
  
  // URL base da API - deve ser definida pelas classes filhas
  protected abstract baseUrl: string;
  
  constructor(protected http: HttpClient) {}
  
  /**
   * Lista todas as entidades do tipo T
   */
  listarTodos(): Observable<T[]> {
    console.log(`BaseService: Listando todos os registros de ${this.baseUrl}`);
    return this.http.get<T[]>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }
  
  /**
   * Busca uma entidade por ID
   */
  buscarPorId(id: number): Observable<T> {
    console.log(`BaseService: Buscando registro por ID ${id} em ${this.baseUrl}`);
    return this.http.get<T>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }
  
  /**
   * Cria uma nova entidade
   */
  criar(entity: T): Observable<T> {
    console.log(`BaseService: Criando novo registro em ${this.baseUrl}`, entity);
    return this.http.post<T>(this.baseUrl, entity)
      .pipe(catchError(this.handleError));
  }
  
  /**
   * Atualiza uma entidade existente
   */
  atualizar(id: number, entity: T): Observable<T> {
    console.log(`BaseService: Atualizando registro ID ${id} em ${this.baseUrl}`, entity);
    return this.http.put<T>(`${this.baseUrl}/${id}`, entity)
      .pipe(catchError(this.handleError));
  }
  
  /**
   * Remove uma entidade por ID
   */
  deletar(id: number): Observable<void> {
    console.log(`BaseService: Deletando registro ID ${id} em ${this.baseUrl}`);
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }
  
  /**
   * Método protegido para tratamento padronizado de erros HTTP.
   * Exibe mensagens de erro usando SweetAlert e faz log dos erros.
   * Tratamento especial para erros de validação do backend com GlobalExceptionHandler.
   */
  protected handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('BaseService: Erro na requisição HTTP:', error);
    
    let mensagem = 'Erro interno do servidor';
    let titulo = 'Erro!';
    
    // Tratamento baseado no status HTTP
    switch (error.status) {
      case 400:
        titulo = 'Dados Inválidos';
        mensagem = this.extrairMensagemErro(error);
        break;
        
      case 401:
        titulo = 'Não Autorizado';
        mensagem = 'Você não tem autorização para realizar esta operação.';
        break;
        
      case 403:
        titulo = 'Acesso Negado';
        mensagem = 'Você não tem permissão para acessar este recurso.';
        break;
        
      case 404:
        titulo = 'Não Encontrado';
        mensagem = 'O recurso solicitado não foi encontrado.';
        break;
        
      case 409:
        titulo = 'Conflito';
        mensagem = this.extrairMensagemErro(error);
        break;
        
      case 500:
        titulo = 'Erro Interno';
        mensagem = 'Erro interno do servidor. Tente novamente mais tarde.';
        break;
        
      case 0:
        titulo = 'Erro de Conexão';
        mensagem = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        break;
        
      default:
        mensagem = this.extrairMensagemErro(error);
        break;
    }
    
    // Exibir erro usando SweetAlert2 com tema RV Digital
    Swal.fire({
      icon: 'error',
      title: titulo,
      text: mensagem,
      confirmButtonColor: '#0066cc',
      confirmButtonText: 'Entendido'
    });
    
    return throwError(() => error);
  };
  
  /**
   * Extrai a mensagem de erro do response do backend.
   * Trata diferentes formatos de erro enviados pelo GlobalExceptionHandler.
   */
  private extrairMensagemErro(error: HttpErrorResponse): string {
    
    if (!error.error) {
      return 'Erro desconhecido';
    }
    
    // Caso 1: Erro simples (string) - Exception padrão
    if (typeof error.error === 'string') {
      return error.error;
    }
    
    // Caso 2: Erro com propriedade message
    if (error.error.message) {
      return error.error.message;
    }
    
    // Caso 3: Erros de validação (Map<String, String>) - MethodArgumentNotValidException
    if (typeof error.error === 'object') {
      const erros = Object.entries(error.error)
        .map(([campo, mensagem]) => `${campo}: ${mensagem}`)
        .join('\n');
      
      if (erros) {
        return erros;
      }
    }
    
    // Caso 4: Fallback para erro genérico
    return 'Erro interno do servidor';
  }
  
  /**
   * Método utilitário para exibir mensagens de sucesso.
   * Padroniza as mensagens de sucesso em toda a aplicação.
   */
  protected mostrarSucesso(titulo: string, texto: string, timer?: number): void {
    Swal.fire({
      icon: 'success',
      title: titulo,
      text: texto,
      confirmButtonColor: '#0066cc',
      timer: timer,
      showConfirmButton: !timer
    });
  }
  
  /**
   * Método utilitário para exibir confirmações.
   * Usado antes de operações destrutivas como exclusão.
   */
  protected confirmarAcao(titulo: string, texto: string): Promise<boolean> {
    return Swal.fire({
      title: titulo,
      text: texto,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sim, confirmar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => result.isConfirmed);
  }
}