import { Routes } from '@angular/router';
import { LoginComponent, AdminComponent, ManagerComponent, ConsumerComponent, SettingsComponent, LandingComponent } from './pages';
import { CartComponent, ProductDetailComponent, OrdersComponent } from './shop-pages';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'manager', component: ManagerComponent },
  { path: 'consumer', component: ConsumerComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'orders', component: OrdersComponent }
];
