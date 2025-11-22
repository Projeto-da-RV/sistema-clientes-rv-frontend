import { Component, OnInit, HostListener, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicoService } from '../../../services/servico.service';
import { CategoriaService } from '../../../services/categoria.service';
import { Servico } from '../../../models/servico.model';
import { Categoria } from '../../../models/categoria.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { ServicoModalComponent } from './servico-modal.component';

@Component({
  selector: 'app-servico-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ServicoModalComponent],
  templateUrl: './servico-list.component.html',
  styleUrl: './servico-list.component.scss'
})
export class ServicoListComponent implements OnInit {
  servicos: Servico[] = [];
  servicosFiltrados: Servico[] = [];
  servicosPaginados: Servico[] = [];
  categorias: Categoria[] = [];
  selecionados: number[] = [];

  termoBusca: string = '';
  mostrarFiltro: boolean = false;
  menuAbertoId: number | null = null;

  ordenacao = { coluna: 'nome', direcao: 'asc' as 'asc' | 'desc' };

  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalServicos: number = 0;
  totalPaginas: number = 1;
  paginas: number[] = [];

  // Modal
  modalAberto: boolean = false;
  modalModo: 'criar' | 'editar' = 'criar';
  servicoSelecionado: Servico | null = null;

  loading: boolean = false;

  constructor(
    private servicoService: ServicoService,
    private categoriaService: CategoriaService,
    private notificationService: NotificationService,
    private ngZone: NgZone
  ) {}

  get itemInicial(): number {
    return (this.paginaAtual - 1) * this.itensPorPagina + 1;
  }

  get itemFinal(): number {
    return Math.min(this.paginaAtual * this.itensPorPagina, this.totalServicos);
  }

  ngOnInit(): void {
    this.carregarCategorias();
    this.carregarServicos();
  }

  carregarCategorias(): void {
    this.categoriaService.listarTodos().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
      }
    });
  }

  carregarServicos(): void {
    this.loading = true;

    this.servicoService.listarTodos().subscribe({
      next: (servicos) => {
        this.ngZone.run(() => {
          this.servicos = servicos;
          this.aplicarFiltros();
          this.loading = false;
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Erro ao carregar serviços:', error);
          this.notificationService.showError('Erro ao carregar serviços');
          this.loading = false;
        });
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.servicos];

    // Filtro por termo de busca
    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.toLowerCase();
      resultado = resultado.filter(servico =>
        servico.nome.toLowerCase().includes(termo) ||
        servico.descricao?.toLowerCase().includes(termo) ||
        servico.tipo?.toLowerCase().includes(termo)
      );
    }

    // Aplicar ordenação
    resultado = this.ordenarServicos(resultado);

    this.servicosFiltrados = resultado;
    this.atualizarPaginacao();
  }

  ordenarServicos(servicos: Servico[]): Servico[] {
    return servicos.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (this.ordenacao.coluna) {
        case 'nome':
          valorA = a.nome?.toLowerCase() || '';
          valorB = b.nome?.toLowerCase() || '';
          break;
        case 'valor':
          valorA = a.taxa || 0;
          valorB = b.taxa || 0;
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
    this.totalServicos = this.servicosFiltrados.length;
    this.totalPaginas = Math.ceil(this.totalServicos / this.itensPorPagina) || 1;

    // Garantir que a página atual está dentro dos limites
    if (this.paginaAtual > this.totalPaginas) {
      this.paginaAtual = this.totalPaginas;
    }

    this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);

    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.servicosPaginados = this.servicosFiltrados.slice(inicio, fim);
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
    this.servicoSelecionado = null;
    this.modalAberto = true;
  }

  // Modal - Editar
  editar(servico: Servico): void {
    this.menuAbertoId = null;
    this.modalModo = 'editar';
    this.servicoSelecionado = { ...servico };
    this.modalAberto = true;
  }

  // Fechar Modal
  fecharModal(): void {
    this.modalAberto = false;
    this.servicoSelecionado = null;
  }

  // Salvar (criar ou editar)
  salvarServico(servico: Servico): void {
    if (this.modalModo === 'criar') {
      this.criarServico(servico);
    } else {
      this.atualizarServico(servico);
    }
  }

  private criarServico(servico: Servico): void {
    this.servicoService.criar(servico).subscribe({
      next: (servicoCriado) => {
        this.ngZone.run(() => {
          this.notificationService.showSuccess('Serviço cadastrado com sucesso!');
          this.fecharModal();
          this.carregarServicos();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Erro ao criar serviço:', error);
          const mensagemErro = error.error?.erro || 'Erro ao cadastrar serviço';
          this.notificationService.showError(mensagemErro);
        });
      }
    });
  }

  private atualizarServico(servico: Servico): void {
    if (!servico.id) return;

    this.servicoService.atualizar(servico.id, servico).subscribe({
      next: (servicoAtualizado) => {
        this.ngZone.run(() => {
          this.notificationService.showSuccess('Serviço atualizado com sucesso!');
          this.fecharModal();
          this.carregarServicos();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Erro ao atualizar serviço:', error);
          const mensagemErro = error.error?.erro || 'Erro ao atualizar serviço';
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
      'Tem certeza que deseja excluir este serviço?',
      'question'
    ).then((result: any) => {
      if (result.isConfirmed) {
        this.servicoService.deletar(id).subscribe({
          next: () => {
            this.ngZone.run(() => {
              this.notificationService.showSuccess('Serviço excluído com sucesso!');
              this.carregarServicos();
            });
          },
          error: (error) => {
            this.ngZone.run(() => {
              console.error('Erro ao excluir serviço:', error);
              this.notificationService.showError('Erro ao excluir serviço');
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
      this.selecionados = this.servicosPaginados
        .filter(s => s.id !== undefined)
        .map(s => s.id!);
    }
  }

  todosSelecionados(): boolean {
    const servicosComId = this.servicosPaginados.filter(s => s.id !== undefined);
    return servicosComId.length > 0 &&
           servicosComId.every(s => this.selecionados.includes(s.id!));
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
