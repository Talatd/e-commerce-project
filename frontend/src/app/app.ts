import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, ProductService, ToastService } from './services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html'
})
export class AppComponent implements OnInit {
  auth = inject(AuthService);
  router = inject(Router);
  toastService = inject(ToastService);
  productService = inject(ProductService);
  private allProducts: any[] = [];
  isLightMode = false;
  activeToasts: any[] = [];

  get shouldShowGlobalSidebar(): boolean {
    const hiddenRoutes = ['/login', '/admin', '/manager', '/consumer', '/settings'];
    if (this.router.url === '/' || this.router.url === '/login') return false;
    return !hiddenRoutes.some(r => this.router.url.startsWith(r));
  }

  ngOnInit() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      this.isLightMode = true;
      document.documentElement.classList.add('light-mode');
    }

    // Redirect if already logged in and on login page
    this.auth.currentUser$.subscribe(u => {
      if (u && this.router.url === '/login') {
        if (u.role === 'ADMIN') this.router.navigate(['/admin']);
        else if (u.role === 'MANAGER') this.router.navigate(['/manager']);
        else this.router.navigate(['/consumer']);
      }
    });

    // Cursor Logic
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    let mx = 0, my = 0;
    let rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      
      const target = e.target as HTMLElement;
      const isPointer = target.closest('button, .mag-pill, .npill, .nitem, .sitem-admin, .sitem, .tbtn, .gcard, .c-item, .prod-card, .fancy-link');
      const computedPointer = getComputedStyle(target).cursor === 'pointer' || (target.parentElement && getComputedStyle(target.parentElement).cursor === 'pointer');
      
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
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        pill.style.setProperty('--mx', x + '%');
        pill.style.setProperty('--my', y + '%');
      }
    });
    
    document.addEventListener('mousedown', e => {
       cursor?.classList.add('click');
       ring?.classList.add('click');
       setTimeout(() => {
         cursor?.classList.remove('click');
         ring?.classList.remove('click');
       }, 200);

       const target = e.target as HTMLElement;
       const btn = target.closest('.ripple-btn') as HTMLElement;
       if (btn) {
         const r = document.createElement('span');
         r.className = 'ripple';
         const rect = btn.getBoundingClientRect();
         const size = Math.max(rect.width, rect.height);
         r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
         btn.appendChild(r);
         setTimeout(() => r.remove(), 600);
       }
    });

    const loop = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if(cursor) { cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }
      if(ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
      requestAnimationFrame(loop);
    };
    loop();

    this.toastService.toasts$.subscribe(t => {
      const id = Date.now();
      this.activeToasts.push({ ...t, id });
      setTimeout(() => {
        this.activeToasts = this.activeToasts.filter(x => x.id !== id);
      }, 5000);
    });
  }

  toggleTheme() {
    this.isLightMode = !this.isLightMode;
    if (this.isLightMode) {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
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
