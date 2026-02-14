import { Injectable, signal } from '@angular/core';
import { UserLoginResponse } from '../models/user-login-response.model';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  // Signal for login state
  private isLoggedInSignal = signal<boolean>(false);

  // Signal to store userId
  private userIdSignal = signal<string | null>(null);

  // Signal to store userRole
  private rolesSignal = signal<string[]>([]);

  // Signal to store token
  private tokenSignal = signal<string | null>(null);

  constructor() {
    // Initialize with data from localStorage (if it exists)
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const roles = localStorage.getItem('roles');

    this.isLoggedInSignal.set(!!token);
    this.userIdSignal.set(userId);
    this.rolesSignal.set(roles ? JSON.parse(roles) : []);
    this.tokenSignal.set(token);
  }

  login(response: UserLoginResponse) {
    if (!response.token || !response.userId || !response.roles) {
      throw new Error('Login response incompleto.');
    }

    localStorage.setItem('token', response.token);
    localStorage.setItem('userId', response.userId);
    localStorage.setItem('roles', JSON.stringify(response.roles));

    this.tokenSignal.set(response.token);
    this.userIdSignal.set(response.userId);
    this.rolesSignal.set(response.roles);
    this.isLoggedInSignal.set(true);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('roles');

    this.tokenSignal.set(null);
    this.userIdSignal.set(null);
    this.rolesSignal.set([]);
    this.isLoggedInSignal.set(false);
  }

  isLoggedIn() {
    return this.isLoggedInSignal();
  }

  getUserId() {
    return this.userIdSignal();
  }

  getRoles() {
    return this.rolesSignal();
  }

  hasRole(role: string) {
    return this.rolesSignal().includes(role);
  }

  getToken() {
    return this.tokenSignal();
  }

  /** Reset signals without clean localStorage */
  reset() {
    this.tokenSignal.set(null);
    this.userIdSignal.set(null);
    this.rolesSignal.set([]);
    this.isLoggedInSignal.set(false);
  }
}
