import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Users, FileText, Settings, Tag, Plus, ArrowRight } from 'lucide-angular';
import { forkJoin } from 'rxjs';

// Importar os serviços
import { ClienteService } from '../../services/cliente.service';
import { ContratoService } from '../../services/contrato.service';
import { ServicoService } from '../../services/servico.service';
import { CategoriaService } from '../../services/categoria.service';

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

  stats = {
    clientes: 0,
    contratos: 0,
    servicos: 0,
    categorias: 0
  };

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