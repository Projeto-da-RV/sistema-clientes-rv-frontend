import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

/**
 * Componente do cabeçalho/navbar do sistema RV Digital.
 * Contém logo, menu de navegação, informações do usuário e opção de logout.
 * Permanece fixo no topo em todas as páginas exceto login.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  
  // Dados do usuário logado
  usuario: any = null;
  
  // Controle do menu mobile
  menuColapsado = true;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  /**
   * Inicialização do componente.
   * Obtém dados do usuário atual para exibição no header.
   */
  ngOnInit(): void {
    this.obterDadosUsuario();
  }
  
  /**
   * Obtém dados do usuário logado do AuthService.
   */
  private obterDadosUsuario(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.usuario = user;
    });
  }
  
  /**
   * Realiza logout do usuário com confirmação.
   * Exibe modal de confirmação antes de deslogar.
   */
  fazerLogout(): void {
    Swal.fire({
      title: 'Confirmar Logout',
      text: 'Tem certeza que deseja sair do sistema?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
  
  /**
   * Navega para uma rota específica.
   */
  navegarPara(rota: string): void {
    this.router.navigate([rota]);
    this.menuColapsado = true; // Fechar menu mobile após navegação
  }
  
  /**
   * Alterna estado do menu mobile.
   */
  alternarMenu(): void {
    this.menuColapsado = !this.menuColapsado;
  }
  
  /**
   * Verifica se uma rota está ativa.
   */
  rotaAtiva(rota: string): boolean {
    return this.router.url.includes(rota);
  }
}