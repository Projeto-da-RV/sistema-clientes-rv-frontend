import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';
import {
  ConfirmDialogConfig,
  ConfirmDialogResult,
  DEFAULT_CONFIRM_DIALOG_CONFIG,
  CONFIRM_DIALOG_PRESETS
} from '../interfaces/confirm-dialog-config.interface';

/**
 * Serviço para diálogos de confirmação tipados
 * Wrapper estruturado para SweetAlert2 com configuração tipada
 * 
 * @example
 * // Usando preset
 * const result = await this.confirmDialog.show(CONFIRM_DIALOG_PRESETS.DELETE);
 * if (result.confirmed) {
 *   // Executar exclusão
 * }
 * 
 * @example
 * // Configuração customizada
 * const result = await this.confirmDialog.show({
 *   title: 'Confirmar Ação',
 *   message: 'Deseja executar esta ação?',
 *   icon: 'warning',
 *   confirmColor: 'danger'
 * });
 * 
 * @example
 * // Dialog com input (prompt)
 * const result = await this.confirmDialog.prompt({
 *   title: 'Renomear Item',
 *   message: 'Digite o novo nome:',
 *   input: {
 *     type: 'text',
 *     placeholder: 'Nome do item',
 *     value: currentName,
 *     validator: (value) => !value ? 'Nome é obrigatório' : null
 *   }
 * });
 * if (result.confirmed) {
 *   console.log('Novo nome:', result.value);
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  /**
   * Static reference to presets for use in templates
   */
  static readonly PRESETS = CONFIRM_DIALOG_PRESETS;

  /**
   * Shows a confirmation dialog
   */
  async show(config: ConfirmDialogConfig): Promise<ConfirmDialogResult> {
    const effectiveConfig = {
      ...DEFAULT_CONFIRM_DIALOG_CONFIG,
      ...config
    } as ConfirmDialogConfig;

    const swalConfig = this.buildSwalConfig(effectiveConfig);
    
    try {
      const result = await Swal.fire(swalConfig);
      return this.mapSwalResult(result);
    } catch (error) {
      console.error('Error showing confirm dialog:', error);
      return {
        confirmed: false,
        dismissed: true,
        dismissReason: 'cancel'
      };
    }
  }

  /**
   * Shows a delete confirmation dialog
   */
  async confirmDelete(itemName?: string, customMessage?: string): Promise<boolean> {
    const message = customMessage || 
      (itemName 
        ? `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`
        : CONFIRM_DIALOG_PRESETS.DELETE.message);

    const result = await this.show({
      ...CONFIRM_DIALOG_PRESETS.DELETE,
      message
    });

    return result.confirmed;
  }

  /**
   * Shows a save confirmation dialog
   */
  async confirmSave(): Promise<boolean> {
    const result = await this.show(CONFIRM_DIALOG_PRESETS.SAVE);
    return result.confirmed;
  }

  /**
   * Shows a discard changes confirmation dialog
   */
  async confirmDiscard(): Promise<boolean> {
    const result = await this.show(CONFIRM_DIALOG_PRESETS.DISCARD);
    return result.confirmed;
  }

  /**
   * Shows a logout confirmation dialog
   */
  async confirmLogout(): Promise<boolean> {
    const result = await this.show(CONFIRM_DIALOG_PRESETS.LOGOUT);
    return result.confirmed;
  }

  /**
   * Shows a prompt dialog with input field
   */
  async prompt(config: ConfirmDialogConfig): Promise<ConfirmDialogResult> {
    if (!config.input) {
      throw new Error('Input configuration is required for prompt dialogs');
    }

    return await this.show(config);
  }

  /**
   * Shows a simple text prompt
   */
  async promptText(
    title: string, 
    message: string, 
    placeholder?: string, 
    defaultValue?: string
  ): Promise<ConfirmDialogResult> {
    return await this.prompt({
      title,
      message,
      icon: 'question',
      input: {
        type: 'text',
        placeholder,
        value: defaultValue
      }
    });
  }

  /**
   * Shows a select prompt
   */
  async promptSelect(
    title: string, 
    message: string, 
    options: Record<string, string> | string[]
  ): Promise<ConfirmDialogResult> {
    return await this.prompt({
      title,
      message,
      icon: 'question',
      input: {
        type: 'select',
        options
      }
    });
  }

  /**
   * Shows a loading dialog
   */
  showLoading(title: string = 'Carregando...', allowCancel: boolean = false): void {
    Swal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: allowCancel,
      showConfirmButton: false,
      showCancelButton: allowCancel,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  /**
   * Updates loading dialog text
   */
  updateLoading(title: string): void {
    Swal.update({
      title
    });
  }

  /**
   * Closes any open dialog
   */
  close(): void {
    Swal.close();
  }

  /**
   * Checks if a dialog is currently open
   */
  isOpen(): boolean {
    return Swal.isVisible();
  }

  /**
   * Shows a toast notification
   */
  toast(
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'success',
    timer: number = 3000
  ): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer,
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
   * Builds SweetAlert2 configuration from typed config
   */
  private buildSwalConfig(config: ConfirmDialogConfig): any {
    const swalConfig: any = {
      title: config.title,
      text: config.message,
      icon: config.icon,
      showCancelButton: config.showCancelButton,
      showCloseButton: config.showCloseButton,
      allowOutsideClick: config.allowOutsideClick,
      allowEscapeKey: config.allowEscapeKey,
      reverseButtons: config.reverseButtons,
      confirmButtonText: config.confirmText,
      cancelButtonText: config.cancelText,
      confirmButtonColor: this.getButtonColor(config.confirmColor),
      cancelButtonColor: '#6c757d'
    };

    // Add HTML content if provided
    if (config.html) {
      swalConfig.html = config.html;
    }

    // Add custom class
    if (config.customClass) {
      swalConfig.customClass = {
        container: config.customClass
      };
    }

    // Add timer configuration
    if (config.timer) {
      swalConfig.timer = config.timer;
      swalConfig.timerProgressBar = config.timerProgressBar;
    }

    // Add input configuration
    if (config.input) {
      this.addInputConfig(swalConfig, config.input);
    }

    return swalConfig;
  }

  /**
   * Adds input configuration to SweetAlert2 config
   */
  private addInputConfig(swalConfig: any, inputConfig: any): void {
    swalConfig.input = inputConfig.type;

    if (inputConfig.placeholder) {
      swalConfig.inputPlaceholder = inputConfig.placeholder;
    }

    if (inputConfig.value !== undefined) {
      swalConfig.inputValue = inputConfig.value;
    }

    if (inputConfig.options) {
      swalConfig.inputOptions = inputConfig.options;
    }

    if (inputConfig.attributes) {
      swalConfig.inputAttributes = inputConfig.attributes;
    }

    if (inputConfig.validator) {
      swalConfig.inputValidator = async (value: string) => {
        try {
          const error = await inputConfig.validator(value);
          return error || undefined;
        } catch (error) {
          return 'Erro de validação';
        }
      };
    }
  }

  /**
   * Maps button color theme to hex color
   */
  private getButtonColor(color?: string): string {
    const colorMap: Record<string, string> = {
      primary: '#020096',
      danger: '#dc3545',
      warning: '#ffc107',
      success: '#28a745',
      info: '#00ceff'
    };

    return colorMap[color || 'primary'] || colorMap['primary'];
  }

  /**
   * Maps SweetAlert2 result to typed result
   */
  private mapSwalResult(result: SweetAlertResult): ConfirmDialogResult {
    const mappedResult: ConfirmDialogResult = {
      confirmed: result.isConfirmed,
      dismissed: result.isDismissed
    };

    // Add input value if present
    if (result.value !== undefined) {
      mappedResult.value = result.value;
    }

    // Add dismiss reason
    if (result.isDismissed) {
      if (result.dismiss === Swal.DismissReason.cancel) {
        mappedResult.dismissReason = 'cancel';
      } else if (result.dismiss === Swal.DismissReason.backdrop) {
        mappedResult.dismissReason = 'backdrop';
      } else if (result.dismiss === Swal.DismissReason.close) {
        mappedResult.dismissReason = 'close';
      } else if (result.dismiss === Swal.DismissReason.esc) {
        mappedResult.dismissReason = 'esc';
      } else if (result.dismiss === Swal.DismissReason.timer) {
        mappedResult.dismissReason = 'timer';
      }
    }

    return mappedResult;
  }
}

/**
 * Alias for backward compatibility with existing NotificationService
 * @deprecated Use ConfirmDialogService directly
 */
export const ConfirmDialogComponent = ConfirmDialogService;