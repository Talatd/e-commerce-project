import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NexusLogoComponent } from './nexus-logo.component';
import { ConsumerNavPillsComponent } from './consumer-nav-pills.component';
import { CONSUMER_NAV } from './consumer-nav.paths';

/**
 * Full top bar for standalone consumer flows (/consumer, /cart, /orders): logo + shared pills + right slot.
 * Use pills="embed" plus a nav with nx-pills when the host must control Shop tab vs home (e.g. consumer dashboard).
 */
@Component({
  selector: 'app-consumer-standalone-top-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, NexusLogoComponent, ConsumerNavPillsComponent],
  template: `
    <div class="nx-navbar">
      <a *ngIf="!logoClickHandler" class="nx-logo" [routerLink]="nav.shop" aria-label="Nexus shop home">
        <app-nexus-logo size="sm" wordmark="Nexus"></app-nexus-logo>
      </a>
      <a
        *ngIf="logoClickHandler"
        class="nx-logo"
        href="/consumer"
        (click)="handleLogoClick($event)"
        aria-label="Nexus shop home"
      >
        <app-nexus-logo size="sm" wordmark="Nexus"></app-nexus-logo>
      </a>
      <app-consumer-nav-pills *ngIf="pills === 'default'" />
      <ng-content *ngIf="pills === 'embed'" select="[nx-pills]"></ng-content>
      <div class="nx-nav-r">
        <ng-content />
      </div>
    </div>
  `,
})
export class ConsumerStandaloneTopNavComponent {
  readonly nav = CONSUMER_NAV;

  /** Built-in Shop · Cart · Orders · Settings, or projected &lt;nav nx-pills&gt; for custom active rules. */
  @Input() pills: 'default' | 'embed' = 'default';

  /** When set, logo stays on /consumer and runs this (e.g. return to home tab) instead of router-only navigation. */
  @Input() logoClickHandler?: () => void;

  handleLogoClick(e: Event) {
    if (!this.logoClickHandler) return;
    e.preventDefault();
    this.logoClickHandler();
  }
}
