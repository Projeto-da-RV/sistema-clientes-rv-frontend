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
   * Diálogo específico para confirmação de exclusão
   */
  confirmDelete(itemName?: string): Promise<boolean> {
    const text = itemName 
      ? `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`
      : 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.';
      
    return this.confirm({
      title: 'Confirmar Exclusão',
      text,
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
      icon: 'warning'
    });
  }

  /**
   * Notificação toast (pequena, no canto da tela)
   */
  toast(message: string, icon: SweetAlertIcon = 'success'): void {
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
      icon,
      title: message
    });
  }

  /**
   * Loading com possibilidade de cancelamento
   */
  showLoading(title?: string): void {
    Swal.fire({
      title: title || 'Carregando...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  /**
   * Fecha qualquer diálogo aberto
   */
  close(): void {
    Swal.close();
  }
}