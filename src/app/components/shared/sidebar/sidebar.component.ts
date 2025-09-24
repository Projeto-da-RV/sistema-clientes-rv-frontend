import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Home, Users, Tag, Settings, Briefcase, FileText, MapPin, Package, User, LogOut, Menu, X, ChevronDown, ChevronRight } from 'lucide-angular';
import { SidebarService } from '../../../services/sidebar.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  // Lucide icons
  readonly Home = Home;
  readonly Users = Users;
  readonly Tag = Tag;
  readonly Settings = Settings;
  readonly Briefcase = Briefcase;
  readonly FileText = FileText;
  readonly MapPin = MapPin;
  readonly Package = Package;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly Menu = Menu;
  readonly X = X;
  readonly ChevronDown = ChevronDown;
  readonly ChevronRight = ChevronRight;
  
  username: string = '';
  userRole: string = '';
  cadastrosOpen: boolean = false;
  gestaoOpen: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    public sidebarService: SidebarService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  /**
   * Carrega as informações do usuário logado
   */
  private loadUserInfo(): void {
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser) {
      // Extrai apenas o primeiro nome para exibição
      this.username = this.extractFirstName(currentUser.nome);
      
      // Define o cargo baseado na categoria ou status do usuário
      this.userRole = this.defineUserRole(currentUser);
    } else {
      // Fallback para casos onde não há usuário logado
      this.username = 'Usuário';
      this.userRole = 'Visitante';
    }
  }

  /**
   * Extrai nome e sobrenome do usuário
   */
  private extractFirstName(fullName: string): string {
    if (!fullName || typeof fullName !== 'string') {
      return 'Usuário';
    }
    
    const nameParts = fullName.split(' ');
    
    // Se tem apenas um nome, retorna ele
    if (nameParts.length === 1) {
      return nameParts[0];
    }
    
    // Se tem dois ou mais nomes, retorna primeiro nome + último sobrenome
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      return `${firstName} ${lastName}`;
    }
    
    return fullName;
  }

  /**
   * Define o cargo do usuário baseado em suas informações
   */
  private defineUserRole(user: any): string {
    // Verifica se é um administrador (você pode ajustar essa lógica conforme necessário)
    if (user.email && user.email.includes('admin')) {
      return 'Administrador';
    }
    
    // Verifica a categoria do usuário
    if (user.categoria) {
      switch (user.categoria.nome) {
        case 'PESSOA_FISICA':
          return 'Cliente PF';
        case 'PESSOA_JURIDICA':
          return 'Cliente PJ';
        case 'PREMIUM':
          return 'Cliente Premium';
        case 'VIP':
          return 'Cliente VIP';
        default:
          return 'Cliente';
      }
    }
    
    // Verifica se tem contratos (pode indicar cliente ativo)
    if (user.contratos && user.contratos.length > 0) {
      return 'Cliente Ativo';
    }
    
    // Fallback baseado no status
    if (user.statusCadastro === 'COMPLETO') {
      return 'Cliente';
    }
    
    return 'Usuário';
  }

  get sidebarCollapsed(): boolean {
    return this.sidebarService.isCollapsed();
  }

  // 🎯 Detectar se seção Cadastros está ativa
  get isCadastrosActive(): boolean {
    const url = this.router.url;
    return url.includes('/clientes') || 
           url.includes('/categorias') || 
           url.includes('/servicos');
  }
  
  // 🎯 Detectar se seção Gestão está ativa
  get isGestaoActive(): boolean {
    const url = this.router.url;
    return url.includes('/contratos') || 
           url.includes('/enderecos') || 
           url.includes('/itens');
  }

  toggleSidebar() {
    this.sidebarService.toggle();
    if (this.sidebarCollapsed) {
      this.cadastrosOpen = false;
      this.gestaoOpen = false;
    }
  }

  toggleCadastros() {
    if (this.sidebarCollapsed) {
      // 🆕 Collapsed mode: expandir menu automaticamente e abrir dropdown
      this.sidebarService.setCollapsed(false);
      this.cadastrosOpen = true;
      this.gestaoOpen = false;
    } else {
      // Normal mode: toggle dropdown normal
      this.cadastrosOpen = !this.cadastrosOpen;
      if (this.cadastrosOpen) {
        this.gestaoOpen = false;
      }
    }
  }

  toggleGestao() {
    if (this.sidebarCollapsed) {
      // 🆕 Collapsed mode: expandir menu automaticamente e abrir dropdown
      this.sidebarService.setCollapsed(false);
      this.gestaoOpen = true;
      this.cadastrosOpen = false;
    } else {
      // Normal mode: toggle dropdown normal
      this.gestaoOpen = !this.gestaoOpen;
      if (this.gestaoOpen) {
        this.cadastrosOpen = false;
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close collapsed dropdowns when clicking outside
    if (this.sidebarCollapsed) {
      const target = event.target as Element;
      const sidebar = target.closest('.sidebar');
      
      if (!sidebar) {
        this.cadastrosOpen = false;
        this.gestaoOpen = false;
      }
    }
  }

  logout() {
    Swal.fire({
      title: 'Deseja sair?',
      text: 'Você será desconectado do sistema',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Usa o serviço de autenticação para fazer logout
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}