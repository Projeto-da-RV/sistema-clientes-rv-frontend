import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Download, Plus, Search, SlidersHorizontal, Eye, Edit, Trash2, MoreHorizontal, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Check } from 'lucide-angular';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../models/cliente.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { IniciaisPipe } from '../../../shared/pipes/iniciais.pipe';

interface Ordenacao {
  coluna: string;
  direcao: 'asc' | 'desc';
}

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    IniciaisPipe
  ],
  templateUrl: './cliente-list.component.html',
  styleUrls: ['./cliente-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ClienteListComponent implements OnInit {
  // Lucide Icons
  readonly Download = Download;
  readonly Plus = Plus;
  readonly Search = Search;
  readonly SlidersHorizontal = SlidersHorizontal;
  readonly Eye = Eye;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly MoreHorizontal = MoreHorizontal;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly ChevronUp = ChevronUp;
  readonly ChevronDown = ChevronDown;
  readonly Check = Check;

  // Dados
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  clientesPaginados: Cliente[] = [];

  // Estados
  loading: boolean = false;
  selecionados: number[] = [];

  // Filtros
  termoBusca: string = '';
  mostrarFiltro: boolean = false;
  filtroStatus: string = '';
  filtroTipo: string = '';
  menuAcoesAberto: number | null = null;

  // Ordenação
  ordenacao: Ordenacao = { coluna: 'nome', direcao: 'asc' };

  // Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalClientes: number = 0;
  totalPaginas: number = 1;
  paginas: number[] = [];

  constructor(
    private clienteService: ClienteService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.carregarClientes();
  }

  /**
   * Fecha dropdown ao clicar fora
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.mostrarFiltro = false;
      this.menuAcoesAberto = null;
    }
  }

  /**
   * Carrega todos os clientes
   */
  carregarClientes(): void {
    this.loading = true;

    this.clienteService.listarTodos().subscribe({
      next: (clientes) => {
        this.ngZone.run(() => {
          this.clientes = clientes;
          this.aplicarFiltros();
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

  /**
   * Aplica filtros e ordenação
   */
  aplicarFiltros(): void {
    let resultado = [...this.clientes];

    // Filtro por termo de busca (nome, email, cpf)
    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.toLowerCase();
      resultado = resultado.filter(cliente =>
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.email?.toLowerCase().includes(termo) ||
        cliente.cpf.includes(termo.replace(/\D/g, ''))
      );
    }

    // Filtro por status
    if (this.filtroStatus) {
      resultado = resultado.filter(cliente =>
        this.filtroStatus === 'ativo' ? cliente.ativo : !cliente.ativo
      );
    }

    // Filtro por tipo (PF/PJ)
    if (this.filtroTipo) {
      resultado = resultado.filter(cliente => {
        const tipo = cliente.cpf.length === 11 ? 'pf' : 'pj';
        return tipo === this.filtroTipo;
      });
    }

    this.clientesFiltrados = resultado;
    this.aplicarOrdenacao();
    this.atualizarPaginacao();
  }

  /**
   * Aplica ordenação aos dados filtrados
   */
  aplicarOrdenacao(): void {
    this.clientesFiltrados.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (this.ordenacao.coluna) {
        case 'nome':
          valorA = a.nome.toLowerCase();
          valorB = b.nome.toLowerCase();
          break;
        case 'email':
          valorA = (a.email || '').toLowerCase();
          valorB = (b.email || '').toLowerCase();
          break;
        case 'dataCadastro':
          valorA = a.id || 0; // Usando ID como proxy para data de cadastro
          valorB = b.id || 0;
          break;
        default:
          return 0;
      }

      if (valorA < valorB) {
        return this.ordenacao.direcao === 'asc' ? -1 : 1;
      }
      if (valorA > valorB) {
        return this.ordenacao.direcao === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Atualiza paginação
   */
  atualizarPaginacao(): void {
    this.totalClientes = this.clientesFiltrados.length;
    this.totalPaginas = Math.ceil(this.totalClientes / this.itensPorPagina);

    // Garante que página atual não exceda total de páginas
    if (this.paginaAtual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaAtual = this.totalPaginas;
    }
    if (this.paginaAtual < 1) {
      this.paginaAtual = 1;
    }

    // Gera array de páginas
    this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);

    // Pagina os dados
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.clientesPaginados = this.clientesFiltrados.slice(inicio, fim);
  }

  /**
   * Getters para paginação
   */
  get itemInicial(): number {
    if (this.totalClientes === 0) return 0;
    return (this.paginaAtual - 1) * this.itensPorPagina + 1;
  }

  get itemFinal(): number {
    return Math.min(this.paginaAtual * this.itensPorPagina, this.totalClientes);
  }

  /**
   * Toggle filtro dropdown
   */
  toggleFiltro(): void {
    this.mostrarFiltro = !this.mostrarFiltro;
    this.menuAcoesAberto = null;
  }

  /**
   * Aplica filtros do dropdown
   */
  aplicarFiltroDropdown(): void {
    this.mostrarFiltro = false;
    this.paginaAtual = 1;
    this.aplicarFiltros();
  }

  /**
   * Limpa todos os filtros
   */
  limparFiltros(): void {
    this.termoBusca = '';
    this.filtroStatus = '';
    this.filtroTipo = '';
    this.mostrarFiltro = false;
    this.aplicarFiltros();
  }

  /**
   * Ordena por coluna
   */
  ordenarPor(coluna: string): void {
    if (this.ordenacao.coluna === coluna) {
      this.ordenacao.direcao = this.ordenacao.direcao === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenacao.coluna = coluna;
      this.ordenacao.direcao = 'asc';
    }
    this.aplicarOrdenacao();
    this.atualizarPaginacao();
  }

  /**
   * Seleção múltipla
   */
  toggleSelecionarTodos(): void {
    if (this.todosSelecionados()) {
      this.selecionados = [];
    } else {
      this.selecionados = this.clientesPaginados.map(c => c.id!).filter(id => id !== undefined);
    }
  }

  todosSelecionados(): boolean {
    return this.clientesPaginados.length > 0 &&
           this.clientesPaginados.every(c => c.id && this.selecionados.includes(c.id));
  }

  toggleSelecao(id: number | undefined): void {
    if (!id) return;

    const index = this.selecionados.indexOf(id);
    if (index > -1) {
      this.selecionados.splice(index, 1);
    } else {
      this.selecionados.push(id);
    }
  }

  /**
   * Menu de ações
   */
  toggleMenuAcoes(id: number | undefined): void {
    if (!id) return;
    this.menuAcoesAberto = this.menuAcoesAberto === id ? null : id;
    this.mostrarFiltro = false;
  }

  /**
   * Navegação de páginas
   */
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

  /**
   * Ações do cliente
   */
  verDetalhes(id: number | undefined): void {
    if (!id) return;
    this.router.navigate(['/clientes', id]);
    this.menuAcoesAberto = null;
  }

  editar(id: number | undefined): void {
    if (!id) return;
    this.router.navigate(['/clientes', id, 'editar']);
    this.menuAcoesAberto = null;
  }

  excluir(id: number | undefined): void {
    if (!id) return;

    const cliente = this.clientes.find(c => c.id === id);
    if (!cliente) return;

    this.notificationService.showConfirm(
      'Confirmação',
      `Tem certeza que deseja excluir o cliente "${cliente.nome}"?`,
      'question'
    ).then((result: any) => {
      if (result.isConfirmed) {
        this.excluirCliente(id);
      }
    });

    this.menuAcoesAberto = null;
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

  /**
   * Exportar dados (placeholder)
   */
  exportar(): void {
    this.notificationService.showSuccess('Funcionalidade de exportação em desenvolvimento');
  }

  /**
   * Helpers
   */
  getTipoCliente(cliente: Cliente): string {
    return cliente.cpf.length === 11 ? 'Pessoa Física' : 'Pessoa Jurídica';
  }

  getStatusCliente(cliente: Cliente): string {
    return cliente.ativo ? 'ativo' : 'inativo';
  }
}
