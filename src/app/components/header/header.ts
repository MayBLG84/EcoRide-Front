import { CommonModule } from '@angular/common';
import { Component, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule, RouterLinkActive, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  standalone: true,
})
export class Header {
  menuOpen = signal(false);

  constructor(
    public authService: Auth,
    private router: Router,
  ) {}

  @HostListener('window:resize')
  onResize() {
    this.closeMenuIfDesktop();
  }

  private closeMenuIfDesktop(): void {
    const breakpoint = 992;

    if (window.innerWidth > breakpoint && this.menuOpen()) {
      this.menuOpen.set(false);
    }
  }

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/']);
  }

  // Helpers
  isDriverOrPassenger() {
    const r = this.authService.getRoles();
    return r.includes('ROLE_DRIVER') || r.includes('ROLE_PASSENGER');
  }

  isAdmin() {
    return this.authService.getRoles().includes('ROLE_ADMIN');
  }

  isEmployee() {
    return this.authService.getRoles().includes('ROLE_EMPLOYEE');
  }
}
