import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Users, FileText, Settings, Tag, Plus, ArrowRight } from 'lucide-angular';

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

  ngOnInit() {
    // Aqui virão as chamadas aos serviços para buscar estatísticas reais
  }
}