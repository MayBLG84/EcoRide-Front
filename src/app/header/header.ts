import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  standalone: true,
})
export class Header {
  isLoggedIn = signal(false); // Simulation, it's necessary to create AuthService
  menuOpen = signal(false);

  toggleAuth() {
    this.isLoggedIn.set(!this.isLoggedIn());
  }

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
}
