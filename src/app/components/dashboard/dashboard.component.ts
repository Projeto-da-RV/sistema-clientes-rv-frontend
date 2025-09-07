import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

/**
 * Componente do dashboard principal do sistema RV Digital.
 * Exibe resumo e estatísticas gerais do sistema.
 * Tela inicial após login bem-sucedido.
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  // Dados do usuário logado
  usuario: any = null;
  
  // Estatísticas do dashboard (simuladas - depois integrar com backend)
  estatisticas = {
    totalClientes: 0,
    totalContratos: 0,
    totalServicos: 0,
    receitaMensal: 0
  };
  
  constructor(private authService: AuthService) {}
  
  /**
   * Inicialização do componente.
   * Carrega dados do usuário e estatísticas.
   */
  ngOnInit(): void {
    this.carregarDadosUsuario();
    this.carregarEstatisticas();
  }
  
  /**
   * Carrega dados do usuário atual.
   */
  private carregarDadosUsuario(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.usuario = user;
    });
  }
  
  /**
   * Carrega estatísticas do dashboard.
   * Por enquanto simulado - depois integrar com endpoints reais.
   */
  private carregarEstatisticas(): void {
    // Simulação de dados - remover quando integrar com backend
    setTimeout(() => {
      this.estatisticas = {
        totalClientes: 150,
        totalContratos: 89,
        totalServicos: 25,
        receitaMensal: 45000
      };
    }, 1000);
  }
  
  /**
   * Obtém saudação baseada no horário.
   */
  obterSaudacao(): string {
    const hora = new Date().getHours();
    
    if (hora < 12) {
      return 'Bom dia';
    } else if (hora < 18) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }
  }
}