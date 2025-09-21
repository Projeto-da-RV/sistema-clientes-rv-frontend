import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

/**
 * Configuração para diálogos de confirmação
 */
export interface ConfirmConfig {
  title: string;
  text: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: SweetAlertIcon;
}

/**
 * Serviço centralizado para notificações e alertas
 * Encapsula SweetAlert2 e padroniza mensagens em todo o sistema
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  /**
   * Exibe notificação de sucesso
   */
  success(message: string, title?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'success',
      title: title || 'Sucesso!',
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#28a745'
    });
  }

  /**
   * Alias para success - mantém compatibilidade
   */
  showSuccess(message: string, title?: string): Promise<SweetAlertResult> {
    return this.success(message, title);
  }

  /**
   * Exibe notificação de erro
   */
  error(message: string, title?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'error',
      title: title || 'Erro!',
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc3545'
    });
  }

  /**
   * Alias para error - mantém compatibilidade
   */
  showError(message: string, title?: string): Promise<SweetAlertResult> {
    return this.error(message, title);
  }

  /**
   * Exibe notificação de aviso
   */
  warning(message: string, title?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'warning',
      title: title || 'Atenção!',
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#ffc107'
    });
  }

  /**
   * Exibe notificação de informação
   */
  info(message: string, title?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'info',
      title: title || 'Informação',
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#17a2b8'
    });
  }

  /**
   * Exibe diálogo de confirmação
   */
  confirm(config: ConfirmConfig): Promise<boolean> {
    return Swal.fire({
      icon: config.icon || 'question',
      title: config.title,
      text: config.text,
      showCancelButton: true,
      confirmButtonText: config.confirmButtonText || 'Sim',
      cancelButtonText: config.cancelButtonText || 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      reverseButtons: true
    }).then((result) => {
      return result.isConfirmed;
    });
  }

  /**
   * Alias para confirm - mantém compatibilidade com diferentes assinaturas
   */
  showConfirm(title: string, text: string, icon?: SweetAlertIcon): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: icon || 'question',
      title: title,
      text: text,
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      reverseButtons: true
    });
  }

  /**
   * Diálogo específico para confirmação de exclusão
   */
  confirmDelete(itemName?: string): Promise<boolean> {
    const text = itemName 
      ? `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`
      : 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.';

    return this.confirm({
      title: 'Confirmar Exclusão',
      text: text,
      icon: 'warning',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });
  }

  /**
   * Exibe toast de notificação pequena
   */
  toast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: type,
      title: message
    });
  }

  /**
   * Exibe loading
   */
  showLoading(message: string = 'Carregando...'): void {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  /**
   * Fecha qualquer modal aberto
   */
  close(): void {
    Swal.close();
  }
}