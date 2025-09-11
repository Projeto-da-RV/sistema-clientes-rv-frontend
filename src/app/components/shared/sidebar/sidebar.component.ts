import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Home, Users, Tag, Settings, Briefcase, FileText, MapPin, Package, User, LogOut, Menu, X, ChevronDown, ChevronRight } from 'lucide-angular';
import { SidebarService } from '../../../services/sidebar.service';
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
  cadastrosOpen: boolean = false;
  gestaoOpen: boolean = false;

  constructor(
    private router: Router,
    public sidebarService: SidebarService
  ) {}

  ngOnInit() {
    this.username = localStorage.getItem('user') || 'Usuário';
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
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      }
    });
  }
}