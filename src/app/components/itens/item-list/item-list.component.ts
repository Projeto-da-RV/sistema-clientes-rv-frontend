import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../../services/item.service';
import { ContratoService } from '../../../services/contrato.service';
import { Item } from '../../../models/item.model';
import { Contrato } from '../../../models/contrato.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.scss',
  changeDetection: ChangeDetectionStrategy.Default // Força estratégia padrão
})
export class ItemListComponent implements OnInit {
  
  itens: Item[] = [];
  itensFiltrados: Item[] = [];
  contratos: Contrato[] = [];
  loading = false;
  
  // Filtros
  contratoSelecionado: number | null = null;
  filtroServico = '';
  
  constructor(
    private itemService: ItemService,
    private contratoService: ContratoService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone // Adiciona NgZone para forçar detecção
  ) {}

  ngOnInit(): void {
    this.carregarContratos();
    this.carregarItens();
  }

  carregarContratos(): void {
    this.contratoService.listarTodos().subscribe({
      next: (contratos) => {
        this.contratos = contratos;
      },
      error: (error) => {
        console.error('Erro ao carregar contratos:', error);
      }
    });
  }

  carregarItens(): void {
    this.loading = true;
    
    this.itemService.listarTodos().subscribe({
      next: (itens) => {
        // Força execução dentro da zona do Angular
        this.ngZone.run(() => {
          this.itens = itens;
          this.itensFiltrados = [...itens];
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Erro ao carregar itens:', error);
        this.ngZone.run(() => {
          this.notificationService.showError('Erro ao carregar itens');
          this.loading = false;
        });
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.itens];
    
    // Filtro por contrato
    if (this.contratoSelecionado) {
      resultado = resultado.filter(item => {
        if (typeof item.contrato === 'object' && item.contrato && 'id' in item.contrato) {
          return item.contrato.id === this.contratoSelecionado;
        }
        return false;
      });
    }
    
    // Filtro por serviço
    if (this.filtroServico.trim()) {
      resultado = resultado.filter(item => {
        const servicoNome = this.getServicoNome(item).toLowerCase();
        return servicoNome.includes(this.filtroServico.toLowerCase());
      });
    }
    
    this.itensFiltrados = resultado;
  }

  filtrar(): void {
    this.aplicarFiltros();
  }

  filtrarPorContrato(): void {
    this.aplicarFiltros();
  }

  limparFiltros(): void {
    this.contratoSelecionado = null;
    this.filtroServico = '';
    this.itensFiltrados = [...this.itens];
  }

  buscarPorServico(): void {
    if (this.filtroServico.trim()) {
      this.loading = true;
      // Simula busca por serviço (ajustar conforme service real)
      setTimeout(() => {
        this.aplicarFiltros();
        this.loading = false;
        this.cdr.detectChanges();
      }, 300);
    } else {
      this.carregarItens();
    }
  }

  confirmarExclusao(item: Item): void {
    const servicoNome = this.getServicoNome(item);
    this.notificationService.showConfirm(
      'Confirmação',
      `Tem certeza que deseja excluir o item "${servicoNome}" do contrato?`,
      'question'
    ).then((result: any) => {
      if (result.isConfirmed && item.id) {
        this.excluirItem(item.id);
      }
    });
  }

  private excluirItem(id: number): void {
    this.itemService.deletar(id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Item excluído com sucesso!');
        this.carregarItens();
      },
      error: (error) => {
        console.error('Erro ao excluir item:', error);
        this.notificationService.showError('Erro ao excluir item');
      }
    });
  }

  // Métodos auxiliares
  getContratoId(item: Item): string {
    if (typeof item.contrato === 'object' && item.contrato && 'id' in item.contrato) {
      return String(item.contrato.id);
    }
    return item.contrato ? String(item.contrato) : '-';
  }

  getServicoNome(item: Item): string {
    if (typeof item.servico === 'object' && item.servico && 'nome' in item.servico) {
      return item.servico.nome;
    }
    return item.servico ? String(item.servico) : '-';
  }

  formatarValor(valor: number | undefined): string {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  calcularValorFinal(item: Item): number {
    const valor = item.valor || 0;
    const quantidade = item.quantidade || 1;
    const desconto = item.desconto || 0;
    
    const valorTotal = valor * quantidade;
    return valorTotal - desconto;
  }

  get contadorResultados(): string {
    const total = this.itensFiltrados.length;
    if (total === 0) return 'Nenhum item encontrado';
    if (total === 1) return '1 item encontrado';
    return `${total} itens encontrados`;
  }
}