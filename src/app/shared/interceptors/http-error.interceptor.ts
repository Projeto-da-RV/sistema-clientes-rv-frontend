import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

/**
 * Interceptor funcional para tratamento centralizado de erros HTTP
 * Integra com o NotificationService para exibir notificações consistentes
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro inesperado';
      let errorTitle = 'Erro';

      if (error.error instanceof ErrorEvent) {
        // Erro do lado do cliente
        errorMessage = `Erro: ${error.error.message}`;
        errorTitle = 'Erro de Rede';
      } else {
        // Erro do lado do servidor
        switch (error.status) {
          case 400:
            errorTitle = 'Requisição Inválida';
            errorMessage = error.error?.message || 'Dados fornecidos são inválidos';
            break;
          case 401:
            errorTitle = 'Não Autorizado';
            errorMessage = 'Você não tem permissão para acessar este recurso';
            break;
          case 403:
            errorTitle = 'Acesso Negado';
            errorMessage = 'Você não tem permissão para realizar esta operação';
            break;
          case 404:
            errorTitle = 'Não Encontrado';
            errorMessage = error.error?.message || 'Recurso não encontrado';
            break;
          case 409:
            errorTitle = 'Conflito';
            errorMessage = error.error?.message || 'Conflito com dados existentes';
            break;
          case 422:
            errorTitle = 'Dados Inválidos';
            errorMessage = error.error?.message || 'Os dados fornecidos não são válidos';
            break;
          case 500:
            errorTitle = 'Erro do Servidor';
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            break;
          case 502:
          case 503:
          case 504:
            errorTitle = 'Serviço Indisponível';
            errorMessage = 'O serviço está temporariamente indisponível. Tente novamente mais tarde.';
            break;
          default:
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else {
              errorMessage = `Erro ${error.status}: ${error.statusText}`;
            }
        }
      }

      // Exibe a notificação de erro usando o NotificationService
      notificationService.error(errorMessage, errorTitle);

      // Re-lança o erro para que os componentes possam tratar se necessário
      return throwError(() => error);
    })
  );
};