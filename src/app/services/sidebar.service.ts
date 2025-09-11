import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private collapsed = false;
  
  constructor() {
    this.initMobileResponsive();
    this.setupResizeListener();
  }
  
  private initMobileResponsive() {
    // Start collapsed on mobile devices
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.collapsed = true;
    }
  }
  
  private setupResizeListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        // Auto-collapse on mobile
        if (window.innerWidth <= 768) {
          this.collapsed = true;
        }
      });
    }
  }
  
  toggle() {
    this.collapsed = !this.collapsed;
  }
  
  isCollapsed() {
    return this.collapsed;
  }
  
  setCollapsed(collapsed: boolean) {
    this.collapsed = collapsed;
  }
  
  isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }
}