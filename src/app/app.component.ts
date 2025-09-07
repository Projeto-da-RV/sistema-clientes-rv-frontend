import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

/**
 * Configuração de rotas do sistema RV Digital.
 * Rotas protegidas por AuthGuard exceto login.
 * Estrutura preparada para módulos do João Simi e PP.
 */
export const routes: Routes = [
  // Rota de login (sem proteção)
  { 
    path: 'login', 
    component: LoginComponent 
  },
  
  // Rotas protegidas com layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      // Dashboard principal
      { 
        path: 'dashboard', 
        component: DashboardComponent 
      },
      
      // Módulos do João Simi (lazy loading quando implementar)
      // {
      //   path: 'categorias',
      //   loadComponent: () => import('./components/categoria/categoria-list/categoria-list.component').then(m => m.CategoriaListComponent)
      // },
      
      // Redirecionamento padrão
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      }
    ]
  },
  
  // Redirecionamento para login por padrão
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];