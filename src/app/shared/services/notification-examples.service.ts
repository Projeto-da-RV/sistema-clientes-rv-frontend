import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationService } from './notification.service';

/**
 * Serviço de exemplo que demonstra o uso do NotificationService
 * e como o HttpErrorInterceptor funciona automaticamente
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationExamplesService {

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  /**
   * Exemplo 1: Uso básico do NotificationService para mensagens de sucesso
   */
  showSuccessExample(): void {
    this.notificationService.success('Operação realizada com sucesso!');
  }

  /**
   * Exemplo 2: Uso de diferentes tipos de notificações
   */
  showDifferentNotificationTypes(): void {
    // Sucesso
    this.notificationService.success('Dados salvos com sucesso!', 'Sucesso');
    
    // Aviso (com delay para ver melhor)
    setTimeout(() => {
      this.notificationService.warning('Atenção: Alguns campos podem estar vazios', 'Atenção');
    }, 1000);
    
    // Informação
    setTimeout(() => {
      this.notificationService.info('Esta é uma mensagem informativa', 'Informação');
    }, 2000);
  }

  /**
   * Exemplo 3: Uso de confirmações
   */
  async showConfirmationExample(): Promise<void> {
    const confirmed = await this.notificationService.confirm({
      title: 'Confirmar Ação',
      text: 'Deseja continuar com esta operação?',
      confirmButtonText: 'Sim, continuar',
      cancelButtonText: 'Cancelar',
      icon: 'question'
    });

    if (confirmed) {
      this.notificationService.success('Operação confirmada!');
    } else {
      this.notificationService.info('Operação cancelada');
    }
  }

  /**
   * Exemplo 4: Confirmação de exclusão específica
   */
  async showDeleteConfirmationExample(): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete('Item de Teste');
    
    if (confirmed) {
      // Simula uma operação de exclusão
      this.notificationService.success('Item excluído com sucesso!');
    }
  }

  /**
   * Exemplo 5: Notificações toast (pequenas, no canto)
   */
  showToastExamples(): void {
    this.notificationService.toast('Toast de sucesso!', 'success');
    
    setTimeout(() => {
      this.notificationService.toast('Toast de aviso', 'warning');
    }, 1500);
    
    setTimeout(() => {
      this.notificationService.toast('Toast de erro', 'error');
    }, 3000);
  }

  /**
   * Exemplo 6: Loading com fechamento automático
   */
  showLoadingExample(): void {
    this.notificationService.showLoading('Processando dados...');
    
    // Simula uma operação que demora 3 segundos
    setTimeout(() => {
      this.notificationService.close();
      this.notificationService.success('Processamento concluído!');
    }, 3000);
  }

  /**
   * Exemplo 7: Como o HttpErrorInterceptor funciona automaticamente
   * Faz uma requisição para uma URL inexistente para demonstrar o tratamento de erro
   */
  demonstrateHttpErrorHandling(): void {
    // Esta requisição vai falhar e será tratada automaticamente pelo HttpErrorInterceptor
    this.http.get('/api/nonexistent-endpoint').subscribe({
      next: (data) => {
        // Este código nunca será executado
        console.log('Sucesso:', data);
      },
      error: (error) => {
        // O erro já foi tratado pelo interceptor e a notificação já foi exibida
        // Aqui você pode adicionar lógica específica do componente se necessário
        console.log('Erro capturado pelo componente (após interceptor):', error);
      }
    });
  }

  /**
   * Exemplo 8: Tratamento de erro personalizado (quando você quer sobrescrever o interceptor)
   */
  demonstrateCustomErrorHandling(): void {
    this.http.get('/api/another-nonexistent-endpoint').subscribe({
      next: (data) => {
        console.log('Sucesso:', data);
      },
      error: (error) => {
        // Se você quiser um tratamento específico, pode usar o NotificationService diretamente
        this.notificationService.error(
          'Erro customizado específico para este caso', 
          'Erro Personalizado'
        );
      }
    });
  }

  /**
   * Exemplo 9: Combinando loading, operação e resultado
   */
  async demonstrateCompleteFlow(): Promise<void> {
    try {
      // Mostra loading
      this.notificationService.showLoading('Salvando dados...');
      
      // Simula uma operação assíncrona (pode ser uma requisição HTTP)
      await this.simulateAsyncOperation();
      
      // Fecha loading
      this.notificationService.close();
      
      // Mostra sucesso
      this.notificationService.success('Dados salvos com sucesso!');
      
    } catch (error) {
      // Fecha loading em caso de erro
      this.notificationService.close();
      
      // O erro já foi tratado pelo interceptor, mas podemos adicionar lógica específica
      console.error('Erro na operação:', error);
    }
  }

  /**
   * Simula uma operação assíncrona que pode falhar
   */
  private simulateAsyncOperation(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 70% de chance de sucesso
        if (Math.random() > 0.3) {
          resolve();
        } else {
          reject(new Error('Simulação de erro'));
        }
      }, 2000);
    });
  }
}