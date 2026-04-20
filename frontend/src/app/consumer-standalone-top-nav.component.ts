import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NexusLogoComponent } from './nexus-logo.component';
import { ConsumerNavPillsComponent } from './consumer-nav-pills.component';
import { CONSUMER_NAV } from './consumer-nav.paths';

/**
 * Full top bar for standalone consumer flows (/cart): logo + shared pills + right slot.
 */
@Component({
  selector: 'app-consumer-standalone-top-nav',
  standalone: true,
  imports: [RouterModule, NexusLogoComponent, ConsumerNavPillsComponent],
  template: `
    <div class="nx-navbar">
      <a class="nx-logo" [routerLink]="nav.shop" aria-label="Nexus shop home">
        <app-nexus-logo size="sm" wordmark="Nexus"></app-nexus-logo>
      </a>
      <app-consumer-nav-pills />
      <div class="nx-nav-r">
        <ng-content />
      </div>
    </div>
  `,
})
export class ConsumerStandaloneTopNavComponent {
  readonly nav = CONSUMER_NAV;
}
