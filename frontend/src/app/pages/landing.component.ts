import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, ProductService } from '../services';
import { NexusLogoComponent } from '../nexus-logo.component';
import { NexusThemeToggleComponent } from '../nexus-theme-toggle.component';
import { CONSUMER_NAV } from '../consumer-nav.paths';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, NexusLogoComponent, NexusThemeToggleComponent],
  template: `
<style>
:host { display: block; }
.landing-page-full {
  background: #080808;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #E6F0EE;
  min-height: 100vh;
  --teal: #3ECFB2;
  --teal2: #6EDEC8;
  --teal-dim: rgba(62,207,178,0.1);
  --teal-glow: rgba(62,207,178,0.18);
  --text-dim: #6A8A84;
  --text-deep: #344844;
  --border: rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.12);
  --glass: rgba(255,255,255,0.04);
}
:host-context(html.light-mode) .landing-page-full {
  background:#F5F2ED;color:#1A1916;
  --text-dim:#8A8070;--text-deep:#A09888;
  --border:rgba(0,0,0,0.08);--border2:rgba(0,0,0,0.15);
  --glass:rgba(0,0,0,0.04);
  --teal:#2BA898;--teal2:#1EA393;--teal-dim:rgba(43,168,152,0.15);--teal-glow:rgba(43,168,152,0.2);
}
:host-context(html.light-mode) .navbar-l{background:rgba(255,255,255,0.95);}
:host-context(html.light-mode) .hero-title-l,
:host-context(html.light-mode) .stat-val-l,
:host-context(html.light-mode) .section-title-l,
:host-context(html.light-mode) .feat-title-l,
:host-context(html.light-mode) .sc-name-l,
:host-context(html.light-mode) .sc-price-l,
:host-context(html.light-mode) .cta-title-l{color:#1A1916;}
:host-context(html.light-mode) .feat-card-l{background:#F0EDE6;}
:host-context(html.light-mode) .feat-card-l:hover{background:rgba(0,0,0,0.04);}

.navbar-l {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 32px;
  border-bottom: 1px solid var(--border);
  background: rgba(8,8,8,0.92);
  backdrop-filter: blur(20px);
  position: sticky; top: 0; z-index: 100;
}
.logo-l { font-family: 'Playfair Display', serif; font-style: italic; font-size: 20px; color: #E6F0EE; display: flex; align-items: center; gap: 8px; }
.logo-dot-l { width: 7px; height: 7px; border-radius: 50%; background: var(--teal); box-shadow: 0 0 8px var(--teal-glow); }
.nav-pills-l { display: flex; align-items: center; gap: 3px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 30px; padding: 4px; }
.npill-l { padding: 6px 16px; border-radius: 20px; font-size: 12px; color: var(--text-dim); cursor: pointer; transition: all 0.2s; text-decoration: none; }
.npill-l.active { background: var(--teal-dim); color: var(--teal2); border: 1px solid rgba(62,207,178,0.18); }
.nav-r-l { display: flex; align-items: center; gap: 8px; }
.nbtn-l { padding: 7px 18px; border-radius: 20px; font-size: 12px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; text-decoration: none; transition: all 0.2s; }
.nbtn-ghost-l { background: transparent; border: 1px solid var(--border2); color: var(--text-dim); }
.nbtn-teal-l { background: var(--teal-dim); border: 1px solid rgba(62,207,178,0.2); color: var(--teal2); }
.nbtn-ghost-l:hover { border-color: #E6F0EE; color: #E6F0EE; }
.nbtn-teal-l:hover { background: var(--teal); color: #080808; }

.hero-l {
  min-height: 560px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 80px 40px 60px;
  position: relative;
  overflow: hidden;
}
.hero-glow-1-l { position: absolute; top: -80px; left: 50%; transform: translateX(-50%); width: 600px; height: 400px; background: radial-gradient(ellipse, rgba(62,207,178,0.08) 0%, transparent 65%); pointer-events: none; }
.hero-glow-2-l { position: absolute; bottom: -100px; left: 20%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(62,207,178,0.05) 0%, transparent 65%); pointer-events: none; }

.hero-badge-l {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--teal-dim); border: 1px solid rgba(62,207,178,0.2);
  color: var(--teal2); font-size: 11px; padding: 5px 14px; border-radius: 20px;
  margin-bottom: 28px; letter-spacing: 0.04em;
}
.badge-dot-l { width: 5px; height: 5px; border-radius: 50%; background: var(--teal); animation: pulse-l 2s infinite; }
@keyframes pulse-l { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.hero-title-l {
  font-family: 'Playfair Display', serif;
  font-size: 58px; font-weight: 400;
  color: #E6F0EE; line-height: 1.1;
  letter-spacing: -0.02em; margin-bottom: 10px;
  max-width: 700px;
}
.hero-title-l em { font-style: italic; color: var(--teal2); }

.hero-sub-l {
  font-size: 15px; color: var(--text-dim);
  line-height: 1.7; max-width: 480px;
  margin: 16px auto 36px; font-weight: 300;
}

.hero-cta-l { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 60px; }
.btn-primary-l {
  padding: 12px 28px; border-radius: 24px;
  background: var(--teal); color: #080808;
  font-size: 13px; font-weight: 600; cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all 0.2s; border: none; text-decoration: none;
}
.btn-primary-l:hover { background: var(--teal2); transform: translateY(-2px); }
.btn-secondary-l {
  padding: 12px 28px; border-radius: 24px;
  background: transparent; color: var(--text-dim);
  font-size: 13px; cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  border: 1px solid var(--border2); transition: all 0.2s; text-decoration: none;
}
.btn-secondary-l:hover { color: #E6F0EE; border-color: rgba(255,255,255,0.2); }

.stats-section-l {
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  display: grid; grid-template-columns: repeat(4, 1fr);
}
.stat-item-l { padding: 28px 0; text-align: center; border-right: 1px solid var(--border); }
.stat-item-l:last-child { border-right: none; }
.stat-val-l { font-family: 'Playfair Display', serif; font-size: 32px; color: #E6F0EE; line-height: 1; margin-bottom: 6px; }
.stat-val-l em { font-style: italic; color: var(--teal2); }
.stat-label-l { font-size: 11px; color: var(--text-deep); letter-spacing: 0.08em; text-transform: uppercase; }

.features-section-l { padding: 64px 40px; }
.section-eyebrow-l { font-size: 9.5px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--teal); margin-bottom: 12px; text-align: center; }
.section-title-l { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 400; font-style: italic; color: #E6F0EE; text-align: center; margin-bottom: 48px; line-height: 1.2; max-width: 500px; margin-left: auto; margin-right: auto; }

.features-grid-l { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); }
.feat-card-l { background: #080808; padding: 32px 28px; transition: background 0.2s; }
.feat-card-l:hover { background: rgba(255,255,255,0.02); }
.feat-icon-l { width: 40px; height: 40px; border-radius: 10px; background: var(--teal-dim); border: 1px solid rgba(62,207,178,0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.feat-title-l { font-size: 15px; font-weight: 500; color: #E6F0EE; margin-bottom: 8px; }
.feat-desc-l { font-size: 12.5px; color: var(--text-dim); line-height: 1.7; font-weight: 300; }

.showcase-section-l { padding: 64px 40px; border-top: 1px solid var(--border); }
.showcase-row-l { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.showcase-card-l { background: var(--glass); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; backdrop-filter: blur(12px); transition: border-color 0.2s, transform 0.2s; cursor: pointer; }
.showcase-card-l:hover { border-color: rgba(62,207,178,0.2); transform: translateY(-3px); }
.sc-img-l { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--border); font-size: 48px; position: relative; overflow: hidden; }
.sc-img-l::after { content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 3; border-radius: inherit; background: radial-gradient(ellipse 85% 85% at 50% 48%, rgba(0,0,0,0) 32%, rgba(0,0,0,0.18) 62%, rgba(0,0,0,0.45) 100%); }
:host-context(html.light-mode) .sc-img-l::after { background: radial-gradient(ellipse 85% 85% at 50% 48%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.15) 58%, rgba(0,0,0,0.35) 100%); }
.sc-glow-l { position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s; z-index: 2; pointer-events: none; }
.showcase-card-l:hover .sc-glow-l { opacity: 1; }
.sc-body-l { padding: 16px 18px; }
.sc-cat-l { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-deep); margin-bottom: 4px; }
.sc-bottom-l { display: flex; align-items: center; justify-content: space-between; }
.sc-price-l { font-family: 'Playfair Display', serif; font-size: 18px; color: #E6F0EE; }
.sc-btn-l { font-size: 11px; padding: 5px 14px; border-radius: 20px; background: var(--teal-dim); border: 1px solid rgba(62,207,178,0.2); color: var(--teal2); cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.18s; }
.showcase-card-l:hover .sc-btn-l { background: var(--teal); color: #080808; border-color: var(--teal); }
a.showcase-card-l { text-decoration: none; color: inherit; display: block; }
.sc-img-l img.sc-thumb-l { position: absolute; inset: 6px; width: calc(100% - 12px); height: calc(100% - 12px); object-fit: cover; object-position: center; border-radius: 14px; z-index: 1; display: block; }
.sc-img-l svg { position: relative; z-index: 4; }
.sc-name-l { font-size: 14px; font-weight: 500; color: #E6F0EE; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.35; min-height: 2.7em; }
.showcase-skel-l { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.showcase-skel-card { height: 300px; border-radius: 12px; background: var(--glass); border: 1px solid var(--border); animation: skel-pulse-l 1.2s ease-in-out infinite; }
@keyframes skel-pulse-l { 0%, 100% { opacity: 0.45; } 50% { opacity: 0.85; } }
.showcase-empty-l { text-align: center; padding: 28px 20px; color: var(--text-dim); font-size: 13px; border: 1px dashed var(--border); border-radius: 12px; max-width: 480px; margin: 0 auto; }
@media (max-width: 900px) {
  .showcase-row-l, .showcase-skel-l { grid-template-columns: 1fr !important; }
}

.cta-section-l { padding: 80px 40px; text-align: center; border-top: 1px solid var(--border); position: relative; overflow: hidden; }
.cta-glow-l { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 500px; height: 300px; background: radial-gradient(ellipse, rgba(62,207,178,0.07) 0%, transparent 65%); pointer-events: none; }
.cta-title-l { font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 400; color: #E6F0EE; line-height: 1.15; margin-bottom: 16px; position: relative; z-index: 1; }
.cta-title-l em { font-style: italic; color: var(--teal2); }
.cta-sub-l { font-size: 14px; color: var(--text-dim); margin-bottom: 36px; font-weight: 300; position: relative; z-index: 1; }
.cta-btns-l { display: flex; align-items: center; gap: 10px; justify-content: center; position: relative; z-index: 1; }

.footer-l { padding: 24px 40px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.footer-logo-l { font-family: 'Playfair Display', serif; font-style: italic; font-size: 16px; color: var(--text-dim); }
.footer-links-l { display: flex; gap: 20px; }
.footer-link-l { font-size: 11px; color: var(--text-deep); cursor: pointer; letter-spacing: 0.03em; }
.footer-link-l:hover { color: var(--text-dim); }
.footer-right-l { font-size: 11px; color: var(--text-deep); font-family: 'JetBrains Mono', monospace; }
</style>

<div class="landing-page-full">
  <!-- NAVBAR -->
  <div class="navbar-l">
    <div class="logo-l"><app-nexus-logo size="sm" wordmark="Nexus"></app-nexus-logo></div>
    <div class="nav-pills-l">
      <a class="npill-l active" routerLink="/">Home</a>
      <a class="npill-l" [routerLink]="consumerNav.shop">Shop</a>
      <a class="npill-l" href="#">About</a>
      <a class="npill-l" href="#">Contact</a>
    </div>
    <div class="nav-r-l">
      <app-nexus-theme-toggle></app-nexus-theme-toggle>
      <a class="nbtn-l nbtn-ghost-l" routerLink="/login">Login</a>
      <a class="nbtn-l nbtn-teal-l" routerLink="/login">Sign Up</a>
    </div>
  </div>

  <!-- HERO -->
  <div class="hero-l">
    <div class="hero-glow-1-l"></div>
    <div class="hero-glow-2-l"></div>

    <div class="hero-badge-l">
      <div class="badge-dot-l"></div>
      Premium Tech Commerce
    </div>

    <div class="hero-title-l">
      The future of<br><em>tech shopping</em><br>is here.
    </div>

    <div class="hero-sub-l">
      Discover curated premium technology products. Seamless experience, intelligent recommendations, effortless checkout.
    </div>

    <div class="hero-cta-l">
      <a class="btn-primary-l" [routerLink]="consumerNav.shop">Shop Now →</a>
      <a class="btn-secondary-l" href="#">Learn more</a>
    </div>
  </div>

  <!-- STATS -->
  <div class="stats-section-l">
    <div class="stat-item-l">
      <div class="stat-val-l">50<em>K+</em></div>
      <div class="stat-label-l">Products</div>
    </div>
    <div class="stat-item-l">
      <div class="stat-val-l">2<em>M+</em></div>
      <div class="stat-label-l">Happy Customers</div>
    </div>
    <div class="stat-item-l">
      <div class="stat-val-l">4.9<em>★</em></div>
      <div class="stat-label-l">Avg. Rating</div>
    </div>
    <div class="stat-item-l">
      <div class="stat-val-l">48<em>h</em></div>
      <div class="stat-label-l">Fast Delivery</div>
    </div>
  </div>

  <!-- FEATURES -->
  <div class="features-section-l">
    <div class="section-eyebrow-l">Why Nexus</div>
    <div class="section-title-l">Built for the<br><em>modern buyer</em></div>

    <div class="features-grid-l">
      <div class="feat-card-l">
        <div class="feat-icon-l">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke="#3ECFB2" stroke-width="1.3"/><path d="M6 9l2 2 4-4" stroke="#3ECFB2" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="feat-title-l">Curated Selection</div>
        <div class="feat-desc-l">Every product is hand-picked and verified by our team of tech experts before listing.</div>
      </div>
      <div class="feat-card-l">
        <div class="feat-icon-l">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 6v6l7 4 7-4V6L9 2Z" stroke="#3ECFB2" stroke-width="1.3" stroke-linejoin="round"/><path d="M9 2v10" stroke="#3ECFB2" stroke-width="1.3"/></svg>
        </div>
        <div class="feat-title-l">AI Recommendations</div>
        <div class="feat-desc-l">Our Text2SQL AI assistant helps you find exactly what you need in seconds.</div>
      </div>
      <div class="feat-card-l">
        <div class="feat-icon-l">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9h12M9 3v12" stroke="#3ECFB2" stroke-width="1.3" stroke-linecap="round"/><rect x="2" y="2" width="14" height="14" rx="4" stroke="#3ECFB2" stroke-width="1.3"/></svg>
        </div>
        <div class="feat-title-l">Seamless Checkout</div>
        <div class="feat-desc-l">Multiple payment options, one-click reorder, and real-time shipment tracking.</div>
      </div>
    </div>
  </div>

  <!-- PRODUCT SHOWCASE (API: trending = stok × rating skoru, ilk 3) -->
  <div class="showcase-section-l">
    <div class="section-eyebrow-l">Featured Products</div>
    <div class="section-title-l" style="margin-bottom:32px;">Trending <em>this week</em></div>

    <div class="showcase-skel-l" *ngIf="trendingLoading">
      <div class="showcase-skel-card" *ngFor="let _ of skelSlots"></div>
    </div>

    <div class="showcase-row-l" *ngIf="!trendingLoading && trendingProducts.length > 0">
      <a class="showcase-card-l" *ngFor="let p of trendingProducts" [routerLink]="['/product', p.productId]">
        <div class="sc-img-l" [style.background]="'linear-gradient(145deg, rgba(62,207,178,0.08) 0%, rgba(8,8,8,0.4) 100%)'">
          <div class="sc-glow-l" style="background:radial-gradient(circle,rgba(62,207,178,0.12),transparent 70%)"></div>
          <img *ngIf="p.imageUrl" class="sc-thumb-l" [src]="p.imageUrl" [alt]="p.name"/>
          <svg *ngIf="!p.imageUrl" width="56" height="56" viewBox="0 0 64 64" fill="none" style="position:relative;z-index:1;opacity:0.55;"><rect x="8" y="16" width="48" height="32" rx="4" stroke="#3ECFB2" stroke-width="1.5"/><rect x="12" y="20" width="40" height="24" rx="2" fill="rgba(62,207,178,0.06)"/></svg>
        </div>
        <div class="sc-body-l">
          <div class="sc-cat-l">{{ p.category || 'Product' }}</div>
          <div class="sc-name-l">{{ p.name }}</div>
          <div class="sc-bottom-l">
            <div class="sc-price-l">{{ p.basePrice | currency }}</div>
            <span class="sc-btn-l">View</span>
          </div>
        </div>
      </a>
    </div>

    <div class="showcase-empty-l" *ngIf="!trendingLoading && trendingProducts.length === 0">
      No products loaded. Start the API and refresh, or
      <a [routerLink]="consumerNav.shop" style="color:var(--teal2);text-decoration:underline;">open the shop</a> (sign in may be required).
    </div>
  </div>

  <!-- CTA -->
  <div class="cta-section-l">
    <div class="cta-glow-l"></div>
    <div class="cta-title-l">Ready to <em>explore</em><br>the collection?</div>
    <div class="cta-sub-l">Join 2 million+ customers who trust Nexus for their tech needs.</div>
    <div class="cta-btns-l">
      <a class="btn-primary-l" [routerLink]="consumerNav.shop">Browse all products →</a>
      <a class="btn-secondary-l" routerLink="/login">Sign Up Now</a>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer-l">
    <div class="footer-logo-l" style="display:flex;align-items:center;"><app-nexus-logo size="sm" wordmark="Nexus"></app-nexus-logo></div>
    <div class="footer-links-l">
      <div class="footer-link-l">About</div>
      <div class="footer-link-l">Privacy</div>
      <div class="footer-link-l">Terms</div>
      <div class="footer-link-l">Contact</div>
    </div>
    <div class="footer-right-l">© 2025 Nexus</div>
  </div>

</div>
  `,
})
export class LandingComponent implements OnInit {
  readonly consumerNav = CONSUMER_NAV;
  auth = inject(AuthService);
  private productService = inject(ProductService);
  trendingProducts: any[] = [];
  trendingLoading = true;
  /** Sabit 3 skeleton slotu */
  readonly skelSlots = [1, 2, 3];

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (list) => {
        this.trendingProducts = this.pickTrending(list || []);
        this.trendingLoading = false;
      },
      error: () => {
        this.trendingProducts = [];
        this.trendingLoading = false;
      },
    });
  }

  /** Stok + (varsa) rating ile sıralayıp en üstteki 3 ürün — API’deki gerçek veri */
  private pickTrending(products: any[]): any[] {
    if (!products.length) return [];
    const score = (p: any) => {
      const stock = Math.max(0, Number(p.stockQuantity) || 0);
      const rating = Number(p.rating);
      const r = Number.isFinite(rating) && rating > 0 ? rating : 4.3;
      return stock * r;
    };
    return [...products]
      .sort((a, b) => {
        const d = score(b) - score(a);
        if (d !== 0) return d;
        return (Number(b.productId) || 0) - (Number(a.productId) || 0);
      })
      .slice(0, 3);
  }

  get dashboardLink() {
    const role = this.auth.currentUserValue?.role;
    if (role === 'ADMIN') return '/admin';
    if (role === 'MANAGER') return '/manager';
    return CONSUMER_NAV.shop;
  }
}


