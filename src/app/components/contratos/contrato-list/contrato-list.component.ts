import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContratoService } from '../../../services/contrato.service';
import { Contrato } from '../../../models/contrato.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-contrato-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './contrato-list.component.html',
  styleUrl: './contrato-list.component.scss',
  changeDetection: ChangeDetectionStrategy.Default // Força estratégia padrão
})
export class ContratoListComponent implements OnInit {
  
  contratos: Contrato[] = [];
  contratosFiltrados: Contrato[] = [];
  loading = false;
  
  // Filtros
  filtroStatus = '';
  filtroCliente = '';
  mostrarAtivos = false;
  
  constructor(
    private contratoService: ContratoService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone // Adiciona NgZone para forçar detecção
  ) {}

  ngOnInit(): void {
    this.carregarContratos();
  }

  carregarContratos(): void {
    this.loading = true;
    
    this.contratoService.listarTodos().subscribe({
      next: (contratos) => {
        // Força execução dentro da zona do Angular
        this.ngZone.run(() => {
          this.contratos = contratos;
          this.contratosFiltrados = [...contratos];
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Erro ao carregar contratos:', error);
        this.ngZone.run(() => {
          this.notificationService.showError('Erro ao carregar contratos');
          this.loading = false;
        });
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.contratos];
    
    // Filtro por status
    if (this.filtroStatus.trim()) {
      resultado = resultado.filter(contrato => 
        contrato.status === this.filtroStatus
      );
    }
    
    // Filtro por cliente
    if (this.filtroCliente.trim()) {
      resultado = resultado.filter(contrato => 
        this.getClienteNome(contrato).toLowerCase().includes(this.filtroCliente.toLowerCase())
      );
    }
    
    // Filtro por status ativo
    if (this.mostrarAtivos) {
      resultado = resultado.filter(contrato => contrato.status === 'ATIVO');
    }
    
    this.contratosFiltrados = resultado;
  }

  filtrar(): void {
    this.aplicarFiltros();
  }

  toggleMostrarAtivos(): void {
    this.aplicarFiltros();
  }

  limparFiltros(): void {
    this.filtroStatus = '';
    this.filtroCliente = '';
    this.mostrarAtivos = false;
    this.contratosFiltrados = [...this.contratos];
  }

  buscarPorCliente(): void {
    if (this.filtroCliente.trim()) {
      this.loading = true;
      // Simula busca por cliente (ajustar conforme service real)
      setTimeout(() => {
        this.aplicarFiltros();
        this.loading = false;
        this.cdr.detectChanges();
      }, 300);
    } else {
      this.carregarContratos();
    }
  }

  confirmarExclusao(contrato: Contrato): void {
    this.notificationService.showConfirm(
      'Confirmação',
      `Tem certeza que deseja excluir o contrato ID ${contrato.id}?`,
      'question'
    ).then((result: any) => {
      if (result.isConfirmed && contrato.id) {
        this.excluirContrato(contrato.id);
      }
    });
  }

  private excluirContrato(id: number): void {
    this.contratoService.deletar(id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Contrato excluído com sucesso!');
        this.carregarContratos();
      },
      error: (error) => {
        console.error('Erro ao excluir contrato:', error);
        this.notificationService.showError('Erro ao excluir contrato');
      }
    });
  }

  // Métodos auxiliares
  getClienteNome(contrato: Contrato): string {
    if (typeof contrato.cliente === 'object' && contrato.cliente && 'nome' in contrato.cliente) {
      return contrato.cliente.nome;
    }
    return contrato.cliente ? String(contrato.cliente) : '-';
  }

  getStatusTexto(status: string | undefined): string {
    if (!status) return 'Pendente';
    
    const statusMap: { [key: string]: string } = {
      'PENDENTE': 'Pendente',
      'ATIVO': 'Ativo',
      'CONCLUIDO': 'Concluído',
      'CANCELADO': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  formatarValor(valor: number | undefined): string {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  get contadorResultados(): string {
    const total = this.contratosFiltrados.length;
    if (total === 0) return 'Nenhum contrato encontrado';
    if (total === 1) return '1 contrato encontrado';
    return `${total} contratos encontrados`;
  }
}