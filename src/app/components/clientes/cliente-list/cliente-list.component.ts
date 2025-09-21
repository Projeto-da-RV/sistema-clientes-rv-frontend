import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../models/cliente.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.scss',
  changeDetection: ChangeDetectionStrategy.Default // Força estratégia padrão
})
export class ClienteListComponent implements OnInit {
  
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  loading = false;
  
  // Filtros
  filtroNome = '';
  filtroCpf = '';
  
  constructor(
    private clienteService: ClienteService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone // Adiciona NgZone para forçar detecção
  ) {}

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.loading = true;
    
    this.clienteService.listarTodos().subscribe({
      next: (clientes) => {
        // Força execução dentro da zona do Angular
        this.ngZone.run(() => {
          this.clientes = clientes;
          this.clientesFiltrados = [...clientes];
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
        this.ngZone.run(() => {
          this.notificationService.showError('Erro ao carregar clientes');
          this.loading = false;
        });
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.clientes];
    
    // Filtro por nome
    if (this.filtroNome.trim()) {
      resultado = resultado.filter(cliente => 
        cliente.nome.toLowerCase().includes(this.filtroNome.toLowerCase())
      );
    }
    
    // Filtro por CPF
    if (this.filtroCpf.trim()) {
      resultado = resultado.filter(cliente => 
        cliente.cpf.includes(this.filtroCpf.replace(/\D/g, ''))
      );
    }
    
    this.clientesFiltrados = resultado;
  }

  filtrar(): void {
    this.aplicarFiltros();
  }

  limparFiltros(): void {
    this.filtroNome = '';
    this.filtroCpf = '';
    this.clientesFiltrados = [...this.clientes];
  }

  buscarPorNome(): void {
    if (this.filtroNome.trim()) {
      this.loading = true;
      this.clienteService.buscarPorNome(this.filtroNome).subscribe({
        next: (clientes) => {
          // Garante que clientes seja sempre um array
          this.clientesFiltrados = Array.isArray(clientes) ? clientes : [clientes];
          this.loading = false;
          this.cdr.detectChanges(); // ÚNICA ADIÇÃO: força atualização da view
        },
        error: (error) => {
          console.error('Erro na busca:', error);
          this.notificationService.showError('Erro ao buscar clientes');
          this.loading = false;
          this.cdr.detectChanges(); // ÚNICA ADIÇÃO: força atualização da view
        }
      });
    } else {
      this.carregarClientes();
    }
  }

  buscarPorCpf(): void {
    if (this.filtroCpf.trim()) {
      this.loading = true;
      this.clienteService.buscarPorCpf(this.filtroCpf).subscribe({
        next: (clientes) => {
          // Garante que clientes seja sempre um array
          this.clientesFiltrados = Array.isArray(clientes) ? clientes : [clientes];
          this.loading = false;
          this.cdr.detectChanges(); // ÚNICA ADIÇÃO: força atualização da view
        },
        error: (error) => {
          console.error('Erro na busca:', error);
          this.notificationService.showError('Erro ao buscar clientes');
          this.loading = false;
          this.cdr.detectChanges(); // ÚNICA ADIÇÃO: força atualização da view
        }
      });
    } else {
      this.carregarClientes();
    }
  }

  confirmarExclusao(cliente: Cliente): void {
    this.notificationService.showConfirm(
      'Confirmação',
      `Tem certeza que deseja excluir o cliente "${cliente.nome}"?`,
      'question'
    ).then((result: any) => {
      if (result.isConfirmed && cliente.id) {
        this.excluirCliente(cliente.id);
      }
    });
  }

  private excluirCliente(id: number): void {
    this.clienteService.deletar(id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Cliente excluído com sucesso!');
        this.carregarClientes();
      },
      error: (error) => {
        console.error('Erro ao excluir cliente:', error);
        this.notificationService.showError('Erro ao excluir cliente');
      }
    });
  }

  get contadorResultados(): string {
    const total = this.clientesFiltrados.length;
    if (total === 0) return 'Nenhum cliente encontrado';
    if (total === 1) return '1 cliente encontrado';
    return `${total} clientes encontrados`;
  }
}