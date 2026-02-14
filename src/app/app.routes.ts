import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  // Main pages (public)
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup').then((m) => m.Signup) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  {
    path: 'legal-mentions',
    loadComponent: () =>
      import('./pages/legal-mentions/legal-mentions').then((m) => m.LegalMentions),
  },
  {
    path: 'results',
    loadComponent: () => import('./pages/results/results').then((m) => m.Results),
  },

  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },

  // My-space → driver/passenger
  {
    path: ':id/my-space',
    loadComponent: () => import('./pages/my-space/my-space').then((m) => m.MySpace),
    canActivate: [authGuard],
    data: { roles: ['ROLE_DRIVER', 'ROLE_PASSENGER'] },
  },

  // Admin routes
  {
    path: ':id/dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
    data: { roles: ['ROLE_ADMIN'] },
  },
  {
    path: ':id/users',
    loadComponent: () => import('./pages/users/users').then((m) => m.Users),
    canActivate: [authGuard],
    data: { roles: ['ROLE_ADMIN'] },
  },

  // Employee routes
  {
    path: ':id/evaluations',
    loadComponent: () => import('./pages/evaluations/evaluations').then((m) => m.Evaluations),
    canActivate: [authGuard],
    data: { roles: ['ROLE_EMPLOYEE'] },
  },
  {
    path: ':id/contact-by-user',
    loadComponent: () =>
      import('./pages/contact-by-user/contact-by-user').then((m) => m.ContactByUser),
    canActivate: [authGuard],
    data: { roles: ['ROLE_EMPLOYEE'] },
  },

  // Error routes
  {
    path: 'server-error',
    loadComponent: () =>
      import('./pages/errors/server-error/server-error').then((m) => m.ServerError),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./pages/errors/unauthorized/unauthorized').then((m) => m.Unauthorized),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/errors/not-found/not-found').then((m) => m.NotFound),
  }, // fallback 404
];
