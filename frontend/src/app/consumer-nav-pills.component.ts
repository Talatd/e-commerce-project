import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CONSUMER_NAV } from './consumer-nav.paths';

/** Shop · Cart · Orders · Settings — same routes as app shell mag-pills. */
@Component({
  selector: 'app-consumer-nav-pills',
  standalone: true,
  imports: [RouterModule],
  styles: [`:host { display: contents; }`],
  template: `
    <nav class="nx-nav-pills" aria-label="Store">
      <a
        class="nx-npill"
        [routerLink]="nav.shop"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
        >Shop</a
      >
      <a class="nx-npill" [routerLink]="nav.cart" routerLinkActive="active">Cart</a>
      <a class="nx-npill" [routerLink]="nav.orders" routerLinkActive="active">Orders</a>
      <a class="nx-npill" [routerLink]="nav.settings" routerLinkActive="active">Settings</a>
    </nav>
  `,
})
export class ConsumerNavPillsComponent {
  readonly nav = CONSUMER_NAV;
}
