import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./components/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
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
        loadComponent: () => import('./components/clientes/cliente-list/cliente-list.component').then(m => m.ClienteListComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'clientes/novo',
        loadComponent: () => import('./components/clientes/cliente-form/cliente-form.component').then(m => m.ClienteFormComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'clientes/:id/editar',
        loadComponent: () => import('./components/clientes/cliente-form/cliente-form.component').then(m => m.ClienteFormComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'categorias',
        loadComponent: () => import('./components/categorias/categoria-list/categoria-list.component').then(m => m.CategoriaListComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'categorias/novo',
        loadComponent: () => import('./components/categorias/categoria-form/categoria-form.component').then(m => m.CategoriaFormComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'categorias/:id/editar',
        loadComponent: () => import('./components/categorias/categoria-form/categoria-form.component').then(m => m.CategoriaFormComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'servicos',
        loadComponent: () => import('./components/servicos/servico-list/servico-list.component').then(m => m.ServicoListComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'servicos/novo',
        loadComponent: () => import('./components/servicos/servico-form/servico-form.component').then(m => m.ServicoFormComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'servicos/:id/editar',
        loadComponent: () => import('./components/servicos/servico-form/servico-form.component').then(m => m.ServicoFormComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'contratos',
        loadComponent: () => import('./components/contratos/contrato-list/contrato-list.component').then(m => m.ContratoListComponent)
      },
      {
        path: 'contratos/novo',
        loadComponent: () => import('./components/contratos/contrato-form/contrato-form.component').then(m => m.ContratoFormComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'contratos/:id/editar',
        loadComponent: () => import('./components/contratos/contrato-form/contrato-form.component').then(m => m.ContratoFormComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'enderecos',
        loadComponent: () => import('./components/enderecos/endereco-list/endereco-list.component').then(m => m.EnderecoListComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'itens',
        loadComponent: () => import('./components/itens/item-list/item-list.component').then(m => m.ItemListComponent),
        canActivate: [adminGuard]
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