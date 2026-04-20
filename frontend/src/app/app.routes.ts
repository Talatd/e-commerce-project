import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages').then(m => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./pages').then(m => m.LoginComponent) },
  { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./pages/reset-password.component').then(m => m.ResetPasswordComponent) },
  {
    path: 'terms',
    loadComponent: () => import('./pages/legal-placeholder.component').then(m => m.LegalPlaceholderComponent),
    data: { title: 'Terms of Service' },
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/legal-placeholder.component').then(m => m.LegalPlaceholderComponent),
    data: { title: 'Privacy Policy' },
  },
  { path: 'admin', loadComponent: () => import('./pages').then(m => m.AdminComponent), canActivate: [roleGuard(['ADMIN'])] },
  { path: 'manager', loadComponent: () => import('./pages').then(m => m.ManagerComponent), canActivate: [roleGuard(['ADMIN', 'MANAGER'])] },
  { path: 'consumer', loadComponent: () => import('./pages').then(m => m.ConsumerComponent), canActivate: [authGuard] },
  { path: 'settings', loadComponent: () => import('./pages').then(m => m.SettingsComponent), canActivate: [authGuard] },
  { path: 'cart', loadComponent: () => import('./shop-pages').then(m => m.CartComponent), canActivate: [authGuard] },
  { path: 'product/:id', loadComponent: () => import('./shop-pages').then(m => m.ProductDetailComponent), canActivate: [authGuard] },
  { path: 'orders', loadComponent: () => import('./shop-pages').then(m => m.OrdersComponent), canActivate: [authGuard] },
  { path: '404', loadComponent: () => import('./pages/not-found.component').then(m => m.NotFoundComponent) },
  { path: '**', redirectTo: '/404', pathMatch: 'full' }
];
