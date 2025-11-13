import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  // Signal for login state
  isLoggedInSignal = signal<boolean>(false);

  // Signal to store userId
  userIdSignal = signal<string | null>(null);

  constructor() {
    // Initialize with data from localStorage (if it exists)
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    this.isLoggedInSignal.set(!!token);
    this.userIdSignal.set(userId);
  }

  login(userId: string, token: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);

    this.isLoggedInSignal.set(true);
    this.userIdSignal.set(userId);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');

    this.isLoggedInSignal.set(false);
    this.userIdSignal.set(null);
  }

  getUserId(): string | null {
    return this.userIdSignal();
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSignal();
  }
}
