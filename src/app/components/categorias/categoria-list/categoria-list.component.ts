import { Component, OnInit, HostListener, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { CategoriaModalComponent } from './categoria-modal.component';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoriaModalComponent],
  templateUrl: './categoria-list.component.html',
  styleUrl: './categoria-list.component.scss'
})
export class CategoriaListComponent implements OnInit {
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  categoriasPaginadas: Categoria[] = [];
  selecionados: number[] = [];

  termoBusca: string = '';
  mostrarFiltro: boolean = false;
  menuAbertoId: number | null = null;

  ordenacao = { coluna: 'nome', direcao: 'asc' as 'asc' | 'desc' };

  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalCategorias: number = 0;
  totalPaginas: number = 1;
  paginas: number[] = [];

  // Modal
  modalAberto: boolean = false;
  modalModo: 'criar' | 'editar' = 'criar';
  categoriaSelecionada: Categoria | null = null;

  loading: boolean = false;

  constructor(
    private categoriaService: CategoriaService,
    private notificationService: NotificationService,
    private ngZone: NgZone
  ) {}

  get itemInicial(): number {
    return (this.paginaAtual - 1) * this.itensPorPagina + 1;
  }

  get itemFinal(): number {
    return Math.min(this.paginaAtual * this.itensPorPagina, this.totalCategorias);
  }

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.loading = true;

    this.categoriaService.listarTodos().subscribe({
      next: (categorias) => {
        this.ngZone.run(() => {
          this.categorias = categorias;
          this.aplicarFiltros();
          this.loading = false;
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Erro ao carregar categorias:', error);
          this.notificationService.showError('Erro ao carregar categorias');
          this.loading = false;
        });
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.categorias];

    // Filtro por termo de busca
    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.toLowerCase();
      resultado = resultado.filter(categoria =>
        categoria.nome.toLowerCase().includes(termo) ||
        categoria.descricao?.toLowerCase().includes(termo) ||
        categoria.beneficios?.toLowerCase().includes(termo)
      );
    }

    // Aplicar ordenação
    resultado = this.ordenarCategorias(resultado);

    this.categoriasFiltradas = resultado;
    this.atualizarPaginacao();
  }

