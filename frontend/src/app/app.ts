import { AfterViewInit, Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, ProductService, ToastService } from './services';
import { NexusLogoComponent } from './nexus-logo.component';
import { ThemeService } from './theme.service';
import { CONSUMER_NAV, isFullpageStandalonePath } from './consumer-nav.paths';
import { ConsumerNavPillsComponent } from './consumer-nav-pills.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, NexusLogoComponent, ConsumerNavPillsComponent],
  templateUrl: './app.html'
})
export class AppComponent implements OnInit, AfterViewInit {
  readonly consumerNav = CONSUMER_NAV;
  auth = inject(AuthService);
  router = inject(Router);
  toastService = inject(ToastService);
  productService = inject(ProductService);
  theme = inject(ThemeService);
  private allProducts: any[] = [];
  activeToasts: any[] = [];

  initialsFor(user: any): string {
    const name = String(user?.fullName ?? user?.name ?? '').trim();
    if (name) {
      return name
        .split(/\s+/)
        .filter(Boolean)
        .map(p => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    const email = String(user?.email ?? '').trim();
    if (email) return email.slice(0, 2).toUpperCase();
    return 'ME';
  }

  displayNameFor(user: any): string {
    const n = String(user?.fullName ?? '').trim();
    if (n) return n;
    const e = String(user?.email ?? '').trim();
    if (e) return e;
    return 'Account';
  }

  /** True when the main shell (glow navbar + optional sidebar) should wrap the outlet. */
  get usesMainAppShell(): boolean {
    return !isFullpageStandalonePath(this.router.url);
  }

  get shouldShowGlobalSidebar(): boolean {
    const path = this.router.url.split('?')[0];
    if (path === '/' || path === '/login') return false;
    const hidden = [
      '/login',
      '/admin',
      '/manager',
      CONSUMER_NAV.shop,
      CONSUMER_NAV.settings,
      CONSUMER_NAV.orders,
      CONSUMER_NAV.cart,
      '/product',
    ];
    return !hidden.some(r => path.startsWith(r));
  }

  /** Navbar logo target — role-aware home. */
  logoLinkFor(role: string | undefined): string {
    if (role === 'ADMIN') return '/admin';
    if (role === 'MANAGER') return '/manager';
    if (role === 'CONSUMER') return CONSUMER_NAV.shop;
    return '/';
  }

  logoQueryParamsFor(role: string | undefined): Record<string, string> | undefined {
    if (role === 'CONSUMER') return { tab: 'shop' };
    return undefined;
  }

  ngOnInit() {
    this.theme.initFromStorage();

    // Redirect if already logged in and on login page
    this.auth.currentUser$.subscribe(u => {
      if (u && this.router.url === '/login') {
        if (u.role === 'ADMIN') this.router.navigate(['/admin']);
        else if (u.role === 'MANAGER') this.router.navigate(['/manager']);
        else this.router.navigate([CONSUMER_NAV.shop]);
      }
    });

    this.toastService.toasts$.subscribe(t => {
      const id = Date.now();
      this.activeToasts.push({ ...t, id });
      setTimeout(() => {
        this.activeToasts = this.activeToasts.filter(x => x.id !== id);
      }, 5000);
    });
  }

  ngAfterViewInit(): void {
    this.initCustomCursor();
  }

  /**
   * Custom cursor: runs after the root template (including #cursor / #cursor-ring) is in the DOM.
   * Guarded with try/catch so a single bad target node cannot break all pointer input.
   */
  private initCustomCursor(): void {
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    let mx = 0, my = 0;
    let rx = 0, ry = 0;

    const onMove = (e: MouseEvent) => {
      try {
        mx = e.clientX;
        my = e.clientY;

        const raw = e.target;
        if (!(raw instanceof Element)) {
          cursor?.classList.remove('hover');
          ring?.classList.remove('hover');
          return;
        }
        const target = raw as HTMLElement;
        const isPointer = !!target.closest(
          'button, .mag-pill, .npill, .nx-npill, a.nx-npill, .nitem, .sitem-admin, .sitem, .tbtn, .gcard, .c-item, .prod-card, .fancy-link, .res-cat, .sitem-a'
        );
        const cs = getComputedStyle(target);
        const parentCs = target.parentElement ? getComputedStyle(target.parentElement) : null;
        const computedPointer = cs.cursor === 'pointer' || (!!parentCs && parentCs.cursor === 'pointer');

        if (isPointer || computedPointer) {
          cursor?.classList.add('hover');
          ring?.classList.add('hover');
        } else {
          cursor?.classList.remove('hover');
          ring?.classList.remove('hover');
        }

        const pill = target.closest('.mag-pill') as HTMLElement | null;
        if (pill) {
          const r = pill.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            const x = ((e.clientX - r.left) / r.width) * 100;
            const y = ((e.clientY - r.top) / r.height) * 100;
            pill.style.setProperty('--mx', x + '%');
            pill.style.setProperty('--my', y + '%');
          }
        }
      } catch {
        // Never let cursor styling take down the whole app.
      }
    };

    const onDown = (e: MouseEvent) => {
      try {
        cursor?.classList.add('click');
        ring?.classList.add('click');
        window.setTimeout(() => {
          cursor?.classList.remove('click');
          ring?.classList.remove('click');
        }, 200);

        const raw = e.target;
        if (!(raw instanceof Element)) return;
        const target = raw as HTMLElement;
        const btn = target.closest('.ripple-btn') as HTMLElement | null;
        if (btn) {
          const r = document.createElement('span');
          r.className = 'ripple';
          const rect = btn.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
          btn.appendChild(r);
          window.setTimeout(() => r.remove(), 600);
        }
      } catch {
        // ignore
      }
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mousedown', onDown);

    const loop = () => {
      try {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        if (cursor) {
          cursor.style.left = `${mx}px`;
          cursor.style.top = `${my}px`;
        }
        if (ring) {
          ring.style.left = `${rx}px`;
          ring.style.top = `${ry}px`;
        }
      } catch {
        // ignore
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Escape' && this.isSearchOpen) {
      this.closeSearch();
    }
  }

  toggleTheme() {
    this.theme.toggle();
  }

  isSearchOpen = false;
  isNotifOpen = false;
  unreadCount = 2;
  notifs = [
    {type: 'delivery', title: 'Package out for delivery', msg: 'Your order #ORD-7821 is with your local driver.', unread: true},
    {type: 'promo', title: 'Flash sale — 24h only', msg: 'Use code NEXUS20 for 20% off all Apple products.', unread: true},
    {type: 'order', title: 'Payment confirmed', msg: '$1,039.00 charged for MacBook Pro 14".', unread: false}
  ];
  searchQuery = '';
  searchResults: any[] = [];

  toggleNotif(e?: Event) {
    if(e) e.stopPropagation();
    this.isNotifOpen = !this.isNotifOpen;
    if(this.isNotifOpen) {
      document.addEventListener('click', this.closeNotifHandler);
    } else {
      document.removeEventListener('click', this.closeNotifHandler);
    }
  }

  closeNotifHandler = (e: Event) => {
    const target = e.target as HTMLElement;
    if(!target.closest('#notif-panel') && !target.closest('.bell-wrap')) {
      this.isNotifOpen = false;
      document.removeEventListener('click', this.closeNotifHandler);
    }
  };

  markAllRead() {
    this.notifs.forEach(n => n.unread = false);
    this.unreadCount = 0;
  }

  toggleSearch() {
    this.isSearchOpen = true;
    setTimeout(() => {
       const inp = document.getElementById('search-input') as HTMLInputElement;
       if(inp) inp.focus();
    }, 100);
  }

  closeSearch(e?: Event | null) {
    if(e) e.stopPropagation();
    this.isSearchOpen = false;
    this.searchQuery = '';
    this.searchResults = [];
    const inp = document.getElementById('search-input') as HTMLInputElement;
    if(inp) inp.value = '';
  }

  onSearchInput(e: any) {
    this.searchQuery = e.target?.value || '';
    if (this.searchQuery.trim().length > 0) {
      if (this.allProducts.length === 0) {
        this.productService.getProducts().subscribe(res => {
          this.allProducts = res;
          this.filterSearchResults();
        });
      } else {
        this.filterSearchResults();
      }
    } else {
      this.searchResults = [];
    }
  }

  private filterSearchResults() {
    const q = this.searchQuery.toLowerCase();
    this.searchResults = this.allProducts
      .filter(p => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q))
      .slice(0, 6);
  }
}
