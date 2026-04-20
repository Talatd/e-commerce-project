import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CONSUMER_NAV } from './consumer-nav.paths';

/** Home · Shop · Cart · Orders · Settings — /consumer uses ?tab=home | ?tab=shop for dashboard vs catalog. */
@Component({
  selector: 'app-consumer-nav-pills',
  standalone: true,
  imports: [RouterModule],
  styles: [`:host { display: contents; }`],
  template: `
    <nav class="nx-nav-pills" aria-label="Store">
      <a class="nx-npill" [routerLink]="nav.shop" [queryParams]="shopTabQuery.home" routerLinkActive="active">Home</a>
      <a class="nx-npill" [routerLink]="nav.shop" [queryParams]="shopTabQuery.shop" routerLinkActive="active">Shop</a>
      <a class="nx-npill" [routerLink]="nav.cart" routerLinkActive="active">Cart</a>
      <a class="nx-npill" [routerLink]="nav.orders" routerLinkActive="active">Orders</a>
      <a class="nx-npill" [routerLink]="nav.settings" routerLinkActive="active">Settings</a>
    </nav>
  `,
})
export class ConsumerNavPillsComponent {
  readonly nav = CONSUMER_NAV;
  readonly shopTabQuery = { home: { tab: 'home' }, shop: { tab: 'shop' } } as const;
}
