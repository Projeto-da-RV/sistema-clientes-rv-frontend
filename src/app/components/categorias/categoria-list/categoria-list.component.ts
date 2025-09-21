import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria.model';
import { BaseCrudListComponent } from '../../../shared/components/base-crud-list.component';
import { ListConfig } from '../../../shared/interfaces/list-config.interface';


@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    BaseCrudListComponent
  ],
  template: `
    <app-base-crud-list 
      [config]="listConfig" 
      [service]="categoriaService">
    </app-base-crud-list>
  `,
  styleUrl: './categoria-list.component.scss'
})
export class CategoriaListComponent implements OnInit {

  listConfig: ListConfig<Categoria> = {
    entityName: 'Categoria',
    entityNamePlural: 'Categorias',
    baseRoute: '/categorias',
    
    columns: [
      { key: 'id', label: 'ID', width: '80px', sortable: true },
      { key: 'nome', label: 'Nome', sortable: true },
      { key: 'descricao', label: 'Descrição' },
      { key: 'beneficios', label: 'Benefícios' },
      { 
        key: 'ativo', 
        label: 'Status', 
        type: 'badge',
        badgeConfig: {
          trueValue: 'Ativo',
          falseValue: 'Inativo',
          trueClass: 'badge-success',
          falseClass: 'badge-danger'
        }
      }
    ],
    
    filters: [
      {
        key: 'nome',
        label: 'Buscar por nome:',
        type: 'text',
        placeholder: 'Digite o nome da categoria',
        searchOnEnter: true,
        searchMethod: 'buscarPorNome'
      },
      {
        key: 'ativo',
        label: 'Apenas ativas:',
        type: 'checkbox',
        searchMethod: 'buscarAtivas'
      }
    ],
    
    emptyState: {
      icon: 'tag',
      title: 'Nenhuma categoria encontrada',
      subtitle: 'Comece adicionando uma nova categoria'
    },
    
    trackByFn: (index: number, categoria: Categoria) => categoria.id || index,
    
    showItemCount: true
  };

  constructor(public categoriaService: CategoriaService) {}

  ngOnInit(): void {}
}