import { Routes } from '@angular/router';
import { LoginComponent, AdminComponent, ManagerComponent, ConsumerComponent } from './pages';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'manager', component: ManagerComponent },
  { path: 'consumer', component: ConsumerComponent }
];