  ordenarCategorias(categorias: Categoria[]): Categoria[] {
    return categorias.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (this.ordenacao.coluna) {
        case 'nome':
          valorA = a.nome?.toLowerCase() || '';
          valorB = b.nome?.toLowerCase() || '';
          break;
        case 'dataCriacao':
          valorA = a.createdAt || '';
          valorB = b.createdAt || '';
          break;
        default:
          return 0;
      }

      if (valorA < valorB) return this.ordenacao.direcao === 'asc' ? -1 : 1;
      if (valorA > valorB) return this.ordenacao.direcao === 'asc' ? 1 : -1;
      return 0;
    });
  }

  atualizarPaginacao(): void {
    this.totalCategorias = this.categoriasFiltradas.length;
    this.totalPaginas = Math.ceil(this.totalCategorias / this.itensPorPagina) || 1;

    // Garantir que a página atual está dentro dos limites
    if (this.paginaAtual > this.totalPaginas) {
      this.paginaAtual = this.totalPaginas;
    }

    this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);

    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.categoriasPaginadas = this.categoriasFiltradas.slice(inicio, fim);
  }

  // Filtro
  filtrar(): void {
    this.aplicarFiltros();
  }

  toggleFiltro(): void {
    this.mostrarFiltro = !this.mostrarFiltro;
  }

  // Menu 3 pontinhos
  toggleMenu(id: number, event: Event): void {
    event.stopPropagation();
    this.menuAbertoId = this.menuAbertoId === id ? null : id;
  }

  @HostListener('document:click')
  fecharMenu(): void {
    this.menuAbertoId = null;
  }

  // Modal - Criar
  abrirModalCriar(): void {
    this.modalModo = 'criar';
    this.categoriaSelecionada = null;
    this.modalAberto = true;
  }

  // Modal - Editar
  editar(categoria: Categoria): void {
    this.menuAbertoId = null;
    this.modalModo = 'editar';
    this.categoriaSelecionada = { ...categoria };
    this.modalAberto = true;
  }

  // Fechar Modal
  fecharModal(): void {
    this.modalAberto = false;
    this.categoriaSelecionada = null;
  }

  // Salvar (criar ou editar)
  salvarCategoria(categoria: Categoria): void {
    if (this.modalModo === 'criar') {
      this.criarCategoria(categoria);
    } else {
      this.atualizarCategoria(categoria);
    }
  }

  private criarCategoria(categoria: Categoria): void {
    this.categoriaService.criar(categoria).subscribe({
      next: (categoriaCriada) => {
        this.ngZone.run(() => {
          this.notificationService.showSuccess('Categoria cadastrada com sucesso!');
          this.fecharModal();
          this.carregarCategorias();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Erro ao criar categoria:', error);
          const mensagemErro = error.error?.erro || 'Erro ao cadastrar categoria';
          this.notificationService.showError(mensagemErro);
        });
      }
    });
  }

  private atualizarCategoria(categoria: Categoria): void {
    if (!categoria.id) return;

    this.categoriaService.atualizar(categoria.id, categoria).subscribe({
      next: (categoriaAtualizada) => {
        this.ngZone.run(() => {
          this.notificationService.showSuccess('Categoria atualizada com sucesso!');
          this.fecharModal();
          this.carregarCategorias();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Erro ao atualizar categoria:', error);
          const mensagemErro = error.error?.erro || 'Erro ao atualizar categoria';
          this.notificationService.showError(mensagemErro);
        });
      }
    });
  }

  // Excluir
  excluir(id: number): void {
    this.menuAbertoId = null;

    this.notificationService.showConfirm(
      'Confirmação',
      'Tem certeza que deseja excluir esta categoria?',
      'question'
    ).then((result: any) => {
      if (result.isConfirmed) {
        this.categoriaService.deletar(id).subscribe({
          next: () => {
            this.ngZone.run(() => {
              this.notificationService.showSuccess('Categoria excluída com sucesso!');
              this.carregarCategorias();
            });
          },
          error: (error) => {
            this.ngZone.run(() => {
              console.error('Erro ao excluir categoria:', error);
              this.notificationService.showError('Erro ao excluir categoria');
            });
          }
        });
      }
    });
  }

  // Seleção
  toggleSelecionarTodos(): void {
    if (this.todosSelecionados()) {
      this.selecionados = [];
    } else {
      this.selecionados = this.categoriasPaginadas
        .filter(c => c.id !== undefined)
        .map(c => c.id!);
    }
  }

  todosSelecionados(): boolean {
    const categoriasComId = this.categoriasPaginadas.filter(c => c.id !== undefined);
    return categoriasComId.length > 0 &&
           categoriasComId.every(c => this.selecionados.includes(c.id!));
  }

  toggleSelecao(id: number | undefined): void {
    if (id === undefined) return;

    const index = this.selecionados.indexOf(id);
    if (index > -1) {
      this.selecionados.splice(index, 1);
    } else {
      this.selecionados.push(id);
    }
  }

  // Ordenação
  ordenarPor(coluna: string): void {
    if (this.ordenacao.coluna === coluna) {
      this.ordenacao.direcao = this.ordenacao.direcao === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenacao.coluna = coluna;
      this.ordenacao.direcao = 'asc';
    }
    this.aplicarFiltros();
  }

  // Paginação
  irParaPagina(pagina: number): void {
    this.paginaAtual = pagina;
    this.atualizarPaginacao();
  }

  paginaAnterior(): void {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
      this.atualizarPaginacao();
    }
  }

  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
      this.atualizarPaginacao();
    }
  }
}
