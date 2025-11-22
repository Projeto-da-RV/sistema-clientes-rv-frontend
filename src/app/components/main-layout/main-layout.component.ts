import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  sidebarExpandida: boolean = true;

  constructor() {
    this.initMobileResponsive();
  }

  /**
   * Inicializa sidebar colapsada em dispositivos móveis
   */
  private initMobileResponsive(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.sidebarExpandida = false;
    }
  }

  /**
   * Callback quando sidebar muda de estado
   */
  onSidebarToggle(expandida: boolean): void {
    this.sidebarExpandida = expandida;
  }
}