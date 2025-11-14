import { Routes } from '@angular/router';

export const routes: Routes = [
  // Main pages
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    path: ':id/my-space',
    loadComponent: () => import('./pages/my-space/my-space').then((m) => m.MySpace),
  },
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
