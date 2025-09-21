import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EnderecoService } from '../../../services/endereco.service';
import { ClienteService } from '../../../services/cliente.service';
import { Endereco } from '../../../models/endereco.model';
import { Cliente } from '../../../models/cliente.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-endereco-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './endereco-list.component.html',
  styleUrl: './endereco-list.component.scss',
  changeDetection: ChangeDetectionStrategy.Default // Força estratégia padrão
})
export class EnderecoListComponent implements OnInit {
  
  enderecos: Endereco[] = [];
  enderecosFiltrados: Endereco[] = [];
  clientes: Cliente[] = [];
  loading = false;
  
  // Filtros
  clienteSelecionado: number | null = null;
  filtroCidade = '';
  apenasPrivados = false;
  
  constructor(
    private enderecoService: EnderecoService,
    private clienteService: ClienteService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone // Adiciona NgZone para forçar detecção
  ) {}

  ngOnInit(): void {
    this.carregarClientes();
    this.carregarEnderecos();
  }

  carregarClientes(): void {
    this.clienteService.listarTodos().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
      }
    });
  }

  carregarEnderecos(): void {
    this.loading = true;
    
    this.enderecoService.listarTodos().subscribe({
      next: (enderecos) => {
        // Força execução dentro da zona do Angular
        this.ngZone.run(() => {
          this.enderecos = enderecos;
          this.enderecosFiltrados = [...enderecos];
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Erro ao carregar endereços:', error);
        this.ngZone.run(() => {
          this.notificationService.showError('Erro ao carregar endereços');
          this.loading = false;
        });
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.enderecos];
    
    // Filtro por cliente
    if (this.clienteSelecionado) {
      resultado = resultado.filter(endereco => {
        if (typeof endereco.cliente === 'object' && endereco.cliente && 'id' in endereco.cliente) {
          return endereco.cliente.id === this.clienteSelecionado;
        }
        return false;
      });
    }
    
    // Filtro por cidade
    if (this.filtroCidade.trim()) {
      resultado = resultado.filter(endereco => 
        endereco.cidade.toLowerCase().includes(this.filtroCidade.toLowerCase())
      );
    }
    
    // Filtro por endereços principais
    if (this.apenasPrivados) {
      resultado = resultado.filter(endereco => endereco.principal);
    }
    
    this.enderecosFiltrados = resultado;
  }

  filtrar(): void {
    this.aplicarFiltros();
  }

  filtrarPorCliente(): void {
    this.aplicarFiltros();
  }

  toggleApenasPrivados(): void {
    this.aplicarFiltros();
  }

  limparFiltros(): void {
    this.clienteSelecionado = null;
    this.filtroCidade = '';
    this.apenasPrivados = false;
    this.enderecosFiltrados = [...this.enderecos];
  }

  filtrarPorCidade(): void {
    if (this.filtroCidade.trim()) {
      this.loading = true;
      // Simula busca por cidade (ajustar conforme service real)
      setTimeout(() => {
        this.aplicarFiltros();
        this.loading = false;
        this.cdr.detectChanges();
      }, 300);
    } else {
      this.carregarEnderecos();
    }
  }

  confirmarExclusao(endereco: Endereco): void {
    const clienteNome = this.getClienteNome(endereco);
    this.notificationService.showConfirm(
      'Confirmação',
      `Tem certeza que deseja excluir o endereço de ${clienteNome}?`,
      'question'
    ).then((result: any) => {
      if (result.isConfirmed && endereco.id) {
        this.excluirEndereco(endereco.id);
      }
    });
  }

  private excluirEndereco(id: number): void {
    this.enderecoService.deletar(id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Endereço excluído com sucesso!');
        this.carregarEnderecos();
      },
      error: (error) => {
        console.error('Erro ao excluir endereço:', error);
        this.notificationService.showError('Erro ao excluir endereço');
      }
    });
  }

  // Métodos auxiliares
  getClienteNome(endereco: Endereco): string {
    if (typeof endereco.cliente === 'object' && endereco.cliente && 'nome' in endereco.cliente) {
      return endereco.cliente.nome;
    }
    return endereco.cliente ? String(endereco.cliente) : '-';
  }

  formatarCep(cep: string): string {
    if (!cep) return '-';
    // Remove caracteres não numéricos
    const apenasNumeros = cep.replace(/\D/g, '');
    // Aplica formatação 00000-000
    if (apenasNumeros.length === 8) {
      return `${apenasNumeros.substring(0, 5)}-${apenasNumeros.substring(5)}`;
    }
    return cep; // Retorna original se não for possível formatar
  }

  get contadorResultados(): string {
    const total = this.enderecosFiltrados.length;
    if (total === 0) return 'Nenhum endereço encontrado';
    if (total === 1) return '1 endereço encontrado';
    return `${total} endereços encontrados`;
  }
}