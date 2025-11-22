import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  Users,
  FileText,
  Settings,
  Tag,
  Plus,
  ArrowRight,
  DollarSign,
  TrendingUp,
  Activity,
  Package,
  Bell,
  ShoppingCart,
  BarChart3
} from 'lucide-angular';
import { forkJoin } from 'rxjs';

// Importar os serviços
import { ClienteService } from '../../services/cliente.service';
import { ContratoService } from '../../services/contrato.service';
import { ServicoService } from '../../services/servico.service';
import { CategoriaService } from '../../services/categoria.service';

interface Estatistica {
  icone: any;
  titulo: string;
  valor: number;
  variacao: string;
  corIcone: string;
  link: string;
}

interface Atividade {
  icone: any;
  titulo: string;
  descricao: string;
  tempo: string;
  cor: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  // Lucide icons
  readonly Users = Users;
  readonly FileText = FileText;
  readonly Settings = Settings;
  readonly Tag = Tag;
  readonly Plus = Plus;
  readonly ArrowRight = ArrowRight;
  readonly DollarSign = DollarSign;
  readonly TrendingUp = TrendingUp;
  readonly Activity = Activity;
  readonly Package = Package;
  readonly Bell = Bell;
  readonly ShoppingCart = ShoppingCart;
  readonly BarChart3 = BarChart3;

  stats = {
    clientes: 0,
    contratos: 0,
    servicos: 0,
    categorias: 0
  };

  estatisticas: Estatistica[] = [];
  atividades: Atividade[] = [];
  produtosTop: any[] = [];

  loading = true;

  constructor(
    private clienteService: ClienteService,
    private contratoService: ContratoService,
    private servicoService: ServicoService,
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.carregarEstatisticas();
  }

  private carregarEstatisticas(): void {
    this.loading = true;

    // Usar forkJoin para fazer todas as chamadas em paralelo
    forkJoin({
      clientes: this.clienteService.listarTodos(),
      contratos: this.contratoService.listarTodos(),
      servicos: this.servicoService.listarTodos(),
      categorias: this.categoriaService.listarTodos()
    }).subscribe({
      next: (resultados) => {
        this.ngZone.run(() => {
          this.stats = {
            clientes: resultados.clientes.length,
            contratos: resultados.contratos.length,
            servicos: resultados.servicos.length,
            categorias: resultados.categorias.length
          };

          // Criar estatísticas detalhadas
          this.estatisticas = [
            {
              icone: this.Users,
              titulo: 'Total de Clientes',
              valor: resultados.clientes.length,
              variacao: '+12% este mês',
              corIcone: 'azul',
              link: '/clientes'
            },
            {
              icone: this.FileText,
              titulo: 'Contratos Ativos',
              valor: resultados.contratos.length,
              variacao: '+8% esta semana',
              corIcone: 'verde',
              link: '/contratos'
            },
            {
              icone: this.Settings,
              titulo: 'Serviços',
              valor: resultados.servicos.length,
              variacao: '+3 novos serviços',
              corIcone: 'roxo',
              link: '/servicos'
            },
            {
              icone: this.Tag,
              titulo: 'Categorias',
              valor: resultados.categorias.length,
              variacao: 'Estável',
              corIcone: 'laranja',
              link: '/categorias'
            }
          ];

          // Criar atividades recentes (mock data - pode ser substituído por dados reais)
          this.atividades = [
            {
              icone: this.Users,
              titulo: 'Novo cliente cadastrado',
              descricao: 'Cliente foi adicionado ao sistema',
              tempo: '5 min atrás',
              cor: 'azul'
            },
            {
              icone: this.FileText,
              titulo: 'Contrato atualizado',
              descricao: 'Informações do contrato foram atualizadas',
              tempo: '15 min atrás',
              cor: 'verde'
            },
            {
              icone: this.Settings,
              titulo: 'Serviço criado',
              descricao: 'Novo serviço disponível',
              tempo: '1 hora atrás',
              cor: 'roxo'
            },
            {
              icone: this.Activity,
              titulo: 'Backup do sistema',
              descricao: 'Backup automático concluído',
              tempo: '2 horas atrás',
              cor: 'laranja'
            },
            {
              icone: this.Bell,
              titulo: 'Notificação',
              descricao: 'Nova atualização disponível',
              tempo: '3 horas atrás',
              cor: 'vermelho'
            }
          ];

          // Criar lista de serviços/produtos top (mock data)
          this.produtosTop = resultados.servicos.slice(0, 4).map(servico => ({
            nome: servico.nome || 'Serviço',
            valor: servico.taxa || 0
          }));

          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas:', error);
        this.ngZone.run(() => {
          // Em caso de erro, manter valores zerados mas parar o loading
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  // Método para recarregar estatísticas (pode ser útil futuramente)
  recarregarEstatisticas(): void {
    this.carregarEstatisticas();
  }
}