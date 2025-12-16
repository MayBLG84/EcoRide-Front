import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  standalone: true,
})
export class Header {
  isLoggedIn = signal(false);
  userId = signal<string | null>(null);
  menuOpen = signal(false);

  constructor(private authService: Auth, private router: Router) {}

  ngOnInit() {
    this.isLoggedIn.set(this.authService.isLoggedIn());
    this.userId.set(this.authService.getUserId());
  }

  toggleAuth() {
    this.isLoggedIn.set(!this.isLoggedIn());
  }

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn.set(false);
    this.userId.set(null);
    this.closeMenu();
    this.router.navigate(['/']);
  }
}
