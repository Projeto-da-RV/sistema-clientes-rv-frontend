import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Download, Plus, Search, SlidersHorizontal, Eye, Edit, Trash2, MoreHorizontal, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Check, FileText, XCircle, CreditCard } from 'lucide-angular';
import { ContratoService } from '../../../services/contrato.service';
import { ClienteService } from '../../../services/cliente.service';
import { MetodoPagamentoService } from '../../../services/metodo-pagamento.service';
import { AuthService } from '../../../services/auth.service';
import { Contrato } from '../../../models/contrato.model';
import { Cliente } from '../../../models/cliente.model';
import { MetodoPagamento } from '../../../models/metodo-pagamento.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { ContratoModalComponent } from './contrato-modal.component';
import { PaymentModalComponent } from './payment-modal.component';

interface Ordenacao {
  coluna: string;
  direcao: 'asc' | 'desc';
}

@Component({
  selector: 'app-contrato-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ContratoModalComponent,
    PaymentModalComponent
  ],
  templateUrl: './contrato-list.component.html',
  styleUrl: './contrato-list.component.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ContratoListComponent implements OnInit {
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
  readonly FileText = FileText;
  readonly XCircle = XCircle;
  readonly CreditCard = CreditCard;

  // Dados
  contratos: Contrato[] = [];
  contratosFiltrados: Contrato[] = [];
  contratosPaginados: Contrato[] = [];
  clientes: Cliente[] = [];

  // Estados
  loading: boolean = false;
  selecionados: number[] = [];

  // Filtros
  termoBusca: string = '';
  mostrarFiltro: boolean = false;
  filtroStatus: string = '';
  menuAcoesAberto: number | null = null;

  // Modal Contrato
  modalAberto: boolean = false;
  modalModo: 'criar' | 'editar' = 'criar';
  contratoSelecionado: Contrato | null = null;

  // Modal Pagamento
  paymentModalAberto: boolean = false;
  contratoPagamento: Contrato | null = null;

  // Ordenação
  ordenacao: Ordenacao = { coluna: 'id', direcao: 'desc' };

  // Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalContratos: number = 0;
  totalPaginas: number = 1;
  paginas: number[] = [];

  constructor(
    private contratoService: ContratoService,
    private clienteService: ClienteService,
    private metodoPagamentoService: MetodoPagamentoService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.carregarClientes();
    this.carregarContratos();
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
   * Carrega lista de clientes para o modal
   */
  carregarClientes(): void {
    this.clienteService.listarTodos().subscribe({
      next: (clientes) => {
        this.ngZone.run(() => {
          this.clientes = clientes;
        });
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
      }
    });
  }

  /**
   * Carrega todos os contratos
   */
  carregarContratos(): void {
    this.loading = true;

    this.contratoService.listarTodos().subscribe({
      next: (contratos) => {
        this.ngZone.run(() => {
          this.contratos = contratos;
          this.aplicarFiltros();
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

  /**
   * Aplica filtros e ordenação
   */
  aplicarFiltros(): void {
    let resultado = [...this.contratos];

    // Filtro por termo de busca (cliente nome, id)
    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.toLowerCase();
      resultado = resultado.filter(contrato => {
        const clienteNome = this.getClienteNome(contrato).toLowerCase();
        const contratoId = (contrato.id || '').toString();
        return clienteNome.includes(termo) || contratoId.includes(termo);
      });
    }

    // Filtro por status
    if (this.filtroStatus) {
      resultado = resultado.filter(contrato =>
        (contrato.status || 'PENDENTE') === this.filtroStatus
      );
    }

    this.contratosFiltrados = resultado;
    this.aplicarOrdenacao();
    this.atualizarPaginacao();
  }

  /**
   * Aplica ordenação aos dados filtrados
   */
  aplicarOrdenacao(): void {
    this.contratosFiltrados.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (this.ordenacao.coluna) {
        case 'id':
          valorA = a.id || 0;
          valorB = b.id || 0;
          break;
        case 'valor':
          valorA = a.valor || 0;
          valorB = b.valor || 0;
          break;
        case 'dataVencimento':
          valorA = a.dataVencimento || '';
          valorB = b.dataVencimento || '';
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
    this.totalContratos = this.contratosFiltrados.length;
    this.totalPaginas = Math.ceil(this.totalContratos / this.itensPorPagina);

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
    this.contratosPaginados = this.contratosFiltrados.slice(inicio, fim);
  }

  /**
   * Getters para paginação
   */
  get itemInicial(): number {
    if (this.totalContratos === 0) return 0;
    return (this.paginaAtual - 1) * this.itensPorPagina + 1;
  }

  get itemFinal(): number {
    return Math.min(this.paginaAtual * this.itensPorPagina, this.totalContratos);
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
      this.selecionados = this.contratosPaginados.map(c => c.id!).filter(id => id !== undefined);
    }
  }

  todosSelecionados(): boolean {
    return this.contratosPaginados.length > 0 &&
           this.contratosPaginados.every(c => c.id && this.selecionados.includes(c.id));
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
   * Ações do contrato
   */
  verDetalhes(id: number | undefined): void {
    if (!id) return;
    this.router.navigate(['/contratos', id]);
    this.menuAcoesAberto = null;
  }

  editar(id: number | undefined): void {
    if (!id) return;
    const contrato = this.contratos.find(c => c.id === id);
    if (!contrato) return;
    this.abrirModalEditar(contrato);
    this.menuAcoesAberto = null;
  }

  pagarConta(id: number | undefined): void {
    if (!id) return;

    // Buscar contrato completo do backend (com cliente)
    this.contratoService.buscarPorId(id).subscribe({
      next: (contrato) => {
        this.ngZone.run(() => {
          this.contratoPagamento = contrato;
          this.paymentModalAberto = true;
          this.menuAcoesAberto = null;
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Erro ao buscar contrato:', error);
          this.notificationService.showError('Erro ao carregar dados do contrato');
          this.menuAcoesAberto = null;
        });
      }
    });
  }

  fecharPaymentModal(): void {
    this.paymentModalAberto = false;
    this.contratoPagamento = null;
  }

  processarPagamento(metodoPagamento: MetodoPagamento): void {
    console.log('🔄 Processando pagamento recebido do modal:', metodoPagamento);
    console.log('📊 Dados do pagamento:', JSON.stringify(metodoPagamento, null, 2));

    this.metodoPagamentoService.criar(metodoPagamento).subscribe({
      next: (pagamento) => {
        this.ngZone.run(() => {
          console.log('✅ Pagamento criado com sucesso:', pagamento);
          this.notificationService.showSuccess('Pagamento registrado com sucesso!');

          // Atualizar status do contrato para PAGO
          if (this.contratoPagamento?.id) {
            console.log('🔄 Atualizando status do contrato para PAGO...');

            // Garantir que cliente seja enviado como { id: X }
            let clienteParaEnvio: { id: number };
            if (typeof this.contratoPagamento.cliente === 'object' &&
                this.contratoPagamento.cliente &&
                'id' in this.contratoPagamento.cliente &&
                this.contratoPagamento.cliente.id !== undefined) {
              clienteParaEnvio = { id: this.contratoPagamento.cliente.id };
            } else {
              console.error('❌ Cliente inválido no contrato:', this.contratoPagamento.cliente);
              this.fecharPaymentModal();
              this.carregarContratos();
              return;
            }

            const contratoAtualizado: Contrato = {
              ...this.contratoPagamento,
              cliente: clienteParaEnvio,
              status: 'PAGO',
              dataPagamento: new Date().toISOString().split('T')[0],
              // Remover campos que não devem ser enviados na atualização
              metodosPagamento: undefined,
              createdAt: undefined,
              updatedAt: undefined
            };

            console.log('📤 Enviando atualização do contrato:', JSON.stringify(contratoAtualizado, null, 2));

            this.contratoService.atualizar(this.contratoPagamento.id, contratoAtualizado).subscribe({
              next: (contratoAtualizado) => {
                console.log('✅ Status do contrato atualizado com sucesso!', contratoAtualizado);
                this.fecharPaymentModal();
                this.carregarContratos();
              },
              error: (error) => {
                console.error('❌ Erro ao atualizar status do contrato:', error);
                console.error('❌ Detalhes do erro:', error.error);
                console.error('❌ Status HTTP:', error.status);
                this.notificationService.showError('Pagamento registrado, mas falha ao atualizar status do contrato');
                this.fecharPaymentModal();
                this.carregarContratos();
              }
            });
          } else {
            console.warn('⚠️ Contrato sem ID, não foi possível atualizar status');
            this.fecharPaymentModal();
            this.carregarContratos();
          }
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('❌ Erro ao processar pagamento:', error);
          console.error('❌ Detalhes do erro:', error.error);
          console.error('❌ Status:', error.status);
          console.error('❌ Mensagem:', error.message);
          const mensagemErro = error.error?.erro || error.error?.message || 'Erro ao processar pagamento';
          this.notificationService.showError(mensagemErro);
        });
      }
    });
  }

  baixarPDF(id: number | undefined): void {
    if (!id) return;
    // Placeholder para funcionalidade de download de PDF
    this.notificationService.showSuccess('Funcionalidade de download de PDF em desenvolvimento');
    this.menuAcoesAberto = null;
  }

  cancelar(id: number | undefined): void {
    if (!id) return;

    const contrato = this.contratos.find(c => c.id === id);
    if (!contrato) return;

    const status = contrato.status || 'PENDENTE';
    if (status !== 'PAGO' && status !== 'PENDENTE') {
      this.notificationService.showError('Apenas contratos ativos ou pendentes podem ser cancelados');
      this.menuAcoesAberto = null;
      return;
    }

    this.notificationService.showConfirm(
      'Confirmação',
      `Tem certeza que deseja cancelar o contrato Nº ${contrato.id}?`,
      'question'
    ).then((result: any) => {
      if (result.isConfirmed) {
        this.cancelarContrato(id);
      }
    });

    this.menuAcoesAberto = null;
  }

  private cancelarContrato(id: number): void {
    const contrato = this.contratos.find(c => c.id === id);
    if (!contrato) return;

    const contratoAtualizado: Contrato = { ...contrato, status: 'CANCELADO' };

    this.contratoService.atualizar(id, contratoAtualizado).subscribe({
      next: () => {
        this.notificationService.showSuccess('Contrato cancelado com sucesso!');
        this.carregarContratos();
      },
      error: (error) => {
        console.error('Erro ao cancelar contrato:', error);
        this.notificationService.showError('Erro ao cancelar contrato');
      }
    });
  }

  excluir(id: number | undefined): void {
    if (!id) return;

    const contrato = this.contratos.find(c => c.id === id);
    if (!contrato) return;

    this.notificationService.showConfirm(
      'Confirmação',
      `Tem certeza que deseja excluir o contrato Nº ${contrato.id}?`,
      'question'
    ).then((result: any) => {
      if (result.isConfirmed) {
        this.excluirContrato(id);
      }
    });

    this.menuAcoesAberto = null;
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

  /**
   * Exportar dados (placeholder)
   */
  exportar(): void {
    this.notificationService.showSuccess('Funcionalidade de exportação em desenvolvimento');
  }

  /**
   * Métodos do Modal
   */
  abrirModalCriar(): void {
    this.modalModo = 'criar';
    this.contratoSelecionado = null;
    this.modalAberto = true;
  }

  abrirModalEditar(contrato: Contrato): void {
    this.modalModo = 'editar';
    this.contratoSelecionado = { ...contrato }; // Clone para não alterar original
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.contratoSelecionado = null;
  }

  salvarContrato(contrato: Contrato): void {
    if (this.modalModo === 'criar') {
      this.criarContrato(contrato);
    } else {
      this.atualizarContrato(contrato);
    }
  }

  private criarContrato(contrato: Contrato): void {
    this.contratoService.criar(contrato).subscribe({
      next: (contratoCriado) => {
        this.ngZone.run(() => {
          this.notificationService.showSuccess('Contrato cadastrado com sucesso!');
          this.fecharModal();
          this.carregarContratos();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Erro ao criar contrato:', error);
          const mensagemErro = error.error?.erro || 'Erro ao cadastrar contrato';
          this.notificationService.showError(mensagemErro);
        });
      }
    });
  }

  private atualizarContrato(contrato: Contrato): void {
    if (!contrato.id) return;

    this.contratoService.atualizar(contrato.id, contrato).subscribe({
      next: (contratoAtualizado) => {
        this.ngZone.run(() => {
          this.notificationService.showSuccess('Contrato atualizado com sucesso!');
          this.fecharModal();
          this.carregarContratos();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Erro ao atualizar contrato:', error);
          const mensagemErro = error.error?.erro || 'Erro ao atualizar contrato';
          this.notificationService.showError(mensagemErro);
        });
      }
    });
  }

  /**
   * Helpers
   */
  getClienteNome(contrato: Contrato): string {
    // Tenta obter do objeto completo
    if (typeof contrato.cliente === 'object' && contrato.cliente && 'nome' in contrato.cliente) {
      return contrato.cliente.nome;
    }

    // Fallback: busca pelo ID no array de clientes carregado
    // Isso é necessário enquanto o backend retorna apenas { id: X } por causa de referências circulares
    if (typeof contrato.cliente === 'object' && contrato.cliente && 'id' in contrato.cliente) {
      const clienteId = contrato.cliente.id;
      const cliente = this.clientes.find(c => c.id === clienteId);
      if (cliente) {
        return cliente.nome;
      }
    }

    return 'Cliente não identificado';
  }

  getStatusLabel(status: string | undefined): string {
    const statusMap: { [key: string]: string } = {
      'PENDENTE': 'Pendente',
      'PAGO': 'Pago',
      'VENCIDO': 'Vencido',
      'ATIVO': 'Ativo',
      'CONCLUIDO': 'Concluído',
      'CANCELADO': 'Cancelado'
    };
    return statusMap[status || 'PENDENTE'] || 'Pendente';
  }

  getStatusClass(status: string | undefined): string {
    const statusClassMap: { [key: string]: string } = {
      'PENDENTE': 'status-pendente',
      'PAGO': 'status-pago',
      'VENCIDO': 'status-vencido',
      'ATIVO': 'status-ativo',
      'CONCLUIDO': 'status-concluido',
      'CANCELADO': 'status-cancelado'
    };
    return statusClassMap[status || 'PENDENTE'] || 'status-pendente';
  }

  formatarValor(valor: number | undefined): string {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  formatarPeriodo(contrato: Contrato): string {
    const dataVencimento = this.formatarData(contrato.dataVencimento);
    const dataFim = contrato.dataPagamento ? this.formatarData(contrato.dataPagamento) : 'Indeterminado';
    return `${dataVencimento} - ${dataFim}`;
  }

  formatarData(data: string | undefined): string {
    if (!data) return '-';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  podeSerCancelado(contrato: Contrato): boolean {
    const status = contrato.status || 'PENDENTE';
    return status === 'PAGO' || status === 'PENDENTE';
  }

  /**
   * Verifica se o usuário logado possui role ROLE_ADMIN
   * @returns true se o usuário é admin, false caso contrário
   */
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
