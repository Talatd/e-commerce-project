import { Component, Input, inject, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NexusLogoComponent } from './nexus-logo.component';
import { ConsumerNavPillsComponent } from './consumer-nav-pills.component';
import { CONSUMER_NAV } from './consumer-nav.paths';
import { AuthService } from './services';

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
        <div class="nx-user-wrap" #userWrap *ngIf="auth.currentUser$ | async as u">
          <button
            type="button"
            class="nx-user-trigger"
            [class.nx-user-trigger-open]="userMenuOpen"
            [attr.aria-expanded]="userMenuOpen"
            aria-haspopup="true"
            (click)="toggleUserMenu($event)"
          >
            <span class="nx-user-av">{{ (u.fullName || '?').substring(0, 2).toUpperCase() }}</span>
            <span class="nx-user-name">{{ u.fullName || 'User' }}</span>
            <span class="nx-user-caret" aria-hidden="true">▾</span>
          </button>
          <div
            class="nx-user-menu"
            *ngIf="userMenuOpen"
            role="menu"
            (click)="$event.stopPropagation()"
          >
            <a
              class="nx-user-menu-row nx-user-menu-link"
              role="menuitem"
              [routerLink]="nav.settings"
              (click)="closeUserMenu()"
            >
              <span class="nx-user-menu-ico" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </span>
              <span class="nx-user-menu-label">Settings</span>
            </a>
            <div class="nx-user-menu-sep" role="presentation"></div>
            <button type="button" class="nx-user-menu-row nx-user-menu-danger" role="menuitem" (click)="logout()">
              <span class="nx-user-menu-ico" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
              </span>
              <span class="nx-user-menu-label">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nx-user-wrap { position: relative; z-index: 1; isolation: isolate; }
    .nx-user-trigger {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 12px 5px 5px;
      border-radius: 22px;
      background: var(--glass);
      border: 1px solid var(--border2, var(--border));
      cursor: pointer;
      font: inherit;
      color: inherit;
      transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
    }
    .nx-user-trigger:hover { background: var(--glass2); }
    .nx-user-trigger.nx-user-trigger-open {
      border-color: rgba(62, 207, 178, 0.35);
      box-shadow: 0 0 0 1px rgba(62, 207, 178, 0.12);
    }
    .nx-user-av {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--teal-dim);
      border: 1px solid rgba(62, 207, 178, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 600;
      color: var(--teal);
      flex-shrink: 0;
    }
    .nx-user-name {
      font-size: 12px;
      font-weight: 500;
      color: var(--text);
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .nx-user-caret {
      font-size: 8px;
      color: var(--text3);
      flex-shrink: 0;
      transition: transform 0.2s ease;
      opacity: 0.85;
    }
    .nx-user-trigger-open .nx-user-caret { transform: rotate(-180deg); }
    .nx-user-menu {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      min-width: 196px;
      padding: 8px;
      border-radius: 14px;
      background: rgba(12, 14, 16, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.03) inset;
      z-index: 5000;
      animation: nxMenuIn 0.16s ease;
    }
    :host-context(.light-mode) .nx-user-menu {
      background: rgba(252, 250, 246, 0.96);
    }
    @keyframes nxMenuIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .nx-user-menu-row {
      display: flex;
      align-items: center;
      gap: 11px;
      width: 100%;
      padding: 10px 12px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--text);
      font-size: 12.5px;
      font-weight: 500;
      letter-spacing: 0.01em;
      cursor: pointer;
      text-align: left;
      text-decoration: none;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .nx-user-menu-link { color: var(--text); }
    .nx-user-menu-link:hover {
      background: var(--glass2);
      color: var(--teal2, var(--teal));
    }
    .nx-user-menu-link:hover .nx-user-menu-ico { color: var(--teal2, var(--teal)); }
    .nx-user-menu-ico {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      color: var(--text3);
      flex-shrink: 0;
      transition: color 0.15s ease;
    }
    .nx-user-menu-label { flex: 1; min-width: 0; }
    .nx-user-menu-sep {
      height: 1px;
      margin: 4px 6px;
      background: var(--border);
      opacity: 0.85;
    }
    .nx-user-menu-danger { color: var(--text2); }
    .nx-user-menu-danger:hover {
      background: rgba(224, 112, 112, 0.1);
      color: var(--red, #e07070);
    }
    .nx-user-menu-danger:hover .nx-user-menu-ico { color: var(--red, #e07070); }
  `],
})
export class ConsumerStandaloneTopNavComponent implements OnDestroy {
  readonly nav = CONSUMER_NAV;
  readonly auth = inject(AuthService);

  @ViewChild('userWrap') userWrap?: ElementRef<HTMLElement>;

  userMenuOpen = false;

  /** Built-in Shop · Cart · Orders · Settings, or projected &lt;nav nx-pills&gt; for custom active rules. */
  @Input() pills: 'default' | 'embed' = 'default';

  /** When set, logo stays on /consumer and runs this (e.g. return to home tab) instead of router-only navigation. */
  @Input() logoClickHandler?: () => void;

  /** Bubble phase only — capture was closing the menu before the trigger click, so toggle reopened it. */
  private readonly onDocClick = (e: MouseEvent) => {
    const t = e.target as Node | null;
    if (t && this.userWrap?.nativeElement.contains(t)) {
      return;
    }
    this.closeUserMenu();
  };

  handleLogoClick(e: Event) {
    if (!this.logoClickHandler) return;
    e.preventDefault();
    this.logoClickHandler();
  }

  toggleUserMenu(e: Event) {
    e.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      setTimeout(() => document.addEventListener('click', this.onDocClick));
    } else {
      document.removeEventListener('click', this.onDocClick);
    }
  }

  closeUserMenu() {
    this.userMenuOpen = false;
    document.removeEventListener('click', this.onDocClick);
  }

  logout() {
    this.closeUserMenu();
    this.auth.logout();
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onDocClick);
  }
}
