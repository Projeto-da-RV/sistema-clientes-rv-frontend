import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./components/clientes/cliente-list/cliente-list.component').then(m => m.ClienteListComponent)
      },
      {
        path: 'clientes/novo',
        loadComponent: () => import('./components/clientes/cliente-form/cliente-form.component').then(m => m.ClienteFormComponent)
      },
      {
        path: 'clientes/:id/editar',
        loadComponent: () => import('./components/clientes/cliente-form/cliente-form.component').then(m => m.ClienteFormComponent)
      },
      {
        path: 'categorias',
        loadComponent: () => import('./components/categorias/categoria-list/categoria-list.component').then(m => m.CategoriaListComponent)
      },
      {
        path: 'categorias/novo',
        loadComponent: () => import('./components/categorias/categoria-form/categoria-form.component').then(m => m.CategoriaFormComponent)
      },
      {
        path: 'categorias/:id/editar',
        loadComponent: () => import('./components/categorias/categoria-form/categoria-form.component').then(m => m.CategoriaFormComponent)
      },
      {
        path: 'servicos',
        loadComponent: () => import('./components/servicos/servico-list/servico-list.component').then(m => m.ServicoListComponent)
      },
      {
        path: 'servicos/novo',
        loadComponent: () => import('./components/servicos/servico-form/servico-form.component').then(m => m.ServicoFormComponent)
      },
      {
        path: 'servicos/:id/editar',
        loadComponent: () => import('./components/servicos/servico-form/servico-form.component').then(m => m.ServicoFormComponent)
      },
      {
        path: 'contratos',
        loadComponent: () => import('./components/contratos/contrato-list/contrato-list.component').then(m => m.ContratoListComponent)
      },
      {
        path: 'contratos/novo',
        loadComponent: () => import('./components/contratos/contrato-form/contrato-form.component').then(m => m.ContratoFormComponent)
      },
      {
        path: 'contratos/:id/editar',
        loadComponent: () => import('./components/contratos/contrato-form/contrato-form.component').then(m => m.ContratoFormComponent)
      },
      {
        path: 'enderecos',
        loadComponent: () => import('./components/enderecos/endereco-list/endereco-list.component').then(m => m.EnderecoListComponent)
      },
      {
        path: 'itens',
        loadComponent: () => import('./components/itens/item-list/item-list.component').then(m => m.ItemListComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];
