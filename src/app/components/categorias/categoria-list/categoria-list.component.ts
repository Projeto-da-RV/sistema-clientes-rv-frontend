import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './categoria-list.component.html',
  styleUrl: './categoria-list.component.scss',
  changeDetection: ChangeDetectionStrategy.Default // Força estratégia padrão
})
export class CategoriaListComponent implements OnInit {
  
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  loading = false;
  
  // Filtros
  filtroNome = '';
  mostrarAtivas = false;
  
  constructor(
    private categoriaService: CategoriaService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone // Adiciona NgZone para forçar detecção
  ) {}

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.loading = true;
    
    this.categoriaService.listarTodos().subscribe({
      next: (categorias) => {
        // Força execução dentro da zona do Angular
        this.ngZone.run(() => {
          this.categorias = categorias;
          this.categoriasFiltradas = [...categorias];
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.ngZone.run(() => {
          this.notificationService.showError('Erro ao carregar categorias');
          this.loading = false;
        });
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.categorias];
    
    // Filtro por nome
    if (this.filtroNome.trim()) {
      resultado = resultado.filter(categoria => 
        categoria.nome.toLowerCase().includes(this.filtroNome.toLowerCase())
      );
    }
    
    // Filtro por status ativo
    if (this.mostrarAtivas) {
      resultado = resultado.filter(categoria => categoria.ativo);
    }
    
    this.categoriasFiltradas = resultado;
  }

  filtrar(): void {
    this.aplicarFiltros();
  }

  toggleMostrarAtivas(): void {
    this.aplicarFiltros();
  }

  limparFiltros(): void {
    this.filtroNome = '';
    this.mostrarAtivas = false;
    this.categoriasFiltradas = [...this.categorias];
  }

  buscarPorNome(): void {
    if (this.filtroNome.trim()) {
      this.loading = true;
      this.categoriaService.buscarPorNome(this.filtroNome).subscribe({
        next: (categorias) => {
          // Garante que categorias seja sempre um array
          this.categoriasFiltradas = Array.isArray(categorias) ? categorias : [categorias];
          this.loading = false;
          this.cdr.detectChanges(); // ÚNICA ADIÇÃO: força atualização da view
        },
        error: (error) => {
          console.error('Erro na busca:', error);
          this.notificationService.showError('Erro ao buscar categorias');
          this.loading = false;
          this.cdr.detectChanges(); // ÚNICA ADIÇÃO: força atualização da view
        }
      });
    } else {
      this.carregarCategorias();
    }
  }

  confirmarExclusao(categoria: Categoria): void {
    this.notificationService.showConfirm(
      'Confirmação',
      `Tem certeza que deseja excluir a categoria "${categoria.nome}"?`,
      'question'
    ).then((result: any) => {
      if (result.isConfirmed && categoria.id) {
        this.excluirCategoria(categoria.id);
      }
    });
  }

  private excluirCategoria(id: number): void {
    this.categoriaService.deletar(id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Categoria excluída com sucesso!');
        this.carregarCategorias();
      },
      error: (error) => {
        console.error('Erro ao excluir categoria:', error);
        this.notificationService.showError('Erro ao excluir categoria');
      }
    });
  }

  get contadorResultados(): string {
    const total = this.categoriasFiltradas.length;
    if (total === 0) return 'Nenhuma categoria encontrada';
    if (total === 1) return '1 categoria encontrada';
    return `${total} categorias encontradas`;
  }
}