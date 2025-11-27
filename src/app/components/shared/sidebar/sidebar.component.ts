import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Home, Users, Folder, Settings, Briefcase, FileText, MessageSquare, User, LogOut, ChevronsLeft, ChevronsRight, CreditCard, Receipt } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

interface MenuItem {
  icon: any;
  label: string;
  route: string;
  badge?: number;
  requiresAdmin?: boolean; // Se true, só mostra para ROLE_ADMIN
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() expandida: boolean = true;
  @Output() expandidaChange = new EventEmitter<boolean>();

  // Lucide Icons
  readonly Home = Home;
  readonly Users = Users;
  readonly Folder = Folder;
  readonly Settings = Settings;
  readonly Briefcase = Briefcase;
  readonly FileText = FileText;
  readonly MessageSquare = MessageSquare;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly ChevronsLeft = ChevronsLeft;
  readonly ChevronsRight = ChevronsRight;
  readonly CreditCard = CreditCard;
  readonly Receipt = Receipt;

  itemSelecionado: string = 'Dashboard';
  username: string = '';
  userRole: string = '';

  // Menu completo - alguns itens exigem ROLE_ADMIN
  private readonly allMenuSections: MenuSection[] = [
    {
      items: [
        { icon: Home, label: 'Dashboard', route: '/dashboard', requiresAdmin: false },
        { icon: Users, label: 'Clientes', route: '/clientes', requiresAdmin: true },
        { icon: Folder, label: 'Categorias', route: '/categorias', requiresAdmin: true },
        { icon: CreditCard, label: 'Formas de Pagamento', route: '/servicos', requiresAdmin: true },
      ]
    },
    {
      title: 'Gestão Financeira',
      items: [
        { icon: Receipt, label: 'Contas a Pagar', route: '/contratos', requiresAdmin: true },
      ]
    }
  ];

  /**
   * Menu filtrado baseado nas permissões do usuário
   */
  get menuPrincipal(): MenuSection[] {
    const isAdmin = this.authService.isAdmin();

    return this.allMenuSections
      .map(section => ({
        ...section,
        items: section.items.filter(item =>
          !item.requiresAdmin || isAdmin
        )
      }))
      .filter(section => section.items.length > 0); // Remove seções vazias
  }

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.detectActiveRoute();
  }

  /**
   * Carrega informações do usuário logado
   */
  private loadUserInfo(): void {
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      this.username = this.extractFirstName(currentUser.nome);
      this.userRole = this.defineUserRole(currentUser);
    } else {
      this.username = 'Admin';
      this.userRole = 'Administrador';
    }
  }

  /**
   * Extrai primeiro nome e último sobrenome
   */
  private extractFirstName(fullName: string): string {
    if (!fullName || typeof fullName !== 'string') {
      return 'Admin';
    }

    const nameParts = fullName.split(' ');

    if (nameParts.length === 1) {
      return nameParts[0];
    }

    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      return `${firstName} ${lastName}`;
    }

    return fullName;
  }

  /**
   * Define o cargo do usuário
   */
  private defineUserRole(user: any): string {
    if (user.email && user.email.includes('admin')) {
      return 'Administrador';
    }

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

    return 'Usuário';
  }

  /**
   * Detecta rota ativa e marca item correspondente
   */
  private detectActiveRoute(): void {
    const url = this.router.url;

    for (const section of this.menuPrincipal) {
      for (const item of section.items) {
        if (url.includes(item.route)) {
          this.itemSelecionado = item.label;
          return;
        }
      }
    }
  }

  /**
   * Seleciona item do menu
   */
  selecionarItem(label: string): void {
    this.itemSelecionado = label;
  }

  /**
   * Alterna estado da sidebar (expandida/colapsada)
   */
  alternarSidebar(): void {
    this.expandida = !this.expandida;
    this.expandidaChange.emit(this.expandida);
  }

  /**
   * Verifica se item está ativo
   */
  isItemAtivo(label: string): boolean {
    return this.itemSelecionado === label;
  }

  /**
   * Logout com confirmação
   */
  logout(): void {
    Swal.fire({
      title: 'Deseja sair?',
      text: 'Você será desconectado do sistema',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#565add',
      cancelButtonColor: '#3b394e'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}
