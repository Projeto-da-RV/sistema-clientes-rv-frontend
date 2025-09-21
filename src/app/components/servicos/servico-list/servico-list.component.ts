import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServicoService } from '../../../services/servico.service';
import { Servico } from '../../../models/servico.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-servico-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './servico-list.component.html',
  styleUrl: './servico-list.component.scss',
  changeDetection: ChangeDetectionStrategy.Default // Força estratégia padrão
})
export class ServicoListComponent implements OnInit {
  
  servicos: Servico[] = [];
  servicosFiltrados: Servico[] = [];
  loading = false;
  
  // Filtros
  filtroNome = '';
  filtroCategoria = '';
  mostrarAtivos = false;
  
  constructor(
    private servicoService: ServicoService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone // Adiciona NgZone para forçar detecção
  ) {}

  ngOnInit(): void {
    this.carregarServicos();
  }

  carregarServicos(): void {
    this.loading = true;
    
    this.servicoService.listarTodos().subscribe({
      next: (servicos) => {
        // Força execução dentro da zona do Angular
        this.ngZone.run(() => {
          this.servicos = servicos;
          this.servicosFiltrados = [...servicos];
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Erro ao carregar serviços:', error);
        this.ngZone.run(() => {
          this.notificationService.showError('Erro ao carregar serviços');
          this.loading = false;
        });
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.servicos];
    
    // Filtro por nome
    if (this.filtroNome.trim()) {
      resultado = resultado.filter(servico => 
        servico.nome.toLowerCase().includes(this.filtroNome.toLowerCase())
      );
    }
    
    // Filtro por categoria
    if (this.filtroCategoria.trim()) {
      resultado = resultado.filter(servico => 
        servico.categoria && 
        servico.categoria.toLowerCase().includes(this.filtroCategoria.toLowerCase())
      );
    }
    
    // Filtro por status ativo
    if (this.mostrarAtivos) {
      resultado = resultado.filter(servico => servico.ativo);
    }
    
    this.servicosFiltrados = resultado;
  }

  filtrar(): void {
    this.aplicarFiltros();
  }

  toggleMostrarAtivos(): void {
    this.aplicarFiltros();
  }

  limparFiltros(): void {
    this.filtroNome = '';
    this.filtroCategoria = '';
    this.mostrarAtivos = false;
    this.servicosFiltrados = [...this.servicos];
  }

  buscarPorNome(): void {
    if (this.filtroNome.trim()) {
      this.loading = true;
      this.servicoService.buscarPorNome(this.filtroNome).subscribe({
        next: (servicos) => {
          // Garante que servicos seja sempre um array
          this.servicosFiltrados = Array.isArray(servicos) ? servicos : [servicos];
          this.loading = false;
          this.cdr.detectChanges(); // ÚNICA ADIÇÃO: força atualização da view
        },
        error: (error) => {
          console.error('Erro na busca:', error);
          this.notificationService.showError('Erro ao buscar serviços');
          this.loading = false;
          this.cdr.detectChanges(); // ÚNICA ADIÇÃO: força atualização da view
        }
      });
    } else {
      this.carregarServicos();
    }
  }

  buscarPorCategoria(): void {
    if (this.filtroCategoria.trim()) {
      this.loading = true;
      this.servicoService.buscarPorCategoria(this.filtroCategoria).subscribe({
        next: (servicos) => {
          // Garante que servicos seja sempre um array
          this.servicosFiltrados = Array.isArray(servicos) ? servicos : [servicos];
          this.loading = false;
          this.cdr.detectChanges(); // ÚNICA ADIÇÃO: força atualização da view
        },
        error: (error) => {
          console.error('Erro na busca:', error);
          this.notificationService.showError('Erro ao buscar serviços');
          this.loading = false;
          this.cdr.detectChanges(); // ÚNICA ADIÇÃO: força atualização da view
        }
      });
    } else {
      this.carregarServicos();
    }
  }

  confirmarExclusao(servico: Servico): void {
    this.notificationService.showConfirm(
      'Confirmação',
      `Tem certeza que deseja excluir o serviço "${servico.nome}"?`,
      'question'
    ).then((result: any) => {
      if (result.isConfirmed && servico.id) {
        this.excluirServico(servico.id);
      }
    });
  }

  private excluirServico(id: number): void {
    this.servicoService.deletar(id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Serviço excluído com sucesso!');
        this.carregarServicos();
      },
      error: (error) => {
        console.error('Erro ao excluir serviço:', error);
        this.notificationService.showError('Erro ao excluir serviço');
      }
    });
  }

  get contadorResultados(): string {
    const total = this.servicosFiltrados.length;
    if (total === 0) return 'Nenhum serviço encontrado';
    if (total === 1) return '1 serviço encontrado';
    return `${total} serviços encontrados`;
  }
}